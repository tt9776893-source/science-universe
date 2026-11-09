import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('function closeComponent');
console.log('--- closeComponent (2000 chars) ---');
console.log(html.substring(pos, pos + 2000));

const posLab = html.indexOf('function getActiveLab');
console.log('--- getActiveLab (1000 chars) ---');
console.log(html.substring(posLab, posLab + 1000));

