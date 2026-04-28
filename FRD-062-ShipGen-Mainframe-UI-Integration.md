# FRD-062: CE ShipGen Mainframe UI Integration

**Date:** 2026-04-28  
**Status:** ✅ Complete  
**Project:** `ce-shipgen`  
**Target Version:** 0.02  
**Priority:** P0  
**Estimated Effort:** 2–3 sessions

---

## 1. Objective

Replace the existing slate/blue modern UI with the **CE ShipGen Mainframe** retro-CRT design package across the entire app. Preserve all existing functionality: child tables, table-driven data, Mneme combat stats, crew calculations, BOQ, export/import, PWA behavior, and settings.

---

## 2. Scope

### In Scope
- Port the `handoff/` design package into `src/components/shipgen/`
- Apply mainframe theme **app-wide** (header, nav, tiles, inputs, tables)
- Rebuild `ShipDesigner` using shipgen primitives (`ShLabel`, `ShPanel`, `ShField`, `ShNum`, etc.)
- Preserve all 12+ design steps with child tables, quick-add dropdowns, and legacy toggles
- Preserve `BOQView`, `MnemeCombatPanel`, crew requirements, validation
- Bridge existing Zustand table store to shipgen-style component manifests
- Update `tailwind.config.js` with shipgen preset
- Update global CSS (`index.css`) with mainframe tokens + fonts

### Out of Scope (for this FRD)
- New features not in existing ShipDesigner
- Changes to data model or calculation logic
- Changes to PWA / service worker behavior
- Changes to table editor / settings panel layout (styling only)

---

## 3. Design Package Mapping

| Design Package File | Destination | Adaptation |
|---|---|---|
| `theme.ts` | `src/components/shipgen/theme.ts` | Merge with app theme provider |
| `data.ts` | `src/components/shipgen/data.ts` | Keep as reference tables; do not replace store |
| `compute.ts` | `src/components/shipgen/compute.ts` | Keep for reference; app uses `calculations/index.ts` |
| `primitives.tsx` | `src/components/shipgen/primitives.tsx` | Direct port |
| `TonnageGauge.tsx` | `src/components/shipgen/TonnageGauge.tsx` | Direct port |
| `DeckPlan.tsx` | `src/components/shipgen/DeckPlan.tsx` | Adapt to accept existing `ShipDesign` shape |
| `BillOfQuantities.tsx` | `src/components/shipgen/BillOfQuantities.tsx` | Adapt to accept existing `ShipComponent[]` |
| `OperatingEconomics.tsx` | `src/components/shipgen/OperatingEconomics.tsx` | Adapt to use existing crew/econ data |
| `ComponentManifest.tsx` | `src/components/shipgen/ComponentManifest.tsx` | Adapt to accept existing `ShipComponent[]` |
| `DesignSteps.tsx` | `src/components/shipgen/DesignSteps.tsx` | **Major rewrite** — child tables + quick adds |
| `ShipGenDesktop.tsx` | `src/components/shipgen/ShipGenDesktop.tsx` | Adapt to use existing state + routes |
| `ShipGenPhone.tsx` | `src/components/shipgen/ShipGenPhone.tsx` | Adapt to use existing state + routes |
| `shipgen.css` | `src/styles/shipgen.css` | Import at app root |
| `tailwind.shipgen.preset.js` | Merge into `tailwind.config.js` | Extend existing config |

---

## 4. Milestones

### M1: Foundation — Theme & Config (0.5 session)
1. Copy design package components into `src/components/shipgen/`
2. Merge `tailwind.shipgen.preset.js` into `tailwind.config.js`
3. Create `src/styles/shipgen.css` with mainframe tokens, fonts, scanlines, grid
4. Import `shipgen.css` in `main.tsx`
5. Update `index.css` base layer to use mainframe background colors
6. Verify dev server starts and theme applies globally

**Key files:**
- `tailwind.config.js`
- `src/index.css`
- `src/main.tsx`
- `src/styles/shipgen.css` (new)
- `src/components/shipgen/theme.ts`
- `src/components/shipgen/primitives.tsx`

### M2: App Shell — Header & Navigation (0.5 session)
1. Rewrite `App.tsx` header/nav to use shipgen primitives (`ShLabel`, `ShNum`, `colors`)
2. Apply mainframe styling to nav buttons, theme toggle, layout toggle
3. Ensure `layoutMode` (desktop/phone) still works
4. Update `StartupScreen` with mainframe aesthetic

**Key files:**
- `src/App.tsx`
- `src/components/StartupScreen.tsx`

### M3: ShipDesigner Rewrite — Core Steps (1 session)
1. Rewrite `ShipDesigner.tsx` using `ShPanel`, `ShField`, `ShLabel`, `ShNum`
2. Keep all existing state hooks and calculation logic (do not touch `calculations/`)
3. Port Step 1–5 (Basic Info, Hull & Config, Armor, Drives & Power, Command & Control)
4. Integrate child tables (`ChildTable`) but wrapped in shipgen-styled containers
5. Preserve quick-add dropdowns and legacy toggles

**Key files:**
- `src/components/ShipDesigner.tsx`
- `src/components/shipgen/DesignSteps.tsx` (reference or partial use)

### M4: ShipDesigner Rewrite — Advanced Steps & Side Panel (1 session)
1. Port Steps 6–13 (Computer, Software, Sensors, Life Support, Modules, Weapons, Cargo, Crew)
2. Rebuild right-side panel: `BOQView`, `MnemeCombatPanel`, Ship Library quick list
3. Use `TonnageGauge`, `ComponentManifest`, `DeckPlan` from design package
4. Preserve save/export/reset actions
5. Preserve validation display

**Key files:**
- `src/components/ShipDesigner.tsx`
- `src/components/BOQView.tsx`
- `src/components/MnemeCombatPanel.tsx`
- `src/components/shipgen/TonnageGauge.tsx`
- `src/components/shipgen/ComponentManifest.tsx`
- `src/components/shipgen/DeckPlan.tsx`

### M5: Screens & Polish (0.5 session)
1. Style `TableManager`, `ShipLibrary`, `VariantGenerator`, `SettingsPanel` with mainframe tokens
2. Ensure phone layout works with shipgen phone components
3. Update `CollapsibleSection` to match mainframe aesthetic
4. Build check + lint pass

**Key files:**
- `src/components/TableManager.tsx`
- `src/components/ShipLibrary.tsx`
- `src/components/VariantGenerator.tsx`
- `src/components/SettingsPanel.tsx`
- `src/components/CollapsibleSection.tsx`

---

## 5. Theme Strategy

The mainframe theme becomes the **default and only** app theme for this release. The existing `ThemeProvider` dark/light/auto cycle is replaced with a simpler mechanism:

- `effectiveTheme` always resolves to `'dark'` (mainframe)
- Theme toggle button cycles through scanlines on/off instead of dark/light
- Layout toggle (desktop/phone) is preserved
- CSS variables in `:root` are mainframe green-phosphor values
- Existing `space-*` Tailwind colors are mapped to `sh-*` equivalents

---

## 6. Data Model Bridge

The design package's `data.ts` defines simplified reference tables (`HULLS`, `CONFIGS`, etc.). The app uses rich JSON table data loaded into Zustand. **Do not replace** the Zustand store. Instead:

- `ShipDesigner` continues to read from `useTableStore((s) => s.tables)`
- Reference the design package's `HULLS` etc. only if the store is empty (fallback)
- `computeShip` from the design package is **not used** for the main designer; keep using `calculations/index.ts`
- Design package components (`BillOfQuantities`, `ComponentManifest`, `DeckPlan`) are adapted to accept existing `ShipComponent[]` and `ShipTotals`-like shapes

---

## 7. Acceptance Criteria

- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Build passes (`npm run build`)
- [ ] All routes render: `/design`, `/tables`, `/library`, `/variants`
- [ ] Ship designer can select hull, config, armor, drives, bridge, computer
- [ ] Child tables work: add/remove/edit rows for armor, command, computers, software, sensors, life support, modules, weapons, supplies
- [ ] Quick-add dropdowns populate from JSON table data
- [ ] BOQ updates in real time with correct totals
- [ ] Tonnage gauge reflects allocation accurately
- [ ] Validation panel shows errors/warnings correctly
- [ ] Mneme combat panel displays correctly
- [ ] Crew requirements table displays correctly
- [ ] Save/Export/Reset buttons work
- [ ] Phone layout stacks vertically with sticky summary
- [ ] Desktop layout shows 2-column grid (steps + readouts)
- [ ] Scanlines can be toggled on/off
- [ ] Deck plan SVG renders for selected hull
- [ ] All existing ships in library load correctly

---

## 8. Rollback Plan

If critical issues arise, revert `ShipDesigner.tsx` from git and restore previous `App.tsx`, `index.css`, `tailwind.config.js`. The design package components in `src/components/shipgen/` are additive and safe to keep.

---

*End of Document*
