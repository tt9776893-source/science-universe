import fs from 'fs';

const comp = fs.readFileSync('tools/comp_section.html', 'utf8');
console.log(comp.slice(2500));

