# CE ShipGen PRD v2.0
## Product Requirements Document

**Version:** 2.0  
**Date:** 2026-03-02  
**Status:** Ready for Implementation  
**Based On:** 
- Cepheus Engine Chapter 8
- Mneme Space Combat v2.41-v2.45
- GI7B Raw Excel Tables

---

## 1. EXECUTIVE SUMMARY

### 1.1 Vision Statement
Create a Progressive Web App (PWA) that implements the complete Cepheus Engine ship design system with Mneme Space Combat integration, allowing players to design, validate, and export starship specifications on any device with a modern browser.

### 1.2 Success Criteria
- [ ] 100% coverage of CE Chapter 8 ship design rules
- [ ] 100% coverage of Mneme Space Combat additions
- [ ] Offline-first PWA functionality
- [ ] Real-time validation with zero calculation errors
- [ ] Universal Ship Description Format export
- [ ] Mobile-responsive design (320px-2560px)

---

## 2. GI7B UI STANDARD REFERENCE

CE ShipGen is the **canonical reference implementation** of the GI7B Generator UI Standard. All GI7B generators follow this navigation tree, layout system, and tile pattern.

### App Navigation Tree

```
Landing Page  (/)
│
├── 🌙/☀️  Theme Toggle   [header — always visible]
│         Night (dark) / Day (light)
│
├── 🖥️/📱  Layout Toggle  [header — always visible]
│         Desktop: three-column  (Nav 15% | Tiles 55% | Summary 30%)
│         Mobile:  single-column vertical stack
│
├── ✨ Generate Now  (/generate)
│      Main creation flow — tile-based, 19-step ship design
│
├── 📚 Library  (/library)
│      All saved ships — search, filter, export
│
└── ⚙️ Settings  (/settings)
    ├── 📄 JSON Tables        (/settings/tables)
    │      All generation tables — editable, exportable, versionable per step
    ├── 🧩 Mechanics Modules  (/settings/mechanics)
    │      Rule variant toggles (CE RAW vs Mneme Variant)
    ├── 🎲 Generation Options (/settings/options)
    │      Presets, "Random Everything", lock/unlock fields
    └── 🔧 Other Settings     (/settings/other)
           Theme, layout defaults, version info, PWA install
```

### Tile System

| State | Description |
|-------|-------------|
| **Collapsed** | Summary label only — shows key value |
| **Expanded** | Full tile content — inputs, selections, details |
| **Focused** | Full-screen overlay — ESC to exit |

### Settings Sections

| Section | Route | Icon | Purpose |
|---------|-------|------|---------|
| JSON Tables | `/settings/tables` | 📄 | All data tables — dual JSON/Table view, canonical + custom |
| Mechanics Modules | `/settings/mechanics` | 🧩 | Rule variant toggles (CE RAW vs Mneme Variant) |
| Generation Options | `/settings/options` | 🎲 | Named presets, "Random Everything", field locks |
| Other Settings | `/settings/other` | 🔧 | Theme, layout, version control, PWA install |

### GI7B Generator Suite

| Generator | Repo | UI Role |
|-----------|------|---------|
| **CE ShipGen** | xunema/ce-shipgen | **Canonical reference** — this repo |
| CE CharacterGen | xunema/cecharactergen | Follows shipgen pattern |
| Mneme World Gen | xunema/mneme-world-generator-pwa | Follows shipgen pattern |

---

## 3. FUNCTIONAL REQUIREMENTS

### 2.1 Core Ship Designer (FR-001 to FR-020)

#### FR-001: 19-Step Design Wizard
**Priority:** Critical
**Description:** Implement the complete ship design checklist

**Steps:**
1. Hull Selection (18 sizes)
2. Configuration (3 types)
3. Armor (3 types + options)
4. M-Drive (optional)
5. J-Drive (optional)
6. Power Plant (validated)
7. Fuel Calculation (auto)
8. Bridge/Cockpit
9. Computer (7 models + options)
10. Software (5+ programs)
11. Sensors (5 types)
12. Crew Calculation (auto)
13. Accommodations (18 types)
14. Features (optional)
15. Turrets/Bays/Screens
16. Weapons (8 types)
17. Vehicles (11 types)
18. Cargo (remainder)
19. Cost Summary

**Acceptance:** User can complete all steps, data persists between steps

---

#### FR-002: Real-Time Validation Engine
**Priority:** Critical
**Description:** Instant validation of all design choices

**Hard Constraints (Block if violated):**
- Tonnage used ≤ Hull Dtons
- Power Plant ≥ max(M-Drive, J-Drive) letter
- Hardpoints ≤ floor(Hull/100)
- Bridge stations ≥ Required crew positions
- Tech Level ≥ Component requirements

**Soft Warnings (Warn but allow):**
- Fuel < 2 weeks operation
- Weapons without fire control
- Jump drive without navigation software
- Crew > life support capacity

**Acceptance:** Zero calculation errors, instant feedback <100ms

---

#### FR-003: Dynamic Calculations
**Priority:** Critical
**Description:** Auto-calculate all derived values

**Calculations:**
- Hull Points = floor(Dtons/50)
- Structure Points = ceil(Dtons/50)
- Jump Fuel = 0.1 × Dtons × Jump Range
- Weekly Fuel = PowerPlantTons/3
- Total Cost (sum of all components)
- Construction Time (from hull)
- Crew Requirements (by component)
- Passenger Capacity (by staterooms)
- MAC Potential (by weapon count)

**Acceptance:** All calculations match reference tables

---

#### FR-004: Data Management
**Priority:** High
**Description:** Save, load, export ship designs

**Features:**
- Local storage (IndexedDB)
- JSON export/import
- Ship library with search/filter
- Duplicate ship
- Delete with confirmation
- Auto-save on change

**Acceptance:** Data persists across sessions, export/import works

---

#### FR-005: Output Generation
**Priority:** High
**Description:** Generate ship documentation

**Formats:**
1. Universal Ship Description (text)
2. Mneme Combat Summary
3. JSON (full data)
4. Markdown
5. Print-friendly view

**Acceptance:** All formats contain complete ship data

---

### 2.2 User Interface (FR-006 to FR-015)

#### FR-006: Responsive Layout with Mode Toggle and Theme Toggle (GI7B Standard)
**Priority:** Critical
**Description:** Two distinct layout modes with manual toggle, plus Night/Day theme toggle — both always visible in header

**Desktop/Tablet Mode (Landscape):**
- Horizontal tiling (left-to-right)
- Three columns: Navigation (15%), Tiles (55%), Summary (30%)
- All 19 tiles visible side-by-side or in grid

**Phone/Mobile Mode (Portrait):**
- Vertical tiling (top-to-bottom)
- Sticky summary bar at top
- Scrollable tiles stack
- Bottom navigation or swipe gestures

**Layout Toggle (🖥️/📱):**
- Manual button in header — always visible
- Auto-detect viewport size on first load
- Store `ce_shipgen_layout_mode` in localStorage

**Theme Toggle (🌙/☀️):**
- Manual button in header — always visible, left of layout toggle
- Night (dark) / Day (light) mode
- Store `ce_shipgen_theme` in localStorage
- Default: system `prefers-color-scheme` on first load

**Acceptance:** No horizontal scroll on mobile, all features accessible, both toggles always visible in header, both preferences persist

---

#### FR-007: Tile System with Focus Mode
**Priority:** Critical
**Description:** Each step is a tile with expandable focus mode

**Tile States:**
- **Inactive:** Collapsed, shows only header
- **Active:** Expanded, shows content
- **Focused:** Full-screen overlay, maximum space
- **Completed:** Checkmark indicator
- **Invalid:** Error indicator

**Focus Mode:**
- Click tile header or "Focus" button
- Tile expands to fill container
- Other tiles collapse to minimal headers
- Press ESC or "Exit Focus" to return
- Mobile: Swipe between tiles in focus mode

**Acceptance:** All 19 tiles render, focus mode works on all screen sizes, can exit easily

---

#### FR-008: Startup Screen & App Flow
**Priority:** High
**Description:** Entry point with navigation to settings and design

**Layout:**
- Centered card on branded background
- Logo at top
- Primary: "Generate Ship" large button
- Secondary: "Load Ship", "Settings", "Help"
- Version info at bottom

**Flow:**
```
Startup → [Generate Ship] → Design Workflow
     ↓
   [Settings] → Edit JSON / Edit Rules / Preferences
     ↓
   [Load Ship] → Library
```

**Acceptance:** All buttons work, smooth transitions, mobile-friendly, back returns to startup

---

#### FR-009: Settings Screen — GI7B Standard Sections
**Priority:** High
**Description:** Pre-design configuration with editable data tables, rule toggles, and app settings. Follows the **GI7B UI Standard** with four fixed sections.

**URL:** `/settings` (redirects to `/settings/tables`) or `/settings/:section`

| Section | Route | Icon | Purpose |
|---------|-------|------|---------|
| JSON Tables | `/settings/tables` | 📄 | All data tables — dual JSON/Table view, canonical + custom |
| Mechanics Modules | `/settings/mechanics` | 🧩 | Rule variant toggles (CE RAW vs Mneme Variant) |
| Generation Options | `/settings/options` | 🎲 | Named presets, "Random Everything", field locks |
| Other Settings | `/settings/other` | 🔧 | Theme, layout defaults, version control, PWA install |

**1. 📄 JSON Tables** (`/settings/tables`)
- Select table from dropdown (organized by category)
- Inline JSON editor with syntax highlighting
- Real-time schema validation
- Dual view: JSON source / Spreadsheet table
- Export individual tables as JSON; import custom tables
- Canonical Tables (read-only reference) + Custom Tables (user-created)
- **Tables In Play** — select which table is active per generation step

**2. 🧩 Mechanics Modules** (`/settings/mechanics`)
- Master toggle: Cepheus Engine RAW / Mneme Space Combat / Custom
- Individual rule toggles (each discrete and named):
  - Bridge sizing model (CE fixed / Mneme per-Dton)
  - Life pod capacity (CE / Mneme variant)
  - NavComm skill (Navigation / Comms)
- Custom rule import for house rules

**3. 🎲 Generation Options** (`/settings/options`)
- "Random Everything" — fully random ship within constraints
- Named presets (e.g., "Scout Ship", "Merchant Freighter", "Warship")
- Lock/unlock individual design fields before generating
- Default hull size and configuration preferences

**4. 🔧 Other Settings** (`/settings/other`)
- Theme: Dark / Light / Auto — mirrors header 🌙/☀️ toggle
- Layout default: Desktop / Phone
- Version display and update prompt
- PWA install prompt
- Data management: export/import/clear all ships

**Acceptance:** JSON editor validates schema, changes apply immediately, import/export works, all four sections accessible via sidebar nav and direct URL

---

#### FR-010: Summary Dashboard
**Priority:** Medium
**Description:** Switch between CE and Mneme rules

**Toggle:** Standard CE / Mneme Space Combat

**Changes when Mneme:**
- Bridge: 1 station per Dton (not fixed sizes)
- NavComm: Uses Comms skill
- Life pods: 1t per 3 adults
- Add combat stats panel
- Add MAC calculator
- Show Thrust Points

**Acceptance:** Toggle switches all relevant displays

---

### 2.3 Technical Requirements (FR-016 to FR-025)

#### FR-016: Progressive Web App
**Priority:** Critical
**Requirements:**
- Service worker for offline use
- Web App Manifest
- Install prompt
- Works offline after first load
- Background sync (optional)

**Acceptance:** Passes Lighthouse PWA audit

---

#### FR-017: Performance
**Priority:** Critical
**Targets:**
- First paint: <2s on 4G
- Time to interactive: <5s
- Calculation updates: <100ms
- Animations: 60fps
- Bundle size: <500KB (gzipped, excluding data)

**Acceptance:** Lighthouse Performance score >90

---

#### FR-018: Data Storage
**Priority:** High
**Requirements:**
- IndexedDB for ship designs
- LocalStorage for preferences
- Data never sent to server (privacy)
- Export all data function
- Import with validation

**Acceptance:** 100+ ships can be stored locally

---

#### FR-019: Accessibility
**Priority:** High
**Requirements:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatible
- Color-blind friendly (not just color)
- Focus indicators
- Alt text for icons

**Acceptance:** Passes axe-core audit

---

#### FR-020: Browser Support
**Priority:** High
**Requirements:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

**Graceful Degradation:** Core functions work on older browsers

---

### 2.2 Logistic Calculators (Phase 2 - Future)

#### FR-021: Supply Calculator
**Priority:** High (Phase 2)
**Description:** Recommend supplies for ships and calculate costs

**Features:**
- Calculate life support requirements based on crew size and journey duration
- Fuel calculations for planned journeys (parsecs × consumption rate)
- Maintenance supplies estimation (based on ship age and wear)
- Cost estimation for complete resupply
- Compare supply costs at different starports

**Formulas:**
- Life Support: man-days × supplies per day
- Fuel: parsecs × 0.1 × hull tonnage
- Maintenance: 0.1% of ship value per year

**Acceptance:**
- [ ] Accurate supply calculations for all ship types
- [ ] Cost breakdown by category (life support, fuel, maintenance)
- [ ] Multi-journey supply planning

---

#### FR-022: Inventory System
**Priority:** High (Phase 2)
**Description:** Track current balance of inventory over time

**Features:**
- Real-time resource tracking (fuel, food, air, water, spare parts)
- Automated consumption based on crew size and operations
- Low inventory warnings and alerts (configurable thresholds)
- Multi-ship fleet inventory management
- Historical consumption tracking

**UI Components:**
- Inventory dashboard with current levels
- Visual indicators (green/yellow/red) for stock levels
- Consumption rate charts
- Reorder point alerts

**Acceptance:**
- [ ] Tracks all resource types accurately
- [ ] Alerts when inventory below threshold
- [ ] Supports multiple ships in fleet
- [ ] Data persists across sessions

---

#### FR-023: Journey Table
**Priority:** High (Phase 2)
**Description:** Trip planning and resource tracking from Point A to Point B

**Features:**
- Row-based journey log (Origin → Destination)
- Resource consumption calculation per journey
- Parsecs traveled, time elapsed, fuel used
- Passenger/freight manifest and income
- Journey history and statistics

**Table Columns:**
- Date, Origin, Destination, Parsecs, Duration
- Fuel Consumed, Life Support Used
- Passengers, Freight, Mail
- Income, Expenses, Net Profit

**Acceptance:**
- [ ] Add/edit/delete journey entries
- [ ] Automatic resource consumption calculation
- [ ] Income/expense tracking per journey
- [ ] Export journey log as CSV

---

#### FR-024: Income Tracker
**Priority:** High (Phase 2)
**Description:** Financial management and profit/loss tracking over periods

**Features:**
- Revenue tracking: High/Middle/Low passengers, freight, mail, charters
- Expense tracking: Fuel, maintenance, crew salaries, supplies, berthing
- Profit/loss calculations per journey and per period (weekly/monthly/yearly)
- Cash flow projections
- Financial reports for ship operations

**Dashboard:**
- Total Revenue, Total Expenses, Net Profit
- Revenue breakdown by source (pie chart)
- Expense breakdown by category (bar chart)
- Trend line showing profit/loss over time

**Acceptance:**
- [ ] All revenue sources tracked
- [ ] All expense categories tracked
- [ ] Accurate profit/loss calculations
- [ ] Financial reports exportable
- [ ] Projections based on historical data

---

## 3. DATA REQUIREMENTS

### 3.1 Embedded Data

The app must include all data from:

**13 JSON Files:**
1. ship_hulls.json (18 entries)
2. ship_drives.json (26 drive codes)
3. hull_configurations.json (3 types)
4. ship_armor.json (3 types + options)
5. ship_bridge_computer.json (4 bridge sizes, 7 computer models)
6. ship_software.json (5 programs)
7. ship_sensors.json (5 types)
8. ship_crew.json (14 positions)
9. life_support.json (18 components)
10. ship_weapons.json (8 weapons)
11. ship_missiles.json (3 types)
12. ship_vehicles.json (11 vehicles)
13. smallcraft_drives.json (21 small craft codes)

**Total:** 137+ data entries

### 3.2 Data Schema

See MASTER_RULES_CONSOLIDATION.md for complete schemas

Key entities:
- ShipDesign (main object)
- Hull, Drives, Armor, Bridge, Computer
- Software[], Sensors, Crew, Accommodations
- Weapons[], Vehicles[], Cargo

### 3.3 Calculation Engine

**Must implement:**
- Hull Points calculation
- Drive performance lookup (by hull size)
- Power plant validation
- Fuel calculations
- Armor cost/tonnage
- Weapon MAC calculation
- Crew requirements
- Total cost with discounts

---

## 4. USER STORIES

### 4.1 Primary Use Cases

**US-001: New Player Designs First Ship**
1. Opens app on phone
2. Clicks "New Ship"
3. Follows wizard through 19 steps
4. Sees real-time cost/tonnage updates
5. Saves ship to library
6. Exports to JSON for game

**US-002: Referee Creates NPC Ships**
1. Opens app on laptop
2. Switches to "Quick NPC" mode (Mneme)
3. Selects ship class (Fighter, Corvette, etc.)
4. App generates random valid ship
5. Referee adjusts weapons
6. Prints combat stat block

**US-003: Player Modifies Existing Ship**
1. Opens library
2. Searches for "Free Trader"
3. Duplicates existing design
4. Upgrades J-Drive
5. Adjusts fuel accordingly
6. Saves as new variant

**US-004: Group Shares Designs**
1. Player exports ship as JSON
2. Shares file via messaging
3. Referee imports to library
4. All ships available offline

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Security
- No server-side processing (pure client-side)
- No personal data collection
- No cookies for tracking
- All calculations local

### 5.2 Privacy
- Ships stored locally only
- No cloud sync required
- Export/import under user control
- Clear data deletion option

### 5.3 Maintainability
- Component-based architecture
- TypeScript for type safety
- Unit tests for calculations
- E2E tests for critical paths

---

## 6. OUT OF SCOPE (Future Releases)

### Version 2.x (Future)
- **Logistic Calculators** - Supply chain and economic management
  - Supply Calculator: Life support, fuel, maintenance cost estimation
  - Inventory System: Real-time resource tracking across fleet
  - Journey Table: Trip planning with resource consumption
  - Income Tracker: Revenue, expenses, profit/loss per journey and period
- PDF export with ship diagrams
- 3D ship viewer (basic)
- Ship comparison tool
- Cost optimization suggestions
- Campaign management integration

### Version 3.x (Future)
- Cloud sync (optional)
- Ship sharing marketplace
- Deck plan generator
- Trade route calculator
- Combat simulator

---

## 7. ACCEPTANCE CRITERIA

### 7.1 MVP Complete When:
- [ ] All 19 design steps functional
- [ ] 137+ data entries correctly loaded
- [ ] Real-time calculations accurate
- [ ] Validation works (hard/soft constraints)
- [ ] Ship library functional
- [ ] Export to JSON and text
- [ ] PWA installable
- [ ] Works offline
- [ ] Mobile responsive
- [ ] Zero calculation errors

### 7.2 Quality Gates:
- [ ] Unit tests: >80% coverage
- [ ] E2E tests: All critical paths
- [ ] Performance: Lighthouse >90
- [ ] Accessibility: WCAG AA
- [ ] Browser testing: All supported

---

## 8. RISKS AND MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex calculation errors | Medium | High | Extensive unit tests, reference validation |
| Performance on low-end devices | Medium | Medium | Optimize bundle, lazy loading |
| Browser compatibility issues | Low | Medium | Feature detection, graceful degradation |
| Data migration complexity | Low | Medium | Version tagging, migration scripts |
| Scope creep | High | Medium | Strict MVP definition, future versions list |

---

## 9. GLOSSARY

- **CE:** Cepheus Engine
- **Mneme:** Mneme Space Combat (variant rules)
- **PWA:** Progressive Web App
- **Dton:** Displacement ton (1 ton = 14 cubic meters)
- **MCr:** MegaCredit (1 MCr = 1,000,000 Cr)
- **TL:** Tech Level
- **MAC:** Multiple Attack Consolidation
- **TP:** Thrust Points
- **HP:** Hit Points
- **DM:** Dice Modifier
- **TN:** Target Number

---

## 10. REFERENCES

1. Cepheus Engine SRD Chapter 8
2. Mneme Space Combat v2.41-v2.45 (Justin Aquino)
3. GI7B EXTERNAL RAW CE SHIPS 231024-06 240930.xlsx
4. MASTER_RULES_CONSOLIDATION.md
5. RAW_TABLES_EXTRACTED.md
6. MNEME_SPACE_COMBAT_SUMMARY.md

---

---

## 11. ADDENDUM — March 2, 2026 (Session 3 Requirements)

### 11.1 PWA Install Prompt & Install-State Indicator (FR-021)

**Priority:** High
**Trigger:** User confirmed all 13 data tables are now editable and functional. Next priority is guiding users to install the app locally so they have a personal working copy.

**Problem Statement:**
Users visiting the web version have no clear signal that the app can be saved to their desktop/home screen, nor any indication of which mode they are currently running in (web vs. installed PWA). Without this, users may not realise they can work offline with their own customised tables.

**Requirements:**

**FR-021a: Install Prompt**
- Detect PWA installability via the `beforeinstallprompt` event (Chrome/Edge/Android)
- On the Startup screen, show a prominent "Install App" button or banner when the app is installable
- On iOS (Safari), show a manual instruction overlay: "Tap Share → Add to Home Screen"
- After install, suppress the prompt (do not show again)
- Store `install_prompted` flag in localStorage

**FR-021b: Running-Mode Indicator**
- Detect installed/standalone mode via:
  - `window.matchMedia('(display-mode: standalone)').matches`
  - `window.navigator.standalone === true` (iOS fallback)
- When running in **standalone (installed) mode**: show a persistent badge in the app header — e.g., a green dot or "Installed" chip — so users know they are on their local copy
- When running in **web/browser mode**: show a subtle "Install for offline use" link in the header or footer
- The indicator must be visible from all screens (Design, Library, Settings)

**FR-021c: Offline Status**
- Display a status indicator when the device is offline (use `navigator.onLine` + `online`/`offline` events)
- Offline: amber indicator "Offline — using local data"
- Online: no indicator (default state)

**Acceptance Criteria:**
- [ ] Install button appears on Startup screen when browser supports install
- [ ] iOS users see manual install instructions
- [ ] Header shows "Installed" badge when in standalone mode
- [ ] Offline indicator appears/disappears correctly
- [ ] No install prompt shown if already installed

---

### 11.2 Auto-Save & Settings Workflow (FR-022) — Revised

**Priority:** High
**Revised:** March 2, 2026 (Session 4) — original export/import concept superseded by Settings Snapshots (FR-024)

**Core Principle:**
The app always auto-saves. There is no "Save" button for table edits. The user's working state is always current. The canonical `public/data/*.json` files are read-only factory defaults — they are never modified. The user's personal layer lives entirely in localStorage on top of those defaults.

**Data Architecture:**

| Layer | Storage | Contains | User action to reset |
|-------|---------|----------|---------------------|
| Factory defaults | `public/data/*.json` (shipped) | Canonical rule tables | N/A — read-only |
| Live working state | `localStorage` (`ce_shipgen_live_*`) | Current tables + rules, always current | "Reset to Defaults" |
| Named snapshots | `localStorage` (`ce_shipgen_presets`) | Array of saved settings states | Delete snapshot |
| Ship library | `localStorage` / IndexedDB | Saved ship designs | Never auto-reset |

**FR-022a: Auto-Save on Edit**
- Table view: save to localStorage on every cell commit (blur or Enter key) — no Save button
- JSON view: keep an explicit "Apply" button — needed because mid-edit JSON is invalid and cannot be auto-saved keystroke-by-keystroke
- Show a brief "Saved" toast (1.5s) after each auto-save so the user has confirmation
- No "unsaved changes" state in table view — every committed edit is immediately persisted

**FR-022b: Reset Live State to Factory Defaults**
- In Settings → Data Management: "Reset All to Defaults" button
- Clears all `ce_shipgen_live_*` keys and `ce_shipgen_rules` from localStorage
- **Never touches ship library data**
- Confirmation dialog: "Reset all tables and rules to the original web defaults? Your saved ships will not be affected."
- Label: "Reset to Web Defaults" — not "Reset to Blank" (blank = broken, defaults = known-good)

**Acceptance Criteria:**
- [ ] Table edits auto-save on cell commit with "Saved" toast
- [ ] JSON view retains explicit "Apply" button
- [ ] "Reset to Web Defaults" clears only settings, not ship library
- [ ] No "Save" button visible in table edit mode

---

### 11.3 Input Security — Editable Tables (FR-023)

**Priority:** High
**Trigger:** When the app is made public, malicious actors may attempt to inject harmful content via the editable table fields. The following requirements govern how user-supplied data is handled.

**Threat Model:**

| Threat | Vector | Risk Level | Notes |
|--------|--------|------------|-------|
| Stored XSS | Inject `<script>` or event handlers into table string fields | Low (mitigated by React) | React renders text nodes, not HTML, so `String(value)` in JSX is safe |
| HTML injection via `dangerouslySetInnerHTML` | Any future use of `innerHTML` with table data | **High if introduced** | Currently not used — must never be introduced with table data |
| Prototype pollution via JSON.parse | `{"__proto__": {"isAdmin": true}}` in imported JSON | Low (modern JS engines block this) | Use `Object.create(null)` pattern for sensitive parsing |
| Schema confusion / type mismatch | String in numeric field causes NaN in calculations | Medium | Currently no schema validation — calculation engine will inherit garbage |
| Malicious JSON import shared between users | User A crafts a JSON file, shares with User B who imports it | Medium | Content is rendered safely by React, but could break calculations |
| localStorage tampering (browser console) | User directly edits localStorage keys | Low (self-inflicted) | Out of scope — local storage is the user's own environment |

**Current Safety Status:**
- ✅ React JSX text rendering is XSS-safe by default — `{String(value)}` produces text nodes
- ✅ `title={String(value)}` attribute values are escaped by React
- ✅ No `eval()`, `Function()`, or `dangerouslySetInnerHTML` used with table data
- ⚠️ No schema validation on import — invalid types reach the calculation engine
- ⚠️ No string sanitization — HTML tags in fields are harmless now but risky if future code ever uses innerHTML
- ⚠️ No max-length enforcement on string fields

**Requirements:**

**FR-023a: Schema Validation on Import**
- When importing a JSON table, validate each row against the expected schema for that table

---

### 11.3 Input Security — Editable Tables (FR-023)

**Priority:** High
**Trigger:** When the app is made public, malicious actors may attempt to inject harmful content via the editable table fields. The following requirements govern how user-supplied data is handled.

**Threat Model:**

| Threat | Vector | Risk Level | Notes |
|--------|--------|------------|-------|
| Stored XSS | Inject `<script>` or event handlers into table string fields | Low (mitigated by React) | React renders text nodes, not HTML, so `String(value)` in JSX is safe |
| HTML injection via `dangerouslySetInnerHTML` | Any future use of `innerHTML` with table data | **High if introduced** | Currently not used — must never be introduced with table data |
| Prototype pollution via JSON.parse | `{"__proto__": {"isAdmin": true}}` in imported JSON | Low (modern JS engines block this) | Use `Object.create(null)` pattern for sensitive parsing |
| Schema confusion / type mismatch | String in numeric field causes NaN in calculations | Medium | Currently no schema validation — calculation engine will inherit garbage |
| Malicious JSON import shared between users | User A crafts a JSON file, shares with User B who imports it | Medium | Content is rendered safely by React, but could break calculations |
| localStorage tampering (browser console) | User directly edits localStorage keys | Low (self-inflicted) | Out of scope — local storage is the user's own environment |

**Current Safety Status:**
- ✅ React JSX text rendering is XSS-safe by default — `{String(value)}` produces text nodes
- ✅ `title={String(value)}` attribute values are escaped by React
- ✅ No `eval()`, `Function()`, or `dangerouslySetInnerHTML` used with table data
- ⚠️ No schema validation on import — invalid types reach the calculation engine
- ⚠️ No string sanitization — HTML tags in fields are harmless now but risky if future code ever uses innerHTML
- ⚠️ No max-length enforcement on string fields

**Requirements:**

**FR-023a: Schema Validation on Import**
- When importing a JSON table, validate each row against the expected schema for that table
- Check: required fields present, numeric fields are numbers, string fields are strings
- Reject import if >10% of rows fail validation
- Show specific validation errors to the user before accepting

**FR-023b: String Sanitization on Save**
- Before saving to localStorage, strip HTML tags from all string fields
- Simple implementation: `value.replace(/<[^>]*>/g, '')` is sufficient given React's rendering model
- This prevents any future code from accidentally rendering injected HTML

**FR-023c: Type Coercion on Load**
- When reading table data from localStorage, coerce values to expected types
- Numeric fields: `Number(value)` with NaN fallback to 0
- String fields: `String(value).slice(0, 500)` (max 500 chars)
- Boolean fields: explicit true/false check

**FR-023d: No `dangerouslySetInnerHTML` with Table Data (Architectural Rule)**
- Document as a hard architectural constraint: table field values must NEVER be passed to `dangerouslySetInnerHTML`
- Any future markdown rendering in ship output must use a sanitized renderer (e.g., DOMPurify + marked)

**FR-023e: Content Security Policy (Future)**
- GitHub Pages does not support custom HTTP headers, so CSP cannot be set via headers
- When migrating off GitHub Pages (Netlify/Vercel/self-hosted), add:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
  ```
- `unsafe-inline` needed only for Tailwind's inline styles — can be removed with stricter setup

**Acceptance Criteria:**
- [ ] Import rejects JSON with invalid schema and shows clear error
- [ ] String fields are stripped of HTML tags before save
- [ ] Numeric fields are coerced with NaN fallback on load
- [ ] No `dangerouslySetInnerHTML` introduced in any table-data code path

---

### 11.4 Settings Snapshots (FR-024) — NEW

**Priority:** High
**Added:** March 2, 2026 (Session 4)

**Problem Statement:**
The auto-save model (FR-022a) keeps the user's live working state always current. But users need the ability to name and preserve distinct settings configurations — for example, a "Hard Science" variant, a "Pirate Campaign" variant, and a "Standard CE" baseline. These are named snapshots of the full settings state (all 13 tables + rules) that can be loaded, exported, imported, and deleted.

**Concept:**
Think of it like save slots in a game. The live working state is the active game. Snapshots are save files. You can save at any point, name the save, reload it later, or share it with another player.

---

**FR-024a: Snapshot Storage Structure**

All snapshots stored under a single localStorage key:
```
ce_shipgen_presets  →  Array of Preset objects
```

Preset object schema:
```json
{
  "id": "260302:193045",
  "name": "260302:193045",
  "createdAt": "2026-03-02T19:30:45Z",
  "updatedAt": "2026-03-02T19:30:45Z",
  "tables": {
    "ship_hulls": [ ... ],
    "ship_drives": [ ... ],
    "...": "all 13 tables"
  },
  "rules": {
    "ruleSet": "cepheus",
    "bridgeCalculation": "ce_fixed",
    "...": "full RuleSet object"
  }
}
```

**Default name format:** `YYMMDD:HHMMSS` — generated at the moment of save
- Example: `260302:193045` = March 2, 2026 at 19:30:45
- User can rename at any time before or after saving

---

**FR-024b: Save Snapshot**
- Button: "Save Snapshot" in Settings → Data Management
- Default name pre-filled as `YYMMDD:HHMMSS` (editable inline before confirming)
- Captures full current state: all 13 live tables + current rule preferences
- Tables that haven't been customised are captured from `public/data/*.json` defaults at save time, so the snapshot is always a complete, self-contained copy
- If a snapshot with the same name already exists, prompt: "Overwrite existing snapshot '[name]'?"
- Maximum 50 snapshots stored (show warning when approaching limit)

**FR-024c: Snapshots List**
- Display as a card list or table in Settings → Data Management
- Each entry shows:
  - Name (editable inline — click to rename)
  - Created timestamp (human-readable: "Mar 2, 2026 19:30")
  - Active indicator — highlight which snapshot is currently loaded (if any)
- Actions per snapshot:
  - **Load** — replaces live working state with this snapshot's tables and rules
  - **Rename** — inline edit of name field
  - **Export** — downloads this snapshot as a `.json` file
  - **Delete** — removes with confirmation

**FR-024d: Load Snapshot**
- Replaces all `ce_shipgen_live_*` keys and `ce_shipgen_rules` in localStorage with the snapshot's data
- Shows confirmation if live state has unsaved-since-last-snapshot changes (optional, low priority)
- After load, marks that snapshot as "active" in the list
- Toast: "Loaded '[name]'"

**FR-024e: Export Snapshot**
- Downloads the snapshot as a `.json` file
- Filename: `ce-shipgen-[name]-[YYMMDD].json`
  - Example: `ce-shipgen-260302:193045-260302.json`
  - Special characters in name are slugified for filename safety
- File format is the full Preset object (self-contained, importable)

**FR-024f: Import Snapshot**
- Accepts `.json` files in the Preset object format
- Validates schema on import (per FR-023a)
- On success: adds to the snapshots list without automatically loading it
- Prompt: "Snapshot imported as '[name]'. Load it now?"
- If name conflicts with existing snapshot, append ` (imported)` to the name

**FR-024g: Rename Snapshot**
- Click the name in the list to enter inline edit mode
- Press Enter or click away to confirm
- Names must be non-empty, max 80 characters
- Duplicate names are allowed (distinguished by timestamp in metadata)

---

**FR-024h: Relationship to "Reset to Web Defaults" (FR-022b)**
- "Reset to Web Defaults" is still available and still only resets the live working state
- It does NOT delete any snapshots — snapshots are preserved independently
- Suggested workflow: save a snapshot before resetting, so you can restore your work

---

**Acceptance Criteria:**
- [ ] "Save Snapshot" creates entry with default name `YYMMDD:HHMMSS`
- [ ] User can rename snapshot before and after saving
- [ ] Snapshots list shows all saved snapshots with timestamps
- [ ] "Load" replaces live state and marks snapshot as active
- [ ] "Export" downloads valid importable `.json` file
- [ ] "Import" adds snapshot to list without auto-loading
- [ ] "Delete" removes with confirmation
- [ ] Ship library data is never touched by any snapshot operation
- [ ] Snapshots survive page refresh (stored in localStorage)

---

### 11.5 CI/CD Pipeline — Strategy B (FR-025)

**Priority:** High
**Added:** March 2, 2026 (Session 5)
**Status:** ✅ Implemented

**Problem Statement:**
Every deployment required a manual sequence: `npm install` (which could fail if `tsc` was not on PATH), `npm run build`, constructing a throwaway git repo inside `dist/`, and force-pushing to `gh-pages`. This was fragile, error-prone, and added friction to every milestone. In Session 5 this process broke immediately — `tsc` was not on the system PATH and `npm install` had to be run manually before the build could proceed.

**Root Cause:**
No automated pipeline. Every deploy was a manual 4-step shell process with no gate on build success. The deploy could proceed even if type checking failed.

**Solution: GitHub Actions Workflow**
File: `.github/workflows/deploy.yml`

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**Pipeline stages:**
1. `actions/checkout@v4` — clean checkout of `main`
2. `actions/setup-node@v4` (Node 20, npm cache) — consistent, hermetic environment
3. `npm ci` — reproducible install from `package-lock.json`
4. `npm run build` — runs `tsc && vite build` (type-check is the gate)
5. `peaceiris/actions-gh-pages@v3` — pushes `dist/` to `gh-pages` (deploy only on push to `main`, not on PRs)

**PR behavior:** PRs trigger steps 1–4 only (build check, no deploy). Merge to `main` triggers all 5 steps including deploy. This means every PR is validated before it can break the live site.

**Benefits delivered:**
- Zero manual deploy steps after `git push`
- Build failures block deploy — type errors can no longer slip through
- PRs are validated in CI before merge
- Consistent Node environment — no PATH issues across machines
- Commit message from `main` propagated to the `gh-pages` deploy commit for traceability

**Relationship to Optimization Strategies (Session 5 analysis):**
This was identified as the highest-ROI first step from the three-strategy optimization analysis. Strategy A (Playwright E2E) and Strategy C (pre-commit gate) are deferred to later milestones and documented below as upcoming work.

**Acceptance Criteria:**
- [x] Push to `main` automatically triggers build and deploy
- [x] PRs run `npm run build` as a gate — type errors block merge
- [x] Deploy only on push to `main`, not on PRs
- [x] `dist/` pushed to `gh-pages` with commit message traceability
- [x] No manual `npm install` or git operations required for deploy

---

### 11.6 Deferred Optimization Strategies (Future Milestones)

**Added:** March 2, 2026 (Session 5)

These strategies were analyzed and ranked in Session 5. Strategy B (CI/CD) was implemented immediately. Strategies A and C are deferred but documented here to preserve the rationale.

---

**Strategy A — Playwright E2E Tests (Deferred: M3 or M4)**

Automate the manual test plan (currently 10 manual checklist items) with Playwright. Each item maps to a `test()` block. Key capabilities needed:
- `context.setOffline(true)` — simulate offline badge test
- `page.evaluate(() => localStorage.getItem(...))` — verify auto-save persistence
- File download interception — verify snapshot export
- The PWA install prompt test stays manual (`beforeinstallprompt` cannot be reliably simulated in headless browsers)

**Why deferred:** Playwright setup has the highest upfront investment of the three strategies. The manual test plan is manageable at current scale. Playwright becomes critical at M3/M4 when stateful ship design calculations are added — the risk of silent regressions in the calculation engine is where automated E2E tests pay off most.

**Integration point:** Once Strategy B (CI/CD) is stable, add a `test` job to `deploy.yml` that runs `npx playwright test` before the deploy step.

---

**Strategy C — Pre-commit Type + Lint Gate (Deferred: M3)**

Add `husky` + a pre-commit hook running `tsc --noEmit`. The `pwa.d.ts` structural bug in Session 5 (`BeforeInstallPromptEvent` declared outside `declare global {}`) was caught at build time after the fact. A pre-commit hook would catch it at the moment of authorship.

**Why deferred:** With Strategy B in place, the CI build now catches type errors before they reach `gh-pages`. The pre-commit hook adds redundant protection for solo development. It becomes valuable when a second contributor joins or when the codebase grows large enough that `tsc` takes >5 seconds (making CI feedback slow enough to be annoying).

**Implementation:** `husky install` + `.husky/pre-commit` running `npm run build -- --noEmit` (or a dedicated `typecheck` script). Pair with `eslint` for unused-variable enforcement.

---

### 11.7 Updated Risk Register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|------------|--------|------------|--------|
| Complex calculation errors | Medium | High | Extensive unit tests | ⏳ Pending |
| Performance on low-end devices | Medium | Medium | Optimize bundle, lazy loading | ⏳ Pending |
| Browser compatibility issues | Low | Medium | Feature detection, graceful degradation | ⏳ Pending |
| Data migration complexity | Low | Medium | Version tagging, migration scripts | ⏳ Pending |
| Scope creep | High | Medium | Strict MVP definition | ⏳ Ongoing |
| XSS via table fields | Low | High | React text rendering + sanitization on save | ⏳ FR-023 |
| Schema corruption breaking calculations | Medium | High | Schema validation on import + type coercion on load | ⏳ FR-023 |
| Users unaware app is installable | High | Medium | Install prompt + install-state indicator | ⏳ FR-021 |
| Users lose customisations on device switch | Medium | Medium | Settings snapshots export/import | ⏳ FR-024 |
| localStorage quota exceeded (50+ snapshots) | Low | Medium | 50-snapshot cap + storage usage indicator | ⏳ FR-024 |

---

### 11.6 Updated Milestone Plan

| Milestone | Scope | Status |
|-----------|-------|--------|
| M1: UI Layout & Tiling | Layout, tiles, focus mode, PWA | ✅ Complete |
| M2: Settings & Data Tables | JSON + table editors, all 13 tables, rule toggles | ✅ Complete |
| M2.5: Install UX & Settings System | FR-021 (install), FR-022 (auto-save + reset), FR-023 (security), FR-024 (snapshots), FR-025 (CI/CD) | ⚠️ Needs Verification |
| M2.6: Local Signal & Snapshot Fix | FR-021b (standalone indicator confirmed working), FR-024 (snapshots confirmed working in browser) | 🎯 Next — required before M3 |
| M3: Ship Generation | 19-step wizard, BOQ, real-time calculations | ⏳ Blocked on M2.6 |
| M4: Persistence & Export | Ship library, JSON/CSV/text/print export | ⏳ Pending |

---

### 11.8 M2.6 Blocker — Local Signal & Snapshots Verification Required

**Added:** March 2, 2026 (Session 5 wrap-up)
**Priority:** Critical — must resolve before M3 begins

**Problem Statement:**
End-of-session manual testing revealed that two M2.5 features are not confirmed working in the live deployed app:

1. **FR-021b — Standalone / "Installed" indicator** ("Local signal")
   - The header badge showing "Installed" (green dot) when the app is running as a standalone PWA has not been verified in the live environment
   - The `window.matchMedia('(display-mode: standalone)')` and `navigator.standalone` detection is implemented in code but has not been tested against the actual installed PWA on a real device or Chrome's install flow
   - Risk: the condition may never be true in practice if the app is not correctly registered as installable, or if the manifest/service worker configuration prevents the standalone display mode from activating

2. **FR-024 — Settings Snapshots**
   - The snapshots component is implemented but has not been verified working end-to-end in the browser
   - Specific concerns: async fetch of default table data during snapshot save, the `key={snapshotVersion}` remount triggering correctly after load, localStorage reads/writes at the `ce_shipgen_presets` key

**Required before M3:**
- [ ] Install the app from https://xunema.github.io/ce-shipgen/ on Chrome desktop
- [ ] Confirm "Installed" badge appears in header when running in standalone mode
- [ ] Confirm badge is absent when running in browser tab
- [ ] Save a snapshot, reload the page, confirm snapshot persists
- [ ] Load a snapshot, re-select a table, confirm data reflects the loaded snapshot
- [ ] If either feature is broken: diagnose, fix, redeploy, re-verify before opening M3

---

**PRD Status:** LIVING DOCUMENT — updated per session
**Last updated:** March 2, 2026 (Session 5 wrap-up)
**Next implementation target:** M2.6 — Verify and fix Local signal (FR-021b) and Snapshots (FR-024) before M3
