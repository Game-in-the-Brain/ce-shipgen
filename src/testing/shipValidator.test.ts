import { describe, it, expect } from 'vitest';
import { validateShip } from './shipValidator';
import { SAMPLE_FREE_TRADER_200, SAMPLE_SHUTTLE_100, SAMPLE_PATROL_CRUISER_400, SAMPLE_TL9_FIGHTER_10DT_2MAN_1BL_2M_10, SAMPLE_TL9_ESCORT_FIGHTER_10DT_2MAN_1BL_2SC_10, SAMPLE_TL9_FIGHTER_10DT_2MAN_3M_10, SAMPLE_TL9_BOAT_10DT_10, SAMPLE_TL9_MEDIUM_FIGHTER_20DT_2MAN_3M_20, SAMPLE_TL9_BOAT_20DT_20, SAMPLE_TL9_SHIP_S_BOAT_30DT_30, SAMPLE_TL9_SHIP_S_BOAT_50DT_50, SAMPLE_TL9_SHIP_S_BOAT_70DT_70, SAMPLE_VEHICLES_90DT_SHUTTLE_1_UNITS_90, SAMPLE_TL9_SHIP_S_BOAT_95DT_95, SAMPLE_TL_9_COURIER_SHIP_100DT_100, SAMPLE_TL_9_YACHT_100DT_100, SAMPLE_TL9_RESEARCH_VESSEL_200DT_200 } from './sampleShips';

/**
 * Sample Ship Validation Tests
 *
 * These tests load reference ships and verify that pure calculation
 * functions produce the expected values. If a test fails, RCA:
 *   1. Is the expected value in the test wrong? → Fix the test.
 *   2. Is the calculation function wrong? → Fix the calc.
 *   3. Is the sample ship data wrong? → Fix the sample.
 */

describe('Sample: 200-ton Free Trader (Excel row 293)', () => {
  const report = validateShip(SAMPLE_FREE_TRADER_200, {
    hullDtons: 200,
    hullPoints: 4,
    structurePoints: 4,
    hardpoints: 2,
    armorTons: 10, // Excel: qty=1, 5% of 200 = 10 DT (Titanium Steel gives Prot 2 per 5%)
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

describe('Sample: TL9 Fighter 10DT, 2man, 1BL, 2M (Excel row 1143)', () => {
  const report = validateShip(SAMPLE_TL9_FIGHTER_10DT_2MAN_1BL_2M_10, {
    hullDtons: 10,
    hullPoints: 0, // floor(10/50) = 0 — may need minimum 1 rule
    structurePoints: 1, // ceil(10/50) = 1
    hardpoints: 0, // floor(10/100) = 0
    armorTons: 0, // qty=0, 5% × 0 = 0
    mDriveTons: 1.5, // sC = 1.5 DT
    mDriveCost: 3, // 3.00 MCr
    powerPlantTons: 3, // sG = 3 DT
    powerPlantCost: 6, // 6.00 MCr
    bridgeTons: 3, // 2-man Cockpit = 3 DT
    bridgeCost: 0.05, // 0.05 MCr
    computerCost: 0.045, // M1 R5 Hardened = 0.045 MCr
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should have correct bridge tonnage', () => {
    const bridge = report.checks.find((c) => c.section === 'Bridge' && c.field === 'Tonnage');
    expect(bridge?.pass).toBe(true);
  });
});

describe('Sample: TL9 Ship\'s Boat 30DT (Excel row 1679)', () => {
  const report = validateShip(SAMPLE_TL9_SHIP_S_BOAT_30DT_30, {
    hullDtons: 30,
    hullPoints: 0,
    structurePoints: 1,
    hardpoints: 0,
    mDriveTons: 4.5,
    mDriveCost: 10,
    powerPlantTons: 3.6,
    powerPlantCost: 7,
    bridgeTons: 6,
    bridgeCost: 0.15,
    computerCost: 0.045,
    cargo: 14,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL 9 Yacht 100DT (Excel row 125)', () => {
  const report = validateShip(SAMPLE_TL_9_YACHT_100DT_100, {
    hullDtons: 100,
    hullPoints: 2,
    structurePoints: 2,
    hardpoints: 1,
    armorTons: 5,
    mDriveTons: 2,
    mDriveCost: 4,
    jDriveTons: 10,
    jDriveCost: 10,
    powerPlantTons: 4,
    powerPlantCost: 8,
    jumpFuel: 10,
    bridgeTons: 10,
    bridgeCost: 0.5,
    computerCost: 0.24,
    stateroomTons: 24,
    stateroomCost: 3,
    lowBerthTons: 1,
    lowBerthCost: 0.1,
    cargo: 12,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
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

describe('Sample: TL9 Research Vessel 200DT (Excel row 178)', () => {
  const report = validateShip(SAMPLE_TL9_RESEARCH_VESSEL_200DT_200, {
    hullDtons: 200,
    hullPoints: 4,
    structurePoints: 4,
    hardpoints: 2,
    armorTons: 10,
    mDriveTons: 2,
    mDriveCost: 4,
    jDriveTons: 10,
    jDriveCost: 10,
    powerPlantTons: 4,
    powerPlantCost: 8,
    jumpFuel: 20,
    bridgeTons: 10,
    bridgeCost: 1.0,
    computerCost: 0.06,
    stateroomTons: 24,
    stateroomCost: 3,
    lowBerthTons: 1.5,
    lowBerthCost: 0.15,
    cargo: 35,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
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

describe('Sample: 90DT Shuttle (Excel row 1501/1531)', () => {
  const report = validateShip(SAMPLE_VEHICLES_90DT_SHUTTLE_1_UNITS_90, {
    hullDtons: 90,
    hullPoints: 1, // floor(90/50) = 1
    structurePoints: 2, // ceil(90/50) = 2
    hardpoints: 0,
    mDriveTons: 8,
    mDriveCost: 16,
    powerPlantTons: 5.7,
    powerPlantCost: 10,
    bridgeTons: 6,
    bridgeCost: 0.45,
    computerCost: 0.03,
    cargo: 26,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL9 Ship\'s Boat 95DT (Excel row 1784)', () => {
  const report = validateShip(SAMPLE_TL9_SHIP_S_BOAT_95DT_95, {
    hullDtons: 95,
    hullPoints: 1, // floor(95/50) = 1
    structurePoints: 2, // ceil(95/50) = 2
    hardpoints: 0,
    mDriveTons: 3,
    mDriveCost: 6,
    powerPlantTons: 2.7,
    powerPlantCost: 5.5,
    bridgeTons: 6,
    bridgeCost: 0.475,
    computerCost: 0.045,
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL9 Ship\'s Boat 50DT (Excel row 1714)', () => {
  const report = validateShip(SAMPLE_TL9_SHIP_S_BOAT_50DT_50, {
    hullDtons: 50,
    hullPoints: 1, // floor(50/50) = 1
    structurePoints: 1,
    hardpoints: 0,
    mDriveTons: 3,
    mDriveCost: 6,
    powerPlantTons: 2.7,
    powerPlantCost: 5.5,
    bridgeTons: 6,
    bridgeCost: 0.25,
    computerCost: 0.045,
    cargo: 37,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL9 Ship\'s Boat 70DT (Excel row 1749)', () => {
  const report = validateShip(SAMPLE_TL9_SHIP_S_BOAT_70DT_70, {
    hullDtons: 70,
    hullPoints: 1, // floor(70/50) = 1
    structurePoints: 2, // ceil(70/50) = 2
    hardpoints: 0,
    mDriveTons: 3,
    mDriveCost: 6,
    powerPlantTons: 2.7,
    powerPlantCost: 5.5,
    bridgeTons: 6,
    bridgeCost: 0.35,
    computerCost: 0.045,
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL9 Medium Fighter 20DT, 2man, 3M (Excel row 1266)', () => {
  const report = validateShip(SAMPLE_TL9_MEDIUM_FIGHTER_20DT_2MAN_3M_20, {
    hullDtons: 20,
    hullPoints: 0, // floor(20/50) = 0
    structurePoints: 1, // ceil(20/50) = 1
    hardpoints: 0,
    armorTons: 6, // qty=6, 5% × 20 × 6 = 6 DT
    mDriveTons: 2.5,
    mDriveCost: 4,
    powerPlantTons: 2.4,
    powerPlantCost: 5,
    bridgeTons: 3,
    bridgeCost: 0.1,
    computerCost: 0.045,
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should have correct armor tonnage', () => {
    const armor = report.checks.find((c) => c.section === 'Armor' && c.field === 'Tonnage');
    expect(armor?.pass).toBe(true);
  });
});

describe('Sample: TL9 Boat 20DT (Excel row 1604)', () => {
  const report = validateShip(SAMPLE_TL9_BOAT_20DT_20, {
    hullDtons: 20,
    hullPoints: 0,
    structurePoints: 1,
    hardpoints: 0,
    mDriveTons: 0.5,
    mDriveCost: 1,
    powerPlantTons: 1.2,
    powerPlantCost: 3,
    bridgeTons: 6,
    bridgeCost: 0.1,
    computerCost: 0.045,
    cargo: 11,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should have correct bridge tonnage', () => {
    const bridge = report.checks.find((c) => c.section === 'Bridge' && c.field === 'Tonnage');
    expect(bridge?.pass).toBe(true);
  });
});

describe('Sample: TL 9 Courier Ship 100DT (Excel row 71)', () => {
  const report = validateShip(SAMPLE_TL_9_COURIER_SHIP_100DT_100, {
    hullDtons: 100,
    hullPoints: 2, // floor(100/50) = 2
    structurePoints: 2, // ceil(100/50) = 2
    hardpoints: 1, // floor(100/100) = 1
    armorTons: 5, // qty=1, 5% of 100 = 5 DT
    mDriveTons: 3, // M-Drive B = 3 DT
    mDriveCost: 8, // 8.00 MCr
    jDriveTons: 10, // J-Drive A = 10 DT
    jDriveCost: 10, // 10.00 MCr
    powerPlantTons: 7, // Power Plant B = 7 DT
    powerPlantCost: 16, // 16.00 MCr
    jumpFuel: 10, // 0.1 × 100 × 1 = 10 DT
    bridgeTons: 10, // 10-ton Bridge
    bridgeCost: 0.5, // 0.50 MCr
    computerCost: 0.24, // M2 R10 Hardened = 0.24 MCr
    stateroomTons: 16, // 4 × 4 = 16 DT
    stateroomCost: 2, // 4 × 0.5 = 2.00 MCr
    lowBerthTons: 0.5, // 1 × 0.5 = 0.5 DT (code uses 0.5 per berth)
    lowBerthCost: 0.05, // 1 × 0.05 = 0.05 MCr
    cargo: 17,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    const sp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Structure Points');
    expect(hp?.pass).toBe(true);
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

  it('should have correct bridge cost', () => {
    const bridge = report.checks.find((c) => c.section === 'Bridge' && c.field === 'Cost');
    expect(bridge?.pass).toBe(true);
  });
});

describe('Sample: TL9 Escort Fighter 10DT, 2man, 1BL, 2SC (Excel row 1184)', () => {
  const report = validateShip(SAMPLE_TL9_ESCORT_FIGHTER_10DT_2MAN_1BL_2SC_10, {
    hullDtons: 10,
    hullPoints: 0,
    structurePoints: 1,
    hardpoints: 0,
    armorTons: 0,
    mDriveTons: 1.5,
    mDriveCost: 3,
    powerPlantTons: 3,
    powerPlantCost: 6,
    bridgeTons: 3,
    bridgeCost: 0.05,
    computerCost: 0.045,
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });
});

describe('Sample: TL9 Fighter 10DT, 2man, 3M (Excel row 1226)', () => {
  const report = validateShip(SAMPLE_TL9_FIGHTER_10DT_2MAN_3M_10, {
    hullDtons: 10,
    hullPoints: 0,
    structurePoints: 1,
    hardpoints: 0,
    armorTons: 1, // qty=2, 5% × 10 × 2 = 1 DT
    mDriveTons: 1.5,
    mDriveCost: 3,
    powerPlantTons: 1.8,
    powerPlantCost: 4,
    bridgeTons: 3,
    bridgeCost: 0.05,
    computerCost: 0.045,
    cargo: 0,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should have correct armor tonnage', () => {
    const armor = report.checks.find((c) => c.section === 'Armor' && c.field === 'Tonnage');
    expect(armor?.pass).toBe(true);
  });
});

describe('Sample: TL9 Boat 10DT (Excel row 1569)', () => {
  const report = validateShip(SAMPLE_TL9_BOAT_10DT_10, {
    hullDtons: 10,
    hullPoints: 0,
    structurePoints: 1,
    hardpoints: 0,
    mDriveTons: 0.5,
    mDriveCost: 1,
    powerPlantTons: 1.2,
    powerPlantCost: 3,
    bridgeTons: 6,
    bridgeCost: 0.05,
    computerCost: 0.045,
    cargo: 1,
  });

  it('should have correct hull stats', () => {
    const hp = report.checks.find((c) => c.section === 'Hull' && c.field === 'Hull Points');
    expect(hp?.pass).toBe(true);
  });

  it('should have correct drive tonnages', () => {
    const md = report.checks.find((c) => c.section === 'M-Drive' && c.field === 'Tonnage');
    const pp = report.checks.find((c) => c.section === 'Power Plant' && c.field === 'Tonnage');
    expect(md?.pass).toBe(true);
    expect(pp?.pass).toBe(true);
  });

  it('should have correct bridge tonnage', () => {
    const bridge = report.checks.find((c) => c.section === 'Bridge' && c.field === 'Tonnage');
    expect(bridge?.pass).toBe(true);
  });
});
