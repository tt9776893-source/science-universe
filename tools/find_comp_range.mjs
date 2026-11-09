import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const start = html.indexOf('<section aria-hidden="true" aria-label="Компьютерын шинжлэх ухаан" id="computerOverlay">');
console.log('start:', start);
const end = html.indexOf('</section>', start) + '</section>'.length;
console.log('end:', end);
console.log('total length of section:', end - start);

