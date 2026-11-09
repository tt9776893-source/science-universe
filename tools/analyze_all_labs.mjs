import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectSection(id, label) {
  const start = html.indexOf(id);
  if (start === -1) {
    console.log(`[NOT FOUND] ${label}: ${id}`);
    return;
  }
  // Find opening tag
  const tagStart = html.lastIndexOf('<', start);
  const tagEnd = html.indexOf('>', start);
  const tagNameMatch = html.slice(tagStart + 1, tagEnd).match(/^([a-zA-Z0-9]+)/);
  const tagName = tagNameMatch ? tagNameMatch[1] : 'div';
  
  // Find closing tag roughly
  let closing = html.indexOf(`</${tagName}>`, start);
  let len = closing !== -1 ? (closing - tagStart + tagName.length + 3) : 2000;
  
  console.log(`\n=================== ${label} (${id}) ===================`);
  console.log(`Tag: <${tagName}>, Length: ${len}`);
  
  const content = html.slice(tagStart, tagStart + Math.min(len, 4000));
  // Print child tags and classes
  const classes = [...content.matchAll(/class="([^"]+)"/g)].map(m => m[1]);
  const ids = [...content.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  console.log('Top IDs:', ids.slice(0, 15));
  console.log('Top Classes:', [...new Set(classes.flatMap(c => c.split(/\s+/)))].slice(0, 25));
  console.log('First 600 chars:');
  console.log(content.slice(0, 600));
}

inspectSection('id="computerOverlay"', 'Computer Lab');
inspectSection('id="chemOverlay"', 'Chemistry Lab');
inspectSection('id="engOverlay"', 'Engineering Lab');
inspectSection('id="aiOverlay"', 'AI Lab');
inspectSection('id="bioOverlay"', 'Biology Lab');

// Physics
const plIdx = html.indexOf('class="pl"');
if (plIdx !== -1) {
  console.log('\n=================== Physics Lab (class="pl") ===================');
  const tagStart = html.lastIndexOf('<', plIdx);
  console.log(html.slice(tagStart, tagStart + 600));
} else {
  const plId = html.indexOf('id="pl"');
  console.log('plId:', plId);
}

