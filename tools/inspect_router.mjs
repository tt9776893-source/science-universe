import fs from 'fs';

const router = fs.readFileSync('sections/su-router.js', 'utf8');

console.log('=== su-router.js ===');
console.log(router.substring(0, 3000));

