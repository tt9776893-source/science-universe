import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Let's inspect the sections around clBackBtn, chemClose, engBackHome, engClose, plDialogClose, etc.
function printSurrounding(pattern, length = 600) {
  let idx = 0;
  console.log(`\n=================== PATTERN: ${pattern} ===================`);
  while ((idx = html.indexOf(pattern, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + length);
    console.log(`--- Match at ${idx} ---`);
    console.log(html.substring(start, end));
    idx += pattern.length;
  }
}

printSurrounding('clBackBtn');
printSurrounding('engBackHome');
printSurrounding('cExit');
printSurrounding('mathBack');
printSurrounding('bioBack');
printSurrounding('plDialogClose');

