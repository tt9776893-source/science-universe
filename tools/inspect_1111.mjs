import fs from 'fs';

const html1111 = fs.readFileSync('science_universe_rotating_planet1111.html', 'utf8');

console.log('chemCard in 1111:', (html1111.match(/chemCard/g) || []).length);
console.log('chemLabRoot in 1111:', (html1111.match(/chemLabRoot/g) || []).length);
console.log('clBackBtn in 1111:', (html1111.match(/clBackBtn/g) || []).length);
console.log('chemOverlay in 1111:', (html1111.match(/chemOverlay/g) || []).length);
console.log('openChem in 1111:', (html1111.match(/openChem/g) || []).length);
console.log('closeChem in 1111:', (html1111.match(/closeChem/g) || []).length);

const pos1111 = html1111.indexOf('clBackBtn');
console.log('1111 context around clBackBtn:');
console.log(html1111.substring(pos1111 - 100, pos1111 + 300));

