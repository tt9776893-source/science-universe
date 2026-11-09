import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function findUnlockLogic() {
  let idx = 0;
  console.log(`=== Matches for: suUnlockModal ===`);
  while ((idx = html.indexOf('suUnlockModal', idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 500);
    console.log(`--- At ${idx} ---`);
    console.log(html.substring(start, end));
    idx += 13;
  }
}

findUnlockLogic();

