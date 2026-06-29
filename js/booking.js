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
  { key:'cabin', name:'Mini Cabin',     rate:150, sleeps:4, bld:'cabins',
    blurb:'Your own cabin in the timber — sleeps up to 4.',
    info:'A private, insulated cabin with a warm wood stove, a real bed, and a covered porch — walk to the lodge for meals, no cooking or cleanup.' },
  { key:'rv',    name:'RV Rental Spot',  rate:35,  icon:'🚐', bld:'rv',
    blurb:'Level pad with power & water for your rig.',
    info:'A level, pull-through pad with power and water hookups and your own fire ring — steps from the creek, fire pit, and hot showers.' },
  { key:'camp',  name:'Campground',      rate:25,  icon:'⛺',
    blurb:'Pitch a tent under the pines by the creek.',
    info:'Flat, shaded tent sites under the pines, each with its own fire ring — hot showers at the bathhouse a short walk away.',
    features:['Flat, shaded tent sites','Your own fire ring','Steps from the creek','Hot showers nearby','Picnic tables'] },
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
const guestVal   = document.getElementById('guestVal');
const guestNote  = document.getElementById('guestNote');

/* ---- party-size stepper ---- */
function setGuests(n){
  guests = Math.max(1, Math.min(20, n));
  guestVal.textContent = guests;
  if(typeof renderLodging === 'function') renderLodging();   // refresh the cabin sleeps-4 warning
  updateSummary();
}
document.getElementById('guestMinus').addEventListener('click', () => setGuests(guests - 1));
document.getElementById('guestPlus').addEventListener('click', () => setGuests(guests + 1));

/* activity-options popup */
const actOptBackdrop = document.getElementById('actOptBackdrop');
const actOptTitle    = document.getElementById('actOptTitle');
const actOptTagline  = document.getElementById('actOptTagline');
const actOptDesc     = document.getElementById('actOptDesc');
const actOptList     = document.getElementById('actOptList');

/* ---- selection state ---- */
let chosen = {};       // { activityKey: optionIndex }
let justStay = false;  // "no activities — just the stay"
let justAdded = null;  // key of the activity just added (for a one-shot pop animation)
let guests = 2;        // number of people coming

function unitsFor(lodge){ return (lodge && lodge.sleeps) ? Math.ceil(guests / lodge.sleeps) : 1; }

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

const lodgingQty = {};   // { lodgeKey: number reserved }
LODGING.forEach(l => lodgingQty[l.key] = 0);

function selectedLodgings(){
  return LODGING.map(l => ({ l, qty: lodgingQty[l.key] || 0 })).filter(x => x.qty > 0);
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

/* ---- render lodging options, each with a "how many?" box ---- */
function renderLodging(){
  bkLodging.innerHTML = LODGING.map(l => {
    const qty = lodgingQty[l.key] || 0;
    const b = l.bld && typeof BUILDINGS !== 'undefined' ? BUILDINGS[l.bld] : null;
    const thumb = b ? `<span class="bk-opt-thumb">${b.out}</span>` : `<span class="bk-opt-icon">${l.icon || '🏕️'}</span>`;
    const cue = `<span class="bk-opt-cue">Tap for info &amp; to add →</span>`;
    const warn = (l.sleeps && guests > l.sleeps)
      ? `<span class="bk-opt-warn">⚠ Each cabin sleeps ${l.sleeps} — you'll need ${Math.ceil(guests/l.sleeps)} for ${guests} people.</span>` : '';
    return `
    <div class="bk-opt-q${qty>0?' chosen':''}" data-key="${l.key}" role="button" tabindex="0">
      <span class="bk-opt-card">
        ${thumb}
        <span class="bk-opt-main">
          <span class="bk-opt-name">${l.name}</span>
          <span class="bk-opt-blurb">${l.blurb}</span>
          ${cue}
          ${warn}
        </span>
        <span class="bk-opt-right">
          <span class="bk-opt-price">$${l.rate}<small>/night</small></span>
          <span class="lodge-stepper">
            <button type="button" class="lstep" data-lminus="${l.key}" aria-label="Fewer ${l.name}">−</button>
            <span class="lqty">${qty}</span>
            <button type="button" class="lstep" data-lplus="${l.key}" aria-label="More ${l.name}">+</button>
          </span>
        </span>
      </span>
    </div>`;
  }).join('');
}
function setLodgeQty(key, n){
  lodgingQty[key] = Math.max(0, Math.min(20, n));
  renderLodging();
  updateSummary();
}
renderLodging();

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
    const popCls = (a.key === justAdded) ? ' pop' : '';
    return `
    <div class="bk-pick${isChosen?' chosen':''}${ok?'':' out-of-season'}${popCls}" ${ok?`data-key="${a.key}" role="button" tabindex="0"`:'aria-disabled="true"'}>
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
  justAdded = null;   // pop only plays once
}

bkActsWrap.addEventListener('click', e => {
  const remove = e.target.closest('[data-remove]');
  if(remove){ delete chosen[remove.dataset.remove]; updateSummary(); return; }
  const none = e.target.closest('[data-none]');
  if(none){ justStay = !justStay; if(justStay) chosen = {}; updateSummary(); return; }
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
  const blurb = (a.desc || a.short || '').replace(/\s+/g,' ').trim();
  actOptDesc.textContent = blurb.length > 220 ? blurb.slice(0,218) + '…' : blurb;
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
  if(choice){
    if(choice.classList.contains('selecting')) return;   // ignore double-taps mid-animation
    // mark every sibling as not-current, animate the picked one, then commit
    actOptList.querySelectorAll('.act-opt-choice').forEach(c => c.classList.remove('current'));
    choice.classList.add('selecting');
    const key = choice.dataset.key, idx = +choice.dataset.idx;
    setTimeout(() => {
      chosen[key] = idx; justStay = false; justAdded = key;
      closeActivityOptions();
      updateSummary();
    }, 520);
    return;
  }
  const rem = e.target.closest('.act-opt-remove');
  if(rem){ delete chosen[rem.dataset.remove]; closeActivityOptions(); updateSummary(); }
});
document.getElementById('actOptClose').addEventListener('click', closeActivityOptions);
actOptBackdrop.addEventListener('click', e => { if(e.target === actOptBackdrop) closeActivityOptions(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeActivityOptions(); });

/* ============ LODGING INFO POPUP (cabin / RV / campground) ============ */
const cabinBackdrop = document.getElementById('backdrop');
let modalLodgeKey = null;
function fillLodgeModal(key){
  const l = LODGING.find(x => x.key === key);
  const b = l.bld && typeof BUILDINGS !== 'undefined' ? BUILDINGS[l.bld] : null;
  document.getElementById('mTitle').textContent = l.name;
  document.getElementById('mTagline').textContent = `$${l.rate} / night`;
  document.getElementById('mMoment').style.display = 'none';
  document.getElementById('mDesc').textContent = l.info || '';
  const vt = document.querySelector('.view-toggle'), vs = document.querySelector('.view-stage');
  if(b){
    vt.style.display=''; vs.style.display='';
    document.getElementById('paneOut').innerHTML = b.out;
    document.getElementById('paneIn').innerHTML = b.in;
    setCabinView('out');
  } else { vt.style.display='none'; vs.style.display='none'; }
  const feats = b ? b.features : (l.features || []);
  document.getElementById('mFeatures').innerHTML = feats.map(f=>`<li>${f}</li>`).join('');
  document.getElementById('mStats').innerHTML = '';
}
function setCabinView(v){
  const isOut = v==='out';
  document.getElementById('tabOut').classList.toggle('active', isOut);
  document.getElementById('tabIn').classList.toggle('active', !isOut);
  document.getElementById('paneOut').classList.toggle('active', isOut);
  document.getElementById('paneIn').classList.toggle('active', !isOut);
}
function openLodgeModal(key){
  const l = LODGING.find(x => x.key === key);
  if(!l) return;
  modalLodgeKey = key;
  fillLodgeModal(key);
  const note = document.getElementById('cabinNote');
  const confirm = document.getElementById('cabinConfirm');
  if(note) note.textContent = (l.sleeps && guests > l.sleeps)
    ? `⚠ Each cabin sleeps ${l.sleeps} — you'll need ${Math.ceil(guests/l.sleeps)} for ${guests} people.`
    : (l.sleeps ? `Sleeps up to ${l.sleeps} per cabin.` : `$${l.rate} per night.`);
  if(confirm) confirm.textContent = `+ Add another ${l.name}`;
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
    if(modalLodgeKey) setLodgeQty(modalLodgeKey, (lodgingQty[modalLodgeKey] || 0) + 1);
  });
}
/* clicking a place auto-reserves 1 and opens its info popup; +/- adjusts the count */
bkLodging.addEventListener('click', e => {
  const minus = e.target.closest('[data-lminus]');
  if(minus){ setLodgeQty(minus.dataset.lminus, (lodgingQty[minus.dataset.lminus] || 0) - 1); return; }
  const plus = e.target.closest('[data-lplus]');
  if(plus){ setLodgeQty(plus.dataset.lplus, (lodgingQty[plus.dataset.lplus] || 0) + 1); return; }
  const card = e.target.closest('.bk-opt-q[data-key]');
  if(card){
    const key = card.dataset.key;
    setLodgeQty(key, Math.max(1, lodgingQty[key] || 0));   // auto-pick 1
    openLodgeModal(key);
  }
});
bkLodging.addEventListener('keydown', e => {
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.bk-opt-q[data-key]');
  if(card){ e.preventDefault(); const key=card.dataset.key; setLodgeQty(key, Math.max(1, lodgingQty[key]||0)); openLodgeModal(key); }
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
  const lodgings = selectedLodgings();
  const acts   = selectedActivities();
  const lodgingTotal    = nights > 0 ? lodgings.reduce((s,x) => s + x.qty * x.l.rate * nights, 0) : 0;
  const activitiesTotal = acts.reduce((s,a) => s + (a.price || 0), 0);
  const subtotal = lodgingTotal + activitiesTotal;
  const tax = subtotal * TAX_RATE;
  return { nights, lodgings, acts, lodgingTotal, subtotal, tax, total: subtotal + tax };
}
function updateGuestNote(){
  guestNote.textContent = guests > 4
    ? `Heads up: each Mini Cabin sleeps 4 — you'd need ${Math.ceil(guests/4)} cabins for ${guests} people.`
    : 'Each Mini Cabin sleeps up to 4 people.';
}
function buildSummaryHTML(){
  const t = computeTotals();
  const hasAny = (bkIn.value && bkOut.value && t.nights > 0) || t.lodgings.length || t.acts.length || justStay;
  if(!hasAny) return '<p class="bk-empty">Your selections will show up here as you go.</p>';
  const rows = [];
  rows.push(`<div class="bk-srow"><span>Guests</span><b>${guests}</b></div>`);
  if(bkIn.value && bkOut.value && t.nights > 0){
    rows.push(`<div class="bk-srow"><span>Dates</span><b>${prettyDate(bkIn.value)} – ${prettyDate(bkOut.value)}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Nights</span><b>${t.nights}</b></div>`);
  }
  t.lodgings.forEach(x => {
    rows.push(`<div class="bk-srow"><span>${x.l.name}${x.qty>1?` × ${x.qty}`:''}</span><b>$${x.l.rate}/night${x.qty>1?' ea':''}</b></div>`);
  });
  if(t.lodgings.length && t.nights > 0)
    rows.push(`<div class="bk-srow"><span>Lodging (${t.nights} night${t.nights>1?'s':''})</span><b>${money(t.lodgingTotal)}</b></div>`);
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
  updateGuestNote();
  renderActivities();
  bkSummary.innerHTML = buildSummaryHTML();
}
bkForm.addEventListener('change', updateSummary);

/* ---- Google Calendar link ---- */
function gcalUrl(trip){
  const stamp = iso => iso.replace(/-/g,'');
  const t = computeTotals();
  const title = `Cedar Creek Basecamp stay`;
  const details = [
    'Stay at Cedar Creek Hunt & Adventure Basecamp.', '',
    `Guests: ${guests}`,
    `Lodging: ${t.lodgings.map(x=>`${x.qty}× ${x.l.name} ($${x.l.rate}/night)`).join(', ') || '—'}`,
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
  if(!bkIn.value || !bkOut.value){ showError('Please pick your dates.'); return; }
  if(nights < 1){ showError('Your check-out date needs to be after your check-in date.'); return; }
  if(selectedLodgings().length === 0){ showError('Reserve at least one cabin, RV spot, or campsite.'); return; }

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
