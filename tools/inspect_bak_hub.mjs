import fs from 'fs';

const bak = fs.readFileSync('index.html.bak-close-buttons', 'utf8');
const start = bak.indexOf('<div class="su-desk-center">');
const end = bak.indexOf('<!-- RIGHT SIDEBAR', start);
console.log('=== ORIGINAL .su-desk-center IN index.html.bak-close-buttons ===');
console.log(bak.slice(start, end));

const navStart = bak.indexOf('<nav', end);
if (navStart !== -1 && navStart - end < 20000) {
  console.log('=== ORIGINAL <nav> ===');
  console.log(bak.slice(navStart, navStart + 1500));
}

