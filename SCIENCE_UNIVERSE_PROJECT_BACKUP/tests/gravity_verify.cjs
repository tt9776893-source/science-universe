const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--window-size=1280,720']
  });
  
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
      errors.push(msg.text());
    }
  });
  
  try {
    await page.goto('http://127.0.0.1:7777/', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('#start-prompt', { timeout: 10000 });
    await page.click('#start-prompt');
    await new Promise(r => setTimeout(r, 3000));
    
    const result = await page.evaluate(() => {
      const suGame = window.suGame;
      const res = {
        gravityPlayer: suGame.player.gravity,
        jumpHeight: suGame.player.jumpHeight,
        jumpForce: typeof suGame.player.getJumpForce === 'function' ? suGame.player.getJumpForce() : null,
        gravityPhysics: suGame.physics.gravity,
        hasPlayerSetPlanetGravity: typeof suGame.player.setPlanetGravity,
        hasPhysicsSetPlanetGravity: typeof suGame.physics.setPlanetGravity,
        hasTerrainGetFloorHeight: typeof suGame.terrain.getFloorHeightForBody,
        hasHabitatAnchor: typeof suGame.habitatManager._anchorToGround,
        habitatBaseVisible: suGame.habitatManager.baseGroup ? suGame.habitatManager.baseGroup.visible : null,
        hasActiveRover: !!suGame.vehicleSystem.activeRover
      };
      return res;
    });
    
    console.log(JSON.stringify({result, errors}, null, 2));
    
    await page.screenshot({ path: 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME_BACKUP_BEFORE_RELOAD_BUG_FIX\\tests\\screenshots\\gravity_check.png' });
  } catch (e) {
    console.log('ERR:' + e.message);
  }
  
  await browser.close();
})();
