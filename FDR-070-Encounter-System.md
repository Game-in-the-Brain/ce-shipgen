# FDR-070: Mneme Space Combat Encounter System

**Status:** Design Complete → Implementation In Progress  
**Date:** 2026-05-03  
**Priority:** P2 (High)  
**Depends On:** Ship Library (M2.8 Complete), Mneme Combat Stats Panel (Just Built)  

---

## 1. Executive Summary

Build an **Encounter Tab** that runs Mneme Space Combat (MSC) scenarios. MSC is the **only** combat system — CE space combat is explicitly unavailable because MSC was built to fill gaps in CE rules that required playtesting and rulings.

The encounter system is designed **bot-first** for playtesting and balance validation, then made player-friendly. It generates bounded-random crews, runs turn-based engagements on a tactical map, and produces logs + post-assessment metrics.

---

## 2. Design Philosophy

| Principle | Rationale |
|-----------|-----------|
| **MSC-only** | CE space combat has too many unresolved gaps; MSC exists precisely because it was playtested and rulings were established |
| **Bot-first** | AI pilots fight each other so we can tune balance before players touch it |
| **Phone-first UI** | Context menus, double-tap select, long-press actions — works on phone, better on tablet/desktop |
| **Library-driven** | All ships come from the existing Ship Library (designed ships or pre-built) |
| **Metrics-driven** | Every encounter produces logs that feed back into ship balance |

---

## 3. Architecture Overview

```
EncounterView (page shell)
├── EncounterSetup    (ship selection, scenario picker, crew gen)
├── EncounterMap      (tactical grid, ship tokens, range bands)
├── TurnPanel         (turn resolution, action queue, context menu)
├── ShipCard          (ship status, armor, weapons, damage potential)
├── CrewFunctionPanel (auto/micro toggle, per-function decisions)
├── CombatLog         (chronological turn log, dice results)
└── PostAssessment    (win/loss, damage dealt, survival time, metrics)

Engine Layer:
├── encounterEngine.ts   (turn loop, state machine, scenario setup)
├── mnemeCombat.ts       (MSC rules: MAC, superiority, damage, range)
├── crewGenerator.ts     (bounded random crew from CECHAR stats)
└── aiPilot.ts           (bot decision tree: evade, attack, close, flee)
```

---

## 4. Core Data Models

### 4.1 EncounterShip

A ship participating in an encounter. Derived from `ShipDesign` but enriched with Mneme combat stats.

```typescript
interface EncounterShip {
  id: string;
  name: string;
  design: ShipDesign;           // Original library ship
  
  // Mneme Combat Stats (derived)
  hullPoints: number;
  structurePoints: number;
  armor: number;                // Effective armor rating
  hardpoints: number;
  weaponCount: number;
  mac: MacResult;               // Multiple Attack Consolidation
  
  // Encounter-specific state
  currentHull: number;          // Remaining hull (starts = hullPoints)
  currentStructure: number;     // Remaining structure
  thrustRating: number;         // From M-Drive performance
  crew: EncounterCrew[];        // Generated crew members
  functions: CrewFunction[];    // Available actions this turn
  status: 'active' | 'disabled' | 'destroyed' | 'fled';
  position: GridPosition;       // On tactical map
  heading: number;              // Degrees
  
  // Combat power summary (for AI decisions)
  attackPower: number;          // missiles + weapons that can attack
  totalDamage: number;          // dice average of all attacks
  defensePower: number;         // interceptor missiles + turret/bay count
  rangeModifier: number;        // max=1.0, medium=0.5, short=0.2
}
```

### 4.2 EncounterCrew

```typescript
interface EncounterCrew {
  id: string;
  name: string;
  role: 'commander' | 'pilot' | 'gunner' | 'engineer' | 'sensor' | 'medic';
  stats: {
    int: number;    // Intelligence
    dex: number;    // Dexterity
    edu: number;    // Education
    skill: number;  // Relevant skill level (Gunnery, Pilot, etc.)
  };
  status: 'active' | 'wounded' | 'incapacitated';
}
```

### 4.3 CrewFunction (Actions Per Turn)

Mneme action economy: **3 MA, 1 SA, 1 RA per turn** (Minor Action, Significant Action, Reaction Action).

```typescript
type ActionType = 'maneuver' | 'fire' | 'ecm' | 'repair' | 'sensor' | 'brace' | 'board' | 'flee';

interface CrewFunction {
  id: string;
  crewId: string;
  action: ActionType;
  target?: string;        // Target ship ID
  weapon?: string;        // Which weapon system
  auto: boolean;          // AI chose this (true) or player (false)
  resolved: boolean;
  result?: ActionResult;
}
```

### 4.4 EncounterState

```typescript
interface EncounterState {
  id: string;
  scenario: ScenarioType;
  turn: number;
  phase: 'setup' | 'initiative' | 'actions' | 'resolution' | 'end';
  playerShipId: string;
  ships: EncounterShip[];
  log: TurnLog[];
  winner?: string;        // Ship ID or 'evaded' or 'destroyed'
  ended: boolean;
}

type ScenarioType = 
  | 'pirate_intercept'    // Player evading pirates
  | 'raider_ambush'       // Player ambushed by raiders
  | 'system_patrol'       // Player is patrol, engaging hostiles
  | 'convoy_defense'      // Player defending merchants
  | 'custom';             // Free setup
```

### 4.5 TurnLog

```typescript
interface TurnLog {
  turn: number;
  phase: string;
  entries: LogEntry[];
}

interface LogEntry {
  timestamp: number;
  actor: string;          // Ship name
  action: string;
  target?: string;
  roll?: number;
  effect?: string;        // Damage dealt, status change, etc.
  dice?: string;          // e.g. "2D6+3"
}
```

---

## 5. Combat Mechanics (MSC)

### 5.1 Ship Combat Power

| Metric | Formula |
|--------|---------|
| **Attack** | Count of missiles + weapon turrets/bays that can fire this turn |
| **Total Damage** | Average dice of all attacks × Range Modifier |
| **Defense** | Interceptor missiles + active weapon turrets/bays |
| **Armor** | Hull Points + Structure Points (absorbs damage first) |
| **Range Modifier** | Long = ×1.0, Medium = ×0.5, Short = ×0.2 (missiles always Long) |

### 5.2 Damage Resolution

1. Attacker declares target and weapon(s)
2. Roll attack (2D6 + skill + MAC bonus - range DM - ECM)
3. If hit, roll damage dice × range modifier
4. Apply to armor first, then hull, then structure
5. Structure 0 = disabled. Hull 0 = destroyed.

### 5.3 MAC (Multiple Attack Consolidation)

| Weapons Firing | Attack DM | Extra Damage |
|----------------|-----------|--------------|
| 2+ | +1 | +1 |
| 5+ | +1 | +1D6 |
| 10+ | +2 | +2D6 |

### 5.4 Superiority System

Fleet vs fleet DM based on relative tonnage. (Already in `SuperiorityCalculator.tsx` — port to engine.)

---

## 6. AI Pilot (Bot Behavior)

### 6.1 Decision Tree

```
Each turn, AI evaluates:

1. If outnumbered > 2:1 and not escorting → FLEE
2. If hull < 30% and no escort duty → FLEE
3. If target is fleeing and faster → Let go / switch target
4. If target is disabled → Board or finish
5. Otherwise:
   a. MANEUVER to optimal range (missile ships stay long, laser ships close)
   b. FIRE with maximum MAC consolidation
   c. ECM if targeted by missiles
   d. REPAIR if engineer available and hull < 50%
```

### 6.2 Commander Preferences (Scenario-driven)

| Scenario Type | Aggression | Flee Threshold | Preferred Range |
|---------------|------------|----------------|-----------------|
| Pirate | High (0.8) | 20% hull | Medium (lasers) |
| Raider | Very High (0.9) | 10% hull | Short (boarding) |
| Patrol | Medium (0.5) | 40% hull | Long (missiles) |
| Merchant | Low (0.2) | 50% hull | Long (evade) |

---

## 7. UI/UX Design

### 7.1 Encounter Setup Screen

```
┌─────────────────────────────────────────┐
│  ENCOUNTER SETUP                        │
├─────────────────────────────────────────┤
│                                         │
│  [ SELECT YOUR SHIP ]                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Ship A  │  │ Ship B  │  │ Ship C  │ │
│  │ 200DT   │  │ 400DT   │  │ 100DT   │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│                                         │
│  [ SCENARIO ]                           │
│  ○ Pirate Intercept    ○ Raider Ambush │
│  ○ System Patrol       ○ Convoy Defense│
│                                         │
│  [ DIFFICULTY ]                         │
│  Easy (0.5x)  Normal (1x)  Hard (2x)   │
│                                         │
│  [ GENERATE CREW ]                      │
│  Auto-generate minimum crew ✓           │
│                                         │
│        [ START ENCOUNTER ]              │
│                                         │
└─────────────────────────────────────────┘
```

### 7.2 Encounter Map (Tactical View)

```
┌─────────────────────────────────────────┐
│  TURN 3  │  Player: 80% hull            │
│  ◀ ▶     │  Enemy:  45% hull            │
├─────────────────────────────────────────┤
│                                         │
│      ·  ·  ·  ·  ·  ·  ·  ·  ·         │
│      ·  ·  [P]──→  ·  ·  ·  ·         │  P = Player ship
│      ·  ·  ·  ·  ·  ·  ·  ·  ·         │  E = Enemy ship
│      ·  ·  ·  ·  [E]  ·  ·  ·         │  --- = Range band
│      ·  ·  ·  ·  ·  ·  ·  ·  ·         │
│                                         │
│  Range: MEDIUM (Laser optimal)          │
│                                         │
├─────────────────────────────────────────┤
│  [ MANAGE CREW ]  [ AUTO-RESOLVE ]     │
│                                         │
│  Pilot:   Maneuver ▼      Target: E1   │
│  Gunner:  Fire ▼          Weapon: All  │
│  Engineer: ECM ▼                       │
│                                         │
│  [ END TURN ]                           │
└─────────────────────────────────────────┘
```

### 7.3 Interaction Patterns

| Gesture | Action |
|---------|--------|
| **Tap** ship | Select / show ShipCard |
| **Double-tap** ship | Open action menu for that ship |
| **Long-press** ship | Context menu: scan, target, focus fire |
| **Tap** empty space | Move to position (if pilot action) |
| **Swipe** | Pan map |
| **Pinch** | Zoom map |

---

## 8. Crew Generation

Pull from CECHAR (CE Character Generation) repo concepts. Generate minimum crew with bounded random stats.

```typescript
function generateCrew(role: string, tl: number): EncounterCrew {
  return {
    name: randomName(),
    role,
    stats: {
      int: roll(2, 6) + tlBonus(tl),      // 2D6 + TL/3
      dex: roll(2, 6) + tlBonus(tl),
      edu: roll(2, 6) + tlBonus(tl),
      skill: roll(1, 6) + Math.floor(tl / 3),  // 1D6 + TL/3
    }
  };
}
```

**Generate More Crew** button continuously rolls new crew members (for min-maxing or replacement).

---

## 9. Scenario Definitions

### 9.1 Pirate Intercept (Default)

- **Player:** 1 ship (chosen from library)
- **Enemies:** 1-2 pirate ships, 1.5× player tonnage total
- **Goal:** Destroy or evade pirates
- **Win:** All enemies destroyed or fled, or player escapes map edge
- **Lose:** Player destroyed or captured

### 9.2 Raider Ambush

- **Player:** 1 ship
- **Enemies:** 1 raider, 2-3× player tonnage
- **Goal:** Survive against overwhelming force
- **Win:** Escape with >50% hull
- **Lose:** Destroyed

### 9.3 System Patrol

- **Player:** 1 patrol ship
- **Enemies:** 1-2 small craft (fighters, boats)
- **Goal:** Destroy all hostiles
- **Win:** All enemies destroyed

### 9.4 Convoy Defense

- **Player:** 1 escort + 1-2 merchant NPCs
- **Enemies:** 2-3 pirates
- **Goal:** Protect merchants
- **Win:** >50% merchants survive
- **Lose:** >50% merchants destroyed

---

## 10. Metrics & Post-Assessment

After every encounter, generate:

| Metric | Description |
|--------|-------------|
| **Survival Time** | Turns survived |
| **Damage Dealt** | Total hull/structure damage to enemies |
| **Damage Taken** | Total hull/structure damage to player |
| **Hit Rate** | % of attacks that hit |
| **MAC Efficiency** | Average weapons consolidated per attack |
| **Crew Casualties** | Wounded / incapacitated count |
| **Escape Success** | Did player evade? |
| **Profit/Loss** | Salvage value minus repair costs |

**Balance Feedback Loop:**
- Run 100 bot-vs-bot encounters overnight
- Aggregate: win rates by ship class, weapon efficiency, survival curves
- Feed into TL fraction system for dynamic campaign balancing

---

## 11. Implementation Plan

### Phase 1: Foundation (This Session)
- [ ] Create `src/types/encounter.ts`
- [ ] Create `src/engine/mnemeCombat.ts` (damage, MAC, range)
- [ ] Create `src/engine/crewGenerator.ts`
- [ ] Create `src/engine/aiPilot.ts` (basic decision tree)
- [ ] Create `src/components/EncounterView.tsx` (route)
- [ ] Add `/encounter` route to `App.tsx`

### Phase 2: UI Shell
- [ ] `EncounterSetup` — ship picker, scenario selector
- [ ] `EncounterMap` — tactical grid with ship tokens
- [ ] `ShipCard` — combat stats overlay

### Phase 3: Turn System
- [ ] `TurnPanel` — action queue
- [ ] `CrewFunctionPanel` — auto/micro toggle
- [ ] `CombatLog` — live log

### Phase 4: Polish
- [ ] `PostAssessment` — end-of-battle report
- [ ] Mobile gestures (double-tap, long-press)
- [ ] Scenario balance tuning

---

## 12. Deferred Features

| Feature | Reason |
|---------|--------|
| CE Space Combat mode | MSC-only by design — CE has unresolved rule gaps |
| 3D map | 2D grid is sufficient for MSC; 3D adds complexity without depth |
| Multi-player networked | Single-player vs bots first; network is Phase 3+ |
| Persistent campaign | Requires save system (M4); encounter is self-contained |

---

## 13. Files Created/Modified

| File | Action |
|------|--------|
| `FDR-070-Encounter-System.md` | This document |
| `src/types/encounter.ts` | NEW: Encounter data models |
| `src/engine/mnemeCombat.ts` | NEW: MSC combat engine |
| `src/engine/crewGenerator.ts` | NEW: Random crew generator |
| `src/engine/aiPilot.ts` | NEW: Bot AI |
| `src/engine/encounterEngine.ts` | NEW: Turn loop & state machine |
| `src/components/EncounterView.tsx` | NEW: Main encounter page |
| `src/components/encounter/*.tsx` | NEW: Sub-components |
| `src/App.tsx` | MOD: Add `/encounter` route |
| `README.md` | MOD: Update milestone status |

---

*MSC is the default. The system cannot run CE space combat because that's the reason Mneme Space Combat was built — there were gaps in the rules that needed a ruling and to be play tested.*
