#!/usr/bin/env python3
"""
Build the 6 empty ships from CE SRD Chapter 8 formulas.
These ships had no extractable component data from the Excel.
"""
import json
import re
from pathlib import Path

REPO = Path(__file__).parent.parent
INPUT = REPO / "public" / "data" / "all_ships.json"
OUTPUT = REPO / "public" / "data" / "all_ships.json"


def make_id(name: str) -> str:
    return f"srd-{re.sub(r'[^a-z0-9]', '-', name.lower()).strip('-')}"


def build_ship(name, hull_dtons, tl, config, armor_pct, armor_type,
               m_drive, j_drive, power_plant, bridge_tons, bridge_cost,
               computer, software_list, sensors, sensor_dt, sensor_cost,
               staterooms, low_berths, luxuries, labs, workshops, library,
               fuel_tons, modules, weapons, cargo, supplies, vehicles):
    """Assemble a ShipDesign dict from CE RAW components."""

    hull_code = str(hull_dtons)
    hull_cost = {100: 2.0, 200: 8.0, 300: 12.0}.get(hull_dtons, hull_dtons * 0.04)
    config_modifier = {"Distributed": 0.9, "Standard": 1.0, "Streamlined": 1.1}.get(config, 1.0)
    config_cost = hull_cost * (config_modifier - 1.0)

    armor_dt = hull_dtons * (armor_pct / 100)
    armor_cost = hull_cost * (armor_pct / 100) * {"Titanium Steel": 0.05, "Crystaliron": 0.20, "Bonded Superdense": 0.50}.get(armor_type, 0.05)

    components = []
    drives = []
    command_control = []
    computers = []
    softwareList = []
    sensorList = []
    lifeSupport = []
    weaponMounts = []
    supplyList = []
    total_cost = 0.0
    used_dtons = 0.0
    drive_order = 0

    # ── HULL ──
    components.append({"section": "Hull", "module": f"{hull_dtons} DT Hull", "dtons": 0, "cost": hull_cost})
    total_cost += hull_cost

    # ── CONFIG ──
    if config_cost != 0:
        components.append({"section": "Config", "module": config, "dtons": 0, "cost": round(config_cost, 2)})
        total_cost += config_cost

    # ── ARMOR ──
    if armor_dt > 0:
        components.append({"section": "Armor", "module": f"{armor_type} TL7+", "dtons": armor_dt, "cost": round(armor_cost, 3), "qty": int(armor_pct / 5)})
        total_cost += armor_cost
        used_dtons += armor_dt

    # ── DRIVES ──
    # M-Drive
    m_drive_data = {
        "A": (2, 4), "B": (3, 8), "C": (5, 12), "D": (7, 16), "E": (9, 20), "F": (11, 24),
        "G": (13, 28), "H": (15, 32), "J": (17, 36), "K": (19, 40), "L": (21, 44),
        "sA": (0.5, 1), "sB": (1, 2), "sC": (1.5, 3), "sD": (2, 3.5), "sE": (2.5, 4),
        "sF": (3, 6), "sG": (3.5, 8), "sH": (4, 9), "sJ": (4.5, 10), "sK": (5, 11),
        "sL": (6, 12), "sM": (7, 14), "sN": (8, 16),
    }
    if m_drive:
        md_dt, md_cost = m_drive_data.get(m_drive, (0, 0))
        drive_order += 1
        drives.append({
            "id": f"mdrive-{m_drive.lower()}", "name": f"M-Drive {m_drive}",
            "type": "thrust", "driveCode": m_drive, "dtons": md_dt, "cost": md_cost,
            "qty": 1, "performance": 0, "tl": tl, "order": drive_order,
        })
        components.append({"section": "M-Drive", "module": f"M-Drive {m_drive}", "dtons": md_dt, "cost": md_cost, "qty": 1})
        total_cost += md_cost
        used_dtons += md_dt

    # J-Drive
    j_drive_data = {
        "A": (10, 10), "B": (15, 20), "C": (20, 30), "D": (25, 40), "E": (30, 50),
        "F": (35, 60), "G": (40, 70), "H": (45, 80), "J": (50, 90),
    }
    if j_drive:
        jd_dt, jd_cost = j_drive_data.get(j_drive, (0, 0))
        jump = ord(j_drive) - ord("A") + 1
        drive_order += 1
        drives.append({
            "id": f"jdrive-{j_drive.lower()}", "name": f"J-Drive {j_drive}",
            "type": "jump", "driveCode": j_drive, "dtons": jd_dt, "cost": jd_cost,
            "qty": 1, "performance": jump, "tl": tl, "order": drive_order,
        })
        components.append({"section": "J-Drive", "module": f"J-Drive {j_drive}", "dtons": jd_dt, "cost": jd_cost, "qty": 1})
        total_cost += jd_cost
        used_dtons += jd_dt

    # Power Plant
    pp_data = {
        "A": (4, 8), "B": (7, 16), "C": (10, 24), "D": (13, 32), "E": (16, 40),
        "F": (19, 48), "G": (22, 56), "H": (25, 64), "J": (28, 72),
        "sA": (1.2, 3), "sB": (1.5, 3.5), "sC": (1.8, 4), "sD": (2.1, 4.5),
        "sE": (2.4, 5), "sF": (2.7, 5.5), "sG": (3.0, 6), "sH": (3.3, 6.5),
        "sJ": (3.6, 7), "sK": (3.9, 7.5), "sL": (4.5, 8), "sM": (5.1, 9),
        "sN": (5.7, 10),
    }
    if power_plant:
        pp_dt, pp_cost = pp_data.get(power_plant, (0, 0))
        drive_order += 1
        drives.append({
            "id": f"pp-{power_plant.lower()}", "name": f"Fusion Plant {power_plant}",
            "type": "powerPlant", "driveCode": power_plant, "dtons": pp_dt, "cost": pp_cost,
            "qty": 1, "performance": 0, "tl": tl, "order": drive_order,
        })
        components.append({"section": "Power Plant", "module": f"Fusion Plant {power_plant}", "dtons": pp_dt, "cost": pp_cost, "qty": 1})
        total_cost += pp_cost
        used_dtons += pp_dt

    # ── FUEL ──
    if fuel_tons > 0:
        components.append({"section": "Fuel", "module": "Fuel Tanks", "dtons": fuel_tons, "cost": 0, "qty": fuel_tons})
        used_dtons += fuel_tons

    # ── BRIDGE ──
    if bridge_tons > 0:
        ctrl_type = "cockpit" if bridge_tons <= 6 else "bridge"
        stations = 2
        command_control.append({
            "id": f"cmd-{bridge_tons}-ton-bridge", "name": f"{bridge_tons}-ton Bridge",
            "type": ctrl_type, "dtons": bridge_tons, "cost": bridge_cost,
            "qty": 1, "stations": stations, "tl": tl,
        })
        components.append({"section": "Command", "module": f"{bridge_tons}-ton Bridge", "dtons": bridge_tons, "cost": bridge_cost, "qty": 1})
        total_cost += bridge_cost
        used_dtons += bridge_tons

    # ── COMPUTER ──
    if computer:
        rating = 5
        if "R" in computer:
            m = re.search(r"R(\d+)", computer)
            if m:
                rating = int(m.group(1))
        options = []
        if "Hardened" in computer:
            options.append("Hardened")
        if "J-Spec" in computer:
            options.append("J-Spec")
        comp_dt = 1
        comp_cost = {"M1": 0.03, "M2": 0.16}.get(computer.split(",")[0].strip(), 0.03)
        if "Hardened" in computer:
            comp_cost *= 1.5
        if "J-Spec" in computer:
            comp_cost *= 1.5
        computers.append({
            "id": f"computer-{computer.lower().replace(' ', '-').replace('/', '')}",
            "name": computer, "model": computer, "dtons": comp_dt,
            "cost": round(comp_cost, 3), "qty": 1, "rating": rating,
            "slots": 1, "options": options, "tl": tl,
        })
        components.append({"section": "Computer", "module": computer, "dtons": comp_dt, "cost": round(comp_cost, 3), "qty": 1})
        total_cost += comp_cost
        used_dtons += comp_dt

    # ── SOFTWARE ──
    for prog in software_list:
        sw_cost = 0.0
        if "Jump Control" in prog:
            sw_cost = 0.1
        elif "Database" in prog:
            sw_cost = 0.01
        elif "Library" in prog:
            sw_cost = 0.0
        softwareList.append({
            "id": f"sw-{prog.lower().replace(' ', '-').replace('/', '')}",
            "name": prog, "program": prog, "dtons": 0,
            "cost": sw_cost, "qty": 1, "rating": 0, "active": True, "tl": tl,
        })
        if sw_cost > 0:
            components.append({"section": "Software", "module": prog, "dtons": 0, "cost": sw_cost, "qty": 1})
            total_cost += sw_cost

    # ── SENSORS ──
    if sensors:
        sensorList.append({
            "id": f"sensor-{sensors.lower().replace(' ', '-')}",
            "name": sensors, "sensorType": sensors.replace(" Sensors", "").replace(" Sensor", ""),
            "dtons": sensor_dt, "cost": sensor_cost, "qty": 1, "tl": tl,
        })
        components.append({"section": "Sensors", "module": sensors, "dtons": sensor_dt, "cost": sensor_cost, "qty": 1})
        total_cost += sensor_cost
        used_dtons += sensor_dt

    # ── LIFE SUPPORT ──
    if staterooms > 0:
        ls_dt = staterooms * 4
        ls_cost = staterooms * 0.5
        lifeSupport.append({
            "id": "ls-stateroom", "name": "Stateroom", "facilityType": "Stateroom",
            "dtons": ls_dt, "cost": ls_cost, "qty": staterooms, "capacity": 2, "tl": tl,
        })
        components.append({"section": "Life Support", "module": f"{staterooms} Stateroom", "dtons": ls_dt, "cost": ls_cost, "qty": staterooms})
        total_cost += ls_cost
        used_dtons += ls_dt

    if low_berths > 0:
        lb_dt = low_berths * 0.5
        lb_cost = low_berths * 0.05
        lifeSupport.append({
            "id": "ls-low-berth", "name": "Low Berth", "facilityType": "Low Berth",
            "dtons": lb_dt, "cost": lb_cost, "qty": low_berths, "capacity": 1, "tl": tl,
        })
        components.append({"section": "Life Support", "module": f"{low_berths} Low Berth", "dtons": lb_dt, "cost": lb_cost, "qty": low_berths})
        total_cost += lb_cost
        used_dtons += lb_dt

    if luxuries > 0:
        lux_dt = luxuries
        lux_cost = luxuries * 0.1
        lifeSupport.append({
            "id": "ls-luxuries", "name": "Luxuries", "facilityType": "Luxuries",
            "dtons": lux_dt, "cost": lux_cost, "qty": luxuries, "capacity": 0, "tl": tl,
        })
        components.append({"section": "Life Support", "module": f"{luxuries} Luxuries", "dtons": lux_dt, "cost": lux_cost, "qty": luxuries})
        total_cost += lux_cost
        used_dtons += lux_dt

    if labs > 0:
        lab_dt = labs * 4
        lab_cost = labs * 1.0
        lifeSupport.append({
            "id": "ls-laboratory", "name": "Laboratory", "facilityType": "Laboratory",
            "dtons": lab_dt, "cost": lab_cost, "qty": labs, "capacity": 0, "tl": tl,
        })
        components.append({"section": "Life Support", "module": f"{labs} Laboratory", "dtons": lab_dt, "cost": lab_cost, "qty": labs})
        total_cost += lab_cost
        used_dtons += lab_dt

    if workshops > 0:
        ws_dt = workshops * 8
        ws_cost = workshops * 0.5
        lifeSupport.append({
            "id": "ls-workshop", "name": "Workshop", "facilityType": "Workshop",
            "dtons": ws_dt, "cost": ws_cost, "qty": workshops, "capacity": 0, "tl": tl,
        })
        components.append({"section": "Life Support", "module": f"{workshops} Workshop", "dtons": ws_dt, "cost": ws_cost, "qty": workshops})
        total_cost += ws_cost
        used_dtons += ws_dt

    if library > 0:
        lib_dt = 4
        lib_cost = 4.0
        lifeSupport.append({
            "id": "ls-library", "name": "Library", "facilityType": "Library",
            "dtons": lib_dt, "cost": lib_cost, "qty": 1, "capacity": 0, "tl": tl,
        })
        components.append({"section": "Life Support", "module": "Library", "dtons": lib_dt, "cost": lib_cost, "qty": 1})
        total_cost += lib_cost
        used_dtons += lib_dt

    # ── MODULES ──
    for mod in modules:
        mod_name = mod["name"]
        mod_dt = mod.get("dtons", 0)
        mod_cost = mod.get("cost", 0)
        components.append({"section": "Module", "module": mod_name, "dtons": mod_dt, "cost": mod_cost, "qty": 1})
        total_cost += mod_cost
        used_dtons += mod_dt

    # ── WEAPONS ──
    for w in weapons:
        w_name = w["name"]
        w_dt = w.get("dtons", 0)
        w_cost = w.get("cost", 0)
        w_qty = w.get("qty", 1)
        w_type = w.get("type", "hardpoint")
        w_max = w.get("maxWeapons", 1)
        weaponMounts.append({
            "id": f"wm-{w_name.lower().replace(' ', '-').replace(',', '')}",
            "name": w_name, "mountType": w_type, "dtons": w_dt,
            "cost": w_cost, "qty": w_qty, "maxWeapons": w_max,
            "weapons": [], "slots": 0,
        })
        components.append({"section": "Weapon", "module": w_name, "dtons": w_dt, "cost": w_cost, "qty": w_qty})
        total_cost += w_cost * w_qty
        used_dtons += w_dt

    # ── VEHICLES (placeholder — bays empty until craft designs fixed) ──
    for v in vehicles:
        v_name = v["name"]
        v_dt = v.get("dtons", 0)
        v_cost = v.get("cost", 0)
        components.append({"section": "VEHICLES", "module": v_name, "dtons": v_dt, "cost": v_cost, "qty": 1})
        # Don't count vehicle tonnage against hull — they go in bays/hangars

    # ── CARGO ──
    if cargo > 0:
        components.append({"section": "Cargo", "module": "Cargo Hold", "dtons": cargo, "cost": 0, "qty": 1})

    # ── SUPPLIES (stored in cargo, don't count against hull) ──
    for sup in supplies:
        sup_name = sup["name"]
        sup_dt = sup.get("dtons", 0)
        sup_cost = sup.get("cost", 0)
        sup_qty = sup.get("qty", 1)
        supplyList.append({
            "id": f"sup-{sup_name.lower().replace(' ', '-').replace(',', '')}",
            "name": sup_name, "dtons": sup_dt, "cost": sup_cost, "qty": sup_qty, "tl": tl,
        })
        components.append({
            "section": "Supplies", "module": sup_name, "dtons": sup_dt,
            "cost": sup_cost, "qty": sup_qty, "notes": "Stored in cargo space",
        })
        total_cost += sup_cost

    available = max(0, hull_dtons - used_dtons)

    return {
        "id": make_id(name),
        "name": name,
        "tl": tl,
        "hullCode": hull_code,
        "hullDtons": hull_dtons,
        "configuration": config,
        "armor": armor_type if armor_pct > 0 else "None",
        "armorQty": int(armor_pct / 5) if armor_pct > 0 else 0,
        "mDrive": m_drive or "",
        "jDrive": j_drive or "",
        "powerPlant": power_plant or "",
        "bridge": f"{bridge_tons}-ton Bridge" if bridge_tons > 0 else "",
        "computer": computer or "",
        "software": software_list,
        "sensors": sensors or "",
        "staterooms": staterooms,
        "lowBerths": low_berths,
        "crew": [],
        "modules": [{"section": "Module", "module": m["name"], "dtons": m.get("dtons", 0), "cost": m.get("cost", 0), "qty": 1} for m in modules],
        "weapons": [],
        "cargo": cargo,
        "components": components,
        "totalCost": int(total_cost * 1_000_000),
        "availableDtons": available,
        "createdAt": "2026-05-02T12:00:00.000Z",
        "drives": drives,
        "commandControl": command_control,
        "computers": computers,
        "softwareList": softwareList,
        "sensorList": sensorList,
        "lifeSupport": lifeSupport,
        "weaponMounts": weaponMounts,
        "supplies": supplyList,
    }


def main():
    with open(INPUT) as f:
        ships = json.load(f)

    # Remove the empty SRD-placeholder ships if they exist
    ships = [s for s in ships if s.get("totalCost", 0) > 0 or s["hullDtons"] <= 10]

    new_ships = []

    # ── 1. TL9 TENDER 100DT ──
    # M-Drive B (max hull 400) → tender capacity = 400 - 100 = 300 DT
    # J-Drive A (max hull 200) → jump tender capacity = 200 - 100 = 100 DT
    # Designed to push 300 DT of craft/cargo in normal space.
    tender_100 = build_ship(
        name="TL9 TENDER 100DT (B-M DRIVE, A-JDRIVE)",
        hull_dtons=100, tl=9, config="Streamlined", armor_pct=5, armor_type="Titanium Steel",
        m_drive="B", j_drive="A", power_plant="B",
        bridge_tons=10, bridge_cost=0.5,
        computer="M1, R5", software_list=["Database TL 7", "Jump Control/1"],
        sensors="Basic Civilian TL 9", sensor_dt=1, sensor_cost=0.05,
        staterooms=2, low_berths=0, luxuries=0, labs=0, workshops=1, library=0,
        fuel_tons=14,  # jump 10 + power 4
        modules=[
            {"name": "Fuel Scoops", "dtons": 0, "cost": 1.0},
            {"name": "Fuel Processors", "dtons": 1, "cost": 0.05},
        ],
        weapons=[{"name": "Turret, Single", "dtons": 1, "cost": 0.2, "qty": 1, "type": "turret", "maxWeapons": 1}],
        cargo=31,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 1, "cost": 0.054, "qty": 1},
            {"name": "Repair Supplies", "dtons": 1, "cost": 0.01, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(tender_100)

    # ── 2. TL9 YACHT 100DT ──
    # Luxury vessel for wealthy patrons. Fast, comfortable, limited range.
    yacht_100 = build_ship(
        name="TL9 YACHT 100DT",
        hull_dtons=100, tl=9, config="Streamlined", armor_pct=5, armor_type="Titanium Steel",
        m_drive="A", j_drive="A", power_plant="A",
        bridge_tons=10, bridge_cost=0.5,
        computer="M2, R10 Hardened", software_list=["Database TL 7", "Library"],
        sensors="Basic Civilian TL 9", sensor_dt=1, sensor_cost=0.05,
        staterooms=4, low_berths=2, luxuries=4, labs=0, workshops=0, library=1,
        fuel_tons=12,  # jump 10 + power 2
        modules=[{"name": "Fuel Scoops", "dtons": 0, "cost": 1.0}],
        weapons=[],
        cargo=20,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 1, "cost": 0.054, "qty": 1},
            {"name": "Repair Supplies", "dtons": 1, "cost": 0.01, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(yacht_100)

    # ── 3. TL9 RESEARCH VESSEL 200DT ──
    # Scientific exploration ship with labs, advanced sensors, probe drones.
    research_200 = build_ship(
        name="TL9 RESEARCH VESSEL 200DT",
        hull_dtons=200, tl=9, config="Streamlined", armor_pct=5, armor_type="Titanium Steel",
        m_drive="B", j_drive="B", power_plant="B",
        bridge_tons=10, bridge_cost=1.0,
        computer="M2, R10 Hardened", software_list=["Database TL 7", "Library", "Jump Control/1"],
        sensors="Advanced", sensor_dt=3, sensor_cost=2.0,
        staterooms=6, low_berths=2, luxuries=0, labs=3, workshops=0, library=1,
        fuel_tons=28,  # jump 20 + power 8
        modules=[
            {"name": "Fuel Scoops", "dtons": 0, "cost": 1.0},
            {"name": "Fuel Processors", "dtons": 1, "cost": 0.05},
            {"name": "Probe Drones", "dtons": 2, "cost": 0.4},
        ],
        weapons=[{"name": "Turret, Single", "dtons": 1, "cost": 0.2, "qty": 1, "type": "turret", "maxWeapons": 1}],
        cargo=58,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 2, "cost": 0.108, "qty": 1},
            {"name": "Repair Supplies", "dtons": 2, "cost": 0.02, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(research_200)

    # ── 4. TL9 ASTEROID MINER 200DT ──
    # M-Drive F rated for 600 DT max → can push 400 DT of asteroid (600 - 200 = 400)
    miner_200 = build_ship(
        name="TL9 ASTEROID MINER 200DT (able to move 400DT)",
        hull_dtons=200, tl=9, config="Standard", armor_pct=5, armor_type="Titanium Steel",
        m_drive="F", j_drive="", power_plant="F",
        bridge_tons=10, bridge_cost=1.0,
        computer="M1, R5", software_list=["Database TL 7"],
        sensors="Basic Civilian TL 9", sensor_dt=1, sensor_cost=0.05,
        staterooms=4, low_berths=4, luxuries=0, labs=0, workshops=1, library=0,
        fuel_tons=24,  # power plant F = 6/week × 4 weeks
        modules=[
            {"name": "Fuel Scoops", "dtons": 0, "cost": 1.0},
            {"name": "Fuel Processors", "dtons": 2, "cost": 0.1},
            {"name": "Mining Drones", "dtons": 10, "cost": 2.0},
        ],
        weapons=[{"name": "Turret, Single", "dtons": 1, "cost": 0.2, "qty": 1, "type": "turret", "maxWeapons": 1}],
        cargo=62,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 2, "cost": 0.108, "qty": 1},
            {"name": "Repair Supplies", "dtons": 2, "cost": 0.02, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(miner_200)

    # ── 5. TL9 HABITAT RING 200DT ──
    # Distributed station with lots of living space. Minimal propulsion.
    habitat_200 = build_ship(
        name="TL9 HABITAT RING 200DT",
        hull_dtons=200, tl=9, config="Distributed", armor_pct=5, armor_type="Titanium Steel",
        m_drive="A", j_drive="", power_plant="A",
        bridge_tons=10, bridge_cost=1.0,
        computer="M1, R5", software_list=["Database TL 7"],
        sensors="Standard", sensor_dt=0, sensor_cost=0,
        staterooms=20, low_berths=10, luxuries=5, labs=2, workshops=1, library=1,
        fuel_tons=4,  # power plant A = 1/week × 4 weeks
        modules=[
            {"name": "Fuel Scoops", "dtons": 0, "cost": 1.0},
        ],
        weapons=[],
        cargo=8,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 4, "cost": 0.216, "qty": 1},
            {"name": "Repair Supplies", "dtons": 2, "cost": 0.02, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(habitat_200)

    # ── 6. TL9 SURVEY VESSEL 300DT ──
    # Planetary and system survey ship with advanced sensors, probe drones, ATV.
    survey_300 = build_ship(
        name="TL9 SURVEY VESSEL 300DT",
        hull_dtons=300, tl=9, config="Streamlined", armor_pct=5, armor_type="Titanium Steel",
        m_drive="C", j_drive="C", power_plant="C",
        bridge_tons=20, bridge_cost=1.5,
        computer="M2, R10 Hardened", software_list=["Database TL 7", "Library", "Jump Control/2"],
        sensors="Advanced", sensor_dt=3, sensor_cost=2.0,
        staterooms=8, low_berths=4, luxuries=0, labs=2, workshops=0, library=1,
        fuel_tons=72,  # jump 60 + power 12
        modules=[
            {"name": "Fuel Scoops", "dtons": 0, "cost": 1.0},
            {"name": "Fuel Processors", "dtons": 2, "cost": 0.1},
            {"name": "Probe Drones", "dtons": 2, "cost": 0.4},
        ],
        weapons=[{"name": "Turret, Single", "dtons": 1, "cost": 0.2, "qty": 1, "type": "turret", "maxWeapons": 1}],
        cargo=76,
        supplies=[
            {"name": "Regular Life Support Supplies", "dtons": 2, "cost": 0.108, "qty": 1},
            {"name": "Repair Supplies", "dtons": 2, "cost": 0.02, "qty": 1},
        ],
        vehicles=[]
    )
    new_ships.append(survey_300)

    # Merge and deduplicate by id
    existing_ids = {s["id"] for s in ships}
    for ns in new_ships:
        if ns["id"] in existing_ids:
            # Replace existing empty ship
            ships = [s for s in ships if s["id"] != ns["id"]]
        ships.append(ns)
        print(f"  ✅ Built {ns['name']} ({ns['hullDtons']} DT, {len(ns['components'])} components, MCr{ns['totalCost']/1e6:.2f})")

    with open(OUTPUT, "w") as f:
        json.dump(ships, f, indent=2)

    print(f"\nWrote {len(ships)} ships to {OUTPUT}")


if __name__ == "__main__":
    main()
