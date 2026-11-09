import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

const uomStartTag = '<script id="su-universal-overlay-manager">';
const uomStartIdx = html.indexOf(uomStartTag);
const uomEndIdx = html.indexOf('</script>', uomStartIdx) + 9;

const upgradedNavEngine = `<script id="su-universal-overlay-manager">
/**
 * SCIENCE UNIVERSE — UNIVERSAL OVERLAY, MODAL & CLOSE ENGINE (v2.0)
 * SCIENCE UNIVERSE — CENTRALIZED NAVIGATION & OVERLAY CONTROLLER (v3.0)
 * Architecture:
 * - Single Source of Truth for all navigation state (active lab, subview, modal, dialog).
 * - Full 5-level hierarchical dismissal stack (innermost dialog -> subview -> modal -> lab -> root).
 * - Unifies In-App clicks, Escape key, Browser Popstate, and Native Android Back Button.
 * - Guaranteed unblocking of underlying UI, scrolling, and focus restoration.
 * - Strict preservation of sessions, profile data, credits, and unlocked labs.
 */
(function() {
  'use strict';

  let lastFocusedOpener = null;

  const OVERLAY_CONFIGS = [
    { id: 'aiOverlay', openClasses: ['on', 'open'], closeSelectors: ['#aiClose', '.ai-btn#aiClose'] },
    { id: 'chemOverlay', openClasses: ['on', 'open'], closeSelectors: ['#chemClose', '.ch-back#chemClose', '#clBackBtn', '.cl-back#clBackBtn'] },
    { id: 'engOverlay', openClasses: ['eng-on', 'on', 'open'], closeSelectors: ['#engClose', '.eng-btn#engClose'] },
    { id: 'bioOverlay', openClasses: ['open', 'on'], closeSelectors: ['#bioBack', '.bio-btn#bioBack'] },
    { id: 'computerOverlay', openClasses: ['on', 'open'], closeSelectors: ['#cExit', '.c-back-btn#cExit'] },
    { id: 'mathOverlay', openClasses: ['open', 'on'], closeSelectors: ['#mathBack', '.math-back-btn#mathBack'] },
    { id: 'spaceExploreOverlay', openClasses: ['open', 'on'], closeSelectors: ['#seCloseBtn', '.se-close-btn#seCloseBtn'] },
    { id: 'suProfile', openClasses: ['open'], closeSelectors: ['#prClose', '#prCloseBottom'] },
    { id: 'suLabDirectory', openClasses: ['open'], closeSelectors: ['#suDirectoryClose', '.directory-close'] },
    { id: 'suUnlockModal', isHidden: true, closeSelectors: ['#suUnlockClose', '.su-modal-close', '#suUnlockCancelBtn', '#suUnlockGotItBtn', '.su-btn-close'] }
  ];

  const $ = id => document.getElementById(id);

  function isVisible(el) {
    if (!el) return false;
    if (el.hidden) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
  }

  function unblockOverlayElement(el) {
    if (!el) return;
    el.style.removeProperty('display');
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('visibility');
    el.setAttribute('aria-hidden', 'false');
  }

  function getActiveDialog() {
    const sw = $('suSwitchConfirmModal');
    if (sw && (sw.classList.contains('open') || sw.style.display === 'flex')) return 'switchConfirm';

    const lg = $('suLogoutConfirmModal');
    if (lg && (lg.classList.contains('open') || lg.style.display === 'flex')) return 'logoutConfirm';

    const plD = $('pl-dialog');
    if (plD && plD.style.display !== 'none') return 'plDialog';

    const clD = $('cl-dialog');
    if (clD && clD.style.display !== 'none') return 'clDialog';

    const plSp = $('plSpeedPanel');
    if (plSp && plSp.style.display !== 'none') return 'plSpeed';

    const clSp = $('clSpeedPanel');
    if (clSp && clSp.style.display !== 'none') return 'clSpeed';

    return null;
  }

  function getActiveSubView() {
    const pr = $('suProfile');
    if (pr && pr.classList.contains('open')) {
      const activeScreen = pr.querySelector('.pr-screen.active');
      if (activeScreen && activeScreen.dataset.prscreen && activeScreen.dataset.prscreen !== 'home') {
        return { type: 'profileSubpage', screen: activeScreen.dataset.prscreen };
      }
    }

    const comp = $('computerOverlay');
    if (comp && (comp.classList.contains('on') || comp.classList.contains('open'))) {
      const reader = $('cReader');
      if (reader && reader.classList.contains('active')) {
        return { type: 'computerReader' };
      }
    }

    const eng = $('engOverlay');
    if (eng && eng.classList.contains('eng-subview')) {
      return { type: 'engineeringSubview' };
    }

    const math = $('mathOverlay');
    if (math && (math.classList.contains('open') || math.classList.contains('on'))) {
      const activeTab = math.querySelector('.mtab.active, [data-mtab].active');
      if (activeTab && activeTab.dataset.mtab && activeTab.dataset.mtab !== 'learn') {
        return { type: 'mathSubtab', tab: activeTab.dataset.mtab };
      }
    }

    return null;
  }

  function getActiveModal() {
    const unlock = $('suUnlockModal');
    if (unlock && (!unlock.hidden || (unlock.style.display && unlock.style.display !== 'none'))) return 'unlockModal';

    const dir = $('suLabDirectory');
    if (dir && dir.classList.contains('open')) return 'directoryModal';

    const pr = $('suProfile');
    if (pr && pr.classList.contains('open')) return 'profileModal';

    return null;
  }

  function getActiveLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || (pl.style.display && pl.style.display !== 'none'))) return 'physics';

    const chem = $('chemOverlay');
    if (chem && (chem.classList.contains('on') || chem.classList.contains('open'))) return 'chemistry';

    const eng = $('engOverlay');
    if (eng && (eng.classList.contains('eng-on') || eng.classList.contains('on') || eng.classList.contains('open'))) return 'engineering';

    const bio = $('bioOverlay');
    if (bio && (bio.classList.contains('open') || bio.classList.contains('on'))) return 'biology';

    const comp = $('computerOverlay');
    if (comp && (comp.classList.contains('on') || comp.classList.contains('open'))) return 'computer';

    const math = $('mathOverlay');
    if (math && (math.classList.contains('open') || math.classList.contains('on'))) return 'math';

    const space = $('spaceExploreOverlay');
    if (space && (space.classList.contains('open') || space.classList.contains('on'))) return 'spaceExplore';

    const ai = $('aiOverlay');
    if (ai && (ai.classList.contains('on') || ai.classList.contains('open'))) return 'ai';

    return null;
  }

  function getActiveSection() {
    if (window.SU && window.SU.state && window.SU.state.current && window.SU.state.current !== 'home') {
      return window.SU.state.current;
    }
    return null;
  }

  function getActiveAuthSheet() {
    const phone = $('phone');
    if (phone && phone.classList.contains('open') && !phone.classList.contains('in')) {
      return 'authSheet';
    }
    return null;
  }

  function closePhysicsLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || getComputedStyle(pl).display !== 'none')) {
      pl.classList.remove('on');
      pl.style.setProperty('display', 'none', 'important');
      pl.style.setProperty('pointer-events', 'none', 'important');
      pl.setAttribute('aria-hidden', 'true');
      if (document.pointerLockElement) {
        try { document.exitPointerLock(); } catch(_) {}
      }
      return true;
    }
    return false;
  }

  function closeSingleOverlay(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    const el = $(id);
    if (!el) return false;
    const config = OVERLAY_CONFIGS.find(c => c.id === id) || (typeof cfg === 'object' ? cfg : {});

    if (config.openClasses) {
      config.openClasses.forEach(cls => el.classList.remove(cls));
    }
    el.classList.remove('open', 'on', 'eng-on', 'eng-subview');
    if (id === 'suUnlockModal') el.hidden = true;

    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.setAttribute('aria-hidden', 'true');

    if (id === 'suProfile' && typeof window.closeProfile === 'function') window.closeProfile();
    if (id === 'spaceExploreOverlay' && typeof window.closeSpaceExplore === 'function') window.closeSpaceExplore();

    if (document.pointerLockElement) {
      try { document.exitPointerLock(); } catch(_) {}
    }

    restoreBaseState();
    window.dispatchEvent(new CustomEvent('su:overlay:closed', { detail: { id } }));

    if (lastFocusedOpener && typeof lastFocusedOpener.focus === 'function') {
      try { lastFocusedOpener.focus({ preventScroll: true }); } catch(_) {}
    }
    return true;
  }

  const closeComponent = closeSingleOverlay;

  function restoreBaseState() {
    const hasActive = getActiveLab() !== null || getActiveModal() !== null || getActiveSection() !== null;
    if (!hasActive) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('su-modal-open');
      document.documentElement.classList.remove('su-in-section');

      const elementsToUnblock = [
        $('lab'),
        $('phone'),
        document.querySelector('.phone'),
        document.querySelector('.hub'),
        document.querySelector('.tilt'),
        document.querySelector('.wall'),
        document.querySelector('nav.nav'),
        $('suSections'),
        $('mainLabDesktopDashboard')
      ];
      elementsToUnblock.forEach(el => {
        if (el) el.style.pointerEvents = 'auto';
      });
    }
  }

  /**
   * Centralized Universal Back Handler
   * Evaluates the active layer from innermost (Level 1) to outermost (Level 6).
   * Returns true if an action was dismissed, false if at root screen.
   */
  function back(options = {}) {
    // 1. Level 1: Confirmation Dialogs & In-canvas panels
    const dialog = getActiveDialog();
    if (dialog) {
      if (dialog === 'switchConfirm') {
        if (typeof window.suCloseSwitchModal === 'function') window.suCloseSwitchModal();
        else { const m = $('suSwitchConfirmModal'); if (m) { m.classList.remove('open'); m.style.setProperty('display', 'none', 'important'); } }
        return true;
      }
      if (dialog === 'logoutConfirm') {
        if (typeof window.suCloseLogoutModal === 'function') window.suCloseLogoutModal();
        else { const m = $('suLogoutConfirmModal'); if (m) { m.classList.remove('open'); m.style.setProperty('display', 'none', 'important'); } }
        return true;
      }
      if (dialog === 'plDialog') {
        if (typeof window.closePlDialog === 'function') window.closePlDialog();
        else { const d = $('pl-dialog'); if (d) d.style.display = 'none'; }
        return true;
      }
      if (dialog === 'clDialog') {
        const d = $('cl-dialog');
        if (d) d.style.display = 'none';
        return true;
      }
      if (dialog === 'plSpeed') {
        const p = $('plSpeedPanel');
        if (p) p.style.display = 'none';
        return true;
      }
      if (dialog === 'clSpeed') {
        const p = $('clSpeedPanel');
        if (p) p.style.display = 'none';
        return true;
      }
    }

    // 2. Level 2: Sub-views, Readers & Non-default tabs
    const subView = getActiveSubView();
    if (subView) {
      if (subView.type === 'profileSubpage') {
        const pr = $('suProfile');
        if (pr) {
          pr.querySelectorAll('.pr-screen').forEach(s => s.classList.remove('active'));
          const home = pr.querySelector('.pr-screen[data-prscreen="home"]');
          if (home) home.classList.add('active');
          pr.scrollTop = 0;
        }
        return true;
      }
      if (subView.type === 'computerReader') {
        const cReaderBack = $('cReaderBack');
        if (cReaderBack) cReaderBack.click();
        else {
          const cReader = $('cReader');
          const cList = $('cList');
          if (cReader) cReader.classList.remove('active');
          if (cList) cList.style.display = 'block';
        }
        return true;
      }
      if (subView.type === 'engineeringSubview') {
        const engBackHome = $('engBackHome');
        if (engBackHome) engBackHome.click();
        else {
          const eng = $('engOverlay');
          if (eng) {
            eng.classList.remove('eng-subview');
            eng.querySelectorAll('[data-engpanel]').forEach(p => p.classList.remove('active'));
          }
        }
        return true;
      }
      if (subView.type === 'mathSubtab') {
        const math = $('mathOverlay');
        const learnBtn = math ? math.querySelector('[data-mtab="learn"]') : null;
        if (learnBtn) {
          learnBtn.click();
          return true;
        }
      }
    }

    // 3. Level 3: Top-level Modals
    const modal = getActiveModal();
    if (modal) {
      if (modal === 'unlockModal') { closeComponent('suUnlockModal'); return true; }
      if (modal === 'directoryModal') { closeComponent('suLabDirectory'); return true; }
      if (modal === 'profileModal') { closeComponent('suProfile'); return true; }
    }

    // 4. Level 4: Laboratory Overlays
    const lab = getActiveLab();
    if (lab) {
      if (lab === 'physics') { closePhysicsLab(); restoreBaseState(); return true; }
      if (lab === 'chemistry') { closeComponent('chemOverlay'); return true; }
      if (lab === 'engineering') { closeComponent('engOverlay'); return true; }
      if (lab === 'biology') { closeComponent('bioOverlay'); return true; }
      if (lab === 'computer') { closeComponent('computerOverlay'); return true; }
      if (lab === 'math') { closeComponent('mathOverlay'); return true; }
      if (lab === 'spaceExplore') { closeComponent('spaceExploreOverlay'); return true; }
      if (lab === 'ai') { closeComponent('aiOverlay'); return true; }
    }

    // 5. Level 5: Integrated Sandbox Sections
    const section = getActiveSection();
    if (section) {
      if (window.SU && typeof window.SU.open === 'function') {
        window.SU.open('home');
      }
      restoreBaseState();
      return true;
    }

    // 6. Level 6: Auth Sheet
    const authSheet = getActiveAuthSheet();
    if (authSheet) {
      if (typeof window.closeAuthSheet === 'function') {
        window.closeAuthSheet();
      } else {
        const phone = $('phone');
        const sheet = $('sheet');
        if (phone) phone.classList.remove('open');
        if (sheet) sheet.inert = true;
      }
      restoreBaseState();
      return true;
    }

    return false;
  }

  const dismissTopmost = back;

  function initController() {
    OVERLAY_CONFIGS.forEach(cfg => {
      const el = $(cfg.id);
      if (!el) return;

      const observer = new MutationObserver(() => {
        let isOpen = false;
        if (cfg.openClasses) {
          isOpen = cfg.openClasses.some(cls => el.classList.contains(cls));
        }
        if (cfg.isHidden && !el.hidden) isOpen = true;
        if (isOpen) unblockOverlayElement(el);
      });
      observer.observe(el, { attributes: true, attributeFilter: ['class', 'hidden'] });
    });

    // Capture all Back, Close, and Cancel clicks via Event Delegation
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (!target) return;

      // Backdrop clicks
      if (target.id === 'suSwitchConfirmModal') {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.suCloseSwitchModal === 'function') window.suCloseSwitchModal();
        return;
      }
      if (target.id === 'suLogoutConfirmModal') {
        e.preventDefault(); e.stopPropagation();
        if (typeof window.suCloseLogoutModal === 'function') window.suCloseLogoutModal();
        return;
      }
      if (target.id === 'suUnlockModal') {
        e.preventDefault(); e.stopPropagation();
        closeComponent('suUnlockModal');
        return;
      }
      if (target.id === 'suLabDirectory') {
        e.preventDefault(); e.stopPropagation();
        closeComponent('suLabDirectory');
        return;
      }
      if (target.id === 'suProfile') {
        e.preventDefault(); e.stopPropagation();
        closeComponent('suProfile');
        return;
      }

      // Button checks
      const btn = target.closest(\`
        #aiClose, .ai-btn#aiClose,
        #chemClose, .ch-back#chemClose, #clBackBtn, .cl-back, #clSpeedClose,
        #engClose, .eng-btn#engClose, #engBackHome,
        #bioBack, .bio-btn#bioBack,
        #cExit, .c-back-btn#cExit, #cReaderBack, .c-readerback,
        #mathBack, .math-back-btn#mathBack,
        .pl-back, #plDialogClose, #plSpeedClose,
        #seCloseBtn, .se-close-btn#seCloseBtn,
        #prClose, #prCloseBottom, [data-prback], #prCancelEdit,
        #suSwitchCancel, #suLogoutCancel,
        #suDirectoryClose, .directory-close,
        #suUnlockClose, .su-modal-close, #suUnlockCancelBtn, #suUnlockGotItBtn, .su-btn-close,
        button#back.back
      \`);

      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (btn.matches('#suSwitchCancel')) {
        if (typeof window.suCloseSwitchModal === 'function') window.suCloseSwitchModal();
        return;
      }
      if (btn.matches('#suLogoutCancel')) {
        if (typeof window.suCloseLogoutModal === 'function') window.suCloseLogoutModal();
        return;
      }
      if (btn.matches('#prCancelEdit, [data-prback]')) {
        const pr = $('suProfile');
        if (pr) {
          pr.querySelectorAll('.pr-screen').forEach(s => s.classList.remove('active'));
          const home = pr.querySelector('.pr-screen[data-prscreen="home"]');
          if (home) home.classList.add('active');
          pr.scrollTop = 0;
        }
        return;
      }
      if (btn.matches('#engBackHome')) {
        const eng = $('engOverlay');
        if (eng) {
          eng.classList.remove('eng-subview');
          eng.querySelectorAll('[data-engpanel]').forEach(p => p.classList.remove('active'));
          eng.scrollTop = 0;
        }
        return;
      }
      if (btn.matches('#cReaderBack, .c-readerback')) {
        const cReader = $('cReader');
        const cList = $('cList');
        if (cReader) cReader.classList.remove('active');
        if (cList) cList.style.display = 'block';
        return;
      }
      if (btn.matches('#plDialogClose')) {
        if (typeof window.closePlDialog === 'function') window.closePlDialog();
        else { const d = $('pl-dialog'); if (d) d.style.display = 'none'; }
        return;
      }
      if (btn.matches('#plSpeedClose')) {
        const p = $('plSpeedPanel');
        if (p) p.style.display = 'none';
        return;
      }
      if (btn.matches('#clSpeedClose')) {
        const p = $('clSpeedPanel');
        if (p) p.style.display = 'none';
        return;
      }

      // Close specific overlay / modal
      if (btn.matches('#engClose, .eng-btn#engClose')) { closeComponent('engOverlay'); return; }
      if (btn.matches('#chemClose, .ch-back#chemClose, #clBackBtn, .cl-back')) { closeComponent('chemOverlay'); return; }
      if (btn.matches('#aiClose, .ai-btn#aiClose')) { closeComponent('aiOverlay'); return; }
      if (btn.matches('#bioBack, .bio-btn#bioBack')) { closeComponent('bioOverlay'); return; }
      if (btn.matches('#cExit, .c-back-btn#cExit')) { closeComponent('computerOverlay'); return; }
      if (btn.matches('#mathBack, .math-back-btn#mathBack')) {
        const sub = getActiveSubView();
        if (sub && sub.type === 'mathSubtab') {
          const math = $('mathOverlay');
          const learnBtn = math ? math.querySelector('[data-mtab="learn"]') : null;
          if (learnBtn) { learnBtn.click(); return; }
        }
        closeComponent('mathOverlay');
        return;
      }
      if (btn.matches('.pl-back')) { closePhysicsLab(); restoreBaseState(); return; }
      if (btn.matches('#seCloseBtn, .se-close-btn#seCloseBtn')) { closeComponent('spaceExploreOverlay'); return; }
      if (btn.matches('#prClose, #prCloseBottom')) { closeComponent('suProfile'); return; }
      if (btn.matches('#suDirectoryClose, .directory-close')) { closeComponent('suLabDirectory'); return; }
      if (btn.matches('#suUnlockClose, .su-modal-close, #suUnlockCancelBtn, #suUnlockGotItBtn, .su-btn-close')) { closeComponent('suUnlockModal'); return; }
      if (btn.matches('button#back.back')) {
        if (typeof window.closeAuthSheet === 'function') window.closeAuthSheet();
        restoreBaseState();
        return;
      }

      back();
    }, true);

    // Global Keyboard Listeners (Escape for back, Enter/Space for accessibility)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const handled = back({ fromKey: true });
        if (handled) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement;
        if (active && (active.classList.contains('pl-back') || active.classList.contains('directory-close') || active.hasAttribute('data-prback'))) {
          if (active.tagName !== 'BUTTON' && active.tagName !== 'A') {
            e.preventDefault();
            active.click();
          }
        }
      }
    });

    // Record last focused opener element
    ['openAILab', 'openChemLab', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile', 'showUnlockModal'].forEach(fnName => {
      if (typeof window[fnName] === 'function') {
        const orig = window[fnName];
        window[fnName] = function(...args) {
          lastFocusedOpener = document.activeElement;
          return orig.apply(this, args);
        };
      }
    });
  }

  // --- Exposed Controller API ---
  window.SU_NAV = {
    back,
    close: closeComponent,
    unblock: unblockOverlayElement,
    restoreBaseState,
    getActiveDialog,
    getActiveSubView,
    getActiveModal,
    getActiveLab,
    getActiveSection,
    getActiveAuthSheet,
    hasActiveDismissible: () => !!(getActiveDialog() || getActiveSubView() || getActiveModal() || getActiveLab() || getActiveSection() || getActiveAuthSheet())
  };

  window.suCloseAllOverlays = function() {
    OVERLAY_CONFIGS.forEach(c => closeComponent(c.id));
    closePhysicsLab();
    restoreBaseState();
  };

  // Backwards compatibility for existing test suites
  window.SU_OVERLAY_MANAGER = {
    configs: OVERLAY_CONFIGS,
    close: closeSingleOverlay,
    closeAll: window.suCloseAllOverlays,
    dismissTopmost: dismissTopmost,
    checkAnyOpen: () => !!(getActiveLab() || getActiveModal()),
    unblock: unblockOverlayElement,
    restoreBaseState
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initController);
  } else {
    initController();
  }
})();
</script>`;

html = html.substring(0, uomStartIdx) + upgradedNavEngine + html.substring(uomEndIdx);
fs.writeFileSync('index.html', html, 'utf8');
console.log('[OK] Successfully updated index.html with backwards compatibility aliases');

