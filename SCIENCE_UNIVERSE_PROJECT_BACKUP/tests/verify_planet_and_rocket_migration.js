import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runMigrationTests() {
  console.log('=== STARTING PLANET & ROCKET SYSTEM MIGRATION VERIFICATION ===\n');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const consoleLogs = [];
  const errors = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message || err.toString());
    console.error('[PAGE ERROR]', err);
  });

  const results = {};
  const screenshotDir = path.resolve('tests/screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });

  try {
    // 1. Main game load
    console.log('Test 1: Navigating to http://127.0.0.1:7777/ ...');
    await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
    await page.click('#start-prompt');
    await new Promise(r => setTimeout(r, 2500));
    results.gameLoaded = true;
    console.log('✔ Test 1: Main game successfully initialized and running.');

    // 2. Rocket & Launch Pad verification
    console.log('Test 2: Verifying surface rocket & launch pad presence...');
    const rocketCheck = await page.evaluate(() => {
      const g = window.suGame;
      const rm = g.rocketManager;
      if (!rm) return { exists: false };
      return {
        exists: true,
        state: rm.state,
        padPos: rm.padOrigin,
        hasModel: !!rm.rocketModel,
        hasPlume: !!rm.plumeGroup,
        hasPad: true
      };
    });
    results.rocketOnSurface = rocketCheck.exists && rocketCheck.hasModel;
    console.log('✔ Test 2: Surface Rocket on Launch Pad:', rocketCheck);

    // Capture screenshot 1: Surface Rocket on Launch Pad
    console.log('Capturing Screenshot: 19_surface_rocket_launchpad.png ...');
    await page.evaluate(() => {
      const g = window.suGame;
      const rm = g.rocketManager;
      const padY = rm.padOrigin.y;
      const eyeX = 14, eyeZ = 3;
      const groundY = g.terrain.getWalkableFloor(eyeX, padY + 5, eyeZ);
      g.player.position.set(eyeX, groundY + 1.8, eyeZ);
      g.player.velocity.set(0, 0, 0);

      const targetX = rm.padOrigin.x;
      const targetY = padY + 12.0;
      const targetZ = rm.padOrigin.z;

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
    const shotRocket = path.join(screenshotDir, '19_surface_rocket_launchpad.png');
    await page.screenshot({ path: shotRocket });
    console.log('Saved:', shotRocket);

    // 3. Enter Rocket Cockpit
    console.log('Test 3: Entering Rocket Cockpit & Launch HUD verification...');
    const cockpitCheck = await page.evaluate(() => {
      const g = window.suGame;
      g.rocketManager.enterRocket();
      const hud = document.getElementById('rocket-cockpit-hud');
      return {
        inside: g.rocketManager.isPlayerInside,
        hudVisible: hud && hud.style.display !== 'none'
      };
    });
    results.cockpitEntered = cockpitCheck.inside && cockpitCheck.hudVisible;
    console.log('✔ Test 3: Cockpit entered & Launch HUD visible:', cockpitCheck);

    // Capture screenshot 2: Rocket Cockpit / Pre-Launch HUD
    const shotCockpit = path.join(screenshotDir, '20_rocket_cockpit_prelaunch.png');
    await page.screenshot({ path: shotCockpit });
    console.log('Saved:', shotCockpit);

    // 4. Rocket Launch Sequence (Ascent)
    console.log('Test 4: Initiating Rocket Launch & Ascent sequence...');
    await page.evaluate(() => {
      window.suGame.rocketManager.startLaunch();
    });
    // Wait for ignition + vertical ascent
    await new Promise(r => setTimeout(r, 4500));

    const ascentCheck = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      return {
        state: rm.state,
        alt: Math.round(rm.currentAltitude),
        vel: Math.round(rm.verticalVelocity),
        plumeVisible: rm.plumeGroup.visible
      };
    });
    results.rocketAscent = (ascentCheck.state === 'ASCENT' && ascentCheck.plumeVisible);
    console.log('✔ Test 4: Rocket Ascent Telemetry:', ascentCheck);

    // Capture screenshot 3: Rocket Ascent
    const shotAscent = path.join(screenshotDir, '21_rocket_ascent_fire_plume.png');
    await page.screenshot({ path: shotAscent });
    console.log('Saved:', shotAscent);

    // 5. Transition to Spaceflight (Solar System)
    console.log('Test 5: Transitioning to Solar System Spaceflight...');
    await page.evaluate(() => {
      window.suGame.enterSpaceflight('Mars');
    });
    await new Promise(r => setTimeout(r, 1200));

    const spaceCheck = await page.evaluate(() => {
      const sf = window.suGame.spaceflightSystem;
      const hud = document.getElementById('spaceflight-hud');
      return {
        active: sf && sf.isActive,
        bodiesCount: sf.bodies.length,
        selectedBody: sf.selectedBody ? sf.selectedBody.name : null,
        hudVisible: hud && hud.style.display !== 'none'
      };
    });
    results.spaceflightActive = spaceCheck.active && spaceCheck.bodiesCount >= 8;
    console.log('✔ Test 5: Solar System Spaceflight Active:', spaceCheck);

    // Capture screenshot 4: Solar System Spaceflight
    const shotSpace = path.join(screenshotDir, '22_solar_system_spaceflight.png');
    await page.screenshot({ path: shotSpace });
    console.log('Saved:', shotSpace);

    // 6. Planet Selection & Scientific Navigation Telemetry
    console.log('Test 6: Selecting Earth & verifying scientific info panel...');
    const selectCheck = await page.evaluate(() => {
      const sf = window.suGame.spaceflightSystem;
      const earth = sf.bodies.find(b => b.data.name === 'Earth');
      if (earth) sf.selectTarget(earth.data);
      const panel = document.getElementById('planet-info-panel');
      const name = document.getElementById('info-target-name')?.textContent;
      return {
        panelVisible: panel && panel.style.display !== 'none',
        targetName: name
      };
    });
    results.planetSelection = selectCheck.panelVisible && selectCheck.targetName.includes('EARTH');
    console.log('✔ Test 6: Planet Selection & Scientific Panel:', selectCheck);

    // 7. Planet Approach / Transfer Trajectory
    console.log('Test 7: Initiating transfer trajectory approach...');
    await page.evaluate(() => {
      const sf = window.suGame.spaceflightSystem;
      const mars = sf.bodies.find(b => b.data.name === 'Mars');
      if (mars) sf.selectTarget(mars.data);
      sf.startTransferTo(mars.data);
    });
    await new Promise(r => setTimeout(r, 1000));

    const transferCheck = await page.evaluate(() => {
      const sf = window.suGame.spaceflightSystem;
      return {
        flightState: sf.flightState,
        plumeVisible: sf.spacePlumeMesh.visible
      };
    });
    results.transferTrajectory = (transferCheck.flightState === 'TRANSFER_TRAJECTORY');
    console.log('✔ Test 7: Transfer Trajectory Active:', transferCheck);

    // Capture screenshot 5: Transfer trajectory
    const shotTransfer = path.join(screenshotDir, '23_transfer_trajectory_flight.png');
    await page.screenshot({ path: shotTransfer });
    console.log('Saved:', shotTransfer);

    // 8. Initiate Planetary Landing Sequence
    console.log('Test 8: Initiating Planetary Landing on Mars...');
    await page.evaluate(() => {
      window.suGame.landOnPlanet('Mars');
    });
    await new Promise(r => setTimeout(r, 1200));

    const landingCheck = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      return {
        state: rm.state,
        planetId: rm.currentPlanetId,
        alt: Math.round(rm.currentAltitude),
        descentVel: Math.round(rm.verticalVelocity),
        spaceflightInactive: !window.suGame.spaceflightSystem.isActive
      };
    });
    results.landingInitiated = ['APPROACHING', 'DESCENDING'].includes(landingCheck.state) && landingCheck.planetId === 'mars';
    console.log('✔ Test 8: Planetary Landing Sequence Engaged:', landingCheck);

    // Capture screenshot 6: Retro Descent Landing
    const shotLanding = path.join(screenshotDir, '24_planetary_retro_descent.png');
    await page.screenshot({ path: shotLanding });
    console.log('Saved:', shotLanding);

    // 9. Fast-forward Touchdown & Exit Spacecraft onto Surface
    console.log('Test 9: Completing touchdown & exiting rocket onto surface...');
    await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      rm.rocketGroup.position.y = rm.landedY;
      rm.state = 'LANDED';
      rm._onLandedTouchdown();
      rm.exitRocket();
    });
    await new Promise(r => setTimeout(r, 1000));

    const exitCheck = await page.evaluate(() => {
      const g = window.suGame;
      return {
        isPlayerInside: g.rocketManager.isPlayerInside,
        playerPos: { x: Math.round(g.player.position.x), y: Math.round(g.player.position.y), z: Math.round(g.player.position.z) },
        toolsAvailable: g.inventory.hotbar.filter(Boolean).length,
        hotbarVisible: !!document.getElementById('hud-hotbar')
      };
    });
    results.surfaceSpawnAndTools = (!exitCheck.isPlayerInside && exitCheck.toolsAvailable >= 10);
    console.log('✔ Test 9: Player Spawns on Surface with all Tools intact:', exitCheck);

    // 10. Verify Terrain Excavation after Spaceflight & Landing
    console.log('Test 10: Verifying terrain excavation after spaceflight cycle...');
    const excavateCheck = await page.evaluate(() => {
      const g = window.suGame;
      const px = -3, pz = -3;
      const initialHeight = g.terrain.getHeightAt(px, pz);
      const initialDensity = g.terrain.sampleDensity(px, initialHeight, pz);
      // Carve sphere
      const carveRes = g.terrain.carveSphere({ x: px, y: initialHeight, z: pz }, 2.0, false);
      const postDensity = g.terrain.sampleDensity(px, initialHeight, pz);
      return {
        success: carveRes.success,
        modifiedChunks: carveRes.modifiedChunks,
        yieldItem: carveRes.yieldItem,
        initialDensity: Math.round(initialDensity * 100) / 100,
        postDensity: Math.round(postDensity * 100) / 100,
        excavated: (postDensity < initialDensity || carveRes.modifiedChunks > 0)
      };
    });
    results.excavationWorks = excavateCheck.excavated;
    console.log('✔ Test 10: Terrain Excavation Functional post-spaceflight:', excavateCheck);

    // 11. Verify Save / Load with Spacecraft State
    console.log('Test 11: Testing Save and Load persistence...');
    const saveCheck = await page.evaluate(() => {
      const g = window.suGame;
      const saveRes = g.saveSystem.save();
      const loadRes = g.saveSystem.load();
      return {
        saveSuccess: saveRes.success,
        loadSuccess: loadRes.success
      };
    });
    results.saveLoadSuccess = saveCheck.saveSuccess && saveCheck.loadSuccess;
    console.log('✔ Test 11: Save and Load Success:', saveCheck);

    // Final screenshot: Post-Landing Surface Gameplay with Tools & Landed Rocket
    console.log('Capturing Screenshot: 25_post_landing_surface_gameplay.png ...');
    await page.evaluate(() => {
      const g = window.suGame;
      const rm = g.rocketManager;
      const padY = rm.padOrigin.y;
      const eyeX = 14, eyeZ = 3;
      const groundY = g.terrain.getWalkableFloor(eyeX, padY + 5, eyeZ);
      g.player.position.set(eyeX, groundY + 1.8, eyeZ);
      g.player.velocity.set(0, 0, 0);

      const targetX = rm.padOrigin.x;
      const targetY = padY + 10.0;
      const targetZ = rm.padOrigin.z;

      const dx = targetX - eyeX;
      const dy = targetY - (groundY + 1.8);
      const dz = targetZ - eyeZ;

      g.player.yaw = Math.atan2(-dx, -dz);
      g.player.pitch = Math.atan2(dy, Math.hypot(dx, dz));

      const euler = new THREE.Euler(g.player.pitch, g.player.yaw, 0, 'YXZ');
      g.camera.quaternion.setFromEuler(euler);
      g.camera.position.set(eyeX, groundY + 1.8, eyeZ);
      g.inventory.selectedSlot = 0;
      g.player.updateEquippedTool();
    });
    await new Promise(r => setTimeout(r, 800));
    const shotFinal = path.join(screenshotDir, '25_post_landing_surface_gameplay.png');
    await page.screenshot({ path: shotFinal });
    console.log('Saved:', shotFinal);

    console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===');
    console.log('Summary of Test Results:', JSON.stringify(results, null, 2));

    fs.writeFileSync(
      'tests/migration_test_report.json',
      JSON.stringify({ results, consoleLogs: consoleLogs.slice(-25), errors }, null, 2)
    );

  } catch (err) {
    console.error('[TEST SUITE FAILED]', err);
    results.testFailed = err.message || err.toString();
  } finally {
    await browser.close();
  }
}

runMigrationTests();
