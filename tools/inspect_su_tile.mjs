import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('su-tile');
console.log('su-tile at', p);
if (p !== -1) {
  console.log(html.substring(p, p + 1000));
}

