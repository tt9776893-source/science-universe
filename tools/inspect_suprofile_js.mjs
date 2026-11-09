import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = 32633199;
console.log(html.slice(pos, pos + 2000));

