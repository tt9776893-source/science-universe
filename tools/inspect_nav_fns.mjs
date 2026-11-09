import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('id="su-universal-overlay-manager"');
const navEnd = html.indexOf('</script>', navStart);
const navScript = html.substring(navStart, navEnd);

['closeComponent', 'closeSingleOverlay', 'getActiveLab', 'back'].forEach(name => {
  const p = navScript.indexOf(name);
  console.log(`\n=== Function/Variable: ${name} (at offset ${p}) ===`);
  if (p !== -1) {
    console.log(navScript.substring(p, p + 600));
  }
});

