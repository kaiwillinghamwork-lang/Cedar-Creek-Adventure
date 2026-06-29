/* ============================================================ */
/* calendar.js — flip-through two-month date-range picker.      */
/*   Matches the attached design: Calendar/Flexible tabs, a     */
/*   range header, two months you can page through, ± day       */
/*   chips, and a Done button.                                  */
/*   Writes the chosen range into the hidden #bkIn / #bkOut      */
/*   inputs (YYYY-MM-DD) and fires change so booking.js updates. */
/* ============================================================ */

(function(){
  const root = document.getElementById('cal');
  if(!root) return;

  const bkIn  = document.getElementById('bkIn');
  const bkOut = document.getElementById('bkOut');
  const trigger = document.getElementById('calTrigger');
  const triggerText = document.getElementById('calTriggerText');
  const grids = document.getElementById('calGrids');
  const startLbl = document.getElementById('calStartLbl');
  const endLbl = document.getElementById('calEndLbl');
  const WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const today = new Date(); today.setHours(0,0,0,0);
  const firstOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const addMonths = (d,n) => new Date(d.getFullYear(), d.getMonth()+n, 1);
  const sameDay = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const pretty = (d) => d.toLocaleDateString(undefined,{ weekday:'short', month:'short', day:'numeric' });

  let view = firstOfMonth(today);   // left-hand month
  let start = null, end = null;     // Date objects
  let flex = 0;

  function monthGrid(base){
    const y = base.getFullYear(), m = base.getMonth();
    const lead = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    let cells = '';
    for(let i=0;i<lead;i++) cells += '<span class="cal-cell empty"></span>';
    for(let d=1; d<=days; d++){
      const date = new Date(y,m,d);
      const past = date < today;
      const isStart = sameDay(date,start);
      const isEnd = sameDay(date,end);
      const inRange = start && end && date > start && date < end;
      const cls = ['cal-cell'];
      if(past) cls.push('past');
      if(isStart) cls.push('sel start');
      if(isEnd) cls.push('sel end');
      if(inRange) cls.push('inrange');
      if(sameDay(date,today)) cls.push('today');
      cells += `<button type="button" class="${cls.join(' ')}" ${past?'disabled':''} data-iso="${iso(date)}">${d}</button>`;
    }
    return `
      <div class="cal-month">
        <div class="cal-month-name">${MONTHS[m]} ${y}</div>
        <div class="cal-weekdays">${WEEK.map(w=>`<span>${w}</span>`).join('')}</div>
        <div class="cal-days">${cells}</div>
      </div>`;
  }

  function render(){
    grids.innerHTML = monthGrid(view) + monthGrid(addMonths(view,1));
    // disable paging earlier than the current month
    document.getElementById('calPrev').disabled = (view <= firstOfMonth(today));
    startLbl.textContent = start ? pretty(start) : 'Check-in';
    endLbl.textContent   = end ? pretty(end) : 'Check-out';
    startLbl.classList.toggle('filled', !!start);
    endLbl.classList.toggle('filled', !!end);
  }

  function pick(dateISO){
    const d = new Date(dateISO+'T00:00:00');
    if(!start || (start && end)){ start = d; end = null; }      // begin a new range
    else if(d < start){ start = d; }                             // clicked before start → reset start
    else if(sameDay(d,start)){ /* same day, ignore */ }
    else { end = d; }                                            // complete the range
    commit();
    render();
  }

  function commit(){
    bkIn.value  = start ? iso(start) : '';
    bkOut.value = end ? iso(end) : '';
    bkIn.dispatchEvent(new Event('change',{bubbles:true}));
    bkOut.dispatchEvent(new Event('change',{bubbles:true}));
    if(start && end){
      const flexTxt = flex ? `  (± ${flex} day${flex>1?'s':''})` : '';
      triggerText.textContent = `${pretty(start)}  →  ${pretty(end)}${flexTxt}`;
    } else if(start){
      triggerText.textContent = `${pretty(start)}  →  …`;
    } else {
      triggerText.textContent = 'Select your dates';
    }
  }

  /* ---- events ---- */
  grids.addEventListener('click', e => {
    const cell = e.target.closest('.cal-cell[data-iso]');
    if(cell && !cell.disabled) pick(cell.dataset.iso);
  });
  document.getElementById('calPrev').addEventListener('click', () => { view = addMonths(view,-1); render(); });
  document.getElementById('calNext').addEventListener('click', () => { view = addMonths(view, 1); render(); });

  // tabs (Calendar / Flexible dates) — toggle the flex chips row
  root.querySelectorAll('.cal-tab').forEach(t => t.addEventListener('click', () => {
    root.querySelectorAll('.cal-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('calFlex').classList.toggle('show', t.dataset.tab === 'flexible');
  }));

  // ± day chips
  root.querySelectorAll('.cal-chip').forEach(c => c.addEventListener('click', () => {
    root.querySelectorAll('.cal-chip').forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    flex = parseInt(c.dataset.flex,10) || 0;
    commit();
  }));

  // open / close the panel
  function toggle(open){
    const show = open===undefined ? root.hasAttribute('hidden') : open;
    if(show){ root.removeAttribute('hidden'); render(); }
    else root.setAttribute('hidden','');
  }
  trigger.addEventListener('click', () => toggle());
  document.getElementById('calDone').addEventListener('click', () => {
    toggle(false);
    document.getElementById('bkLodging')?.scrollIntoView({behavior:'smooth', block:'center'});
  });

  render();
})();
