/**
 * Build-time version.json generator
 * Run automatically via `npm run prebuild` before every Vite build.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const now = new Date();
const date = now.toISOString().slice(0, 10);

const version = {
  version: pkg.version,
  name: pkg.name,
  date,
  buildTime: now.toISOString(),
};

const outPath = resolve(process.cwd(), 'public/version.json');
writeFileSync(outPath, JSON.stringify(version, null, 2));
console.log(`[write-version] Generated ${outPath} → v${pkg.version} (${date})`);
