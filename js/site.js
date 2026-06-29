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
    { label:'About Us',    href:'about.html' },
    { label:'Hammer Camp', href:'hammer-camp.html' },
    { label:'Contact',     href:'contact.html' },
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
    <img src="images/logo.jpg" alt="" class="footer-logo">
    <p><b>Cedar Creek Hunt &amp; Adventure Basecamp</b></p>
    <p>3928 Cedar Creek Rd · Colville, WA · 28 acres on East Fork Cedar Creek</p>
    <p class="footer-contact">
      <a href="mailto:${CONTACT.email}">✉️ ${CONTACT.email}</a>
      <a href="tel:${CONTACT.phone.replace(/[^0-9+]/g,'')}">📞 ${CONTACT.phone}</a>
    </p>
    <nav class="footer-links">
      <a href="index.html">Home</a><a href="about.html">About Us</a><a href="hammer-camp.html">Hammer Camp</a><a href="schedule.html">Plan a Stay</a><a href="contact.html">Contact</a><a href="login.html">Log in</a>
    </nav>
    <p class="footer-fine">We don't rent beds — we sell the days you'll remember. · Concept renderings, not to scale.</p>
  </footer>`;

  const h = document.getElementById('siteHeader');
  if(h) h.innerHTML = headerHTML;
  const f = document.getElementById('siteFooter');
  if(f) f.innerHTML = footerHTML;
}
window.renderSiteChrome = renderSiteChrome;
renderSiteChrome();
