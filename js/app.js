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
  const md=(now.getMonth()+1)*100+now.getDate();      // e.g. June 26 -> 626
  const start=a.season[0][0]*100+a.season[0][1];
  const end=a.season[1][0]*100+a.season[1][1];
  // normal range (start <= end) OR wrap-around range (e.g. May–March)
  return start<=end ? (md>=start && md<=end) : (md>=start || md<=end);
}

/* ---- build the side menu links ---- */
const sideLinks=document.getElementById('sideLinks');
ACTIVITIES.forEach(a=>{
  const btn=document.createElement('button');
  btn.className='side-link';
  const active=isInSeason(a)?'<span class="in-season">● ACTIVE</span>':'';
  btn.innerHTML=`<span class="ico">${a.icon}</span><span class="txt">${a.name}${active}<small>${a.short} →</small></span>`;
  btn.addEventListener('click',()=>{closeSideMenu();openActivity(a.key);});
  sideLinks.appendChild(btn);
});

/* ---- side menu open/close ---- */
const sideMenu=document.getElementById('sideMenu');
const sideOverlay=document.getElementById('sideOverlay');
function openSideMenu(){sideMenu.classList.add('open');sideOverlay.classList.add('open');}
function closeSideMenu(){sideMenu.classList.remove('open');sideOverlay.classList.remove('open');}
document.getElementById('sideToggle').addEventListener('click',openSideMenu);
document.getElementById('closeSide').addEventListener('click',closeSideMenu);
sideOverlay.addEventListener('click',closeSideMenu);

/* ---- activity deep-dive modal ---- */
const actBackdrop=document.getElementById('actBackdrop');
function openActivity(key){
  const a=ACTIVITIES.find(x=>x.key===key);
  const inSeason=isInSeason(a);
  document.getElementById('aTitle').innerHTML=`${a.name}<span class="act-status ${inSeason?'on':'off'}">${inSeason?'● IN SEASON NOW':'OFF SEASON'}</span>`;
  document.getElementById('aTagline').textContent=a.tagline;
  /* ---- photo gallery (only some activities have media) ---- */
  const gal=document.getElementById('aGallery');
  if(a.media && a.media.length){
    gal.innerHTML=a.media.map(m=>
      `<div class="act-media"><img src="${m.src}" `
      +`alt="${(m.alt||'').replace(/"/g,'')}" loading="lazy"></div>`
    ).join('');
    gal.style.display='';
  } else {
    gal.innerHTML=''; gal.style.display='none';
  }
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
document.getElementById('actCloseBtn').addEventListener('click',closeActivity);
actBackdrop.addEventListener('click',e=>{if(e.target===actBackdrop)closeActivity();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeActivity();closeSideMenu();}});
