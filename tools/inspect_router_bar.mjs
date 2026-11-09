import fs from 'fs';

const router = fs.readFileSync('sections/su-router.js', 'utf8');

console.log(router.substring(router.length - 2500));

