import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const start = content.indexOf('id="computerOverlay"');
const end = content.indexOf('</section>', start);

console.log('Computer lab length:', end - start);
console.log(content.substring(start, start + 2500));

