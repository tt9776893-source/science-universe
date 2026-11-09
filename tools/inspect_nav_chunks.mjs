import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('<script id="su-universal-overlay-manager">');
const navEnd = html.indexOf('</script>', navStart);
const navScript = html.substring(navStart, navEnd);

// Print getActiveLab, closeSingleOverlay, back, click listener
['function getActiveLab', 'function closeSingleOverlay', 'function back', 'if (btn.matches(\'#engClose'].forEach(name => {
  const p = navScript.indexOf(name);
  console.log(`\n=================== ${name} at ${p} ===================`);
  if (p !== -1) {
    console.log(navScript.substring(p, p + 1200));
  }
});

