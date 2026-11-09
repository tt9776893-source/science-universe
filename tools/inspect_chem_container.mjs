import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('id="chemLabRoot"');
// Look backwards for tags
let depth = 0;
let pos = p;
while (pos > 0) {
  const lastClose = html.lastIndexOf('</div>', pos);
  const lastOpen = html.lastIndexOf('<div', pos);
  if (lastClose > lastOpen) {
    depth++;
    pos = lastClose - 1;
  } else if (lastOpen > -1) {
    if (depth === 0) {
      console.log('chemLabRoot is inside or sibling of div at', lastOpen);
      console.log(html.substring(lastOpen, lastOpen + 120));
      break;
    }
    depth--;
    pos = lastOpen - 1;
  } else {
    break;
  }
}

