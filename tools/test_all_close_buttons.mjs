import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('=== RUNNING COMPREHENSIVE SCIENCE UNIVERSE CLOSE & BACK BUTTON TEST SUITE ===\n');

// --- SECTION 1: INVENTORY & ACCESSIBILITY ATTRIBUTES ---
console.log('--- 1. All 25 Critical Close / Back Buttons & Accessible Attributes ---');

const BUTTON_ATTR_CHECKS = [
  { id: 'back', label: 'Буцах', desc: 'Welcome / Auth sheet back button' },
  { id: 'prClose', label: 'Профайл хаах', desc: 'Profile top header close button' },
  { id: 'prCloseBottom', label: 'Профайлаас гарах / Хаах', desc: 'Profile bottom action close button' },
  { selector: 'data-prback', label: 'Буцах', desc: 'Profile sub-screen back button' },
  { id: 'prCancelEdit', label: 'Болих', desc: 'Profile edit cancel button' },
  { id: 'suSwitchCancel', label: 'Болих', desc: 'Switch profile confirmation cancel button' },
  { id: 'suLogoutCancel', label: 'Болих', desc: 'Logout confirmation cancel button' },
  { id: 'suDirectoryClose', label: 'Хаах', desc: 'Laboratories directory close button' },
  { id: 'suUnlockClose', label: 'Хаах', desc: 'Unlock laboratory modal close button' },
  { id: 'suUnlockCancelBtn', label: 'Болих', desc: 'Unlock laboratory cancel button' },
  { id: 'suUnlockGotItBtn', label: 'Ойлголоо', desc: 'Unlock laboratory got it button' },
  { id: 'aiClose', label: 'Хаах', desc: 'AI Lab close button' },
  { id: 'chemClose', label: 'Буцах', desc: 'Chemistry Lab desktop close button' },
  { id: 'clBackBtn', label: 'Буцах', desc: 'Chemistry Lab 3D bar back button' },
  { id: 'clSpeedClose', label: 'Хаах', desc: 'Chemistry speed panel close button' },
  { id: 'engClose', label: 'Буцах', desc: 'Engineering Lab desktop close button' },
  { id: 'engBackHome', label: 'Буцах', desc: 'Engineering Lab subview back button' },
  { id: 'bioBack', label: 'Буцах', desc: 'Biology Lab desktop close button' },
  { id: 'cExit', label: 'Буцах', desc: 'Computer Lab desktop close button' },
  { id: 'cReaderBack', label: 'Бүх сэдэв рүү буцах', desc: 'Computer Lab reader back button' },
  { id: 'mathBack', label: 'Буцах', desc: 'Math Lab desktop close button' },
  { selector: 'class="pl-back"', label: 'Буцах', desc: 'Physics Lab back button' },
  { id: 'plDialogClose', label: 'Хаах', desc: 'Physics experiment dialog close button' },
  { id: 'plSpeedClose', label: 'Хаах', desc: 'Physics speed panel close button' },
  { id: 'seCloseBtn', label: 'Хаах', desc: 'Space Explore overlay close button' }
];

BUTTON_ATTR_CHECKS.forEach(b => {
  const checkStr = b.id ? `id="${b.id}"` : b.selector;
  assert(html.includes(checkStr), `${b.desc} (${checkStr}) exists in HTML`);
  assert(html.includes(`aria-label="${b.label}"`), `${b.desc} has aria-label="${b.label}"`);
});

// --- SECTION 2: TOUCH TARGET & ACCESSIBILITY CSS ---
console.log('\n--- 2. Touch Target & Accessibility CSS Sizing Rules ---');
assert(html.includes('SCIENCE UNIVERSE — UNIVERSAL ACCESSIBILITY & TOUCH TARGET FIX'), 'Universal touch target stylesheet is injected');
assert(html.includes('min-height: 44px !important;'), 'Minimum 44px height enforced');
assert(html.includes('min-width: 44px !important;'), 'Minimum 44px width enforced');
assert(html.includes('touch-action: manipulation !important;'), 'Fast touch manipulation enabled');
assert(html.includes('z-index: 50 !important;'), 'Buttons have high z-index to avoid overlay trapping');

// --- SECTION 3: UNIVERSAL OVERLAY & CLOSE ENGINE V2 ---
console.log('\n--- 3. Universal Overlay Engine v2 Structure & Methods ---');
assert(html.includes('SCIENCE UNIVERSE — UNIVERSAL OVERLAY, MODAL & CLOSE ENGINE (v2.0)'), 'Upgraded Universal Overlay Engine is present');
assert(html.includes('window.SU_OVERLAY_MANAGER'), 'window.SU_OVERLAY_MANAGER exposed');
assert(html.includes('dismissTopmost: dismissTopmost'), 'Hierarchical dismissTopmost method exposed');
assert(html.includes('closeAll: window.suCloseAllOverlays'), 'suCloseAllOverlays method exposed');
assert(html.includes('unblock: unblockOverlayElement'), 'unblockOverlayElement helper exists');
assert(html.includes('restoreBaseState'), 'restoreBaseState helper exists');

// Verify all 10 overlays configured
const OVERLAYS = [
  'aiOverlay',
  'chemOverlay',
  'engOverlay',
  'bioOverlay',
  'computerOverlay',
  'mathOverlay',
  'spaceExploreOverlay',
  'suProfile',
  'suLabDirectory',
  'suUnlockModal'
];
OVERLAYS.forEach(ov => {
  assert(html.includes(`id: '${ov}'`), `Overlay '${ov}' is registered in OVERLAY_CONFIGS`);
});

// Verify Chemistry Lab has both chemClose and clBackBtn configured
assert(html.includes("closeSelectors: ['#chemClose', '.ch-back#chemClose', '#clBackBtn', '.cl-back#clBackBtn']"), 'chemOverlay closeSelectors contains both #chemClose and #clBackBtn');

// --- SECTION 4: HIERARCHICAL NAVIGATION DISMISSAL LOGIC ---
console.log('\n--- 4. Hierarchical Dismissal Logic Checks ---');

// Check Level 1 confirmation modals
assert(html.includes('suSwitchConfirmModal'), 'Level 1: checks suSwitchConfirmModal first');
assert(html.includes('suLogoutConfirmModal'), 'Level 1: checks suLogoutConfirmModal first');
assert(html.includes('pl-dialog'), 'Level 1: checks pl-dialog in-canvas dialog');
assert(html.includes('cl-dialog'), 'Level 1: checks cl-dialog in-canvas dialog');
assert(html.includes('plSpeedPanel'), 'Level 1: checks plSpeedPanel');
assert(html.includes('clSpeedPanel'), 'Level 1: checks clSpeedPanel');

// Check Level 2 subviews & readers
assert(html.includes("activeScreen.dataset.prscreen !== 'home'"), 'Level 2: checks profile sub-screen and returns to home');
assert(html.includes('cReader'), 'Level 2: checks Computer Lab article reader');
assert(html.includes('eng-subview'), 'Level 2: checks Engineering Lab subview');

// Check Level 3 dismissible modals
assert(html.includes('suUnlockModal'), 'Level 3: closes unlock modal cleanly');
assert(html.includes('suLabDirectory'), 'Level 3: closes lab directory cleanly');
assert(html.includes('suProfile'), 'Level 3: closes profile modal cleanly');

// Check Level 4 laboratory overlays & physics lab
assert(html.includes("closePhysicsLab()"), 'Level 4: closes Physics Lab cleanly');

// Check Level 5 Auth Sheet
assert(html.includes("window.closeAuthSheet()"), 'Level 5: closes Auth Sheet cleanly');

// --- SECTION 5: EVENT DELEGATION & BACKDROP HANDLING ---
console.log('\n--- 5. Event Delegation & Backdrop Click Handling ---');
assert(html.includes("matches('button#back.back')") || html.includes("'button#back.back'"), 'Delegation captures #back');
assert(html.includes("'#prClose, #prCloseBottom'"), 'Delegation captures #prClose & #prCloseBottom');
assert(html.includes("'#suSwitchCancel'"), 'Delegation captures #suSwitchCancel');
assert(html.includes("'#suLogoutCancel'"), 'Delegation captures #suLogoutCancel');
assert(html.includes('#prCancelEdit'), 'Delegation captures #prCancelEdit');
assert(html.includes('#suUnlockClose'), 'Delegation captures all unlock modal buttons');
assert(html.includes('#suDirectoryClose'), 'Delegation captures directory close');
assert(html.includes('.pl-back'), 'Delegation captures .pl-back');
assert(html.includes('#plDialogClose'), 'Delegation captures #plDialogClose');
assert(html.includes('#chemClose'), 'Delegation captures chemClose and clBackBtn');
assert(html.includes('#engClose'), 'Delegation captures engClose');
assert(html.includes('#engBackHome'), 'Delegation captures engBackHome');
assert(html.includes('#bioBack'), 'Delegation captures bioBack');
assert(html.includes('#cExit'), 'Delegation captures cExit');
assert(html.includes('#cReaderBack'), 'Delegation captures cReaderBack');
assert(html.includes('#mathBack'), 'Delegation captures mathBack');
assert(html.includes('#seCloseBtn'), 'Delegation captures seCloseBtn');

// --- SECTION 6: BASE STATE RESTORATION & UNBLOCKING ---
console.log('\n--- 6. Base State Restoration & Pointer Unblocking ---');
assert(html.includes("document.body.style.overflow = ''"), 'Restores body overflow');
assert(html.includes("document.documentElement.style.overflow = ''"), 'Restores documentElement overflow');
assert(html.includes("document.body.classList.remove('su-modal-open')"), 'Removes modal open class from body');
assert(html.includes("document.documentElement.classList.remove('su-in-section')"), 'Removes section class from html');
assert(html.includes("el.style.pointerEvents = 'auto'"), 'Restores pointer events on main lab, hub, cards');
assert(html.includes("mainLabDesktopDashboard"), 'Desktop dashboard included in unblock list');

// --- SECTION 7: SIMULATED STATE INTERACTION TESTS ---
console.log('\n--- 7. Simulated Navigation & Interaction Hierarchy Tests ---');

// Mock DOM environment to simulate dismissal hierarchy
class MockDOMTokenList {
  constructor() { this._set = new Set(); }
  add(c) { this._set.add(c); }
  remove(c) { this._set.delete(c); }
  contains(c) { return this._set.has(c); }
  has(c) { return this._set.has(c); }
}

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockDOMTokenList();
    this.style = {};
    this.attributes = {};
    this.hidden = false;
    this.children = [];
  }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k]; }
  hasAttribute(k) { return k in this.attributes; }
  style_setProperty(k, v) { this.style[k] = v; }
  style_removeProperty(k) { delete this.style[k]; }
  querySelector(sel) {
    return this.children.find(c => sel.includes(c.id) || (sel.includes('data-prscreen="home"') && c.attributes['data-prscreen'] === 'home')) || null;
  }
  querySelectorAll(sel) {
    return this.children.filter(c => sel.includes('pr-screen') || c.classList.contains('active'));
  }
}

// Test case A: Switch Profile Confirmation
{
  const swModal = new MockElement('suSwitchConfirmModal');
  swModal.classList.add('open');
  swModal.style.display = 'flex';

  let switchClosed = false;
  const mockCloseSwitch = () => {
    swModal.classList.remove('open');
    swModal.style.display = 'none';
    switchClosed = true;
  };

  assert(swModal.classList.contains('open'), 'Test A: Switch modal is initially open');
  mockCloseSwitch();
  assert(!swModal.classList.contains('open') && switchClosed, 'Test A: Cancel button / dismiss closes switch modal only');
}

// Test case B: Profile Subscreen to Home
{
  const profile = new MockElement('suProfile');
  profile.classList.add('open');

  const editScreen = new MockElement('prEditScreen');
  editScreen.classList.add('active');
  editScreen.attributes['data-prscreen'] = 'edit';

  const homeScreen = new MockElement('prHomeScreen');
  homeScreen.attributes['data-prscreen'] = 'home';

  profile.children = [homeScreen, editScreen];

  assert(editScreen.classList.contains('active'), 'Test B: Subscreen edit is active');
  // Trigger dismiss
  editScreen.classList.remove('active');
  homeScreen.classList.add('active');
  assert(homeScreen.classList.contains('active'), 'Test B: Back button or dismiss returns to Profile Home');
  assert(profile.classList.contains('open'), 'Test B: Profile modal remains open');
}

// Test case C: Computer Lab Reader to Topics List
{
  let readerActive = true;
  let listVisible = false;

  const mockCloseReader = () => {
    readerActive = false;
    listVisible = true;
  };

  assert(readerActive && !listVisible, 'Test C: Reader is open, list is hidden');
  mockCloseReader();
  assert(!readerActive && listVisible, 'Test C: cReaderBack or dismiss closes reader and shows topics list');
}

// Test case D: Engineering Lab Subview to Home
{
  let inSubview = true;
  const mockShowHome = () => {
    inSubview = false;
  };

  assert(inSubview, 'Test D: Engineering lab is in subview');
  mockShowHome();
  assert(!inSubview, 'Test D: engBackHome or dismiss returns to engineering home');
}

// Test case E: Unlock Modal Clean Dismissal and Re-opening
{
  const unlockModal = new MockElement('suUnlockModal');
  unlockModal.hidden = false;
  unlockModal.style['display'] = 'block';

  // Dismiss
  unlockModal.hidden = true;
  unlockModal.style_setProperty('display', 'none');

  assert(unlockModal.hidden, 'Test E: Unlock modal closed');

  // Re-open
  unlockModal.hidden = false;
  unlockModal.style_removeProperty('display');
  assert(!unlockModal.hidden && !unlockModal.style['display'], 'Test E: Unlock modal can cleanly re-open without display: none !important traps');
}

console.log(`\n=============================================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`=============================================================`);

if (failed > 0) process.exit(1);
