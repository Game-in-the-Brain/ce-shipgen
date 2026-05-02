# App Structure & Content Architecture

**Version:** 1.0  
**Date:** 2026-05-01  
**Scope:** How reference content is organized for the CE ShipGen installable app.

---

## Design Principle: App-First Reference

All reference content is written to be consumed inside the app first, exported to web second. Each major topic gets its own **dedicated page** with deep linking, search indexing, and cross-references.

---

## Page Hierarchy

```
CE ShipGen App
│
├── 📋 Ship Library (/
│   ├── Ship Cards (grid/list)
│   ├── Ship Detail View
│   ├── Search & Filters
│   └── Class Badges (Iron Triangle)
│
├── 🔧 Ship Designer (/designer)
│   ├── Wizard Steps
│   ├── Component Tables
│   ├── Save / Export
│   └── Classification Preview
│
├── 📚 Reference (/reference)
│   ├── /reference/glossary
│   ├── /reference/engineering
│   ├── /reference/factions
│   ├── /reference/taxonomy
│   └── /reference/classifications
│
├── ⚙️ Settings (/settings)
│   ├── Theme
│   ├── Classification Rules Editor
│   ├── Version Info
│   └── Data Management
│
└── 📊 Tools (/tools)
    ├── Crew Calculator
    ├── Tender Capacity Calculator
    ├── Armor Limit Checker
    └── Module Builder
```

---

## Reference Pages (Deep Dive)

### `/reference/glossary` — Ship Glossary

**Source:** `public/data/glossary.json` + `GLOSSARY.md`

**Features:**
- Searchable term index
- Category filters (Naval / Craft / Civilian / Equipment / Mneme)
- Cross-links to classification table
- Tooltip-ready definitions for Ship Library hover

**Sections:**
1. Naval Vessels (Capital → Line → Escort)
2. Small Craft
3. Civilian Vessels
4. Equipment & Systems
5. Mneme Variant Terms

---

### `/reference/engineering` — Engineering Manual

**Source:** `ENGINEERING.md`

**Features:**
- Formula calculators (thrust, tender capacity, armor limits)
- Interactive tables (drive capacity by rating)
- Visual diagrams (module shapes, connector layouts)

**Sections:**
1. Drive Efficiency & Performance
2. Tender Mechanics
3. Armor Systems
4. Modular Hull Design
5. Concealed Weapons & Farings
6. Non-Jump Vessel Construction

**Interactive Tools:**
- **Thrust Calculator:** Input hull DT + drive code → output G + weight class
- **Tender Calculator:** Input tender hull + drive code → output capacity table
- **Armor Checker:** Input hull DT + role + armor DT → output legal status + penalties

---

### `/reference/factions` — Factions & Law

**Source:** `FACTIONS-AND-LAW.md`

**Features:**
- Faction selector with visual identity
- Jurisdiction checker ("I'm in X space with Y weapons — am I legal?")
- Q-Ship legality flowchart

**Sections:**
1. The Houses
2. The Hegemony
3. The Guilds
4. The Federation / Alliance
5. The Mneme Frontier
6. Quick Reference Tables

---

### `/reference/taxonomy` — Ship Type Taxonomy

**Source:** `RECOMMENDATION-Ship-Types-Taxonomy.md`

**Features:**
- Filterable master list of all 131 ship types
- Status badges (✅ In app / ⬜ Missing / ⚠️ Edge case)
- Role × Size matrix visualization
- Gap analysis view

**Sections:**
1. Naval Combat Vessels
2. Small Craft
3. Civilian Vessels
4. Classification Matrix Gaps
5. Technical Definitions Needed
6. Crew Definitions

---

### `/reference/classifications` — Classification Rules

**Source:** `public/data/ship-classifications.json`

**Features:**
- Editable JSON editor (with validation)
- Threshold sliders (S/A/P percentages)
- TL shift configuration
- Class name editor
- Live preview: adjust rules → see ship reclassifications

**Sections:**
1. Thresholds
2. Size Categories
3. TL Shifts
4. Roles
5. Class Table

---

## Data Flow

```
public/data/
├── ship-classifications.json  → /reference/classifications (editable)
├── glossary.json              → /reference/glossary
├── all_ships.json             → Ship Library (/
├── ship_drives.json           → Engineering calculators
├── engine_performance.json    → Thrust calculator
└── [other data tables]        → Ship Designer

src/utils/shipClassifier.ts    → Classification engine (used everywhere)
```

---

## App vs Web Differences

| Feature | Web (Forgejo Pages) | App (Installable) |
|---------|--------------------:|------------------:|
| Data persistence | None (read-only library) | LocalStorage / SQLite |
| Classification editing | Read-only JSON | In-app editor with save |
| Ship saving | Export JSON only | Local ship roster |
| Reference content | Static markdown | Searchable, cross-linked |
| Calculators | Static tables | Interactive inputs |
| Offline use | No (requires fetch) | **Yes** — full offline |
| Updates | Re-deploy to static-pages | Auto-update via updater |

---

## File Organization for App Build

When building the installable app (Tauri / Capacitor), reference content is bundled as static assets:

```
src-tauri/
├── src/
│   └── main.rs              # Rust backend
└── Cargo.toml

public/
├── data/
│   ├── glossary.json        # Machine-readable glossary
│   ├── ship-classifications.json
│   └── ...
└── docs/                    # Bundled reference pages (HTML or Markdown)
    ├── glossary.html
    ├── engineering.html
    ├── factions.html
    └── taxonomy.html
```

**Build process:**
1. Markdown docs → HTML (via Vite build or static generator)
2. HTML + JSON bundled into app package
3. App loads content from `asset://` protocol (no network needed)

---

## Search Architecture

All reference content is indexed for unified search:

```typescript
interface SearchIndex {
  term: string;
  category: 'glossary' | 'engineering' | 'factions' | 'taxonomy' | 'ships';
  path: string;        // e.g., "/reference/glossary#battleship"
  excerpt: string;     // 100-character preview
  tags: string[];      // ["naval", "capital", "brawler"]
}
```

**Search bar** in app header searches across:
- Ship names
- Glossary terms
- Engineering formulas
- Faction names
- Taxonomy types

---

## Recommended Next Steps

1. **Convert reference MD → React pages** using existing markdown renderer
2. **Add search indexing** at build time
3. **Build interactive calculators** (thrust, tender, armor)
4. **Bundle JSON + HTML** into Tauri/Capacitor app
5. **Add classification editor UI** for `/reference/classifications`

---

*For the web deployment (Forgejo Pages), reference pages are served as static HTML with inlined CSS/JS.*
