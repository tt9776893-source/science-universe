import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('uname') || line.includes('credchip') || line.includes('credits')) {
    if (line.includes('document.getElementById') || line.includes('querySelector') || line.includes('textContent')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
    }
  }
});

