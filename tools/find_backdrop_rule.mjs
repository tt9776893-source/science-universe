import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
  if (l.includes('su-profile-modal-backdrop')) {
    console.log(`Line ${i+1}: ${l}`);
  }
});

