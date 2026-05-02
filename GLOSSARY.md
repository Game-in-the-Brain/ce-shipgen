# CE ShipGen Glossary

**Version:** 1.0  
**Date:** 2026-05-01  
**Scope:** Naval terms, craft types, equipment definitions, and Mneme Variant annotations

---

## Overview

This glossary serves as the canonical reference for all ship classifications and terminology used in CE ShipGen. It is based on **Cepheus Engine (CE) RAW** (Rules As Written) from the Cepheus Engine SRD, supplemented with definitions from the Mneme Variant Setting.

The glossary is stored in machine-readable format at:
- **`public/data/glossary.json`** — JSON for UI integration (tooltips, search, links)
- **`GLOSSARY.md`** — This human-readable reference document

---

## Structure

Each glossary entry contains:

| Field | Description |
|-------|-------------|
| `term` | The canonical name |
| `category` | `naval` / `craft` / `civilian` / `equipment` / `mneme` |
| `classification` | Links to Iron Triangle Role + Size (if applicable) |
| `definition` | Mnemonic one-line description |
| `ceRaw` | Definition from Cepheus Engine SRD |
| `mnemeNotes` | Mneme Variant setting notes |
| `alsoKnownAs` | Alternate names and designations |
| `tlRange` | Typical Technology Level range |
| `typicalDt` | Typical displacement tonnage |

---

## Naval Vessel Classes

These are the combat and military vessels organized by the Iron Triangle classification system.

### Capital Ships (10,000+ DT)

| Term | Role | CE RAW Definition | Mneme Notes |
|------|------|-------------------|-------------|
| **Battleship** | Brawler | The largest dedicated combat vessel. Mounts the heaviest weapons and thickest armor. | Rare outside Core Worlds. Frontier navies use Heavy Frigates instead. |
| **Dreadnought** | Brawler | A super-heavy battleship with spinal weapons. The ultimate expression of naval firepower. | Only Terran Mandate and Zhodani Consulate operate true dreadnoughts. |
| **Battlecruiser** | Striker | Battleship-caliber weapons on a faster, lighter hull. Trades armor for speed. | Popular with corsair kingdoms and independent admiralties. |
| **Command Cruiser** | Vanguard | Capital-scale cruiser with fleet command facilities. Leads task forces. | Often the personal command of an admiral or sector lord. |
| **Fleet Carrier** | Support | The largest carrier, capable of deploying hundreds of craft. Centerpiece of a task force. | Never operates alone — always surrounded by a destroyer/corvette screen. |
| **Dispatch Carrier** | Sprinter | Speculative capital vessel for rapid craft deployment. | No known examples in the Mneme Frontier as of 1105. |
| **Superfreighter** | Hauler | Capital-scale merchant vessel moving city-sized cargo. | Rare in the Frontier; operates on Core World routes with naval escort. |

### Line Ships (1,000 – 9,999 DT)

| Term | Role | CE RAW Definition | Mneme Notes |
|------|------|-------------------|-------------|
| **Cruiser** | Vanguard | The backbone of a fleet — balanced speed, armor, and payload for independent operations. | Most common Line Ship. Patrol and Mercenary Cruisers are especially prevalent. |
| **Destroyer** | Striker | Fast, heavily armed with minimal payload. Screens fleets and intercepts enemy ships. | Classic Striker — all engines and guns. |
| **Heavy Frigate** | Brawler | Armor and firepower optimized over speed. A mobile fortress. | The "poor man's battleship" — independent system defender. |
| **Light Carrier** | Support | Transports and deploys fighter squadrons. Relies on air wing for combat. | Smallest carrier capable of independent jump. Assault Carriers fall here. |
| **Fast Fleet Scout** | Sprinter | Reconnaissance vessel maximizing sensors and jump range. Sacrifices armor for stealth. | IISS Scout/Couriers in this role. Military variants add ECM. |
| **Bulk Transport** | Hauler | Large merchant — liners, heavy freighters, colony ships. | The 1,000 DT Passenger Liner is the classic example. |

### Escort Vessels (100 – 999 DT)

| Term | Role | CE RAW Definition | Mneme Notes |
|------|------|-------------------|-------------|
| **Patrol Corvette** | Vanguard | The smallest independently-operating starship. Patrol, customs, light combat. | Most common ship in the Mneme Variant. Produced in vast numbers. |
| **System Defense Boat** | Brawler | Non-starship built for single-system defense. Cheaper than starships, disproportionate firepower. | Backbone of planetary defense forces. |
| **Torpedo Boat** | Striker | Fast attack craft delivering heavy ordnance. Relies on speed and surprise. | Popular with corsairs and asymmetric warfare forces. |
| **Courier** | Sprinter | Rapid message and light cargo delivery. Maximizes jump range and maneuver. | Express network and X-Boat relays use this class. |
| **Freighter** | Hauler | Interstellar cargo vessel. Minimal armament, maximum hold space. | Lifeblood of trade. Free Traders, Far Traders, Subsidized Merchants. |
| **Repair Tender** | Support | Mobile workshop repairing starships in the field. | Often converted from old freighters. Essential for extended operations. |
| **Frigate** | Brawler | Escort-sized combatant, 200-800 DT, armed for patrol and escort. | Mneme distinguishes Escort Frigates from Heavy Frigates. |
| **Yacht** | Hauler | Privately-owned luxury vessel. High payload for passenger comfort. | Nobles and corporate executives favor these. |
| **Research Vessel** | Hauler | Scientific ship with labs and sensors. | Laboratory Ships and Survey Vessels. Prime corsair targets. |
| **Tanker** | Hauler | Specialized fuel and liquid transport. Hull is mostly tankage. | Military tankers are escorted; civilian tankers run fixed routes. |

---

## Small Craft (1 – 99 DT)

Small craft cannot make jump transitions under their own power. They are carried by larger vessels or operate within a single system.

| Term | Role | CE RAW Definition | Typical Use |
|------|------|-------------------|-------------|
| **Interceptor** | Striker | High-performance attack craft. Fast, armed, fragile. | Space superiority fighter. |
| **Gunboat** | Brawler | Heavily armed craft trading agility for armor. | Planetary defense, anti-ship. |
| **Cutter** | Vanguard | Balanced general-purpose craft. Atmospheric-capable. | Utility, patrol, short-range work. |
| **Pinnace** | Sprinter | Fast, elegant personnel transport. | VIP transport, smuggling, racing. |
| **Lighter** | Hauler | Small cargo ferry between orbit and surface. | Orbital logistics. Ubiquitous and cheap. |
| **Assault Shuttle** | Support | Armored landing craft for troops and boarding parties. | Marine boarding actions. |
| **Ship's Boat** | — | Generic utility craft carried aboard starships. | Rescue, transport, utility. |

---

## Equipment & Systems

| Term | Category | Definition |
|------|----------|------------|
| **M-Drive** | Propulsion | Reactionless maneuver drive providing thrust in Gs. Requires no fuel. Classified by letter code (A-N). |
| **J-Drive** | Propulsion | Jump drive creating a jump space bubble for FTL travel. Rated by parsecs. Requires hydrogen fuel (10% of hull per parsec). |
| **Power Plant** | Power | Fusion reactor powering all ship systems. Sized to support M-Drive, J-Drive, weapons, and life support simultaneously. |
| **Sand Caster** | Defense | Launches clouds of ablative sand to intercept missiles and energy weapons. Cheapest effective point defense. |
| **Spinal Weapon** | Weapon | Massive weapon running the ship's spine (meson gun, particle accelerator, railgun). Only mountable on Line Ships and Capitals. |

---

## Mneme Variant Terms

| Term | Definition |
|------|------------|
| **Mneme Variant** | A homebrew rules extension and setting for Cepheus Engine. Emphasizes asymmetrical warfare, resource scarcity, and post-collapse frontier politics. |
| **Equipment Quality Scale (EQS)** | A system grading components from Budget to Prototype. Higher quality provides performance bonuses at increased maintenance cost. |
| **Iron Triangle** | The foundational principle of Mneme naval architecture: every design trades off Speed (S), Armament (A), and Payload (P). No ship maximizes all three. |

---

## Relationship to Classification System

Every naval and craft term with a `classification` block maps directly to the **Iron Triangle** auto-naming system:

```
Role (S/A/P ratio) + Size (DT) = Class Name
```

Example mapping:
- **Vanguard** + **Escort** = Patrol Corvette
- **Brawler** + **Capital** = Battleship
- **Hauler** + **Craft** = Lighter

The `glossary.json` file can be cross-referenced by the UI to provide contextual tooltips. When a user hovers over "Patrol Corvette" in the Ship Library, the app can display:

> **Patrol Corvette** — *Vanguard / Escort*
> The smallest independently-operating starship. Capable of jump travel, patrol, and light combat. The most common ship in the Mneme Frontier.

---

## Future Expansion

The glossary will be extended to include:

1. **Higher-TL Equipment Variants** — TL 12 Gravitic Drives, TL 15 Antimatter Plants, etc.
2. **Detailed Component Listings** — Every module, weapon, and sensor with TL progression
3. **Faction-Specific Designations** — Terran Mandate, Zhodani, Vargr, Aslan naming conventions
4. **Historical Classifications** — Obsolete terms (e.g., "Battlecruiser" at TL 9 vs TL 15)

---

*For the machine-readable version, see `public/data/glossary.json`*  
*For the classification rules, see `public/data/ship-classifications.json`*  
*For the design framework, see `FDR-066-Ship-Auto-Naming.md`*
