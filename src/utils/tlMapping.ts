/**
 * CE TL → Mneme MTL mapping
 *
 * CE (Cepheus Engine) uses integer TL 7–15.
 * Mneme MSDS uses decimal TL where 0.1 ≈ 5 years of refinement.
 *
 * Mapping is based on Mneme_Ship_Design_System.md §2:
 *   CE 7 → MTL 7.0–7.9  (1950s–1990s chemical rocketry)
 *   CE 8 → MTL 8.0–8.9  (2000s–2050s advanced chemical/reuse)
 *   CE 9 → MTL 9.0+     (2050+ fusion/NTR era)
 *
 * For display, we use a representative midpoint per CE TL.
 */

const CE_TO_MNEME: Record<number, number> = {
  7: 7.4,   // Apollo baseline
  8: 8.2,   // Reusable era
  9: 9.0,   // Fusion/NTR threshold
  10: 9.2,
  11: 9.4,
  12: 9.6,
  13: 9.8,
  14: 10.0,
  15: 10.2,
};

export function ceToMnemeTL(ceTL: number): number {
  return CE_TO_MNEME[ceTL] ?? 7.0 + (ceTL - 7) * 0.3;
}

export function mnemeToCeTL(mtl: number): number {
  return Math.floor(mtl);
}
