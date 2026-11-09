import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('id="prClose"');
console.log(html.slice(pos, pos + 4000));

