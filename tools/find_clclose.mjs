import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('Matches for clClose:', html.indexOf('clClose'));
if (html.indexOf('clClose') !== -1) {
  let idx = 0;
  while ((idx = html.indexOf('clClose', idx)) !== -1) {
    console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + 100)));
    idx += 7;
  }
}

