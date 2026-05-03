import type { ShipDesign, ValidationResult, ValidationError } from '../types';
import { calculateFuelProfile } from '../utils/shipOperations';

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Extract drive rating letter from standard ('B') or small craft ('sB') codes */
function driveRatingIndex(driveCode: string): number {
  const clean = driveCode.toUpperCase().replace(/^S/, '');
  return LETTERS.indexOf(clean);
}

export function validateShip(design: ShipDesign): ValidationResult {
  const hardErrors: ValidationError[] = [];
  const softWarnings: ValidationError[] = [];

  // ─── Hard Constraints ───

  // 1. Tonnage used ≤ Hull Dtons
  // NOTE: Modules and weapons are stored outside components array (they are
  // fittings/contents, not structural hull items), but they still consume space.
  const componentTons = design.components.reduce((s, c) => s + c.dtons, 0);
  const moduleTons = (design.modules || []).reduce((s, m) => s + (m.dtons || 0), 0);
  const weaponTons = (design.weapons || []).reduce((s, w) => s + (w.dtons || 0), 0);
  const mountTons = (design.weaponMounts || []).reduce((s, w) => s + ((w.dtons || 0) * (w.qty || 1)), 0);
  const usedTons = componentTons + moduleTons + weaponTons + mountTons;
  if (usedTons > design.hullDtons) {
    hardErrors.push({
      code: 'TONNAGE_OVERFLOW',
      message: `Tonnage used (${usedTons.toFixed(1)} DT) exceeds hull capacity (${design.hullDtons} DT)`,
      section: 'Cargo',
      severity: 'hard',
    });
  }

  // 2. Power Plant ≥ max(M-Drive, J-Drive) letter
  // Use drives[] array (authoritative) with fallback to legacy flat fields
  const thrustDrives = (design.drives || []).filter(d => d.type === 'thrust');
  const jumpDrives = (design.drives || []).filter(d => d.type === 'jump');
  const powerPlants = (design.drives || []).filter(d => d.type === 'powerPlant');

  const maxThrustIndex = thrustDrives.length > 0
    ? Math.max(...thrustDrives.map(d => driveRatingIndex(d.driveCode || '')).filter(i => i >= 0))
    : driveRatingIndex(design.mDrive || '');
  const maxJumpIndex = jumpDrives.length > 0
    ? Math.max(...jumpDrives.map(d => driveRatingIndex(d.driveCode || '')).filter(i => i >= 0))
    : driveRatingIndex(design.jDrive || '');
  const maxDriveIndex = Math.max(maxThrustIndex, maxJumpIndex);
  const minPP = maxDriveIndex >= 0 ? LETTERS[maxDriveIndex] : '';

  const maxPPIndex = powerPlants.length > 0
    ? Math.max(...powerPlants.map(d => driveRatingIndex(d.driveCode || '')).filter(i => i >= 0))
    : driveRatingIndex(design.powerPlant || '');

  if (minPP && (maxPPIndex < 0 || maxPPIndex < maxDriveIndex)) {
    hardErrors.push({
      code: 'POWER_PLANT_TOO_SMALL',
      message: `Power Plant ${powerPlants[0]?.driveCode || design.powerPlant || 'None'} is too small. Minimum required: ${minPP}`,
      section: 'Drives and Power',
      severity: 'hard',
    });
  }

  // 2b. Power Plant oversized — PP > max drive rating wastes tonnage/cost
  if (maxPPIndex >= 0 && maxPPIndex > maxDriveIndex) {
    const oversizedBy = LETTERS[maxPPIndex];
    const required = minPP || LETTERS[maxDriveIndex];
    softWarnings.push({
      code: 'POWER_PLANT_OVERSIZED',
      message: `Power Plant ${oversizedBy} is larger than required ${required}. Excess capacity wastes ${((maxPPIndex - maxDriveIndex) * 3).toFixed(0)} DT and ${((maxPPIndex - maxDriveIndex) * 8).toFixed(0)} MCr`,
      section: 'Drives and Power',
      severity: 'soft',
    });
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

  // Fuel checks
  const profile = calculateFuelProfile(design);
  const hasJumpDrive = profile.jumpRange > 0 && profile.jumpFuelPerJump > 0;

  if (profile.totalFuel > 0) {
    // Minimum fuel: ships with jump drives need jump fuel + 2 weeks power
    // Crafts (no jump drive) have no minimum
    if (hasJumpDrive) {
      const minFuel = profile.jumpFuelPerJump + profile.weeklyPowerFuel * 2;
      if (profile.totalFuel < minFuel - 0.01) {
        hardErrors.push({
          code: 'INSUFFICIENT_FUEL',
          message: `Fuel capacity (${profile.totalFuel.toFixed(1)} DT) is below minimum ${minFuel.toFixed(1)} DT (Jump-${profile.jumpRange} ${profile.jumpFuelPerJump.toFixed(1)} DT + ${(profile.weeklyPowerFuel * 2).toFixed(1)} DT for 2 weeks power). Operational: ${profile.notation}`,
          section: 'Drives and Power',
          severity: 'hard',
        });
      }
    }
    // Excessive fuel: more than 60% of hull is suspicious
    if (profile.totalFuel > design.hullDtons * 0.6) {
      softWarnings.push({
        code: 'EXCESSIVE_FUEL',
        message: `Fuel capacity (${profile.totalFuel.toFixed(1)} DT) is ${Math.round((profile.totalFuel / design.hullDtons) * 100)}% of hull — check if qty is double-counted. Operational: ${profile.notation}`,
        section: 'Drives and Power',
        severity: 'soft',
      });
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
