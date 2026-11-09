import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const needle = '/* 5. Desktop & Laptop Fullscreen';
const pos = html.indexOf(needle);
console.log('Found at:', pos);
const closeMediaQuery = html.indexOf('\n}\n', pos);
console.log('Close media query at:', closeMediaQuery);
console.log(html.slice(pos, pos + 1500));
console.log('--- Around close ---');
console.log(html.slice(closeMediaQuery - 200, closeMediaQuery + 500));

