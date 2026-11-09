import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

let labStartLine = -1;
let labEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id="lab"')) {
    labStartLine = i + 1;
  }
  if (labStartLine !== -1 && lines[i].includes('<!-- ===== CHEMISTRY LAB CONTAINER ===== -->')) {
    labEndLine = i;
    break;
  }
}

console.log(`Lab starts at line ${labStartLine}, ends before line ${labEndLine}`);

