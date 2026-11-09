import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const targetStr = "const close=root.querySelector('#engClose');close.addEventListener('click',showHome);";
const idx = html.indexOf(targetStr);
console.log('Target found at pos:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 200));
}

