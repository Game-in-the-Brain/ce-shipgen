#!/usr/bin/env node
/**
 * Classify all ships in public/data/all_ships.json using the Iron Triangle.
 * Updates each ship with a `classification` block and writes back.
 *
 * Usage:
 *     node scripts/classify-ships.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const shipsPath = resolve(process.cwd(), 'public/data/all_ships.json');
const rulesPath = resolve(process.cwd(), 'public/data/ship-classifications.json');

const ships = JSON.parse(readFileSync(shipsPath, 'utf8'));
const rules = JSON.parse(readFileSync(rulesPath, 'utf8'));

// ─── Section → Pillar Mapping ───

const S_SECTIONS = new Set(['M-Drive', 'J-Drive', 'Power Plant', 'Fuel']);
const A_SECTIONS = new Set(['Weapon', 'Armor']);
const P_SECTIONS = new Set([
  'Cargo', 'Life Support', 'Command', 'Computer', 'Sensors',
  'Software', 'Supplies', 'VEHICLES', 'Module'
]);

function isWeaponModule(module) {
  const lower = (module || '').toLowerCase();
  return lower.includes('turret') || lower.includes('bay') || lower.includes('laser')
    || lower.includes('missile') || lower.includes('sand') || lower.includes('railgun')
    || lower.includes('particle') || lower.includes('fusion');
}

function calculatePillars(ship) {
  let s = 0, a = 0, p = 0;
  for (const c of ship.components || []) {
    const dt = Math.abs(c.dtons || 0);
    const section = c.section || '';
    if (S_SECTIONS.has(section)) s += dt;
    else if (A_SECTIONS.has(section)) a += dt;
    else if (P_SECTIONS.has(section)) {
      if (section === 'Module' && isWeaponModule(c.module)) a += dt;
      else p += dt;
    }
  }
  if (s === 0 && ship.drives) {
    for (const d of ship.drives) s += Math.abs(d.dtons || 0);
  }
  if (p === 0 && (ship.cargo || 0) > 0) p += ship.cargo;
  return { s, a, p };
}

function levelOf(ratio, thresholds) {
  if (ratio >= thresholds.max) return 'max';
  if (ratio >= thresholds.high) return 'high';
  if (ratio >= thresholds.moderate) return 'moderate';
  return 'low';
}

function matchesConditions(sLevel, aLevel, pLevel, conditions) {
  const rank = { max: 4, high: 3, moderate: 2, low: 1 };
  return (
    rank[sLevel] >= rank[conditions.s] &&
    rank[aLevel] >= rank[conditions.a] &&
    rank[pLevel] >= rank[conditions.p]
  );
}

function getEffectiveSize(hullDtons, tl, rules) {
  let multiplier = 1.0;
  for (const shift of rules.tlShifts) {
    if (tl >= shift.tlMin && tl <= shift.tlMax) {
      multiplier = shift.multiplier;
      break;
    }
  }
  const effectiveDt = hullDtons / multiplier;
  for (const cat of rules.sizeCategories) {
    if (effectiveDt >= cat.minDt && effectiveDt <= cat.maxDt) {
      return { category: cat, tlShifted: multiplier !== 1.0 };
    }
  }
  const last = rules.sizeCategories[rules.sizeCategories.length - 1];
  return { category: last, tlShifted: multiplier !== 1.0 };
}

function classifyShip(ship, rules) {
  const { s, a, p } = calculatePillars(ship);
  const total = s + a + p;

  if (total === 0) {
    const size = getEffectiveSize(ship.hullDtons, ship.tl, rules);
    const classEntry = rules.classTable.find(ct => ct.roleId === 'vanguard' && ct.sizeId === size.category.id);
    return {
      role: 'Vanguard',
      roleId: 'vanguard',
      sizeClass: size.category.name,
      sizeId: size.category.id,
      className: classEntry?.primaryName || 'Unknown',
      ratios: { s: 0, a: 0, p: 0 },
      tons: { s: 0, a: 0, p: 0, total: 0 },
      tlShifted: size.tlShifted,
    };
  }

  const sRatio = s / total;
  const aRatio = a / total;
  const pRatio = p / total;

  const sLevel = levelOf(sRatio, rules.thresholds);
  const aLevel = levelOf(aRatio, rules.thresholds);
  const pLevel = levelOf(pRatio, rules.thresholds);

  const sortedRoles = [...rules.roles].sort((a, b) => a.priority - b.priority);
  let role = sortedRoles.find(ro => matchesConditions(sLevel, aLevel, pLevel, ro.conditions));

  if (!role) {
    // Fallback to closest by priority (last = vanguard)
    role = sortedRoles[sortedRoles.length - 1];
  }

  const size = getEffectiveSize(ship.hullDtons, ship.tl, rules);
  const classEntry = rules.classTable.find(ct => ct.roleId === role.id && ct.sizeId === size.category.id);

  return {
    role: role.name,
    roleId: role.id,
    sizeClass: size.category.name,
    sizeId: size.category.id,
    className: classEntry?.primaryName || 'Unknown',
    ratios: {
      s: parseFloat(sRatio.toFixed(3)),
      a: parseFloat(aRatio.toFixed(3)),
      p: parseFloat(pRatio.toFixed(3)),
    },
    tons: {
      s: parseFloat(s.toFixed(1)),
      a: parseFloat(a.toFixed(1)),
      p: parseFloat(p.toFixed(1)),
      total: parseFloat(total.toFixed(1)),
    },
    tlShifted: size.tlShifted,
  };
}

// ─── Run Classification ───

console.log(`Classifying ${ships.length} ships...\n`);

const summary = { roleCounts: {}, sizeCounts: {}, classCounts: {} };

for (const ship of ships) {
  const classification = classifyShip(ship, rules);
  ship.classification = classification;

  summary.roleCounts[classification.role] = (summary.roleCounts[classification.role] || 0) + 1;
  summary.sizeCounts[classification.sizeClass] = (summary.sizeCounts[classification.sizeClass] || 0) + 1;
  summary.classCounts[classification.className] = (summary.classCounts[classification.className] || 0) + 1;

  console.log(
    `${ship.name.padEnd(45)} | ${String(ship.hullDtons).padStart(5)}DT | ` +
    `S:${(classification.ratios.s * 100).toFixed(0).padStart(3)}% ` +
    `A:${(classification.ratios.a * 100).toFixed(0).padStart(3)}% ` +
    `P:${(classification.ratios.p * 100).toFixed(0).padStart(3)}% | ` +
    `${classification.role.padEnd(10)} | ${classification.className}`
  );
}

writeFileSync(shipsPath, JSON.stringify(ships, null, 2));

console.log(`\n${'='.repeat(70)}`);
console.log('CLASSIFICATION SUMMARY');
console.log('='.repeat(70));
console.log('\nBy Role:');
for (const [role, count] of Object.entries(summary.roleCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${role.padEnd(12)}: ${count}`);
}
console.log('\nBy Size Class:');
for (const [size, count] of Object.entries(summary.sizeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${size.padEnd(12)}: ${count}`);
}
console.log('\nBy Class Name:');
for (const [cls, count] of Object.entries(summary.classCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cls.padEnd(24)}: ${count}`);
}
console.log(`\nUpdated ${shipsPath}`);
