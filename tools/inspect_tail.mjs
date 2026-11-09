import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = 32797000;
console.log('--- From 32797000 to end (total len ' + html.length + ') ---');
console.log(html.slice(idx, idx + 4000));

