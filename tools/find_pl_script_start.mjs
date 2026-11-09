import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf("pl-cr8");
console.log('pl-cr8 at:', idx);
if (idx !== -1) {
  const scriptStart = html.lastIndexOf('<script', idx);
  console.log('scriptStart at:', scriptStart);
  console.log(html.slice(scriptStart, scriptStart + 1200));
}
