import fs from 'fs';

const surface = fs.readFileSync('sections/spacelab/surface.mjs', 'utf8');

const regex = /<button[\s\S]*?<\/button>|\.onclick\s*=\s*[^;\n]+/g;
let m;
while ((m = regex.exec(surface)) !== null) {
  console.log(`Found: ${m[0]}`);
}

