import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const labs = [
  { name: 'Computer Lab', id: 'computerOverlay', styleNeedle: '#computerRebuiltStyle' },
  { name: 'Chemistry Lab', id: 'chemOverlay', styleNeedle: '#chemOverlay' },
  { name: 'Engineering Lab', id: 'engOverlay', styleNeedle: '#engOverlay' },
  { name: 'AI Lab', id: 'aiOverlay', styleNeedle: '#aiOverlay' },
  { name: 'Biology Lab', id: 'bioOverlay', styleNeedle: '#bioOverlay' },
  { name: 'Physics Lab', id: 'pl', styleNeedle: '.pl' }
];

labs.forEach(lab => {
  console.log(`\n=================== ${lab.name} ===================`);
  let idIdx = html.indexOf(`id="${lab.id}"`);
  if (idIdx === -1) idIdx = html.indexOf(`class="${lab.id}"`);
  if (idIdx === -1) idIdx = html.indexOf(lab.id);
  console.log(`HTML found at ${idIdx}:`);
  if (idIdx !== -1) {
    console.log(html.slice(idIdx - 10, idIdx + 450).replace(/\n/g, ' '));
  }
  
  let sIdx = html.indexOf(lab.styleNeedle);
  console.log(`CSS found at ${sIdx}:`);
  if (sIdx !== -1) {
    console.log(html.slice(sIdx, sIdx + 450).replace(/\n/g, ' '));
  }
});

