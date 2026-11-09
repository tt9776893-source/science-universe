import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('id="chemLabRoot"');
console.log('--- Parent / Ancestor of chemLabRoot (1000 chars before) ---');
console.log(html.substring(p - 1000, p));
console.log('--- Inside chemLabRoot and closing tag (1000 chars after) ---');
console.log(html.substring(p, p + 500));

// Find the closing tag of chemLabRoot
let depth = 0;
let end = -1;
for (let i = p; i < html.length; i++) {
  if (html.startsWith('<div', i)) depth++;
  else if (html.startsWith('</div>', i)) {
    depth--;
    if (depth === 0) {
      end = i + 6;
      break;
    }
  }
}
console.log('chemLabRoot closes at', end);
console.log('--- After chemLabRoot (500 chars) ---');
console.log(html.substring(end, end + 500));

