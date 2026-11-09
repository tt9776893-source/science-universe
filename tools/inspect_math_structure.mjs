import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const mathStart = html.indexOf('id="mathOverlay"');
console.log('mathStart:', mathStart);
if (mathStart !== -1) {
  const mathEnd = html.indexOf('</section>', mathStart);
  console.log('--- Math HTML head ---');
  console.log(html.slice(mathStart - 20, mathStart + 2200));
}

// Find math CSS
const cssMatch = html.match(/(\/\* ===+ MATH LAB[\s\S]*?)(<\/style>|\/\* ===)/);
if (cssMatch) {
  console.log('--- Math CSS preview ---');
  console.log(cssMatch[1].slice(0, 1500));
} else {
  // Search for m-shell or mathOverlay in style tags
  const idx = html.indexOf('#mathOverlay');
  console.log('mathOverlay in CSS at:', idx);
  console.log(html.slice(idx, idx + 1500));
}

