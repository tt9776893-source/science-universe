import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('aiClose', pos)) !== -1) {
  console.log('aiClose at:', pos);
  console.log(html.slice(pos - 150, pos + 250).replace(/\n/g, ' '));
  pos += 7;
}

