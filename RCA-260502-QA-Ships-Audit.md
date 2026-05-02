# RCA: QA Ships Audit — All 43 Ship Designs

**Date:** 2026-05-02
**Scope:** `public/data/all_ships.json` + source `all_ships_complete.json`
**Method:** Automated schema validation, component analysis, source comparison
**Status:** **12 ships critically corrupted, 5 ships empty, 21 ships with data quality issues**

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Ships audited | 43 |
| Ships critically corrupted (merged multi-ship data) | **12** |
| Ships empty (design notes only, no components) | **5** |
| Ships with component tonnage > hull | **31** |
| Ships missing drives[] array | **8** |
| Ships with duplicate components | **8** |
| Ships with zero cargo | **11** |
| Ships clean (minor issues only) | **~5** |

**Root Cause:** The extraction pipeline that created `all_ships_complete.json` from the master Excel **failed to detect ship boundaries**. Multiple ships were merged into single records. Additionally, some ships were never fully designed in the Excel (only design notes exist).

---

## Issue 1: Merged Ship Data (P0 — Critical)

**Severity:** 🔴 Critical — 12 ships contain components from 2–5 different ship designs

### Affected Ships

| Ship Name | Expected Hull | Hulls Found in Components | Component Count | Actual Source Ships Merged |
|-----------|--------------|---------------------------|-----------------|---------------------------|
| TL9 PASSENGER LINER 1,000DT | 1,000DT | 1,000 + 90 + 10 + 20 | 78 | Liner + Shuttle + Fighters |
| TL9 FIGHTER 10DT, 2man, 1BL, 2M | 10DT | 10 + 10 | 38 | 2× Fighter variants |
| TL9 FIGHTER 10DT, 2man, 3M | 10DT | 10 + 20 + 200 + 400 | 73 | Fighter + Boat + Trader + Freighter |
| TL9 BOAT 10DT | 10DT | 10 + 20 + 30 + 50 | 63 | Fighter + Boat + Ship's Boat ×2 |
| TL9 MEDIUM FIGHTER 20DT, 2man, 3M | 20DT | 20 + 200 + 400 | 74 | Fighter + Trader + Freighter |
| TL9 BOAT 20DT | 20DT | 20 + 20 + 30 + 50 + 70 | 62 | Boat ×2 + Ship's Boat ×3 |
| TL9 SHIP's BOAT 30DT | 30DT | 30 + 50 + 70 + 95 | 52 | Ship's Boat ×4 |
| TL9 SHIP's BOAT 50DT | 50DT | 50 + 70 + 95 | 39 | Ship's Boat ×3 |
| TL9 SHIP's BOAT 70DT | 70DT | 70 + 95 | 26 | Ship's Boat ×2 |
| VEHICLES : 90DT Shuttle, 1-Units | 90DT | 90 + 10 + 20 + 20 | 62 | Shuttle + Fighters + Boat |
| TL9 SHUTTLE 90DT | 90DT | 90 + 10 + 20 + 20 | 67 | Shuttle + Fighters + Boat |
| TL 9 PASSENGER SHIP 200DT | 200DT | 200 + 400 | 55 | Passenger Ship + Freighter |
| TL9 FRONTIER PASSENGER 300DT | 300DT | 300 + 1,000 + 90 | 79 | Frontier + Liner + Shuttle |

### Root Cause

The master Excel lists ships in **ascending tonnage order** (10, 20, 30, 50, 70, 90, 95, 100, 200, 300, 400, 600, 1,000). The extraction script that created `all_ships_complete.json` did not detect where one ship ends and the next begins. Instead, it appears to have used a fixed row count or a weak boundary heuristic, causing each ship to "spill over" into the next ship's data.

The result is a **cascading merge**: the 10DT fighter record contains the 10DT fighter PLUS the 20DT boat, the 30DT ship's boat, etc., because each record wasn't truncated at its actual end.

### Evidence

```
TL9 FIGHTER 10DT, 2man, 3M components:
  [0-17]  10DT fighter (s1 hull, sC drive)          ✅ Correct
  [18-36] 20DT fighter (s3 hull, sE drive)          ❌ WRONG — from next ship
  [37-63] 200DT ship (2.0 hull, A drives)           ❌ WRONG — from ship 3 rows down
  [64-72] 400DT ship (4.0 hull, B drives)           ❌ WRONG — from ship 4 rows down
```

### Impact

- These 12 ships cannot be used in the Ship Designer — their component totals exceed hull by 200–900%
- Classification is completely wrong (a 10DT fighter shows as 200+ DT)
- Cost calculations are meaningless
- Load/save round-trips will produce garbage data

---

## Issue 2: Empty Ships (Design Notes Only)

**Severity:** 🔴 Critical — 5 ships have no actual ship components

### Affected Ships

| Ship | Components | What's Actually There |
|------|-----------|----------------------|
| TL9 TENDER 100DT | 3 | Design notes: "Airframe - Streamlined hull...", "Reuses 300DT Frontier Hull" |
| TL9 RESEARCH VESSEL 200DT | 3 | Same design notes (copied across multiple rows) |
| TL9 ASTEROID MINER 200DT | 3 | Same design notes |
| TL9 HABITAT RING 200DT | 3 | Same design notes |
| TL9 SURVEY VESSEL 300DT | 1 | Design note: "New Hull, Streamlined..." |

### Root Cause

In the master Excel, these ships were **never fully designed**. Instead of component rows (HULL, M-DRIVE, J-DRIVE, etc.), the rows contain **design notes and sketches**. The extraction script treated these notes as components because they were in the component column.

### Evidence

```json
{
  "section": "Airframe - Streamlined hull. Its meant to fly from a 1G world...",
  "module": "",
  "dtons": null,
  "cost": null
}
```

### Impact

- totalCost = 0
- No drives, no bridge, no weapons
- Cannot be used in the app
- `availableDtons` = hull (nothing used)

---

## Issue 3: Component Tonnage Exceeds Hull

**Severity:** 🟡 Major — 31 ships have component dtons > hull dtons

### Root Causes

1. **Merged ships** (12 ships) — Components from multiple ships sum to way over hull
2. **CE calculation convention** — Some CE designs intentionally have components that sum slightly over hull because fuel, cargo, and supplies are calculated separately or rounded
3. **Supplies counted as tonnage** — Life support supplies, repair supplies, sand packages, etc. are given dton values that may not actually consume hull space in strict CE RAW

### Example: TL 9 MERCHANT TRADER 200DT

| Component | DT |
|-----------|-----|
| Armor | 10.0 |
| M-Drive | 2.0 |
| J-Drive | 10.0 |
| Power Plant | 4.0 |
| Fuel | 24.0 |
| Bridge | 10.0 |
| Computer | 1.0 |
| Staterooms | 40.0 |
| Low Berths | 10.0 |
| Weapons | 2.0 |
| Cargo | 86.0 |
| Supplies | 7.0 |
| **Total** | **206.0** |

The ship is over by 6 DT. This is minor and likely due to rounding or the supplies being included in the Excel but not strictly part of CE hull space accounting.

---

## Issue 4: Duplicate Components

**Severity:** 🟡 Minor — 8 ships have duplicate component entries

### Root Cause

When the extraction script merged ships (Issue 1), it also duplicated components that appear in multiple merged ships:
- Hull appears 2–4 times
- Armor appears 2–3 times
- Fuel Tanks appears 2–3 times
- M-Drive appears 2–3 times (different ratings)

Non-merged ships also have some duplicates from the original Excel extraction.

---

## Issue 5: Missing Child-Table Arrays

**Severity:** 🟡 Minor — 8 ships have flat drive fields but no `drives[]` array

### Affected Ships

- VEHICLES : 10DT Fighter, 2-Units
- VEHICLES : 30DT Ship's Boat, 1-Units
- TL9 TENDER 100DT
- TL9 YACHT 100DT
- TL9 RESEARCH VESSEL 200DT
- TL9 ASTEROID MINER 200DT
- TL9 HABITAT RING 200DT
- TL9 SURVEY VESSEL 300DT

### Root Cause

These are the empty/note-only ships (Issue 2). Since they have no actual components, they also have no child-table data. The remaining ships DO have child-table data.

---

## Issue 6: Zero Cargo

**Severity:** 🟢 Low — 11 ships have cargo = 0

### Analysis

Some of these are legitimate (fighters, ship's boats, tenders that carry no cargo). Others may be missing cargo because of the extraction corruption.

| Ship | cargo | Legitimate? |
|------|-------|-------------|
| 10DT Fighter | 0 | ✅ Yes — no cargo space |
| 20DT Medium Fighter | 0 | ✅ Yes — no cargo space |
| 30DT Ship's Boat | 0 | ⚠️ Probably should have some |
| 70DT Ship's Boat | 0 | ⚠️ Probably should have some |
| 95DT Ship's Boat | 0 | ⚠️ Probably should have some |
| 100DT Tender | 0 | ⚠️ Tender should have cargo or docking space |
| 100DT Yacht | 0 | ⚠️ Yachts typically have cargo |
| 200DT Research Vessel | 0 | ❌ Empty ship (Issue 2) |
| 200DT Asteroid Miner | 0 | ❌ Empty ship (Issue 2) |
| 200DT Habitat Ring | 0 | ❌ Empty ship (Issue 2) |
| 300DT Survey Vessel | 0 | ❌ Empty ship (Issue 2) |

---

## Issue 7: All Ships TL9 Only

**Severity:** 🟢 Low — Design gap

All 43 ships are TL9. There are no TL 10–15 variants. This is a content gap, not a data bug.

---

## Recommended Fix Priority

### [P0] Fix Merged Ships (12 ships)
**Options:**
1. **Re-extract from Excel** with proper boundary detection (preferred if Excel data is intact)
2. **Manually reconstruct** from the `all_ships_complete.json` by splitting at correct HULL boundaries
3. **Delete and recreate** from CE SRD or other canonical sources

**Complexity:** High. The Excel boundary detection needs to look for:
- HULL section followed by CONFIGURATION, ARMOR, M-DRIVE, etc.
- A new HULL row with a different tonnage = new ship start
- Empty rows or END markers as ship terminators

### [P0] Fix Empty Ships (5 ships)
**Options:**
1. Build these ships from scratch in the Excel/JSON using CE rules
2. Remove them from the library until they are designed
3. Mark them as "WIP — design notes only" in the UI

### [P1] Deduplicate Components
Run `deduplicate_components()` or clean the merged ships.

### [P1] Tonnage Sanity Check
Add a CI check: `assert total_component_dtons <= hull_dtons * 1.05` (5% tolerance for rounding).

### [P2] TL Variant Generation
Create TL 10–15 variants of core designs (separate project).

---

## Clean Ships (Relatively)

These ships appear to have correct data (no merge corruption, actual components):

1. TL 9 COURIER SHIP 100DT
2. TL 9 YACHT 100DT
3. TL9 MERCHANT FREIGHTER 400DT
4. TL9 "BOSCO" MERCHANT FREIGHTER 400DT
5. TL9 SYSTEM DEFENSE BOAT 400DT
6. TL9 MISSILE FRIGATE 400DT
7. TL9 ESCORT FRIGATE 400DT
8. TL9 RAIDER 600DT
9. TL9 PATROL FRIGATE 300DT
10. TL9 CORVETTE 300DT
11. TL9 FRONTIER TRADER 300DT
12. TL9 MERCHANT LINER 300DT

(Note: Even these may have minor tonnage overruns of 3–15 DT due to supplies/fuel rounding.)

---

## Next Steps

1. **Confirm boundary detection** in `convert_ships.py` or the upstream extraction script
2. **Re-extract** the small craft series (10DT → 95DT) individually
3. **Build the 5 empty ships** from CE SRD formulas
4. **Re-run QA** after fixes to verify all 43 ships pass
5. **Add CI gate**: `npm run qa-ships` must pass before any PR merges

---

*Audit completed 2026-05-02. All findings logged. Fix options require user decision on P0 priority.*
