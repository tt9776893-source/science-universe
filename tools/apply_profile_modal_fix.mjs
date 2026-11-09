import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix the CSS rule for .su-profile-modal-backdrop around line 527
const oldBackdropCSS = `.su-profile-modal-backdrop {
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
}`;

const newBackdropCSS = `.su-profile-modal-backdrop {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483600 !important;
  background: rgba(3, 7, 22, 0.78) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  display: none !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 16px !important;
  opacity: 0;
  pointer-events: none !important;
  transition: opacity 0.2s ease;
}
.su-profile-modal-backdrop.open {
  display: flex !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}`;

if (!html.includes(oldBackdropCSS)) {
  console.error('Could not find oldBackdropCSS');
  process.exit(1);
}
html = html.replace(oldBackdropCSS, newBackdropCSS);

// 2. Locate the Profile HTML and Script block
const profileStartTag = '<div id="suProfile"';
const profileIndex = html.indexOf(profileStartTag);
const scriptCloseTag = '</script>';
const profileScriptEnd = html.indexOf(scriptCloseTag, html.indexOf('<script id="su-profile-engine-script"', profileIndex)) + scriptCloseTag.length;

if (profileIndex === -1 || profileScriptEnd === -1) {
  console.error('Could not find suProfile block boundaries');
  process.exit(1);
}

// 3. Complete Profile HTML Structure with guaranteed visibility of all menu items from Screenshot 2
const completeProfileHTML = `<div id="suProfile" role="dialog" aria-modal="true" aria-label="Профайл">
  <div class="pr-page">

    <!-- Screen 1: Home Profile Overview (Screenshot 2 Standard) -->
    <div class="pr-screen active" data-prscreen="home">
      <header class="pr-top">
        <h2>Профайл</h2>
        <button class="pr-back" id="prClose" type="button" style="cursor:pointer;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:6px 14px;color:#fff;font-size:13.5px;font-weight:600;display:inline-flex;align-items:center;gap:5px" title="Профайл хаах">✕ Хаах</button>
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

      <!-- Section: ПРОФАЙЛ -->
      <div class="pr-section">
        <h3>ПРОФАЙЛ</h3>
        <button class="pr-row" data-propen="switch" type="button" id="prRowSwitch">
          <span>⇄</span>
          <span class="pr-copy">Профайл солих<small>Өөр бүртгэлтэй хаяг сонгох эсвэл шинээр нэвтрэх</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <!-- Section: БҮРТГЭЛ -->
      <div class="pr-section">
        <h3>БҮРТГЭЛ</h3>
        <button class="pr-row" data-propen="edit" type="button" id="prRowEdit">
          <span>👤</span>
          <span class="pr-copy">Хувийн мэдээлэл<small>Нэр, зураг, танилцуулга, зорилго</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="interests" type="button" id="prRowInterests">
          <span>📚</span>
          <span class="pr-copy">Миний сонирхол<small>Шинжлэх ухааны салбарууд, лабораториуд</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="notes" type="button" id="prRowNotes">
          <span>📝</span>
          <span class="pr-copy">Миний тэмдэглэл<small>Сурсан зүйл, санаагаа хадгалах</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <!-- Section: ТОХИРГОО -->
      <div class="pr-section">
        <h3>ТОХИРГОО</h3>
        <button class="pr-row" data-propen="appearance" type="button" id="prRowAppearance">
          <span>🎨</span>
          <span class="pr-copy">Хүрээ<small>Профайлын өнгөний загвар сонгох</small></span>
          <span class="pr-arrow">›</span>
        </button>
        <button class="pr-row" data-propen="about" type="button" id="prRowAbout">
          <span>ⓘ</span>
          <span class="pr-copy">Аппын тухай<small>Science Universe · сургалтын платформ</small></span>
          <span class="pr-arrow">›</span>
        </button>
      </div>

      <div style="margin-top:24px;padding-bottom:12px">
        <button class="pr-action" id="prCloseBottom" type="button" style="width:100%;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.25);color:#fff;padding:12px;border-radius:12px;cursor:pointer;font-size:14px;font-weight:600">✕ Профайлаас гарах / Хаах</button>
      </div>
    </div>

    <!-- Screen 2: Edit Personal Information -->
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

    <!-- Screen 3: My Interests -->
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

    <!-- Screen 4: Notes -->
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

    <!-- Screen 5: Appearance (Frame Color) -->
    <div class="pr-screen" data-prscreen="appearance">
      <header class="pr-top">
        <button class="pr-back" data-prback type="button">← Буцах</button>
        <h2>Хүрээ</h2>
      </header>
      <p class="pr-help">Профайлын өнгөө сонгож өөрт тохируулаарай.</p>
      <div class="pr-palette" id="prPalette"></div>
    </div>

    <!-- Screen 6: About Science Universe -->
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
  <div id="suLogoutConfirmModal" class="su-profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="suLogoutModalTitle">
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

  <!-- Switch Profile Confirmation Modal Dialog (Screenshot 1 Standard) -->
  <div id="suSwitchConfirmModal" class="su-profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="suSwitchModalTitle">
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
    root.querySelectorAll('[data-prscreen]').forEach(x => {
      x.classList.toggle('active', x.dataset.prscreen === name);
    });
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

  // --- Modal Open & Close State Helpers ---
  function openSwitchModal() {
    const modal = $('suSwitchConfirmModal');
    if (modal) {
      modal.classList.add('open');
      modal.style.setProperty('display', 'flex', 'important');
      modal.style.setProperty('pointer-events', 'auto', 'important');
    }
  }

  function closeSwitchModal() {
    const modal = $('suSwitchConfirmModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
    }
  }

  function openLogoutModal() {
    const modal = $('suLogoutConfirmModal');
    if (modal) {
      modal.classList.add('open');
      modal.style.setProperty('display', 'flex', 'important');
      modal.style.setProperty('pointer-events', 'auto', 'important');
    }
  }

  function closeLogoutModal() {
    const modal = $('suLogoutConfirmModal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
    }
  }

  function openProfile() {
    closeSwitchModal();
    closeLogoutModal();
    refresh();
    screen('home');
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    closeSwitchModal();
    closeLogoutModal();
    root.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.openProfile = openProfile;
  window.closeProfile = closeProfile;
  window.suCloseSwitchModal = closeSwitchModal;
  window.suCloseLogoutModal = closeLogoutModal;

  // Global trigger to open profile from outside (ONLY when clicking outside #suProfile)
  document.addEventListener('click', (e) => {
    // If click originates inside #suProfile, DO NOT intercept!
    if (e.target && e.target.closest('#suProfile')) return;

    const el = e.target.closest('button, a, .who, [data-open="profile"]');
    if (!el) return;
    const txt = (el.textContent || '').trim().toLowerCase();
    if (el.matches('.who') || el.dataset.open === 'profile' || txt === 'profile' || el.id === 'logout' || el.matches('[data-qa-action="profile"]')) {
      e.preventDefault();
      openProfile();
    }
  });

  // Close buttons
  if ($('prClose')) $('prClose').onclick = closeProfile;
  if ($('prCloseBottom')) $('prCloseBottom').onclick = closeProfile;
  root.addEventListener('click', (e) => { if (e.target === root) closeProfile(); });

  // Escape key handler
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const swModal = $('suSwitchConfirmModal');
      if (swModal && (swModal.classList.contains('open') || swModal.style.display === 'flex')) {
        e.preventDefault();
        e.stopPropagation();
        closeSwitchModal();
        return;
      }
      const lgModal = $('suLogoutConfirmModal');
      if (lgModal && (lgModal.classList.contains('open') || lgModal.style.display === 'flex')) {
        e.preventDefault();
        e.stopPropagation();
        closeLogoutModal();
        return;
      }
      if (root.classList.contains('open')) {
        closeProfile();
      }
    }
  });

  // Navigation rows on Home screen
  root.querySelectorAll('[data-propen]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const targetScreen = btn.dataset.propen;
      if (targetScreen === 'switch') {
        openSwitchModal();
      } else {
        screen(targetScreen);
      }
    };
  });

  // Back button on sub-screens
  root.querySelectorAll('[data-prback]').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      refresh();
      screen('home');
    };
  });

  // Switch Modal buttons
  if ($('suSwitchCancel')) {
    $('suSwitchCancel').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSwitchModal();
    };
  }

  if ($('suSwitchConfirm')) {
    $('suSwitchConfirm').onclick = (e) => {
      e.preventDefault();
      closeSwitchModal();
      closeProfile();
      if (window.suAuth && typeof window.suAuth.openLoginSheet === 'function') {
        window.suAuth.openLoginSheet('');
      }
    };
  }

  // Logout Modal buttons
  if ($('prLogoutBtn')) {
    $('prLogoutBtn').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLogoutModal();
    };
  }

  if ($('suLogoutCancel')) {
    $('suLogoutCancel').onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeLogoutModal();
    };
  }

  if ($('suLogoutConfirm')) {
    $('suLogoutConfirm').onclick = (e) => {
      e.preventDefault();
      closeLogoutModal();
      if (window.suAuth && typeof window.suAuth.logout === 'function') {
        window.suAuth.logout();
      }
    };
  }

  // Guest login button
  if ($('prLoginModalBtn')) {
    $('prLoginModalBtn').onclick = () => {
      closeProfile();
      if (window.suAuth && typeof window.suAuth.openLoginSheet === 'function') {
        window.suAuth.openLoginSheet('');
      }
    };
  }

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

})();
</script>`;

// Replace the entire old suProfile HTML and script
html = html.substring(0, profileIndex) + completeProfileHTML + html.substring(profileScriptEnd);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully applied Profile Modal and Menu Settings Fix to index.html!');

