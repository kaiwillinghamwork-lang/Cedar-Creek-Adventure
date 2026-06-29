/* ============================================================ */
/* booking.js — "Plan Your Stay" flow (schedule.html).          */
/*   1. pick dates (calendar.js → #bkIn / #bkOut)               */
/*   2. how many people                                         */
/*   3. choose lodging — cabin / RV / campground, each with a    */
/*      "how many?" box and an info popup                        */
/*   On finish: a request you can email to us + add to calendar. */
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
const bkForm    = document.getElementById('bookingForm');
const bkIn      = document.getElementById('bkIn');
const bkOut     = document.getElementById('bkOut');
const bkNights  = document.getElementById('bkNights');
const bkLodging = document.getElementById('bkLodging');
const bkSummary = document.getElementById('bkSummaryBody');
const bkError   = document.getElementById('bkError');
const bkDone    = document.getElementById('bkDone');
const bkDoneSum = document.getElementById('bkDoneSummary');
const bkGcal    = document.getElementById('bkGcal');
const guestVal  = document.getElementById('guestVal');
const guestNote = document.getElementById('guestNote');

let guests = 2;

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

/* ---- party-size stepper ---- */
function setGuests(n){
  guests = Math.max(1, Math.min(20, n));
  guestVal.textContent = guests;
  renderLodging();          // refresh the cabin sleeps-4 warning
  updateSummary();
}
document.getElementById('guestMinus').addEventListener('click', () => setGuests(guests - 1));
document.getElementById('guestPlus').addEventListener('click', () => setGuests(guests + 1));

/* ---- lodging ---- */
const lodgingQty = {};
LODGING.forEach(l => lodgingQty[l.key] = 0);
function selectedLodgings(){
  return LODGING.map(l => ({ l, qty: lodgingQty[l.key] || 0 })).filter(x => x.qty > 0);
}
function renderLodging(){
  bkLodging.innerHTML = LODGING.map(l => {
    const qty = lodgingQty[l.key] || 0;
    const b = l.bld && typeof BUILDINGS !== 'undefined' ? BUILDINGS[l.bld] : null;
    const thumb = b ? `<span class="bk-opt-thumb">${b.out}</span>` : `<span class="bk-opt-icon">${l.icon || '🏕️'}</span>`;
    const warn = (l.sleeps && guests > l.sleeps)
      ? `<span class="bk-opt-warn">⚠ Each cabin sleeps ${l.sleeps} — you'll need ${Math.ceil(guests/l.sleeps)} for ${guests} people.</span>` : '';
    return `
    <div class="bk-opt-q${qty>0?' chosen':''}" data-key="${l.key}" role="button" tabindex="0">
      <span class="bk-opt-card">
        ${thumb}
        <span class="bk-opt-main">
          <span class="bk-opt-name">${l.name}</span>
          <span class="bk-opt-blurb">${l.blurb}</span>
          <span class="bk-opt-cue">Tap for info &amp; to add →</span>
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

/* ---- lodging info popup (reuses the building modal markup) ---- */
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
  if(card){ const key = card.dataset.key; setLodgeQty(key, Math.max(1, lodgingQty[key] || 0)); openLodgeModal(key); }
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
function updateGuestNote(){
  guestNote.textContent = guests > 4
    ? `Heads up: each Mini Cabin sleeps 4 — you'd need ${Math.ceil(guests/4)} cabins for ${guests} people.`
    : 'Each Mini Cabin sleeps up to 4 people.';
}
function computeTotals(){
  const nights = nightsBetween(bkIn.value, bkOut.value);
  const lodgings = selectedLodgings();
  const lodgingTotal = nights > 0 ? lodgings.reduce((s,x) => s + x.qty * x.l.rate * nights, 0) : 0;
  const subtotal = lodgingTotal;
  const tax = subtotal * TAX_RATE;
  return { nights, lodgings, lodgingTotal, subtotal, tax, total: subtotal + tax };
}
function buildSummaryHTML(){
  const t = computeTotals();
  const hasAny = (bkIn.value && bkOut.value && t.nights > 0) || t.lodgings.length;
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
  if(t.subtotal > 0){
    rows.push(`<div class="bk-srow"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>`);
    rows.push(`<div class="bk-srow"><span>Tax (${(TAX_RATE*100).toFixed(1)}%)</span><b>${money(t.tax)}</b></div>`);
    rows.push(`<div class="bk-srow bk-total"><span>Total</span><b>${money(t.total)}</b></div>`);
  }
  return rows.join('');
}
function updateSummary(){
  updateNightsHint();
  updateGuestNote();
  bkSummary.innerHTML = buildSummaryHTML();
}
bkForm.addEventListener('change', updateSummary);

/* ---- Google Calendar link ---- */
function gcalUrl(trip){
  const stamp = iso => iso.replace(/-/g,'');
  const t = computeTotals();
  const details = [
    'Stay at Cedar Creek Hunt & Adventure Basecamp.', '',
    `Guests: ${guests}`,
    `Lodging: ${t.lodgings.map(x=>`${x.qty}× ${x.l.name} ($${x.l.rate}/night)`).join(', ') || '—'}`,
    `Nights: ${t.nights} (${prettyDate(trip.in)} – ${prettyDate(trip.out)})`,
    '',
    `Subtotal: ${money(t.subtotal)}`,
    `Tax (${(TAX_RATE*100).toFixed(1)}%): ${money(t.tax)}`,
    `Total: ${money(t.total)}`,
  ].join('\n');
  const params = new URLSearchParams({
    action:'TEMPLATE', text:'Cedar Creek Basecamp stay',
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

/* ---- send the request to Cedar Creek (email / Formspree via site.js) ---- */
function buildTripText(){
  const t = computeTotals();
  const L = ['Booking request — Cedar Creek Hunt & Adventure Basecamp', ''];
  L.push(`Guests: ${guests}`);
  if(bkIn.value && bkOut.value) L.push(`Dates: ${prettyDate(bkIn.value)} – ${prettyDate(bkOut.value)} (${t.nights} night${t.nights>1?'s':''})`);
  if(t.lodgings.length) L.push('Lodging: ' + t.lodgings.map(x=>`${x.qty}× ${x.l.name}`).join(', '));
  L.push('', `Estimated total (incl. ${(TAX_RATE*100).toFixed(1)}% tax): ${money(t.total)}`, '',
         '— Please confirm dates & pricing. —', '', 'My name: ', 'Best phone or email to reach me: ');
  return L.join('\n');
}
const bkEmail = document.getElementById('bkEmail');
if(bkEmail) bkEmail.addEventListener('click', () => {
  if(window.ccInquiry) window.ccInquiry('Cedar Creek booking request', buildTripText());
});

updateSummary();
