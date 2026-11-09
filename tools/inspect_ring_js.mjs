import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('ring') && (line.includes('document.getElementById') || line.includes('querySelector'))) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
  if (line.includes('prevW') || line.includes('nextW') || line.includes('enterW')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

