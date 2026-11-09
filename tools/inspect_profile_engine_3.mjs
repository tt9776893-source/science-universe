import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printProfileEngine3() {
  const idx = html.indexOf('id="su-profile-engine-script"');
  console.log(html.substring(idx + 7500, idx + 12000));
}

printProfileEngine3();

