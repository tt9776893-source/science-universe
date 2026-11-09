const fs = require('fs');
const [,, file, a, b, max] = process.argv;
const lines = fs.readFileSync(file, 'utf8').split('\n');
const lim = parseInt(max || '400', 10);
for (let i = parseInt(a, 10); i <= parseInt(b, 10) && i <= lines.length; i++) {
  const l = lines[i - 1];
  console.log(i + ': ' + (l.length > lim ? l.slice(0, lim) + ' …[' + l.length + ' chars]' : l));
}

