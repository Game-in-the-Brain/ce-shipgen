# CE ShipGen Changelog

## v0.09 — 2026-05-02

### Audit & Reconciliation System
- **Table-driven audit engine** (`src/utils/shipAuditor.ts`) — compares stored line-item values against reference tables (life support, modules, weapons, supplies, vehicles)
- **Batch audit modal** in Ship Library — shows violation counts, severity levels (critical/warning/info), per-ship breakdown
- **Auto-correct from tables** — one-click update of violating ships to table-correct values
- **Severity classification** — critical (>10% delta or zero when should be non-zero), warning (any mismatch)

### Ship Classification & Tagging
- **Iron Triangle S/A/P classifier** — computes role (Vanguard/Skirmisher/Hauler), size class, and class name from structural/arsenal/payload ratios
- **Auto-tagging system** — 12 tags (civilian, military, warship, small-craft, passenger, merchant, exploration, mining, tender, yacht, research, survey) assigned by name keywords and hull size
- **Tags displayed on ship cards** and filterable in library

### Library Filtering
- **Multi-filter search** — text search, TL dropdown, role/sizeClass dropdowns, tag filter, hull DT min-max range
- **Active filter badges** with clear button
- **Filtered library loading** in ShipDesigner — same filters apply to "Load from Library" dropdown and sidebar quick-list

### Data Quality Fixes
- **Component normalization** — all `components[]` entries use `qty: 1` with `dtons` storing totals
- **Life support naming** — counts embedded in names (e.g., "7 Stateroom", "2 Low Berth")
- **Emergency Low Berth fix** — properly distinguished from Low Berth (0.25 DT/25K Cr vs 0.5 DT/50K Cr)
- **Cargo as remainder** — computed as `hull - all_allocated` instead of extracted from Excel
- **availableDtons fix** — changed from `hull - structural_only` to `hull - all_allocated` including cargo, weapons, modules

### Ship Library Updates
- **40 ships** (34 Excel-derived + 6 SRD-built) with reconciled table-correct values
- All ships tagged and classified
- 32 ships pass audit clean, 8 ships with minor warnings (custom bay modules not in tables)

### Engineering Reference
- New **EngineeringReference** component — quick-lookup for drive performance, armor, power plant tables

---

## v0.08 — 2026-05-02

### Vehicle & Bay Handling
- Vehicle bay modules include vehicle DTons in name (e.g., "20DT Launch Bay")
- Internal vs external bay distinction — negative dtons = internal bay counts against hull
- Fuzzy matching for bay→vehicle names

### Drive Performance
- Drive performance formula replaced with Excel lookup table
- Extracted complete drive performance table (10–5000 DT hulls)
- Fixed tender push capacity calculations

### SRD Ships Rebuilt
- 6 SRD ships rebuilt from CE formulas with corrected costs (Cr units, not MCr)
- Armor cost fixed to 5% per increment for Titanium Steel

---

## v0.07 — 2026-05-02

- Vehicle/drone extraction fix — populates vehicles[] with names, dtons, cost, qty
- Supplies qty=0 bug fix — preserves fractional quantities
- Vehicle dtons inferred from name pattern when Excel omits value

---

## v0.06 — 2026-05-02

- Armor cost calculation fix — SRD per-increment formula
- Crystaliron/Bonded Superdense tonnage corrected

---

## v0.05 — 2026-05-02

- SRD-built ships use Cr cost units (was MCr)
- Luxuries per-unit values verified
- Library regeneration with corrected per-unit values

---

## v0.04 — 2026-05-02

- Merged ships fix — split 12 merged ships
- Supplies folded into cargo for ≤100 DT ships
- pushCapacity field added
- Weapon calibration framework

---

## v0.03 — 2026-04-30

- Version control system
- Startup screen with update prompts
- Settings panel
- Service worker updates

---

## v0.02 — 2026-04-28

- ShipDesigner child-table architecture
- BOQ view
- Armor rating increments
- Load from Library workflow

---

## v0.01 — 2026-04-25

- Initial PWA setup
- Vite + React + TypeScript scaffold
- Zustand state management
- Tailwind CSS styling
