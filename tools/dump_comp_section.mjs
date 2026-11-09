import fs from 'fs';
const content = fs.readFileSync('index.html', 'utf8');

const sectionStart = content.lastIndexOf('<section', content.indexOf('id="computerOverlay"'));
const sectionEnd = content.indexOf('</section>', sectionStart) + '</section>'.length;

fs.writeFileSync('tools/comp_section.html', content.substring(sectionStart, sectionEnd), 'utf8');
console.log('Saved computer section HTML to tools/comp_section.html');
console.log('Length:', sectionEnd - sectionStart);

