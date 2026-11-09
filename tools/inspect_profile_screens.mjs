import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function printScreens() {
  const idx = html.indexOf('id="suProfile"');
  const endIdx = html.indexOf('</div>\n</div>\n\n<style>\n/* --- PROFILE MODAL', idx);
  console.log(html.substring(idx, idx + 4000));
}

printScreens();

