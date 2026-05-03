#!/usr/bin/env python3
"""
Convert all_ships_complete.json (raw Excel extraction) to ShipDesign JSON.

Usage:
    python scripts/convert_ships.py
    # outputs public/data/all_ships.json
"""

import json
import re
from pathlib import Path

REPO = Path(__file__).parent.parent
INPUT = REPO / "all_ships_complete.json"
OUTPUT = REPO / "public" / "data" / "all_ships.json"


def clean_cost(val):
    """Convert Excel cost to MCr float."""
    if val is None or val == "":
        return 0.0
    if isinstance(val, str):
        val = val.replace(",", "").replace(" MCr", "").replace("MCr", "").strip()
        if val.lower() in ("included", "incl", "—", "-"):
            return 0.0
    try:
        return float(val) / 1_000_000
    except (ValueError, TypeError):
        return 0.0


def clean_dtons(val):
    """Excel uses negative dtons for consumed space; normalize to positive."""
    if val is None or val == "":
        return 0.0
    try:
        return abs(float(val))
    except (ValueError, TypeError):
        return 0.0


def clean_qty(val):
    if val is None or val == "":
        return 1
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 1


def parse_tl(val):
    if val is None or val == "":
        return 9
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return 9


def normalize_name(name):
    """Remove excessive whitespace and normalize."""
    return re.sub(r"\s+", " ", name.strip())


def deduplicate_components(components):
    """
    The raw extraction often duplicates every component (two copies of each).
    Deduplicate by (section, module, notes) keeping the first occurrence.
    """
    seen = set()
    out = []
    for c in components:
        key = (c.get("section", ""), c.get("module", ""), c.get("notes", ""))
        if key not in seen:
            seen.add(key)
            out.append(c)
    return out


def convert_ship(raw):
    """Map raw Excel-extracted ship to ShipDesign JSON."""
    name = normalize_name(raw.get("name", "Unknown Ship"))
    hull_dtons = int(raw.get("tonnage", 0) or 0)

    # If tonnage is 0 (extraction error), try to infer from HULL component
    if hull_dtons == 0:
        for c in raw.get("components", []):
            if c.get("section", "").strip() == "HULL":
                dt = clean_dtons(c.get("dtons"))
                if dt > 0:
                    hull_dtons = int(dt)
                    break

    # Deduplicate components
    components = deduplicate_components(raw.get("components", []))

    # Default structure
    ship = {
        "id": f"excel-{raw.get('row', 0)}-{re.sub(r'[^a-z0-9]', '-', name.lower())}",
        "name": name,
        "tl": 9,
        "hullCode": str(hull_dtons),
        "hullDtons": hull_dtons,
        "configuration": "Standard",
        "armor": "None",
        "armorQty": 0,
        "mDrive": "",
        "jDrive": "",
        "powerPlant": "",
        "bridge": "",
        "computer": "",
        "software": [],
        "sensors": "",
        "staterooms": 0,
        "lowBerths": 0,
        "crew": [],
        "modules": [],
        "weapons": [],
        "cargo": 0,
        "components": [],
        "totalCost": 0,
        "availableDtons": 0,
        "createdAt": "2026-05-01T00:00:00.000Z",
        # Child-table arrays
        "drives": [],
        "commandControl": [],
        "computers": [],
        "softwareList": [],
        "sensorList": [],
        "lifeSupport": [],
        "weaponMounts": [],
        "supplies": [],
    }

    # Accumulators
    total_cost = 0.0
    used_dtons = 0.0
    drive_order = 0  # Preserves original drives[] ordering

    for c in components:
        section = (c.get("section") or "").strip()
        module = (c.get("module") or "").strip()
        notes = (c.get("notes") or "").strip()
        qty = clean_qty(c.get("qty"))
        dt = clean_dtons(c.get("dtons"))
        cost = clean_cost(c.get("cost"))
        tl = parse_tl(c.get("tl"))

        # Skip empty/no-op components
        if not section and not module:
            continue

        # ── HULL ──
        if section == "HULL":
            ship["hullCode"] = module
            if hull_dtons == 0 and dt > 0:
                ship["hullDtons"] = int(dt)
                hull_dtons = int(dt)
            total_cost += cost
            ship["components"].append({
                "section": "Hull",
                "module": f"{hull_dtons} DT Hull",
                "dtons": 0,
                "cost": cost,
            })

        # ── HULL CONFIGURATION ──
        elif section == "HULL CONFIGURATION":
            ship["configuration"] = module
            total_cost += cost
            if cost != 0:
                ship["components"].append({
                    "section": "Config",
                    "module": module,
                    "dtons": 0,
                    "cost": cost,
                })

        # ── HULL ARMOR ──
        elif section == "HULL ARMOR:":
            if module and module != "None":
                ship["armor"] = module
                # qty may be armor rating or qty; use notes if it looks like a number
                armor_qty = qty
                if armor_qty == 0 and notes:
                    try:
                        armor_qty = int(float(notes))
                    except ValueError:
                        pass
                ship["armorQty"] = armor_qty
                total_cost += cost
                used_dtons += dt
                ship["components"].append({
                    "section": "Armor",
                    "module": module,
                    "dtons": dt,
                    "cost": cost,
                    "qty": armor_qty,
                })

        # ── M-DRIVE ──
        elif section == "M-DRIVE TL9+":
            if not ship["mDrive"]:
                ship["mDrive"] = module
            total_cost += cost
            used_dtons += dt
            drive_order += 1
            ship["drives"].append({
                "id": f"mdrive-{module.lower()}",
                "name": f"M-Drive {module}",
                "type": "thrust",
                "driveCode": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "performance": 0,
                "tl": tl,
                "order": drive_order,
            })
            ship["components"].append({
                "section": "Drives and Power",
                "module": f"M-Drive {module}",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── J-DRIVE ──
        elif section == "J-DRIVE TL9+":
            if not ship["jDrive"]:
                ship["jDrive"] = module
            total_cost += cost
            used_dtons += dt
            # Infer jump number from drive letter
            jump = 0
            try:
                letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
                jump = letters.index(module.upper()) + 1
            except ValueError:
                pass
            drive_order += 1
            ship["drives"].append({
                "id": f"jdrive-{module.lower()}",
                "name": f"J-Drive {module}",
                "type": "jump",
                "driveCode": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "performance": jump,
                "tl": tl,
                "order": drive_order,
            })
            ship["components"].append({
                "section": "Drives and Power",
                "module": f"J-Drive {module}",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── FUSION PLANT / POWER PLANT ──
        elif section in ("FUSION PLANT", "POWER PLANT"):
            if not ship["powerPlant"]:
                ship["powerPlant"] = module
            total_cost += cost
            used_dtons += dt
            drive_order += 1
            ship["drives"].append({
                "id": f"pp-{module.lower()}",
                "name": f"Fusion Plant {module}",
                "type": "powerPlant",
                "driveCode": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "performance": 0,
                "tl": tl,
                "order": drive_order,
            })
            ship["components"].append({
                "section": "Drives and Power",
                "module": f"Fusion Plant {module}",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── FUEL TANKS ──
        elif section == "FUEL TANKS":
            total_cost += cost
            used_dtons += dt
            ship["components"].append({
                "section": "Drives and Power",
                "module": "Fuel Tanks",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── CONTROLS / BRIDGE ──
        elif section == "CONTROLS":
            ship["bridge"] = module
            total_cost += cost
            used_dtons += dt
            # Infer type from name
            ctrl_type = "bridge"
            stations = 2
            if "cockpit" in module.lower():
                ctrl_type = "cockpit"
                stations = 2
            elif "cabin" in module.lower():
                ctrl_type = "cabin"
                stations = 2
            ship["commandControl"].append({
                "id": f"cmd-{module.lower().replace(' ', '-')}",
                "name": module,
                "type": ctrl_type,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "stations": stations,
                "tl": tl,
            })
            ship["components"].append({
                "section": "Command",
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── COMPUTER ──
        elif section == "COMPUTER":
            ship["computer"] = module
            total_cost += cost
            # Parse model, rating, options from string like "M1, R5 J-Spec Hardened"
            model = module
            rating = 5
            options = []
            if "R" in module:
                m = re.search(r"R(\d+)", module)
                if m:
                    rating = int(m.group(1))
            if "Hardened" in module:
                options.append("Hardened")
            if "J-Spec" in module:
                options.append("J-Spec")
            ship["computers"].append({
                "id": f"computer-{module.lower().replace(' ', '-').replace('/', '')}",
                "name": model,
                "model": model,
                "dtons": 1,  # Model/1 = 1 DT, Model/2 = 2 DT, etc.
                "cost": cost,
                "qty": qty,
                "rating": rating,
                "slots": 1,
                "options": options,
                "tl": tl,
            })
            ship["components"].append({
                "section": "Computer",
                "module": model,
                "dtons": 1,
                "cost": cost,
                "qty": qty,
            })

        # ── SOFTWARE ──
        elif section == "SOFTWARE":
            prog = module
            rating = 0
            active = True
            # Extract rating if present
            m = re.search(r"TL\s*(\d+)", prog)
            if m:
                tl = int(m.group(1))
            ship["software"].append(prog)
            ship["softwareList"].append({
                "id": f"sw-{prog.lower().replace(' ', '-').replace('/', '')}",
                "name": prog,
                "program": prog,
                "dtons": 0,
                "cost": cost,
                "qty": 1,
                "rating": rating,
                "active": active,
                "tl": tl,
            })
            if cost > 0:
                ship["components"].append({
                    "section": "Software",
                    "module": prog,
                    "dtons": 0,
                    "cost": cost,
                    "qty": 1,
                })

        # ── SENSORS ──
        elif section == "SENSORS":
            sensor_name = module.replace("(Included in bridge)", "").replace("TL 8", "").strip()
            if not sensor_name:
                sensor_name = "Standard Sensors"
            ship["sensors"] = sensor_name
            ship["sensorList"].append({
                "id": f"sensor-{sensor_name.lower().replace(' ', '-')}",
                "name": sensor_name,
                "sensorType": sensor_name.replace(" Sensors", "").replace(" Sensor", ""),
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "tl": tl,
            })
            ship["components"].append({
                "section": "Sensors",
                "module": sensor_name,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── WEAPONS ──
        elif section == "WEAPONS":
            total_cost += cost
            used_dtons += dt
            mount_type = "hardpoint"
            max_weapons = 1
            if "turret" in module.lower():
                mount_type = "turret"
                if "triple" in module.lower():
                    max_weapons = 3
                elif "double" in module.lower():
                    max_weapons = 2
                else:
                    max_weapons = 1
            elif "bay" in module.lower():
                mount_type = "bay"
                max_weapons = 1
            ship["weaponMounts"].append({
                "id": f"wm-{module.lower().replace(' ', '-').replace(',', '')}",
                "name": module,
                "mountType": mount_type,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "maxWeapons": max_weapons,
                "weapons": [],
                "slots": 0,
            })
            ship["components"].append({
                "section": "Weapon",
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── CARGO ──
        elif section == "CARGO":
            ship["cargo"] = dt
            ship["components"].append({
                "section": "Cargo",
                "module": "Cargo Hold",
                "dtons": dt,
                "cost": 0,
                "qty": 1,
            })

        # ── CREW ──
        elif section == "CREW":
            ship["crew"].append({
                "section": "Crew",
                "module": module,
                "dtons": 0,
                "cost": cost,
                "qty": qty,
            })

        # ── MODULES ──
        elif section == "MODULES":
            ship["modules"].append({
                "section": "Module",
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── LIFE SUPPORT ──
        elif "life support" in section.lower() or section in ("STATEROOMS", "LOW BERTHS"):
            total_cost += cost
            used_dtons += dt
            facility = "Stateroom" if "stateroom" in module.lower() else (
                "Low Berth" if "low" in module.lower() else module
            )
            capacity = 2 if "stateroom" in facility.lower() else 1
            if "stateroom" in facility.lower():
                ship["staterooms"] += qty
            elif "low berth" in facility.lower():
                ship["lowBerths"] += qty
            ship["lifeSupport"].append({
                "id": f"ls-{facility.lower().replace(' ', '-')}",
                "name": facility,
                "facilityType": facility,
                "dtons": dt / qty if qty > 0 else dt,
                "cost": cost / qty if qty > 0 else cost,
                "qty": qty,
                "capacity": capacity,
                "tl": tl,
            })
            ship["components"].append({
                "section": "Life Support",
                "module": f"{qty} {facility}",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── SUPPLIES ──
        # Supplies are stored in cargo space per CE RAW; they do not consume
        # additional hull volume beyond the cargo allocation.
        elif section == "SUPPLIES":
            total_cost += cost
            # Do NOT add to used_dtons — supplies are cargo
            ship["supplies"].append({
                "id": f"sup-{module.lower().replace(' ', '-').replace(',', '')}",
                "name": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "tl": tl,
            })
            # Show in BOQ with original dtons for reference, but volume is
            # accounted for under cargo, not as separate used space.
            ship["components"].append({
                "section": "Supplies",
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "notes": "Stored in cargo space",
            })

        # ── HULL OPTIONS ──
        elif section == "HULL: OPTIONS":
            total_cost += cost
            ship["components"].append({
                "section": "Hull Option",
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

        # ── Catch-all ──
        else:
            total_cost += cost
            used_dtons += dt
            ship["components"].append({
                "section": section,
                "module": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })

    ship["totalCost"] = int(total_cost * 1_000_000)
    ship["availableDtons"] = max(0, hull_dtons - used_dtons)
    return ship


def main():
    print(f"Reading {INPUT} ...")
    with open(INPUT) as f:
        raw_ships = json.load(f)

    print(f"Converting {len(raw_ships)} ships ...")
    converted = []
    skipped = []
    for raw in raw_ships:
        ship = convert_ship(raw)
        # Skip vehicle-unit entries (carried craft / bay records), not ships
        if ship["name"].upper().startswith("VEHICLES"):
            skipped.append(ship["name"])
            continue
        converted.append(ship)
        print(f"  ✅ {ship['name']} ({ship['hullDtons']} DT, {len(ship['components'])} components)")
    if skipped:
        print(f"\n  ⏭️  Skipped {len(skipped)} vehicle-unit entries: {', '.join(skipped)}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(converted, f, indent=2)

    print(f"\nWrote {len(converted)} ships to {OUTPUT}")


if __name__ == "__main__":
    main()
