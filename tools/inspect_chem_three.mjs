import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

['initThree', 'startAnimation', 'animate', 'isAnimating', 'renderer'].forEach(term => {
  const idx = script.indexOf(term);
  console.log(`\n=== Term: ${term} at offset ${idx} ===`);
  if (idx !== -1) {
    console.log(script.substring(idx, idx + 500));
  }
});

