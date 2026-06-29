/* ============================================================ */
/* camp.js — the Hammer Camp page.                              */
/*   Two age-based camps; pick week(s) and add them to Google   */
/*   Calendar. Reads CAMPS from data.js.                        */
/* ============================================================ */

const CAMP_LIST = (typeof CAMPS !== 'undefined') ? CAMPS : [];
const CAMP_LOCATION = '3928 Cedar Creek Rd, Colville, WA';
const grid = document.getElementById('campGrid');
const sumEl = document.getElementById('campSummary');
let sel = {};   // 'campKey:weekIdx' -> true

function money(n){ return '$' + Math.round(n).toLocaleString(); }
function selectedWeeks(){
  return Object.keys(sel).filter(k => sel[k]).map(k => {
    const [ck, i] = k.split(':');
    const c = CAMP_LIST.find(x => x.key === ck);
    return (c && c.weeks[+i]) ? { c, w:c.weeks[+i] } : null;
  }).filter(Boolean);
}
function gcalUrl(c, w){
  const stamp = iso => iso.replace(/-/g,'');
  const params = new URLSearchParams({
    action:'TEMPLATE',
    text:`${c.name} — ${w.label}`,
    dates:`${stamp(w.start)}/${stamp(w.end)}`,
    details:`Hammer Camp at Cedar Creek Hunt & Adventure Basecamp (${c.ageLabel}).\n\n` + c.includes.join('\n'),
    location:CAMP_LOCATION,
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}

function render(){
  grid.innerHTML = CAMP_LIST.map(c => `
    <div class="camp-card">
      <div class="camp-card-head">
        <img src="images/camp-hammer-logo.png" alt="" class="camp-card-logo">
        <div>
          <h2>${c.name}</h2>
          <div class="camp-card-age">${c.ageLabel} · week-long overnight</div>
        </div>
      </div>
      <p class="camp-card-desc">${c.desc}</p>
      <div class="feature-title">✦ What's included</div>
      <ul class="camp-includes">${c.includes.map(i=>`<li>${i}</li>`).join('')}</ul>
      <div class="feature-title" style="margin-top:18px;">📅 Pick a week — $${c.price.toLocaleString()}/week</div>
      <div class="camp-weeks">${c.weeks.map((w,i) => {
        const s = !!sel[`${c.key}:${i}`];
        return `<button type="button" class="camp-week${s?' sel':''}" data-key="${c.key}" data-idx="${i}">
          <span class="camp-week-main">
            <span class="camp-week-dates">${w.label}</span>
            <span class="camp-week-age">${c.ageLabel}</span>
          </span>
          <span class="camp-week-price">${money(c.price)}</span>
          <span class="camp-week-check">${s?'✓':'+'}</span>
        </button>`;
      }).join('')}</div>
    </div>`).join('');
  renderSummary();
}

function renderSummary(){
  const items = selectedWeeks();
  if(!items.length){
    sumEl.innerHTML = '<h3>Your camp weeks</h3><p class="bk-empty">Pick a week above to register your camper.</p>';
    return;
  }
  const total = items.reduce((s,x) => s + x.c.price, 0);
  sumEl.innerHTML = '<h3>Your camp weeks</h3>'
    + items.map(x => `
      <div class="camp-sum-row">
        <span class="camp-sum-name">🔨 ${x.c.ageLabel} · ${x.w.label}</span>
        <a class="camp-cal" target="_blank" rel="noopener" href="${gcalUrl(x.c, x.w)}">📅 Add to Calendar</a>
        <b>${money(x.c.price)}</b>
      </div>`).join('')
    + `<div class="camp-sum-total"><span>Total</span><b>${money(total)}</b></div>`
    + `<button type="button" class="btn btn-primary camp-request-btn" id="campRequest">📧 Request these weeks</button>`
    + `<p class="camp-sum-note">Prices are estimates — send your request and we'll confirm your camper's spot and payment. Nothing's charged here.</p>`;
}

function requestCamps(){
  const items = selectedWeeks();
  if(!items.length) return;
  const L = ['Hammer Camp registration request', ''];
  items.forEach(x => L.push(`• ${x.c.ageLabel} — ${x.w.label} ($${x.c.price.toLocaleString()})`));
  L.push('', `Total (estimate): ${money(items.reduce((s,x)=>s+x.c.price,0))}`, '',
         "Camper's name & age: ", 'Parent/guardian name: ', 'Best phone or email to reach you: ');
  if(window.ccInquiry) window.ccInquiry('Hammer Camp registration request', L.join('\n'));
}

if(grid && sumEl){
  grid.addEventListener('click', e => {
    const wk = e.target.closest('.camp-week[data-key]');
    if(wk){ const k = `${wk.dataset.key}:${wk.dataset.idx}`; sel[k] = !sel[k]; render(); }
  });
  sumEl.addEventListener('click', e => { if(e.target.closest('#campRequest')) requestCamps(); });
  render();
}
