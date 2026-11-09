import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function findDups(id) {
  let idx = 0;
  console.log(`=== Matches for id="${id}" ===`);
  while ((idx = html.indexOf(`id="${id}"`, idx)) !== -1) {
    console.log(html.substring(Math.max(0, idx - 60), Math.min(html.length, idx + 100)));
    idx += id.length + 5;
  }
}

findDups('toast');
findDups('hint');
findDups('fb');

