import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pStyle = html.indexOf('<style id="su-sections-style">');
const pCssGrid = html.indexOf('.su-desk-dashboard-grid {', pStyle);
const pStyleEnd = html.indexOf('</style>', pCssGrid);

console.log('CSS starts at', pCssGrid, 'style closes at', pStyleEnd);
console.log('--- After su-paths-grid in CSS ---');
const pPaths = html.indexOf('.su-paths-grid', pCssGrid);
console.log(html.substring(pPaths, pPaths + 1500));

