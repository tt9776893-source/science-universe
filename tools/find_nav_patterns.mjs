import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

function findPatterns(name, re) {
  let m;
  console.log(`=== Matches for: ${name} ===`);
  while ((m = re.exec(html)) !== null) {
    console.log(`Pos ${m.index}: ${m[0].substring(0, 100)}`);
  }
}

findPatterns('popstate', /popstate[^;\n]+/g);
findPatterns('history', /history\.[a-zA-Z]+/g);
findPatterns('hash', /location\.hash[^;\n]*/g);
findPatterns('backButton', /backButton[^;\n]*/g);

