# Cedar Creek Hunt & Adventure Basecamp

An interactive single-page site for **Cedar Creek Hunt & Adventure Basecamp** — 28 acres on
East Fork Cedar Creek in Colville, Washington.

The page invites visitors to explore the property and the guided trips on offer:

- **Interactive site map** — a hand-drawn SVG map with clickable buildings (lodges, cabins,
  bathhouse, game processing, fire-pit area, RV/tent sites, and more).
- **Building deep-dives** — each spot opens a modal with an outside/inside view toggle, the
  "moment" it's built around, a feature list, and quick stats.
- **Guided activities menu** — hunts, fishing charters, upland & big-game seasons, rentals,
  and the Sasquatch Expedition, each with a day-by-day breakdown and what's included.
- **Live in-season badges** — activities automatically show "● ACTIVE" when today's date falls
  inside their season.

## Layout & navigation

- Sticky top navigation bar with brand and jump links (Map · Stays · Activities).
- Hero call-to-action buttons.
- Fully responsive, with a mobile-tuned layout and tap-friendly targets.
- Accessible: ARIA roles, keyboard-operable map hotspots, focus trapping in modals.

## Running it

It's a single self-contained `index.html` (HTML + CSS + JS inline, images embedded). Just open
the file in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Tech

Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies.
