import puppeteer from 'puppeteer-core';

async function checkBaseSize() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });

  const bbox = await page.evaluate(async () => {
    const reg = window.suGame.assetRegistry;
    const base = await reg.loadModelOnDemand('buildings', 'SU_Base_B_Scientific_Research_Center.glb');
    if (!base) return null;
    base.updateMatrixWorld(true);
    const box = new window.THREE.Box3().setFromObject(base);
    const size = new window.THREE.Vector3();
    box.getSize(size);
    return {
      min: box.min,
      max: box.max,
      size: size
    };
  });

  console.log('Base Box:', JSON.stringify(bbox, null, 2));
  await browser.close();
}

checkBaseSize().catch(console.error);
