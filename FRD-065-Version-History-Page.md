# FRD-065: Version History Page in Settings

**Date:** 2026-05-01  
**Status:** 📋 Specified → 🚧 Ready for Implementation  
**Project:** `ce-shipgen`  
**Target Version:** 0.04+  
**Priority:** P2  
**Depends On:** FR-026a (Version Manifest)

---

## 1. Objective

Provide a **Version History** page accessible from Settings that shows every deployed version of the app: version number, release date, build timestamp, and a human-readable changelog. This replaces the single current-version display with a timeline users can browse.

---

## 2. Requirements

### FR-065a: Version History Data Source
- A `public/version-history.json` file must exist
- It is an array of version entry objects, newest first
- Each entry contains:
  - `version` (string) — e.g. `"0.04"`
  - `date` (string) — ISO date, e.g. `"2026-05-01"`
  - `buildTime` (string) — ISO timestamp
  - `changes` (string[]) — array of changelog lines
  - `commit` (string) — git commit hash (optional)

### FR-065b: Automatic History Generation
- `scripts/write-version.mjs` must append each new version to the history
- If the version already exists, update its entry (idempotent)
- History is persisted across builds (not regenerated from scratch)

### FR-065c: Settings UI — Version History Section
- Located in `SettingsScreen.tsx` below the existing Version section
- Heading: **Version History**
- Displayed as a vertical timeline:
  - Each entry is a card/tile with version number, date, and change list
  - Current version is highlighted
  - Older versions are collapsed or shown in muted style
- Mobile-responsive

### FR-065d: Changelog Source
- Primary: `version-history.json`
- Fallback: if history file fails to load, show only current version from `version.json`

---

## 3. UI Mockup

```
┌─────────────────────────────────────┐
│  VERSION HISTORY                    │
│                                     │
│  ● v0.04 — 2026-05-01              │
│    ▪ Ship import child-table fix   │
│    ▪ All 43 Excel ships in library │
│    ▪ File import UI                │
│    [CURRENT]                        │
│                                     │
│  ○ v0.03 — 2026-04-30              │
│    ▪ M2.6 version control          │
│    ▪ Startup screen + settings     │
│                                     │
│  ○ v0.02 — 2026-04-28              │
│    ▪ ShipDesigner child tables     │
│    ▪ BOQ view                      │
└─────────────────────────────────────┘
```

---

## 4. Data Flow

```
package.json version
      ↓
scripts/write-version.mjs
      ↓
├─→ public/version.json (current version)
└─→ public/version-history.json (append/update)
      ↓
SettingsScreen.tsx fetches version-history.json
      ↓
Renders timeline
```

---

## 5. Files to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `scripts/write-version.mjs` | Modify | Append to `version-history.json` |
| `public/version-history.json` | Create | Initial history (backfilled) |
| `src/components/screens/SettingsScreen.tsx` | Modify | Add Version History section |
| `src/hooks/useVersionCheck.ts` | Modify (optional) | Could also return history |

---

## 6. Backfill Strategy

Since we don't have historical `version.json` files, manually construct the first few entries based on git history and `PROJECT_NOTES.md`:

```json
[
  {
    "version": "0.04",
    "date": "2026-05-01",
    "buildTime": "2026-05-01T12:12:10.813Z",
    "changes": [
      "Fix ship import child-table round-trip",
      "Load all 43 Excel ships into library",
      "Add file import UI",
      "Fix armor lookup robustness"
    ],
    "commit": "e81a31b"
  },
  {
    "version": "0.03",
    "date": "2026-04-30",
    "buildTime": "2026-04-30T16:47:55.002Z",
    "changes": [
      "M2.6 version control system",
      "Startup screen with update prompts",
      "Settings panel with version display",
      "Service worker prompt-based updates"
    ],
    "commit": "884ce4e"
  }
]
```

---

## 7. Acceptance Criteria

- [ ] `public/version-history.json` exists and is valid JSON
- [ ] `write-version.mjs` appends/updates the history on every build
- [ ] Settings screen displays a scrollable timeline of versions
- [ ] Each version card shows: version number, date, bulleted changes
- [ ] Current version is visually distinct (highlighted)
- [ ] Works on mobile (vertical stack, no horizontal overflow)
- [ ] If history file fails to load, falls back to showing only current version

---

*FDR-065 created 2026-05-01 during clean-build documentation update.*
