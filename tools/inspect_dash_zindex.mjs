import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('#desktopDashboardGrid{');
if (p !== -1) {
  console.log(html.substring(p, p + 200));
} else {
  const p2 = html.indexOf('#desktopDashboardGrid');
  console.log(html.substring(p2, p2 + 200));
}

