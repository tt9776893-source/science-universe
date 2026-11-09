import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p1 = html.indexOf('<div class="su-desk-dashboard-grid">');
const p2 = html.indexOf('<!-- LOWER DASHBOARD AREA', p1);
const p3 = html.indexOf('</section>', p2);

console.log('--- DASHBOARD GRID HTML (approx ' + (p2 - p1) + ' chars) ---');
console.log(html.substring(p1, p1 + 2500));
console.log('\n--- RIGHT SIDEBAR (approx) ---');
console.log(html.substring(html.indexOf('<!-- RIGHT SIDEBAR', p1), p2));
console.log('\n--- LOWER DASHBOARD AREA (approx ' + (p3 - p2) + ' chars) ---');
console.log(html.substring(p2, p3 + 10));

