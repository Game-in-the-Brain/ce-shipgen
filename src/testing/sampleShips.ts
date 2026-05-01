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


// ═══════════════════════════════════════════════════════════════════
// EXCEL-EXTRACTED SAMPLE SHIPS (sorted by tonnage, lowest first)
// Source: GI7B EXTERNAL RAW CE SHIPS 231024-06 240930.xlsx
// Sheet: CE SHIPS 230502
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// TL9 FIGHTER 10DT, 2man, 1BL, 2M (10DT) — Excel row 1143
// ═══════════════════════════════════════════════════════════════════
// Excel-verified totals:
//   Hull: s1 = 10 DT, 1.10 MCr (base) + 0.11 MCr (streamlined) = 1.21 MCr
//   Hull Points: 0 (per floor(10/50)), Structure Points: 1 (per ceil(10/50))
//   Armor: Titanium Steel TL7+, qty=0 → 0 DT, 0 MCr
//   M-Drive sC: 1.5 DT, 3.00 MCr
//   Power Plant sG: 3 DT, 6.00 MCr
//   Fuel: 1 DT (power only, no J-Drive)
//   Bridge: 2-man Cockpit, 3 DT, 0.05 MCr
//   Computer: M1 R5 Hardened, 0.045 MCr
//   Software: Interface (incl), Database 0.01, Security x2 (incl)
//   Weapons: Fixed-Mount Single 1 DT 0.1 MCr, Beam Laser 1.0 MCr, Missile Rack x2 1.5 MCr
//   Cargo: 0.5 DT
//   TOTAL: 10 DT used, ~12.93 MCr
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_FIGHTER_10DT_2MAN_1BL_2M_10: ShipDesign = baseShip({
  name: 'TL9 FIGHTER 10DT, 2man, 1BL, 2M',
  hullDtons: 10,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 0,
  mDrive: 'sC',
  powerPlant: 'sG',
  bridge: '2-man Cockpit',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-sc', name: 'M-Drive sC', type: 'thrust', driveCode: 'sC', dtons: 1.5, cost: 3, qty: 1, performance: 6, tl: 9 },
    { id: 'pp-sg', name: 'Fusion Plant sG', type: 'powerPlant', driveCode: 'sG', dtons: 3, cost: 6, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cockpit-2man', name: '2-man Cockpit', type: 'cockpit', dtons: 3, cost: 0.05, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
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
  weaponMounts: [
    { id: 'fixed-single', name: 'Fixed-Mount, Single', mountType: 'hardpoint', dtons: 1, cost: 0.1, qty: 1, maxWeapons: 1, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 ESCORT FIGHTER 10DT, 2man, 1BL, 2SC (10DT) — Excel row 1184
// ═══════════════════════════════════════════════════════════════════
// Same as base fighter but Sand Casters instead of Missile Racks
//   M-Drive sC: 1.5 DT, 3.00 MCr
//   Power Plant sG: 3 DT, 6.00 MCr
//   Armor: Titanium Steel, qty=0 → 0 DT
//   Weapons: Fixed-Mount, Beam Laser, Sand Caster x2
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_ESCORT_FIGHTER_10DT_2MAN_1BL_2SC_10: ShipDesign = baseShip({
  name: 'TL9 ESCORT FIGHTER 10DT, 2man, 1BL, 2SC',
  hullDtons: 10,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 0,
  mDrive: 'sC',
  powerPlant: 'sG',
  bridge: '2-man Cockpit',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-sc', name: 'M-Drive sC', type: 'thrust', driveCode: 'sC', dtons: 1.5, cost: 3, qty: 1, performance: 6, tl: 9 },
    { id: 'pp-sg', name: 'Fusion Plant sG', type: 'powerPlant', driveCode: 'sG', dtons: 3, cost: 6, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cockpit-2man', name: '2-man Cockpit', type: 'cockpit', dtons: 3, cost: 0.05, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
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
  weaponMounts: [
    { id: 'fixed-single', name: 'Fixed-Mount, Single', mountType: 'hardpoint', dtons: 1, cost: 0.1, qty: 1, maxWeapons: 1, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 FIGHTER 10DT, 2man, 3M (10DT) — Excel row 1226
// ═══════════════════════════════════════════════════════════════════
//   Armor: Titanium Steel TL7+, qty=2 → 1 DT (5% × 10 × 2)
//   M-Drive sC: 1.5 DT, 3.00 MCr
//   Power Plant sC: 1.8 DT, 4.00 MCr
//   Weapons: Fixed-Mount, Missile Rack x3
//   Cargo: 0.7 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_FIGHTER_10DT_2MAN_3M_10: ShipDesign = baseShip({
  name: 'TL9 FIGHTER 10DT, 2man, 3M',
  hullDtons: 10,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 2,
  mDrive: 'sC',
  powerPlant: 'sC',
  bridge: '2-man Cockpit',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-sc', name: 'M-Drive sC', type: 'thrust', driveCode: 'sC', dtons: 1.5, cost: 3, qty: 1, performance: 6, tl: 9 },
    { id: 'pp-sc', name: 'Fusion Plant sC', type: 'powerPlant', driveCode: 'sC', dtons: 1.8, cost: 4, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cockpit-2man', name: '2-man Cockpit', type: 'cockpit', dtons: 3, cost: 0.05, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
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
  weaponMounts: [
    { id: 'fixed-single', name: 'Fixed-Mount, Single', mountType: 'hardpoint', dtons: 1, cost: 0.1, qty: 1, maxWeapons: 1, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 BOAT 10DT (10DT) — Excel row 1569
// ═══════════════════════════════════════════════════════════════════
//   No armor
//   M-Drive sA: 0.5 DT, 1.00 MCr
//   Power Plant sA: 1.2 DT, 3.00 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.05 MCr
//   Cargo: 1.1 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_BOAT_10DT_10: ShipDesign = baseShip({
  name: 'TL9 BOAT 10DT',
  hullDtons: 10,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sA',
  powerPlant: 'sA',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 1,
  drives: [
    { id: 'mdrive-sa', name: 'M-Drive sA', type: 'thrust', driveCode: 'sA', dtons: 0.5, cost: 1, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-sa', name: 'Fusion Plant sA', type: 'powerPlant', driveCode: 'sA', dtons: 1.2, cost: 3, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.05, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 MEDIUM FIGHTER 20DT, 2man, 3M (20DT) — Excel row 1266
// ═══════════════════════════════════════════════════════════════════
//   Armor: Titanium Steel TL7+, qty=6 → 6 DT (5% × 20 × 6)
//   M-Drive sE: 2.5 DT, 4.00 MCr
//   Power Plant sE: 2.4 DT, 5.00 MCr
//   Weapons: Fixed-Mount, Particle Beam, Missile Rack x2
//   Cargo: 0 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_MEDIUM_FIGHTER_20DT_2MAN_3M_20: ShipDesign = baseShip({
  name: 'TL9 MEDIUM FIGHTER 20DT, 2man, 3M',
  hullDtons: 20,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 6,
  mDrive: 'sE',
  powerPlant: 'sE',
  bridge: '2-man Cockpit',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-se', name: 'M-Drive sE', type: 'thrust', driveCode: 'sE', dtons: 2.5, cost: 4, qty: 1, performance: 6, tl: 9 },
    { id: 'pp-se', name: 'Fusion Plant sE', type: 'powerPlant', driveCode: 'sE', dtons: 2.4, cost: 5, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cockpit-2man', name: '2-man Cockpit', type: 'cockpit', dtons: 3, cost: 0.1, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
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
  weaponMounts: [
    { id: 'fixed-single', name: 'Fixed-Mount, Single', mountType: 'hardpoint', dtons: 1, cost: 0.1, qty: 1, maxWeapons: 1, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 BOAT 20DT (20DT) — Excel row 1604
// ═══════════════════════════════════════════════════════════════════
//   No armor
//   M-Drive sA: 0.5 DT, 1.00 MCr
//   Power Plant sA: 1.2 DT, 3.00 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.10 MCr
//   Cargo: 11.1 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_BOAT_20DT_20: ShipDesign = baseShip({
  name: 'TL9 BOAT 20DT',
  hullDtons: 20,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sA',
  powerPlant: 'sA',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 11,
  drives: [
    { id: 'mdrive-sa', name: 'M-Drive sA', type: 'thrust', driveCode: 'sA', dtons: 0.5, cost: 1, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-sa', name: 'Fusion Plant sA', type: 'powerPlant', driveCode: 'sA', dtons: 1.2, cost: 3, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.1, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 SHIP\'s BOAT 30DT (30DT) — Excel row 1679
// ═══════════════════════════════════════════════════════════════════
//   M-Drive sJ: 4.5 DT, 10.00 MCr
//   Power Plant sJ: 3.6 DT, 7.00 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.15 MCr
//   Cargo: 14.7 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_SHIP_S_BOAT_30DT_30: ShipDesign = baseShip({
  name: 'TL9 SHIP\'s BOAT 30DT',
  hullDtons: 30,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sJ',
  powerPlant: 'sJ',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 14,
  drives: [
    { id: 'mdrive-sj', name: 'M-Drive sJ', type: 'thrust', driveCode: 'sJ', dtons: 4.5, cost: 10, qty: 1, performance: 9, tl: 9 },
    { id: 'pp-sj', name: 'Fusion Plant sJ', type: 'powerPlant', driveCode: 'sJ', dtons: 3.6, cost: 7, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.15, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 SHIP\'s BOAT 50DT (50DT) — Excel row 1714
// ═══════════════════════════════════════════════════════════════════
//   M-Drive sF: 3 DT, 6.00 MCr
//   Power Plant sF: 2.7 DT, 5.50 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.25 MCr
//   Cargo: 37.1 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_SHIP_S_BOAT_50DT_50: ShipDesign = baseShip({
  name: 'TL9 SHIP\'s BOAT 50DT',
  hullDtons: 50,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sF',
  powerPlant: 'sF',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 37,
  drives: [
    { id: 'mdrive-sf', name: 'M-Drive sF', type: 'thrust', driveCode: 'sF', dtons: 3, cost: 6, qty: 1, performance: 5, tl: 9 },
    { id: 'pp-sf', name: 'Fusion Plant sF', type: 'powerPlant', driveCode: 'sF', dtons: 2.7, cost: 5.5, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.25, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 SHIP\'s BOAT 70DT (70DT) — Excel row 1749
// ═══════════════════════════════════════════════════════════════════
//   M-Drive sF: 3 DT, 6.00 MCr
//   Power Plant sF: 2.7 DT, 5.50 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.35 MCr
//   Cargo: 0 DT (per Excel first occurrence)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_SHIP_S_BOAT_70DT_70: ShipDesign = baseShip({
  name: 'TL9 SHIP\'s BOAT 70DT',
  hullDtons: 70,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sF',
  powerPlant: 'sF',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-sf', name: 'M-Drive sF', type: 'thrust', driveCode: 'sF', dtons: 3, cost: 6, qty: 1, performance: 5, tl: 9 },
    { id: 'pp-sf', name: 'Fusion Plant sF', type: 'powerPlant', driveCode: 'sF', dtons: 2.7, cost: 5.5, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.35, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// VEHICLES : 90DT Shuttle, 1-Units (90DT) — Excel row 1501
// ═══════════════════════════════════════════════════════════════════
//   M-Drive sN: 8 DT, 16.00 MCr
//   Power Plant sN: 5.7 DT, 10.00 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.45 MCr
//   Computer: M1 R5 (no Hardened), 0.03 MCr
//   Cargo: 26.9 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_VEHICLES_90DT_SHUTTLE_1_UNITS_90: ShipDesign = baseShip({
  name: 'VEHICLES : 90DT Shuttle, 1-Units',
  hullDtons: 90,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sN',
  powerPlant: 'sN',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 26,
  drives: [
    { id: 'mdrive-sn', name: 'M-Drive sN', type: 'thrust', driveCode: 'sN', dtons: 8, cost: 16, qty: 1, performance: 9, tl: 9 },
    { id: 'pp-sn', name: 'Fusion Plant sN', type: 'powerPlant', driveCode: 'sN', dtons: 5.7, cost: 10, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.45, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.03, qty: 1, rating: 5, slots: 1, options: [], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 SHUTTLE 90DT (90DT) — Excel row 1531
// ═══════════════════════════════════════════════════════════════════
//   Same as VEHICLES : 90DT Shuttle
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_SHUTTLE_90DT_90: ShipDesign = baseShip({
  name: 'TL9 SHUTTLE 90DT',
  hullDtons: 90,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sN',
  powerPlant: 'sN',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 26,
  drives: [
    { id: 'mdrive-sn', name: 'M-Drive sN', type: 'thrust', driveCode: 'sN', dtons: 8, cost: 16, qty: 1, performance: 9, tl: 9 },
    { id: 'pp-sn', name: 'Fusion Plant sN', type: 'powerPlant', driveCode: 'sN', dtons: 5.7, cost: 10, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.45, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.03, qty: 1, rating: 5, slots: 1, options: [], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 SHIP\'s BOAT 95DT (95DT) — Excel row 1784
// ═══════════════════════════════════════════════════════════════════
//   M-Drive sF: 3 DT, 6.00 MCr
//   Power Plant sF: 2.7 DT, 5.50 MCr
//   Controls: 2-man Cabin Controls, 6 DT, 0.475 MCr
//   Cargo: 0 DT (per Excel)
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_SHIP_S_BOAT_95DT_95: ShipDesign = baseShip({
  name: 'TL9 SHIP\'s BOAT 95DT',
  hullDtons: 95,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'None',
  armorQty: 0,
  mDrive: 'sF',
  powerPlant: 'sF',
  bridge: '2-man Cabin Controls',
  computer: 'M1, R5 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  cargo: 0,
  drives: [
    { id: 'mdrive-sf', name: 'M-Drive sF', type: 'thrust', driveCode: 'sF', dtons: 3, cost: 6, qty: 1, performance: 5, tl: 9 },
    { id: 'pp-sf', name: 'Fusion Plant sF', type: 'powerPlant', driveCode: 'sF', dtons: 2.7, cost: 5.5, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'cabin-2man', name: '2-man Cabin Controls', type: 'cockpit', dtons: 6, cost: 0.475, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.045, qty: 1, rating: 5, slots: 1, options: ['Hardened'], tl: 9 },
  ] as ComputerItem[],
  softwareList: [
    { id: 'sw-interface', name: 'Interface TL 7', program: 'Interface TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-db', name: 'Database TL 7', program: 'Database TL 7', dtons: 0, cost: 0.01, qty: 1, rating: 0, active: true, tl: 7 },
    { id: 'sw-sec1', name: 'Security TL 7', program: 'Security TL 7', dtons: 0, cost: 0, qty: 1, rating: 0, active: true, tl: 7 },
  ] as SoftwareItem[],
  sensorList: [
    { id: 'sensor-std', name: 'Standard Sensors', sensorType: 'Standard', dtons: 0, cost: 0, qty: 1, tl: 9 },
  ] as SensorItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL 9 COURIER SHIP 100DT (100DT) — Excel row 71
// ═══════════════════════════════════════════════════════════════════
// Excel-verified totals:
//   Hull: 100 DT, 2.00 MCr + Streamlined 0.20 MCr = 2.20 MCr
//   Hull Points: 2, Structure Points: 2, Hardpoints: 1
//   Armor: Titanium Steel TL7+, qty=1, 5 DT, 0.10 MCr
//   M-Drive B: 3 DT, 8.00 MCr
//   J-Drive A: 10 DT, 10.00 MCr
//   Power Plant B: 7 DT, 16.00 MCr
//   Fuel: 28 DT (Jump 10 + Power 18)
//   Bridge: 10 DT, 0.50 MCr
//   Computer: M2 R10 Hardened, 0.24 MCr
//   Software: Interface (incl), Database 0.01, Security x2 (incl)
//   Staterooms: 4 × 4 = 16 DT, 2.00 MCr
//   Low Berth: 1 × 0.25 = 0.25 DT, 0.025 MCr
//   Weapons: Triple Turret 1 DT 1.0 MCr, Beam Laser x3 3.0 MCr
//   Cargo: 17.7 DT
//   TOTAL: ~100 DT, ~63.07 MCr
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL_9_COURIER_SHIP_100DT_100: ShipDesign = baseShip({
  name: 'TL 9 COURIER SHIP 100DT',
  hullDtons: 100,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 1,
  mDrive: 'B',
  jDrive: 'A',
  powerPlant: 'B',
  bridge: '10-ton Bridge',
  computer: 'M2, R10 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  staterooms: 4,
  lowBerths: 1,
  cargo: 17,
  drives: [
    { id: 'mdrive-b', name: 'M-Drive B', type: 'thrust', driveCode: 'B', dtons: 3, cost: 8, qty: 1, performance: 2, tl: 9 },
    { id: 'jdrive-a', name: 'J-Drive A', type: 'jump', driveCode: 'A', dtons: 10, cost: 10, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-b', name: 'Fusion Plant B', type: 'powerPlant', driveCode: 'B', dtons: 7, cost: 16, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'bridge-10', name: '10-ton Bridge', type: 'bridge', dtons: 10, cost: 0.5, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m2', name: 'Model/2', model: 'Model/2', dtons: 2, cost: 0.24, qty: 1, rating: 10, slots: 2, options: ['Hardened'], tl: 9 },
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
    { id: 'ls-stateroom', name: 'Stateroom', facilityType: 'Stateroom', dtons: 4, cost: 0.5, qty: 4, capacity: 2, tl: 9 },
    { id: 'ls-low', name: 'Low Berth', facilityType: 'Low Berth', dtons: 0.5, cost: 0.05, qty: 1, capacity: 1, tl: 9 },
  ] as LifeSupportItem[],
  weaponMounts: [
    { id: 'turret-triple-1', name: 'Triple Turret', mountType: 'turret', dtons: 1, cost: 1, qty: 1, maxWeapons: 3, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL 9 YACHT 100DT (100DT) — Excel row 125
// ═══════════════════════════════════════════════════════════════════
//   Hull: 100 DT, 2.00 MCr + Streamlined 0.20 MCr
//   Armor: Titanium Steel TL7+, qty=1 → 5 DT, 0.10 MCr
//   M-Drive A: 2 DT, 4.00 MCr
//   J-Drive A: 10 DT, 10.00 MCr
//   Power Plant A: 4 DT, 8.00 MCr
//   Fuel: 24 DT
//   Bridge: 10 DT, 0.50 MCr
//   Computer: M2 R10 Hardened, 0.24 MCr
//   Staterooms: 6 × 4 = 24 DT, 3.00 MCr
//   Low Berths: 2 × 0.5 = 1 DT, 0.10 MCr
//   Luxuries: 4 DT, 0.40 MCr
//   Weapons: Triple Turret 1 DT 1.0 MCr, Pulse Laser x3 1.5 MCr
//   Cargo: 12 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL_9_YACHT_100DT_100: ShipDesign = baseShip({
  name: 'TL 9 YACHT 100DT',
  hullDtons: 100,
  tl: 9,
  configuration: 'Streamlined',
  armor: 'Titanium Steel TL7+',
  armorQty: 1,
  mDrive: 'A',
  jDrive: 'A',
  powerPlant: 'A',
  bridge: '10-ton Bridge',
  computer: 'M2, R10 Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  staterooms: 6,
  lowBerths: 2,
  cargo: 12,
  drives: [
    { id: 'mdrive-a', name: 'M-Drive A', type: 'thrust', driveCode: 'A', dtons: 2, cost: 4, qty: 1, performance: 1, tl: 9 },
    { id: 'jdrive-a', name: 'J-Drive A', type: 'jump', driveCode: 'A', dtons: 10, cost: 10, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-a', name: 'Fusion Plant A', type: 'powerPlant', driveCode: 'A', dtons: 4, cost: 8, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'bridge-10', name: '10-ton Bridge', type: 'bridge', dtons: 10, cost: 0.5, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m2', name: 'Model/2', model: 'Model/2', dtons: 2, cost: 0.24, qty: 1, rating: 10, slots: 2, options: ['Hardened'], tl: 9 },
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
    { id: 'ls-stateroom', name: 'Stateroom', facilityType: 'Stateroom', dtons: 4, cost: 0.5, qty: 6, capacity: 2, tl: 9 },
    { id: 'ls-low', name: 'Low Berth', facilityType: 'Low Berth', dtons: 0.5, cost: 0.05, qty: 2, capacity: 1, tl: 9 },
  ] as LifeSupportItem[],
  weaponMounts: [
    { id: 'turret-triple-1', name: 'Triple Turret', mountType: 'turret', dtons: 1, cost: 1, qty: 1, maxWeapons: 3, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

// ═══════════════════════════════════════════════════════════════════
// TL9 Research Vessel 200DT (200DT) — Excel row 178
// ═══════════════════════════════════════════════════════════════════
//   Hull: 200 DT, 8.00 MCr
//   Armor: Titanium Steel TL7+, qty=1 → 10 DT, 0.40 MCr
//   M-Drive A: 2 DT, 4.00 MCr
//   J-Drive A: 10 DT, 10.00 MCr
//   Power Plant A: 4 DT, 8.00 MCr
//   Fuel: 24 DT
//   Bridge: 10 DT, 1.00 MCr
//   Computer: M1 R5 J-Spec Hardened, 0.06 MCr
//   Staterooms: 6 × 4 = 24 DT, 3.00 MCr
//   Low Berths: 3 × 0.25 = 0.75 DT, 0.075 MCr
//   Laboratories: 6 × 4 = 24 DT, 6.00 MCr
//   Weapons: Triple Turret x2, 2 DT, 2.0 MCr; Sand Caster x6, 1.5 MCr
//   Cargo: 35.3 DT
// ═══════════════════════════════════════════════════════════════════
export const SAMPLE_TL9_RESEARCH_VESSEL_200DT_200: ShipDesign = baseShip({
  name: 'TL9 Research Vessel 200DT',
  hullDtons: 200,
  tl: 9,
  configuration: 'Standard',
  armor: 'Titanium Steel TL7+',
  armorQty: 1,
  mDrive: 'A',
  jDrive: 'A',
  powerPlant: 'A',
  bridge: '10-ton Bridge',
  computer: 'M1, R5 J-Spec Hardened',
  software: ['Interface TL 7', 'Database TL 7', 'Security TL 7'],
  sensors: 'Standard Sensors',
  staterooms: 6,
  lowBerths: 3,
  cargo: 35,
  drives: [
    { id: 'mdrive-a', name: 'M-Drive A', type: 'thrust', driveCode: 'A', dtons: 2, cost: 4, qty: 1, performance: 1, tl: 9 },
    { id: 'jdrive-a', name: 'J-Drive A', type: 'jump', driveCode: 'A', dtons: 10, cost: 10, qty: 1, performance: 1, tl: 9 },
    { id: 'pp-a', name: 'Fusion Plant A', type: 'powerPlant', driveCode: 'A', dtons: 4, cost: 8, qty: 1, performance: 0, tl: 9 },
  ] as DriveItem[],
  commandControl: [
    { id: 'bridge-10', name: '10-ton Bridge', type: 'bridge', dtons: 10, cost: 1.0, qty: 1, stations: 2, tl: 9 },
  ] as BridgeItem[],
  computers: [
    { id: 'computer-m1', name: 'Model/1', model: 'Model/1', dtons: 1, cost: 0.06, qty: 1, rating: 5, slots: 1, options: ['J-Spec', 'Hardened'], tl: 9 },
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
    { id: 'ls-stateroom', name: 'Stateroom', facilityType: 'Stateroom', dtons: 4, cost: 0.5, qty: 6, capacity: 2, tl: 9 },
    { id: 'ls-low', name: 'Low Berth', facilityType: 'Low Berth', dtons: 0.5, cost: 0.05, qty: 3, capacity: 1, tl: 9 },
  ] as LifeSupportItem[],
  weaponMounts: [
    { id: 'turret-triple-1', name: 'Triple Turret', mountType: 'turret', dtons: 1, cost: 1, qty: 2, maxWeapons: 3, weapons: [], slots: 0 },
  ] as WeaponMountItem[],
});

export const ALL_SAMPLE_SHIPS: ShipDesign[] = [
  // Small craft (10-95 DT)
  SAMPLE_TL9_FIGHTER_10DT_2MAN_1BL_2M_10,
  SAMPLE_TL9_ESCORT_FIGHTER_10DT_2MAN_1BL_2SC_10,
  SAMPLE_TL9_FIGHTER_10DT_2MAN_3M_10,
  SAMPLE_TL9_BOAT_10DT_10,
  SAMPLE_TL9_MEDIUM_FIGHTER_20DT_2MAN_3M_20,
  SAMPLE_TL9_BOAT_20DT_20,
  SAMPLE_TL9_SHIP_S_BOAT_30DT_30,
  SAMPLE_TL9_SHIP_S_BOAT_50DT_50,
  SAMPLE_TL9_SHIP_S_BOAT_70DT_70,
  SAMPLE_VEHICLES_90DT_SHUTTLE_1_UNITS_90,
  SAMPLE_TL9_SHUTTLE_90DT_90,
  SAMPLE_TL9_SHIP_S_BOAT_95DT_95,
  // Standard ships (100-200 DT)
  SAMPLE_SHUTTLE_100,
  SAMPLE_TL_9_COURIER_SHIP_100DT_100,
  SAMPLE_TL_9_YACHT_100DT_100,
  SAMPLE_FREE_TRADER_200,
  SAMPLE_TL9_RESEARCH_VESSEL_200DT_200,
  // Medium ships (300-400 DT)
  SAMPLE_PATROL_CRUISER_400,
  SAMPLE_LINER_600,
  // Large ships (1000+ DT)
  SAMPLE_HEAVY_FREIGHTER_1000,
];

export function getSampleShipByName(name: string): ShipDesign | undefined {
  return ALL_SAMPLE_SHIPS.find((s) => s.name === name);
}
