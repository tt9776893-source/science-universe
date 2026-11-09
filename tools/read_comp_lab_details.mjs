import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const startIdx = content.indexOf('id="computerOverlay"');
console.log(content.substring(startIdx, startIdx + 1500));

