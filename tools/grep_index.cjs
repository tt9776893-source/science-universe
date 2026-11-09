const fs = require('fs');
const [,, file, pattern, max] = process.argv;
const re = new RegExp(pattern);
const lim = parseInt(max || '220', 10);
fs.readFileSync(file, 'utf8').split('\n').forEach((l, i) => {
  if (re.test(l)) console.log((i + 1) + ': ' + (l.length > lim ? l.slice(0, lim) + ' …' : l).trim());
});

