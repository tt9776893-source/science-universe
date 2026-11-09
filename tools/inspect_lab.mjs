import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const labIndex = html.indexOf('id="lab"');
console.log('Lab id found at character:', labIndex);
const start = Math.max(0, labIndex - 200);
const snippet = html.substring(start, start + 3500);
console.log(snippet);

