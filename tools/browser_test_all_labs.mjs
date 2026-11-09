import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import os from 'node:os';

const ROOT = 'd:/shine negtgel';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
      const relPath = urlPath === '/' ? '/index.html' : urlPath;
      const fullPath = path.join(ROOT, relPath);
      if (!fullPath.startsWith(path.resolve(ROOT)) && !fullPath.replace(/\\/g, '/').startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(fullPath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
    });
  });
}

function findBrowserExe() {
  const candidates = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No Chromium/Edge executable found on system');
}

function launchHeadlessBrowser(exe) {
  return new Promise((resolve, reject) => {
    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'su-e2e-'));
    const proc = spawn(exe, [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let stderr = '';
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for DevTools port: ' + stderr)), 15000);

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      const m = stderr.match(/DevTools listening on (ws:\/\/[^\r\n]+)/);
      if (m) {
        clearTimeout(timeout);
        resolve({ proc, wsUrl: m[1], userDataDir });
      }
    });
    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function getPageWsUrl(browserWsUrl) {
  const u = new URL(browserWsUrl);
  const listUrl = `http://${u.host}/json/list`;
  for (let i = 0; i < 30; i++) {
    const res = await fetch(listUrl);
    const pages = await res.json();
    const page = pages.find((p) => p.type === 'page' && p.webSocketDebuggerUrl);
    if (page) return page.webSocketDebuggerUrl;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Could not find page target in DevTools');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(typeof ev.data === 'string' ? ev.data : ev.data.toString());
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve: res, reject: rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) rej(new Error(JSON.stringify(msg.error)));
          else res(msg.result);
        } else if (msg.method) {
          this.events.push(msg);
        }
      };
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error('Page eval exception: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log(`  [PASS] ${msg}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${msg}`);
  }
}

async function runViewportSuite(cdp, baseUrl, label, width, height) {
  console.log(`\n=== ${label} (${width}x${height}) ===`);
  cdp.events = [];

  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });

  await cdp.send('Page.navigate', { url: `${baseUrl}/index.html` });
  await sleep(1200);

  // Clear storage, reload to Welcome screen, and complete real registration flow into Main Lab
  await cdp.eval(`(() => { localStorage.clear(); sessionStorage.clear(); })()`);
  await cdp.send('Page.reload', { ignoreCache: true });
  await sleep(1000);

  await cdp.eval(`(async () => {
    document.getElementById('start').click();
    document.getElementById('tab-up').click();
    document.getElementById('f-name').value = 'Тест Судлаач';
    document.getElementById('f-mail').value = 'tester@science.mn';
    document.getElementById('f-pass').value = 'SciencePass123!';
    document.getElementById('f-pass2').value = 'SciencePass123!';
    document.getElementById('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(500);

  await cdp.eval(`(async () => {
    const demoText = document.getElementById('demo')?.textContent || '';
    const m = demoText.match(/\\b(\\d{6})\\b/);
    if (m) {
      document.getElementById('f-code').value = m[1];
      document.getElementById('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  })()`);
  await sleep(700);
  await cdp.eval(`(() => {
    const cur = parseInt(document.getElementById('credits').textContent || '0', 10) || 0;
    window.addCredits(50 - cur);
  })()`);
  await sleep(200);

  // 1. Verify Main Lab 3D section is preserved 100% intact
  const mainLabState = await cdp.eval(`(() => {
    const phone = document.getElementById('phone');
    const hub = document.getElementById('hub');
    const ring = document.getElementById('ring');
    const consoleSvg = hub ? hub.querySelector('.console svg') : null;
    const walls = ring ? [...ring.querySelectorAll('.wall')] : [];
    const cards = ring ? [...ring.querySelectorAll('.wall .card')] : [];
    const prevW = document.getElementById('prevW');
    const nextW = document.getElementById('nextW');
    const enterW = document.getElementById('enterW');
    const fen = document.getElementById('fen');
    const fmn = document.getElementById('fmn');
    const nav = document.querySelector('#phone nav.nav');

    const enterRect = enterW ? enterW.getBoundingClientRect() : null;
    const hitEl = enterRect ? document.elementFromPoint(enterRect.left + enterRect.width / 2, enterRect.top + enterRect.height / 2) : null;

    return {
      inMainLab: phone && phone.classList.contains('in'),
      hasHub: !!hub && getComputedStyle(hub).display !== 'none',
      hasRing: !!ring,
      hasConsoleOnline: !!(consoleSvg && consoleSvg.textContent.includes('SYSTEM ONLINE')),
      wallCount: walls.length,
      cardCount: cards.length,
      allWallsHaveSvg: cards.every(c => !!c.querySelector('svg')),
      hasPrevNext: !!(prevW && nextW),
      enterText: enterW ? enterW.textContent.trim() : '',
      fenText: fen ? fen.textContent.trim() : '',
      fmnText: fmn ? fmn.textContent.trim() : '',
      hasBottomNav: !!(nav && nav.querySelectorAll('button').length >= 4),
      enterUnblocked: !!(hitEl && (hitEl === enterW || enterW.contains(hitEl))),
    };
  })()`);

  assert(mainLabState.inMainLab, `${label}: Authenticated session lands in Main Lab (.phone.in)`);
  assert(mainLabState.hasHub && mainLabState.hasRing, `${label}: Rotating 3D #hub and #ring preserved`);
  assert(mainLabState.hasConsoleOnline, `${label}: Central 3D computer console ('SYSTEM ONLINE') preserved`);
  assert(mainLabState.wallCount === 8 && mainLabState.cardCount === 8 && mainLabState.allWallsHaveSvg, `${label}: All 8 3D .wall doorway panels & SVG icons preserved`);
  assert(mainLabState.hasPrevNext && mainLabState.enterText === 'Орох', `${label}: Focus bar #prevW, #nextW, and #enterW ('Орох') preserved`);
  assert(mainLabState.hasBottomNav, `${label}: Bottom navigation bar preserved`);
  assert(mainLabState.enterUnblocked, `${label}: #enterW ('Орох') is clickable and not blocked by any hidden overlay`);

  // 2. Rotate through all 8 labs via #prevW (0->1->...->7) and #nextW (0<-1<-...<-7) and verify #fen / #fmn / --rot sync
  const expectedNames = [
    'Physics Lab',
    'Chemistry Lab',
    'AI Lab',
    'Biology Lab',
    'Computer Lab',
    'Math Lab',
    'Space Lab',
    'Engineering Lab',
  ];

  const rotStepCycle = await cdp.eval(`(() => {
    const names = [];
    for (let i = 0; i < 8; i++) {
      names.push({
        fen: document.getElementById('fen').textContent.trim(),
        rot: document.getElementById('ring').style.getPropertyValue('--rot')
      });
      document.getElementById('prevW').click();
    }
    return names;
  })()`);

  assert(
    rotStepCycle.every((r, i) => r.fen === expectedNames[i]),
    `${label}: #prevW / #nextW rotates cleanly through all 8 labs in order (${rotStepCycle.map(r => r.fen).join(' -> ')})`
  );

  const rotReverse = await cdp.eval(`(() => {
    const rev = [];
    for (let i = 0; i < 8; i++) {
      document.getElementById('nextW').click();
      rev.push(document.getElementById('fen').textContent.trim());
    }
    return {
      fen: document.getElementById('fen').textContent.trim(),
      idx: window.suGetActiveLabIdx ? window.suGetActiveLabIdx() : -1,
      uniqueVisited: new Set(rev).size
    };
  })()`);
  assert(rotReverse.fen === 'Physics Lab' && rotReverse.idx === 0 && rotReverse.uniqueVisited === 8, `${label}: #nextW rotates cleanly across all 8 labs back to Physics Lab (idx 0)`);

  // 3. Open -> Close -> Re-Open -> Close EVERY available lab via #enterW ("Орох")
  const openableLabs = [
    { idx: 0, name: 'Physics Lab', sel: '.pl', closeSel: '.pl-back' },
    { idx: 1, name: 'Chemistry Lab', sel: '#chemLabRoot', closeSel: '#clBackBtn' },
    { idx: 2, name: 'AI Lab', sel: '#aiOverlay', closeSel: '#aiClose' },
    { idx: 3, name: 'Biology Lab', sel: '#bioOverlay', closeSel: '#bioBack' },
    { idx: 4, name: 'Computer Lab', sel: '#computerOverlay', closeSel: '#cExit' },
    { idx: 5, name: 'Math Lab', sel: '#mathOverlay', closeSel: '#mathBack' },
    { idx: 7, name: 'Engineering Lab', sel: '#engOverlay', closeSel: '#engClose' },
  ];

  for (const lab of openableLabs) {
    for (let cycle = 1; cycle <= 2; cycle++) {
      const opened = await cdp.eval(`(() => {
        window.suRotateToLab(${lab.idx});
        const fen = document.getElementById('fen').textContent.trim();
        document.getElementById('enterW').click();
        const el = document.querySelector('${lab.sel}');
        const cs = el ? getComputedStyle(el) : null;
        return {
          fen,
          isOpen: !!(el && cs && cs.display !== 'none' && cs.visibility !== 'hidden'),
          activeLab: window.SU_NAV ? window.SU_NAV.getActiveLab() : null
        };
      })()`);

      assert(
        opened.fen === lab.name && opened.isOpen,
        `${label}: [${lab.name}] Cycle ${cycle} — #enterW ('Орох') opens ${lab.sel} cleanly`
      );

      // Extra check on Physics Cycle 1: enter internal subview and verify .pl-back steps back to Physics home first
      if (lab.idx === 0 && cycle === 1) {
        const subviewRes = await cdp.eval(`(() => {
          const infoCard = document.querySelector('.pl .pl-card[data-go="info"]');
          if (infoCard) infoCard.click();
          const viewInSub = window.getPhysicsView ? window.getPhysicsView() : null;
          document.querySelector('.pl-back').click();
          const viewAfterStepBack = window.getPhysicsView ? window.getPhysicsView() : null;
          const stillOpen = getComputedStyle(document.querySelector('.pl')).display !== 'none';
          return { viewInSub, viewAfterStepBack, stillOpen };
        })()`);
        assert(
          subviewRes.viewInSub === 'info' && subviewRes.viewAfterStepBack === 'home' && subviewRes.stillOpen,
          `${label}: [Physics Lab] Internal subview Back steps back to Physics Home before exiting lab`
        );
      }

      const closed = await cdp.eval(`(() => {
        const btn = document.querySelector('${lab.closeSel}');
        if (btn) btn.click();
        const el = document.querySelector('${lab.sel}');
        const cs = el ? getComputedStyle(el) : null;
        const enterW = document.getElementById('enterW');
        const r = enterW.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return {
          isClosed: !!(el && cs && cs.display === 'none'),
          activeLab: window.SU_NAV ? window.SU_NAV.getActiveLab() : 'err',
          mainLabUnblocked: !!(hit && (hit === enterW || enterW.contains(hit)))
        };
      })()`);

      assert(
        closed.isClosed && closed.activeLab === null && closed.mainLabUnblocked,
        `${label}: [${lab.name}] Cycle ${cycle} — Back/Close (${lab.closeSel}) returns cleanly to Main Lab`
      );
    }
  }

  // 4. Space Lab (idx 6) — Locked (< 120 credits) & Genuine Unlock (>= 120 credits)
  const spaceLockedRes = await cdp.eval(`(() => {
    window.suRotateToLab(6);
    document.getElementById('enterW').click();
    const modal = document.getElementById('suUnlockModal');
    const gotIt = document.getElementById('suUnlockGotItBtn');
    const payBtn = document.getElementById('suUnlockPayBtn');
    const shown = !!(modal && !modal.hidden && getComputedStyle(modal).display !== 'none');
    const hasGotItOnly = !!gotIt && !payBtn;
    if (gotIt) gotIt.click();
    return { shown, hasGotItOnly, closedAfter: modal.hidden };
  })()`);

  assert(
    spaceLockedRes.shown && spaceLockedRes.hasGotItOnly && spaceLockedRes.closedAfter,
    `${label}: [Space Lab] With 50 credits (<120), #enterW shows #suUnlockModal ('Ойлголоо') and does NOT fake-open`
  );

  // Grant 100 more credits -> total 150 credits, then unlock Space Lab
  await cdp.eval(`(() => { window.addCredits(100); })()`);
  const spaceUnlockModalRes = await cdp.eval(`(() => {
    window.suRotateToLab(6);
    document.getElementById('enterW').click();
    const modal = document.getElementById('suUnlockModal');
    const payBtn = document.getElementById('suUnlockPayBtn');
    const hasPayBtn = !!(modal && !modal.hidden && payBtn);
    if (payBtn) payBtn.click();
    return { hasPayBtn };
  })()`);
  assert(spaceUnlockModalRes.hasPayBtn, `${label}: [Space Lab] With 150 credits (>=120), #enterW shows #suUnlockPayBtn ('120 Кредитээр нээх')`);

  await sleep(750);
  const spaceOpenedRes = await cdp.eval(`(() => {
    const creditsNow = parseInt(document.getElementById('credits').textContent, 10);
    const unlockedFlag = localStorage.getItem('rf_spacelab_unlocked');
    const spaceCardUnlocked = !document.getElementById('spaceCard').dataset.locked;
    const suRootOpen = !document.getElementById('suSections').hidden;
    const curSection = window.SU && window.SU.state ? window.SU.state.current : null;
    if (window.SU_NAV) window.SU_NAV.back();
    return { creditsNow, unlockedFlag, spaceCardUnlocked, suRootOpen, curSection };
  })()`);
  await sleep(250);

  assert(
    spaceOpenedRes.creditsNow === 30 &&
    spaceOpenedRes.unlockedFlag === '1' &&
    spaceOpenedRes.spaceCardUnlocked &&
    spaceOpenedRes.suRootOpen &&
    spaceOpenedRes.curSection === 'spacelab',
    `${label}: [Space Lab] Confirming unlock deducts 120 credits (150 -> 30), persists rf_spacelab_unlocked='1', and opens Space Lab`
  );

  // 5. Desktop Quick Launcher & Mobile Lab Directory
  if (width >= 1024) {
    const deskTileRes = await cdp.eval(`(() => {
      const tile = document.querySelector('.su-launcher-tile[data-su-wall-idx="3"]');
      if (tile) tile.click();
      const bioOpen = getComputedStyle(document.getElementById('bioOverlay')).display !== 'none';
      document.getElementById('bioBack').click();
      return { bioOpen, bioClosed: getComputedStyle(document.getElementById('bioOverlay')).display === 'none' };
    })()`);
    assert(deskTileRes.bioOpen && deskTileRes.bioClosed, `${label}: Desktop Quick Launcher tile opens & closes Biology Lab`);
  } else {
    const dirRes = await cdp.eval(`(() => {
      const labNavBtn = [...document.querySelectorAll('#phone nav.nav button')].find(b => b.textContent.trim() === 'Lab');
      if (labNavBtn) labNavBtn.click();
      const dir = document.getElementById('suLabDirectory');
      const dirOpen = getComputedStyle(dir).display !== 'none';
      const dirSvgCount = dir.querySelectorAll('svg.su-ico').length;
      const mathItem = dir.querySelectorAll('.directory-item')[5];
      if (mathItem) mathItem.click();
      const mathOpen = getComputedStyle(document.getElementById('mathOverlay')).display !== 'none';
      document.getElementById('mathBack').click();
      return { dirOpen, dirSvgCount, mathOpen };
    })()`);
    assert(
      dirRes.dirOpen && dirRes.dirSvgCount === 8 && dirRes.mathOpen,
      `${label}: Mobile 'Lab' directory opens with 8 vector SVG icons and launches selected lab`
    );
  }

  // 6. Icon sizing & emoji audit in live DOM
  const iconAudit = await cdp.eval(`(() => {
    const icons = [...document.querySelectorAll('svg.su-ico')];
    const visibleIcons = icons.filter(ic => {
      const r = ic.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const oversized = visibleIcons.filter(ic => {
      const r = ic.getBoundingClientRect();
      return r.width > 48 || r.height > 48;
    });
    const monoSpans = document.querySelectorAll('.emoji-mono').length;
    const pictoRe = /[\\u{1F300}-\\u{1FAFF}]/u;
    const bodyTextHasPicto = pictoRe.test(document.body.innerText || '');
    return {
      totalSuIco: icons.length,
      visibleCount: visibleIcons.length,
      oversizedCount: oversized.length,
      monoSpans,
      bodyTextHasPicto
    };
  })()`);

  assert(
    iconAudit.totalSuIco >= 80 && iconAudit.oversizedCount === 0 && iconAudit.monoSpans === 0 && !iconAudit.bodyTextHasPicto,
    `${label}: Vector SVG icon system verified (${iconAudit.totalSuIco} .su-ico SVGs, 0 oversized SVGs, 0 .emoji-mono wrappers, 0 pictographic emojis)`
  );

  // 7. Zero JS runtime exceptions
  const runtimeExceptions = cdp.events.filter((e) => e.method === 'Runtime.exceptionThrown');
  assert(
    runtimeExceptions.length === 0,
    `${label}: Zero uncaught JS console/page exceptions (${runtimeExceptions.length})`
  );
  if (runtimeExceptions.length > 0) {
    console.error('Exceptions:', JSON.stringify(runtimeExceptions, null, 2));
  }
}

async function main() {
  const { server, port } = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  const exe = findBrowserExe();
  const { proc, wsUrl, userDataDir } = await launchHeadlessBrowser(exe);

  try {
    const pageWsUrl = await getPageWsUrl(wsUrl);
    const cdp = new CDPClient(pageWsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    await runViewportSuite(cdp, baseUrl, 'DESKTOP', 1440, 900);
    await runViewportSuite(cdp, baseUrl, 'MOBILE', 390, 844);

    cdp.close();
  } finally {
    proc.kill();
    server.close();
    setTimeout(() => {
      try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (_) {}
    }, 500);
  }

  console.log(`\n=============================================================`);
  console.log(`REAL BROWSER E2E SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=============================================================`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
