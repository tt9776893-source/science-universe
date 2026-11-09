import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const uomStart = html.indexOf('id="su-universal-overlay-manager"');
const uomEnd = html.indexOf('</script>', uomStart);

console.log(html.substring(uomStart, uomEnd + 9));

