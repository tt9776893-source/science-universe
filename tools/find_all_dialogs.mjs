import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const overlayRegex = /<(div|section|aside)[^>]*(?:id="([^"]*overlay[^"]*|[^"]*modal[^"]*|[^"]*dialog[^"]*)"|role="dialog")[^>]*>/gi;
let m;
while ((m = overlayRegex.exec(html)) !== null) {
  console.log(`Found overlay at ${m.index}:`);
  console.log(' ', m[0]);
}

