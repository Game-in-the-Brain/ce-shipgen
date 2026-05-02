# FDR-068: Procedural Ship Design

**Status:** Draft
**Priority:** Critical (M3+ phase)
**Depends on:** M3 Ship Designer complete, M2.8 QA Ships passed
**Blocks:** None (future milestone)

---

## 1. Summary

A procedural generation system that builds complete ship designs from **high-level player priorities** rather than requiring manual component-by-component construction (Bill of Materials / BOM).

**Core Principle:** Players allocate abstract priorities (Combat, Speed, Cargo, Passengers, Range, Cost). An algorithm translates these into concrete CE RAW components, producing a valid ship with full BOQ.

**Definition of Done:**
- Player can select hull size, TL, and 3–5 priority sliders
- Algorithm produces a valid CE-compliant ship with ≤5% unused hull capacity
- Generated ship can be saved to library, exported, and edited in the Ship Designer
- Documentation explains the method so players understand *why* the algorithm made each choice

---

## 2. Player Interface

### Input Stage

```
┌─────────────────────────────────────────┐
│  PROCEDURAL DESIGNER                    │
├─────────────────────────────────────────┤
│  Hull: [100 DT ▼]                       │
│  TL:   [9 ▼]                            │
│                                         │
│  PRIORITIES (100 points to allocate)    │
│  ⚔️ Combat      [████░░░░░░] 25         │
│  🚀 Speed       [████░░░░░░] 25         │
│  📦 Cargo       [██░░░░░░░░] 15         │
│  👥 Passengers  [██░░░░░░░░] 15         │
│  🔋 Range       [██░░░░░░░░] 10         │
│  💰 Cost        [██░░░░░░░░] 10         │
│                                         │
│  [✨ GENERATE SHIP]                     │
└─────────────────────────────────────────┘
```

### Presets

| Preset | Combat | Speed | Cargo | Passengers | Range | Cost |
|--------|--------|-------|-------|------------|-------|------|
| **Courier** | 5 | 40 | 5 | 10 | 30 | 10 |
| **Free Trader** | 10 | 15 | 40 | 20 | 10 | 5 |
| **Patrol Cruiser** | 35 | 25 | 5 | 10 | 20 | 5 |
| **Q-Ship** | 40 | 10 | 30 | 5 | 10 | 5 |
| **Passenger Liner** | 5 | 20 | 5 | 50 | 15 | 5 |
| **Custom** | Player-defined | | | | | |

---

## 3. Algorithm Overview

### Phase 1: Skeleton (Mandatory Systems)

Allocate tonnage to systems required for a functional starship:

```
Skeleton Budget = Hull × 0.35 (typical)

1. Hull Configuration (config from priority)
   - Speed > 30 → Streamlined (+10% hull cost, 0 DT)
   - Combat > 30 → Standard (cheaper, 0 DT)
   - Cargo > 30 → Standard

2. Armor (from Combat priority)
   - Combat 0–10 → None (0 DT)
   - Combat 11–25 → Titanium Steel, qty=1 (5% hull DT)
   - Combat 26–40 → Titanium Steel, qty=2 (10% hull DT)
   - Combat 41–55 → Bonded Superdense, qty=2 (10% hull DT)
   - Combat 56+ → Bonded Superdense, qty=3 (15% hull DT)

3. Power Plant (from hull size + TL)
   - Minimum rating = M-Drive rating + J-Drive rating + 2 (systems)
   - TL 9 → Fusion Plant
   - TL 12+ → Advanced Fusion

4. M-Drive (from Speed priority)
   - Speed 0–10 → Rating A (Thrust 1)
   - Speed 11–25 → Rating B–C (Thrust 2–3)
   - Speed 26–40 → Rating D–F (Thrust 4–6)
   - Speed 41+ → Rating G+ (Thrust 7+)

5. J-Drive (from Range priority)
   - Range 0–10 → Jump-1
   - Range 11–30 → Jump-2
   - Range 31–50 → Jump-3
   - Range 51+ → Jump-4+ (if TL permits)

6. Fuel Tanks
   - Jump Fuel = Hull × 0.1 × Jump Number
   - Power Fuel = PP rating × 0.5 × weeks (default 4)

7. Bridge / Cockpit
   - Hull < 50 → Cockpit (3 DT)
   - Hull 50–199 → Bridge 10-ton (10 DT)
   - Hull 200–999 → Bridge 20-ton (20 DT)
   - Hull 1000+ → Bridge 40-ton (40 DT)

8. Computer
   - TL 9 → Model 1 or 2 (1–2 DT)
   - TL 11+ → Model 3+ (3+ DT)
   - Combat > 30 → Hardened (+cost)

9. Sensors
   - Combat > 25 → Military Grade
   - Standard otherwise

10. Software
    - Interface, Database (always)
    - Combat > 20 → Fire Control
    - Speed > 30 → Maneuver
```

### Phase 2: Payload (Remaining Budget)

```
Remaining = Hull − Skeleton

1. Passengers (from Passengers priority)
   - Points 0–10 → 0 staterooms
   - Points 11–25 → 1 stateroom per 20 DT hull
   - Points 26–50 → 1 stateroom per 10 DT hull
   - Points 51+ → 1 stateroom per 5 DT hull
   - Low Berths = Passengers / 10 (min 0, max staterooms × 2)

2. Weapons (from Combat priority)
   - Combat 0–10 → None
   - Combat 11–25 → 1 turret (pulse laser or sand caster)
   - Combat 26–40 → 2 turrets (mixed loadout)
   - Combat 41–55 → 3 turrets + 1 missile rack
   - Combat 56+ → Max hardpoints, mixed loadout

3. Cargo (from Cargo priority)
   - Cargo DT = Remaining after passengers and weapons
   - If Cargo priority > 30, sacrifice 1 stateroom for +4 DT cargo
   - If Cargo priority > 50, sacrifice 1 weapon mount for +2 DT cargo

4. Vehicles / Craft (from Range + Cargo)
   - Hull > 400 + Range > 20 → 1 shuttle (90 DT)
   - Hull > 600 + Range > 30 → 2 shuttles or 1 boat
   - Hull > 1000 + Passengers > 40 → Escape pods

5. Special Systems
   - Combat > 30 + Hull > 200 → Fuel Scoops (2 DT)
   - Range > 40 → Fuel Processor (2 DT)
   - Cargo > 40 → Cargo Crane (1 DT)
```

### Phase 3: Optimization

```
If used > hull:
  1. Downgrade armor by 1 level
  2. Reduce cargo by 5%
  3. Remove 1 low berth per 2 DT needed
  4. If still over, downgrade J-Drive by 1 jump
  5. If still over, reduce M-Drive thrust by 1
  
If used < hull × 0.85:
  1. Add cargo to fill gap
  2. Or upgrade armor if Combat > 20
  3. Or add spare parts/supplies
```

### Phase 4: Cost Calculation

Run all components through CE cost tables:
- Hull cost = base × config modifier
- Armor cost = hull cost × armor modifier × qty
- Drive costs from `ship_drives.json`
- Bridge cost from `ship_bridge.json`
- Computer cost from `ship_computers.json`
- Weapon costs from `ship_weapons.json`

Apply Cost priority:
- Cost > 30 → Choose cheapest option at each decision point
- Cost < 10 → Choose best option regardless of price
- Cost 10–30 → Balanced (default algorithm)

---

## 4. Output Format

The procedural designer produces a full `ShipDesign` JSON:

```json
{
  "id": "proc-20260502-merchant-trader-200",
  "name": "200-ton Free Trader (Procedural)",
  "tl": 9,
  "hullCode": "200",
  "hullDtons": 200,
  "configuration": "Standard",
  "armor": "Titanium Steel TL7+",
  "armorQty": 1,
  "mDrive": "A",
  "jDrive": "A",
  "powerPlant": "A",
  "bridge": "10-ton Bridge",
  "computer": "M1, R5 J-Spec Hardened",
  "software": ["Interface TL 7", "Database TL 7", "Maneuver TL 9"],
  "sensors": "Standard",
  "staterooms": 10,
  "lowBerths": 20,
  "cargo": 86,
  "components": [...],
  "totalCost": 41123999,
  "availableDtons": 0,
  "createdAt": "2026-05-02T00:00:00Z",
  "drives": [...],
  "commandControl": [...],
  "computers": [...],
  "softwareList": [...],
  "sensorList": [...],
  "lifeSupport": [...],
  "weaponMounts": [...],
  "supplies": [...],
  "procedural": {
    "priorities": {
      "combat": 10,
      "speed": 15,
      "cargo": 40,
      "passengers": 20,
      "range": 10,
      "cost": 5
    },
    "preset": "free-trader",
    "algorithmVersion": "1.0"
  }
}
```

The `procedural` metadata block lets players see *why* the ship was built this way and allows the algorithm to be re-run with adjusted priorities.

---

## 5. Integration Points

### UI Location
- **Tab:** "Procedural" (next to "Designer" and "Library")
- **Layout:** Slider panel on left, live preview (BOQ) on right
- **Actions:** Generate → Preview → Save to Library → Edit in Designer

### State Management
```typescript
interface ProceduralDesign {
  hullDtons: number;
  tl: number;
  priorities: Record<string, number>;
  generatedShip: ShipDesign | null;
}
```

Store in `tableStore.ts` or a new `proceduralStore.ts`.

### Validation
- Before saving: Run `validateShip()` against CE tables
- If validation fails: Show error, suggest priority adjustments
- If fuel insufficient for jump: Warn player, reduce jump range or increase hull

---

## 6. Documentation for Players

### In-App Help Text

> **Procedural Design** builds a ship for you based on your priorities. You don't need to know every rule — just tell the system what matters most, and it will pick components that fit.
>
> The algorithm follows **Cepheus Engine RAW** Chapter 8. Every choice is rules-legal. You can always open the generated ship in the Designer to tweak individual components.
>
> **Tips:**
> - High Combat means armor, weapons, and hardened systems
> - High Speed means bigger M-Drive and Streamlined hull
> - High Cargo means more hold space, fewer passengers
> - High Range means bigger J-Drive and more fuel tanks
> - High Cost priority makes the algorithm choose cheaper options

### External Docs
- `docs/procedural-design-method.md` — Full algorithm explained for advanced users
- `docs/procedural-examples.md` — 10 example designs with priority breakdowns

---

## 7. Milestone Placement

| Milestone | Scope | Status |
|-----------|-------|--------|
| M3.4: Procedural Design | FR-035 — Slider UI + algorithm + presets | 🎯 Post-M3 |
| M3.5: Procedural Presets | FR-036 — 6 presets + custom save | ⏳ Post-M3.4 |
| M4: Advanced Procedural | FR-037 — Faction variants, TL auto-select, role-based generation | ⏳ Post-M3.5 |

---

## 8. Acceptance Criteria

- [ ] Player can generate a valid 200DT Free Trader from "Free Trader" preset in <3 seconds
- [ ] Generated ship passes `validateShip()` with 0 failures
- [ ] Player can adjust sliders and re-generate without page reload
- [ ] Generated ship saves to library and loads in Ship Designer
- [ ] Algorithm produces at least 6 canonical ship types (Courier, Trader, Patrol, Liner, Fighter, Tender)
- [ ] Documentation exists and is understandable by a player who has never read CE Chapter 8

---

*Awaiting M3 completion before implementation.*
