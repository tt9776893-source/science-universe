import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Region A: Top-right button (#logout)
const oldLogoutBtn = `<button aria-label="Гарах" class="gear" id="logout" type="button"><svg fill="none" height="22" stroke="#dfe6ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewbox="0 0 24 24" width="22"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path></svg></button>`;

const newLogoutBtn = `<button aria-label="Нэвтрэх / Бүртгүүлэх" class="gear su-account-btn" id="logout" type="button" title="Нэвтрэх / Бүртгүүлэх"><svg id="suAccountSvg" fill="none" height="22" stroke="#dfe6ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></button>`;

if (!html.includes(oldLogoutBtn)) {
  console.error('Failed to locate oldLogoutBtn in index.html');
  process.exit(1);
}
html = html.replace(oldLogoutBtn, newLogoutBtn);
console.log('✓ Region A (#logout button) updated');

// 2. Insert Auth Modal CSS and HTML right above #suProfile
const authModalCSS = `
<style id="su-auth-styles">
/* ===== SCIENCE UNIVERSE AUTH MODAL STYLING ===== */
#suAuthModal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 2147483400;
  align-items: center;
  justify-content: center;
  padding: max(16px, env(safe-area-inset-top, 16px)) 16px max(24px, env(safe-area-inset-bottom, 24px));
  box-sizing: border-box;
  font-family: var(--body, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}
#suAuthModal.open {
  display: flex !important;
}
#suAuthModal:not(.open) {
  display: none !important;
  pointer-events: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  z-index: -1 !important;
}
.su-auth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 20, 0.84);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  z-index: 1;
}
.su-auth-container {
  position: relative;
  z-index: 2;
  width: min(440px, 100%);
  margin: auto;
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 24px;
}
.su-auth-card {
  background: linear-gradient(165deg, #0e172e 0%, #070d1e 100%);
  border: 1px solid rgba(110, 160, 255, 0.3);
  border-radius: 24px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.9), 0 0 45px rgba(78, 120, 255, 0.22);
  padding: 26px 24px;
  color: #eaf0ff;
  box-sizing: border-box;
}
.su-auth-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.su-auth-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.su-auth-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: radial-gradient(circle at 35% 30%, #5179e8, #162447);
  border: 1px solid rgba(130, 180, 255, 0.45);
  box-shadow: 0 0 15px rgba(81, 121, 232, 0.45);
  display: grid;
  place-items: center;
  font-size: 22px;
  flex-shrink: 0;
}
.su-auth-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin: 0;
  color: #fff;
}
.su-auth-title b {
  color: #7ea2ff;
  font-weight: 900;
}
.su-auth-subtitle {
  font-size: 12px;
  color: #9cb2db;
  margin: 4px 0 0;
  letter-spacing: 0.02em;
}
.su-auth-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #dbe4f5;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 700;
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.su-auth-close:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  transform: scale(1.05);
}
.su-auth-tabs {
  display: flex;
  background: rgba(14, 24, 48, 0.85);
  border: 1px solid rgba(110, 160, 255, 0.22);
  border-radius: 999px;
  padding: 4px;
  margin-bottom: 20px;
}
.su-tab {
  flex: 1;
  padding: 10px 14px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #9cb2db;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
}
.su-tab.active {
  background: linear-gradient(90deg, #4b7bff, #7ea2ff);
  color: #fff;
  box-shadow: 0 4px 15px rgba(75, 123, 255, 0.4);
}
.su-form-group {
  margin-bottom: 15px;
}
.su-form-group label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  color: #b7cceb;
  margin-bottom: 6px;
}
.su-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.su-label-row label {
  margin-bottom: 0;
}
.su-forgot-link {
  font-size: 12px;
  color: #7ea2ff;
  text-decoration: none;
  transition: color 0.2s;
}
.su-forgot-link:hover {
  color: #a8c1ff;
  text-decoration: underline;
}
.su-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.su-input-icon {
  position: absolute;
  left: 14px;
  font-size: 15px;
  pointer-events: none;
  color: #7ea2ff;
}
.su-input-wrap input {
  width: 100%;
  padding: 13px 14px 13px 42px;
  border-radius: 12px;
  border: 1px solid rgba(110, 160, 255, 0.25);
  background: rgba(14, 24, 52, 0.7);
  color: #fff;
  font-size: 14.5px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}
.su-input-wrap input:focus {
  border-color: #5179e8;
  background: rgba(20, 34, 72, 0.85);
  box-shadow: 0 0 0 3px rgba(81, 121, 232, 0.25);
}
.su-eye-btn {
  position: absolute;
  right: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #a8c1eb;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  padding: 5px 9px;
  cursor: pointer;
  transition: all 0.2s;
}
.su-eye-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
.su-form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 18px;
  font-size: 13px;
  color: #9cb2db;
}
.su-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.su-checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: #4b7bff;
  cursor: pointer;
}
.su-verify-section, .su-reset-section {
  background: rgba(20, 34, 72, 0.6);
  border: 1px solid rgba(110, 160, 255, 0.25);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 18px;
}
.su-verify-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.su-verify-icon {
  font-size: 24px;
}
.su-verify-banner b {
  display: block;
  font-size: 14px;
  color: #fff;
}
.su-verify-desc {
  font-size: 12px;
  color: #9cb2db;
  margin: 4px 0 0;
  line-height: 1.45;
}
.su-code-wrap {
  margin: 12px 0;
}
.su-code-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px dashed rgba(110, 160, 255, 0.4);
  background: rgba(8, 14, 32, 0.85);
  color: #ffc53d;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 0.4em;
  text-align: center;
  outline: none;
  box-sizing: border-box;
}
.su-code-input:focus {
  border-color: #ffc53d;
  box-shadow: 0 0 15px rgba(255, 197, 61, 0.3);
}
.su-verify-links {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.su-link-btn {
  background: none;
  border: 0;
  color: #7ea2ff;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 2px 0;
}
.su-link-btn:hover {
  color: #b7cceb;
}
.su-demo-box {
  background: rgba(255, 197, 61, 0.1);
  border: 1px dashed rgba(255, 197, 61, 0.4);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  color: #ffda73;
  margin-top: 12px;
  line-height: 1.45;
}
.su-auth-msg {
  min-height: 20px;
  font-size: 13px;
  text-align: center;
  margin-bottom: 14px;
  line-height: 1.4;
  font-weight: 500;
}
.su-auth-msg.err {
  color: #ff7b7b;
}
.su-auth-msg.ok {
  color: #6ff0cf;
}
.su-auth-submit {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 0;
  background: linear-gradient(90deg, #4b7bff, #3361e6);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(75, 123, 255, 0.38);
  transition: all 0.2s ease;
}
.su-auth-submit:hover:not(:disabled) {
  background: linear-gradient(90deg, #5c89ff, #406fe8);
  box-shadow: 0 8px 25px rgba(75, 123, 255, 0.5);
  transform: translateY(-1px);
}
.su-auth-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.su-auth-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  font-size: 13px;
  color: #9cb2db;
}
.su-switch-btn {
  background: none;
  border: 0;
  color: #7ea2ff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
.su-switch-btn:hover {
  color: #a8c1ff;
}
.su-account-btn {
  position: relative;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.su-account-btn:hover {
  transform: scale(1.05);
}
.su-account-btn.logged-in svg {
  stroke: #6ff0cf !important;
}
.su-account-btn.logged-in:after {
  content: "";
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6ff0cf;
  box-shadow: 0 0 6px #6ff0cf;
}
</style>

<!-- ===== SCIENCE UNIVERSE AUTH MODAL (LOGIN & REGISTRATION) ===== -->
<div id="suAuthModal" class="su-auth-overlay" role="dialog" aria-modal="true" aria-label="Нэвтрэх болон Бүртгэл">
  <div class="su-auth-backdrop" id="suAuthBackdrop"></div>
  <div class="su-auth-container">
    <div class="su-auth-card">
      <header class="su-auth-header">
        <div class="su-auth-brand">
          <div class="su-auth-icon">🌌</div>
          <div>
            <h2 class="su-auth-title">SCIENCE <b>UNIVERSE</b></h2>
            <p class="su-auth-subtitle" id="suAuthSub">Шинжлэх ухааны нэгдсэн системд нэвтрэх</p>
          </div>
        </div>
        <button type="button" class="su-auth-close" id="suAuthClose" aria-label="Хаах" title="Хаах">✕</button>
      </header>

      <!-- Navigation Tabs: Login vs Register -->
      <div class="su-auth-tabs" role="tablist" id="suAuthTabs">
        <button type="button" role="tab" class="su-tab active" id="suTabLogin" aria-selected="true">Нэвтрэх</button>
        <button type="button" role="tab" class="su-tab" id="suTabRegister" aria-selected="false">Бүртгүүлэх</button>
      </div>

      <!-- Main Auth Form -->
      <form id="suAuthForm" novalidate autocomplete="on">
        <!-- Name (only for Register) -->
        <div class="su-form-group su-group-name" id="suGroupName" style="display:none">
          <label for="suFieldName">Таны нэр</label>
          <div class="su-input-wrap">
            <span class="su-input-icon">👤</span>
            <input type="text" id="suFieldName" placeholder="Бүтэн нэрээ оруулна уу" maxlength="40" autocomplete="name">
          </div>
        </div>

        <!-- Email (both Login and Register) -->
        <div class="su-form-group" id="suGroupEmail">
          <label for="suFieldEmail">И-мэйл хаяг</label>
          <div class="su-input-wrap">
            <span class="su-input-icon">✉️</span>
            <input type="email" id="suFieldEmail" placeholder="name@example.com" inputmode="email" autocomplete="email" required>
          </div>
        </div>

        <!-- Password (both Login and Register) -->
        <div class="su-form-group" id="suGroupPass">
          <div class="su-label-row">
            <label for="suFieldPass">Нууц үг</label>
            <a href="#" class="su-forgot-link" id="suForgotLink">Нууц үгээ мартсан уу?</a>
          </div>
          <div class="su-input-wrap">
            <span class="su-input-icon">🔒</span>
            <input type="password" id="suFieldPass" placeholder="Хамгийн багадаа 8 тэмдэгт" autocomplete="current-password" required>
            <button type="button" class="su-eye-btn" id="suEyePass" aria-label="Нууц үг харах">Харах</button>
          </div>
        </div>

        <!-- Confirm Password (only for Register) -->
        <div class="su-form-group su-group-confirm" id="suGroupConfirm" style="display:none">
          <label for="suFieldConfirm">Нууц үг баталгаажуулах</label>
          <div class="su-input-wrap">
            <span class="su-input-icon">🔐</span>
            <input type="password" id="suFieldConfirm" placeholder="Нууц үгээ дахин оруулна уу" autocomplete="new-password">
            <button type="button" class="su-eye-btn" id="suEyeConfirm" aria-label="Нууц үг харах">Харах</button>
          </div>
        </div>

        <!-- Options: Remember Me -->
        <div class="su-form-options" id="suFormOptions">
          <label class="su-checkbox-label">
            <input type="checkbox" id="suRememberMe" checked>
            <span>Намайг сана</span>
          </label>
        </div>

        <!-- Email Verification (OTP) Section -->
        <div class="su-verify-section" id="suVerifySection" style="display:none">
          <div class="su-verify-banner">
            <div class="su-verify-icon">📬</div>
            <div>
              <b id="suVerifyTitle">Баталгаажуулах код илгээлээ</b>
              <p class="su-verify-desc" id="suVerifyDesc">Таны и-мэйл хаяг руу 6 оронтой код илгээсэн. Кодоо оруулж баталгаажуулна уу.</p>
            </div>
          </div>
          <div class="su-code-wrap">
            <input type="text" id="suFieldCode" class="su-code-input" inputmode="numeric" maxlength="6" pattern="[0-9]*" placeholder="000000" autocomplete="one-time-code">
          </div>
          <div class="su-verify-links">
            <button type="button" class="su-link-btn" id="suResendCodeBtn">Код дахин илгээх</button>
            <button type="button" class="su-link-btn" id="suChangeEmailBtn">И-мэйл солих</button>
          </div>
          <div class="su-demo-box" id="suDemoBox" style="display:none"></div>
        </div>

        <!-- Password Reset Section (when user clicks Forgot Password) -->
        <div class="su-reset-section" id="suResetSection" style="display:none">
          <div class="su-verify-banner">
            <div class="su-verify-icon">🔑</div>
            <div>
              <b>Нууц үг сэргээх</b>
              <p class="su-verify-desc">Бүртгэлтэй и-мэйл хаягтаа шинэ нууц үг тохируулна уу.</p>
            </div>
          </div>
          <div class="su-form-group" style="margin-top:10px">
            <label for="suResetPass">Шинэ нууц үг (дор хаяж 8 тэмдэгт)</label>
            <input type="password" id="suResetPass" class="su-text-input" style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(110,160,255,0.25);background:rgba(14,24,52,0.7);color:#fff" placeholder="Шинэ нууц үг">
          </div>
          <div class="su-form-group">
            <label for="suResetPassConfirm">Шинэ нууц үг давтах</label>
            <input type="password" id="suResetPassConfirm" class="su-text-input" style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(110,160,255,0.25);background:rgba(14,24,52,0.7);color:#fff" placeholder="Шинэ нууц үг давтах">
          </div>
          <button type="button" class="su-link-btn" id="suResetCancelBtn" style="margin-top:8px">← Буцах</button>
        </div>

        <!-- Dynamic Feedback Message Box -->
        <div class="su-auth-msg" id="suAuthMsg" role="alert" aria-live="polite"></div>

        <!-- Main Action Submit Button -->
        <button type="submit" class="su-auth-submit" id="suAuthSubmit">Нэвтрэх</button>

        <!-- Footer Tab Switch Link -->
        <div class="su-auth-footer" id="suAuthFooter">
          <span id="suSwitchPrompt">Бүртгэлгүй юу?</span>
          <button type="button" class="su-switch-btn" id="suSwitchBtn">Бүртгүүлэх</button>
        </div>
      </form>
    </div>
  </div>
</div>
`;

const suProfileTarget = `<div id="suProfile" role="dialog" aria-modal="true" aria-label="Профайл">`;
if (!html.includes(suProfileTarget)) {
  console.error('Failed to locate suProfileTarget');
  process.exit(1);
}

html = html.replace(suProfileTarget, authModalCSS + '\n' + suProfileTarget);
console.log('✓ Region B (Auth Modal HTML & CSS) inserted');

// 3. Update Profile person card & add Account section inside #suProfile
const oldPrPerson = `<div class="pr-person"><button type="button" class="pr-avatar pr-avatar-upload" id="prAvatar" title="Зураг солих" aria-label="Профайл зураг солих">👤</button><div><div class="pr-name" id="prName">Судлаач</div><div class="pr-sub" id="prAbout">Миний хувийн орон зай</div><div class="pr-sub" id="prLevel">Science Universe</div></div></div>`;

const newPrPerson = `<div class="pr-person"><button type="button" class="pr-avatar pr-avatar-upload" id="prAvatar" title="Зураг солих" aria-label="Профайл зураг солих">👤</button><div style="flex:1;min-width:0"><div class="pr-name" id="prName">Судлаач</div><div class="pr-email-display" id="prEmailDisplay" style="color:#7ea2ff;font-size:12.5px;margin-bottom:4px;word-break:break-all">Бүртгэлгүй (Зочин)</div><div class="pr-credit-badge" id="prCreditBadge" style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,197,61,0.15);border:1px solid rgba(255,197,61,0.4);color:#ffc53d;border-radius:6px;padding:3px 8px;font-size:12px;font-weight:700">★ 0 кредит</div><div class="pr-sub" id="prLevel" style="margin-top:4px">Science Universe</div></div></div>
<div class="pr-section" id="prAccountSection">
  <h3>ДАНС & БҮРТГЭЛ</h3>
  <div id="prLoggedInAccountView">
    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;color:#98a8c1;text-transform:uppercase;letter-spacing:0.5px">Идэвхтэй хаяг</div>
        <div id="prAccountEmailText" style="font-size:14px;font-weight:600;color:#eaf0ff;word-break:break-all">Бүртгэлгүй</div>
      </div>
      <div id="prAccountCreditsText" style="font-size:14px;font-weight:700;color:#ffc53d">★ 0</div>
    </div>
    <button type="button" class="pr-row" id="prLogoutBtn" style="color:#ff6b6b;border-bottom:1px solid rgba(255,107,107,0.25)">
      <span style="color:#ff6b6b">🚪</span>
      <span class="pr-copy" style="color:#ff9e9e">Системээс гарах<small style="color:#e08585">Энэ төхөөрөмж дээрх идэвхтэй сессийг дуусгах</small></span>
      <span class="pr-arrow" style="color:#ff6b6b">›</span>
    </button>
  </div>
  <div id="prGuestAccountView" style="display:none">
    <button type="button" class="pr-row" id="prLoginModalBtn" style="color:#6ff0cf;border-bottom:1px solid rgba(111,240,207,0.25)">
      <span style="color:#6ff0cf">🔑</span>
      <span class="pr-copy" style="color:#a8f7e2">Нэвтрэх / Бүртгүүлэх<small style="color:#81d8c1">Өөрийн хаягаар нэвтэрч кредит болон явцаа хадгалах</small></span>
      <span class="pr-arrow" style="color:#6ff0cf">›</span>
    </button>
  </div>
</div>`;

if (!html.includes(oldPrPerson)) {
  console.error('Failed to locate oldPrPerson');
  process.exit(1);
}
html = html.replace(oldPrPerson, newPrPerson);
console.log('✓ Profile person card and Account section inserted');

// 4. Update OVERLAY_CONFIGS in SU_OVERLAY_MANAGER
const oldOverlayCfg = `{ id: 'suProfile', openClass: 'open', closeSelectors: ['#prClose', '#prCloseBottom'] },`;
const newOverlayCfg = `{ id: 'suAuthModal', openClass: 'open', closeSelectors: ['#suAuthClose', '#suAuthBackdrop', '.su-auth-close'] },
    { id: 'suProfile', openClass: 'open', closeSelectors: ['#prClose', '#prCloseBottom'] },`;

if (!html.includes(oldOverlayCfg)) {
  console.error('Failed to locate oldOverlayCfg');
  process.exit(1);
}
html = html.replace(oldOverlayCfg, newOverlayCfg);
console.log('✓ SU_OVERLAY_MANAGER registered suAuthModal');

// 5. Replace Region D: The complete Auth & Credit System Script
const scriptStartOld = `<script>
(function(){
'use strict';
const $=id=>document.getElementById(id);
const phone=$('phone'),sheet=$('sheet'),form=$('form'),msg=$('msg'),submit=$('submit');`;

const endSnippet = `/* Өмнөх сессийг сэргээх */
const saved=store.get('sessionStorage','rf_session')||store.get('localStorage','rf_session');
if(saved&&getUsers()[saved])showLab(saved,getUsers()[saved]);
})();
</script>`;

const startIdx = html.indexOf(scriptStartOld);
const endIdx = html.indexOf(endSnippet);

if (startIdx === -1 || endIdx === -1) {
  console.error('Failed to find start or end index for script replacement');
  process.exit(1);
}

const fullTargetScript = html.slice(startIdx, endIdx + endSnippet.length);

const newAuthScript = `<script>
(function(){
  'use strict';
  const $ = id => document.getElementById(id);

  /* Storage helper */
  const mem = {};
  const store = {
    get(a, k) { try { return JSON.parse(window[a].getItem(k)); } catch(e) { return mem[a+k] || null; } },
    set(a, k, v) { mem[a+k] = v; try { window[a].setItem(k, JSON.stringify(v)); } catch(e) {} },
    del(a, k) { delete mem[a+k]; try { window[a].removeItem(k); } catch(e) {} }
  };

  const getUsers = () => store.get('localStorage', 'rf_users') || {};
  const saveUsers = (u) => store.set('localStorage', 'rf_users', u);

  /* Password Hashing using WebCrypto PBKDF2 + SHA-256 with 150,000 iterations */
  const enc = new TextEncoder();
  const toB64 = b => btoa(String.fromCharCode(...new Uint8Array(b)));
  const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

  async function hash(pass, salt) {
    const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 150000 }, key, 256);
    return toB64(bits);
  }

  const MAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;
  let curMail = null;
  window.curMail = null;

  /* Supabase Adapter Bridge (checks for Supabase client) */
  window.SU_AUTH = {
    isSupabaseAvailable() {
      return typeof window.supabase !== 'undefined' && !!window.supabase.auth;
    },
    getCurMail() {
      return curMail;
    },
    getCurrentUser() {
      return curMail ? (getUsers()[curMail] || null) : null;
    },
    getCredits() {
      const u = this.getCurrentUser();
      return u ? Math.max(0, u.credits | 0) : 0;
    }
  };

  /* UI feedback helper */
  function authSay(text, type = '') {
    const msg = $('suAuthMsg');
    if (!msg) return;
    msg.textContent = text;
    msg.className = 'su-auth-msg' + (type ? ' ' + type : '');
  }

  function authInvalid(inputEl, on) {
    if (!inputEl) return;
    inputEl.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on) {
      inputEl.style.borderColor = '#ff7b7b';
    } else {
      inputEl.style.borderColor = '';
    }
  }

  function clearAuthInvalids() {
    ['suFieldName', 'suFieldEmail', 'suFieldPass', 'suFieldConfirm', 'suFieldCode'].forEach(id => {
      const el = $(id);
      if (el) authInvalid(el, false);
    });
  }

  /* Sync all credit displays in the app */
  function syncAllCredits(credits) {
    const c = Math.max(0, credits | 0);

    // 1. Top bar indicator
    const creditsEl = $('credits');
    if (creditsEl) creditsEl.textContent = c;
    const credchip = $('credchip');
    if (credchip) credchip.setAttribute('aria-label', 'Одоо ' + c + ' кредит');

    // 2. Unlock modal indicator
    const curCredsEl = $('suCurCredits');
    if (curCredsEl) curCredsEl.textContent = c + ' ★';

    // 3. Lab credits badges
    const chemCreds = $('clCredits');
    if (chemCreds) chemCreds.textContent = '★ ' + c;

    // 4. Profile modal badges
    const prCredBadge = $('prCreditBadge');
    if (prCredBadge) prCredBadge.textContent = '★ ' + c + ' кредит';
    const prAccountCredits = $('prAccountCreditsText');
    if (prAccountCredits) prAccountCredits.textContent = '★ ' + c;

    // 5. Space Lab locked status
    const SPACE_COST = 120;
    const b = $('spaceCard');
    if (b) {
      if (c >= SPACE_COST || (typeof isSectionUnlocked === 'function' && isSectionUnlocked('spacelab'))) {
        delete b.dataset.locked;
        b.dataset.msg = 'Сансар судлалын лаборатори нээгдэж байна…';
        b.setAttribute('aria-label', 'Сансар судлал');
        const sm = $('spaceSmall');
        if (sm) sm.textContent = 'Нээгдсэн';
        const sh = $('shackle');
        if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0115.4-3');
      } else {
        b.dataset.locked = '1';
        b.dataset.msg = 'Сансар судлал нээгдэхэд ' + SPACE_COST + ' кредит хэрэгтэй (одоо ' + c + ')';
        b.setAttribute('aria-label', 'Сансар судлал, түгжээтэй');
        const sm = $('spaceSmall');
        if (sm) sm.textContent = SPACE_COST + ' кредитээр нээгдэнэ';
        const sh = $('shackle');
        if (sh) sh.setAttribute('d', 'M16 21v-6a8 8 0 0116 0v6');
      }
    }
  }

  /* Public addCredits function */
  window.addCredits = function(n) {
    if (!curMail) {
      // Guest credits preservation
      const guestVal = Math.max(0, (parseInt(localStorage.getItem('rf_guest_credits') || '0', 10) || 0) + n);
      localStorage.setItem('rf_guest_credits', guestVal);
      syncAllCredits(guestVal);
      return guestVal;
    }
    const users = getUsers();
    const u = users[curMail];
    if (!u) return 0;
    u.credits = Math.max(0, (u.credits | 0) + n);
    saveUsers(users);
    syncAllCredits(u.credits);
    return u.credits;
  };

  /* Update top-right button visual based on authentication state */
  function updateTopButton(isLoggedIn, mail, name) {
    const btn = $('logout');
    if (!btn) return;

    const svg = $('suAccountSvg');
    if (isLoggedIn) {
      btn.classList.add('logged-in');
      btn.setAttribute('aria-label', 'Хэрэглэгчийн данс (' + (mail || '') + ')');
      btn.title = 'Таны бүртгэл: ' + (name || mail || '');
      if (svg) {
        svg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><circle cx="19" cy="5" r="2.5" fill="#6ff0cf" stroke="none"></circle>';
      }
    } else {
      btn.classList.remove('logged-in');
      btn.setAttribute('aria-label', 'Нэвтрэх / Бүртгүүлэх');
      btn.title = 'Нэвтрэх / Бүртгүүлэх';
      if (svg) {
        svg.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>';
      }
    }
  }

  /* Update profile modal account section */
  function updateProfileAccountView(isLoggedIn, mail, u) {
    const loggedInView = $('prLoggedInAccountView');
    const guestView = $('prGuestAccountView');
    const emailDisplay = $('prEmailDisplay');
    const accountEmailText = $('prAccountEmailText');
    const prName = $('prName');

    if (isLoggedIn && u) {
      if (loggedInView) loggedInView.style.display = 'block';
      if (guestView) guestView.style.display = 'none';
      if (emailDisplay) emailDisplay.textContent = mail;
      if (accountEmailText) accountEmailText.textContent = mail;
      if (prName) prName.textContent = u.name || 'Судлаач';
    } else {
      if (loggedInView) loggedInView.style.display = 'none';
      if (guestView) guestView.style.display = 'block';
      if (emailDisplay) emailDisplay.textContent = 'Бүртгэлгүй (Зочин)';
      if (accountEmailText) accountEmailText.textContent = 'Зочин хэрэглэгч';
      if (prName) prName.textContent = 'Судлаач (Зочин)';
    }
  }

  /* Toast Helper */
  const toast = $('toast');
  let toastTimer;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  /* Mode management: 'login', 'register', 'verify', 'reset' */
  let currentMode = 'login';
  let pendingReg = null;
  let codeVal = '', codeExp = 0, codeTries = 0, lastSent = 0;
  let fails = 0, lockUntil = 0;

  function setAuthMode(mode) {
    currentMode = mode;
    clearAuthInvalids();
    authSay('');

    const groupName = $('suGroupName');
    const groupEmail = $('suGroupEmail');
    const groupPass = $('suGroupPass');
    const groupConfirm = $('suGroupConfirm');
    const formOptions = $('suFormOptions');
    const verifySec = $('suVerifySection');
    const resetSec = $('suResetSection');
    const submitBtn = $('suAuthSubmit');
    const subTitle = $('suAuthSub');
    const switchPrompt = $('suSwitchPrompt');
    const switchBtn = $('suSwitchBtn');
    const tabLogin = $('suTabLogin');
    const tabReg = $('suTabRegister');
    const tabsContainer = $('suAuthTabs');

    if (mode === 'login') {
      if (tabsContainer) tabsContainer.style.display = 'flex';
      if (tabLogin) { tabLogin.classList.add('active'); tabLogin.setAttribute('aria-selected', 'true'); }
      if (tabReg) { tabReg.classList.remove('active'); tabReg.setAttribute('aria-selected', 'false'); }
      if (groupName) groupName.style.display = 'none';
      if (groupEmail) groupEmail.style.display = 'block';
      if (groupPass) groupPass.style.display = 'block';
      if (groupConfirm) groupConfirm.style.display = 'none';
      if (formOptions) formOptions.style.display = 'flex';
      if (verifySec) verifySec.style.display = 'none';
      if (resetSec) resetSec.style.display = 'none';
      if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.textContent = 'Нэвтрэх'; }
      if (subTitle) subTitle.textContent = 'Шинжлэх ухааны нэгдсэн системд нэвтрэх';
      if (switchPrompt) switchPrompt.textContent = 'Бүртгэлгүй юу?';
      if (switchBtn) switchBtn.textContent = 'Бүртгүүлэх';
      setTimeout(() => { if ($('suFieldEmail')) $('suFieldEmail').focus(); }, 100);
    } else if (mode === 'register') {
      if (tabsContainer) tabsContainer.style.display = 'flex';
      if (tabLogin) { tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected', 'false'); }
      if (tabReg) { tabReg.classList.add('active'); tabReg.setAttribute('aria-selected', 'true'); }
      if (groupName) groupName.style.display = 'block';
      if (groupEmail) groupEmail.style.display = 'block';
      if (groupPass) groupPass.style.display = 'block';
      if (groupConfirm) groupConfirm.style.display = 'block';
      if (formOptions) formOptions.style.display = 'none';
      if (verifySec) verifySec.style.display = 'none';
      if (resetSec) resetSec.style.display = 'none';
      if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.textContent = 'Бүртгэл үүсгэх'; }
      if (subTitle) subTitle.textContent = 'Шинэ судлаачийн бүртгэл үүсгэх';
      if (switchPrompt) switchPrompt.textContent = 'Бүртгэлтэй бол';
      if (switchBtn) switchBtn.textContent = 'Нэвтрэх';
      setTimeout(() => { if ($('suFieldName')) $('suFieldName').focus(); }, 100);
    } else if (mode === 'verify') {
      if (tabsContainer) tabsContainer.style.display = 'none';
      if (groupName) groupName.style.display = 'none';
      if (groupEmail) groupEmail.style.display = 'none';
      if (groupPass) groupPass.style.display = 'none';
      if (groupConfirm) groupConfirm.style.display = 'none';
      if (formOptions) formOptions.style.display = 'none';
      if (verifySec) verifySec.style.display = 'block';
      if (resetSec) resetSec.style.display = 'none';
      if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.textContent = 'Баталгаажуулах'; }
      if (subTitle) subTitle.textContent = 'И-мэйл хаягаа баталгаажуулах';
      setTimeout(() => { if ($('suFieldCode')) $('suFieldCode').focus(); }, 100);
    } else if (mode === 'reset') {
      if (tabsContainer) tabsContainer.style.display = 'none';
      if (groupName) groupName.style.display = 'none';
      if (groupEmail) groupEmail.style.display = 'block';
      if (groupPass) groupPass.style.display = 'none';
      if (groupConfirm) groupConfirm.style.display = 'none';
      if (formOptions) formOptions.style.display = 'none';
      if (verifySec) verifySec.style.display = 'none';
      if (resetSec) resetSec.style.display = 'block';
      if (submitBtn) { submitBtn.style.display = 'block'; submitBtn.textContent = 'Нууц үг шинэчлэх'; }
      if (subTitle) subTitle.textContent = 'Нууц үг сэргээж шинэчлэх';
      setTimeout(() => { if ($('suResetPass')) $('suResetPass').focus(); }, 100);
    }
  }

  /* Open / Close Auth Modal */
  function openAuthModal(tab = 'login') {
    const modal = $('suAuthModal');
    if (!modal) return;
    setAuthMode(tab);
    modal.classList.add('open');
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.setProperty('pointer-events', 'auto', 'important');
    modal.style.setProperty('visibility', 'visible', 'important');
    modal.style.setProperty('opacity', '1', 'important');
    modal.style.setProperty('z-index', '2147483400', 'important');
    document.body.style.overflow = 'hidden';
  }

  function closeAuthModal() {
    const modal = $('suAuthModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.style.setProperty('display', 'none', 'important');
    modal.style.setProperty('pointer-events', 'none', 'important');
    modal.style.setProperty('visibility', 'hidden', 'important');
    document.body.style.overflow = '';
  }

  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;

  /* Establish authenticated session */
  function loginUser(mail, u) {
    curMail = mail;
    window.curMail = mail;
    const remember = $('suRememberMe') ? $('suRememberMe').checked : true;
    store.set(remember ? 'localStorage' : 'sessionStorage', 'rf_session', mail);

    // Render user details
    const uname = $('uname');
    if (uname) uname.textContent = u.name || 'Судлаач';
    const lvl = $('lvl');
    if (lvl) lvl.textContent = 'Lv ' + (1 + Math.floor((u.credits | 0) / 100));

    // Render credit balance
    syncAllCredits(u.credits || 0);

    // Update top button
    updateTopButton(true, mail, u.name);

    // Update profile view
    updateProfileAccountView(true, mail, u);

    // Close Auth modal
    closeAuthModal();

    // Show welcome toast
    showToast('Тавтай морил, ' + (u.name || 'Судлаач') + '! ★');
  }

  /* Log out user cleanly */
  function logoutUser() {
    store.del('localStorage', 'rf_session');
    store.del('sessionStorage', 'rf_session');
    curMail = null;
    window.curMail = null;

    // Reset top bar
    const uname = $('uname');
    if (uname) uname.textContent = 'Судлаач';
    const lvl = $('lvl');
    if (lvl) lvl.textContent = 'Lv 1';

    // Reset credits display to 0 (credits remain safe in rf_users)
    syncAllCredits(0);

    // Update top button to login prompt
    updateTopButton(false, null, null);

    // Update profile modal
    updateProfileAccountView(false, null, null);

    // Close profile if open
    if (typeof window.closeProfile === 'function') {
      window.closeProfile();
    }

    showToast('Системээс амжилттай гарлаа.');
  }

  window.logoutUser = logoutUser;

  /* Generate OTP Code */
  const genCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');

  async function issueCode() {
    codeVal = genCode();
    codeExp = Date.now() + 5 * 60 * 1000;
    codeTries = 0;
    lastSent = Date.now();

    const demo = $('suDemoBox');
    if (demo) {
      demo.style.display = 'block';
      demo.innerHTML = '<b>Баталгаажуулах код:</b> <span style="font-size:16px;color:#fff;letter-spacing:2px;font-weight:bold">' + codeVal + '</span><br><small>(Хэрэв сервер холбогдоогүй бол дээрх 6 оронтой кодыг оруулна уу)</small>';
    }
  }

  async function startVerify() {
    await issueCode();
    setAuthMode('verify');
    const desc = $('suVerifyDesc');
    if (desc && pendingReg) {
      desc.textContent = pendingReg.mail + ' хаяг руу 6 оронтой код илгээсэн. Кодоо оруулж баталгаажуулна уу.';
    }
  }

  /* Verify code submission */
  async function submitVerifyCode() {
    const codeEl = $('suFieldCode');
    const v = codeEl ? codeEl.value.trim() : '';
    authInvalid(codeEl, false);

    if (!/^\\d{6}$/.test(v)) {
      authInvalid(codeEl, true);
      authSay('6 оронтой кодоо зөв оруулна уу.', 'err');
      codeEl.focus();
      return;
    }
    if (!codeVal || Date.now() > codeExp) {
      authSay('Кодын хугацаа дууссан. "Код дахин илгээх" дээр дарна уу.', 'err');
      return;
    }
    if (v !== codeVal) {
      authInvalid(codeEl, true);
      if (++codeTries >= 5) {
        codeVal = '';
        authSay('Хэт олон буруу оролдлоо. Шинэ код авна уу.', 'err');
      } else {
        authSay('Код буруу байна. Үлдсэн оролдлого: ' + (5 - codeTries), 'err');
      }
      codeEl.focus();
      return;
    }

    // Code matches: register user
    const users = getUsers();
    users[pendingReg.mail] = {
      name: pendingReg.name,
      mail: pendingReg.mail,
      salt: pendingReg.salt,
      hash: pendingReg.hash,
      credits: 0,
      unlockedSections: {},
      createdAt: Date.now()
    };
    saveUsers(users);

    const registeredUser = users[pendingReg.mail];
    loginUser(pendingReg.mail, registeredUser);
    showToast('Бүртгэл амжилттай үүслээ!');
  }

  /* Form submission handler */
  const authForm = $('suAuthForm');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (currentMode === 'verify') {
        submitVerifyCode();
        return;
      }

      if (currentMode === 'reset') {
        const mail = $('suFieldEmail') ? $('suFieldEmail').value.trim().toLowerCase() : '';
        const newPass = $('suResetPass') ? $('suResetPass').value : '';
        const confirmPass = $('suResetPassConfirm') ? $('suResetPassConfirm').value : '';

        if (!MAIL_RE.test(mail)) {
          authSay('И-мэйл хаягаа зөв оруулна уу.', 'err');
          return;
        }
        const users = getUsers();
        const u = users[mail];
        if (!u) {
          authSay('Энэ и-мэйл бүртгэлгүй байна.', 'err');
          return;
        }
        if (!newPass || newPass.length < 8) {
          authSay('Шинэ нууц үг хамгийн багадаа 8 тэмдэгттэй байна.', 'err');
          return;
        }
        if (newPass !== confirmPass) {
          authSay('Нууц үг хоорондоо тохирохгүй байна.', 'err');
          return;
        }

        const newSalt = crypto.getRandomValues(new Uint8Array(16));
        u.salt = toB64(newSalt);
        u.hash = await hash(newPass, newSalt);
        saveUsers(users);

        authSay('Нууц үг амжилттай шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтэрнэ үү.', 'ok');
        setTimeout(() => setAuthMode('login'), 1200);
        return;
      }

      const isReg = currentMode === 'register';
      const fMail = $('suFieldEmail');
      const fPass = $('suFieldPass');
      const fName = $('suFieldName');
      const fConfirm = $('suFieldConfirm');

      const mail = fMail ? fMail.value.trim().toLowerCase() : '';
      const pass = fPass ? fPass.value : '';
      const name = fName ? fName.value.trim() : '';
      const confirmPass = fConfirm ? fConfirm.value : '';

      clearAuthInvalids();

      if (isReg && !name) {
        authInvalid(fName, true);
        authSay('Нэрээ оруулна уу.', 'err');
        fName.focus();
        return;
      }
      if (!MAIL_RE.test(mail)) {
        authInvalid(fMail, true);
        authSay('И-мэйл хаягаа зөв оруулна уу.', 'err');
        fMail.focus();
        return;
      }
      if (!pass) {
        authInvalid(fPass, true);
        authSay('Нууц үгээ оруулна уу.', 'err');
        fPass.focus();
        return;
      }
      if (isReg && pass.length < 8) {
        authInvalid(fPass, true);
        authSay('Нууц үг хамгийн багадаа 8 тэмдэгттэй байна.', 'err');
        fPass.focus();
        return;
      }
      if (isReg && pass !== confirmPass) {
        authInvalid(fConfirm, true);
        authSay('Нууц үг тохирохгүй байна. Дахин шалгана уу.', 'err');
        fConfirm.focus();
        return;
      }

      if (Date.now() < lockUntil) {
        const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
        authSay('Хэт олон буруу оролдлоо. ' + remaining + ' секундийн дараа дахин оролдоно уу.', 'err');
        return;
      }

      const submitBtn = $('suAuthSubmit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isReg ? 'Бүртгэж байна...' : 'Нэвтэрч байна...';
      }

      try {
        const users = getUsers();

        if (isReg) {
          if (users[mail]) {
            setAuthMode('login');
            if (fMail) fMail.value = mail;
            authSay('Энэ и-мэйл хаяг бүртгэлтэй байна. Нэвтэрнэ үү.', 'err');
            return;
          }

          const salt = crypto.getRandomValues(new Uint8Array(16));
          const h = await hash(pass, salt);
          pendingReg = { mail, name, salt: toB64(salt), hash: h };
          await startVerify();
          return;
        }

        // Login attempt
        const u = users[mail];
        let ok = false;
        if (u && u.salt && u.hash) {
          const checkHash = await hash(pass, fromB64(u.salt));
          ok = (checkHash === u.hash);
        }

        if (!ok) {
          if (++fails >= 5) {
            lockUntil = Date.now() + 30000;
            fails = 0;
          }
          authInvalid(fMail, true);
          authInvalid(fPass, true);
          authSay('И-мэйл эсвэл нууц үг буруу байна.', 'err');
          return;
        }

        fails = 0;
        loginUser(mail, u);
      } catch (err) {
        console.error('Auth submit error:', err);
        authSay('Алдаа гарлаа: ' + err.message, 'err');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = isReg ? 'Бүртгэл үүсгэх' : 'Нэвтрэх';
        }
      }
    });
  }

  /* Password eye visibility buttons */
  const eyePass = $('suEyePass');
  if (eyePass) {
    eyePass.onclick = () => {
      const p = $('suFieldPass');
      if (!p) return;
      const show = p.type === 'password';
      p.type = show ? 'text' : 'password';
      eyePass.textContent = show ? 'Нуух' : 'Харах';
    };
  }
  const eyeConfirm = $('suEyeConfirm');
  if (eyeConfirm) {
    eyeConfirm.onclick = () => {
      const p = $('suFieldConfirm');
      if (!p) return;
      const show = p.type === 'password';
      p.type = show ? 'text' : 'password';
      eyeConfirm.textContent = show ? 'Нуух' : 'Харах';
    };
  }

  /* Tab switching events */
  const tabLogin = $('suTabLogin');
  if (tabLogin) tabLogin.onclick = () => setAuthMode('login');
  const tabReg = $('suTabRegister');
  if (tabReg) tabReg.onclick = () => setAuthMode('register');
  const switchBtn = $('suSwitchBtn');
  if (switchBtn) switchBtn.onclick = () => setAuthMode(currentMode === 'login' ? 'register' : 'login');

  /* Forgot password flow */
  const forgotLink = $('suForgotLink');
  if (forgotLink) {
    forgotLink.onclick = (e) => {
      e.preventDefault();
      setAuthMode('reset');
    };
  }
  const resetCancel = $('suResetCancelBtn');
  if (resetCancel) resetCancel.onclick = () => setAuthMode('login');

  /* Verification resend & change email */
  const resendBtn = $('suResendCodeBtn');
  if (resendBtn) {
    resendBtn.onclick = async () => {
      const wait = Math.ceil((lastSent + 30000 - Date.now()) / 1000);
      if (wait > 0) {
        authSay('Шинэ код авахын тулд ' + wait + ' секунд хүлээнэ үү.', 'err');
        return;
      }
      await issueCode();
      authSay('Шинэ код илгээлээ.', 'ok');
    };
  }
  const changeEmailBtn = $('suChangeEmailBtn');
  if (changeEmailBtn) changeEmailBtn.onclick = () => setAuthMode('register');

  /* Close button & backdrop */
  const closeBtn = $('suAuthClose');
  if (closeBtn) closeBtn.onclick = closeAuthModal;
  const backdrop = $('suAuthBackdrop');
  if (backdrop) backdrop.onclick = closeAuthModal;

  /* Top Right Account button (#logout) handler */
  const topAccountBtn = $('logout');
  if (topAccountBtn) {
    topAccountBtn.onclick = (e) => {
      e.preventDefault();
      if (curMail) {
        if (typeof window.openProfile === 'function') {
          window.openProfile();
        }
      } else {
        openAuthModal('login');
      }
    };
  }

  /* Splash start button handler */
  const startBtn = $('start');
  if (startBtn) {
    startBtn.onclick = () => openAuthModal('login');
  }

  /* Profile Logout button */
  const prLogoutBtn = $('prLogoutBtn');
  if (prLogoutBtn) {
    prLogoutBtn.onclick = logoutUser;
  }
  const prLoginModalBtn = $('prLoginModalBtn');
  if (prLoginModalBtn) {
    prLoginModalBtn.onclick = () => {
      if (typeof window.closeProfile === 'function') window.closeProfile();
      openAuthModal('login');
    };
  }

  /* Intercept profile triggers when not logged in */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a, .who, [data-open="profile"]');
    if (!el) return;
    const txt = (el.textContent || '').trim().toLowerCase();
    const isProfileTrigger = el.matches('.who') || el.dataset.open === 'profile' || txt === 'profile' || txt.includes('профайл');
    if (isProfileTrigger && !curMail) {
      // Prompt login if clicking profile while logged out
      openAuthModal('login');
    }
  }, true);

  /* Restore existing saved session on startup */
  const savedSession = store.get('sessionStorage', 'rf_session') || store.get('localStorage', 'rf_session');
  if (savedSession) {
    const users = getUsers();
    if (users[savedSession]) {
      loginUser(savedSession, users[savedSession]);
    } else {
      updateTopButton(false, null, null);
      updateProfileAccountView(false, null, null);
      syncAllCredits(0);
    }
  } else {
    updateTopButton(false, null, null);
    updateProfileAccountView(false, null, null);
    syncAllCredits(0);
  }
})();
</script>`;

html = html.replace(fullTargetScript, newAuthScript);
console.log('✓ Region D (Complete Auth Script) replaced');

console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated! Length:', html.length);

