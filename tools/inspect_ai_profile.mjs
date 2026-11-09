import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printSnippet(id, len = 1000) {
  const idx = html.indexOf(`id="${id}"`);
  if (idx !== -1) {
    console.log(html.substring(idx, idx + len));
  } else {
    console.log(`Not found: ${id}`);
  }
}

printSnippet('aiOverlay');
printSnippet('suProfile');

