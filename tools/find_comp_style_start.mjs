import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const start = 30520800;
let pos = start;
let matches = [];
while ((pos = html.lastIndexOf('#computerOverlay', pos - 1)) !== -1 && pos > start - 30000) {
  matches.push(pos);
}
console.log('Matches before 30520800:', matches);
if (matches.length > 0) {
  const earliest = matches[matches.length - 1];
  console.log('Earliest at:', earliest);
  const tagStart = html.lastIndexOf('<style', earliest);
  console.log('Style tag starts at:', tagStart);
  console.log(html.slice(tagStart, tagStart + 800));
}

