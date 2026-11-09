import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printRange(startPattern, length = 1500) {
  const idx = html.indexOf(startPattern);
  if (idx !== -1) {
    console.log(`=== Found at ${idx} ===`);
    console.log(html.substring(idx, idx + length));
  } else {
    console.log(`=== Not found: ${startPattern} ===`);
  }
}

printRange('function closeReader');
printRange('cReader');
printRange('cl-dialog');
printRange('id="chemClose"');

