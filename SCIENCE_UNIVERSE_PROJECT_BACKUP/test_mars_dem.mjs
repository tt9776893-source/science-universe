const puppeteer = await import('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--window-size=1280,720']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR:', err.message));
  await page.goto('http://127.0.0.1:7777/', {waitUntil: 'domcontentloaded', timeout: 60000});
  try {
    await page.waitForSelector('#start-prompt', {timeout: 10000});
    await page.click('#start-prompt');
  } catch (e) {
    console.log('NO_START_PROMPT', e.message);
  }
  await new Promise(r => setTimeout(r, 4000));
  
  const result = await page.evaluate(() => {
    const out = {};
    try {
      out.marsDemLoaded = !!window.suGame?.terrain?.marsDem;
      out.runtimeScale = window.suGame?.terrain?.marsDem?.runtimeScale;
      out.runtimeBaseMeters = window.suGame?.terrain?.marsDem?.runtimeBaseMeters;
      out.gameBaseHeight = window.suGame?.terrain?.marsDem?.gameBaseHeight;
      out.featherMeters = window.suGame?.terrain?.marsDem?.featherMeters;
      out.h00 = window.suGame?.terrain?.getBaseHeight(0,0);
      out.h100 = window.suGame?.terrain?.getBaseHeight(100,0);
      out.h200 = window.suGame?.terrain?.getBaseHeight(200,0);
      out.h300 = window.suGame?.terrain?.getBaseHeight(300,0);
      out.b00 = window.suGame?.terrain?._demBlendWeight ? window.suGame.terrain._demBlendWeight(0,0) : null;
      out.b150 = window.suGame?.terrain?._demBlendWeight ? window.suGame.terrain._demBlendWeight(150,0) : null;
      out.b250 = window.suGame?.terrain?._demBlendWeight ? window.suGame.terrain._demBlendWeight(250,0) : null;
      out.b300 = window.suGame?.terrain?._demBlendWeight ? window.suGame.terrain._demBlendWeight(300,0) : null;
      out.p00 = window.suGame?.terrain?._getProceduralMarsHeight ? window.suGame.terrain._getProceduralMarsHeight(0,0) : null;
      out.p300 = window.suGame?.terrain?._getProceduralMarsHeight ? window.suGame.terrain._getProceduralMarsHeight(300,0) : null;
    } catch(e) {
      out.error = e.toString();
    }
    return out;
  });
  
  await page.screenshot({path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME_BACKUP_BEFORE_RELOAD_BUG_FIX\\tests\\screenshots\\mars_dem_check.png'});
  console.log('RESULT:' + JSON.stringify(result));
  await browser.close();
})();
