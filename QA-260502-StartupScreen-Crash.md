# QA Report: StartupScreen Crash — v0.04 Hotfix

**Date:** 2026-05-02  
**Severity:** CRITICAL — App completely unusable  
**Reporter:** OpenCode Agent (QA pass)  
**Status:** ✅ Fixed & Deployed

---

## Symptoms

- Ship Designer hull size dropdown is **empty**
- Library shows **no ships**
- User cannot start designing — app appears completely broken
- Console error: `TypeError: Cannot read properties of undefined (reading 'map')`

---

## Root Cause Analysis

### Chain of Failure

1. `scripts/write-version.mjs` generated `public/version.json` **without** a `changelog` field
2. `StartupScreen.tsx` rendered `{version.changelog.map((item, i) => (...))}`
3. `version.changelog` is `undefined` → `.map()` throws
4. Uncaught exception crashes React render before `AppContent` mounts
5. `AppContent` never mounts → `loadTables()` and `loadDefaultShips()` never execute
6. Tables remain empty → hull dropdown empty, library empty

### Why It Wasn't Caught Earlier

- Local dev: `StartupScreen` only shows when `seenVersion !== currentVersion`
  - Developers who already dismissed v0.03 never saw the v0.04 startup screen
  - The crash only manifests for **new sessions / new users / cleared cache**
- Tests: Vitest unit tests don't mount `StartupScreen` — they test validators and imports in isolation
- Build: TypeScript doesn't catch missing JSON fields at compile time

---

## Fix Applied

### File 1: `scripts/write-version.mjs`

```diff
+ const currentEntry = history.find((entry) => entry.version === pkg.version);
+ const changelog = currentEntry?.changes || currentEntry?.changelog || [];
+
  const version = {
    version: pkg.version,
    name: pkg.name,
    date,
    buildTime: now.toISOString(),
+   changelog,
  };
```

### File 2: `src/components/StartupScreen.tsx`

```diff
- {version.changelog.map((item, i) => (
+ {(version.changelog || []).map((item, i) => (
```

---

## Prevention Measures

| Measure | Action | Owner |
|---------|--------|-------|
| Defensive UI | All `.map()` on external data must use `?.map()` or `|| []` | All devs |
| QA Checklist | Add "Test in incognito/private window" to deploy checklist | QA |
| Version Schema | Document `version.json` schema in `PRD.md` | Tech lead |
| E2E Test | Add simple smoke test: fetch version.json, assert `changelog` is array | Future |

---

## Related

- `public/version-history.json` — source of truth for changelog data
- `FRD-065-Version-History-Page.md` — version display spec
- Commit: `58fb2d0` — HOTFIX: Add changelog to version.json + defensive StartupScreen
