import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('[data-path-open]');
console.log('Script with [data-path-open] at', p);
if (p !== -1) {
  console.log(html.substring(p - 100, p + 600));
}

const p2 = html.indexOf('[data-su-wall-idx]');
console.log('Script with [data-su-wall-idx] at', p2);
if (p2 !== -1) {
  console.log(html.substring(p2 - 100, p2 + 600));
}

