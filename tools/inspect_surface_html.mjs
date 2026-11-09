import fs from 'fs';

const surface = fs.readFileSync('sections/spacelab/surface.mjs', 'utf8');

console.log('=== surface.mjs html ===');
const m = surface.match(/export const html\s*=\s*`?([\s\S]*?)`?;/);
if (m) {
  console.log(m[1].substring(0, 1000));
} else {
  console.log(surface.substring(0, 1000));
}

