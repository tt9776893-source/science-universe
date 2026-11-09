import fs from 'fs';
import path from 'path';

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build' || file === 'android' || file === 'ios' || file === '_original_backup' || file === 'SCIENCE_UNIVERSE_PROJECT_BACKUP' || file === 'REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED') {
      continue;
    }
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, fileList);
    } else if (/\.(html|js|mjs)$/i.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = walk('.');
console.log('Total files found:', allFiles.length);

const results = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    // Check for close patterns
    if (/[✕×✖✗]|>\s*[xX]\s*<|Хаах|Буцах|Болих|Гарах|Цуцлах|aria-label=["'](close|Хаах|Буцах)["']|class=["'][^"']*(close|back|exit|cancel)[^"']*|id=["'][^"']*(close|back|exit|cancel)[^"']*/i.test(l)) {
      results.push({
        file,
        lineNum: idx + 1,
        line: l.trim().substring(0, 140)
      });
    }
  });
}

console.log(`Found ${results.length} matching lines across ${allFiles.length} files.`);

// Group by file
const byFile = {};
results.forEach(r => {
  byFile[r.file] = (byFile[r.file] || 0) + 1;
});
console.log('Matches by file:', byFile);

