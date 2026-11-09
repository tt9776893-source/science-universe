import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Search for tile click handlers or quick actions related to chem
['chemCard', 'openChem', 'openChemLab', 'chemistry'].forEach(word => {
  let p = 0;
  while ((p = html.indexOf(word, p)) !== -1) {
    if (p > 53000000 || (p > 200000 && p < 400000) || (p > 30000000 && p < 31000000)) {
      console.log(`Match for ${word} at ${p}:`);
      console.log(html.substring(Math.max(0, p - 60), Math.min(html.length, p + 140)));
    }
    p += word.length;
  }
});

