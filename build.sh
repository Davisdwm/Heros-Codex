#!/usr/bin/env bash
# Builds index.html (the real app) and preview.html (same app with sample data) from src/app.html
set -euo pipefail
cd "$(dirname "$0")"
VER=$(date -u +%Y.%m.%d-%H%M)
{
cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0f0d0c">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Codex">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}img{max-width:100%}</style>
</head>
<body>
HEAD
sed "s/__APP_VERSION__/$VER/g" src/app.html
printf '\n</body>\n</html>\n'
} > index.html
{ printf '<script>window.XP_DEMO=true</script>\n'; sed "s/__APP_VERSION__/$VER/g" src/app.html; } > preview.html
sed "s/__APP_VERSION__/$VER/g" src/sw.js > sw.js
printf '{"version":"%s"}\n' "$VER" > version.json
touch .nojekyll
echo "built version $VER"
