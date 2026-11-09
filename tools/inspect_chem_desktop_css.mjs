import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

['@media', 'chemLabRoot', 'cl-body', 'cl-3d-box'].forEach(term => {
  let p = 0;
  while ((p = html.indexOf(term, p)) !== -1) {
    if (p < 100000) {
      console.log(`Term ${term} at ${p}:`);
      console.log(html.substring(Math.max(0, p - 40), Math.min(html.length, p + 160)));
    }
    p += term.length;
  }
});

