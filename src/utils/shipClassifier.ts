/**
 * Ship Classification Engine — Iron Triangle (S/A/P)
 *
 * Analyzes a ship's components to determine its naval role and size class.
 * Rules are loaded from public/data/ship-classifications.json (user-editable).
 */

import type { ShipDesign, ShipClassification } from '../types';

// ─── Raw JSON Types ───

interface ClassificationRules {
  version: string;
  thresholds: {
    max: number;
    high: number;
    moderate: number;
    low: number;
  };
  sizeCategories: Array<{
    id: string;
    name: string;
    minDt: number;
    maxDt: number;
  }>;
  tlShifts: Array<{
    tlMin: number;
    tlMax: number;
    multiplier: number;
  }>;
  roles: Array<{
    id: string;
    name: string;
    description: string;
    conditions: {
      s: 'max' | 'high' | 'moderate' | 'low';
      a: 'max' | 'high' | 'moderate' | 'low';
      p: 'max' | 'high' | 'moderate' | 'low';
    };
    priority: number;
  }>;
  classTable: Array<{
    roleId: string;
    sizeId: string;
    primaryName: string;
    alternateNames: string[];
  }>;
}

// ─── Default Rules (embedded fallback) ───

const DEFAULT_RULES: ClassificationRules = {
  version: '1.0',
  thresholds: { max: 0.5, high: 0.3, moderate: 0.15, low: 0.0 },
  sizeCategories: [
    { id: 'craft', name: 'Craft', minDt: 1, maxDt: 99 },
    { id: 'escort', name: 'Escort', minDt: 100, maxDt: 999 },
    { id: 'lineShip', name: 'Line Ship', minDt: 1000, maxDt: 9999 },
    { id: 'capital', name: 'Capital', minDt: 10000, maxDt: 999999 },
  ],
  tlShifts: [
    { tlMin: 9, tlMax: 10, multiplier: 1.0 },
    { tlMin: 11, tlMax: 12, multiplier: 1.5 },
    { tlMin: 13, tlMax: 14, multiplier: 2.5 },
    { tlMin: 15, tlMax: 20, multiplier: 5.0 },
  ],
  roles: [
    { id: 'brawler', name: 'Brawler', description: '', conditions: { s: 'low', a: 'max', p: 'moderate' }, priority: 1 },
    { id: 'sprinter', name: 'Sprinter', description: '', conditions: { s: 'max', a: 'low', p: 'low' }, priority: 2 },
    { id: 'hauler', name: 'Hauler', description: '', conditions: { s: 'low', a: 'low', p: 'max' }, priority: 3 },
    { id: 'striker', name: 'Striker', description: '', conditions: { s: 'high', a: 'high', p: 'low' }, priority: 4 },
    { id: 'support', name: 'Support', description: '', conditions: { s: 'moderate', a: 'low', p: 'max' }, priority: 5 },
    { id: 'vanguard', name: 'Vanguard', description: '', conditions: { s: 'moderate', a: 'moderate', p: 'moderate' }, priority: 6 },
  ],
  classTable: [
    { roleId: 'striker', sizeId: 'craft', primaryName: 'Interceptor', alternateNames: [] },
    { roleId: 'striker', sizeId: 'escort', primaryName: 'Torpedo Boat', alternateNames: [] },
    { roleId: 'striker', sizeId: 'lineShip', primaryName: 'Destroyer', alternateNames: [] },
    { roleId: 'striker', sizeId: 'capital', primaryName: 'Battlecruiser', alternateNames: [] },
    { roleId: 'brawler', sizeId: 'craft', primaryName: 'Gunboat', alternateNames: [] },
    { roleId: 'brawler', sizeId: 'escort', primaryName: 'System Defense Boat', alternateNames: [] },
    { roleId: 'brawler', sizeId: 'lineShip', primaryName: 'Heavy Frigate', alternateNames: [] },
    { roleId: 'brawler', sizeId: 'capital', primaryName: 'Battleship', alternateNames: [] },
    { roleId: 'vanguard', sizeId: 'craft', primaryName: 'Cutter', alternateNames: [] },
    { roleId: 'vanguard', sizeId: 'escort', primaryName: 'Patrol Corvette', alternateNames: [] },
    { roleId: 'vanguard', sizeId: 'lineShip', primaryName: 'Cruiser', alternateNames: [] },
    { roleId: 'vanguard', sizeId: 'capital', primaryName: 'Command Cruiser', alternateNames: [] },
    { roleId: 'sprinter', sizeId: 'craft', primaryName: 'Pinnace', alternateNames: [] },
    { roleId: 'sprinter', sizeId: 'escort', primaryName: 'Courier', alternateNames: [] },
    { roleId: 'sprinter', sizeId: 'lineShip', primaryName: 'Fast Fleet Scout', alternateNames: [] },
    { roleId: 'sprinter', sizeId: 'capital', primaryName: 'Dispatch Carrier', alternateNames: [] },
    { roleId: 'hauler', sizeId: 'craft', primaryName: 'Lighter', alternateNames: [] },
    { roleId: 'hauler', sizeId: 'escort', primaryName: 'Freighter', alternateNames: [] },
    { roleId: 'hauler', sizeId: 'lineShip', primaryName: 'Bulk Transport', alternateNames: [] },
    { roleId: 'hauler', sizeId: 'capital', primaryName: 'Superfreighter', alternateNames: [] },
    { roleId: 'support', sizeId: 'craft', primaryName: 'Assault Shuttle', alternateNames: [] },
    { roleId: 'support', sizeId: 'escort', primaryName: 'Repair Tender', alternateNames: [] },
    { roleId: 'support', sizeId: 'lineShip', primaryName: 'Light Carrier', alternateNames: [] },
    { roleId: 'support', sizeId: 'capital', primaryName: 'Fleet Carrier', alternateNames: [] },
  ],
};

let cachedRules: ClassificationRules | null = null;

export async function loadRules(fetchJson = fetch): Promise<ClassificationRules> {
  if (cachedRules) return cachedRules;
  try {
    const res = await fetchJson('/data/ship-classifications.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cachedRules = (await res.json()) as ClassificationRules;
    return cachedRules;
  } catch {
    return DEFAULT_RULES;
  }
}

export function clearRulesCache() {
  cachedRules = null;
}

// ─── Section → Pillar Mapping ───

const S_SECTIONS = new Set(['M-Drive', 'J-Drive', 'Power Plant', 'Fuel']);
const A_SECTIONS = new Set(['Weapon', 'Armor']);
const P_SECTIONS = new Set([
  'Cargo',
  'Life Support',
  'Command',
  'Computer',
  'Sensors',
  'Software',
  'Supplies',
  'VEHICLES',
  'Module',
]);

function isWeaponModule(module: string): boolean {
  const lower = module.toLowerCase();
  return lower.includes('turret') || lower.includes('bay') || lower.includes('laser')
    || lower.includes('missile') || lower.includes('sand') || lower.includes('railgun')
    || lower.includes('particle') || lower.includes('fusion');
}

// ─── Core Calculation ───

export function calculatePillars(ship: ShipDesign): { s: number; a: number; p: number } {
  let s = 0;
  let a = 0;
  let p = 0;

  // Use components array (authoritative source of tonnage)
  for (const c of ship.components || []) {
    const dt = Math.abs(c.dtons || 0);
    const section = c.section || '';

    if (S_SECTIONS.has(section)) {
      s += dt;
    } else if (A_SECTIONS.has(section)) {
      a += dt;
    } else if (P_SECTIONS.has(section)) {
      // Exclude weapon modules from payload
      if (section === 'Module' && isWeaponModule(c.module || '')) {
        a += dt;
      } else {
        p += dt;
      }
    }
  }

  // Fallback: if components array is empty but drives exist, use drives
  if (s === 0 && ship.drives) {
    for (const d of ship.drives) {
      s += Math.abs(d.dtons || 0);
    }
  }

  // Modules and weapons are stored outside components array but still count
  // toward classification tonnages.
  for (const m of ship.modules || []) {
    const dt = Math.abs(m.dtons || 0);
    if (isWeaponModule(m.module || '')) {
      a += dt;
    } else {
      p += dt;
    }
  }
  for (const w of ship.weapons || []) {
    a += Math.abs(w.dtons || 0);
  }
  for (const w of ship.weaponMounts || []) {
    a += Math.abs((w.dtons || 0) * (w.qty || 1));
  }

  // Fallback: cargo from top-level field
  if (p === 0 && (ship.cargo || 0) > 0) {
    p += ship.cargo;
  }

  return { s, a, p };
}

function levelOf(ratio: number, thresholds: ClassificationRules['thresholds']): 'max' | 'high' | 'moderate' | 'low' {
  if (ratio >= thresholds.max) return 'max';
  if (ratio >= thresholds.high) return 'high';
  if (ratio >= thresholds.moderate) return 'moderate';
  return 'low';
}

function matchesConditions(
  sLevel: string,
  aLevel: string,
  pLevel: string,
  conditions: { s: string; a: string; p: string }
): boolean {
  // Condition levels are minimums (e.g., "low" means low OR moderate OR high OR max)
  const rank = { max: 4, high: 3, moderate: 2, low: 1 };
  return (
    rank[sLevel as keyof typeof rank] >= rank[conditions.s as keyof typeof rank] &&
    rank[aLevel as keyof typeof rank] >= rank[conditions.a as keyof typeof rank] &&
    rank[pLevel as keyof typeof rank] >= rank[conditions.p as keyof typeof rank]
  );
}

function getEffectiveSize(
  hullDtons: number,
  tl: number,
  rules: ClassificationRules
): { category: ClassificationRules['sizeCategories'][number]; tlShifted: boolean } {
  // Find TL multiplier
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

  // Fallback to largest
  const last = rules.sizeCategories[rules.sizeCategories.length - 1];
  return { category: last, tlShifted: multiplier !== 1.0 };
}

// ─── Main Entry Point ───

export function classifyShip(ship: ShipDesign, rules?: ClassificationRules): ShipClassification {
  const r = rules || DEFAULT_RULES;

  const { s, a, p } = calculatePillars(ship);
  const total = s + a + p;

  if (total === 0) {
    // Default: Vanguard of appropriate size
    const size = getEffectiveSize(ship.hullDtons, ship.tl, r);
    const classEntry = r.classTable.find(ct => ct.roleId === 'vanguard' && ct.sizeId === size.category.id);
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

  const sLevel = levelOf(sRatio, r.thresholds);
  const aLevel = levelOf(aRatio, r.thresholds);
  const pLevel = levelOf(pRatio, r.thresholds);

  // Find matching role by priority
  const sortedRoles = [...r.roles].sort((a, b) => a.priority - b.priority);
  let role = sortedRoles.find(ro => matchesConditions(sLevel, aLevel, pLevel, ro.conditions));

  if (!role) {
    // Fallback: find closest role by Euclidean distance in ratio space
    role = sortedRoles.reduce((best, ro) => {
      const target = {
        s: r.thresholds[ro.conditions.s === 'max' ? 'max' : ro.conditions.s === 'high' ? 'high' : 'moderate'],
        a: r.thresholds[ro.conditions.a === 'max' ? 'max' : ro.conditions.a === 'high' ? 'high' : 'moderate'],
        p: r.thresholds[ro.conditions.p === 'max' ? 'max' : ro.conditions.p === 'high' ? 'high' : 'moderate'],
      };
      const distBest = Math.hypot(best ? (sRatio - r.thresholds[best.conditions.s === 'max' ? 'max' : best.conditions.s === 'high' ? 'high' : 'moderate']) : 0, best ? (aRatio - r.thresholds[best.conditions.a === 'max' ? 'max' : best.conditions.a === 'high' ? 'high' : 'moderate']) : 0, best ? (pRatio - r.thresholds[best.conditions.p === 'max' ? 'max' : best.conditions.p === 'high' ? 'high' : 'moderate']) : 0);
      const distCurr = Math.hypot(sRatio - target.s, aRatio - target.a, pRatio - target.p);
      return distCurr < distBest ? ro : best;
    }, sortedRoles[sortedRoles.length - 1]);
  }

  const size = getEffectiveSize(ship.hullDtons, ship.tl, r);
  const classEntry = r.classTable.find(ct => ct.roleId === role.id && ct.sizeId === size.category.id);

  return {
    role: role.name,
    roleId: role.id,
    sizeClass: size.category.name,
    sizeId: size.category.id,
    className: classEntry?.primaryName || 'Unknown',
    ratios: { s: parseFloat(sRatio.toFixed(3)), a: parseFloat(aRatio.toFixed(3)), p: parseFloat(pRatio.toFixed(3)) },
    tons: { s: parseFloat(s.toFixed(1)), a: parseFloat(a.toFixed(1)), p: parseFloat(p.toFixed(1)), total: parseFloat(total.toFixed(1)) },
    tlShifted: size.tlShifted,
  };
}

// ─── Convenience ───

export function getClassDisplayName(ship: ShipDesign): string {
  return ship.classification?.className || 'Unclassified';
}

export function getRoleDisplayName(ship: ShipDesign): string {
  return ship.classification?.role || 'Unknown';
}
