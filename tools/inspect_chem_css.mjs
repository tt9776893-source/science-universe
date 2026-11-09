import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = 51120;
console.log(html.slice(sIdx - 200, sIdx + 1200));

