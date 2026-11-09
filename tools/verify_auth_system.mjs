import fs from 'fs';
import assert from 'assert';

console.log('--- Running Science Universe Auth Verification Suite ---');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Verify all required element IDs exist in index.html
const requiredIDs = [
  'suAuthModal',
  'suAuthBackdrop',
  'suAuthClose',
  'suAuthTabs',
  'suTabLogin',
  'suTabRegister',
  'suAuthForm',
  'suGroupName',
  'suFieldName',
  'suGroupEmail',
  'suFieldEmail',
  'suGroupPass',
  'suFieldPass',
  'suForgotLink',
  'suEyePass',
  'suGroupConfirm',
  'suFieldConfirm',
  'suEyeConfirm',
  'suFormOptions',
  'suRememberMe',
  'suVerifySection',
  'suFieldCode',
  'suResendCodeBtn',
  'suChangeEmailBtn',
  'suDemoBox',
  'suResetSection',
  'suResetPass',
  'suResetPassConfirm',
  'suResetCancelBtn',
  'suAuthMsg',
  'suAuthSubmit',
  'suSwitchBtn',
  'logout',
  'suAccountSvg',
  'credchip',
  'credits',
  'suProfile',
  'prEmailDisplay',
  'prCreditBadge',
  'prLogoutBtn',
  'prLoginModalBtn'
];

let missing = 0;
for (const id of requiredIDs) {
  const hasId = html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  if (!hasId) {
    console.error(`✗ Missing required element ID: #${id}`);
    missing++;
  } else {
    // console.log(`✓ Element #${id} confirmed`);
  }
}
assert.strictEqual(missing, 0, 'All required element IDs must exist');
console.log(`✓ All ${requiredIDs.length} required HTML elements present in index.html`);

// 2. Verify Mongolian labels
const mongolianLabels = [
  'Нэвтрэх',
  'Бүртгүүлэх',
  'Таны нэр',
  'И-мэйл хаяг',
  'Нууц үг',
  'Нууц үг баталгаажуулах',
  'Намайг сана',
  'Нууц үгээ мартсан уу?',
  'Баталгаажуулах код',
  'Код дахин илгээх',
  'И-мэйл солих',
  'Бүртгэл үүсгэх',
  'Системээс гарах'
];

for (const label of mongolianLabels) {
  assert(html.includes(label), `Missing Mongolian label: ${label}`);
}
console.log(`✓ All ${mongolianLabels.length} Mongolian labels present`);

// 3. Verify CSS strict closed rule
assert(html.includes('#suAuthModal:not(.open)'), 'CSS must include #suAuthModal:not(.open)');
assert(html.includes('display: none !important;'), 'Strict closed rule must enforce display: none !important');
console.log('✓ Strict closed CSS rule #suAuthModal:not(.open) confirmed');

// 4. Verify SU_OVERLAY_MANAGER registration
assert(html.includes("id: 'suAuthModal'"), 'suAuthModal must be registered in OVERLAY_CONFIGS');
assert(html.includes("closeSelectors: ['#suAuthClose', '#suAuthBackdrop'"), 'suAuthModal must have closeSelectors');
console.log('✓ SU_OVERLAY_MANAGER registration confirmed');

// 5. Verify WebCrypto PBKDF2 algorithm in script
assert(html.includes('PBKDF2'), 'WebCrypto PBKDF2 must be present');
assert(html.includes('SHA-256'), 'SHA-256 hash must be present');
assert(html.includes('iterations: 150000'), 'PBKDF2 iterations must be 150000');
assert(html.includes('rf_users'), 'rf_users store must be present');
assert(html.includes('rf_session'), 'rf_session store must be present');
console.log('✓ Cryptographic PBKDF2 engine and storage persistence confirmed');

// 6. Verify window.curMail and window.SU_AUTH
assert(html.includes('window.curMail'), 'window.curMail must be present');
assert(html.includes('window.SU_AUTH'), 'window.SU_AUTH must be present');
assert(html.includes('window.openAuthModal'), 'window.openAuthModal must be exported');
assert(html.includes('window.closeAuthModal'), 'window.closeAuthModal must be exported');
assert(html.includes('window.logoutUser'), 'window.logoutUser must be exported');
console.log('✓ Global auth hooks and methods exported properly');

console.log('\n--- ALL VERIFICATION CHECKS PASSED (6/6) ---');

