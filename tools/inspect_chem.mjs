import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const chemStart = html.indexOf('id="chemOverlay"');
const chemEnd = html.indexOf('</section>', chemStart) !== -1 ? html.indexOf('</section>', chemStart) : html.indexOf('</div>\n</div>\n<div aria-label="Engineering', chemStart);

console.log('chemStart:', chemStart);
console.log(html.slice(chemStart - 20, chemStart + 1800));

// Find chem style
const chemStyleIdx = html.indexOf('#chemOverlay {');
console.log('chemStyleIdx:', chemStyleIdx);
if (chemStyleIdx !== -1) {
  console.log(html.slice(chemStyleIdx, chemStyleIdx + 1200));
}

