import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('chemCard count:', (html.match(/id=["']chemCard["']/g) || []).length);
console.log('chemistryCard count:', (html.match(/id=["']chemistryCard["']/g) || []).length);
console.log('chemOverlay count:', (html.match(/id=["']chemOverlay["']/g) || []).length);
console.log('chemLabRoot count:', (html.match(/id=["']chemLabRoot["']/g) || []).length);

// What happens in SU_NAV for Chemistry Lab?
const idxNav = html.indexOf('window.SU_NAV =');
console.log('--- SU_NAV definition excerpt ---');
console.log(html.substring(idxNav - 2000, idxNav + 1000));

