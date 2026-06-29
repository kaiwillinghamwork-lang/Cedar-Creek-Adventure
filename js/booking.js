/* ============================================================ */
/* booking.js — "Plan Your Stay" flow (schedule.html).          */
/*   1. pick dates with the calendar (calendar.js → #bkIn/#bkOut)*/
/*   2. choose lodging — Mini Cabin (opens the cabin modal with  */
/*      a Confirm button) or RV Rental Spot                      */
/*   3. choose activities (or "just the stay")                   */
/*   On finish: a thank-you panel + an "Add to Google Calendar"  */
/*   link pre-filled with the trip.                              */
/*   Reads BUILDINGS + ACTIVITIES from data.js.                  */
/* ============================================================ */

const LODGING = [
  { key:'cabin', name:'Mini Cabin',    rate:150, modal:'cabins',
    blurb:'Your own warm cabin tucked in the timber.' },
  { key:'rv',    name:'RV Rental Spot', rate:35,  icon:'🚐',
    blurb:'Level pad with power & water for your rig.' },
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
function nightsBetween(a,b){
  if(!a || !b) return 0;
  const n = Math.round((new Date(b+'T00:00:00') - new Date(a+'T00:00:00')) / 86400000);
  return n > 0 ? n : 0;
}
function prettyDate(iso){
  if(!iso) return '';
  return new Date(iso+'T00:00:00').toLocaleDateString(undefined,{ month:'short', day:'numeric', year:'numeric' });
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

/* ---- render lodging options ---- */
bkLodging.innerHTML = LODGING.map(l => {
  const thumb = l.modal && typeof BUILDINGS !== 'undefined' && BUILDINGS[l.modal]
    ? `<span class="bk-opt-thumb">${BUILDINGS[l.modal].out}</span>`
    : `<span class="bk-opt-icon">${l.icon || '🏕️'}</span>`;
  const cue = l.modal ? `<span class="bk-opt-cue">Tap to see inside →</span>` : '';
  return `
  <label class="bk-opt" data-key="${l.key}" ${l.modal?`data-modal="${l.modal}"`:''}>
    <input type="radio" name="lodging" value="${l.key}">
    <span class="bk-opt-card">
      ${thumb}
      <span class="bk-opt-main">
        <span class="bk-opt-name">${l.name}</span>
        <span class="bk-opt-blurb">${l.blurb}</span>
        ${cue}
      </span>
      <span class="bk-opt-price">$${l.rate}<small>/night</small></span>
    </span>
  </label>`;
}).join('');

/* ---- render activity checkboxes (+ "just the stay") ---- */
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

const noActBox = bkForm.querySelector('input[name="noact"]');
bkActsWrap.addEventListener('change', e => {
  if(e.target.name === 'noact' && e.target.checked)
    bkForm.querySelectorAll('input[name="act"]').forEach(c => c.checked = false);
  if(e.target.name === 'act' && e.target.checked) noActBox.checked = false;
  updateSummary();
});

/* ============ MINI CABIN → building modal with Confirm ============ */
const cabinBackdrop = document.getElementById('backdrop');
function fillCabinModal(){
  const b = BUILDINGS.cabins;
  document.getElementById('mTitle').textContent = b.name;
  document.getElementById('mTagline').textContent = b.tagline;
  const ml = document.getElementById('mMoment');
  if(b.peak){ ml.textContent = '“'+b.peak+'”'; ml.style.display=''; } else ml.style.display='none';
  document.getElementById('mDesc').textContent = b.desc;
  document.getElementById('paneOut').innerHTML = b.out;
  document.getElementById('paneIn').innerHTML = b.in;
  document.getElementById('mFeatures').innerHTML = b.features.map(f=>`<li>${f}</li>`).join('');
  document.getElementById('mStats').innerHTML = b.stats.map(s=>`<div class="stat"><b>${s[1]}</b>${s[0]}</div>`).join('');
  setCabinView('out');
}
function setCabinView(v){
  const isOut = v==='out';
  document.getElementById('tabOut').classList.toggle('active', isOut);
  document.getElementById('tabIn').classList.toggle('active', !isOut);
  document.getElementById('paneOut').classList.toggle('active', isOut);
  document.getElementById('paneIn').classList.toggle('active', !isOut);
}
function openCabinModal(){
  if(typeof BUILDINGS === 'undefined' || !BUILDINGS.cabins) return;
  fillCabinModal();
  cabinBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCabinModal(){
  cabinBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
if(cabinBackdrop){
  document.getElementById('tabOut').addEventListener('click', () => setCabinView('out'));
  document.getElementById('tabIn').addEventListener('click', () => setCabinView('in'));
  document.getElementById('closeBtn').addEventListener('click', closeCabinModal);
  cabinBackdrop.addEventListener('click', e => { if(e.target===cabinBackdrop) closeCabinModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeCabinModal(); });
  // Confirm = choose the Mini Cabin
  document.getElementById('cabinConfirm').addEventListener('click', () => {
    const radio = bkForm.querySelector('input[name="lodging"][value="cabin"]');
    radio.checked = true;
    closeCabinModal();
    updateSummary();
  });
}
// clicking the Mini Cabin option opens the modal instead of selecting directly
bkLodging.addEventListener('click', e => {
  const opt = e.target.closest('.bk-opt[data-modal]');
  if(opt){ e.preventDefault(); openCabinModal(); }
});

/* ---- summary ---- */
function updateNightsHint(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  if(bkIn.value && bkOut.value){
    bkNights.textContent = nights > 0
      ? `${nights} night${nights>1?'s':''} — ${prettyDate(bkIn.value)} to ${prettyDate(bkOut.value)}.`
      : 'Your check-out date needs to be after check-in.';
  } else {
    bkNights.textContent = 'Pick your dates above to see how many nights you’ll stay.';
  }
}
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
    rows.push(`<div class="bk-srow"><span>Lodging</span><b>${lodge.name}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Rate</span><b>$${lodge.rate}/night</b></div>`);
  }
  if(lodge && nights > 0)
    rows.push(`<div class="bk-srow bk-total"><span>Lodging total</span><b>$${(lodge.rate*nights).toLocaleString()}</b></div>`);
  if(acts.length)
    rows.push(`<div class="bk-srow bk-acts"><span>Activities</span><b>${acts.map(a=>`${a.icon} ${a.name}`).join('<br>')}</b></div>`);
  else if(justStay)
    rows.push(`<div class="bk-srow"><span>Activities</span><b>Just the stay</b></div>`);
  return rows.length ? rows.join('') : '<p class="bk-empty">Your selections will show up here as you go.</p>';
}
function updateSummary(){
  updateNightsHint();
  bkSummary.innerHTML = buildSummaryHTML();
}
bkForm.addEventListener('change', updateSummary);

/* ---- Google Calendar link ---- */
function gcalUrl(trip){
  const stamp = iso => iso.replace(/-/g,'');
  const title = `Cedar Creek Basecamp — ${trip.lodge.name} stay`;
  const details = [
    'Stay at Cedar Creek Hunt & Adventure Basecamp.', '',
    `Lodging: ${trip.lodge.name} ($${trip.lodge.rate}/night)`,
    `Nights: ${trip.nights} (${prettyDate(trip.in)} – ${prettyDate(trip.out)})`,
    `Lodging total: $${(trip.lodge.rate*trip.nights).toLocaleString()}`,
    trip.acts.length ? `Activities: ${trip.acts.map(a=>a.name).join(', ')}` : 'Activities: just the stay',
  ].join('\n');
  const params = new URLSearchParams({
    action:'TEMPLATE', text:title,
    dates:`${stamp(trip.in)}/${stamp(trip.out)}`,
    details, location:LOCATION,
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

/* ---- finish ---- */
function showError(msg){ bkError.textContent = msg; bkError.hidden = false; }
bkForm.addEventListener('submit', e => {
  e.preventDefault();
  bkError.hidden = true;
  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodge  = selectedLodging();
  if(!bkIn.value || !bkOut.value){ showError('Please pick your dates.'); return; }
  if(nights < 1){ showError('Your check-out date needs to be after your check-in date.'); return; }
  if(!lodge){ showError('Please choose where you’ll stay.'); return; }

  const trip = { in:bkIn.value, out:bkOut.value, nights, lodge, acts:selectedActivities() };
  bkDoneSum.innerHTML = buildSummaryHTML();
  bkGcal.href = gcalUrl(trip);
  bkForm.parentElement.hidden = true;
  bkDone.hidden = false;
  bkDone.scrollIntoView({ behavior:'smooth', block:'start' });
});
document.getElementById('bkEdit').addEventListener('click', () => {
  bkDone.hidden = true;
  bkForm.parentElement.hidden = false;
  document.getElementById('book').scrollIntoView({ behavior:'smooth', block:'start' });
});

updateSummary();
