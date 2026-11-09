import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const triggers = [
  'aiLabCard',
  'chemCard',
  'engCard',
  'bioCard',
  'computerCard',
  'mathCard',
  'spaceCard'
];

triggers.forEach(t => {
  let pos = 0;
  let matches = [];
  while ((pos = html.indexOf(t, pos)) !== -1) {
    matches.push(pos);
    pos += t.length;
  }
  console.log(`${t}: ${matches.length} matches at:`, matches);
  if (matches.length > 0) {
    const p = matches[0];
    console.log(html.slice(Math.max(0, p - 60), Math.min(p + 150, html.length)).replace(/\n/g, ' '));
  }
});

