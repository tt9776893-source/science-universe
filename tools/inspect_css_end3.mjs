import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pPaths = html.indexOf('.su-paths-grid', 32871909);
console.log(html.substring(pPaths + 2000, pPaths + 3500));

