# Mneme Space Combat — Damage, MAC, and Weapons

> **Source:** Mneme Variant Space Combat Rules v2.45

---

## 1. Damage and Hit Points

### Core Principle

**Damage is a value compared to the Hit Points** (as opposed to subtracting from hit points and tracking damage in terms of HP reduction).

The relative value of Damage against a Ship or its Component's HP determines the condition of the Ship and Its Component.

- **Repairs** remove an amount of damage, decreasing damage
- **Hit Points** are equal to the **Dtons** of the Component or Ship

### Ship HP Breakdown

| Component | HP Formula |
|-----------|------------|
| **Hull** | 10% of ship Dtons |
| **Structure** | 10% of ship Dtons |
| **Other Components** | Dtons of the component |

### Damage Resolution

Damage is computed as:

```
Damage = Weapon Damage + Effect + MAC - Armor
```

**Important:** In Mneme Space Combat, the **MOST damage a Ship can take is equal to all the DTons of Components** before being destroyed.

- If damage can be spread out to different components, a ship can survive longer
- If **structure is depleted**, the ship is **destroyed**
- Typically before Structure is depleted, Hull or Components are depleted

### Timing

Resolve the effects of damage **at the end of the round** when all functions have rolled, before the next round begins.

This means **ships can simultaneously destroy each other**.

---

## 2. Multiple Attack Consolidation (MAC)

MAC is for reducing the amount of rolls so the Referee does not get too overwhelmed.

Attacks are grouped into one roll for each Significant Character in the Space Combat.

The Referee having limits in NPCs they can manage — it's recommended to have up to **5 NPC gunner groups** to roll for, but ideally **2-3** would be best.

### Grouped Attacks

Expanding the Burst Fire Rules from CE SRD p.95 — calibrated to scale to larger amounts of attacks, not just shots.

Each Attack consolidates multiple weapons into a single roll with bonuses:

- **Missile swarms:** Each Missile bay fires 12 missiles. Instead of resolving every missile, damage is increased, which helps penetrate armor (abstracting the accumulated effect of many attacks)
  - Example: A Missile Frigate (400DT) fires 48 Missiles → DM+3 to Attack, increases damage by +3D6
  - Example: An Escort Frigate (400DT) has 4 Triple-Turrets with 1 Beam Laser and 2 Sand-Casters each, plus 4 Light Fighters with 1 Beam Laser and 2 Sand-Casters each → 24 point defense attacks → DM+3 to Point Defense

### MAC Table

| Number of Attacks | Attack DM | Extra Damage |
|-------------------|-----------|--------------|
| 1 | +0 | +0 |
| 2 | +1 | +1 |
| 5 | +1 | +1D6 |
| 10 | +2 | +2D6 |
| 20 | +3 | +3D6 |
| 50 | +4 | +4D6 |
| 100 | +5 | +5D6 |
| 200 | +6 | +6D6 |
| 500 | +7 | +7D6 |
| **Double** (except when value begins with 2, then ×2.5) | **Increase DM by +1** | **Increase damage by +1D6** |

### MAC and Superiority

Apply **both MAC and Superiority modifiers** as needed.

If 100 fighters fight another 100 fighters:
- Both roll once per action group
- Both get DM+4 from MAC
- Since they use Direct Attack Group Option or Missile Attack Group Option, they deal their **base damage against each hit with no MAC damage bonus**
  - The MAC DM applies to the attack roll, but the extra MAC damage is NOT applied when using Group Options

---

## 3. Weapon Damage Summary

| Weapon | TL | Mount | Range | Damage | Cost (MCr) | Ammo Cost | Notes |
|--------|-----|-------|-------|--------|------------|-----------|-------|
| **Sandcaster** | 6 | Turret | Close | 0* | 0.25 | 0.01 MCr/Dton | Use MAC to reduce damage. 20 shots per Dton |
| **Missile Rack** | 6 | Turret | Distant | Missile | 0.75 | Varies | Launches a missile |
| **Missile Bank** | 6 | Bay | Distant | Missile | 12 | Varies | Fires 12 missiles at a time |
| **Standard Missile** | 6 | — | Distant | 1D6 | 0.00125 | 0.015 MCr | 12 missiles per Dton |
| **Smart Missile** | 8 | — | Distant | 1D6 | 0.0025 | 0.03 MCr | 12 missiles per Dton |
| **Nuclear Missile** | 6 | — | Distant | 2D6+1 rad hit | 0.00375 | 0.045 MCr | — |
| **Particle Beam (Turret)** | 8 | Turret | Long | 3D6+1 rad hit | 4 | — | — |
| **Pulse Laser** | 7 | Turret | Close | 2D6 | 0.5 | — | — |
| **Beam Laser** | 9 | Turret | Medium | 1D6 | 1 | — | — |
| **Meson Gun** | 11 | Bay | Long | 5D6 + 1 rad hit | 20 | — | **Ignores Armor** |
| **Fusion Gun** | 12 | Bay | Medium | 5D6 | 50 | — | — |
| **Particle Beam (Bay)** | 8 | Bay | Long | 6D6 + 1 rad hit | 20 | — | — |

### Missile and Ammunition

- Missile and Ammunition have a **10:1 ratio**
- Their diameter is proportional to this ratio

---

## 4. Space Combat Hit Location

When a ship takes damage, roll **2D6** to determine hit location:

| 2D6 | External Hit (Vessel) | Internal Hit (Vessel) | Small Craft |
|-----|----------------------|----------------------|-------------|
| 2 | Hull | Structure | Hull |
| 3 | Sensors | Power Plant | Power Plant |
| 4 | M-Drive | J-Drive | Hold/Vehicle bay |
| 5 | Turret | Bay | Fuel |
| 6 | Hull | Structure | Hull |
| 7 | Armor | Crew | Armor |
| 8 | J-Drive | Fuel | Sensors |
| 9 | Power Plant | Hold | M-Drive |
| 10 | Bay | Sensors | Bay |
| 11 | Structure | M-Drive | Structure |
| 12 | Crew | Turret | Crew |

### Damaged Section Table

When a section takes damage equal to or exceeding its HP, it is **destroyed/depleted**.

### Subsequent Damage

If a section is already destroyed and is hit again, damage rolls over to the next logical section:
- Hull destroyed → Structure takes damage
- Armor destroyed → Hull takes damage
- Component destroyed → Structure takes damage

### Excess Damage

If a single hit deals more damage than the section's remaining HP, the **excess damage** rolls over to the next section in the chain (typically Structure for hull hits, or adjacent systems for component hits).

---

## 5. Crew and Damage

When the **Crew** location is hit:
- Roll randomly to determine which crew member is affected
- Damage to crew is resolved as personal combat damage
- Crew members can be wounded, incapacitated, or killed
- Incapacitated crew cannot perform their function

---

## 6. Missile Attacks Details

### Missiles in Cepheus Engine

See CE SRD for base missile rules.

### Differences between Mneme and CE RAW

Mneme streamlines missile resolution using MAC for missile swarms.

### Smart Missiles

Smart missiles have enhanced guidance and may receive bonuses to hit or be harder to jam.

---

## 7. Special Weapon Rules

### Sandcasters

- Maximum range: **Close**
- DM **-2** beyond Close range
- Use MAC to reduce incoming damage
- Each Dton of ammo = 20 shots

### Meson Guns

- **Ignore Armor** completely
- Only structure and component HP matter against meson guns

### Particle Beams

- Cause **radiation hits** in addition to damage
- Radiation hits affect crew

### Fusion Guns

- High damage at Medium range
- Expensive but devastating

---

## 8. Space Combat Challenges and Fixes

### Planetary Maneuvers

Ships operating near planets face additional hazards and may have restricted maneuvering options.

### Atmospheric Entry

See Atmospheric Entry table in the full rules.
