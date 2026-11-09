import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Using browser binary:', chromePath);

async function runVerification() {
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

  const consoleLogs = [];
  const consoleErrors = [];

  page.on('response', res => {
    if (res.status() >= 400 && !res.url().includes('favicon')) {
      console.error('[NETWORK ERROR]', res.status(), res.url());
      consoleErrors.push(`Network error ${res.status()}: ${res.url()}`);
    }
  });

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error' && !text.includes('favicon')) {
      consoleErrors.push(text);
      console.error('[BROWSER ERROR]', text);
    } else {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('[PAGE ERROR]', err);
  });

  console.log('Navigating to http://127.0.0.1:7777/ ...');
  const response = await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('HTTP Status:', response.status());

  // Wait for loading to finish and start prompt to be visible
  console.log('Waiting for asset loading and start prompt...');
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 30000 });
  console.log('Start prompt visible! Clicking Deploy to Mars button...');

  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 1500));

  // Take first screenshot
  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({ path: path.join(screenshotDir, '01_game_spawn.png') });
  console.log('Saved screenshot 01_game_spawn.png');

  // Verify core game state in browser context
  const testResults = await page.evaluate(async () => {
    const results = {};
    const g = window.suGame;
    if (!g) return { error: 'window.suGame not found' };

    // 1. Scene & Renderer
    results.sceneReady = !!g.scene;
    results.rendererSize = {
      width: g.renderer.domElement.width,
      height: g.renderer.domElement.height
    };

    // 2. Terrain Chunks
    results.terrainChunkCount = g.terrain.chunks.size;
    results.sampleElevationAtOrigin = g.terrain.getHeightAt(0, 0);

    // 3. Asset Registry
    results.cachedAssetCount = g.assetRegistry.cache.size;
    results.metadataCount = g.assetRegistry.resourceMetadata.size;

    // 4. Player State
    results.initialPlayerPos = {
      x: g.player.position.x,
      y: g.player.position.y,
      z: g.player.position.z
    };
    results.isGrounded = g.player.isGrounded;

    // 5. Test Player Movement via simulated keydown
    const startX = g.player.position.x;
    const startZ = g.player.position.z;
    // Simulate KeyW
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    // Step simulation
    for (let i = 0; i < 5; i++) {
      g.player._handleMovement(0.1);
    }
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));

    results.movedPlayerPos = {
      x: g.player.position.x,
      y: g.player.position.y,
      z: g.player.position.z
    };
    results.playerMoved = (results.movedPlayerPos.z !== startZ || results.movedPlayerPos.x !== startX);

    // 6. Test Tool Equipping
    results.initialTool = g.player.currentToolDef ? g.player.currentToolDef.name : null;
    g.inventory.setActiveHotbarIndex(1); // Hammer
    g.player.updateEquippedTool();
    results.switchedTool = g.player.currentToolDef ? g.player.currentToolDef.name : null;

    // 7. Survival Telemetry
    results.survivalState = g.survival.getState();

    // 8. Resource Nodes
    results.totalResourceNodes = g.resourceManager.nodes.size;
    const firstNode = Array.from(g.resourceManager.nodes.values())[0];
    if (firstNode) {
      results.firstNodeInfo = {
        id: firstNode.id,
        name: firstNode.type.name,
        hp: firstNode.currentHp,
        maxHp: firstNode.maxHp
      };

      // Test Mining Damage
      const initialHp = firstNode.currentHp;
      g.resourceManager.damageNode(firstNode.id, 30, g.inventory.getEquippedToolDef(), (drop) => {
        results.minedDrop = drop;
      });
      results.nodeHpAfterDamage = firstNode.currentHp;
      results.damageApplied = (results.nodeHpAfterDamage < initialHp);

      // Force deplete to test inventory collection
      g.resourceManager.depleteNode(firstNode.id, (drop) => {
        g.inventory.addItem(drop.itemId, drop.count);
        results.depletedAndCollected = drop;
      });
    }

    // 9. Inventory State
    results.inventoryState = g.inventory.getState();

    // 10. Save and Load Test
    const saveRes = g.saveSystem.save();
    results.saveSuccess = saveRes.success;

    // Modify state and reload
    const originalO2 = g.survival.oxygen;
    g.survival.oxygen = 42;
    const loadRes = g.saveSystem.load();
    results.loadSuccess = loadRes.success;
    results.restoredOxygen = g.survival.oxygen;

    return results;
  });

  console.log('=== VERIFICATION RESULTS ===');
  console.log(JSON.stringify(testResults, null, 2));

  // Open inventory and take screenshot
  await page.evaluate(() => {
    window.suGame.ui.toggleInventory(true);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotDir, '02_inventory_screen.png') });
  console.log('Saved screenshot 02_inventory_screen.png');

  // Close inventory, open pause menu and take screenshot
  await page.evaluate(() => {
    window.suGame.ui.toggleInventory(false);
    window.suGame.ui.togglePause(true);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotDir, '03_pause_menu.png') });
  console.log('Saved screenshot 03_pause_menu.png');

  await browser.close();

  // Summary
  console.log('Total console logs captured:', consoleLogs.length);
  console.log('Total console errors captured:', consoleErrors.length);

  const report = {
    testResults,
    consoleErrors,
    allPassed: (
      testResults.sceneReady &&
      testResults.terrainChunkCount > 0 &&
      testResults.cachedAssetCount > 0 &&
      testResults.playerMoved &&
      testResults.damageApplied &&
      testResults.saveSuccess &&
      testResults.loadSuccess &&
      consoleErrors.length === 0
    )
  };

  fs.writeFileSync('C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\test_report.json', JSON.stringify(report, null, 2));
  console.log('Written test_report.json. All Passed:', report.allPassed);
  return report;
}

runVerification().catch(err => {
  console.error('Test verification script failed:', err);
  process.exit(1);
});
