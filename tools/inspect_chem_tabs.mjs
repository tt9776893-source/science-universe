import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

const idx = script.indexOf('clTabs.forEach');
console.log('Tab switching logic:');
console.log(script.substring(idx, idx + 1000));

