import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Regex to match emojis
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;

const matches = [];
let match;
const counts = {};

while ((match = emojiRegex.exec(html)) !== null) {
  const emoji = match[0];
  counts[emoji] = (counts[emoji] || 0) + 1;
  if (matches.length < 50) {
    const idx = match.index;
    matches.push({
      emoji,
      idx,
      context: html.substring(Math.max(0, idx - 30), Math.min(html.length, idx + 40)).replace(/\n/g, ' ')
    });
  }
}

console.log('Total emoji occurrences:', Object.values(counts).reduce((a, b) => a + b, 0));
console.log('Unique emojis count:', Object.keys(counts).length);
console.log('Counts:', counts);
console.log('\nSample occurrences:');
matches.slice(0, 30).forEach(m => console.log(`${m.emoji} at ${m.idx}: ${m.context}`));

