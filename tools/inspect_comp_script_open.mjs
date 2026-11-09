import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('<script id="computerRebuiltScript">');
const eIdx = html.indexOf('</script>', sIdx);
const scriptBody = html.slice(sIdx, eIdx);
const renderListIdx = scriptBody.indexOf("function renderList");
console.log(scriptBody.slice(renderListIdx - 1500, renderListIdx));

