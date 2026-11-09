import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printRest() {
  const idx = html.indexOf('id="suProfile"');
  console.log(html.substring(idx + 3500, idx + 8000));
}

printRest();

