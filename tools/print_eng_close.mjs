import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log(html.substring(30357150, 30357600));

