#!/usr/bin/env node
/**
 * Generate detailed operational specs for all ships in all_ships.json.
 * Outputs a JSON file with full operations data for each ship.
 *
 * Usage:
 *     node scripts/generate-ship-specs.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const shipsPath = resolve(process.cwd(), 'public/data/all_ships.json');
const outputPath = resolve(process.cwd(), 'public/data/all_ship_specs.json');

const ships = JSON.parse(readFileSync(shipsPath, 'utf8'));

// ─── Constants ───

const SALARIES = {
  command: 6000, pilot: 5000, navigator: 4000, engineer: 4000,
  medic: 3000, gunner: 3000, marine: 2000, steward: 1500,
  maintenance: 2500, deckCrew: 2500,
};

const PASSAGE_RATES = { high: 10000, middle: 2000, low: 500 };
const FREIGHT_RATE = 1000;
const MAIL_CONTRACT = 25000;
const LIFE_SUPPORT_COST = 2000;
const MAINTENANCE_PCT = 0.001;

// ─── Helpers ───

function extractDriveRating(code) {
  if (!code) return 1;
  const match = String(code).match(/([A-V])/i);
  if (!match) return 1;
  const ratings = {
    A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,J:9,K:10,L:11,M:12,N:13,P:14,Q:15,R:16,S:17,T:18,U:19,V:20
  };
  return ratings[match[1].toUpperCase()] || 1;
}

function calculateCrew(ship) {
  const hull = ship.hullDtons || 0;
  const drives = ship.drives || [];
  const weaponMounts = ship.weaponMounts || [];
  const weapons = ship.weapons || [];
  const staterooms = ship.staterooms || 0;
  const hasJump = drives.some(d => d.type === 'jump');

  const turretCount = weaponMounts.filter(w => w.mountType === 'turret').reduce((s, w) => s + (w.qty || 1), 0)
    + weapons.filter(w => w.module?.toLowerCase().includes('turret')).reduce((s, w) => s + (w.qty || 1), 0);
  const bayCount = weaponMounts.filter(w => w.mountType === 'bay').reduce((s, w) => s + (w.qty || 1), 0);

  const thrustDrive = drives.find(d => d.type === 'thrust');
  const driveRating = thrustDrive ? extractDriveRating(thrustDrive.driveCode || thrustDrive.name) : 1;

  const command = 1;
  const pilot = Math.max(1, Math.ceil(hull / 10000));
  const navigator = hasJump ? 1 : 0;
  const engineer = Math.max(1, Math.ceil(driveRating));
  const medic = staterooms > 0 ? Math.max(1, Math.floor(staterooms / 120)) : 0;
  const gunner = turretCount + Math.ceil(bayCount * 3);
  const marine = 0;
  const steward = staterooms > 0 ? Math.ceil(staterooms / 8) : 0;
  const maintenance = hull >= 1000 ? Math.ceil(hull / 1000) : 0;
  const deckCrew = weaponMounts.length > 0 ? Math.ceil(weaponMounts.length / 2) : 0;

  return {
    command, pilot, navigator, engineer, medic, gunner, marine, steward, maintenance, deckCrew,
    total: command + pilot + navigator + engineer + medic + gunner + marine + steward + maintenance + deckCrew,
  };
}

function calculateCosts(ship, crew) {
  const hullCost = ship.totalCost || 0; // in Credits
  const monthlyMortgage = hullCost / 240 / 1_000_000; // MCr
  const maintenance = hullCost * MAINTENANCE_PCT / 1_000_000; // MCr per year

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
  const lifeSupport = (crew.total * LIFE_SUPPORT_COST) / 1_000_000; // MCr
  const fuelTons = (ship.components || []).filter(c => c.section === 'Fuel').reduce((s, c) => s + (c.dtons || 0), 0);
  const fuel = fuelTons * 0.0005; // MCr per jump (500 Cr/ton)
  const portFees = (hullCost * 0.0001) / 1_000_000; // MCr
  const totalMonthly = monthlyMortgage + (maintenance / 12) + crewSalaries + lifeSupport + portFees;

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

function calculateRevenue(ship, parsecs = 1) {
  const staterooms = ship.staterooms || 0;
  const lowBerths = ship.lowBerths || 0;
  const cargo = ship.cargo || 0;

  const highPassengers = Math.floor(staterooms * 0.2);
  const midPassengers = Math.floor(staterooms * 0.8);
  const lowPassengers = lowBerths;

  const passengerRevenue =
    (highPassengers * PASSAGE_RATES.high * parsecs) +
    (midPassengers * PASSAGE_RATES.middle * parsecs) +
    (lowPassengers * PASSAGE_RATES.low * parsecs);

  const freightDtons = cargo;
  const freightRevenue = freightDtons * FREIGHT_RATE * parsecs;

  const isArmed = (ship.weapons || []).length > 0 || (ship.weaponMounts || []).length > 0;
  const mailContracts = (isArmed && freightDtons >= 10) ? MAIL_CONTRACT * parsecs : 0;

  return {
    highPassengers, midPassengers, lowPassengers,
    passengerRevenue: parseFloat((passengerRevenue / 1000000).toFixed(3)),
    freightDtons,
    freightRevenue: parseFloat((freightRevenue / 1000000).toFixed(3)),
    mailContracts: parseFloat((mailContracts / 1000000).toFixed(3)),
    totalRevenue: parseFloat(((passengerRevenue + freightRevenue + mailContracts) / 1000000).toFixed(3)),
  };
}

function calculateLifeSupport(ship) {
  const staterooms = ship.staterooms || 0;
  const lowBerths = ship.lowBerths || 0;
  const lifeSupportTons = (ship.components || [])
    .filter(c => c.section === 'Supplies' && c.module?.toLowerCase().includes('life support'))
    .reduce((s, c) => s + (c.dtons || 0), 0);

  const standardCapacity = staterooms;
  const emergencyCapacity = staterooms * 2;
  const durationWeeks = lifeSupportTons > 0 ? Math.floor((lifeSupportTons * 20) / Math.max(1, standardCapacity)) * 4 : 0;

  return { staterooms, lowBerths, standardCapacity, emergencyCapacity, durationWeeks, lifeSupportTons: parseFloat(lifeSupportTons.toFixed(1)) };
}

function calculateEscape(ship, crew) {
  const totalPersonnel = crew.total + (ship.staterooms || 0);
  const lifePods = Math.ceil(totalPersonnel / 4);
  const lifeBoats = (ship.components || []).filter(c => c.module?.toLowerCase().includes('life boat')).reduce((s, c) => s + (c.qty || 1), 0);
  const escapePods = (ship.components || []).filter(c => c.module?.toLowerCase().includes('escape pod')).reduce((s, c) => s + (c.qty || 1), 0);
  const totalCapacity = lifePods * 4 + lifeBoats * 10 + escapePods;
  return { lifePods, escapePods, lifeBoats, totalCapacity };
}

function calculatePerformance(ship) {
  const jumpDrive = (ship.drives || []).find(d => d.type === 'jump');
  let jumpRange = 1;
  if (jumpDrive) {
    jumpRange = extractDriveRating(jumpDrive.driveCode || jumpDrive.name);
  }
  const fuelTons = (ship.components || []).filter(c => c.section === 'Fuel').reduce((s, c) => s + (c.dtons || 0), 0);
  const powerFuel = (ship.drives || []).filter(d => d.type === 'powerPlant').reduce((s, d) => s + (d.dtons || 0), 0);
  const weeklyBurn = Math.max(1, powerFuel * 0.1);
  const endurance = fuelTons > 0 ? Math.floor(fuelTons / weeklyBurn) : 0;
  return { jumpRange, endurance };
}

// ─── Generate specs for all ships ───

console.log(`Generating operational specs for ${ships.length} ships...\n`);

const specs = [];

for (const ship of ships) {
  const crew = calculateCrew(ship);
  const costs = calculateCosts(ship, crew);
  const revenue = calculateRevenue(ship);
  const lifeSupport = calculateLifeSupport(ship);
  const escapeSystems = calculateEscape(ship, crew);
  const { jumpRange, endurance } = calculatePerformance(ship);

  const operations = {
    crew,
    costs,
    revenue,
    lifeSupport,
    escapeSystems,
    jumpRange,
    endurance,
    annualOverhaul: 2,
  };

  ship.operations = operations;
  specs.push({
    id: ship.id,
    name: ship.name,
    classification: ship.classification,
    operations,
  });

  console.log(`${ship.name.padEnd(45)} | Crew:${String(crew.total).padStart(3)} | Cost:${String(costs.totalMonthly).padStart(6)}M | Rev:${String(revenue.totalRevenue).padStart(6)}M | Jump:${jumpRange}pc | End:${endurance}wk`);
}

// Write back to all_ships.json with operations
writeFileSync(shipsPath, JSON.stringify(ships, null, 2));

// Write specs summary
writeFileSync(outputPath, JSON.stringify(specs, null, 2));

console.log(`\n${'='.repeat(70)}`);
console.log(`Generated operations for ${specs.length} ships`);
console.log(`Updated: ${shipsPath}`);
console.log(`Specs summary: ${outputPath}`);
console.log('='.repeat(70));
