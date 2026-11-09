import fs from 'fs';

const content = fs.readFileSync('index.html', 'utf8');

const findSnippet = (str, len = 400) => {
  const idx = content.indexOf(str);
  if (idx === -1) return 'NOT FOUND: ' + str;
  return content.substring(idx, idx + len);
};

['id="computerOverlay"', 'id="chemOverlay"', 'id="engOverlay"', 'id="aiOverlay"', 'id="bioOverlay"'].forEach(id => {
  console.log('==================== ' + id + ' ====================');
  console.log(findSnippet(id, 600));
  console.log('\n');
});

