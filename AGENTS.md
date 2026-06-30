# Cedar Creek — Reusable Agent Workflows

## Pattern: Edit Content (Contact, Availability, Prices)

**When:** User wants to change contact info, block dates, update prices  
**How:** Read @js/data.js and @js/site.js → identify field → edit → commit → push

### Contact Info Changes
1. Read @js/site.js (CONTACT object, lines 13-17)
2. Update email/phone/formspree
3. Commit: `git add js/site.js && git commit -m "Update contact info"`
4. Push

### Block/Unblock Dates
1. Read @js/data.js (AVAILABILITY object at end)
2. Add/remove date ranges: `{ start:"YYYY-MM-DD", end:"YYYY-MM-DD" }`
3. Commit: `git add js/data.js && git commit -m "Update availability: [what changed]"`
4. Push

### Update Prices (Lodging, Activities, Camps)
1. Read @js/data.js
2. Find LODGING array (cabin, rv, camp rates)
3. Find ACTIVITIES array (price field)
4. Find CAMPS array (price field)
5. Update values
6. Commit: `git add js/data.js && git commit -m "Update pricing: [what changed]"`
7. Push

## Pattern: Edit Descriptions & Content

**When:** User wants to change building/activity descriptions, images, features  
**How:** Read @js/data.js (BUILDINGS, ACTIVITIES, CAMPS) → edit → commit → push

### Building Changes (name, description, features, images)
1. Read @js/data.js (find BUILDINGS object)
2. Locate building by key (e.g., BUILDINGS.cabins)
3. Edit: name, tagline, desc, features[], stats[], out/in images
4. Commit: `git add js/data.js && git commit -m "Update [building name]: [what changed]"`
5. Push

### Activity Changes (name, description, price, season, options)
1. Read @js/data.js (find ACTIVITIES array)
2. Locate activity by key
3. Edit: name, tagline, desc, price, day[], included[], season (dates), stats[]
4. Commit: `git add js/data.js && git commit -m "Update [activity name]: [what changed]"`
5. Push

### Camp Changes (name, description, price, weeks)
1. Read @js/data.js (find CAMPS array)
2. Locate camp by key
3. Edit: name, tagline, desc, price, weeks[], includes[]
4. Commit: `git add js/data.js && git commit -m "Update [camp name]: [what changed]"`
5. Push

## Pattern: Design Changes

**When:** User wants to change colors, fonts, layout, spacing  
**How:** Read @css/style.css → edit (prefer custom properties) → commit → push

### Color/Theme Changes
1. Read @css/style.css (top section, :root variables)
2. Custom properties: --forest, --cedar, --sand, --accent, etc.
3. Prefer editing CSS variables over hardcoding colors
4. Commit: `git add css/style.css && git commit -m "Update [component]: [change]"`
5. Push

### Layout/Component Changes
1. Read @css/style.css (find component by class name)
2. Edit: grid, flexbox, margins, padding, borders, etc.
3. Test locally: `! npx http-server . -p 8123` → preview browser
4. Commit: `git add css/style.css && git commit -m "Update [component]: [change]"`
5. Push

## Pattern: Deploy to Live

**When:** Dev branch is ready, deploy changes to production  
**How:** Merge dev→main → GitHub Pages auto-builds (~1 min)

1. Ensure all changes committed on `dev`: `! git status`
2. Switch to main: `! git checkout main`
3. Merge dev: `! git merge dev`
4. Push: `! git push origin main`
5. Wait ~1 min, verify at https://kaiwillinghamwork-lang.github.io/Cedar-Creek-Adventure/

## Pattern: Local Testing

**When:** Making changes, want to preview before committing  
**How:** Run dev server, edit files, refresh browser

1. Start server in background: `! npx http-server . -p 8123 &`
2. Open http://localhost:8123
3. Make file edits
4. Refresh browser to see changes
5. When happy, commit & push

## File Paths & Quick Links

| File | Purpose |
|------|---------|
| @js/data.js | Buildings, activities, camps, availability — all user-facing content |
| @js/site.js | Contact info, header/footer chrome |
| @css/style.css | Colors, layout, components |
| @index.html | Home page structure |
| @schedule.html | Booking flow |
| @hammer-camp.html | Camps page |
| @explore.html | Game/property tour page |
| @admin.html | Form UI for generating code (not auto-save) |

## Notes
- Always work on `dev` branch unless deploying
- Use `@file` to pull files directly into context (faster)
- Use `!` to run shell commands (faster than asking)
- Commit messages should be clear: "Update [what]: [why or what changed]"
- After committing on dev, always push so changes sync
