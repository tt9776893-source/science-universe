import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testLiveServer() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('resources.json')) {
      errors.push(msg.text());
      console.error('[LIVE-SERVER CONSOLE ERROR]', msg.text());
    } else {
      console.log(`[LIVE-SERVER ${msg.type()}]`, msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.error('[LIVE-SERVER PAGE ERROR]', err);
  });

  console.log('Testing Live Server at http://127.0.0.1:5501/index.html ...');
  await page.goto('http://127.0.0.1:5501/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Waiting for start prompt on Live Server...');
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 25000 });
  console.log('Clicking Deploy to Mars on Live Server...');
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1500));

  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  await page.screenshot({ path: path.join(screenshotDir, '04_live_server_gameplay.png') });
  console.log('Saved 04_live_server_gameplay.png');

  const check = await page.evaluate(() => {
    const g = window.suGame;
    return {
      isLoaded: g && g.isLoaded,
      chunkCount: g && g.terrain && g.terrain.chunks.size,
      playerPos: g && g.player && { x: g.player.position.x, y: g.player.position.y, z: g.player.position.z },
      currentTool: g && g.player && g.player.currentToolDef && g.player.currentToolDef.name
    };
  });

  console.log('Live Server Gameplay Check:', check);
  await browser.close();

  return { success: check.isLoaded && check.chunkCount > 0 && errors.length === 0, check, errors };
}

testLiveServer().then(res => {
  console.log('Live Server test completed. Success:', res.success);
}).catch(err => {
  console.error('Live Server test failed:', err);
  process.exit(1);
});
