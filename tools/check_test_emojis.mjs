import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('tools').filter(f => f.startsWith('test_') || f.startsWith('verify_'));

files.forEach(f => {
  const content = fs.readFileSync(path.join('tools', f), 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('emoji') || l.includes('icon') || l.includes('🌟') || l.includes('👤') || l.includes('🔥') || l.includes('🧪')) {
      console.log(`${f}:${i + 1}: ${l}`);
    }
  });
});

