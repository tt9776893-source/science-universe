import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const queries = [
  'chemOverlay', 'ch-head', 'ch-cinema', 'ch-tabs', 'ch-panel',
  'engOverlay', 'eng-wrap', 'eng-top', 'eng-tabs', 'eng-panel',
  'aiOverlay', 'ai-top', 'ai-box', 'ai-tabs', 'ai-panel',
  'bioOverlay', 'bio-wrap', 'bio-head', 'bio-tabs', 'bio-panel'
];

queries.forEach(q => {
  const matches = [...html.matchAll(new RegExp(`(?:querySelector|getElementById|getElementsByClassName|children)[^;\\n]*${q}`, 'g'))];
  if (matches.length > 0) {
    console.log(`\nMatches for ${q}:`);
    matches.forEach(m => console.log('  ', m[0].slice(0, 120)));
  }
});

