import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('<script id="computerRebuiltScript">');
const eIdx = html.indexOf('</script>', sIdx);
const scriptBody = html.slice(sIdx, eIdx);
const readIdx = scriptBody.indexOf("closest('[data-read]')");
console.log(scriptBody.slice(readIdx - 1500, readIdx));

