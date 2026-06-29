/* ============================================================ */
/* auth.js — easy login / sign-up for the booking site.         */
/*                                                              */
/*  NOTE: this is a front-end-only demo. Accounts are stored in */
/*  the browser's localStorage on this device — it is NOT real  */
/*  security and does not talk to a server. When you're ready,  */
/*  swap createUser()/signIn() for a real backend (e.g.         */
/*  Firebase Auth or Supabase) and the rest of the UI can stay. */
/* ============================================================ */

const Auth = (() => {
  const USERS = 'cc_users';     // all registered accounts
  const SESSION = 'cc_user';    // the currently signed-in account

  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } };
  const users = () => read(USERS) || [];
  // tiny obfuscation only — NOT a secure hash. Replace with a real backend.
  const scramble = s => btoa(unescape(encodeURIComponent('cc•' + s)));

  function currentUser(){ return read(SESSION); }

  function createUser({ name, email, password }){
    email = email.trim().toLowerCase();
    if(users().some(u => u.email === email)) throw new Error('An account with that email already exists.');
    const u = { name: name.trim(), email, pass: scramble(password) };
    localStorage.setItem(USERS, JSON.stringify([...users(), u]));
    localStorage.setItem(SESSION, JSON.stringify({ name: u.name, email: u.email }));
    return u;
  }

  function signIn({ email, password }){
    email = email.trim().toLowerCase();
    const u = users().find(x => x.email === email);
    if(!u || u.pass !== scramble(password)) throw new Error('That email or password doesn’t match.');
    localStorage.setItem(SESSION, JSON.stringify({ name: u.name, email: u.email }));
    return u;
  }

  function signOut(){ localStorage.removeItem(SESSION); }

  return { currentUser, createUser, signIn, signOut };
})();

/* ---- wire up the login page UI (only runs if the form exists) ---- */
(function(){
  const root = document.getElementById('authCard');
  if(!root) return;

  const tabLogin  = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const formLogin  = document.getElementById('formLogin');
  const formSignup = document.getElementById('formSignup');
  const msg = document.getElementById('authMsg');
  const signedIn = document.getElementById('signedIn');

  function showTab(which){
    const login = which === 'login';
    tabLogin.classList.toggle('active', login);
    tabSignup.classList.toggle('active', !login);
    formLogin.hidden = !login;
    formSignup.hidden = login;
    msg.hidden = true;
  }
  tabLogin.addEventListener('click', () => showTab('login'));
  tabSignup.addEventListener('click', () => showTab('signup'));

  function showMsg(text, ok){
    msg.textContent = text;
    msg.className = 'auth-msg ' + (ok ? 'ok' : 'err');
    msg.hidden = false;
  }

  function renderSignedIn(){
    if(window.renderSiteChrome) window.renderSiteChrome();   // refresh the nav (Log in ↔ account)
    const u = Auth.currentUser();
    if(u){
      signedIn.querySelector('.who').textContent = u.name;
      signedIn.querySelector('.email').textContent = u.email;
      signedIn.hidden = false;
      document.getElementById('authForms').hidden = true;
    } else {
      signedIn.hidden = true;
      document.getElementById('authForms').hidden = false;
    }
  }

  formSignup.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim();
    const pass = document.getElementById('suPass').value;
    if(name.length < 2) return showMsg('Please enter your name.', false);
    if(pass.length < 6) return showMsg('Use a password of at least 6 characters.', false);
    try { Auth.createUser({ name, email, password: pass }); renderSignedIn(); }
    catch(err){ showMsg(err.message, false); }
  });

  formLogin.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('liEmail').value.trim();
    const pass = document.getElementById('liPass').value;
    try { Auth.signIn({ email, password: pass }); renderSignedIn(); }
    catch(err){ showMsg(err.message, false); }
  });

  document.getElementById('signOutBtn').addEventListener('click', () => {
    Auth.signOut(); renderSignedIn(); showTab('login');
  });

  renderSignedIn();
})();
