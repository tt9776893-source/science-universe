import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log(html.substring(87000, 89500));

