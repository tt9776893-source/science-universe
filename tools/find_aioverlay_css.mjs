import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('#aiOverlay', pos)) !== -1) {
  console.log('--- aiOverlay at', pos, '---');
  console.log(html.slice(pos, pos + 200).replace(/\n/g, ' '));
  pos += 10;
}

