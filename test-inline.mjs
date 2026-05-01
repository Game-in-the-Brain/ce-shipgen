import fs from 'fs';
import path from 'path';

const htmlPath = path.join('dist', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const cssMatch = html.match(/href="\.\/assets\/([^"]+\.css)"/);
if (cssMatch) {
  const css = fs.readFileSync(path.join('dist', 'assets', cssMatch[1]), 'utf8');
  html = html.replace(`<link rel="stylesheet" crossorigin href="./assets/${cssMatch[1]}">`, `<style>${css}</style>`);
}

const jsMatch = html.match(/src="\.\/assets\/([^"]+\.js)"/);
if (jsMatch) {
  const js = fs.readFileSync(path.join('dist', 'assets', jsMatch[1]), 'utf8');
  html = html.replace(`<script type="module" crossorigin src="./assets/${jsMatch[1]}"></script>`, `<script type="module">${js}</script>`);
}

const scriptStart = html.indexOf('<script type="module">');
const scriptEnd = html.indexOf('</script>', scriptStart);
const inlinedJs = html.substring(scriptStart + 22, scriptEnd);

console.log('Total inlined JS length:', inlinedJs.length);

// Check for unescaped </script> (the HTML parser will see this and close the script tag)
let badCount = 0;
let pos = 0;
while ((pos = inlinedJs.indexOf('</script>', pos)) !== -1) {
  badCount++;
  const context = inlinedJs.substring(Math.max(0, pos - 40), Math.min(inlinedJs.length, pos + 40));
  console.log(`  UNESCAPED </script> #${badCount} at ${pos}: ...${context}...`);
  pos += 9;
}
console.log('UNESCAPED </script> total:', badCount);

// Check for escaped <\/script>
let goodCount = 0;
pos = 0;
while ((pos = inlinedJs.indexOf('<\\/script>', pos)) !== -1) {
  goodCount++;
  pos += 11;
}
console.log('Escaped <\\\\/script> total:', goodCount);

// Check for user's specific snippet
const snippet = '/")+"/"),Wo(l,t,n,"",function(f){return f})';
const idx = inlinedJs.indexOf(snippet);
console.log('User snippet found at index:', idx);
if (idx >= 0) {
  console.log('Context around snippet:', inlinedJs.substring(Math.max(0, idx - 80), Math.min(inlinedJs.length, idx + 80)));
}

fs.writeFileSync('dist/test-inlined.html', html);
console.log('Wrote dist/test-inlined.html for inspection');
