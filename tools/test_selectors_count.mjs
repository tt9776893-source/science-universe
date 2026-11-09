import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const closeBtnSelectors = [
  '#aiClose',
  '#chemClose',
  '#clBackBtn',
  '#clSpeedClose',
  '#engClose',
  '#engBackHome',
  '#bioBack',
  '#cExit',
  '#cReaderBack',
  '#mathBack',
  '.pl-back',
  '#plDialogClose',
  '#plSpeedClose',
  '#seCloseBtn',
  '#prClose',
  '#prCloseBottom',
  '[data-prback]',
  '#prCancelEdit',
  '#suSwitchCancel',
  '#suLogoutCancel',
  '#suDirectoryClose',
  '#suUnlockClose',
  '#suUnlockCancelBtn',
  '#suUnlockGotItBtn',
  '#back'
];

console.log('Close buttons count:', closeBtnSelectors.length);

