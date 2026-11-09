import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find all elements with id or class containing overlay, modal, sheet, popup, dialog, drawer, screen
const elementRegex = /<([a-z0-9]+)\s+([^>]*?(?:id|class)=["'][^"']*(?:overlay|modal|sheet|popup|dialog|drawer|screen)[^"']*["'][^>]*?)>/gi;

let m;
const overlays = [];
while ((m = elementRegex.exec(html)) !== null) {
  const full = m[0];
  const tag = m[1];
  const attrs = m[2];
  const idMatch = attrs.match(/id=["']([^"']+)["']/i);
  const classMatch = attrs.match(/class=["']([^"']+)["']/i);
  overlays.push({
    tag,
    id: idMatch ? idMatch[1] : '',
    cls: classMatch ? classMatch[1] : '',
    index: m.index
  });
}

console.log(`Found ${overlays.length} overlay/modal/sheet/dialog elements:`);
overlays.forEach((o, i) => {
  console.log(`${i + 1}. <${o.tag}> id="${o.id}" class="${o.cls}"`);
});

