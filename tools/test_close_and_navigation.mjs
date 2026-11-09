import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

console.log('=== VERIFYING CLOSE BUTTON & OVERLAY NAVIGATION SYSTEM ===\n');

// 1. Check strict closed CSS rules
assert(html.includes('#aiOverlay:not(.on)'), 'CSS includes #aiOverlay:not(.on) closed rule');
assert(html.includes('#chemOverlay:not(.on)'), 'CSS includes #chemOverlay:not(.on) closed rule');
assert(html.includes('#engOverlay:not(.eng-on)'), 'CSS includes #engOverlay:not(.eng-on) closed rule');
assert(html.includes('#bioOverlay:not(.open):not(.on)'), 'CSS includes #bioOverlay:not(.open) closed rule');
assert(html.includes('#computerOverlay:not(.on):not(.open)'), 'CSS includes #computerOverlay:not(.on) closed rule');
assert(html.includes('#mathOverlay:not(.open):not(.on)'), 'CSS includes #mathOverlay:not(.open) closed rule');
assert(html.includes('#spaceExploreOverlay:not(.open):not(.on)'), 'CSS includes #spaceExploreOverlay:not(.open) closed rule');

// 2. Check no unconditional display: grid on desktop
assert(!html.includes('#aiOverlay {\n    display: grid !important'), 'No unconditional display: grid for #aiOverlay');
assert(!html.includes('#chemOverlay {\n    display: grid !important'), 'No unconditional display: grid for #chemOverlay');
assert(html.includes('#aiOverlay.on {\n    display: grid !important'), '#aiOverlay.on has display: grid !important on desktop');
assert(html.includes('#chemOverlay.on {\n    display: grid !important'), '#chemOverlay.on has display: grid !important on desktop');

// 3. Check Universal Overlay Manager Script
assert(html.includes('id="su-universal-overlay-manager"'), 'Universal overlay manager script is present');
assert(html.includes('window.SU_OVERLAY_MANAGER'), 'window.SU_OVERLAY_MANAGER is exposed');
assert(html.includes('window.suCloseAllOverlays'), 'window.suCloseAllOverlays is exposed');
assert(html.includes('closeSingleOverlay'), 'closeSingleOverlay helper exists');
assert(html.includes('restoreBaseState'), 'restoreBaseState helper exists');

// 4. Check close button selectors
const buttons = [
  '#aiClose',
  '#chemClose',
  '#engClose',
  '#bioBack',
  '#cExit',
  '#mathBack',
  '#seCloseBtn',
  '#prClose',
  '#prCloseBottom',
  '#suDirectoryClose',
  '#suUnlockClose',
  '.pl-back'
];

buttons.forEach(btn => {
  assert(html.includes(btn.replace(/[.#]/, '')), `Close button ${btn} exists in DOM`);
});

// 5. Check Escape key handling
assert(html.includes("e.key === 'Escape'"), 'Escape key handler is registered');

// 6. Check pointer-events and scroll restoration
assert(html.includes("document.body.style.overflow = ''"), 'Body scroll restoration logic exists');
assert(html.includes("el.style.pointerEvents = 'auto'"), 'Pointer events restoration logic exists');

console.log(`\n================================`);
console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) process.exit(1);

