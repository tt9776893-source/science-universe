import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function searchMatches(pattern) {
  const lines = html.split('\n');
  lines.forEach((l, i) => {
    if (pattern.test(l)) console.log(`Line ${i+1}: ${l.trim()}`);
  });
}

console.log('--- suSwitch occurrences ---');
searchMatches(/suSwitch/);

console.log('--- data-propen="switch" occurrences ---');
searchMatches(/data-propen="switch"/);

console.log('--- pr-screen active or visibility ---');
searchMatches(/data-prscreen/);

