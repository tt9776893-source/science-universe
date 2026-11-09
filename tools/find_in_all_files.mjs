import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'android' || entry.name === 'ios') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath);
    } else if (/\.(html|js|json)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/muhammed|ermurat/i.test(content)) {
          console.log(`Found in: ${fullPath}`);
        }
      } catch(e){}
    }
  }
}

searchDir('.');

