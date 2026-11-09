import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('phone.open .');
console.log(html.slice(idx, idx + 4000));

