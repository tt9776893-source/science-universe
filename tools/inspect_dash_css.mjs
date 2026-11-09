import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pStart = html.indexOf('/* ==========================================================================\n   SCIENCE UNIVERSE — DESKTOP DASHBOARD & EMPTY SPACE ENHANCEMENT');
const pEnd = html.indexOf('/* ==========================================================================\n   SCIENCE UNIVERSE — UNIVERSAL ACCESSIBILITY', pStart);

console.log('CSS block start:', pStart, 'end:', pEnd);
console.log(html.substring(pStart, pStart + 3500));

