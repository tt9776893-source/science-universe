import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('.su-desk-sidebar');
const styleStart = html.lastIndexOf('<style', p);
const styleEnd = html.indexOf('</style>', p);

console.log('Real Style start:', styleStart, 'end:', styleEnd);
console.log(html.substring(styleStart, styleStart + 600));
console.log('--- end of style ---');
console.log(html.substring(styleEnd - 500, styleEnd + 8));

