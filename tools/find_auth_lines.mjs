import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, i) => {
  if (line.includes('rf_session') || line.includes('pbkdf2') || line.includes('suAuthModal') || line.includes('su_users')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
});

