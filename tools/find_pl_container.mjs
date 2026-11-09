import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf("setT('PHYSICS LAB')");
console.log(html.slice(idx - 600, idx + 400));

