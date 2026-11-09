import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf('.su-profile-modal-backdrop {');
console.log(html.substring(idx - 100, idx + 800));

