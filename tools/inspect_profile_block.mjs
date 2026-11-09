import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const profileIndex = html.indexOf('<div id="suProfile"');
const profileScriptEnd = html.indexOf('</script>', html.indexOf('<script>', profileIndex)) + 9;

console.log('Profile block total length:', profileScriptEnd - profileIndex);
console.log('First 400 chars:\n', html.substring(profileIndex, profileIndex + 400));
console.log('\nLast 400 chars:\n', html.substring(profileScriptEnd - 400, profileScriptEnd));

