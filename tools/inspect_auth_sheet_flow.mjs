import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectAround(str, len = 500) {
  const idx = html.indexOf(str);
  console.log(`=== Matches for: ${str} at ${idx} ===`);
  if (idx !== -1) {
    console.log(html.substring(Math.max(0, idx - 50), Math.min(html.length, idx + len)));
  }
}

inspectAround('function closeSheet');
inspectAround('openLoginSheet: (email)');

