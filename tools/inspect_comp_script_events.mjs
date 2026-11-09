import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const sIdx = html.indexOf('<script id="computerRebuiltScript">');
const eIdx = html.indexOf('</script>', sIdx);
const scriptBody = html.slice(sIdx, eIdx);
const domHookIdx = scriptBody.indexOf('const overlay');
if (domHookIdx !== -1) {
  console.log(scriptBody.slice(domHookIdx));
} else {
  console.log(scriptBody.slice(scriptBody.length - 2500));
}

