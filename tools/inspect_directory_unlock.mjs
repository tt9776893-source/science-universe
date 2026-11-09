import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printSnippet(id) {
  const idx = html.indexOf(`id="${id}"`);
  console.log(`=== Snippet for: ${id} ===`);
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 1200));
  }
}

printSnippet('suLabDirectory');
printSnippet('suUnlockModal');

