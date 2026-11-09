import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('/* 5. Desktop & Laptop Fullscreen');
console.log(html.slice(idx, idx + 3500));

