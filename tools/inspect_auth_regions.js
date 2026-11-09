const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

function findSnippet(snippet) {
  const idx = content.indexOf(snippet);
  if (idx === -1) {
    console.log('NOT FOUND:', snippet);
    return;
  }
  const line = content.slice(0, idx).split('\n').length;
  console.log(`Found snippet at line ${line}:`);
  console.log(content.slice(idx, idx + snippet.length + 120));
  console.log('-------------------------');
}

findSnippet('<div style="display:flex;gap:8px">');
findSnippet("const phone=$('phone'),sheet=$('sheet'),form=$('form')");
findSnippet('<div id="suProfile" role="dialog"');

