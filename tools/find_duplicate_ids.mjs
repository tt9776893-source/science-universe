import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find all id="..." in index.html
const idRegex = /\bid=["']([^"']+)["']/g;
const idCounts = {};
let m;

while ((m = idRegex.exec(html)) !== null) {
  const id = m[1];
  idCounts[id] = (idCounts[id] || 0) + 1;
}

const duplicates = Object.keys(idCounts).filter(id => idCounts[id] > 1);
console.log(`Found ${duplicates.length} duplicate IDs:`);
duplicates.forEach(id => {
  console.log(`  - "${id}": ${idCounts[id]} times`);
});

