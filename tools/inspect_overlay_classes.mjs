import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function checkOverlayJs(id) {
  console.log(`\n=================== ${id} JS ===================`);
  // Find where id is used in JS
  let pos = 0;
  while ((pos = html.indexOf(id, pos)) !== -1) {
    // Check if within script tag
    const scriptStart = html.lastIndexOf('<script', pos);
    const scriptEnd = html.indexOf('</script>', pos);
    if (scriptStart !== -1 && (scriptEnd === -1 || scriptEnd > pos)) {
      console.log(`Script snippet around ${pos}:`);
      console.log(html.slice(Math.max(scriptStart, pos - 150), Math.min(pos + 300, html.length)).replace(/\n/g, ' '));
      pos += id.length + 200;
    } else {
      pos += id.length;
    }
  }
}

['mathOverlay', 'computerOverlay', 'chemOverlay', 'engOverlay', 'aiOverlay', 'bioOverlay', 'spaceExploreOverlay'].forEach(checkOverlayJs);

