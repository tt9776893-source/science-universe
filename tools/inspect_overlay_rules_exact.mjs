import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Mobile native overlays
const mStart = html.indexOf('/* Native Mobile Overlays (Fullscreen) */');
console.log('mStart:', mStart);
console.log(html.slice(mStart, mStart + 800));

// Desktop overlays
const dStart = html.indexOf('/* Fullscreen & Expansive Desktop Laboratory Workspaces (Math Lab Standard for All Labs) */');
console.log('dStart:', dStart);
console.log(html.slice(dStart, dStart + 1200));

