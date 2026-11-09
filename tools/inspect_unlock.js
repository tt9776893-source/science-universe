const fs = require('fs');
const readline = require('readline');

async function extractRange(start, end) {
  const fileStream = fs.createReadStream('index.html');
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (lineNum >= start && lineNum <= end) {
      console.log(lineNum + ': ' + line);
    }
  }
}
extractRange(18135, 18195);
