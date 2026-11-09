import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

const idx = script.indexOf('// Open Chemistry Lab');
console.log(script.substring(idx - 100, idx + 1600));

