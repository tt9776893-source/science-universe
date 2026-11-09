import fs from 'fs';

const testFile = fs.readFileSync('tools/test_desktop_dashboard.mjs', 'utf8');
console.log(testFile);

