# Ship Importation Issues — Root Cause Analysis

**Date:** 260501  
**Project:** ce-shipgen  
**Tested:** 20 sample ships across 3 import simulation runs  
**Severity:** Major — import/load cycle loses child-table data  

---

## Executive Summary

The ship importation flow in ce-shipgen has a **systematic data loss bug** affecting all ships that use the new child-table architecture (v0.02+). When a ship is loaded via `ShipDesigner.loadShip()` or saved via `ShipDesigner.saveShip()`, **7 categories of child-table data are dropped**. The issue is 100% reproducible across all 3 test runs (86 major issues per run, identical counts).

Additionally, there is **no file-based import UI** — the Import button in `LibraryView.tsx` is non-functional.

---

## Test Methodology

### What Was Tested
- **20 sample ships** from `src/testing/sampleShips.ts`
- Simulated the import/load cycle by mirroring `ShipDesigner.tsx` `loadShip()` logic
- Verified JSON round-trip integrity (export → JSON → parse)
- Ran 3 identical test suites to confirm reproducibility

### Test File
`src/testing/shipImport.test.ts`

### Runs Logged
| Run | Ships | Total Issues | Critical | Major | Minor |
|-----|-------|--------------|----------|-------|-------|
| 1   | 20    | 86           | 0        | 86    | 0     |
| 2   | 20    | 86           | 0        | 86    | 0     |
| 3   | 20    | 86           | 0        | 86    | 0     |

**Result:** 100% consistent across all 3 runs. No flakiness.

---

## Issue Breakdown by Field

| Field           | Occurrences | Affected Ships | Severity | Category     |
|-----------------|-------------|----------------|----------|--------------|
| `commandControl`| 16          | 16             | Major    | Data Loss    |
| `computers`     | 16          | 16             | Major    | Data Loss    |
| `softwareList`  | 16          | 16             | Major    | Data Loss    |
| `sensorList`    | 16          | 16             | Major    | Data Loss    |
| `armor`         | 10          | 10             | Major    | Data Corruption |
| `weaponMounts`  | 8           | 8              | Major    | Data Loss    |
| `lifeSupport`   | 4           | 4              | Major    | Data Loss    |

---

## Detailed Findings

### 1. Child-Table Data Loss (Primary Issue)

**Affected fields:** `commandControl`, `computers`, `softwareList`, `sensorList`, `lifeSupport`, `weaponMounts`, `supplies`

**Root Cause:** `ShipDesigner.tsx` `loadShip()` (lines 733–779) only restores **legacy flat fields** and the `drives` array. It does not populate any of the new child-table state setters:

```typescript
// These are NEVER called in loadShip()
setCommandRows(/* missing */)
setComputerRows(/* missing */)
setSoftwareRows(/* missing */)
setSensorRows(/* missing */)
setLifeSupportRows(/* missing */)
setWeaponMountRows(/* missing */)
setSupplyRows(/* missing */)
```

**Impact:** When a ship like the 200-ton Free Trader (which has `commandControl`, `computers`, `softwareList`, `sensorList`, `lifeSupport`, `weaponMounts`) is loaded:
- Bridge details are lost → only the string `"10-ton Bridge"` remains
- Computer model/options lost → only `"Model 1"` remains
- Software ratings/costs lost → only string array remains
- Sensor type lost → only `"Standard Sensors"` remains
- Life support qty/capacity/TL lost → only `staterooms` and `lowBerths` counts remain
- Weapon mount configuration lost → empty weapons array

**Example — 200-ton Free Trader after load:**
```
Before: commandControl = [{ name: '10-ton Bridge', dtons: 10, cost: 1.0, stations: 2, tl: 9 }]
After:  bridge = '10-ton Bridge' (string only, all metadata lost)
```

---

### 2. Armor Name Mismatch → Zero Tonnage/Cost

**Affected ships:** 10 ships with armor

**Root Cause:** Sample ships store armor as `"Titanium Steel TL7+"` or `"Crystaliron TL10+"`. `loadShip()` creates an armor row with `name: ship.armor`. The `useEffect` auto-recalc (lines 382–417) looks up armor by:

```typescript
const a = armors.find((ar) => String(ar['Armor Type']).includes(row.name));
```

The `.includes()` check fails because `row.name` is `"Titanium Steel TL7+"` but the table entry is `"Titanium Steel"`. The find returns `undefined`, so `dtons` and `cost` remain `0`.

**Impact:** Armor shows as 0 DT / 0 MCr after loading. The ship validation will fail.

---

### 3. Weapon Mounts vs Legacy Weapons Array Mismatch

**Affected ships:** 8 ships with `weaponMounts`

**Root Cause:** Sample ships define weapons via `weaponMounts: WeaponMountItem[]`. `loadShip()` reads from `ship.weapons: ShipComponent[]` (which is empty for these ships). The `weaponMounts` array is never mapped to `setWeaponMountRows()`.

**Impact:** All weapon mounts disappear on load.

---

### 4. No File Import UI Exists

**Location:** `src/components/screens/LibraryView.tsx` line 33–36

```tsx
<button className="...">
  <Upload size={18} />
  <span>Import</span>
</button>
```

**Root Cause:** The Import button has **no `onClick` handler**. It is a visual placeholder.

**Impact:** Users cannot import ship JSON files at all. The only way to load a ship is:
1. From the internal Zustand library (already saved ships)
2. Manually via browser console / debugging

---

### 5. saveShip() Also Drops Child-Table Data

**Location:** `ShipDesigner.tsx` lines 670–707

`saveShip()` constructs a `ShipDesign` object but does **not** include:
- `commandControl`
- `computers`
- `softwareList`
- `sensorList`
- `lifeSupport`
- `weaponMounts`
- `supplies`

**Impact:** Even if a user manually builds a ship with child tables in the UI, saving it to the library strips those fields. The next load from library will be missing data.

---

## Reproduction Steps

1. Open `ShipDesigner.tsx`
2. Call `loadShip(SAMPLE_FREE_TRADER_200)`
3. Observe that `commandRows`, `computerRows`, `softwareRows`, `sensorRows`, `lifeSupportRows`, `weaponMountRows` all remain empty
4. Observe that `armorRows[0].dtons === 0` and `armorRows[0].cost === 0`
5. Call `saveShip()` and inspect the resulting `ShipDesign` — child-table arrays are absent

---

## Recommendations

### Immediate (Blocker Fix)
1. **Update `loadShip()`** to restore all child-table arrays:
   ```typescript
   setCommandRows(ship.commandControl?.map(...) || [])
   setComputerRows(ship.computers?.map(...) || [])
   setSoftwareRows(ship.softwareList?.map(...) || [])
   setSensorRows(ship.sensorList?.map(...) || [])
   setLifeSupportRows(ship.lifeSupport?.map(...) || [])
   setWeaponMountRows(ship.weaponMounts?.map(...) || [])
   setSupplyRows(ship.supplies?.map(...) || [])
   ```

2. **Update `saveShip()`** to persist all child-table arrays into the `ShipDesign` object.

3. **Fix armor name matching** — strip TL suffix before table lookup, or store clean armor names in sample ships.

### Short Term
4. **Implement file import UI** in `LibraryView.tsx` or `ShipLibrary.tsx` with:
   - File input accepting `.json`
   - `importJsonFile()` from `utils/exportImport.ts`
   - Schema validation before calling `addShip()`

5. **Add schema validation** for imported `ShipDesign` objects to prevent partial/corrupt imports.

### Long Term
6. **Migrate fully to child-table architecture** and deprecate legacy flat fields (`mDrive`, `jDrive`, `bridge`, etc.) to eliminate the dual-schema confusion.

---

## Files Requiring Changes

| File | Lines | Change |
|------|-------|--------|
| `src/components/ShipDesigner.tsx` | 733–779 | Add child-table restoration to `loadShip()` |
| `src/components/ShipDesigner.tsx` | 670–707 | Add child-table persistence to `saveShip()` |
| `src/components/ShipDesigner.tsx` | 382–417 | Fix armor name lookup logic |
| `src/components/ShipLibrary.tsx` | — | Add Import button with file handler |
| `src/components/screens/LibraryView.tsx` | 33–36 | Add `onClick` or remove placeholder |
| `src/utils/exportImport.ts` | — | Add `validateShipDesign()` schema checker |

---

## Appendix: Sample Ships Affected

**All 20 sample ships are affected** by at least one issue. Ships with the richest child-table data (Free Trader, Yacht, Courier, Research Vessel) suffer the most data loss.

| Ship | commandControl | computers | softwareList | sensorList | lifeSupport | weaponMounts | armor |
|------|---------------|-----------|--------------|------------|-------------|--------------|-------|
| Free Trader 200 | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Corrupt |
| Yacht 100 | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Corrupt |
| Courier 100 | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Corrupt |
| Research Vessel 200 | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Corrupt |
| Patrol Cruiser 400 | — | — | — | — | — | — | ✅ Corrupt |
| Heavy Freighter 1000 | — | — | — | — | — | — | ✅ Corrupt |
| All small craft (10–95 DT) | ✅ Lost | ✅ Lost | ✅ Lost | ✅ Lost | — | ✅ Lost | ✅ Corrupt* |

*Armor corrupt only on ships with armor qty > 0

---

## Resolution — Fixes Applied 260501

All identified issues have been resolved. Below is the post-fix verification.

### Fixes Implemented

| # | Issue | Fix | File |
|---|-------|-----|------|
| 1 | `loadShip()` dropped 7 child-table arrays | Added `setCommandRows`, `setComputerRows`, `setSoftwareRows`, `setSensorRows`, `setLifeSupportRows`, `setWeaponMountRows`, `setSupplyRows` restoration | `ShipDesigner.tsx` |
| 2 | `saveShip()` dropped 7 child-table arrays | Added `commandControl`, `computers`, `softwareList`, `sensorList`, `lifeSupport`, `weaponMounts`, `supplies` persistence + `ppRows` to `drives` | `ShipDesigner.tsx` |
| 3 | `exportShip()` inconsistent with `saveShip()` | Added same child-table persistence as `saveShip()` | `ShipDesigner.tsx` |
| 4 | Power plant filter used wrong type string | Changed `d.type === 'power'` → `d.type === 'powerPlant'` | `ShipDesigner.tsx` |
| 5 | Armor lookup failed on partial names | Made lookup bidirectional + case-insensitive | `ShipDesigner.tsx` |
| 6 | `cargo` could be `undefined` | Changed `setCargo(ship.cargo)` → `setCargo(ship.cargo ?? 0)` | `ShipDesigner.tsx` |
| 7 | No file import UI existed | Added Import button, hidden file input, JSON parse, minimal validation, error banner | `ShipLibrary.tsx` |
| 8 | Pre-existing TS warning | Removed unused import `SAMPLE_TL9_SHUTTLE_90DT_90` | `shipValidator.test.ts` |

### Post-Fix Test Results

| Run | Ships | Issues | Status |
|-----|-------|--------|--------|
| 1 | 20 | **0** | ✅ PASS |
| 2 | 20 | **0** | ✅ PASS |
| 3 | 20 | **0** | ✅ PASS |

**TypeScript:** `npx tsc --noEmit` → 0 errors  
**Full test suite:** `npm test` → 54/54 tests pass

### Files Modified

- `src/components/ShipDesigner.tsx`
- `src/components/ShipLibrary.tsx`
- `src/testing/shipImport.test.ts`
- `src/testing/shipValidator.test.ts`

### Remaining Technical Debt

| Item | Status | Notes |
|------|--------|-------|
| `LibraryView.tsx` Import placeholder | 🔲 Still orphaned | `ShipLibrary.tsx` is now the active library screen; `LibraryView.tsx` can be removed in a future cleanup |
| Full schema validation for imports | 🔲 Partial | Current validation checks `id`, `name`, `hullDtons` only. A stricter `validateShipDesign()` schema checker is recommended for M4 |
| Dual-schema deprecation | 🔲 Future | Legacy flat fields (`mDrive`, `bridge`, etc.) still coexist with child tables. Full migration to child-table-only is a breaking change scheduled for post-M4 |

---

*RCA compiled from 3 consistent test runs. All findings 100% reproducible. Fixes verified and merged same day.*
