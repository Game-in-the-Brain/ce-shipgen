#!/usr/bin/env python3
"""
Ship Library Auditor — Table-Driven Data Integrity Validator

Re-computes ship totals using reference tables and flags violations
where stored values don't match table lookups.

Usage:
    python scripts/audit-ships.py              # Audit all_ships.json
    python scripts/audit-ships.py --fix        # Write corrected ships back
    python scripts/audit-ships.py --ship "TL9" # Audit matching ships only
"""

import json
import argparse
import sys
from pathlib import Path

DATA_DIR = Path("public/data")
SHIPS_FILE = DATA_DIR / "all_ships.json"

TABLES = {
    "life_support": "life_support.json",
    "ship_modules": "ship_modules.json",
    "ship_weapons": "ship_weapons.json",
    "ship_supplies": "ship_supplies.json",
    "ship_vehicles": "ship_vehicles.json",
}


def normalize_name(name: str) -> str:
    return "".join(c for c in name.lower() if c.isalnum()).rstrip("s")


def build_lookup(rows: list[dict], name_key: str) -> dict[str, dict]:
    lookup = {}
    for row in rows:
        raw_name = str(row.get(name_key, ""))
        lookup[normalize_name(raw_name)] = row
        lookup[raw_name.lower().strip()] = row
    return lookup


def find_in_table(name: str, lookup: dict) -> dict | None:
    norm = normalize_name(name)
    exact = name.lower().strip()

    if exact in lookup:
        return lookup[exact]
    if norm in lookup:
        return lookup[norm]

    # Fuzzy fallback
    for key, row in lookup.items():
        if norm in key or key in norm:
            return row
    return None


def audit_life_support(ship: dict, table_rows: list[dict]) -> list[dict]:
    violations = []
    lookup = build_lookup(table_rows, "LIFE SUPPORT")

    for item in ship.get("lifeSupport", []):
        name = item.get("name") or item.get("facilityType", "")
        row = find_in_table(name, lookup)
        if not row:
            violations.append({
                "category": "Life Support",
                "item": name,
                "field": "table-lookup",
                "severity": "warning",
                "message": f'No table entry for "{name}"',
            })
            continue

        expected_dt = float(row.get("DTONS", 0))
        expected_cost = float(row.get("COST", 0))
        stored_dt = float(item.get("dtons", 0))
        stored_cost = float(item.get("cost", 0))

        if abs(stored_dt - expected_dt) > 0.001:
            violations.append({
                "category": "Life Support",
                "item": name,
                "field": "dtons",
                "severity": "critical",
                "message": f"{name}: stored dtons={stored_dt}, table={expected_dt}",
                "expected": expected_dt,
                "actual": stored_dt,
            })
        if abs(stored_cost - expected_cost) > 1:
            violations.append({
                "category": "Life Support",
                "item": name,
                "field": "cost",
                "severity": "critical",
                "message": f"{name}: stored cost={stored_cost}, table={expected_cost}",
                "expected": expected_cost,
                "actual": stored_cost,
            })
    return violations


def audit_modules(ship: dict, table_rows: list[dict]) -> list[dict]:
    violations = []
    lookup = build_lookup(table_rows, "MODULES")

    for item in ship.get("modules", []):
        name = item.get("module", "")
        row = find_in_table(name, lookup)
        if not row:
            violations.append({
                "category": "Modules",
                "item": name,
                "field": "table-lookup",
                "severity": "warning",
                "message": f'No table entry for module "{name}"',
            })
            continue

        expected_dt = float(row.get("DTONS", 0))
        expected_cost = float(row.get("COST", 0))
        stored_dt = float(item.get("dtons", 0))
        stored_cost = float(item.get("cost", 0))

        if abs(stored_dt - expected_dt) > 0.001:
            violations.append({
                "category": "Modules",
                "item": name,
                "field": "dtons",
                "severity": "critical",
                "message": f"{name}: stored dtons={stored_dt}, table={expected_dt}",
            })
        if abs(stored_cost - expected_cost) > 1:
            violations.append({
                "category": "Modules",
                "item": name,
                "field": "cost",
                "severity": "critical",
                "message": f"{name}: stored cost={stored_cost}, table={expected_cost}",
            })
    return violations


def audit_weapons(ship: dict, table_rows: list[dict]) -> list[dict]:
    violations = []
    lookup = build_lookup(table_rows, "WEAPONS")

    for item in ship.get("weaponMounts", []):
        name = item.get("name", "")
        row = find_in_table(name, lookup)
        if not row:
            violations.append({
                "category": "Weapons",
                "item": name,
                "field": "table-lookup",
                "severity": "warning",
                "message": f'No table entry for weapon "{name}"',
            })
            continue

        expected_dt = float(row.get("DTONS", 0))
        expected_cost = float(row.get("COST", 0))
        stored_dt = float(item.get("dtons", 0))
        stored_cost = float(item.get("cost", 0))

        if abs(stored_dt - expected_dt) > 0.001:
            violations.append({
                "category": "Weapons",
                "item": name,
                "field": "dtons",
                "severity": "critical",
                "message": f"{name}: stored dtons={stored_dt}, table={expected_dt}",
            })
        if abs(stored_cost - expected_cost) > 1:
            violations.append({
                "category": "Weapons",
                "item": name,
                "field": "cost",
                "severity": "critical",
                "message": f"{name}: stored cost={stored_cost}, table={expected_cost}",
            })
    return violations


def audit_supplies(ship: dict, table_rows: list[dict]) -> list[dict]:
    violations = []
    lookup = build_lookup(table_rows, "Supply")

    for item in ship.get("supplies", []):
        name = item.get("name", "")
        row = find_in_table(name, lookup)
        if not row:
            violations.append({
                "category": "Supplies",
                "item": name,
                "field": "table-lookup",
                "severity": "warning",
                "message": f'No table entry for supply "{name}"',
            })
            continue

        expected_dt = float(row.get("DTONS", 0))
        expected_cost = float(row.get("COST", 0))
        stored_dt = float(item.get("dtons", 0))
        stored_cost = float(item.get("cost", 0))

        if abs(stored_dt - expected_dt) > 0.001:
            violations.append({
                "category": "Supplies",
                "item": name,
                "field": "dtons",
                "severity": "critical",
                "message": f"{name}: stored dtons={stored_dt}, table={expected_dt}",
            })
        if abs(stored_cost - expected_cost) > 1:
            violations.append({
                "category": "Supplies",
                "item": name,
                "field": "cost",
                "severity": "critical",
                "message": f"{name}: stored cost={stored_cost}, table={expected_cost}",
            })
    return violations


def audit_vehicles(ship: dict, table_rows: list[dict]) -> list[dict]:
    violations = []
    lookup = build_lookup(table_rows, "Vehicle")

    for item in ship.get("vehicles", []):
        name = item.get("name", "")
        row = find_in_table(name, lookup)
        if not row:
            violations.append({
                "category": "Vehicles",
                "item": name,
                "field": "table-lookup",
                "severity": "info",
                "message": f'No table entry for vehicle "{name}"',
            })
            continue

        expected_dt = float(row.get("DTONS", 0))
        expected_cost = float(row.get("COST", 0))
        stored_dt = float(item.get("dtons", 0))
        stored_cost = float(item.get("cost", 0))

        if abs(stored_dt - expected_dt) > 0.001:
            violations.append({
                "category": "Vehicles",
                "item": name,
                "field": "dtons",
                "severity": "warning",
                "message": f"{name}: stored dtons={stored_dt}, table={expected_dt}",
            })
        if abs(stored_cost - expected_cost) > 1:
            violations.append({
                "category": "Vehicles",
                "item": name,
                "field": "cost",
                "severity": "warning",
                "message": f"{name}: stored cost={stored_cost}, table={expected_cost}",
            })
    return violations


def audit_hull_overflow(ship: dict) -> list[dict]:
    violations = []
    hull = ship.get("hullDtons", 0)
    comps = ship.get("components", [])
    used = sum(c.get("dtons", 0) for c in comps)
    if used > hull:
        violations.append({
            "category": "Hull",
            "item": ship.get("name", ""),
            "field": "tonnage",
            "severity": "critical",
            "message": f"HULL OVERFLOW: {used:.1f} DT used vs {hull} DT capacity (+{used - hull:.1f} DT)",
            "expected": hull,
            "actual": used,
        })
    return violations


def audit_power_plant(ship: dict) -> list[dict]:
    violations = []
    drives = ship.get("drives", [])
    thrust = [d for d in drives if d.get("type") == "thrust"]
    power = [d for d in drives if d.get("type") == "powerPlant"]
    jump = [d for d in drives if d.get("type") == "jump"]

    if not power:
        violations.append({
            "category": "Power Plant",
            "item": ship.get("name", ""),
            "field": "powerPlant",
            "severity": "critical",
            "message": "No power plant installed",
        })
        return violations

    # Determine required PP rating from drives
    def rating_letter(code: str) -> str:
        return code.upper().replace("S", "")

    max_drive_rating = ""
    for d in thrust + jump:
        code = d.get("driveCode", "")
        letter = rating_letter(code)
        if letter and (not max_drive_rating or letter > max_drive_rating):
            max_drive_rating = letter

    pp_code = power[0].get("driveCode", "")
    pp_letter = rating_letter(pp_code)

    if max_drive_rating and pp_letter != max_drive_rating:
        violations.append({
            "category": "Power Plant",
            "item": f"Fusion Plant {pp_code}",
            "field": "driveCode",
            "severity": "critical",
            "message": f"Power Plant rating mismatch: PP is {pp_code} but drive requires {max_drive_rating} (PP should match highest drive rating)",
            "expected": max_drive_rating,
            "actual": pp_letter,
        })

    # Check PP size against smallcraft table if applicable
    if pp_code.startswith("s") and thrust:
        tcode = thrust[0].get("driveCode", "")
        if tcode.startswith("s"):
            try:
                with open(DATA_DIR / "smallcraft_drives.json") as f:
                    sc_table = {d["code"]: d for d in json.load(f)}
                if tcode in sc_table:
                    expected_dt = sc_table[tcode]["pPlantTons"]
                    actual_dt = power[0].get("dtons", 0)
                    if abs(actual_dt - expected_dt) > 0.1:
                        violations.append({
                            "category": "Power Plant",
                            "item": f"Fusion Plant {pp_code}",
                            "field": "dtons",
                            "severity": "critical",
                            "message": f"PP size wrong: {actual_dt} DT vs table {expected_dt} DT for {tcode} drive",
                            "expected": expected_dt,
                            "actual": actual_dt,
                        })
            except Exception:
                pass

    return violations


def audit_fuel(ship: dict) -> list[dict]:
    violations = []
    hull = ship.get("hullDtons", 0)
    comps = ship.get("components", [])
    fuel = sum(c.get("dtons", 0) for c in comps if c.get("section") == "Fuel")

    if fuel > 0:
        # Excessive fuel: more than 60% of hull is suspicious
        if fuel > hull * 0.6:
            violations.append({
                "category": "Fuel",
                "item": "Fuel Tanks",
                "field": "dtons",
                "severity": "warning",
                "message": f"Excessive fuel: {fuel:.1f} DT ({fuel/hull*100:.0f}% of hull). Check if fuel qty is double-counted.",
                "expected": hull * 0.4,
                "actual": fuel,
            })

        # Low fuel: less than 2 weeks for the power plant
        pp = [d for d in ship.get("drives", []) if d.get("type") == "powerPlant"]
        if pp:
            pp_dt = pp[0].get("dtons", 0)
            min_fuel = (pp_dt / 3) * 2
            if fuel < min_fuel * 0.5:
                violations.append({
                    "category": "Fuel",
                    "item": "Fuel Tanks",
                    "field": "dtons",
                    "severity": "warning",
                    "message": f"Very low fuel: {fuel:.1f} DT. Minimum 2-week ops ≈ {min_fuel:.1f} DT for {pp_dt} DT power plant.",
                    "expected": min_fuel,
                    "actual": fuel,
                })

    return violations


def audit_ship(ship: dict, tables: dict[str, list[dict]]) -> list[dict]:
    violations = []
    violations.extend(audit_hull_overflow(ship))
    violations.extend(audit_power_plant(ship))
    violations.extend(audit_fuel(ship))
    violations.extend(audit_life_support(ship, tables.get("life_support", [])))
    violations.extend(audit_modules(ship, tables.get("ship_modules", [])))
    violations.extend(audit_weapons(ship, tables.get("ship_weapons", [])))
    violations.extend(audit_supplies(ship, tables.get("ship_supplies", [])))
    violations.extend(audit_vehicles(ship, tables.get("ship_vehicles", [])))
    return violations


def main():
    parser = argparse.ArgumentParser(description="Audit ship library against reference tables")
    parser.add_argument("--fix", action="store_true", help="Write corrected ships back to file")
    parser.add_argument("--ship", type=str, default="", help="Filter ships by name substring")
    parser.add_argument("--output", type=str, default="", help="Output file for corrected ships")
    args = parser.parse_args()

    # Load ships
    with open(SHIPS_FILE) as f:
        ships = json.load(f)

    # Load tables
    tables = {}
    for key, fname in TABLES.items():
        path = DATA_DIR / fname
        if path.exists():
            with open(path) as f:
                tables[key] = json.load(f)
        else:
            print(f"Warning: table not found: {path}", file=sys.stderr)
            tables[key] = []

    # Filter ships if requested
    if args.ship:
        ships = [s for s in ships if args.ship.lower() in s.get("name", "").lower()]

    print(f"Auditing {len(ships)} ship(s)...\n")

    total_violations = 0
    ships_with_issues = 0

    for ship in ships:
        violations = audit_ship(ship, tables)
        if not violations:
            continue

        ships_with_issues += 1
        total_violations += len(violations)
        critical = sum(1 for v in violations if v["severity"] == "critical")
        warning = sum(1 for v in violations if v["severity"] == "warning")

        print(f"⚠️  {ship['name']} ({ship['hullDtons']} DT)")
        print(f"   {len(violations)} violation(s) — {critical} critical, {warning} warning")
        for v in violations[:5]:
            icon = "🔴" if v["severity"] == "critical" else "🟡" if v["severity"] == "warning" else "🔵"
            print(f"   {icon} [{v['category']}] {v['message']}")
        if len(violations) > 5:
            print(f"   ... and {len(violations) - 5} more")
        print()

    print("=" * 50)
    print(f"SUMMARY: {total_violations} violation(s) across {ships_with_issues} ship(s)")
    if total_violations == 0:
        print("✅ All ships pass table validation!")

    # TODO: --fix implementation would require recalculating components[]
    # from corrected child tables, which is complex. For now, report only.
    if args.fix:
        print("\n--fix not yet implemented. Use shipAuditor.ts correctShip() in the UI.")


if __name__ == "__main__":
    main()
