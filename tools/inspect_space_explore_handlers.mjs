import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function searchSpaceExploreHandlers() {
  const idx = html.indexOf('function openSpaceExplore');
  if (idx !== -1) {
    console.log(html.substring(idx, idx + 1000));
  }
  const idx2 = html.indexOf('function closeSpaceExplore');
  if (idx2 !== -1) {
    console.log(html.substring(idx2, idx2 + 1000));
  }
}

searchSpaceExploreHandlers();

