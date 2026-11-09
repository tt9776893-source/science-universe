import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pStyle = html.indexOf('<style id="su-sections-style">');
const pGrid = html.indexOf('.su-desk-dashboard-grid', pStyle);
console.log(html.substring(pGrid + 2500, pGrid + 5500));

