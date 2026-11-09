import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 15000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1500));

  // 1. Initial view
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\current_view_1_spawn.png' });

  // 2. Look down at terrain
  await page.evaluate(() => {
    window.suGame.player.pitch = -0.6;
    window.suGame.camera.rotation.x = -0.6;
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\current_view_2_ground.png' });

  // 3. Move to base and look at base
  await page.evaluate(() => {
    window.suGame.player.position.set(-16, window.suGame.terrain.getBaseHeight(-16, 16) + 2.0, 10);
    window.suGame.camera.position.set(-16, window.suGame.terrain.getBaseHeight(-16, 16) + 2.0, 10);
    window.suGame.camera.lookAt(-16, window.suGame.terrain.getBaseHeight(-16, 16) + 2.0, 16);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\current_view_3_base.png' });

  // 4. Look at rover
  await page.evaluate(() => {
    window.suGame.player.position.set(6, window.suGame.terrain.getBaseHeight(6, 8) + 2.0, 3);
    window.suGame.camera.position.set(6, window.suGame.terrain.getBaseHeight(6, 8) + 2.0, 3);
    window.suGame.camera.lookAt(6, window.suGame.terrain.getBaseHeight(6, 8) + 1.0, 8);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\current_view_4_rover.png' });

  console.log('Current views captured!');
  await browser.close();
})();
