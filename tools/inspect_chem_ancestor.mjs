import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('id="chemLabRoot"');
console.log('--- 400 chars before chemLabRoot ---');
console.log(html.substring(p - 400, p));

