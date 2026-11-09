import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const labIndex = html.indexOf('id="lab"');
const snippet = html.substring(labIndex + 6500, labIndex + 12000);
console.log(snippet);
