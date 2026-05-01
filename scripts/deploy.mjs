#!/usr/bin/env node
/**
 * One-command deploy script for ce-shipgen on Forgejo Pages.
 *
 * Steps:
 *   1. Build the app (npm run build)
 *   2. Inline CSS/JS into index.html (Forgejo Pages fix)
 *   3. Switch to static-pages branch
 *   4. Replace old files with new dist/
 *   5. Commit and force-push
 *   6. Return to main
 *
 * Usage:
 *   node scripts/deploy.mjs
 *
 * Prerequisites:
 *   - git remote must be configured
 *   - static-pages branch must exist on remote
 *   - node_modules must be installed
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST = './dist';
const TMP = '/tmp/ce-shipgen-deploy';

function run(cmd, opts = {}) {
  console.log(`→ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function inlineBuild() {
  const htmlPath = path.join(DIST, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Inline CSS
  const cssMatch = html.match(/href="\.\/assets\/([^"]+\.css)"/);
  if (cssMatch) {
    const cssFile = path.join(DIST, 'assets', cssMatch[1]);
    const css = fs.readFileSync(cssFile, 'utf8');
    html = html.replace(
      `<link rel="stylesheet" crossorigin href="./assets/${cssMatch[1]}">`,
      `<style>${css}</style>`
    );
    console.log(`→ Inlined CSS: ${cssMatch[1]} (${css.length} bytes)`);
  }

  // Inline JS
  const jsMatch = html.match(/src="\.\/assets\/([^"]+\.js)"/);
  if (jsMatch) {
    const jsFile = path.join(DIST, 'assets', jsMatch[1]);
    const js = fs.readFileSync(jsFile, 'utf8');
    html = html.replace(
      `<script type="module" crossorigin src="./assets/${jsMatch[1]}"></script>`,
      `<script type="module">${js}</script>`
    );
    console.log(`→ Inlined JS: ${jsMatch[1]} (${js.length} bytes)`);
  }

  // Verify no external asset references remain
  if (html.includes('assets/')) {
    console.warn('⚠️  index.html still references assets/ — check for additional files');
  }

  fs.writeFileSync(htmlPath, html);
  console.log('→ Inlined index.html written');
}

async function main() {
  try {
    // 1. Build
    console.log('\n=== 1. Build ===');
    run('npm run build');

    // 2. Verify version
    const versionPath = path.join(DIST, 'version.json');
    const v = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    console.log(`\n→ Version: ${v.version}`);

    // 3. Inline CSS/JS (Forgejo Pages fix — CRITICAL)
    console.log('\n=== 2. Inline CSS/JS (Forgejo Pages fix) ===');
    inlineBuild();

    // 4. Save dist to temp
    console.log('\n=== 3. Stage dist ===');
    fs.rmSync(TMP, { recursive: true, force: true });
    fs.cpSync(DIST, TMP, { recursive: true });

    // 5. Reset generated files to avoid checkout conflicts
    console.log('\n=== 4. Reset generated files ===');
    try { execSync('git checkout -- public/version.json public/version-history.json', { stdio: 'ignore' }); } catch { /* ignore if not tracked */ }

    // 6. Switch to static-pages
    console.log('\n=== 5. Switch to static-pages ===');
    run('git checkout static-pages');

    // 7. Clean old files (keep .git)
    console.log('\n=== 6. Clean old files ===');
    const files = fs.readdirSync('.').filter(f => f !== '.git');
    for (const f of files) {
      fs.rmSync(f, { recursive: true, force: true });
    }

    // 8. Copy new build (without assets/ since they're inlined)
    console.log('\n=== 7. Copy new build ===');
    const entries = fs.readdirSync(TMP);
    for (const entry of entries) {
      const src = path.join(TMP, entry);
      const dest = path.join('.', entry);
      // Skip assets/ folder — CSS/JS are inlined into index.html
      if (entry === 'assets') continue;
      fs.cpSync(src, dest, { recursive: true });
    }

    // 9. Commit and push
    console.log('\n=== 8. Commit and push ===');
    run('git add -A');
    run(`git commit -m "Deploy v${v.version}"`);
    run('git push origin static-pages --force');

    // 10. Return to main
    console.log('\n=== 9. Return to main ===');
    run('git checkout main');

    console.log('\n✅ Deploy complete');
    console.log(`🌐 https://pages.gi7b.org/gi7b/ce-shipgen/`);
  } catch (err) {
    console.error('\n❌ Deploy failed:', err.message);
    process.exit(1);
  } finally {
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main();
