import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const cells = ['.cell.engineering', '.cell.biology', '.cell.bio', '.cell.math', '.cell.chem', '.cell.ai', '.cell.computer'];
cells.forEach(c => {
  let pos = 0;
  let matches = [];
  while ((pos = html.indexOf(c, pos)) !== -1) {
    matches.push(pos);
    pos += c.length;
  }
  console.log(`${c}: ${matches.length} matches`);
  if (matches.length > 0) {
    const p = matches[0];
    console.log(html.slice(Math.max(0, p - 60), Math.min(p + 150, html.length)).replace(/\n/g, ' '));
  }
});

