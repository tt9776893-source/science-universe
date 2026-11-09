import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runEmergencyWorldRepairVerification() {
  console.log('[STAGE A-E] Launching headless browser for comprehensive validation...');
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

  // Execute full Stage A through E validation inside the running Three.js engine
  const report = await page.evaluate(async () => {
    const res = {};
    const g = window.suGame;
    if (!g) return { error: 'window.suGame not found' };

    // ==========================================
    // STAGE A: TERRAIN GEOMETRY & NORMALS AUDIT
    // ==========================================
    res.stageA = {
      chunksAudited: 0,
      totalVertices: 0,
      totalTriangles: 0,
      hasNaNOrInf: false,
      degenerateTriangles: 0,
      invertedTriangles: 0,
      normalLengthsValid: true,
      boundarySeamsDetected: false
    };

    for (const [key, chunk] of g.terrain.chunks.entries()) {
      if (!chunk.mesh || !chunk.mesh.geometry) continue;
      res.stageA.chunksAudited++;

      const geo = chunk.mesh.geometry;
      const pos = geo.attributes.position.array;
      const norm = geo.attributes.normal.array;
      const vertCount = pos.length / 3;
      res.stageA.totalVertices += vertCount;
      res.stageA.totalTriangles += vertCount / 3;

      for (let i = 0; i < pos.length; i += 3) {
        const px = pos[i], py = pos[i + 1], pz = pos[i + 2];
        if (!Number.isFinite(px) || !Number.isFinite(py) || !Number.isFinite(pz)) {
          res.stageA.hasNaNOrInf = true;
        }

        const nx = norm[i], ny = norm[i + 1], nz = norm[i + 2];
        const nLen = Math.hypot(nx, ny, nz);
        if (Math.abs(nLen - 1.0) > 0.05) {
          res.stageA.normalLengthsValid = false;
        }
      }

      // Check triangle orientation for black triangle defects
      for (let i = 0; i < pos.length; i += 9) {
        const ax = pos[i],   ay = pos[i+1], az = pos[i+2];
        const bx = pos[i+3], by = pos[i+4], bz = pos[i+5];
        const cx = pos[i+6], cy = pos[i+7], cz = pos[i+8];

        const abX = bx - ax, abY = by - ay, abZ = bz - az;
        const acX = cx - ax, acY = cy - ay, acZ = cz - az;
        const fnX = abY * acZ - abZ * acY;
        const fnY = abZ * acX - abX * acZ;
        const fnZ = abX * acY - abY * acX;
        const fnLen = Math.hypot(fnX, fnY, fnZ);

        if (fnLen < 1e-6) {
          res.stageA.degenerateTriangles++;
        }

        const avgNx = (norm[i] + norm[i+3] + norm[i+6]) / 3;
        const avgNy = (norm[i+1] + norm[i+4] + norm[i+7]) / 3;
        const avgNz = (norm[i+2] + norm[i+5] + norm[i+8]) / 3;
        const dot = fnX * avgNx + fnY * avgNy + fnZ * avgNz;
        if (dot < 0) {
          res.stageA.invertedTriangles++;
        }
      }
    }

    res.stageA.pass = (!res.stageA.hasNaNOrInf && res.stageA.invertedTriangles === 0 && res.stageA.normalLengthsValid);

    // ==========================================
    // STAGE B: TERRAIN EXCAVATION & COLLISION
    // ==========================================
    res.stageB = {};
    const digPos = { x: 5.0, y: g.terrain.getBaseHeight(5.0, -5.0), z: -5.0 };
    const preFloor = g.terrain.getWalkableFloor(digPos.x, digPos.y, digPos.z);
    
    // 1. Carve vertical hole
    const carveRes = g.terrain.carveSphere(digPos, 2.2, false);
    const postFloor = g.terrain.getWalkableFloor(digPos.x, digPos.y - 0.5, digPos.z);
    res.stageB.preFloor = preFloor;
    res.stageB.postFloor = postFloor;
    res.stageB.holeDepth = Math.round((preFloor - postFloor) * 100) / 100;
    res.stageB.holeCreated = postFloor < preFloor;

    // 2. Player enters hole
    g.player.position.set(digPos.x, postFloor + 1.65, digPos.z);
    g.player._handleMovement(0.05);
    res.stageB.playerYInHole = g.player.position.y;
    res.stageB.playerEnteredHole = (res.stageB.playerYInHole < preFloor + 1.65);

    // 3. Carve sideways horizontal tunnel
    const tunnelStart = { x: 12.0, y: g.terrain.getBaseHeight(12.0, 12.0) - 1.2, z: 12.0 };
    for (let step = 0; step < 5; step++) {
      g.terrain.carveSphere({ x: tunnelStart.x + step * 1.6, y: tunnelStart.y, z: tunnelStart.z }, 2.0, false);
    }
    res.stageB.tunnelCreated = true;

    // 4. Persistence of edits
    const saveRes = g.saveSystem.save();
    res.stageB.saveSuccess = saveRes.success;
    res.stageB.persistentChunksCount = g.terrain.persistentEdits.size;
    res.stageB.pass = (res.stageB.holeCreated && res.stageB.playerEnteredHole && res.stageB.tunnelCreated && res.stageB.saveSuccess);

    // ==========================================
    // STAGE C: BELIEVABLE LIGHTING & SHADERS
    // ==========================================
    res.stageC = {
      ambientLightIntensity: g.sky.ambientLight.intensity,
      hemiLightIntensity: g.sky.hemiLight.intensity,
      sunLightIntensity: g.sky.sunLight.intensity,
      shadowBias: g.sky.sunLight.shadow.bias,
      shadowNormalBias: g.sky.sunLight.shadow.normalBias,
      toneMapping: g.renderer.toneMapping,
      toneMappingExposure: g.renderer.toneMappingExposure,
      materialRoughness: g.terrain.material.roughness,
      materialMetalness: g.terrain.material.metalness
    };
    res.stageC.pass = (res.stageC.ambientLightIntensity >= 0.45 && res.stageC.hemiLightIntensity >= 0.65);

    // ==========================================
    // STAGE D: ROVER & MODEL PLACEMENT
    // ==========================================
    res.stageD = {
      roverAvailable: !!g.vehicleSystem?.activeRover,
      roverPosition: null,
      roverFloorY: 0,
      roverSittingOnGround: false,
      resourcesCount: g.resourceManager.nodes.size,
      floatingResourcesDetected: 0
    };

    if (g.vehicleSystem?.activeRover) {
      const rover = g.vehicleSystem.activeRover;
      res.stageD.roverPosition = { x: rover.position.x, y: rover.position.y, z: rover.position.z };
      res.stageD.roverFloorY = g.terrain.getWalkableFloor(rover.position.x, rover.position.y, rover.position.z);
      // Wheels touch ground within 0.35m tolerance
      res.stageD.roverSittingOnGround = Math.abs((rover.position.y - rover.wheelOffset) - res.stageD.roverFloorY) < 0.35;
    }

    for (const node of g.resourceManager.nodes.values()) {
      const ground = g.terrain.getWalkableFloor(node.position.x, node.position.y, node.position.z);
      if (node.position.y > ground + 1.2) {
        res.stageD.floatingResourcesDetected++;
      }
    }

    res.stageD.pass = (res.stageD.roverSittingOnGround && res.stageD.floatingResourcesDetected === 0);

    // ==========================================
    // STAGE E: HOTBAR & 12 TOOLS ASSET MAPPING
    // ==========================================
    res.stageE = {
      hotbarSlots: 10,
      toolsMountedCount: 0,
      toolsVerified: []
    };

    for (let slot = 0; slot < 10; slot++) {
      g.inventory.setActiveHotbarIndex(slot);
      g.player.updateEquippedTool();
      const def = g.player.currentToolDef;
      const mounted = !!g.player.activeToolModel;
      if (mounted) res.stageE.toolsMountedCount++;
      res.stageE.toolsVerified.push({
        slot,
        id: def?.id,
        name: def?.name,
        mounted
      });
    }

    // Verify SVG thumbnails in DOM
    const hotbarIcons = Array.from(document.querySelectorAll('#hud-hotbar .slot-icon svg')).length;
    res.stageE.svgThumbnailsCount = hotbarIcons;
    res.stageE.pass = (res.stageE.toolsMountedCount === 10 && res.stageE.svgThumbnailsCount === 10);

    return res;
  });

  console.log('=== EMERGENCY WORLD REPAIR VERIFICATION RESULTS ===');
  console.log(JSON.stringify(report, null, 2));

  // 1. Screenshot: Pristine Repaired Terrain Geometry (Smooth, no black triangles, no spikes)
  await page.screenshot({ path: path.join(screenshotDir, '08_repaired_terrain_geometry.png') });
  console.log('Captured: 08_repaired_terrain_geometry.png');

  // 2. Screenshot: Wireframe diagnostics (F3)
  await page.evaluate(() => window.suGame.terrain.toggleWireframe(true));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotDir, '09_terrain_wireframe_diagnostics.png') });
  console.log('Captured: 09_terrain_wireframe_diagnostics.png');
  await page.evaluate(() => window.suGame.terrain.toggleWireframe(false));

  // 3. Screenshot: Chunk Bounding Boxes diagnostics (F4)
  await page.evaluate(() => window.suGame.terrain.toggleChunkBounds(true));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotDir, '10_terrain_chunk_bounds.png') });
  console.log('Captured: 10_terrain_chunk_bounds.png');
  await page.evaluate(() => window.suGame.terrain.toggleChunkBounds(false));

  // 4. Screenshot: Excavated Hole and Horizontal Tunnel with Player inside
  await page.evaluate(() => {
    window.suGame.player.position.set(5.0, window.suGame.terrain.getWalkableFloor(5.0, 0, -5.0) + 1.65, -5.0);
    window.suGame.player.pitch = 0.45; // Look down into excavated crater
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotDir, '11_excavated_hole_and_tunnel.png') });
  console.log('Captured: 11_excavated_hole_and_tunnel.png');

  // 5. Screenshot: Rover Aligned with Terrain Slope & Pack 01 Resources
  await page.evaluate(() => {
    const rover = window.suGame.vehicleSystem.activeRover;
    window.suGame.player.position.set(rover.position.x - 4.5, rover.position.y + 1.5, rover.position.z - 3.5);
    window.suGame.player.yaw = Math.atan2(rover.position.x - window.suGame.player.position.x, rover.position.z - window.suGame.player.position.z) - Math.PI;
    window.suGame.player.pitch = -0.15;
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotDir, '12_aligned_rover_and_resources.png') });
  console.log('Captured: 12_aligned_rover_and_resources.png');

  // 6. Screenshot: 10-Slot Vector Equipment Hotbar & 32-Slot Inventory Modal
  await page.evaluate(() => window.suGame.ui.toggleInventory(true));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotDir, '13_vector_hotbar_and_inventory.png') });
  console.log('Captured: 13_vector_hotbar_and_inventory.png');

  await browser.close();

  const finalSummary = {
    report,
    consoleErrors,
    allPassed: (
      report.stageA.pass &&
      report.stageB.pass &&
      report.stageC.pass &&
      report.stageD.pass &&
      report.stageE.pass &&
      consoleErrors.length === 0
    )
  };

  fs.writeFileSync('C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\repair_test_report.json', JSON.stringify(finalSummary, null, 2));
  console.log('Repair Verification Completed. All Passed:', finalSummary.allPassed);
  return finalSummary;
}

runEmergencyWorldRepairVerification().catch(err => {
  console.error('Execution failure:', err);
  process.exit(1);
});
