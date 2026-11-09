// Node-only development compiler. Never copied to www or served as an app asset.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../', import.meta.url));
export const MARKER = 'SU_DEVELOPER_TEST_ONLY_V1';
export const PREFIX = '__su_developer_explore_v1__:';

function replaceOnce(text, from, to) {
  if (text.split(from).length !== 2) throw new Error('Development compiler source anchor changed: ' + from.slice(0, 90));
  return text.replace(from, to);
}

export function compileIndex(source, development = false) {
  if (!development) return source;
  // Private capability: ordinary section entry points and unlock checks stay unchanged.
  source = replaceOnce(source, 'async function suOpen(name, opts = {}) {',
    `const suDeveloperCapability = Symbol('${MARKER}');\nlet suSyncDeveloperControl = () => {};\nasync function suOpen(name, opts = {}) {`);
  source = replaceOnce(source,
    'if (SECTION_INFO[name] && !isSectionUnlocked(name)) {',
    "if (!(name === 'explore' && opts.developerTest === suDeveloperCapability) && SECTION_INFO[name] && !isSectionUnlocked(name)) {");
  source = replaceOnce(source, 'suState.current = name;', 'suState.current = name;\n  suSyncDeveloperControl();');
  source = replaceOnce(source, 'function suUpdateBar() {', `function suUpdateBar() {
  suSyncDeveloperControl();`);
  source = replaceOnce(source, 'function suHookMain() {', `function suHookMain() {
  const developerProfileHome = document.querySelector('#suProfile [data-prscreen="home"]');
  const developerPanel = document.createElement('details');
  developerPanel.id = 'suDeveloperTools';
  developerPanel.style.cssText = 'position:static;margin:12px 0;padding:8px 0;font-size:12px';
  const developerSummary = document.createElement('summary');
  developerSummary.textContent = 'Developer tools (DEV only)';
  developerSummary.style.cursor = 'pointer';
  const developerButton = document.createElement('button');
  developerButton.id = 'suDeveloperExplore';
  developerButton.type = 'button';
  developerButton.textContent = 'Test Deep Space / Explore — isolated saves';
  developerButton.style.cssText = 'position:static;max-width:100%;margin-top:8px;padding:6px 8px;font:inherit;color:inherit;background:transparent;border:1px solid currentColor;border-radius:4px;cursor:pointer';
  developerPanel.append(developerSummary, developerButton);
  const developerPhone = document.getElementById('phone');
  const canDeveloperTest = () => developerPhone?.classList.contains('in') && suState.current === 'home';
  suSyncDeveloperControl = () => {
    developerPanel.hidden = developerButton.hidden = !canDeveloperTest();
    if (developerPanel.hidden) developerPanel.open = false;
  };
  developerButton.onclick = () => {
    if (!canDeveloperTest()) return;
    if (typeof window.closeProfile === 'function') window.closeProfile();
    suOpen('explore', { developerTest: suDeveloperCapability });
  };
  suSyncDeveloperControl();
  if (developerPhone) new MutationObserver(suSyncDeveloperControl).observe(developerPhone, { attributes: true, attributeFilter: ['class'] });
  // Append after existing profile content; do not move or restyle MAIN LAB controls.
  if (developerProfileHome) developerProfileHome.appendChild(developerPanel);`);
  return source;
}

export const storageModule = `// ${MARKER}: all Explore persistence, including legacy migrations, is isolated.
const backing = globalThis.localStorage;
const prefix = ${JSON.stringify(PREFIX)};
export const localStorage = Object.freeze({
  getItem(key) { return backing.getItem(prefix + String(key)); },
  setItem(key, value) { backing.setItem(prefix + String(key), String(value)); },
  removeItem(key) { backing.removeItem(prefix + String(key)); },
  key(index) { return Object.keys(backing).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length))[index] ?? null; },
  get length() { return Object.keys(backing).filter(k => k.startsWith(prefix)).length; },
  clear() { for (const key of Object.keys(backing)) if (key.startsWith(prefix)) backing.removeItem(key); }
});
`;

export function compileExplore(source, development = false) {
  if (!development) return source;
  // Current persistence has only these two access forms (covered by the tests).
  // Shadow per-module bindings; never patch global Storage or the account/auth environment.
  source = source.replace(/globalThis\.localStorage\b/g, 'localStorage');
  if (/\blocalStorage\b/.test(source)) {
    source = `import { localStorage } from '/__su_dev_storage__.js'; // ${MARKER}\n` + source;
  }
  return source;
}

export function createAccessServer({ development = false, root = ROOT } = {}) {
  // Compile once at process/build start, never from query parameters, cookies or storage.
  const index = compileIndex(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), development);
  const modules = new Map();
  function compileTree(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) compileTree(file);
      else if (/\.(m?js)$/.test(file)) modules.set(file, compileExplore(fs.readFileSync(file, 'utf8'), true));
    }
  }
  if (development) compileTree(path.join(root, 'sections/explore'));
  const mime = { '.html':'text/html;charset=utf-8', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.webp':'image/webp', '.glb':'model/gltf-binary', '.wav':'audio/wav', '.mp3':'audio/mpeg' };
  return http.createServer((req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let body, file;
      if (pathname === '/' || pathname === '/index.html') body = index;
      else if (pathname === '/__su_dev_storage__.js' && development) body = storageModule;
      else {
        // Do not expose tools/compiler, checkpoints, test profiles or alternate HTML entries.
        if (!/^\/(assets|vendor|sections|js|REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED\/REALITY-FORGE-ROCKET-SOLAR-ONLY\/assets|SCIENCE_UNIVERSE_PROJECT_BACKUP\/public\/assets)\//.test(pathname) && pathname !== '/favicon.svg') {
          res.writeHead(404).end(); return;
        }
        file = path.resolve(root, '.' + pathname);
        if (!file.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
        body = modules.get(file);
      }
      const type = mime[path.extname(pathname)] || (pathname === '/' ? mime['.html'] : 'application/octet-stream');
      res.setHeader('Content-Type', type);
      res.setHeader('Cache-Control', 'no-store');
      if (body !== undefined) { res.end(body); return; }
      fs.createReadStream(file).pipe(res);
    } catch (err) { res.writeHead(500).end('Local server error'); console.error(err); }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const development = args.includes('--development');
  if (args.some(a => a !== '--development' && !/^--port=\d+$/.test(a))) throw new Error('Unknown launch option');
  const port = Number(args.find(a => a.startsWith('--port='))?.split('=')[1] || (development ? 8137 : 8138));
  createAccessServer({ development }).listen(port, '127.0.0.1', () => {
    console.log(`${development ? 'DEVELOPMENT TEST BUILD — isolated Explore saves' : 'PRODUCTION PREVIEW — no test access'}: http://127.0.0.1:${port}/`);
    console.log('Authentication is unchanged. Sign in normally, then use the purple DEV TEST button.');
  });
}
