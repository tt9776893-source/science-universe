import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('.mnav {');
console.log(html.slice(idx, idx + 2000));

