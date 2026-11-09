import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectSpaceExplore() {
  const idx = html.indexOf('id="spaceExploreOverlay"');
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 2500));
  }
}

inspectSpaceExplore();

