/* ============================================================ */
/* booking.js — "Plan Your Stay" flow (schedule.html).          */
/*   1. pick dates with the calendar (calendar.js → #bkIn/#bkOut)*/
/*   2. choose lodging — Mini Cabin (opens the cabin modal with  */
/*      a Confirm button) or RV Rental Spot                      */
/*   3. choose activities — click one to open a popup and pick   */
/*      an option; out-of-season activities are grayed out       */
/*   On finish: a thank-you panel + an "Add to Google Calendar"  */
/*   link, with a priced subtotal, tax, and total.              */
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

/* activity-options popup */
const actOptBackdrop = document.getElementById('actOptBackdrop');
const actOptTitle    = document.getElementById('actOptTitle');
const actOptTagline  = document.getElementById('actOptTagline');
const actOptDesc     = document.getElementById('actOptDesc');
const actOptList     = document.getElementById('actOptList');

/* ---- selection state ---- */
let chosen = {};       // { activityKey: optionIndex }
let justStay = false;  // "no activities — just the stay"

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
function money(n){ return '$' + Math.round(n).toLocaleString(); }
function activityOption(a, idx){
  if(a.options && a.options.length) return a.options[idx] || a.options[0];
  return { label:'', price:a.price || 0 };
}

/* ---- is an activity available during the selected stay? ---- */
function dayInSeason(md, season){
  const s = season[0][0]*100 + season[0][1];
  const e = season[1][0]*100 + season[1][1];
  return s <= e ? (md >= s && md <= e) : (md >= s || md <= e);   // handles seasons that wrap the new year
}
function activityInSeasonForStay(a, startISO, endISO){
  if(!a.season) return true;
  if(!startISO || !endISO) return true;      // no dates chosen yet → don't restrict
  const start = new Date(startISO+'T00:00:00'), end = new Date(endISO+'T00:00:00');
  for(let d = new Date(start), i = 0; d < end && i < 366; d.setDate(d.getDate()+1), i++){
    if(dayInSeason((d.getMonth()+1)*100 + d.getDate(), a.season)) return true;
  }
  return false;
}

function selectedLodging(){
  const r = bkForm.querySelector('input[name="lodging"]:checked');
  return r ? LODGING.find(l => l.key === r.value) : null;
}
function selectedActivities(){
  if(justStay) return [];
  return Object.keys(chosen).map(key => {
    const a = ACTIVITIES.find(x => x.key === key);
    if(!a) return null;
    const o = activityOption(a, chosen[key]);
    return { key, name:a.name, icon:a.icon, price:o.price, optionLabel:o.label };
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

/* ============ ACTIVITIES (click to open the options popup) ============ */
function renderActivities(){
  // drop anything that's now out of season for the chosen dates
  Object.keys(chosen).forEach(key => {
    const a = ACTIVITIES.find(x => x.key === key);
    if(a && !activityInSeasonForStay(a, bkIn.value, bkOut.value)) delete chosen[key];
  });

  const cards = ACTIVITIES.map(a => {
    const ok = activityInSeasonForStay(a, bkIn.value, bkOut.value);
    const isChosen = Object.prototype.hasOwnProperty.call(chosen, a.key);
    const opt = isChosen ? activityOption(a, chosen[a.key]) : null;
    let right;
    if(!ok)            right = `<span class="bk-act-season">Out of season</span>`;
    else if(isChosen)  right = `<span class="bk-act-chosen">${opt.label?opt.label+' · ':''}${money(opt.price)}</span>`
                             + `<button type="button" class="bk-act-remove" data-remove="${a.key}" aria-label="Remove ${a.name}">✕</button>`;
    else               right = `<span class="bk-act-cta">Choose →</span>`;
    return `
    <div class="bk-pick${isChosen?' chosen':''}${ok?'':' out-of-season'}" ${ok?`data-key="${a.key}" role="button" tabindex="0"`:'aria-disabled="true"'}>
      <span class="bk-act-card">
        <span class="bk-act-icon">${a.icon}</span>
        <span class="bk-act-main">
          <span class="bk-act-name">${a.name}</span>
          <span class="bk-act-short">${a.short}</span>
        </span>
        ${right}
      </span>
    </div>`;
  }).join('');

  const none = `
    <div class="bk-pick bk-pick-none${justStay?' chosen':''}" data-none="1" role="button" tabindex="0">
      <span class="bk-act-card">
        <span class="bk-act-icon">🌲</span>
        <span class="bk-act-main">
          <span class="bk-act-name">No activities — just the stay</span>
          <span class="bk-act-short">Relax and take it as it comes</span>
        </span>
        ${justStay?'<span class="bk-act-chosen">Selected</span>':'<span class="bk-act-cta">Choose →</span>'}
      </span>
    </div>`;

  bkActsWrap.innerHTML = cards + none;
}

bkActsWrap.addEventListener('click', e => {
  const remove = e.target.closest('[data-remove]');
  if(remove){ delete chosen[remove.dataset.remove]; renderActivities(); updateSummary(); return; }
  const none = e.target.closest('[data-none]');
  if(none){ justStay = !justStay; if(justStay) chosen = {}; renderActivities(); updateSummary(); return; }
  const card = e.target.closest('.bk-pick[data-key]');
  if(card) openActivityOptions(card.dataset.key);
});
bkActsWrap.addEventListener('keydown', e => {
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.bk-pick[data-key], [data-none]');
  if(card){ e.preventDefault(); card.click(); }
});

/* ---- the options popup ---- */
function openActivityOptions(key){
  const a = ACTIVITIES.find(x => x.key === key);
  if(!a) return;
  actOptTitle.textContent = a.name;
  actOptTagline.textContent = a.tagline || '';
  actOptDesc.textContent = a.short || '';
  const opts = (a.options && a.options.length) ? a.options : [{ label:'Book this trip', price:a.price || 0 }];
  actOptList.innerHTML = opts.map((o,i) => `
      <button type="button" class="act-opt-choice${chosen[key]===i?' current':''}" data-key="${key}" data-idx="${i}">
        <span class="act-opt-label">${o.label}${chosen[key]===i?' <small>✓ selected</small>':''}</span>
        <span class="act-opt-price">${money(o.price)}</span>
      </button>`).join('')
    + (Object.prototype.hasOwnProperty.call(chosen, key)
        ? `<button type="button" class="act-opt-remove" data-remove="${key}">Remove from trip</button>` : '');
  actOptBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeActivityOptions(){
  actOptBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}
actOptList.addEventListener('click', e => {
  const choice = e.target.closest('.act-opt-choice');
  if(choice){ chosen[choice.dataset.key] = +choice.dataset.idx; justStay = false; closeActivityOptions(); renderActivities(); updateSummary(); return; }
  const rem = e.target.closest('.act-opt-remove');
  if(rem){ delete chosen[rem.dataset.remove]; closeActivityOptions(); renderActivities(); updateSummary(); }
});
document.getElementById('actOptClose').addEventListener('click', closeActivityOptions);
actOptBackdrop.addEventListener('click', e => { if(e.target === actOptBackdrop) closeActivityOptions(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeActivityOptions(); });

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
  document.getElementById('cabinConfirm').addEventListener('click', () => {
    const radio = bkForm.querySelector('input[name="lodging"][value="cabin"]');
    radio.checked = true;
    closeCabinModal();
    updateSummary();
  });
}
bkLodging.addEventListener('click', e => {
  const opt = e.target.closest('.bk-opt[data-modal]');
  if(opt){ e.preventDefault(); openCabinModal(); }
});

/* ---- summary + totals ---- */
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
function computeTotals(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodge  = selectedLodging();
  const acts   = selectedActivities();
  const lodgingTotal    = (lodge && nights > 0) ? lodge.rate * nights : 0;
  const activitiesTotal = acts.reduce((s,a) => s + (a.price || 0), 0);
  const subtotal = lodgingTotal + activitiesTotal;
  const tax = subtotal * TAX_RATE;
  return { nights, lodge, acts, lodgingTotal, subtotal, tax, total: subtotal + tax };
}
function buildSummaryHTML(){
  const t = computeTotals();
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
  renderActivities();
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

  const trip = { in:bkIn.value, out:bkOut.value };
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
