import { describe, it, expect } from 'vitest';
import { validateShip } from './shipValidator';
import { SAMPLE_FREE_TRADER_200, SAMPLE_SHUTTLE_100, SAMPLE_PATROL_CRUISER_400 } from './sampleShips';

/**
 * Sample Ship Validation Tests
 *
 * These tests load reference ships and verify that pure calculation
 * functions produce the expected values. If a test fails, RCA:
 *   1. Is the expected value in the test wrong? → Fix the test.
 *   2. Is the calculation function wrong? → Fix the calc.
 *   3. Is the sample ship data wrong? → Fix the sample.
 */

describe('Sample: 200-ton Free Trader', () => {
  const report = validateShip(SAMPLE_FREE_TRADER_200, {
    hullDtons: 200,
    hullPoints: 4,
    structurePoints: 4,
    hardpoints: 2,
    armorTons: 20, // 5% × 2 × 200
    mDriveTons: 2,
    mDriveCost: 4,
    jDriveTons: 10,
    jDriveCost: 10,
    powerPlantTons: 4,
    powerPlantCost: 8,
    jumpFuel: 20, // 0.1 × 200 × 1
    stateroomTons: 40, // 10 × 4
    stateroomCost: 5, // 10 × 0.5
    lowBerthTons: 10, // 20 × 0.5
    lowBerthCost: 1, // 20 × 0.05
    cargo: 86,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
    const sp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Structure Points');
    expect(sp?.pass).toBe(true);
  });

  it('should have correct armor tonnage', () => {
    const armor = report.checks.find((c) => c.section === 'Armor' && c.field === 'Tonnage');
    expect(armor?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const jd = report.checks.find((c) => c.section === 'J-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(jd?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should calculate jump fuel correctly', () => {
    const fuel = report.checks.find((c) => c.section === 'Fuel' && c.field === 'Jump Fuel');
    expect(fuel?.pass).toBe(true);
  });

  it('should have correct life support tonnage', () => {
    const sr = report.checks.find((c) => c.section === 'Life Support' && c.field === 'Stateroom Tons');
    const lb = report.checks.find((c) => c.section === 'Life Support' && c.field === 'Low Berth Tons');
    expect(sr?.pass).toBe(true);
    expect(lb?.pass).toBe(true);
  });
});

describe('Sample: 100-ton Shuttle', () => {
  const report = validateShip(SAMPLE_SHUTTLE_100, {
    hullDtons: 100,
    hullPoints: 2,
    structurePoints: 2,
    hardpoints: 1,
    cargo: 10,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });
});

describe('Sample: 400-ton Patrol Cruiser', () => {
  const report = validateShip(SAMPLE_PATROL_CRUISER_400, {
    hullDtons: 400,
    hullPoints: 8,
    structurePoints: 8,
    hardpoints: 4,
    cargo: 20,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });
});
