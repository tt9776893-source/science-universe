import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('/* ===== CHEMISTRY LAB STYLES ===== */');
console.log(html.substring(p, p + 600));

