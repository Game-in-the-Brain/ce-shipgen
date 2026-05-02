# Ship Type Taxonomy v1.1 — CE RAW Master Catalog

**Status:** Draft for approval  
**Scope:** All ship and craft types from Cepheus Engine SRD + Classic Traveller, mapped to the Iron Triangle classification framework.  
**Date:** 2026-05-01

---

## 1. Taxonomy Method

Every type is classified by:
- **Role** (Iron Triangle): Striker | Brawler | Vanguard | Sprinter | Hauler | Support
- **Size** (DT): Craft (<100) | Escort (100–999) | Line Ship (1k–9.9k) | Capital (10k+)
- **Weight Class** (within size): Light vs Heavy — determined by **efficiency ratios**, not just tonnage
- **Origin**: CE SRD canonical | Classic Traveller | Mneme homebrew
- **Status**: ✅ In glossary | ⬜ Missing | ⚠️ Edge case / hybrid

---

## 1a. Light vs Heavy Classification

**Light** and **Heavy** are not arbitrary size labels — they reflect **drive efficiency ratios**.

> **Core Principle:** As hull mass increases, engines do not scale linearly. Additional tonnage yields diminishing thrust performance. A "Light" vessel achieves high thrust-to-mass ratio. A "Heavy" vessel accepts lower efficiency for more armor, weapons, or payload.

### Verified from CE RAW Engine Data

| Drive | Hull DT | Thrust (G) | G per 100 DT | Efficiency |
|-------|---------|------------|--------------|------------|
| sC | 10 | 6 | 60.00 | **Light** |
| sC | 20 | 3 | 15.00 | Medium |
| sC | 40 | 1 | 2.50 | **Heavy** |
| sC | 60 | 1 | 1.67 | Very Heavy |
| sF | 10 | 6 | 60.00 | **Light** |
| sF | 30 | 4 | 13.33 | Medium |
| sF | 60 | 2 | 3.33 | **Heavy** |
| sF | 90 | 1 | 1.11 | Very Heavy |

**Conclusion:** The same drive code produces dramatically worse thrust-per-ton as hull size grows. A 60 DT hull with an sC drive is **Heavy** (1.67 G/100DT) compared to a 10 DT hull (60.0 G/100DT) which is **Light**.

### Light vs Heavy Thresholds (Proposed)

| Label | Thrust per 100 DT | Characteristics |
|-------|-------------------|-----------------|
| **Very Light** | > 40.0 G/100DT | Racing craft, interceptors, high-G fighters |
| **Light** | 20.0 – 40.0 G/100DT | Standard fighters, fast couriers |
| **Medium** | 5.0 – 19.9 G/100DT | Standard patrol, balanced designs |
| **Heavy** | 1.0 – 4.9 G/100DT | Armored combatants, haulers with big drives |
| **Very Heavy** | < 1.0 G/100DT | Capitals, bulk transports, monitors |

> **Mneme Note:** "Heavy Frigate" means a frigate that accepts low thrust efficiency to mount maximum armor and weapons. "Light Cruiser" means a cruiser optimized for high thrust-to-mass, sacrificing payload.

---

## 2. Naval Combat Vessels

### 2.1 Capital Ships (10,000+ DT)

| # | Type | Role | Weight | Origin | Status | Notes |
|---|------|------|--------|--------|--------|-------|
| 1 | Battleship | Brawler | Heavy | CT/CE | ✅ | Defined. Heavy armor + spinal weapons |
| 2 | Dreadnought | Brawler | Very Heavy | CT | ✅ | Super-heavy variant. Spinal mount optimized |
| 3 | Battlecruiser | Striker | Medium | CT/CE | ✅ | Speed + heavy guns. Armor sacrificed |
| 4 | Command Cruiser | Vanguard | Medium | Mneme | ✅ | Flagship variant. C4ISR + command facilities |
| 5 | Fleet Carrier | Support | Heavy | CT/CE | ✅ | 100+ craft wing. Task force centerpiece |
| 6 | Superdreadnought | Brawler | Very Heavy | CT | ⬜ | Extreme variant. 200k+ DT. Rare |
| 7 | Monitors | Brawler | Very Heavy | CE | ⬜ | Non-jump capital. System defense only |
| 8 | Defense Fortresses | Brawler | Very Heavy | CE | ⬜ | Immobile/limited mobility. Orbital or planetary |

### 2.2 Line Ships (1,000 – 9,999 DT)

| # | Type | Role | Weight | Origin | Status | Notes |
|---|------|------|--------|--------|--------|-------|
| 9 | Cruiser | Vanguard | Medium | CT/CE | ✅ | General purpose. Patrol / Mercenary / Heavy variants |
| 10 | Light Cruiser | Vanguard | Light | CT/CE | ⬜ | Smaller cruiser. 1,000–3,000 DT. High thrust ratio |
| 11 | Heavy Cruiser | Vanguard | Heavy | CT/CE | ⬜ | Larger cruiser. 5,000–9,000 DT. Armor-optimized |
| 12 | Patrol Cruiser | Vanguard | Medium | CE | ⬜ | Law enforcement / patrol optimized |
| 13 | Mercenary Cruiser | Vanguard | Medium | CT/CE | ⬜ | Broadsword-class. Drop troops + vehicles |
| 14 | Destroyer | Striker | Light | CT/CE | ✅ | Fleet screen. Fast attack. High thrust ratio |
| 15 | Heavy Frigate | Brawler | Heavy | Mneme | ✅ | Armor-optimized Line Ship. Low thrust efficiency |
| 16 | Light Carrier | Support | Medium | CT/CE | ✅ | 20–40 craft. Escort/assault role |
| 17 | Assault Carrier | Support | Medium | CE | ⬜ | Marine landing optimized |
| 18 | Fast Fleet Scout | Sprinter | Light | Mneme | ✅ | Reconnaissance. Sensors + jump. Very high thrust ratio |
| 19 | Bulk Transport | Hauler | Heavy | CE | ✅ | Cargo/passenger Line Ship. Low thrust efficiency |
| 20 | Troop Transport | Support | Heavy | CT/CE | ⬜ | Army deployment. Barracks + drop equipment |
| 21 | Strike Cruiser | Striker | Light | CT | ⬜ | Heavy raid. Fast + armed. High thrust ratio |
| 22 | Armored Cruiser | Brawler | Heavy | CT | ⬜ | Armor-heavy cruiser variant. Very low thrust efficiency |
| 23 | Jump Carrier | Support | Heavy | CT | ⬜ | Carries other ships via jump grids |

### 2.3 Escort Vessels (100 – 999 DT)

| # | Type | Role | Weight | Origin | Status | Notes |
|---|------|------|--------|--------|--------|-------|
| 24 | Patrol Corvette | Vanguard | Medium | CE | ✅ | Smallest independent starship |
| 25 | Corvette | Vanguard | Medium | CT/CE | ⬜ | Generic term. Often overlaps Patrol Corvette |
| 26 | Close Escort | Brawler | Medium | CT/CE | ⬜ | Fast escort with teeth. 200–400 DT |
| 27 | Fleet Escort | Vanguard | Medium | CT/CE | ⬜ | Long-range fleet screen |
| 28 | System Defense Boat | Brawler | Heavy | CE | ✅ | Non-jump. Single-system defense. Very low thrust ratio acceptable |
| 29 | Monitor | Brawler | Heavy | CT/CE | ⬜ | Non-jump heavy combatant |
| 30 | Torpedo Boat | Striker | Light | CT/CE | ✅ | Fast attack. Missile/torpedo delivery. High thrust ratio |
| 31 | Missile Boat | Striker | Light | CE | ⬜ | Dedicated missile platform |
| 32 | Gunboat | Brawler | Medium | CT/CE | ⬜ | Escort-sized gun platform |
| 33 | Destroyer Escort | Striker | Light | CT | ⬜ | Smaller destroyer. 400–800 DT |
| 34 | Frigate | Brawler | Medium | CT/CE | ⚠️ | Ambiguous. Escort Frigate vs Heavy Frigate |
| 35 | Escort Frigate | Brawler | Medium | Mneme | ⬜ | 200–600 DT. Patrol/combat |
| 36 | Light Frigate | Vanguard | Light | CT | ⬜ | Balanced escort. Higher thrust ratio |
| 37 | Courier | Sprinter | Light | CT/CE | ✅ | Fast message/mail delivery. High thrust ratio |
| 38 | Express | Sprinter | Light | CE | ⬜ | Civilian courier. X-Boat network |
| 39 | Freighter | Hauler | Heavy | CT/CE | ✅ | Cargo merchant. Low thrust efficiency |
| 40 | Free Trader | Hauler | Medium | CT/CE | ⬜ | 200 DT. Iconic tramp merchant |
| 41 | Far Trader | Hauler | Medium | CT/CE | ⬜ | 200 DT. Jump-2 merchant |
| 42 | Subsidized Merchant | Hauler | Heavy | CT/CE | ⬜ | 400–600 DT. Government-subsidized |
| 43 | Trader | Hauler | Medium | CE | ⬜ | Generic merchant |
| 44 | Repair Tender | Support | Medium | CT/CE | ✅ | Mobile workshop |
| 45 | Fleet Tender | Support | Medium | CT/CE | ⬜ | Supports squadrons in deep space |
| 46 | Tanker | Hauler | Heavy | CT/CE | ⬜ | Fuel transport |
| 47 | Collier | Hauler | Heavy | CT/CE | ⬜ | Munitions / missile transport |
| 48 | Oiler | Hauler | Heavy | CT | ⬜ | Military fuel tender |
| 49 | Yacht | Hauler | Medium | CT/CE | ✅ | Private luxury vessel |
| 50 | Safari Ship | Hauler | Medium | CT/CE | ⬜ | Expedition vessel |
| 51 | Research Vessel | Hauler | Medium | CE | ✅ | Scientific. Labs + sensors |
| 52 | Laboratory Ship | Hauler | Medium | CT/CE | ⬜ | Dedicated science platform |
| 53 | Survey Vessel | Hauler | Medium | CE | ⬜ | Planetary/system survey |
| 54 | Scout/Courier | Sprinter | Light | CT/CE | ⬜ | IISS standard. Exploration + message |
| 55 | Seeker | Hauler | Medium | CT/CE | ⬜ | Prospecting vessel |
| 56 | Prospector | Hauler | Heavy | CE | ⬜ | Mining / resource extraction |
| 57 | Asteroid Miner | Hauler | Heavy | CE | ⬜ | Dedicated rock mining |
| 58 | Refinery Ship | Hauler | Heavy | CT/CE | ⬜ | In-space ore processing |
| 59 | Factory Ship | Hauler | Heavy | CT/CE | ⬜ | Manufacturing at destination |
| 60 | Hydroponics Vessel | Hauler | Heavy | CT | ⬜ | Food production ship |
| 61 | Q-Ship | Brawler | Medium | CT/CE | ⬜ | Armed merchant disguised as civilian |
| 62 | Armed Merchant Cruiser | Brawler | Heavy | CT | ⬜ | Heavily armed merchant |
| 63 | Hospital Ship | Support | Medium | CT/CE | ⬜ | Medical facility |
| 64 | Prison Ship | Hauler | Heavy | CT/CE | ⬜ | Inmate transport |
| 65 | Rescue Ship | Support | Medium | CT/CE | ⬜ | Search and rescue |
| 66 | Packet | Hauler | Medium | CT/CE | ⬜ | Scheduled mail/passenger service |

### 2.4 Small Craft (1 – 99 DT)

| # | Type | Role | Weight | Origin | Status | Notes |
|---|------|------|--------|--------|--------|-------|
| 67 | Interceptor | Striker | Very Light | Mneme | ✅ | Space superiority fighter. Extreme thrust ratio |
| 68 | Fighter | Striker | Light | CT/CE | ⬜ | Generic combat craft |
| 69 | Light Fighter | Striker | Very Light | CE | ⬜ | 10 DT. Single-seat. Extreme thrust ratio |
| 70 | Heavy Fighter | Brawler | Medium | CE | ⬜ | 20–40 DT. More armor/guns. Lower thrust ratio |
| 71 | Attack Craft | Striker | Light | CT | ⬜ | Ground attack / anti-ship |
| 72 | Bomber | Striker | Medium | CT/CE | ⬜ | Heavy ordnance delivery |
| 73 | Gunboat | Brawler | Heavy | Mneme | ✅ | Heavily armed small craft. Low thrust ratio |
| 74 | Cutter | Vanguard | Medium | CT/CE | ✅ | General utility |
| 75 | Modular Cutter | Vanguard | Medium | CT/CE | ⬜ | Interchangeable mission pods. See §7 |
| 76 | Patrol Craft | Vanguard | Medium | CE | ⬜ | Short-range law enforcement |
| 77 | Pinnace | Sprinter | Light | CT/CE | ✅ | Fast personnel transport |
| 78 | Racing Craft | Sprinter | Very Light | CE | ⬜ | Competitive speed craft. Extreme thrust ratio |
| 79 | Lighter | Hauler | Medium | CT/CE | ✅ | Surface-to-orbit cargo |
| 80 | Launch | Hauler | Medium | CT/CE | ⬜ | Generic small cargo |
| 81 | Cargo Shuttle | Hauler | Medium | CE | ⬜ | Dedicated freight |
| 82 | Shuttle | Hauler | Medium | CT/CE | ⬜ | Passenger/cargo mixed |
| 83 | Ship's Boat | — | Medium | CT/CE | ✅ | Generic utility carried aboard |
| 84 | Gig | — | Medium | CT/CE | ⬜ | Captain's boat / VIP launch |
| 85 | Slow Boat | Hauler | Very Heavy | CT/CE | ⬜ | Unpowered / minimal thrust cargo |
| 86 | Slow Pinnace | Hauler | Very Heavy | CT/CE | ⬜ | Unpowered personnel carrier |
| 87 | Assault Shuttle | Support | Heavy | CT/CE | ✅ | Troop/boarding delivery |
| 88 | Boarding Craft | Support | Heavy | CE | ⬜ | Breaching and entry |
| 89 | Landing Craft | Support | Heavy | CT/CE | ⬜ | Planetary assault |
| 90 | Life Boat | Support | Very Heavy | CT/CE | ⬜ | Emergency escape |
| 91 | Escape Pod | Support | Very Heavy | CT/CE | ⬜ | Individual survival |
| 92 | EVA Pod | Support | Medium | CE | ⬜ | Maintenance / spacewalk |
| 93 | Rescue Craft | Support | Medium | CE | ⬜ | SAR operations |
| 94 | Work Pod | Support | Medium | CE | ⬜ | Repair / construction |
| 95 | Repair Skiff | Support | Medium | CE | ⬜ | Minor repair work |

---

## 3. Tender Mechanics (§4.1 Detailed)

### Capacity Calculation

A Tender's **push capacity** equals the **maximum hull tonnage** its M-Drive and/or J-Drive can handle, minus the Tender's own hull tonnage.

```
Tender Capacity = Max Drive Hull Capacity − Tender Hull DT
```

**Example:**
- Tender hull: 200 DT
- Tender M-Drive: Rated for 1,000 DT max hull
- **Tender Capacity: 800 DT**

> If the Tender also has a J-Drive rated for 600 DT max hull, the **lower rating governs** for jump-capable pushing.

### Capacity Suffix

Tender capacity is expressed with a suffix indicating the **average dtonnage of craft carried**:

| Notation | Meaning |
|----------|---------|
| Cap20DT | Can push craft/ships averaging 20 DT each |
| Cap100DT | Can push craft/ships averaging 100 DT each |
| Cap400DT | Can push craft/ships averaging 400 DT each |

**Example:** A 200 DT Tender with Cap100DT can push **8 × 100 DT corvettes** (total 800 DT capacity).

### Push Method

| Method | Tonnage | Thrust Penalty | Notes |
|--------|---------|----------------|-------|
| **Grappled Push** | 2% of pushed hull per connection | −1G thrust | Standard. Physical grapples and push frames |
| **Docking Collar Push** | 5 DT per collar | −0.5G thrust | Hard dock. Used for sustained pushing |
| **Tractor Push** | TL 12+ only. 10 DT emitter | −1G thrust | No physical contact. Risk of slip at high thrust |

### Efficiency Loss at High Mass

As total pushed mass approaches maximum drive capacity, efficiency drops:

| Load % | Thrust Efficiency |
|--------|-------------------|
| 0–50% | 100% |
| 51–75% | 90% |
| 76–90% | 75% |
| 91–100% | 50% |
| >100% | Cannot push |

### Fuel Sharing

Tenders **can** transfer fuel to pushed vessels at a rate of:
- **10% of Tender's fuel capacity per hour** (grappled)
- **25% per hour** (docked)

### Crew Requirement

- Base Tender crew + **1 Push Operator per 500 DT of pushed mass**
- Push Operators count as Engineers for maintenance purposes

---

## 4. Carrier Operations (§4.2 Detailed)

### Craft Capacity

| Hangar Type | DT per Craft | Notes |
|-------------|--------------|-------|
| Minimal Berth | 110% of craft DT | Storage only. 1 hour launch prep |
| Standard Hangar | 125% of craft DT | Maintenance access. 15 min launch |
| Flight Deck | 150% of craft DT | Hot launch capable. 5 min launch |
| Repair Bay | 200% of craft DT | Full workshop. Craft can be rebuilt |

**Example:** A 20 DT fighter requires:
- Minimal: 22 DT
- Standard: 25 DT
- Flight Deck: 30 DT
- Repair Bay: 40 DT

### Launch / Recovery

| Operation | Time (Standard Hangar) | Crew Required |
|-----------|------------------------|---------------|
| Launch 1 craft | 15 minutes | 2 deck crew |
| Launch squadron (6 craft) | 30 minutes | 6 deck crew |
| Recovery 1 craft | 20 minutes | 3 deck crew |
| Emergency scramble | 5 minutes | All available |

**Max throughput:** (Launch time per craft) × (total craft) = minimum cycle time. A carrier with 24 craft and 15 min launch = 6 hours to launch all.

### Jump Space Limitations

- **Craft cannot launch in jump space.** Jump bubble prevents physical egress.
- Craft crews must remain in the carrier during jump.
- Emergency ejection is possible but destroys the craft and risks bubble collapse (fatal).

---

## 5. Pop-Up Turrets & Farings (NEW)

### Pop-Up Turret Shielding

Concealed weapons mountings that retract into the hull when not in use.

| Feature | Additional Tonnage | Additional Cost | Effect |
|---------|-------------------|-----------------|--------|
| **Basic Pop-Up Housing** | +0.5 DT per turret | +0.1 MCr | Visual concealment. Casual inspection: merchant |
| **Sensor Masked Housing** | +1.0 DT per turret | +0.25 MCr | Sensors detect as cargo hold. Active scan reveals |
| **Stealth Housing** | +2.0 DT per turret | +0.5 MCr | Active scan at Difficult to detect. TL 12+ |
| **Rapid Deploy** | +0.5 DT | +0.1 MCr | Deploy in 1 round (combat) vs 1 minute |

### Mount Point Farings

External hardpoints for weapons that do not penetrate the hull.

| Faring Type | Tonnage | Cost | Notes |
|-------------|---------|------|-------|
| **Basic Pylon** | 0.2 DT | 0.02 MCr | Simple external mount. Atmospheric penalty |
| **Aerodynamic Faring** | 0.5 DT | 0.05 MCr | Streamlined. No atmospheric penalty |
| **Armored Faring** | 1.0 DT | 0.1 MCr | +1 armor for mounted weapon |
| **Quick-Release** | +0.2 DT | +0.02 MCr | Jettison weapon in emergency |

### Legal Status by Jurisdiction

| Jurisdiction | Pop-Up Legality | Faring Legality | Notes |
|--------------|----------------|-----------------|-------|
| **Imperial Space** | Restricted | Permitted | Permit required for pop-up. Farings: no restriction |
| **Frontier Worlds** | Permitted | Permitted | No restrictions. Common on Q-ships |
| **Zhodani Consulate** | Illegal | Restricted | All weapons must be registered and visible |
| **Vargr Extents** | Permitted | Permitted | Pirate standard. Disguise is tactical advantage |
| **Aslan Hierate** | Restricted | Permitted | Pop-up considered dishonorable. Farings acceptable |
| **Mneme Frontier** | Permitted | Permitted | Wild West rules. Every ship is suspect |

---

## 6. Non-Jump Vessel Rules (§4.4 Detailed)

### Cost Savings

| System Removed | Cost Savings | Tonnage Freed |
|----------------|--------------|---------------|
| J-Drive | 100% of J-Drive cost | 100% of J-Drive tonnage |
| Jump Fuel Tanks | 100% | 100% |
| Navigator | 1 crew position | — |

**No other cost changes.** Hull, armor, M-Drive, power plant, weapons, etc. all cost the same.

### Strategic Limitations

- **Cannot retreat** from the system under their own power
- Must be transported by Jump Carrier or remain permanently
- **No jump flash** — cannot be detected arriving/departing (they never do)
- **Fixed defense** — can only protect the system they are built in

### Armor Bonus

Non-jump vessels **can exceed standard armor limits** because:
- Saved jump drive tonnage is reallocated to structure and armor
- No jump grid constraints on hull rigidity
- Specially built for maximum survivability

> **Mneme Rule:** Standard armor limit = 20% of hull tonnage. Non-jump vessels may exceed this up to **40% of hull tonnage** if designed as monitors/SDBs from the keel up. Retrofitted vessels limited to 25%.
>
> *Final armor limits subject to wargaming simulation results.*

---

## 7. Modular Cutter & Distributed Hull Rules (NEW)

### Module Shapes

| Shape | Standard | Efficiency | Notes |
|-------|----------|------------|-------|
| **Hexagonal** | ✅ Standard | 100% | Optimal packing. Most common |
| **Square/Cubic** | Alternate | 90% | 10% volume penalty. Some polities prefer |
| **Long Cuboid** | Alternate | 85% | 15% volume penalty. Used for cargo/passenger modules |
| **Triangular** | Rare | 80% | 20% penalty. Emergency/expedition use only |

### Distributed Hull Calculation

The classic **10% connector rule** is insufficient. Revised calculation:

```
Base Hull = Core hull tonnage
Module Capacity = Base Hull × Module Factor

Module Factor by Shape:
  Hex:    1.0 (100%)
  Square: 0.9 (90%)
  Long:   0.85 (85%)
  Tri:    0.8 (80%)

Connector Tonnage = Total Module DT × 0.05 (minimum 5% of Base Hull)
Total Hull = Base Hull + Connector Tonnage
```

**Example:**
- Base hull: 100 DT (cutter core)
- Hex modules: 4 × 25 DT = 100 DT module capacity
- Connector: 100 × 0.05 = 5 DT
- **Total: 105 DT** (not 110 DT under old 10% rule)

### Attachment Limits

| Factor | Limit | Penalty if Exceeded |
|--------|-------|---------------------|
| **Mass Ratio** | Modules ≤ Base Hull DT | −1G thrust per 25% over |
| **Connector Stress** | Max 6 modules per connector ring | Structural failure on 7+ |
| **Power Distribution** | Modules draw ≤ Base Hull power plant output | Brownouts in modules |
| **Maneuver Profile** | Total width ≤ 3× Base Hull length | −1 to all Pilot rolls |

### Module Types (Standard)

| Module | Tonnage | Function | Shape |
|--------|---------|----------|-------|
| Cargo Pod | 25 DT | General freight | Hex / Long |
| Passenger Pod | 25 DT | 8 middle passengers | Hex |
| Fuel Pod | 25 DT | 22 DT fuel | Hex |
| Vehicle Pod | 30 DT | 1 × ATV / rover | Square |
| Weapons Pod | 20 DT | 2 hardpoints | Hex |
| Lab Pod | 25 DT | Science station | Hex |
| Habitat Pod | 30 DT | Extended life support | Hex / Long |
| Boarding Pod | 15 DT | 8 marines + breaching | Hex |

### Efficiency Penalties

| Condition | Penalty |
|-----------|---------|
| Mixed shapes attached | Use lowest shape factor |
| Asymmetric loading | −1 to all Pilot rolls |
>50% modules fuel | Explosion risk if hit (save or chain detonation) |
>75% modules cargo | M-Drive stressed. Double maintenance intervals |
| Emergency jettison | All modules jettisoned in 1 round. 10% fail to release |

---

## 8. Classification Matrix Gaps

Current `ship-classifications.json` covers 24 class names. This taxonomy identifies **71 additional types**.

### A. New Class Table Entries (Role × Size combinations)

| Gap | Example | Proposed Class Name |
|-----|---------|---------------------|
| Striker + Capital | Superdreadnought | Siege Dreadnought |
| Brawler + Craft | Heavy Fighter | Heavy Gunboat |
| Vanguard + Craft | Modular Cutter | Modular Cutter |
| Sprinter + Craft | Racing Craft | Racer |
| Support + Craft | Life Boat | Lifeboat |
| Support + Escort | Hospital Ship | Hospital Ship |
| Hauler + Escort | Free Trader | Free Trader |
| Hauler + Line Ship | Colony Ship | Colony Transport |
| Support + Line Ship | Jump Carrier | Jump Tender |
| Striker + Line Ship | Strike Cruiser | Strike Cruiser |

### B. Synonyms / Sub-types (Same Role × Size, different name)

These share a classification slot but need glossary entries:
- **Cruiser variants**: Light Cruiser, Heavy Cruiser, Patrol Cruiser, Mercenary Cruiser, Armored Cruiser, Strike Cruiser → all map to **Cruiser** (Vanguard / Line Ship)
- **Freighter variants**: Free Trader, Far Trader, Subsidized Merchant, Trader → all map to **Freighter** (Hauler / Escort)
- **Corvette variants**: Corvette, Close Escort, Fleet Escort, Light Frigate → all map to **Patrol Corvette** (Vanguard / Escort)
- **Tender variants**: Repair Tender, Fleet Tender, Oiler, Collier → Support / Escort

### C. Edge Cases (Don't fit the triangle)

| Type | Why It Doesn't Fit | Handling |
|------|-------------------|----------|
| Q-Ship | Civilian hull, military payload | Classify by actual S/A/P, label `qShip: true` |
| Monitor / Defense Fortress | Non-jump, immobile | Flag `mobility: static`; classify by combat role |
| Ship's Boat / Gig | No independent capability | Classify as payload of parent ship |
| Life Boat / Escape Pod | Emergency only | Support / Craft with `emergency: true` flag |
| Jump Carrier | Carries ships, not craft | Support / Line Ship with `carrierType: jump` |

---

## 9. Crew Definitions Needed

Every type needs **minimum crew** defined per CE SRD Book 2:

| Position | CE SRD Formula | Mneme Variant? |
|----------|---------------|----------------|
| Command | 1 per ship | — |
| Pilot | 1 per 10,000 DT (min 1) | — |
| Navigator | 1 per ship (if jump-capable) | — |
| Engineer | 1 per 100 DT of drives | — |
| Medic | 1 per 120 passengers | — |
| Gunner | 1 per turret / 3 per bay | — |
| Marine | As mission requires | Mneme: 1 squad per assault shuttle |
| Steward | 1 per 8 high passengers | — |
| Craft Crew | 1 per 2 craft | — |
| Maintenance | 1 per 1,000 DT (Line Ship+) | Mneme addition? |
| Push Operator | 1 per 500 DT pushed (Tenders only) | Mneme addition |
| Deck Crew | 2 per hangar bay (Carriers only) | Mneme addition |

**Ships needing crew tables:**
- All 43 existing Excel ships
- All new TL variants (9, 10, 11, 12, 13, 14, 15)
- Crew scaling by automation level (TL affects crew)

---

## 10. Recommended Approval Process

1. **You review this taxonomy** — Mark which types to include/exclude
2. **I expand `ship-classifications.json`** — Add new Role × Size slots + Weight Class flags
3. **I expand `glossary.json`** — Add all missing entries with CE RAW definitions
4. **I write technical definitions** — Tenders, carriers, Q-ships, non-jump vessels, pop-ups, modular cutters
5. **I define crew formulas** — Per type, per TL, per automation level
6. **Then**: Docx exporter → TL variants → UI search → App builds

---

## Appendix: Complete Count

| Category | Current | Taxonomy Total | Gap |
|----------|---------|---------------|-----|
| Naval (Capital) | 7 | 8 | +1 |
| Naval (Line Ship) | 6 | 15 | +9 |
| Naval (Escort) | 7 | 43 | +36 |
| Naval (Craft) | 6 | 29 | +23 |
| Civilian | 6 | 28 | +22 |
| Equipment | 5 | 5 | — |
| Mneme | 3 | 3 | — |
| **TOTAL** | **40** | **131** | **+91** |

---

*Awaiting approval to proceed with expansion.*
