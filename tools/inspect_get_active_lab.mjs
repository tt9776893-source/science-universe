import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pNav = html.indexOf('<script id="su-universal-overlay-manager">');
const pLab = html.indexOf('function getActiveLab()', pNav);
console.log('--- getActiveLab ---');
console.log(html.substring(pLab, pLab + 800));

