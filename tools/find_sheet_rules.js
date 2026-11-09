const fs = require('fs');
const readline = require('readline');

async function findSheetRules() {
  const fileStream = fs.createReadStream('index.html');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (/\.sheet\b/.test(line)) {
      console.log(lineNum + ': ' + line.trim().slice(0, 140));
    }
  }
}
findSheetRules();

