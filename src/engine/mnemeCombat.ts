import type {
  MacResult,
  EncounterShip,
  ActionResult,
  GridPosition,
  RangeBand,
  RangeBandInfo,
  HitLocation,
  HitLocationResult,
  DamageApplication,
} from '../types/encounter';

// ═══════════════════════════════════════════════════════════════
// Mneme Space Combat Engine v2 — RAW-Compliant
// Source: Mneme Variant Space Combat Rules v2.45
// ═══════════════════════════════════════════════════════════════

// ─── Dice ───

export function rollD6(count = 1): number {
  let sum = 0;
  for (let i = 0; i < count; i++) sum += Math.floor(Math.random() * 6) + 1;
  return sum;
}

export function roll2D6(): number {
  return rollD6(2);
}

// ─── Range Bands (RAW: 7 bands) ───

export const RANGE_BANDS: RangeBandInfo[] = [
  { band: 'adjacent',  minKm: 0,       maxKm: 0.999,  sensorDm: +6, name: 'Adjacent' },
  { band: 'close',     minKm: 1,       maxKm: 9.999,  sensorDm: +4, name: 'Close' },
  { band: 'short',     minKm: 10,      maxKm: 999,    sensorDm: +2, name: 'Short' },
  { band: 'medium',    minKm: 1000,    maxKm: 9999,   sensorDm: 0,  name: 'Medium' },
  { band: 'long',      minKm: 10000,   maxKm: 24999,  sensorDm: -2, name: 'Long' },
  { band: 'verylong',  minKm: 25000,   maxKm: 49999,  sensorDm: -4, name: 'Very Long' },
  { band: 'distant',   minKm: 50000,   maxKm: null,   sensorDm: -6, name: 'Distant' },
];

export function getRangeBandInfo(band: RangeBand): RangeBandInfo {
  return RANGE_BANDS.find(r => r.band === band) || RANGE_BANDS[3]; // default medium
}

/** Determine range band from grid distance (1 grid unit ≈ 10K km for gameplay) */
export function determineRangeBand(a: GridPosition, b: GridPosition): RangeBand {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= 0.1) return 'adjacent';
  if (dist <= 0.5) return 'close';
  if (dist <= 1.5) return 'short';
  if (dist <= 4) return 'medium';
  if (dist <= 8) return 'long';
  if (dist <= 15) return 'verylong';
  return 'distant';
}

/** Convert range band to a display distance string */
export function getRangeDisplay(band: RangeBand): string {
  switch (band) {
    case 'adjacent':  return '< 1 km';
    case 'close':     return '1 - 9.9 km';
    case 'short':     return '10 - 999 km';
    case 'medium':    return '1K - 9.9K km';
    case 'long':      return '10K - 24.9K km';
    case 'verylong':  return '25K - 49.9K km';
    case 'distant':   return '50K+ km';
  }
}

// ─── Weapon Max Ranges ───

export type WeaponType = 'sandcaster' | 'pulselaser' | 'beamlaser' | 'fusiongun' | 'particlebeam' | 'missile' | 'meson';

export function getWeaponMaxRange(weapon: WeaponType): RangeBand {
  switch (weapon) {
    case 'sandcaster':   return 'close';
    case 'pulselaser':   return 'short';
    case 'beamlaser':    return 'medium';
    case 'fusiongun':    return 'medium';
    case 'particlebeam': return 'long';
    case 'missile':      return 'distant';
    case 'meson':        return 'long';
    default:             return 'medium';
  }
}

/** Calculate weapon DM based on range vs max range */
export function getWeaponRangeDm(weapon: WeaponType, currentBand: RangeBand): number {
  const maxRange = getWeaponMaxRange(weapon);
  const bands: RangeBand[] = ['adjacent', 'close', 'short', 'medium', 'long', 'verylong', 'distant'];
  const currentIdx = bands.indexOf(currentBand);
  const maxIdx = bands.indexOf(maxRange);

  if (currentIdx < maxIdx) return +2;  // Closer than max = DM+2
  if (currentIdx === maxIdx) return 0;  // At max range = DM+0
  if (currentIdx === maxIdx + 1) return -2; // 1 band beyond = DM-2
  return -999; // Cannot fire beyond 1 band past max
}

export function canWeaponFire(weapon: WeaponType, currentBand: RangeBand): boolean {
  return getWeaponRangeDm(weapon, currentBand) !== -999;
}

// ─── MAC Table (RAW v2.45) ───

export function calcMacPotential(weaponCount: number): MacResult {
  if (weaponCount >= 500) return { attackDm: 7, extraDamageDice: 7, label: '500 attacks' };
  if (weaponCount >= 200) return { attackDm: 6, extraDamageDice: 6, label: '200 attacks' };
  if (weaponCount >= 100) return { attackDm: 5, extraDamageDice: 5, label: '100 attacks' };
  if (weaponCount >= 50)  return { attackDm: 4, extraDamageDice: 4, label: '50 attacks' };
  if (weaponCount >= 20)  return { attackDm: 3, extraDamageDice: 3, label: '20 attacks' };
  if (weaponCount >= 10)  return { attackDm: 2, extraDamageDice: 2, label: '10 attacks' };
  if (weaponCount >= 5)   return { attackDm: 1, extraDamageDice: 1, label: '5 attacks' };
  if (weaponCount >= 2)   return { attackDm: 1, extraDamageDice: 0, label: '2 attacks' };
  return { attackDm: 0, extraDamageDice: 0, label: '1 attack' };
}

/** Roll MAC extra damage dice */
export function rollMacDamage(mac: MacResult): number {
  if (mac.extraDamageDice <= 0) return 0;
  return rollD6(mac.extraDamageDice);
}

// ─── Initiative ───

export interface InitiativeResult {
  roll: number;
  thrustMod: number;
  leadershipMod: number;
  total: number;
}

export function rollInitiative(
  thrustRating: number,
  leadershipSkill: number,
  highestThrustInSide: number
): InitiativeResult {
  const roll = roll2D6();
  // Side with higher lowest thrust gets +1
  const thrustMod = thrustRating >= highestThrustInSide ? 1 : 0;
  const leadershipMod = leadershipSkill;
  return {
    roll,
    thrustMod,
    leadershipMod,
    total: roll + thrustMod + leadershipMod,
  };
}

// ─── Core Attack Resolution ───

export interface AttackParams {
  attacker: EncounterShip;
  defender: EncounterShip;
  skill: number;
  weaponType: WeaponType;
  weaponCount: number;
  rangeBand: RangeBand;
  ecmActive: boolean;
  superiorityDm?: number;
}

export function resolveAttack(params: AttackParams): ActionResult {
  const { defender, skill, weaponType, weaponCount, rangeBand, ecmActive, superiorityDm = 0 } = params;

  // Check if weapon can fire at this range
  if (!canWeaponFire(weaponType, rangeBand)) {
    return {
      success: false,
      roll: 0,
      naturalRoll: 0,
      targetNumber: 0,
      effect: 0,
      doubleEffect: false,
      description: `${weaponType} cannot fire at ${rangeBand} range (max: ${getWeaponMaxRange(weaponType)})`,
    };
  }

  const mac = calcMacPotential(weaponCount);
  const rangeDm = getWeaponRangeDm(weaponType, rangeBand);
  const ecmDm = ecmActive ? -2 : 0;

  // TN = 8 + adversary DM (simplified: defender's thrust rating as proxy)
  const adversaryDm = Math.min(defender.thrustRating, 4); // Cap at +4
  const tn = 8 + adversaryDm;

  const roll = roll2D6();
  const naturalRoll = roll;
  const total = roll + skill + mac.attackDm + rangeDm + ecmDm + superiorityDm;
  const success = total >= tn;

  if (!success) {
    return {
      success: false,
      roll: total,
      naturalRoll,
      targetNumber: tn,
      effect: 0,
      doubleEffect: false,
      description: `Missed! ${roll} + skill ${skill} + MAC ${mac.attackDm} + range ${rangeDm} + ECM ${ecmDm} + sup ${superiorityDm} = ${total} (needed ${tn})`,
    };
  }

  // Effect = total - TN, minimum 1
  let effect = Math.max(1, total - tn);
  let doubleEffect = false;

  // Natural 12 = double effect
  if (naturalRoll === 12) {
    effect *= 2;
    doubleEffect = true;
  }

  // Calculate damage: Weapon + Effect + MAC - Armor
  // Weapon damage: simplified average (3D6 ≈ 10.5)
  const weaponDamage = 10;
  const macDamage = rollMacDamage(mac);
  const rawDamage = weaponDamage + effect + macDamage;
  const finalDamage = Math.max(0, rawDamage - defender.currentArmor);

  // Reduce armor
  const armorReduced = Math.min(defender.currentArmor, rawDamage);

  let damageType: 'hull' | 'structure' | 'armor' | 'component' = 'armor';
  if (finalDamage > 0) {
    if (defender.currentHull > 0) {
      damageType = 'hull';
    } else if (defender.currentStructure > 0) {
      damageType = 'structure';
    }
  }

  return {
    success: true,
    roll: total,
    naturalRoll,
    targetNumber: tn,
    effect,
    doubleEffect,
    damageDealt: finalDamage,
    damageType,
    description: `Hit! ${naturalRoll} + mods = ${total} vs TN ${tn}, Effect ${effect}${doubleEffect ? ' (DOUBLE)' : ''}, Damage ${finalDamage} (W${weaponDamage} + E${effect} + MAC${macDamage} - A${armorReduced})`,
  };
}

// ─── Hit Location (2D6) ───

export function rollHitLocation(): HitLocationResult {
  const roll = roll2D6();

  // External Hit table (default for vessels)
  const externalMap: Record<number, HitLocation> = {
    2:  'hull',
    3:  'sensors',
    4:  'mdrive',
    5:  'turret',
    6:  'hull',
    7:  'armor',
    8:  'jdrive',
    9:  'powerplant',
    10: 'bay',
    11: 'structure',
    12: 'crew',
  };

  return {
    location: externalMap[roll] || 'hull',
    category: 'external',
  };
}

export function getHitLocationName(loc: HitLocation): string {
  const names: Record<HitLocation, string> = {
    hull: 'Hull',
    sensors: 'Sensors',
    mdrive: 'M-Drive',
    turret: 'Turret',
    jdrive: 'J-Drive',
    armor: 'Armor',
    powerplant: 'Power Plant',
    bay: 'Bay',
    structure: 'Structure',
    crew: 'Crew',
    fuel: 'Fuel',
    hold: 'Hold',
  };
  return names[loc] || loc;
}

// ─── Superiority (count-based, NOT tonnage) ───

export interface SuperiorityResult {
  dm: number;
  label: string;
  friendlyCount: number;
  enemyCount: number;
}

export function calcSuperiority(
  friendlyShips: EncounterShip[],
  enemyShips: EncounterShip[]
): SuperiorityResult {
  const friendlyCount = friendlyShips.reduce((s, ship) =>
    s + ship.stationCount + ship.turretCount + ship.bayCount + ship.sensorCount + ship.fighterCount, 0
  );
  const enemyCount = enemyShips.reduce((s, ship) =>
    s + ship.stationCount + ship.turretCount + ship.bayCount + ship.sensorCount + ship.fighterCount, 0
  );

  const diff = Math.abs(friendlyCount - enemyCount);
  let dm = 0;
  if (diff >= 21) dm = 5;
  else if (diff >= 11) dm = 4;
  else if (diff >= 6) dm = 3;
  else if (diff >= 3) dm = 2;
  else if (diff >= 1) dm = 1;

  // Positive DM for superior side
  const friendlySuperior = friendlyCount >= enemyCount;

  return {
    dm: friendlySuperior ? dm : -dm,
    label: friendlySuperior
      ? `Superior (${diff} advantage)`
      : `Inferior (${diff} disadvantage)`,
    friendlyCount,
    enemyCount,
  };
}

// ─── Damage Application (End of Round) ───

export function createDamageApplication(
  attacker: EncounterShip,
  defender: EncounterShip,
  attackResult: ActionResult,
  _weaponType: WeaponType
): DamageApplication | null {
  if (!attackResult.success || !attackResult.damageDealt) return null;

  const hitLoc = rollHitLocation();

  return {
    shipId: defender.id,
    sourceShipId: attacker.id,
    weaponDamage: 10, // Simplified base
    effect: attackResult.effect,
    macDice: 0, // Already rolled
    armorPenetration: attackResult.damageDealt,
    finalDamage: attackResult.damageDealt,
    hitLocation: hitLoc,
    description: `${attacker.name} hits ${defender.name} ${getHitLocationName(hitLoc.location)} for ${attackResult.damageDealt} damage`,
  };
}

export function applyDamage(
  ship: EncounterShip,
  damage: number,
  _location?: HitLocationResult
): { hullDamage: number; structDamage: number; armorDamage: number; destroyed: boolean; description: string } {
  let remaining = damage;
  let armorDamage = 0;
  let hullDamage = 0;
  let structDamage = 0;
  const parts: string[] = [];

  // Armor absorbs first
  if (ship.currentArmor > 0) {
    armorDamage = Math.min(remaining, ship.currentArmor);
    ship.currentArmor -= armorDamage;
    remaining -= armorDamage;
    if (armorDamage > 0) parts.push(`Armor -${armorDamage}`);
  }

  // Then Hull
  if (remaining > 0 && ship.currentHull > 0) {
    hullDamage = Math.min(remaining, ship.currentHull);
    ship.currentHull -= hullDamage;
    remaining -= hullDamage;
    if (hullDamage > 0) parts.push(`Hull -${hullDamage}`);
  }

  // Then Structure
  if (remaining > 0 && ship.currentStructure > 0) {
    structDamage = Math.min(remaining, ship.currentStructure);
    ship.currentStructure -= structDamage;
    remaining -= structDamage;
    if (structDamage > 0) parts.push(`Structure -${structDamage}`);
  }

  // Check destruction
  const destroyed = ship.currentStructure <= 0;
  if (destroyed) {
    ship.status = 'destroyed';
    parts.push('DESTROYED');
  } else if (ship.currentHull <= 0) {
    ship.status = 'disabled';
    parts.push('DISABLED');
  }

  return {
    hullDamage,
    structDamage,
    armorDamage,
    destroyed,
    description: parts.join(', '),
  };
}

// ─── Combat Power Summary ───

export function calcCombatPower(ship: EncounterShip): number {
  return ship.attackPower * 10 + ship.defensePower * 5 + ship.currentHull + ship.currentStructure;
}

// ─── Sensor DM at Range ───

export function getSensorDmAtRange(rangeBand: RangeBand): number {
  return getRangeBandInfo(rangeBand).sensorDm;
}

// ─── Object Size Sensor Modifiers ───

export function getSizeSensorDm(dtons: number): number {
  if (dtons >= 1e14) return 8;  // Planetoid ~1K km
  if (dtons >= 1e11) return 6;  // Asteroid ~100km
  if (dtons >= 1e8) return 4;   // Asteroid ~10km
  if (dtons >= 1e5) return 2;   // Capital ship / station
  if (dtons >= 100) return 0;   // Standard ship
  if (dtons >= 1) return -2;    // Small craft
  return -4;                     // Man-sized (missile/drone)
}
