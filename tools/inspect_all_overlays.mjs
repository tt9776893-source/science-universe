import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

function inspectOverlay(tagId) {
  const start = content.indexOf(`id="${tagId}"`);
  if (start === -1) return console.log(tagId, 'NOT FOUND');
  const close = content.indexOf('</div>', start + 1000);
  console.log(`=== ${tagId} ===`);
  console.log(content.substring(start, start + 800));
}

['chemOverlay', 'engOverlay', 'aiOverlay', 'bioOverlay'].forEach(inspectOverlay);

