import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = 30416818;
console.log(html.slice(pos - 1500, pos + 1000));

