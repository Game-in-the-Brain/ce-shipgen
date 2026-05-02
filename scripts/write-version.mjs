/**
 * Build-time version.json + version-history.json generator
 * Run automatically via `npm run prebuild` before every Vite build.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const now = new Date();
const date = now.toISOString().slice(0, 10);

// ── Load version history to get changelog for current version ──
const historyPath = resolve(process.cwd(), 'public/version-history.json');
let history = [];
if (existsSync(historyPath)) {
  try {
    history = JSON.parse(readFileSync(historyPath, 'utf8'));
    if (!Array.isArray(history)) history = [];
  } catch {
    history = [];
  }
}

const currentEntry = history.find((entry) => entry.version === pkg.version);
const changelog = currentEntry?.changes || currentEntry?.changelog || [];

const version = {
  version: pkg.version,
  name: pkg.name,
  date,
  buildTime: now.toISOString(),
  changelog,
};

// ── Write current version ──
const outPath = resolve(process.cwd(), 'public/version.json');
writeFileSync(outPath, JSON.stringify(version, null, 2));
console.log(`[write-version] Generated ${outPath} → v${pkg.version} (${date})`);

// ── Update version history ──
// Remove existing entry for this version (to update it)
history = history.filter((entry) => entry.version !== pkg.version);

// Add new entry at the top
history.unshift({
  version: pkg.version,
  date,
  buildTime: now.toISOString(),
  changes: changelog,
});

writeFileSync(historyPath, JSON.stringify(history, null, 2));
console.log(`[write-version] Updated ${historyPath} → ${history.length} version(s)`);
