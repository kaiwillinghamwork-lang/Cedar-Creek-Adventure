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
