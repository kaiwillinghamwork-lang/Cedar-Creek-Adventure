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

## Pages

- **Home** (`index.html`) — hero, interactive map, building cards, activities side menu.
- **About** (`about.html`) — the story and the team (Kai, Mykle, Taylor) with a property photo.
- **Plan a Stay** (`schedule.html`) — the booking flow with a two-month calendar date picker.
  Activities carry prices that add into a subtotal, and tax is applied for the final total.
- **Log in / Sign up** (`login.html`) — easy account creation, including a "Continue with
  Google" button (demo auth, see note below).

Hovering the logo / brand at the top-left opens the Activities menu on the home page.

Activity prices live in `js/data.js` (the `price` field on each activity) and the tax rate is
`TAX_RATE` near the top of `js/booking.js` (default ~8.1%) — adjust both to your real numbers.

## Layout & navigation

- Shared logo nav + footer on every page (built by `js/site.js`), using the circular crest logo.
- Two-month, flip-through calendar date-range picker on the scheduling page.
- The Mini Cabin lodging option opens the same building modal as the map, with a Confirm button.
- Fully responsive, with a mobile-tuned layout and tap-friendly targets.
- Accessible: ARIA roles, keyboard-operable map hotspots, focus trapping in modals.

## Project structure

```
index.html        home — full interactive site
about.html        About Us page
schedule.html     Plan Your Stay (calendar + lodging + activities + Google Calendar)
login.html        log in / sign up
coming-soon.html  optional pre-launch splash (SEO meta + GA4 placeholder), not linked
robots.txt        allows crawlers
css/style.css     all styling
js/site.js        shared logo header + footer (+ logged-in nav state)
js/data.js        content: every building and activity (loaded first)
js/app.js         home behavior: renders cards, wires the map, opens modals
js/calendar.js    two-month date-range picker (feeds the booking form)
js/booking.js     Plan Your Stay flow + Mini Cabin modal + Add-to-Google-Calendar
js/auth.js        login / sign up (localStorage demo)
images/           logo, building & activity photos, About photo
```

`data.js` is where you edit what a building or trip *says*; `app.js` is the home behavior.

## Note on login (important)

`auth.js` is a **front-end-only demo** — accounts are stored in the browser's `localStorage`
on the visitor's device. It is **not** real security and does not talk to a server. Before
launch, swap `createUser()` / `signIn()` for a real backend (e.g. Firebase Auth or Supabase);
the rest of the UI can stay as-is.

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
