import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('su-dashboard-grid');
console.log('su-dashboard-grid index:', p);
if (p !== -1) {
  console.log('--- Context around su-dashboard-grid (first 4000 chars) ---');
  console.log(html.substring(p - 150, p + 4000));
}

// Find CSS for su-dashboard-grid
const pCss = html.indexOf('.su-dashboard-grid');
console.log('\n--- CSS for .su-dashboard-grid (1500 chars) ---');
if (pCss !== -1) {
  console.log(html.substring(pCss - 50, pCss + 1500));
}

