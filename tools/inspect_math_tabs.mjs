import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const mIdx = html.indexOf('id="mathOverlay"');
const cIdx = html.indexOf('id="computerOverlay"');

const mathPart = html.substring(mIdx, cIdx);

// Find all tabs and panels in Math Lab
const tabs = mathPart.match(/data-mtab="[^"]+"/g);
const panels = mathPart.match(/data-mpanel="[^"]+"/g);

console.log('Math tabs:', tabs);
console.log('Math panels:', panels);

