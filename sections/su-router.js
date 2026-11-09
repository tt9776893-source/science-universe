/* Science Universe — section router (Home / Build / Space Lab / Explore / Classic Space).
 * Inlined into index.html together with su-sandbox.js (see tools/build_integration.mjs).
 * Depends on: createSandbox() from su-sandbox.js, and the payload scripts
 *   #su-build-css / #su-build-html / #su-build-js embedded in index.html. */

const SU_ROOT = document.getElementById('suSections');
const SU_BAR = document.getElementById('suBar');
const SU_HOSTS = {
  build: document.getElementById('suHostBuild'),
  spacelab: document.getElementById('suHostSpacelab'),
  explore: document.getElementById('suHostExplore'),
};
const SU_LABELS = {
  home: 'HOME',
  build: 'BUILD',
  spacelab: 'SPACE LAB',
  explore: 'EXPLORE',
  classic: 'CLASSIC SPACE'
};
const suState = { current: 'home', sandboxes: {}, token: 0, exploreReady: false };

/* --------------------------- Section Metadata --------------------------- */
const SECTION_INFO = {
  spacelab: {
    key: 'spacelab',
    storageKey: 'rf_spacelab_unlocked',
    userKey: 'spaceUnlocked',
    cost: 120,
    title: 'САНСАР СУДЛАЛ',
    subtitle: 'SPACE LABORATORY ACCESS',
    label: 'SPACE LAB',
    desc: 'Бодит хэмжээст 3D Нарны аймаг болон гараг хоорондын нислэг, гадаргын судалбар.'
  },
  explore: {
    key: 'explore',
    storageKey: 'rf_explore_unlocked',
    userKey: 'exploreUnlocked',
    cost: 120,
    title: 'ГАРАГ ЭКСПЕДИЦ',
    subtitle: 'EXPLORE EXPEDITION ACCESS',
    label: 'EXPLORE',
    desc: 'Ангараг гаргийн Jezero тогоон дахь нээлттэй ертөнц, өндөр нарийвчлалт 3D судалгаа.'
  },
  classic: {
    key: 'classic',
    storageKey: 'rf_classic_space_unlocked',
    userKey: 'classicSpaceUnlocked',
    cost: 120,
    title: 'СОНГОДОГ САНСАР',
    subtitle: 'CLASSIC SPACE ACCESS',
    label: 'CLASSIC SPACE',
    desc: '3D Гаргийн сканнер, Тераформ симулятор, Цаг хугацааны машин ба Орчлон ертөнцийн лаборатори.'
  }
};

const LOCK_ICON_SVG = '<svg class="su-lock-svg" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

function suText(id) { const el = document.getElementById(id); return el ? el.textContent : ''; }

function suShowError(host, name, err) {
  console.error('[SU] ' + name + ' failed to start:', err);
  const box = document.createElement('div');
  box.className = 'su-error';
  box.innerHTML = '<b>' + name + ' failed to start</b><pre></pre><button type="button">Back to Home</button>';
  box.querySelector('pre').textContent = String(err && (err.stack || err.message) || err);
  box.querySelector('button').onclick = () => suOpen('home');
  host.appendChild(box);
}

function suSetLoading(on, text) {
  const l = document.getElementById('suLoading');
  if (!l) return;
  l.hidden = !on;
  if (text) { const sp = l.querySelector('span'); if (sp) sp.textContent = text; }
}

/* ----------------------- 120-Credit Unlock System ----------------------- */
let isUnlocking = false;

function isSectionUnlocked(secKey) {
  const info = SECTION_INFO[secKey];
  if (!info) return true; // home, build are unlocked by default
  
  // 1. Primary persistence check
  if (localStorage.getItem(info.storageKey) === '1') return true;

  // 2. User profile storage check
  try {
    const rawUsers = localStorage.getItem('rf_users');
    const curMail = window.curMail || localStorage.getItem('rf_session');
    if (rawUsers && curMail) {
      const users = JSON.parse(rawUsers);
      const u = users[curMail];
      if (u && (u[info.userKey] || (u.unlockedSections && u.unlockedSections[secKey]))) {
        return true;
      }
    }
  } catch (e) {}

  // 3. Backward compatibility for Space Lab card
  if (secKey === 'spacelab') {
    const card = document.getElementById('spaceCard');
    if (card && !card.dataset.locked) return true;
  }

  return false;
}

function setSectionUnlocked(secKey) {
  const info = SECTION_INFO[secKey];
  if (!info) return;

  // Persist locally
  localStorage.setItem(info.storageKey, '1');

  // Persist in user store if available
  try {
    const rawUsers = localStorage.getItem('rf_users');
    const curMail = window.curMail || localStorage.getItem('rf_session');
    if (rawUsers && curMail) {
      const users = JSON.parse(rawUsers);
      if (users[curMail]) {
        users[curMail][info.userKey] = true;
        users[curMail].unlockedSections = users[curMail].unlockedSections || {};
        users[curMail].unlockedSections[secKey] = true;
        localStorage.setItem('rf_users', JSON.stringify(users));
      }
    }
  } catch (e) {}

  // Synchronize spaceCard if spacelab
  if (secKey === 'spacelab') {
    applySpaceCardUnlockedVisual();
  }

  suUpdateBar();
}

function applySpaceCardUnlockedVisual() {
  const card = document.getElementById('spaceCard');
  if (!card) return;
  delete card.dataset.locked;
  card.setAttribute('aria-label', 'Сансар судлал');
  card.dataset.msg = 'Сансар судлалын лаборатори нээгдэж байна…';
  const small = document.getElementById('spaceSmall');
  if (small) small.textContent = 'Нээгдсэн';
  const shackle = document.getElementById('shackle');
  if (shackle) shackle.setAttribute('d', 'M16 21v-6a8 8 0 0115.4-3');
}

function showUnlockModal(secKey = 'spacelab') {
  const info = SECTION_INFO[secKey];
  if (!info) return;

  const modal = document.getElementById('suUnlockModal');
  if (!modal) return;

  const creditsEl = document.getElementById('credits');
  const curCredits = parseInt(creditsEl ? creditsEl.textContent : '0', 10) || 0;

  const titleEl = modal.querySelector('.su-modal-title');
  if (titleEl) titleEl.textContent = info.title;

  const subEl = modal.querySelector('.su-modal-sub');
  if (subEl) subEl.textContent = info.subtitle;

  const curEl = document.getElementById('suCurCredits');
  if (curEl) curEl.textContent = curCredits + ' ★';

  const progressEl = document.getElementById('suCreditProgress');
  const pct = Math.min(100, Math.round((curCredits / info.cost) * 100));
  if (progressEl) progressEl.style.width = pct + '%';

  const descEl = document.getElementById('suUnlockDesc');
  const actionsEl = document.getElementById('suUnlockActions');

  if (curCredits >= info.cost) {
    if (descEl) {
      descEl.textContent = 'Танд ' + curCredits + ' кредит байгаа тул ' + info.title + '-ийн түгжээг (' + info.cost + ' ★) бүрэн тайлж нэвтрэх боломжтой байна. ' + info.desc;
    }
    if (actionsEl) {
      actionsEl.innerHTML = '<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn" aria-label="Болих">Болих</button>';
      document.getElementById('suUnlockPayBtn').onclick = () => {
        if (isUnlocking) return;
        isUnlocking = true;

        // Double check balance atomically
        const latestCredits = parseInt(creditsEl ? creditsEl.textContent : '0', 10) || 0;
        if (latestCredits < info.cost) {
          isUnlocking = false;
          showUnlockModal(secKey);
          return;
        }

        // Deduct exactly 120 credits using project mechanism
        if (typeof window.addCredits === 'function') {
          window.addCredits(-info.cost);
        } else if (creditsEl) {
          const rem = Math.max(0, latestCredits - info.cost);
          creditsEl.textContent = rem;
          localStorage.setItem('rf_guest_credits', rem);
          const credchip = document.getElementById('credchip');
          if (credchip) credchip.setAttribute('aria-label', 'Одоо ' + rem + ' кредит');
        }

        // Save unlock state atomically
        setSectionUnlocked(secKey);
        modal.hidden = true;

        // Toast feedback
        const toast = document.getElementById('toast');
        if (toast) {
          toast.textContent = '🚀 ' + info.title + ' амжилттай нээгдлээ!';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2200);
        }

        // Transition user immediately
        setTimeout(() => {
          isUnlocking = false;
          suOpen(secKey);
        }, 350);
      };
      document.getElementById('suUnlockCancelBtn').onclick = () => { modal.hidden = true; };
    }
  } else {
    if (descEl) {
      descEl.textContent = info.title + '-г нээхэд ' + info.cost + ' кредит шаардлагатай (Танд одоогоор ' + curCredits + ' кредит байна). Физик, Хими, Математик, Инженерчлэлийн сорил, бодлогуудыг гүйцэтгэн кредит цуглуулаад нээнэ үү!';
    }
    if (actionsEl) {
      actionsEl.innerHTML = '<button type="button" class="su-btn-close" id="suUnlockGotItBtn" aria-label="Ойлголоо">Ойлголоо</button>';
      document.getElementById('suUnlockGotItBtn').onclick = () => { modal.hidden = true; };
    }
  }

  modal.hidden = false;
  const closeBtn = document.getElementById('suUnlockClose');
  if (closeBtn) closeBtn.onclick = () => { modal.hidden = true; };
}

/* ------------------------------ Build ----------------------------------- */
async function suMountBuild(token) {
  const host = SU_HOSTS.build;
  const sb = createSandbox(host, 'build');
  suState.sandboxes.build = sb;
  sb.setContent({ html: suText('su-build-html'), css: suText('su-build-css') });
  sb.onNavigate(() => {});
  const c = sb.ctx;
  const body = suText('su-build-js');
  const fn = new Function('document', 'window', 'location', 'requestAnimationFrame', 'cancelAnimationFrame',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'addEventListener', 'removeEventListener',
    body);
  fn(c.document, c.window, c.location, c.requestAnimationFrame, c.cancelAnimationFrame,
    c.setTimeout, c.clearTimeout, c.setInterval, c.clearInterval, c.addEventListener, c.removeEventListener);
}

/* ------------------------------ Space Lab ------------------------------- */
async function suMountSpace(page, token) {
  const host = SU_HOSTS.spacelab;
  if (suState.sandboxes.spacelab) { suState.sandboxes.spacelab.dispose(); delete suState.sandboxes.spacelab; host.replaceChildren(); }
  const sb = createSandbox(host, 'spacelab');
  suState.sandboxes.spacelab = sb;
  const mod = await import('./sections/spacelab/' + page + '.mjs');
  if (token !== suState.token) { sb.dispose(); return; }
  sb.setContent({ html: mod.html, css: mod.css });
  sb.onNavigate((url) => {
    if (/solar_system/.test(url)) suMountSpace('solar', suState.token);
    else if (/surface_dimension/.test(url)) suMountSpace('surface', suState.token);
    else suOpen('home');
  });
  await mod.default(sb.ctx);
}

/* ------------------------------ Explore --------------------------------- */
async function suMountExplore(token) {
  const host = SU_HOSTS.explore;
  if (suState.sandboxes.explore) { suState.sandboxes.explore.resume(); return; }
  const sb = createSandbox(host, 'explore');
  suState.sandboxes.explore = sb;
  const ui = await import('./sections/explore/explore-ui.mjs');
  sb.setContent({ html: ui.html, css: ui.css });
  sb.onNavigate(() => window.location.reload());
  const ctxMod = await import('./sections/explore/ctx.js');
  ctxMod.bind(sb.ctx);
  const main = await import('./sections/explore/src/main.js');
  await main.startExplore();
}

/* ------------------------------ routing --------------------------------- */
function suLeave(name) {
  if (name === 'build' || name === 'spacelab') {
    const sb = suState.sandboxes[name];
    if (sb) { sb.dispose(); delete suState.sandboxes[name]; }
    SU_HOSTS[name].replaceChildren();
  } else if (name === 'explore') {
    const sb = suState.sandboxes.explore;
    if (sb) sb.suspend();
  }
  if (SU_HOSTS[name]) SU_HOSTS[name].hidden = true;
}

async function suOpen(name, opts = {}) {
  // Authorization check for lockable sections
  if (SECTION_INFO[name] && !isSectionUnlocked(name)) {
    showUnlockModal(name);
    return;
  }

  if (name === 'classic') {
    if (suState.current !== 'home') await suOpen('home', { silent: true });
    suState.current = 'classic';
    if (typeof window.openSpaceExplore === 'function') {
      window.openSpaceExplore('time', true); // pass internal bypass flag
    }
    suUpdateBar();
    return;
  }

  const prev = suState.current;
  if (prev === 'classic' && typeof window.closeSpaceExplore === 'function') window.closeSpaceExplore();
  if (prev === name && name !== 'home') return;

  const token = ++suState.token;
  if (SU_HOSTS[prev]) suLeave(prev);
  suState.current = name;

  if (name === 'home') {
    SU_ROOT.hidden = true;
    document.documentElement.classList.remove('su-in-section');
    suSetLoading(false);
  } else {
    SU_ROOT.hidden = false;
    document.documentElement.classList.add('su-in-section');
    SU_HOSTS[name].hidden = false;
    suSetLoading(true, 'Loading ' + SU_LABELS[name] + '…');
    try {
      if (name === 'build') await suMountBuild(token);
      else if (name === 'spacelab') await suMountSpace('solar', token);
      else if (name === 'explore') await suMountExplore(token);
    } catch (err) {
      suShowError(SU_HOSTS[name], SU_LABELS[name], err);
    }
    if (token === suState.token) suSetLoading(false);
  }

  suUpdateBar();
  if (!opts.silent && !opts.fromHash) {
    const h = name === 'home' ? '' : '#' + name;
    if (location.hash !== h) history.pushState(null, '', location.pathname + location.search + h);
  }
}

function suUpdateBar() {
  SU_BAR.querySelectorAll('button[data-su]').forEach((b) => {
    const sec = b.dataset.su;
    b.setAttribute('aria-current', sec === suState.current ? 'page' : 'false');

    if (SECTION_INFO[sec]) {
      const unlocked = isSectionUnlocked(sec);
      if (unlocked) {
        b.classList.remove('su-locked-btn');
        b.innerHTML = SECTION_INFO[sec].label;
        b.removeAttribute('title');
      } else {
        b.classList.add('su-locked-btn');
        b.innerHTML = '<span class="su-lock-icon">' + LOCK_ICON_SVG + '</span>' + SECTION_INFO[sec].label;
        b.setAttribute('title', 'Түгжээтэй · 120 кредит');
      }
    }
  });

  const navBtns = [...document.querySelectorAll('#phone nav.nav button')];
  if (suState.current === 'home') {
    const hb = navBtns.find((b) => b.textContent.trim() === 'Home');
    if (hb) { navBtns.forEach((b) => b.removeAttribute('aria-current')); hb.setAttribute('aria-current', 'page'); }
  } else {
    navBtns.forEach((b) => { if (!b.dataset.suNav) b.removeAttribute('aria-current'); });
    const cur = navBtns.find((b) => b.dataset.suNav === suState.current);
    if (cur) { navBtns.forEach((b) => b.removeAttribute('aria-current')); cur.setAttribute('aria-current', 'page'); }
  }
}

SU_BAR.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-su]');
  if (b) {
    const sec = b.dataset.su;
    if (SECTION_INFO[sec] && !isSectionUnlocked(sec)) {
      showUnlockModal(sec);
      return;
    }
    suOpen(sec);
    SU_BAR.classList.remove('open');
  }
  if (e.target.closest('#suBarToggle')) SU_BAR.classList.toggle('open');
});

/* Main-site entry points: bottom nav (Build) and Space Lab locked card. */
function suHookMain() {
  // Enhance window.addCredits to seamlessly support guest credits if not logged in
  const origAddCredits = window.addCredits;
  window.addCredits = function(n) {
    let handled = false;
    try {
      const rawUsers = localStorage.getItem('rf_users');
      const curMail = window.curMail || localStorage.getItem('rf_session');
      if (rawUsers && curMail && typeof origAddCredits === 'function') {
        origAddCredits(n);
        handled = true;
      }
    } catch (e) {}

    // Fallback: update DOM credits and localStorage guest credits
    const creditsEl = document.getElementById('credits');
    const cur = parseInt(creditsEl ? creditsEl.textContent : '0', 10) || 0;
    const next = Math.max(0, cur + n);
    if (creditsEl) creditsEl.textContent = next;
    const credchip = document.getElementById('credchip');
    if (credchip) credchip.setAttribute('aria-label', 'Одоо ' + next + ' кредит');
    localStorage.setItem('rf_guest_credits', next);
  };

  // Restore guest credits on load if no active session
  if (!localStorage.getItem('rf_session')) {
    const savedGuest = localStorage.getItem('rf_guest_credits');
    if (savedGuest !== null) {
      const c = document.getElementById('credits');
      if (c) c.textContent = savedGuest;
      const chip = document.getElementById('credchip');
      if (chip) chip.setAttribute('aria-label', 'Одоо ' + savedGuest + ' кредит');
    }
  }

  if (isSectionUnlocked('spacelab')) {
    applySpaceCardUnlockedVisual();
  }

  suUpdateBar();

  // Hook classic window.openSpaceExplore to respect 120 credit lock
  const origOpenSpaceExplore = window.openSpaceExplore;
  window.openSpaceExplore = function(initialTab = 'time', isInternalAuthorized = false) {
    if (!isInternalAuthorized && !isSectionUnlocked('classic')) {
      showUnlockModal('classic');
      return;
    }
    if (typeof origOpenSpaceExplore === 'function') {
      origOpenSpaceExplore(initialTab);
    }
  };

  const nav = document.querySelector('#phone nav.nav');
  if (nav) {
    nav.querySelectorAll('button').forEach((btn) => {
      const text = btn.textContent.trim().toLowerCase();
      if (text === 'build') {
        btn.dataset.suNav = 'build';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          suOpen('build');
        }, true);
      } else if (text === 'home') {
        btn.addEventListener('click', () => {
          if (suState.current !== 'home') suOpen('home');
        });
      }
    });
  }

  const card = document.getElementById('spaceCard');
  if (card) {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (isSectionUnlocked('spacelab')) {
        suOpen('spacelab');
      } else {
        showUnlockModal('spacelab');
      }
    }, true);
  }
}

window.addEventListener('popstate', () => {
  if (window.SU_NAV && typeof window.SU_NAV.hasActiveDismissible === 'function' && window.SU_NAV.hasActiveDismissible()) {
    const handled = window.SU_NAV.back({ fromPopstate: true });
    if (handled) return;
  }
  const h = location.hash.replace('#', '');
  suOpen(SU_LABELS[h] && h !== 'home' ? h : 'home', { fromHash: true });
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && suState.current !== 'home' && suState.current !== 'classic' && !document.pointerLockElement && !document.fullscreenElement && e.shiftKey) {
    suOpen('home');
  }
});

window.SU = {
  open: suOpen,
  state: suState,
  isSectionUnlocked,
  setSectionUnlocked,
  showUnlockModal,
  SECTION_INFO
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', suHookMain);
} else {
  suHookMain();
}

{
  const h = location.hash.replace('#', '');
  if (h && SU_LABELS[h] && h !== 'home') {
    if (SECTION_INFO[h] && !isSectionUnlocked(h)) {
      // Don't auto-open locked section directly from hash
    } else {
      suOpen(h, { fromHash: true });
    }
  }
}
