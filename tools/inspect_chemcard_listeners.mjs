import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

let p = 0;
while ((p = html.indexOf('chemCard', p)) !== -1) {
  console.log('chemCard at', p);
  console.log(html.substring(Math.max(0, p - 100), Math.min(html.length, p + 200)));
  p += 8;
}

