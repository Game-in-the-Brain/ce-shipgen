/**
 * Ship Operations Calculator
 *
 * Generates detailed operational specs from a ShipDesign:
 * - Crew breakdown by position
 * - Operating costs (mortgage, maintenance, salaries, fuel)
 * - Revenue potential (passengers, freight, mail)
 * - Life support capacity and duration
 * - Escape systems
 * - Jump range and endurance
 */

import type { ShipDesign, ShipOperations, CrewBreakdown, OperatingCosts, RevenuePotential, LifeSupportDetails, EscapeSystems } from '../types';

// ─── Constants (CE RAW + Mneme adjustments) ───

const SALARIES: Record<string, number> = {
  command: 6000,      // Cr per month
  pilot: 5000,
  navigator: 4000,
  engineer: 4000,
  medic: 3000,
  gunner: 3000,
  marine: 2000,
  steward: 1500,
  maintenance: 2500,
  deckCrew: 2500,
};

const PASSAGE_RATES = {
  high: 10000,    // Cr per parsec
  middle: 2000,   // Cr per parsec
  low: 500,       // Cr per parsec
};

const FREIGHT_RATE = 1000; // Cr per DT per parsec
const MAIL_CONTRACT = 25000; // Cr per jump (if eligible)

const LIFE_SUPPORT_COST_PER_PERSON = 2000; // Cr per month
const MAINTENANCE_COST_PER_YEAR = 0.001; // 0.1% of hull cost per year
const ANNUAL_OVERHAUL_WEEKS = 2;

// ─── Crew Calculation ───

export function calculateCrew(ship: ShipDesign): CrewBreakdown {
  const hull = ship.hullDtons || 0;
  const drives = ship.drives || [];
  const weapons = ship.weapons || [];
  const weaponMounts = ship.weaponMounts || [];
  const staterooms = ship.staterooms || 0;
  const hasJump = drives.some(d => d.type === 'jump');

  // Count weapon mounts
  const turretCount = weaponMounts.filter(w => w.mountType === 'turret').reduce((s, w) => s + w.qty, 0)
    + weapons.filter(w => w.module?.toLowerCase().includes('turret')).reduce((s, w) => s + (w.qty || 1), 0);
  const bayCount = weaponMounts.filter(w => w.mountType === 'bay').reduce((s, w) => s + w.qty, 0);

  // Drive rating from first thrust drive
  const thrustDrive = drives.find(d => d.type === 'thrust');
  const driveRating = thrustDrive ? extractDriveRating(thrustDrive.driveCode || thrustDrive.name) : 1;

  // Calculate
  const command = 1;
  const pilot = Math.max(1, Math.ceil(hull / 10000));
  const navigator = hasJump ? 1 : 0;
  const engineer = Math.max(1, Math.ceil(driveRating)); // simplified
  const medic = staterooms > 0 ? Math.max(1, Math.floor(staterooms / 120)) : 0;
  const gunner = turretCount + Math.ceil(bayCount * 3);
  const marine = 0; // Mission-dependent, calculated separately
  const steward = staterooms > 0 ? Math.ceil(staterooms / 8) : 0;
  const maintenance = hull >= 1000 ? Math.ceil(hull / 1000) : 0;
  const deckCrew = weaponMounts.length > 0 ? Math.ceil(weaponMounts.length / 2) : 0;

  return {
    command,
    pilot,
    navigator,
    engineer,
    medic,
    gunner,
    marine,
    steward,
    maintenance,
    deckCrew,
    total: command + pilot + navigator + engineer + medic + gunner + marine + steward + maintenance + deckCrew,
  };
}

function extractDriveRating(code: string): number {
  if (!code) return 1;
  const match = code.match(/([A-V])/i);
  if (!match) return 1;
  const letter = match[1].toUpperCase();
  const ratings: Record<string, number> = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
    J: 9, K: 10, L: 11, M: 12, N: 13, P: 14, Q: 15,
    R: 16, S: 17, T: 18, U: 19, V: 20,
  };
  return ratings[letter] || 1;
}

// ─── Operating Costs ───

export function calculateOperatingCosts(ship: ShipDesign, crew: CrewBreakdown): OperatingCosts {
  const hullCost = ship.totalCost || 0; // in Credits

  // Mortgage: 1/240 of total cost per month (20-year loan at 0% for simplicity)
  const monthlyMortgage = hullCost / 240 / 1_000_000; // MCr

  // Maintenance: 0.1% of hull cost per year
  const maintenance = hullCost * MAINTENANCE_COST_PER_YEAR / 1_000_000; // MCr/year

  // Crew salaries
  const crewSalariesCr =
    crew.command * SALARIES.command +
    crew.pilot * SALARIES.pilot +
    crew.navigator * SALARIES.navigator +
    crew.engineer * SALARIES.engineer +
    crew.medic * SALARIES.medic +
    crew.gunner * SALARIES.gunner +
    crew.marine * SALARIES.marine +
    crew.steward * SALARIES.steward +
    crew.maintenance * SALARIES.maintenance +
    crew.deckCrew * SALARIES.deckCrew;
  const crewSalaries = crewSalariesCr / 1_000_000; // MCr

  // Life support cost
  const lifeSupport = (crew.total * LIFE_SUPPORT_COST_PER_PERSON) / 1_000_000; // MCr

  // Fuel cost per jump (simplified: 500 Cr per DT of fuel)
  const fuelTons = (ship.components || []).filter(c => c.module?.includes('Fuel') && !c.module?.includes('Scoops') && !c.module?.includes('Processors')).reduce((s, c) => s + (c.dtons || 0), 0);
  const fuel = fuelTons * 0.0005; // MCr

  // Port fees: based on hull size
  const portFees = (hullCost * 0.0001) / 1_000_000; // MCr

  const totalMonthly = monthlyMortgage + (maintenance / 12) + crewSalaries + lifeSupport + portFees;

  // Annual ledger figures (for entity operating the ship)
  const annualMortgage = monthlyMortgage * 12;
  const annualSalaries = crewSalaries * 12;
  const annualLifeSupport = lifeSupport * 12;
  const fixedCosts = annualMortgage + maintenance + annualSalaries + annualLifeSupport;

  const variableAt12 = (fuel + portFees) * 12;
  const variableAt24 = (fuel + portFees) * 24;
  const variableAt36 = (fuel + portFees) * 36;

  return {
    monthlyMortgage: parseFloat(monthlyMortgage.toFixed(3)),
    maintenance: parseFloat(maintenance.toFixed(3)),
    crewSalaries: parseFloat(crewSalaries.toFixed(3)),
    lifeSupport: parseFloat(lifeSupport.toFixed(3)),
    fuel: parseFloat(fuel.toFixed(3)),
    portFees: parseFloat(portFees.toFixed(3)),
    totalMonthly: parseFloat(totalMonthly.toFixed(3)),
    annual: {
      mortgage: parseFloat(annualMortgage.toFixed(3)),
      maintenance: parseFloat(maintenance.toFixed(3)),
      crewSalaries: parseFloat(annualSalaries.toFixed(3)),
      lifeSupport: parseFloat(annualLifeSupport.toFixed(3)),
      fixedCosts: parseFloat(fixedCosts.toFixed(3)),
      variableAt12: parseFloat(variableAt12.toFixed(3)),
      variableAt24: parseFloat(variableAt24.toFixed(3)),
      variableAt36: parseFloat(variableAt36.toFixed(3)),
      totalAt12: parseFloat((fixedCosts + variableAt12).toFixed(3)),
      totalAt24: parseFloat((fixedCosts + variableAt24).toFixed(3)),
      totalAt36: parseFloat((fixedCosts + variableAt36).toFixed(3)),
    },
  };
}

// ─── Revenue Potential ───

export function calculateRevenue(ship: ShipDesign, parsecs: number = 1): RevenuePotential {
  const staterooms = ship.staterooms || 0;
  const lowBerths = ship.lowBerths || 0;
  const cargo = ship.cargo || 0;

  // Assume 20% of staterooms for high passage, 80% for middle
  const highPassengers = Math.floor(staterooms * 0.2);
  const midPassengers = Math.floor(staterooms * 0.8);
  const lowPassengers = lowBerths;

  const passengerRevenue =
    (highPassengers * PASSAGE_RATES.high * parsecs) +
    (midPassengers * PASSAGE_RATES.middle * parsecs) +
    (lowPassengers * PASSAGE_RATES.low * parsecs);

  const freightDtons = cargo;
  const freightRevenue = freightDtons * FREIGHT_RATE * parsecs;

  // Mail contract: available if ship has 10+ DT cargo and is armed
  const isArmed = (ship.weapons || []).length > 0 || (ship.weaponMounts || []).length > 0;
  const mailContracts = (isArmed && freightDtons >= 10) ? MAIL_CONTRACT * parsecs : 0;

  return {
    highPassengers,
    midPassengers,
    lowPassengers,
    passengerRevenue: parseFloat((passengerRevenue / 1000000).toFixed(3)),
    freightDtons,
    freightRevenue: parseFloat((freightRevenue / 1000000).toFixed(3)),
    mailContracts: parseFloat((mailContracts / 1000000).toFixed(3)),
    totalRevenue: parseFloat(((passengerRevenue + freightRevenue + mailContracts) / 1000000).toFixed(3)),
  };
}

// ─── Life Support ───

export function calculateLifeSupport(ship: ShipDesign): LifeSupportDetails {
  const staterooms = ship.staterooms || 0;
  const lowBerths = ship.lowBerths || 0;

  // Life support supplies from ship.supplies array
  const lifeSupportTons = (ship.supplies || [])
    .filter(s => s.name?.toLowerCase().includes('life support'))
    .reduce((s, sup) => s + ((sup.dtons || 0) * (sup.qty || 1)), 0);

  // Default: 1 ton per 20 people per month
  const standardCapacity = staterooms;
  const emergencyCapacity = staterooms * 2; // double occupancy
  const durationWeeks = lifeSupportTons > 0 ? Math.floor((lifeSupportTons * 20) / Math.max(1, standardCapacity)) * 4 : 0;

  return {
    staterooms,
    lowBerths,
    standardCapacity,
    emergencyCapacity,
    durationWeeks,
    lifeSupportTons: parseFloat(lifeSupportTons.toFixed(1)),
  };
}

// ─── Escape Systems ───

export function calculateEscapeSystems(ship: ShipDesign, crew: CrewBreakdown): EscapeSystems {
  const totalPersonnel = crew.total + (ship.staterooms || 0); // crew + max passengers

  // Life pods from components
  const lifePods = (ship.components || [])
    .filter(c => c.module?.toLowerCase().includes('life pod') || c.module?.toLowerCase().includes('escape'))
    .reduce((s, c) => s + (c.qty || 1), 0);

  // Estimate if none found
  const estimatedPods = Math.ceil(totalPersonnel / 4); // 4 people per pod

  const lifeBoats = (ship.components || [])
    .filter(c => c.module?.toLowerCase().includes('life boat'))
    .reduce((s, c) => s + (c.qty || 1), 0);

  const escapePods = (ship.components || [])
    .filter(c => c.module?.toLowerCase().includes('escape pod'))
    .reduce((s, c) => s + (c.qty || 1), 0);

  const totalCapacity = (lifePods || estimatedPods) * 4 + lifeBoats * 10 + escapePods * 1;

  return {
    lifePods: lifePods || estimatedPods,
    escapePods,
    lifeBoats,
    totalCapacity,
  };
}

// ─── Jump Range & Endurance ───

export interface FuelProfile {
  jumpRange: number;
  jumpFuelPerJump: number;
  weeklyPowerFuel: number;
  totalFuel: number;
  maxJumps: number;
  remainingWeeks: number;
  notation: string;
  endurance: number; // total weeks if used for power only
}

export function calculateFuelProfile(ship: ShipDesign): FuelProfile {
  // Jump range from J-Drive
  const jumpDrive = (ship.drives || []).find(d => d.type === 'jump');
  let jumpRange = 1;
  if (jumpDrive) {
    const code = jumpDrive.driveCode || jumpDrive.name || '';
    const match = code.match(/([A-V])/i);
    if (match) {
      const letter = match[1].toUpperCase();
      const ratings: Record<string, number> = {
        A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
        J: 9, K: 10, L: 11, M: 12, N: 13, P: 14, Q: 15,
        R: 16, S: 17, T: 18, U: 19, V: 20,
      };
      jumpRange = ratings[letter] || 1;
    }
  }

  const hullDtons = ship.hullDtons || 0;
  const totalFuel = (ship.components || []).filter(c => c.module?.includes('Fuel') && !c.module?.includes('Scoops') && !c.module?.includes('Processors')).reduce((s, c) => s + (c.dtons || 0), 0);
  const powerPlants = (ship.drives || []).filter(d => d.type === 'powerPlant');
  const powerPlantTons = powerPlants.reduce((s, d) => s + (d.dtons || 0), 0);
  const weeklyPowerFuel = powerPlantTons / 3;
  const jumpFuelPerJump = hullDtons * 0.1 * jumpRange;

  let maxJumps = 0;
  let remainingWeeks = 0;
  let notation = '';

  if (jumpRange > 0 && jumpFuelPerJump > 0) {
    maxJumps = Math.floor(totalFuel / jumpFuelPerJump);
    const remainingFuel = totalFuel - maxJumps * jumpFuelPerJump;
    remainingWeeks = weeklyPowerFuel > 0 ? remainingFuel / weeklyPowerFuel : 0;
    notation = `J${jumpRange}x${maxJumps} + ${remainingWeeks.toFixed(1)}wk`;
  } else if (weeklyPowerFuel > 0) {
    remainingWeeks = totalFuel / weeklyPowerFuel;
    notation = `${remainingWeeks.toFixed(1)}wk`;
  }

  const endurance = weeklyPowerFuel > 0 ? Math.floor(totalFuel / weeklyPowerFuel) : 0;

  return { jumpRange, jumpFuelPerJump, weeklyPowerFuel, totalFuel, maxJumps, remainingWeeks, notation, endurance };
}

export function calculatePerformance(ship: ShipDesign): { jumpRange: number; endurance: number } {
  const profile = calculateFuelProfile(ship);
  return { jumpRange: profile.jumpRange, endurance: profile.endurance };
}

// ─── Main Entry Point ───

export function calculateShipOperations(ship: ShipDesign, parsecs: number = 1): ShipOperations {
  const crew = calculateCrew(ship);
  const costs = calculateOperatingCosts(ship, crew);
  const revenue = calculateRevenue(ship, parsecs);
  const lifeSupport = calculateLifeSupport(ship);
  const escapeSystems = calculateEscapeSystems(ship, crew);
  const { jumpRange, endurance } = calculatePerformance(ship);

  return {
    crew,
    costs,
    revenue,
    lifeSupport,
    escapeSystems,
    jumpRange,
    endurance,
    annualOverhaul: ANNUAL_OVERHAUL_WEEKS,
  };
}

// ─── Utility: Format for display ───

export function formatOperationsSummary(ops: ShipOperations): string {
  const lines = [
    '=== SHIP OPERATIONS SUMMARY ===',
    '',
    `CREW (${ops.crew.total} total):`,
    `  Command: ${ops.crew.command} | Pilot: ${ops.crew.pilot} | Navigator: ${ops.crew.navigator}`,
    `  Engineer: ${ops.crew.engineer} | Medic: ${ops.crew.medic} | Gunner: ${ops.crew.gunner}`,
    `  Steward: ${ops.crew.steward} | Maintenance: ${ops.crew.maintenance} | Deck: ${ops.crew.deckCrew}`,
    '',
    `OPERATING COSTS (MCr/month):`,
    `  Mortgage: ${ops.costs.monthlyMortgage} | Maintenance: ${(ops.costs.maintenance / 12).toFixed(3)}`,
    `  Salaries: ${ops.costs.crewSalaries} | Life Support: ${ops.costs.lifeSupport}`,
    `  Fuel/jump: ${ops.costs.fuel} | Port: ${ops.costs.portFees}`,
    `  TOTAL: ${ops.costs.totalMonthly}`,
    ``,
    `ANNUAL OPERATING COSTS (MCr/year):`,
    `  Fixed: ${ops.costs.annual.fixedCosts} (M:${ops.costs.annual.mortgage} + Maint:${ops.costs.annual.maintenance} + Sal:${ops.costs.annual.crewSalaries} + LS:${ops.costs.annual.lifeSupport})`,
    `  Variable @12j/y: ${ops.costs.annual.variableAt12} | @24j/y: ${ops.costs.annual.variableAt24} | @36j/y: ${ops.costs.annual.variableAt36}`,
    `  TOTAL @12j/y: ${ops.costs.annual.totalAt12} | @24j/y: ${ops.costs.annual.totalAt24} | @36j/y: ${ops.costs.annual.totalAt36}`,
    '',
    `REVENUE POTENTIAL (MCr/jump @ ${ops.jumpRange}pc):`,
    `  Passengers: H${ops.revenue.highPassengers}/M${ops.revenue.midPassengers}/L${ops.revenue.lowPassengers} = ${ops.revenue.passengerRevenue}`,
    `  Freight: ${ops.revenue.freightDtons}DT = ${ops.revenue.freightRevenue}`,
    `  Mail: ${ops.revenue.mailContracts} | TOTAL: ${ops.revenue.totalRevenue}`,
    '',
    `LIFE SUPPORT:`,
    `  Staterooms: ${ops.lifeSupport.staterooms} | Low Berths: ${ops.lifeSupport.lowBerths}`,
    `  Standard capacity: ${ops.lifeSupport.standardCapacity} people`,
    `  Duration: ${ops.lifeSupport.durationWeeks} weeks`,
    '',
    `ESCAPE SYSTEMS:`,
    `  Life Pods: ${ops.escapeSystems.lifePods} | Escape Pods: ${ops.escapeSystems.escapePods}`,
    `  Life Boats: ${ops.escapeSystems.lifeBoats} | Total capacity: ${ops.escapeSystems.totalCapacity}`,
    '',
    `PERFORMANCE:`,
    `  Jump range: ${ops.jumpRange} parsecs | Endurance: ${ops.endurance} weeks`,
    `  Annual overhaul: ${ops.annualOverhaul} weeks`,
  ];
  return lines.join('\n');
}
