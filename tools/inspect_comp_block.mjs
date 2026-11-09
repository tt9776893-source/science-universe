import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

// Find style for computerOverlay
const startStyle = content.lastIndexOf('<style', content.indexOf('id="computerOverlay"'));
const endStyle = content.indexOf('</style>', startStyle);

console.log('Computer style tag from', startStyle, 'to', endStyle);
console.log(content.substring(startStyle, startStyle + 500));

const sectionStart = content.indexOf('id="computerOverlay"');
const sectionTagStart = content.lastIndexOf('<section', sectionStart);
const sectionEnd = content.indexOf('</section>', sectionStart) + '</section>'.length;

console.log('Computer section from', sectionTagStart, 'to', sectionEnd);
console.log(content.substring(sectionTagStart, sectionTagStart + 500));

