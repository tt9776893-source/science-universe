import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('cExit') || l.includes('cMain') || l.includes('c-tab') || l.includes('data-ctab')) {
    console.log((i + 1) + ': ' + l.trim().substring(0, 100));
  }
});

