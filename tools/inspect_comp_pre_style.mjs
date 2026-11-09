import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const start = 30520800;
console.log(html.slice(start - 2500, start));

