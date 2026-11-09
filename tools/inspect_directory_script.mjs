import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectDirectoryScript() {
  const idx = html.indexOf('id="suLabDirectory"');
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 1800));
  }
}

inspectDirectoryScript();

