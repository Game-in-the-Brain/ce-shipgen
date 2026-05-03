# Ship Token to Library Mapping

## Token Inventory: 63 PNGs + 1 PSD

**Location:** `/home/justin/opencode260220/ce-shipgen/240110_Ship_Tokens/`

**Token specs:** 900×900px, transparent PNG, top-down view with DTon label on right edge

---

## Mapped Tokens → Library Ships

### ✅ FRONTIER TRADER (300 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Frontier Trader.png` | **#21** TL9 FRONTIER TRADER 300DT | Single token, 300 DTon label visible |

---

### ✅ MERCHANT LINER (300 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Merchant Liner A.png` | **#20** TL9 MERCHANT LINER 300DT | 7 variants (A, B, C, D, D1, D2, Original) |
| `Merchant Liner B.png` | **#20** TL9 MERCHANT LINER 300DT | Different paint schemes |
| `Merchant Liner C.png` | **#20** TL9 MERCHANT LINER 300DT | Could also map to #1 (1,000DT Passenger Liner) |
| `Merchant Liner D.png` | **#20** TL9 MERCHANT LINER 300DT | if scaled |
| `Merchant Liner D1.png` | **#20** TL9 MERCHANT LINER 300DT | |
| `Merchant Liner D2.png` | **#20** TL9 MERCHANT LINER 300DT | |
| `Merchant Liner Original.png` | **#20** TL9 MERCHANT LINER 300DT | Base design |

---

### ✅ BOAT (10–95 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Boat A-E.png` | **#5** TL9 BOAT 10DT | 5 paint variants |
| | **#7** TL9 BOAT 20DT | |
| | **#8** TL9 SHIP's BOAT 30DT | |
| | **#9** TL9 SHIP's BOAT 50DT | |
| | **#10** TL9 SHIP's BOAT 70DT | |
| | **#12** TL9 SHIP's BOAT 95DT | |

**Note:** Token DTon label not visible in sample, but boat silhouette matches small craft.

---

### ✅ COURIER (100 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Courier A-E.png` | **#13** TL9 COURIER SHIP 100DT | 5 paint variants |
| | **#35** TL9 TENDER 100DT | Same hull class |
| | **#36** TL9 YACHT 100DT | |

---

### ✅ ESCORT FRIGATE (400 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Escort Frigate A-E.png` | **#32** TL9 ESCORT FRIGATE 400DT | 5 paint variants, 400 DTon label |

---

### ✅ FIGHTERS (10 DTons)
Three token sets for fighter-class ships:

| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 FIghter A-E.png` | **#2** TL9 FIGHTER 10DT (1BL, 2M) | 5 paint variants |
| | **#3** TL9 ESCORT FIGHTER 10DT (1BL, 2SC) | |
| | **#4** TL9 FIGHTER 10DT (3M) | |
| `Ship Tokens 2 Light Fighter A-E.png` | **#2**–**#4** 10DT Fighters | 5 paint variants, 10 DTon label |
| `Ship Tokens 2 Small FIghter A-E.png` | **#2**–**#4** 10DT Fighters | 5 paint variants, 10 DTon label |

**Note:** 15 fighter tokens total for 3 fighter ship types. Use any variant for any fighter.

---

### ✅ MERCHANT (200 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Merchant A-E.png` | **#17** TL9 MERCHANT TRADER 200DT | 5 paint variants |

---

### ✅ MERCHANT FREIGHTER (400 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Merchant Freighter A-E.png` | **#28** TL9 MERCHANT FREIGHTER 400DT | 5 paint variants |
| | **#29** TL9 "BOSCO" MERCHANT FREIGHTER 400DT | |

---

### ✅ MISSILE FRIGATE (400 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Missile Frigate A-E.png` | **#31** TL9 MISSILE FRIGATE 400DT | 5 paint variants, 400 DTon label |

---

### ✅ RAIDER (600 DTons)
| Token File | Maps To | Notes |
|------------|---------|-------|
| `Ship Tokens 2 Raider A-E.png` | **#34** TL9 RAIDER 600DT | 5 paint variants, 600 DTon label |

---

## Ships WITHOUT Matching Tokens (18 ships)

These library ships have no corresponding token art:

| # | Ship Name | DTons | Possible Substitution |
|---|-----------|-------|----------------------|
| 1 | TL9 PASSENGER LINER | 1,000 | Merchant Liner (scaled) |
| 6 | TL9 MEDIUM FIGHTER | 20 | Fighter token (closest) |
| 11 | TL9 SHUTTLE | 90 | Boat token (closest) |
| 14 | TL9 YACHT | 100 | Courier token |
| 15 | TL9 Research Vessel | 200 | Merchant token |
| 16 | TL9 ASTEROID MINER | 200 | Merchant token |
| 18 | TL9 SURVEY VESSEL | 200 | Merchant token |
| 19 | TL9 PASSENGER SHIP | 200 | Merchant token |
| 22 | TL9 TENDER | 300 | Frontier Trader or Merchant Liner |
| 23 | TL9 HABITAT RING | 300 | Merchant Liner |
| 24 | TL9 PATROL FRIGATE | 300 | Escort Frigate (scaled) |
| 25 | TL9 CORVETTE | 300 | Escort Frigate (scaled) |
| 26 | TL9 EXPLORATION VESSEL | 300 | Frontier Trader |
| 27 | TL9 FRONTIER PASSENGER | 300 | Merchant Liner |
| 30 | TL9 SYSTEM DEFENSE BOAT | 400 | Missile Frigate or Escort Frigate |
| 33 | TL9 PASSENGER | 400 | Merchant Freighter |
| 37-40 | Duplicate entries | various | See primary entries above |

---

## Token Usage Strategy

### For Encounter Mode:
1. **Primary mapping:** Use exact matches (Raider → Raider token, etc.)
2. **Substitution:** For ships without tokens, use closest DTon/class match
3. **Variants:** A-E suffixes = paint schemes. Randomly assign or let user pick.

### For Ship Library Display:
- Show token preview when available
- Grey placeholder for ships without tokens
- Allow token override/selection per ship

### File Naming Convention:
```
240110_Ship_Tokens/
├── Frontier Trader.png              # 300DT
├── Merchant Liner [A-D2, Original]  # 300DT
└── Ship Tokens 2/
    ├── Boat [A-E]                   # Small craft
    ├── Courier [A-E]                # 100DT
    ├── Escort Frigate [A-E]         # 400DT
    ├── FIghter [A-E]                # 10DT
    ├── Light Fighter [A-E]          # 10DT
    ├── Small FIghter [A-E]          # 10DT
    ├── Merchant [A-E]               # 200DT
    ├── Merchant Freighter [A-E]     # 400DT
    ├── Missile Frigate [A-E]        # 400DT
    └── Raider [A-E]                 # 600DT
```

---

## Token Metadata (from visual inspection)

| Property | Value |
|----------|-------|
| Resolution | 900×900px |
| Format | PNG with alpha transparency |
| Orientation | Top-down (dorsal view) |
| DTon label | Vertical text on right edge |
| Engine glow | Blue thruster effects at stern |
| Style | Isometric pixel-art / vector hybrid |
| Color coding | Military = grey/dark, Civilian = tan/red, Pirate = green/purple |
