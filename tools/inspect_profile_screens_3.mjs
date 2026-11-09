import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printRest3() {
  const idx = html.indexOf('id="suProfile"');
  console.log(html.substring(idx + 7500, idx + 14000));
}

printRest3();

