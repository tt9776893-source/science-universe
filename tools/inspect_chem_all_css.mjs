import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const regex = /[^}]*(\.cl|#chemLabRoot)[^\{]*\{[^}]*\}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  if (m[0].includes('chemLabRoot') || m[0].includes('.cl{') || m[0].includes('.cl.') || m[0].includes('.cl-bar') || m[0].includes('.cl-back')) {
    console.log(m[0].trim());
  }
}

