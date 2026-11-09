import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const idx = content.indexOf('.c-shell');
console.log('c-shell found at index:', idx);
if (idx !== -1) {
  console.log(content.substring(idx - 100, idx + 1200));
}

