import fs from 'fs';

const comp = fs.readFileSync('tools/comp_section.html', 'utf8');
console.log('Comp HTML length:', comp.length);
console.log(comp.slice(0, 2500));

