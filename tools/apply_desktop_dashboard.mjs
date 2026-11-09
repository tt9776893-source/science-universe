import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Locate #lab and its inner elements
const labOpenTag = '<div class="view" id="lab">';
const labIndex = html.indexOf(labOpenTag);
if (labIndex === -1) {
  console.error('Could not find #lab');
  process.exit(1);
}

const hubTag = '<div class="hub" id="hub">';
const focusTag = '<div class="focus" id="focus">';
const toastTag = '<div aria-live="polite" class="toast" id="toast" role="status"></div>';

const hubStart = html.indexOf(hubTag, labIndex);
const focusStart = html.indexOf(focusTag, labIndex);
const toastStart = html.indexOf(toastTag, labIndex);

if (hubStart === -1 || focusStart === -1 || toastStart === -1) {
  console.error('Could not locate hub, focus, or toast inside #lab');
  process.exit(1);
}

const hubAndFocusBlock = html.substring(hubStart, toastStart).trim();

// 2. New Dashboard markup for Desktop command center
const newDashboardHTML = `<div class="su-desk-dashboard-grid">
  <!-- LEFT SIDEBAR (DESKTOP ONLY) -->
  <aside class="su-desk-sidebar su-desk-left su-desk-only" aria-label="Судлаачийн мэдээлэл">
    <!-- Card 1: User Level & XP -->
    <div class="su-desk-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">👤</span>
        <span class="su-dc-title">СУДЛААЧИЙН ТӨЛӨВ</span>
        <span class="su-dc-badge">Идэвхтэй</span>
      </div>
      <div class="su-dc-user-row">
        <div class="su-dc-avatar-mini" aria-hidden="true"></div>
        <div class="su-dc-user-meta">
          <b class="su-sync-uname">Судлаач</b>
          <span class="su-user-role">Анхан шатны шинжээч</span>
        </div>
      </div>
      <div class="su-dc-progress-block">
        <div class="su-dc-p-label">
          <span>Түвшин 1 ахиц</span>
          <span class="su-cyan-text">780 / 1,000 XP</span>
        </div>
        <div class="su-dc-p-bar">
          <div class="su-dc-p-fill" style="width: 78%"></div>
        </div>
      </div>
      <div class="su-dc-stat-grid">
        <div class="su-stat-box">
          <div class="su-sb-val">🔥 5</div>
          <div class="su-sb-lbl">Өдөр дараалсан</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val">🧪 14</div>
          <div class="su-sb-lbl">Туршилт хийсэн</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val">📐 42</div>
          <div class="su-sb-lbl">Бодлого бодсон</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val">🔓 6 / 8</div>
          <div class="su-sb-lbl">Лаб нээлттэй</div>
        </div>
      </div>
    </div>

    <!-- Card 2: Recent Activity -->
    <div class="su-desk-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">⏱️</span>
        <span class="su-dc-title">СҮҮЛИЙН ҮЙЛ АЖИЛЛАГАА</span>
      </div>
      <ul class="su-activity-list">
        <li class="su-act-item">
          <span class="su-act-dot cyan"></span>
          <div class="su-act-info">
            <b>Физикийн лаборатори</b>
            <p>Ньютоны II хууль, хурдатгал туршив</p>
            <small>15 минутын өмнө</small>
          </div>
        </li>
        <li class="su-act-item">
          <span class="su-act-dot purple"></span>
          <div class="su-act-info">
            <b>Химийн урвалын 3D өрөө</b>
            <p>Хүчил-суурийн симуляци дуусгав</p>
            <small>Өчигдөр (+50 XP)</small>
          </div>
        </li>
        <li class="su-act-item">
          <span class="su-act-dot gold"></span>
          <div class="su-act-info">
            <b>Математикийн лаборатори</b>
            <p>Квадрат тэгшитгэлийн бодлого бодов</p>
            <small>2 өдрийн өмнө (+15 XP)</small>
          </div>
        </li>
      </ul>
    </div>

    <!-- Card 3: Science Fact -->
    <div class="su-desk-card su-fact-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">💡</span>
        <span class="su-dc-title">ӨДРИЙН СОНИРХОЛТОЙ БАРИМТ</span>
      </div>
      <p class="su-fact-text">
        "Сансар огторгуй нь төгс вакуум орчин тул дууны долгион тарах хийн молекул байдаггүй. Иймээс сансарт ямар ч чанга дэлбэрэлт сонсогддоггүй байна."
      </p>
      <div class="su-fact-tags">
        <span>#Астрофизик</span>
        <span>#ВакуумОрчин</span>
      </div>
    </div>
  </aside>

  <!-- CENTER 3D HERO AREA (Main Lab Rotating Cylinder & Focus) -->
  <div class="su-desk-center">
${hubAndFocusBlock}
  </div>

  <!-- RIGHT SIDEBAR (DESKTOP ONLY) -->
  <aside class="su-desk-sidebar su-desk-right su-desk-only" aria-label="Даалгавар ба хяналт">
    <!-- Card 4: Daily Mission -->
    <div class="su-desk-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">🎯</span>
        <span class="su-dc-title">ӨДРИЙН ДААЛГАВАР</span>
        <span class="su-dc-badge cyan">2/3 Бэлэн</span>
      </div>
      <div class="su-mission-list">
        <div class="su-mission-row done">
          <div class="su-m-check">✓</div>
          <div class="su-m-body">
            <b>Химийн урвал турших</b>
            <small>1 / 1 гүйцэтгэсэн (+15 XP)</small>
          </div>
        </div>
        <div class="su-mission-row in-progress">
          <div class="su-m-check">2/3</div>
          <div class="su-m-body">
            <b>Математикийн 3 бодлого бодох</b>
            <div class="su-mini-bar"><div style="width: 66%"></div></div>
          </div>
        </div>
        <div class="su-mission-row pending">
          <div class="su-m-check">○</div>
          <div class="su-m-body">
            <b>Сансрын загварыг судлах</b>
            <small>Тойрог замын симуляци үзэх</small>
          </div>
        </div>
      </div>
      <div class="su-mission-footer">
        <span>Шагнал:</span>
        <b>+30 ★ Кредит · +100 XP</b>
      </div>
    </div>

    <!-- Card 5: Quick Command Actions -->
    <div class="su-desk-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">⚡</span>
        <span class="su-dc-title">ТҮРГЭН ҮЙЛДЛҮҮД</span>
      </div>
      <div class="su-quick-actions">
        <button class="su-qa-btn" type="button" data-qa-action="space">
          <span class="su-qa-ico">🚀</span>
          <div class="su-qa-txt">
            <b>Сансар судлал</b>
            <small>120 кредитийн өрөө</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="math">
          <span class="su-qa-ico">🧮</span>
          <div class="su-qa-txt">
            <b>Математик бодлого</b>
            <small>Интерактив тооцоолуур</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="ai">
          <span class="su-qa-ico">🤖</span>
          <div class="su-qa-txt">
            <b>AI Лаборатори</b>
            <small>Мэдрэлийн сүлжээний загвар</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="profile">
          <span class="su-qa-ico">🏆</span>
          <div class="su-qa-txt">
            <b>Миний профайл</b>
            <small>Амжилт & тохиргоо</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- Card 6: Lab Status Overview -->
    <div class="su-desk-card">
      <div class="su-dc-head">
        <span class="su-dc-icon">📡</span>
        <span class="su-dc-title">ЛАБОРАТОРИУДЫН ТӨЛӨВ</span>
      </div>
      <div class="su-status-grid">
        <div class="su-status-pill online"><span class="su-s-dot"></span>Физик: Онлайн</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Хими: Онлайн</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>AI Лаб: Онлайн</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Компьютер: Онлайн</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Математик: Онлайн</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Инженер: Онлайн</div>
        <div class="su-status-pill soon"><span class="su-s-dot soon"></span>Биологи: Бэлтгэж байна</div>
        <div class="su-status-pill credit"><span class="su-s-dot credit"></span>Сансар: 120 ★</div>
      </div>
    </div>
  </aside>
</div>

<!-- LOWER DASHBOARD AREA (DESKTOP ONLY) -->
<section class="su-desk-bottom su-desk-only" aria-label="Нэмэлт удирдлагын самбар">
  <!-- Launcher Strip -->
  <div class="su-launcher-deck">
    <div class="su-ld-header">
      <div class="su-ld-title-group">
        <span class="su-ld-icon">🎛️</span>
        <h3>ЛАБОРАТОРИУДЫН ШУУРХАЙ СОНГОЛТ (QUICK LAUNCHER)</h3>
      </div>
      <span class="su-ld-hint">Лаборатори сонгож, шууд өрөө рүү нь шилжинэ үү</span>
    </div>
    <div class="su-launcher-strip">
      <button class="su-launcher-tile" type="button" data-su-wall-idx="0">
        <span class="su-lt-ico">⚛️</span>
        <div class="su-lt-meta"><b>Физик</b><small>Классик механик</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="1">
        <span class="su-lt-ico">🧪</span>
        <div class="su-lt-meta"><b>Хими</b><small>3D Интерактив өрөө</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="2">
        <span class="su-lt-ico">🤖</span>
        <div class="su-lt-meta"><b>Хиймэл оюун</b><small>AI & Алгоритм</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="3">
        <span class="su-lt-ico">🧬</span>
        <div class="su-lt-meta"><b>Биологи</b><small>ДНХ ба эсийн бүтэц</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="4">
        <span class="su-lt-ico">💻</span>
        <div class="su-lt-meta"><b>Компьютер</b><small>Програмчлал & сүлжээ</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="5">
        <span class="su-lt-ico">📐</span>
        <div class="su-lt-meta"><b>Математик</b><small>Тэгшитгэл & график</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="6">
        <span class="su-lt-ico">🚀</span>
        <div class="su-lt-meta"><b>Сансар судлал</b><small>120 кредит түгжээ</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="7">
        <span class="su-lt-ico">⚙️</span>
        <div class="su-lt-meta"><b>Инженерчлэл</b><small>Цахилгаан & дизайн</small></div>
      </button>
    </div>
  </div>

  <!-- Recommended Learning Paths -->
  <div class="su-paths-deck">
    <div class="su-ld-header">
      <div class="su-ld-title-group">
        <span class="su-ld-icon">🧭</span>
        <h3>СУРАЛЦАХЫГ ЗӨВЛӨЖ БУЙ ЧИГЛЭЛҮҮД</h3>
      </div>
      <span class="su-ld-hint">Таны суралцах явцад суурилсан хөтөлбөрүүд</span>
    </div>
    <div class="su-paths-grid">
      <div class="su-path-card" data-path-open="0">
        <div class="su-pc-top">
          <span class="su-pc-cat physics">Физик</span>
          <span class="su-pc-progress-pill">80% дууссан</span>
        </div>
        <h4>Сонгодог механик ба Хөдөлгөөний хуулиуд</h4>
        <p>Ньютоны I, II, III хууль, хүчний тэнцвэр, гравитацын харилцан үйлчлэлийн үндэс.</p>
        <div class="su-pc-bar"><div style="width: 80%"></div></div>
        <div class="su-pc-footer">
          <span>8 сэдэв · 3 туршилт</span>
          <button class="su-pc-btn" type="button">Үргэлжлүүлэх →</button>
        </div>
      </div>

      <div class="su-path-card" data-path-open="1">
        <div class="su-pc-top">
          <span class="su-pc-cat chemistry">Хими</span>
          <span class="su-pc-progress-pill new">Шинэ хөтөлбөр</span>
        </div>
        <h4>Молекулын бүтэц ба Химийн урвалын кинетик</h4>
        <p>Ковалент ба ионы холбоос, уусмалын орчин (pH), экзотерм болон эндотерм урвал.</p>
        <div class="su-pc-bar"><div style="width: 15%"></div></div>
        <div class="su-pc-footer">
          <span>12 сэдэв · 3D симуляци</span>
          <button class="su-pc-btn" type="button">Эхлэх →</button>
        </div>
      </div>

      <div class="su-path-card" data-path-open="5">
        <div class="su-pc-top">
          <span class="su-pc-cat math">Математик</span>
          <span class="su-pc-progress-pill">45% дууссан</span>
        </div>
        <h4>Шугаман тэгшитгэлийн систем ба Аналитик геометр</h4>
        <p>Матриц, вектор, функцийн уламжлал ба олон гишүүнтийн тэгшитгэл бодох аргууд.</p>
        <div class="su-pc-bar"><div style="width: 45%"></div></div>
        <div class="su-pc-footer">
          <span>10 сэдэв · 40 бодлого</span>
          <button class="su-pc-btn" type="button">Үргэлжлүүлэх →</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;

// Replace the central block inside #lab
html = html.substring(0, hubStart) + newDashboardHTML + '\n' + html.substring(toastStart);

// 3. Inject the CSS styles
// Let's create the master desktop layout CSS
const desktopDashboardCSS = `
/* ==========================================================================
   SCIENCE UNIVERSE — MAIN LAB DESKTOP DASHBOARD & COMMAND CENTER STYLES
   ========================================================================== */
.su-desk-only {
  display: none !important;
}
.su-desk-dashboard-grid {
  display: contents !important;
}
.su-desk-center {
  display: contents !important;
}

/* User avatar mini in dashboard */
.su-dc-avatar-mini {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #8d7be0, #2a2a7a);
  border: 1.5px solid #6b7cff;
  box-shadow: 0 0 10px rgba(107, 124, 255, 0.5);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.su-dc-avatar-mini::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e8eaf6;
}
.su-dc-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.su-dc-user-meta {
  display: flex;
  flex-direction: column;
}
.su-dc-user-meta b {
  font-size: 13.5px;
  color: #fff;
}
.su-user-role {
  font-size: 11px;
  color: #9ab0e6;
}
.su-cyan-text {
  color: #00f2fe !important;
  font-weight: 700;
}
.su-dc-progress-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.su-dc-p-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #a8bdfa;
}
.su-dc-p-bar {
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.su-dc-p-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #00f2fe);
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 242, 254, 0.6);
}
.su-dc-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.su-stat-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(90, 140, 255, 0.16);
  border-radius: 10px;
  padding: 8px;
  text-align: center;
}
.su-sb-val {
  font-size: 14.5px;
  font-weight: 800;
  color: #ffffff;
}
.su-sb-lbl {
  font-size: 10.5px;
  color: #9ab0e6;
  margin-top: 2px;
}
.su-activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.su-act-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
}
.su-act-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}
.su-act-dot.cyan { background: #00f2fe; box-shadow: 0 0 8px #00f2fe; }
.su-act-dot.purple { background: #a855f7; box-shadow: 0 0 8px #a855f7; }
.su-act-dot.gold { background: #ffd166; box-shadow: 0 0 8px #ffd166; }
.su-act-info b { display: block; font-size: 12px; color: #fff; }
.su-act-info p { margin: 2px 0; font-size: 11px; color: #b4c6f5; line-height: 1.35; }
.su-act-info small { font-size: 10px; color: #7f95d1; }
.su-fact-text {
  font-size: 11.5px;
  line-height: 1.5;
  color: #cfdbff;
  margin: 0;
}
.su-fact-tags {
  display: flex;
  gap: 8px;
}
.su-fact-tags span {
  font-size: 10.5px;
  color: #7ee787;
  background: rgba(126, 231, 135, 0.12);
  padding: 2px 6px;
  border-radius: 6px;
}
.su-mission-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.su-mission-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 12px;
}
.su-mission-row.done {
  border-color: rgba(30, 200, 160, 0.3);
  background: rgba(30, 200, 160, 0.06);
}
.su-m-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.1);
  color: #9ab0e6;
  flex-shrink: 0;
}
.su-mission-row.done .su-m-check {
  background: #10b981;
  color: #fff;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}
.su-m-body {
  flex: 1;
  min-width: 0;
}
.su-m-body b {
  display: block;
  font-size: 11.5px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.su-m-body small {
  display: block;
  font-size: 10.5px;
  color: #8da4dc;
}
.su-mini-bar {
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-top: 3px;
}
.su-mini-bar div {
  height: 100%;
  background: #00f2fe;
}
.su-mission-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px dashed rgba(168, 85, 247, 0.4);
  color: #d8b4fe;
}
.su-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.su-qa-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(90, 140, 255, 0.2);
  color: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.su-qa-btn:hover {
  background: rgba(90, 140, 255, 0.16);
  border-color: rgba(90, 140, 255, 0.5);
  transform: translateX(3px);
}
.su-qa-ico {
  font-size: 18px;
}
.su-qa-txt {
  flex: 1;
  min-width: 0;
}
.su-qa-txt b {
  display: block;
  font-size: 12px;
  color: #fff;
}
.su-qa-txt small {
  display: block;
  font-size: 10.5px;
  color: #9ab0e6;
}
.su-qa-arrow {
  font-size: 14px;
  color: #7f95d1;
  transition: transform 0.2s;
}
.su-qa-btn:hover .su-qa-arrow {
  color: #00f2fe;
  transform: translateX(2px);
}
.su-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.su-status-pill {
  font-size: 10.5px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #c4d3fa;
  display: flex;
  align-items: center;
  gap: 6px;
}
.su-s-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  flex-shrink: 0;
}
.su-s-dot.soon { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.su-s-dot.credit { background: #8b5cf6; box-shadow: 0 0 6px #8b5cf6; }
`;

// Insert desktopDashboardCSS right before </style> or inside the head styles
const styleClose = '</style>';
const firstStyleClose = html.indexOf(styleClose);
if (firstStyleClose !== -1) {
  html = html.substring(0, firstStyleClose) + '\n' + desktopDashboardCSS + '\n' + html.substring(firstStyleClose);
}

// 4. Update the desktop media query block for .phone.in #lab and .su-desk-dashboard-grid
const targetQuery = '/* Spacious, Immersive Desktop Main Lab */';
const targetPos = html.indexOf(targetQuery);
if (targetPos !== -1) {
  // Let's find the closing of this block before /* Desktop Splash & Login Sheet */
  const nextTarget = '/* Desktop Splash & Login Sheet */';
  const nextPos = html.indexOf(nextTarget, targetPos);
  if (nextPos !== -1) {
    const replacementDesktopCSS = `/* Spacious, Immersive Desktop Main Lab */
  .phone.in #lab {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    padding: 16px 32px 120px !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    background: radial-gradient(90% 50% at 50% 0%, #12308a 0%, transparent 70%), linear-gradient(#060b28, #0a1a4a 55%, #04061a) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scrollbar-width: thin !important;
    scrollbar-color: rgba(90, 140, 255, 0.4) transparent !important;
  }
  #lab .top {
    max-width: 1440px !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding-bottom: 8px !important;
    border-bottom: 1px solid rgba(90, 140, 255, 0.16) !important;
  }
  #lab .title {
    margin: 12px auto 6px auto !important;
    text-align: center !important;
  }
  #lab .title h1.lt {
    font-size: clamp(28px, 3.2vw, 40px) !important;
    letter-spacing: .08em !important;
    margin: 0 0 6px 0 !important;
    line-height: 1.15 !important;
  }
  #lab .title p {
    font-size: clamp(12.5px, 1.1vw, 15px) !important;
    color: #a8bdfa !important;
    letter-spacing: .04em !important;
    margin: 0 !important;
  }
  
  /* Desktop Dashboard Grid Composition */
  .su-desk-only {
    display: block !important;
  }
  .su-desk-dashboard-grid {
    display: grid !important;
    grid-template-columns: 290px minmax(460px, 1fr) 290px !important;
    gap: 20px !important;
    width: 100% !important;
    max-width: 1440px !important;
    margin: 8px auto 26px auto !important;
    align-items: start !important;
  }
  @media (min-width: 1440px) {
    .su-desk-dashboard-grid {
      grid-template-columns: 320px 1fr 320px !important;
      gap: 26px !important;
    }
  }
  @media (max-width: 1200px) and (min-width: 1024px) {
    .su-desk-dashboard-grid {
      grid-template-columns: 260px 1fr 260px !important;
      gap: 16px !important;
    }
  }

  .su-desk-sidebar {
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
    z-index: 5 !important;
  }
  .su-desk-card {
    background: rgba(10, 18, 52, 0.78) !important;
    border: 1px solid rgba(80, 130, 255, 0.28) !important;
    border-radius: 18px !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    box-shadow: 0 10px 30px rgba(0, 4, 24, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    padding: 15px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 11px !important;
    color: #e2e9ff !important;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
  }
  .su-desk-card:hover {
    border-color: rgba(110, 160, 255, 0.48) !important;
    box-shadow: 0 14px 36px rgba(0, 4, 24, 0.7), 0 0 20px rgba(90, 140, 255, 0.22) !important;
  }
  .su-dc-head {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding-bottom: 8px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
  .su-dc-icon {
    font-size: 16px !important;
  }
  .su-dc-title {
    font-size: 11.5px !important;
    font-weight: 700 !important;
    letter-spacing: 0.06em !important;
    color: #a8bdfa !important;
    text-transform: uppercase !important;
    flex: 1 !important;
  }
  .su-dc-badge {
    font-size: 10px !important;
    font-weight: 700 !important;
    padding: 2px 7px !important;
    border-radius: 10px !important;
    background: rgba(30, 200, 160, 0.16) !important;
    border: 1px solid rgba(30, 200, 160, 0.4) !important;
    color: #5effd8 !important;
  }
  .su-dc-badge.cyan {
    background: rgba(0, 242, 254, 0.16) !important;
    border-color: rgba(0, 242, 254, 0.4) !important;
    color: #00f2fe !important;
  }

  .su-desk-center {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    min-height: 470px !important;
    position: relative !important;
  }
  #lab .hub {
    flex: none !important;
    min-height: 420px !important;
    height: 420px !important;
    max-width: 680px !important;
    width: 100% !important;
    margin: 0 auto !important;
    perspective: 1250px !important;
    perspective-origin: 50% 32% !important;
  }
  #lab .tilt {
    left: 50% !important;
    top: 48% !important;
    transform: rotateX(-30deg) scale(1.24) !important;
  }
  #lab .focus {
    max-width: 480px !important;
    width: 100% !important;
    margin: 8px auto 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    z-index: 10 !important;
  }
  #lab .focus .fi b {
    font-size: 19px !important;
  }
  #lab .focus .fi small {
    font-size: 13px !important;
  }
  #lab .focus .rot {
    width: 46px !important;
    height: 46px !important;
    font-size: 24px !important;
  }
  #lab .focus .enter {
    height: 46px !important;
    padding: 0 26px !important;
    font-size: 14.5px !important;
  }

  /* Lower Dashboard Deck */
  .su-desk-bottom {
    width: 100% !important;
    max-width: 1440px !important;
    margin: 0 auto 30px auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
  }
  .su-launcher-deck, .su-paths-deck {
    background: rgba(10, 18, 52, 0.74) !important;
    border: 1px solid rgba(90, 140, 255, 0.25) !important;
    border-radius: 20px !important;
    padding: 18px 22px !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    box-shadow: 0 10px 30px rgba(0, 4, 24, 0.5) !important;
  }
  .su-ld-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 14px !important;
  }
  .su-ld-title-group {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .su-ld-icon { font-size: 18px !important; }
  .su-ld-header h3 {
    margin: 0 !important;
    font-size: 13.5px !important;
    font-weight: 800 !important;
    letter-spacing: 0.06em !important;
    color: #fff !important;
    text-transform: uppercase !important;
  }
  .su-ld-hint {
    font-size: 11.5px !important;
    color: #8da4dc !important;
  }
  .su-launcher-strip {
    display: grid !important;
    grid-template-columns: repeat(8, 1fr) !important;
    gap: 10px !important;
  }
  @media (max-width: 1200px) and (min-width: 1024px) {
    .su-launcher-strip {
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 10px !important;
    }
  }
  .su-launcher-tile {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    padding: 12px 6px !important;
    border-radius: 14px !important;
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(90, 140, 255, 0.2) !important;
    color: #fff !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .su-launcher-tile:hover {
    background: rgba(90, 140, 255, 0.2) !important;
    border-color: rgba(90, 140, 255, 0.6) !important;
    transform: translateY(-3px) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(90, 140, 255, 0.3) !important;
  }
  .su-lt-ico { font-size: 24px !important; margin-bottom: 6px !important; }
  .su-lt-meta b { display: block !important; font-size: 12px !important; color: #fff !important; }
  .su-lt-meta small { display: block !important; font-size: 10px !important; color: #9ab0e6 !important; margin-top: 2px !important; }

  .su-paths-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 16px !important;
  }
  .su-path-card {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(90, 140, 255, 0.2) !important;
    border-radius: 14px !important;
    padding: 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  .su-path-card:hover {
    border-color: rgba(0, 242, 254, 0.45) !important;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 242, 254, 0.2) !important;
    transform: translateY(-2px) !important;
  }
  .su-pc-top {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .su-pc-cat {
    font-size: 11px !important;
    font-weight: 700 !important;
    padding: 2px 8px !important;
    border-radius: 8px !important;
    text-transform: uppercase !important;
  }
  .su-pc-cat.physics { background: rgba(0, 242, 254, 0.15) !important; color: #00f2fe !important; border: 1px solid rgba(0, 242, 254, 0.4) !important; }
  .su-pc-cat.chemistry { background: rgba(168, 85, 247, 0.15) !important; color: #d8b4fe !important; border: 1px solid rgba(168, 85, 247, 0.4) !important; }
  .su-pc-cat.math { background: rgba(59, 130, 246, 0.15) !important; color: #93c5fd !important; border: 1px solid rgba(59, 130, 246, 0.4) !important; }
  .su-pc-progress-pill {
    font-size: 10.5px !important;
    color: #9ab0e6 !important;
  }
  .su-pc-progress-pill.new {
    color: #5effd8 !important;
    font-weight: 700 !important;
  }
  .su-path-card h4 {
    margin: 0 !important;
    font-size: 13.5px !important;
    color: #fff !important;
    line-height: 1.3 !important;
  }
  .su-path-card p {
    margin: 0 !important;
    font-size: 11.5px !important;
    color: #a8bdfa !important;
    line-height: 1.4 !important;
    flex: 1 !important;
  }
  .su-pc-bar {
    height: 5px !important;
    border-radius: 3px !important;
    background: rgba(255, 255, 255, 0.1) !important;
    overflow: hidden !important;
  }
  .su-pc-bar div {
    height: 100% !important;
    background: linear-gradient(90deg, #7c3aed, #00f2fe) !important;
    border-radius: 3px !important;
  }
  .su-pc-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    font-size: 11px !important;
    color: #8da4dc !important;
    margin-top: 2px !important;
  }
  .su-pc-btn {
    background: rgba(90, 140, 255, 0.15) !important;
    border: 1px solid rgba(90, 140, 255, 0.35) !important;
    color: #fff !important;
    font-size: 11.5px !important;
    font-weight: 600 !important;
    padding: 4px 12px !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
  }
  .su-pc-btn:hover {
    background: #5b6bff !important;
    box-shadow: 0 0 12px rgba(91, 107, 255, 0.6) !important;
  }

  `;
    html = html.substring(0, targetPos) + replacementDesktopCSS + html.substring(nextPos);
  }
}

// 5. Inject the JavaScript interaction script
const scriptTag = `
<!-- ===== SCIENCE UNIVERSE DESKTOP DASHBOARD INTERACTION ENGINE ===== -->
<script id="su-desktop-dashboard-script">
(function() {
  function initDesktopDashboard() {
    const ring = document.getElementById('ring');
    const doors = ring ? [].slice.call(ring.querySelectorAll('.wall .card')) : [];

    // 1. Quick Launcher Tiles (all 8 labs)
    document.querySelectorAll('.su-launcher-tile[data-su-wall-idx]').forEach(tile => {
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(tile.dataset.suWallIdx, 10);
        if (doors[idx]) {
          doors[idx].click();
        }
      });
    });

    // 2. Quick Action Buttons
    document.querySelectorAll('.su-qa-btn[data-qa-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const act = btn.dataset.qaAction;
        if (act === 'space' && doors[6]) doors[6].click();
        else if (act === 'math' && doors[5]) doors[5].click();
        else if (act === 'ai' && doors[2]) doors[2].click();
        else if (act === 'profile') {
          const accBtn = document.getElementById('logout');
          if (accBtn) accBtn.click();
        }
      });
    });

    // 3. Recommended Learning Path Buttons
    document.querySelectorAll('.su-path-card[data-path-open]').forEach(card => {
      const btn = card.querySelector('.su-pc-btn');
      const action = () => {
        const idx = parseInt(card.dataset.pathOpen, 10);
        if (doors[idx]) doors[idx].click();
      };
      if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); action(); });
      card.addEventListener('click', action);
    });

    // 4. Real-time User and Credit Synchronization
    function syncDashboardData() {
      const uname = document.getElementById('uname')?.textContent || 'Судлаач';
      const credits = document.getElementById('credits')?.textContent || '0';
      document.querySelectorAll('.su-sync-uname').forEach(el => el.textContent = uname);
      document.querySelectorAll('.su-sync-credits').forEach(el => el.textContent = credits);
    }
    syncDashboardData();

    // Observe changes to #uname and #credits
    const unameEl = document.getElementById('uname');
    const creditsEl = document.getElementById('credits');
    if (window.MutationObserver) {
      const obs = new MutationObserver(syncDashboardData);
      if (unameEl) obs.observe(unameEl, { childList: true, characterData: true, subtree: true });
      if (creditsEl) obs.observe(creditsEl, { childList: true, characterData: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopDashboard);
  } else {
    initDesktopDashboard();
  }
})();
</script>
`;

const bodyClose = '</body>';
const bodyClosePos = html.lastIndexOf(bodyClose);
if (bodyClosePos !== -1) {
  html = html.substring(0, bodyClosePos) + '\n' + scriptTag + '\n' + html.substring(bodyClosePos);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully applied Desktop Dashboard and Main Lab empty space filling to index.html!');
