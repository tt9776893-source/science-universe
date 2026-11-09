import fs from 'fs';

const bak = fs.readFileSync('index.html.bak-close-buttons', 'utf8');
const cur = fs.readFileSync('index.html', 'utf8');

// 1. Compare CSS of .su-desk-center, #lab .hub, #lab .tilt, #lab .focus in bak
const bakCssStart = bak.indexOf('/* Desktop Dashboard Grid Composition */');
const bakCssEnd = bak.indexOf('/* Desktop Splash & Login Sheet */', bakCssStart);
console.log('=== BAK DESKTOP CENTER & HUB CSS ===');
const bakCss = bak.slice(bakCssStart, bakCssEnd);
const hubCssIdx = bakCss.indexOf('.su-desk-center');
console.log(bakCss.slice(hubCssIdx, hubCssIdx + 2200));

// 2. Check all 8 lab openers in cur
console.log('\n=== CHECKING ALL 8 LAB OPENERS IN index.html ===');
const lines = cur.split('\n');
lines.forEach((l, idx) => {
  if (
    l.includes('aiLabCard') ||
    l.includes('engineeringCard') ||
    l.includes('computerCard') ||
    l.includes('.cell.biology') ||
    l.includes('.cell.math') ||
    l.includes('.cell.physics') ||
    l.includes('spaceCard') ||
    l.includes('chemCard') ||
    l.includes('chemistryCard') ||
    l.includes('openAILab') ||
    l.includes('openEngLab') ||
    l.includes('openBioLab') ||
    l.includes('openComputerLab') ||
    l.includes('openMathLab') ||
    l.includes('openPhysics') ||
    l.includes('isSectionUnlocked') ||
    l.includes('showUnlockModal')
  ) {
    if (l.length < 600 || l.includes('addEventListener') || l.includes('onclick')) {
      console.log(`L${idx + 1}: ${l.trim().slice(0, 240)}`);
    }
  }
});

