import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function findSnippet(keyword, radius = 400) {
  let idx = 0;
  console.log(`=== Matches for: ${keyword} ===`);
  while ((idx = html.indexOf(keyword, idx)) !== -1) {
    const start = Math.max(0, idx - 150);
    const end = Math.min(html.length, idx + radius);
    console.log(`--- At pos ${idx} ---`);
    console.log(html.substring(start, end));
    idx += keyword.length;
  }
}

findSnippet('id="sheet"');
findSnippet('id="suAuthSheet"');
findSnippet('id="suAuthBackdrop"');
findSnippet('id="mathOverlay"');
findSnippet('id="computerOverlay"');

