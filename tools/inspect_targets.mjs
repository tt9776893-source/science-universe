import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Target 1: chemistry-3d-lab-script around closeChem
const pChemScript = html.indexOf('<script id="chemistry-3d-lab-script">');
const target1 = html.substring(html.indexOf('// Close Chemistry Lab (Back to Main Lab)', pChemScript), html.indexOf('chemTrigger.addEventListener', pChemScript));
console.log('--- Target 1 (chemistry-3d-lab-script) ---');
console.log(target1);

// Target 2: su-universal-overlay-manager getActiveLab
const pNav = html.indexOf('<script id="su-universal-overlay-manager">');
const target2 = html.substring(html.indexOf('function getActiveLab()', pNav), html.indexOf('const eng = $(\'engOverlay\');', pNav));
console.log('\n--- Target 2 (getActiveLab) ---');
console.log(target2);

// Target 3: su-universal-overlay-manager closeSingleOverlay
const target3 = html.substring(html.indexOf('function closeSingleOverlay(cfg) {', pNav), html.indexOf('if (config.openClasses) {', pNav));
console.log('\n--- Target 3 (closeSingleOverlay) ---');
console.log(target3);

// Target 4: su-universal-overlay-manager back() lab === 'chemistry'
const target4 = html.substring(html.indexOf("if (lab === 'chemistry')", pNav), html.indexOf("if (lab === 'engineering')", pNav));
console.log('\n--- Target 4 (back() lab === chemistry) ---');
console.log(target4);

// Target 5: su-universal-overlay-manager click delegation for chemClose / clBackBtn
const target5 = html.substring(html.indexOf("if (btn.matches('#engClose, .eng-btn#engClose'))", pNav), html.indexOf("if (btn.matches('#aiClose, .ai-btn#aiClose'))", pNav));
console.log('\n--- Target 5 (click delegation) ---');
console.log(target5);

