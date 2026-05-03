# Mneme Space Combat — Process & Order Review

> **Date:** 2026-05-03  
> **Scope:** Current implementation vs Mneme RAW v2.45  
> **Status:** ⚠️ Significant gaps identified — engine is playable but not RAW-compliant

---

## 1. Combat Sequence (RAW vs Implemented)

### RAW Phase Order (from MNEME_ACTIONS_AND_REACTIONS.md)

```
1. INITIATIVE      → 2D6 + thrust/leadership modifiers
2. CAPTAIN PHASE   → Leadership, tactics, orders
3. NAVCOMM PHASE   → Sensors, navigation, ECM
4. ENGINEER PHASE  → Power, repairs, overdrive
5. PILOT PHASE     → Maneuver, evade, position
6. GUNNER PHASE    → Fire weapons, missiles
7. OTHERS PHASE    → Any remaining actions
8. REACTIONS       → Resolve as triggered
9. DAMAGE PHASE    → Apply damage at END of round
```

### Current Implementation (encounterEngine.ts)

```
1. Player sets functions via UI (or AI generates them)
2. resolveTurn() processes ALL functions in a SINGLE LOOP
   → No phase separation
   → No initiative roll
   → All actions resolved simultaneously in arbitrary order
3. Damage applied immediately per action
   → NOT at end of round
   → No simultaneous destruction possible
```

**VERDICT:** ❌ **WRONG** — Current engine has no phase concept. Needs complete rewrite.

---

## 2. Initiative (RAW vs Implemented)

| Aspect | RAW | Current |
|--------|-----|---------|
| Roll | 2D6 + thrust modifier + leadership modifier | ❌ Not implemented |
| Thrust bonus | Side with higher lowest thrust gets +1 | ❌ Not implemented |
| Leadership | Captain's Leadership skill adds DM | ❌ Not implemented |
| Phase order | Captain → NavComm → Engineer → Pilot → Gunner → Others | ❌ Single loop |

**VERDICT:** ❌ **MISSING** — Initiative system not implemented at all.

---

## 3. Action Economy (RAW vs Implemented)

### RAW Action System

| Action Type | Cost | Effect |
|-------------|------|--------|
| Minor Action (MA) | 1 MA | Basic action |
| Standard Action (SA) | 2 MA | 2× minor actions |
| Full Action (FA) | 3 MA + reaction | DM+2 to roll |
| Reaction (RA) | 1 RA/round | Triggered response |

**3 Minor Actions per turn. 1 Reaction base per round.**

### Current Implementation

- No MA/SA/FA/RA concept
- Each crew member gets ONE action per turn
- No reaction system
- No action cost economy

**VERDICT:** ❌ **WRONG** — Completely different action system.

---

## 4. Damage Resolution (RAW vs Implemented)

### RAW Damage Formula

```
Damage = Weapon Damage + Effect + MAC - Armor
```

- HP = Dtons of component
- Hull = 10% ship Dtons
- Structure = 10% ship Dtons
- Damage resolved at **END OF ROUND**
- Ships can **simultaneously destroy each other**

### Current Implementation (mnemeCombat.ts:74-128)

```typescript
// WRONG: Flat TN=8 (should be 8 + adversary DM)
const tn = 8;

// WRONG: 1:1 armor absorption
if (remaining > 0 && defender.armor > 0) {
  armorDmg = Math.min(remaining, defender.armor);
  remaining -= armorDmg;
}

// WRONG: Damage applied immediately per action
// NOT at end of round
```

**VERDICT:** ❌ **WRONG** — 
- TN should be `8 + adversary DM`, not flat 8
- Damage should be compared to HP pool, not subtracted 1:1
- No minimum effect of 1
- No double effect on natural 12
- Damage not resolved at end of round

---

## 5. Range System (RAW vs Implemented)

### RAW Range Bands (7 bands)

| Band | Distance | Weapon DM | Sensor DM |
|------|----------|-----------|-----------|
| Adjacent | <1 km | +6 sensors | — |
| Close | 1-9.9 km | +4 sensors | Sand/Pulse max |
| Short | 10-999 km | +2 sensors | Beam/Fusion max |
| Medium | 1K-9.9K km | ±0 | — |
| Long | 10K-24.9K km | -2 sensors | PBeam max |
| Very Long | 25K-49.9K km | -4 sensors | — |
| Distant | 50+ space | -6 sensors | Missile max |

**Weapon rules:** DM+2 closer than max, DM-2 at 1 band beyond max, cannot fire beyond 1 band past max.

### Current Implementation (mnemeCombat.ts:33-61)

```typescript
export type RangeBand = 'long' | 'medium' | 'short' | 'boarding';  // 4 bands

// WRONG: Only 4 bands (missing Adjacent/Close/VeryLong/Distant)
// WRONG: Range modifiers are multipliers (1.0, 0.5, 0.2) instead of DM+2/-2
// WRONG: Boarding range exists but not in RAW 7-band system
```

**VERDICT:** ❌ **WRONG** — Only 4 of 7 bands implemented. Modifiers are completely wrong.

---

## 6. MAC Table (RAW vs Implemented)

### RAW MAC Table

| Attacks | Attack DM | Extra Damage |
|---------|-----------|--------------|
| 1 | +0 | +0 |
| 2 | +1 | +1 |
| 5 | +1 | +1D6 |
| 10 | +2 | +2D6 |
| 20 | +3 | +3D6 |
| 50 | +4 | +4D6 |
| 100 | +5 | +5D6 |
| 200 | +6 | +6D6 |
| 500 | +7 | +7D6 |

### Current Implementation (mnemeCombat.ts:17-22)

```typescript
export function calcMacPotential(weaponCount: number): MacResult {
  if (weaponCount >= 10) return { attackDm: 2, extraDamage: '+2D6' };
  if (weaponCount >= 5) return { attackDm: 1, extraDamage: '+1D6' };
  if (weaponCount >= 2) return { attackDm: 1, extraDamage: '+1' };
  return { attackDm: 0, extraDamage: '+0' };
}
```

**VERDICT:** ❌ **INCOMPLETE** — Stops at 10 attacks. Missing 20/50/100/200/500 tiers.

---

## 7. Superiority (RAW vs Implemented)

### RAW Superiority

- Count: stations + turrets + bays + sensors + fighters
- **NOT tonnage-based**
- DM: +1 (1-2 diff), +2 (3-5), +3 (6-10), +4 (11-20), +5 (21+)

### Current Implementation (mnemeCombat.ts:133-144)

```typescript
export function calcSuperiorityDm(friendlyForces: number, enemyForces: number) {
  const ratio = friendlyForces / enemyForces;  // Uses raw numbers, not counts
  if (ratio >= 3) return { dm: -4, label: 'Overwhelming (3:1+)' };
  // ... ratio-based, not count-based
}
```

**VERDICT:** ❌ **WRONG** — Uses force ratio instead of counting stations/turrets/bays/sensors.

---

## 8. Crew Roles & Functions (RAW vs Implemented)

### RAW Crew Roles (from MNEME_SHIP_CREW_DESIGN.md)

| Role | Phase | Key Actions |
|------|-------|-------------|
| Captain | 1st | Leadership, Tactics, Orders |
| NavComm | 2nd | Sensors, Navigation, ECM |
| Engineer | 3rd | Power, Repairs, Overdrive |
| Pilot | 4th | Maneuver, Evasion, Position |
| Gunner | 5th | Fire, Missiles |
| Others | 6th | Miscellaneous |

**Additional RAW roles:** NavComm Assistant, Captain's Assistant, Copilot

### Current Implementation (aiPilot.ts:98-122)

```typescript
switch (crew.role) {
  case 'pilot': action = 'maneuver'; break;
  case 'gunner': action = 'fire'; break;
  case 'engineer': action = 'ecm'; break;
  case 'sensor': action = 'sensor'; break;
  case 'commander': action = 'sensor'; break;
  case 'medic': action = 'repair'; break;
}
```

**VERDICT:** ⚠️ **SIMPLIFIED** — Roles exist but no phase order. Missing NavComm, Captain's Assistant, Copilot, NavComm Assistant.

---

## 9. Hit Location (RAW vs Implemented)

### RAW Hit Location Table

Roll 2D6 for location when hit:

| 2D6 | External | Internal | Small Craft |
|-----|----------|----------|-------------|
| 2 | Hull | Structure | Hull |
| 3 | Sensors | Power Plant | Power Plant |
| 4 | M-Drive | J-Drive | Hold/Vehicle |
| 5 | Turret | Bay | Fuel |
| 6 | Hull | Structure | Hull |
| 7 | Armor | Crew | Armor |
| 8 | J-Drive | Fuel | Sensors |
| 9 | Power Plant | Hold | M-Drive |
| 10 | Bay | Sensors | Bay |
| 11 | Structure | M-Drive | Structure |
| 12 | Crew | Turret | Crew |

### Current Implementation

❌ **NOT IMPLEMENTED** — No hit location system. All damage goes to armor → hull → structure.

---

## 10. What's Currently CORRECT ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Basic encounter setup | ✅ | Scenarios, ship conversion |
| AI decision tree | ✅ | Functional but simplified |
| Turn counter | ✅ | Basic turn tracking |
| Auto-resolve | ✅ | Works up to 100 turns |
| Post-assessment | ✅ | Victory/defeat, metrics |
| Scenario presets | ✅ | Pirate, Raider, Patrol, Convoy |
| Crew generation | ✅ | Basic crew with stats |
| Token display | ✅ | Just integrated |

---

## 11. Priority Fix List

### P0 — Critical (Breaks RAW)
1. **Implement 7 range bands** with correct DM+2/-2 modifiers
2. **Fix damage formula** to `Weapon + Effect + MAC - Armor` vs HP pool
3. **Add phase order** (Captain → NavComm → Engineer → Pilot → Gunner → Others)
4. **Implement initiative** (2D6 + thrust/leadership)
5. **Resolve damage at end of round** (simultaneous destruction)

### P1 — Major (Significantly wrong)
6. **Complete MAC table** to 500 attacks
7. **Fix superiority** to count stations/turrets/bays/sensors (not tonnage)
8. **Add action economy** (MA/SA/FA/RA)
9. **Add hit location table** (2D6 roll)
10. **Add crew roles** (NavComm, Captain's Assistant, Copilot, NavComm Assistant)

### P2 — Minor (Polish)
11. **Add reactions** (13 reaction types from RAW)
12. **Add called shots** (DM-2 to target specific sections)
13. **Add ECM/EW rules** properly
14. **Add weapon-specific max ranges** (Sand=Close, Beam=Medium, etc.)
15. **Add boarding/ramming rules**

---

## 12. Recommended Implementation Order

```
Phase 1: Core Mechanics (P0)
  └─ Replace entire mnemeCombat.ts with RAW-compliant engine
  └─ Add 7 range bands + weapon range limits
  └─ Add phase-based turn resolution
  └─ Add initiative system
  └─ Fix damage = Weapon + Effect + MAC - Armor

Phase 2: Combat Flow (P1)
  └─ Add action economy (MA/SA/FA/RA)
  └─ Complete MAC table
  └─ Add hit location system
  └─ Fix superiority calculation

Phase 3: Advanced (P2)
  └─ Add reactions
  └─ Add crew role expansions
  └─ Add boarding/ramming
  └─ Add sensor/ECM depth
```

---

## 13. Files to Modify

| File | Changes Needed |
|------|---------------|
| `src/engine/mnemeCombat.ts` | Complete rewrite — damage, range, MAC, superiority |
| `src/engine/encounterEngine.ts` | Add phase order, initiative, end-of-round damage |
| `src/engine/aiPilot.ts` | Add phase-aware AI, proper role actions |
| `src/engine/crewGenerator.ts` | Add NavComm, Assistant roles |
| `src/types/encounter.ts` | Add phase types, action economy types |
| `src/components/EncounterView.tsx` | Add phase UI, initiative display |

---

*This review is based on the extracted Mneme Space Combat Rules v2.45 (MNEME_*.md files).*
