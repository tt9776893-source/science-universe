import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const pos = html.indexOf('window.SU_NAV =');
console.log('window.SU_NAV at pos:', pos);

// Let's find where the script block containing window.SU_NAV begins
const scriptOpen = html.lastIndexOf('<script', pos);
console.log('Script starts at:', scriptOpen);
console.log('--- Script from scriptOpen to pos + 500 ---');
console.log(html.substring(scriptOpen, pos + 500));

