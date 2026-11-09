import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// 1. CSS check
const cssTarget = `/* ===== CHEMISTRY LAB STYLES ===== */
.cl{position:absolute!important;inset:0;z-index:30;display:none;flex-direction:column;color:#fff;font-family:var(--body,Inter,system-ui,sans-serif);
  padding:calc(12px + env(safe-area-inset-top,0px)) 16px 0;overflow:hidden;
  background:radial-gradient(90% 42% at 50% 0%,#00324d 0%,transparent 70%),radial-gradient(70% 40% at 100% 100%,rgba(0,180,216,.25),transparent 70%),linear-gradient(#050c1f,#071a36 55%,#030713);
  transition:all .2s ease;}
.cl.on{display:flex}`;
console.log('CSS Target found:', html.includes(cssTarget));

// 2. chemistry-3d-lab-script closeChem check
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
console.log('scriptTarget found:', html.includes(scriptTarget));

// 3. getActiveLab check
const navTarget1 = `function getActiveLab() {
    const pl = document.querySelector('.pl');
    if (pl && (pl.classList.contains('on') || (pl.style.display && pl.style.display !== 'none'))) return 'physics';

    const chem = $('chemOverlay');
    if (chem && (chem.classList.contains('on') || chem.classList.contains('open'))) return 'chemistry';`;
console.log('navTarget1 found:', html.includes(navTarget1));

// 4. closeSingleOverlay check
const navTarget2 = `function closeSingleOverlay(cfg) {
    const id = typeof cfg === 'string' ? cfg : (cfg && cfg.id ? cfg.id : '');
    const el = $(id);
    if (!el) return false;
    const config = OVERLAY_CONFIGS.find(c => c.id === id) || (typeof cfg === 'object' ? cfg : {});`;
console.log('navTarget2 found:', html.includes(navTarget2));

// 5. back() lab === chemistry check
const navTarget3 = `if (lab === 'physics') { closePhysicsLab(); restoreBaseState(); return true; }
      if (lab === 'chemistry') { closeComponent('chemOverlay'); return true; }`;
console.log('navTarget3 found:', html.includes(navTarget3));

// 6. click delegation check
const navTarget4 = `if (btn.matches('#engClose, .eng-btn#engClose')) { closeComponent('engOverlay'); return; }
      if (btn.matches('#chemClose, .ch-back#chemClose, #clBackBtn, .cl-back')) { closeComponent('chemOverlay'); return; }`;
console.log('navTarget4 found:', html.includes(navTarget4));

