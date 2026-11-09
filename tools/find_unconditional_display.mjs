import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const overlays = [
  'mathOverlay',
  'computerOverlay',
  'chemOverlay',
  'engOverlay',
  'aiOverlay',
  'bioOverlay',
  'spaceExploreOverlay',
  'suProfile',
  'suLabDirectory'
];

overlays.forEach(id => {
  const regex = new RegExp(`(#${id}[^{,]*)(?:,|\\{)([^}]+)\\}`, 'g');
  let m;
  while ((m = regex.exec(html)) !== null) {
    const sel = m[1].trim();
    const body = m[2];
    if (body.includes('display:') && !body.includes('display: none') && !body.includes('display:none')) {
      if (!sel.includes('.on') && !sel.includes('.open') && !sel.includes('.eng-on') && !sel.includes(' ') && !sel.includes('>')) {
        console.log(`[DANGER] ${id} has unconditional visible display:`);
        console.log(`  Selector: "${sel}"`);
        console.log(`  Rule: ${body.trim().slice(0, 100)}`);
      }
    }
  }
});

