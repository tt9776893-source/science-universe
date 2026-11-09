import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('<script id="computerRebuiltScript">');
const eIdx = html.indexOf('</script>', sIdx);
console.log('Script length:', eIdx - sIdx);
console.log(html.slice(sIdx, sIdx + 2000));

