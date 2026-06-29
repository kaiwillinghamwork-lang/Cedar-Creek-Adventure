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

## Status: pre-launch

The public home page is a branded **Coming Soon** splash while we set up SEO, analytics, and
brand. The full interactive site is built and lives at **`/preview.html`** (marked `noindex`
and disallowed in `robots.txt`, so it stays out of search results until launch). Swap the two
when you're ready to go live.

## Project structure

```
index.html        public "Coming Soon" splash (SEO meta + GA4 placeholder)
preview.html      the full interactive site (internal, noindex until launch)
robots.txt        allows the home page, disallows /preview.html
css/style.css     all styling for the full site
js/data.js        content: every building and activity (loaded first)
js/app.js         behavior: renders cards, wires the map, opens modals
js/booking.js     "Plan Your Stay" flow + Add-to-Google-Calendar link
images/           building & activity photos
```

`data.js` is where you edit what a building or trip *says*; `app.js` is the behavior.

### Going live later

1. Rename `preview.html` → `index.html` (replacing the splash), or copy its content over.
2. Remove the `noindex` meta tag from the file and drop the `Disallow: /preview.html` line.
3. Add your real Google Analytics ID (see the placeholder in `index.html`).

## Running it

Because the page loads `css/`, `js/`, and `images/` as separate files, open it through a local
server rather than the bare file:// path:

```bash
npx serve .
```

Then visit the printed URL.

## Tech

Plain HTML, CSS, and vanilla JavaScript — no build step, no dependencies.
