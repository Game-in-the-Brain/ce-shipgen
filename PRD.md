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

## 2. FUNCTIONAL REQUIREMENTS

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

#### FR-006: Responsive Layout with Mode Toggle
**Priority:** Critical
**Description:** Two distinct layout modes with manual toggle

**Desktop/Tablet Mode (Landscape):**
- Horizontal tiling (left-to-right)
- Three columns: Navigation (15%), Tiles (55%), Summary (30%)
- All 19 tiles visible side-by-side or in grid

**Phone/Mobile Mode (Portrait):**
- Vertical tiling (top-to-bottom)
- Sticky summary bar at top
- Scrollable tiles stack
- Bottom navigation or swipe gestures

**Layout Toggle:**
- Manual button in header
- Auto-detect viewport size
- Store preference in localStorage

**Acceptance:** No horizontal scroll on mobile, all features accessible, toggle works instantly

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

#### FR-009: Settings Screen with JSON Editor
**Priority:** High
**Description:** Pre-design configuration with editable data tables

**Sections:**
1. **Layout Settings:** Desktop/Phone mode, focus behavior, animations
2. **Rule Settings:** Cepheus/Mneme/Custom, individual rule toggles
3. **JSON Table Editor:**
   - Select table from dropdown
   - Inline JSON editor with syntax highlighting
   - Real-time schema validation
   - Preview, Save, Export, Reset, Import
4. **Theme Settings:** Dark/Light/Auto, colors, fonts
5. **Data Management:** Export/Import/Clear all ships

**Acceptance:** JSON editor validates schema, changes apply immediately, import/export works, settings persist

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
| M2.5: Install UX & Settings System | FR-021 (install prompt), FR-022 (auto-save + reset), FR-023 (security), FR-024 (snapshots), FR-025 (CI/CD) | ✅ Complete — "Installed" badge and snapshots verified working |
| M2.6: Installed Version Control | FR-026 — Version display, update detection (SW-based), user-controlled updates, offline behavior | ✅ Complete — Built and deployed |
| M2.7: Tables In Play | FR-027 — Active table selector per component type; "Tables In Play" view in Settings lets user switch which table drives each design step | 🎯 Current |
| M2.8: QA Ships | FDR-067 — Validate all 43 ships, fix merged/empty data, update taxonomy | 🎯 Current (parallel with M2.7) |
| M3.1: Hull & Foundation | FR-028 — Hull selection (18 sizes), configuration (3 types), armor selection, min/max constraints for M-Drive, J-Drive, Power Plant derived from hull tonnage | ⏳ Blocked on M2.7 + M2.8 |
| M3.2: Bridge to Crew | Steps 7–12: Bridge/Cockpit, Computer, Software, Sensors, Crew calculation | ⏳ Pending |
| M3.3: Fittings to BOQ | Steps 13–19: Accommodations, Features, Weapons/Turrets, Vehicles, Cargo, Cost Summary (BOQ) | ⏳ Pending |
| M3.4: Procedural Design | FDR-068 — Priority-based algorithm generates complete ship from sliders/presets | ⏳ Post-M3.3 |
| M3.5: Procedural Presets | FDR-068b — 6 canonical presets + custom preset save/load | ⏳ Post-M3.4 |
| M4: Persistence & Export | Ship library, JSON/CSV/text/print export | ⏳ Pending |
| M4.1: TL10–11 Variants | FDR-069 — Generate 86 TL variants (43 ships × 2 TLs) | ⏳ Post-M3 |
| M4.2: TL12–13 Variants | FDR-069 — Generate 86 variants + faction overrides | ⏳ Post-M4.1 |
| M4.3: TL14–15 Variants | FDR-069 — Generate 86 variants + capital ships | ⏳ Post-M4.2 |
| M4.4: Variant Browser UI | Library tab for TL comparison and faction filtering | ⏳ Post-M4.1 |

---

### 11.8 M2.5 Completed — Local Signal & Snapshots Verified

**Status:** ✅ COMPLETE — March 3, 2026

**Verification Results:**
1. ✅ **FR-021b — Standalone / "Installed" indicator** 
   - "Installed" badge correctly appears when app runs in standalone mode
   - Badge is absent when running in browser tab
   - Detection via `window.matchMedia('(display-mode: standalone)')` and `navigator.standalone` works correctly

2. ✅ **FR-024 — Settings Snapshots**
   - Save snapshot: Creates entry with timestamp-based name
   - Persist: Survives page reload
   - Load: Correctly restores all 13 tables and rule settings
   - Export/Import: Working with proper JSON format

**M2.5 is complete. M2.6 is complete. Proceeding to M2.7 (Tables In Play) before opening M3.**

---

## 12. ADDENDUM — M2.6 Installed Version Control (FR-026)

**Added:** March 3, 2026  
**Priority:** Critical — Current Implementation Target  
**Milestone:** M2.6 — Must complete before M3

### 12.1 Problem Statement

Users with the PWA installed locally have no control over when updates are applied. While the "Installed" badge (FR-021b) successfully detects when the app runs as a standalone PWA, users currently cannot:
- See which version they have installed
- Choose when to apply updates (updates apply automatically on page reload)
- Roll back to previous versions if a new version has issues
- Opt into beta/release channels for early access
- Lock to a specific version for campaign consistency

**Impact:** A broken release could disrupt active campaigns. Users need agency over their local instance.

### 12.2 Solution Overview

A version control system that treats the installed PWA like a package manager treats software:
- Version is visible and tracked
- Updates are detected but not forced
- User controls when to update
- Previous versions remain available for rollback
- Multiple release channels (stable/beta)

### 12.3 Requirements

#### FR-026a: Version Manifest

**Storage:** A `version.json` file is generated at build time and deployed with the app:
```json
{
  "version": "0.04",
  "buildTimestamp": "2026-05-02T12:16:44Z",
  "channel": "stable",
  "changelog": [
    "CRITICAL FIX: Drive performance formula replaced with Excel lookup table",
    "Fixed tender push capacity calculations",
    "Merged ships fix: split 12 merged ships",
    "Rebuilt 6 empty SRD ships from CE formulas",
    "Added pushCapacity field to all 40 ships"
  ],
  "minimumCompatibleVersion": "0.03"
}
```

**Location:** `/ce-shipgen/version.json` (served alongside the app)

**Generation:** Vite plugin or npm script that writes this file during `npm run build`

---

#### FR-026b: Settings Version Control — Two Distinct Sections

The Settings screen contains two separate, always-present sections for version management. They are intentionally separate: one explains the model (static), the other shows live state (dynamic).

**Section 1 — "Updating" (static instructions, always visible)**
See FR-026j for full specification.

**Section 2 — "Version" (live state, always visible)**

**Location:** Settings → Version section (below the Updating section)

**Display format:**
```
Current Version
0.2.6 (stable)
Build: Mon, 03 Mar 2026 14:30:00 UTC
```

**Requirements:**
- Fetch `version.json` on Settings screen mount via `useVersionCheck` hook
- Show loading state while fetching
- Show "Version information unavailable" if fetch fails
- Show current version string, channel, and build timestamp (UTC)
- When `needRefresh` is true: show Update Available banner (FR-026c indicators) with changelog toggle and Update Now button (FR-026e)
- When offline and no update pending: show "Offline — version check unavailable" note

---

#### FR-026c: Update Detection

**Mechanism:** The service worker's `needRefresh` signal from `useRegisterSW` (vite-plugin-pwa) is the primary update trigger. `version.json` is fetched separately for displaying changelog and build metadata only.

**Process:**
1. `useRegisterSW` (called in App.tsx) registers the service worker and monitors for a waiting SW
2. When a new SW installs and is waiting, `needRefresh` becomes `true`
3. `needRefresh` is passed as a prop to Header, StartupScreen, and SettingsScreen

**Detection indicators:**
- **Startup screen:** Amber "Update Available" pill button below version text
- **Header (all screens):** Orange dot on Settings icon when update available
- **Settings screen:** Orange banner in Version section with changelog + Update Now button

**Note:** `version.json` is fetched on Settings screen load for version display and changelog content. It is served with NetworkFirst cache strategy so it is always current.

---

#### FR-026d: Changelog Display

**Modal dialog:** When user clicks "View Changelog"

**Content:**
- Current version → New version
- Full changelog array from version.json
- Breaking changes highlighted in red (if any)
- Release date

**Button:** "Update Now" / "Cancel"

---

#### FR-026e: User-Controlled Update

**Core Principle:** User initiates update, never forced

**Update flow:**
1. User sees "Update Available" indicator (startup pill or Settings banner)
2. User clicks "Update Now"
3. `updateServiceWorker(true)` is called — this posts `SKIP_WAITING` to the waiting SW, listens for `controllerchange`, then reloads the page
4. New version activates

**Implementation:** Uses `updateServiceWorker` from `useRegisterSW` (vite-plugin-pwa `virtual:pwa-register/react`). Do NOT use `window.location.reload(true)` — that argument is deprecated and does not activate a waiting service worker.

---

#### FR-026f: Version Rollback — DESCOPED from M2.6

**Reason:** Not achievable with GitHub Pages + standard Workbox service workers. When a new SW activates, Workbox purges the previous version's cache. There is no old code left to restore. Storing version metadata in localStorage does not restore old app code — it would show a success toast while serving the current version.

**Future path:** Rollback requires either (a) serving previous versions at versioned URLs (e.g. `/v0.2.5/`), or (b) a CDN that preserves old build artifacts. Neither exists in the current GitHub Pages deployment.

**Deferred to:** A future milestone when a proper multi-version hosting strategy is in place.

---

#### FR-026g: Release Channels — DESCOPED from M2.6

**Reason:** A beta channel requires a separate CI/CD pipeline that publishes a distinct build to a `version-beta.json` endpoint. No such pipeline or hosting path exists. Building the UI toggle without the backend infrastructure would be non-functional.

**Deferred to:** A future milestone when a multi-channel CI/CD pipeline (e.g. `main` → stable, `develop` → beta) is in place.

---

#### FR-026h: Offline Version Behavior

**Installed PWA can run offline:** Yes, via service worker cache

**Version detection when offline:**
- Cannot fetch remote version.json
- Show "Offline — version check unavailable" subtly in Settings
- No update prompts while offline

**Update while offline:**
- Update button disabled with tooltip: "Connect to internet to update"
- Background: When connection restored, automatically check for updates

---

#### FR-026i: Service Worker Integration

**Change from M2.5:** `vite.config.ts` switches from `registerType: 'autoUpdate'` → `registerType: 'prompt'`

**Do NOT add a manual `navigator.serviceWorker.register()` call.** vite-plugin-pwa handles registration internally via the `useRegisterSW` hook.

**Implementation:**
```typescript
// App.tsx
import { useRegisterSW } from 'virtual:pwa-register/react'

const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
// needRefresh: true when a new SW is installed and waiting
// updateServiceWorker(true): posts SKIP_WAITING, waits for controllerchange, reloads
```

**vite.config.ts workbox changes:**
- `globPatterns`: remove `json` to avoid precaching `version.json`
- `runtimeCaching`: add NetworkFirst rule for `/version.json` so it is always fetched fresh

**Type declarations:** Add `/// <reference types="vite-plugin-pwa/client" />` to `vite-env.d.ts`

---

#### FR-026j: Updating Instructions Section

**Purpose:** A permanent, always-visible section in Settings that explains the update model to the user. This section never changes based on app state — it is static explanatory content. It gives users confidence and agency before they ever encounter an update notification.

**Location:** Settings → "Updating" section (placed above the "Version" section)

**Why a separate section is required:**
The "Version" section shows live state (current version number, update banner). The "Updating" section explains the *model* — how updates work in principle. Mixing the two creates a UI where instructions only appear when an update is available, meaning first-time users who do update have never read how it works. Permanent instructions remove this gap.

**Content requirements:**

| Step | Content |
|------|---------|
| 1 | Updates download automatically in the background when online. **You are never forced to update.** |
| 2 | When a new version is ready, an orange dot appears on the Settings icon in the header, and a pill button appears on the startup screen. |
| 3 | Come to the Version section below and click **Update Now** when ready. The app reloads with the new version. |
| 4 | All settings, snapshots, rules, and table customisations are stored locally and are **never affected by updates**. |

**Footer note (de-emphasised):**
> If you are offline, updates are queued until you reconnect. You can keep using the app normally while offline.

**UI pattern:** Numbered list with cyan step numbers. Step text in `text-gray-300`. Bold emphasis on key guarantees (`text-white`). Footer in `text-xs text-gray-500` with a top border separator.

**Mockup:**
```
┌─────────────────────────────────────┐
│ Updating                            │
│ How app updates work                │
├─────────────────────────────────────┤
│                                     │
│  1. Updates download automatically  │
│     in the background. You are      │
│     never forced to update.         │
│                                     │
│  2. When ready, an orange dot       │
│     appears on the Settings icon    │
│     and a pill on the startup       │
│     screen.                         │
│                                     │
│  3. Open Settings → Version below   │
│     and click Update Now. The app   │
│     reloads with the new version.   │
│                                     │
│  4. All your settings, snapshots,   │
│     rules, and table data are       │
│     never affected by updates.      │
│                                     │
│  ─────────────────────────────────  │
│  If offline, updates queue until    │
│  you reconnect.                     │
│                                     │
└─────────────────────────────────────┘
```

---

### 12.4 Data Preservation Rules

**CRITICAL:** Version changes must NEVER affect user data

**Preserved across updates:**
- ✅ All settings snapshots (localStorage: `ce_shipgen_presets`)
- ✅ Live working state (localStorage: `ce_shipgen_table_*`)
- ✅ Rule preferences (localStorage: `ce_shipgen_rules`)
- ✅ Layout preference (localStorage: `ce_shipgen_layout`)

**Not preserved (app code only):**
- ❌ version.json (regenerated each build)
- ❌ Service worker cache (refreshed on update — old cache purged by Workbox)

**Data migration:**
- If new version requires data migration, `version.json` includes `minimumCompatibleVersion`
- If current version < minimumCompatibleVersion: show warning "Your data is from an incompatible version. Some features may not work."
- Auto-migrate data forward (never backward)

---

### 12.5 UI Mockup

**Settings — full Version Control area (no update available):**

```
┌─────────────────────────────────────┐
│ Updating                            │
│ How app updates work                │
├─────────────────────────────────────┤
│  1. Updates download automatically  │
│     in the background. You are      │
│     never forced to update.         │
│  2. When ready, an orange dot       │
│     appears on the Settings icon    │
│     and a pill on startup screen.   │
│  3. Open Settings → Version below   │
│     and click Update Now.           │
│  4. All your data is never touched  │
│     by updates.                     │
│  ─────────────────────────────────  │
│  If offline, updates queue until    │
│  you reconnect.                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Version                             │
├─────────────────────────────────────┤
│  Current Version                    │
│  0.2.6 (stable)                     │
│  Build: Mon, 03 Mar 2026 14:30 UTC  │
└─────────────────────────────────────┘
```

**Settings → Version section (update available):**

```
┌─────────────────────────────────────┐
│ Version                             │
├─────────────────────────────────────┤
│  Current Version                    │
│  0.2.6 (stable)                     │
│  Build: Mon, 03 Mar 2026 14:30 UTC  │
│                                     │
│  🟠 Update Available                │
│  [View Changelog]  [Update Now]     │
│  • M2.6: Version display…           │
│  • User-controlled updates…         │
└─────────────────────────────────────┘
```

**Startup screen (update available):**

```
Version 0.2.6 | M2.6: Version Control | M2.5 ✓
[ 🔄 Update Available — Tap to Update ]
```

**Header (update available):**

```
CE ShipGen  [Installed ●]    [□] [+] [≡] [⚙●]
                                           ↑ orange dot
```

---

### 12.6 Acceptance Criteria

**FR-026j — Updating Instructions Section:**
- [x] "Updating" section is always visible in Settings regardless of update state
- [x] Section is placed above the "Version" section
- [x] All four steps are present: background download, indicator locations, how to apply, data safety guarantee
- [x] Offline footnote is present at the bottom of the section
- [x] Content is static — does not change based on `needRefresh` or online state

**FR-026b — Version Section:**
- [x] Current version displays in Settings → Version section
- [x] Version, channel, and build timestamp (UTC) all shown
- [x] Loading state shown while `version.json` is fetching
- [x] "Version information unavailable" shown gracefully if fetch fails

**FR-026c/e — Update Detection & Application:**
- [x] `registerType: 'prompt'` — new SW waits, does not auto-activate
- [x] `needRefresh` signal drives "Update Available" indicator (startup + header dot + settings banner)
- [x] Changelog from `version.json` is viewable in Settings when update available
- [x] "Update Now" calls `updateServiceWorker(true)` — correct SW activation + reload

**FR-026h — Offline:**
- [x] Offline: update button replaced with "Connect to internet to update" message
- [x] Offline note in Updating Instructions section always visible

**FR-026a/i — Build & Service Worker:**
- [x] `version.json` is generated on every `npm run build` with correct metadata
- [x] `version.json` excluded from precache; served via NetworkFirst runtimeCaching
- [x] Build passes `tsc && vite build` with zero errors

**Manual verification (requires live HTTPS + installed PWA):**
- [ ] Update flow tested end-to-end on actual installed PWA

**Descoped from M2.6:**
- ~~Version History & Rollback (FR-026f)~~ — not achievable; old builds purged by Workbox on SW activation
- ~~Release Channels (FR-026g)~~ — requires multi-channel CI/CD pipeline that doesn't exist yet

---

### 12.7 Implementation Notes

**Build-time version.json generation (`scripts/write-version.mjs`):**
```javascript
import { writeFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))

const versionInfo = {
  version: pkg.version,
  buildTimestamp: new Date().toISOString(),
  channel: process.env.RELEASE_CHANNEL || 'stable',
  changelog: [ /* session-specific entries */ ],
  minimumCompatibleVersion: '0.2.5'
}

writeFileSync(join(__dirname, '../public/version.json'), JSON.stringify(versionInfo, null, 2))
```

Run via `prebuild` in `package.json`: `"prebuild": "node scripts/write-version.mjs"`

**useRegisterSW usage (App.tsx):**
```typescript
import { useRegisterSW } from 'virtual:pwa-register/react'

const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
// Pass needRefresh and updateServiceWorker as props to Header, StartupScreen, SettingsScreen
```

**vite.config.ts workbox config:**
```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],  // no json
  runtimeCaching: [{
    urlPattern: /\/version\.json$/,
    handler: 'NetworkFirst',
    options: { cacheName: 'version-manifest', networkTimeoutSeconds: 3 }
  }]
}
```

**Key files added/changed in M2.6:**
- `package.json` — version `0.2.6`, `prebuild` script
- `scripts/write-version.mjs` — build-time version.json generator
- `public/version.json` — generated artifact (committed as initial baseline)
- `vite.config.ts` — `registerType: 'prompt'`, workbox runtimeCaching
- `src/vite-env.d.ts` — `/// <reference types="vite-plugin-pwa/client" />`
- `src/hooks/useVersionCheck.ts` — fetch version.json, return VersionInfo
- `src/App.tsx` — useRegisterSW, pass props
- `src/components/screens/StartupScreen.tsx` — Update Available pill
- `src/components/screens/SettingsScreen.tsx` — "Updating" instructions section (FR-026j) + "Version" live-state section (FR-026b)

---

**PRD Status:** LIVING DOCUMENT — updated per session
**Last updated:** May 2, 2026 — M2.8 (FDR-067), M3.4–3.5 (FDR-068), and M4.1–4.4 (FDR-069) added
**Next implementation target:** M2.7 — Tables In Play (FR-027), then M2.8 — QA Ships (FDR-067), then M3.1 — Hull & Foundation (FR-028)

---

## 13. ADDENDUM — M2.7 Tables In Play (FR-027)

**Added:** March 3, 2026
**Priority:** Critical — prerequisite for M3
**Milestone:** M2.7 — must complete before M3.1

### 13.1 Problem Statement

The M2 JSON/Table editor lets users create and edit custom data tables, but there is no mechanism to select *which* table is active for each component type during ship design. When the M3 wizard loads Hull options, it has no way to know whether to use the default CE table or a custom Mneme variant the user has built. M2.7 bridges M2 (table editing) and M3 (table consumption).

### 13.2 Concept

Each of the 13 component types maps to exactly one **active table** at any time. By default every type points to the built-in CE default. If the user has created custom tables in the JSON editor, they can promote any one of them to "active" for that type. The ship design wizard always reads from the active table, never hardcoded defaults.

This allows players to:
- Use standard CE rules out of the box (all defaults)
- Activate Mneme variant tables for specific component types (e.g. Mneme drives, CE hulls)
- Create entirely custom rule variants by building and activating their own tables

### 13.3 Requirements

#### FR-027a: Active Table Registry

**Storage:** `ce_shipgen_active_tables` — object in localStorage mapping each component type ID to its active table key:

```json
{
  "hull":           "default",
  "configuration":  "default",
  "armor":          "default",
  "m_drive":        "default",
  "j_drive":        "default",
  "power_plant":    "default",
  "bridge":         "default",
  "computer":       "default",
  "sensors":        "default",
  "accommodations": "default",
  "features":       "default",
  "weapons":        "default",
  "vehicles":       "default"
}
```

**Default behaviour:** If a type is absent from the registry (first run, or key deleted), fall back to the built-in default table for that type.

---

#### FR-027b: Tables In Play View

**Location:** Settings → "Tables In Play" section (placed between Rule Settings and the JSON Table Editor)

**Layout:** A compact table — one row per component type:

| Component Type | Active Table | |
|----------------|-------------|---|
| Hull | CE Default | [Change ▼] |
| Configuration | CE Default | [Change ▼] |
| Armor | CE Default | [Change ▼] |
| M-Drive | Mneme Drives (custom) | [Change ▼] |
| … | … | … |

**Dropdown contents per row:** List of all available tables for that component type:
- Built-in default (labelled "CE Default")
- Any custom tables the user has saved for that type (labelled with their given name)

**Visual indicators:**
- Rows using default: plain text
- Rows using a custom table: table name shown in `text-accent-cyan`
- "Reset All to Defaults" button at the bottom of the section

---

#### FR-027c: Table Type Tagging

Each custom table created/saved in the JSON Table Editor must carry a `type` field matching one of the 13 component type IDs. This is how the "Tables In Play" dropdown knows which tables to offer per row.

**Existing tables in `public/data/`** are already organised by filename (e.g. `hulls.json`, `armor.json`). Their type is derived from their filename. Custom user tables saved to localStorage carry the type of the source table they were derived from.

---

#### FR-027d: Consumption by Ship Design Wizard

When any M3 wizard step loads its component options, it calls a `getActiveTable(type)` helper that:
1. Reads `ce_shipgen_active_tables` from localStorage
2. Returns the key for the active table of that type
3. Fetches the corresponding table data (from `public/data/` for defaults, or localStorage for custom)

This is the single integration point between M2.7 and M3. All wizard steps use this helper — none reference table files directly.

---

### 13.4 Acceptance Criteria

- [ ] `ce_shipgen_active_tables` initialized on first run with all defaults
- [ ] Settings → "Tables In Play" shows all 13 component types
- [ ] Dropdown for each type lists built-in default + any user custom tables of that type
- [ ] Selecting a custom table updates the registry and persists
- [ ] Custom tables shown in cyan; defaults in plain text
- [ ] "Reset All to Defaults" reverts registry without touching custom table data
- [ ] `getActiveTable(type)` helper returns correct table data for default and custom cases
- [ ] Active table registry survives page reload and app updates
- [ ] Settings snapshots (FR-024) include the active table registry in save/restore

---

## 14. ADDENDUM — M3 Ship Generation Sub-Milestones

**Added:** March 3, 2026
**Depends on:** M2.7 (FR-027) complete

The 19-step ship design process is split into three sequential sub-milestones. Each sub-milestone delivers a usable, testable slice of the wizard.

### 14.1 M3.1: Hull & Foundation (FR-028)

**Steps covered:** 1 (Hull), 2 (Configuration), 3 (Armor), and constraint display for 4–6 (Drives & Power Plant)

**Priority:** Critical — first playable ship design step

---

#### FR-028a: Hull Selection

**Source table:** Active hull table (via `getActiveTable('hull')`)

**Display:** Selection UI showing all available hull sizes:

| Size (Dtons) | Hull Points | Structure Points | Cost (MCr) | Build Time |
|-------------|-------------|-----------------|------------|------------|
| 100 | 2 | 2 | 2 | 36 months |
| 200 | 4 | 4 | 8 | … |
| … | … | … | … | … |

**Auto-calculated on selection:**
- Hull Points = `floor(Dtons / 50)`
- Structure Points = `ceil(Dtons / 50)`
- Available Hardpoints = `floor(Dtons / 100)`
- Fuel tankage range (displayed as constraint for Step 7)

**Acceptance:** Selecting a hull size immediately populates HP, SP, hardpoints, and unlocks steps 2–6.

---

#### FR-028b: Configuration

**Source table:** Active configuration table (via `getActiveTable('configuration')`)

**3 types:**

| Configuration | Armour Cost Multiplier | Notes |
|--------------|----------------------|-------|
| Standard | ×1 | Default |
| Distributed | ×1 (but harder to disable) | |
| Close Structure | ×1.5 | Additional tonnage cost |

**Effect:** Configuration is recorded on the ship design and modifies armor tonnage cost in Step 3.

**Acceptance:** Selecting a configuration updates the armor cost calculation in real time.

---

#### FR-028c: Armor Selection

**Source table:** Active armor table (via `getActiveTable('armor')`)

**Display:** Armor types with their tonnage cost (percentage of hull) and protection value.

**Tonnage calculation:**
```
Armor Tonnage = hull_dtons × armor_percentage × configuration_multiplier
```

**Acceptance:** Selecting armor type and amount auto-calculates tonnage used and deducts from available tonnage.

---

#### FR-028d: Drive & Power Plant Constraint Display (Steps 4–6)

Once hull is selected, compute and display the valid selection ranges for the next three steps. These are *displayed as constraints* — the actual drive/power plant selector is implemented in M3.2.

**M-Drive valid range:**
- Minimum: none required (optional)
- Maximum: determined by hull tonnage from the Drive Performance table
- Show: letter range A–Z available for this hull, and corresponding thrust values (1G–6G)

**J-Drive valid range:**
- Minimum: none required (optional)
- Maximum: determined by hull tonnage from the Drive Performance table
- Show: letter range and corresponding jump range (J1–J6)

**Power Plant minimum:**
- `PP_min_letter = max(selected_M_drive_letter, selected_J_drive_letter)`
- Until drives are selected, show "PP minimum: depends on drive selections"
- Show: valid letter range and fuel consumption per week

**UI:** Each of the three drive/plant steps displays a compact constraint summary derived from the hull selection, e.g.:
```
Hull: 400 dtons selected
M-Drive: A–F available (Thrust 1–6)
J-Drive: A–F available (Jump 1–6)
Power Plant: min = your drive choice, max = F
```

**Acceptance:** Constraint summary updates immediately when hull size changes. Drive and power plant tiles show the valid range, not the full table.

---

### 14.2 M3.2: Bridge to Crew (FR-029) — Scope Only

**Steps covered:** 7 (Fuel), 8 (Bridge/Cockpit), 9 (Computer), 10 (Software), 11 (Sensors), 12 (Crew Calculation)

**Key calculation:** Crew is auto-calculated from component selections — not manually entered. Each component type has a crew requirement; the wizard sums them and validates against bridge station count.

*Full FR-029 specification to be written when M3.1 is complete.*

---

### 14.3 M3.3: Fittings to BOQ (FR-030) — Scope Only

**Steps covered:** 13 (Accommodations), 14 (Features), 15 (Turrets/Bays/Screens), 16 (Weapons), 17 (Vehicles), 18 (Cargo), 19 (Cost Summary / BOQ)

**Key deliverable:** The BOQ (Bill of Quantities) — a complete component breakdown showing every item, its tonnage, and its cost. This is the primary output of the ship design process.

*Full FR-030 specification to be written when M3.2 is complete.*

---

### 14.4 M3 Milestone Table

| Sub-Milestone | Steps | FRs | Depends On | Status |
|--------------|-------|-----|------------|--------|
| M3.1: Hull & Foundation | 1–3 + constraint display for 4–6 | FR-028a–d | M2.7 (FR-027) | ⏳ Blocked on M2.7 |
| M3.2: Bridge to Crew | 7–12 | FR-029 | M3.1 | ⏳ Pending |
| M3.3: Fittings to BOQ | 13–19 | FR-030 | M3.2 | ⏳ Pending |

