const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// Find all occurrences of rf_users or rf_session
let matches = [];
let regex = /rf_users|rf_session|curMail/g;
let match;
while ((match = regex.exec(content)) !== null) {
  matches.push({ index: match.index, word: match[0] });
}
console.log('Total matches:', matches.length);
matches.forEach(m => {
  const line = content.slice(0, m.index).split('\n').length;
  console.log(`Line ${line}: ${m.word}`);
});

