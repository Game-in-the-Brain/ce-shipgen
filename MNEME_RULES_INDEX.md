# Mneme Space Combat Rules — Agent Reference Index

> **Source:** Mneme Variant Space Combat Rules v2.45  
> **Purpose:** Structured markdown for agent consumption and RAW compliance verification

---

## Quick Reference Files

| File | Size | Topics |
|------|------|--------|
| **[MNEME_CORE_MECHANICS.md](MNEME_CORE_MECHANICS.md)** | ~6.5KB | TN=8+adversary DM, minimum effect 1, double effect on 12, 2D6+modifier resolution, HP=Dtons, Hull/Structure=10% Dtons each, simultaneous destruction |
| **[MNEME_ACTIONS_AND_REACTIONS.md](MNEME_ACTIONS_AND_REACTIONS.md)** | ~9.4KB | MA/SA/FA/RA action economy, 7 range bands (Adj/Close/Short/Med/Long/VLong/Distant), initiative 2D6+thrust/leadership, phase order (Capt→NavComm→Eng→Pilot→Gunner→Others), 9 minor actions, 13 reactions, called shots DM-2, point defense, electronic warfare |
| **[MNEME_DAMAGE_MAC_WEAPONS.md](MNEME_DAMAGE_MAC_WEAPONS.md)** | ~7.2KB | Damage=Weapon+Effect+MAC-Armor, MAC table (1/2/5/10/20/50/100/200/500 attacks), weapon stats (Sandcaster through Fusion Gun), hit location table (2D6), crew damage, missile rules, special weapons (Meson ignores armor) |
| **[MNEME_RANGE_SENSORS_ENCOUNTER.md](MNEME_RANGE_SENSORS_ENCOUNTER.md)** | ~6.3KB | 7 range bands with distances, weapon range DM+2/-2, sensor DM by range, object size modifiers, active/passive sensors, transponders, going dark, tight beam, encounter types (ambush/chance), thrust points |
| **[MNEME_SHIP_CREW_DESIGN.md](MNEME_SHIP_CREW_DESIGN.md)** | ~7.9KB | Ship design for combat (crew requirements, bridge stations, automation, architecture), crew roles by phase, superiority (count stations/turrets/bays/sensors/fighters, NOT tonnage), NPC crew quality tiers, damage control, boarding/ramming/mines, design trade-offs, full combat sequence |

---

## Critical RAW Compliance Checklist

When implementing or verifying Mneme Space Combat code, ensure:

### ✅ Core Resolution
- [ ] TN = 8 + adversary DM (not flat 8)
- [ ] Minimum effect = 1 (even on marginal success)
- [ ] Natural 12 = double effect
- [ ] Players roll everything (NPCs don't roll their own attacks)

### ✅ Action Economy
- [ ] 3 Minor Actions (MA) per turn
- [ ] Standard Action (SA) = 2 MA
- [ ] Full Action (FA) = 3 MA + reaction for DM+2
- [ ] 1 Reaction (RA) base per round

### ✅ Range System
- [ ] 7 bands: Adjacent/Close/Short/Medium/Long/VeryLong/Distant
- [ ] Weapon DM+2 when closer than max range
- [ ] Weapon DM-2 at 1 band beyond max
- [ ] Weapons cannot fire beyond 1 band past max range

### ✅ Damage
- [ ] Damage = Weapon Damage + Effect + MAC - Armor
- [ ] HP = Dtons of component
- [ ] Hull = 10% ship Dtons
- [ ] Structure = 10% ship Dtons
- [ ] Damage resolved at END of round (simultaneous destruction possible)

### ✅ Superiority
- [ ] Count stations + turrets + bays + sensors + fighters
- [ ] DO NOT use tonnage
- [ ] Superiority DM: +1 (1-2 diff), +2 (3-5), +3 (6-10), +4 (11-20), +5 (21+)

### ✅ Phase Order
- [ ] Captain → NavComm → Engineer → Pilot → Gunner → Others
- [ ] Initiative: 2D6 + thrust modifier + leadership modifier

### ✅ MAC Table
- [ ] 1→2→5→10→20→50→100→200→500 attacks
- [ ] DM: +0/+1/+1/+2/+3/+4/+5/+6/+7
- [ ] Extra damage: +0/+1/+1D6/+2D6/+3D6/+4D6/+5D6/+6D6/+7D6
- [ ] Double rule: ×2 (or ×2.5 when starting with 2)

---

## Known Gaps (Requires RAW Verification)

These items were inferred or simplified during extraction and need cross-reference with the actual PDF:

1. **Exact thrust/leadership initiative modifiers** — values not explicitly stated in extracted text
2. **Full crew reaction list** — may be incomplete (extracted 13 reactions)
3. **Automation level costs** — mentioned but no specific MCr values given
4. **Ship architecture effects** — Dispersed/Planetoid/Buffered modifiers need RAW confirmation
5. **Exact sensor DM progression beyond Distant** — stated as "exponential" but no formula given
6. **Boarding action details** — mentioned but mechanics not fully extracted
7. **Ramming damage formula** — stated but needs RAW verification

---

## File Size Summary

```
MNEME_CORE_MECHANICS.md          6,501 bytes
MNEME_ACTIONS_AND_REACTIONS.md   9,416 bytes
MNEME_DAMAGE_MAC_WEAPONS.md      7,210 bytes
MNEME_RANGE_SENSORS_ENCOUNTER.md 6,276 bytes
MNEME_SHIP_CREW_DESIGN.md        7,932 bytes
MNEME_SPACE_COMBAT_RULES.md     19,727 bytes  (original consolidated)
MNEME_RULES_INDEX.md             (this file)
─────────────────────────────────────────────
Total structured reference        ~37KB
```

---

*Generated for CE ShipGen project agent reference. Use these files to verify RAW compliance when implementing combat mechanics.*
