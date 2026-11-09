import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. CSS
const cssTarget = `/* ===== CHEMISTRY LAB STYLES ===== */
.cl{position:absolute!important;inset:0;z-index:30;display:none;flex-direction:column;color:#fff;font-family:var(--body,Inter,system-ui,sans-serif);
  padding:calc(12px + env(safe-area-inset-top,0px)) 16px 0;overflow:hidden;
  background:radial-gradient(90% 42% at 50% 0%,#00324d 0%,transparent 70%),radial-gradient(70% 40% at 100% 100%,rgba(0,180,216,.25),transparent 70%),linear-gradient(#050c1f,#071a36 55%,#030713);
  transition:all .2s ease;}
.cl.on{display:flex}`;

const cssReplacement = `/* ===== CHEMISTRY LAB STYLES ===== */
.cl{position:fixed!important;inset:0!important;z-index:99999!important;display:none;flex-direction:column;color:#fff;font-family:var(--body,Inter,system-ui,sans-serif);
  padding:calc(12px + env(safe-area-inset-top,0px)) 16px 0;overflow:hidden;
  background:radial-gradient(90% 42% at 50% 0%,#00324d 0%,transparent 70%),radial-gradient(70% 40% at 100% 100%,rgba(0,180,216,.25),transparent 70%),linear-gradient(#050c1f,#071a36 55%,#030713);
  transition:all .2s ease;}
.cl.on{display:flex!important;position:fixed!important;inset:0!important;z-index:99999!important}
.cl:not(.on){display:none!important;pointer-events:none!important}`;

if (!html.includes(cssTarget)) throw new Error('CSS target not found');
html = html.replace(cssTarget, cssReplacement);
console.log('Applied CSS replacement.');

// 2. chemistry-3d-lab-script closeChem
const scriptTarget = `// Close Chemistry Lab (Back to Main Lab)
function closeChem() {
  chemRoot.classList.remove('on');
  chemRoot.classList.remove('fullscreen');
  if (fsBtn) { fsBtn.textContent = '⛶'; fsBtn.title = 'Бүрэн дэлгэц'; }
  isAnimating = false;
  if (document.pointerLockElement) {
    try { document.exitPointerLock(); } catch(e){}
  }
  closeDialog();
}`;

const scriptReplacement = `// Close Chemistry Lab (Back to Main Lab)
function closeChem() {
  if (!chemRoot) return;
  chemRoot.classList.remove('on');
  chemRoot.classList.remove('fullscreen');
  chemRoot.style.removeProperty('display');
  chemRoot.style.removeProperty('pointer-events');
  if (fsBtn) { fsBtn.textContent = '⛶'; fsBtn.title = 'Бүрэн дэлгэц'; }
  isAnimating = false;
  if (document.pointerLockElement) {
    try { document.exitPointerLock(); } catch(e){}
  }
  if (document.fullscreenElement) {
    try { document.exitFullscreen(); } catch(e){}
  }
  isMouseDown = false;
  if (moveState) {
    moveState.forward = false;
    moveState.backward = false;
    moveState.left = false;
    moveState.right = false;
  }
  if (velocity && typeof velocity.set === 'function') {
    velocity.set(0, 0, 0);
  }
  if (speedPanel) {
    speedPanel.style.display = 'none';
  }
  if (speedBtn) {
    speedBtn.classList.remove('active');
  }
  closeDialog();

  if (window.SU_NAV && typeof window.SU_NAV.restoreBaseState === 'function') {
    window.SU_NAV.restoreBaseState();
  }
}

// Expose functions globally for single source of truth navigation
window.openChemLab = openChem;
window.closeChemLab = closeChem;
window.openChem = openChem;
window.closeChem = closeChem;
window.closeClDialog = closeDialog;`;

if (!html.includes(scriptTarget)) throw new Error('scriptTarget not found');
html = html.replace(scriptTarget, scriptReplacement);
console.log('Applied chemistry-3d-lab-script replacement.');

// 3. getActiveLab
const navTarget1 = `function getActiveLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || (pl.style.display && pl.style.display !== 'none'))) return 'physics';

    const chem = $('chemOverlay');
    if (chem && (chem.classList.contains('on') || chem.classList.contains('open'))) return 'chemistry';`;

const navReplacement1 = `function getActiveLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || (pl.style.display && pl.style.display !== 'none'))) return 'physics';

    const cl = $('chemLabRoot');
    if (cl && (cl.classList.contains('on') || cl.classList.contains('fullscreen') || (cl.style.display && cl.style.display !== 'none'))) return 'chemistry';

    const chem = $('chemOverlay');
    if (chem && (chem.classList.contains('on') || chem.classList.contains('open'))) return 'chemistry';`;

if (!html.includes(navTarget1)) throw new Error('navTarget1 not found');
html = html.replace(navTarget1, navReplacement1);
console.log('Applied getActiveLab replacement.');

// 4. closeSingleOverlay
const navTarget2 = `function closeSingleOverlay(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    const el = $(id);
    if (!el) return false;
    const config = OVERLAY_CONFIGS.find(c => c.id === id) || (typeof cfg === 'object' ? cfg : {});`;

const navReplacement2 = `function closeSingleOverlay(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    const el = $(id);
    if (!el && id !== 'chemOverlay' && id !== 'chemLabRoot') return false;
    const config = OVERLAY_CONFIGS.find(c => c.id === id) || (typeof cfg === 'object' ? cfg : {});

    if (id === 'chemOverlay' || id === 'chemLabRoot') {
      if (typeof window.closeChemLab === 'function') {
        try { window.closeChemLab(); } catch(_) {}
      } else if (typeof window.closeChem === 'function') {
        try { window.closeChem(); } catch(_) {}
      }
      const cl = $('chemLabRoot');
      if (cl) {
        cl.classList.remove('on', 'fullscreen', 'open');
        cl.style.removeProperty('display');
        cl.style.removeProperty('pointer-events');
      }
      const ch = $('chemOverlay');
      if (ch) {
        ch.classList.remove('on', 'open');
        ch.style.setProperty('display', 'none', 'important');
        ch.style.setProperty('pointer-events', 'none', 'important');
      }
    }`;

if (!html.includes(navTarget2)) throw new Error('navTarget2 not found');
html = html.replace(navTarget2, navReplacement2);
console.log('Applied closeSingleOverlay replacement.');

// 5. back() lab === chemistry
const navTarget3 = `if (lab === 'physics') { closePhysicsLab(); restoreBaseState(); return true; }
      if (lab === 'chemistry') { closeComponent('chemOverlay'); return true; }`;

const navReplacement3 = `if (lab === 'physics') { closePhysicsLab(); restoreBaseState(); return true; }
      if (lab === 'chemistry') {
        if (typeof window.closeChemLab === 'function') {
          try { window.closeChemLab(); } catch(_) {}
        } else if (typeof window.closeChem === 'function') {
          try { window.closeChem(); } catch(_) {}
        }
        closeComponent('chemLabRoot');
        closeComponent('chemOverlay');
        restoreBaseState();
        return true;
      }`;

if (!html.includes(navTarget3)) throw new Error('navTarget3 not found');
html = html.replace(navTarget3, navReplacement3);
console.log('Applied back() lab === chemistry replacement.');

// 6. Click delegation
const navTarget4 = `if (btn.matches('#engClose, .eng-btn#engClose')) { closeComponent('engOverlay'); return; }
      if (btn.matches('#chemClose, .ch-back#chemClose, #clBackBtn, .cl-back')) { closeComponent('chemOverlay'); return; }`;

const navReplacement4 = `if (btn.matches('#engClose, .eng-btn#engClose')) { closeComponent('engOverlay'); return; }
      if (btn.matches('#clBackBtn, .cl-back, .cl-back#clBackBtn')) {
        if (typeof window.closeChemLab === 'function') {
          try { window.closeChemLab(); } catch(_) {}
        } else if (typeof window.closeChem === 'function') {
          try { window.closeChem(); } catch(_) {}
        }
        closeComponent('chemLabRoot');
        closeComponent('chemOverlay');
        restoreBaseState();
        return;
      }
      if (btn.matches('#chemClose, .ch-back#chemClose')) {
        closeComponent('chemOverlay');
        closeComponent('chemLabRoot');
        restoreBaseState();
        return;
      }`;

if (!html.includes(navTarget4)) throw new Error('navTarget4 not found');
html = html.replace(navTarget4, navReplacement4);
console.log('Applied click delegation replacement.');

// 7. initController opener list
const navTarget5 = `['openAILab', 'openChemLab', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile', 'showUnlockModal'].forEach(fnName => {`;
const navReplacement5 = `['openAILab', 'openChemLab', 'openChem', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile', 'showUnlockModal'].forEach(fnName => {`;

if (html.includes(navTarget5)) {
  html = html.replace(navTarget5, navReplacement5);
  console.log('Applied initController opener list replacement.');
}

// Write file
console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html!');

