import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const regex = /backBtn\.(onclick|addEventListener)[^;\n]+/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(`Found: ${m[0]} at ${m.index}`);
}

