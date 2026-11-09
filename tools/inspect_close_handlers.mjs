import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const closeButtons = [
  'aiClose',
  'chemClose',
  'engClose',
  'bioBack',
  'cExit',
  'mathBack',
  'seCloseBtn',
  'suDirectoryClose',
  'suUnlockClose'
];

closeButtons.forEach(btnId => {
  console.log(`\n=================== ${btnId} ===================`);
  let pos = 0;
  while ((pos = html.indexOf(btnId, pos)) !== -1) {
    console.log(`Match at ${pos}:`);
    console.log(html.slice(Math.max(0, pos - 100), Math.min(pos + 250, html.length)).replace(/\n/g, ' '));
    pos += btnId.length;
  }
});

