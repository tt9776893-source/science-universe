import fs from 'fs';

function grep(filename, re) {
  const code = fs.readFileSync(filename, 'utf8');
  const matches = [];
  code.split('\n').forEach((line, i) => {
    if (re.test(line)) matches.push(`${i+1}: ${line.trim()}`);
  });
  return matches;
}

console.log('--- test_onboarding_and_auth.mjs ---');
console.log(grep('tools/test_onboarding_and_auth.mjs', /lab|hub|ring/i).join('\n'));

console.log('--- test_close_and_navigation.mjs ---');
console.log(grep('tools/test_close_and_navigation.mjs', /lab|hub|ring/i).join('\n'));

console.log('--- verify_all_labs.mjs ---');
console.log(grep('tools/verify_all_labs.mjs', /lab|hub|ring/i).join('\n'));

