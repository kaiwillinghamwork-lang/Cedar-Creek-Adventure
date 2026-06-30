# Cedar Creek Hunt & Adventure Basecamp — Claude Guidelines

## Project Overview
Static website for a 28-acre adventure property in Colville, WA. Features: guided hunts, RV/cabin rentals, boys camps, interactive property map game, date-based booking.

**Repository:** https://github.com/kaiwillinghamwork-lang/Cedar-Creek-Adventure  
**Live Site:** https://kaiwillinghamwork-lang.github.io/Cedar-Creek-Adventure/ (deploys from `main` branch)  
**Dev Branch:** `dev` (for development work before merging to main)

## Tech Stack
- **Vanilla HTML/CSS/JS** — no build step, no framework
- **Static site** — GitHub Pages hosting
- **No backend** — bookings/inquiries sent via mailto or Formspree
- **Local preview:** `npx http-server . -p 8123`

## Key Files & Systems

### Content (all user-facing data)
- **@js/data.js** — Buildings, activities, camp schedules, availability calendar
- **@js/site.js** — Contact info, shared header/footer, site chrome
- **@css/style.css** — Design system (custom properties: --forest, --cedar, --sand, etc.)

### Pages
- **@index.html** — Home: activities menu, building cards, SVG property map, Google Maps embed
- **@schedule.html** — Plan a Stay: date picker, party size, lodging selection → booking summary
- **@hammer-camp.html** — Boys camps (ages 13-15, 15-17)
- **@explore.html** — Interactive Pokémon-style game property tour
- **@admin.html** — Simple form UI to generate code for editing data.js/site.js (copy-paste into files, no auto-save)

### Game System
- **@js/game.js** — Canvas-based walkable property map
- **@js/world.js** — Game map data (tile grid, building positions, NPCs)
- **@js/calendar.js** — Date-range picker for bookings

## Business Context

### Contact & Booking
- **Phone:** (214) 316-9082
- **Email:** kai.willingham.work@gmail.com (placeholder for now)
- **Formspree:** Not set up yet (optional—if configured, booking requests post directly instead of opening email)
- Inquiries currently open visitor's email app (mailto: links)

### Pricing (all placeholders, confirm with Mykle)
- **Cabin:** $150/night (sleeps 4)
- **RV spot:** $35/night
- **Campground:** $25/night
- **Hammer Camp:** $1200/week (varies by age group)
- **Tax:** ~8.1% (Colville, WA)

### Availability
- **AVAILABILITY** in data.js: array of blocked date ranges; calendar shows these as disabled
- Edit format: `{ start:"2026-07-01", end:"2026-07-07" }`

## Workflow

### Making Changes
1. Work on `dev` branch
2. Edit files or use @admin.html UI (copy generated code into data files, commit manually)
3. Test locally: `npx http-server . -p 8123` → http://localhost:8123
4. Commit: `git add . && git commit -m "..."` && `git push`
5. When ready to deploy: merge `dev` → `main`, Pages auto-builds ~1min

### Common Tasks
- **Edit contact info:** admin.html → Contact tab → copy CONTACT code into js/site.js
- **Block booking dates:** admin.html → Availability tab → copy AVAILABILITY code into js/data.js
- **Update building/activity descriptions:** edit js/data.js directly (buildings, activities arrays)
- **Change prices:** edit js/data.js (rate, price fields in LODGING, ACTIVITIES, CAMPS)
- **Adjust design:** edit css/style.css (custom properties or component classes)

## Known Limitations & Future Work
- **Map editor:** Planned but not built (user chose this, got redirected to other tasks)
- **Payment processing:** Not implemented (site captures inquiries only)
- **Formspree:** Optional—set up if you want booking emails without opening visitor's email app
- **Analytics:** Not set up (after launch)
- **SEO:** Meta descriptions + og: tags added; no sitemap/structured data yet

## Git Branches
- `main` — Live site (GitHub Pages)
- `dev` — Development (work here, merge to main when ready)

## Quick Commands
- Start dev server: `npx http-server . -p 8123`
- View local site: http://localhost:8123
- Commit & push: `git add . && git commit -m "..." && git push`
- Merge dev→main: `git checkout main && git merge dev && git push`
