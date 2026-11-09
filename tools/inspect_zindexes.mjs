import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

['.phone{', '#desktopDashboardGrid', '#chemOverlay', '#bioOverlay', '#engOverlay', '#plOverlay'].forEach(s => {
  const p = html.indexOf(s);
  if (p !== -1) {
    console.log(`=== ${s} at ${p} ===`);
    console.log(html.substring(p, p + 250));
  }
});

