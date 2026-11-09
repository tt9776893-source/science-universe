import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find the Universal Overlay Manager
const uomStart = html.indexOf('id="su-universal-overlay-manager"');
console.log('Universal Overlay Manager index:', uomStart);
if (uomStart !== -1) {
  const uomEnd = html.indexOf('</script>', uomStart);
  console.log('=== UNIVERSAL OVERLAY MANAGER ===');
  console.log(html.substring(uomStart, uomEnd + 9));
}

