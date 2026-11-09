import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

const p = html.indexOf('<script id="chemistry-3d-lab-script">');
const end = html.indexOf('</script>', p);
const script = html.substring(p, end);

const idx = script.indexOf('function startAnimation');
if (idx !== -1) {
  console.log(script.substring(idx, idx + 1000));
} else {
  const idx2 = script.indexOf('startAnimation =');
  if (idx2 !== -1) {
    console.log(script.substring(idx2 - 100, idx2 + 1000));
  } else {
    // search for requestAnimationFrame
    let r = 0;
    while ((r = script.indexOf('requestAnimationFrame', r)) !== -1) {
      console.log('requestAnimationFrame at', r);
      console.log(script.substring(r - 100, r + 400));
      r += 21;
    }
  }
}

