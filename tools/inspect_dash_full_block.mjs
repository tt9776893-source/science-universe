import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('su-desk-sidebar');
const styleStart = html.lastIndexOf('<style', p);
const styleEnd = html.indexOf('</style>', p);

console.log('Style block from', styleStart, 'to', styleEnd);
console.log('Length:', styleEnd - styleStart);
console.log(html.substring(styleStart, styleStart + 1500));
console.log('--- Middle / End of block ---');
console.log(html.substring(styleEnd - 1500, styleEnd + 8));

