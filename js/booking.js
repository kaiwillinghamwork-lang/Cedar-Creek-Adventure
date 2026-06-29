/* ============================================================ */
/* booking.js — "Plan Your Stay" flow.                          */
/*   1. pick check-in / check-out dates                          */
/*   2. choose lodging (mini cabin or RV spot)                   */
/*   3. choose activities (or "just the stay")                   */
/*   On submit: show a thank-you panel with an                   */
/*   "Add to Google Calendar" link pre-filled with the trip.     */
/*   Reads the trip list from ACTIVITIES (data.js).              */
/* ============================================================ */

/* ---- lodging options (rate is per night) ---- */
const LODGING = [
  { key:'cabin', icon:'🏚️', name:'Mini Cabin',     rate:150, blurb:'Your own warm cabin tucked in the timber.' },
  { key:'rv',    icon:'🚐', name:'RV Rental Spot',  rate:35,  blurb:'Level pad with power & water for your rig.' },
];

const LOCATION = '3928 Cedar Creek Rd, Colville, WA';

/* ---- elements ---- */
const bkForm     = document.getElementById('bookingForm');
const bkIn       = document.getElementById('bkIn');
const bkOut      = document.getElementById('bkOut');
const bkNights   = document.getElementById('bkNights');
const bkLodging  = document.getElementById('bkLodging');
const bkActsWrap = document.getElementById('bkActivities');
const bkSummary  = document.getElementById('bkSummaryBody');
const bkError    = document.getElementById('bkError');
const bkDone     = document.getElementById('bkDone');
const bkDoneSum  = document.getElementById('bkDoneSummary');
const bkGcal     = document.getElementById('bkGcal');

/* ---- helpers ---- */
function todayISO(){
  const d = new Date();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function nightsBetween(inISO, outISO){
  if(!inISO || !outISO) return 0;
  const a = new Date(inISO+'T00:00:00');
  const b = new Date(outISO+'T00:00:00');
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 0;
}
function prettyDate(iso){
  if(!iso) return '';
  const d = new Date(iso+'T00:00:00');
  return d.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}
function selectedLodging(){
  const r = bkForm.querySelector('input[name="lodging"]:checked');
  return r ? LODGING.find(l => l.key === r.value) : null;
}
function selectedActivities(){
  if(bkForm.querySelector('input[name="noact"]:checked')) return [];
  return [...bkForm.querySelectorAll('input[name="act"]:checked')]
    .map(c => ACTIVITIES.find(a => a.key === c.value))
    .filter(Boolean);
}

/* ---- set sensible date minimums ---- */
bkIn.min = bkOut.min = todayISO();

/* ---- render lodging cards ---- */
bkLodging.innerHTML = LODGING.map(l => `
  <label class="bk-opt">
    <input type="radio" name="lodging" value="${l.key}">
    <span class="bk-opt-card">
      <span class="bk-opt-icon">${l.icon}</span>
      <span class="bk-opt-main">
        <span class="bk-opt-name">${l.name}</span>
        <span class="bk-opt-blurb">${l.blurb}</span>
      </span>
      <span class="bk-opt-price">$${l.rate}<small>/night</small></span>
    </span>
  </label>`).join('');

/* ---- render activity checkboxes (+ a "just the stay" option) ---- */
bkActsWrap.innerHTML =
  ACTIVITIES.map(a => `
    <label class="bk-act">
      <input type="checkbox" name="act" value="${a.key}">
      <span class="bk-act-card">
        <span class="bk-act-icon">${a.icon}</span>
        <span class="bk-act-main">
          <span class="bk-act-name">${a.name}</span>
          <span class="bk-act-short">${a.short}</span>
        </span>
      </span>
    </label>`).join('') + `
    <label class="bk-act bk-act-none">
      <input type="checkbox" name="noact" value="none">
      <span class="bk-act-card">
        <span class="bk-act-icon">🌲</span>
        <span class="bk-act-main">
          <span class="bk-act-name">No activities — just the stay</span>
          <span class="bk-act-short">Relax and take it as it comes</span>
        </span>
      </span>
    </label>`;

/* ---- "just the stay" is mutually exclusive with picking activities ---- */
const noActBox = bkForm.querySelector('input[name="noact"]');
bkActsWrap.addEventListener('change', e => {
  if(e.target.name === 'noact' && e.target.checked){
    bkForm.querySelectorAll('input[name="act"]').forEach(c => c.checked = false);
  }
  if(e.target.name === 'act' && e.target.checked){
    noActBox.checked = false;
  }
  updateSummary();
});

/* ---- live summary ---- */
function buildSummaryHTML(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodge  = selectedLodging();
  const acts   = selectedActivities();
  const justStay = !!noActBox.checked;
  const rows = [];

  if(bkIn.value && bkOut.value && nights > 0){
    rows.push(`<div class="bk-srow"><span>Dates</span><b>${prettyDate(bkIn.value)} – ${prettyDate(bkOut.value)}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Nights</span><b>${nights}</b></div>`);
  }
  if(lodge){
    rows.push(`<div class="bk-srow"><span>Lodging</span><b>${lodge.icon} ${lodge.name}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Rate</span><b>$${lodge.rate}/night</b></div>`);
  }
  if(lodge && nights > 0){
    rows.push(`<div class="bk-srow bk-total"><span>Lodging total</span><b>$${(lodge.rate*nights).toLocaleString()}</b></div>`);
  }
  if(acts.length){
    rows.push(`<div class="bk-srow bk-acts"><span>Activities</span><b>${acts.map(a=>`${a.icon} ${a.name}`).join('<br>')}</b></div>`);
  } else if(justStay){
    rows.push(`<div class="bk-srow"><span>Activities</span><b>Just the stay</b></div>`);
  }

  if(!rows.length) return '<p class="bk-empty">Your selections will show up here as you go.</p>';
  return rows.join('');
}
function updateNightsHint(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  if(bkIn.value && bkOut.value){
    bkNights.textContent = nights > 0
      ? `${nights} night${nights>1?'s':''} — ${prettyDate(bkIn.value)} to ${prettyDate(bkOut.value)}.`
      : 'Your check-out date needs to be after check-in.';
  } else {
    bkNights.textContent = "Pick your dates to see how many nights you'll stay.";
  }
}
function updateSummary(){
  updateNightsHint();
  bkSummary.innerHTML = buildSummaryHTML();
}
bkForm.addEventListener('change', updateSummary);
bkForm.addEventListener('input', updateSummary);

/* keep check-out at or after check-in */
bkIn.addEventListener('change', () => {
  bkOut.min = bkIn.value || todayISO();
  if(bkOut.value && bkOut.value < bkIn.value) bkOut.value = '';
  updateSummary();
});

/* ---- Google Calendar link ---- */
function gcalUrl(trip){
  const stamp = iso => iso.replace(/-/g,'');           // 2026-07-01 -> 20260701
  const title = `Cedar Creek Basecamp — ${trip.lodge.name} stay`;
  const detailLines = [
    `Stay at Cedar Creek Hunt & Adventure Basecamp.`,
    ``,
    `Lodging: ${trip.lodge.name} ($${trip.lodge.rate}/night)`,
    `Nights: ${trip.nights} (${prettyDate(trip.in)} – ${prettyDate(trip.out)})`,
    `Lodging total: $${(trip.lodge.rate*trip.nights).toLocaleString()}`,
    trip.acts.length
      ? `Activities: ${trip.acts.map(a=>a.name).join(', ')}`
      : `Activities: just the stay`,
  ];
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${stamp(trip.in)}/${stamp(trip.out)}`,    // all-day, end is exclusive = check-out
    details: detailLines.join('\n'),
    location: LOCATION,
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

/* ---- finish: validate, then show the thank-you panel ---- */
function showError(msg){
  bkError.textContent = msg;
  bkError.hidden = false;
}
bkForm.addEventListener('submit', e => {
  e.preventDefault();
  bkError.hidden = true;

  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodge  = selectedLodging();

  if(!bkIn.value || !bkOut.value){ showError('Please pick your check-in and check-out dates.'); return; }
  if(nights < 1){ showError('Your check-out date needs to be after your check-in date.'); return; }
  if(!lodge){ showError('Please choose where you’ll stay.'); return; }

  const trip = { in: bkIn.value, out: bkOut.value, nights, lodge, acts: selectedActivities() };

  bkDoneSum.innerHTML = buildSummaryHTML();
  bkGcal.href = gcalUrl(trip);

  bkForm.parentElement.hidden = true;   // hide form + summary
  bkDone.hidden = false;
  bkDone.scrollIntoView({ behavior:'smooth', block:'start' });
});

/* ---- "Change my trip" goes back to the form ---- */
document.getElementById('bkEdit').addEventListener('click', () => {
  bkDone.hidden = true;
  bkForm.parentElement.hidden = false;
  document.getElementById('book').scrollIntoView({ behavior:'smooth', block:'start' });
});
