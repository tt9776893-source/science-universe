import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const navStart = html.indexOf('SCIENCE UNIVERSE — CENTRALIZED NAVIGATION CONTROLLER');
console.log('--- Navigation Controller Code (first 3000 chars) ---');
console.log(html.substring(navStart, navStart + 3000));

console.log('--- Navigation Controller Code (next 3000 chars) ---');
console.log(html.substring(navStart + 3000, navStart + 6000));

