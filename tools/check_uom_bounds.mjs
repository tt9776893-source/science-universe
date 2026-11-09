import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const uomTag = '<script id="su-universal-overlay-manager">';
const startIdx = html.indexOf(uomTag);
const endIdx = html.indexOf('</script>', startIdx) + 9;

console.log(`UOM found at ${startIdx} to ${endIdx} (length ${endIdx - startIdx})`);

