# CE ShipGen

**CEpheus Engine Ship Generator** - A Progressive Web App for designing starships

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://game-in-the-brain.github.io/ce-shipgen/)
[![Status](https://img.shields.io/badge/Status-M3%20Current-blue)](https://github.com/xunema/ce-shipgen#-milestone-status)

**Live Demo:** https://game-in-the-brain.github.io/ce-shipgen/
https://pages.gi7b.org/gi7b/ce-shipgen/


---

## 📊 Milestone Status

| Milestone | Scope & Deliverables | Status |
|-----------|----------------------|--------|
| **M1: UI Layout & Tiling** | Tile-based layout system, focus mode, desktop/phone modes, PWA scaffolding, service worker, offline support | ✅ Complete |
| **M2: Settings & Data Tables** | JSON editor + spreadsheet view for all 13 ship component tables, rule toggles (CE / Mneme / custom mix) | ✅ Complete |
| **M2.5: Install UX & Settings System** | PWA install prompt + "Installed" badge (FR-021), auto-save table edits (FR-022), input sanitisation (FR-023), named settings snapshots save/load/export/import (FR-024), GitHub Actions CI/CD pipeline (FR-025) | ✅ Complete |
| **M2.6: Installed Version Control** | Build-time `version.json` generation (FR-026a), version display in Settings (FR-026b), SW-based update detection — never forced (FR-026c), changelog viewer (FR-026d), user-controlled update via `updateServiceWorker` (FR-026e), offline guard (FR-026h), `registerType: prompt` SW integration (FR-026i), permanent Updating Instructions section in Settings (FR-026j) | ✅ Complete |
| **M2.7: Tables In Play** | Active table selector per component type (FR-027a–d). Settings → "Tables In Play" shows all 13 component types with a dropdown to switch between built-in default and any custom tables. Feeds directly into M3 — the design wizard always reads from the active table, never hardcoded defaults. | 🎯 Current |
| **M3.1: Hull & Foundation** | Steps 1–3: Hull selection (18 sizes, auto-calc HP/SP/hardpoints), Configuration (Standard / Distributed / Close Structure), Armor (tonnage = hull × % × config multiplier). Plus constraint display for Steps 4–6: valid M-Drive, J-Drive, and Power Plant letter ranges derived from hull tonnage. | ⏳ Blocked on M2.7 |
| **M3.2: Bridge to Crew** | Steps 7–12: Fuel calculation, Bridge/Cockpit, Computer, Software, Sensors, auto-calculated Crew requirement (summed from component selections, validated against bridge stations) | ⏳ Pending |
| **M3.3: Fittings to BOQ** | Steps 13–19: Accommodations, Features, Turrets/Bays/Screens, Weapons, Vehicles, Cargo, Cost Summary. Key output: BOQ (Bill of Quantities) — full component breakdown with tonnage and cost per item | ⏳ Pending |
| **M4: Persistence & Export** | Ship library with save/load/delete, JSON / CSV / text / print export, common ship templates | ⏳ Pending |

> **Descoped from M2.6:** Rollback (FR-026f) and Release Channels (FR-026g) require versioned URL hosting and a multi-channel CI/CD pipeline that do not yet exist on GitHub Pages. Deferred to a future milestone.

---

## 🗂️ Feature Status

**Legend:** ✅ Built & deployed — 📋 Specified in PRD, not yet coded — 🔲 Scope defined, detail pending — ~~Descoped~~

---

### M1: UI Layout & Tiling

| Feature | FR | Status |
|---------|-----|--------|
| Tile-based layout — each design step is a collapsible tile | FR-007 | ✅ |
| Desktop mode — horizontal tiling, multi-column layout | FR-006 | ✅ |
| Phone mode — vertical tiling, scrollable stack | FR-006 | ✅ |
| Layout mode toggle in header (Desktop ↔ Phone) | FR-006 | ✅ |
| Layout preference persisted to localStorage | FR-006 | ✅ |
| Focus mode — expand any tile to full-screen | FR-007 | ✅ |
| Startup screen — branded entry point with navigation | FR-008 | ✅ |
| Header — navigation links to Design / Library / Settings | FR-008 | ✅ |
| PWA manifest — installable web app | FR-016 | ✅ |
| Service worker — offline-first caching | FR-016 | ✅ |
| Offline support — works without internet after first load | FR-016 | ✅ |
| Shareable URLs — `/design`, `/library`, `/settings` routes | FR-008 | ✅ |

---

### M2: Settings & Data Tables

| Feature | FR | Status |
|---------|-----|--------|
| Settings screen with sectioned layout | FR-009 | ✅ |
| JSON table editor — select table, edit raw JSON, Apply | FR-009 | ✅ |
| Spreadsheet table view — edit cells directly in a grid | FR-009 | ✅ |
| Toggle between JSON view and table view per table | FR-009 | ✅ |
| All 13 ship component tables loaded from `public/data/` | FR-009 | ✅ |
| Reset individual table to factory default | FR-009 | ✅ |
| Rule Settings — toggle CE / Mneme / Custom rule sets | FR-010 / FR-015 | ✅ |
| Rule preferences persisted to localStorage | FR-010 | ✅ |

**13 Component Tables:**

| Table | Contents | Status |
|-------|----------|--------|
| `ship_hulls.json` | 18 hull sizes, HP, SP, cost, build time | ✅ |
| `ship_drives.json` | 26 drive codes, M-Drive & J-Drive performance | ✅ |
| `hull_configurations.json` | Standard, Distributed, Close Structure | ✅ |
| `ship_armor.json` | Armor types, tonnage %, protection | ✅ |
| `ship_bridge_computer.json` | 4 bridge sizes, 7 computer models | ✅ |
| `ship_software.json` | 5 software programs | ✅ |
| `ship_sensors.json` | 5 sensor types | ✅ |
| `ship_crew.json` | 14 crew positions | ✅ |
| `life_support.json` | 18 accommodation types | ✅ |
| `ship_weapons.json` | 8 weapon types | ✅ |
| `ship_missiles.json` | 3 missile types | ✅ |
| `ship_vehicles.json` | 11 vehicle types | ✅ |
| `smallcraft_drives.json` | 21 small craft drive codes | ✅ |

---

### M2.5: Install UX & Settings System

| Feature | FR | Status |
|---------|-----|--------|
| PWA install prompt — "Install App" button (Chrome/Edge) | FR-021a | ✅ |
| iOS "Add to Home Screen" instructions | FR-021a | ✅ |
| "Installed" badge in header when running as standalone PWA | FR-021b | ✅ |
| "Offline" badge in header when network is unavailable | FR-021b | ✅ |
| Auto-save table edits — no Save button in table view | FR-022a | ✅ |
| "Saved" toast notification after each auto-save | FR-022a | ✅ |
| "Apply JSON" button retained in JSON view | FR-022a | ✅ |
| Input sanitisation — strip HTML tags from table cell values | FR-023b | ✅ |
| Named settings snapshots — save current state with a name | FR-024a/b | ✅ |
| Snapshot list — view, rename, delete saved snapshots | FR-024c | ✅ |
| Load snapshot — restore all 13 tables + rules from snapshot | FR-024d | ✅ |
| Export snapshot — download as `.json` file | FR-024c | ✅ |
| Import snapshot — load from `.json` file | FR-024c | ✅ |
| Snapshot cap — max 50 snapshots with warning | FR-024b | ✅ |
| GitHub Actions CI/CD — auto-deploy to `gh-pages` on push to `main` | FR-025 | ✅ |
| PR build-check gate — builds but does not deploy on pull requests | FR-025 | ✅ |

---

### M2.6: Installed Version Control

| Feature | FR | Status |
|---------|-----|--------|
| `version.json` generated at build time via `scripts/write-version.mjs` | FR-026a | ✅ |
| `prebuild` npm script runs version generation before every build | FR-026a | ✅ |
| Version display in Settings — version, channel, build timestamp | FR-026b | ✅ |
| "Updating Instructions" section in Settings — permanent, always visible | FR-026j | ✅ |
| SW-based update detection — `needRefresh` from `useRegisterSW` | FR-026c | ✅ |
| "Update Available" amber pill on startup screen | FR-026c | ✅ |
| Orange dot on Settings header icon when update waiting | FR-026c | ✅ |
| "Update Available" banner in Settings → Version section | FR-026c | ✅ |
| Changelog viewer — expandable list in Settings when update available | FR-026d | ✅ |
| User-controlled update — "Update Now" calls `updateServiceWorker(true)` | FR-026e | ✅ |
| `registerType: 'prompt'` — new SW never auto-activates | FR-026i | ✅ |
| `version.json` served NetworkFirst — never served stale from cache | FR-026i | ✅ |
| Offline guard — update button replaced with "Connect to internet" message | FR-026h | ✅ |
| ~~Version rollback — descoped~~ (Workbox purges old cache on SW activation) | ~~FR-026f~~ | ~~Descoped~~ |
| ~~Release channels (stable/beta) — descoped~~ (no multi-channel CI/CD) | ~~FR-026g~~ | ~~Descoped~~ |

---

### M2.7: Tables In Play *(specified — implementation next)*

| Feature | FR | Status |
|---------|-----|--------|
| Active table registry — `ce_shipgen_active_tables` in localStorage | FR-027a | 📋 |
| Default all 13 types to built-in CE tables on first run | FR-027a | 📋 |
| Settings → "Tables In Play" section — one row per component type | FR-027b | 📋 |
| Dropdown per row — lists CE Default + all custom tables of that type | FR-027b | 📋 |
| Custom table rows highlighted in cyan; default rows in plain text | FR-027b | 📋 |
| "Reset All to Defaults" button — reverts registry, preserves custom data | FR-027b | 📋 |
| Table type tagging — custom tables carry their component type ID | FR-027c | 📋 |
| `getActiveTable(type)` helper — single integration point for M3 wizard | FR-027d | 📋 |
| Active table registry included in FR-024 settings snapshots | FR-027d | 📋 |

---

### M3.1: Hull & Foundation *(specified — blocked on M2.7)*

| Feature | FR | Status |
|---------|-----|--------|
| Hull selection — choose from 18 sizes (100–5000 dtons) | FR-028a | 📋 |
| Auto-calculate Hull Points = `floor(Dtons / 50)` | FR-028a | 📋 |
| Auto-calculate Structure Points = `ceil(Dtons / 50)` | FR-028a | 📋 |
| Auto-calculate Hardpoints = `floor(Dtons / 100)` | FR-028a | 📋 |
| Configuration selection — Standard / Distributed / Close Structure | FR-028b | 📋 |
| Configuration modifies armor tonnage cost multiplier in real time | FR-028b | 📋 |
| Armor selection — type and amount from active armor table | FR-028c | 📋 |
| Armor tonnage = `hull_dtons × armor% × config_multiplier` | FR-028c | 📋 |
| Armor tonnage deducted from available tonnage in real time | FR-028c | 📋 |
| M-Drive constraint display — valid letter range for this hull | FR-028d | 📋 |
| J-Drive constraint display — valid letter range and jump range | FR-028d | 📋 |
| Power Plant constraint display — min letter = max(M-Drive, J-Drive) | FR-028d | 📋 |

---

### M3.2: Bridge to Crew *(scope defined — detail pending)*

| Feature | FR | Status |
|---------|-----|--------|
| Fuel calculation — based on drive selection and hull (Step 7) | FR-029 | 🔲 |
| Bridge / Cockpit selection (Step 8) | FR-029 | 🔲 |
| Computer selection — 7 models (Step 9) | FR-029 | 🔲 |
| Software selection — 5+ programs (Step 10) | FR-029 | 🔲 |
| Sensors selection — 5 types (Step 11) | FR-029 | 🔲 |
| Crew auto-calculation — summed from component requirements (Step 12) | FR-029 | 🔲 |
| Crew validation against available bridge stations | FR-029 | 🔲 |

---

### M3.3: Fittings to BOQ *(scope defined — detail pending)*

| Feature | FR | Status |
|---------|-----|--------|
| Accommodations — 18 types (staterooms, low berths, etc.) (Step 13) | FR-030 | 🔲 |
| Features — optional ship features (Step 14) | FR-030 | 🔲 |
| Turrets / Bays / Screens (Step 15) | FR-030 | 🔲 |
| Weapons — 8 weapon types (Step 16) | FR-030 | 🔲 |
| Vehicles — 11 vehicle types (Step 17) | FR-030 | 🔲 |
| Cargo — remaining tonnage (Step 18) | FR-030 | 🔲 |
| BOQ Cost Summary — full line-item breakdown, tonnage + cost per component (Step 19) | FR-030 | 🔲 |
| Real-time validation — tonnage used ≤ hull, PP ≥ drives, hardpoints ≤ limit | FR-002 | 🔲 |

---

### M4: Persistence & Export *(pending)*

| Feature | FR | Status |
|---------|-----|--------|
| Ship library — save / load / duplicate / delete designs | FR-004 | 🔲 |
| Ship library — search and filter | FR-004 | 🔲 |
| Auto-save on design change | FR-004 | 🔲 |
| JSON export / import | FR-005 | 🔲 |
| CSV export | FR-005 | 🔲 |
| Universal Ship Description text format | FR-005 | 🔲 |
| Mneme Space Combat stat block | FR-005 | 🔲 |
| Print-friendly view | FR-005 | 🔲 |
| Markdown / Wikitext export | FR-005 | 🔲 |
| Common ship templates (Free Trader, Scout, Patrol Cruiser…) | FR-004 | 🔲 |

---

### MSC Simulator — Space Combat Mini-Game *(Phase 2 flagship)*

An automated space combat simulator using Mneme rules. CE RAW is not built for this extent of combat — Mneme's streamlined damage, MAC, and opposed-roll mechanics make大规模 simulation feasible.

**Bots & Scenarios:**
- AI-driven bots pilot ships using Mneme action economy (3 MA, 1 SA, 1 RA per turn)
- Pre-set encounter scenarios: convoy ambush, system patrol, pirate interception, fleet battle
- Bots evaluate range bands, thrust budgets, and MAC thresholds to decide attacks/evasions
- Configurable AI aggression/tactics profiles

**TL Factions with Fractions:**
- Ships are grouped by TL faction (TL7, TL8, TL9, TL10…)
- Each faction's weapon values drift based on aggregate simulator results
- TLs have fractional granularity (e.g. TL 9.3) — performance data from thousands of simulated battles re fines weapon damage, armor penetration, and sensor DM
- Data-driven balancing: weapons that underperform in sims get buffed; overperformers get dialed back

**Solo Campaign Mode:**
- Load a crew from CE Character Generation (skills, stats, background)
- Play solo against a gauntlet of encounters
- After each battle: auto-refresh resources (fuel, ammo, life support), salvage wreckage for parts/credits, loot enemy ships
- Persistent crew progression — skills improve through use (Mneme skill system)
- Ship upgrades purchased from salvage proceeds
- Run until the crew retires, dies, or makes enough to buy their dream ship

**Simulation Engine:**
- Headless batch mode: run 10,000 fleet-vs-fleet engagements overnight to tune TL faction stats
- Per-battle log: initiative order, action choices, damage rolls, crew casualties, morales outcomes
- Aggregate statistics: win rates by TL, weapon efficiency ratings, survival curves
- Feeds back into the TL fraction system for dynamic campaign balancing

### Other Future *(Phase 2+)*

| Feature | Notes |
|---------|-------|
| Supply Calculator — life support, fuel, maintenance costs | Logistic calculator |
| Inventory System — real-time resource tracking per ship | Logistic calculator |
| Journey Table — trip log with income/expense per leg | Logistic calculator |
| Income Tracker — revenue, expenses, P&L over time | Logistic calculator |
| Habitat Design — space stations, MAGICIAN spin habitats | Extends BOQ method |
| Vehicle Construction — grav vehicles, ATVs, small craft | Extends BOQ method |
| Advanced Mneme Physics — mass-based, delta-V calculations | Variant rules |
| TL6–TL9 Ship Library — low-tech transition ships | Content |
| Random Encounter Tables — generated from ship library | GM tools |
| Mneme Fleet Combat Tools — Superiority, MAC calculators | Variant rules |
| Procedural Deck Plan Generator — 2D/3D ship layout | Long term |

---

## 🎯 Problem Statement

You are a Game Master trying to manage all the ships in your setting and accommodate your players. The amount of time these ships and the complex rules eat up during your prep is overwhelming. You want the freedom to edit and customize ships quickly without getting bogged down in calculations and cross-referencing tables.

**CE ShipGen solves this by:**
- Automating the 19-step Cepheus Engine ship design process
- Providing instant calculations for tonnage, cost, crew, and fuel
- Allowing customization of all ship component data
- Enabling library management for entire fleets
- Working on any device with a modern browser

---

## ✨ Features

### Current (M2.6 Complete ✅ — M3 Next)
- **📱 Universal Access** - Works on desktop, tablet, and mobile via modern browser
- **📊 Data Table Editor** - View and edit all 13 ship component tables (JSON + Spreadsheet views)
- **⚙️ Rule Customization** - Toggle between Cepheus Engine, Mneme Space Combat, or mix your own rules
- **🔄 Persistent Storage** - Save ships and settings to browser storage
- **📤 Export/Import** - Share ship designs as JSON or CSV
- **🔗 Shareable URLs** - Direct links to any view (/design, /library, /settings)
- **📥 Install Prompt** - "Install App" button with "Installed" badge when running standalone
- **📸 Settings Snapshots** - Save and share custom rule configurations

### In Progress (Milestone 2.6)
- **🔄 Version Control** - User-controlled updates with rollback capability

### Core Capabilities
- **19-Step Ship Design** following Cepheus Engine Chapter 8 rules
- **Real-time Validation** - Know immediately if your design violates rules
- **BOQ Summary** - Bill of Quantities showing all components, costs, and tonnage
- **Focus Mode** - Expand any step to full screen for detailed work
- **Offline Support** - PWA works without internet after first load

---

## 🎮 For Game Masters

### Manage Your Setting
- Create ship libraries for your campaign setting
- Pre-generate common ships (Free Traders, Scouts, Patrol Cruisers)
- Customize components to match your setting's tech level
- Export ship libraries to share with players

### Support Your Players
- Players can design their own ships
- GM can review and approve designs
- Consistent rules enforcement across all designs
- Quick reference during play for ship stats

### Random Encounters
- Generate ships on-the-fly during sessions
- Create standardized NPC ship templates
- Build encounter tables from ship libraries

---

## 🚀 For Developers & Customizers

### Procedural-Agentic-Development (PAD) Approach
This project follows PAD principles:
- **PRD.md** - Product Requirements Document with 20+ functional requirements
- **PROJECT_NOTES.md** - Comprehensive development notes, timelog, and problem tracking
- **Knowledge Base** - All Cepheus Engine and Mneme Space Combat rules documented
- **System Prompts** - Clear context for AI assistance

### Fork & Customize
Licensed under **GPL v3** - you can:
- Fork this repository
- Make your own custom changes
- Share your version
- Contribute back improvements

**Perfect for:**
- Creating house rule variants
- Adding custom ship components
- Integrating with your own campaign tools
- Building derivative ship generators

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product Requirements Document - 20 FRs, user stories, technical specs |
| [PROJECT_NOTES.md](./PROJECT_NOTES.md) | Development timelog, assumptions, problems encountered, current status |
| [CE-Chapter-8-Ship-Design-and-Construction.md](./CE-Chapter-8-Ship-Design-and-Construction.md) | Source rules from Cepheus Engine SRD |
| [MNEME_SPACE_COMBAT_RULES.md](./MNEME_SPACE_COMBAT_RULES.md) | Mneme Space Combat variant rules (wiki mirror) — all 8 chapters |

---

## 🛣️ Roadmap & Future Ideas

### Milestone Progress

See [📊 Milestone Status](#-milestone-status) at the top of this document for the full table.

### M2.6: Installed Version Control (Complete ✅)

**Problem solved:** Users with the PWA installed locally had no visibility into which version was running, and updates were applied automatically with no user control.

**What was built:**
- **Version Display** — Current version, channel, and build timestamp shown in Settings → Version section
- **Update Detection** — Service worker monitors for new versions in the background; never forces an update
- **Update Indicators** — Orange dot on Settings icon in header + amber pill on startup screen when update ready
- **User-Controlled Update** — "Update Now" button applies the waiting service worker; user decides when
- **Changelog Viewer** — Expandable changelog in Settings shows what changed before you update
- **Updating Instructions** — Permanent Settings section explains the update model, indicators, data safety, and offline behaviour
- **Offline Guard** — Update button replaced with "Connect to internet to update" when offline
- **Build-time manifest** — `version.json` generated on every `npm run build` via `scripts/write-version.mjs`

**Descoped (not achievable on GitHub Pages):**
- ~~Version rollback~~ — Workbox purges old caches on SW activation; old code cannot be restored without versioned URL hosting
- ~~Release channels (stable/beta)~~ — Requires a multi-channel CI/CD pipeline that does not yet exist

### M2.7: Tables In Play (Current 🎯)

**Problem solved:** The M2 table editor lets users create custom component tables, but there was no way to tell the ship design wizard *which* table to use. Every design step was implicitly hardcoded to built-in defaults.

**What M2.7 adds:**
- **Active Table Registry** — `ce_shipgen_active_tables` in localStorage maps each of the 13 component types to its currently selected table
- **"Tables In Play" view in Settings** — One row per component type, dropdown to switch between CE Default and any custom tables of that type; custom tables highlighted in cyan
- **Reset All to Defaults** — Reverts all selections without touching custom table data
- **`getActiveTable(type)` helper** — Single integration point consumed by M3; no wizard step references a table file directly
- **Snapshot integration** — Active table selections are included in FR-024 settings snapshots

This is the bridge between M2 (edit tables) and M3 (use tables). It enables mixed-rule designs: e.g. standard CE hulls + Mneme drives + custom armor — all selected in one place.

---

### M3: Ship Generation Sub-Milestones

The 19-step ship design process is delivered in three sequential slices:

#### M3.1: Hull & Foundation (⏳ Blocked on M2.7)

**Steps 1–3 + constraint display for 4–6**

- **Hull Selection** — Choose from 18 sizes (100–5000 dtons); auto-calculates HP, SP, hardpoints
- **Configuration** — Standard / Distributed / Close Structure; modifies armor tonnage cost
- **Armor** — Select type and thickness; tonnage = `hull_dtons × armor% × config_multiplier`
- **Drive Constraints** — Once hull is selected, valid letter ranges (A–Z) for M-Drive, J-Drive, and Power Plant are displayed as constraints on steps 4–6 before the user selects them

#### M3.2: Bridge to Crew (⏳ Pending)

**Steps 7–12**

Fuel calculation, Bridge/Cockpit, Computer, Software, Sensors. Crew is **auto-calculated** from component selections — not manually entered — and validated against available bridge stations.

#### M3.3: Fittings to BOQ (⏳ Pending)

**Steps 13–19**

Accommodations, Features, Turrets/Bays/Screens, Weapons, Vehicles, Cargo, and the final **BOQ (Bill of Quantities)** — a complete line-item breakdown of every component with its tonnage and cost. This is the primary output of a completed ship design.

---

### Project Scope & Ecosystem

**CE ShipGen focuses on:** Ships, Habitats, and Vehicles

**Related Projects:**
- **[Mneme World Generator PWA](https://github.com/justinaquino/mneme-world-generator-pwa)** - Handles detailed economic systems including:
  - Trade volume calculations between systems
  - Living economies with dynamic events
  - Market fluctuations and trade route analysis
  - World-building and system generation
  
**This project** (CE ShipGen) provides the vessel construction tools that feed into those economic systems. The Bill of Quantities (BOQ) method used here for ships can scale to vehicles and habitats, but detailed economic simulation remains in the world generator scope.

### Near Term (Milestones 3-4)
- **Ship Library** - Complete save/load/export system with IndexedDB
- **Common Ships** - Pre-built library of standard Cepheus Engine ships
- **Mneme Ships** - Library of ships using Mneme Space Combat rules
- **Stat Cards** - Printable ship reference cards with all combat stats

### Medium Term
- **Markdown/Wikitext Export** - Export ships for blogs, wikis, game materials
  - Format: `[[Ship Name|TL X|Y tons|MCr Z]]` style wiki links
  - Full stat blocks in markdown tables
  - Copy-paste ready for Obsidian, MediaWiki, etc.

- **Advanced Mneme Rules** - Major addition with realistic physics
  - **Mass-based calculations** instead of abstract thrust numbers
  - **Delta-V based calculations** for realistic space travel
  - Educational focus: "What we currently know is possible"
  - Auto-convert common ships to Mneme physics model

- **Habitat Design** - Including MAGICIAN (terrestrial spin habitats)
  - Space station and habitat construction rules
  - Spin gravity calculations
  - Life support and infrastructure

- **Vehicle Construction** (Future Section)
  - The BOQ (Bill of Quantities) method scales to ground vehicles and small craft
  - Grav vehicles, tracked vehicles, wheeled vehicles
  - ATVs, air/rafts, and planetary vehicles
  - Modular component system using same methodology as ships
  - *Note: This extends the ship construction system to smaller craft*

### Logistic Calculators (Major Feature)
Comprehensive supply chain and economic management for ship operations:

- **Supply Calculator** - Recommends supplies for ships and calculates costs
  - Life support requirements (man-days, consumables)
  - Fuel calculations for planned journeys
  - Spare parts and maintenance supplies
  - Cost estimation for resupply

- **Inventory System** - Tracks current balance of inventory over time
  - Real-time resource tracking (fuel, food, air, water)
  - Automated consumption based on crew size and journey duration
  - Low inventory warnings and alerts
  - Multi-ship fleet inventory management

- **Journey Table** - Trip planning from Point A to Point B
  - Row-based journey log (Origin → Destination)
  - Resource consumption calculation per journey
  - Parsecs traveled, time elapsed
  - Fuel costs, life support usage
  - Revenue/passenger income per trip

- **Income Tracker** - Financial management over periods
  - Revenue tracking (passenger fares, freight, mail, charters)
  - Expense tracking (fuel, maintenance, crew salaries, supplies)
  - Profit/loss calculations per journey and per period
  - Cash flow projections
  - Financial reports for ship operations

### Long Term Vision
- **TL6-TL9 Ship Library** - Low-tech ships transitioning between CE and Mneme tech levels
- **Random Encounter Tables** - Use ship libraries to generate encounter tables
- **Mneme Space Combat Tools** - Fleet creation for Superiority and MAC calculations
  - Opposing fleet generation
  - Superiority modifier calculations
  - Multiple Attack Consolidation (MAC) tools

- **Procedural Ship Layout Design** - Visual ship deck plans
  - 2D web-based deck plan generator (experimental)
  - May pivot to Godot 3D ship builder if web proves limiting

---

## 🏗️ Architecture

**Tech Stack:**
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS with custom space theme
- **State:** Zustand (lightweight state management)
- **Routing:** React Router (persistent URLs)
- **Storage:** Browser localStorage + IndexedDB
- **Deployment:** GitHub Pages as PWA

**Key Features:**
- Offline-first Progressive Web App
- Mobile-responsive design
- Real-time calculations
- Import/Export functionality

---

## 🎨 Attribution

**Based on:**
- **[Cepheus Engine](https://www.drivethrurpg.com/en/product/186894/cepheus-engine-system-reference-document)** - Open source tabletop RPG system
- **[Mneme Space Combat](https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain)** - Justin Aquino's variant combat rules

**Created by:**
- **[Game in the Brain](https://gi7b.org)** - Open gaming tools and educational content
- **[Wiki](https://wiki.gi7b.org)** - Collaborative knowledge base

**Support open gaming tools by patronizing our products and leaving positive reviews!**

---

## 📝 License

**GNU General Public License v3.0**

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

**Key points:**
- ✅ Free to use, modify, and distribute
- ✅ Must share modifications under same license
- ✅ Must include source code
- ✅ Must preserve copyright notices

See [LICENSE](./LICENSE) for full details.

---

## 🤝 Contributing

This is an open project following PAD (Procedural-Agentic-Development). The comprehensive documentation (PRD, PROJECT_NOTES, rules) allows anyone to:
1. Understand the project context
2. Fork and customize
3. Use AI assistants effectively with system prompts
4. Contribute improvements back

**Ways to contribute:**
- Report bugs or issues
- Suggest new features
- Submit ship designs for the library
- Improve documentation
- Create custom rule variants

---

## 🌐 Links

- **Live App:** https://game-in-the-brain.github.io/ce-shipgen/
- **Repository:** https://github.com/xunema/ce-shipgen
- **Game in the Brain:** https://gi7b.org
- **Wiki:** https://wiki.gi7b.org
- **Publisher:** https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain

---

*CE ShipGen - Empowering Game Masters with automated ship design tools*
*Built with ❤️ for the tabletop RPG community*
