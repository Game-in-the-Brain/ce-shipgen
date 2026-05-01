# RCA: Ship Library Audit — All 43 Excel Ships

**Date:** 2026-05-01  
**Scope:** `public/data/all_ships.json` (43 ships converted from Excel)  
**Method:** Automated loadShip→saveShip round-trip simulation + schema validation  
**Status:** Analysis complete, fixes identified

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Ships audited | 43 |
| Schema errors | 0 |
| Round-trip errors | 42 |
| Round-trip warnings | 112 |
| Ships with issues | 11 |
| Ships clean | 32 |

**All issues are drive-system related.** No child-table data loss, no missing required fields, no type errors.

---

## Issue 1: Drive Reordering on Round-Trip 🔴

**Severity:** High (data integrity)  
**Affected ships:** 11 (all ships with mixed drive types)  
**Error count:** 42 type changes + 56 name changes + 56 dton changes = 154 discrepancies

### Symptom
When a ship is loaded into the Ship Designer and saved, the `drives` array is reordered. Drives that were originally in position N end up in position M, and their types appear to change when compared index-by-index.

### Root Cause

**`loadShip`** reads `ship.drives` and filters by `type` into three separate state arrays:
```javascript
setMDriveRows(driveRows.filter(d => d.type === 'thrust').map(...));
setJDriveRows(driveRows.filter(d => d.type === 'jump').map(...));
setPpRows(driveRows.filter(d => d.type === 'powerPlant').map(...));
```

**`saveShip`** reconstructs `drives` by concatenating in fixed order:
```javascript
drives: [
  ...mDriveRows.map(r => ({ ...r, type: 'thrust', driveCode: r.name })),
  ...jDriveRows.map(r => ({ ...r, type: 'jump', driveCode: r.name })),
  ...ppRows.map(r => ({ ...r, type: 'powerPlant', driveCode: r.name })),
]
```

**Result:** Original order is lost. A ship with drive order `thrust→jump→powerPlant→thrust` becomes `thrust→thrust→jump→powerPlant`.

### Example
**TL9 PASSENGER LINER 1,000DT** original `drives` order:
```
[0] thrust  "M-Drive G"
[1] jump    "J-Drive G"
[2] powerPlant "Fusion Plant G"
[3] thrust  "M-Drive sN"
[4] powerPlant "Fusion Plant sN"
[5] thrust  "M-Drive sA"
[6] powerPlant "Fusion Plant sA"
[7] thrust  "M-Drive sA"
```

After round-trip:
```
[0] thrust  "M-Drive G"
[1] thrust  "M-Drive sN"      ← was [3], type matches but index wrong
[2] thrust  "M-Drive sA"      ← was [5]
[3] thrust  "M-Drive sA"      ← was [7]
[4] jump    "J-Drive G"       ← was [1]
[5] powerPlant "Fusion Plant G" ← was [2]
[6] powerPlant "Fusion Plant sN" ← was [4]
[7] powerPlant "Fusion Plant sA" ← was [6]
```

### Impact
- **JSON export/import:** Exported ship JSON will have different drive order than original
- **Diff noise:** Comparing before/after versions shows spurious drive changes
- **No UI impact:** The designer UI organizes drives by type into separate tables, so reordering is invisible to users

### Fix Options

**Option A: Preserve order with an `order` field (Recommended)**
Add an `order` index to each drive item. `saveShip` concatenates all three arrays, then sorts by `order` before saving.

**Option B: Single flat array with type preserved**
Store drives as a single array in state (don't split into mDriveRows/jDriveRows/ppRows). The UI filters at render time.

**Option C: Accept reordering as canonical**
Document that `drives` array is always stored type-grouped. Update `convert_ships.py` to output drives in this order.

---

## Issue 2: Flat Fields vs Drives Array Mismatch 🟡

**Severity:** Medium (UX inconsistency)  
**Affected ships:** 37 of 43  

### Symptom
The legacy flat fields `mDrive`, `jDrive`, `powerPlant` don't match the first drive of each type in the `drives` array.

### Example
**TL9 PASSENGER LINER 1,000DT:**
- `mDrive: "sA"` (flat field)
- `drives[0].name: "M-Drive G"` (first thrust drive)

**TL9 FIGHTER 10DT, 2man, 3M:**
- `mDrive: "B"` (flat field)
- `drives[0].name: "M-Drive sC"` (first thrust drive)

### Root Cause
The Excel source data and `convert_ships.py` populated flat fields with one value but the drives array with different (often multiple) values. The flat fields appear to be the "primary" drive, while the `drives` array captures all drives including duplicates.

### Impact
- `loadShip` sets `setMDrive(ship.mDrive || '')` which shows `"sA"` in the legacy M-Drive dropdown
- But `setMDriveRows` populates the child table with `"M-Drive G"`, `"M-Drive sN"`, etc.
- The UI may show conflicting drive codes in different places

### Fix
**Deprecate flat fields.** The `drives` array is the source of truth. `loadShip` should derive `mDrive` from `drives.filter(type==='thrust')[0]?.name` instead of using the flat field.

---

## Issue 3: Ships with Multiple Drives of Same Type 🟡

**Severity:** Low (by design)  
**Affected ships:** 11  

### Observation
Some ships have multiple drives of the same type:
- **TL9 PASSENGER LINER 1,000DT:** 4 thrust drives, 1 jump, 3 power plants
- **TL9 BOAT 10DT:** 5 thrust drives, 3 power plants

This is valid in the rules (e.g., multiple M-Drives for redundancy, multiple power plants). The designer UI supports this via child tables. No fix needed — this is working as intended.

---

## Clean Ships (32 of 43)

These ships have no round-trip issues because they have:
- No drives array, OR
- Only one drive type (no reordering possible), OR
- Drives already in canonical order (thrust→jump→powerPlant)

---

## Recommended Actions

1. **[P1]** Fix drive reordering — implement Option A (preserve order with `order` field)
2. **[P2]** Deprecate `mDrive`/`jDrive`/`powerPlant` flat fields — derive from `drives[0]`
3. **[P3]** Update `convert_ships.py` to populate `order` field in drives
4. **[P4]** Add ship library audit to CI — run `scripts/audit-all-ships.mjs` on every build

---

## Audit Artifacts

- **Script:** `scripts/audit-all-ships.mjs`
- **Detailed report:** `scripts/ship-audit-report.json`
- **Full error log:** See below

---

## Full Error Log

### ROUNDTRIP_DRIVE_TYPE (42 errors)

| Ship | Drive Index | Original Type | Reconstructed Type |
|------|-------------|---------------|-------------------|
| TL9 PASSENGER LINER 1,000DT | 1 | jump | thrust |
| TL9 PASSENGER LINER 1,000DT | 2 | powerPlant | thrust |
| TL9 PASSENGER LINER 1,000DT | 4 | powerPlant | jump |
| TL9 PASSENGER LINER 1,000DT | 5 | thrust | powerPlant |
| TL9 PASSENGER LINER 1,000DT | 7 | thrust | powerPlant |
| TL9 FIGHTER 10DT, 2man, 3M | 1 | powerPlant | thrust |
| TL9 FIGHTER 10DT, 2man, 3M | 3 | powerPlant | thrust |
| TL9 FIGHTER 10DT, 2man, 3M | 4 | thrust | jump |
| TL9 FIGHTER 10DT, 2man, 3M | 7 | thrust | powerPlant |
| TL9 FIGHTER 10DT, 2man, 3M | 8 | jump | powerPlant |
| TL9 BOAT 10DT | 1 | powerPlant | thrust |
| TL9 BOAT 10DT | 4 | powerPlant | thrust |
| TL9 BOAT 10DT | 5 | thrust | powerPlant |
| TL9 BOAT 10DT | 7 | thrust | powerPlant |
| TL9 MEDIUM FIGHTER 20DT, 2man, 3M | 1 | powerPlant | thrust |
| TL9 MEDIUM FIGHTER 20DT, 2man, 3M | 4 | powerPlant | jump |
| TL9 MEDIUM FIGHTER 20DT, 2man, 3M | 5 | thrust | powerPlant |
| TL9 MEDIUM FIGHTER 20DT, 2man, 3M | 6 | jump | powerPlant |
| TL9 BOAT 20DT | 1 | powerPlant | thrust |
| TL9 BOAT 20DT | 3 | powerPlant | thrust |
| TL9 BOAT 20DT | 6 | thrust | powerPlant |
| TL9 BOAT 20DT | 7 | thrust | powerPlant |
| TL9 SHIP's BOAT 30DT | 1 | powerPlant | thrust |
| TL9 SHIP's BOAT 30DT | 4 | thrust | powerPlant |
| TL9 SHIP's BOAT 50DT | 1 | powerPlant | thrust |
| TL9 SHIP's BOAT 50DT | 2 | thrust | powerPlant |
| VEHICLES : 90DT Shuttle, 1-Units | 1 | powerPlant | thrust |
| VEHICLES : 90DT Shuttle, 1-Units | 3 | powerPlant | thrust |
| VEHICLES : 90DT Shuttle, 1-Units | 4 | thrust | powerPlant |
| VEHICLES : 90DT Shuttle, 1-Units | 5 | thrust | powerPlant |
| TL9 SHUTTLE 90DT | 1 | powerPlant | thrust |
| TL9 SHUTTLE 90DT | 3 | powerPlant | thrust |
| TL9 SHUTTLE 90DT | 4 | thrust | powerPlant |
| TL9 SHUTTLE 90DT | 5 | thrust | powerPlant |
| TL 9 PASSENGER SHIP 200DT | 1 | jump | thrust |
| TL 9 PASSENGER SHIP 200DT | 2 | powerPlant | jump |
| TL 9 PASSENGER SHIP 200DT | 3 | thrust | jump |
| TL 9 PASSENGER SHIP 200DT | 4 | jump | powerPlant |
| TL9 FRONTIER PASSENGER 300DT | 1 | jump | thrust |
| TL9 FRONTIER PASSENGER 300DT | 2 | powerPlant | thrust |
| TL9 FRONTIER PASSENGER 300DT | 3 | thrust | jump |
| TL9 FRONTIER PASSENGER 300DT | 6 | thrust | powerPlant |

---

*Audit completed 2026-05-01. All findings logged to `scripts/ship-audit-report.json`.*
