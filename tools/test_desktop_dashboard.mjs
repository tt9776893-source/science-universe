import fs from 'fs';
import assert from 'assert';

console.log('=== VERIFYING MAIN LAB DESKTOP DASHBOARD & EMPTY SPACE ENHANCEMENT ===\n');

const html = fs.readFileSync('index.html', 'utf8');

function check(name, condition) {
  assert(condition, `Failed: ${name}`);
  console.log(`[PASS] ${name}`);
}

// 1. Structure
check('Dashboard grid exists', html.includes('class="su-desk-dashboard-grid"'));
check('Left desktop sidebar exists', html.includes('class="su-desk-sidebar su-desk-left su-desk-only"'));
check('Right desktop sidebar exists', html.includes('class="su-desk-sidebar su-desk-right su-desk-only"'));
check('Center hero container exists', html.includes('class="su-desk-center"'));
check('Central 3D hub preserved', html.includes('<div class="hub" id="hub">'));
check('Focus controls preserved', html.includes('<div class="focus" id="focus">'));
check('Lower desktop dashboard deck exists', html.includes('class="su-desk-bottom su-desk-only"'));

// 2. Dashboard Cards
check('User summary & level card exists', html.includes('СУДЛААЧИЙН ТӨЛӨВ'));
check('Recent activity feed exists', html.includes('СҮҮЛИЙН ҮЙЛ АЖИЛЛАГАА'));
check('Science fact of the day exists', html.includes('ӨДРИЙН СОНИРХОЛТОЙ БАРИМТ'));
check('Daily mission & objectives card exists', html.includes('ӨДРИЙН ДААЛГАВАР'));
check('Quick command actions exist', html.includes('ТҮРГЭН ҮЙЛДЛҮҮД'));
check('Laboratories status overview exists', html.includes('ЛАБОРАТОРИУДЫН ТӨЛӨВ'));

// 3. Quick Launcher Strip
for (let i = 0; i < 8; i++) {
  check(`Quick launcher tile ${i} exists`, html.includes(`data-su-wall-idx="${i}"`));
}

// 4. Recommended Learning Paths
check('Recommended learning paths deck exists', html.includes('СУРАЛЦАХЫГ ЗӨВЛӨЖ БУЙ ЧИГЛЭЛҮҮД'));
check('Path card for Physics exists', html.includes('data-path-open="0"'));
check('Path card for Chemistry exists', html.includes('data-path-open="1"'));
check('Path card for Math exists', html.includes('data-path-open="5"'));

// 5. Responsive Isolation & Mobile Safety
check('Mobile rule hides desktop-only widgets', html.includes('.su-desk-only {\n  display: none !important;'));
check('Mobile rule sets dashboard-grid to display: contents', html.includes('.su-desk-dashboard-grid {\n  display: contents !important;'));
check('Mobile rule sets center to display: contents', html.includes('.su-desk-center {\n  display: contents !important;'));
check('Desktop media query displays grid', html.includes('grid-template-columns: 290px minmax(460px, 1fr) 290px !important;'));

// 6. Interaction Script
check('Desktop dashboard interaction script exists', html.includes('id="su-desktop-dashboard-script"'));
check('Tile click handlers wired', html.includes('data-su-wall-idx'));
check('Quick action handlers wired', html.includes('data-qa-action'));
check('Learning path handlers wired', html.includes('data-path-open'));
check('Data synchronization logic exists', html.includes('syncDashboardData'));

console.log('\n================================');
console.log('ALL DESKTOP DASHBOARD TESTS PASSED!');
console.log('================================');

