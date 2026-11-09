import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Universal Close & Back Accessibility & Touch target styles in <style>
const styleMarker = '</style>';
const firstStyleIdx = html.indexOf(styleMarker);

const accessibleCloseCSS = `
/* ==========================================================================
   SCIENCE UNIVERSE — UNIVERSAL ACCESSIBILITY & TOUCH TARGET FIX
   Guarantees minimum 44x44px touch target, accessible styling, proper z-index,
   and unblocked click interactions across all mobile and desktop viewports.
   ========================================================================== */
#aiClose, #chemClose, #clBackBtn, #clSpeedClose,
#engClose, #engBackHome, #bioBack, #cExit, #cReaderBack,
#mathBack, .pl-back, #plDialogClose, #plSpeedClose,
#seCloseBtn, #prClose, #prCloseBottom, [data-prback],
#prCancelEdit, #suSwitchCancel, #suLogoutCancel,
#suDirectoryClose, #suUnlockClose, #suUnlockCancelBtn, #suUnlockGotItBtn,
button#back.back, .directory-close, .su-modal-close {
  min-height: 44px !important;
  min-width: 44px !important;
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: transparent !important;
  cursor: pointer !important;
  user-select: none !important;
  position: relative !important;
  z-index: 50 !important;
}

/* Micro-sized close buttons (e.g. ✕ icons) get a 44x44 transparent touch hit area */
.su-modal-close, .directory-close, #plDialogClose {
  padding: 10px 14px !important;
  font-size: 18px !important;
  line-height: 1 !important;
}

#plDialogClose:hover, #plDialogClose:focus-visible {
  color: #fff !important;
  transform: scale(1.1);
}

.su-modal-close:hover, .directory-close:hover {
  opacity: 1 !important;
  transform: scale(1.08);
}
`;

// Insert the CSS right before the first </style>
html = html.substring(0, firstStyleIdx) + accessibleCloseCSS + html.substring(firstStyleIdx);

// 2. Ensure aria-labels and type="button" on all close buttons
html = html.replace('id="aiClose" type="button"', 'id="aiClose" type="button" aria-label="Хаах"');
html = html.replace('<button class="ch-back" id="chemClose">← Буцах</button>', '<button class="ch-back" id="chemClose" type="button" aria-label="Буцах">← Буцах</button>');
html = html.replace('<button class="cl-back" id="clBackBtn" type="button">‹ Буцах</button>', '<button class="cl-back" id="clBackBtn" type="button" aria-label="Буцах">‹ Буцах</button>');
html = html.replace('<button class="cl-btn" id="clSpeedClose" style="padding:4px 10px;font-size:11px">Боллоо</button>', '<button class="cl-btn" id="clSpeedClose" type="button" aria-label="Хаах" style="padding:4px 10px;font-size:11px">Боллоо</button>');
html = html.replace('<button class="eng-btn" id="engClose" type="button">← Буцах</button>', '<button class="eng-btn" id="engClose" type="button" aria-label="Буцах">← Буцах</button>');
html = html.replace('<button type="button" id="engBackHome">‹ Буцах</button>', '<button type="button" id="engBackHome" aria-label="Буцах">‹ Буцах</button>');
html = html.replace('<button class="bio-btn" id="bioBack">← Буцах</button>', '<button class="bio-btn" id="bioBack" type="button" aria-label="Буцах">← Буцах</button>');
html = html.replace('<button class="c-readerback" id="cReaderBack" type="button">← Бүх сэдэв рүү буцах</button>', '<button class="c-readerback" id="cReaderBack" type="button" aria-label="Бүх сэдэв рүү буцах">← Бүх сэдэв рүү буцах</button>');
html = html.replace('class="pl-back" type="button">‹ Буцах</button>', 'class="pl-back" type="button" aria-label="Буцах">‹ Буцах</button>');
html = html.replace('<button id="plDialogClose" type="button" style="background:none;border:0;color:#ff9a2e;font-size:16px;cursor:pointer">✕</button>', '<button id="plDialogClose" type="button" aria-label="Хаах" style="background:none;border:0;color:#ff9a2e;font-size:16px;cursor:pointer">✕</button>');
html = html.replace('<button class="pl-btn" id="plSpeedClose" type="button" style="padding:4px 10px;font-size:11px">Боллоо</button>', '<button class="pl-btn" id="plSpeedClose" type="button" aria-label="Хаах" style="padding:4px 10px;font-size:11px">Боллоо</button>');
html = html.replace('<button class="se-close-btn" id="seCloseBtn" type="button" title="Хаах">', '<button class="se-close-btn" id="seCloseBtn" type="button" aria-label="Хаах" title="Хаах">');
html = html.replace('id="prClose" type="button" style="cursor:pointer;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:6px 14px;color:#fff;font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px" title="Профайл хаах">', 'id="prClose" type="button" aria-label="Профайл хаах" style="cursor:pointer;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:6px 14px;color:#fff;font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px" title="Профайл хаах">');
html = html.replace('id="prCloseBottom" type="button" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:12px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600">', 'id="prCloseBottom" type="button" aria-label="Профайлаас гарах / Хаах" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:12px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600">');
html = html.replace('<button class="pr-back" data-prback type="button">← Буцах</button>', '<button class="pr-back" data-prback type="button" aria-label="Буцах">← Буцах</button>');
html = html.replace('<button type="button" class="pr-secondary" id="prCancelEdit" style="flex:1;margin:0;padding:12px">Болих</button>', '<button type="button" class="pr-secondary" id="prCancelEdit" aria-label="Болих" style="flex:1;margin:0;padding:12px">Болих</button>');
html = html.replace('<button type="button" id="suSwitchCancel"', '<button type="button" id="suSwitchCancel" aria-label="Болих"');
html = html.replace('<button type="button" id="suLogoutCancel"', '<button type="button" id="suLogoutCancel" aria-label="Болих"');
html = html.replace('<button class="back" id="back" type="button">‹ Буцах</button>', '<button class="back" id="back" type="button" aria-label="Буцах">‹ Буцах</button>');

// 3. Replace Universal Overlay Manager with upgraded hierarchical engine
const uomTagStart = '<script id="su-universal-overlay-manager">';
const uomStartPos = html.indexOf(uomTagStart);
const uomEndPos = html.indexOf('</script>', uomStartPos) + 9;

const upgradedUOM = `<script id="su-universal-overlay-manager">
/**
 * SCIENCE UNIVERSE — UNIVERSAL OVERLAY, MODAL & CLOSE ENGINE (v2.0)
 * Guarantees that every Close/Back button, Escape key, and backdrop click
 * immediately and completely closes the overlay, removes blocking layers,
 * respects the navigation hierarchy (nested modals/readers/subviews close first),
 * and restores full interactivity to the underlying UI.
 */
(function() {
  'use strict';

  let lastFocusedOpener = null;

  // Master configuration for top-level overlays
  const OVERLAY_CONFIGS = [
    {
      id: 'aiOverlay',
      openClasses: ['on', 'open'],
      closeSelectors: ['#aiClose', '.ai-btn#aiClose']
    },
    {
      id: 'chemOverlay',
      openClasses: ['on', 'open'],
      closeSelectors: ['#chemClose', '.ch-back#chemClose', '#clBackBtn', '.cl-back#clBackBtn']
    },
    {
      id: 'engOverlay',
      openClasses: ['eng-on', 'on', 'open'],
      closeSelectors: ['#engClose', '.eng-btn#engClose']
    },
    {
      id: 'bioOverlay',
      openClasses: ['open', 'on'],
      closeSelectors: ['#bioBack', '.bio-btn#bioBack']
    },
    {
      id: 'computerOverlay',
      openClasses: ['on', 'open'],
      closeSelectors: ['#cExit', '.c-back-btn#cExit']
    },
    {
      id: 'mathOverlay',
      openClasses: ['open', 'on'],
      closeSelectors: ['#mathBack', '.math-back-btn#mathBack']
    },
    {
      id: 'spaceExploreOverlay',
      openClasses: ['open', 'on'],
      closeSelectors: ['#seCloseBtn', '.se-close-btn#seCloseBtn']
    },
    {
      id: 'suProfile',
      openClasses: ['open'],
      closeSelectors: ['#prClose', '#prCloseBottom']
    },
    {
      id: 'suLabDirectory',
      openClasses: ['open'],
      closeSelectors: ['#suDirectoryClose', '.directory-close']
    },
    {
      id: 'suUnlockModal',
      isHidden: true,
      closeSelectors: ['#suUnlockClose', '.su-modal-close', '#suUnlockCancelBtn', '#suUnlockGotItBtn', '.su-btn-close']
    }
  ];

  function isOverlayOpen(el, cfg) {
    if (!el) return false;
    if (cfg && cfg.openClasses) {
      if (cfg.openClasses.some(cls => el.classList.contains(cls))) return true;
    }
    if (el.classList.contains('open') || el.classList.contains('on') || el.classList.contains('eng-on')) return true;
    if (cfg && cfg.isHidden && !el.hidden && getComputedStyle(el).display !== 'none') return true;
    return false;
  }

  function unblockOverlayElement(el) {
    if (!el) return;
    el.style.removeProperty('display');
    el.style.removeProperty('pointer-events');
    el.style.removeProperty('visibility');
    el.setAttribute('aria-hidden', 'false');
  }

  function closeSingleOverlay(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    const el = document.getElementById(id);
    if (!el) return false;
    const config = OVERLAY_CONFIGS.find(c => c.id === id) || (typeof cfg === 'object' ? cfg : {});

    let wasOpen = false;
    if (config.openClasses) {
      config.openClasses.forEach(cls => {
        if (el.classList.contains(cls)) {
          wasOpen = true;
          el.classList.remove(cls);
        }
      });
    }
    if (el.classList.contains('open') || el.classList.contains('on') || el.classList.contains('eng-on')) {
      wasOpen = true;
      el.classList.remove('open', 'on', 'eng-on');
    }
    if (el.classList.contains('eng-subview')) {
      el.classList.remove('eng-subview');
    }
    if ((config.isHidden || id === 'suUnlockModal') && !el.hidden) {
      wasOpen = true;
      el.hidden = true;
    }

    // Force inline style overrides to guarantee immediate disappearance
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.setAttribute('aria-hidden', 'true');

    if (document.pointerLockElement) {
      try { document.exitPointerLock(); } catch(_) {}
    }

    return wasOpen;
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

  function checkAnyOverlayOpen() {
    for (let i = 0; i < OVERLAY_CONFIGS.length; i++) {
      const cfg = OVERLAY_CONFIGS[i];
      const el = document.getElementById(cfg.id);
      if (el && isOverlayOpen(el, cfg)) {
        return true;
      }
    }
    const pl = document.querySelector('.pl.on');
    if (pl && getComputedStyle(pl).display !== 'none') return true;
    return false;
  }

  function restoreBaseState() {
    if (!checkAnyOverlayOpen()) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('su-modal-open');
      document.documentElement.classList.remove('su-in-section');

      // Unblock all underlying UI components
      const elementsToUnblock = [
        document.getElementById('lab'),
        document.getElementById('phone'),
        document.querySelector('.phone'),
        document.querySelector('.hub'),
        document.querySelector('.tilt'),
        document.querySelector('.wall'),
        document.querySelector('nav.nav'),
        document.getElementById('suSections'),
        document.getElementById('mainLabDesktopDashboard')
      ];
      elementsToUnblock.forEach(el => {
        if (el) {
          el.style.pointerEvents = 'auto';
        }
      });
    }
  }

  function universalClose(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    closeSingleOverlay(cfg);
    restoreBaseState();
    window.dispatchEvent(new CustomEvent('su:overlay:closed', { detail: { id } }));

    if (lastFocusedOpener && typeof lastFocusedOpener.focus === 'function') {
      try { lastFocusedOpener.focus({ preventScroll: true }); } catch(_) {}
    }
  }

  /**
   * Topmost dismissal logic for Escape key and hierarchical back navigation.
   * Dismisses the innermost active component without disturbing parent screens.
   */
  function dismissTopmost() {
    // 1. Level 1: Confirmation modals & In-lab experiment dialogs
    const swModal = document.getElementById('suSwitchConfirmModal');
    if (swModal && (swModal.classList.contains('open') || swModal.style.display === 'flex')) {
      if (typeof window.suCloseSwitchModal === 'function') window.suCloseSwitchModal();
      else {
        swModal.classList.remove('open');
        swModal.style.setProperty('display', 'none', 'important');
        swModal.style.setProperty('pointer-events', 'none', 'important');
      }
      return true;
    }

    const lgModal = document.getElementById('suLogoutConfirmModal');
    if (lgModal && (lgModal.classList.contains('open') || lgModal.style.display === 'flex')) {
      if (typeof window.suCloseLogoutModal === 'function') window.suCloseLogoutModal();
      else {
        lgModal.classList.remove('open');
        lgModal.style.setProperty('display', 'none', 'important');
        lgModal.style.setProperty('pointer-events', 'none', 'important');
      }
      return true;
    }

    // In-canvas Physics experiment dialog
    const plDialog = document.getElementById('pl-dialog');
    if (plDialog && plDialog.style.display !== 'none') {
      if (typeof window.closePlDialog === 'function') window.closePlDialog();
      else plDialog.style.display = 'none';
      return true;
    }

    // Physics speed panel
    const plSpeedPanel = document.getElementById('plSpeedPanel');
    if (plSpeedPanel && plSpeedPanel.style.display !== 'none') {
      plSpeedPanel.style.display = 'none';
      return true;
    }

    // In-canvas Chemistry experiment dialog
    const clDialog = document.getElementById('cl-dialog');
    if (clDialog && clDialog.style.display !== 'none') {
      clDialog.style.display = 'none';
      return true;
    }

    // Chemistry speed panel
    const clSpeedPanel = document.getElementById('clSpeedPanel');
    if (clSpeedPanel && clSpeedPanel.style.display !== 'none') {
      clSpeedPanel.style.display = 'none';
      return true;
    }

    // 2. Level 2: Sub-views & Readers
    // Profile sub-screen (edit, interests, notes, appearance, about)
    const profile = document.getElementById('suProfile');
    if (profile && profile.classList.contains('open')) {
      const activeScreen = profile.querySelector('.pr-screen.active');
      if (activeScreen && activeScreen.dataset.prscreen && activeScreen.dataset.prscreen !== 'home') {
        const homeScreen = profile.querySelector('.pr-screen[data-prscreen="home"]');
        profile.querySelectorAll('.pr-screen').forEach(s => s.classList.remove('active'));
        if (homeScreen) homeScreen.classList.add('active');
        return true;
      }
    }

    // Computer Lab article reader
    const compOverlay = document.getElementById('computerOverlay');
    if (compOverlay && (compOverlay.classList.contains('on') || compOverlay.classList.contains('open'))) {
      const cReader = document.getElementById('cReader');
      if (cReader && cReader.classList.contains('active')) {
        const cReaderBack = document.getElementById('cReaderBack');
        if (cReaderBack) cReaderBack.click();
        else {
          cReader.classList.remove('active');
          const cList = document.getElementById('cList');
          if (cList) cList.style.display = 'block';
        }
        return true;
      }
    }

    // Engineering Lab subview
    const engOverlay = document.getElementById('engOverlay');
    if (engOverlay && engOverlay.classList.contains('eng-subview')) {
      const engBackHome = document.getElementById('engBackHome');
      if (engBackHome) engBackHome.click();
      else {
        engOverlay.classList.remove('eng-subview');
        engOverlay.querySelectorAll('[data-engpanel]').forEach(p => p.classList.remove('active'));
      }
      return true;
    }

    // 3. Level 3: Dismissible Modals (Unlock, Directory, Profile)
    const unlockModal = document.getElementById('suUnlockModal');
    if (unlockModal && (!unlockModal.hidden || getComputedStyle(unlockModal).display !== 'none')) {
      universalClose({ id: 'suUnlockModal' });
      return true;
    }

    const dirModal = document.getElementById('suLabDirectory');
    if (dirModal && dirModal.classList.contains('open')) {
      universalClose({ id: 'suLabDirectory' });
      return true;
    }

    if (profile && profile.classList.contains('open')) {
      universalClose({ id: 'suProfile' });
      return true;
    }

    // 4. Level 4: Laboratory Overlays (Check top-level overlays)
    for (let i = 0; i < OVERLAY_CONFIGS.length; i++) {
      const cfg = OVERLAY_CONFIGS[i];
      if (cfg.id === 'suProfile' || cfg.id === 'suLabDirectory' || cfg.id === 'suUnlockModal') continue;
      const el = document.getElementById(cfg.id);
      if (el && isOverlayOpen(el, cfg)) {
        universalClose(cfg);
        return true;
      }
    }

    // Physics Lab
    if (closePhysicsLab()) {
      restoreBaseState();
      return true;
    }

    // Auth Sheet
    const phone = document.getElementById('phone');
    if (phone && phone.classList.contains('open') && !phone.classList.contains('in')) {
      if (typeof window.closeAuthSheet === 'function') {
        window.closeAuthSheet();
        return true;
      }
    }

    return false;
  }

  function initUniversalOverlayManager() {
    OVERLAY_CONFIGS.forEach(cfg => {
      const overlay = document.getElementById(cfg.id);
      if (!overlay) return;

      // Close on backdrop click (click outside content)
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          universalClose(cfg);
        }
      });

      // Clean up inline style when opening
      const observer = new MutationObserver(() => {
        let isOpen = false;
        if (cfg.openClasses) {
          isOpen = cfg.openClasses.some(cls => overlay.classList.contains(cls));
        }
        if (cfg.isHidden && !overlay.hidden) {
          isOpen = true;
        }
        if (isOpen) {
          unblockOverlayElement(overlay);
        }
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class', 'hidden'] });
    });

    // Universal Event Delegation for ALL Close & Back buttons
    document.addEventListener('click', function(e) {
      const target = e.target;
      if (!target) return;

      // 1. Back button on Auth sheet
      if (target.closest('button#back.back')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.closeAuthSheet === 'function') {
          window.closeAuthSheet();
        } else {
          const phone = document.getElementById('phone');
          const sheet = document.getElementById('sheet');
          if (phone) phone.classList.remove('open');
          if (sheet) sheet.inert = true;
        }
        restoreBaseState();
        return;
      }

      // 2. Profile buttons
      if (target.closest('#prClose, #prCloseBottom')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.closeProfile === 'function') window.closeProfile();
        universalClose({ id: 'suProfile' });
        return;
      }

      if (target.closest('#suSwitchCancel')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.suCloseSwitchModal === 'function') window.suCloseSwitchModal();
        return;
      }

      if (target.closest('#suLogoutCancel')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.suCloseLogoutModal === 'function') window.suCloseLogoutModal();
        return;
      }

      if (target.closest('#prCancelEdit')) {
        e.preventDefault();
        e.stopPropagation();
        const profile = document.getElementById('suProfile');
        if (profile) {
          profile.querySelectorAll('.pr-screen').forEach(s => s.classList.remove('active'));
          const home = profile.querySelector('.pr-screen[data-prscreen="home"]');
          if (home) home.classList.add('active');
        }
        return;
      }

      // 3. Unlock modal close / cancel buttons
      if (target.closest('#suUnlockClose, .su-modal-close, #suUnlockCancelBtn, #suUnlockGotItBtn')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'suUnlockModal' });
        return;
      }

      // 4. Lab Directory close
      if (target.closest('#suDirectoryClose, .directory-close')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'suLabDirectory' });
        return;
      }

      // 5. Physics Lab back and dialog close
      if (target.closest('.pl-back')) {
        e.preventDefault();
        e.stopPropagation();
        closePhysicsLab();
        restoreBaseState();
        return;
      }

      if (target.closest('#plDialogClose')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.closePlDialog === 'function') window.closePlDialog();
        else {
          const d = document.getElementById('pl-dialog');
          if (d) d.style.display = 'none';
        }
        return;
      }

      if (target.closest('#plSpeedClose')) {
        e.preventDefault();
        e.stopPropagation();
        const p = document.getElementById('plSpeedPanel');
        if (p) p.style.display = 'none';
        return;
      }

      // 6. Chemistry Lab close and dialog
      if (target.closest('#chemClose, .ch-back#chemClose, #clBackBtn, .cl-back#clBackBtn')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'chemOverlay' });
        return;
      }

      if (target.closest('#clSpeedClose')) {
        e.preventDefault();
        e.stopPropagation();
        const p = document.getElementById('clSpeedPanel');
        if (p) p.style.display = 'none';
        return;
      }

      // 7. Engineering Lab close & subview back
      if (target.closest('#engClose, .eng-btn#engClose')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'engOverlay' });
        return;
      }

      if (target.closest('#engBackHome')) {
        e.preventDefault();
        e.stopPropagation();
        const root = document.getElementById('engOverlay');
        if (root) {
          root.classList.remove('eng-subview');
          root.querySelectorAll('[data-engpanel]').forEach(p => p.classList.remove('active'));
          root.scrollTop = 0;
        }
        return;
      }

      // 8. AI Lab close
      if (target.closest('#aiClose, .ai-btn#aiClose')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'aiOverlay' });
        return;
      }

      // 9. Biology Lab close
      if (target.closest('#bioBack, .bio-btn#bioBack')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'bioOverlay' });
        return;
      }

      // 10. Computer Lab exit and reader back
      if (target.closest('#cExit, .c-back-btn#cExit')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'computerOverlay' });
        return;
      }

      if (target.closest('#cReaderBack, .c-readerback')) {
        e.preventDefault();
        e.stopPropagation();
        const cReader = document.getElementById('cReader');
        const cList = document.getElementById('cList');
        if (cReader) cReader.classList.remove('active');
        if (cList) cList.style.display = 'block';
        return;
      }

      // 11. Math Lab back
      if (target.closest('#mathBack, .math-back-btn#mathBack')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'mathOverlay' });
        return;
      }

      // 12. Space Explore close
      if (target.closest('#seCloseBtn, .se-close-btn#seCloseBtn')) {
        e.preventDefault();
        e.stopPropagation();
        universalClose({ id: 'spaceExploreOverlay' });
        return;
      }
    }, true);

    // Global Keyboard Listeners (Escape for topmost dismiss, Enter/Space for accessible buttons)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const handled = dismissTopmost();
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

    // Record last focused opener element when opening overlays
    ['openAILab', 'openChemLab', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile', 'showUnlockModal'].forEach(fnName => {
      if (typeof window[fnName] === 'function') {
        const orig = window[fnName];
        window[fnName] = function(...args) {
          lastFocusedOpener = document.activeElement;
          const res = orig.apply(this, args);
          return res;
        };
      }
    });
  }

  window.suCloseAllOverlays = function() {
    OVERLAY_CONFIGS.forEach(cfg => closeSingleOverlay(cfg));
    closePhysicsLab();
    restoreBaseState();
  };

  window.SU_OVERLAY_MANAGER = {
    configs: OVERLAY_CONFIGS,
    close: universalClose,
    closeAll: window.suCloseAllOverlays,
    dismissTopmost: dismissTopmost,
    checkAnyOpen: checkAnyOverlayOpen,
    unblock: unblockOverlayElement,
    restoreBaseState: restoreBaseState
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalOverlayManager);
  } else {
    initUniversalOverlayManager();
  }
})();
</script>`;

// Replace UOM in HTML
html = html.substring(0, uomStartPos) + upgradedUOM + html.substring(uomEndPos);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with upgraded Universal Overlay & Close Engine!');

