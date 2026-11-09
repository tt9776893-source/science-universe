import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let pos = 0;
while ((pos = html.indexOf('suProfile', pos)) !== -1) {
  console.log('suProfile at:', pos);
  console.log(html.slice(pos - 50, pos + 150).replace(/\n/g, ' '));
  pos += 9;
}

