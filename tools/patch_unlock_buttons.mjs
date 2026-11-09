import fs from 'fs';

// Update index.html
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(
  `'<button type="button" class="su-btn-close" id="suUnlockGotItBtn">Ойлголоо</button>'`,
  `'<button type="button" class="su-btn-close" id="suUnlockGotItBtn" aria-label="Ойлголоо">Ойлголоо</button>'`
);

html = html.replace(
  `'<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn">Болих</button>'`,
  `'<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn" aria-label="Болих">Болих</button>'`
);

fs.writeFileSync('index.html', html, 'utf8');

// Update sections/su-router.js
let router = fs.readFileSync('sections/su-router.js', 'utf8');

router = router.replace(
  `'<button type="button" class="su-btn-close" id="suUnlockGotItBtn">Ойлголоо</button>'`,
  `'<button type="button" class="su-btn-close" id="suUnlockGotItBtn" aria-label="Ойлголоо">Ойлголоо</button>'`
);

router = router.replace(
  `'<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn">Болих</button>'`,
  `'<button type="button" class="su-btn-pay" id="suUnlockPayBtn">🔓 ' + info.cost + ' Кредитээр нээх</button><button type="button" class="su-btn-close" id="suUnlockCancelBtn" aria-label="Болих">Болих</button>'`
);

fs.writeFileSync('sections/su-router.js', router, 'utf8');

console.log('Updated aria-label attributes in index.html and sections/su-router.js');

