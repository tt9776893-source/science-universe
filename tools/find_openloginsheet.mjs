import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('openLoginSheet', idx)) !== -1) {
  console.log(`=== openLoginSheet at pos ${idx} ===`);
  console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + 400)));
  idx += 14;
}

