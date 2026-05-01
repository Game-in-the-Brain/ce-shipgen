# RCA: White Page on Deploy — CE ShipGen

**Date:** 2026-05-01  
**Incident ID:** ce-shipgen-260501-whitepage  
**Severity:** High (production site down / unusable)  
**Reporter:** justin  
**Status:** ✅ Resolved

---

## Symptom

After deploying ce-shipgen v0.04 to Forgejo Pages (`static-pages` branch), the live site at `https://pages.gi7b.org/gi7b/ce-shipgen/` showed a **blank white screen**. Console errors:

```
Refused to apply style from '.../assets/index-xxx.css' because its MIME type ('text/plain') is not supported.
Refused to execute script from '.../assets/index-xxx.js' because its MIME type ('text/plain') is not executable.
```

---

## Root Cause Chain

```
1. Vite build produces external asset files (dist/assets/index-xxx.js, dist/assets/index-xxx.css)
        ↓
2. Deploy script copies dist/ to static-pages branch (including assets/ folder)
        ↓
3. forgejo-pages container serves files via Forgejo raw API
        ↓
4. Forgejo raw API returns Content-Type: text/plain for ALL files
        ↓
5. Browser sees text/plain + X-Content-Type-Options: nosniff
        ↓
6. Browser blocks <script> and <link rel="stylesheet"> loading
        ↓
7. React app never mounts → white screen
```

**Contributing factor:** The ce-shipgen project did not have an automated inline step in its build/deploy pipeline. The `forgejo-tools.md` skill documented the fix, but the project's `clean-build.md` did not reference it, and no deploy script existed to enforce it.

---

## Why Existing Documentation Didn't Prevent This

| Document | Contains Fix? | Integrated into Project? | Why It Failed |
|----------|-------------|--------------------------|---------------|
| `forgejo-tools.md` §4.2 | ✅ Full RCA + inline script | ❌ Not linked from project docs | Skill file was dropped into context but not wired into build steps |
| `clean-build.md` | ❌ No mention of Forgejo Pages MIME bug | N/A | Document focused on version strings, not deployment platform constraints |
| `package.json` scripts | ❌ No inline or deploy script | N/A | `npm run build` produces standard Vite output; no post-build inline step |

**Human factor:** The deploy was performed manually (10+ steps). Manual processes are error-prone. The inlining step was skipped because it was not part of an automated pipeline.

---

## Fix Applied

1. **Immediate:** Inlined CSS and JS into `index.html` using Python script:
   ```python
   <style>{css}</style>
   <script type="module">{js}</script>
   ```
2. **Deployed:** Removed `assets/` folder from `static-pages` branch.
3. **Verified:** Site loads correctly; `Content-Type: text/html` on `index.html`.

---

## Prevention Measures (Implemented)

### 1. Automated Deploy Script
Created `scripts/deploy.mjs` that:
- Builds the app
- Inlines CSS/JS automatically
- Switches to `static-pages`
- Commits and pushes
- Returns to `main`

### 2. Updated `clean-build.md`
Added "Forgejo Pages Inline Requirement" section with the RCA summary and the deploy script.

### 3. Updated `package.json`
Added `"deploy": "node scripts/deploy.mjs"` script.

### 4. Updated `forgejo-tools.md`
Added "Automated Deploy Script" template to §4.5.

---

## Lessons

1. **Documented fixes are worthless without automation.** If a step is critical, it must be in a script, not a markdown file.
2. **Every project using Forgejo Pages must inline CSS/JS.** This is a platform constraint, not an optional optimization.
3. **Manual deploy checklists fail under pressure.** The inline step was skipped because it was step 8 of 10.
4. **Project docs must reference platform-specific constraints.** `clean-build.md` should have pointed to `forgejo-tools.md` §4.2.

---

*RCA completed 2026-05-01. All prevention measures implemented and verified.*
