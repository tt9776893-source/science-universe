import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const targets = [
  { name: 'back (Auth sheet)', pattern: 'id="back"' },
  { name: 'prClose', pattern: 'id="prClose"' },
  { name: 'prCloseBottom', pattern: 'id="prCloseBottom"' },
  { name: 'prCancelEdit', pattern: 'id="prCancelEdit"' },
  { name: 'suSwitchCancel', pattern: 'id="suSwitchCancel"' },
  { name: 'suLogoutCancel', pattern: 'id="suLogoutCancel"' },
  { name: 'suDirectoryClose', pattern: 'id="suDirectoryClose"' },
  { name: 'suUnlockClose', pattern: 'id="suUnlockClose"' },
  { name: 'aiClose', pattern: 'id="aiClose"' },
  { name: 'chemClose', pattern: 'id="chemClose"' },
  { name: 'clBackBtn', pattern: 'id="clBackBtn"' },
  { name: 'clSpeedClose', pattern: 'id="clSpeedClose"' },
  { name: 'engClose', pattern: 'id="engClose"' },
  { name: 'engBackHome', pattern: 'id="engBackHome"' },
  { name: 'bioBack', pattern: 'id="bioBack"' },
  { name: 'cExit', pattern: 'id="cExit"' },
  { name: 'cReaderBack', pattern: 'id="cReaderBack"' },
  { name: 'mathBack', pattern: 'id="mathBack"' },
  { name: 'pl-back', pattern: 'class="pl-back"' },
  { name: 'plDialogClose', pattern: 'id="plDialogClose"' },
  { name: 'plSpeedClose', pattern: 'id="plSpeedClose"' },
  { name: 'seCloseBtn', pattern: 'id="seCloseBtn"' }
];

targets.forEach(t => {
  const idx = html.indexOf(t.pattern);
  if (idx !== -1) {
    const snippet = html.substring(Math.max(0, idx - 40), Math.min(html.length, idx + 120)).replace(/\n/g, ' ');
    console.log(`[OK] ${t.name}: ${snippet}`);
  } else {
    console.log(`[MISSING] ${t.name}: pattern "${t.pattern}" not found!`);
  }
});

