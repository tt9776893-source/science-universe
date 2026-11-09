import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Search for tile click in desktop dashboard
const p = html.indexOf('function wireDashboardClicks');
if (p !== -1) {
  console.log(html.substring(p, p + 2000));
} else {
  const p2 = html.indexOf('.su-desktop-tile');
  console.log(html.substring(p2, p2 + 2000));
}

