import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const matches = [];
let pos = 0;
while ((pos = html.indexOf('Хаах', pos)) !== -1) {
  matches.push({ pos, text: html.slice(Math.max(0, pos - 100), Math.min(html.length, pos + 100)) });
  pos += 4;
}

console.log(`Found ${matches.length} occurrences of 'Хаах':`);
matches.forEach((m, i) => {
  console.log(`--- Match ${i + 1} at ${m.pos} ---`);
  console.log(m.text.replace(/\n/g, ' '));
});

