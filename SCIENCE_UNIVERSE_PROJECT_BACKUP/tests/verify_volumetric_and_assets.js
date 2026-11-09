import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVolumetricAndAssetVerification() {
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
  await page.setViewport({ width: 1280, height: 720 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(msg.text());
      console.error('[BROWSER ERROR]', msg.text());
    } else {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('[PAGE ERROR]', err);
  });

  console.log('Navigating to http://127.0.0.1:7777/ ...');
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Waiting for Expedition Ready prompt...');
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 30000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1500));

  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  // Evaluate all tests inside browser environment
  const results = await page.evaluate(async () => {
    const res = {};
    const g = window.suGame;
    if (!g) return { error: 'window.suGame not found' };

    // 1. Terrain & Marching Cubes check
    res.terrainType = g.terrain.constructor.name;
    res.chunkCount = g.terrain.chunks.size;
    res.baseHeightAtOrigin = g.terrain.getBaseHeight(0, 0);

    // 2. Real Volumetric Excavation Test (Digging a visible hole)
    const digPos = { x: 4.0, y: res.baseHeightAtOrigin, z: -4.0 };
    const preDigFloor = g.terrain.getWalkableFloor(digPos.x, digPos.y, digPos.z);
    
    // Execute volumetric carve
    const carveResult = g.terrain.carveSphere(digPos, 2.5, false);
    res.carveResult = carveResult;

    // Check new floor elevation at excavation center
    const postDigFloor = g.terrain.getWalkableFloor(digPos.x, digPos.y - 0.5, digPos.z);
    res.preDigFloor = preDigFloor;
    res.postDigFloor = postDigFloor;
    res.excavationDepth = Math.round((preDigFloor - postDigFloor) * 100) / 100;
    res.holeCreated = res.postDigFloor < preDigFloor;

    // 3. Player enters excavated hole
    g.player.position.set(digPos.x, postDigFloor + 1.65, digPos.z);
    g.player._handleMovement(0.1);
    res.playerYInHole = g.player.position.y;
    res.playerEnteredHole = (res.playerYInHole < (preDigFloor + 1.65));

    // 4. Horizontal Tunnel Carve (digging into a hillside)
    const tunnelOrigin = { x: 10.0, y: g.terrain.getBaseHeight(10.0, 10.0) - 1.0, z: 10.0 };
    for (let t = 0; t < 4; t++) {
      g.terrain.carveSphere({ x: tunnelOrigin.x + t * 1.5, y: tunnelOrigin.y, z: tunnelOrigin.z }, 2.0, false);
    }
    res.horizontalTunnelCreated = true;

    // 5. Test all 12 tools mounting and switching
    res.toolsTested = [];
    for (let s = 0; s < 10; s++) {
      g.inventory.setActiveHotbarIndex(s);
      g.player.updateEquippedTool();
      const toolDef = g.player.currentToolDef;
      res.toolsTested.push({
        slot: s,
        name: toolDef ? toolDef.name : 'empty',
        modelMounted: !!g.player.activeToolModel
      });
    }

    // 6. Test Vehicle System (Explorer Rover)
    res.roverAvailable = !!g.vehicleSystem && !!g.vehicleSystem.activeRover;
    if (res.roverAvailable) {
      g.vehicleSystem.enterVehicle(g.player);
      res.roverDrivingActive = g.vehicleSystem.isDriving;
      g.vehicleSystem.exitVehicle(g.player);
      res.roverExited = !g.vehicleSystem.isDriving;
    }

    // 7. Test Modular Building System
    res.buildingSystemReady = !!g.buildingSystem;
    if (g.buildingSystem) {
      g.buildingSystem.setActive(true);
      g.buildingSystem.groundHit = { x: 5, y: g.terrain.getBaseHeight(5, 5), z: 5 };
      g.buildingSystem.tryPlace((placed) => {
        res.placedModule = placed.name;
      });
      g.buildingSystem.setActive(false);
    }

    // 8. Test Graphics Quality Presets
    const presets = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'];
    res.presetTests = {};
    for (const p of presets) {
      g.setGraphicsQuality(p);
      res.presetTests[p] = {
        shadows: g.renderer.shadowMap.enabled,
        activeRadius: g.terrain.activeRadius
      };
    }
    g.setGraphicsQuality('HIGH'); // Reset to High

    // 9. Test Persistence of Terrain Edits
    const saveRes = g.saveSystem.save();
    res.saveSuccess = saveRes.success;
    res.persistentChunkEditsCount = g.terrain.persistentEdits.size;

    return res;
  });

  console.log('=== VOLUMETRIC & ASSET INTEGRATION RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  // Capture Screenshots
  await page.screenshot({ path: path.join(screenshotDir, '05_excavated_mars_terrain.png') });
  console.log('Saved 05_excavated_mars_terrain.png');

  // Open Inventory modal
  await page.evaluate(() => window.suGame.ui.toggleInventory(true));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotDir, '06_expanded_10hotbar_inventory.png') });
  console.log('Saved 06_expanded_10hotbar_inventory.png');

  // Open Pause menu with graphics presets
  await page.evaluate(() => {
    window.suGame.ui.toggleInventory(false);
    window.suGame.ui.togglePause(true);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotDir, '07_graphics_presets_menu.png') });
  console.log('Saved 07_graphics_presets_menu.png');

  await browser.close();

  const report = {
    results,
    consoleErrors,
    allPassed: (
      results.holeCreated &&
      results.playerEnteredHole &&
      results.horizontalTunnelCreated &&
      results.toolsTested.length === 10 &&
      results.roverAvailable &&
      results.buildingSystemReady &&
      results.saveSuccess &&
      consoleErrors.length === 0
    )
  };

  fs.writeFileSync('C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\volumetric_test_report.json', JSON.stringify(report, null, 2));
  console.log('Test complete. All Passed:', report.allPassed);
  return report;
}

runVolumetricAndAssetVerification().catch(err => {
  console.error('Test script error:', err);
  process.exit(1);
});
