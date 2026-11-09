import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('--- At 30313913 ---');
console.log(html.slice(30313700, 30314400));

console.log('--- At 30322283 ---');
console.log(html.slice(30322000, 30322700));

