import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('Total length:', html.length);
console.log('--- Last 2500 characters ---');
console.log(html.slice(html.length - 2500));

