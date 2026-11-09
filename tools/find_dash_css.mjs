import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('.su-desk-sidebar');
console.log('su-desk-sidebar CSS at', p);
console.log(html.substring(p - 300, p + 2500));

