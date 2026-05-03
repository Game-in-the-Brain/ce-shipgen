#!/usr/bin/env python3
"""
Extract ships from all_ships_complete.json (Excel source) into clean ShipDesign format.

Fixes applied:
- lifeSupport: per-unit dtons/cost (not totals)
- components: structural items only (no weapons/modules in BOQ DT)
- hullCode: uses hullDtons (not Excel performance column letter)
- drives: proper child-table format with types
"""

import json
import re
from pathlib import Path

SRC = Path("all_ships_complete.json")
OUT = Path("public/data/all_ships.json")

def clean_dtons(v):
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return abs(float(v))
    # Handle strings like "10", "-5", "Included"
    try:
        return abs(float(v))
    except (ValueError, TypeError):
        return 0

def clean_cost(v):
    if v is None:
        return 0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).lower().strip()
    if s in ("included", "—", "-", "", "none"):
        return 0
    # Handle "100 MCr" etc.
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    if m:
        return float(m.group(1))
    return 0

def clean_qty(v):
    if v is None:
        return 1
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return 1

def parse_tl(v):
    if v is None:
        return 9
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return 9

def classify_drive(name):
    """Classify drive name into type."""
    n = name.lower()
    if "j-drive" in n or "jump" in n:
        return "jump"
    if "m-drive" in n or "thrust" in n or "r-drive" in n:
        return "thrust"
    if "power" in n or "plant" in n or "fusion" in n:
        return "powerPlant"
    return "thrust"

def extract_drive_code(module):
    """Extract drive letter from module name."""
    # Patterns: "MODEL-A", "A", "sA", etc.
    m = re.search(r"\b([A-Z])\b", module.upper())
    if m:
        return m.group(1)
    return module

# ── Tagging System ──
# Predefined tags with matching keywords for auto-assignment.
TAG_RULES = {
    "civilian": ["yacht", "liner", "trader", "merchant", "passenger", "courier", "research", "survey", "exploration", "mining", "tender", "habitat", "shuttle", "boat"],
    "warship": ["fighter", "frigate", "corvette", "destroyer", "patrol", "defense boat", "raider", "military", "escort"],
    "small-craft": ["fighter", "boat", "shuttle", "pinnace", "cutter"],
    "merchant": ["trader", "merchant", "freighter"],
    "passenger": ["liner", "passenger"],
    "military": ["fighter", "frigate", "corvette", "destroyer", "patrol", "defense boat", "raider", "military"],
    "exploration": ["exploration", "survey", "research"],
    "mining": ["miner", "mining"],
}

def assign_tags(ship):
    """Assign tags based on ship name and components."""
    name = ship.get("name", "").lower()
    tags = set()
    
    # Name-based tagging
    for tag, keywords in TAG_RULES.items():
        if any(kw in name for kw in keywords):
            tags.add(tag)
    
    # Hull-based: small craft
    if ship.get("hullDtons", 0) <= 100:
        tags.add("small-craft")
    
    # Override: if explicitly a warship by name, remove civilian
    warship_keywords = set(TAG_RULES["warship"])
    civilian_keywords = set(TAG_RULES["civilian"])
    is_warship = any(kw in name for kw in warship_keywords)
    is_civilian = any(kw in name for kw in civilian_keywords)
    
    if is_warship and is_civilian:
        # Escort Frigate, Patrol Frigate etc. — warship wins
        if "escort" in name or "patrol" in name or "defense" in name:
            tags.discard("civilian")
        # Otherwise keep both if ambiguous (e.g., armed merchant)
    
    return sorted(tags)

def process_ship(raw):
    """Convert raw ship entry to ShipDesign format."""
    ship = {
        "id": f"excel-{raw.get('row', 0)}-{raw.get('name', 'unknown').lower().replace(' ', '-').replace('/', '-').replace('"', '')}",
        "name": raw.get("name", "Unknown Ship"),
        "tl": 9,
        "hullCode": "",
        "hullDtons": 0,
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
        "drives": [],
        "commandControl": [],
        "computers": [],
        "softwareList": [],
        "sensorList": [],
        "lifeSupport": [],
        "weaponMounts": [],
        "supplies": [],
        "vehicles": [],
        "createdAt": "2024-01-01T00:00:00Z",
    }

    used_dtons = 0
    total_cost = 0
    drive_order = 0

    for comp in raw.get("components", []):
        section = str(comp.get("section", "")).strip()
        module = str(comp.get("module", "")).strip()
        notes = str(comp.get("notes", "")).strip()
        qty = clean_qty(comp.get("qty"))
        dt = clean_dtons(comp.get("dtons"))
        cost = clean_cost(comp.get("cost"))
        tl = parse_tl(comp.get("tl"))

        if not section and not module:
            continue

        # HULL
        if section.lower() == "hull":
            # Module is the hull code (e.g., "A", "s1", "2.0")
            # dtons is the hull tonnage
            ship["hullCode"] = str(int(dt)) if dt > 0 else module
            ship["hullDtons"] = int(dt) if dt > 0 else 0
            # Fallback: extract from ship name
            if ship["hullDtons"] == 0:
                m = re.search(r"(\d+)\s*DT", ship["name"], re.IGNORECASE)
                if m:
                    ship["hullDtons"] = int(m.group(1))
                    ship["hullCode"] = str(ship["hullDtons"])
            # Fallback: use ship-level tonnage
            if ship["hullDtons"] == 0:
                raw_tonnage = raw.get("tonnage", 0)
                if raw_tonnage > 0:
                    ship["hullDtons"] = int(raw_tonnage)
                    ship["hullCode"] = str(ship["hullDtons"])
            # Fallback: extract from ship name with various patterns
            if ship["hullDtons"] == 0:
                m = re.search(r"(\d+)\s*DT", ship["name"], re.IGNORECASE)
                if m:
                    ship["hullDtons"] = int(m.group(1))
                    ship["hullCode"] = str(ship["hullDtons"])
            ship["components"].append({
                "section": "Hull", "module": f"{ship['hullDtons']} DT Hull", "dtons": 0, "cost": cost, "qty": 1
            })
            total_cost += cost

        elif "configuration" in section.lower():
            ship["configuration"] = module
            ship["components"].append({
                "section": "Config", "module": module, "dtons": 0, "cost": 0, "qty": 1
            })

        elif "armor" in section.lower():
            ship["armor"] = module
            ship["armorQty"] = qty
            ship["components"].append({
                "section": "Armor", "module": f"{module}{notes and f' · {notes}' or ''}",
                "dtons": dt, "cost": cost, "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif any(x in section.lower() for x in ["m-drive", "j-drive", "fusion plant", "power plant"]):
            drive_type = classify_drive(section)
            drive_code = extract_drive_code(module)
            
            ship["drives"].append({
                "id": f"drive-{drive_order}",
                "name": drive_code,
                "type": drive_type,
                "driveCode": drive_code,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
                "order": drive_order,
            })
            drive_order += 1
            
            if drive_type == "thrust":
                ship["mDrive"] = drive_code
            elif drive_type == "jump":
                ship["jDrive"] = drive_code
            elif drive_type == "powerPlant":
                ship["powerPlant"] = drive_code
            
            used_dtons += dt
            total_cost += cost

        elif "fuel" in section.lower():
            ship["components"].append({
                "section": "Drives and Power", "module": module or "Fuel Tanks",
                "dtons": dt, "cost": cost, "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif "bridge" in section.lower() or "controls" in section.lower():
            ship["bridge"] = module
            ship["commandControl"].append({
                "id": f"bridge-{len(ship['commandControl'])}",
                "name": module,
                "type": "bridge",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })
            ship["components"].append({
                "section": "Command", "module": module,
                "dtons": dt, "cost": cost, "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif "computer" in section.lower():
            ship["computer"] = module
            ship["computers"].append({
                "id": f"comp-{len(ship['computers'])}",
                "name": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })
            ship["components"].append({
                "section": "Computer", "module": module,
                "dtons": dt, "cost": cost, "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif "software" in section.lower():
            ship["software"].append(module)
            ship["softwareList"].append({
                "id": f"sw-{len(ship['softwareList'])}",
                "name": module,
                "dtons": 0,
                "cost": cost,
                "qty": 1,
            })
            total_cost += cost

        elif "sensors" in section.lower():
            ship["sensors"] = module
            ship["sensorList"].append({
                "id": f"sensor-{len(ship['sensorList'])}",
                "name": module,
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })
            ship["components"].append({
                "section": "Sensors", "module": module,
                "dtons": dt, "cost": cost, "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif any(x in section.lower() for x in ["life support", "staterooms", "low berths"]):
            mod_lower = module.lower()
            if "stateroom" in mod_lower:
                facility = "Stateroom"
            elif "emergency" in mod_lower and "low" in mod_lower:
                facility = "Emergency Low Berth"
            elif "low" in mod_lower:
                facility = "Low Berth"
            else:
                facility = module
            capacity = 2 if facility == "Stateroom" else 1
            
            if facility == "Stateroom":
                ship["staterooms"] += qty
            elif facility in ("Low Berth", "Emergency Low Berth"):
                ship["lowBerths"] += qty
            
            # Store PER-UNIT values in lifeSupport
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
            # Store TOTAL values in components
            ship["components"].append({
                "section": "Life Support",
                "module": f"{qty} {facility}",
                "dtons": dt,
                "cost": cost,
                "qty": qty,
            })
            used_dtons += dt
            total_cost += cost

        elif "weapons" in section.lower():
            # Store PER-UNIT values (like lifeSupport)
            ship["weaponMounts"].append({
                "id": f"wpn-{len(ship['weaponMounts'])}",
                "name": module,
                "dtons": dt / qty if qty > 0 else dt,
                "cost": cost / qty if qty > 0 else cost,
                "qty": qty,
            })
            used_dtons += dt
            total_cost += cost

        elif "cargo" in section.lower():
            # Cargo is computed as the remainder after all other components.
            # For now, just note the Excel value; we'll recalculate later.
            ship["cargo"] = dt
            ship["components"].append({
                "section": "Cargo", "module": "Cargo Hold",
                "dtons": dt, "cost": 0, "qty": 1
            })
            # NOTE: Do NOT add cargo dt to used_dtons here.
            # Cargo is calculated last as the remaining hull space.

        elif "supplies" in section.lower():
            # Store PER-UNIT values (like lifeSupport)
            # Use raw qty (may be fractional); do NOT round to int
            raw_qty = comp.get("qty")
            try:
                supply_qty = float(raw_qty) if raw_qty is not None else 1
            except (ValueError, TypeError):
                supply_qty = 1
            ship["supplies"].append({
                "id": f"sup-{len(ship['supplies'])}",
                "name": module,
                "dtons": round(dt / supply_qty, 6) if supply_qty > 0 else dt,
                "cost": round(cost / supply_qty, 2) if supply_qty > 0 else cost,
                "qty": supply_qty,
            })
            total_cost += cost

        elif "modules" in section.lower() or "module" in section.lower():
            # Store PER-UNIT values (like lifeSupport)
            ship["modules"].append({
                "section": "Module", "module": module,
                "dtons": dt / qty if qty > 0 else dt,
                "cost": cost / qty if qty > 0 else cost,
                "qty": qty
            })
            used_dtons += dt
            total_cost += cost

        elif "vehicle" in section.lower():
            # Store vehicles/drones/small craft
            raw_qty = comp.get("qty")
            try:
                vehicle_qty = float(raw_qty) if raw_qty is not None else 1
            except (ValueError, TypeError):
                vehicle_qty = 1
            # Try to infer dtons from vehicle name if raw dtons is missing/0
            # Name-derived dtons is per-unit (e.g. "20DT Launch" = 20 DT each)
            raw_dt = comp.get("dtons")
            has_raw_dt = raw_dt is not None and raw_dt != 0
            if has_raw_dt:
                vehicle_dt = dt / vehicle_qty if vehicle_qty > 0 else dt
            else:
                m = re.search(r"(\d+)\s*DT", module, re.IGNORECASE)
                vehicle_dt = float(m.group(1)) if m else 0
            ship["vehicles"].append({
                "id": f"veh-{len(ship['vehicles'])}",
                "name": module,
                "dtons": round(vehicle_dt, 2),
                "cost": round(cost / vehicle_qty, 2) if vehicle_qty > 0 else cost,
                "qty": vehicle_qty,
            })
            # Vehicle bays count against hull ONLY if raw Excel dtons was negative
            raw_dt_val = comp.get("dtons")
            if raw_dt_val is not None and isinstance(raw_dt_val, (int, float)) and raw_dt_val < 0:
                used_dtons += abs(raw_dt_val)
            total_cost += cost

        elif "crew" in section.lower():
            ship["crew"].append({
                "position": module,
                "count": qty,
            })

    # Rename bay modules to include vehicle dtons (e.g. "Bay, Launch" → "20DT Launch Bay")
    if ship["vehicles"]:
        # Build lookup: normalized vehicle name → dtons
        vehicle_lookup = {}
        for v in ship["vehicles"]:
            vname = v["name"].lower()
            # Strip "DT" prefix if present (e.g. "20DT Launch" → "launch")
            vname_clean = re.sub(r"^\d+\s*dt\s*", "", vname).strip()
            vehicle_lookup[vname_clean] = v["dtons"]
            # Also store full name
            vehicle_lookup[vname] = v["dtons"]
        
        def normalize_name(name):
            """Normalize a name for fuzzy matching."""
            n = name.lower()
            n = re.sub(r"^bay,\s*", "", n)
            n = re.sub(r"^\d+\s*dt\s*", "", n)
            n = re.sub(r"[^a-z0-9]", "", n)
            n = n.rstrip("s")  # De-pluralize
            return n
        
        def rename_bay(item):
            module = item.get("module", "")
            if "bay" not in module.lower():
                return item
            # Try to match bay name to vehicle
            bay_norm = normalize_name(module)
            best_match = None
            best_score = 0
            for vname, vdt in vehicle_lookup.items():
                vnorm = normalize_name(vname)
                # Exact match or substring match
                if vnorm in bay_norm or bay_norm in vnorm:
                    score = len(vnorm)
                    if score > best_score:
                        best_score = score
                        best_match = (vname, vdt)
            # Manual fallback mappings
            if not best_match:
                fallback_map = {
                    "lifeboat": "launch",
                    "lifebo": "launch",
                }
                for bay_key, veh_key in fallback_map.items():
                    if bay_key in bay_norm:
                        for vname, vdt in vehicle_lookup.items():
                            if veh_key in normalize_name(vname):
                                best_match = (vname, vdt)
                                break
                        if best_match:
                            break
            if best_match:
                vname, vdt = best_match
                # Strip "Bay," prefix and rebuild
                clean_mod = re.sub(r"^bay,\s*", "", module, flags=re.IGNORECASE).strip()
                # Capitalize first letter
                clean_mod = clean_mod[0].upper() + clean_mod[1:] if clean_mod else ""
                new_name = f"{int(vdt)}DT {clean_mod} Bay"
                return {**item, "module": new_name}
            return item
        
        ship["components"] = [rename_bay(c) for c in ship["components"]]
        ship["modules"] = [rename_bay(m) for m in ship["modules"]]

    # Sort drives by order
    ship["drives"].sort(key=lambda d: d.get("order", 0))

    # Final hull fallback for ships with no HULL component
    if ship["hullDtons"] == 0:
        m = re.search(r"(\d+)\s*DT", ship["name"], re.IGNORECASE)
        if m:
            ship["hullDtons"] = int(m.group(1))
            ship["hullCode"] = str(ship["hullDtons"])
    if ship["hullDtons"] == 0:
        raw_tonnage = raw.get("tonnage", 0)
        if raw_tonnage > 0:
            ship["hullDtons"] = int(raw_tonnage)
            ship["hullCode"] = str(ship["hullDtons"])

    # ── Calculate Cargo & Available ──
    # Cargo is computed last as the remaining hull space after all other
    # components are accounted for. This matches standard ship design workflow.
    cargo = max(0, ship["hullDtons"] - used_dtons)
    ship["cargo"] = cargo

    # Update or add the cargo component
    cargo_comp_idx = None
    for i, c in enumerate(ship["components"]):
        if c["section"] == "Cargo":
            cargo_comp_idx = i
            break
    if cargo_comp_idx is not None:
        ship["components"][cargo_comp_idx]["dtons"] = cargo
    else:
        ship["components"].append({
            "section": "Cargo", "module": "Cargo Hold",
            "dtons": cargo, "cost": 0, "qty": 1
        })

    # ── Normalize components: qty should be 1 since dtons/cost are totals ──
    # This prevents consumers from accidentally doing dtons * qty.
    # The module name already includes counts where relevant.
    for c in ship["components"]:
        if c.get("qty", 1) > 1:
            # For fuel, prepend qty to module name for display
            if c["section"] == "Drives and Power" and c["module"] == "Fuel Tanks":
                c["module"] = f"{int(c['qty'])}× Fuel Tanks"
            c["qty"] = 1

    # Calculate totals
    ship["totalCost"] = total_cost
    ship["availableDtons"] = ship["hullDtons"] - used_dtons - cargo

    # Derive TL from components if not set
    if ship["tl"] == 9 and raw.get("components"):
        for comp in raw["components"]:
            tl = parse_tl(comp.get("tl"))
            if tl > ship["tl"]:
                ship["tl"] = tl

    # Assign tags
    ship["tags"] = assign_tags(ship)

    return ship

def main():
    print(f"Reading {SRC}...")
    with open(SRC) as f:
        raw_ships = json.load(f)

    print(f"Found {len(raw_ships)} raw entries")

    ships = []
    skipped = []
    for raw in raw_ships:
        name = raw.get("name", "").strip()
        # Skip vehicle entries
        if name.upper().startswith("VEHICLES"):
            skipped.append(name)
            continue
        # Skip ships with no actual component data (description-only entries)
        has_real_components = any(
            str(c.get("section", "")).strip().upper() in [
                "HULL", "HULL ARMOR:", "HULL CONFIGURATION", "M-DRIVE TL9+", 
                "J-DRIVE TL9+", "FUSION PLANT", "FUEL TANKS", "CONTROLS",
                "COMPUTER", "SENSORS", "WEAPONS", "LIFE SUPPORT", "CARGO"
            ]
            for c in raw.get("components", [])
        )
        if not has_real_components:
            skipped.append(name)
            continue

        ship = process_ship(raw)
        ships.append(ship)

    print(f"Converted {len(ships)} ships")
    print(f"Skipped {len(skipped)} entries: {', '.join(skipped[:5])}{'...' if len(skipped) > 5 else ''}")

    # Write output
    with open(OUT, "w") as f:
        json.dump(ships, f, indent=2)

    print(f"Wrote {OUT}")

    # Validation report
    print("\n=== VALIDATION REPORT ===")
    issues = []
    for ship in ships:
        if ship["hullDtons"] <= 0:
            issues.append(f"{ship['name']}: No hull tonnage")
        if ship["availableDtons"] < 0:
            issues.append(f"{ship['name']}: Over tonnage by {abs(ship['availableDtons']):.1f} DT")
        if not ship["mDrive"] and not ship["jDrive"] and not any(d["type"] == "thrust" for d in ship["drives"]):
            issues.append(f"{ship['name']}: No drives")

    if issues:
        for issue in issues:
            print(f"  ⚠️  {issue}")
    else:
        print("  ✅ All ships pass basic validation")

if __name__ == "__main__":
    main()
