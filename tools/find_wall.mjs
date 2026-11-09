import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('<div class="wall">');
console.log(html.slice(pos, pos + 2500));

