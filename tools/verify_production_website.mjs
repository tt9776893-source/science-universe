import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (value, label) => { assert.ok(value, label); console.log('PASS', label); };

const ROOT = 'C:/Users/Administrator/Desktop/shine negtgel';
const WWW = path.join(ROOT, 'www');
const ARTIFACTS_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/abef54cf-a7e0-4de6-8795-174b876a7192';

// 1. MIME map simulating Netlify edge behavior
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm',
  '.raw': 'application/octet-stream',
  '.bin': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(WWW, urlPath);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Netlify _redirects fallback: if file doesn't exist, serve /index.html with status 200
  if (!fs.existsSync(filePath)) {
    filePath = path.join(WWW, 'index.html');
  }

  try {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.glb' || ext === '.wasm' || ext === '.raw') {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
  }
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const serverUrl = `http://127.0.0.1:${server.address().port}`;
console.log(`Production test server listening on ${serverUrl}`);

// 2. Launch Chromium
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'su-prod-verify-'));
const exe = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(fs.existsSync);
assert.ok(exe, 'Chromium required');

const browser = spawn(exe, [
  '--headless=new',
  '--enable-unsafe-swiftshader',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let ws, seq = 0;
const pending = new Map();
const errors = [], consoleErrors = [];

try {
  const endpoint = await new Promise((resolve, reject) => {
    let text = '';
    const timer = setTimeout(() => reject(Error('Browser startup timeout')), 25000);
    browser.stderr.on('data', d => {
      text += d;
      const m = text.match(/DevTools listening on (ws:\/\/[^\r\n]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    browser.on('error', reject);
  });

  const pages = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  const wait = async (expression, label, timeoutSec = 40) => {
    for (let n = 0; n < timeoutSec * 2; n++) {
      if (await ev(expression)) return;
      await sleep(500);
    }
    throw Error('Timeout: ' + label);
  };

  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sleep(400);
  };

  const screenshot = async (savePath) => {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(savePath, Buffer.from(result.data, 'base64'));
  };

  await send('Runtime.enable');
  await viewport(1440, 900);

  // Navigate to production server
  await send('Page.navigate', { url: serverUrl });
  await wait('!!window.SU', 'production router ready');
  await sleep(1500);

  // 1. Verify Clean Production State
  const prodState = await ev(`(() => {
    return {
      currentSection: window.SU.state.current,
      hasDevTools: Boolean(document.getElementById('suDeveloperTools')),
      hasDevExplore: Boolean(document.getElementById('suDeveloperExplore')),
      hasDevMarker: Boolean(window.SU_DEVELOPER_TEST_ONLY_V1),
      title: document.title,
      hasCanvas: Boolean(document.getElementById('planet-canvas') || document.querySelector('canvas')),
      hasNavBar: Boolean(document.getElementById('suSections') || document.querySelector('nav')),
      isProductionBuild: !window.location.search.includes('development')
    };
  })()`);

  check(prodState.currentSection === 'home', 'Production app initializes in home section');
  check(!prodState.hasDevTools, 'Production DOM contains no developer tools panel');
  check(!prodState.hasDevExplore, 'Production DOM contains no developer explore button');
  check(!prodState.hasDevMarker, 'No developer marker present in global window');
  check(prodState.hasCanvas, 'Production 3D canvas initialized');
  console.log('App Title:', prodState.title);

  // 2. Test Section Unlocks in Production (locked for unauthenticated / 0-credit guests)
  const lockState = await ev(`(() => {
    return {
      exploreLocked: !window.SU.isSectionUnlocked('explore'),
      spacelabLocked: !window.SU.isSectionUnlocked('spacelab'),
      classicLocked: !window.SU.isSectionUnlocked('classic')
    };
  })()`);
  check(lockState.exploreLocked, 'Explore section is locked for unauthenticated users');
  check(lockState.spacelabLocked, 'Space Lab section is locked for unauthenticated users');
  check(lockState.classicLocked, 'Classic Space section is locked for unauthenticated users');

  // 3. Test HTTP Netlify Headers and MIME types
  const glbUrl = `${serverUrl}/REALITY_FORGE_V38_SURFACE_ROCKET_INTERACTION_FIXED/REALITY-FORGE-ROCKET-SOLAR-ONLY/assets/rockets/vulcan_centaur_rocket.glb`;
  const glbRes = await fetch(glbUrl);
  check(glbRes.status === 200, 'GLB asset returns HTTP 200');
  check(glbRes.headers.get('content-type') === 'model/gltf-binary', 'GLB asset served with model/gltf-binary');
  check(glbRes.headers.get('cache-control')?.includes('immutable'), 'GLB asset served with immutable cache header');

  const redirectRes = await fetch(`${serverUrl}/explore/deep-space-non-existent-route`);
  check(redirectRes.status === 200, 'SPA fallback route returns HTTP 200');
  const redirectText = await redirectRes.text();
  check(redirectText.includes('SCIENCE UNIVERSE') || redirectText.includes('window.SU'), 'SPA fallback serves index.html');

  // 4. Capture Production Homepage Screenshot
  const prodScreenshotPath = path.join(ARTIFACTS_DIR, 'production_website_verified.png');
  await screenshot(prodScreenshotPath);
  console.log('Saved production screenshot:', prodScreenshotPath);

  // 5. Test Mobile Landscape Viewport (915x412)
  await viewport(915, 412);
  await sleep(600);
  const mobileScreenshotPath = path.join(ARTIFACTS_DIR, 'production_website_mobile_915x412.png');
  await screenshot(mobileScreenshotPath);
  console.log('Saved mobile production screenshot:', mobileScreenshotPath);

  console.log('ALL PRODUCTION WEBSITE VERIFICATION TESTS PASSED SUCCESSFULLY!');

} finally {
  if (ws) ws.close();
  browser.kill();
  server.close();
}
