import fs from 'fs';

const html = fs.readFileSync('science_universe_rotating_planet1111.html', 'utf8');
const pStart = html.indexOf('<div id="suProfile"');
const pEnd = html.indexOf('</script>', html.indexOf('<script>', pStart)) + 9;

console.log('Original reference Profile snippet length:', pEnd - pStart);
console.log(html.substring(pStart, pStart + 4000));

