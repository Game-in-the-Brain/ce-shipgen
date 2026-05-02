# FDR-066: Ship Auto-Naming & Classification System

## 1. Overview

This document defines the **Iron Triangle** ship classification framework and the auto-naming system for CE ShipGen. Every ship design is analyzed across three pillars — **Speed (S)**, **Armament (A)**, and **Payload (P)** — to determine its naval role and size class. The resulting designation (e.g., "Patrol Corvette", "Bulk Transport") is stored in the ship record and displayed in the Ship Library.

The classification rules are stored in an **editable JSON file** (`public/data/ship-classifications.json`) so users and GMs can customize terminology for their own settings.

---

## 2. The Iron Triangle

Naval architecture is a zero-sum game within a finite hull. Tonnage allocated to one pillar is tonnage stolen from the others. We define the three pillars as:

| Pillar | Symbol | Component Sections | Rationale |
|--------|--------|-------------------|-----------|
| **Speed** | S | M-Drive, J-Drive, Power Plant, Fuel | Propulsion and endurance. A ship with high S can reach distant systems quickly or maneuver aggressively. |
| **Armament** | A | Weapon, Armor | Offensive and defensive combat systems. High A means the ship is built to fight. |
| **Payload** | P | Cargo, Life Support, Command, Computer, Sensors, Software, Supplies, Modules (non-weapon), Vehicles | Everything else: crew accommodation, mission equipment, cargo, sensors, and logistics. High P means the ship is built to *do* things or *carry* things. |

> **Note:** Hull, Config, and Hull Options are **excluded** from all three pillars because they are the container, not the allocation.

---

## 3. Role Archetypes (Ratio-Driven)

A ship's **Role** is determined by which pillars dominate its tonnage ratio. We calculate:

```
S_ratio = S_tons / (S_tons + A_tons + P_tons)
A_ratio = A_tons / (S_tons + A_tons + P_tons)
P_ratio = P_tons / (S_tons + A_tons + P_tons)
```

> If total allocated tonnage is 0 (e.g., raw hull with no components), default to **Vanguard**.

### 3.1 Threshold Rules

The classification rules JSON defines thresholds for "High", "Max", "Mod" (moderate), and "Low". Default thresholds:

| Level | Threshold (% of S+A+P total) |
|-------|------------------------------|
| Max | ≥ 50% |
| High | ≥ 30% |
| Mod | ≥ 15% |
| Low | < 15% |

### 3.2 Role Matrix

| Role | S | A | P | Description |
|------|---|---|---|-------------|
| **Striker** | High | High | Low | Hits hard and fast. Relies on fleet logistics. |
| **Brawler** | Low | Max | Mod | Floating fortress. Sacrifices speed for armor and guns. |
| **Vanguard** | Mod | Mod | Mod | Balanced multi-role workhorse. Independent operations. |
| **Sprinter** | Max | Low | Low | All engines and fuel. Point-A-to-Point-B as fast as possible. |
| **Hauler** | Low | Low | Max | Cargo/passenger specialist. Minimal combat capability. |
| **Support** | Mod | Low | Max | Specialized logistics or tactical support. Carries other assets. |

### 3.3 Tie-Breaking

When a ship qualifies for multiple roles, apply in priority order:
1. **Brawler** (Max A always wins — a ship bristling with guns is a Brawler)
2. **Sprinter** (Max S wins — if it's all engines, it's a Sprinter)
3. **Hauler** (Max P wins — if it's all cargo, it's a Hauler)
4. **Striker** (High S + High A)
5. **Support** (Mod S + Low A + High P)
6. **Vanguard** (default / balanced)

---

## 4. Size Categories (Tonnage-Driven)

Size is determined purely by `hullDtons`:

| Size Class | DT Range | Description |
|------------|----------|-------------|
| **Craft** | 1 – 99 | Small craft, fighters, boats, shuttles |
| **Escort** | 100 – 999 | Corvettes, frigates, couriers, patrol ships |
| **Line Ship** | 1,000 – 9,999 | Cruisers, destroyers, bulk transports, carriers |
| **Capital** | 10,000+ | Battleships, dreadnoughts, superfreighters, fleet carriers |

---

## 5. Class Generation Table

Combine **Role** (row) + **Size** (column) to get the class name:

| Role \ Size | Craft (<100) | Escort (100-999) | Line Ship (1k-9.9k) | Capital (10k+) |
|-------------|--------------|------------------|---------------------|----------------|
| **Striker** | Interceptor | Torpedo Boat | Destroyer | Battlecruiser |
| **Brawler** | Gunboat | System Defense Boat | Heavy Frigate | Battleship |
| **Vanguard** | Cutter | Patrol Corvette | Cruiser | Command Cruiser |
| **Sprinter** | Pinnace | Courier / Express | Fast Fleet Scout | Dispatch Carrier |
| **Hauler** | Lighter / Launch | Freighter / Trader | Bulk Transport | Superfreighter |
| **Support** | Assault Shuttle | Repair Tender | Light Carrier / Assault | Fleet Carrier |

> The slash notation (e.g., "Courier / Express") means either term is acceptable; the primary is listed first.

---

## 6. Technology Level Context Shift

At higher TLs, drives become more efficient and hulls grow larger. A ship that was a Line Ship at TL 9 may be reclassified as an Escort at TL 12. The classification JSON allows **TL breakpoints** that shift size thresholds:

| TL Band | Threshold Multiplier | Effect |
|---------|---------------------|--------|
| TL 9-10 | ×1.0 (baseline) | 2,000 DT = Line Ship |
| TL 11-12 | ×1.5 | 2,000 DT = Escort; 15,000 DT = Line Ship |
| TL 13-14 | ×2.5 | 2,000 DT = Craft-sized by doctrine; 25,000 DT = Line Ship |
| TL 15+ | ×5.0 | Capital ships routinely 50,000+ DT |

The **effective size class** is computed by comparing `hullDtons` against the TL-shifted thresholds. The *actual* tonnage is always stored; only the *designation* shifts.

---

## 7. Editable Classification JSON

All rules live in `public/data/ship-classifications.json`. Users can edit this file to rename classes, adjust thresholds, or add custom roles.

### 7.1 Schema

```typescript
interface ShipClassifications {
  version: string;           // "1.0"
  thresholds: {
    max: number;             // 0.50
    high: number;            // 0.30
    moderate: number;        // 0.15
    low: number;             // 0.00 (implicit)
  };
  sizeCategories: {
    id: string;              // "craft"
    name: string;            // "Craft"
    minDt: number;           // 1
    maxDt: number;           // 99
  }[];
  tlShifts: {
    tlMin: number;
    tlMax: number;
    multiplier: number;
  }[];
  roles: {
    id: string;              // "striker"
    name: string;            // "Striker"
    description: string;
    conditions: {
      s: 'max' | 'high' | 'moderate' | 'low';
      a: 'max' | 'high' | 'moderate' | 'low';
      p: 'max' | 'high' | 'moderate' | 'low';
    };
    priority: number;        // 1 = highest
  }[];
  classTable: {
    roleId: string;
    sizeId: string;
    primaryName: string;
    alternateNames: string[];
  }[];
}
```

---

## 8. Classification Algorithm

```
function classifyShip(ship, rules):
  // 1. Calculate S, A, P tonnage from components
  S = sum of M-Drive + J-Drive + Power Plant + Fuel dtons
  A = sum of Weapon + Armor dtons
  P = sum of Cargo + Life Support + Command + Computer + Sensors
      + Software + Supplies + Modules(non-weapon) + Vehicles dtons

  total = S + A + P
  if total == 0: return defaultClass(ship.hullDtons, rules)

  S_ratio = S / total
  A_ratio = A / total
  P_ratio = P / total

  // 2. Determine levels
  sLevel = levelOf(S_ratio, rules.thresholds)  // max/high/moderate/low
  aLevel = levelOf(A_ratio, rules.thresholds)
  pLevel = levelOf(P_ratio, rules.thresholds)

  // 3. Find matching role (priority order)
  role = null
  for r in rules.roles sorted by priority asc:
    if matches(sLevel, aLevel, pLevel, r.conditions):
      role = r
      break

  if !role: role = vanguardRole  // fallback

  // 4. Determine size class (with TL shift)
  size = effectiveSize(ship.hullDtons, ship.tl, rules)

  // 5. Look up class name
  classEntry = rules.classTable.find(ct => ct.roleId == role.id && ct.sizeId == size.id)
  name = classEntry ? classEntry.primaryName : "Unknown"

  return {
    role: role.name,
    roleId: role.id,
    sizeClass: size.name,
    sizeId: size.id,
    className: name,
    ratios: { s: S_ratio, a: A_ratio, p: P_ratio },
    tons: { s: S, a: A, p: P, total },
    tlShifted: size.tlShifted,
  }
```

---

## 9. Integration with Ship Library

### 9.1 ShipDesign Schema Extension

```typescript
interface ShipDesign {
  // ... existing fields ...
  classification?: {
    role: string;        // "Vanguard"
    roleId: string;      // "vanguard"
    sizeClass: string;   // "Escort"
    sizeId: string;      // "escort"
    className: string;   // "Patrol Corvette"
    ratios: { s: number; a: number; p: number };
    tons: { s: number; a: number; p: number; total: number };
    tlShifted: boolean;
  };
}
```

### 9.2 UI Display

- **Ship Card**: Show class name as a badge (e.g., "Patrol Corvette") alongside TL and DT.
- **Ship Detail**: Show the Iron Triangle as a mini bar chart (S/A/P percentages).
- **Filter**: Allow filtering the Ship Library by Role and Size Class.
- **Settings Screen**: Provide a "Regenerate Classifications" button that re-runs the classifier on all ships after the user edits `ship-classifications.json`.

### 9.3 Persistence

- When a ship is **saved**, `saveShip()` calls `classifyShip()` and stores the result in `ship.classification`.
- When a ship is **loaded**, `loadShip()` ignores `classification` (it is ephemeral, derived from components).
- The `all_ships.json` library ships are pre-classified at build time via `scripts/classify-ships.mjs`.

---

## 10. Data Cleaning Roadmap

Before the Ship Library is considered "clean", the following issues must be resolved:

| Step | Issue | Fix | Status |
|------|-------|-----|--------|
| 1 | **Drive Reordering** — `saveShip()` concatenates `[mDrive, jDrive, powerPlant]` destroying original order | Add `order` field to `DriveItem`; sort by `order` in `saveShip()` | ✅ Done |
| 2 | **Flat Field Redundancy** — `mDrive`/`jDrive`/`powerPlant` stored separately from `drives[]` | Derive flat fields from `drives.filter(type)[0]?.name` on load; deprecate storage | ✅ Done |
| 3 | **Missing Components** — Some VEHICLE entries have 0 dtons for all components | Verify `convert_ships.py` deduplication logic | ⚠️ Known limitation — VEHICLE stubs have minimal components |
| 4 | **Classification** — No `classification` field on any ship | Run `scripts/classify-ships.mjs` after fixing steps 1-2 | ✅ Done |
| 5 | **Round-Trip Verification** — Re-run `audit-all-ships.mjs` after all fixes | Target: 0 errors, 0 warnings | ✅ **43/43 clean** |

---

## 11. Glossary Integration

The auto-naming system feeds into a **Ship Glossary** (`public/data/glossary.json`) containing:

- **Naval Terms** (18 entries): Battleship, Dreadnought, Battlecruiser, Cruiser, Destroyer, Heavy Frigate, Frigate, System Defense Boat, Patrol Corvette, Torpedo Boat, Courier, Light Carrier, Fleet Carrier, Repair Tender, Dispatch Carrier, Fast Fleet Scout, Troop Transport, etc.
- **Craft Types** (7 entries): Interceptor, Gunboat, Cutter, Pinnace, Lighter, Assault Shuttle, Ship's Boat
- **Civilian Vessels** (6 entries): Freighter, Bulk Transport, Superfreighter, Yacht, Research Vessel, Tanker
- **Equipment Terms** (5 entries): M-Drive, J-Drive, Power Plant, Sand Caster, Spinal Weapon
- **Mneme-Specific Terms** (3 entries): Mneme Variant, Equipment Quality Scale (EQS), Iron Triangle

Each glossary entry links to the classification role/size it applies to via the `classification` field (`{roleId, sizeId}`), enabling contextual tooltips in the UI. The human-readable reference is in `GLOSSARY.md`.

**Coverage check:** All 24 class names from `ship-classifications.json` have corresponding glossary entries. ✅

---

## 12. Future Work

- **Component TL Variants**: Once the classification system is stable, build higher-TL versions of each component (e.g., TL 12 M-Drive, TL 15 Gravitic Drive).
- **Multi-TL Ship Libraries**: Generate parallel `all_ships_tl9.json`, `all_ships_tl12.json`, etc.
- **Auto-Build from Class**: Given a class name (e.g., "Destroyer"), auto-populate a hull with baseline S/A/P ratios.

---

## Appendix A: Example Classifications

| Ship Name | DT | S% | A% | P% | Role | Size | Class Name |
|-----------|----|----|----|----|------|------|------------|
| TL9 Fighter 10DT | 10 | 58% | 11% | 31% | Striker | Craft | Interceptor |
| TL9 Patrol Frigate 300DT | 300 | 32% | 40% | 28% | Brawler | Escort | System Defense Boat |
| TL9 Merchant Freighter 400DT | 400 | 18% | 6% | 76% | Hauler | Escort | Freighter |
| TL9 Passenger Liner 1,000DT | 1000 | 13% | 3% | 84% | Hauler | Line Ship | Bulk Transport |
| TL9 System Defense Boat 400DT | 400 | 27% | 56% | 17% | Brawler | Escort | System Defense Boat |
| TL9 Corvette 300DT | 300 | 41% | 23% | 36% | Vanguard | Escort | Patrol Corvette |

---

*Document Version: 1.0*
*Last Updated: 2026-05-01*
