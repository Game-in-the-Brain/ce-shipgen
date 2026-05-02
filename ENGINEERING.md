# Engineering Reference — CE ShipGen

**Version:** 1.0  
**Date:** 2026-05-01  
**Scope:** Drive mechanics, hull construction, armor systems, tender operations, modular design, and efficiency calculations.

---

## Table of Contents

1. [Drive Efficiency & Performance](#1-drive-efficiency--performance)
2. [Tender Mechanics](#2-tender-mechanics)
3. [Armor Systems](#3-armor-systems)
4. [Modular Hull Design](#4-modular-hull-design)
5. [Concealed Weapons & Farings](#5-concealed-weapons--farings)
6. [Non-Jump Vessel Construction](#6-non-jump-vessel-construction)

---

## 1. Drive Efficiency & Performance

### Core Principle: Diminishing Returns

As hull mass increases, engines do **not** scale linearly. The same drive code produces dramatically less thrust per ton on a larger hull.

| Drive | 10 DT | 20 DT | 40 DT | 60 DT | 90 DT |
|-------|-------|-------|-------|-------|-------|
| sC | 6.0 G | 3.0 G | 1.0 G | 1.0 G | — |
| sC G/100DT | **60.0** | **15.0** | **2.5** | **1.67** | — |
| sF | 6.0 G | 6.0 G | 3.0 G | 2.0 G | 1.0 G |
| sF G/100DT | **60.0** | **30.0** | **7.5** | **3.33** | **1.11** |

> **Engineering Rule:** Doubling hull size does **not** double thrust. It often reduces thrust-per-ton by 50–75%.

### Main Drive Formula

For ship-scale drives (A–V), CE RAW uses:

```
Thrust (G) = Drive Rating × 100 / Hull Tons
```

| Drive Code | Rating | Max Hull @ 1G | Max Hull @ 2G | Max Hull @ 3G |
|------------|--------|---------------|---------------|---------------|
| A | 1 | 100 DT | 50 DT | 33 DT |
| B | 2 | 200 DT | 100 DT | 67 DT |
| D | 4 | 400 DT | 200 DT | 133 DT |
| G | 7 | 700 DT | 350 DT | 233 DT |
| J | 9 | 900 DT | 450 DT | 300 DT |
| N | 13 | 1300 DT | 650 DT | 433 DT |
| V | 20 | 2000 DT | 1000 DT | 667 DT |

### Technology Level Efficiency Multipliers

Higher TL drives extract more performance from the same hull:

| TL Band | Efficiency Multiplier | Effect |
|---------|----------------------|--------|
| 9–10 | ×1.0 | Baseline |
| 11–12 | ×1.5 | 50% more thrust for same drive/hull |
| 13–14 | ×2.5 | 150% more thrust |
| 15+ | ×4.0 | 300% more thrust |

**Example:** Drive D on 400 DT hull
- TL 9: 4 × 100 / 400 = **1.0 G**
- TL 12: 1.0 × 1.5 = **1.5 G**
- TL 15: 1.0 × 4.0 = **4.0 G**

### Weight Classification (Engineering Basis)

Weight class is determined by thrust-per-100DT ratio, with TL-shifted thresholds:

| Class | TL 9–10 Threshold | TL 11–12 | TL 13–14 | TL 15+ |
|-------|------------------|----------|----------|--------|
| Very Light | > 40.0 | > 60.0 | > 100.0 | > 160.0 |
| Light | 20.0 – 40.0 | 30.0 – 60.0 | 50.0 – 100.0 | 80.0 – 160.0 |
| Medium | 5.0 – 19.9 | 7.5 – 29.9 | 12.5 – 49.9 | 20.0 – 79.9 |
| Heavy | 1.0 – 4.9 | 1.5 – 7.4 | 2.5 – 12.4 | 4.0 – 19.9 |
| Very Heavy | < 1.0 | < 1.5 | < 2.5 | < 4.0 |

---

## 2. Tender Mechanics

### Capacity Formula

```
Max Total Mass @ 1G = Drive Rating × 100
Tender Capacity = Max Total Mass − Tender Hull DT
```

**Critical constraint:** The tender's **own hull mass counts against the drive limit**.

### Main Drive Capacity Table

| Drive | Rating | Max @ 1G | 100DT Tender | 200DT Tender | 400DT Tender |
|-------|--------|----------|--------------|--------------|--------------|
| A | 1 | 100 DT | 0 DT | — | — |
| B | 2 | 200 DT | 100 DT | 0 DT | — |
| C | 3 | 300 DT | 200 DT | 100 DT | — |
| D | 4 | 400 DT | 300 DT | 200 DT | — |
| E | 5 | 500 DT | 400 DT | 300 DT | 100 DT |
| F | 6 | 600 DT | 500 DT | 400 DT | 200 DT |
| G | 7 | 700 DT | 600 DT | 500 DT | 300 DT |
| H | 8 | 800 DT | 700 DT | 600 DT | 400 DT |
| J | 9 | 900 DT | 800 DT | 700 DT | 500 DT |
| K | 10 | 1000 DT | 900 DT | 800 DT | 600 DT |
| L | 11 | 1100 DT | 1000 DT | 900 DT | 700 DT |
| M | 12 | 1200 DT | 1100 DT | 1000 DT | 800 DT |
| N | 13 | 1300 DT | 1200 DT | 1100 DT | 900 DT |
| P | 14 | 1400 DT | 1300 DT | 1200 DT | 1000 DT |

### Small Craft Drive Limits

Small craft drives (sA–sW) cannot exceed **95 DT total mass** at ≥1G. They are useful only as **craft-tenders**:

| Drive | Max @ 1G | 20DT Tender Cap | 50DT Tender Cap |
|-------|----------|-----------------|-----------------|
| sN | 95 DT | 75 DT | 45 DT |
| sW | 95 DT | 75 DT | 45 DT |

### Capacity Suffix Notation

Tender capacity is suffixed with the **average dtonnage of pushed craft**:

| Notation | Example Capacity |
|----------|-----------------|
| Cap20DT | 500 DT total = 25 × 20 DT fighters |
| Cap100DT | 500 DT total = 5 × 100 DT corvettes |
| Cap400DT | 900 DT total = 2 × 400 DT escorts + 1 × 100 DT scout |

### Push Methods

| Method | Additional Tonnage | Thrust Penalty | Notes |
|--------|-------------------|----------------|-------|
| **Grappled Push** | 2% of pushed hull per connection point | −1G | Standard. Physical grapples |
| **Docking Collar** | 5 DT per collar | −0.5G | Hard dock. Sustained operations |
| **Tractor Beam** | 10 DT emitter. TL 12+ only | −1G | No physical contact. Slip risk |

### Load Efficiency Penalty

| Load % of Max | Thrust Efficiency |
|---------------|-------------------|
| 0–50% | 100% |
| 51–75% | 90% |
| 76–90% | 75% |
| 91–100% | 50% |
| >100% | **Cannot push** |

### Fuel Transfer

| Mode | Transfer Rate |
|------|--------------|
| Grappled | 10% of tender fuel capacity per hour |
| Docked | 25% of tender fuel capacity per hour |

### Crew Requirements

- Base tender crew per standard rules
- **+1 Push Operator per 500 DT of pushed mass**
- Push Operators count as Engineers for maintenance

---

## 3. Armor Systems

### Role-Based Armor Limits

Armor allocation depends on **ship role** and **jump capability**:

| Role | Standard Limit | Non-Jump Limit | Rationale |
|------|---------------|----------------|-----------|
| Civilian / Hauler | 10% | 15% | Minimal combat role |
| Vanguard / Patrol | 15% | 25% | Balanced combat |
| Striker / Fast Attack | 10% | 20% | Speed prioritized |
| **Brawler / SDB** | **20%** | **50%** | **Armor is primary defense** |
| Support / Carrier | 15% | 25% | Protected by escort screen |
| Capital | 25% | 40% | Structural mass limits |

### Over-Limit Penalties

Exceeding the role-based limit incurs escalating penalties:

| Over Limit | Cost Penalty | Performance Penalty |
|------------|-------------|---------------------|
| +1–5% | +10% armor cost per DT | None |
| +6–10% | +25% armor cost | −1G thrust |
| +11–15% | +50% armor cost | −2G thrust, double maintenance |
| +16%+ | +100% armor cost | Requires TL 12+ structural engineering |

### Verified Fleet Data

Existing ship library armor percentages:

| Ship | Hull DT | Armor % | Status |
|------|---------|---------|--------|
| Passenger Liner | 1000 | 2.5% | Civilian ✓ |
| Patrol Frigate | 300 | 20.0% | At Vanguard limit ✓ |
| Escort Frigate | 400 | 40.0% | At Brawler non-jump limit ✓ |
| **System Defense Boat** | **400** | **50.0%** | **Brawler non-jump. Valid but extreme** |

---

## 4. Modular Hull Design

### Module Shapes & Efficiency

| Shape | Volume Efficiency | Structural Efficiency | Standard? |
|-------|------------------|----------------------|-----------|
| **Hexagonal** | 100% | 100% | ✅ Standard. Optimal tessellation |
| **Square / Cubic** | 90% | 95% | Alternate. 10% volume penalty |
| **Long Cuboid** | 85% | 90% | Cargo-optimized. 15% penalty |
| **Triangular** | 80% | 85% | Emergency only. 20% penalty |

### Connector Tonnage

```
Connector DT = Total Module DT × 0.05
Minimum = Base Hull DT × 0.05
```

**Revised from old 10% rule.** Connectors scale with attached mass, not hull size.

| Configuration | Module DT | Connector (5%) | Old Rule (10% hull) | Savings |
|--------------|-----------|----------------|---------------------|---------|
| 4 × 25 DT | 100 DT | 5 DT | 10 DT | **−5 DT** |
| 6 × 50 DT | 300 DT | 15 DT | 30 DT | **−15 DT** |
| 8 × 100 DT | 800 DT | 40 DT | 80 DT | **−40 DT** |

### Distributed Hull Cost

Distributed hulls are **frames, not full pressure vessels**:

| Hull Type | Cost per DT | Structure |
|-----------|-------------|-----------|
| Standard | 0.10 MCr | Full pressure vessel |
| Reinforced | 0.15 MCr | +50% structure |
| **Distributed Frame** | **0.06 MCr** | Frame + hardpoints. **−40% cost** |
| Skeleton | 0.04 MCr | Minimal frame. **−60% cost** |
| External Mount | 0.03 MCr | Pylon only. **−70% cost** |

**Trade-off:** Cheaper frame, but **cannot operate without modules**. Modules add cost and complexity.

**Break-even analysis:** A 100 DT distributed hull (6 MCr) + 4 cargo modules (~8 MCr) = 14 MCr total vs 10 MCr standard. **Distributed costs more overall** but gains mission flexibility.

### Attachment Limits

| Factor | Limit | Penalty if Exceeded |
|--------|-------|---------------------|
| Mass Ratio | Modules ≤ Base Hull DT | −1G thrust per 25% over |
| Connector Stress | Max 6 modules per ring | Structural failure |
| Power Draw | Modules ≤ Base Hull power output | Brownouts |
| Maneuver Profile | Total width ≤ 3× base length | −1 Pilot |

### Standard Module Catalog

| Module | DT | Function | Standard Shape |
|--------|-----|----------|----------------|
| Cargo Pod | 25 | General freight | Hex / Long |
| Passenger Pod | 25 | 8 middle passengers | Hex |
| Fuel Pod | 25 | 22 DT fuel capacity | Hex |
| Vehicle Pod | 30 | 1 × ATV or rover | Square |
| Weapons Pod | 20 | 2 hardpoints | Hex |
| Laboratory Pod | 25 | Science station | Hex |
| Habitat Pod | 30 | Extended life support | Hex / Long |
| Boarding Pod | 15 | 8 marines + breaching gear | Hex |

### Operating Penalties

| Condition | Penalty |
|-----------|---------|
| Mixed shapes attached | Use **lowest** shape factor for all modules |
| Asymmetric loading | −1 to all Pilot rolls |
| >50% modules are fuel | Explosion risk on hull breach (save or chain detonation) |
| >75% modules are cargo | M-Drive stressed. **Double maintenance intervals** |
| Emergency jettison | All modules jettisoned in 1 round. **10% fail to release** |

---

## 5. Concealed Weapons & Farings

### Pop-Up Turret Housing

| Type | Added DT | Added Cost | Detection |
|------|----------|------------|-----------|
| Basic Housing | +0.5 DT | +0.1 MCr | Visual concealment only |
| Sensor-Masked | +1.0 DT | +0.25 MCr | Sensors read as cargo hold |
| Stealth Housing | +2.0 DT | +0.5 MCr | Active scan: Difficult. TL 12+ |
| Rapid Deploy | +0.5 DT | +0.1 MCr | Deploy in 1 combat round |

### External Farings

| Type | DT | Cost | Effect |
|------|-----|------|--------|
| Basic Pylon | 0.2 | 0.02 MCr | Simple mount. Atmospheric penalty |
| Aerodynamic | 0.5 | 0.05 MCr | Streamlined. No atmo penalty |
| Armored | 1.0 | 0.1 MCr | +1 armor for mounted weapon |
| Quick-Release | +0.2 | +0.02 MCr | Emergency jettison |

### Detection Difficulty

| Sensor Level | Concealed Weapon Detection | Range |
|--------------|---------------------------|-------|
| Basic Civilian | Very Difficult | Short |
| Military Standard | Difficult | Medium |
| Advanced Military | Average | Long |
| Spinal Active Scan | Automatic | Extreme |

---

## 6. Non-Jump Vessel Construction

### Cost Savings

| System Removed | Cost Savings | Tonnage Freed |
|----------------|--------------|---------------|
| J-Drive | 100% of J-Drive cost | 100% of J-Drive tonnage |
| Jump Fuel Tanks | 100% | 100% |
| Navigator | 1 crew position | — |

**No other cost changes.** Hull, armor, M-Drive, power plant, and weapons cost the same.

### Strategic Limitations

- **Cannot retreat** from the system under own power
- Must be transported by Jump Carrier or remain permanently
- **No jump flash** — cannot be detected arriving/departing
- **Fixed defense** — protects only the system of construction

### Armor Advantage

Non-jump vessels may exceed standard armor limits because:
- Saved jump drive tonnage is reallocated to structure
- No jump grid constraints on hull rigidity
- Specially engineered for maximum survivability

See [Armor Systems](#3-armor-systems) for role-based limits.

---

*For faction-specific legal restrictions on concealed weapons, see `FACTIONS-AND-LAW.md`*  
*For ship type classifications, see `RECOMMENDATION-Ship-Types-Taxonomy.md`*  
*For terminology definitions, see `GLOSSARY.md`*
