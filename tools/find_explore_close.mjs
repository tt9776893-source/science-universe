import fs from 'fs';
import path from 'path';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (f.endsWith('.js') || f.endsWith('.mjs')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, i) => {
        if (/close|back|exit|cancel/i.test(l) && /button|class|id|onclick|addEventListener/i.test(l)) {
          console.log(`${full} L${i+1}: ${l.trim().substring(0, 120)}`);
        }
      });
    }
  }
}

walk('sections/explore/src');

