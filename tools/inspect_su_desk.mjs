import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('su-desk-dashboard-grid');
console.log('su-desk-dashboard-grid at', p);
console.log('--- HTML (5000 chars) ---');
console.log(html.substring(p - 100, p + 5000));

