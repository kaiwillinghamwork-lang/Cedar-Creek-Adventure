/* ============================================================ */
/* app.js — all the BEHAVIOR for the site lives here.           */
/*   - renders the building cards from BUILDINGS + ORDER         */
/*   - opens/closes the building modal (outside/inside toggle)   */
/*   - wires up the map hotspots                                 */
/*   - builds the Activities side menu + deep-dive modal         */
/* Reads its content from data.js (loaded before this file).    */
/* ============================================================ */


/* fill the empty alt="" in a building image with real, descriptive text
   so screen-reader users hear which building and which view it is */
function withAlt(imgHtml,label){
  return imgHtml.replace('alt=""',`alt="${label.replace(/"/g,'')}"`);
}

/* ============ RENDER CARDS ============ */
const grid=document.getElementById('cardGrid');
ORDER.forEach(key=>{
  const b=BUILDINGS[key];
  const card=document.createElement('div');
  card.className='card';
  card.dataset.bld=key;
  const lead=b.peak||b.desc;
  card.innerHTML=`
    <div class="card-thumb">${withAlt(b.out,b.name+', exterior')}</div>
    <div class="card-body">
      <div class="tagline">${b.tagline}</div>
      <h3>${b.name}</h3>
      <p>${lead.length>130?lead.slice(0,128)+'…':lead}</p>
      <div class="open">See more →</div>
    </div>`;
  card.addEventListener('click',()=>openModal(key));
  grid.appendChild(card);
});

/* ============ FOCUS MANAGEMENT (accessibility) ============
   When a modal opens we move keyboard focus into it, trap Tab inside
   it so you can't tab out into the page behind, and remember what was
   focused before so we can hand focus back when it closes. */
let lastFocused=null;        // the element (building/card) that opened the modal
let trapHandler=null;        // the active Tab-trap listener, so we can remove it

function getFocusable(container){
  return [...container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )].filter(el=>el.offsetParent!==null);   // visible only
}
function trapFocus(modalEl){
  const focusable=getFocusable(modalEl);
  if(focusable.length){focusable[0].focus();}
  trapHandler=function(e){
    if(e.key!=='Tab')return;
    const f=getFocusable(modalEl);
    if(!f.length)return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',trapHandler);
}
function releaseFocus(){
  if(trapHandler){document.removeEventListener('keydown',trapHandler);trapHandler=null;}
  if(lastFocused && typeof lastFocused.focus==='function'){lastFocused.focus();}
  lastFocused=null;
}

/* ============ MODAL LOGIC ============ */
const backdrop=document.getElementById('backdrop');
const paneOut=document.getElementById('paneOut');
const paneIn=document.getElementById('paneIn');
const tabOut=document.getElementById('tabOut');
const tabIn=document.getElementById('tabIn');

function openModal(key){
  const b=BUILDINGS[key];
  document.getElementById('mTitle').textContent=b.name;
  document.getElementById('mTagline').textContent=b.tagline;
  const ml=document.getElementById('mMoment');
  if(b.peak){ml.textContent='“'+b.peak+'”';ml.style.display='';}else{ml.style.display='none';}
  document.getElementById('mDesc').textContent=b.desc;
  paneOut.innerHTML=withAlt(b.out,b.name+', outside view');
  paneIn.innerHTML=withAlt(b.in,b.name+', inside view');
  const fl=document.getElementById('mFeatures');
  fl.innerHTML=b.features.map(f=>`<li>${f}</li>`).join('');
  const st=document.getElementById('mStats');
  st.innerHTML=b.stats.map(s=>`<div class="stat"><b>${s[1]}</b>${s[0]}</div>`).join('');
  setView('out');
  lastFocused=document.activeElement;   // remember what opened the modal
  backdrop.classList.add('open');
  document.body.style.overflow='hidden';
  trapFocus(backdrop);                  // move focus in + trap it
}
function closeModal(){
  backdrop.classList.remove('open');
  document.body.style.overflow='';
  releaseFocus();                       // hand focus back to the opener
}
function setView(v){
  const isOut=v==='out';
  tabOut.classList.toggle('active',isOut);
  tabIn.classList.toggle('active',!isOut);
  paneOut.classList.toggle('active',isOut);
  paneIn.classList.toggle('active',!isOut);
}
tabOut.addEventListener('click',()=>setView('out'));
tabIn.addEventListener('click',()=>setView('in'));
document.getElementById('closeBtn').addEventListener('click',closeModal);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* map hotspots — works for any clickable building shape on the map */
document.querySelectorAll('.hotspot, .map-hotspot, .bldg').forEach(h=>{
  const key=h.dataset.bld;
  h.addEventListener('click',()=>openModal(key));
  h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(key);}});
});

/* ---- is an activity in season right now? ---- */
function isInSeason(a){
  if(!a.season) return false;
  const now=new Date();
  const md=(now.getMonth()+1)*100+now.getDate();
  const start=a.season[0][0]*100+a.season[0][1];
  const end=a.season[1][0]*100+a.season[1][1];
  return start<=end ? (md>=start && md<=end) : (md>=start || md<=end);
}

/* ---- activity info modal (opened from the left dropdown) ---- */
const actBackdrop=document.getElementById('actBackdrop');
function openActivity(key){
  const a=ACTIVITIES.find(x=>x.key===key);
  if(!a) return;
  const inSeason=isInSeason(a);
  document.getElementById('aTitle').innerHTML=`${a.name}<span class="act-status ${inSeason?'on':'off'}">${inSeason?'● IN SEASON NOW':'OFF SEASON'}</span>`;
  document.getElementById('aTagline').textContent=a.tagline;
  const gal=document.getElementById('aGallery');
  if(a.media && a.media.length){
    gal.innerHTML=a.media.map(m=>`<div class="act-media"><img src="${m.src}" alt="${(m.alt||'').replace(/"/g,'')}" loading="lazy"></div>`).join('');
    gal.style.display='';
  } else { gal.innerHTML=''; gal.style.display='none'; }
  document.getElementById('aDesc').textContent=a.desc;
  document.getElementById('aDay').innerHTML=a.day.map(d=>`<li>${d}</li>`).join('');
  document.getElementById('aIncluded').innerHTML=a.included.map(i=>`<li>${i}</li>`).join('');
  document.getElementById('aStats').innerHTML=a.stats.map(s=>`<div class="stat"><b>${s[1]}</b>${s[0]}</div>`).join('');
  lastFocused=document.activeElement;
  actBackdrop.classList.add('open');
  document.body.style.overflow='hidden';
  trapFocus(actBackdrop);
}
function closeActivity(){
  actBackdrop.classList.remove('open');
  document.body.style.overflow='';
  releaseFocus();
}
if(actBackdrop){
  document.getElementById('actCloseBtn').addEventListener('click',closeActivity);
  actBackdrop.addEventListener('click',e=>{if(e.target===actBackdrop)closeActivity();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeActivity();});
}

/* ---- left-side activities dropdown ---- */
const leftActsBtn=document.getElementById('leftActsBtn');
const leftActsMenu=document.getElementById('leftActsMenu');
if(leftActsBtn && leftActsMenu){
  leftActsMenu.innerHTML=ACTIVITIES.map(a=>{
    const active=isInSeason(a)?'<span class="left-acts-badge">● ACTIVE</span>':'';
    return `<button class="left-acts-item" data-key="${a.key}"><span class="ico">${a.icon}</span><span class="txt"><span>${a.name}${active}</span><small>${a.short}</small></span></button>`;
  }).join('');
  function toggleLeftActs(open){
    const show=(open===undefined)?leftActsMenu.hasAttribute('hidden'):open;
    if(show){ leftActsMenu.removeAttribute('hidden'); leftActsBtn.setAttribute('aria-expanded','true'); }
    else { leftActsMenu.setAttribute('hidden',''); leftActsBtn.setAttribute('aria-expanded','false'); }
  }
  leftActsBtn.addEventListener('click',e=>{ e.stopPropagation(); toggleLeftActs(); });
  /* hovering the "Cedar Creek" brand pulls the activities menu up; it then
     stays open until you pick a trip or click somewhere else */
  const brandHover=document.querySelector('.topnav .brand');
  if(brandHover) brandHover.addEventListener('mouseenter',()=>toggleLeftActs(true));
  leftActsMenu.addEventListener('click',e=>{ const it=e.target.closest('.left-acts-item'); if(it){ openActivity(it.dataset.key); toggleLeftActs(false); } });
  document.addEventListener('click',e=>{ if(!document.getElementById('leftActs').contains(e.target)) toggleLeftActs(false); });
  /* the sidebar's "Activities" link lands on index.html#activities → pop the menu open */
  if(location.hash==='#activities') setTimeout(()=>toggleLeftActs(true),60);
  window.addEventListener('hashchange',()=>{ if(location.hash==='#activities') toggleLeftActs(true); });
}

/* ---- homepage Adventures grid (arcticwild-style cards) ---- */
(function(){
  const wrap = document.getElementById('homeActs');
  if(!wrap || typeof ACTIVITIES === 'undefined') return;
  function priceLabel(a){
    if(typeof a.price === 'number') return `$${a.price.toLocaleString()}`;
    if(Array.isArray(a.options) && a.options.length){
      const min = Math.min(...a.options.map(o=>o.price));
      return `from $${min.toLocaleString()}`;
    }
    return '';
  }
  wrap.innerHTML = ACTIVITIES.map(a=>{
    const active = isInSeason(a) ? '<span class="left-acts-badge">● IN SEASON</span>' : '';
    return `<button class="aw-act" data-key="${a.key}">
      <span class="ico">${a.icon||'🏕️'}</span>
      <h3>${a.name}${active}</h3>
      <div class="sub">${a.short||''}</div>
      <div class="price">${priceLabel(a)} <small>${a.days?`· ${a.days} days`:''}</small></div>
      <span class="go">See more →</span>
    </button>`;
  }).join('');
  wrap.addEventListener('click', e=>{
    const b = e.target.closest('.aw-act[data-key]');
    if(b) openActivity(b.dataset.key);
  });
})();
