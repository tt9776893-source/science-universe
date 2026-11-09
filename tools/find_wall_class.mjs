import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('class="wall"');
console.log('pos:', pos);
if (pos !== -1) {
  console.log(html.slice(pos, pos + 2500));
}

