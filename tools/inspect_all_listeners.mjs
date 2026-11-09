import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function inspectListener(btnId) {
  let idx = 0;
  console.log(`\n=================== Listeners for: ${btnId} ===================`);
  while ((idx = html.indexOf(btnId, idx)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(html.length, idx + 250);
    const snip = html.substring(start, end).replace(/\n/g, ' ');
    if (snip.includes('addEventListener') || snip.includes('onclick') || snip.includes('.click(')) {
      console.log(`[Pos ${idx}] ${snip}`);
    }
    idx += btnId.length;
  }
}

inspectListener('aiClose');
inspectListener('chemClose');
inspectListener('clBackBtn');
inspectListener('bioBack');
inspectListener('cExit');
inspectListener('cReaderBack');
inspectListener('mathBack');
inspectListener('seCloseBtn');
inspectListener('suDirectoryClose');
inspectListener('suUnlockClose');

