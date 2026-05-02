# Ship Specification Docx Export — Approved Layout v1.0

> **Status:** APPROVED — This document reflects the finalized 4-page datasheet design.
> **Source:** Stitch design recommendation, approved by user.
> **Application:** CE ShipGen v0.04

---

## 1. Design Aesthetic — "Aero-Spec"

A military/aerospace vessel datasheet — authoritative, information-dense, and visually striking. The design translates the app's retro-futuristic terminal aesthetic into a clean white-paper format.

### 1.1 Page Format

| Property | Value |
|---|---|
| **Page Size** | US Letter (8.5" × 11") |
| **Margins** | Narrow — 0.5" (12.7mm) all sides |
| **Background** | Pure white `#FFFFFF` |
| **Orientation** | Portrait |

### 1.2 Typography

| Role | Font | Weight | Size | Case | Tracking |
|---|---|---|---|---|---|
| Ship Name / Page Title | **VT323** | Regular | 24–28pt | UPPERCASE | 0.12em |
| Section Headers | **VT323** | Regular | 14–16pt | UPPERCASE | 0.14em |
| Sub-headers / Labels | **JetBrains Mono** | Bold | 10–11pt | UPPERCASE | 0.10em |
| Body Text | **JetBrains Mono** | Regular | 9–10pt | Normal | Normal |
| Table Data | **JetBrains Mono** | Regular | 9pt | Normal | Normal |
| Numerical Data | **JetBrains Mono** | Regular | 9–10pt | Normal | **Tabular Figures** |

**Rule:** All numbers must use tabular figures (`font-variant-numeric: tabular-nums`) to ensure decimal alignment across rows.

### 1.3 Color Palette

| Token | Hex | Usage |
|---|---|---|
| **Primary Ink** | `#0A1612` | All body text, table data, borders |
| **Deep Teal** | `#0A8A5A` | Section underlines, accent rules, header backgrounds, "LEGAL" / "PROFITABLE" badges |
| **Amber/Gold** | `#B48A15` | Marginal callouts, neutral status |
| **Rust** | `#A44A2A` | "OVER-LIMIT", "SUBSIDIZED", warning badges, penalty text |
| **Hairline Grey** | `#D0D8D4` | Table borders, dividers, subtle rules |
| **Light Grey** | `#F4F6F5` | Table header row backgrounds, category group backgrounds |
| **White** | `#FFFFFF` | Page background, text on dark badges |

### 1.4 Section Framing — Corner Ticks

Instead of standard rectangular boxes, major data sections use **corner ticks**:
- Small L-shaped brackets at the four corners of each section
- Made of **0.5pt rules** in `#0A8A5A` (Deep Teal)
- Each tick leg: approximately 4–6mm
- Creates a "HUD readout" frame without enclosing the entire section

---

## 2. Page-by-Page Layout Map

### PAGE 1 — IDENTITY & ENGINEERING (BOM)

**Header Band (full width):**
```
┌────────────────────────────────────────────────────────────────────────────┐
│  [BUREAU LOGO/SEAL]                                                        │
│                                                                            │
│       TL9 MERCHANT FREIGHTER 400DT                                         │
│       ═══════════════════════════════════════════════════════════          │
│       HAULER / ESCORT                                                      │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```
- Top-left: Bureau logo or seal placeholder
- Center: Ship name in **VT323, 24–28pt, UPPERCASE**
- Below name: **2pt Deep Teal horizontal rule** spanning full content width
- Below rule: Classification in **VT323, 12pt, UPPERCASE** (e.g., "HAULER / ESCORT")

**Section A: Vessel Identity**
- 4-column grid in sharp 90° boxes with **0.25pt `#0A1612` borders**
- Fields:
  - **Hull:** 400 DT Standard
  - **Tech Level:** 9
  - **Total Cost:** 73.83 MCr
  - **Armor Rating:** Titanium Steel TL7+ (20 DT)
- Add `availableDtons` if non-zero

**Section B: Bill of Materials (BOM)**
- Grouped table with category headers
- Columns: **SECTION | MODULE | TONNAGE | COST (MCr) | QTY | TL**
- Category group headers (Hull, Drives, Command, Sensors, Life Support, Weapons, Modules, Supplies, Cargo) with **light grey `#F4F6F5` background**
- Borders: **0.25pt `#D0D8D4`** horizontal rules between rows; no vertical rules
- Right-align numeric columns (Tonnage, Cost, Qty)
- Left-align text columns (Section, Module)
- Include `components[]` array — the canonical flat BOM

**Section C: Performance Metrics**
- Arranged as a 2×2 grid or horizontal strip
- **Thrust (G-Rating):** Horizontal bar chart or large numeric display
  - Show: `0.50 G` — Weight Class: **Heavy**
  - TL multiplier noted in small text
- **Jump Capacity:** Large numeric display
  - Show: `2 parsecs` — Fuel: `80 DT per jump` — Capacity: `48 DT` → `0.6 max jumps`
- **Armor Status Badge:**
  - `[LEGAL]` in **Deep Teal box** if within role limit
  - `[OVER-LIMIT]` in **Rust box** if exceeded, with penalty text below
- **Endurance:** `48 weeks` — Overhaul: `2 weeks/year`

---

### PAGE 2 — LOGISTICS & CREW

*(Force page break before Section D)*

**Section D: Cargo & Supplies**
- **Cargo Capacity:** Large numerical display
  - Total: `260 DT`
  - Allocated to Freight: `260 DT` (100%)
  - Mail Eligible: Yes/No (armed + ≥10 DT cargo)
- **Supply Inventory Table:**
  - Columns: **ITEM | TONNAGE | COST | QTY | PURPOSE**
  - Grouped by: Life Support, Maintenance, Ammunition, EVA
  - Data from `supplies[]` + `components[]` where `section === "Supplies"`

**Section E: Crew Complement**
- **Manifest Table:**
  - Columns: **POSITION | COUNT | SALARY (Cr/mo) | ANNUAL (Cr)**
  - All 10 positions listed (even if count is 0, show `—`)
  - Right-align Count and all monetary columns
- **Payroll Summary Box** (corner-tick frame):
  ```
  MONTHLY PAYROLL:    42,000 Cr
  ANNUAL PAYROLL:     0.504 MCr
  LIFE SUPPORT:       0.288 MCr/year
  ```
- **Crew Distribution Bar** (optional visual):
  - Small segmented bar showing relative proportions: Command | Pilot | Engineer | Gunner | Service

---

### PAGE 3 — OPERATIONS & REVENUE

*(Force page break before Section F)*

**Section F: Operating Overhead**
- **Financial Matrix Table:**
  - Columns: **COST CATEGORY | FIXED | @ 12j | @ 24j | @ 36j**
  - Rows:
    - Mortgage
    - Maintenance
    - Crew Salaries
    - Life Support
    - Variable (Fuel + Port)
    - **TOTAL**
  - Fixed column: same value across all tempos
  - Total row: **bold**, possibly with Deep Teal top border
  - Right-align all monetary columns
  - Use **tablular figures** for all numbers

- **Fixed Cost Callout Box** (corner-tick frame, prominent):
  ```
  FIXED COSTS (INCURRED REGARDLESS OF DEPLOYMENT):  4.558 MCr/year
  ```
  - This is the critical number for subsidized/warship ledgers

**Section G: Commercial Viability**
- **Revenue Stream Projections** (per jump):
  - High Passage: `H1` × 10,000 Cr = `0.010 MCr`
  - Middle Passage: `M5` × 2,000 Cr = `0.010 MCr`
  - Low Passage: `L10` × 500 Cr = `0.005 MCr`
  - Freight: `260 DT` × 1,000 Cr = `0.260 MCr`
  - Mail: `0.025 MCr` (if eligible)
  - **TOTAL REVENUE: 0.310 MCr/jump**

- **Break-Even Analysis:**
  - Show break-even jump count at each tempo:
    - `@ 12j/year: 15.9 jumps`
    - `@ 24j/year: 17.1 jumps`
    - `@ 36j/year: 18.3 jumps`
  - Progress bar or simple ratio visualization:
    - `Overhead ████████░░ Revenue` style (text-based if no images)

- **Status Badge (large, prominent):**
  - `[PROFITABLE]` — **Deep Teal** background, white text, if margin @ 24j > 0
  - `[SUBSIDIZED]` — **Rust** background, white text, if margin @ 24j < 0
  - `[MARGINAL]` — **Amber** background, white text, if break-even within 5%
  - Position: Below revenue table, centered or right-aligned

---

### PAGE 4 — SAFETY & AUTHORIZATION

*(Force page break before Section H)*

**Section H: Escape Systems**
- **Evacuation Table:**
  - Columns: **SYSTEM | COUNT | CAPACITY EACH | TOTAL CAPACITY**
  - Rows:
    - Life Pods (4-person)
    - Escape Pods (1-person)
    - Life Boats (10-person)
  - **Total Capacity** row: bold, with Deep Teal top border

- **Compliance Check:**
  ```
  EVACUATION CAPACITY:    20 persons
  PERSONNEL ONBOARD:      20 persons (12 crew + 8 passengers)
  STATUS:                 ✓ COMPLIANT
  ```
  - If `totalCapacity < (crew.total + staterooms)`: show **Rust** warning — `✗ INSUFFICIENT`

**Final Authorization Block**
- **Signatory Fields:**
  ```
  ┌─────────────────────────┐  ┌─────────────────────────┐
  │ COMMANDING OFFICER      │  │ BUREAU VALIDATION       │
  │                         │  │                         │
  │ _______________________ │  │ _______________________ │
  │ Print Name & Rank       │  │ Certifying Authority    │
  │                         │  │                         │
  │ Date: _______________   │  │ Date: _______________   │
  └─────────────────────────┘  └─────────────────────────┘
  ```
  - Two side-by-side signature blocks with 0.25pt borders
  - JetBrains Mono labels, uppercase

- **Date of Certification:** Field below or between signatures

- **Security Status Box** (optional, bottom-right):
  ```
  ┌─────────────────┐
  │  LVL 5 REQUIRED │
  │  [DEEP TEAL BG] │
  └─────────────────┘
  ```
  - Small box with **Deep Teal** background, **white** text
  - Or **black** background with white text for higher contrast

---

## 3. Data Schema Reference

### 3.1 Identity Fields

| Field | Type | Example |
|---|---|---|
| `name` | string | "TL9 MERCHANT FREIGHTER 400DT" |
| `tl` | number | 9 |
| `hullDtons` | number | 400 |
| `configuration` | string | "Standard" |
| `armor` | string | "Titanium Steel TL7+" |
| `armorQty` | number | 20 |
| `totalCost` | number (Cr) | 73833999 |
| `cargo` | number | 260 |
| `staterooms` | number | 8 |
| `lowBerths` | number | 10 |
| `classification.role` | string | "Hauler" |
| `classification.sizeClass` | string | "Escort" |
| `classification.className` | string | "Merchant Freighter" |

### 3.2 BOM Sources

| Source Array | Content | Section B Table |
|---|---|---|
| `components[]` | Canonical flat BOM — all ship parts | **Primary** — Section B master table |
| `drives[]` | Thrust, jump, power plant drives | Included in components |
| `commandControl[]` | Bridge, cockpit, command station | Included in components |
| `computers[]` | Computer models and ratings | Included in components |
| `softwareList[]` | Software programs | Included in components |
| `sensorList[]` | Sensor packages | Included in components |
| `lifeSupport[]` | Staterooms, low berths | Included in components |
| `weaponMounts[]` | Turrets, bays, hardpoints | Included in components |
| `modules[]` | Fuel scoops, processors, fittings | Included in components |
| `supplies[]` | Consumables, ammunition, EVA gear | Section D supply table |

### 3.3 Calculated Performance (Computed at Export)

| Metric | Formula | Source Data |
|---|---|---|
| **Thrust (G)** | `(driveRating × 100) / hullDtons × TLmultiplier` | `drives[]` thrust drive |
| **Weight Class** | Threshold: >40× Very Light, >20× Light, >5× Medium, >1× Heavy, ≤1× Very Heavy | Thrust result |
| **Jump Range** | Max `performance` among `type: "jump"` drives | `drives[]` jump drive |
| **Jump Fuel** | `hullDtons × 0.1 × parsecs` | Hull + jump range |
| **Fuel Capacity** | Sum of `section: "Fuel"` in components | `components[]` |
| **Endurance** | `fuelCapacity / (powerRating × 0.5)` weeks | Fuel + power plant |
| **Armor %** | `(armorQty / hullDtons) × 100` | Hull + armor |
| **Armor Limit** | Role-based: Civilian 10%/15%, Vanguard 15%/25%, Brawler 20%/50%, Capital 25%/40% | `classification.role` |
| **Tender Capacity** | `(driveRating × 100) − tenderHull` | Thrust drive rating |

### 3.4 Crew (`operations.crew`)

| Position | Field | Salary (Cr/mo) |
|---|---|---|
| Command | `command` | 6,000 |
| Pilot | `pilot` | 5,000 |
| Navigator | `navigator` | 4,000 |
| Engineer | `engineer` | 4,000 |
| Medic | `medic` | 3,000 |
| Gunner | `gunner` | 3,000 |
| Marine | `marine` | 2,000 |
| Steward | `steward` | 1,500 |
| Maintenance | `maintenance` | 2,500 |
| Deck Crew | `deckCrew` | 2,500 |
| **Total** | `total` | — |

### 3.5 Operating Costs (`operations.costs`)

| Field | Unit | Calculation |
|---|---|---|
| `monthlyMortgage` | MCr | `totalCost / 240 / 1,000,000` |
| `maintenance` | MCr/year | `totalCost × 0.001 / 1,000,000` |
| `crewSalaries` | MCr/month | Sum of all salaries / 1,000,000 |
| `lifeSupport` | MCr/month | `crewTotal × 2,000 / 1,000,000` |
| `fuel` | MCr/jump | `fuelTons × 500 / 1,000,000` |
| `portFees` | MCr/call | `totalCost × 0.0001 / 1,000,000` |
| `totalMonthly` | MCr | Sum of above |

### 3.6 Annual Ledger (`operations.costs.annual`)

| Field | Unit | Calculation |
|---|---|---|
| `mortgage` | MCr/year | `monthlyMortgage × 12` |
| `maintenance` | MCr/year | As-is (already annual) |
| `crewSalaries` | MCr/year | `monthlySalaries × 12` |
| `lifeSupport` | MCr/year | `monthlyLifeSupport × 12` |
| `fixedCosts` | MCr/year | Sum of above |
| `variableAt12` | MCr/year | `(fuel + portFees) × 12` |
| `variableAt24` | MCr/year | `(fuel + portFees) × 24` |
| `variableAt36` | MCr/year | `(fuel + portFees) × 36` |
| `totalAt12` | MCr/year | `fixedCosts + variableAt12` |
| `totalAt24` | MCr/year | `fixedCosts + variableAt24` |
| `totalAt36` | MCr/year | `fixedCosts + variableAt36` |

### 3.7 Revenue (`operations.revenue`)

| Field | Unit | Calculation |
|---|---|---|
| `highPassengers` | count | `floor(staterooms × 0.2)` |
| `midPassengers` | count | `floor(staterooms × 0.8)` |
| `lowPassengers` | count | `lowBerths` |
| `passengerRevenue` | MCr/jump | Sum of all passage fares |
| `freightDtons` | DT | `cargo` |
| `freightRevenue` | MCr/jump | `cargo × 1,000 × parsecs / 1,000,000` |
| `mailContracts` | MCr/jump | 0.025 if armed + cargo ≥ 10 DT, else 0 |
| `totalRevenue` | MCr/jump | Sum of all revenue streams |

**Break-even formula:** `breakEvenJumps = totalAtTempo / totalRevenue`

### 3.8 Escape Systems (`operations.escapeSystems`)

| Field | Capacity Each | Formula |
|---|---|---|
| `lifePods` | 4 persons | Estimated: `ceil(totalPersonnel / 4)` |
| `escapePods` | 1 person | From components if present |
| `lifeBoats` | 10 persons | From components if present |
| `totalCapacity` | — | Sum of all above |

**Personnel count:** `crew.total + staterooms` (crew + max standard passengers)

---

## 4. Implementation Rules for Docx

### 4.1 Table Construction

- **Cell margins:** 0.05" (1.27mm) to pack data tightly
- **Row height:** Minimum 0.18" (4.5mm), exact if possible
- **Borders:**
  - Outer frame: **0.5pt `#0A8A5A`** (Deep Teal) for major tables
  - Inner horizontal: **0.25pt `#D0D8D4`** (Hairline Grey)
  - Inner vertical: **none** (clean look)
  - Category headers: **0.5pt `#0A8A5A`** bottom border
- **Header rows:** Background `#F4F6F5`, text `#0A1612`, bold, uppercase
- **Numeric alignment:** Right-align all numbers; decimal-align where possible
- **Text alignment:** Left-align labels; center-align status badges

### 4.2 Corner Tick Implementation

Since Docx does not support true corner-tick shapes natively without drawing objects, use one of:

**Option A: Drawing Objects (preferred if supported)**
- Insert L-shaped line drawings (0.5pt, Deep Teal) at calculated positions
- Top-left: horizontal + vertical lines meeting at corner
- Repeat for all four corners
- Group or anchor to paragraph

**Option B: Table Border Simulation**
- Create a 3×3 invisible table around the content
- Set only outer corner cell borders:
  - Top-left cell: bottom + right border = none; top + left = 0.5pt Deep Teal
  - Top-right cell: bottom + left = none; top + right = 0.5pt Deep Teal
  - Bottom-left cell: top + right = none; bottom + left = 0.5pt Deep Teal
  - Bottom-right cell: top + left = none; bottom + right = 0.5pt Deep Teal
  - All middle cells: no borders
- Place content in the center cell (merged 1×1)

**Option C: Simplified (fallback)**
- Use a standard 0.5pt Deep Teal border on the top and left edges only
- Creates an "open" frame that evokes the same industrial aesthetic

### 4.3 Status Badges

Status badges are small rectangular callouts:
- **Size:** Approximately 0.4" × 1.2" (10mm × 30mm)
- **Border:** None
- **Background:** Deep Teal (`#0A8A5A`) for positive, Rust (`#A44A2A`) for warning
- **Text:** White, JetBrains Mono Bold, 9pt, UPPERCASE, centered
- **Examples:** `[LEGAL]` | `[OVER-LIMIT]` | `[PROFITABLE]` | `[SUBSIDIZED]` | `[MARGINAL]`

### 4.4 Page Breaks

Force explicit page breaks at:
1. Start of Section D (Cargo & Supplies) → Page 2
2. Start of Section F (Operating Overhead) → Page 3
3. Start of Section H (Escape Systems) → Page 4

In python-docx: `doc.add_page_break()`
In Pandoc: `\newpage` or raw docx XML

### 4.5 Font Loading

**VT323:** Load via Google Fonts CDN or embed TTF:
```html
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet">
```

**JetBrains Mono:** Load via Google Fonts CDN or embed TTF:
```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
```

For Docx generation, fonts must be **embedded** or the user must have them installed. Provide fallback:
- VT323 → `Courier New`, `monospace`
- JetBrains Mono → `Consolas`, `Courier New`, `monospace`

---

## 5. Sample Data for Testing

Three representative ships in `public/data/sample_ship_specs.json`:

| Ship | Type | Key Characteristics |
|---|---|---|
| **TL9 Merchant Freighter 400DT** | Commercial | Near break-even, balanced crew, armed, mail-eligible |
| **TL9 Passenger Liner 1000DT** | Subsidized | Large crew (39), high fixed costs, needs subsidies |
| **TL9 Patrol Frigate 300DT** | Military | Cost center, heavily armed, minimal cargo, loss-leading |

Use these to verify:
- Page break placement
- Table density and readability
- Status badge color logic (PROFITABLE vs. SUBSIDIZED)
- Corner tick rendering
- Decimal alignment in financial tables

---

## 6. Deliverables

1. **Docx template file** (`.docx`) with all styles, tables, and page breaks defined
2. **python-docx generation script** that consumes `sample_ship_specs.json` and outputs a rendered Docx
3. **Font embedding package** or installation instructions for VT323 and JetBrains Mono
4. **Grayscale test print** — verify readability without color

---

## 7. Constraints

- Static Docx only — no macros, no live fields, no embedded Excel
- Must generate from JSON via python-docx or pandoc
- Grayscale-safe: all color accents must degrade to weight/shade (bold, borders, background tints)
- 4 pages maximum per ship
- US Letter, 0.5" margins

---

*Document version: 1.0 — APPROVED*
*Design source: Stitch recommendation*
*Application: CE ShipGen v0.04*
