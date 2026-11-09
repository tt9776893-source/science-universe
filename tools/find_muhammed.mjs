import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (/muhammed|ermurat/i.test(line)) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

