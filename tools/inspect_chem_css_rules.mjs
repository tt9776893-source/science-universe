import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('.cl{');
if (p !== -1) {
  console.log('--- CSS .cl (1500 chars) ---');
  console.log(html.substring(p, p + 1500));
} else {
  const p2 = html.indexOf('#chemLabRoot');
  console.log('--- CSS #chemLabRoot (1500 chars) ---');
  console.log(html.substring(p2 - 500, p2 + 1000));
}

