import fs from 'fs';

const routerJs = fs.readFileSync('sections/su-router.js', 'utf8');
console.log('Router JS length:', routerJs.length);
console.log(routerJs.slice(0, 3000));

