import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('data-path-open');
console.log('data-path-open at', p);
console.log(html.substring(p - 100, p + 500));

const p2 = html.indexOf('data-path-open="1"');
// search for script that handles data-path-open
const pScript = html.indexOf('data-path-open', p + 100);
if (pScript !== -1) {
  console.log('Script handling data-path-open at', pScript);
  console.log(html.substring(pScript - 100, pScript + 500));
}

