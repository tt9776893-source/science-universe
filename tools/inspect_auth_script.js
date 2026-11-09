const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const startMarker = "/* ЖИНХЭНЭ АППАД: сервер кодыг өөрөө үүсгэж, и-мэйлээр илгээж, өөрөө шалгана. Энд код DEMO болгон харагдана. */";
const idx = content.indexOf(startMarker);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 2500));
}
