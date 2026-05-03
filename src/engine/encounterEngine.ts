import type {
  EncounterState,
  EncounterShip,
  ScenarioConfig,
  LogEntry,
  CrewFunction,
  PostAssessment,
  EncounterMetrics,
  CombatPhase,
} from '../types/encounter';
import type { ShipDesign } from '../types';
import { calcHullPoints, calcStructurePoints, calcHardpoints } from '../calculations';
import { generateCrewForShip } from './crewGenerator';
import { generateAiFunctions } from './aiPilot';
import {
  resolveAttack,
  determineRangeBand,
  rollInitiative,
  calcSuperiority,
  applyDamage,
  createDamageApplication,
} from './mnemeCombat';
import { getRandomToken } from '../utils/shipImages';

// ─── Scenario Presets ───

export const SCENARIOS: Record<string, ScenarioConfig> = {
  pirate_intercept: {
    type: 'pirate_intercept',
    name: 'Pirate Intercept',
    description: 'Evade or destroy pirate raiders',
    enemyMultiplier: 1.5,
    enemyCountMin: 1,
    enemyCountMax: 2,
    playerAllies: 0,
    fleeThreshold: 20,
    aggression: 0.8,
    preferredRange: 'medium',
  },
  raider_ambush: {
    type: 'raider_ambush',
    name: 'Raider Ambush',
    description: 'Survive against overwhelming force',
    enemyMultiplier: 2.5,
    enemyCountMin: 1,
    enemyCountMax: 1,
    playerAllies: 0,
    fleeThreshold: 10,
    aggression: 0.9,
    preferredRange: 'short',
  },
  system_patrol: {
    type: 'system_patrol',
    name: 'System Patrol',
    description: 'Engage hostile small craft',
    enemyMultiplier: 0.8,
    enemyCountMin: 1,
    enemyCountMax: 3,
    playerAllies: 0,
    fleeThreshold: 40,
    aggression: 0.5,
    preferredRange: 'long',
  },
  convoy_defense: {
    type: 'convoy_defense',
    name: 'Convoy Defense',
    description: 'Protect merchant vessels',
    enemyMultiplier: 1.2,
    enemyCountMin: 2,
    enemyCountMax: 3,
    playerAllies: 2,
    fleeThreshold: 50,
    aggression: 0.6,
    preferredRange: 'long',
  },
};

// ─── Phase Order ───

const PHASE_ORDER: CombatPhase[] = [
  'initiative',
  'captain',
  'navcomm',
  'engineer',
  'pilot',
  'gunner',
  'others',
  'damage',
];

function nextPhase(phase: CombatPhase): CombatPhase | null {
  const idx = PHASE_ORDER.indexOf(phase);
  if (idx < 0 || idx >= PHASE_ORDER.length - 1) return null;
  return PHASE_ORDER[idx + 1];
}

// ─── Ship Conversion ───

export function designToEncounterShip(
  design: ShipDesign,
  side: EncounterShip['side'],
  startPosition: { x: number; y: number }
): EncounterShip {
  const hullPoints = calcHullPoints(design.hullDtons);
  const structurePoints = calcStructurePoints(design.hullDtons);
  const hardpoints = calcHardpoints(design.hullDtons);
  const weaponCount = (design.weapons || []).reduce((s, w) => s + (w.qty || 1), 0);

  // Derive thrust from drive code (simplified: letter index + 1)
  const thrustRating = design.mDrive ? (design.mDrive.charCodeAt(0) - 64) : 1;

  // Attack power = weapons + missiles
  const attackPower = weaponCount;

  // Defense power = count of defensive mounts
  const defensePower = (design.weaponMounts || []).filter(w =>
    (w.name || '').toLowerCase().includes('sand') ||
    (w.name || '').toLowerCase().includes('interceptor')
  ).length;

  // Superiority components (count-based)
  const stationCount = design.bridge ? 1 : 0;
  const turretCount = (design.weaponMounts || []).filter(w =>
    (w.name || '').toLowerCase().includes('turret')
  ).length;
  const bayCount = (design.weaponMounts || []).filter(w =>
    (w.name || '').toLowerCase().includes('bay')
  ).length;
  const sensorCount = design.sensors ? 1 : 0;
  const fighterCount = (design.modules || []).filter(m =>
    (m.module || '').toLowerCase().includes('fighter')
  ).reduce((s, m) => s + (m.qty || 1), 0);

  return {
    id: `enc-${design.id}-${side}`,
    name: design.name,
    design,
    side,
    hullPoints,
    structurePoints,
    armor: design.armorQty || 0,
    hardpoints,
    weaponCount,
    mac: { attackDm: 0, extraDamageDice: 0, label: '1 attack' }, // Will be recalculated per attack
    thrustRating,
    stationCount,
    turretCount,
    bayCount,
    sensorCount,
    fighterCount,
    attackPower,
    defensePower,
    currentHull: hullPoints,
    currentStructure: structurePoints,
    currentArmor: design.armorQty || 0,
    crew: generateCrewForShip(design.tl, weaponCount),
    status: 'active',
    position: startPosition,
    heading: side === 'player' ? 0 : 180,
    tokenImage: getRandomToken(design.name, design.hullDtons) || undefined,
  };
}

// ─── Encounter Setup ───

export function createEncounter(
  playerDesign: ShipDesign,
  scenarioKey: string,
  enemyDesigns: ShipDesign[]
): EncounterState {
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.pirate_intercept;
  const ships: EncounterShip[] = [];

  // Player ship
  const playerShip = designToEncounterShip(playerDesign, 'player', { x: 5, y: 10 });
  ships.push(playerShip);

  // Enemies
  const enemyCount = Math.min(
    enemyDesigns.length,
    Math.floor(Math.random() * (scenario.enemyCountMax - scenario.enemyCountMin + 1)) + scenario.enemyCountMin
  );
  for (let i = 0; i < enemyCount; i++) {
    const design = enemyDesigns[i % enemyDesigns.length];
    ships.push(designToEncounterShip(design, 'enemy', { x: 15 + i * 3, y: 10 + i * 2 }));
  }

  return {
    id: `enc-${Date.now()}`,
    scenario,
    turn: 1,
    phase: 'initiative',
    playerShipId: playerShip.id,
    ships,
    log: [],
    currentTurnFunctions: [],
    pendingDamage: [],
    ended: false,
  };
}

// ─── Initiative Roll ───

export function rollEncounterInitiative(state: EncounterState): EncounterState {
  const newShips = state.ships.map(ship => {
    if (ship.status !== 'active') return ship;

    const sideShips = state.ships.filter(s => s.side === ship.side && s.status === 'active');
    const highestThrust = Math.max(...sideShips.map(s => s.thrustRating));

    const captain = ship.crew.find(c => c.role === 'captain');
    const leadership = captain?.stats.leadership || captain?.stats.skill || 0;

    const init = rollInitiative(ship.thrustRating, leadership, highestThrust);

    return {
      ...ship,
      initiativeRoll: init.roll,
      initiativeTotal: init.total,
    };
  });

  // Sort ships by initiative for turn order (highest first)
  newShips.sort((a, b) => (b.initiativeTotal || 0) - (a.initiativeTotal || 0));

  const playerShip = newShips.find(s => s.id === state.playerShipId);
  const enemyShips = newShips.filter(s => s.side === 'enemy' && s.status === 'active');
  const superiority = calcSuperiority(
    newShips.filter(s => s.side !== 'enemy'),
    enemyShips
  );

  const logEntry: LogEntry = {
    timestamp: Date.now(),
    actor: 'System',
    action: 'Initiative',
    effect: `Player initiative: ${playerShip?.initiativeTotal || 0}, Enemy initiative: ${enemyShips[0]?.initiativeTotal || 0}. Superiority: ${superiority.label}`,
    phase: 'initiative',
  };

  return {
    ...state,
    ships: newShips,
    phase: 'captain',
    log: [...state.log, { turn: state.turn, phase: 'initiative', entries: [logEntry] }],
  };
}

// ─── Phase-Based Turn Resolution ───

export function advancePhase(state: EncounterState): EncounterState {
  if (state.ended) return state;

  const next = nextPhase(state.phase);

  // If we've gone through all phases, start a new turn
  if (!next) {
    return startNewTurn(state);
  }

  // If moving to damage phase, apply all pending damage
  if (next === 'damage') {
    return applyEndOfRoundDamage({ ...state, phase: next });
  }

  return { ...state, phase: next };
}

export function startNewTurn(state: EncounterState): EncounterState {
  // Reset per-turn state
  const newShips = state.ships.map(ship => ({
    ...ship,
    initiativeRoll: undefined,
    initiativeTotal: undefined,
  }));

  return {
    ...state,
    turn: state.turn + 1,
    phase: 'initiative',
    currentTurnFunctions: [],
    pendingDamage: [],
    ships: newShips,
  };
}

export function generateAiTurn(state: EncounterState): EncounterState {
  const allFunctions: CrewFunction[] = [];

  for (const ship of state.ships) {
    if (ship.status !== 'active') continue;
    if (ship.side === 'player') continue;

    const functions = generateAiFunctions(ship, state.ships, state.scenario, state.phase);
    allFunctions.push(...functions);
  }

  return {
    ...state,
    currentTurnFunctions: [...state.currentTurnFunctions, ...allFunctions],
  };
}

export function addPlayerFunction(
  state: EncounterState,
  func: CrewFunction
): EncounterState {
  return {
    ...state,
    currentTurnFunctions: [...state.currentTurnFunctions, func],
  };
}

// ─── Resolve Current Phase ───

export function resolveCurrentPhase(state: EncounterState): EncounterState {
  const newState = { ...state };
  const logEntries: LogEntry[] = [];
  const now = Date.now();

  // Get functions for current phase
  const phaseFunctions = newState.currentTurnFunctions.filter(
    f => f.phase === newState.phase && !f.resolved
  );

  // Process each function in the current phase
  for (const func of phaseFunctions) {
    const ship = newState.ships.find(s =>
      s.id === func.shipId || s.crew.some(c => c.id === func.crewId)
    );
    if (!ship || ship.status !== 'active') {
      func.resolved = true;
      continue;
    }

    const target = func.targetShipId
      ? newState.ships.find(s => s.id === func.targetShipId)
      : undefined;

    switch (func.action) {
      case 'fire': {
        if (!target || target.status !== 'active') {
          func.resolved = true;
          break;
        }
        const gunner = ship.crew.find(c => c.id === func.crewId && c.role === 'gunner');
        const skill = gunner ? (gunner.stats.gunnery || gunner.stats.skill) : 0;
        const range = determineRangeBand(ship.position, target.position);

        // Determine weapon type from ship design
        const hasMissiles = ship.design.weapons?.some(w =>
          (w.module || '').toLowerCase().includes('missile')
        );
        const weaponType = hasMissiles ? 'missile' : 'beamlaser';

        const result = resolveAttack({
          attacker: ship,
          defender: target,
          skill,
          weaponType,
          weaponCount: ship.weaponCount,
          rangeBand: range,
          ecmActive: false,
        });

        // Queue damage for end-of-round application
        if (result.success && result.damageDealt) {
          const dmgApp = createDamageApplication(ship, target, result, weaponType);
          if (dmgApp) {
            newState.pendingDamage.push(dmgApp);
          }
        }

        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Fire',
          target: target.name,
          roll: result.roll,
          effect: result.description,
          phase: newState.phase,
        });
        break;
      }

      case 'maneuver': {
        if (target) {
          const dx = target.position.x - ship.position.x;
          const dy = target.position.y - ship.position.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.1) {
            const moveDist = Math.min(ship.thrustRating, dist);
            ship.position.x += (dx / dist) * moveDist;
            ship.position.y += (dy / dist) * moveDist;
            ship.heading = Math.atan2(dy, dx) * (180 / Math.PI);
          }
        }
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Maneuver',
          effect: `Moved toward ${target?.name || 'objective'}`,
          phase: newState.phase,
        });
        break;
      }

      case 'flee': {
        ship.status = 'fled';
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Flee',
          effect: `${ship.name} has disengaged`,
          phase: newState.phase,
        });
        break;
      }

      case 'ecm': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'ECM',
          effect: 'Electronic countermeasures active',
          phase: newState.phase,
        });
        break;
      }

      case 'repair': {
        const repairAmount = Math.floor(Math.random() * 3) + 1;
        ship.currentHull = Math.min(ship.hullPoints, ship.currentHull + repairAmount);
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Repair',
          effect: `Restored ${repairAmount} hull points`,
          phase: newState.phase,
        });
        break;
      }

      case 'sensor': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Scan',
          effect: 'Sensors scanning...',
          phase: newState.phase,
        });
        break;
      }

      case 'leadership': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Leadership',
          effect: 'Captain issues tactical orders',
          phase: newState.phase,
        });
        break;
      }

      case 'overdrive': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Overdrive',
          effect: 'Engineer boosts systems',
          phase: newState.phase,
        });
        break;
      }

      case 'brace': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Brace',
          effect: 'Crew bracing for impact',
          phase: newState.phase,
        });
        break;
      }

      case 'board': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Board',
          target: target?.name,
          effect: `Attempting to board ${target?.name || 'target'}`,
          phase: newState.phase,
        });
        break;
      }

      case 'navigation': {
        logEntries.push({
          timestamp: now,
          actor: ship.name,
          action: 'Navigation',
          effect: 'Plotting course',
          phase: newState.phase,
        });
        break;
      }
    }

    func.resolved = true;
  }

  // Add log
  if (logEntries.length > 0) {
    newState.log.push({
      turn: newState.turn,
      phase: newState.phase,
      entries: logEntries,
    });
  }

  return newState;
}

// ─── Apply End-of-Round Damage ───

function applyEndOfRoundDamage(state: EncounterState): EncounterState {
  const newState = { ...state };
  const logEntries: LogEntry[] = [];
  const now = Date.now();

  for (const dmg of newState.pendingDamage) {
    const ship = newState.ships.find(s => s.id === dmg.shipId);
    if (!ship || ship.status !== 'active') continue;

    const result = applyDamage(ship, dmg.finalDamage, dmg.hitLocation);

    logEntries.push({
      timestamp: now,
      actor: 'Damage',
      action: 'Hit',
      target: ship.name,
      effect: `${dmg.description}. ${result.description}`,
      phase: 'damage',
    });
  }

  // Clear pending damage
  newState.pendingDamage = [];

  if (logEntries.length > 0) {
    newState.log.push({
      turn: newState.turn,
      phase: 'damage',
      entries: logEntries,
    });
  }

  // Check end conditions
  return checkEndConditions(newState);
}

function checkEndConditions(state: EncounterState): EncounterState {
  const activePlayer = state.ships.filter(s => s.side === 'player' && s.status === 'active');
  const activeEnemy = state.ships.filter(s => s.side === 'enemy' && s.status === 'active');
  const fledPlayer = state.ships.filter(s => s.side === 'player' && s.status === 'fled');

  if (activeEnemy.length === 0) {
    return {
      ...state,
      ended: true,
      winner: 'player',
      phase: 'end',
    };
  } else if (activePlayer.length === 0 && fledPlayer.length === 0) {
    return {
      ...state,
      ended: true,
      winner: 'enemy',
      phase: 'end',
    };
  } else if (fledPlayer.length > 0 && activePlayer.length === 0) {
    return {
      ...state,
      ended: true,
      winner: 'evaded',
      phase: 'end',
    };
  }

  return state;
}

// ─── Legacy resolveTurn (kept for compatibility) ───

export function resolveTurn(state: EncounterState): EncounterState {
  // Run through all phases automatically
  let newState = resolveCurrentPhase(state);
  newState = advancePhase(newState);

  while (newState.phase !== 'end' as CombatPhase && newState.phase !== 'initiative') {
    newState = generateAiTurn(newState);
    newState = resolveCurrentPhase(newState);
    newState = advancePhase(newState);
  }

  return newState;
}

// ─── Post-Assessment ───

export function generateAssessment(state: EncounterState): PostAssessment {
  const playerShip = state.ships.find(s => s.id === state.playerShipId);
  const metrics: EncounterMetrics = {
    survivalTurns: state.turn,
    damageDealt: 0,
    damageTaken: 0,
    shotsFired: 0,
    shotsHit: 0,
    macEfficiency: 0,
    crewCasualties: 0,
    escaped: false,
    salvageValue: 0,
    repairCost: 0,
  };

  for (const log of state.log) {
    for (const entry of log.entries) {
      if (entry.action === 'Fire') {
        metrics.shotsFired++;
        if (entry.effect?.includes('Hit!')) metrics.shotsHit++;
      }
    }
  }

  if (playerShip) {
    const hullLost = playerShip.hullPoints - playerShip.currentHull;
    const structLost = playerShip.structurePoints - playerShip.currentStructure;
    metrics.repairCost = (hullLost + structLost) * 100000;
    metrics.crewCasualties = playerShip.crew.filter(c => c.status !== 'active').length;
    metrics.escaped = playerShip.status === 'fled';
  }

  // Calculate damage from log
  for (const log of state.log) {
    for (const entry of log.entries) {
      if (entry.action === 'Hit' && entry.target) {
        const dmgMatch = entry.effect?.match(/(\d+) damage/);
        if (dmgMatch) {
          const dmg = Number(dmgMatch[1]);
          if (entry.target === playerShip?.name) {
            metrics.damageTaken += dmg;
          } else {
            metrics.damageDealt += dmg;
          }
        }
      }
    }
  }

  // Salvage from destroyed enemies
  const destroyedEnemies = state.ships.filter(s => s.side === 'enemy' && s.status === 'destroyed');
  metrics.salvageValue = destroyedEnemies.reduce((s, e) => s + (e.design.totalCost || 0) * 0.1, 0);

  const victory = state.winner === 'player' || state.winner === 'evaded';

  const notableEvents: string[] = [];
  if (metrics.escaped) notableEvents.push('Successfully evaded enemy forces');
  if (destroyedEnemies.length > 0) notableEvents.push(`Destroyed ${destroyedEnemies.length} enemy ship(s)`);
  if (metrics.crewCasualties > 0) notableEvents.push(`${metrics.crewCasualties} crew casualties`);

  return {
    victory,
    playerShipId: state.playerShipId,
    metrics,
    notableEvents,
  };
}
