# RCA: Wall of Text on Deploy — CE ShipGen

**Date:** 2026-05-01  
**Incident ID:** ce-shipgen-260501-wall-of-text  
**Severity:** High (production site unusable)  
**Status:** 🔍 Root cause identified, fix in progress

---

## Symptom

Live site at `https://pages.gi7b.org/gi7b/ce-shipgen/` displays the entire minified JavaScript source code as visible text instead of rendering the React app. Console shows no errors; the page is just a massive wall of minified JS.

---

## Root Cause

### The Chain

```
1. Vite minifies React code → JS contains string literal "$&/" (regex replace pattern)
2. Deploy script uses String.prototype.replace() to inline JS into HTML
3. JS replace() treats $& as special pattern → inserts the MATCHED SUBSTRING
4. Matched substring = <script ...src="./assets/index-xxx.js"></script>
5. $& expands to full <script> tag INSIDE the inlined JS string literal
6. Injected string contains </script> → HTML parser closes <script> element
7. Remaining 300KB of JS becomes visible text on the page
```

### The Smoking Gun

The minified JS legitimately contains this React DOM code:
```javascript
n=e.replace(lc,"$&/")+"/"
```

The deploy script did:
```javascript
html = html.replace(
  '<script type="module" crossorigin src="./assets/index-D-zeJ7SA.js"></script>',
  '<script type="module">' + js + '</script>'
);
```

Because `js` contains `$&`, `String.prototype.replace()` expanded `$&` to the **entire matched substring** — the original `<script>` tag HTML — injecting it into the middle of the JS code:

```javascript
// What the JS actually contained:
n=e.replace(lc,"$&/")+"/"

// What replace() turned it into:
n=e.replace(lc,"<script type="module" crossorigin src="./assets/index-D-zeJ7SA.js"></script>/")+"/"
```

The injected `<script>...</script>` contains `</script>` which the HTML parser sees and closes the outer `<script type="module">` element. Everything after that point renders as text.

---

## Why It Wasn't Caught Earlier

| Check | Result | Why It Failed |
|-------|--------|---------------|
| `grep '</script>' dist/assets/*.js` | 0 matches | Original JS doesn't contain `</script>` — it was INTRODUCED by replace() |
| `grep 'zeJ7SA' dist/assets/*.js` | 0 matches | Original JS doesn't contain the filename — it was INTRODUCED by replace() |
| Deploy script logged "Inlined JS: 300788 bytes" | Looked correct | Script read the file correctly; the corruption happened during string replacement |
| Live site returned `text/html` | Looked correct | The HTML was valid; the parser just closed `<script>` early |

---

## The Fix

**Never use `String.prototype.replace()` with a string replacement when the replacement content might contain `$` characters.**

Use a replacement **function** instead:

```javascript
// BEFORE (broken)
html = html.replace(search, '<script type="module">' + js + '</script>');

// AFTER (fixed)
html = html.replace(search, () => '<script type="module">' + js + '</script>');
```

A replacement function receives the matched string and returns the replacement verbatim — no special `$` handling.

Alternative: escape `$` as `$$$` in the replacement string:
```javascript
const escapedJs = js.replace(/\$/g, '$$$$'); // $ → $$ in replacement context
html = html.replace(search, '<script type="module">' + escapedJs + '</script>');
```

---

## Prevention

1. **Always use replacement functions** when inserting user-generated or file content into `String.prototype.replace()`
2. **Add a post-inline validation step** that searches for `</script>` inside the inlined `<script>` block
3. **Document this footgun** in all inline-build scripts

---

## Affected Files

- `scripts/deploy.mjs` — inline step
- `scripts/inline-build.mjs` — inline step (if used)
- `forgejo-tools.md` §4.5 — Python fallback is safe; Node.js example needs fix

---

*RCA in progress — fix being applied and redeployed.*
