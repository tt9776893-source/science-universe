import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectOverlayDom(id) {
  const start = html.indexOf(`id="${id}"`);
  if (start === -1) return;
  const tagEnd = html.indexOf('>', start);
  console.log(`\n================ ${id} ================`);
  // Get direct children structure
  const content = html.slice(tagEnd + 1, tagEnd + 2500);
  console.log(content.slice(0, 1200));
}

inspectOverlayDom('chemOverlay');
inspectOverlayDom('engOverlay');
inspectOverlayDom('aiOverlay');
inspectOverlayDom('bioOverlay');

