import puppeteer from 'puppeteer-core';

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 2000));
  const info = await page.evaluate(() => {
    const rm = window.suGame.rocketManager;
    const box = new THREE.Box3().setFromObject(rm.rocketModel);
    const size = new THREE.Vector3();
    box.getSize(size);
    return {
      landedY: rm.landedY,
      padPos: rm.padOrigin,
      modelBox: { min: box.min, max: box.max, size: size },
      rocketGroupPos: rm.rocketGroup.position,
      playerPos: window.suGame.player.position,
      cameraPos: window.suGame.camera.position,
      groundAtPad: window.suGame.terrain.getBaseHeight(16, 16),
      groundAtPlayer: window.suGame.terrain.getBaseHeight(window.suGame.player.position.x, window.suGame.player.position.z)
    };
  });
  // Position player at (14, ground, 3) looking at rocket at (16, padY + 12, 16)
  await page.evaluate(() => {
    const g = window.suGame;
    const rm = g.rocketManager;
    const eyeX = 14, eyeZ = 3;
    const groundY = g.terrain.getWalkableFloor(eyeX, 10, eyeZ);
    g.player.position.set(eyeX, groundY + 1.8, eyeZ);
    g.player.velocity.set(0, 0, 0);

    const targetX = 16;
    const targetY = rm.padOrigin.y + 12.0;
    const targetZ = 16;

    const dx = targetX - eyeX;
    const dy = targetY - (groundY + 1.8);
    const dz = targetZ - eyeZ;

    g.player.yaw = Math.atan2(-dx, -dz);
    g.player.pitch = Math.atan2(dy, Math.hypot(dx, dz));

    const euler = new THREE.Euler(g.player.pitch, g.player.yaw, 0, 'YXZ');
    g.camera.quaternion.setFromEuler(euler);
    g.camera.position.set(eyeX, groundY + 1.8, eyeZ);
    g.player.updateEquippedTool();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots\\test_framing.png' });
  console.log('Saved test_framing.png');
  await browser.close();
}

check();
