#!/usr/bin/env node
/**
 * Audit all example ships by simulating loadShip → saveShip round-trip.
 * Reports data loss, type errors, and schema violations.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const shipsPath = resolve(process.cwd(), 'public/data/all_ships.json');
const ships = JSON.parse(readFileSync(shipsPath, 'utf8'));

console.log(`Loaded ${ships.length} ships from all_ships.json\n`);

const errors = [];
const warnings = [];

function recordError(ship, category, message, detail = null) {
  errors.push({ ship: ship.name || ship.id, id: ship.id, category, message, detail });
}

function recordWarning(ship, category, message, detail = null) {
  warnings.push({ ship: ship.name || ship.id, id: ship.id, category, message, detail });
}

// ─── Schema Validation ───

function validateSchema(ship, index) {
  const prefix = `[${index + 1}/${ships.length}] ${ship.name || ship.id}`;

  // Required fields
  const required = ['id', 'name', 'tl', 'hullCode', 'hullDtons', 'configuration', 'armor', 'modules', 'cargo', 'crew', 'components', 'totalCost', 'availableDtons', 'createdAt'];
  for (const field of required) {
    if (ship[field] === undefined || ship[field] === null) {
      recordError(ship, 'MISSING_REQUIRED_FIELD', `Missing required field: ${field}`);
    }
  }

  // Type checks
  if (typeof ship.tl !== 'number') recordError(ship, 'TYPE_ERROR', `tl should be number, got ${typeof ship.tl}: ${ship.tl}`);
  if (typeof ship.hullDtons !== 'number') recordError(ship, 'TYPE_ERROR', `hullDtons should be number, got ${typeof ship.hullDtons}: ${ship.hullDtons}`);
  if (typeof ship.cargo !== 'number') recordError(ship, 'TYPE_ERROR', `cargo should be number, got ${typeof ship.cargo}: ${ship.cargo}`);
  if (typeof ship.totalCost !== 'number') recordError(ship, 'TYPE_ERROR', `totalCost should be number, got ${typeof ship.totalCost}: ${ship.totalCost}`);
  if (typeof ship.availableDtons !== 'number') recordError(ship, 'TYPE_ERROR', `availableDtons should be number, got ${typeof ship.availableDtons}: ${ship.availableDtons}`);
  if (!Array.isArray(ship.modules)) recordError(ship, 'TYPE_ERROR', `modules should be array, got ${typeof ship.modules}`);
  if (!Array.isArray(ship.crew)) recordError(ship, 'TYPE_ERROR', `crew should be array, got ${typeof ship.crew}`);
  if (!Array.isArray(ship.components)) recordError(ship, 'TYPE_ERROR', `components should be array, got ${typeof ship.components}`);

  // Child table type checks
  const childTables = [
    { key: 'drives', name: 'drives' },
    { key: 'commandControl', name: 'commandControl' },
    { key: 'computers', name: 'computers' },
    { key: 'softwareList', name: 'softwareList' },
    { key: 'sensorList', name: 'sensorList' },
    { key: 'lifeSupport', name: 'lifeSupport' },
    { key: 'weaponMounts', name: 'weaponMounts' },
    { key: 'supplies', name: 'supplies' },
  ];
  for (const { key, name } of childTables) {
    if (ship[key] !== undefined && !Array.isArray(ship[key])) {
      recordError(ship, 'TYPE_ERROR', `${name} should be array if present, got ${typeof ship[key]}`);
    }
  }

  // Drive type checks
  if (ship.drives) {
    for (const d of ship.drives) {
      if (!d.type) recordError(ship, 'DRIVE_MISSING_TYPE', `Drive missing type: ${JSON.stringify(d)}`);
      if (!['thrust', 'jump', 'powerPlant'].includes(d.type)) {
        recordError(ship, 'DRIVE_INVALID_TYPE', `Drive has invalid type: ${d.type}`);
      }
    }
  }

  // Software type check
  if (ship.software !== undefined && !Array.isArray(ship.software)) {
    recordError(ship, 'TYPE_ERROR', `software should be array if present, got ${typeof ship.software}`);
  }

  // Weapons type check
  if (ship.weapons !== undefined && !Array.isArray(ship.weapons)) {
    recordError(ship, 'TYPE_ERROR', `weapons should be array if present, got ${typeof ship.weapons}`);
  }
}

// ─── Simulate loadShip → saveShip Round-Trip ───

function simulateRoundTrip(original) {
  // Simulate loadShip: extract child tables and DERIVE flat fields from drives
  const driveRows = original.drives || [];
  const firstThrust = driveRows.find(d => d.type === 'thrust');
  const firstJump = driveRows.find(d => d.type === 'jump');
  const firstPower = driveRows.find(d => d.type === 'powerPlant');
  const state = {
    name: original.name,
    tl: original.tl,
    hullCode: original.hullCode,
    hullDtons: original.hullDtons,
    configuration: original.configuration,
    armor: original.armor,
    armorQty: original.armorQty || 1,
    mDrive: firstThrust?.driveCode || firstThrust?.name || original.mDrive || '',
    jDrive: firstJump?.driveCode || firstJump?.name || original.jDrive || '',
    powerPlant: firstPower?.driveCode || firstPower?.name || original.powerPlant || '',
    bridge: original.bridge || '',
    computer: original.computer || '',
    software: original.software || [],
    sensors: original.sensors || '',
    staterooms: original.staterooms || 0,
    lowBerths: original.lowBerths || 0,
    cargo: original.cargo ?? 0,
    drives: original.drives || [],
    commandControl: original.commandControl || [],
    computers: original.computers || [],
    softwareList: original.softwareList || [],
    sensorList: original.sensorList || [],
    lifeSupport: original.lifeSupport || [],
    weaponMounts: original.weaponMounts || [],
    supplies: original.supplies || [],
    modules: original.modules || [],
    weapons: original.weapons || [],
  };

  // Simulate saveShip: reconstruct ShipDesign from state
  const reconstructed = {
    id: original.id,
    name: state.name,
    tl: state.tl,
    hullCode: state.hullCode,
    hullDtons: state.hullDtons,
    configuration: state.configuration,
    armor: state.armor,
    armorQty: state.armorQty,
    mDrive: state.mDrive,
    jDrive: state.jDrive,
    powerPlant: state.powerPlant,
    bridge: state.bridge,
    computer: state.computer,
    software: state.software,
    sensors: state.sensors,
    staterooms: state.staterooms,
    lowBerths: state.lowBerths,
    crew: [],
    drives: [
      ...state.drives.filter(d => d.type === 'thrust').map((r, i) => ({ ...r, type: 'thrust', driveCode: r.name, order: r.order ?? i })),
      ...state.drives.filter(d => d.type === 'jump').map((r, i) => ({ ...r, type: 'jump', driveCode: r.name, order: r.order ?? i + 1000 })),
      ...state.drives.filter(d => d.type === 'powerPlant').map((r, i) => ({ ...r, type: 'powerPlant', driveCode: r.name, order: r.order ?? i + 2000 })),
    ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    commandControl: state.commandControl,
    computers: state.computers,
    softwareList: state.softwareList,
    sensorList: state.sensorList,
    lifeSupport: state.lifeSupport,
    weaponMounts: state.weaponMounts,
    supplies: state.supplies,
    modules: state.modules,
    weapons: state.weapons,
    cargo: state.cargo,
    components: original.components,
    totalCost: original.totalCost,
    availableDtons: original.availableDtons,
    createdAt: original.createdAt,
  };

  return reconstructed;
}

function compareRoundTrip(original, reconstructed, index) {
  const prefix = `[${index + 1}/${ships.length}] ${original.name || original.id}`;

  // Compare child tables item counts
  const childTables = [
    { key: 'drives', label: 'drives' },
    { key: 'commandControl', label: 'commandControl' },
    { key: 'computers', label: 'computers' },
    { key: 'softwareList', label: 'softwareList' },
    { key: 'sensorList', label: 'sensorList' },
    { key: 'lifeSupport', label: 'lifeSupport' },
    { key: 'weaponMounts', label: 'weaponMounts' },
    { key: 'supplies', label: 'supplies' },
  ];

  for (const { key, label } of childTables) {
    const origLen = (original[key] || []).length;
    const reconLen = (reconstructed[key] || []).length;
    if (origLen !== reconLen) {
      recordError(original, 'ROUNDTRIP_COUNT_MISMATCH', `${label}: original=${origLen}, reconstructed=${reconLen}`);
    }
  }

  // Compare drives in detail (order-sensitive)
  if (original.drives && reconstructed.drives) {
    if (original.drives.length !== reconstructed.drives.length) {
      recordError(original, 'ROUNDTRIP_DRIVE_COUNT', `Drives: original=${original.drives.length}, reconstructed=${reconstructed.drives.length}`);
    }
    // Sort both by order for comparison (saveShip sorts by order)
    const origSorted = [...original.drives].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const reconSorted = [...reconstructed.drives].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (let i = 0; i < Math.min(origSorted.length, reconSorted.length); i++) {
      const od = origSorted[i];
      const rd = reconSorted[i];
      if (od.name !== rd.name) {
        recordWarning(original, 'ROUNDTRIP_DRIVE_NAME', `Drive[${i}].name changed: "${od.name}" → "${rd.name}"`);
      }
      if (od.type !== rd.type) {
        recordError(original, 'ROUNDTRIP_DRIVE_TYPE', `Drive[${i}].type changed: "${od.type}" → "${rd.type}"`);
      }
      if ((od.dtons || 0) !== (rd.dtons || 0)) {
        recordWarning(original, 'ROUNDTRIP_DRIVE_DTONS', `Drive[${i}].dtons changed: ${od.dtons} → ${rd.dtons}`);
      }
      if ((od.order ?? 0) !== (rd.order ?? 0)) {
        recordError(original, 'ROUNDTRIP_DRIVE_ORDER', `Drive[${i}].order changed: ${od.order} → ${rd.order}`);
      }
    }
  }

  // Compare flat fields vs first drive of each type
  const firstThrust = (original.drives || []).find(d => d.type === 'thrust');
  const firstJump = (original.drives || []).find(d => d.type === 'jump');
  const firstPower = (original.drives || []).find(d => d.type === 'powerPlant');
  if (original.mDrive && firstThrust && original.mDrive !== firstThrust.driveCode && original.mDrive !== firstThrust.name) {
    recordWarning(original, 'FLAT_FIELD_MISMATCH', `mDrive "${original.mDrive}" does not match first thrust drive "${firstThrust.driveCode || firstThrust.name}"`);
  }
  if (original.jDrive && firstJump && original.jDrive !== firstJump.driveCode && original.jDrive !== firstJump.name) {
    recordWarning(original, 'FLAT_FIELD_MISMATCH', `jDrive "${original.jDrive}" does not match first jump drive "${firstJump.driveCode || firstJump.name}"`);
  }
  if (original.powerPlant && firstPower && original.powerPlant !== firstPower.driveCode && original.powerPlant !== firstPower.name) {
    recordWarning(original, 'FLAT_FIELD_MISMATCH', `powerPlant "${original.powerPlant}" does not match first powerPlant "${firstPower.driveCode || firstPower.name}"`);
  }

  // Compare legacy flat fields (derive from drives, so may change intentionally)
  const flatFields = ['bridge', 'computer', 'sensors', 'staterooms', 'lowBerths', 'cargo'];
  for (const field of flatFields) {
    const o = original[field];
    const r = reconstructed[field];
    if (o !== r) {
      recordWarning(original, 'ROUNDTRIP_FIELD_CHANGED', `${field}: original=${JSON.stringify(o)}, reconstructed=${JSON.stringify(r)}`);
    }
  }
  // mDrive/jDrive/powerPlant are now derived from drives — expect them to sync
  const derivedFlat = ['mDrive', 'jDrive', 'powerPlant'];
  for (const field of derivedFlat) {
    const o = original[field];
    const r = reconstructed[field];
    if (o !== r) {
      recordWarning(original, 'ROUNDTRIP_FLAT_SYNC', `${field}: original=${JSON.stringify(o)}, reconstructed=${JSON.stringify(r)} (derived from drives)`);
    }
  }

  // Compare arrays
  if (JSON.stringify(original.software || []) !== JSON.stringify(reconstructed.software || [])) {
    recordWarning(original, 'ROUNDTRIP_SOFTWARE_CHANGED', `software array changed`);
  }
  if (JSON.stringify(original.modules || []) !== JSON.stringify(reconstructed.modules || [])) {
    recordWarning(original, 'ROUNDTRIP_MODULES_CHANGED', `modules array changed`);
  }
  if (JSON.stringify(original.weapons || []) !== JSON.stringify(reconstructed.weapons || [])) {
    recordWarning(original, 'ROUNDTRIP_WEAPONS_CHANGED', `weapons array changed`);
  }
}

// ─── Run Audit ───

for (let i = 0; i < ships.length; i++) {
  const ship = ships[i];
  validateSchema(ship, i);
  const reconstructed = simulateRoundTrip(ship);
  compareRoundTrip(ship, reconstructed, i);
}

// ─── Report ───

console.log('='.repeat(70));
console.log('AUDIT REPORT');
console.log('='.repeat(70));
console.log(`\nTotal ships audited: ${ships.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}\n`);

if (errors.length > 0) {
  console.log('─'.repeat(70));
  console.log('ERRORS');
  console.log('─'.repeat(70));
  const byCategory = {};
  for (const e of errors) {
    byCategory[e.category] = byCategory[e.category] || [];
    byCategory[e.category].push(e);
  }
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`\n## ${cat} (${items.length})`);
    for (const item of items) {
      console.log(`  [${item.ship}] ${item.message}`);
      if (item.detail) console.log(`    Detail: ${JSON.stringify(item.detail)}`);
    }
  }
}

if (warnings.length > 0) {
  console.log('\n' + '─'.repeat(70));
  console.log('WARNINGS');
  console.log('─'.repeat(70));
  const byCategory = {};
  for (const w of warnings) {
    byCategory[w.category] = byCategory[w.category] || [];
    byCategory[w.category].push(w);
  }
  for (const [cat, items] of Object.entries(byCategory)) {
    console.log(`\n## ${cat} (${items.length})`);
    for (const item of items) {
      console.log(`  [${item.ship}] ${item.message}`);
      if (item.detail) console.log(`    Detail: ${JSON.stringify(item.detail)}`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('Ships with errors:', [...new Set(errors.map(e => e.ship))].length);
console.log('Ships with warnings:', [...new Set(warnings.map(w => w.ship))].length);
console.log('Ships clean:', ships.length - [...new Set([...errors, ...warnings].map(x => x.ship))].length);
console.log('='.repeat(70));

// Write detailed JSON report
const reportPath = resolve(process.cwd(), 'scripts/ship-audit-report.json');
import { writeFileSync } from 'fs';
writeFileSync(reportPath, JSON.stringify({
  summary: {
    total: ships.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    shipsWithErrors: [...new Set(errors.map(e => e.ship))],
    shipsWithWarnings: [...new Set(warnings.map(w => w.ship))],
  },
  errors,
  warnings,
}, null, 2));
console.log(`\nDetailed report written to: ${reportPath}`);
