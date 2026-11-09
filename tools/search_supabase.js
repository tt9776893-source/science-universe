const fs = require('fs');
const path = require('path');

function searchAllFiles(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'android', 'ios', '.git', 'www', 'tools'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      searchAllFiles(full);
    } else if (/\.(html|js|json|ts|env|sql|md|txt)$/i.test(item.name)) {
      try {
        const txt = fs.readFileSync(full, 'utf8');
        if (/supabase/i.test(txt)) {
          console.log('FOUND SUPABASE IN:', full);
        }
      } catch(e) {}
    }
  }
}
searchAllFiles('.');
console.log('Search complete.');
