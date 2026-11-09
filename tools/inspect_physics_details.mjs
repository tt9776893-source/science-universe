import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('--- At 64414 (id="physics") ---');
console.log(html.slice(64350, 64650));

console.log('--- At 163503 (PHYSICS LAB) ---');
console.log(html.slice(163450, 163850));

console.log('--- At 108907 (class="pl) ---');
console.log(html.slice(108850, 109250));

