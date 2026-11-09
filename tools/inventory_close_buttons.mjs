import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Regex to find buttons, links, spans, divs with close/back/exit/хаах/буцах/x
const lines = html.split('\n');

const findings = [];

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const matchX = /[✕×✖✗]|>\s*[xX]\s*<|Хаах|Буцах|Болих|Гарах|Цуцлах|close|back|exit|dismiss/i.test(line);
  if (matchX) {
    // Check if it looks like an HTML tag or onclick or id/class
    if (/<(button|a|div|span|header|nav)[^>]*>/i.test(line) || /id=["'][^"']*(close|back|exit|cancel)[^"']*/i.test(line) || /onclick/i.test(line)) {
      findings.push({ lineNum, line: line.trim() });
    }
  }
});

console.log(`Found ${findings.length} potential close/back button elements or lines.`);
findings.forEach(f => {
  if (f.line.length < 200) {
    console.log(`L${f.lineNum}: ${f.line}`);
  } else {
    console.log(`L${f.lineNum}: ${f.line.substring(0, 180)}...`);
  }
});

