import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printBefore(pos, len = 1500) {
  const start = Math.max(0, pos - len);
  console.log(html.substring(start, pos));
}

printBefore(30335631);

