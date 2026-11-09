import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const start = 30520800;
const end = 30525112;

console.log('--- 300 chars before start ---');
console.log(html.slice(start - 300, start));

console.log('--- 300 chars after end ---');
console.log(html.slice(end, end + 300));

