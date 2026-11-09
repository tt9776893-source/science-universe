import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('.cl{position:absolute');
console.log(html.substring(p - 300, p + 400));

