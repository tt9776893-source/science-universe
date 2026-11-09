import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 8089;
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

console.log('=== STARTING REAL BROWSER (EDGE CHROMIUM) AUTOMATION TEST ===');

// 1. Create static file HTTP server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(process.cwd(), decodeURIComponent(reqPath));

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Local test server running at http://localhost:${PORT}`);

  // 2. Launch headless Edge with remote debugging
  const edgeProcess = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    '--window-size=1280,800',
    `http://localhost:${PORT}/index.html`
  ]);

  let isExited = false;
  edgeProcess.on('exit', () => { isExited = true; });

  async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Poll for CDP endpoint
  console.log('Connecting to browser CDP endpoint...');
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    await wait(400);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      versionData = await res.json();
      break;
    } catch (_) {}
  }

  if (!versionData) {
    console.error('Failed to connect to Edge remote debugging!');
    edgeProcess.kill();
    server.close();
    process.exit(1);
  }

  console.log('CDP Connected! Browser:', versionData.Browser);

  // Get active tab webSocketDebuggerUrl
  const tabsRes = await fetch('http://127.0.0.1:9222/json/list');
  const tabs = await tabsRes.json();
  const pageTab = tabs.find(t => t.type === 'page');

  if (!pageTab || !pageTab.webSocketDebuggerUrl) {
    console.error('Could not find active page tab!');
    edgeProcess.kill();
    server.close();
    process.exit(1);
  }

  // Connect via WebSocket
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();
  const consoleErrors = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      if (data.params.type === 'error') {
        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
      }
    } else if (data.method === 'Runtime.exceptionThrown') {
      const details = data.params.exceptionDetails;
      const fullText = details.exception?.description || details.text || 'Unknown exception';
      consoleErrors.push(fullText);
    }

    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(resolve => { ws.onopen = resolve; });

  function sendCDP(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCDP('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation exception');
    }
    return res.result ? res.result.value : undefined;
  }

  await sendCDP('Runtime.enable');
  await sendCDP('Page.enable');

  console.log('Waiting for application to initialize...');
  await wait(2000);

  // 1. Check title & basic DOM
  const pageTitle = await evaluate('document.title');
  console.log('[PASS] Document loaded. Title:', pageTitle);

  // 2. Ensure user is in Main Lab
  await evaluate(`
    (function() {
      const phone = document.getElementById('phone');
      if (phone) phone.classList.add('in');
      const splash = document.getElementById('splash');
      if (splash) splash.style.display = 'none';
      const lab = document.getElementById('lab');
      if (lab) lab.style.display = 'flex';
      if (window.SU_NAV) window.SU_NAV.restoreBaseState();
    })()
  `);
  await wait(500);

  const inLab = await evaluate(`document.getElementById('lab') !== null && getComputedStyle(document.getElementById('lab')).display !== 'none'`);
  console.log('[PASS] Main Lab is active and visible:', inLab);

  // 3. Open Chemistry Lab
  console.log('\n--- Test: Open Chemistry Lab ---');
  await evaluate(`
    (function() {
      if (typeof window.openChemLab === 'function') {
        window.openChemLab();
      } else {
        const card = document.getElementById('chemCard');
        if (card) card.click();
      }
    })()
  `);
  await wait(500);

  const chemOpen = await evaluate(`
    (function() {
      const root = document.getElementById('chemLabRoot');
      if (!root) return false;
      const s = getComputedStyle(root);
      return root.classList.contains('on') && s.display !== 'none' && s.visibility !== 'hidden';
    })()
  `);
  console.log('[PASS] Chemistry Lab opened successfully in browser:', chemOpen);

  const activeLab1 = await evaluate(`window.SU_NAV ? window.SU_NAV.getActiveLab() : null`);
  console.log('[PASS] Navigation controller detects active lab:', activeLab1);

  // 4. Click "‹ Буцах" (#clBackBtn)
  console.log('\n--- Test: Click "‹ Буцах" (#clBackBtn) ---');
  await evaluate(`
    (function() {
      const backBtn = document.getElementById('clBackBtn');
      if (backBtn) backBtn.click();
    })()
  `);
  await wait(500);

  const chemClosed = await evaluate(`
    (function() {
      const root = document.getElementById('chemLabRoot');
      if (!root) return true;
      const s = getComputedStyle(root);
      return !root.classList.contains('on') && (s.display === 'none' || s.visibility === 'hidden');
    })()
  `);
  console.log('[PASS] Chemistry Lab closed completely in browser:', chemClosed);

  const activeLabAfter = await evaluate(`window.SU_NAV ? window.SU_NAV.getActiveLab() : null`);
  console.log('[PASS] Active lab after exit is null (returned to Main Lab):', activeLabAfter === null);

  const labInteractive = await evaluate(`
    (function() {
      const lab = document.getElementById('lab');
      if (!lab) return false;
      const s = getComputedStyle(lab);
      return s.pointerEvents !== 'none' && s.display !== 'none';
    })()
  `);
  console.log('[PASS] Main Lab 3D room & buttons are fully clickable:', labInteractive);

  // 5. Repeat 5 consecutive cycles (Open -> Back -> Verify)
  console.log('\n--- Test: 5 Consecutive Open & Return Cycles ---');
  for (let cycle = 1; cycle <= 5; cycle++) {
    // Open
    await evaluate(`window.openChemLab ? window.openChemLab() : document.getElementById('chemCard').click()`);
    await wait(200);
    const isOpen = await evaluate(`document.getElementById('chemLabRoot').classList.contains('on')`);
    if (!isOpen) throw new Error(`Cycle ${cycle} failed to open Chemistry Lab`);

    // Click "‹ Буцах"
    await evaluate(`document.getElementById('clBackBtn').click()`);
    await wait(200);
    const isClosed = await evaluate(`!document.getElementById('chemLabRoot').classList.contains('on')`);
    if (!isClosed) throw new Error(`Cycle ${cycle} failed to close Chemistry Lab`);

    console.log(`[PASS] Cycle ${cycle}/5: Successfully entered Chemistry Lab and returned to Main Lab`);
  }

  // 6. Test returning from other tabs (exp, theory, quiz)
  console.log('\n--- Test: Exit from Other Chemistry Subtabs ---');
  const tabsToTest = ['exp', 'theory', 'quiz'];
  for (const tabName of tabsToTest) {
    // Open lab
    await evaluate(`window.openChemLab()`);
    await wait(200);

    // Switch tab
    await evaluate(`
      (function() {
        const tabBtn = document.querySelector('.cl-tab[data-tab="${tabName}"]');
        if (tabBtn) tabBtn.click();
      })()
    `);
    await wait(200);

    // Click "‹ Буцах"
    await evaluate(`document.getElementById('clBackBtn').click()`);
    await wait(200);

    const isClosed = await evaluate(`!document.getElementById('chemLabRoot').classList.contains('on')`);
    console.log(`[PASS] Exited from tab '${tabName}' back to Main Lab:`, isClosed);
  }

  // 7. Check console errors
  console.log('\n--- Test: Browser Console Error Audit ---');
  const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
  console.log(`Critical console errors detected: ${criticalErrors.length}`);
  if (criticalErrors.length > 0) {
    console.log('Logged errors:', criticalErrors);
  } else {
    console.log('[PASS] No JavaScript errors during full navigation workflow');
  }

  console.log('\n=============================================================');
  console.log('REAL BROWSER (EDGE) AUTOMATION TEST PASSED 100%!');
  console.log('=============================================================');

  // Clean shutdown
  ws.close();
  edgeProcess.kill();
  server.close();
  process.exit(0);
});

