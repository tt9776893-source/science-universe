import fs from 'fs';

const testCode = fs.readFileSync('tools/test_desktop_dashboard.mjs', 'utf8');
const lines = testCode.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('quick') || l.includes('tile') || l.includes('chem') || l.includes('Chem')) {
    console.log(`${idx + 1}: ${l}`);
  }
});

