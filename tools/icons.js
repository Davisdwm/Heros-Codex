const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.goto('file://' + path.resolve(__dirname, 'icon.html'));
  for (const s of [180, 192, 512]) {
    await p.setViewportSize({ width: s, height: s });
    await p.evaluate(s => { const e = document.getElementById('s'); e.setAttribute('width', s); e.setAttribute('height', s); }, s);
    await p.screenshot({ path: path.resolve(__dirname, `../icons/icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
