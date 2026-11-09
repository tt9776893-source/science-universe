import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const mIdx = html.indexOf('mgeo-challenge');
console.log(html.substring(mIdx - 100, mIdx + 1500));

