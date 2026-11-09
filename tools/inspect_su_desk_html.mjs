import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('class="su-desk-dashboard-grid"');
console.log('su-desk-dashboard-grid HTML at', p);
console.log(html.substring(p - 100, p + 4500));

