/**
 * Engineering Calculators
 *
 * Interactive calculation utilities for drive performance, tender capacity,
 * armor limits, and weight classification.
 */

import {
  lookupThrust,
  getMaxHullForDrive,
  getAllDriveCodes,
} from '../data/enginePerformanceTable';

// ─── Drive Performance ───

const TL_MULTIPLIERS: Record<number, number> = {
  9: 1.0, 10: 1.0,
  11: 1.5, 12: 1.5,
  13: 2.5, 14: 2.5,
  15: 4.0, 16: 4.0, 17: 4.0, 18: 4.0, 19: 4.0, 20: 4.0,
};

export interface ThrustResult {
  thrustG: number;
  efficiency: number; // G per 100 DT
  weightClass: string;
}

export function calculateThrust(
  driveCode: string,
  hullDtons: number,
  tl: number = 9
): ThrustResult | null {
  if (!driveCode || hullDtons <= 0) return null;

  const baseThrust = lookupThrust(driveCode, hullDtons);
  if (baseThrust === null) return null;

  const multiplier = TL_MULTIPLIERS[tl] || 1.0;
  const thrustG = baseThrust * multiplier;
  const efficiency = thrustG; // G per 100 DT (same number since we divide by 100)

  return {
    thrustG: parseFloat(thrustG.toFixed(2)),
    efficiency: parseFloat(efficiency.toFixed(2)),
    weightClass: classifyWeight(efficiency, tl),
  };
}

// ─── Weight Classification ───

export function classifyWeight(efficiency: number, tl: number = 9): string {
  const multiplier = TL_MULTIPLIERS[tl] || 1.0;
  const thresholds = [
    { label: 'Very Light', base: 40.0 },
    { label: 'Light', base: 20.0 },
    { label: 'Medium', base: 5.0 },
    { label: 'Heavy', base: 1.0 },
  ];

  for (const t of thresholds) {
    if (efficiency > t.base * multiplier) return t.label;
  }
  return 'Very Heavy';
}

// ─── Tender Capacity ───

export interface TenderResult {
  driveCode: string;
  maxTotalMass: number;
  capacity: number;
  thrustAtCapacity: number;
}

export function calculateTenderCapacity(
  driveCode: string,
  tenderHullDtons: number
): TenderResult | null {
  if (!driveCode || tenderHullDtons <= 0) return null;

  const maxTotalMass = getMaxHullForDrive(driveCode);
  if (maxTotalMass === 0) return null;

  const capacity = Math.max(0, maxTotalMass - tenderHullDtons);
  const totalMass = tenderHullDtons + capacity;
  const thrustAtCapacity = totalMass > 0 ? (lookupThrust(driveCode, totalMass) || 0) : 0;

  return {
    driveCode,
    maxTotalMass,
    capacity,
    thrustAtCapacity: parseFloat(thrustAtCapacity.toFixed(2)),
  };
}

// Batch calculation for tender capacity tables
export function generateTenderTable(
  tenderHullDtons: number
): Array<{ drive: string; maxTotalMass: number; capacity: number; thrustAtCap: number }> {
  const results = [];
  for (const drive of getAllDriveCodes()) {
    const maxTotalMass = getMaxHullForDrive(drive);
    if (maxTotalMass === 0) continue;
    const cap = Math.max(0, maxTotalMass - tenderHullDtons);
    const total = tenderHullDtons + cap;
    results.push({
      drive,
      maxTotalMass,
      capacity: cap,
      thrustAtCap: parseFloat(((lookupThrust(drive, total) || 0)).toFixed(2)),
    });
  }
  return results;
}

// ─── Armor Limits ───

const ARMOR_LIMITS: Record<string, { standard: number; nonJump: number }> = {
  civilian: { standard: 10, nonJump: 15 },
  vanguard: { standard: 15, nonJump: 25 },
  striker: { standard: 10, nonJump: 20 },
  brawler: { standard: 20, nonJump: 50 },
  support: { standard: 15, nonJump: 25 },
  capital: { standard: 25, nonJump: 40 },
};

export interface ArmorCheckResult {
  armorPercent: number;
  roleLimit: number;
  status: 'legal' | 'over-limit' | 'extreme';
  penalty?: string;
}

export function checkArmorLimit(
  hullDtons: number,
  armorDtons: number,
  roleId: string,
  isNonJump: boolean = false
): ArmorCheckResult | null {
  if (hullDtons <= 0) return null;

  const armorPercent = (armorDtons / hullDtons) * 100;
  const limits = ARMOR_LIMITS[roleId] || ARMOR_LIMITS.vanguard;
  const limit = isNonJump ? limits.nonJump : limits.standard;

  let status: 'legal' | 'over-limit' | 'extreme' = 'legal';
  let penalty: string | undefined;

  const overBy = armorPercent - limit;

  if (overBy > 15) {
    status = 'extreme';
    penalty = '+100% armor cost. Requires TL 12+ structural engineering.';
  } else if (overBy > 10) {
    status = 'over-limit';
    penalty = '+50% armor cost, −2G thrust, double maintenance.';
  } else if (overBy > 5) {
    status = 'over-limit';
    penalty = '+25% armor cost, −1G thrust.';
  } else if (overBy > 0) {
    status = 'over-limit';
    penalty = '+10% armor cost per DT.';
  }

  return {
    armorPercent: parseFloat(armorPercent.toFixed(1)),
    roleLimit: limit,
    status,
    penalty,
  };
}

// ─── Module / Distributed Hull ───

const SHAPE_FACTORS: Record<string, number> = {
  hex: 1.0,
  square: 0.9,
  long: 0.85,
  triangular: 0.8,
};

export interface ModuleConfig {
  shape: string;
  moduleDtons: number;
  count: number;
}

export function calculateDistributedHull(
  baseHullDtons: number,
  modules: ModuleConfig[]
): {
  totalModuleCapacity: number;
  effectiveCapacity: number;
  connectorDtons: number;
  totalHullDtons: number;
  frameCost: number;
} | null {
  if (baseHullDtons <= 0) return null;

  let totalModuleDtons = 0;
  let minFactor = 1.0;

  for (const mod of modules) {
    totalModuleDtons += mod.moduleDtons * mod.count;
    const factor = SHAPE_FACTORS[mod.shape] || 1.0;
    if (factor < minFactor) minFactor = factor;
  }

  const effectiveCapacity = totalModuleDtons * minFactor;
  const connectorDtons = Math.max(
    baseHullDtons * 0.05,
    totalModuleDtons * 0.05
  );
  const totalHullDtons = baseHullDtons + connectorDtons;
  const frameCost = baseHullDtons * 0.06; // MCr

  return {
    totalModuleCapacity: totalModuleDtons,
    effectiveCapacity: parseFloat(effectiveCapacity.toFixed(1)),
    connectorDtons: parseFloat(connectorDtons.toFixed(1)),
    totalHullDtons: parseFloat(totalHullDtons.toFixed(1)),
    frameCost: parseFloat(frameCost.toFixed(2)),
  };
}

// ─── Fuel & Range ───

export function calculateJumpFuel(
  hullDtons: number,
  parsecs: number
): number {
  return hullDtons * 0.1 * parsecs;
}

export function calculatePowerFuel(
  powerPlantRating: number,
  weeks: number
): number {
  // CE RAW: fuel per week = rating × 0.01 × some factor
  // Simplified: Power Plant fuel = rating × 0.5 per week (approximate)
  return powerPlantRating * 0.5 * weeks;
}

// ─── Crew Requirements ───

export interface CrewRequirements {
  command: number;
  pilot: number;
  navigator: number;
  engineers: number;
  medics: number;
  gunners: number;
  marines: number;
  stewards: number;
  deckCrew: number;
  total: number;
}

export function calculateCrew(
  hullDtons: number,
  driveRating: number,
  turretCount: number,
  bayCount: number,
  passengerCount: number,
  hasJumpDrive: boolean = true,
  carrierCraftCount: number = 0
): CrewRequirements {
  const command = 1;
  const pilot = Math.max(1, Math.ceil(hullDtons / 10000));
  const navigator = hasJumpDrive ? 1 : 0;
  const engineers = Math.max(1, Math.ceil((driveRating * 100) / 100)); // 1 per 100 DT of drives
  const medics = Math.max(0, Math.floor(passengerCount / 120));
  const gunners = turretCount + Math.ceil(bayCount * 3);
  const marines = 0; // Mission-dependent
  const stewards = Math.max(0, Math.ceil(passengerCount / 8));
  const deckCrew = carrierCraftCount > 0 ? Math.ceil(carrierCraftCount / 2) : 0;

  return {
    command,
    pilot,
    navigator,
    engineers,
    medics,
    gunners,
    marines,
    stewards,
    deckCrew,
    total: command + pilot + navigator + engineers + medics + gunners + marines + stewards + deckCrew,
  };
}

// ─── Passage & Freight Rates ───

export function calculatePassageRevenue(
  highPassengers: number,
  middlePassengers: number,
  lowPassengers: number,
  parsecs: number
): { high: number; middle: number; low: number; total: number } {
  // CE RAW base rates (simplified)
  const highRate = 10000 * parsecs; // Cr per passenger
  const middleRate = 2000 * parsecs;
  const lowRate = 500 * parsecs;

  return {
    high: highPassengers * highRate,
    middle: middlePassengers * middleRate,
    low: lowPassengers * lowRate,
    total: (highPassengers * highRate) + (middlePassengers * middleRate) + (lowPassengers * lowRate),
  };
}

export function calculateFreightRevenue(
  cargoDtons: number,
  parsecs: number
): number {
  // CE RAW: roughly 1000 Cr per DT per parsec (simplified)
  return cargoDtons * 1000 * parsecs;
}

// ─── Life Support & Accommodation ───

export function calculateLifeSupportCapacity(
  staterooms: number,
  lowBerths: number
): { standardCrew: number; passengers: number; lowPassengers: number } {
  return {
    standardCrew: staterooms, // 1 per stateroom for crew
    passengers: staterooms, // 1 per stateroom for passengers (double occupancy possible)
    lowPassengers: lowBerths,
  };
}

export function calculateLifePodRequirement(
  totalPersonnel: number,
  shipType: string = 'standard'
): number {
  // Standard: 1 pod per person
  // Military: 1.2 pods per person (redundancy)
  // Civilian: 0.8 pods per person (shared)
  const multipliers: Record<string, number> = {
    standard: 1.0,
    military: 1.2,
    civilian: 0.8,
  };
  return Math.ceil(totalPersonnel * (multipliers[shipType] || 1.0));
}
