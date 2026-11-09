import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('Computer Lab');
console.log(html.slice(pos, pos + 2500));

