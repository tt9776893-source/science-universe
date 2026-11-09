const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const sheetIndex = content.indexOf('id="sheet"');
console.log('sheet position in index.html:');
console.log(content.slice(sheetIndex - 120, sheetIndex + 300));

