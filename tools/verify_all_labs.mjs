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

console.log('=== VERIFYING UNIFIED LABORATORY PAGES ===\n');

// 1. Math Lab Checks
assert(html.includes('id="mathOverlay"'), 'Math Lab overlay exists');
assert(html.includes('class="math-shell"'), 'Math Lab shell exists');
assert(html.includes('class="math-layout"'), 'Math Lab 2-column layout exists');
assert(html.includes('class="math-sidebar"'), 'Math Lab sticky sidebar exists');
assert(html.includes('id="mathBack"'), 'Math Lab back button exists');

// 2. Computer Lab Checks
assert(html.includes('id="computerOverlay"'), 'Computer Lab overlay exists');
assert(html.includes('id="cExit"'), 'Computer Lab exit button exists');
assert(html.includes('class="c-layout"'), 'Computer Lab 2-column workspace layout exists');
assert(html.includes('class="c-sidebar"'), 'Computer Lab sticky sidebar exists');
assert(html.includes('class="c-hero"'), 'Computer Lab hero circuit scene exists');
assert(html.includes('data-cgo="home"'), 'Computer Lab nav home button exists');
assert(html.includes('data-cgo="learn"'), 'Computer Lab nav learn button exists');
assert(html.includes('data-cgo="explore"'), 'Computer Lab nav explore button exists');
assert(html.includes('data-cgo="terms"'), 'Computer Lab nav terms button exists');
assert(html.includes('id="cMain"'), 'Computer Lab main container exists');
assert(html.includes('data-cview="home"'), 'Computer Lab home view exists');
assert(html.includes('data-cview="learn"'), 'Computer Lab learn view exists');
assert(html.includes('id="cSearch"'), 'Computer Lab search input exists');
assert(html.includes('id="cArticles"'), 'Computer Lab articles container exists');
assert(html.includes('id="cReader"'), 'Computer Lab reader container exists');
assert(html.includes('data-cview="explore"'), 'Computer Lab explore view exists');
assert(html.includes('id="cParts"'), 'Computer Lab parts container exists');
assert(html.includes('id="cFlowNext"'), 'Computer Lab flow next button exists');
assert(html.includes('id="cBinaryInput"'), 'Computer Lab binary input exists');
assert(html.includes('id="cNetworkRun"'), 'Computer Lab network run button exists');
assert(html.includes('data-cview="terms"'), 'Computer Lab terms view exists');
assert(html.includes('id="cTerms"'), 'Computer Lab terms container exists');

// 3. Chemistry Lab Checks
assert(html.includes('id="chemOverlay"'), 'Chemistry Lab overlay exists');
assert(html.includes('id="chemClose"'), 'Chemistry Lab close button exists');
assert(html.includes('class="ch-cinema"'), 'Chemistry Lab Holo simulator cinema exists');
assert(html.includes('class="ch-tabs"'), 'Chemistry Lab tabs navigation exists');
assert(html.includes('data-chpanel="atom"'), 'Chemistry Lab atom & elements panel exists');
assert(html.includes('data-chpanel="reaction"'), 'Chemistry Lab reaction panel exists');

// 4. Engineering Lab Checks
assert(html.includes('id="engOverlay"'), 'Engineering Lab overlay exists');
assert(html.includes('id="engClose"'), 'Engineering Lab close button exists');
assert(html.includes('class="eng-wrap"'), 'Engineering Lab wrapper exists');
assert(html.includes('class="eng-tabs"'), 'Engineering Lab tabs navigation exists');
assert(html.includes('data-engpanel="learn"'), 'Engineering Lab learn panel exists');

// 5. AI Lab Checks
assert(html.includes('id="aiOverlay"'), 'AI Lab overlay exists');
assert(html.includes('id="aiClose"'), 'AI Lab close button exists');
assert(html.includes('class="ai-neurons"'), 'AI Lab neural network graphic exists');
assert(html.includes('class="ai-tabs"'), 'AI Lab tabs navigation exists');

// 6. Biology Lab Checks
assert(html.includes('id="bioOverlay"'), 'Biology Lab overlay exists');
assert(html.includes('id="bioBack"'), 'Biology Lab back button exists');
assert(html.includes('class="bio-wrap"'), 'Biology Lab wrapper exists');
assert(html.includes('class="bio-tabs"'), 'Biology Lab tabs navigation exists');

// 7. Physics Lab Checks
assert(html.includes('class="pl'), 'Physics Lab overlay exists');
assert(html.includes('pl-bar'), 'Physics Lab top bar exists');
assert(html.includes('pl-tabs'), 'Physics Lab tabs exist');
assert(html.includes('pl-grid'), 'Physics Lab grid exists');

// 8. Desktop 2-Column Responsive Checks
assert(html.includes('max-width: 1380px !important'), '1380px maximum width benchmark is applied');
assert(html.includes('grid-template-columns: 320px minmax(0, 1fr) !important'), '320px sidebar 2-column grid applied');
assert(html.includes('/* Fullscreen & Expansive Desktop Laboratory Workspaces (Math Lab Standard for All Labs) */'), 'Master desktop lab standard header is in stylesheet');

console.log(`\n================================`);
console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
}
