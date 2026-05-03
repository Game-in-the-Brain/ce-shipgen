import type { EncounterShip, CrewFunction, ScenarioConfig, ActionType, CombatPhase, CrewRole } from '../types/encounter';
import { calcCombatPower, determineRangeBand } from './mnemeCombat';

export interface AiDecision {
  action: ActionType;
  targetShipId?: string;
  reason: string;
}

function getEnemies(ship: EncounterShip, allShips: EncounterShip[]): EncounterShip[] {
  return allShips.filter(s => s.id !== ship.id && s.side !== ship.side && s.status === 'active');
}

function getAllies(ship: EncounterShip, allShips: EncounterShip[]): EncounterShip[] {
  return allShips.filter(s => s.id !== ship.id && s.side === ship.side && s.status === 'active');
}

function getHullPercent(ship: EncounterShip): number {
  return (ship.currentHull / ship.hullPoints) * 100;
}

export function decideAction(
  ship: EncounterShip,
  allShips: EncounterShip[],
  scenario: ScenarioConfig
): AiDecision {
  const enemies = getEnemies(ship, allShips);
  const allies = getAllies(ship, allShips);
  const hullPct = getHullPercent(ship);

  if (enemies.length === 0) {
    return { action: 'sensor', reason: 'No enemies detected' };
  }

  // Find closest enemy
  const closestEnemy = enemies.reduce((closest, e) => {
    const d1 = Math.hypot(e.position.x - ship.position.x, e.position.y - ship.position.y);
    const d2 = Math.hypot(closest.position.x - ship.position.x, closest.position.y - ship.position.y);
    return d1 < d2 ? e : closest;
  }, enemies[0]);

  const target = closestEnemy;
  const range = determineRangeBand(ship.position, target.position);

  // 1. Flee if badly damaged and not escorting
  const fleeThreshold = scenario.fleeThreshold;
  if (hullPct < fleeThreshold && ship.side !== 'ally') {
    return { action: 'flee', reason: `Hull at ${hullPct.toFixed(0)}%, below ${fleeThreshold}% threshold` };
  }

  // 2. If outnumbered > 2:1, consider fleeing
  const allyPower = allies.reduce((s, a) => s + calcCombatPower(a), calcCombatPower(ship));
  const enemyPower = enemies.reduce((s, e) => s + calcCombatPower(e), 0);
  if (enemyPower > allyPower * 2 && ship.side !== 'ally' && hullPct < 50) {
    return { action: 'flee', reason: 'Outnumbered >2:1 and hull critical' };
  }

  // 3. If target is disabled/destroyed, find another or board
  if (target.status === 'disabled') {
    const otherActive = enemies.filter(e => e.status === 'active');
    if (otherActive.length > 0) {
      return { action: 'fire', targetShipId: otherActive[0].id, reason: 'Primary target disabled, switching' };
    }
    if (range === 'adjacent' || range === 'close') {
      return { action: 'board', targetShipId: target.id, reason: 'Target disabled, boarding' };
    }
    return { action: 'maneuver', targetShipId: target.id, reason: 'Closing to board disabled target' };
  }

  // 4. Preferred range logic
  const preferred = scenario.preferredRange;
  if (range !== preferred && preferred !== 'short' && preferred !== 'adjacent') {
    return { action: 'maneuver', targetShipId: target.id, reason: `Maneuvering to ${preferred} range` };
  }

  // 5. Fire if in good range
  if (range === preferred || range === 'short' || range === 'medium' || range === 'close') {
    return { action: 'fire', targetShipId: target.id, reason: `Firing at ${range} range` };
  }

  // 6. ECM if being targeted by missiles (simplified: always ECM if engineer available)
  if (ship.crew.some(c => c.role === 'engineer' && c.status === 'active')) {
    return { action: 'ecm', reason: 'Activating ECM' };
  }

  // 7. Default: fire
  return { action: 'fire', targetShipId: target.id, reason: 'Default attack pattern' };
}

/** Get the action type for a crew role in a specific phase */
function getRoleActionForPhase(
  role: CrewRole,
  decision: AiDecision,
  ship: EncounterShip
): ActionType {
  switch (role) {
    case 'captain':
      return decision.action === 'board' ? 'board' : 'leadership';

    case 'navcomm':
      return decision.action === 'ecm' ? 'ecm' : 'sensor';

    case 'engineer':
      if (ship.currentHull < ship.hullPoints * 0.5) return 'repair';
      if (decision.action === 'ecm') return 'ecm';
      return 'overdrive';

    case 'pilot':
      if (decision.action === 'flee') return 'flee';
      if (decision.action === 'maneuver') return 'maneuver';
      return 'maneuver';

    case 'gunner':
      return decision.action === 'fire' ? 'fire' : 'brace';

    case 'sensor':
      return 'sensor';

    case 'medic':
      return 'repair';

    case 'captain_assistant':
      return 'leadership';

    case 'navcomm_assistant':
      return 'sensor';

    case 'copilot':
      return 'maneuver';

    default:
      return 'brace';
  }
}

/** Map role to phase */
function getRolePhase(role: CrewRole): CombatPhase {
  switch (role) {
    case 'captain':
    case 'captain_assistant':
      return 'captain';
    case 'navcomm':
    case 'navcomm_assistant':
    case 'sensor':
      return 'navcomm';
    case 'engineer':
    case 'medic':
      return 'engineer';
    case 'pilot':
    case 'copilot':
      return 'pilot';
    case 'gunner':
      return 'gunner';
    default:
      return 'others';
  }
}

export function generateAiFunctions(
  ship: EncounterShip,
  allShips: EncounterShip[],
  scenario: ScenarioConfig,
  currentPhase: CombatPhase
): CrewFunction[] {
  const decision = decideAction(ship, allShips, scenario);
  const functions: CrewFunction[] = [];

  for (const crew of ship.crew) {
    if (crew.status !== 'active') continue;

    const rolePhase = getRolePhase(crew.role);

    // Only generate functions for the current phase
    if (rolePhase !== currentPhase) continue;

    const action = getRoleActionForPhase(crew.role, decision, ship);

    functions.push({
      id: `func-${ship.id}-${crew.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      crewId: crew.id,
      crewRole: crew.role,
      shipId: ship.id,
      phase: currentPhase,
      action,
      actionCost: action === 'fire' ? 'standard' : 'minor',
      targetShipId: decision.targetShipId,
      auto: true,
      resolved: false,
    });
  }

  return functions;
}
