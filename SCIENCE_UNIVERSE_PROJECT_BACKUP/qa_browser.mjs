import puppeteer from 'puppeteer';

const BASE = 'http://localhost:7777';
const results = { passed: [], failed: [], notTested: [] };

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function test(name, fn) {
  try {
    await fn();
    results.passed.push(name);
    console.log(`PASS: ${name}`);
  } catch (e) {
    results.failed.push({ name, error: e.message });
    console.log(`FAIL: ${name} — ${e.message}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1920,1080']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Listen for console errors
  const jsErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') jsErrors.push(msg.text());
  });
  page.on('pageerror', err => jsErrors.push(err.message));

  await test('Game page loads without crashing', async () => {
    const response = await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
    const title = await page.title();
    if (!title.includes('SCIENCE UNIVERSE')) throw new Error(`Unexpected title: ${title}`);
    await sleep(3000); // let Three.js init
    const canvas = await page.$('canvas');
    if (!canvas) throw new Error('No canvas element found');
    const visible = await canvas.isVisible();
    if (!visible) throw new Error('Canvas not visible');
  });

  await test('Start prompt appears', async () => {
    const startPrompt = await page.$('#start-prompt');
    if (!startPrompt) throw new Error('No start prompt');
    const visible = await startPrompt.isVisible();
    if (!visible) throw new Error('Start prompt not visible');
  });

  await test('HUD elements present', async () => {
    for (const id of ['hud-o2-val', 'hud-health-val', 'hud-power-val', 'hud-hotbar', 'touch-controls', 'crosshair']) {
      const el = await page.$(`#${id}`);
      if (!el) throw new Error(`Missing HUD element: #${id}`);
    }
  });

  await test('Canvas element present and sized', async () => {
    await sleep(2000);
    const data = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return { hasCanvas: false };
      return {
        hasCanvas: true,
        width: c.width,
        height: c.height,
        visible: c.offsetWidth > 0 && c.offsetHeight > 0
      };
    });
    if (!data.hasCanvas) throw new Error('No canvas element found');
    if (data.width === 0 || data.height === 0) throw new Error('Canvas has zero dimensions');
    if (!data.visible) throw new Error('Canvas not visible in layout');
  });

  await test('No critical JS errors on load', async () => {
    await sleep(2000);
    const critical = jsErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
    if (critical.length > 0) throw new Error(`JS errors: ${critical.slice(0, 5).join('; ')}`);
  });

  await test('Touch controls exist', async () => {
    for (const id of ['touch-joystick-base', 'touch-look-zone', 'touch-btn-inv', 'touch-btn-mine', 'touch-btn-jump', 'touch-btn-sprint', 'touch-btn-interact', 'touch-btn-menu', 'touch-btn-light']) {
      const el = await page.$(`#${id}`);
      if (!el) throw new Error(`Missing touch control: #${id}`);
    }
  });

  await test('Modal overlays exist', async () => {
    for (const id of ['inventory-modal', 'pause-modal', 'science-academy-overlay', 'new-game-confirm-modal']) {
      const el = await page.$(`#${id}`);
      if (!el) throw new Error(`Missing modal: #${id}`);
    }
  });

  // Mobile viewport test
  await test('Mobile viewport loads (375x812 iPhone SE)', async () => {
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3 });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(3000);
    const canvas = await page.$('canvas');
    if (!canvas || !(await canvas.isVisible())) throw new Error('Canvas not visible on mobile viewport');
    const startPrompt = await page.$('#start-prompt');
    if (startPrompt && !(await startPrompt.isVisible())) throw new Error('Start prompt not visible on mobile');
  });

  // Landscape mobile test
  await test('Mobile landscape viewport loads (812x375)', async () => {
    await page.setViewport({ width: 812, height: 375, deviceScaleFactor: 3 });
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(3000);
    const canvas = await page.$('canvas');
    if (!canvas || !(await canvas.isVisible())) throw new Error('Canvas not visible on mobile landscape');
  });

  // Restore desktop
  await page.setViewport({ width: 1920, height: 1080 });
  await page.reload({ waitUntil: 'networkidle2' });

  // Save/load test
  await test('Save and load buttons exist', async () => {
    const btnSave = await page.$('#btn-save');
    const btnLoad = await page.$('#btn-load');
    if (!btnSave) throw new Error('Save button missing');
    if (!btnLoad) throw new Error('Load button missing');
  });

  await browser.close();

  console.log('\n=== QA RESULTS ===');
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Not tested: ${results.notTested.length}`);
  if (results.failed.length > 0) {
    console.log('\nFailures:');
    for (const f of results.failed) console.log(`  - ${f.name}: ${f.error}`);
  }
  process.exit(results.failed.length > 0 ? 1 : 0);
})();
