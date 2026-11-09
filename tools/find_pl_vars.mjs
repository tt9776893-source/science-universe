import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf("function earned()");
console.log(html.slice(idx - 1500, idx));

