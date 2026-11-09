import fs from 'fs';

console.log('Validating human UI/UX refactoring targets...');

const html = fs.readFileSync('index.html', 'utf8');

// Check that dashboard HTML snippet can be accurately located
const pGrid = html.indexOf('<div class="su-desk-dashboard-grid">');
const pGridEnd = html.indexOf('<!-- LOWER DASHBOARD AREA (DESKTOP ONLY) -->', pGrid);
const pBottomEnd = html.indexOf('<div aria-live="polite" class="toast"', pGridEnd);

console.log('pGrid:', pGrid, 'pGridEnd:', pGridEnd, 'pBottomEnd:', pBottomEnd);
if (pGrid === -1 || pGridEnd === -1 || pBottomEnd === -1) {
  throw new Error('Could not locate dashboard boundaries');
}

// Check CSS block boundaries in su-sections-style
const pStyle = html.indexOf('<style id="su-sections-style">');
const pCssGrid = html.indexOf('.su-desk-dashboard-grid {', pStyle);
const pCssBottom = html.indexOf('.su-paths-grid {', pStyle);
const pCssBottomEnd = html.indexOf('/* Mobile / Portrait Isolation', pCssBottom);

console.log('CSS: pStyle:', pStyle, 'pCssGrid:', pCssGrid, 'pCssBottomEnd:', pCssBottomEnd);

// Check chemistry tabs
const pChemTabs = html.indexOf('<div class="cl-tabs">');
console.log('pChemTabs:', pChemTabs);
if (pChemTabs !== -1) {
  console.log(html.substring(pChemTabs, pChemTabs + 400));
}

// Check physics tabs
const pPlTabs = html.indexOf('<div class="pl-tabs"');
console.log('pPlTabs:', pPlTabs);
if (pPlTabs !== -1) {
  console.log(html.substring(pPlTabs, pPlTabs + 400));
}

