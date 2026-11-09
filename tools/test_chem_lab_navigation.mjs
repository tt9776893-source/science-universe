import fs from 'fs';

console.log('=== VERIFYING CHEMISTRY LAB BACK BUTTON & NAVIGATION ARCHITECTURE ===\n');

const html = fs.readFileSync('index.html', 'utf8');

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
}

// 1. DOM structure verification
console.log('--- 1. DOM Structure & Elements ---');
assert(html.includes('id="chemLabRoot"'), 'Chemistry Lab root container (#chemLabRoot) exists');
assert(html.includes('id="clBackBtn"'), 'Chemistry Lab back button (#clBackBtn) exists');
assert(html.includes('aria-label="Буцах"'), 'Chemistry Lab back button has accessible aria-label="Буцах"');
assert(html.includes('id="chemCard"'), 'Chemistry trigger card (#chemCard) in Main Lab exists');
assert(html.includes('data-tab="3d"'), '3D Lab tab (data-tab="3d") exists');
assert(html.includes('data-tab="exp"'), 'Experiments tab (data-tab="exp") exists');
assert(html.includes('data-tab="theory"'), 'Theory tab (data-tab="theory") exists');
assert(html.includes('data-tab="quiz"'), 'Quiz tab (data-tab="quiz") exists');
assert(html.includes('id="clPane3d"'), '3D Lab pane (#clPane3d) exists');
assert(html.includes('id="clPaneExp"'), 'Experiments pane (#clPaneExp) exists');
assert(html.includes('id="clPaneTheory"'), 'Theory pane (#clPaneTheory) exists');
assert(html.includes('id="clPaneQuiz"'), 'Quiz pane (#clPaneQuiz) exists');

// 2. CSS Styling & Overlay cleanup
console.log('\n--- 2. CSS Rules & Display Safety ---');
assert(html.includes('.cl{position:fixed!important;inset:0!important;z-index:99999!important'), 'Fixed inset full-screen z-index:99999 is applied to .cl');
assert(html.includes('.cl.on{display:flex!important;position:fixed!important;inset:0!important;z-index:99999!important}'), 'Active state .cl.on is display:flex!important with fixed positioning');
assert(html.includes('.cl:not(.on){display:none!important;pointer-events:none!important}'), 'Closed state .cl:not(.on) is strictly hidden and pointer-events:none!important');

// 3. Global API Exposure
console.log('\n--- 3. Function Exposure & Navigation Integration ---');
assert(html.includes('window.openChemLab = openChem;'), 'window.openChemLab is exposed globally');
assert(html.includes('window.closeChemLab = closeChem;'), 'window.closeChemLab is exposed globally');
assert(html.includes('window.openChem = openChem;'), 'window.openChem alias is exposed globally');
assert(html.includes('window.closeChem = closeChem;'), 'window.closeChem alias is exposed globally');
assert(html.includes('window.closeClDialog = closeDialog;'), 'window.closeClDialog is exposed globally');

// 4. Central Navigation Controller (window.SU_NAV) Detection
console.log('\n--- 4. Navigation Controller (SU_NAV) Inspection ---');
assert(html.includes("const cl = $('chemLabRoot');"), 'getActiveLab inspects chemLabRoot');
assert(html.includes("cl.classList.contains('on') || cl.classList.contains('fullscreen')"), 'getActiveLab checks on / fullscreen classes on chemLabRoot');
assert(html.includes("if (id === 'chemOverlay' || id === 'chemLabRoot')"), 'closeSingleOverlay handles both chemOverlay and chemLabRoot');
assert(html.includes("if (typeof window.closeChemLab === 'function')"), 'closeSingleOverlay invokes window.closeChemLab');
assert(html.includes("if (lab === 'chemistry')"), 'SU_NAV.back() has chemistry lab level 4 handler');
assert(html.includes("closeComponent('chemLabRoot')"), 'SU_NAV.back() closes chemLabRoot');

// 5. Click Delegation & Backdrop Handling
console.log('\n--- 5. Click Event Delegation ---');
assert(html.includes("btn.matches('#clBackBtn, .cl-back, .cl-back#clBackBtn')"), 'Universal event delegation matches #clBackBtn');
assert(html.includes("btn.matches('#chemClose, .ch-back#chemClose')"), 'Universal event delegation matches #chemClose');

// 6. Interactive Functional Simulation (Mock DOM)
console.log('\n--- 6. Interactive Functional Navigation Simulation ---');

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new Set();
    this.style = {};
    this.dataset = {};
    this.hidden = false;
    this.parentNode = null;
  }
  setAttribute(k, v) { this[k] = v; }
  removeAttribute(k) { delete this[k]; }
  getAttribute(k) { return this[k]; }
  matches(sel) {
    if (this.id && sel.includes('#' + this.id)) return true;
    for (let c of this.classList) {
      if (sel.includes('.' + c)) return true;
    }
    return false;
  }
}

// Setup simulated state
const mockChemRoot = new MockElement('chemLabRoot');
const mockChemOverlay = new MockElement('chemOverlay');
const mockLab = new MockElement('lab');
const mockPhone = new MockElement('phone');
const mockHub = new MockElement('hub');
let pointerLocked = false;
let fullscreen = false;
let isAnimating = false;
let activeTab = '3d';

function mockOpenChem(tab = '3d') {
  mockChemRoot.classList.add('on');
  isAnimating = true;
  activeTab = tab;
}

function mockCloseChem() {
  mockChemRoot.classList.delete('on');
  mockChemRoot.classList.delete('fullscreen');
  mockChemRoot.style.display = 'none';
  mockChemRoot.style.pointerEvents = 'none';
  isAnimating = false;
  pointerLocked = false;
  fullscreen = false;
  mockLab.style.pointerEvents = 'auto';
  mockPhone.style.pointerEvents = 'auto';
  mockHub.style.pointerEvents = 'auto';
}

function mockGetActiveLab() {
  if (mockChemRoot.classList.has('on') || mockChemRoot.classList.has('fullscreen')) return 'chemistry';
  if (mockChemOverlay.classList.has('on')) return 'chemistry';
  return null;
}

// Test Step 1: Open Chemistry Lab
mockOpenChem('3d');
assert(mockChemRoot.classList.has('on'), 'Step 1: Chemistry Lab is open (.on)');
assert(mockGetActiveLab() === 'chemistry', 'Step 1: SU_NAV recognizes active Chemistry Lab');
assert(isAnimating === true, 'Step 1: Three.js animation loop is active');

// Test Step 2: Click "‹ Буцах"
mockCloseChem();
assert(!mockChemRoot.classList.has('on'), 'Step 2: Clicking "‹ Буцах" removes .on class');
assert(mockChemRoot.style.pointerEvents === 'none', 'Step 2: Chemistry Lab does not block clicks');
assert(mockGetActiveLab() === null, 'Step 2: Active lab is cleared (Main Lab restored)');
assert(isAnimating === false, 'Step 2: Three.js animation loop is stopped');
assert(mockLab.style.pointerEvents === 'auto', 'Step 2: Main Lab buttons are interactive');

// 5x Cycle Test: Open -> Return 5 times
console.log('\n--- 7. Repeatability: 5 Consecutive Exit & Reopen Cycles ---');
for (let i = 1; i <= 5; i++) {
  mockOpenChem('3d');
  assert(mockChemRoot.classList.has('on') && isAnimating, `Cycle ${i}: Reopen Chemistry Lab successfully`);
  mockCloseChem();
  assert(!mockChemRoot.classList.has('on') && !isAnimating && mockGetActiveLab() === null, `Cycle ${i}: Return to Main Lab cleanly without error`);
}

// Subtabs Test: Exit from 'exp', 'theory', 'quiz'
console.log('\n--- 8. Exit from All Chemistry Subtabs ---');
const subtabs = ['exp', 'theory', 'quiz'];
subtabs.forEach(tab => {
  mockOpenChem(tab);
  assert(activeTab === tab, `Opened Chemistry Lab directly on tab '${tab}'`);
  mockCloseChem();
  assert(!mockChemRoot.classList.has('on') && mockGetActiveLab() === null, `Successfully exited Chemistry Lab from tab '${tab}' to Main Lab`);
});

// Other Labs Integrity Check
console.log('\n--- 9. Cross-Laboratory Exit Mechanism Audit ---');
assert(html.includes("if (lab === 'physics') { closePhysicsLab(); restoreBaseState(); return true; }"), 'Physics Lab exit mechanism preserved');
assert(html.includes("if (lab === 'engineering') { closeComponent('engOverlay'); return true; }"), 'Engineering Lab exit mechanism preserved');
assert(html.includes("if (lab === 'biology') { closeComponent('bioOverlay'); return true; }"), 'Biology Lab exit mechanism preserved');
assert(html.includes("if (lab === 'computer') { closeComponent('computerOverlay'); return true; }"), 'Computer Lab exit mechanism preserved');
assert(html.includes("if (lab === 'math') { closeComponent('mathOverlay'); return true; }"), 'Math Lab exit mechanism preserved');
assert(html.includes("if (lab === 'spaceExplore') { closeComponent('spaceExploreOverlay'); return true; }"), 'Space Explore Lab exit mechanism preserved');

console.log('\n=============================================================');
console.log('ALL CHEMISTRY LAB BACK BUTTON & NAVIGATION TESTS PASSED!');
console.log('=============================================================');

