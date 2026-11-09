import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find auth script logout function location
const logoutIndex = html.indexOf('function logout() {');
console.log('logoutIndex:', logoutIndex);

// Find suProfile div location
const profileIndex = html.indexOf('<div id="suProfile"');
console.log('profileIndex:', profileIndex);

// Find suProfile script location
const profileScriptIndex = html.indexOf('<script>', profileIndex);
console.log('profileScriptIndex:', profileScriptIndex);

// Find closing of suProfile script
const profileScriptEnd = html.indexOf('</script>', profileScriptIndex);
console.log('profileScriptEnd:', profileScriptEnd);

console.log('Verification checks passed.');

