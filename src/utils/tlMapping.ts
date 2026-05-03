/**
 * CE TL ↔ Mneme MTL mapping
 *
 * Source: "Under Heaven Tech Levels - Game in the Brain Wiki" (PDF)
 *   CE TL (Cepheus Engine) — decimal system (0.0–11.0) used in the Under Heaven setting
 *   Mneme TL (MTL) — integer system (0–18) for quick reference
 *
 * Standard Cepheus Engine uses integer TL 7–15.  This module maps those integers
 * to the Under Heaven dual-TL system and provides year/era interpolation for
 * fractional MTL values (0.1 increments ≈ 5–10 years depending on era).
 */

export interface TLEra {
  mtl: number;      // Mneme TL (integer anchor)
  ceTL: number;     // Cepheus Engine TL (decimal)
  year: number;     // Common Era year
  heYear: number;   // Holocene Era year (CE + 10,000)
  name: string;
  keyTech: string[];
}

/** Exact anchor points from the Under Heaven Tech Levels PDF */
export const TL_ERAS: TLEra[] = [
  {
    mtl: 0, ceTL: 0.0, year: -10000, heYear: 1,
    name: "Neolithic Revolution",
    keyTech: ["Agriculture", "Organised society", "Proto-cities", "Animal husbandry"],
  },
  {
    mtl: 1, ceTL: 1.0, year: -5000, heYear: 5001,
    name: "Bronze Age",
    keyTech: ["Metalworking", "City-states", "Writing", "Specialised labour", "Trade networks"],
  },
  {
    mtl: 2, ceTL: 1.3, year: -500, heYear: 9501,
    name: "Axial Age",
    keyTech: ["Iron", "Philosophy", "Empire", "Great philosophical traditions"],
  },
  {
    mtl: 3, ceTL: 1.7, year: 0, heYear: 10001,
    name: "Imperial Era",
    keyTech: ["Roads", "Legions", "Trade routes", "Classical empires"],
  },
  {
    mtl: 4, ceTL: 2.0, year: 1500, heYear: 11500,
    name: "Enlightenment",
    keyTech: ["Printing", "Global navigation", "Scientific method", "Exploration"],
  },
  {
    mtl: 5, ceTL: 3.0, year: 1800, heYear: 11800,
    name: "Industrial Revolution",
    keyTech: ["Steam", "Mass production", "Factory system", "Fossil fuel economy"],
  },
  {
    mtl: 6, ceTL: 4.0, year: 1900, heYear: 11900,
    name: "Technological Revolution",
    keyTech: ["Plastics", "Radio", "Internal combustion", "Modern industrial world"],
  },
  {
    mtl: 6.5, ceTL: 5.0, year: 1920, heYear: 11920,
    name: "Age of Electrical Energy",
    keyTech: ["Electrification", "Telecommunications", "Mass communication"],
  },
  {
    mtl: 7, ceTL: 6.0, year: 1950, heYear: 11950,
    name: "Early Atomic & Space Age",
    keyTech: ["Fission", "Jet travel", "Television", "Orbital rockets", "Radar", "Electronic computers"],
  },
  {
    mtl: 8, ceTL: 6.5, year: 2000, heYear: 12000,
    name: "Information Age",
    keyTech: ["Internet", "GPS", "Commercial space", "Electric vehicles", "Drones", "Cellphones"],
  },
  {
    mtl: 9, ceTL: 7.0, year: 2050, heYear: 12050,
    name: "New Space Race / Space Industrialisation",
    keyTech: [
      "Reliable orbit access", "Companion AI", "Graphene fibre", "Orbital manufacturing",
      "Lunar colonisation", "Xeno-surrogacy", "Human gene-engineering", "Early fusion reactors",
    ],
  },
  {
    mtl: 10, ceTL: 8.0, year: 2100, heYear: 12100,
    name: "Cis-Lunar Development",
    keyTech: [
      "Skyhook networks", "Lagrange manufacturing", "Lunar Frontier Economy",
      "Voidborn colonisation", "Combined Cis-Lunar GDP > any Earth nation",
      "Permanent space stations with artificial gravity",
    ],
  },
  {
    mtl: 11, ceTL: 8.5, year: 2200, heYear: 12200,
    name: "Interplanetary Settlement & Jovian Colonisation",
    keyTech: [
      "Space economy surpasses Earth", "Jupiter colonisation (CNT)", "Jovian Variant humans",
      "Prolific space elevators", "Gigaton-scale structures", "City space habitats",
      "High endurance vessels", "Solar swarms",
    ],
  },
  {
    mtl: 12, ceTL: 9.0, year: 2300, heYear: 12300,
    name: "Post-Earth Dependence",
    keyTech: [
      "Jump Gate (Jupiter/Sol L-point)", "Jump Drive (shipboard FTL)", "Jovian Hammers",
      "Bakunawa/Antaboga Coil (antimatter)", "Jovian economy independent of Earth",
      "Early terraforming", "Anagathics", "Full cybernetics",
    ],
  },
  {
    mtl: 13, ceTL: 9.5, year: 2400, heYear: 12400,
    name: "Outer System Development",
    keyTech: [
      "World Serpents (mobile jump infrastructure)", "Terraforming (century-scale)",
      "Great Trees (self-directed space elevators)", "Celestials (self-directed solar swarms)",
      "Colony ships jump to new stars", "Migrant swarms of millions", "Earth restoration begins",
    ],
  },
  {
    mtl: 14, ceTL: 10.0, year: 2500, heYear: 12500,
    name: "Early Interstellar Trade & Exploration",
    keyTech: [
      "Interstellar jump networks", "First contact with Divergent Humans",
      "Convergent technology exchange", "Terraforming increases Venus/Mars habitability",
      "Intense population exodus from Sol",
    ],
  },
  {
    mtl: 15, ceTL: 10.5, year: 2600, heYear: 12600,
    name: "Interstellar Colonisation",
    keyTech: [
      "100 billion+ people outside Sol", "Self-directed Spiral Ships",
      "Jovian economy keeps growing", "Megastructures proliferate",
    ],
  },
  {
    mtl: 16, ceTL: 11.0, year: 2700, heYear: 12700,
    name: "Self-Sufficient Megastructures & Swarms",
    keyTech: [
      "Serpents, Trees, Celestials become self-directed",
      "Jumping and spreading outward without human command",
      "Humanity carried by momentum of its own creations",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Year interpolation                                                */
/* ------------------------------------------------------------------ */

function getYearsPerPointOne(mtl: number): number {
  if (mtl < 10) return 5;
  return 10;
}

/**
 * Convert any Mneme TL (including fractions) to a CE year.
 * Uses linear interpolation between the PDF anchor points.
 */
export function mnemeTLToYear(mtl: number): number {
  const anchors = TL_ERAS;
  // Clamp below range
  if (mtl <= anchors[0].mtl) return anchors[0].year;
  // Clamp above range
  if (mtl >= anchors[anchors.length - 1].mtl) {
    const last = anchors[anchors.length - 1];
    const excess = mtl - last.mtl;
    return last.year + excess * getYearsPerPointOne(last.mtl) * 10;
  }

  // Find surrounding anchors
  for (let i = 0; i < anchors.length - 1; i++) {
    const lo = anchors[i];
    const hi = anchors[i + 1];
    if (mtl >= lo.mtl && mtl <= hi.mtl) {
      const spanMtl = hi.mtl - lo.mtl;
      const spanYears = hi.year - lo.year;
      const t = (mtl - lo.mtl) / spanMtl;
      return Math.round(lo.year + t * spanYears);
    }
  }

  return anchors[anchors.length - 1].year;
}

/**
 * Convert a CE year to the nearest Mneme TL.
 */
export function yearToMnemeTL(year: number): number {
  const anchors = TL_ERAS;
  if (year <= anchors[0].year) return anchors[0].mtl;
  if (year >= anchors[anchors.length - 1].year) {
    const last = anchors[anchors.length - 1];
    const excessYears = year - last.year;
    return last.mtl + excessYears / (getYearsPerPointOne(last.mtl) * 10);
  }

  for (let i = 0; i < anchors.length - 1; i++) {
    const lo = anchors[i];
    const hi = anchors[i + 1];
    if (year >= lo.year && year <= hi.year) {
      const spanYears = hi.year - lo.year;
      const spanMtl = hi.mtl - lo.mtl;
      const t = (year - lo.year) / spanYears;
      return lo.mtl + t * spanMtl;
    }
  }

  return anchors[anchors.length - 1].mtl;
}

/**
 * Get the era details for any Mneme TL value.
 * Returns the anchor whose MTL is ≤ the given value (floor logic).
 */
export function getTLEra(mtl: number): TLEra {
  const anchors = TL_ERAS;
  let best = anchors[0];
  for (const era of anchors) {
    if (era.mtl <= mtl) best = era;
  }
  return best;
}

/* ------------------------------------------------------------------ */
/*  CE integer TL ↔ MTL mapping                                       */
/* ------------------------------------------------------------------ */

/**
 * Standard Cepheus Engine uses integer TL 7–15.
 * Under Heaven maps these cleanly to integer MTL anchors:
 *   CE 7 → MTL 7  (1950, Early Atomic)
 *   CE 8 → MTL 8  (2000, Information Age)
 *   CE 9 → MTL 9  (2050, New Space Race)
 *   ...
 *   CE 15 → MTL 15 (2600, Interstellar Colonisation)
 *
 * For finer granularity (e.g. CE 9 covers 2050–2100), use mnemeTLToYear()
 * to place a design at a specific year within the CE TL band.
 */
const CE_INT_TO_MTL: Record<number, number> = {
  7: 7,   // 1950 CE — Early Atomic & Space Age
  8: 8,   // 2000 CE — Information Age
  9: 9,   // 2050 CE — New Space Race / Space Industrialisation
  10: 10, // 2100 CE — Cis-Lunar Development
  11: 11, // 2200 CE — Interplanetary Settlement & Jovian Colonisation
  12: 12, // 2300 CE — Post-Earth Dependence (Jump Drive)
  13: 13, // 2400 CE — Outer System Development
  14: 14, // 2500 CE — Early Interstellar Trade & Exploration
  15: 15, // 2600 CE — Interstellar Colonisation
};

export function ceToMnemeTL(ceTL: number): number {
  if (CE_INT_TO_MTL[ceTL] !== undefined) return CE_INT_TO_MTL[ceTL];
  // Fallback for out-of-range values: linear extrapolation from CE 7↔MTL 7
  return Math.max(0, 7 + (ceTL - 7));
}

export function mnemeToCeTL(mtl: number): number {
  // Reverse lookup — find the CE integer whose MTL mapping is closest
  const entries = Object.entries(CE_INT_TO_MTL);
  let bestDelta = Infinity;
  let bestCe = 7;
  for (const [ce, m] of entries) {
    const delta = Math.abs(m - mtl);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestCe = Number(ce);
    }
  }
  return bestCe;
}

/* ------------------------------------------------------------------ */
/*  Dual-display helper                                               */
/* ------------------------------------------------------------------ */

export interface DualTL {
  ceTL: number;      // Standard Cepheus Engine integer TL
  mtl: number;       // Mneme TL (decimal, interpolated)
  year: number;      // CE year
  heYear: number;    // Holocene Era year
  eraName: string;
  keyTech: string[];
}

/**
 * Given a standard CE integer TL, return the full dual-TL details.
 * If `fraction` is provided (0.0–0.9), it advances the MTL within the CE band.
 * E.g. ceTL=9, fraction=0.5  →  MTL 9.5  →  year 2075.
 */
export function getDualTL(ceTL: number, fraction: number = 0): DualTL {
  const baseMtl = ceToMnemeTL(ceTL);
  const mtl = baseMtl + fraction;
  const year = mnemeTLToYear(mtl);
  const heYear = year + 10000;
  const era = getTLEra(mtl);
  return {
    ceTL,
    mtl: Math.round(mtl * 10) / 10,
    year,
    heYear,
    eraName: era.name,
    keyTech: era.keyTech,
  };
}

/** String formatter for TL display: "MTL 9.0 / CE TL 9 (2050 CE — New Space Race)" */
export function formatTL(ceTL: number, fraction: number = 0): string {
  const d = getDualTL(ceTL, fraction);
  return `MTL ${d.mtl.toFixed(1)} / CE TL ${d.ceTL} (${d.year} CE — ${d.eraName})`;
}
