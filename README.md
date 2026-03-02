# CE ShipGen

**CEpheus Engine Ship Generator** - A Progressive Web App for designing starships

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://xunema.github.io/ce-shipgen/)

**Live Demo:** https://xunema.github.io/ce-shipgen/

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

### Current (Milestone 2)
- **📱 Universal Access** - Works on desktop, tablet, and mobile via modern browser
- **📊 Data Table Editor** - View and edit all 13 ship component tables (JSON + Spreadsheet views)
- **⚙️ Rule Customization** - Toggle between Cepheus Engine, Mneme Space Combat, or mix your own rules
- **🔄 Persistent Storage** - Save ships and settings to browser storage
- **📤 Export/Import** - Share ship designs as JSON or CSV
- **🔗 Shareable URLs** - Direct links to any view (/design, /library, /settings)

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

---

## 🛣️ Roadmap & Future Ideas

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

- **Live App:** https://xunema.github.io/ce-shipgen/
- **Repository:** https://github.com/xunema/ce-shipgen
- **Game in the Brain:** https://gi7b.org
- **Wiki:** https://wiki.gi7b.org
- **Publisher:** https://www.drivethrurpg.com/en/publisher/17858/game-in-the-brain

---

*CE ShipGen - Empowering Game Masters with automated ship design tools*
*Built with ❤️ for the tabletop RPG community*
