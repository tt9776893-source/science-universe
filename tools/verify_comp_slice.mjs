import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const start = 30520800;
const end = 30525112;

console.log('Start check:', html.slice(start, start + 80));
console.log('End check:', html.slice(end - 80, end));

