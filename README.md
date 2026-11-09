# Hero's Ledger

A personal XP tracker: daily quests, skill levels, streaks, medals, achievements and titles.

- `src/app.html` is the source. Run `./build.sh` to produce `index.html` (the real app) and `preview.html` (sample data).
- Rules (level curve, streak bonuses, medal thresholds) are at the top of the script in `src/app.html` under `RULES`.
- After changing the app, bump `VERSION` in `sw.js` so phones pick up the update.
- Hosted with GitHub Pages; open the Pages URL in Safari, then Share > Add to Home Screen.
