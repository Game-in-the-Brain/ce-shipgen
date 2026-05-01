# Clean Build Notes — CE ShipGen

**Date:** 2026-05-01  
**Version:** 0.04  
**Scope:** Version control hygiene, build automation, deployment pipeline, and known issues

---

## Table of Contents

1. [Version Control Bugs Found & Fixed](#version-control-bugs-found--fixed)
2. [Deployment Challenges & Lessons Learned](#deployment-challenges--lessons-learned)
3. [Build Verification](#build-verification)
4. [Pre-Existing Lint Debt](#pre-existing-lint-debt)
5. [Deployment Status](#deployment-status)
6. [Remaining Version Control Risks](#remaining-version-control-risks)
7. [Best Practices — Commit, Push, Deploy, Version](#best-practices--commit-push-deploy-version)
8. [Recommended Next Clean-Build Actions](#recommended-next-clean-build-actions)

---

## Version Control Bugs Found & Fixed

### 1. Multiple Hardcoded Version Strings
**Severity:** Medium  
**Impact:** Version displays inconsistently across the app; easy to miss during bumps.

**Files affected:**
| File | Before | After | Notes |
|------|--------|-------|-------|
| `package.json` | `0.03` | `0.04` | Canonical source |
| `public/version.json` | `0.03` | auto-generated | Now generated at build time |
| `src/App.tsx` | `v0.03` fallback | `v0.04` fallback | Fallback if fetch fails |
| `src/components/shipgen/ShipGenDesktop.tsx` | `v0.03` | `v0.04` | Standalone shipgen UI |
| `src/components/screens/SettingsScreen.tsx` | `v0.2.5` | `v0.04` | Was *wildly* out of sync |
| `src/utils/exportImport.ts` | `0.03` | `0.04` | Foundry VTT export format version |

**Fix:** Bumped all to `0.04`. Added `scripts/write-version.mjs` to auto-generate `public/version.json` from `package.json` on every build.

---

### 2. Missing Build-Time Version Generator
**Severity:** High  
**Impact:** M2.6 was marked "complete" but the core automation (`scripts/write-version.mjs`) did not exist.

**Evidence:**
- README claims: "`version.json` generated at build time via `scripts/write-version.mjs`"
- `package.json` had no `prebuild` script
- `scripts/` directory did not exist

**Fix:**
- Created `scripts/write-version.mjs`
- Added `"prebuild": "node scripts/write-version.mjs"` to `package.json`
- Verified: `npm run build` now auto-generates `public/version.json` before `tsc && vite build`

---

### 3. SettingsScreen Version Drift
**Severity:** Low  
**Impact:** Misleading milestone label.

**Before:** `CE ShipGen v0.2.5 (Milestone 2.5)`  
**After:** `CE ShipGen v0.04 (Milestone 2.7)`

The Settings footer was never updated after M2.5. It should probably fetch `version.json` dynamically instead of hardcoding.

---

## Deployment Challenges & Lessons Learned

### Challenge 0: 🔴 CRITICAL — Forgejo Pages White Page Bug
**What happened:** Deployed v0.04 to `static-pages`. Site showed a blank white screen. Console errors:
```
Refused to apply style from '.../assets/index-xxx.css' because its MIME type ('text/plain') is not supported.
Refused to execute script from '.../assets/index-xxx.js' because its MIME type ('text/plain') is not executable.
```

**Root cause:** `ronmi/forgejo-pages` serves files via Forgejo raw API, which returns `Content-Type: text/plain` for **all** files, combined with `X-Content-Type-Options: nosniff`. Browsers block `<script>` and `<link rel="stylesheet">` tags → React never mounts → white page.

**Fix:** Inline all CSS and JS into `index.html`. Remove the `assets/` folder from `static-pages`.

**Prevention:** Use the automated deploy script (`npm run deploy`) which inlines automatically. See §7 below.

> **See also:** `forgejo-tools.md` §4.2 for full RCA, `RCA-260501-White-Page-Deploy.md` for incident report.

---

### Challenge 1: Token Embedded in Remote URL (Security Risk)
**What happened:** The Forgejo remote was configured as `https://justin-admin:TOKEN@git.gi7b.org/gi7b/ce-shipgen.git`. The token is visible in plaintext in `.git/config`.

**Why it's bad:**
- Token is exposed to any process that reads `.git/config`
- Credential rotation requires manual remote URL editing
- Violates the `.brc` credential store guidelines

**Fix:** Use a credential helper or SSH instead:
```bash
# Remove embedded token
git remote set-url origin https://git.gi7b.org/gi7b/ce-shipgen.git
# Configure credential helper
git config credential.helper store
# Authenticate once via prompt or .netrc
```

**Best practice:** Never embed tokens in remote URLs. Read from `.brc/forgejo` at runtime.

---

### Challenge 2: Branch Confusion — `main` vs `static-pages`
**What happened:** We pushed code fixes to `main`, but the live site is served from the **`static-pages` branch**. Users still saw `0.03` because `static-pages` had the old build.

**Root cause:** Two-branch deployment model:
- `main` → source code
- `static-pages` → built `dist/` output (Forgejo Pages)

**Fix:** Always deploy after pushing to `main`. The deploy updates `static-pages` with fresh `dist/`.

**Best practice:** Document the two-branch model prominently. Use a single deploy script (see §7).

---

### Challenge 3: `node_modules` Accidentally Deleted (Twice)
**What happened:** When switching to `static-pages` to deploy, we ran `find . -delete` to clean the branch. This wiped `node_modules/` because it's untracked but present in the working tree. We had to re-run `npm install` twice.

**Why it happened:** `static-pages` is an orphan branch with no `.gitignore`. Untracked files (`node_modules/`, `dist/`, temp files) are not protected.

**Fix:**
1. Never use `find . -delete` on a branch without first checking what's untracked
2. Use `git clean -fdx` instead (respects `.gitignore`)
3. Or better: use a deploy script that builds in a temp directory

**Best practice:**
```bash
# Safe deploy: build in place, then copy only dist to temp
cp -r dist /tmp/deploy-dist
git checkout static-pages
git rm -rf .
cp -r /tmp/deploy-dist/* .
```

---

### Challenge 4: Generated File Pollution (`public/version.json`)
**What happened:** Every `npm run build` modifies `public/version.json`. This creates dirty working tree changes that block `git checkout` and show up in `git status`.

**Why it's bad:**
- Blocks branch switches (`error: Your local changes would be overwritten`)
- Easy to accidentally commit a generated file
- Creates noise in `git status`

**Fix:** Add `public/version.json` to `.gitignore`:
```gitignore
# Generated at build time — do not commit
public/version.json
```

The file is already generated by `prebuild`, so it doesn't need to be tracked.

---

### Challenge 5: Divergent Branches on Push
**What happened:** First push to `main` was rejected because remote had new commits we didn't have locally.

```
! [rejected]        main -> main (fetch first)
```

**Fix:** Always `git pull` before `git push` if multiple people/agents work on the repo.

**Best practice:**
```bash
git pull origin main --no-rebase
git push origin main
```

---

### Challenge 6: No Automated Deploy Pipeline
**What happened:** Deploy required 10+ manual steps: build → temp copy → checkout static-pages → clean → copy → commit → force push → checkout main → cleanup. Highly error-prone.

**Fix needed:** A single deploy script. See §7 for the recommended script.

---

### Challenge 7: Stale Deployed Version
**What happened:** The `static-pages` branch's `version.json` showed `0.03` (Apr 29) while `main` had `0.04` (May 1). The deployed site was 2 days stale.

**Root cause:** Code was pushed to `main` but never deployed to `static-pages`.

**Fix:** Every meaningful change must be followed by a deploy.

---

## Build Verification

```bash
$ npm run build

> ce-shipgen@0.04 prebuild
> node scripts/write-version.mjs
[write-version] Generated .../public/version.json → v0.04 (2026-05-01)

> ce-shipgen@0.04 build
> tsc && vite build
...
✓ built in 1.85s
```

**Result:** Zero TypeScript errors. Zero new ESLint errors introduced by our changes.

---

## Pre-Existing Lint Debt (Not Our Changes)

| File | Issue | Count |
|------|-------|-------|
| `src/components/settings/JsonTableEditor.tsx` | `any` type usage | 3 errors |
| `src/components/settings/RuleSettings.tsx` | `any` type usage | 1 error |
| `src/components/settings/SettingsSnapshots.tsx` | `any` type usage | 1 error |
| `src/components/settings/TableDataEditor.tsx` | `any` type + unused var | 5 errors |
| `src/components/shipgen/ShipGenDesktop.tsx` | unused `_omit` | 1 error |
| `src/components/shipgen/ShipGenPhone.tsx` | unused `_omit` | 1 error |
| `src/components/ShipDesigner.tsx` | react-hooks/exhaustive-deps | 5 warnings |
| `src/components/StartupScreen.tsx` | react-refresh/only-export-components | 1 warning |
| `src/components/ThemeProvider.tsx` | react-refresh + hooks deps | 3 warnings |

**Total:** 13 errors, 9 warnings (all pre-existing)

---

## Deployment Status

| Remote | Branch | Status |
|--------|--------|--------|
| Forgejo `git.gi7b.org/gi7b/ce-shipgen` | `main` | ✅ Pushed (`3a82a39`) |
| Forgejo `git.gi7b.org/gi7b/ce-shipgen` | `static-pages` | ✅ Deployed (`e81a31b`) |
| GitHub `Game-in-the-Brain/ce-shipgen` | `main` | ⏳ Not synced |

**Note:** Forgejo is the sole remote. `static-pages` is the live site branch.

---

## Remaining Version Control Risks

1. **SettingsScreen still hardcodes version** — Should fetch `version.json` dynamically.
2. **No release tag** — Consider tagging `v0.04` on Forgejo.
3. **ShipGenDesktop hardcodes version** — Still shows `v0.04` manually.
4. **Foundry export version** — `exportImport.ts` embeds format version. Must bump independently if schema changes.
5. **~~No deploy script~~** — ✅ Fixed: `scripts/deploy.mjs` + `npm run deploy` (2026-05-01).
6. **`public/version.json` not in `.gitignore`** — Still pollutes working tree on every build.
7. **Token in remote URL** — Security risk if `.git/config` is exposed.
8. **Forgejo Pages white page risk** — ✅ Mitigated: deploy script auto-inlines CSS/JS. Still need to ensure no one bypasses the script.

---

## Best Practices — Commit, Push, Deploy, Version

### 1. One-Command Deploy Script (Automated Inline)

The deploy script **`scripts/deploy.mjs`** is checked into the repo. It handles everything including the **Forgejo Pages CSS/JS inlining fix** (see Challenge 0 above).

**Usage:**
```bash
npm run deploy
```

**What it does:**
1. Builds the app (`npm run build`)
2. Inlines CSS and JS into `index.html` (removes external asset references)
3. Stages the build to a temp directory
4. Switches to `static-pages`
5. Cleans old files (keeps `.git`)
6. Copies the inlined build (skips `assets/` since they're now inline)
7. Commits and force-pushes
8. Returns to `main`

**Why it's critical:** If you skip the inline step and deploy a standard Vite build, the site will show a **white page** on Forgejo Pages. The script enforces this automatically.

**Note:** `node_modules` is preserved because the script only cleans files in the working tree, not untracked directories. However, after returning to `main`, you may need to reinstall if `node_modules` was accidentally deleted during manual branch switching.

---

### 2. Ignore Generated Files
Add to `.gitignore`:
```gitignore
# Build outputs
dist/
*.tsbuildinfo

# Generated version file
public/version.json

# Local env
.env
.env.local

# OS
.DS_Store
```

---

### 3. Version Bump Checklist
Before releasing a new version:

- [ ] Bump `package.json` version (e.g., `0.04` → `0.05`)
- [ ] Update `CHANGELOG.md` or version history
- [ ] Run `npm test` — all pass
- [ ] Run `npm run build` — zero TS errors
- [ ] Commit: `git commit -m "release: v0.05"`
- [ ] Push: `git push origin main`
- [ ] Deploy: `npm run deploy`
- [ ] Tag: `git tag -a v0.05 -m "Milestone X.Y" && git push origin v0.05`
- [ ] Verify live site shows new version

---

### 4. Safe Branch Switching
When switching between `main` and `static-pages`:

```bash
# Before switching, stash or discard generated changes
git checkout -- public/version.json
git checkout static-pages

# Or use the deploy script (handles this automatically)
```

---

### 5. Credential Hygiene
```bash
# Check current remote
git remote -v

# If token is embedded, remove it
git remote set-url origin https://git.gi7b.org/gi7b/ce-shipgen.git

# Use .brc file + credential helper
git config credential.helper store
# Then authenticate once; token is stored in ~/.git-credentials
```

---

## Recommended Next Clean-Build Actions

1. [x] Fix all 13 pre-existing ESLint errors (mostly `any` → proper types)
2. [x] Create `scripts/deploy.mjs` one-command deploy script (with auto-inline for Forgejo Pages)
3. [ ] Add `public/version.json` to `.gitignore`
4. [ ] Remove embedded token from remote URL
5. [ ] Make SettingsScreen fetch version.json dynamically
6. [ ] Tag `v0.04` release on Forgejo
7. [ ] Add GitHub remote and set up mirroring if desired
8. [x] Create version history page (FRD-065) — ✅ Implemented in SettingsScreen

---

*Document updated 2026-05-01 after ship import fixes and full spreadsheet library deployment.*
