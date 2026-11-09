import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function diagnoseStartup() {
  console.log('=== STARTUP DIAGNOSTIC ===');
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
  const consoleMessages = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
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

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
    console.warn('[REQUEST FAILED]', req.url(), req.failure()?.errorText);
  });

  console.log('\n--- Navigating to http://127.0.0.1:7777/ ---');
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait 4 seconds for loading screen to proceed
  await new Promise(r => setTimeout(r, 4000));

  const state = await page.evaluate(() => {
    const loadingScreen = document.getElementById('loading-screen');
    const startPrompt = document.getElementById('start-prompt');
    const loadingErrorBox = document.getElementById('loading-error-box');
    const statusText = document.getElementById('loading-status-text');

    return {
      title: document.title,
      loadingScreenDisplay: loadingScreen ? window.getComputedStyle(loadingScreen).display : null,
      startPromptDisplay: startPrompt ? window.getComputedStyle(startPrompt).display : null,
      loadingErrorText: loadingErrorBox ? loadingErrorBox.innerText : null,
      loadingStatusText: statusText ? statusText.innerText : null,
      hasGameInstance: !!window.suGame,
      isLoaded: window.suGame?.isLoaded,
      isPaused: window.suGame?.isPaused,
      currentStep: window.suGame?.currentInitStep,
      cameraPos: window.suGame?.camera?.position,
      rendererWidth: window.suGame?.renderer?.domElement?.width,
      rendererHeight: window.suGame?.renderer?.domElement?.height
    };
  });

  console.log('\n--- Application Startup State ---');
  console.log(JSON.stringify(state, null, 2));

  console.log('\n--- Errors Encountered ---');
  console.log(`Errors: ${errors.length}, Failed Requests: ${failedRequests.length}`);

  // Click start prompt to verify entering game
  if (state.startPromptDisplay !== 'none') {
    console.log('\nClicking #start-prompt (DEPLOY TO MARS)...');
    await page.click('#start-prompt');
    await new Promise(r => setTimeout(r, 1000));
    const promptAfterClick = await page.evaluate(() => {
      const el = document.getElementById('start-prompt');
      return el ? window.getComputedStyle(el).display : null;
    });
    console.log('Start prompt after click display:', promptAfterClick);
  }

  // Take screenshot to confirm rendering
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\startup_verification.png' });
  console.log('Saved screenshot: tests/screenshots/startup_verification.png');

  await browser.close();
  return { state, errors, failedRequests };
}

diagnoseStartup().catch(err => {
  console.error('[DIAGNOSTIC FAILED]', err);
  process.exit(1);
});
