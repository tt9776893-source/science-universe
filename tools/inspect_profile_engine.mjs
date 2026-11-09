import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printProfileEngine() {
  const idx = html.indexOf('id="su-profile-engine-script"');
  console.log(html.substring(idx, idx + 4000));
}

printProfileEngine();

