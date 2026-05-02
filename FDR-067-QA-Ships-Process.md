# FDR-067: QA Ships Process

**Status:** Draft
**Priority:** Critical (P0)
**Depends on:** M2.7 complete, ship library loaded
**Blocks:** M3 Ship Designer validation

---

## 1. Summary

A recurring quality-assurance process that validates every ship in the library against schema integrity, calculation correctness, and design feasibility. Any ship that fails QA generates an RCA (Root Cause Analysis). The process repeats until all ships pass.

**Definition of Done:**
- All ships in `public/data/all_ships.json` pass automated QA
- All RCA findings are resolved or documented as known limitations
- The Taxonomy (`RECOMMENDATION-Ship-Types-Taxonomy-v1.1.md`) has been reviewed and updated based on QA discoveries
- A CI gate prevents merging ship data that fails QA

---

## 2. QA Checklist (Per Ship)

### Schema Integrity
- [ ] `id` is unique across library
- [ ] `name` is non-empty
- [ ] `hullDtons` > 0
- [ ] `tl` is 9–15 (or within configured range)
- [ ] `drives[]` exists if ship has propulsion
- [ ] `components[]` is non-empty (actual ship data, not design notes)
- [ ] Child tables (`commandControl`, `computers`, `softwareList`, `sensorList`, `lifeSupport`, `weaponMounts`, `supplies`) are populated if flat fields exist

### Calculation Correctness
- [ ] `totalCost` > 0 (for hull > 10 DT)
- [ ] `cargo` >= 0
- [ ] `availableDtons` = `hullDtons` − `usedTons` ± 5% tolerance
- [ ] Component tonnage sum ≤ `hullDtons` × 1.05
- [ ] No duplicate components (same `section` + `module` within a ship)

### Design Feasibility
- [ ] Hull + Config + Armor + Drives + Fuel + Bridge + Computer + Life Support + Weapons + Cargo + Supplies ≤ hull
- [ ] Fuel capacity covers at least 1 jump (if jump-capable)
- [ ] Power plant rating >= M-Drive + J-Drive + basic systems requirement
- [ ] Crew count >= minimum for hull size (if `shipOperations` calculated)

### Round-Trip Integrity
- [ ] `loadShip(ship)` → `saveShip()` produces identical `drives[]` order
- [ ] `loadShip(ship)` → `saveShip()` preserves all child-table data
- [ ] Export JSON → Import JSON produces equivalent ship

---

## 3. RCA Process

When a ship fails QA:

1. **Log the failure** with ship name, failing check, expected vs actual values
2. **Classify severity:**
   - **P0 (Critical):** Ship is unusable (merged data, empty components, negative tonnage)
   - **P1 (Major):** Ship loads but calculations are wrong (cost off by >10%, fuel insufficient)
   - **P2 (Minor):** Cosmetic or edge-case (duplicate component names, cargo rounding)
3. **Determine root cause category:**
   - **Extraction bug:** `convert_ships.py` or upstream extraction corrupted data
   - **Excel data issue:** Source spreadsheet has wrong formulas or missing rows
   - **Conversion rule mismatch:** CE vs Mneme vs MGT2E rules applied incorrectly
   - **Schema drift:** Ship was authored for old schema, needs migration
4. **Write RCA doc** following template: `RCA-YYYYMMDD-Ship-Name-Issue.md`
5. **Fix or remove:** Either fix the ship data, or remove it from the library with a WIP note
6. **Re-run QA** on the fixed ship

---

## 4. Automation

### Script: `scripts/qa-all-ships.mjs`

```javascript
// Pseudocode
const ships = loadShips('public/data/all_ships.json');
const results = { pass: [], fail: [], rcas: [] };

for (const ship of ships) {
  const report = runQAChecks(ship);
  if (report.allPass) {
    results.pass.push(ship.name);
  } else {
    results.fail.push({ name: ship.name, report });
    results.rcas.push(generateRCA(ship, report));
  }
}

writeReport(results);
if (results.fail.length > 0) process.exit(1);
```

### CI Gate

Add to `package.json`:
```json
"scripts": {
  "qa-ships": "node scripts/qa-all-ships.mjs",
  "test": "vitest run && npm run qa-ships"
}
```

---

## 5. Taxonomy Review

As QA reveals edge cases (e.g., non-jump vessels, tenders with push capacity, habitat rings), update:

- `RECOMMENDATION-Ship-Types-Taxonomy-v1.1.md`
- `public/data/ship-classifications.json`
- `public/data/glossary.json`

Example QA → Taxonomy updates:
- Discover Tender has no J-Drive but has M-Drive + docking clamps → Add Tender rules to taxonomy
- Discover Habitat Ring has no drives → Add "Stationary Habitat" classification
- Discover System Monitor exceeds armor limits → Update non-jump armor rules

---

## 6. Milestone Placement

| Milestone | Scope | Status |
|-----------|-------|--------|
| **M2.8: QA Ships** | Run QA on all 43 ships, fix P0/P1, update taxonomy | 🎯 Current (after M2.7) |
| M3.1: Hull & Foundation | Blocked until M2.8 passes | ⏳ |

---

## 7. Acceptance Criteria

- [ ] `npm run qa-ships` exits 0 with 0 failures
- [ ] `scripts/qa-all-ships.mjs` generates `qa-ships-report.json`
- [ ] All P0 and P1 RCA findings have resolution docs
- [ ] Taxonomy updated with at least 3 new entries discovered during QA
- [ ] PRD updated with M2.8 milestone

---

*Awaiting approval to proceed with M2.8 implementation.*
