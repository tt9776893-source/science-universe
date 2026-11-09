import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const checks = [
  '#aiOverlay', '#aiClose',
  '#chemOverlay', '#chemClose',
  '#engOverlay', '#engClose',
  '#bioOverlay', '#bioBack',
  '#computerOverlay', '#cExit',
  '#mathOverlay', '#mathBack',
  '#spaceExploreOverlay', '#seCloseBtn',
  '.pl', '.pl-back',
  '#suProfile', '#prClose', '#prCloseBottom',
  '#suLabDirectory', '#suDirectoryClose',
  '#suUnlockModal', '#suUnlockClose'
];

checks.forEach(sel => {
  const count = (html.match(new RegExp(sel.replace(/[.#]/, ''), 'g')) || []).length;
  console.log(`${sel}: ${count} occurrences`);
});

