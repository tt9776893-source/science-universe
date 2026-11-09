import fs from 'fs';
import path from 'path';

function searchSupabase(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'android' || entry.name === 'ios' || entry.name === 'www') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchSupabase(fullPath);
    } else if (/\.(html|js|json)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/supabase/i.test(content)) {
          console.log(`Supabase mention in: ${fullPath}`);
        }
      } catch(e){}
    }
  }
}

searchSupabase('.');

