import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log(html.slice(30321000, 30322300));

