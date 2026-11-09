import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Expose window.suAuth and hook #prLogoutBtn with confirmation modal in the auth script
const oldLogoutDeclaration = `  window.logout = logout;
  window.logoutUser = logout;`;

const newSuAuthDeclaration = `  window.logout = logout;
  window.logoutUser = logout;

  /* Global Science Universe Auth and User Management Interface */
  window.suAuth = {
    getUsers: () => getUsers(),
    saveUsers: (u) => saveUsers(u),
    getCurrentMail: () => curMail,
    getCurrentUser: () => (curMail && getUsers()[curMail] ? getUsers()[curMail] : null),
    updateCurrentUser: (patch) => {
      if (!curMail) return false;
      const users = getUsers();
      if (!users[curMail]) return false;
      users[curMail] = { ...users[curMail], ...patch };
      saveUsers(users);
      renderUser(users[curMail]);
      return true;
    },
    logout: logout,
    openLoginSheet: (email) => {
      if (typeof window.closeProfile === 'function') window.closeProfile();
      logout();
      setMode(false);
      if (fMail && email) fMail.value = email;
      openSheet();
    }
  };`;

if (!html.includes(oldLogoutDeclaration)) {
  console.error('Could not find oldLogoutDeclaration in index.html');
  process.exit(1);
}
html = html.replace(oldLogoutDeclaration, newSuAuthDeclaration);

// 2. Locate #suProfile div and script block
const profileIndex = html.indexOf('<div id="suProfile"');
const profileScriptStart = html.indexOf('<script>', profileIndex);
const profileScriptEnd = html.indexOf('</script>', profileScriptStart) + 9;

if (profileIndex === -1 || profileScriptStart === -1 || profileScriptEnd === -1) {
  console.error('Could not locate #suProfile or its script block');
  process.exit(1);
}

// 3. New HTML markup for #suProfile with full screens and confirmation modals
const newProfileHTML = `<div id="suProfile" role="dialog" aria-modal="true" aria-label="Профайл">
  <div class="pr-page">

    <!-- Screen 1: Home Profile Overview -->
    <div class="pr-screen active" data-prscreen="home">
      <header class="pr-top">
        <h2>Профайл</h2>
        <button class="pr-back" id="prClose" style="cursor:pointer;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:6px 14px;color:#fff;font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px" title="Профайл хаах">✕ Хаах</button>
      </header>

      <div class="pr-person">
        <button type="button" class="pr-avatar pr-avatar-upload" id="prAvatar" title="Зураг солих" aria-label="Профайл зураг солих">👤</button>
        <div style="flex:1;min-width:0">
          <div class="pr-name" id="prName">Судлаач</div>
          <div class="pr-email-display" id="prEmailDisplay" style="color:#7ea2ff;font-size:12.5px;margin-bottom:4px;word-break:break-all">Бүртгэлгүй (Зочин)</div>
          <div class="pr-credit-badge" id="prCreditBadge" style="display:inline-flex;align-items:center;gap:5px;background:rgba(255,197,61,0.15);border:1px solid rgba(255,197,61,0.4);color:#ffc53d;border-radius:6px;padding:3px 8px;font-size:12px;font-weight:700">★ 0 кредит</div>
          <div class="pr-sub" id="prLevel" style="margin-top:4px">Science Universe</div>
        </div>
      </div>

      <!-- Account Management Section -->
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
          <button type="button" class="pr-row" id="prLogoutBtn" style="color:#ff6b6b;border-bottom:1px solid rgba(255,107,107,0.25);cursor:pointer">
            <span style="color:#ff6b6b">🚪</span>
            <span class="pr-copy" style="color:#ff9e9e">Системээс гарах<small style="color:#e08585">Идэвхтэй сессийг дуусгаж эхлэх дэлгэц рүү буцах</small></span>
            <span class="pr-arrow" style="color:#ff6b6b">›</span>
          </button>
        </div>
        <div id="prGuestAccountView" style="display:none">
          <button type="button" class="pr-row" id="prLoginModalBtn" style="color:#6ff0cf;border-bottom:1px solid rgba(111,240,207,0.25);cursor:pointer">
            <span style="color:#6ff0cf">🔑</span>
            <span class="pr-copy" style="color:#a8f7e2">Нэвтрэх / Бүртгүүлэх<small style="color:#81d8c1">Өөрийн хаягаар нэвтэрч кредит болон явцаа хадгалах</small></span>
            <span class="pr-arrow" style="color:#6ff0cf">›</span>
          </button>
        </div>
      </div>

      <div class="pr-photo-hint">📷 Зураг солихын тулд дээрх профайл зураг дээр дарна уу</div>

      <div class="pr-section">
        <h3>ПРОФАЙЛ</h3>
        <button class="pr-row" data-propen="switch" type="button">
          <span>⇄</span>
          <span class="pr-copy">Профайл солих<small>Өөр бүртгэлтэй хаяг сонгох эсвэл шинээр нэвтрэх</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <div class="pr-section">
        <h3>БҮРТГЭЛ</h3>
        <button class="pr-row" data-propen="edit" type="button">
          <span>👤</span>
          <span class="pr-copy">Хувийн мэдээлэл<small>Нэр, зураг, танилцуулга, зорилго</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="interests" type="button">
          <span>📚</span>
          <span class="pr-copy">Миний сонирхол<small>Шинжлэх ухааны салбарууд, лабораториуд</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="notes" type="button">
          <span>📝</span>
          <span class="pr-copy">Миний тэмдэглэл<small>Сурсан зүйл, санаагаа хадгалах</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <div class="pr-section">
        <h3>ТОХИРГОО</h3>
        <button class="pr-row" data-propen="appearance" type="button">
          <span>🎨</span>
          <span class="pr-copy">Хүрээний өнгө<small>Профайлын өнгөний загвар сонгох</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="about" type="button">
          <span>ⓘ</span>
          <span class="pr-copy">Аппын тухай<small>Science Universe · сургалтын платформ</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <div style="margin-top:20px">
        <button class="pr-action" id="prCloseBottom" type="button" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:12px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600">✕ Профайлаас гарах / Хаах</button>
      </div>
    </div>

    <!-- Screen 2: Switch Profile -->
    <div class="pr-screen" data-prscreen="switch">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Профайл солих</h2>
      </header>
      <p class="pr-help" style="margin-bottom:14px">Энэ төхөөрөмж дээр бүртгэгдсэн бодит хаягууд</p>
      <div id="prAccountList" style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px"></div>
      <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px">
        <button type="button" class="pr-action" id="prAddAccountBtn" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(90,140,255,0.18);border:1px solid rgba(90,140,255,0.4);color:#fff">
          <span>+</span> Өөр хаягаар нэвтрэх / Бүртгүүлэх
        </button>
      </div>
      <p class="pr-help" style="margin-top:16px;font-size:12px;line-height:1.5">
        💡 Аюулгүй байдлын үүднээс өөр хаяг руу шилжихэд тухайн хаягийн нууц үгээр баталгаажуулна. Кредит болон хичээлийн явц хаяг тус бүрт тусдаа найдвартай хадгалагдана.
      </p>
    </div>

    <!-- Screen 3: Edit Personal Information -->
    <div class="pr-screen" data-prscreen="edit">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Хувийн мэдээлэл</h2>
      </header>

      <div style="display:flex;flex-direction:column;align-items:center;margin:10px 0 16px">
        <div class="pr-avatar pr-avatar-upload" id="prPreview" title="Зураг сонгох" style="cursor:pointer;width:84px;height:84px;font-size:36px;border:2px solid #5b6bff;box-shadow:0 0 16px rgba(91,107,255,0.4)">👤</div>
        <div style="display:flex;gap:10px;margin-top:10px">
          <button type="button" class="pr-secondary" id="prChangePhotoBtn" style="padding:6px 14px;font-size:12px;margin:0">Зураг солих</button>
          <button type="button" class="pr-secondary" id="prRemove" style="padding:6px 14px;font-size:12px;margin:0;color:#ff8585;border-color:rgba(255,107,107,0.3)">Зураг арилгах</button>
        </div>
        <input type="file" id="prPhoto" accept="image/png,image/jpeg,image/webp" style="display:none">
      </div>

      <label for="prEditName">Дэлгэцийн нэр</label>
      <input id="prEditName" maxlength="40" placeholder="Таны нэр" autocomplete="name">

      <label for="prEditEmail">Бүртгэлтэй и-мэйл хаяг</label>
      <div style="position:relative">
        <input id="prEditEmail" readonly disabled style="opacity:0.75;cursor:not-allowed;background:rgba(255,255,255,0.04);border-color:rgba(255,255,255,0.12);color:#9db4db">
        <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:13px;color:#7ea2ff">🔒 Түгжээтэй</span>
      </div>
      <small style="display:block;color:#7f95d1;margin:4px 0 12px 2px;font-size:11.5px">Аюулгүй байдлын үүднээс үндсэн и-мэйл хаягийг шууд өөрчлөх боломжгүй.</small>

      <label for="prEditBio">Товч танилцуулга (Био)</label>
      <textarea id="prEditBio" maxlength="160" placeholder="Өөрийн сонирхол, чиглэлийн талаар товч бичнэ үү..."></textarea>

      <label for="prEditGoal">Суралцах зорилго</label>
      <input id="prEditGoal" maxlength="120" placeholder="Жишээ: Сансар судлал ба квант физик гүнзгийрүүлэн судлах">

      <div style="display:flex;gap:10px;margin-top:20px">
        <button type="button" class="pr-secondary" id="prCancelEdit" style="flex:1;margin:0;padding:12px">Болих</button>
        <button type="button" class="pr-action" id="prSaveEdit" style="flex:2;margin:0;padding:12px">Хадгалах</button>
      </div>
      <div class="pr-message" id="prEditMessage" style="text-align:center;font-weight:600;min-height:22px;margin-top:10px"></div>
    </div>

    <!-- Screen 4: My Interests -->
    <div class="pr-screen" data-prscreen="interests">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Миний сонирхол</h2>
      </header>
      <p class="pr-help" style="margin-bottom:14px">Өөрийн сонирхдог шинжлэх ухааны салбаруудыг сонгоно уу. Энэ нь танд тохирсон лаборатори, бодлогуудыг санал болгоход ашиглагдана.</p>
      <div id="prInterests" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px"></div>
      <button class="pr-action" id="prSaveInterestsBtn" type="button" style="width:100%;margin-top:10px">Хадгалаад дуусгах</button>
      <div class="pr-message" id="prInterestsMessage" style="text-align:center;font-weight:600;min-height:22px;margin-top:8px"></div>
    </div>

    <!-- Screen 5: Notes -->
    <div class="pr-screen" data-prscreen="notes">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Миний тэмдэглэл</h2>
      </header>
      <p class="pr-help">Сурсан зүйл, томьёо, хийх ажлаа тэмдэглээрэй.</p>
      <textarea id="prNotes" maxlength="2000" placeholder="Энд тэмдэглэлээ бичнэ үү..."></textarea>
      <button class="pr-action" id="prSaveNotes" type="button">Хадгалах</button>
      <div class="pr-message" id="prNotesMessage"></div>
    </div>

    <!-- Screen 6: Appearance (Frame Color) -->
    <div class="pr-screen" data-prscreen="appearance">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Хүрээний өнгө</h2>
      </header>
      <p class="pr-help">Профайлын өнгөө сонгож өөрт тохируулаарай.</p>
      <div class="pr-palette" id="prPalette"></div>
    </div>

    <!-- Screen 7: About Science Universe -->
    <div class="pr-screen" data-prscreen="about">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Аппын тухай</h2>
      </header>
      <div class="pr-panel">
        <b style="font-size:16px;color:#fff">SCIENCE UNIVERSE</b>
        <p style="margin:8px 0;color:#c0d2f0">Физик, биологи, хими, математик, инженерчлэл болон компьютерийн шинжлэх ухааны интерактив сургалтын платформын хувилбар 2.5.</p>
        <p style="margin:8px 0;color:#8ea3cc">Бүх явц, кредит болон эрхүүд таны бүртгэлтэй хэрэглэгчийн санд найдвартай хадгалагдана.</p>
      </div>
    </div>

  </div>

  <!-- Logout Confirmation Modal Dialog -->
  <div id="suLogoutConfirmModal" class="su-profile-modal-backdrop" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="suLogoutModalTitle">
    <div class="su-profile-confirm-card">
      <div style="font-size:36px;margin-bottom:10px;text-align:center">🚪</div>
      <h3 id="suLogoutModalTitle" style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#fff;text-align:center">Системээс гарах</h3>
      <p style="font-size:13.5px;color:#a8bdfa;line-height:1.5;margin:0 0 20px 0;text-align:center">Та системээс гарахдаа итгэлтэй байна уу?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button type="button" id="suLogoutCancel" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#e2e9ff;padding:11px;border-radius:10px;font-weight:600;font-size:13.5px;cursor:pointer">Болих</button>
        <button type="button" id="suLogoutConfirm" style="background:#ff4757;border:0;color:#fff;padding:11px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer;box-shadow:0 0 12px rgba(255,71,87,0.4)">Гарах</button>
      </div>
    </div>
  </div>

  <!-- Switch Profile Confirmation Modal Dialog -->
  <div id="suSwitchConfirmModal" class="su-profile-modal-backdrop" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="suSwitchModalTitle">
    <div class="su-profile-confirm-card">
      <div style="font-size:36px;margin-bottom:10px;text-align:center">⇄</div>
      <h3 id="suSwitchModalTitle" style="margin:0 0 8px 0;font-size:18px;font-weight:700;color:#fff;text-align:center">Профайл солих</h3>
      <p id="suSwitchModalText" style="font-size:13.5px;color:#a8bdfa;line-height:1.5;margin:0 0 20px 0;text-align:center">Та одоогийн сессийг дуусгаж, өөр хаягаар нэвтрэх үү?</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button type="button" id="suSwitchCancel" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#e2e9ff;padding:11px;border-radius:10px;font-weight:600;font-size:13.5px;cursor:pointer">Болих</button>
        <button type="button" id="suSwitchConfirm" style="background:#5b6bff;border:0;color:#fff;padding:11px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer;box-shadow:0 0 12px rgba(91,107,255,0.4)">Шилжих</button>
      </div>
    </div>
  </div>
</div>

<script id="su-profile-engine-script">
(function(){
  const root = document.getElementById('suProfile');
  if (!root) return;
  const $ = id => document.getElementById(id);

  let tempPhoto = undefined;
  let pendingSwitchMail = null;
  let selectedInterests = [];

  const ALL_INTERESTS = [
    { id: 'Физик', label: '⚛️ Физик' },
    { id: 'Хими', label: '🧪 Хими' },
    { id: 'Биологи', label: '🧬 Биологи' },
    { id: 'Математик', label: '📐 Математик' },
    { id: 'Инженерчлэл', label: '⚙️ Инженерчлэл' },
    { id: 'Сансар судлал', label: '🪐 Сансар судлал' },
    { id: 'Компьютер', label: '💻 Компьютерийн шинжлэх ухаан' },
    { id: 'AI', label: '🤖 Хиймэл оюун' }
  ];

  function getActiveUser() {
    if (window.suAuth && typeof window.suAuth.getCurrentUser === 'function') {
      return window.suAuth.getCurrentUser();
    }
    return null;
  }

  function getActiveMail() {
    if (window.suAuth && typeof window.suAuth.getCurrentMail === 'function') {
      return window.suAuth.getCurrentMail();
    }
    return null;
  }

  function syncAllAvatars(photo) {
    const topAv = document.querySelector('.who .avatar');
    const deskAv = document.querySelector('.su-dc-avatar-mini');
    const prAv = $('prAvatar');
    const prPrev = $('prPreview');

    [topAv, deskAv].forEach(el => {
      if (el) {
        if (photo) {
          el.style.backgroundImage = 'url("' + photo + '")';
          el.style.backgroundSize = 'cover';
          el.style.backgroundPosition = 'center';
          el.classList.add('has-photo');
        } else {
          el.style.backgroundImage = '';
          el.classList.remove('has-photo');
        }
      }
    });

    [prAv, prPrev].forEach(el => {
      if (el) {
        el.innerHTML = '';
        if (photo) {
          const im = document.createElement('img');
          im.src = photo;
          im.alt = 'Профайл зураг';
          im.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
          el.appendChild(im);
        } else {
          el.textContent = '👤';
        }
      }
    });
  }

  function screen(name) {
    root.querySelectorAll('[data-prscreen]').forEach(x => x.classList.toggle('active', x.dataset.prscreen === name));
    root.scrollTop = 0;
  }

  function refresh() {
    const u = getActiveUser();
    const mail = getActiveMail();
    const isLoggedIn = !!(u && mail);

    // 1. Account header & status
    if (isLoggedIn) {
      const displayName = u.name || mail.split('@')[0] || 'Судлаач';
      if ($('prName')) $('prName').textContent = displayName;
      if ($('prEmailDisplay')) $('prEmailDisplay').textContent = mail;
      if ($('prCreditBadge')) $('prCreditBadge').textContent = '★ ' + (u.credits || 0) + ' кредит';
      if ($('prLevel')) $('prLevel').textContent = u.goal ? 'Зорилго: ' + u.goal : 'Science Universe Судлаач';
      if ($('prAccountEmailText')) $('prAccountEmailText').textContent = mail;
      if ($('prAccountCreditsText')) $('prAccountCreditsText').textContent = '★ ' + (u.credits || 0);
      if ($('prLoggedInAccountView')) $('prLoggedInAccountView').style.display = 'block';
      if ($('prGuestAccountView')) $('prGuestAccountView').style.display = 'none';
      syncAllAvatars(u.photo || '');
      root.style.setProperty('--pr-accent', u.accent || '#5b83e8');
    } else {
      if ($('prName')) $('prName').textContent = 'Зочин судлаач';
      if ($('prEmailDisplay')) $('prEmailDisplay').textContent = 'Бүртгэлгүй (Зочин)';
      if ($('prCreditBadge')) $('prCreditBadge').textContent = '★ 0 кредит';
      if ($('prLevel')) $('prLevel').textContent = 'Science Universe';
      if ($('prAccountEmailText')) $('prAccountEmailText').textContent = 'Зочин хэрэглэгч';
      if ($('prAccountCreditsText')) $('prAccountCreditsText').textContent = '★ 0';
      if ($('prLoggedInAccountView')) $('prLoggedInAccountView').style.display = 'none';
      if ($('prGuestAccountView')) $('prGuestAccountView').style.display = 'block';
      syncAllAvatars('');
    }

    // 2. Edit form fields
    if ($('prEditName')) $('prEditName').value = isLoggedIn ? (u.name || '') : 'Зочин судлаач';
    if ($('prEditEmail')) $('prEditEmail').value = isLoggedIn ? mail : 'Бүртгэлгүй (Зочин)';
    if ($('prEditBio')) $('prEditBio').value = isLoggedIn ? (u.bio || '') : '';
    if ($('prEditGoal')) $('prEditGoal').value = isLoggedIn ? (u.goal || '') : '';
    if ($('prNotes')) $('prNotes').value = isLoggedIn ? (u.notes || '') : '';
    if ($('prEditMessage')) $('prEditMessage').textContent = '';
    tempPhoto = undefined;

    // 3. Render lists
    renderInterests();
    renderPalette();
    renderAccounts();
  }

  function renderAccounts() {
    const el = $('prAccountList');
    if (!el) return;
    el.innerHTML = '';

    const allUsers = (window.suAuth && typeof window.suAuth.getUsers === 'function') ? window.suAuth.getUsers() : {};
    const curMail = getActiveMail();
    const emails = Object.keys(allUsers);

    if (emails.length === 0) {
      el.innerHTML = '<div style="padding:14px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:12px;text-align:center;color:#9daac1;font-size:12.5px">Энэ төхөөрөмж дээр өөр бүртгэлтэй хаяг хараахан байхгүй байна.</div>';
      return;
    }

    emails.forEach(m => {
      const u = allUsers[m];
      const isCur = (m === curMail);
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:12px;background:' + (isCur ? 'rgba(91,107,255,0.16)' : 'rgba(255,255,255,0.04)') + ';border:1px solid ' + (isCur ? '#5b6bff' : 'rgba(255,255,255,0.1)');

      const left = document.createElement('div');
      left.style.cssText = 'display:flex;align-items:center;gap:10px;min-width:0;flex:1';

      const av = document.createElement('div');
      av.style.cssText = 'width:36px;height:36px;border-radius:50%;background:#1d2948;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;font-size:18px';
      if (u.photo) {
        const im = document.createElement('img');
        im.src = u.photo;
        im.style.cssText = 'width:100%;height:100%;object-fit:cover';
        av.appendChild(im);
      } else {
        av.textContent = '👤';
      }

      const meta = document.createElement('div');
      meta.style.cssText = 'min-width:0;flex:1';
      const name = document.createElement('div');
      name.style.cssText = 'font-weight:700;font-size:13px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      name.textContent = u.name || m.split('@')[0];
      const mailEl = document.createElement('div');
      mailEl.style.cssText = 'font-size:11px;color:#8da4dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
      mailEl.textContent = m + ' · ★ ' + (u.credits || 0);
      meta.append(name, mailEl);
      left.append(av, meta);

      const right = document.createElement('div');
      if (isCur) {
        const pill = document.createElement('span');
        pill.style.cssText = 'font-size:11px;font-weight:700;color:#5effd8;background:rgba(30,200,160,0.16);border:1px solid rgba(30,200,160,0.4);border-radius:12px;padding:3px 8px';
        pill.textContent = 'Идэвхтэй ✓';
        right.appendChild(pill);
      } else {
        const swBtn = document.createElement('button');
        swBtn.type = 'button';
        swBtn.style.cssText = 'background:rgba(90,140,255,0.2);border:1px solid rgba(90,140,255,0.4);color:#fff;border-radius:8px;padding:5px 12px;font-size:11.5px;font-weight:600;cursor:pointer';
        swBtn.textContent = 'Нэвтрэх →';
        swBtn.onclick = () => {
          pendingSwitchMail = m;
          const modal = $('suSwitchConfirmModal');
          const txt = $('suSwitchModalText');
          if (txt) txt.textContent = 'Та одоогийн сессийг дуусгаж, ' + m + ' хаягаар нэвтрэх үү?';
          if (modal) modal.style.display = 'flex';
        };
        right.appendChild(swBtn);
      }

      card.append(left, right);
      el.appendChild(card);
    });
  }

  function renderInterests() {
    const el = $('prInterests');
    if (!el) return;
    el.innerHTML = '';

    const u = getActiveUser();
    selectedInterests = (u && Array.isArray(u.interests)) ? [...u.interests] : (selectedInterests || []);

    ALL_INTERESTS.forEach(item => {
      const b = document.createElement('button');
      b.type = 'button';
      const isSel = selectedInterests.includes(item.id);
      b.className = 'pr-chip' + (isSel ? ' selected' : '');
      b.textContent = item.label;
      b.style.cssText = 'padding:10px 14px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s ease;' + (isSel ? 'background:rgba(91,107,255,0.28);border:1.5px solid #5b6bff;color:#fff;box-shadow:0 0 12px rgba(91,107,255,0.4)' : 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);color:#c2d2ea');
      b.onclick = () => {
        const idx = selectedInterests.indexOf(item.id);
        if (idx >= 0) selectedInterests.splice(idx, 1);
        else selectedInterests.push(item.id);
        renderInterests();
      };
      el.appendChild(b);
    });
  }

  function renderPalette() {
    const el = $('prPalette');
    if (!el) return;
    el.innerHTML = '';
    const u = getActiveUser();
    const curColor = (u && u.accent) || '#5b83e8';
    ['#5b83e8', '#00f2fe', '#a855f7', '#ffd166', '#10b981', '#ff4757'].forEach(c => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pr-swatch' + (curColor === c ? ' selected' : '');
      b.style.background = c;
      b.title = c;
      b.onclick = () => {
        root.style.setProperty('--pr-accent', c);
        if (window.suAuth && getActiveUser()) {
          window.suAuth.updateCurrentUser({ accent: c });
        }
        renderPalette();
      };
      el.appendChild(b);
    });
  }

  function openProfile() {
    refresh();
    screen('home');
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    root.classList.remove('open');
    const modal1 = $('suLogoutConfirmModal');
    if (modal1) modal1.style.display = 'none';
    const modal2 = $('suSwitchConfirmModal');
    if (modal2) modal2.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.openProfile = openProfile;
  window.closeProfile = closeProfile;

  // Global triggers
  document.addEventListener('click', (e) => {
    const el = e.target.closest('button, a, .who, [data-open="profile"]');
    if (!el) return;
    const txt = (el.textContent || '').trim().toLowerCase();
    if (el.matches('.who') || el.dataset.open === 'profile' || txt === 'profile' || txt.includes('профайл')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openProfile();
    }
  }, true);

  if ($('prClose')) $('prClose').onclick = closeProfile;
  if ($('prCloseBottom')) $('prCloseBottom').onclick = closeProfile;
  root.addEventListener('click', (e) => { if (e.target === root) closeProfile(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('open')) closeProfile(); });

  root.querySelectorAll('[data-propen]').forEach(x => x.onclick = () => screen(x.dataset.propen));
  root.querySelectorAll('[data-prback]').forEach(x => x.onclick = () => { refresh(); screen('home'); });

  // Photo change triggers
  if ($('prAvatar')) $('prAvatar').onclick = () => screen('edit');
  if ($('prChangePhotoBtn')) $('prChangePhotoBtn').onclick = () => { if ($('prPhoto')) $('prPhoto').click(); };
  if ($('prPreview')) $('prPreview').onclick = () => { if ($('prPhoto')) $('prPhoto').click(); };

  if ($('prPhoto')) {
    $('prPhoto').onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) {
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#ff6b6b';
          $('prEditMessage').textContent = 'Зөвхөн JPG, PNG эсвэл WEBP зураг сонгоно уу.';
        }
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#ff6b6b';
          $('prEditMessage').textContent = 'Зургийн хэмжээ 5MB-аас бага байх ёстой.';
        }
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = c.height = 256;
          const side = Math.min(img.width, img.height);
          const ctx = c.getContext('2d');
          ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
          tempPhoto = c.toDataURL('image/jpeg', 0.85);
          syncAllAvatars(tempPhoto);
          if ($('prEditMessage')) {
            $('prEditMessage').style.color = '#5effd8';
            $('prEditMessage').textContent = 'Зураг сонгогдлоо. "Хадгалах" дарж баталгаажуулна уу.';
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    };
  }

  if ($('prRemove')) {
    $('prRemove').onclick = () => {
      tempPhoto = '';
      syncAllAvatars('');
      if ($('prPhoto')) $('prPhoto').value = '';
      if ($('prEditMessage')) {
        $('prEditMessage').style.color = '#ffd166';
        $('prEditMessage').textContent = 'Зураг арилгагдлаа. "Хадгалах" дарж баталгаажуулна уу.';
      }
    };
  }

  // Personal Info Save & Cancel
  if ($('prSaveEdit')) {
    $('prSaveEdit').onclick = () => {
      const u = getActiveUser();
      const mail = getActiveMail();
      if (!u || !mail) {
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#ff6b6b';
          $('prEditMessage').textContent = 'Зочин горимд хувийн мэдээлэл хадгалах боломжгүй. Эхлээд нэвтэрнэ үү.';
        }
        return;
      }

      const name = ($('prEditName')?.value || '').trim();
      if (!name || name.length < 2) {
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#ff6b6b';
          $('prEditMessage').textContent = 'Дэлгэцийн нэрээ дор хаяж 2 тэмдэгттэй оруулна уу.';
        }
        if ($('prEditName')) $('prEditName').focus();
        return;
      }

      const bio = ($('prEditBio')?.value || '').trim();
      const goal = ($('prEditGoal')?.value || '').trim();

      const patch = { name, bio, goal };
      if (tempPhoto !== undefined) {
        patch.photo = tempPhoto;
      }

      if ($('prEditMessage')) {
        $('prEditMessage').style.color = '#00f2fe';
        $('prEditMessage').textContent = 'Хадгалж байна...';
      }

      const ok = window.suAuth && window.suAuth.updateCurrentUser(patch);
      if (ok) {
        tempPhoto = undefined;
        refresh();
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#5effd8';
          $('prEditMessage').textContent = '✓ Хувийн мэдээлэл амжилттай хадгалагдлаа.';
        }
        setTimeout(() => {
          screen('home');
        }, 700);
      } else {
        if ($('prEditMessage')) {
          $('prEditMessage').style.color = '#ff6b6b';
          $('prEditMessage').textContent = 'Мэдээлэл хадгалахад алдаа гарлаа.';
        }
      }
    };
  }

  if ($('prCancelEdit')) {
    $('prCancelEdit').onclick = () => {
      tempPhoto = undefined;
      refresh();
      screen('home');
    };
  }

  // Interests Save
  if ($('prSaveInterestsBtn')) {
    $('prSaveInterestsBtn').onclick = () => {
      const u = getActiveUser();
      if (!u) {
        if ($('prInterestsMessage')) {
          $('prInterestsMessage').style.color = '#ff6b6b';
          $('prInterestsMessage').textContent = 'Зочин горимд хадгалах боломжгүй. Эхлээд нэвтэрнэ үү.';
        }
        return;
      }
      const ok = window.suAuth && window.suAuth.updateCurrentUser({ interests: selectedInterests });
      if (ok) {
        if ($('prInterestsMessage')) {
          $('prInterestsMessage').style.color = '#5effd8';
          $('prInterestsMessage').textContent = '✓ Сонирхол амжилттай хадгалагдлаа.';
        }
        setTimeout(() => {
          screen('home');
        }, 700);
      }
    };
  }

  // Notes Save
  if ($('prSaveNotes')) {
    $('prSaveNotes').onclick = () => {
      const u = getActiveUser();
      if (!u) {
        if ($('prNotesMessage')) {
          $('prNotesMessage').style.color = '#ff6b6b';
          $('prNotesMessage').textContent = 'Зочин горимд хадгалах боломжгүй. Эхлээд нэвтэрнэ үү.';
        }
        return;
      }
      const notes = ($('prNotes')?.value || '');
      const ok = window.suAuth && window.suAuth.updateCurrentUser({ notes });
      if ($('prNotesMessage')) {
        $('prNotesMessage').style.color = ok ? '#5effd8' : '#ff6b6b';
        $('prNotesMessage').textContent = ok ? '✓ Тэмдэглэл хадгалагдлаа.' : 'Хадгалах боломжгүй.';
      }
    };
  }

  // Logout Confirmation Flow
  if ($('prLogoutBtn')) {
    $('prLogoutBtn').onclick = (e) => {
      e.preventDefault();
      const modal = $('suLogoutConfirmModal');
      if (modal) modal.style.display = 'flex';
    };
  }

  if ($('suLogoutCancel')) {
    $('suLogoutCancel').onclick = () => {
      const modal = $('suLogoutConfirmModal');
      if (modal) modal.style.display = 'none';
    };
  }

  if ($('suLogoutConfirm')) {
    $('suLogoutConfirm').onclick = () => {
      const modal = $('suLogoutConfirmModal');
      if (modal) modal.style.display = 'none';
      if (window.suAuth && typeof window.suAuth.logout === 'function') {
        window.suAuth.logout();
      }
    };
  }

  // Account Switching Flow
  if ($('prAddAccountBtn')) {
    $('prAddAccountBtn').onclick = () => {
      pendingSwitchMail = '';
      const modal = $('suSwitchConfirmModal');
      const txt = $('suSwitchModalText');
      if (txt) txt.textContent = 'Өөр хаягаар нэвтрэхийн тулд одоогийн сессийг дуусгах уу?';
      if (modal) modal.style.display = 'flex';
    };
  }

  if ($('suSwitchCancel')) {
    $('suSwitchCancel').onclick = () => {
      const modal = $('suSwitchConfirmModal');
      if (modal) modal.style.display = 'none';
      pendingSwitchMail = null;
    };
  }

  if ($('suSwitchConfirm')) {
    $('suSwitchConfirm').onclick = () => {
      const modal = $('suSwitchConfirmModal');
      if (modal) modal.style.display = 'none';
      const target = pendingSwitchMail;
      pendingSwitchMail = null;
      if (window.suAuth && typeof window.suAuth.openLoginSheet === 'function') {
        window.suAuth.openLoginSheet(target || '');
      }
    };
  }

  // Guest view login button
  if ($('prLoginModalBtn')) {
    $('prLoginModalBtn').onclick = () => {
      closeProfile();
      if (window.suAuth && typeof window.suAuth.openLoginSheet === 'function') {
        window.suAuth.openLoginSheet('');
      }
    };
  }

})();
</script>`;

// Replace the entire old suProfile markup and script
html = html.substring(0, profileIndex) + newProfileHTML + html.substring(profileScriptEnd);

// 4. Add the CSS for confirmation modals and desktop frosted glass
const profileCustomCSS = `
/* Profile Modal & Confirmation Backdrop Styles */
.su-profile-modal-backdrop {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483600 !important;
  background: rgba(3, 7, 22, 0.78) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
}
.su-profile-confirm-card {
  width: 100% !important;
  max-width: 360px !important;
  background: #0f1830 !important;
  border: 1px solid rgba(90, 140, 255, 0.35) !important;
  border-radius: 20px !important;
  padding: 24px 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(90, 140, 255, 0.15) !important;
}
.who .avatar.has-photo::before,
.who .avatar.has-photo::after,
.su-dc-avatar-mini.has-photo::before {
  display: none !important;
}
@media (min-width: 1024px) {
  #suProfile {
    background: rgba(4, 7, 20, 0.82) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    display: none;
    align-items: center !important;
    justify-content: center !important;
    padding: 24px !important;
  }
  #suProfile.open {
    display: flex !important;
  }
  #suProfile .pr-page {
    width: 100% !important;
    max-width: 520px !important;
    min-height: auto !important;
    max-height: 88vh !important;
    border-radius: 24px !important;
    border: 1px solid rgba(90, 140, 255, 0.3) !important;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85), 0 0 30px rgba(90, 140, 255, 0.2) !important;
    overflow-y: auto !important;
    padding: 26px 24px 30px !important;
  }
}
`;

const firstStyleClose = html.indexOf('</style>');
if (firstStyleClose !== -1) {
  html = html.substring(0, firstStyleClose) + '\n' + profileCustomCSS + '\n' + html.substring(firstStyleClose);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully applied Complete Profile & Account Management System to index.html!');

