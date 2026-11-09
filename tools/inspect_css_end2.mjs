import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pPaths = html.indexOf('.su-paths-grid', 32871909);
console.log(html.substring(pPaths + 1000, pPaths + 2500));

