const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

function find(str) {
  const idx = content.indexOf(str);
  if (idx !== -1) {
    const line = content.slice(0, idx).split('\n').length;
    console.log(`Found "${str.slice(0, 40)}" at line ${line}`);
    return { idx, line };
  } else {
    console.log(`NOT found: "${str.slice(0, 40)}"`);
    return null;
  }
}

find('<style id="su-auth-styles">');
find('<div id="suAuthModal"');
find('<section aria-label="Нэвтрэх" class="sheet" id="sheet"');
find('/* Main Lab Mobile View */');
find('/* Spacious, Immersive Desktop Main Lab */');

