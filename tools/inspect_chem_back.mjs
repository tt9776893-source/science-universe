import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function searchAround(start, length = 1200) {
  const idx = html.indexOf('const backBtn = document.getElementById(\'clBackBtn\');');
  if (idx !== -1) {
    console.log(html.substring(idx, idx + length));
  }
}

searchAround();

