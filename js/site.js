/* ============================================================ */
/* site.js — shared header + footer for every page.            */
/*   Renders the logo nav into #siteHeader and the footer into  */
/*   #siteFooter, marks the active link, and shows whether      */
/*   someone is logged in (see auth.js / localStorage).         */
/* ============================================================ */

/* ---- where inquiries go (EDIT THESE) ----
   • email / phone show on the site and are used by the "email us" buttons.
   • formspree: optional. Create a free form at https://formspree.io, paste
     its endpoint here (e.g. 'https://formspree.io/f/abcwxyz'), and submissions
     post straight to your inbox without opening the visitor's email app.    */
const CONTACT = {
  email: 'kai.willingham.work@gmail.com',
  phone: '(509) 555-0142',
  formspree: ''
};
window.CONTACT = CONTACT;

/* send an inquiry: posts to Formspree if configured, otherwise opens a
   pre-filled email from the visitor to you. Returns a Promise<bool>. */
window.ccInquiry = function(subject, body, replyEmail){
  if(CONTACT.formspree){
    return fetch(CONTACT.formspree, {
      method:'POST', headers:{ 'Accept':'application/json', 'Content-Type':'application/json' },
      body: JSON.stringify({ subject, email: replyEmail || '', message: body })
    }).then(r => r.ok).catch(() => false);
  }
  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return Promise.resolve(true);
};

/* load the brand typefaces once (Fraunces display + Inter body) */
(function(){
  if(document.getElementById('cc-fonts')) return;
  const l = document.createElement('link');
  l.id = 'cc-fonts'; l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(l);
})();

/* ---- slide-out sidebar menu (icon rows + account chip) ---- */
const SB_ICONS = {
  menu:       '<path d="M4 7h16M4 12h16M4 17h16"/>',
  home:       '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  activities: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 5.3-5.3 2.2 2.2-5.3z"/>',
  about:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="7.7" r=".7" fill="currentColor" stroke="none"/>',
  contact:    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
  login:      '<path d="M14 3h5v18h-5"/><path d="M3 12h11"/><path d="m10 8 4 4-4 4"/>',
};
function sbIcon(name){
  return `<svg class="sb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SB_ICONS[name]||''}</svg>`;
}
const SB_ITEMS = [
  { label:'Home',      href:'index.html',          icon:'home' },
  { label:'Activities',href:'index.html#activities',icon:'activities' },
  { label:'About Us',  href:'about.html',          icon:'about' },
  { label:'Contact',   href:'index.html#visit',    icon:'contact' },
];

function renderSiteChrome(){
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const hasSideMenu = !!document.getElementById('sideMenu');   // only true on the home page

  /* current signed-in user, if any (set by auth.js) */
  function currentUser(){
    try { return JSON.parse(localStorage.getItem('cc_user') || 'null'); }
    catch(e){ return null; }
  }

  const links = [
    { label:'Home',        href:'index.html' },
    { label:'Hammer Camp', href:'hammer-camp.html' },
  ];

  function navLinkHTML(l){
    const active = (page === l.href) ? ' class="active"' : '';
    return `<a href="${l.href}"${active}>${l.label}</a>`;
  }

  const user = currentUser();
  const authHTML = user
    ? `<a href="login.html" class="nav-account" title="Account">👤 ${user.name.split(' ')[0]}</a>`
    : `<a href="login.html" class="nav-login${page==='login.html'?' active':''}">Log in</a>`;

  /* Activities only exists on the home page (it opens the side menu) */
  const activitiesHTML = hasSideMenu
    ? `<button id="sideToggle" class="nav-activities" aria-label="Open activities menu">☰ Activities</button>`
    : '';

  const headerHTML = `
  <header class="topnav">
    <button class="sb-toggle" id="sbToggle" aria-label="Open menu">${sbIcon('menu')}</button>
    <a class="brand" href="index.html">
      <img src="images/logo.jpg" alt="" class="brand-logo">
      <span class="brand-text">Cedar Creek<small>Hunt &amp; Adventure Basecamp</small></span>
    </a>
    <nav class="nav-links" aria-label="Primary">
      ${links.map(navLinkHTML).join('')}
      ${activitiesHTML}
      <a href="schedule.html" class="nav-cta${page==='schedule.html'?' active':''}">📅 Plan a Stay</a>
      ${authHTML}
    </nav>
  </header>`;

  const footerHTML = `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="images/logo.jpg" alt="" class="footer-logo">
        <div>
          <p class="footer-name">Cedar Creek Hunt &amp; Adventure Basecamp</p>
          <p class="footer-addr">3928 Cedar Creek Rd · Colville, WA · 28 acres on East Fork Cedar Creek</p>
        </div>
      </div>
      <nav class="footer-links" aria-label="Footer">
        <a href="index.html">Home</a><a href="about.html">About</a><a href="explore.html">Explore</a><a href="hammer-camp.html">Hammer Camp</a><a href="schedule.html">Plan a Stay</a>
      </nav>
      <div class="footer-reach">
        <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
        <a href="tel:${CONTACT.phone.replace(/[^0-9+]/g,'')}">${CONTACT.phone}</a>
      </div>
    </div>
    <p class="footer-copy">© Cedar Creek Hunt &amp; Adventure Basecamp · Colville, Washington</p>
  </footer>`;

  const h = document.getElementById('siteHeader');
  if(h) h.innerHTML = headerHTML;
  const f = document.getElementById('siteFooter');
  if(f) f.innerHTML = footerHTML;

  const vr = document.getElementById('visitReach');   // "Find us" contact links (home page)
  if(vr) vr.innerHTML = `<a href="mailto:${CONTACT.email}">${CONTACT.email}</a><a href="tel:${CONTACT.phone.replace(/[^0-9+]/g,'')}">${CONTACT.phone}</a>`;

  /* ---- the slide-out sidebar ---- */
  const acct = user
    ? { letter:(user.name[0]||'C').toUpperCase(), name:user.name, sub:user.email }
    : { letter:'C', name:'Cedar Creek', sub:'Hunt & Adventure Basecamp' };
  const sidebarHTML =
    `<div class="sb-items">` +
    SB_ITEMS.map(it => {
      const active = (page === it.href.split('#')[0]) ? ' active' : '';
      return `<a class="sb-item${active}" href="${it.href}">${sbIcon(it.icon)}<span>${it.label}</span></a>`;
    }).join('') +
    `</div>
     <div class="sb-bottom">
       <div class="sb-account">
         <span class="sb-avatar">${acct.letter}</span>
         <span class="sb-acct-text"><b>${acct.name}</b><small>${acct.sub}</small></span>
       </div>
       <a class="sb-item sb-login${page==='login.html'?' active':''}" href="login.html">${sbIcon('login')}<span>Log in</span></a>
     </div>`;
  let sb = document.getElementById('sidebar');
  if(!sb){
    const ov = document.createElement('div'); ov.className='sb-overlay'; ov.id='sbOverlay'; document.body.appendChild(ov);
    sb = document.createElement('aside'); sb.className='sidebar'; sb.id='sidebar'; sb.setAttribute('aria-label','Menu'); document.body.appendChild(sb);
  }
  sb.innerHTML = sidebarHTML;
  if(!window.__sbWired){
    window.__sbWired = true;
    const open  = () => { sb.classList.add('open'); document.getElementById('sbOverlay').classList.add('open'); };
    const close = () => { sb.classList.remove('open'); document.getElementById('sbOverlay').classList.remove('open'); };
    document.addEventListener('click', e => {
      if(e.target.closest('#sbToggle')) { open(); return; }
      if(e.target.id === 'sbOverlay')   { close(); return; }
      if(e.target.closest('.sb-item'))  { close(); }
    });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  }
}
window.renderSiteChrome = renderSiteChrome;
renderSiteChrome();
