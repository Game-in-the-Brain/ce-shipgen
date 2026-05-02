#!/usr/bin/env python3
"""
Weapon Calibration & Battle Simulation Framework for CE ShipGen.

Runs Monte Carlo combat simulations between ship archetypes to verify
weapon balance, ranges, and performance per CE RAW / Mneme variant rules.

Usage:
    python scripts/weapon-calibration.py
    # outputs reports/weapon-calibration-report.md
"""

import json
import random
from pathlib import Path
from dataclasses import dataclass
from collections import defaultdict

REPO = Path(__file__).parent.parent
SHIPS_PATH = REPO / "public" / "data" / "all_ships.json"
WEAPONS_PATH = REPO / "public" / "data" / "ship_weapons.json"
REPORT_PATH = REPO / "reports" / "weapon-calibration-report.md"

# ─── Weapon Stats from CE SRD ───
WEAPON_DAMAGE = {
    "Pulse Laser": "2D6",
    "Beam Laser": "1D6",
    "Particle Beam": "3D6",
    "Missile Rack": "1D6",      # Standard missile
    "Autocannon, 20mm": "1D6",
    "Utility Laser": "1D6",
    "Hi-Cap Lasers": "2D6",
    "Bay Turret, Particle Beam": "6D6",
    "Bay Turret, Meson Gun": "5D6",
    "Bay Turret, Fusion Gun": "5D6",
    "Bay Turret, Missile Bank": "12D6",  # Flight of 12 missiles
}

WEAPON_RANGE = {
    "Pulse Laser": "Close",
    "Beam Laser": "Medium",
    "Particle Beam": "Long",
    "Missile Rack": "Special",
    "Autocannon, 20mm": "Adjacent",
    "Utility Laser": "Close",
    "Hi-Cap Lasers": "Medium",
    "Bay Turret, Particle Beam": "Long",
    "Bay Turret, Meson Gun": "Long",
    "Bay Turret, Fusion Gun": "Medium",
    "Bay Turret, Missile Bank": "Special",
    "Sand Caster": "Close",
}

RANGE_BANDS = ["Adjacent", "Close", "Short", "Medium", "Long", "Very Long", "Distant"]
RANGE_DISTANCE_KM = {
    "Adjacent": 0.5,
    "Close": 1,
    "Short": 10,
    "Medium": 1250,
    "Long": 10000,
    "Very Long": 25000,
    "Distant": 50000,
}

# Range modifiers per Mneme rules:
# DM+2 at closer than noted range
# DM-2 at one band further
# Cannot use beyond one band more than noted range
RANGE_DM = {
    ("Pulse Laser", "Adjacent"): +2,
    ("Pulse Laser", "Close"): 0,       # Optimum
    ("Pulse Laser", "Short"): -2,
    ("Beam Laser", "Close"): +2,
    ("Beam Laser", "Short"): +2,
    ("Beam Laser", "Medium"): 0,       # Optimum
    ("Beam Laser", "Long"): -2,
    ("Particle Beam", "Short"): +2,
    ("Particle Beam", "Medium"): +2,
    ("Particle Beam", "Long"): 0,      # Optimum
    ("Particle Beam", "Very Long"): -2,
    ("Missile Rack", "Medium"): +2,
    ("Missile Rack", "Long"): +2,
    ("Missile Rack", "Very Long"): +2,
    ("Missile Rack", "Distant"): 0,    # Optimum
    ("Autocannon, 20mm", "Adjacent"): 0,
    ("Utility Laser", "Adjacent"): +2,
    ("Utility Laser", "Close"): 0,
    ("Hi-Cap Lasers", "Close"): +2,
    ("Hi-Cap Lasers", "Short"): +2,
    ("Hi-Cap Lasers", "Medium"): 0,
    ("Hi-Cap Lasers", "Long"): -2,
    ("Bay Turret, Particle Beam", "Medium"): +2,
    ("Bay Turret, Particle Beam", "Long"): 0,
    ("Bay Turret, Particle Beam", "Very Long"): -2,
    ("Bay Turret, Meson Gun", "Medium"): +2,
    ("Bay Turret, Meson Gun", "Long"): 0,
    ("Bay Turret, Meson Gun", "Very Long"): -2,
    ("Bay Turret, Fusion Gun", "Close"): +2,
    ("Bay Turret, Fusion Gun", "Short"): +2,
    ("Bay Turret, Fusion Gun", "Medium"): 0,
    ("Bay Turret, Fusion Gun", "Long"): -2,
    ("Bay Turret, Missile Bank", "Long"): +2,
    ("Bay Turret, Missile Bank", "Very Long"): +2,
    ("Bay Turret, Missile Bank", "Distant"): 0,
    ("Sand Caster", "Adjacent"): +2,
    ("Sand Caster", "Close"): 0,
    ("Sand Caster", "Short"): -2,
}


def parse_damage(dmg_str: str) -> tuple:
    """Parse 'Xd6+Y' into (num_dice, modifier)."""
    if not dmg_str:
        return (0, 0)
    import re
    m = re.match(r"(\d+)D6\s*([+-])?\s*(\d+)?", dmg_str, re.I)
    if not m:
        return (0, 0)
    dice = int(m.group(1))
    sign = m.group(2) or "+"
    mod = int(m.group(3) or 0)
    if sign == "-":
        mod = -mod
    return (dice, mod)


def roll_damage(dmg_str: str) -> int:
    """Roll damage dice."""
    dice, mod = parse_damage(dmg_str)
    return sum(random.randint(1, 6) for _ in range(dice)) + mod


def average_damage(dmg_str: str) -> float:
    """Expected value of damage roll."""
    dice, mod = parse_damage(dmg_str)
    return dice * 3.5 + mod


@dataclass
class ShipArchetype:
    name: str
    hull_dtons: int
    armor_rating: int
    armor_type: str
    thrust: int
    weapons: list  # List of (weapon_name, qty)
    hardpoints: int
    hull_points: int
    structure_points: int


def load_archetypes() -> list:
    """Extract combat-relevant archetypes from the ship library."""
    with open(SHIPS_PATH) as f:
        ships = json.load(f)

    archetypes = []
    for s in ships:
        if s.get("totalCost", 0) == 0:
            continue
        hull = s["hullDtons"]
        # Hull points = hull / 50 (rounded down)
        # Structure points = hull / 50 (rounded up)
        hp = hull // 50
        sp = (hull + 49) // 50

        # Armor rating from armorQty
        armor_rating = s.get("armorQty", 0) * 2  # Titanium Steel = 2 per 5%
        armor_type = s.get("armor", "None")
        if "Crystaliron" in armor_type:
            armor_rating = s.get("armorQty", 0) * 4
        elif "Bonded Superdense" in armor_type:
            armor_rating = s.get("armorQty", 0) * 6

        # Thrust from M-Drive
        thrust = 0
        for d in s.get("drives", []):
            if d.get("type") == "thrust":
                # Approximate thrust from drive code and hull
                code = d.get("driveCode", "")
                if code.startswith("s"):
                    # Small craft — lookup from performance table is complex
                    # Use a rough approximation
                    thrust = 2
                else:
                    # Standard drive: letter A=2, B=4, C=6, etc. on 100 DT
                    # Scale by hull
                    try:
                        rating = ord(code[0].upper()) - ord("A") + 1
                        thrust = max(1, int((rating * 2 * 100) / hull))
                    except (IndexError, ValueError):
                        thrust = 1

        # Weapons from weaponMounts and components
        weapons = []
        for wm in s.get("weaponMounts", []):
            wname = wm.get("name", "")
            qty = wm.get("qty", 1)
            # Map mount names to actual weapons in components
            # This is approximate — we look for weapon components
            weapons.append((wname, qty))

        # Hardpoints = hull / 100
        hardpoints = max(1, hull // 100)

        archetypes.append(ShipArchetype(
            name=s["name"],
            hull_dtons=hull,
            armor_rating=armor_rating,
            armor_type=armor_type,
            thrust=thrust,
            weapons=weapons,
            hardpoints=hardpoints,
            hull_points=hp,
            structure_points=sp,
        ))

    return archetypes


def simulate_combat(attacker: ShipArchetype, defender: ShipArchetype, range_band: str, rounds: int = 100) -> dict:
    """
    Run a Monte Carlo combat simulation.
    Returns average damage per round, time-to-kill, hit probability, etc.
    """
    total_damage = 0
    hits = 0
    misses = 0
    kills = 0
    rounds_to_kill = []

    for _ in range(rounds):
        defender_hp = defender.hull_points + defender.structure_points
        round_count = 0
        while defender_hp > 0 and round_count < 100:
            round_count += 1
            round_damage = 0
            for wname, qty in attacker.weapons:
                dmg_str = WEAPON_DAMAGE.get(wname, "")
                if not dmg_str:
                    continue
                w_range = WEAPON_RANGE.get(wname, "Close")
                dm = RANGE_DM.get((wname, range_band), -999)
                if dm == -999:
                    # Out of range
                    continue

                # Base TN = 8, DM from range and gunner skill (assume +1)
                tn = 8 + dm + 1  # +1 for gunner skill
                # Roll 2D6
                roll = random.randint(1, 6) + random.randint(1, 6)
                if roll >= tn:
                    hits += qty
                    dmg = roll_damage(dmg_str) * qty
                    # Apply armor reduction (but not for meson guns)
                    if "Meson" not in wname:
                        dmg = max(0, dmg - defender.armor_rating)
                    round_damage += dmg
                else:
                    misses += qty

            defender_hp -= round_damage
            total_damage += round_damage

        if defender_hp <= 0:
            kills += 1
            rounds_to_kill.append(round_count)

    avg_dpr = total_damage / rounds if rounds > 0 else 0
    hit_rate = hits / (hits + misses) if (hits + misses) > 0 else 0
    avg_ttk = sum(rounds_to_kill) / len(rounds_to_kill) if rounds_to_kill else float('inf')
    kill_rate = kills / rounds

    return {
        "avg_damage_per_round": round(avg_dpr, 2),
        "hit_rate": round(hit_rate, 3),
        "avg_time_to_kill": round(avg_ttk, 1) if avg_ttk != float('inf') else "∞",
        "kill_rate": round(kill_rate, 3),
        "attacker": attacker.name,
        "defender": defender.name,
        "range": range_band,
    }


def analyze_weapon_balance() -> list:
    """Analyze each weapon type in isolation against standard targets."""
    results = []

    # Standard target: 200 DT ship, Armor-4 (2×5% Titanium Steel)
    target_hp = 8  # 200/50 hull + 200/50 structure
    target_armor = 4

    for wname, dmg_str in WEAPON_DAMAGE.items():
        w_range = WEAPON_RANGE.get(wname, "Close")
        avg_dmg = average_damage(dmg_str)
        effective_dmg = max(0, avg_dmg - target_armor)

        # Find all range bands where this weapon can fire
        usable_bands = []
        for band in RANGE_BANDS:
            dm = RANGE_DM.get((wname, band), -999)
            if dm != -999:
                usable_bands.append(band)

        # Calculate hit probability at optimum range (DM+0 or better)
        optimum_band = w_range
        tn = 8 + RANGE_DM.get((wname, optimum_band), 0) + 1
        # 2D6 probability of meeting TN
        # Simple approximation: average roll = 7, so P(success) depends on TN
        if tn <= 7:
            hit_prob = 0.72
        elif tn == 8:
            hit_prob = 0.58
        elif tn == 9:
            hit_prob = 0.42
        elif tn == 10:
            hit_prob = 0.28
        else:
            hit_prob = 0.17

        expected_dpr = effective_dmg * hit_prob
        ttk = target_hp / expected_dpr if expected_dpr > 0 else float('inf')

        results.append({
            "weapon": wname,
            "damage": dmg_str,
            "avg_damage": avg_dmg,
            "effective_vs_armor4": effective_dmg,
            "optimum_range": w_range,
            "usable_bands": usable_bands,
            "hit_prob": round(hit_prob, 3),
            "expected_dpr": round(expected_dpr, 2),
            "ttk_vs_200dt": round(ttk, 1) if ttk != float('inf') else "∞",
            "dps_per_mcr": round(expected_dpr / max(1, WEAPON_COST.get(wname, 1)), 4),
        })

    return results


# Load weapon costs from JSON
WEAPON_COST = {}
try:
    with open(WEAPONS_PATH) as f:
        wdata = json.load(f)
    for w in wdata:
        name = w.get("WEAPONS", "")
        cost = w.get("COST", 0)
        if name and cost:
            WEAPON_COST[name] = cost / 1_000_000  # Convert to MCr
except Exception:
    pass


def generate_report(archetypes: list, balance: list, skirmishes: list):
    """Write the calibration report to markdown."""
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    lines = [
        "# Weapon Calibration & Battle Simulation Report",
        "",
        f"**Generated:** 2026-05-02",
        f"**Ships analyzed:** {len(archetypes)}",
        f"**Weapons analyzed:** {len(balance)}",
        "",
        "---",
        "",
        "## 1. Weapon Balance Analysis",
        "",
        "Expected performance vs a **200 DT target with Armor-4** (2× Titanium Steel).",
        "",
        "| Weapon | Damage | Avg | Eff vs A4 | Opt Range | Hit% | Exp DPR | TTK | DPR/MCr |",
        "|--------|--------|-----|-----------|-----------|------|---------|-----|---------|",
    ]

    for b in sorted(balance, key=lambda x: -x["expected_dpr"]):
        usable = ", ".join(b["usable_bands"][:3]) + ("…" if len(b["usable_bands"]) > 3 else "")
        lines.append(
            f"| {b['weapon'][:25]:<25} | {b['damage']:<6} | {b['avg_damage']:<3} | "
            f"{b['effective_vs_armor4']:<9} | {b['optimum_range']:<9} | {b['hit_prob']:<4} | "
            f"{b['expected_dpr']:<7} | {b['ttk_vs_200dt']:<3} | {b['dps_per_mcr']:<7} |"
        )

    lines.extend([
        "",
        "### Key Findings",
        "",
    ])

    # Identify anomalies
    best_dpr = max(b["expected_dpr"] for b in balance)
    worst_dpr = min(b["expected_dpr"] for b in balance if b["expected_dpr"] > 0)
    best = next(b for b in balance if b["expected_dpr"] == best_dpr)
    worst = next(b for b in balance if b["expected_dpr"] == worst_dpr)

    lines.append(f"- **Highest DPR:** {best['weapon']} ({best['expected_dpr']} DPR, TTK {best['ttk_vs_200dt']} rounds)")
    lines.append(f"- **Lowest DPR:** {worst['weapon']} ({worst['expected_dpr']} DPR, TTK {worst['ttk_vs_200dt']} rounds)")
    lines.append(f"- **DPR Spread:** {best_dpr / worst_dpr:.1f}x between best and worst")

    # Flag short-range weapons with low TTK
    short_range_weak = [b for b in balance if b["optimum_range"] in ("Adjacent", "Close") and b["ttk_vs_200dt"] != "∞" and b["ttk_vs_200dt"] > 20]
    if short_range_weak:
        lines.append(f"- **Short-range weapons struggling vs armor:** {len(short_range_weak)} weapons take >20 rounds to kill at optimum range")
        for b in short_range_weak:
            lines.append(f"  - {b['weapon']}: TTK {b['ttk_vs_200dt']} rounds")

    lines.extend([
        "",
        "---",
        "",
        "## 2. Ship Archetype Combat Profiles",
        "",
        "| Ship | Hull | Armor | Thrust | Hardpoints | Weapons |",
        "|------|------|-------|--------|------------|---------|",
    ])

    for a in sorted(archetypes, key=lambda x: -x.hull_dtons)[:20]:
        wpn_str = ", ".join(f"{qty}×{n[:15]}" for n, qty in a.weapons[:3])
        if len(a.weapons) > 3:
            wpn_str += "…"
        lines.append(
            f"| {a.name[:30]:<30} | {a.hull_dtons} | {a.armor_rating} | {a.thrust}G | {a.hardpoints} | {wpn_str} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 3. Skirmish Simulations",
        "",
        "Sample 1v1 engagements (100 rounds each, Gunner skill +1):",
        "",
        "| Attacker | Defender | Range | Avg DPR | Hit% | TTK | Kill% |",
        "|----------|----------|-------|---------|------|-----|-------|",
    ])

    for sk in skirmishes:
        lines.append(
            f"| {sk['attacker'][:20]:<20} | {sk['defender'][:20]:<20} | {sk['range']:<7} | "
            f"{sk['avg_damage_per_round']:<7} | {sk['hit_rate']:<4} | {sk['avg_time_to_kill']:<3} | {sk['kill_rate']:<5} |"
        )

    lines.extend([
        "",
        "---",
        "",
        "## 4. Recommendations",
        "",
    ])

    # Generate recommendations based on findings
    recs = []

    # Check for weapons with no damage entry
    missing_dmg = [b["weapon"] for b in balance if b["avg_damage"] == 0]
    if missing_dmg:
        recs.append(f"**Missing damage data:** {', '.join(missing_dmg)} — add to WEAPON_DAMAGE table")

    # Check for weapons that are useless vs armor
    useless_vs_armor = [b["weapon"] for b in balance if b["effective_vs_armor4"] == 0 and b["avg_damage"] > 0]
    if useless_vs_armor:
        recs.append(f"**Weapons neutralized by Armor-4:** {', '.join(useless_vs_armor)} — consider armor-piercing rules or damage buff")

    # Check range coverage gaps
    range_coverage = defaultdict(list)
    for b in balance:
        for band in b["usable_bands"]:
            range_coverage[band].append(b["weapon"])
    for band in ["Very Long", "Distant"]:
        if len(range_coverage.get(band, [])) < 2:
            recs.append(f"**Sparse coverage at {band}:** only {len(range_coverage.get(band, []))} weapons effective — add long-range options")

    # Check for overpriced underperformers
    poor_value = [b for b in balance if b["dps_per_mcr"] < 0.5 and b["expected_dpr"] > 0]
    if poor_value:
        recs.append(f"**Poor value weapons ({len(poor_value)}):** low DPR per MCr — review costs")
        for b in poor_value[:3]:
            recs.append(f"  - {b['weapon']}: {b['dps_per_mcr']} DPR/MCr")

    if not recs:
        recs.append("No major anomalies detected. Weapon balance appears reasonable for CE RAW.")

    for r in recs:
        lines.append(f"- {r}")

    lines.extend([
        "",
        "---",
        "",
        "*Report generated by `scripts/weapon-calibration.py`*",
    ])

    REPORT_PATH.write_text("\n".join(lines))
    print(f"Wrote report to {REPORT_PATH}")


def main():
    print("Loading ship archetypes...")
    archetypes = load_archetypes()
    print(f"  Loaded {len(archetypes)} archetypes")

    print("Running weapon balance analysis...")
    balance = analyze_weapon_balance()

    print("Running skirmish simulations...")
    skirmishes = []

    # Pick representative archetypes for skirmishes
    fighters = [a for a in archetypes if a.hull_dtons <= 20 and a.weapons]
    small_craft = [a for a in archetypes if 20 < a.hull_dtons <= 100 and a.weapons]
    medium_ships = [a for a in archetypes if 100 < a.hull_dtons <= 400 and a.weapons]

    # Fighter vs Fighter
    if len(fighters) >= 2:
        skirmishes.append(simulate_combat(fighters[0], fighters[1], "Close"))
        skirmishes.append(simulate_combat(fighters[0], fighters[1], "Short"))

    # Small craft vs Medium
    if fighters and medium_ships:
        skirmishes.append(simulate_combat(fighters[0], medium_ships[0], "Close"))
        skirmishes.append(simulate_combat(medium_ships[0], fighters[0], "Close"))

    # Medium vs Medium
    if len(medium_ships) >= 2:
        skirmishes.append(simulate_combat(medium_ships[0], medium_ships[1], "Medium"))
        skirmishes.append(simulate_combat(medium_ships[0], medium_ships[1], "Long"))

    print(f"  Ran {len(skirmishes)} skirmishes")

    print("Generating report...")
    generate_report(archetypes, balance, skirmishes)

    print("\nDone.")


if __name__ == "__main__":
    main()
