import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('class="su-desk-sidebar su-desk-right');
console.log('Right sidebar at', p);
console.log(html.substring(p - 100, p + 4500));

