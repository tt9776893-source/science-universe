/* Builds the integrated Science Universe project.
 *   node tools/build_integration.mjs
 * Sources are never modified: Space Lab / Explore / Build are transformed COPIES. */
import fs from 'fs';
import path from 'path';

const ROOT = 'D:/shine negtgel/';
const MAIN_SRC = 'C:/Users/DELL/Desktop/negtgel/science_universe_rotating_planet1111.html';
const BUILD_SRC = ROOT + 'rocket_space_lab_v70_no_blue_arc (1).html';
const RF_DIR = 'REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED/REALITY-FORGE-ROCKET-SOLAR-ONLY/';
const EXP_DIR = 'SCIENCE_UNIVERSE_PROJECT_BACKUP/';
const w = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const log = (...a) => console.log(...a);

/* ------------------------------------------------------------------ Space Lab */
function buildSpaceLab(file, outName) {
  const t = fs.readFileSync(ROOT + RF_DIR + file, 'utf8');
  const css = t.slice(t.indexOf('<style>') + 7, t.indexOf('</style>'));
  const bodyStart = t.indexOf('<body>') + 6;
  const sIdx = t.indexOf('<script type="module">');
  const sEnd = t.lastIndexOf('</script>');
  const html = t.slice(bodyStart, sIdx);
  const tail = t.slice(sEnd + 9).replace(/<\/body>|<\/html>|\s+/g, '');
  if (tail) log('WARN trailing markup in', file, JSON.stringify(tail.slice(0, 80)));
  let js = t.slice(sIdx + '<script type="module">'.length, sEnd);
  const importLines = [];
  js = js.replace(/^\s*import\s+[^;]+;\s*$/gm, (m) => { importLines.push(m.trim()); return ''; });
  const imports = importLines.map((l) => l
    .replace(/'https:\/\/esm\.sh\/three@0\.180\.0\/examples\/jsm\//g, "'three180/examples/jsm/")
    .replace(/'https:\/\/esm\.sh\/three@0\.180\.0'/g, "'three180'"));
  js = js.split('assets/models/').join(RF_DIR + 'assets/models/')
         .split('assets/rockets/').join(RF_DIR + 'assets/rockets/')
         .split('assets/vehicles/').join(RF_DIR + 'assets/vehicles/');
  const out = `/* Space Lab (REALITY FORGE) — ${file}, converted into an embeddable section module.
   Original logic is unchanged; only environment bindings (document/window/location/timers)
   and asset base paths were adapted. */
${imports.join('\n')}
export const css = ${JSON.stringify(css)};
export const html = ${JSON.stringify(html)};
export default async function boot(ctx) {
  const { document, window, location, requestAnimationFrame, cancelAnimationFrame, setTimeout, clearTimeout,
          setInterval, clearInterval, addEventListener, removeEventListener } = ctx;
${js}
}
`;
  w(ROOT + 'sections/spacelab/' + outName, out);
  log('spacelab', outName, 'imports:', imports.length, 'js chars:', js.length);
}
buildSpaceLab('solar_system.html', 'solar.mjs');
buildSpaceLab('surface_dimension.html', 'surface.mjs');

/* -------------------------------------------------------------------- Explore */
const srcRoot = ROOT + EXP_DIR + 'src/';
const outRoot = ROOT + 'sections/explore/src/';
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }
const NAMES = ['document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'AudioContext'];
let nFiles = 0;
for (const f of walk(srcRoot)) {
  if (!f.endsWith('.js') || /main_recovery|\.backup$/.test(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  const rel = path.relative(srcRoot, f).split(path.sep).join('/');
  
  // FIX: compute exact directory depth from sections/explore/src/<rel> back to sections/explore/ctx.js
  // For rel = 'main.js', depth is 1 -> up is '../' -> '../ctx.js' (points to sections/explore/ctx.js)
  // For rel = 'world/MarsSky.js', depth is 2 -> up is '../../' -> '../../ctx.js' (points to sections/explore/ctx.js)
  const depth = rel.split('/').length;
  const up = '../'.repeat(depth);

  const used = NAMES.filter((n) => new RegExp('(?<![.\\w$])' + n + '\\b').test(s)
    && !new RegExp('\\b(const|let|var|function|class)\\s+' + n + '\\b').test(s));
  
  /* asset roots */
  if (rel === 'core/AssetRegistry.js') {
    s = s.replace(/const candidates = isLiveServer[\s\S]*?\];\s*\n/, "const candidates = [ASSET_BASE];\n")
         .replace("this.basePath = '/assets';", 'this.basePath = ASSET_BASE;')
         .replace("this.basePath = isLiveServer ? '/public/assets' : '/assets';", 'this.basePath = ASSET_BASE;');
    used.push('ASSET_BASE');
  }
  if (rel === 'world/VolumetricTerrain.js') {
    s = s.split("'/assets/").join("ASSET_BASE+'/");
    used.push('ASSET_BASE');
  }
  if (rel === 'main.js') {
    const i = s.indexOf("window.__SU_BUILD_ID__ = ");
    s = s.slice(0, i) + `window.__SU_BUILD_ID__ = 'DEV-RECOVERY-20261030-V1';

/* Integrated build: the original DOMContentLoaded bootstrap is exposed as startExplore(),
   called by the Science Universe router when the Explore section opens. */
export async function startExplore() {
  console.info('[SU-BUILD]', window.__SU_BUILD_ID__);
  try {
    const game = new Game();
    window.suGame = game;
    window.game = game;
    await game.init();
    return game;
  } catch (err) {
    console.error('[SU-EXPLORE] Planetary Exploration Init error:', err);
    const ls = document.getElementById('loading-screen');
    if (ls) ls.style.display = 'none';
    const errBox = document.getElementById('loading-error-box');
    if (errBox) {
      errBox.style.display = 'block';
      errBox.innerHTML = '<div style="color:#ff3355;font-weight:800;font-size:15px;margin-bottom:8px">⚠️ EXPLORATION ENGINE NOTICE</div><div style="font-family:monospace;font-size:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:4px;color:#e2f1ff">' + (err.message || err) + '</div>';
    }
  }
}
`;
  }
  if (used.length) {
    s = `import { ${used.join(', ')} } from '${up}ctx.js';\n` + s;
  }
  w(outRoot + rel, s); nFiles++;
}

w(ROOT + 'sections/explore/ctx.js', `/* Environment bridge for the Explore (Frontier) modules.
   router -> bind(sandbox.ctx) BEFORE importing src/main.js. Every module imports the bindings
   it uses from here, so \`document\`, \`window\`, timers ... resolve to the Explore sandbox. */
export const ASSET_BASE = ${JSON.stringify(EXP_DIR + 'public/assets')};
export let document = globalThis.document;
export let window = globalThis.window;
export let requestAnimationFrame = globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame.bind(globalThis) : ((cb) => setTimeout(cb, 16));
export let cancelAnimationFrame = globalThis.cancelAnimationFrame ? globalThis.cancelAnimationFrame.bind(globalThis) : ((id) => clearTimeout(id));
export let setTimeout = globalThis.setTimeout ? globalThis.setTimeout.bind(globalThis) : undefined;
export let clearTimeout = globalThis.clearTimeout ? globalThis.clearTimeout.bind(globalThis) : undefined;
export let setInterval = globalThis.setInterval ? globalThis.setInterval.bind(globalThis) : undefined;
export let clearInterval = globalThis.clearInterval ? globalThis.clearInterval.bind(globalThis) : undefined;
export let AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;

export function bind(c) {
  if (!c) return;
  if (c.document) document = c.document;
  if (c.window) window = c.window;
  if (c.requestAnimationFrame) requestAnimationFrame = c.requestAnimationFrame;
  if (c.cancelAnimationFrame) cancelAnimationFrame = c.cancelAnimationFrame;
  if (c.setTimeout) setTimeout = c.setTimeout;
  if (c.clearTimeout) clearTimeout = c.clearTimeout;
  if (c.setInterval) setInterval = c.setInterval;
  if (c.clearInterval) clearInterval = c.clearInterval;
  if (c.AudioContext) AudioContext = c.AudioContext;
}
`);

{
  const t = fs.readFileSync(ROOT + EXP_DIR + 'index.html', 'utf8');
  const css = t.slice(t.indexOf('<style>') + 7, t.indexOf('</style>'));
  const bs = t.indexOf('<body>') + 6;
  const html = t.slice(bs, t.indexOf('<script type="module" src="./src/main.js">'));
  w(ROOT + 'sections/explore/explore-ui.mjs',
    `/* Explore (Frontier) HUD markup + styles, taken verbatim from SCIENCE_UNIVERSE_PROJECT_BACKUP/index.html */\nexport const css = ${JSON.stringify(css)};\nexport const html = ${JSON.stringify(html)};\n`);
  log('explore ui css', css.length, 'html', html.length, 'files', nFiles);
}

// Also update backup index.html importmap so if opened standalone it doesn't fail on 404 three
try {
  let bkIdx = fs.readFileSync(ROOT + EXP_DIR + 'index.html', 'utf8');
  bkIdx = bkIdx.replace('"./node_modules/three/build/three.module.js"', '"../vendor/three170/build/three.module.js"')
               .replace('"./node_modules/three/examples/jsm/loaders/GLTFLoader.js"', '"../vendor/three170/examples/jsm/loaders/GLTFLoader.js"')
               .replace('"./node_modules/three/"', '"../vendor/three170/"');
  fs.writeFileSync(ROOT + EXP_DIR + 'index.html', bkIdx);
  log('updated SCIENCE_UNIVERSE_PROJECT_BACKUP/index.html importmap fallback');
} catch (e) {
  log('note: backup index importmap untouched', e.message);
}

/* ---------------------------------------------------------------------- Build */
const bt = fs.readFileSync(BUILD_SRC, 'utf8');
const bCss = bt.slice(bt.indexOf('<style>') + 7, bt.indexOf('</style>'));
const bHtml = bt.slice(bt.indexOf('<body>') + 6, bt.indexOf('<script>'));
const bJs = bt.slice(bt.indexOf('<script>') + 8, bt.lastIndexOf('</script>'));

/* ----------------------------------------------------------------------- Main */
let m = fs.readFileSync(MAIN_SRC, 'utf8');
const rep = (from, to, all = false) => {
  const i = m.indexOf(from); if (i < 0) { log('WARN missing anchor:', from.slice(0, 70)); return; }
  m = all ? m.split(from).join(to) : m.slice(0, i) + to + m.slice(i + from.length);
};
const importmap = `<script type="importmap">
{ "imports": {
    "three": "./vendor/three170/build/three.module.js",
    "three/examples/jsm/": "./vendor/three170/examples/jsm/",
    "three180": "./vendor/three180/build/three.module.js",
    "three180/examples/jsm/": "./vendor/three180/examples/jsm/" },
  "scopes": { "./vendor/three180/": { "three": "./vendor/three180/build/three.module.js" } } }
</script>`;
rep('<head>', '<head>\n' + importmap);
/* local THREE r128 (previously CDN with a missing-file fallback) */
rep('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script src="vendor/three-r128/three.min.js"></script>');
rep('<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>', '<script src="vendor/three-r128/GLTFLoader.js"></script>');
rep("document.write('<script src=\"three.min.js\"><\\/script>');", "document.write('<script src=\"vendor/three-r128/three.min.js\"><\\/script>');");
rep("document.write('<script src=\"GLTFLoader.js\"><\\/script>');", "document.write('<script src=\"vendor/three-r128/GLTFLoader.js\"><\\/script>');");

/* 
 * BOTTOM NAVIGATION REQUIREMENT:
 * 1. Remove Space Lab from bottom navigation bar.
 * 2. Remove Explore from bottom navigation bar.
 * 3. The remaining buttons are: Home, Lab, Build, Profile.
 * 4. Align properly, no empty slots, fully responsive.
 */
const navI = m.indexOf('class="nav"');
if (navI >= 0) {
  const navStart = m.lastIndexOf('<nav', navI);
  const navEnd = m.indexOf('</nav>', navI) + 6;
  const navHtml = m.substring(navStart, navEnd);
  // Remove Explore button cleanly without touching other buttons
  const updatedNav = navHtml.replace(/<button[^>]*>(?:(?!<\/button>)[\s\S])*?Explore<\/button>\s*/i, '');
  m = m.substring(0, navStart) + updatedNav + m.substring(navEnd);
  log('bottom navigation: Explore removed, Space Lab not added. 4 clean buttons remain (Home, Lab, Build, Profile)');
}

/* UI/UX OPTIMIZATION: 8-card menu layout, equal dimensions, and typography */
const oldTabsRender = "body.innerHTML='<div class=\"pl-tabs\" role=\"tablist\">'+TABS.map(function(t,n){return '<button type=\"button\" role=\"tab\" aria-selected=\"'+(n===itab)+'\" class=\"'+(n===itab?'on':'')+'\" data-t=\"'+n+'\">'+t+'</button>'}).join('')+'</div>'+";
const newTabsRender = "body.innerHTML='<div class=\"pl-tabs pl-info-tabs\" role=\"tablist\">'+TABS.map(function(t,n){var sp=t.indexOf(' '),ic=sp>-1?t.slice(0,sp):'',lb=sp>-1?t.slice(sp+1):t;return '<button type=\"button\" role=\"tab\" aria-selected=\"'+(n===itab)+'\" class=\"pl-card-tab '+(n===itab?'on':'')+'\" data-t=\"'+n+'\"><span class=\"pl-tab-ico\" aria-hidden=\"true\">'+ic+'</span><span class=\"pl-tab-txt\">'+lb+'</span></button>';}).join('')+'</div>'+";
rep(oldTabsRender, newTabsRender);

const oldNavFix = "/* Lab navigation spacing and responsive text fix */\r\n.pl-tabs{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;padding:11px!important;max-width:480px!important;box-sizing:border-box!important;margin-bottom:15px!important}\r\n.pl-tabs button,.pl-tab{min-width:0!important;min-height:48px!important;padding:10px 7px!important;font-family:Inter,Arial,sans-serif!important;font-size:clamp(11px,2.8vw,14px)!important;font-weight:700!important;line-height:1.35!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere!important;word-break:normal!important;gap:5px!important}\r\n.pl-tabs button#plTab3d,.pl-tab#plTab3d{grid-column:span 2!important}\r\n@media(min-width:650px){.pl-tabs{grid-template-columns:repeat(3,minmax(0,1fr))!important}.pl-tabs button#plTab3d,.pl-tab#plTab3d{grid-column:span 3!important}}\r\n";

const newNavFix = `/* Lab navigation spacing and responsive 8-card grid */
.pl-tabs {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  grid-auto-rows: 1fr !important;
  gap: 8px !important;
  padding: 8px !important;
  box-sizing: border-box !important;
  margin-bottom: 16px !important;
  width: 100% !important;
  max-width: 100% !important;
  background: rgba(14, 10, 28, 0.75) !important;
  border: 1px solid rgba(167, 139, 250, 0.28) !important;
  border-radius: 16px !important;
}
@media (min-width: 640px) {
  .pl-tabs {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    grid-auto-rows: 1fr !important;
    gap: 10px !important;
    padding: 10px !important;
    max-width: 760px !important;
  }
}
.pl-tabs button, .pl-tab {
  min-width: 0 !important;
  min-height: 64px !important;
  height: 100% !important;
  padding: 8px 6px !important;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: clamp(11.5px, 2.4vw, 13px) !important;
  font-weight: 600 !important;
  line-height: 1.25 !important;
  letter-spacing: -0.01em !important;
  text-align: center !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  word-break: normal !important;
  overflow-wrap: normal !important;
  white-space: normal !important;
  hyphens: none !important;
  box-sizing: border-box !important;
}
.pl-tabs button#plTab3d, .pl-tab#plTab3d {
  grid-column: auto !important;
}`;
rep(oldNavFix, newNavFix);

const sandboxSrc = fs.readFileSync(ROOT + 'sections/su-sandbox.js', 'utf8').replace(/^export /gm, '');
const routerSrc = fs.readFileSync(ROOT + 'sections/su-router.js', 'utf8');
const css = fs.readFileSync(ROOT + 'sections/su-sections.css', 'utf8');
const esc = (s) => s;
for (const [n, s] of [['build css', bCss], ['build html', bHtml], ['build js', bJs]]) {
  if (s.includes('</script')) throw new Error('payload contains </script: ' + n);
}

const injected = `
<!-- ===== SCIENCE UNIVERSE: integrated sections (Build / Space Lab / Explore) ===== -->
<style id="su-sections-style">
${css}
</style>
<div id="suSections" hidden>
  <div id="suHostBuild" class="su-host" hidden></div>
  <div id="suHostSpacelab" class="su-host" hidden></div>
  <div id="suHostExplore" class="su-host" hidden></div>
  <div id="suLoading" hidden><div class="su-spin"></div><span>Loading…</span></div>
</div>
<div id="suBar" role="navigation" aria-label="Science Universe sections">
  <button type="button" id="suBarToggle" aria-label="Sections menu">&#9776;</button>
  <div class="su-bar-items">
    <button type="button" data-su="home">HOME</button>
    <button type="button" data-su="build">BUILD</button>
    <button type="button" data-su="spacelab">SPACE LAB</button>
    <button type="button" data-su="explore">EXPLORE</button>
    <button type="button" data-su="classic">CLASSIC SPACE</button>
  </div>
</div>

<!-- Space Lab Unlock Modal Interface -->
<div id="suUnlockModal" class="su-modal-overlay" hidden>
  <div class="su-modal-card">
    <button type="button" class="su-modal-close" id="suUnlockClose" aria-label="Хаах">✕</button>
    <div class="su-modal-icon">
      <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="#a78bfa" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="10" y="21" width="28" height="21" rx="4" fill="rgba(167, 139, 250, 0.15)"></rect>
        <path d="M16 21v-6a8 8 0 0116 0v6"></path>
        <circle cx="24" cy="31" r="2.6" fill="#a78bfa"></circle>
      </svg>
    </div>
    <h2 class="su-modal-title">САНСАР СУДЛАЛ</h2>
    <div class="su-modal-sub">SPACE LABORATORY ACCESS</div>
    <div class="su-modal-body">
      <div class="su-cost-row">
        <span>Шаардагдах кредит:</span>
        <b class="su-cost-val">120 ★</b>
      </div>
      <div class="su-cost-row">
        <span>Таны одоогийн кредит:</span>
        <b class="su-cost-cur" id="suCurCredits">0 ★</b>
      </div>
      <div class="su-progress-bar">
        <div class="su-progress-fill" id="suCreditProgress"></div>
      </div>
      <p class="su-modal-desc" id="suUnlockDesc"></p>
    </div>
    <div class="su-modal-actions" id="suUnlockActions"></div>
  </div>
</div>

<script type="text/plain" id="su-build-css">${bCss}</script>
<script type="text/plain" id="su-build-html">${bHtml}</script>
<script type="text/plain" id="su-build-js">${bJs}</script>
<script type="module" id="su-integration">
${sandboxSrc}
${routerSrc}
</script>
<script src="js/mobile-bridge.js"></script>
`;
const bodyEnd = m.lastIndexOf('</body>');
m = m.slice(0, bodyEnd) + injected + m.slice(bodyEnd);
fs.writeFileSync(ROOT + 'index.html', m);
log('index.html written', (m.length / 1048576).toFixed(1) + ' MB');
