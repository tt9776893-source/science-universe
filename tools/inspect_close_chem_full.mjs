import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

const idxClose = script.indexOf('function closeChem');
console.log('--- closeChem & surrounding code (2500 chars) ---');
console.log(script.substring(idxClose - 500, idxClose + 2000));

