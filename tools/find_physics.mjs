import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const needles = ['PHYSICS LAB', 'physicsOverlay', 'class="pl', 'id="physics', 'class="physics', 'data-lab="physics"'];
for (const n of needles) {
  let pos = 0;
  let matches = [];
  while ((pos = html.indexOf(n, pos)) !== -1) {
    matches.push(pos);
    pos += n.length;
  }
  console.log(`${n}: ${matches.length} matches:`, matches.slice(0, 5));
}

