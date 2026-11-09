import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('class="su-launcher-strip"');
console.log(html.substring(p, p + 4500));

