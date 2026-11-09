import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove duplicate suAuthModal and su-auth-styles if present
const suAuthStylesStart = '<style id="su-auth-styles">';
const suAuthModalEnd = '</div>\n\n<div id="suProfile"';

const styleIdx = html.indexOf(suAuthStylesStart);
const profileIdx = html.indexOf('<div id="suProfile" role="dialog"');

if (styleIdx !== -1 && profileIdx !== -1 && styleIdx < profileIdx) {
  html = html.slice(0, styleIdx) + html.slice(profileIdx);
  console.log('✓ Removed duplicate suAuthModal and su-auth-styles');
}

// 2. Remove suAuthModal from SU_OVERLAY_MANAGER OVERLAY_CONFIGS
const suAuthModalOverlayEntry = `{ id: 'suAuthModal', openClass: 'open', closeSelectors: ['#suAuthClose', '#suAuthBackdrop', '.su-auth-close'] },\n    `;
if (html.includes(suAuthModalOverlayEntry)) {
  html = html.replace(suAuthModalOverlayEntry, '');
  console.log('✓ Cleaned OVERLAY_CONFIGS');
}

// 3. Update #sheet in #splash (lines ~594-618)
const oldSheetHTML = `<section aria-label="Нэвтрэх" class="sheet" id="sheet" inert="">
<button class="back" id="back" type="button">‹ Буцах</button>
<div aria-label="Нэвтрэх эсвэл бүртгүүлэх" class="tabs" role="tablist">
<button aria-controls="form" aria-selected="true" id="tab-in" role="tab" type="button">Нэвтрэх</button>
<button aria-controls="form" aria-selected="false" id="tab-up" role="tab" tabindex="-1" type="button">Бүртгүүлэх</button>
</div>
<form aria-labelledby="tab-in" id="form" novalidate="" role="tabpanel">
<label class="field name"><span>Нэр</span><input autocomplete="name" id="f-name" maxlength="40" placeholder="Таны нэр" type="text"/></label>
<label class="field"><span>И-мэйл</span><input autocomplete="email" id="f-mail" inputmode="email" placeholder="name@example.com" type="email"/></label>
<label class="field pw"><span>Нууц үг</span><input autocomplete="current-password" id="f-pass" placeholder="Хамгийн багадаа 8 тэмдэгт" type="password"/>
<button aria-label="Нууц үгийг харуулах" aria-pressed="false" class="eye" id="eye" type="button">Харах</button></label>
<div class="opts">
<label><input id="remember" type="checkbox"/> Намайг сана</label>
<a class="forgot" href="#" id="forgot">Нууц үгээ мартсан уу?</a>
</div>
<div class="verify" id="verify">
<p class="vtext" id="vtext"></p>
<input aria-label="6 оронтой баталгаажуулах код" autocomplete="one-time-code" class="code" id="f-code" inputmode="numeric" maxlength="6" pattern="[0-9]*" placeholder="000000" type="text"/>
<div class="vrow"><button class="link" id="resend" type="button">Код дахин илгээх</button><button class="link" id="change" type="button">И-мэйл солих</button></div>
<p class="demo" hidden="" id="demo"></p>
</div>
<button class="cta" id="submit" type="submit">Нэвтрэх</button>
<p aria-live="polite" class="msg" id="msg" role="status"></p>
</form>
</section>`;

const newSheetHTML = `<section aria-label="Нэвтрэх" class="sheet" id="sheet" inert="">
<button class="back" id="back" type="button">‹ Буцах</button>
<div aria-label="Нэвтрэх эсвэл бүртгүүлэх" class="tabs" role="tablist">
<button aria-controls="form" aria-selected="true" id="tab-in" role="tab" type="button">Нэвтрэх</button>
<button aria-controls="form" aria-selected="false" id="tab-up" role="tab" tabindex="-1" type="button">Бүртгүүлэх</button>
</div>
<form aria-labelledby="tab-in" id="form" novalidate="" role="tabpanel">
<label class="field name"><span>Нэр</span><input autocomplete="name" id="f-name" maxlength="40" placeholder="Таны нэр" type="text"/></label>
<label class="field"><span>И-мэйл</span><input autocomplete="email" id="f-mail" inputmode="email" placeholder="name@example.com" type="email"/></label>
<label class="field pw"><span>Нууц үг</span><input autocomplete="current-password" id="f-pass" placeholder="Хамгийн багадаа 8 тэмдэгт" type="password"/>
<button aria-label="Нууц үгийг харуулах" aria-pressed="false" class="eye" id="eye" type="button">Харах</button></label>
<label class="field pw pass2"><span>Нууц үг давтах</span><input autocomplete="new-password" id="f-pass2" placeholder="Нууц үгээ дахин оруулна уу" type="password"/>
<button aria-label="Нууц үгийг харуулах" aria-pressed="false" class="eye" id="eye2" type="button">Харах</button></label>
<div class="opts">
<label><input id="remember" type="checkbox"/> Намайг сана</label>
<a class="forgot" href="#" id="forgot">Нууц үгээ мартсан уу?</a>
</div>
<div class="verify" id="verify">
<p class="vtext" id="vtext"></p>
<input aria-label="6 оронтой баталгаажуулах код" autocomplete="one-time-code" class="code" id="f-code" inputmode="numeric" maxlength="6" pattern="[0-9]*" placeholder="000000" type="text"/>
<div class="vrow"><button class="link" id="resend" type="button">Код дахин илгээх</button><button class="link" id="change" type="button">И-мэйл солих</button></div>
<p class="demo" hidden="" id="demo"></p>
</div>
<button class="cta" id="submit" type="submit">Нэвтрэх</button>
<p aria-live="polite" class="msg" id="msg" role="status"></p>
</form>
</section>`;

if (html.includes(oldSheetHTML)) {
  html = html.replace(oldSheetHTML, newSheetHTML);
  console.log('✓ Updated #sheet with f-pass2 and eye2');
} else {
  console.log('Notice: oldSheetHTML not exact match, checking partial...');
}

// 4. Update CSS: Add .pass2 style and strict onboarding visibility
const pass2CSSRule = `
.pass2{display:none}
.signup .pass2{display:block}
.signup .name{display:none}

/* Strict Onboarding & Welcome Screen visibility */
.phone:not(.in) #splash {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
.phone:not(.in) #lab {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
.phone.in #splash {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
}
.phone.in #lab {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}
`;

const splashCssMarker = `.phone.in #splash{display:none}.phone.in #lab{display:flex}`;
if (html.includes(splashCssMarker)) {
  html = html.replace(splashCssMarker, splashCssMarker + '\n' + pass2CSSRule);
  console.log('✓ Added pass2 CSS and strict onboarding visibility rules');
}

// 5. Update media queries: Scope #lab to .phone.in #lab so unauthenticated users see Welcome Screen
const oldMobileLabRule = `  /* Main Lab Mobile View */
  #lab {
    padding: max(12px, env(safe-area-inset-top, 12px)) 16px 0 !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
  }`;

const newMobileLabRule = `  /* Main Lab Mobile View */
  .phone.in #lab {
    padding: max(12px, env(safe-area-inset-top, 12px)) 16px 0 !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
  }`;

if (html.includes(oldMobileLabRule)) {
  html = html.replace(oldMobileLabRule, newMobileLabRule);
  console.log('✓ Scoped mobile #lab to .phone.in #lab');
}

const oldDesktopLabRule = `  /* Spacious, Immersive Desktop Main Lab */
  #lab {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    padding: 24px 48px 100px !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    background: radial-gradient(90% 50% at 50% 0%, #12308a 0%, transparent 70%), linear-gradient(#060b28, #0a1a4a 55%, #04061a) !important;
  }`;

const newDesktopLabRule = `  /* Spacious, Immersive Desktop Main Lab */
  .phone.in #lab {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    padding: 24px 48px 100px !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    background: radial-gradient(90% 50% at 50% 0%, #12308a 0%, transparent 70%), linear-gradient(#060b28, #0a1a4a 55%, #04061a) !important;
  }`;

if (html.includes(oldDesktopLabRule)) {
  html = html.replace(oldDesktopLabRule, newDesktopLabRule);
  console.log('✓ Scoped desktop #lab to .phone.in #lab');
}

// 6. Replace the script with the clean, complete Welcome Screen & Sheet Auth Engine
const scriptStartOld = `<script>
(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  /* Storage helper */`;

const scriptEndOld = `updateTopButton(false, null, null);
    updateProfileAccountView(false, null, null);
    syncAllCredits(0);
  }
})();
</script>`;

const sStartIdx = html.indexOf(scriptStartOld);
const sEndIdx = html.indexOf(scriptEndOld);

if (sStartIdx === -1 || sEndIdx === -1) {
  console.error('Failed to locate script boundaries: start=', sStartIdx, 'end=', sEndIdx);
  process.exit(1);
}

const oldScriptBlock = html.slice(sStartIdx, sEndIdx + scriptEndOld.length);

const newAuthEngineScript = `<script>
(function(){
  'use strict';
  const $ = id => document.getElementById(id);
  const phone = $('phone'), sheet = $('sheet'), form = $('form'), msg = $('msg'), submit = $('submit');
  const fMail = $('f-mail'), fPass = $('f-pass'), fPass2 = $('f-pass2'), fName = $('f-name');
  const MAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/, ITER = 150000;

  /* Storage helper */
  const mem = {};
  const store = {
    get(a, k) { try { return JSON.parse(window[a].getItem(k)); } catch(e) { return mem[a+k] || null; } },
    set(a, k, v) { mem[a+k] = v; try { window[a].setItem(k, JSON.stringify(v)); } catch(e) {} },
    del(a, k) { delete mem[a+k]; try { window[a].removeItem(k); } catch(e) {} }
  };

  const getUsers = () => store.get('localStorage', 'rf_users') || {};
  const saveUsers = (u) => store.set('localStorage', 'rf_users', u);

  /* WebCrypto PBKDF2 + SHA-256 with 150,000 iterations */
  const enc = new TextEncoder();
  const toB64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function hash(pass, salt) {
    const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256);
    return toB64(bits);
  }

  function say(t, type) {
    if (!msg) return;
    msg.textContent = t;
    msg.className = 'msg' + (type ? ' ' + type : '');
  }

  function invalid(el, on) {
    if (!el) return;
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on) {
      el.style.borderColor = 'var(--err, #ff9a8a)';
    } else {
      el.style.borderColor = '';
    }
  }

  function clearInvalid() {
    [fMail, fPass, fPass2, fName].forEach(e => { if (e) invalid(e, false); });
  }

  const isSignup = () => sheet && sheet.classList.contains('signup');

  function setMode(up) {
    if (!sheet) return;
    sheet.classList.remove('verifying');
    pending = null;
    codeVal = '';
    const demo = $('demo');
    if (demo) demo.hidden = true;
    sheet.classList.toggle('signup', up);
    const tabIn = $('tab-in'), tabUp = $('tab-up');
    if (tabIn) {
      tabIn.setAttribute('aria-selected', String(!up));
      tabIn.tabIndex = up ? -1 : 0;
    }
    if (tabUp) {
      tabUp.setAttribute('aria-selected', String(up));
      tabUp.tabIndex = up ? 0 : -1;
    }
    if (form) form.setAttribute('aria-labelledby', up ? 'tab-up' : 'tab-in');
    if (submit) submit.textContent = up ? 'Бүртгүүлэх' : 'Нэвтрэх';
    if (fPass) fPass.autocomplete = up ? 'new-password' : 'current-password';
    clearInvalid();
    say('');
  }

  function openSheet() {
    if (!phone || !sheet) return;
    phone.classList.add('open');
    sheet.inert = false;
    setTimeout(() => { if (fMail) fMail.focus({ preventScroll: true }); }, 150);
  }

  function closeSheet() {
    if (!phone || !sheet) return;
    phone.classList.remove('open');
    sheet.inert = true;
    clearInvalid();
    say('');
    const start = $('start');
    if (start) start.focus();
  }

  window.openAuthSheet = openSheet;
  window.closeAuthSheet = closeSheet;

  /* ===== Main Lab: нэр, кредит, түвшин ===== */
  let curMail = null;
  window.curMail = null;
  const SPACE_COST = 120;

  function updateSpace(c) {
    const open = c >= SPACE_COST || (typeof isSectionUnlocked === 'function' && isSectionUnlocked('spacelab'));
    const b = $('spaceCard');
    if (!b) return;
    if (open) {
      delete b.dataset.locked;
      b.dataset.msg = 'Сансар судлалын лаборатори нээгдэж байна…';
      b.setAttribute('aria-label', 'Сансар судлал');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = 'Нээгдсэн';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0115.4-3');
    } else {
      b.dataset.locked = '1';
      b.dataset.msg = 'Сансар судлал нээгдэхэд ' + SPACE_COST + ' кредит хэрэгтэй (одоо ' + c + ')';
      b.setAttribute('aria-label', 'Сансар судлал, түгжээтэй');
      const sm = $('spaceSmall');
      if (sm) sm.textContent = SPACE_COST + ' кредитээр нээгдэнэ';
      const sh = $('shackle');
      if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0116 0v6');
    }
  }

  function syncAllCredits(credits) {
    const c = Math.max(0, credits | 0);
    const cr = $('credits');
    if (cr) cr.textContent = c;
    const chip = $('credchip');
    if (chip) chip.setAttribute('aria-label', 'Одоо ' + c + ' кредит');
    const curCreds = $('suCurCredits');
    if (curCreds) curCreds.textContent = c + ' ★';
    const chemCreds = $('clCredits');
    if (chemCreds) chemCreds.textContent = '★ ' + c;
    const prCredBadge = $('prCreditBadge');
    if (prCredBadge) prCredBadge.textContent = '★ ' + c + ' кредит';
    const prAccountCredits = $('prAccountCreditsText');
    if (prAccountCredits) prAccountCredits.textContent = '★ ' + c;
    updateSpace(c);
  }

  function renderUser(u) {
    const c = Math.max(0, u.credits | 0);
    const un = $('uname');
    if (un) un.textContent = u.name || 'Судлаач';
    const lvl = $('lvl');
    if (lvl) lvl.textContent = 'Lv ' + (1 + Math.floor(c / 100));
    syncAllCredits(c);
    updateTopButton(true, curMail, u.name);
    updateProfileAccountView(true, curMail, u);
  }

  /* Update top-right button visual based on authentication state */
  function updateTopButton(isLoggedIn, mail, name) {
    const btn = $('logout');
    if (!btn) return;
    const svg = $('suAccountSvg') || btn.querySelector('svg');
    if (isLoggedIn) {
      btn.classList.add('logged-in');
      btn.setAttribute('aria-label', 'Хэрэглэгчийн данс (' + (mail || '') + ')');
      btn.title = 'Таны бүртгэл: ' + (name || mail || '');
      if (svg) {
        svg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><circle cx="19" cy="5" r="2.5" fill="#6ff0cf" stroke="none"></circle>';
      }
    } else {
      btn.classList.remove('logged-in');
      btn.setAttribute('aria-label', 'Нэвтрэх / Бүртгүүлэх');
      btn.title = 'Нэвтрэх / Бүртгүүлэх';
      if (svg) {
        svg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
      }
    }
  }

  function updateProfileAccountView(isLoggedIn, mail, u) {
    const loggedInView = $('prLoggedInAccountView');
    const guestView = $('prGuestAccountView');
    const emailDisplay = $('prEmailDisplay');
    const accountEmailText = $('prAccountEmailText');
    const prName = $('prName');

    if (isLoggedIn && u) {
      if (loggedInView) loggedInView.style.display = 'block';
      if (guestView) guestView.style.display = 'none';
      if (emailDisplay) emailDisplay.textContent = mail;
      if (accountEmailText) accountEmailText.textContent = mail;
      if (prName) prName.textContent = u.name || 'Судлаач';
    } else {
      if (loggedInView) loggedInView.style.display = 'none';
      if (guestView) guestView.style.display = 'block';
      if (emailDisplay) emailDisplay.textContent = 'Бүртгэлгүй (Зочин)';
      if (accountEmailText) accountEmailText.textContent = 'Зочин хэрэглэгч';
      if (prName) prName.textContent = 'Судлаач (Зочин)';
    }
  }

  /* Public addCredits function */
  window.addCredits = function(n) {
    if (!curMail) {
      const guestVal = Math.max(0, (parseInt(localStorage.getItem('rf_guest_credits') || '0', 10) || 0) + n);
      localStorage.setItem('rf_guest_credits', guestVal);
      syncAllCredits(guestVal);
      return guestVal;
    }
    const users = getUsers();
    const u = users[curMail];
    if (!u) return 0;
    u.credits = Math.max(0, (u.credits | 0) + n);
    saveUsers(users);
    syncAllCredits(u.credits);
    return u.credits;
  };

  /* Enter Main Lab with authenticated session */
  function showLab(mail, u) {
    curMail = mail;
    window.curMail = mail;
    if (typeof u.credits !== 'number') { u.credits = 0; }
    renderUser(u);
    phone.classList.add('in');
    phone.classList.remove('open');
    sheet.inert = true;
    setTimeout(() => {
      const lg = $('logout');
      if (lg) lg.focus();
    }, 50);
  }

  /* Log out user cleanly and return to Welcome Screen */
  function logout() {
    store.del('localStorage', 'rf_session');
    store.del('sessionStorage', 'rf_session');
    curMail = null;
    window.curMail = null;
    phone.classList.remove('in', 'open');
    sheet.inert = true;
    if (fPass) fPass.value = '';
    if (fPass2) fPass2.value = '';
    say('');
    updateTopButton(false, null, null);
    updateProfileAccountView(false, null, null);
    syncAllCredits(0);
    if (typeof window.closeProfile === 'function') {
      window.closeProfile();
    }
    const start = $('start');
    if (start) start.focus();
    toastSay('Системээс гарлаа.');
  }

  window.logout = logout;
  window.logoutUser = logout;

  /* Toast notification */
  const toast = $('toast');
  let timer;
  function toastSay(t) {
    if (!toast) return;
    toast.textContent = t;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* Card and nav tabs bindings */
  document.querySelectorAll('.card').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.locked) {
      b.classList.remove('shake');
      void b.offsetWidth;
      b.classList.add('shake');
    }
    toastSay(b.dataset.msg);
  }));

  const navTabs = document.querySelectorAll('.nav button');
  navTabs.forEach(t => t.addEventListener('click', () => {
    navTabs.forEach(x => x.removeAttribute('aria-current'));
    t.setAttribute('aria-current', 'page');
  }));

  /* Welcome Screen Start Button ("Эхлэх") */
  const startBtn = $('start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const saved = store.get('sessionStorage', 'rf_session') || store.get('localStorage', 'rf_session');
      const users = getUsers();
      if (saved && users[saved] && users[saved].emailVerified !== false) {
        showLab(saved, users[saved]);
      } else {
        setMode(false); // Open in Login tab
        openSheet();
      }
    });
  }

  /* Back Button ("‹ Буцах") */
  const backBtn = $('back');
  if (backBtn) {
    backBtn.addEventListener('click', closeSheet);
  }

  /* Top Right Account / Profile Button */
  const logoutBtn = $('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (curMail) {
        if (typeof window.openProfile === 'function') {
          window.openProfile();
        }
      } else {
        setMode(false);
        openSheet();
      }
    });
  }

  /* Profile Modal Logout Button */
  const prLogoutBtn = $('prLogoutBtn');
  if (prLogoutBtn) {
    prLogoutBtn.addEventListener('click', logout);
  }
  const prLoginModalBtn = $('prLoginModalBtn');
  if (prLoginModalBtn) {
    prLoginModalBtn.addEventListener('click', () => {
      if (typeof window.closeProfile === 'function') window.closeProfile();
      setMode(false);
      openSheet();
    });
  }

  /* Tab switching: Login vs Register */
  const tabIn = $('tab-in'), tabUp = $('tab-up');
  if (tabIn) tabIn.addEventListener('click', () => setMode(false));
  if (tabUp) tabUp.addEventListener('click', () => setMode(true));

  const tabsWrap = document.querySelector('.tabs');
  if (tabsWrap) {
    tabsWrap.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const up = e.key === 'ArrowRight';
        setMode(up);
        const t = $(up ? 'tab-up' : 'tab-in');
        if (t) t.focus();
      }
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && phone.classList.contains('open') && !phone.classList.contains('in')) {
      closeSheet();
    }
  });

  /* Forgot password */
  const forgotLink = $('forgot');
  if (forgotLink) {
    forgotLink.addEventListener('click', async e => {
      e.preventDefault();
      const mail = fMail.value.trim().toLowerCase();
      if (!MAIL_RE.test(mail)) {
        invalid(fMail, true);
        say('Эхлээд бүртгэлтэй и-мэйл хаягаа оруулна уу.', 'err');
        fMail.focus();
        return;
      }
      const users = getUsers();
      if (!users[mail]) {
        invalid(fMail, true);
        say('Энэ и-мэйл хаягаар бүртгэлтэй хэрэглэгч олдсонгүй.', 'err');
        return;
      }
      pending = { mail, isReset: true, name: users[mail].name };
      await startVerify();
      say('Нууц үг сэргээх 6 оронтой код илгээлээ.', 'ok');
    });
  }

  /* Password eye visibility buttons */
  const eyeBtn = $('eye');
  if (eyeBtn) {
    eyeBtn.addEventListener('click', function() {
      const show = fPass.type === 'password';
      fPass.type = show ? 'text' : 'password';
      this.textContent = show ? 'Нуух' : 'Харах';
      this.setAttribute('aria-pressed', String(show));
      this.setAttribute('aria-label', show ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах');
    });
  }

  const eye2Btn = $('eye2');
  if (eye2Btn) {
    eye2Btn.addEventListener('click', function() {
      if (!fPass2) return;
      const show = fPass2.type === 'password';
      fPass2.type = show ? 'text' : 'password';
      this.textContent = show ? 'Нуух' : 'Харах';
      this.setAttribute('aria-pressed', String(show));
      this.setAttribute('aria-label', show ? 'Нууц үгийг нуух' : 'Нууц үгийг харуулах');
    });
  }

  [fMail, fPass, fPass2, fName].forEach(el => {
    if (el) el.addEventListener('input', () => invalid(el, false));
  });

  let fails = 0, lockUntil = 0;
  let pending = null, codeVal = '', codeExp = 0, codeTries = 0, lastSent = 0;
  const genCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');

  async function sendCode(mail, code) {
    const d = $('demo');
    if (d) {
      d.hidden = false;
      d.innerHTML = '<b>Баталгаажуулах код:</b> <span style="font-size:16px;color:#fff;letter-spacing:2px;font-weight:bold">' + code + '</span>';
    }
  }

  async function issueCode() {
    codeVal = genCode();
    codeExp = Date.now() + 5 * 60 * 1000;
    codeTries = 0;
    lastSent = Date.now();
    await sendCode(pending.mail, codeVal);
  }

  async function startVerify() {
    await issueCode();
    sheet.classList.add('verifying');
    const vtext = $('vtext');
    if (vtext) {
      vtext.textContent = pending.mail + ' хаяг руу 6 оронтой код илгээлээ. Кодыг 5 минутын дотор оруулна уу.';
    }
    if (submit) submit.textContent = 'Баталгаажуулах';
    const fc = $('f-code');
    if (fc) {
      fc.value = '';
      fc.focus();
    }
    say('');
  }

  async function checkCode() {
    const c = $('f-code');
    const v = c ? c.value.trim() : '';
    invalid(c, false);
    if (!/^\\d{6}$/.test(v)) {
      invalid(c, true);
      say('6 оронтой кодоо оруулна уу.', 'err');
      if (c) c.focus();
      return;
    }
    if (!codeVal || Date.now() > codeExp) {
      say('Кодын хугацаа дууссан эсвэл хүчингүй болсон. "Код дахин илгээх" дарна уу.', 'err');
      return;
    }
    if (v !== codeVal) {
      invalid(c, true);
      if (++codeTries >= 5) {
        codeVal = '';
        say('Хэт олон буруу оролдлоо. Шинэ код авна уу.', 'err');
      } else {
        say('Код буруу байна. Үлдсэн оролдлого: ' + (5 - codeTries), 'err');
      }
      if (c) c.focus();
      return;
    }

    const users = getUsers();

    // If reset flow
    if (pending && pending.isReset) {
      const newPass = prompt('Шинэ нууц үгээ оруулна уу (дор хаяж 8 тэмдэгт):');
      if (newPass && newPass.length >= 8) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        users[pending.mail].salt = toB64(salt);
        users[pending.mail].hash = await hash(newPass, salt);
        saveUsers(users);
        setMode(false);
        fMail.value = pending.mail;
        fPass.value = '';
        say('Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.', 'ok');
        fPass.focus();
      } else {
        say('Нууц үг хамгийн багадаа 8 тэмдэгттэй байх ёстой.', 'err');
      }
      return;
    }

    // Normal registration activation
    users[pending.mail] = {
      name: pending.name,
      mail: pending.mail,
      salt: pending.salt,
      hash: pending.hash,
      credits: 0,
      unlockedSections: {},
      emailVerified: true,
      createdAt: Date.now()
    };
    saveUsers(users);
    const mail = pending.mail;
    store.set($('remember') && $('remember').checked ? 'localStorage' : 'sessionStorage', 'rf_session', mail);
    toastSay('Бүртгэл амжилттай үүслээ! Тавтай морил.');
    showLab(mail, users[mail]);
  }

  const resendBtn = $('resend');
  if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
      const wait = Math.ceil((lastSent + 30000 - Date.now()) / 1000);
      if (wait > 0) {
        say('Шинэ код авахын тулд ' + wait + ' секунд хүлээнэ үү.', 'err');
        return;
      }
      await issueCode();
      const fc = $('f-code');
      if (fc) {
        fc.value = '';
        fc.focus();
      }
      say('Шинэ код илгээлээ.', 'ok');
    });
  }

  const changeBtn = $('change');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      setMode(true);
      if (fMail) fMail.focus();
    });
  }

  const fCode = $('f-code');
  if (fCode) {
    fCode.addEventListener('input', function() {
      this.value = this.value.replace(/\\D/g, '');
      invalid(this, false);
    });
  }

  /* Form submission */
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sheet.classList.contains('verifying')) {
        await checkCode();
        return;
      }

      const up = isSignup();
      const mail = fMail ? fMail.value.trim().toLowerCase() : '';
      const pass = fPass ? fPass.value : '';
      const pass2 = fPass2 ? fPass2.value : '';
      const name = fName && fName.value.trim() ? fName.value.trim() : (mail ? mail.split('@')[0] : 'Судлаач');

      clearInvalid();

      if (!MAIL_RE.test(mail)) {
        invalid(fMail, true);
        say('И-мэйл хаягаа зөв оруулна уу.', 'err');
        fMail.focus();
        return;
      }
      if (!pass) {
        invalid(fPass, true);
        say('Нууц үгээ оруулна уу.', 'err');
        fPass.focus();
        return;
      }
      if (up && pass.length < 8) {
        invalid(fPass, true);
        say('Нууц үг хамгийн багадаа 8 тэмдэгттэй байна.', 'err');
        fPass.focus();
        return;
      }
      if (up && pass !== pass2) {
        invalid(fPass2, true);
        say('Нууц үг хоорондоо тохирохгүй байна. Дахин шалгана уу.', 'err');
        if (fPass2) fPass2.focus();
        return;
      }
      if (!(window.crypto && crypto.subtle)) {
        say('Энэ хөтөч дээр аюулгүй хадгалалт ажиллахгүй байна.', 'err');
        return;
      }
      if (Date.now() < lockUntil) {
        say('Хэт олон оролдлоо. ' + Math.ceil((lockUntil - Date.now()) / 1000) + ' секундийн дараа дахин оролдоно уу.', 'err');
        return;
      }

      if (submit) submit.disabled = true;

      try {
        const users = getUsers();

        if (up) {
          if (users[mail]) {
            setMode(false);
            fMail.value = mail;
            say('Энэ и-мэйл бүртгэлтэй байна. Нэвтэрнэ үү.', 'err');
            fPass.focus();
            return;
          }
          const salt = crypto.getRandomValues(new Uint8Array(16));
          pending = { mail, name, salt: toB64(salt), hash: await hash(pass, salt) };
          await startVerify();
          return;
        }

        // Login flow
        const u = users[mail];
        let ok = false;
        if (u && u.salt && u.hash) {
          ok = (await hash(pass, fromB64(u.salt))) === u.hash;
        }

        if (!ok) {
          if (++fails >= 5) {
            lockUntil = Date.now() + 30000;
            fails = 0;
          }
          invalid(fMail, true);
          invalid(fPass, true);
          say('И-мэйл эсвэл нууц үг буруу байна. Бүртгэлгүй бол "Бүртгүүлэх" табыг сонгоно уу.', 'err');
          return;
        }

        fails = 0;
        const rememberChecked = $('remember') ? $('remember').checked : true;
        if (rememberChecked) {
          store.set('localStorage', 'rf_session', mail);
          store.del('sessionStorage', 'rf_session');
        } else {
          store.set('sessionStorage', 'rf_session', mail);
          store.del('localStorage', 'rf_session');
        }
        fPass.value = '';
        if (fPass2) fPass2.value = '';
        say('');
        showLab(mail, u);
        toastSay('Амжилттай нэвтэрлээ! Тавтай морил.');
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  /* Restore existing saved session on startup */
  const saved = store.get('sessionStorage', 'rf_session') || store.get('localStorage', 'rf_session');
  const allUsers = getUsers();
  if (saved && allUsers[saved] && allUsers[saved].emailVerified !== false) {
    showLab(saved, allUsers[saved]);
  } else {
    // Unauthenticated state: display Welcome Screen
    curMail = null;
    window.curMail = null;
    phone.classList.remove('in', 'open');
    sheet.inert = true;
    updateTopButton(false, null, null);
    updateProfileAccountView(false, null, null);
    syncAllCredits(0);
  }
})();
</script>`;

html = html.replace(oldScriptBlock, newAuthEngineScript);
console.log('✓ Replaced Auth & Onboarding Engine script');

console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Done! Updated index.html length:', html.length);

