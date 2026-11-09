import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function searchAround(term) {
  let idx = 0;
  console.log(`=== Matches for: ${term} ===`);
  while ((idx = html.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 300);
    console.log(`--- At ${idx} ---`);
    console.log(html.substring(start, end));
    idx += term.length;
  }
}

searchAround('clBackBtn');
searchAround('cl-dialog');
searchAround('closePlDialog');
searchAround('plSpeedClose');
searchAround('clSpeedClose');

