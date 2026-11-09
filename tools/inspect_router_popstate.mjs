import fs from 'fs';

const router = fs.readFileSync('sections/su-router.js', 'utf8');

const popIdx = router.indexOf('popstate');
console.log('=== In su-router.js around popstate ===');
if (popIdx !== -1) {
  console.log(router.substring(popIdx - 300, popIdx + 400));
}

