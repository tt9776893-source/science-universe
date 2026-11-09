import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('id="chemLabRoot"');
// Look for comments like <!-- ===== after p
const nextComment = html.indexOf('<!-- =====', p + 100);
console.log('Next major section after chemLabRoot at:', nextComment);
if (nextComment !== -1) {
  console.log(html.substring(nextComment - 300, nextComment + 300));
}

