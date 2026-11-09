import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let idx = 0;
while ((idx = html.indexOf('id="plDialogClose"', idx)) !== -1) {
  console.log(`Found id="plDialogClose" at pos ${idx}:`);
  console.log(html.substring(Math.max(0, idx - 80), Math.min(html.length, idx + 120)));
  idx += 18;
}

