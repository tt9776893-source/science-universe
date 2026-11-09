import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Look for raycast or click on cells in main lab 3D room
['chemCard', 'chemistry', 'openChem'].forEach(term => {
  let p = 0;
  while ((p = html.indexOf(term, p)) !== -1) {
    if ((p > 130000 && p < 150000) || (p > 500000 && p < 600000) || (p > 30000000 && p < 30500000)) {
      console.log(`Term ${term} at ${p}:`);
      console.log(html.substring(Math.max(0, p - 60), Math.min(html.length, p + 140)));
    }
    p += term.length;
  }
});

