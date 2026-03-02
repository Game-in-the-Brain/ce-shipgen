#!/bin/bash
set -e
TEMP_DIR=$(mktemp -d)
cp -r dist/* "$TEMP_DIR/"
cat > "$TEMP_DIR/.gitignore" << 'GITIGNORE'
node_modules/
*.log
.DS_Store
GITIGNORE
git checkout --orphan gh-pages 2>/dev/null || git checkout gh-pages
find . -not -path './.git/*' -not -name '.git' -delete 2>/dev/null || true
cp -r "$TEMP_DIR/"* .
cp "$TEMP_DIR/.gitignore" .
git add -A
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "Nothing to commit"
git push origin gh-pages --force
rm -rf "$TEMP_DIR"
git checkout main
echo "✅ Deployed to https://xunema.github.io/ce-shipgen/"
