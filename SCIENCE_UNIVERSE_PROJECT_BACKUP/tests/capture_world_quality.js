import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function captureQualityViews() {
  console.log('=== CAPTURING WORLD QUALITY RECOVERY EVIDENCE ===');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err));

  console.log('Navigating to http://127.0.0.1:7777/ ...');
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 15000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 2500));

  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  // Define helper on window
  await page.evaluate(() => {
    window.setPlayerView = function(eyeX, eyeY, eyeZ, targetX, targetY, targetZ) {
      const p = window.suGame.player;
      p.position.set(eyeX, eyeY, eyeZ);
      p.velocity.set(0, 0, 0);
      const dx = targetX - eyeX;
      const dy = targetY - (eyeY + p.currentEyeHeight);
      const dz = targetZ - eyeZ;
      const horiz = Math.hypot(dx, dz);
      p.yaw = Math.atan2(-dx, -dz);
      p.pitch = Math.max(-1.45, Math.min(1.45, Math.atan2(dy, horiz)));
      const euler = new window.THREE.Euler(p.pitch, p.yaw, 0, 'YXZ');
      window.suGame.camera.quaternion.setFromEuler(euler);
      window.suGame.camera.position.set(eyeX, eyeY + p.currentEyeHeight, eyeZ);
    };
  });

  // 1. Daytime Landscape & Test Area Overview (Showing smooth dunes, crater rim, escarpment without teeth)
  console.log('1. Capturing Daytime Landscape...');
  await page.evaluate(() => {
    const t = window.suGame.terrain;
    const y = t.getBaseHeight(0, 0);
    window.setPlayerView(0, y, 0, -25, t.getBaseHeight(-25, 20) + 2.0, 20);
  });
  await new Promise(r => setTimeout(r, 800));
  const shotDay = path.join(screenshotDir, 'quality_1_daytime_landscape.png');
  await page.screenshot({ path: shotDay });
  console.log(`Saved: ${shotDay}`);

  // 2. Terrain Close-Up (Showing PBR Sand & Normal Map)
  console.log('2. Capturing Terrain Close-Up...');
  await page.evaluate(() => {
    const t = window.suGame.terrain;
    const y = t.getBaseHeight(0, 0);
    window.setPlayerView(0, y, 0, 0, y - 2.8, 1.0);
  });
  await new Promise(r => setTimeout(r, 800));
  const shotTerrain = path.join(screenshotDir, 'quality_2_terrain_closeup.png');
  await page.screenshot({ path: shotTerrain });
  console.log(`Saved: ${shotTerrain}`);

  // 3. Rover in Test Area (Showing realistic 3D Explorer Rover on terrain)
  console.log('3. Capturing Explorer Rover...');
  await page.evaluate(() => {
    const rover = window.suGame.vehicleSystem.activeRover;
    const rpos = rover ? rover.position : { x: 4, y: 5, z: 5 };
    // Stand 4.5m away with clear direct view of the Explorer Rover
    window.setPlayerView(rpos.x + 3.2, rpos.y + 0.6, rpos.z + 3.2, rpos.x, rpos.y + 0.9, rpos.z);
  });
  await new Promise(r => setTimeout(r, 800));
  const shotRover = path.join(screenshotDir, 'quality_3_rover.png');
  await page.screenshot({ path: shotRover });
  console.log(`Saved: ${shotRover}`);

  // 4. Habitat Exterior (Showing dome, airlock hatch, solar plant, and reactor)
  console.log('4. Capturing Habitat Exterior...');
  await page.evaluate(() => {
    const base = window.suGame.habitatManager.baseOrigin;
    // Stand in front of airlock entrance looking at base complex
    window.setPlayerView(base.x - 4.0, base.y + 1.2, base.z - 6.0, base.x, base.y + 2.0, base.z + 4.0);
  });
  await new Promise(r => setTimeout(r, 800));
  const shotHabExt = path.join(screenshotDir, 'quality_4_habitat_exterior.png');
  await page.screenshot({ path: shotHabExt });
  console.log(`Saved: ${shotHabExt}`);

  // 5. Habitat Interior & Scientific Workstations
  console.log('5. Capturing Habitat Interior...');
  await page.evaluate(() => {
    const base = window.suGame.habitatManager.baseOrigin;
    // Inside the research dome: stand inside looking at the Scientific Analysis Computer & Spectrometer
    window.setPlayerView(base.x + 0.6, base.y + 0.9, base.z + 7.5, base.x - 2.2, base.y + 1.3, base.z + 6.0);
    window.suGame.habitatManager.isPlayerInside = true;
  });
  await new Promise(r => setTimeout(r, 800));
  const shotHabInt = path.join(screenshotDir, 'quality_5_habitat_interior.png');
  await page.screenshot({ path: shotHabInt });
  console.log(`Saved: ${shotHabInt}`);

  // 6. Underground Excavation & Geological Layers
  console.log('6. Capturing Underground Excavation...');
  await page.evaluate(() => {
    const t = window.suGame.terrain;
    const holeX = -2;
    const holeZ = -5;
    const surfY = t.getBaseHeight(holeX, holeZ);

    t.carveSphere({ x: holeX, y: surfY - 1.0, z: holeZ }, 2.6, false);
    t.carveSphere({ x: holeX, y: surfY - 3.0, z: holeZ }, 2.4, false);

    window.setPlayerView(holeX, surfY + 0.2, holeZ + 2.8, holeX, surfY - 2.5, holeZ);
  });
  await new Promise(r => setTimeout(r, 800));
  const shotExcavation = path.join(screenshotDir, 'quality_6_underground_excavation.png');
  await page.screenshot({ path: shotExcavation });
  console.log(`Saved: ${shotExcavation}`);

  console.log('\nAll 6 required views successfully captured!');
  await browser.close();
}

captureQualityViews().catch(err => {
  console.error('[CAPTURE FAILED]', err);
  process.exit(1);
});
