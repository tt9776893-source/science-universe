import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('scienceUniverseProfilePrefs') || line.includes('suProfilesList') || line.includes('suActiveProfileId')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

