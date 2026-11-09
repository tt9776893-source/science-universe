import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const scriptStart = content.indexOf("id='computer-app-script'");
const altStart = content.indexOf('computer-app-script');

console.log('Script position:', scriptStart, altStart);
const idx = scriptStart !== -1 ? scriptStart : altStart;
if (idx !== -1) {
  console.log(content.substring(idx - 50, idx + 1000));
}

