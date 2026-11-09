import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('#desktopDashboardGrid');
console.log('p =', p);
if (p !== -1) {
  console.log(html.substring(p, p + 300));
}

