import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('id="su-universal-overlay-manager"');
const navEnd = html.indexOf('</script>', navStart);
const navScript = html.substring(navStart, navEnd);

const p = navScript.indexOf('document.addEventListener(\'click\'');
console.log(navScript.substring(p, p + 1500));

