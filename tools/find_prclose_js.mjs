import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf("'#prClose'");
const pos2 = html.indexOf('"#prClose"');
const pos3 = html.indexOf('prClose');
console.log('pos3:', pos3);
console.log(html.slice(pos3 + 20, pos3 + 2500));

