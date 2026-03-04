# CE ShipGen

**A Progressive Web App for designing Cepheus Engine starships with Mneme Space Combat integration.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Status](https://img.shields.io/badge/Status-M2%20Complete-brightgreen)](https://github.com/xunema/ce-shipgen)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://xunema.github.io/ce-shipgen/)

**Live Demo:** https://xunema.github.io/ce-shipgen/
**Source Material:** Cepheus Engine SRD Chapter 8 + Mneme Space Combat rules

---

## 📋 Documentation State

| Document | Purpose | Status |
|----------|---------|--------|
| [PRD.md](./PRD.md) | Product Requirements — FRs, GI7B UI Standard, milestones, data schemas | ✅ Current |
| [PROJECT_NOTES.md](./PROJECT_NOTES.md) | Dev log, **GI7B UI Standard definition**, decisions, problems & solutions | ✅ Current |
| [CE-Chapter-8-Ship-Design-and-Construction.md](./CE-Chapter-8-Ship-Design-and-Construction.md) | Knowledge base — Cepheus Engine SRD Chapter 8 | ✅ Reference |

> **CE ShipGen is the canonical reference implementation of the GI7B Generator UI Standard.** All GI7B generators follow the navigation tree, tile system, and settings structure defined in [PROJECT_NOTES.md](./PROJECT_NOTES.md#gi7b-generator-ui-standard).

---

## 🛣️ Milestones

| Milestone | Scope | Status |
|-----------|-------|--------|
| **M1: UI Layout & Tiling** | Layout, tiles, focus mode, PWA setup | ✅ Complete |
| **M2: Settings & Data Tables** | JSON + table editors, all 13 tables, rule toggles | ✅ Complete |
| **M2.5: Install UX** | PWA install prompt, auto-save, settings snapshots, CI/CD | ⚠️ Needs Verification |
| **M2.6: Local Signal & Snapshots** | Standalone indicator + snapshots confirmed working in deployed app | 🎯 Next |
| **M3: Ship Generation** | 19-step design wizard, BOQ, real-time calculations | ⏳ Blocked on M2.6 |
| **M4: Persistence & Export** | Ship library, JSON/CSV/Markdown/print export | ⏳ Pending |

---

## 🎯 GI7B Generator Suite

CE ShipGen is the **canonical UI reference** for all GI7B generators:

| Generator | Repo | Status |
|-----------|------|--------|
| **CE ShipGen** _(canonical UI reference)_ | [xunema/ce-shipgen](https://github.com/xunema/ce-shipgen) | ✅ M2 Complete |
| **CE CharacterGen** | [xunema/cecharactergen](https://github.com/xunema/cecharactergen) | 🔄 M2 In Progress |
| **Mneme World Gen** | [xunema/mneme-world-generator-pwa](https://github.com/xunema/mneme-world-generator-pwa) | 🔄 M3 In Progress |

---

## 🚀 Tech Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** (custom space theme)
- **Zustand** (state management)
- **React Router** (persistent URLs)
- **localStorage + IndexedDB** (offline-first)

---

## 🛠️ Development

### Setup
```bash
npm install
npm run dev      # http://localhost:5173
```

### Build
```bash
npm run build
npm run preview
```

---

## 🧭 Project Structure

```
ce-shipgen/
├── README.md                                      ← START HERE
├── PRD.md                                         ← Product requirements & GI7B UI Standard
├── PROJECT_NOTES.md                               ← Dev log & GI7B UI Standard definition
├── CE-Chapter-8-Ship-Design-and-Construction.md   ← Knowledge base (rules reference)
└── src/
    ├── components/
    ├── pages/
    └── data/                                      ← JSON data tables (13 ship component tables)
```

---

## 🧭 GI7B UI Standard (Navigation Tree)

```
Landing Page (/)
│
├── 🌙/☀️ Theme Toggle      [header — always visible]
├── 🖥️/📱 Layout Toggle     [header — always visible]
│
├── ✨ Generate Now (/generate)
│   └── 19-step ship design — tile-based
│
├── 📚 Library (/library)
│   └── Saved ships — search, filter, export
│
└── ⚙️ Settings (/settings)
    ├── 📄 JSON Tables        (/settings/tables)
    ├── 🧩 Mechanics Modules  (/settings/mechanics)
    ├── 🎲 Generation Options (/settings/options)
    └── 🔧 Other Settings     (/settings/other)
```

### Tile System
| State | Description |
|-------|-------------|
| **Collapsed** | Summary only — shows key value |
| **Expanded** | Full content — inputs, selections, details |
| **Focused** | Full-screen overlay — ESC to exit |

---

## 🎮 For Game Masters

- Create ship libraries for your campaign setting
- Pre-generate common ships (Free Traders, Scouts, Patrol Cruisers)
- Customize components to match your setting's tech level
- Generate ships on-the-fly during sessions
- Export ship libraries to share with players

---

## 🗺️ Roadmap

### Near Term (M3–M4)
- **Ship Library** — Complete save/load/export with IndexedDB
- **Common Ships** — Pre-built library of standard CE and Mneme ships
- **Stat Cards** — Printable ship reference cards with combat stats

### Medium Term
- **Markdown/Wikitext Export** — For blogs, wikis, Obsidian, MediaWiki
- **Advanced Mneme Rules** — Mass-based and delta-V calculations
- **Habitat Design** — Space stations, MAGICIAN spin habitats
- **Vehicle Construction** — Grav vehicles, ATVs, small craft

### Logistic Calculators (Phase 2)
- **Supply Calculator** — Life support, fuel, spare parts costs
- **Inventory System** — Real-time resource tracking per voyage
- **Journey Table** — Trip planning (origin → destination, fuel, income)
- **Income Tracker** — Revenue, expenses, profit/loss per period

### Long Term
- **TL6–TL9 Ship Library** — Low-tech transitional ships
- **Mneme Space Combat Tools** — Fleet creation, Superiority, MAC calculations
- **Procedural Deck Plans** — 2D web-based ship layout generator

---

## 📚 Troubleshooting

| Issue | Fix |
|-------|-----|
| Site not showing latest | Hard refresh `Ctrl+F5` / `Cmd+Shift+R` or try incognito |
| 404 on assets | Check `vite.config.ts` has `base: '/ce-shipgen/'` |
| Deployment issues | See [PROJECT_NOTES.md](./PROJECT_NOTES.md) — Problems & Solutions |

---

## 👤 Credits

**Based on:** [Cepheus Engine SRD](https://www.drivethrurpg.com/en/product/186894/cepheus-engine-system-reference-document) + [Mneme Space Combat](https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain)
**Created by:** [Game in the Brain](https://gi7b.org) — [Wiki](https://wiki.gi7b.org) — [DriveThruRPG](https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain)

---

## 📝 License

GPL v3 — See [LICENSE](./LICENSE)
