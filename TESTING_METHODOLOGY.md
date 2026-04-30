# CE ShipGen Testing Methodology

**Date:** 2026-04-30  
**Version:** 0.04  
**Scope:** Sample ship validation — section-by-section correctness testing

---

## Philosophy

The ship generator is only as trustworthy as its reference data. We validate by loading **known-good sample ships** and verifying that every section computes to the expected value. If a number is wrong, we perform RCA to determine whether:

1. **The sample ship data is wrong** → Fix the sample
2. **The shipgen calculation is wrong** → Fix the calc
3. **The JSON table data is wrong** → Fix the table

This prevents the "garbage in, garbage out" trap where we chase UI bugs that are actually data bugs.

---

## Sample Ship Library

Reference designs live in:

```
src/testing/sampleShips.ts          # ShipDesign objects
src/testing/shipValidator.ts        # Pure calc validation engine
src/testing/shipValidator.test.ts   # Vitest test suite
```

### Current Samples

| Ship | Tonnage | Role | Status |
|------|---------|------|--------|
| 200-ton Free Trader | 200 | Merchant | ✅ Validated |
| 100-ton Shuttle | 100 | Small Craft | ✅ Validated |
| 400-ton Patrol Cruiser | 400 | Military | ✅ Validated |
| 600-ton Subsidized Liner | 600 | Passenger | 📝 Defined |
| 1000-ton Heavy Freighter | 1000 | Cargo | 📝 Defined |

### Adding a New Sample Ship

1. Create a `ShipDesign` object in `sampleShips.ts`
2. Add inline comments documenting **expected values** for each section
3. Add a test block in `shipValidator.test.ts` with those expected values
4. Run `npm test` and verify all pass
5. If a test fails, RCA before fixing (see below)

---

## Running Tests

```bash
# Run all sample ship validation tests
npm test

# Expected output
#  ✓ src/testing/shipValidator.test.ts  (7 tests) 4ms
#  Test Files  1 passed (1)
#       Tests  7 passed (7)
```

---

## Section-by-Section Target Checklist

Use this checklist when validating a sample ship manually in the UI:

### M3.1 — Hull & Foundation

- [ ] **Hull Selection**: Dtons matches sample, cost matches table
- [ ] **HP/SP/Hardpoints**: `floor(Dtons/50)`, `ceil(Dtons/50)`, `floor(Dtons/100)`
- [ ] **Configuration**: Standard (1.0×), Distributed (0.5×), Close Structure (1.5×)
- [ ] **Armor**: Tonnage = `hull_dtons × armor% × qty × config_multiplier`
- [ ] **Drive Constraints**: Valid M-Drive, J-Drive, Power Plant letter ranges displayed

### M3.2 — Bridge to Crew

- [ ] **Fuel**: Jump = `0.1 × Dtons × parsecs`; Power = `(PP_tons / 3) × weeks`
- [ ] **Bridge**: Tonnage and cost match selected bridge size from table
- [ ] **Computer**: Model, rating, TL, options all correct
- [ ] **Software**: Programs listed, ratings match, costs sum correctly
- [ ] **Sensors**: Type, TL, DM, tonnage, cost all match table
- [ ] **Crew**: Auto-calculated from components, validated against bridge stations

### M3.3 — Fittings to BOQ

- [ ] **Accommodations**: Staterooms (4 DT each), Low Berths (0.5 DT each)
- [ ] **Features**: Modules from table, tonnage and cost correct
- [ ] **Weapons**: Turrets/Bays/Screens tonnage and hardpoint usage
- [ ] **Vehicles**: From table, tonnage and cost correct
- [ ] **Cargo**: Remaining tonnage = `hull - sum(all_components)`
- [ ] **BOQ**: Complete line-item breakdown, grand total cost correct

### Validation Rules

- [ ] **Tonnage**: Used ≤ Hull Dtons
- [ ] **Power Plant**: Letter ≥ max(M-Drive letter, J-Drive letter)
- [ ] **Hardpoints**: Weapon mounts ≤ `floor(Dtons/100)`
- [ ] **Bridge Stations**: ≥ Required crew positions
- [ ] **Tech Level**: All components ≤ Ship TL

---

## Root Cause Analysis (RCA) Workflow

When a test fails or a sample ship loads with wrong stats:

```
1. Write down the EXPECTED value (from CE SRD or sample notes)
2. Write down the ACTUAL value (from ShipDesigner)
3. Calculate the DELTA

4. Is the delta a round-number error? (e.g. off by 1, 2, 5)
   → Likely a table lookup or rounding bug in shipgen

5. Is the delta a percentage error? (e.g. 10% low, 50% high)
   → Likely a formula error (missing multiplier, wrong base)

6. Is the delta exactly double or half?
   → Likely a unit conversion error (DT vs tons, MCr vs Cr)

7. Check the JSON table first:
   cat public/data/ship_drives.json | python3 -c "import json,sys; d=json.load(sys.stdin); print([r for r in d if r['Drive Code']=='A'])"

8. Check the calculation function:
   Read src/calculations/index.ts

9. Check the sample ship data:
   Read src/testing/sampleShips.ts

10. Fix the side that is wrong. Re-run tests. Commit with RCA note.
```

---

## Sample Ship Sources

| Source | Location | Format |
|--------|----------|--------|
| CE SRD Chapter 8 | `CE-Chapter-8-Ship-Design-and-Construction.md` | Markdown rules |
| GI7B Excel | `GI7B EXTERNAL RAW CE SHIPS 231024-06 240930.xlsx` | Raw tables |
| Data tables | `public/data/*.json` | JSON arrays |
| Legacy samples | `data/sample_ships.json` | Old text format (deprecated) |

**Note:** `data/sample_ships.json` uses a legacy text-component format. New samples should be authored directly as `ShipDesign` TypeScript objects in `src/testing/sampleShips.ts`.

---

## Known Data Quality Issues

From `REPO_ANALYSIS_AND_IMPLEMENTATION_PLAN.md`:

| Table | Issue | Impact on Samples |
|-------|-------|-------------------|
| `engine_performance.json` | Numeric headers (100, 200…) not human-readable | Low — code reads them fine |
| `ship_software.json` | Column named `WEAPONS` due to Excel extraction | Medium — may confuse table editor |
| `ship_sensors.json` | Mixed naming, some empty rows | Low — validation skips empty rows |
| `ship_crew.json` | 4 empty rows at end | Low — filtered by validation |

If a sample ship test fails because of table data, fix the **table**, not the sample or the calc.

---

## Integration with CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`) currently only builds. Tests can be added:

```yaml
- name: Run sample ship tests
  run: npm test
```

This gate ensures that no PR can break validated sample ships.

---

## Future: Expanding to 30+ Ships

Target ships to add (canonical CE designs):

1. Free Trader (200t) — ✅
2. Scout/Courier (100t) — 📝
3. Patrol Cruiser (400t) — ✅
4. Subsidized Liner (600t) — 📝
5. Heavy Freighter (1000t) — 📝
6. Yacht (200t)
7. Safari Ship (200t)
8. Laboratory Ship (400t)
9. Seeker Mining Ship (400t)
10. Far Trader (200t)
11. Launch (20t)
12. Ship's Boat (30t)
13. Pinnace (40t)
14. Cutter (50t)
15. Shuttle (100t) — ✅
16. Fighter (10t)
17. System Defence Boat (400t)
18. Destroyer (1000t)
19. Light Cruiser (2000t)
20. Heavy Cruiser (3000t)
21. Battleship (5000t)
22. Carrier (5000t)
23. Fleet Escort (1000t)
24. Fleet Tender (1000t)
25. Colonial Transport (1000t)
26. Assault Lander (400t)
27. Fast Courier (200t)
28. Armored Merchant (400t)
29. Mercenary Cruiser (800t)
30. Provincial Merchant (400t)

---

*Document generated during 0.04 milestone — M2.7 Tables In Play complete, M3.1 Hull & Foundation next.*
