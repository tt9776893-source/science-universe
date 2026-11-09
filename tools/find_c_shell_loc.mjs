import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('.c-shell', pos)) !== -1) {
  console.log('c-shell found at:', pos);
  console.log(html.slice(pos - 100, pos + 300));
  pos += 8;
}

