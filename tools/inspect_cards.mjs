import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
let p = 0;
while ((p = html.indexOf('.card', p)) !== -1) {
  matches.push(p);
  p += 5;
}

console.log('Total .card occurrences:', matches.length);
matches.slice(0, 10).forEach(pos => {
  console.log(`pos ${pos}:`, html.substring(Math.max(0, pos - 50), Math.min(html.length, pos + 100)));
});

