# FRD-063: Default Software Auto-Selection

**Date:** 2026-04-30  
**Status:** 📋 Specified  
**Project:** `ce-shipgen`  
**Target Version:** 0.05  
**Priority:** P1  
**Blocked By:** None  

---

## 1. Objective

When a ship computer is selected in the ShipDesigner, automatically select the **default/bundled software** that every functioning computer requires. This eliminates manual steps that every ship design must perform and prevents forgotten basic software.

---

## 2. Background

Analysis of 43 reference ships from `GI7B EXTERNAL RAW CE SHIPS 231024-06 240930.xlsx` shows that:

- **100% of ships with computers** have **Interface** software
- **~90% of ships with computers** have **Database** software  
- **~85% of ships with computers** have at least one **Security** program
- Specialized software (Jump Control, Fire Control, etc.) is mission-specific

Current behavior: User must manually add Interface, Database, and Security to every single ship. This is repetitive and error-prone.

---

## 3. Scope

### In Scope
- Auto-select **Interface TL X** when any computer is chosen
- Auto-select **Database TL X** when any computer is chosen
- Auto-select **Security TL X** when any computer is chosen
- TL of default software matches the computer's TL (or ship TL, whichever is lower)
- Software appears in the `softwareList` child table automatically
- User can remove or modify auto-selected software after selection

### Out of Scope
- Specialized software (Jump Control, Fire Control, Auto-Repair, etc.) — still manual
- Software ratings above base level — user must upgrade manually
- Multiple security programs — one is auto-selected; user adds more if needed

---

## 4. Default Software Rules

### Rule 1: Interface (Mandatory)

| Computer Model | Auto-Select Interface |
|----------------|----------------------|
| Any Model | `Interface TL 7` (Rating 0) |
| Model/3+ (TL 11+) | `Intelligent Interface TL 11` (Rating 1) |

**Rationale:** CE SRD states "Using a computer without an interface is a Formidable (–6 DM) task." Interface is never optional.

### Rule 2: Database (Standard)

| Computer Model | Auto-Select Database |
|----------------|---------------------|
| Any Model | `Database TL 7` (Rating —) |

**Rationale:** 90% of reference ships include Database. It is standard equipment for starfarers.

### Rule 3: Security (Standard)

| Computer Model | Auto-Select Security |
|----------------|---------------------|
| Any Model | `Security TL 7` (Rating 0) |
| If ship TL ≥ 9 | `Security TL 9` (Rating 1) |
| If ship TL ≥ 11 | `Security TL 11` (Rating 2) |

**Rationale:** 85% of reference ships include Security. Basic intrusion defense is standard.

### Rule 4: TL Matching

```
software_tl = min(computer_tl, ship_tl, software_available_tl)
```

If ship TL is 9 but computer is Model/1 (TL 7), default software is TL 7.
If ship TL is 12 but computer is Model/4 (TL 12), default software can be TL 12 where available.

---

## 5. UI Behavior

### On Computer Selection
```
1. User selects computer model from dropdown
2. ShipDesigner auto-populates softwareList child table with defaults
3. Auto-selected software rows are marked with ⚙️ icon or subtle highlight
4. User can delete individual rows or add more software
```

### On Computer Change
```
1. If computer model changes to higher/lower TL
2. Remove existing auto-selected defaults
3. Re-apply defaults at new TL
4. Preserve user-added specialized software
```

### Visual Indicator
- Auto-selected software rows show a small "auto" badge
- Hover tooltip: "Added automatically based on computer selection"
- Deleting an auto-selected row removes the badge permanently

---

## 6. Data Model Changes

### `SoftwareItem` Extension
```typescript
export interface SoftwareItem extends ChildItem {
  program: string;
  rating: number;
  active: boolean;
  autoSelected?: boolean;  // NEW: track auto-selected defaults
}
```

### Table Store Addition
```typescript
interface TableActions {
  // ... existing actions
  applyDefaultSoftware: (computerModel: string, shipTl: number) => void;
  clearAutoSelectedSoftware: () => void;
}
```

---

## 7. Reference Ship Analysis

From 43 extracted CE ships:

| Software | Ships With It | Percentage |
|----------|---------------|------------|
| Interface TL 7 | 43/43 | 100% |
| Database TL 7 | 38/43 | 88% |
| Security TL 7 | 36/43 | 84% |
| Jump Control | 12/43 | 28% |
| Fire Control | 8/43 | 19% |
| Auto-Repair | 3/43 | 7% |
| Expert Systems | 2/43 | 5% |

**Conclusion:** Interface + Database + Security are the universal baseline. Everything else is mission-specific.

---

## 8. Acceptance Criteria

- [ ] Selecting any computer auto-adds Interface, Database, and Security to softwareList
- [ ] Software TL matches `min(computer_tl, ship_tl)`
- [ ] Auto-selected rows are visually distinct (badge/highlight)
- [ ] Changing computer model updates defaults (removes old, adds new at correct TL)
- [ ] User can delete auto-selected software without it re-appearing
- [ ] User-added specialized software is preserved across computer changes
- [ ] 200DT Free Trader loads with: Interface, Database, Security×2 (matches Excel)
- [ ] 100DT Courier loads with: Interface, Database, Security (matches Excel)

---

## 9. Testing Strategy

1. Load each reference ship from `all_ships_complete.json`
2. Select the computer model the ship uses
3. Verify auto-selected software matches the Excel component list
4. If mismatch → check if Excel has extra/missing software → adjust rules

---

## 10. Implementation Notes

**Files to modify:**
- `src/components/ShipDesigner.tsx` — computer selection onChange handler
- `src/types/index.ts` — add `autoSelected?: boolean` to `SoftwareItem`
- `src/store/tableStore.ts` — add software management actions (optional)

**Minimal implementation:**
```typescript
// In computer dropdown onChange:
const defaultSoftware = [
  { program: 'Interface TL 7', rating: 0, cost: 0, tl: 7 },
  { program: 'Database TL 7', rating: 0, cost: 0.01, tl: 7 },
  { program: 'Security TL 7', rating: 0, cost: 0, tl: 7 },
];
setSoftwareList(prev => {
  const userSoftware = prev.filter(s => !s.autoSelected);
  return [...defaultSoftware.map(s => ({ ...s, autoSelected: true })), ...userSoftware];
});
```

---

*End of Document*
