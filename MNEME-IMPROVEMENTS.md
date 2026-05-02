# Mneme Improvements Backlog

**Purpose:** Realistic enhancements to Cepheus Engine RAW for the Mneme variant. This document serves as the feature backlog for the Mneme project — items are pulled from here into milestones as development capacity allows.

**Status Key:**
- `🔵 Research` — Concept identified, needs design
- `🟡 Design` — Requirements clear, needs implementation plan
- `🟢 Ready` — Ready for implementation
- `✅ Done` — Implemented and tested

---

## 1. Drive & Engine Realism

### 1.1 Correct Drive Performance Table
- **Status:** ✅ Done (extracted from Excel BG8:CQ53)
- **Issue:** The markdown transcription truncated the CE SRD drive table. Drive B was listed as max 200 DT but is actually 400 DT. The old `rating * 100 / hull` formula produced ~50% incorrect thrust values.
- **Impact:** 19 of 40 ships displayed wrong thrust. Tender capacities were 2x too low.
- **Files fixed:** `public/data/engine_performance_complete.json`
- **Files still needing fix:** `src/utils/engineeringCalculators.ts`, `src/utils/exportDocx.ts`

### 1.2 Push / Tug Capacity Display
- **Status:** ✅ Done (added to `all_ships.json`)
- **Description:** Every ship with an M-Drive now carries a `pushCapacity` array showing max hull rating, available push DT, and thrust at max load.
- **Next:** Surface this in the Ship Designer UI and Bill of Quantities.

### 1.3 Station-Keeping Thrust (Optional Rule)
- **Status:** 🔵 Research
- **Description:** Ships don't need full maneuver thrust to hold station. A ship with 4G main thrust might only need 0.01G for orbital station-keeping. This affects fuel consumption calculations for stationary vessels (habitats, orbital ports, etc.).
- **References:** Mneme optional rule (source TBD — see user)
- **Impact:** Would allow habitats and stations to have much smaller M-Drives while still maintaining position.

### 1.4 Engine Warm-up & Spool Time
- **Status:** 🔵 Research
- **Description:** M-Drives require time to reach full thrust from cold start. Emergency startups risk damage or reduced performance.
- **Gameplay impact:** Adds tactical depth — ships can't instantly go from 0 to max G.

### 1.5 Fuel Consumption at Partial Thrust
- **Status:** 🔵 Research
- **Description:** Currently fuel is calculated at full power plant load. Ships operating at fractional thrust should consume proportionally less fuel.
- **Formula:** Fuel per week = (Power Plant tons / 3) × (actual thrust / max thrust)

---

## 2. Spin Habitats & Artificial Gravity

### 2.1 SpinCalc Integration
- **Status:** 🟡 Design
- **Description:** Integrate Theodore W. Hall's SpinCalc formulas for rotating habitat design.
- **Formula:** `g = (RPM × 2π/60)² × r / 9.81`
- **Comfort zones (from SpinCalc research):**
  - ≤1.0 rpm: Symptom-free (Graybiel)
  - ≤2.0 rpm: Widely accepted safe limit
  - 2–3 rpm: Adaptable with mild symptoms
  - 3–4 rpm: Challenging, requires training
  - >4 rpm: Difficult, significant adaptation required
- **Use cases:**
  - Habitat Rings: Calculate required radius for desired G at comfortable RPM
  - Long-duration ships: Determine if spin section is viable

### 2.2 Surface-Spin Habitat (MAGICIAN)
- **Status:** 🔵 Research
- **Description:** A surface installation that uses rotation to supplement or replace natural gravity. Useful for low-G worlds (Mars, moons) or asteroid bases.
- **Mneme name:** MAGICIAN (rotating drum or torus on planetary surface)
- **Design questions:**
  - How does it handle precession and gyroscopic effects on a rotating planet?
  - Bearing and drive requirements?
  - Emergency stop procedures?

### 2.3 Gravity Gradient Effects
- **Status:** 🔵 Research
- **Description:** In small-radius habitats, head-to-foot gravity difference becomes significant. A 25m radius ring at 1G has ~10% gradient — enough to cause disorientation.
- **Gameplay impact:** Habitats below certain radius thresholds impose Crew Efficiency penalties.

### 2.4 Coriolis Effect in Combat
- **Status:** 🔵 Research
- **Description:** Gunnery and movement inside rotating habitats suffer penalties due to Coriolis forces.
- **Penalty scale:** Based on habitat RPM and weapon range.

---

## 3. Weapon & Combat Realism

### 3.1 Armor-Piercing for Low-Damage Weapons
- **Status:** 🟡 Design
- **Issue:** Beam Laser (1D6 avg 3.5), Missile Rack (1D6), Autocannon (1D6), and Utility Laser (1D6) all have **zero effective damage vs Armor-4** because average damage ≤ armor.
- **Options:**
  - **A) Armor Piercing rule:** Weapons with AP trait ignore X points of armor
  - **B) Minimum damage rule:** All weapons deal minimum 1 damage on hit
  - **C) Damage buff:** Increase low-end weapons to 2D6 or add +2 bonus
- **Reference:** Weapon calibration report at `reports/weapon-calibration-report.md`

### 3.2 Weapon Range Calibration
- **Status:** 🟡 Design
- **Description:** Run battle simulations to verify weapon ranges make tactical sense. Current ranges: Adjacent/Close/Short/Medium/Long/Very Long/Distant.
- **Questions:**
  - Should Pulse Lasers really be limited to Close range?
  - Are missile engagement dynamics correct (thrust 10, 60 min endurance)?
  - Do bay weapons feel appropriately powerful vs turrets?

### 3.3 Missile Endgame & Proximity Fuze
- **Status:** 🔵 Research
- **Description:** Missiles currently have 60-minute endurance (~4 combat turns at thrust-10). What happens when they run out of fuel? Do they self-destruct, go ballistic, or activate proximity fuzes?

### 3.4 Sand Caster Reload Mechanics
- **Status:** 🔵 Research
- **Description:** Sand casters require ammunition (20 barrels = 1 ton). Track reload state during extended engagements.

---

## 4. Ship Design & Construction

### 4.1 Distributed Hull Architecture
- **Status:** 🟡 Design
- **Description:** The 1000DT Passenger Liner has 298 DT of external modules (fuel tank + shuttle) that exceed hull capacity. In CE RAW, external modules count against hull budget, but this ship is clearly designed as a distributed/multi-module vessel.
- **Options:**
  - Allow "Distributed" configuration to link multiple hulls
  - Add "External Module" component type that doesn't count against internal volume
  - Flag as "non-compliant but legal" legacy design

### 4.2 Vehicle Bay & Hangar Mechanics
- **Status:** 🟡 Design
- **Description:** Currently vehicle entries are filtered out of the ship library. Need proper hangar/bay mechanics:
  - Hangar tonnage = vehicle tonnage × 1.3 (per CE RAW)
  - Launch tubes = 25 × vehicle tonnage
  - Fuel and maintenance for carried craft

### 4.3 Fuel Scoop Efficiency by Configuration
- **Status:** 🔵 Research
- **Description:** Streamlined ships scoop efficiently. Standard ships can scoop at DM-2. Distributed ships cannot scoop. Currently not modeled in fuel operations.

### 4.4 Repair Drones & Battlefield Repair
- **Status:** 🔵 Research
- **Description:** Repair drones (1% of hull tonnage) allow AutoRepair software to function. Need repair time and spare parts consumption rules.

---

## 5. Life Support & Crew

### 5.1 Spin Adaptation Medical Rules
- **Status:** 🔵 Research
- **Description:** Crew transferring between zero-G and spin environments need adaptation time. Rapid transitions cause Space Adaptation Syndrome equivalents.

### 5.2 Low-Berth Survival Rates
- **Status:** 🔵 Research
- **Description:** CE RAW mentions low berths have risk. Add survival probability based on TL, medic skill, and berth quality.

### 5.3 Crew Efficiency by Gravity
- **Status:** 🔵 Research
- **Description:** Crew operate at reduced efficiency in non-standard gravity. Table needed for partial G environments.

---

## 6. Economy & Operations

### 6.1 Operating Cost by Gravity
- **Status:** 🔵 Research
- **Description:** Spin habitats consume extra power for rotation. Add rotational power cost to operating economics.

### 6.2 Tender Operations Fee Structure
- **Status:** 🔵 Research
- **Description:** Tenders charge by DT pushed and distance. Need rate tables for commercial tender services.

---

## 7. Data & Tooling

### 7.1 Excel Drive Table as Source of Truth
- **Status:** ✅ Done
- **File:** `public/data/engine_performance_complete.json`
- **Next:** Update all code to read from this JSON instead of hardcoded formulas.

### 7.2 Weapon Calibration Framework
- **Status:** ✅ Done
- **File:** `scripts/weapon-calibration.py`
- **Generates:** `reports/weapon-calibration-report.md`
- **Next:** Run after every weapon balance change.

### 7.3 Ship QA Audit Pipeline
- **Status:** 🟡 Design
- **File:** `FDR-067-QA-Ships-Process.md`
- **Next:** Wire `npm run qa-ships` into CI gate.

---

## Candidate Milestone Assignments

### M2.9 — Engine Correctness (P0)
- Fix `engineeringCalculators.ts` with correct drive table
- Fix `exportDocx.ts` thrust calculation
- Rebuild affected ship displays

### M3.6 — Spin Habitats (P1)
- SpinCalc integration
- Habitat Ring designer
- Surface-Spin Habitat (MAGICIAN) rules

### M3.7 — Weapon Rebalance (P1)
- Implement armor-piercing or minimum damage
- Re-run calibration
- Update ship loadouts if needed

### M3.8 — Tender & Bay Mechanics (P2)
- Vehicle bay modeling
- Tender fee structure
- Reload vehicle entries into parent ships

---

*Last updated: 2026-05-02*
*Maintainer: CE ShipGen / Mneme project*

---

## Appendix A: Fuselage & Pressure Vessel Engineering Philosophy

### Design Principle
Mneme improvements prioritize **realistic structural engineering** over CE RAW hand-waving. Ships and habitats are designed as pressure vessels first, with all other systems fitted inside the structural constraints.

### Core Formula: Cylindrical Pressure Vessel

For a cylindrical fuselage holding 1 atm (101.3 kPa) internal pressure:

```
Hoop Stress:  σ = P × r / t
Wall Thickness: t = P × r × SF / σ_yield
Shell Mass:     m = ρ × (2πrL) × t
```

Where:
- `P` = pressure differential (Pa) — 101,325 Pa for 1 atm
- `r` = internal radius (m)
- `t` = wall thickness (m)
- `SF` = safety factor (typically 2.0–4.0)
- `σ_yield` = material yield strength (Pa)
- `ρ` = material density (kg/m³)
- `L` = cylinder length (m)

### Material Properties by TL

| TL | Material | σ_yield (MPa) | ρ (kg/m³) | Notes |
|----|----------|--------------|-----------|-------|
| 6 | Mild Steel | 250 | 7,850 | Heavy, cheap, corrodes |
| 7 | Aluminum 7075 | 503 | 2,810 | Aircraft standard |
| 7 | Titanium Ti-6Al-4V | 880 | 4,430 | Aerospace grade |
| 8 | Titanium Steel (CE) | 1,200 | 4,500 | CE "Titanium Steel" armor |
| 8 | Carbon Fiber Composite | 1,500 | 1,600 | High strength-to-weight |
| 9 | Advanced Alloy (CE) | 2,000 | 4,000 | CE baseline starship |
| 10 | Crystaliron | 4,000 | 5,000 | CE armor material |
| 11 | Reinforced Composite | 5,000 | 1,800 | Nanofiber reinforced |
| 14 | Bonded Superdense | 10,000 | 8,000 | CE armor material |

### Practical Example: 200 DT Ship Fuselage

A 200 DT ship in CE has ~2,700 m³ internal volume (200 × 13.5 m³).

If designed as a cylinder with L = 4r (aspect ratio 4:1):
- Volume = πr²L = 4πr³ = 2,700 m³
- Radius r ≈ 6.8 m, Length L ≈ 27.2 m

At TL 8 (Titanium Steel, SF = 3):
- t = 101,325 × 6.8 × 3 / 1,200,000,000 = **0.0017 m** (1.7 mm)
- Shell mass = 4,500 × (2π × 6.8 × 27.2) × 0.0017 ≈ **8,850 kg**
- This is the **minimum** pressure shell mass — framing, stringers, and internal structure add 30–50% more

### Spin Habitat Structural Load

A rotating habitat experiences outward acceleration. The "floor" must support the weight of inhabitants, equipment, and the habitat structure itself.

For a ring habitat:
```
Hoop tension from rotation: T = m × g / (2π)
Hoop stress: σ = T / A = (ρ × r × g) / SF_equivalent
```

Where:
- `m` = mass per unit length of ring (kg/m)
- `g` = artificial gravity (m/s²)
- `r` = ring radius (m)
- `A` = cross-sectional area of structural material (m²)

The ring is in **tension** (like a rotating space elevator or tether), not compression. This is a favorable load case for cables and hoop structures.

### Key Insight: Pressure vs Spin Load

| Load Type | Direction | Dominant Stress | Efficient Shape |
|-----------|-----------|-----------------|-----------------|
| Internal pressure | Outward | Hoop tension | Sphere > Cylinder |
| Spin gravity | Radially outward | Hoop tension | Torus / Ring |
| Combined (pressurized spin hab) | Both | Biaxial tension | Thick-walled torus |

A pressurized rotating habitat must withstand **both** internal pressure (pushing outward on walls) and centripetal acceleration (pushing outward on floor). The combined stress is the vector sum.

### TL 8 and Below: Fuselage Era

At TL 8 and below, ships are built like aircraft fuselages:
- **Semi-monocoque**: Skin carries some load, internal frames carry the rest
- **Double-walled pressure vessel**: Inner hull holds pressure, outer hull takes impacts/thermal
- **Limited to cylindrical or spherical shapes** — complex geometry is too heavy
- **Frame spacing**: 0.5–1.0 m for aluminum, 1.0–2.0 m for titanium/composites

At TL 9+, advanced materials and construction allow:
- More complex hull shapes (the "Standard" and "Streamlined" CE configurations)
- Lighter pressure vessels with same strength
- Distributed hulls (multiple connected modules)

### Implementation for ShipGen

When building ships under Mneme rules:

1. **Start with pressure vessel**: Calculate minimum structural mass for 1 atm
2. **Add framing**: 30–50% of shell mass for stringers, bulkheads, frames
3. **Add armor** (if any): Mass = volume × density (armor is extra mass on outside)
4. **Add systems**: Drives, fuel, power, life support — all inside the pressure hull
5. **Remaining volume = cargo** (or dedicated payload bays)

This reverses the CE RAW approach where hull size is chosen arbitrarily and everything is fitted inside. Under Mneme, **structural realities drive the design**.

### Open Questions

- What is the practical maximum radius for a spin habitat at each TL? (Material limits under hoop stress)
- How do we model "Distributed" hulls structurally? (Multiple pressure vessels connected by trusses)
- What is the mass penalty for Streamlined vs Standard configurations at each TL?
- Should we include meteoroid/debris armor as a separate calculation from combat armor?

