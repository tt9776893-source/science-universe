import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const sIdx = 30510387;
const eIdx = 30520792;
const styleContent = html.slice(sIdx, eIdx);

console.log('Style length:', styleContent.length);
// Find keyframes
const keyframes = [...styleContent.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
console.log('Keyframes:', keyframes);

