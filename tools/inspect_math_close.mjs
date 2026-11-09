import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const mathStart = html.indexOf('id="mathOverlay"');
const compStart = html.indexOf('id="computerOverlay"');

const mathSection = html.substring(mathStart, compStart);

const lines = mathSection.split('\n');
const hits = [];
lines.forEach((l, i) => {
  if (/close|back|exit|dismiss|хаах|буцах|✕|×/i.test(l)) {
    hits.push({ line: i + 1, text: l.trim() });
  }
});

console.log(`Hits in Math Lab: ${hits.length}`);
hits.forEach(h => console.log(`  L${h.line}: ${h.text}`));

