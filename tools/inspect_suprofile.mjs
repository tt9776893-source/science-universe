import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = 32627931;
console.log(html.slice(pos, pos + 1200));

