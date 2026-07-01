# Cedar Creek — Agent Workflows & Commands

## Pre-Commit Checklist
Before committing any changes:
1. Test locally: Open http://localhost:8123 in browser
2. Check the specific page you edited (home, booking, camps, explore)
3. Verify no console errors: Open DevTools (F12) → Console tab, should be clean
4. Verify links work if you changed navigation
5. Check mobile responsive if you changed layout: DevTools → toggle device toolbar
6. Only then: `! git add . && git commit -m "..."` & `! git push`

---

## Quick Edits (Copy-Paste Ready)

### Update Phone Number
- **File:** @js/site.js, line 15
- **Current:** `phone: '(214) 316-9082',`
- **Command:** Edit line 15, change phone in quotes
- **Commit:** `! git add js/site.js && git commit -m "Update phone to XXX" && git push`

### Update Email
- **File:** @js/site.js, line 14
- **Current:** `email: 'kai.willingham.work@gmail.com',`
- **Command:** Edit line 14, change email in quotes
- **Commit:** `! git add js/site.js && git commit -m "Update email to XXX" && git push`

### Change Cabin Price
- **File:** @js/data.js, line 11
- **Current:** `rate:150,` (inside LODGING array, first item)
- **Command:** Edit, change number
- **Commit:** `! git add js/data.js && git commit -m "Update cabin price to \$XXX/night" && git push`

### Change RV Spot Price
- **File:** @js/data.js, line 14
- **Current:** `rate:35,`
- **Command:** Edit, change number
- **Commit:** `! git add js/data.js && git commit -m "Update RV price to \$XXX/night" && git push`

### Change Campground Price
- **File:** @js/data.js, line 17
- **Current:** `rate:25,`
- **Command:** Edit, change number
- **Commit:** `! git add js/data.js && git commit -m "Update campground price to \$XXX/night" && git push`

### Update Hammer Camp Price
- **File:** @js/data.js, search for `hammer1315` and `hammer1517` (around line 230+)
- **Field:** `price:1200,` (adjust as needed)
- **Commit:** `! git add js/data.js && git commit -m "Update Hammer Camp pricing" && git push`

---

## Block/Unblock Dates in Calendar

### Add Blocked Dates
- **File:** @js/data.js, end of file (AVAILABILITY object)
- **Current:** 
  ```javascript
  const AVAILABILITY = {
    unavailable: [
      // { start:"2026-07-01", end:"2026-07-07" },  
    ]
  };
  ```
- **To block July 1-7:** Uncomment example or add new: `{ start:"2026-07-01", end:"2026-07-07" },`
- **Commit:** `! git add js/data.js && git commit -m "Block dates: July 1-7" && git push`

### Remove Blocked Dates
- **File:** @js/data.js, AVAILABILITY.unavailable array
- **Command:** Delete the line with the date range
- **Commit:** `! git add js/data.js && git commit -m "Unblock dates: July 1-7" && git push`

---

## Content Changes (Building/Activity Descriptions)

### Update a Building Description
- **File:** @js/data.js
- **Format:** Find `BUILDINGS.<key> = { name: "...", desc: "...", ... }`
- **Example:** `BUILDINGS.cabins = { ... desc:"Your own cabin...", ... }`
- **Steps:**
  1. Find building in BUILDINGS object
  2. Update `name`, `tagline`, `desc`, `features[]`, `stats[]` as needed
  3. **Don't change:** `out:` and `in:` image fields (require image uploads)
  4. Commit: `! git add js/data.js && git commit -m "Update [building]: [what changed]" && git push`

### Update an Activity Description
- **File:** @js/data.js, find ACTIVITIES array
- **Format:** `{ key:"...", name:"...", price:XXX, desc:"...", ... }`
- **Steps:**
  1. Find activity in array
  2. Update: `name`, `tagline`, `desc`, `price`, `day[]`, `included[]`
  3. Update season dates if needed: `season:[[month,day], [month,day]]`
  4. Commit: `! git add js/data.js && git commit -m "Update activity: [name]" && git push`

### Update Camp Description
- **File:** @js/data.js, find CAMPS array
- **Format:** Similar to activities, search for `hammer1315` or `hammer1517`
- **Editable:** `name`, `tagline`, `desc`, `price`, `weeks[]`, `includes[]`
- **Commit:** `! git add js/data.js && git commit -m "Update camp: [details]" && git push`

---

## Design Changes (Colors, Layout, Fonts)

### Change Primary Color (Forest Green)
- **File:** @css/style.css, line 1 (inside `:root { ... }`)
- **Current:** `--forest: #2d5016;`
- **Command:** Change hex color
- **Test:** `! npx http-server . -p 8123` → Refresh browser at http://localhost:8123
- **Verify:** Check home page, buttons, headings look right
- **Commit:** `! git add css/style.css && git commit -m "Update primary color" && git push`

### Change Hero Background Image
- **File:** @css/style.css, search for `.hero {`
- **Current:** `background: linear-gradient(...) url('images/about-property.jpg')`
- **To change:** Replace `about-property.jpg` with new image filename
- **Note:** Image file must exist in `images/` folder
- **Test:** Refresh browser, verify image shows
- **Commit:** `! git add css/style.css && git commit -m "Update hero image" && git push`

### Change Font (Heading or Body)
- **File:** @css/style.css, search for font-family in body or h1/h2
- **Current:** Fraunces (headings), Inter (body)
- **To change:** Update font-family property (not recommended without testing)
- **Test:** Refresh, verify readability
- **Commit:** `! git add css/style.css && git commit -m "Update font: [details]" && git push`

---

## Local Development & Testing

### Start Dev Server
```bash
! npx http-server . -p 8123
```
- Opens server at http://localhost:8123
- File changes auto-refresh in browser (just hit F5)
- DevTools available (F12) — use Console to check for errors

### Test All Pages
1. **Home:** http://localhost:8123/index.html → Check activities, buildings, map, footer
2. **Booking:** http://localhost:8123/schedule.html → Try date picker, party size, lodging selection
3. **Hammer Camp:** http://localhost:8123/hammer-camp.html → Verify camps display correctly
4. **Explore:** http://localhost:8123/explore.html → Walk around the game map
5. **Admin:** http://localhost:8123/admin.html → Test form UI

### Test on Mobile
- DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
- Test on iPhone 12 and iPad sizes
- Check that nav menu works on mobile

---

## Git Workflow

### Commit & Push (After Testing)
```bash
! git add .
! git commit -m "Update [what]: [why]"
! git push
```
- Always commit after testing locally
- Commit message format: `"Update [component]: [specific change]"`
- Examples: `"Update cabin price to $175"`, `"Block July 1-7 in calendar"`

### Deploy to Live (automated CI/CD)
A GitHub Actions pipeline (`.github/workflows/deploy.yml`) auto-deploys on push to `main`:
1. **validate** — `node --check` on every JS file (a broken commit never goes live)
2. **deploy** — publishes the static site to GitHub Pages

**To promote dev → production:**
```bash
! git checkout main
! git merge dev
! git push origin main      # requires user OK — pushes to the production branch
! git checkout dev
```
Pushing to `main` triggers the pipeline; the live site updates in ~1–2 min. No manual build steps.

**One-time activation (not yet done — user chose "set up, don't deploy"):**
- The workflow currently lives on `dev` only. It must be merged/pushed to `main` to run.
- In GitHub: **Settings → Pages → Source → "GitHub Actions"** (one-time toggle).
- Verify live at: https://kaiwillinghamwork-lang.github.io/Cedar-Creek-Adventure/
- **Only promote to main when dev is tested and ready.**

### Check Status
```bash
! git status
! git log --oneline -5
```
- `git status` shows uncommitted changes
- `git log` shows recent commits

---

## File Reference

| File | Edit For | Key Lines/Fields |
|------|----------|------------------|
| @js/site.js | Phone, email, footer | Lines 14-16 (CONTACT) |
| @js/data.js | Prices, descriptions, availability | LODGING (line 11), ACTIVITIES (line ~50), CAMPS (line ~200), AVAILABILITY (end) |
| @css/style.css | Colors, layout, fonts, hero image | :root (line 1, colors), .hero (line ~750), component classes |
| @index.html | Home page structure | Rarely edit — most content in data.js |
| @schedule.html | Booking page structure | Rarely edit — logic in js/booking.js |
| @hammer-camp.html | Camps page structure | Rarely edit — content in data.js |
| @admin.html | Admin form UI | Edit if you want to add form fields for new content |

---

## Common Mistakes to Avoid
- ❌ Commit without testing locally first
- ❌ Forget to `git push` after committing (changes stay local only)
- ❌ Edit on `main` branch instead of `dev`
- ❌ Forget quote marks or commas in js/data.js (causes errors)
- ❌ Change image filenames without uploading actual images to `images/` folder
- ✅ Always work on `dev`, test locally, commit, push, then merge to main when ready
