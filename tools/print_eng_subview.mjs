import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log(html.substring(30356200, 30357200));

