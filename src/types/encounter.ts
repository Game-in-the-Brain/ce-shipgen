import type { ShipDesign } from './index';

// ─── Crew ───

export type CrewRole =
  | 'captain'
  | 'navcomm'
  | 'engineer'
  | 'pilot'
  | 'gunner'
  | 'sensor'
  | 'medic'
  | 'captain_assistant'
  | 'navcomm_assistant'
  | 'copilot';

export interface EncounterCrew {
  id: string;
  name: string;
  role: CrewRole;
  stats: {
    int: number;
    dex: number;
    edu: number;
    skill: number;      // Primary skill level
    leadership?: number;
    tactics?: number;
    piloting?: number;
    gunnery?: number;
    engineering?: number;
    sensors?: number;
  };
  status: 'active' | 'wounded' | 'incapacitated';
  reactionsUsed: number;  // Reactions used this round
}

// ─── MAC (Multiple Attack Consolidation) ───

export interface MacResult {
  attackDm: number;
  extraDamageDice: number;  // Number of extra D6
  label: string;
}

// ─── Range Bands (RAW: 7 bands) ───

export type RangeBand =
  | 'adjacent'    // < 1 km
  | 'close'       // 1 - 9.9 km
  | 'short'       // 10 - 999 km
  | 'medium'      // 1K - 9.9K km
  | 'long'        // 10K - 24.9K km
  | 'verylong'    // 25K - 49.9K km
  | 'distant';    // 50+ space

export interface RangeBandInfo {
  band: RangeBand;
  minKm: number;
  maxKm: number | null;
  sensorDm: number;
  name: string;
}

// ─── Grid Position ───

export interface GridPosition {
  x: number;
  y: number;
}

// ─── Ship in Encounter Context ───

export interface EncounterShip {
  id: string;
  name: string;
  design: ShipDesign;
  side: 'player' | 'enemy' | 'ally';

  // Mneme combat stats (derived from design)
  hullPoints: number;        // 10% of Dtons
  structurePoints: number;   // 10% of Dtons
  armor: number;
  hardpoints: number;
  weaponCount: number;
  mac: MacResult;
  thrustRating: number;

  // Superiority components (count, not tonnage)
  stationCount: number;
  turretCount: number;
  bayCount: number;
  sensorCount: number;
  fighterCount: number;

  // Combat power summary
  attackPower: number;
  defensePower: number;

  // Mutable encounter state
  currentHull: number;
  currentStructure: number;
  currentArmor: number;
  crew: EncounterCrew[];
  status: 'active' | 'disabled' | 'destroyed' | 'fled';
  position: GridPosition;
  heading: number;
  tokenImage?: string;

  // Initiative
  initiativeRoll?: number;
  initiativeTotal?: number;
}

// ─── Action Economy ───

export type ActionCost = 'minor' | 'standard' | 'full';

export type ActionType =
  | 'maneuver'      // Pilot: move, evade
  | 'fire'          // Gunner: attack
  | 'ecm'           // NavComm: electronic countermeasures
  | 'repair'        // Engineer: fix damage
  | 'sensor'        // NavComm/Sensor: scan, detect
  | 'brace'         // Any: defensive stance
  | 'board'         // Any: boarding action
  | 'flee'          // Pilot: escape
  | 'leadership'    // Captain: tactics, orders
  | 'overdrive'     // Engineer: boost systems
  | 'navigation';   // NavComm: plot course

export interface ActionResult {
  success: boolean;
  roll: number;
  naturalRoll: number;      // Before modifiers
  targetNumber: number;
  effect: number;           // Effect value (minimum 1 on success)
  doubleEffect: boolean;    // Natural 12
  damageDealt?: number;
  damageType?: 'hull' | 'structure' | 'armor' | 'component';
  hitLocation?: HitLocation;
  description: string;
}

// ─── Hit Location ───

export type HitLocation =
  | 'hull'
  | 'sensors'
  | 'mdrive'
  | 'turret'
  | 'jdrive'
  | 'armor'
  | 'powerplant'
  | 'bay'
  | 'structure'
  | 'crew'
  | 'fuel'
  | 'hold';

export interface HitLocationResult {
  location: HitLocation;
  category: 'external' | 'internal' | 'smallcraft';
}

// ─── Crew Function (Action in a phase) ───

export type CombatPhase =
  | 'initiative'
  | 'captain'
  | 'navcomm'
  | 'engineer'
  | 'pilot'
  | 'gunner'
  | 'others'
  | 'reactions'
  | 'damage'
  | 'end';

export interface CrewFunction {
  id: string;
  crewId: string;
  crewRole: CrewRole;
  shipId: string;
  phase: CombatPhase;
  action: ActionType;
  actionCost: ActionCost;
  targetShipId?: string;
  weaponName?: string;
  auto: boolean;
  resolved: boolean;
  result?: ActionResult;
}

// ─── Damage Application ───

export interface DamageApplication {
  shipId: string;
  sourceShipId: string;
  weaponDamage: number;
  effect: number;
  macDice: number;
  armorPenetration: number;  // Armor - (Weapon + Effect + MAC)
  finalDamage: number;
  hitLocation?: HitLocationResult;
  description: string;
}

// ─── Log ───

export interface LogEntry {
  timestamp: number;
  actor: string;
  action: string;
  target?: string;
  roll?: number;
  effect: string;
  dice?: string;
  phase?: CombatPhase;
}

export interface TurnLog {
  turn: number;
  phase: CombatPhase;
  entries: LogEntry[];
}

// ─── Scenario ───

export type ScenarioType =
  | 'pirate_intercept'
  | 'raider_ambush'
  | 'system_patrol'
  | 'convoy_defense'
  | 'custom';

export interface ScenarioConfig {
  type: ScenarioType;
  name: string;
  description: string;
  enemyMultiplier: number;
  enemyCountMin: number;
  enemyCountMax: number;
  playerAllies: number;
  fleeThreshold: number;
  aggression: number;
  preferredRange: RangeBand;
}

// ─── Encounter State ───

export interface EncounterState {
  id: string;
  scenario: ScenarioConfig;
  turn: number;
  phase: CombatPhase;
  playerShipId: string;
  ships: EncounterShip[];
  log: TurnLog[];
  currentTurnFunctions: CrewFunction[];
  pendingDamage: DamageApplication[];  // Damage to apply at end of round
  winner?: string;
  ended: boolean;
}

// ─── Post-Assessment ───

export interface EncounterMetrics {
  survivalTurns: number;
  damageDealt: number;
  damageTaken: number;
  shotsFired: number;
  shotsHit: number;
  macEfficiency: number;
  crewCasualties: number;
  escaped: boolean;
  salvageValue: number;
  repairCost: number;
}

export interface PostAssessment {
  victory: boolean;
  playerShipId: string;
  metrics: EncounterMetrics;
  mvpCrew?: string;
  notableEvents: string[];
}
