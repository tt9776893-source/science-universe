import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printAt(pos, len = 800) {
  const start = Math.max(0, pos - 200);
  const end = Math.min(html.length, pos + len);
  console.log(html.substring(start, end));
}

printAt(30335631);
printAt(32636757);

