import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const idx = html.indexOf("function card(id,c,c2,g,bg,ic,t,sub)");
console.log(html.slice(idx - 1500, idx));

