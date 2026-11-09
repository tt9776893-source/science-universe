import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const regex = /<button[^>]*>[^<]*Хаах[^<]*<\/button>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(`Button at ${m.index}:`);
  console.log(' ', m[0]);
  // Look at context
  console.log(' Context:', html.slice(Math.max(0, m.index - 120), Math.min(m.index + 200, html.length)).replace(/\n/g, ' '));
}

