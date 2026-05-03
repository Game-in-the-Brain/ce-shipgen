import { useState, useMemo, useCallback } from 'react';
import { useTableStore } from '../store/tableStore';
// import { useSettings } from './ThemeProvider';
import {
  createEncounter,
  SCENARIOS,
  generateAiTurn,
  generateAssessment,
  rollEncounterInitiative,
  advancePhase,
  resolveCurrentPhase,
} from '../engine/encounterEngine';
import { determineRangeBand } from '../engine/mnemeCombat';
import type { EncounterState, EncounterShip } from '../types/encounter';
import type { ShipDesign } from '../types';
import { Swords, Play, RotateCcw, ChevronRight, Shield, Zap, ArrowLeft, Activity, Crosshair, Target, Radio, Wrench, Plane, Crosshair as GunIcon, Users, AlertTriangle } from 'lucide-react';
import { colors, fonts } from './shipgen/theme';
import { ShLabel, ShNum, ShData, ShPanel } from './shipgen/primitives';
import type { CombatPhase } from '../types/encounter';

// ─── Phase Indicator ───

const PHASE_CONFIG: Record<CombatPhase, { label: string; color: string; icon: React.ReactNode }> = {
  initiative: { label: 'INITIATIVE', color: colors.glow, icon: <Crosshair className="w-3 h-3" /> },
  captain:    { label: 'CAPTAIN',    color: colors.inkSoft, icon: <Users className="w-3 h-3" /> },
  navcomm:    { label: 'NAVCOMM',    color: colors.inkSoft, icon: <Radio className="w-3 h-3" /> },
  engineer:   { label: 'ENGINEER',   color: colors.inkSoft, icon: <Wrench className="w-3 h-3" /> },
  pilot:      { label: 'PILOT',      color: colors.inkSoft, icon: <Plane className="w-3 h-3" /> },
  gunner:     { label: 'GUNNER',     color: colors.warn,    icon: <GunIcon className="w-3 h-3" /> },
  others:     { label: 'OTHERS',     color: colors.inkDim,  icon: <Users className="w-3 h-3" /> },
  reactions:  { label: 'REACTIONS',  color: colors.amber,   icon: <AlertTriangle className="w-3 h-3" /> },
  damage:     { label: 'DAMAGE',     color: colors.warn,    icon: <Zap className="w-3 h-3" /> },
  end:        { label: 'END',        color: colors.good,    icon: <Target className="w-3 h-3" /> },
};

function PhaseIndicator({ phase }: { phase: CombatPhase }) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.others;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      background: `${config.color}15`,
      border: `1px solid ${config.color}44`,
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: '0.08em',
      color: config.color,
    }}>
      {config.icon}
      {config.label}
    </div>
  );
}

// ─── Encounter Setup ───

function EncounterSetup({
  ships,
  onStart,
}: {
  ships: ShipDesign[];
  onStart: (playerShip: ShipDesign, scenario: string, enemies: ShipDesign[]) => void;
}) {
  const [selectedShipId, setSelectedShipId] = useState<string>('');
  const [scenarioKey, setScenarioKey] = useState<string>('pirate_intercept');
  const [difficulty, setDifficulty] = useState<number>(1);

  const selectedShip = ships.find((s) => s.id === selectedShipId);
  const scenario = SCENARIOS[scenarioKey];

  // Pick enemies based on scenario + difficulty
  const enemyPool = useMemo(() => {
    return ships.filter((s) => s.tags?.some((t) => ['military', 'warship', 'pirate', 'raider'].includes(t)));
  }, [ships]);

  const handleStart = () => {
    if (!selectedShip) return;
    const count = Math.floor(Math.random() * (scenario.enemyCountMax - scenario.enemyCountMin + 1)) + scenario.enemyCountMin;
    const enemies: ShipDesign[] = [];
    for (let i = 0; i < count; i++) {
      const pick = enemyPool[Math.floor(Math.random() * enemyPool.length)];
      if (pick) enemies.push(pick);
    }
    onStart(selectedShip, scenarioKey, enemies);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <ShNum size={32} color={colors.ink}>ENCOUNTER SETUP</ShNum>

      {/* Ship Selection */}
      <ShPanel no="01" title="Select Your Ship" kw="LIB" style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: 300, overflowY: 'auto', padding: 4 }}>
          {ships.map((ship) => (
            <button
              key={ship.id}
              onClick={() => setSelectedShipId(ship.id)}
              style={{
                padding: 12,
                border: `1px solid ${selectedShipId === ship.id ? colors.glow : colors.hair}`,
                background: selectedShipId === ship.id ? `${colors.glow}15` : colors.panelAlt,
                color: selectedShipId === ship.id ? colors.glow : colors.inkSoft,
                fontFamily: fonts.mono,
                fontSize: 12,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600, color: selectedShipId === ship.id ? colors.glow : colors.ink }}>{ship.name}</div>
              <div style={{ color: colors.inkDim, marginTop: 4 }}>{ship.hullDtons}DT · TL{ship.tl}</div>
            </button>
          ))}
        </div>
      </ShPanel>

      {/* Scenario Selection */}
      <ShPanel no="02" title="Scenario" kw="MSC" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(SCENARIOS).map(([key, sc]) => (
            <button
              key={key}
              onClick={() => setScenarioKey(key)}
              style={{
                padding: '10px 14px',
                border: `1px solid ${scenarioKey === key ? colors.glow : colors.hair}`,
                background: scenarioKey === key ? `${colors.glow}15` : 'transparent',
                color: scenarioKey === key ? colors.glow : colors.inkSoft,
                fontFamily: fonts.mono,
                fontSize: 13,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Swords className="w-4 h-4" style={{ color: scenarioKey === key ? colors.glow : colors.inkDim }} />
              <div>
                <div style={{ fontWeight: 600 }}>{sc.name}</div>
                <div style={{ fontSize: 11, color: colors.inkDim }}>{sc.description} · {sc.enemyMultiplier}x force</div>
              </div>
            </button>
          ))}
        </div>
      </ShPanel>

      {/* Difficulty */}
      <ShPanel no="03" title="Difficulty" kw="MOD" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 0.5, label: 'Easy' },
            { key: 1, label: 'Normal' },
            { key: 2, label: 'Hard' },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: `1px solid ${difficulty === d.key ? colors.glow : colors.hair}`,
                background: difficulty === d.key ? `${colors.glow}15` : 'transparent',
                color: difficulty === d.key ? colors.glow : colors.inkDim,
                fontFamily: fonts.mono,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </ShPanel>

      {/* Start Button */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleStart}
          disabled={!selectedShip}
          style={{
            padding: '14px 32px',
            fontFamily: fonts.mono,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.12em',
            background: selectedShip ? colors.glow : colors.hair,
            color: selectedShip ? colors.bg : colors.inkDim,
            border: 'none',
            cursor: selectedShip ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Play className="w-5 h-5" /> START ENCOUNTER
        </button>
      </div>
    </div>
  );
}

// ─── Ship Token ───

function ShipToken({
  ship,
  isSelected,
  onClick,
}: {
  ship: EncounterShip;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isPlayer = ship.side === 'player';

  if (ship.tokenImage) {
    return (
      <div
        onClick={onClick}
        style={{
          position: 'absolute',
          left: ship.position.x * 24 - 20,
          top: ship.position.y * 24 - 20,
          width: 40,
          height: 40,
          cursor: 'pointer',
          zIndex: isSelected ? 10 : 5,
        }}
        title={`${ship.name} (${ship.currentHull}/${ship.hullPoints} HP)`}
      >
        <img
          src={ship.tokenImage}
          alt={ship.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: isSelected ? `drop-shadow(0 0 6px ${colors.glow})` : 'none',
            transform: `rotate(${ship.heading}deg)`,
            transition: 'all 0.2s',
          }}
        />
        {isSelected && (
          <div style={{
            position: 'absolute',
            inset: -4,
            border: `2px solid ${colors.glow}`,
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: ship.position.x * 24,
        top: ship.position.y * 24,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `2px solid ${isSelected ? colors.glow : isPlayer ? colors.good : colors.warn}`,
        background: isSelected ? `${colors.glow}30` : `${isPlayer ? colors.good : colors.warn}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 5,
        boxShadow: isSelected ? `0 0 12px ${colors.glow}55` : 'none',
      }}
      title={`${ship.name} (${ship.currentHull}/${ship.hullPoints} HP)`}
    >
      <span style={{ fontFamily: fonts.mono, fontSize: 10, color: isPlayer ? colors.good : colors.warn, fontWeight: 600 }}>
        {isPlayer ? 'P' : 'E'}
      </span>
    </div>
  );
}

// ─── Ship Card ───

function ShipCard({ ship }: { ship: EncounterShip }) {
  const hullPct = (ship.currentHull / ship.hullPoints) * 100;

  return (
    <div style={{ background: colors.panelAlt, border: `1px solid ${colors.hair}`, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Shield className="w-4 h-4" style={{ color: ship.side === 'player' ? colors.good : colors.warn }} />
        <ShLabel size={13} style={{ color: colors.ink }}>{ship.name}</ShLabel>
        <ShData size={11} dim>{ship.side.toUpperCase()}</ShData>
      </div>

      {/* Hull bar */}
      <div style={{ height: 6, background: colors.hair, marginBottom: 10 }}>
        <div style={{
          height: '100%',
          width: `${hullPct}%`,
          background: hullPct > 50 ? colors.good : hullPct > 25 ? colors.amber : colors.warn,
          transition: 'width 0.3s',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div><ShData size={10} dim>HULL</ShData> <ShNum size={14} color={colors.glow}>{ship.currentHull}/{ship.hullPoints}</ShNum></div>
        <div><ShData size={10} dim>STRUCT</ShData> <ShNum size={14} color={colors.glowSoft}>{ship.currentStructure}/{ship.structurePoints}</ShNum></div>
        <div><ShData size={10} dim>ATTACK</ShData> <ShNum size={14} color={colors.amber}>{ship.attackPower}</ShNum></div>
        <div><ShData size={10} dim>DEFENSE</ShData> <ShNum size={14} color={colors.inkSoft}>{ship.defensePower}</ShNum></div>
        <div><ShData size={10} dim>MAC</ShData> <ShNum size={14} color={colors.glow}>+{ship.mac.attackDm}</ShNum></div>
        <div><ShData size={10} dim>THRUST</ShData> <ShNum size={14} color={colors.inkSoft}>{ship.thrustRating}</ShNum></div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {ship.crew.map((c) => (
          <span key={c.id} style={{
            fontSize: 10,
            fontFamily: fonts.mono,
            padding: '2px 6px',
            background: c.status === 'active' ? `${colors.good}20` : `${colors.warn}20`,
            color: c.status === 'active' ? colors.good : colors.warn,
            border: `1px solid ${c.status === 'active' ? `${colors.good}40` : `${colors.warn}40`}`,
          }}>
            {c.role[0].toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Combat Log ───

function CombatLog({ log }: { log: { turn: number; entries: { actor: string; action: string; effect: string; target?: string }[] }[] }) {
  return (
    <div style={{
      background: colors.panelAlt,
      border: `1px solid ${colors.hair}`,
      padding: 12,
      maxHeight: 240,
      overflowY: 'auto',
    }}>
      <ShLabel size={11} dim style={{ marginBottom: 8, display: 'block' }}>COMBAT LOG</ShLabel>
      {log.length === 0 && <ShData size={11} dim>No actions yet.</ShData>}
      {log.map((turnLog) => (
        <div key={turnLog.turn} style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.glow, marginBottom: 4 }}>
            TURN {turnLog.turn}
          </div>
          {turnLog.entries.map((entry, i) => (
            <div key={i} style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft, marginBottom: 2, paddingLeft: 8 }}>
              <span style={{ color: colors.ink }}>{entry.actor}</span>{' '}
              <span style={{ color: colors.inkDim }}>{entry.action}</span>
              {entry.target && <span style={{ color: colors.warn }}> → {entry.target}</span>}
              <span style={{ color: colors.inkDim }}>: {entry.effect}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Post Assessment ───

function PostAssessmentView({
  state,
  onRestart,
  onBack,
}: {
  state: EncounterState;
  onRestart: () => void;
  onBack: () => void;
}) {
  const assessment = useMemo(() => generateAssessment(state), [state]);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <ShNum size={40} color={assessment.victory ? colors.good : colors.warn}>
        {assessment.victory ? 'VICTORY' : 'DEFEAT'}
      </ShNum>

      <div style={{ marginTop: 20, textAlign: 'left' }}>
        <ShPanel no="RES" title="Mission Report" kw="LOG">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div><ShData size={10} dim>TURNS</ShData> <ShNum size={16} color={colors.glow}>{assessment.metrics.survivalTurns}</ShNum></div>
            <div><ShData size={10} dim>DAMAGE DEALT</ShData> <ShNum size={16} color={colors.good}>{assessment.metrics.damageDealt}</ShNum></div>
            <div><ShData size={10} dim>DAMAGE TAKEN</ShData> <ShNum size={16} color={colors.warn}>{assessment.metrics.damageTaken}</ShNum></div>
            <div><ShData size={10} dim>HIT RATE</ShData> <ShNum size={16} color={colors.amber}>
              {assessment.metrics.shotsFired > 0 ? Math.round((assessment.metrics.shotsHit / assessment.metrics.shotsFired) * 100) : 0}%
            </ShNum></div>
            <div><ShData size={10} dim>SALVAGE</ShData> <ShNum size={16} color={colors.glow}>{Math.round(assessment.metrics.salvageValue).toLocaleString()} Cr</ShNum></div>
            <div><ShData size={10} dim>REPAIR COST</ShData> <ShNum size={16} color={colors.warn}>{Math.round(assessment.metrics.repairCost).toLocaleString()} Cr</ShNum></div>
          </div>

          {assessment.notableEvents.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <ShLabel size={10} dim>NOTABLE EVENTS</ShLabel>
              {assessment.notableEvents.map((e, i) => (
                <div key={i} style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft, marginTop: 4 }}>• {e}</div>
              ))}
            </div>
          )}
        </ShPanel>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <button onClick={onRestart} style={{ padding: '10px 24px', fontFamily: fonts.mono, fontSize: 13, background: colors.glow, color: colors.bg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <RotateCcw className="w-4 h-4" /> RESTART
        </button>
        <button onClick={onBack} style={{ padding: '10px 24px', fontFamily: fonts.mono, fontSize: 13, background: 'transparent', color: colors.inkSoft, border: `1px solid ${colors.hair}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeft className="w-4 h-4" /> BACK TO SETUP
        </button>
      </div>
    </div>
  );
}

// ─── Main Encounter View ───

export function EncounterView() {
  const ships = useTableStore((s) => s.ships);
  const [encounter, setEncounter] = useState<EncounterState | null>(null);
  const [selectedShipId, setSelectedShipId] = useState<string>('');
  const [autoResolve, setAutoResolve] = useState(false);

  const selectedShip = encounter?.ships.find((s) => s.id === selectedShipId);

  const handleStart = useCallback((playerDesign: ShipDesign, scenario: string, enemies: ShipDesign[]) => {
    const enc = createEncounter(playerDesign, scenario, enemies);
    setEncounter(enc);
    setSelectedShipId(enc.playerShipId);
  }, []);

  const handleNextPhase = useCallback(() => {
    if (!encounter || encounter.ended) return;

    let state = { ...encounter };

    // Roll initiative at start of turn
    if (state.phase === 'initiative') {
      state = rollEncounterInitiative(state);
    }

    // Generate AI functions for current phase
    state = generateAiTurn(state);

    // Resolve current phase
    state = resolveCurrentPhase(state);

    // Advance to next phase
    state = advancePhase(state);

    setEncounter(state);
  }, [encounter]);

  const handleAutoResolve = useCallback(() => {
    if (!encounter || encounter.ended) return;
    let state = { ...encounter };
    let safety = 0;
    while (!state.ended && safety < 100) {
      if (state.phase === 'initiative') {
        state = rollEncounterInitiative(state);
      }
      state = generateAiTurn(state);
      state = resolveCurrentPhase(state);
      state = advancePhase(state);
      safety++;
    }
    setEncounter(state);
  }, [encounter]);

  const handleReset = useCallback(() => {
    setEncounter(null);
    setSelectedShipId('');
    setAutoResolve(false);
  }, []);

  // Setup phase
  if (!encounter) {
    return <EncounterSetup ships={ships} onStart={handleStart} />;
  }

  // End phase
  if (encounter.ended) {
    return <PostAssessmentView state={encounter} onRestart={handleReset} onBack={handleReset} />;
  }

  // Active encounter
  const playerShip = encounter.ships.find((s) => s.id === encounter.playerShipId);
  const activeEnemies = encounter.ships.filter((s) => s.side === 'enemy' && s.status === 'active');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
      {/* LEFT: Map + Controls */}
      <div>
        {/* Turn Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShNum size={28} color={colors.glow}>TURN {encounter.turn}</ShNum>
            <ShData size={12} dim>{encounter.scenario.name.toUpperCase()}</ShData>
            <PhaseIndicator phase={encounter.phase} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setAutoResolve(!autoResolve)}
              style={{
                padding: '6px 12px',
                fontFamily: fonts.mono,
                fontSize: 11,
                background: autoResolve ? `${colors.glow}20` : 'transparent',
                color: autoResolve ? colors.glow : colors.inkDim,
                border: `1px solid ${autoResolve ? colors.glow : colors.hair}`,
                cursor: 'pointer',
              }}
            >
              <Activity className="w-3 h-3 inline mr-1" />
              {autoResolve ? 'AUTO: ON' : 'AUTO: OFF'}
            </button>
            {autoResolve ? (
              <button
                onClick={handleAutoResolve}
                style={{
                  padding: '6px 16px',
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  background: colors.warn,
                  color: colors.bg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Zap className="w-3 h-3 inline mr-1" /> RESOLVE ALL
              </button>
            ) : (
              <button
                onClick={handleNextPhase}
                style={{
                  padding: '6px 16px',
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  background: colors.glow,
                  color: colors.bg,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight className="w-3 h-3 inline mr-1" /> NEXT PHASE
              </button>
            )}
          </div>
        </div>

        {/* Tactical Map */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: 400,
          background: colors.panelAlt,
          border: `1px solid ${colors.hair}`,
          overflow: 'hidden',
        }}>
          {/* Grid */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${colors.hair} 1px, transparent 1px), linear-gradient(90deg, ${colors.hair} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.5,
          }} />

          {/* Range circles from selected ship */}
          {selectedShip && (
            <div style={{
              position: 'absolute',
              left: selectedShip.position.x * 24 - 144,
              top: selectedShip.position.y * 24 - 144,
              width: 288,
              height: 288,
              borderRadius: '50%',
              border: `1px dashed ${colors.glow}33`,
              pointerEvents: 'none',
            }} />
          )}

          {/* Ship tokens */}
          {encounter.ships.filter(s => s.status === 'active' || s.status === 'disabled').map((ship) => (
            <ShipToken
              key={ship.id}
              ship={ship}
              isSelected={ship.id === selectedShipId}
              onClick={() => setSelectedShipId(ship.id)}
            />
          ))}
        </div>

        {/* Combat Log */}
        <div style={{ marginTop: 16 }}>
          <CombatLog log={encounter.log} />
        </div>
      </div>

      {/* RIGHT: Ship Detail + Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {selectedShip && <ShipCard ship={selectedShip} />}

        {playerShip && (
          <ShPanel no="PLR" title="Player Ship" kw="YOU">
            <ShipCard ship={playerShip} />
          </ShPanel>
        )}

        {/* Enemy list */}
        <ShPanel no="FOE" title="Hostiles" kw={`${activeEnemies.length}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activeEnemies.map((enemy) => (
              <button
                key={enemy.id}
                onClick={() => setSelectedShipId(enemy.id)}
                style={{
                  padding: '8px 10px',
                  background: colors.panelAlt,
                  border: `1px solid ${selectedShipId === enemy.id ? colors.warn : colors.hair}`,
                  color: colors.inkSoft,
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{enemy.name}</span>
                  <span style={{ color: colors.warn }}>{enemy.currentHull}/{enemy.hullPoints} HP</span>
                </div>
                <div style={{ fontSize: 10, color: colors.inkDim, marginTop: 2 }}>
                  {determineRangeBand(playerShip?.position || { x: 0, y: 0 }, enemy.position).toUpperCase()} RANGE
                </div>
              </button>
            ))}
          </div>
        </ShPanel>
      </div>
    </div>
  );
}
