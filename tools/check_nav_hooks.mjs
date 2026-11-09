import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (
    l.includes('trigger.addEventListener') ||
    l.includes('suLabDirectory') ||
    l.includes('openProfile') ||
    l.includes('SU_BAR')
  ) {
    if (l.length < 400) console.log(`L${i + 1}: ${l.trim()}`);
  }
});

