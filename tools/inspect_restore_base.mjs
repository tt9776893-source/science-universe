import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('function restoreBaseState()');
console.log(html.substring(p, p + 1500));

