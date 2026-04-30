/**
 * Sample Ship Library — Reference Designs for Testing
 *
 * Each ship is extracted from the master Excel:
 *   GI7B EXTERNAL RAW CE SHIPS 231024-06 240930.xlsx
 *   Sheet: CE SHIPS 230502
 *
 * Expected values are verified against the Excel computed columns.
 * If ShipDesigner produces different values, RCA:
 *   1. Is the Excel formula wrong? → Fix Excel (rare)
 *   2. Is the JSON table wrong? → Fix table
 *   3. Is the shipgen calc wrong? → Fix calc
 */

import type { ShipDesign, DriveItem, BridgeItem, ComputerItem, SoftwareItem, SensorItem, LifeSupportItem, WeaponMountItem } from '../types';

function baseShip(overrides: Partial<ShipDesign> & { name: string; hullDtons: number }): ShipDesign {
  const now = new Date().toISOString();
  const base: ShipDesign = {
    id: `sample-${overrides.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name: overrides.name,
    tl: 9,
    hullCode: String(overrides.hullDtons),
    hullDtons: overrides.hullDtons,
    configuration: 'Standard',
    armor: 'None',
    armorQty: 0,
    mDrive: '',
    jDrive: '',
    powerPlant: '',
    bridge: '',
    computer: '',
    software: [],
    sensors: '',
    staterooms: 0,
    lowBerths: 0,
    crew: [],
    modules: [],
    weapons: [],
    cargo: 0,
    components: [],
    totalCost: 0,
    availableDtons: 0,
    createdAt: now,
  };
  return { ...base, ...overrides };
}

// ═══════════════════════════════════════════════════════════════════
// SAMPLE 1: 200-ton Free Trader (Excel row 293)
// ═══════════════════════════════════════════════════════════════════
// Excel-verified totals:
//   Hull: 200 DT, 8.00 MCr
//   HP: 4, SP: 4, Hardpoints: 2
//   Armor: Titanium Steel, 10 DT (5% × 200), 0.40 MCr
//   M-Drive A: 2 DT, 4.00 MCr
//   J-Drive A: 10 DT, 10.00 MCr
//   Power Plant A: 4 DT, 8.00 MCr
//   Fuel: 24 DT (Jump 20 + Power 4)
//   Bridge: 10 DT, 1.00 MCr  ← SRD: MCr0.5 per 100t
//   Computer: M1 + J-Spec + Hardened, 0.06 MCr
//   Software: Interface (incl), Database 0.01, Security x2 (incl)
//   Sensors: Standard (incl in bridge)
//   Staterooms: 10 × 4 = 40 DT, 5.00 MCr
//   Low Berths: 20 × 0.5 = 10 DT, 1.00 MCr
//   Fuel Scoops: 2, 0 DT, 2.00 MCr
//   Fuel Processors: 2, 2 DT, 0.10 MCr
//   Triple Turrets: 2, 2 DT, 2.00 MCr
//   Sand Casters: 6 (in turrets), 0 DT, 1.50 MCr
//   Cargo: 86 DT
//   TOTAL: 200 DT, 43.07 MCr
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_FREE_TRADER_200: ShipDesign = baseShip({
  name: '200-ton Free Trader',
  hullDtons: 200,
  tl: 9,
  configuration: 'Standard',
  armor: 'Titanium Steel TL7+',
  armorQty: 1, // Excel: qty=1 → Armor-2 (one 5% layer of Titanium Steel)
  mDrive: 'A',
  jDrive: 'A',
  powerPlant: 'A',
  bridge: '10-ton Bridge',
  computer: 'Model 1',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  staterooms: 10,
  lowBerths: 20,
  cargo: 86,
  drives: [
    { id: 'mdrive-a', name: 'M-Drive A', type: 'thrust', driveCode: 'A', dtons: 2, cost: 4, qty: 1, performance: 1, tl: 9 },
    { id: 'jdrive-a', name: 'J-Drive A', type: 'jump', driveCode: 'A', dtons: 10, cost: 10, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-a', name: 'Fusion Plant A', type: 'powerPlant', driveCode: 'A', dtons: 4, cost: 8, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'bridge-10', name: '10-ton Bridge', type: 'bridge', dtons: 10, cost: 1.0, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.03, qty: 1, rating: 5, slots: 1, options: ['J-Spec', 'Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec2', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
  lifeSupport: [
    { id: 'ls-stateroom', name: 'Stateroom', facilityType: 'Stateroom', dtons: 4, cost: 0.5, qty: 10, capacity: 2, tl: 9 },
    { id: 'ls-low', name: 'Low Berth', facilityType: 'Low Berth', dtons: 0.5, cost: 0.05, qty: 20, capacity: 1, tl: 9 },
  ] as LifeSupportItem[],
  weaponMounts: [
    { id: 'turret-triple-1', name: 'Triple Turret', mountType: 'turret', dtons: 1, cost: 1, qty: 2, maxWeapons: 3, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// SAMPLE 2: 100-ton Shuttle (basic small craft)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_SHUTTLE_100: ShipDesign = baseShip({
  name: '100-ton Shuttle',
  hullDtons: 100,
  tl: 9,
  configuration: 'Standard',
  armor: 'None',
  armorQty: 0,
  mDrive: 'A',
  jDrive: '',
  powerPlant: 'A',
  bridge: 'Cockpit',
  computer: 'Model 1',
  sensors: 'Standard Sensors',
  staterooms: 0,
  lowBerths: 0,
  cargo: 10,
});

// Expected:
// Hull: 100 DT, 2.00 MCr
// HP: 2, SP: 2, Hardpoints: 1
// M-Drive A: 2 DT, 4.00 MCr
// Power Plant A: 4 DT, 8.00 MCr
// Fuel: power only, 4 wks = 4 DT (or 1/wk × 4 = 4)
// Bridge/Cockpit: 1.5 DT, 0.01 MCr
// Cargo: 10 DT
// Total used: 100 - 10 = 90 DT

// ═══════════════════════════════════════════════════════════════════
// SAMPLE 3: 400-ton Patrol Cruiser (combat vessel)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_PATROL_CRUISER_400: ShipDesign = baseShip({
  name: '400-ton Patrol Cruiser',
  hullDtons: 400,
  tl: 9,
  configuration: 'Standard',
  armor: 'Titanium Steel TL7+',
  armorQty: 4,
  mDrive: 'C',
  jDrive: 'B',
  powerPlant: 'C',
  bridge: '20-ton Bridge',
  computer: 'Model 2',
  sensors: 'Military Sensors',
  staterooms: 10,
  lowBerths: 0,
  cargo: 20,
});

// Expected:
// Hull: 400 DT, 16.00 MCr
// HP: 8, SP: 8, Hardpoints: 4
// Armor: 5% × 4 = 20% → 80 DT
// M-Drive C: 5 DT, 12.00 MCr
// J-Drive B: 15 DT, 20.00 MCr
// Power Plant C: 10 DT, 24.00 MCr
// Fuel: Jump-2 = 0.1×400×2 = 80 DT; Power 4 wks
// Bridge: 20 DT, 0.50 MCr (or from table)
// Cargo: 20 DT

// ═══════════════════════════════════════════════════════════════════
// SAMPLE 4: 600-ton Subsidized Liner (passenger vessel)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_LINER_600: ShipDesign = baseShip({
  name: '600-ton Subsidized Liner',
  hullDtons: 600,
  tl: 9,
  configuration: 'Standard',
  armor: 'None',
  armorQty: 0,
  mDrive: 'D',
  jDrive: 'C',
  powerPlant: 'D',
  bridge: '40-ton Bridge',
  computer: 'Model 3',
  sensors: 'Advanced Sensors',
  staterooms: 20,
  lowBerths: 20,
  cargo: 100,
});

// ═══════════════════════════════════════════════════════════════════
// SAMPLE 5: 1000-ton Heavy Freighter (cargo vessel)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_HEAVY_FREIGHTER_1000: ShipDesign = baseShip({
  name: '1000-ton Heavy Freighter',
  hullDtons: 1000,
  tl: 9,
  configuration: 'Distributed',
  armor: 'Crystaliron TL10+',
  armorQty: 2,
  mDrive: 'F',
  jDrive: 'D',
  powerPlant: 'F',
  bridge: '60-ton Bridge',
  computer: 'Model 3',
  sensors: 'Standard Sensors',
  staterooms: 8,
  lowBerths: 0,
  cargo: 500,
});

// ═══════════════════════════════════════════════════════════════════
// All samples array
// ═══════════════════════════════════════════════════════════════════
export const ALL_SAMPLE_SHIPS: ShipDesign[] = [
  SAMPLE_FREE_TRADER_200,
  SAMPLE_SHUTTLE_100,
  SAMPLE_PATROL_CRUISER_400,
  SAMPLE_LINER_600,
  SAMPLE_HEAVY_FREIGHTER_1000,
];

export function getSampleShipByName(name: string): ShipDesign | undefined {
  return ALL_SAMPLE_SHIPS.find((s) => s.name === name);
}
