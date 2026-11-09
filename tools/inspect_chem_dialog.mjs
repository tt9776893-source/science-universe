import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

const idx = script.indexOf('function closeDialog');
console.log('closeDialog in chem script:');
if (idx !== -1) {
  console.log(script.substring(idx, idx + 500));
} else {
  let d = 0;
  while ((d = script.indexOf('cl-dialog', d)) !== -1) {
    console.log('cl-dialog at', d);
    console.log(script.substring(d - 50, d + 200));
    d += 9;
  }
}
