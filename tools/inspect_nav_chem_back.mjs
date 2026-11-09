import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('<script id="su-universal-overlay-manager">');
const navEnd = html.indexOf('</script>', navStart);
const navScript = html.substring(navStart, navEnd);

const idx = navScript.indexOf("if (lab === 'chemistry')");
console.log('--- lab === chemistry in back() ---');
console.log(navScript.substring(idx - 200, idx + 500));

