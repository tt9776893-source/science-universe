import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify5501Startup() {
  console.log('=== VERIFYING http://127.0.0.1:5501/index.html ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=1280,720'
    ]
  });

  const page = await browser.newPage();
  const errors = [];
  const consoleLogs = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[BROWSER ERROR]', msg.text());
    } else {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.error('[BROWSER UNCAUGHT]', err.toString());
  });

  console.log('1. Navigating to http://127.0.0.1:5501/index.html ...');
  const response = await page.goto('http://127.0.0.1:5501/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(`HTTP Status: ${response.status()}`);

  console.log('2. Waiting for loading completion and start prompt...');
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 30000 });

  const state = await page.evaluate(() => {
    const loadingScreen = document.getElementById('loading-screen');
    const startPrompt = document.getElementById('start-prompt');
    const game = window.suGame;

    return {
      title: document.title,
      loadingScreenDisplay: loadingScreen ? window.getComputedStyle(loadingScreen).display : null,
      startPromptDisplay: startPrompt ? window.getComputedStyle(startPrompt).display : null,
      isLoaded: game?.isLoaded,
      hasScene: !!game?.scene,
      hasRenderer: !!game?.renderer,
      fpsCanvas: !!document.querySelector('canvas'),
      activeHotbarIndex: game?.inventory?.activeHotbarIndex
    };
  });

  console.log('\n--- In-Engine Verification State on Port 5501 ---');
  console.log(JSON.stringify(state, null, 2));

  // Click deploy button
  console.log('3. Clicking DEPLOY TO MARS...');
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1200));

  const postClickState = await page.evaluate(() => {
    const startPrompt = document.getElementById('start-prompt');
    const hud = document.getElementById('hud-overlay');
    return {
      startPromptDisplay: startPrompt ? window.getComputedStyle(startPrompt).display : null,
      hudDisplay: hud ? window.getComputedStyle(hud).display : null,
      cameraPos: window.suGame?.camera?.position,
      playerGrounded: window.suGame?.player?.isGrounded
    };
  });
  console.log('\n--- Post-Deployment State ---');
  console.log(JSON.stringify(postClickState, null, 2));

  // Capture screenshot to prove game is rendering
  const shotPath = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\18_port_5501_verified.png';
  await page.screenshot({ path: shotPath });
  console.log(`\nScreenshot captured: ${shotPath}`);

  await browser.close();

  if (errors.length > 0) {
    console.error(`Found ${errors.length} browser errors.`);
    process.exit(1);
  }

  console.log('\nSUCCESS: Game loads and runs at http://127.0.0.1:5501/index.html with 0 errors!');
}

verify5501Startup().catch(err => {
  console.error('[5501 TEST FAILED]', err);
  process.exit(1);
});
