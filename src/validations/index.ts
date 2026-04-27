import type { ShipDesign, ValidationResult, ValidationError } from '../types';
import { getMinPowerPlantLetter } from '../calculations';

export function validateShip(design: ShipDesign): ValidationResult {
  const hardErrors: ValidationError[] = [];
  const softWarnings: ValidationError[] = [];

  // ─── Hard Constraints ───

  // 1. Tonnage used ≤ Hull Dtons
  const usedTons = design.components.reduce((s, c) => s + c.dtons, 0);
  if (usedTons > design.hullDtons) {
    hardErrors.push({
      code: 'TONNAGE_OVERFLOW',
      message: `Tonnage used (${usedTons.toFixed(1)} DT) exceeds hull capacity (${design.hullDtons} DT)`,
      section: 'Cargo',
      severity: 'hard',
    });
  }

  // 2. Power Plant ≥ max(M-Drive, J-Drive) letter
  if (design.mDrive || design.jDrive) {
    const minPP = getMinPowerPlantLetter(design.mDrive || '', design.jDrive || '');
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const ppIndex = letters.indexOf((design.powerPlant || '').toUpperCase());
    const minIndex = letters.indexOf(minPP);
    if (minPP && (ppIndex < 0 || ppIndex < minIndex)) {
      hardErrors.push({
        code: 'POWER_PLANT_TOO_SMALL',
        message: `Power Plant ${design.powerPlant} is too small. Minimum required: ${minPP}`,
        section: 'Power Plant',
        severity: 'hard',
      });
    }
  }

  // 3. Hardpoints ≤ floor(Hull/100)
  const maxHardpoints = Math.floor(design.hullDtons / 100);
  const usedHardpoints = (design.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);
  if (usedHardpoints > maxHardpoints) {
    hardErrors.push({
      code: 'HARDPOINTS_EXCEEDED',
      message: `Weapons use ${usedHardpoints} hardpoints, but hull only supports ${maxHardpoints}`,
      section: 'Weapons',
      severity: 'hard',
    });
  }

  // 4. Bridge stations ≥ Required crew positions
  // Bridge stations estimated from bridge tons
  const bridgeTons = design.components.find(c => c.section === 'Bridge')?.dtons || 0;
  const bridgeStations = bridgeTons >= 60 ? 30 : bridgeTons >= 40 ? 20 : bridgeTons >= 20 ? 10 : bridgeTons >= 10 ? 5 : 1;
  const crewCount = design.crew.length;
  if (crewCount > bridgeStations) {
    hardErrors.push({
      code: 'CREW_EXCEEDS_BRIDGE',
      message: `Crew (${crewCount}) exceeds bridge stations (${bridgeStations})`,
      section: 'Crew',
      severity: 'hard',
    });
  }

  // 5. Tech Level ≥ Component requirements
  // Check TL of each component against ship TL
  for (const comp of design.components) {
    if (comp.tl && comp.tl > design.tl) {
      hardErrors.push({
        code: 'TL_TOO_LOW',
        message: `${comp.module} requires TL ${comp.tl}, but ship is TL ${design.tl}`,
        section: comp.section,
        severity: 'hard',
      });
    }
  }

  // ─── Soft Warnings ───

  // Fuel < 2 weeks operation
  const fuelComponent = design.components.find(c => c.section === 'Fuel');
  if (fuelComponent) {
    const ppComponent = design.components.find(c => c.section === 'Power Plant');
    if (ppComponent) {
      const minFuel = (ppComponent.dtons / 3) * 2;
      if (fuelComponent.dtons < minFuel) {
        softWarnings.push({
          code: 'LOW_FUEL',
          message: `Fuel capacity (${fuelComponent.dtons.toFixed(1)} DT) is below 2-week minimum (${minFuel.toFixed(1)} DT)`,
          section: 'Fuel',
          severity: 'soft',
        });
      }
    }
  }

  // Weapons without fire control
  if ((design.weapons || []).length > 0 && !(design.software || []).some(s => s.toLowerCase().includes('fire'))) {
    softWarnings.push({
      code: 'NO_FIRE_CONTROL',
      message: 'Weapons installed but no Fire Control software selected',
      section: 'Software',
      severity: 'soft',
    });
  }

  // Jump drive without navigation software
  if (design.jDrive && !(design.software || []).some(s => s.toLowerCase().includes('jump') || s.toLowerCase().includes('nav'))) {
    softWarnings.push({
      code: 'NO_JUMP_NAV',
      message: 'Jump drive installed but no Jump Control/Navigation software selected',
      section: 'Software',
      severity: 'soft',
    });
  }

  // Crew > life support capacity
  const staterooms = design.staterooms || 0;
  const stateroomCapacity = staterooms * 2; // 2 per stateroom
  const totalPeople = crewCount + staterooms; // rough estimate
  if (totalPeople > stateroomCapacity && staterooms > 0) {
    softWarnings.push({
      code: 'LIFE_SUPPORT_STRESSED',
      message: 'Crew and passengers may exceed life support capacity',
      section: 'Life Support',
      severity: 'soft',
    });
  }

  return {
    valid: hardErrors.length === 0,
    hardErrors,
    softWarnings,
  };
}
