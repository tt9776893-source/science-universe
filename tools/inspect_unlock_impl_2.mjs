import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printAt(pos, len = 2000) {
  const start = Math.max(0, pos);
  const end = Math.min(html.length, pos + len);
  console.log(html.substring(start, end));
}

printAt(53834500);

