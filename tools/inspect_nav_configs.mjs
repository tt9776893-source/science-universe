import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('<script id="su-universal-overlay-manager">');
const navEnd = html.indexOf('</script>', navStart);
const navScript = html.substring(navStart, navEnd);

console.log('Total navScript length:', navScript.length);
// Let's print OVERLAY_CONFIGS
const ovIdx = navScript.indexOf('const OVERLAY_CONFIGS');
console.log('--- OVERLAY_CONFIGS ---');
console.log(navScript.substring(ovIdx, ovIdx + 1100));

