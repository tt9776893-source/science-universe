const fs = require('fs');

const original = fs.readFileSync('index.html', 'utf8');

const endSnippet = `/* Өмнөх сессийг сэргээх */
const saved=store.get('sessionStorage','rf_session')||store.get('localStorage','rf_session');
if(saved&&getUsers()[saved])showLab(saved,getUsers()[saved]);
})();
</script>`;

const idx = original.indexOf(endSnippet);
console.log('Region D end match:', idx !== -1);
if (idx !== -1) {
  console.log('Snippet length:', endSnippet.length);
}
