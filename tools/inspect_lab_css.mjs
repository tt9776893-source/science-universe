import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('#lab {') || line.includes('#lab{') || line.includes('#hub {') || line.includes('.hub {') || line.includes('#focus') || line.includes('.nav {')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

