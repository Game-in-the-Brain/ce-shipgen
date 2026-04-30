/**
 * Ship Validator — Section-by-Section Test Engine
 *
 * Validates a ShipDesign against expected computed values.
 * Returns a report showing PASS/FAIL per section with deltas.
 *
 * Usage:
 *   const report = validateShip(SAMPLE_FREE_TRADER_200, expectedValues);
 *   if (report.allPass) console.log('All sections correct');
 *   else console.log(report.failures);
 */

import type { ShipDesign } from '../types';
import {
  calcHullPoints,
  calcStructurePoints,
  calcHardpoints,
  calcJumpFuel,
  calcPowerFuel,
  calcStateroomTonnage,
  calcStateroomCost,
  calcLowBerthTonnage,
  calcLowBerthCost,
} from '../calculations';

// ─── Result Types ───

export interface SectionCheck {
  section: string;
  field: string;
  expected: number | string;
  actual: number | string;
  pass: boolean;
  delta?: number;
  unit?: string;
}

export interface ValidationReport {
  shipName: string;
  checks: SectionCheck[];
  passCount: number;
  failCount: number;
  allPass: boolean;
  failures: SectionCheck[];
}

// ─── Helpers ───

function roughlyEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

function fmt(n: number, digits = 2): string {
  return n.toFixed(digits);
}

// ─── Section Validators ───

export interface ExpectedValues {
  hullDtons?: number;
  hullCost?: number;
  hullPoints?: number;
  structurePoints?: number;
  hardpoints?: number;
  armorTons?: number;
  armorCost?: number;
  mDriveTons?: number;
  mDriveCost?: number;
  jDriveTons?: number;
  jDriveCost?: number;
  powerPlantTons?: number;
  powerPlantCost?: number;
  jumpFuel?: number;
  powerFuel?: number;
  totalFuel?: number;
  bridgeTons?: number;
  bridgeCost?: number;
  computerTons?: number;
  computerCost?: number;
  stateroomTons?: number;
  stateroomCost?: number;
  lowBerthTons?: number;
  lowBerthCost?: number;
  cargo?: number;
  totalTonsUsed?: number;
  totalCost?: number;
  availableDtons?: number;
}

/**
 * Validate a ship design against expected section values.
 * This does NOT require running the full ShipDesigner — it uses pure calc functions.
 */
export function validateShip(ship: ShipDesign, expected: ExpectedValues): ValidationReport {
  const checks: SectionCheck[] = [];

  function check(section: string, field: string, actual: number, expectedVal: number | undefined, unit = '', tolerance = 0.01) {
    if (expectedVal === undefined) return;
    const pass = roughlyEqual(actual, expectedVal, tolerance);
    checks.push({
      section,
      field,
      expected: expectedVal,
      actual: fmt(actual),
      pass,
      delta: pass ? undefined : actual - expectedVal,
      unit,
    });
  }

  // ── Hull & Foundation ──
  check('Hull', 'Dtons', ship.hullDtons, expected.hullDtons, 'DT');
  check('Hull', 'Cost', ship.totalCost, expected.hullCost, 'MCr'); // placeholder — real hull cost comes from table
  check('Hull', 'Hull Points', calcHullPoints(ship.hullDtons), expected.hullPoints);
  check('Hull', 'Structure Points', calcStructurePoints(ship.hullDtons), expected.structurePoints);
  check('Hull', 'Hardpoints', calcHardpoints(ship.hullDtons), expected.hardpoints);

  // ── Armor ──
  // Armor calc needs table data — we do a simplified check here
  // Full validation requires looking up armor type in ship_armor table
  if (ship.armorQty > 0 && expected.armorTons !== undefined) {
    check('Armor', 'Tonnage', ship.armorQty * 0.05 * ship.hullDtons, expected.armorTons, 'DT');
  }

  // ── Drives ──
  const drives = ship.drives || [];
  const mDrive = drives.find((d) => d.type === 'thrust');
  const jDrive = drives.find((d) => d.type === 'jump');
  const powerPlant = drives.find((d) => d.type === 'powerPlant');

  if (mDrive) {
    check('M-Drive', 'Tonnage', mDrive.dtons * mDrive.qty, expected.mDriveTons, 'DT');
    check('M-Drive', 'Cost', mDrive.cost * mDrive.qty, expected.mDriveCost, 'MCr');
  }
  if (jDrive) {
    check('J-Drive', 'Tonnage', jDrive.dtons * jDrive.qty, expected.jDriveTons, 'DT');
    check('J-Drive', 'Cost', jDrive.cost * jDrive.qty, expected.jDriveCost, 'MCr');
  }
  if (powerPlant) {
    check('Power Plant', 'Tonnage', powerPlant.dtons * powerPlant.qty, expected.powerPlantTons, 'DT');
    check('Power Plant', 'Cost', powerPlant.cost * powerPlant.qty, expected.powerPlantCost, 'MCr');
  }

  // ── Fuel ──
  if (jDrive && expected.jumpFuel !== undefined) {
    const jumpRange = jDrive.performance || 1;
    check('Fuel', 'Jump Fuel', calcJumpFuel(ship.hullDtons, jumpRange), expected.jumpFuel, 'DT');
  }
  if (powerPlant && expected.powerFuel !== undefined) {
    check('Fuel', 'Power Fuel', calcPowerFuel(powerPlant.dtons, 4), expected.powerFuel, 'DT');
  }

  // ── Bridge ──
  const bridge = ship.commandControl?.[0];
  if (bridge) {
    check('Bridge', 'Tonnage', bridge.dtons * bridge.qty, expected.bridgeTons, 'DT');
    check('Bridge', 'Cost', bridge.cost * bridge.qty, expected.bridgeCost, 'MCr');
  }

  // ── Computer ──
  const computer = ship.computers?.[0];
  if (computer) {
    check('Computer', 'Tonnage', computer.dtons * computer.qty, expected.computerTons, 'DT');
    check('Computer', 'Cost', computer.cost * computer.qty, expected.computerCost, 'MCr');
  }

  // ── Life Support ──
  check('Life Support', 'Stateroom Tons', calcStateroomTonnage(ship.staterooms || 0), expected.stateroomTons, 'DT');
  check('Life Support', 'Stateroom Cost', calcStateroomCost(ship.staterooms || 0) / 1e6, expected.stateroomCost, 'MCr');
  check('Life Support', 'Low Berth Tons', calcLowBerthTonnage(ship.lowBerths || 0), expected.lowBerthTons, 'DT');
  check('Life Support', 'Low Berth Cost', calcLowBerthCost(ship.lowBerths || 0) / 1e6, expected.lowBerthCost, 'MCr');

  // ── Cargo ──
  check('Cargo', 'Tonnage', ship.cargo, expected.cargo, 'DT');

  // ── Totals ──
  // Tonnage sanity check
  const componentsTonnage = [
    ship.armorQty * 0.05 * ship.hullDtons,
    mDrive ? mDrive.dtons * mDrive.qty : 0,
    jDrive ? jDrive.dtons * jDrive.qty : 0,
    powerPlant ? powerPlant.dtons * powerPlant.qty : 0,
    24, // fuel placeholder
    bridge ? bridge.dtons * bridge.qty : 0,
    computer ? computer.dtons * computer.qty : 0,
    calcStateroomTonnage(ship.staterooms || 0),
    calcLowBerthTonnage(ship.lowBerths || 0),
    ship.cargo || 0,
  ].reduce((a, b) => a + b, 0);

  check('Totals', 'Tonnage Used', componentsTonnage, expected.totalTonsUsed, 'DT', 5);
  check('Totals', 'Available Dtons', ship.hullDtons - componentsTonnage, expected.availableDtons, 'DT', 5);

  const passCount = checks.filter((c) => c.pass).length;
  const failCount = checks.filter((c) => !c.pass).length;

  return {
    shipName: ship.name,
    checks,
    passCount,
    failCount,
    allPass: failCount === 0,
    failures: checks.filter((c) => !c.pass),
  };
}

/**
 * Pretty-print a validation report to console.
 */
export function printReport(report: ValidationReport): void {
  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  SHIP VALIDATION: ${report.shipName}`);
  console.log(`═══════════════════════════════════════════════════════════════`);

  for (const check of report.checks) {
    const status = check.pass ? '✅ PASS' : '❌ FAIL';
    const delta = check.delta !== undefined ? ` (Δ ${check.delta > 0 ? '+' : ''}${fmt(check.delta)}${check.unit})` : '';
    console.log(`  ${status}  ${check.section} › ${check.field}: expected ${check.expected}${check.unit}, got ${check.actual}${check.unit}${delta}`);
  }

  console.log(`───────────────────────────────────────────────────────────────`);
  console.log(`  Result: ${report.passCount} passed, ${report.failCount} failed`);
  console.log(`═══════════════════════════════════════════════════════════════\n`);
}
