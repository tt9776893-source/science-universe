import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function findSnippetsInScript(str) {
  let idx = 0;
  console.log(`=== Matches for: ${str} ===`);
  while ((idx = html.indexOf(str, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 200);
    console.log(`--- Pos ${idx} ---`);
    console.log(html.substring(start, end));
    idx += str.length;
  }
}

findSnippetsInScript('id="back"');
findSnippetsInScript('back.onclick');
findSnippetsInScript("'back'");
findSnippetsInScript('"back"');

