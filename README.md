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
- **Plan Your Stay** — pick check-in/check-out dates, choose lodging (Mini Cabin $150/night or
  RV spot $35/night), select activities (or "just the stay"), and add the whole trip to Google
  Calendar with one click.

## Layout & navigation

- Sticky top navigation bar with brand and jump links (Map · Stays · Activities).
- Hero call-to-action buttons.
- Fully responsive, with a mobile-tuned layout and tap-friendly targets.
- Accessible: ARIA roles, keyboard-operable map hotspots, focus trapping in modals.

## Project structure

```
index.html        the full interactive site (home page)
coming-soon.html  optional pre-launch splash (SEO meta + GA4 placeholder), not linked
robots.txt        allows crawlers
css/style.css     all styling
js/data.js        content: every building and activity (loaded first)
js/app.js         behavior: renders cards, wires the map, opens modals
js/booking.js     "Plan Your Stay" flow + Add-to-Google-Calendar link
images/           building & activity photos
```

`data.js` is where you edit what a building or trip *says*; `app.js` is the behavior.

### Optional: show "Coming Soon" instead

A branded **Coming Soon** splash is kept in `coming-soon.html` (with SEO meta tags and a
Google Analytics placeholder). To gate the site before launch, swap the two files — make
`coming-soon.html` the `index.html`, and move the full site to another name.

## Running it

Because the page loads `css/`, `js/`, and `images/` as separate files, open it through a local
server rather than the bare file:// path:

```bash
npx serve .
```

Then visit the printed URL.

## Tech

Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies.
