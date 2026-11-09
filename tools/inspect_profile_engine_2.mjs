import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printProfileEngine2() {
  const idx = html.indexOf('id="su-profile-engine-script"');
  console.log(html.substring(idx + 3500, idx + 8000));
}

printProfileEngine2();

