import fs from 'fs';
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
for (let i = 8540; i < 8575; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}

