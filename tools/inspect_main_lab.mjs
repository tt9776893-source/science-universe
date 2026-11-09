import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

console.log('Total lines:', lines.length);

const keywords = ['prevW', 'nextW', 'enterW', 'id="hub"', 'id="ring"', 'id="fen"', 'id="fmn"', 'class="focus"', 'chemCard', 'physCard', 'aiCard', 'bioCard', 'compCard', 'mathCard', 'spaceCard', 'engCard', 'openLab', 'enterLab', 'suUnlock'];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (const kw of keywords) {
    if (line.includes(kw)) {
      console.log(`[L${i + 1}] (${kw}): ${line.slice(0, 200)}`);
      break;
    }
  }
}

