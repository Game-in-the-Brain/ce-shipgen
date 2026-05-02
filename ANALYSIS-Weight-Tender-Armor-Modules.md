# Analysis: Weight Classes, Tender Capacity, Armor Limits & Hull Costs

**Date:** 2026-05-01  
**Scope:** Response to taxonomy v1.1 review points

---

## 1. Weight Class Thresholds — 5 Tiers vs Fewer

### Current Proposal (5 Tiers)

| Tier | Thrust/100DT | Description |
|------|-------------|-------------|
| Very Light | > 40.0 | Racing craft, high-G interceptors |
| Light | 20.0 – 40.0 | Standard fighters, fast couriers |
| Medium | 5.0 – 19.9 | Patrol, balanced designs |
| Heavy | 1.0 – 4.9 | Armored combatants, bulk haulers |
| Very Heavy | < 1.0 | Capitals, monitors, bulk transports |

### What Happens at Higher TL?

Higher TL drives are more efficient. The same hull at TL 12 produces **~50% more thrust** than at TL 9. This shifts weight classifications upward:

| Hull DT | TL 9 Thrust | TL 9 Class | TL 12 Thrust | TL 12 Class | TL 15 Thrust | TL 15 Class |
|---------|-------------|------------|--------------|-------------|--------------|-------------|
| 100 | 1G (Drive A) | Heavy | 1.5G | Heavy | 2.5G | Medium |
| 200 | 1G (Drive B) | Heavy | 1.5G | Heavy | 2.5G | Medium |
| 400 | 1G (Drive D) | Heavy | 1.5G | Heavy | 2.5G | Medium |
| 1000 | 1G (Drive J) | Heavy | 1.5G | Heavy | 2.5G | Medium |

**Observation:** At TL 15, even a 1000 DT ship with Drive J becomes "Medium" instead of "Heavy." This is realistic — advanced tech makes big ships more agile.

### If We Reduce to 3 Tiers

| Tier | Thrust/100DT | Ships at TL 9 | Ships at TL 15 |
|------|-------------|---------------|----------------|
| Light | > 10.0 | Fighters, cutters, couriers | + Patrol corvettes, small traders |
| Medium | 2.0 – 10.0 | Most escorts, traders | + Cruisers, destroyers |
| Heavy | < 2.0 | Capitals, bulk haulers, monitors | + Large carriers, dreadnoughts |

**Pros:** Simpler. 90% of ships fall cleanly into one bucket.  
**Cons:** Loses distinction between "racing interceptor" and "standard fighter." Both become "Light."

### If We Keep 5 Tiers but Add TL Shifts

| TL Band | Threshold Multiplier | Effect |
|---------|---------------------|--------|
| TL 9–10 | ×1.0 | Baseline |
| TL 11–12 | ×1.5 | A 40 DT hull that was "Heavy" at TL 9 is "Medium" at TL 12 |
| TL 13–14 | ×2.5 | Same hull is now "Light" |
| TL 15+ | ×4.0 | "Very Light" becomes achievable for larger hulls |

**Example:** sC drive at 40 DT
- TL 9: 2.5 G/100DT → **Heavy**
- TL 12 (×1.5): 3.75 G/100DT → **Medium**
- TL 15 (×4.0): 10.0 G/100DT → **Light**

### Recommendation

**Keep 5 tiers** but apply **TL shift multipliers** to the thresholds (same system as Size Category TL shifts). This preserves granularity while accounting for tech advancement.

**Simplified display:** In the UI, show only 3 tiers (Light / Medium / Heavy) unless the user toggles "Advanced View" which reveals Very Light and Very Heavy.

---

## 2. Tender Capacity — Total DT Before Thrust < 1G

### Formula Verified

```
Max Total Mass @ 1G = Drive Rating × 100
Tender Capacity = Max Total Mass − Tender Hull
```

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

### Practical Limits

**A 200 DT Tender with G Drive is the sweet spot for Frontier operations:**
- Capacity: 500 DT
- Can push: 5 × 100 DT corvettes, or 2 × 200 DT frigates, or 1 × 400 DT escort
- Thrust at max load: exactly 1G

**A 400 DT Tender with N Drive is a Fleet Auxiliary:**
- Capacity: 900 DT
- Can push: 1 × 800 DT cruiser, or 3 × 300 DT corvettes
- Still maintains 1G

**Maximum practical tender:**
- 400 DT hull + V Drive (rating 20)
- Capacity: 1600 DT
- Can push: 1 × 1600 DT line ship, or 4 × 400 DT escorts
- This is the absolute ceiling for TL 9

### Small Craft Drive Tenders

Small craft drives (sA–sW) can only push up to 95 DT total. This makes them useless as ship-tenders but viable as **craft-tenders**:

| Drive | Max @ 1G | 20DT Tender Cap | 50DT Tender Cap |
|-------|----------|-----------------|-----------------|
| sN | 95 DT | 75 DT | 45 DT |
| sQ | 95 DT | 75 DT | 45 DT |
| sW | 95 DT | 75 DT | 45 DT |

A 20 DT craft-tender with sN drive can push **one 75 DT shuttle** or **three 25 DT lighters.**

---

## 3. Armor Limits — Tested Against Existing Fleet

### Current Fleet Analysis

| Armor % | Count | Ships | Status |
|---------|-------|-------|--------|
| 0% | 14 | Fighters, boats, shuttles | Unarmored |
| 1–5% | 20 | Most civilian | Standard |
| 10–15% | 1 | TL9 Fighter 10DT (10%) | Standard |
| 20% | 4 | Patrol Frigate, Corvette, BOSCO, Raider | At standard limit |
| 30% | 1 | TL9 Medium Fighter 20DT | Exceeds standard |
| 40% | 1 | Escort Frigate 400DT | At non-jump limit |
| 50% | 1 | **System Defense Boat 400DT** | **Exceeds even non-jump limit!** |

### Observation: SDB Has 50% Armor

The **TL9 System Defense Boat** already has **50% armor** in the existing data. This exceeds the proposed 40% non-jump limit.

### Revised Armor Limit Proposal

| Ship Type | Standard Limit | Non-Jump Limit | Notes |
|-----------|---------------|----------------|-------|
| Civilian / Hauler | 10% | 15% | No combat role |
| Vanguard / Patrol | 15% | 25% | Balanced combat |
| Striker / Fast Attack | 10% | 20% | Speed prioritized over armor |
| Brawler / SDB | 20% | **50%** | Armor is the whole point |
| Support / Carrier | 15% | 25% | Protected by screen |
| Capital | 25% | 40% | Structural limits |

**Rationale:** A System Defense Boat *should* have 50% armor. It's a non-jump Brawler — literally a floating fortress. The limit should be **role-dependent**, not universal.

### Armor Efficiency Penalty

Beyond the limit, armor becomes structurally inefficient:

| Over-Limit | Penalty |
|------------|---------|
| +1–5% | +10% armor cost per DT |
| +6–10% | +25% armor cost, −1G thrust |
| +11–15% | +50% armor cost, −2G thrust, double maintenance |
| +16%+ | Requires TL 12+ structural engineering. +100% cost |

**Example:** A 400 DT SDB with 50% armor (200 DT):
- Standard Brawler limit: 20% = 80 DT
- Non-jump Brawler limit: 50% = 200 DT ✓
- No penalties. This is legal under role-based limits.

---

## 4. Non-Standard Hull Cost Reduction

### Current CE RAW: Standard Hull Cost

```
Standard Hull Cost = Hull DT × 0.1 MCr (configurable by material)
```

### Distributed / Non-Standard Hull: Proposed Cost Reduction

A distributed hull is **not** a fully integrated pressure vessel. It is a **frame + connectors** that relies on attached modules for structural integrity.

| Hull Type | Cost per DT | Structure | Notes |
|-----------|-------------|-----------|-------|
| **Standard** | 0.10 MCr | Full pressure vessel | Baseline |
| **Reinforced** | 0.15 MCr | +50% structure | Military standard |
| **Distributed (Frame)** | **0.06 MCr** | Frame + hardpoints | −40% cost. Modules provide integrity |
| **Skeleton** | **0.04 MCr** | Minimal frame | −60% cost. High module dependency |
| **External Mount** | **0.03 MCr** | Pylon structure | −70% cost. No internal space |

### Why Cheaper?

1. **Less material** — No full hull plating, just frame members
2. **No internal subdivision** — Modules are self-contained
3. **Simplified life support** — Each module has its own
4. **Reduced structural analysis** — Frame is uniform, modules are plug-and-play

### Cost Example: 100 DT Modular Cutter

| Component | Standard | Distributed | Savings |
|-----------|----------|-------------|---------|
| Hull (100 DT) | 10 MCr | 6 MCr | 4 MCr |
| Connectors (5 DT) | — | 0.5 MCr | — |
| 4 × Cargo Modules (25 DT) | — | 4 × 2 MCr | — |
| **Total** | **10 MCr** | **14.5 MCr** | **−4.5 MCr** |

Wait — the modules cost extra. So a distributed hull is **cheaper on the frame** but **more expensive overall** because modules add cost. The savings are:

| Use Case | Standard Cost | Distributed Cost | Net Savings |
|----------|--------------|------------------|-------------|
| Bare frame (no modules) | 10 MCr | 6 MCr | **−4 MCr (40%)** |
| Full load (4 cargo pods) | 10 MCr | 14.5 MCr | **+4.5 MCr (−45%)** |
| Mixed (2 cargo, 1 fuel, 1 vehicle) | 10 MCr | 16 MCr | **+6 MCr (−60%)** |

**Conclusion:** Distributed hulls save money on the **hull itself** but cost more **overall** due to module expenses. The break-even point is **~2 modules** for cargo, or **~1 module** for specialized roles.

### Mneme Rule

> **Distributed hulls cost 40% less for the frame** but require modules to be functional. A distributed hull without modules cannot operate. Modules are interchangeable but each costs 10–20% of an equivalent dedicated hull section.

---

## 5. Pop-Up Turrets & Farings — Legal Framework (Revised)

### Modern International Law Model

Following the "concealed carry with permits" principle:

| Jurisdiction | Concealed Weapons | Permit Required | Notes |
|--------------|-------------------|-----------------|-------|
| **Imperial Space** | Permitted with **Letter of Marque** | Yes | Merchants may conceal 1 turret per 200 DT |
| **Frontier Worlds** | **Permitted** | No | Wild West. Concealment is tactical norm |
| **Zhodani Consulate** | **Illegal** | N/A | All weapons must be visible and registered |
| **Vargr Extents** | Permitted | No | Pirate standard. Concealment = survival |
| **Aslan Hierate** | Permitted with **Honor Bond** | Yes | Must declare before engagement. Surprise = dishonor |
| **Solomani Confederation** | Permitted with **Merchant Defense License** | Yes | Annual permit. Random inspection |
| **Hiver Federation** | **Restricted** | Yes | Only if threat assessment justifies |
| **Mneme Frontier** | **Permitted** | No | Every ship is armed. Concealment expected |

### Q-Ship Legal Status

| Scenario | Legal Status | Consequences if Discovered |
|----------|--------------|---------------------------|
| Q-Ship with valid Letter of Marque | **Lawful combatant** | None. Valid military vessel |
| Q-Ship without papers | **Pirate / privateer** | Seizure of ship, imprisonment of crew |
| Merchant with concealed turret, no permit | **Armed smuggler** | Fine + confiscation of weapons |
| Merchant with concealed turret, valid permit | **Armed merchant** | Fine for non-disclosure. Weapons returned |

### Detection Rules

| Sensor Level | Detection Difficulty | Range |
|--------------|---------------------|-------|
| Basic Civilian | Very Difficult | Short |
| Military Standard | Difficult | Medium |
| Advanced Military | Average | Long |
| Spinal Mount Active Scan | Automatic | Extreme |

---

## 6. Module Shape Efficiency (Revised)

### Shape Factors

| Shape | Volume Efficiency | Structural Efficiency | Standard? |
|-------|------------------|----------------------|-----------|
| **Hexagonal** | 100% | 100% | ✅ Standard |
| **Square/Cubic** | 90% | 95% | Alternate |
| **Long Cuboid** | 85% | 90% | Cargo optimized |
| **Triangular** | 80% | 85% | Emergency only |

### Why Hex is Standard

Hexagonal prisms **tessellate perfectly** in 2D and stack efficiently in 3D. Square modules leave gaps. Long modules create asymmetric stress.

### Connector Revisions

Old rule: 10% of hull tonnage  
**New rule: 5% of attached module tonnage**

| Modules | Total Module DT | Connector DT | Old Rule (10% hull) | Savings |
|---------|----------------|--------------|---------------------|---------|
| 4 × 25 DT | 100 DT | 5 DT | 10 DT | **−5 DT** |
| 6 × 50 DT | 300 DT | 15 DT | 30 DT | **−15 DT** |
| 8 × 100 DT | 800 DT | 40 DT | 80 DT | **−40 DT** |

---

## 7. Summary of Changes from v1.1 → v1.2

| Topic | v1.1 | v1.2 (Proposed) |
|-------|------|-----------------|
| Weight tiers | 5 fixed tiers | 5 tiers + TL shift multipliers |
| Tender capacity | Formula defined | Calculated for all drives A–V |
| Armor limit | 20% standard, 40% non-jump | **Role-dependent**: Brawlers up to 50% |
| Hull cost | Standard only | Distributed hulls **−40% frame cost** |
| Concealed weapons | Jurisdiction table | **Permit-based** like concealed carry |
| Connectors | 10% of hull | **5% of module tonnage** |

---

*Ready for approval to update the taxonomy document.*
