#!/usr/bin/env node
/**
 * Deploy CE ShipGen to Forgejo Pages (static-pages branch)
 *
 * CRITICAL: Forgejo Pages serves ALL files as text/plain, so external
 * CSS/JS files are blocked by browsers. This script inlines them into
 * index.html before deploying.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST = './dist';
const TMP = '/tmp/deploy-static-pages';

function run(cmd) {
  console.log(`→ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function inlineBuild() {
  const htmlPath = path.join(DIST, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  const cssMatch = html.match(/href="\.\/assets\/([^"]+\.css)"/);
  if (cssMatch) {
    const css = fs.readFileSync(path.join(DIST, 'assets', cssMatch[1]), 'utf8');
    html = html.replace(
      `<link rel="stylesheet" crossorigin href="./assets/${cssMatch[1]}">`,
      `<style>${css}</style>`
    );
  }

  const jsMatch = html.match(/src="\.\/assets\/([^"]+\.js)"/);
  if (jsMatch) {
    const js = fs.readFileSync(path.join(DIST, 'assets', jsMatch[1]), 'utf8');
    // Use replacement function to avoid $& interpretation in JS source
    html = html.replace(
      `<script type="module" crossorigin src="./assets/${jsMatch[1]}"></script>`,
      () => `<script type="module">${js}</script>`
    );
  }

  if (html.includes('assets/')) {
    console.warn('⚠️  index.html still references assets/');
    process.exit(1);
  }

  fs.writeFileSync(htmlPath, html);
  console.log('✓ CSS/JS inlined into index.html');
}

// 1. Build
run('npm run build');

// 2. Inline CSS/JS (CRITICAL for Forgejo Pages)
inlineBuild();

// 3. Stage in temp directory
fs.rmSync(TMP, { recursive: true, force: true });
fs.cpSync(DIST, TMP, { recursive: true });

// 4. Switch to static-pages
run('git checkout static-pages');

// 5. Clean old files (keep .git and .gitignore)
for (const f of fs.readdirSync('.')) {
  if (f === '.git' || f === '.gitignore') continue;
  fs.rmSync(f, { recursive: true, force: true });
}

// 6. Copy new build (skip assets/ — inlined into index.html)
for (const entry of fs.readdirSync(TMP)) {
  if (entry === 'assets') continue;
  fs.cpSync(path.join(TMP, entry), path.join('.', entry), { recursive: true });
}

// 7. Commit and push
run('git add -A');
run('git commit -m "Deploy"');
run('git push origin static-pages --force');

// 8. Return to main
run('git checkout main');
console.log('✅ Deploy complete');
