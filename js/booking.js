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
const TAX_RATE = 0.081;   // ~8.1% (Colville, WA) — change to your real rate

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
  return [...bkForm.querySelectorAll('input[name="act"]:checked')].map(c => {
    const a = ACTIVITIES.find(x => x.key === c.value);
    if(!a) return null;
    let price = a.price || 0, optionLabel = '';
    if(a.options && a.options.length){
      const sel = bkForm.querySelector(`.bk-act-opt[data-key="${a.key}"]`);
      const o = a.options[sel ? +sel.value : 0] || a.options[0];
      price = o.price; optionLabel = o.label;
    }
    return { key:a.key, name:a.name, icon:a.icon, price, optionLabel };
  }).filter(Boolean);
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
  ACTIVITIES.map(a => {
    const right = (a.options && a.options.length)
      ? `<select class="bk-act-opt" data-key="${a.key}" aria-label="${a.name} option">`
          + a.options.map((o,i) => `<option value="${i}">${o.label} — $${o.price.toLocaleString()}</option>`).join('')
        + `</select>`
      : `<span class="bk-act-price">$${(a.price||0).toLocaleString()}</span>`;
    return `
    <label class="bk-act">
      <input type="checkbox" name="act" value="${a.key}">
      <span class="bk-act-card">
        <span class="bk-act-icon">${a.icon}</span>
        <span class="bk-act-main">
          <span class="bk-act-name">${a.name}</span>
          <span class="bk-act-short">${a.short}</span>
        </span>
        ${right}
      </span>
    </label>`;
  }).join('') + `
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
// option dropdowns shouldn't toggle the activity checkbox when clicked
bkActsWrap.querySelectorAll('.bk-act-opt').forEach(sel =>
  sel.addEventListener('click', e => e.stopPropagation()));

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
function money(n){ return '$' + Math.round(n).toLocaleString(); }
function computeTotals(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodge  = selectedLodging();
  const acts   = selectedActivities();
  const lodgingTotal    = (lodge && nights > 0) ? lodge.rate * nights : 0;
  const activitiesTotal = acts.reduce((s,a) => s + (a.price || 0), 0);
  const subtotal = lodgingTotal + activitiesTotal;
  const tax = subtotal * TAX_RATE;
  return { nights, lodge, acts, lodgingTotal, activitiesTotal, subtotal, tax, total: subtotal + tax };
}
function buildSummaryHTML(){
  const t = computeTotals();
  const justStay = !!noActBox.checked;
  const rows = [];
  if(bkIn.value && bkOut.value && t.nights > 0){
    rows.push(`<div class="bk-srow"><span>Dates</span><b>${prettyDate(bkIn.value)} – ${prettyDate(bkOut.value)}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Nights</span><b>${t.nights}</b></div>`);
  }
  if(t.lodge){
    rows.push(`<div class="bk-srow"><span>${t.lodge.name}</span><b>$${t.lodge.rate}/night</b></div>`);
    if(t.nights > 0)
      rows.push(`<div class="bk-srow"><span>Lodging (${t.nights} night${t.nights>1?'s':''})</span><b>${money(t.lodgingTotal)}</b></div>`);
  }
  if(t.acts.length)
    rows.push(`<div class="bk-srow bk-acts"><span>Activities</span><b>${t.acts.map(a=>`${a.icon} ${a.name}${a.optionLabel?` (${a.optionLabel})`:''} — ${money(a.price)}`).join('<br>')}</b></div>`);
  else if(justStay)
    rows.push(`<div class="bk-srow"><span>Activities</span><b>Just the stay</b></div>`);
  if(t.subtotal > 0){
    rows.push(`<div class="bk-srow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Tax (${(TAX_RATE*100).toFixed(1)}%)</span><b>${money(t.tax)}</b></div>`);
    rows.push(`<div class="bk-srow bk-total"><span>Total</span><b>${money(t.total)}</b></div>`);
  }
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
  const t = computeTotals();
  const title = `Cedar Creek Basecamp — ${t.lodge.name} stay`;
  const details = [
    'Stay at Cedar Creek Hunt & Adventure Basecamp.', '',
    `Lodging: ${t.lodge.name} ($${t.lodge.rate}/night)`,
    `Nights: ${t.nights} (${prettyDate(trip.in)} – ${prettyDate(trip.out)})`,
    `Lodging total: ${money(t.lodgingTotal)}`,
    t.acts.length ? `Activities: ${t.acts.map(a=>`${a.name}${a.optionLabel?` — ${a.optionLabel}`:''} (${money(a.price)})`).join(', ')}` : 'Activities: just the stay',
    '',
    `Subtotal: ${money(t.subtotal)}`,
    `Tax (${(TAX_RATE*100).toFixed(1)}%): ${money(t.tax)}`,
    `Total: ${money(t.total)}`,
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
