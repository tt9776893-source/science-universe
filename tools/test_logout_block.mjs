import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const logoutIndex = html.indexOf('function logout() {');
console.log(html.substring(logoutIndex - 100, logoutIndex + 800));

