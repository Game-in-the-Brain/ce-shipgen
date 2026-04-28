// Pure ship-design math. No React, no DOM. Safe to call anywhere.

import {
  HULLS, CONFIGS, ARMOR, MDRIVES, JDRIVES, POWER, BRIDGES, COMPUTERS,
  type ShipSpec, type Hull, type Config, type Armor, type MDrive,
  type JDrive, type Power, type Bridge, type Computer,
} from './data';

export interface BoqItem {
  kind: string;
  label: string;
  dt: number;
  cost: number;
}

export interface ShipTotals {
  dt: number;
  cost: number;
  available: number;
  hullDt: number;
  crew: number;
  cargo: number;
  hp: number;
  sp: number;
  thrust: number;
  jump: number;
  monthlyOps: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakEvenMonths: number;
}

export interface ComputedShip {
  hull:    Hull | null;
  config:  Config | undefined;
  armor:   Armor | null;
  md:      MDrive | null;
  jd:      JDrive | null;
  pp:      Power | null;
  br:      Bridge | undefined;
  cm:      Computer | undefined;
  items:   BoqItem[];
  totals:  ShipTotals;
}

const EMPTY_TOTALS: ShipTotals = {
  dt: 0, cost: 0, available: 0, hullDt: 0, crew: 0, cargo: 0,
  hp: 0, sp: 0, thrust: 0, jump: 0,
  monthlyOps: 0, monthlyRevenue: 0, monthlyProfit: 0, breakEvenMonths: Infinity,
};

export function computeShip(s: ShipSpec): ComputedShip {
  const hull   = HULLS.find(h => h.code === s.hull) ?? null;
  const config = CONFIGS.find(c => c.id === s.config);
  const armor  = s.armor  ? ARMOR.find(a => a.id === s.armor) ?? null : null;
  const md     = s.mdrive ? MDRIVES.find(d => d.code === s.mdrive) ?? null : null;
  const jd     = s.jdrive ? JDRIVES.find(d => d.code === s.jdrive) ?? null : null;
  const pp     = s.power  ? POWER.find(p => p.code === s.power) ?? null : null;
  const br     = BRIDGES.find(b => b.id === s.bridge);
  const cm     = COMPUTERS.find(c => c.id === s.computer);

  if (!hull) {
    return { hull: null, config, armor, md, jd, pp, br, cm, items: [], totals: EMPTY_TOTALS };
  }

  const items: BoqItem[] = [];
  let dtUsed = 0;
  let cost = hull.cost;
  items.push({ kind: 'hull', label: `Hull ${hull.code} · ${hull.dt} DT`, dt: 0, cost: hull.cost });

  if (armor && config) {
    const aDt   = hull.dt * armor.pct * config.pct;
    const aCost = hull.cost * armor.costPct;
    dtUsed += aDt; cost += aCost;
    items.push({ kind: 'armor', label: `Armor · ${armor.label}`, dt: aDt, cost: aCost });
  }
  if (md) { dtUsed += md.dt; cost += md.cost;
    items.push({ kind: 'mdrive', label: `M-Drive ${md.code} · Thrust-${md.thrust}`, dt: md.dt, cost: md.cost }); }
  if (jd) { dtUsed += jd.dt; cost += jd.cost;
    items.push({ kind: 'jdrive', label: `J-Drive ${jd.code} · Jump-${jd.jump}`, dt: jd.dt, cost: jd.cost }); }
  if (pp) { dtUsed += pp.dt; cost += pp.cost;
    items.push({ kind: 'power', label: `Power Plant ${pp.code}`, dt: pp.dt, cost: pp.cost }); }
  if (br) { dtUsed += br.dt; cost += br.cost;
    items.push({ kind: 'bridge', label: br.label, dt: br.dt, cost: br.cost }); }
  if (cm) { dtUsed += cm.dt; cost += cm.cost;
    items.push({ kind: 'computer', label: cm.label, dt: cm.dt, cost: cm.cost }); }

  // Fuel: jump fuel + 4 weeks PP
  const fuel = (jd ? hull.dt * 0.10 * jd.jump : 0) + (pp ? pp.dt * 0.5 : 0);
  if (fuel > 0) {
    dtUsed += fuel;
    items.push({ kind: 'fuel', label: 'Fuel', dt: fuel, cost: 0 });
  }

  const crew  = (br?.crew || 0) + (md ? 1 : 0) + (jd ? 1 : 0) + (pp ? 1 : 0);
  const cargo = Math.max(0, hull.dt - dtUsed);

  // Operating economics — Traveller-ish.
  // Tune these constants to taste.
  const monthlyMaint   = cost * 0.001;            // 0.1% per month
  const crewSalary     = crew * 0.005;            // ~5 KCr / crew / month
  const monthlyLife    = (br?.crew || 0) * 0.002;
  const monthlyOps     = monthlyMaint + crewSalary + monthlyLife;
  const monthlyRevenue = cargo * 0.001 * 4 * (jd?.jump || 0);  // 4 jumps/mo at 1 Cr/DT/parsec
  const monthlyProfit  = monthlyRevenue - monthlyOps;
  const breakEvenMonths = monthlyProfit > 0 ? cost / monthlyProfit : Infinity;

  return {
    hull, config, armor, md, jd, pp, br, cm, items,
    totals: {
      dt: dtUsed,
      cost,
      available: hull.dt - dtUsed,
      hullDt: hull.dt,
      crew,
      cargo,
      hp: hull.hp,
      sp: hull.sp,
      thrust: md?.thrust || 0,
      jump: jd?.jump || 0,
      monthlyOps,
      monthlyRevenue,
      monthlyProfit,
      breakEvenMonths,
    },
  };
}
