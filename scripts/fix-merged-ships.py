#!/usr/bin/env python3
"""
Fix merged ship data in all_ships_complete.json

Root cause: The upstream extraction script failed to detect ship boundaries,
causing each ship record to contain components from subsequent ships.

Fix: Truncate each ship's component list at the SECOND HULL section.
"""

import json
from pathlib import Path

REPO = Path(__file__).parent.parent
INPUT = REPO / "all_ships_complete.json"
OUTPUT = REPO / "all_ships_complete_fixed.json"

def find_hull_indices(components):
    """Return list of indices where section == 'HULL' (case-insensitive exact match)."""
    indices = []
    for i, c in enumerate(components):
        section = (c.get("section") or "").strip().upper()
        if section == "HULL":
            indices.append(i)
    return indices

def main():
    with open(INPUT) as f:
        ships = json.load(f)

    fixed_ships = []
    merge_count = 0
    discard_count = 0

    for ship in ships:
        comps = ship.get("components", [])
        hull_indices = find_hull_indices(comps)

        if len(hull_indices) >= 2:
            merge_count += 1
            second_hull_idx = hull_indices[1]
            kept = comps[:second_hull_idx]
            discarded = len(comps) - second_hull_idx
            discard_count += discarded

            print(f"  🔧 {ship['name']}: {len(comps)} → {len(kept)} components (-{discarded})")
            ship["components"] = kept
            fixed_ships.append(ship)
        else:
            fixed_ships.append(ship)

    with open(OUTPUT, "w") as f:
        json.dump(fixed_ships, f, indent=2)

    print(f"\n{'='*60}")
    print(f"Fixed {merge_count} merged ships")
    print(f"Discarded {discard_count} overflow components")
    print(f"Wrote {len(fixed_ships)} ships to {OUTPUT}")

if __name__ == "__main__":
    main()
