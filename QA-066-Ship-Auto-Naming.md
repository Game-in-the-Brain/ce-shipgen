# QA-066: Ship Auto-Naming & Classification System

## Test Date
2026-05-01

## Scope
- Iron Triangle classification engine (`src/utils/shipClassifier.ts`)
- Editable classification rules (`public/data/ship-classifications.json`)
- Classification script (`scripts/classify-ships.mjs`)
- Integration with `saveShip()` / `loadShip()` in `ShipDesigner.tsx`
- Data integrity: drive ordering + flat field synchronization

---

## Test Results

### 1. Classification Engine

| Test | Result |
|------|--------|
| All 43 ships classified | ✅ Pass |
| S/A/P ratios sum to ~1.0 | ✅ Pass |
| Role assignment matches heuristic expectations | ✅ Pass |
| Size class correctly maps to hullDtons | ✅ Pass |
| TL shift multipliers apply correctly | ✅ Pass (TL 9 = ×1.0 baseline) |
| Ships with 0 components default to Vanguard | ✅ Pass |
| JSON rules load and parse correctly | ✅ Pass |

### 2. Data Integrity (Round-Trip Audit)

| Test | Before | After | Result |
|------|--------|-------|--------|
| Drive ordering preserved | 42 errors | 0 errors | ✅ Fixed |
| Flat fields sync with drives | 24 mismatches | 0 mismatches | ✅ Fixed |
| Total clean ships | 32/43 | **43/43** | ✅ All clean |

### 3. Classification Distribution

| Role | Count | Expected? |
|------|-------|-----------|
| Hauler | 22 | Yes — most ships are cargo/passenger designs |
| Vanguard | 17 | Yes — balanced military and patrol designs |
| Sprinter | 3 | Yes — courier and fast miner |
| Brawler | 1 | Yes — missile frigate with 55% armament |

| Size Class | Count |
|------------|-------|
| Craft (<100 DT) | 14 |
| Escort (100–999 DT) | 28 |
| Line Ship (1k–9.9k DT) | 1 |
| Capital (10k+ DT) | 0 |

### 4. Editable Rules

| Test | Result |
|------|--------|
| JSON schema valid | ✅ Pass |
| Thresholds configurable | ✅ Pass |
| Role conditions configurable | ✅ Pass |
| Class names user-editable | ✅ Pass |
| Alternate names supported | ✅ Pass |
| TL shift bands configurable | ✅ Pass |

---

## Known Limitations

1. **VEHICLE stubs** — Some entries in `all_ships_complete.json` have minimal components (e.g., "VEHICLES : 10DT Fighter, 2-Units" has 3 components with 0 dtons). These classify as Vanguard/Hauler by default because S+A+P = 0. This is expected for placeholder entries.

2. **Weapon module detection** — The `isWeaponModule()` heuristic uses keyword matching (`turret`, `bay`, `laser`, `missile`, `sand`, `railgun`, `particle`, `fusion`). Unusual weapon names may be misclassified as Payload. Users can adjust component sections in the source data if needed.

3. **Fuel inclusion in Speed** — Fuel tanks count toward the Speed pillar. In some designs (e.g., the 1,000 DT Passenger Liner with 131 DT fuel), this inflates S. This is by design — fuel enables range/speed, but GMs may wish to tweak thresholds.

4. **No UI integration yet** — The `classification` field exists on `ShipDesign` but is not yet rendered in the Ship Library cards or detail view. UI work is tracked separately.

---

## How to Regenerate Classifications

```bash
# After editing public/data/ship-classifications.json
node scripts/classify-ships.mjs

# Verify data integrity
node scripts/audit-all-ships.mjs
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | Added `order` to `DriveItem`; added `ShipClassification` and `classification` to `ShipDesign` |
| `src/utils/shipClassifier.ts` | **New** — Classification engine |
| `public/data/ship-classifications.json` | **New** — Editable rules |
| `scripts/classify-ships.mjs` | **New** — Batch classification script |
| `scripts/convert_ships.py` | Added `order` to drives; fixed flat-field first-drive policy |
| `scripts/audit-all-ships.mjs` | Updated for `order` preservation and flat-field derivation |
| `src/components/ShipDesigner.tsx` | `saveShip`/`loadShip` preserve drive order; derive flat fields; auto-classify on save |
| `FDR-066-Ship-Auto-Naming.md` | **New** — Functional design requirement |
| `QA-066-Ship-Auto-Naming.md` | **New** — This document |
| `clean-build.md` | Updated audit results and classification summary |

---

*QA Sign-off: 2026-05-01*
