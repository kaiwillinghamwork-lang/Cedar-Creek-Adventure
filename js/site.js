/* ============================================================ */
/* site.js — shared header + footer for every page.            */
/*   Renders the logo nav into #siteHeader and the footer into  */
/*   #siteFooter, marks the active link, and shows whether      */
/*   someone is logged in (see auth.js / localStorage).         */
/* ============================================================ */

function renderSiteChrome(){
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const hasSideMenu = !!document.getElementById('sideMenu');   // only true on the home page

  /* current signed-in user, if any (set by auth.js) */
  function currentUser(){
    try { return JSON.parse(localStorage.getItem('cc_user') || 'null'); }
    catch(e){ return null; }
  }

  const links = [
    { label:'Home',     href:'index.html' },
    { label:'About',    href:'about.html' },
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
      <img src="images/logo.png" alt="" class="brand-logo">
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
    <img src="images/logo.png" alt="" class="footer-logo">
    <p><b>Cedar Creek Hunt &amp; Adventure Basecamp</b></p>
    <p>3928 Cedar Creek Rd · Colville, WA · 28 acres on East Fork Cedar Creek</p>
    <nav class="footer-links">
      <a href="index.html">Home</a><a href="about.html">About</a><a href="schedule.html">Plan a Stay</a><a href="login.html">Log in</a>
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
