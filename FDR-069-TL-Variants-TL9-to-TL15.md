# FDR-069: TL Variants (TL9 → TL15)

**Status:** Draft
**Priority:** High (content expansion)
**Depends on:** M2.8 QA Ships passed, M3 Ship Designer complete
**Blocks:** None (parallel content work)

---

## 1. Summary

Generate **TL variant libraries** for every canonical ship design, covering Tech Levels 9 through 15. This replaces the current "all TL9" library with a multi-TL ecosystem that reflects the technological reality of the setting.

**Core Principle:** Not all ships advance equally at higher TL. The algorithm applies **TL upgrade rules** that modify drives, computers, armor, weapons, and sensors while keeping the ship's core role and hull size constant.

**Definition of Done:**
- Every ship in the library has variants from TL9 to TL15
- TL variants are generated procedurally from a base design + upgrade rules
- Players can view/compare TL variants in the library
- Taxonomy includes TL-shifted classifications (e.g., TL12 Light Cruiser behaves like a TL9 Heavy Cruiser due to miniaturization)

---

## 2. TL Progression Rules

### Drive Miniaturization

As TL increases, drives become more efficient (same thrust/jump in less tonnage):

| TL | M-Drive Efficiency | J-Drive Efficiency | PP Efficiency |
|----|-------------------|-------------------|---------------|
| 9 | 100% (baseline) | 100% | 100% |
| 10 | 100% | 100% | 100% |
| 11 | 90% | 90% | 90% |
| 12 | 85% | 85% | 85% |
| 13 | 75% | 75% | 75% |
| 14 | 65% | 65% | 65% |
| 15 | 55% | 55% | 55% |

> **Example:** A TL9 M-Drive D for 200DT = 7 DT. At TL12, the same performance = 7 × 0.85 = **5.95 DT**.

### Cost Scaling

Higher TL drives cost more per DT but require fewer DT, resulting in mixed cost impact:

| TL | Cost Multiplier |
|----|----------------|
| 9 | 1.0× |
| 10 | 1.0× |
| 11 | 1.5× |
| 12 | 1.5× |
| 13 | 2.5× |
| 14 | 2.5× |
| 15 | 4.0× |

> **Example:** TL9 M-Drive D = 7 DT × 4 MCr/DT = 28 MCr. TL12 M-Drive D = 5.95 DT × (4 × 1.5) = 5.95 × 6 = **35.7 MCr**.

### Armor Advancement

| TL | Max Armor Qty | New Armor Types |
|----|--------------|-----------------|
| 9 | 2 | Titanium Steel |
| 10 | 2 | Crystaliron |
| 11 | 3 | Crystaliron |
| 12 | 3 | Bonded Superdense |
| 13 | 4 | Bonded Superdense |
| 14 | 4 | Coherent Superdense |
| 15 | 5 | Coherent Superdense, Reflec standard |

### Computer Advancement

| TL | Base Model | Max Rating | Options |
|----|-----------|------------|---------|
| 9 | Model 1–2 | R5 | Hardened |
| 10 | Model 2–3 | R10 | Hardened, J-Spec |
| 11 | Model 3–4 | R15 | Hardened, J-Spec, Bio |
| 12 | Model 4–5 | R20 | Hardened, J-Spec, Bio, Intellect |
| 13 | Model 5–6 | R25 | All + Expert Systems |
| 14 | Model 6–7 | R30 | All + AI Core |
| 15 | Model 7+ | R40 | All + Neural Link |

### Weapon Advancement

| TL | New Weapons | Turret Improvements |
|----|------------|---------------------|
| 9 | Pulse Laser, Sand Caster, Missile | Standard |
| 10 | Beam Laser, Smart Missiles | Standard |
| 11 | Particle Beam, Fusion Gun | Rapid Targeting (+1 initiative) |
| 12 | Plasma Gun, Advanced Missiles | Rapid Targeting |
| 13 | Meson Gun (spinal only), Grav Weapons | Auto-Tracking |
| 14 | Anti-Matter Weapons | Auto-Tracking |
| 15 | Disintegrator (naval only) | Predictive Fire Control |

---

## 3. Faction-Based TL Caps

The setting uses **Generic Factions** to avoid IP issues. TL caps reflect faction technological development:

| Faction | Max TL | Median TL | Notes |
|---------|--------|-----------|-------|
| **Core Hegemony** | 15 | 11–12 | The dominant interstellar power. Jump-6, meson comms, black globe prototypes. |
| **Hive Concordat** | 15 | 11–12 | Matches Hegemony peak. Favors robotics, terraforming, behavioral tech. |
| **Solar Compact** | 14 | 10–11 | Catching up to TL15. Highly efficient TL14 baseline. |
| **Psionic Covenant** | 14 | 10–11 | Psionics offset engineering gap. Telepathic security, teleportation troops. |
| **Clan Territories** | 14 | 10–11 | Reliable, repairable, expansion-focused. |
| **Herds of the Void** | 14 | 9–10 | Ships require vast open spaces. Unique life support engineering. |
| **Charismatic Domains** | 13–14 | 8–10 | Patchwork tech. TL14 forge worlds exist but are rare. |
| **Ancient Remnant** | 16 | 12–13 | Small, isolated. Preserves TL16 caches. Elite units only. |

### Median TL Reality

Across all factions, **the Median Tech Level is TL 10–12.**

- **TL 9** is the interstellar floor (minimum for Jump Drive)
- **TL 10–12** is the "sweet spot" — fusion power, basic anti-grav, reliable Jump-1/2, laser carbines
- **TL 13–15** is expensive, rare, and usually military/corporate only
- **TL 14–15** infrastructure is astronomically costly to maintain

> **Design Implication:** The library should be **heavily weighted toward TL 9–11**, with TL 12–15 as rarities.

---

## 4. Variant Generation Method

### Step 1: Base Design

Start with the TL9 canonical design (from `all_ships.json`).

### Step 2: Apply TL Upgrades

For each TL from 10 to 15:

```python
def generate_tl_variant(base_ship, target_tl):
    variant = deepcopy(base_ship)
    variant['tl'] = target_tl
    variant['id'] = f"{base_ship['id']}-tl{target_tl}"
    variant['name'] = f"TL{target_tl} {base_ship['name'].replace('TL9 ', '').replace('TL 9 ', '')}"
    
    # 1. Upgrade drives (miniaturization)
    for drive in variant.get('drives', []):
        eff = tl_efficiency(target_tl)
        drive['dtons'] = drive['dtons'] * eff
        drive['cost'] = drive['cost'] * eff * cost_multiplier(target_tl)
    
    # 2. Upgrade computer
    if variant.get('computers'):
        comp = variant['computers'][0]
        comp['model'] = upgrade_computer(comp['model'], target_tl)
        comp['rating'] = upgrade_rating(comp['rating'], target_tl)
        comp['tl'] = target_tl
    
    # 3. Upgrade armor (if possible)
    if variant.get('armorQty', 0) > 0:
        max_armor = max_armor_for_tl(target_tl)
        if variant['armorQty'] < max_armor:
            variant['armorQty'] = min(variant['armorQty'] + 1, max_armor)
        variant['armor'] = upgrade_armor(variant['armor'], target_tl)
    
    # 4. Upgrade sensors
    if variant.get('sensorList'):
        sens = variant['sensorList'][0]
        sens['sensorType'] = upgrade_sensors(sens['sensorType'], target_tl)
        sens['tl'] = target_tl
    
    # 5. Upgrade weapons
    for wm in variant.get('weaponMounts', []):
        for w in wm.get('weapons', []):
            w['weaponType'] = upgrade_weapon(w['weaponType'], target_tl)
    
    # 6. Reclaim tonnage from drive miniaturization
    saved_tons = calculate_saved_tons(base_ship, variant)
    
    # 7. Allocate reclaimed tonnage
    if saved_tons > 0:
        # Priority: Cargo > Armor > Fuel > Weapons
        variant['cargo'] = variant.get('cargo', 0) + saved_tons * 0.5
        if variant['armorQty'] < max_armor:
            variant['armorQty'] += 1
            saved_tons -= variant['hullDtons'] * 0.05
        if saved_tons > 0:
            variant['cargo'] += saved_tons
    
    # 8. Recalculate totals
    variant['totalCost'] = recalculate_cost(variant)
    variant['availableDtons'] = variant['hullDtons'] - recalculate_used_tons(variant)
    
    return variant
```

### Step 3: Validation

Run `validateShip()` on each variant. If it fails:
- Reduce cargo
- Downgrade a system
- Log the failure for manual review

### Step 4: Faction Override

For faction-specific variants:

```python
def apply_faction_override(variant, faction):
    if faction == 'psionic_covenant':
        variant['computers'][0]['options'].append('Psionic Interface')
        variant['sensorList'][0]['sensorType'] = 'Psionic Detection Array'
    elif faction == 'clan_territories':
        variant['armor'] = upgrade_armor(variant['armor'], variant['tl'] + 1)  # One TL ahead in armor
        variant['mDrive'] = downgrade_drive(variant['mDrive'], 1)  # One rating slower but tougher
```

---

## 5. Library Structure

### File Organization

```
public/data/
├── all_ships.json              # TL9 canonical designs
├── tl_variants/
│   ├── tl9_ships.json          # Same as all_ships.json
│   ├── tl10_ships.json
│   ├── tl11_ships.json
│   ├── tl12_ships.json
│   ├── tl13_ships.json
│   ├── tl14_ships.json
│   └── tl15_ships.json
```

### UI: Variant Browser

```
┌─────────────────────────────────────────┐
│  SHIP LIBRARY: 200-ton Free Trader      │
├─────────────────────────────────────────┤
│  Base: TL9  |  TL10  |  TL11  |  TL12  │
│  TL13 |  TL14 |  TL15                  │
│                                         │
│  [Compare All TLs]                      │
│                                         │
│  TL9:  86 DT cargo, 41.1 MCr           │
│  TL11: 92 DT cargo, 48.3 MCr, +1 armor │
│  TL12: 98 DT cargo, 52.7 MCr, Crystal  │
│  TL14: 108 DT cargo, 71.2 MCr, AI Core │
│                                         │
│  [Load TL11 Variant] [Compare]         │
└─────────────────────────────────────────┘
```

---

## 6. Taxonomy Impact

TL variants affect the Iron Triangle classification:

| TL | Size Shift | Effect |
|----|-----------|--------|
| 9 | 0 | Baseline |
| 10 | 0 | Baseline |
| 11 | −1 size | Miniaturization makes ships effectively smaller |
| 12 | −1 size | |
| 13 | −2 sizes | A 400DT TL13 ship fights like a 200DT TL9 ship |
| 14 | −2 sizes | |
| 15 | −3 sizes | A 1000DT TL15 ship fights like a 200DT TL9 ship |

> **Example:** A TL15 200DT Patrol Cruiser has the combat effectiveness of a TL9 600DT ship due to advanced drives, armor, and weapons. Its classification shifts from "Escort" to "Line Ship" in effective terms.

Taxonomy update needed:
- Add `tlShift` field to `ship-classifications.json`
- Classification = f(Role, Size, TL)

---

## 7. Content Plan

### Phase 1: TL10–TL11 (Most Common)
- Generate variants for all 43 ships
- Focus on drive miniaturization + cargo increase
- No new weapons (TL9–10 weapons are sufficient)

### Phase 2: TL12–TL13 (Military/Corporate)
- Generate variants for combat ships
- Add advanced weapons (Particle Beam, Plasma Gun)
- Add AI Core computers
- Generate faction-specific overrides

### Phase 3: TL14–TL15 (Elite/Rare)
- Generate variants for capital ships
- Add spinal mounts, meson weapons, black globe generators
- Extremely high cost
- Very limited availability

---

## 8. Milestone Placement

| Milestone | Scope | Status |
|-----------|-------|--------|
| M4.1: TL10–11 Variants | Generate 43 × 2 = 86 variants | 🎯 Post-M3 |
| M4.2: TL12–13 Variants | Generate 43 × 2 = 86 variants + faction overrides | ⏳ Post-M4.1 |
| M4.3: TL14–15 Variants | Generate 43 × 2 = 86 variants + capital ships | ⏳ Post-M4.2 |
| M4.4: Variant Browser UI | Library tab for TL comparison | ⏳ Post-M4.1 |

---

## 9. Acceptance Criteria

- [ ] Every ship in `all_ships.json` has TL9–TL15 variants
- [ ] Total library size: 43 × 7 = 301 ships
- [ ] TL11 variants save 5–10% hull space vs TL9
- [ ] TL15 variants save 40–50% hull space vs TL9
- [ ] Variant generation runs in <5 seconds for all 43 ships
- [ ] Faction overrides exist for at least 3 factions
- [ ] Taxonomy updated with TL shift rules

---

*Awaiting M2.8 and M3 completion before Phase 1 implementation.*
