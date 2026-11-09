import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const regex = /\.c-shell[^{]*\{[^}]*\}/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match[0]);
}

