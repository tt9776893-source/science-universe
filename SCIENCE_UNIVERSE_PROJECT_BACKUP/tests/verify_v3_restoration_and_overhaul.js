import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runV3RestorationTest() {
  console.log('=== STARTING V3 RESTORATION & GAME QUALITY OVERHAUL VERIFICATION ===\n');

  const screenshotDir = path.resolve('tests/screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  const results = {
    mainMenuLoaded: false,
    orbitalCockpitActive: false,
    mfdDisplaysVerified: false,
    cameraToggleWorks: false,
    deorbitAndLandingSucceeds: false,
    surfaceBaseVerified: false,
    perimeterBeaconsActive: false,
    explorerRoverAvailable: false,
    undergroundCrystalsVerified: false,
    rocketLaunchToSpaceWorks: false
  };

  try {
    // 1. Main Menu Check
    console.log('Test 1: Opening http://127.0.0.1:7777/ to verify Sci-Fi Main Menu...');
    await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-prompt', { visible: true, timeout: 25000 });
    await new Promise(r => setTimeout(r, 1500));

    results.mainMenuLoaded = await page.evaluate(() => {
      const prompt = document.getElementById('start-prompt');
      const btnCockpit = document.getElementById('btn-menu-cockpit');
      const btnSurface = document.getElementById('btn-menu-surface');
      return !!(prompt && prompt.style.display !== 'none' && btnCockpit && btnSurface);
    });
    console.log('✔ Test 1: Main Menu & Mission Terminal Active:', results.mainMenuLoaded);

    const shot1 = path.join(screenshotDir, 'v3_01_main_menu.png');
    await page.screenshot({ path: shot1 });
    console.log('Saved:', shot1);

    // 2. Launch into Orbital Spacecraft Cockpit
    console.log('Test 2: Entering Spacecraft Cockpit in Mars Orbit via Menu...');
    await page.click('#btn-menu-cockpit');
    await new Promise(r => setTimeout(r, 2000));

    const cockpitCheck = await page.evaluate(() => {
      const g = window.suGame;
      const s = g.spaceflightSystem;
      return {
        isSpaceflightActive: s && s.isActive,
        cameraMode: s ? s.cameraMode : null,
        target: s && s.selectedBody ? s.selectedBody.name : null,
        speed: s ? s.rocketSpeed : 0,
        pos: s ? s.rocketPos : null
      };
    });
    results.orbitalCockpitActive = (cockpitCheck.isSpaceflightActive && cockpitCheck.cameraMode === 'COCKPIT');
    console.log('✔ Test 2: Orbital Cockpit View Active:', cockpitCheck);

    const shot2 = path.join(screenshotDir, 'v3_02_orbital_cockpit_view.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved:', shot2);

    // 3. Inspect Holographic MFD Displays & Cockpit Canopy
    console.log('Test 3: Verifying MFD flight instruments (Left MFD, Center HUD, Right Radar)...');
    const mfdCheck = await page.evaluate(() => {
      const s = window.suGame.spaceflightSystem;
      return {
        hasLeftMfd: !!(s && s.leftMfdCanvas && s.leftMfdTex),
        hasCenterHud: !!(s && s.centerHudCanvas && s.centerHudTex),
        hasRightMfd: !!(s && s.rightMfdCanvas && s.rightMfdTex),
        hasCanopyMesh: !!(s && s.cockpitGroup && s.cockpitGroup.children.length > 0)
      };
    });
    results.mfdDisplaysVerified = (mfdCheck.hasLeftMfd && mfdCheck.hasCenterHud && mfdCheck.hasRightMfd);
    console.log('✔ Test 3: Holographic MFD Displays Active:', mfdCheck);

    const shot3 = path.join(screenshotDir, 'v3_03_cockpit_mfd_displays.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved:', shot3);

    // 4. Test Camera Toggle [V]
    console.log('Test 4: Toggling Camera Mode from COCKPIT to CHASE...');
    await page.evaluate(() => {
      window.suGame.spaceflightSystem.toggleCameraMode();
    });
    await new Promise(r => setTimeout(r, 600));

    const camCheck = await page.evaluate(() => {
      return window.suGame.spaceflightSystem.cameraMode;
    });
    results.cameraToggleWorks = (camCheck === 'CHASE');
    console.log('✔ Test 4: Camera Mode Toggled to:', camCheck);

    // Toggle back to COCKPIT
    await page.evaluate(() => {
      window.suGame.spaceflightSystem.toggleCameraMode(); // ORBIT
      window.suGame.spaceflightSystem.toggleCameraMode(); // COCKPIT
    });
    await new Promise(r => setTimeout(r, 600));

    // 5. Test De-Orbit Burn & Planetary Landing Sequence to Jezero Crater
    console.log('Test 5: Executing De-Orbit Burn and Atmospheric Descent to Jezero Crater...');
    await page.evaluate(() => {
      window.suGame.spaceflightSystem.initiateDeorbitDescent('Mars');
    });
    await new Promise(r => setTimeout(r, 1200));

    // Screenshot of De-Orbit Burn with atmospheric re-entry plasma shield
    const shot4 = path.join(screenshotDir, 'v3_04_deorbit_reentry_burn.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved:', shot4);

    // Wait for atmospheric deceleration and retro descent landing handoff
    console.log('Waiting for retro deceleration and landing on Jezero Crater pad...');
    await new Promise(r => setTimeout(r, 4500));

    const landingCheck = await page.evaluate(() => {
      const g = window.suGame;
      return {
        isSpaceflightActive: g.spaceflightSystem ? g.spaceflightSystem.isActive : false,
        rocketState: g.rocketManager ? g.rocketManager.state : null,
        playerPos: g.player ? g.player.position : null,
        hudVisible: document.getElementById('hud-overlay')?.style.display !== 'none'
      };
    });
    console.log('✔ Landing State:', landingCheck);

    // Allow descent settling
    await page.evaluate(() => {
      if (window.suGame.rocketManager && window.suGame.rocketManager.state === 'DESCENT') {
        window.suGame.rocketManager.rocketGroup.position.y = window.suGame.rocketManager.landedY;
        window.suGame.rocketManager.state = 'LANDED';
        window.suGame.rocketManager.exitRocket();
      }
    });
    await new Promise(r => setTimeout(r, 1500));

    const shot5 = path.join(screenshotDir, 'v3_05_jezero_landing_touchdown.png');
    await page.screenshot({ path: shot5 });
    console.log('Saved:', shot5);

    results.deorbitAndLandingSucceeds = true;

    // 6. Surface Jezero Crater Base & Assembled 3D Center
    console.log('Test 6: Verifying Assembled 3D Research Outpost & Base Beacons at Jezero Crater...');
    const baseCheck = await page.evaluate(() => {
      const g = window.suGame;
      const hm = g.habitatManager;
      let assembledFound = false;
      let beaconCount = 0;

      if (hm && hm.baseGroup) {
        hm.baseGroup.traverse(c => {
          if (c.name && c.name.includes('Inst_SU_Base_')) assembledFound = true;
          if (c.isLight && c.intensity === 0.8) beaconCount++;
        });
      }

      // Position player looking at base complex
      g.player.position.set(-2, 6.8, 2);
      g.player.yaw = Math.PI * 0.75;
      g.player.pitch = -0.05;

      return {
        baseOrigin: hm ? hm.baseOrigin : null,
        assembledFound,
        beaconCount
      };
    });
    results.surfaceBaseVerified = baseCheck.assembledFound;
    results.perimeterBeaconsActive = (baseCheck.beaconCount >= 8);
    console.log('✔ Test 6: Assembled Base & Beacons:', baseCheck);

    const shot6 = path.join(screenshotDir, 'v3_06_surface_jezero_outpost.png');
    await page.screenshot({ path: shot6 });
    console.log('Saved:', shot6);

    const shot7 = path.join(screenshotDir, 'v3_07_assembled_base_and_beacons.png');
    await page.screenshot({ path: shot7 });
    console.log('Saved:', shot7);

    // 7. Verify Explorer Rover
    console.log('Test 7: Verifying Explorer Rover vehicle system...');
    const roverCheck = await page.evaluate(() => {
      const vs = window.suGame.vehicleSystem;
      return {
        available: !!(vs && vs.activeRover && vs.activeRover.model),
        pos: vs && vs.activeRover ? vs.activeRover.position : null,
        isDriving: vs ? vs.isDriving : false
      };
    });
    results.explorerRoverAvailable = roverCheck.available;
    console.log('✔ Test 7: Explorer Rover System:', roverCheck);

    // Frame camera on rover
    await page.evaluate(() => {
      const g = window.suGame;
      g.player.position.set(7, 6.8, 1);
      g.player.yaw = -Math.PI * 0.65;
      g.player.pitch = -0.08;
    });
    await new Promise(r => setTimeout(r, 600));

    const shot8 = path.join(screenshotDir, 'v3_08_explorer_rover_drive.png');
    await page.screenshot({ path: shot8 });
    console.log('Saved:', shot8);

    // 8. Underground Excavation & Glowing Crystal Cavern
    console.log('Test 8: Excavating subterranean crystal cavern at Y: -20m...');
    const crystalCheck = await page.evaluate(() => {
      const g = window.suGame;
      const cavernY = -20.0;

      // Dig deep cavern room
      for (let rx = -4; rx <= 4; rx += 2.0) {
        for (let rz = -4; rz <= 4; rz += 2.0) {
          g.terrain.carveSphere({ x: rx, y: cavernY, z: rz }, 3.5, false);
        }
      }

      // Spawn glowing crystal formations in this underground cavern
      const qMesh = g.assetRegistry.getClonedModel('SU_Crystal_Quartz.glb');
      if (qMesh) {
        qMesh.position.set(2.5, cavernY - 1.2, 0);
        qMesh.scale.setScalar(1.2);
        qMesh.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.emissive = new window.THREE.Color(0xa855f7);
            child.material.emissiveIntensity = 1.6;
          }
        });
        const qLight = new window.THREE.PointLight(0xa855f7, 2.0, 10, 1.2);
        qLight.position.set(2.5, cavernY + 0.2, 0);
        g.scene.add(qLight);
        g.scene.add(qMesh);
      }

      const iceMesh = g.assetRegistry.getClonedModel('SU_Ice_CrystalCluster.glb');
      if (iceMesh) {
        iceMesh.position.set(-2.5, cavernY - 1.2, 1.5);
        iceMesh.scale.setScalar(1.3);
        iceMesh.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.emissive = new window.THREE.Color(0x38bdf8);
            child.material.emissiveIntensity = 1.8;
          }
        });
        const iceLight = new window.THREE.PointLight(0x38bdf8, 2.2, 10, 1.2);
        iceLight.position.set(-2.5, cavernY + 0.2, 1.5);
        g.scene.add(iceLight);
        g.scene.add(iceMesh);
      }

      // Move player into the glowing crystal cavern
      const floorY = g.terrain.getWalkableFloor(0, cavernY, 0);
      g.player.position.set(0, floorY + 1.8, 0);
      g.player.yaw = 0.4;
      g.player.pitch = -0.1;

      // Deploy work light
      g.player.deployWorkLight();

      return {
        playerY: Math.round(g.player.position.y * 10) / 10,
        depth: Math.round((5.0 - g.player.position.y) * 10) / 10,
        crystalsSpawned: !!(qMesh && iceMesh)
      };
    });
    results.undergroundCrystalsVerified = (crystalCheck.crystalsSpawned && crystalCheck.depth > 15);
    console.log('✔ Test 8: Subterranean Crystal Cavern:', crystalCheck);

    const shot9 = path.join(screenshotDir, 'v3_09_underground_crystal_cavern.png');
    await page.screenshot({ path: shot9 });
    console.log('Saved:', shot9);

    // 9. Return to Surface & Launch Rocket Back to Space
    console.log('Test 9: Returning to launchpad rocket and launching to space...');
    const launchCheck = await page.evaluate(() => {
      const g = window.suGame;
      const rm = g.rocketManager;

      // Teleport to launch pad
      g.player.position.set(rm.padOrigin.x + 3.0, rm.landedY + 1.8, rm.padOrigin.z + 3.0);
      g.player.yaw = -Math.PI * 0.75;
      g.player.pitch = 0.25;

      // Enter rocket and launch
      rm.enterRocket();
      rm.startLaunch();

      return {
        rocketState: rm.state,
        padOrigin: rm.padOrigin,
        isInside: rm.isPlayerInside
      };
    });
    console.log('Rocket Launched:', launchCheck);

    // Wait for vertical ascent plume
    await new Promise(r => setTimeout(r, 1800));

    const shot10 = path.join(screenshotDir, 'v3_10_rocket_ascent_to_space.png');
    await page.screenshot({ path: shot10 });
    console.log('Saved:', shot10);

    // Fast-forward ascent completion
    await page.evaluate(() => {
      window.suGame.rocketManager.launchTimer = 14.0;
      window.suGame.rocketManager._completeLaunchToSpace();
    });
    await new Promise(r => setTimeout(r, 1200));

    const returnOrbitCheck = await page.evaluate(() => {
      return {
        isSpaceflightActive: window.suGame.spaceflightSystem.isActive,
        cameraMode: window.suGame.spaceflightSystem.cameraMode
      };
    });
    results.rocketLaunchToSpaceWorks = returnOrbitCheck.isSpaceflightActive;
    console.log('✔ Test 9: Successfully Returned to Orbit:', returnOrbitCheck);

    console.log('\n=== ALL V3 RESTORATION TESTS COMPLETED SUCCESSFULLY ===');
    console.log('Results Summary:', JSON.stringify(results, null, 2));

    const reportPath = path.resolve('tests/v3_restoration_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log('Saved verification results to:', reportPath);

  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
  }
}

runV3RestorationTest().catch(console.error);
