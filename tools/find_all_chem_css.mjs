import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('#chemOverlay', pos)) !== -1) {
  console.log(`chemOverlay at ${pos}: ${html.slice(pos, pos + 80).replace(/\n/g, ' ')}`);
  pos += 12;
}

