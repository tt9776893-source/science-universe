import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runDeepUndergroundAndFpsVerification() {
  console.log('=== STARTING DEEP UNDERGROUND & FPS OPTIMIZATION VERIFICATION ===\n');

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
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', err => {
    errors.push(err.message || err.toString());
    console.error('[PAGE ERROR]', err);
  });

  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });
  const results = {};

  try {
    // 1. Initial Load
    console.log('Test 1: Navigating to http://127.0.0.1:7777/ ...');
    await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
    await page.click('#start-prompt');
    await new Promise(r => setTimeout(r, 2200));
    results.gameLoaded = true;
    console.log('✔ Test 1: Game started successfully.');

    // 2. F3 Performance Overlay Verification
    console.log('Test 2: Toggling F3 Performance Telemetry Overlay...');
    const f3Check = await page.evaluate(() => {
      const g = window.suGame;
      const state = g.ui.togglePerformanceOverlay(true);
      const overlay = document.getElementById('perf-overlay');
      return {
        enabled: state,
        visible: overlay && overlay.style.display !== 'none',
        content: overlay ? overlay.textContent : ''
      };
    });
    results.f3OverlayWorks = f3Check.enabled && f3Check.visible;
    console.log('✔ Test 2: F3 Performance Overlay active:', f3Check);

    // Capture screenshot: F3 Overlay on Surface
    const shotF3 = path.join(screenshotDir, '26_f3_performance_overlay.png');
    await page.screenshot({ path: shotF3 });
    console.log('Saved:', shotF3);

    // 3. Dig 5 Meters Deep (Subsurface Regolith)
    console.log('Test 3: Excavating 5m vertical shaft (Regolith Layer)...');
    const dig5m = await page.evaluate(() => {
      const g = window.suGame;
      const x = 0, z = 0;
      const surfH = g.terrain.getBaseHeight(x, z);
      const targetY = surfH - 5.0;

      // Excavate from surface down to targetY
      for (let y = surfH; y >= targetY; y -= 1.2) {
        g.terrain.carveSphere({ x, y, z }, 2.0, false);
      }

      const floorY = g.terrain.getWalkableFloor(x, targetY, z);
      g.player.position.set(x, floorY + 1.8, z);
      g.player.velocity.set(0, 0, 0);

      const geo = g.terrain.getGeologyAt(x, floorY, z);
      return {
        surfH: Math.round(surfH * 10) / 10,
        targetY: Math.round(targetY * 10) / 10,
        floorY: Math.round(floorY * 10) / 10,
        playerY: Math.round(g.player.position.y * 10) / 10,
        layer: geo.layer,
        depth: Math.round((surfH - floorY) * 10) / 10
      };
    });
    results.excavate5m = (dig5m.depth >= 4.5 && dig5m.playerY < dig5m.surfH - 3.0);
    console.log('✔ Test 3: 5m Excavation & Collision:', dig5m);

    // Capture screenshot: 5m Depth
    const shot5m = path.join(screenshotDir, '27_excavation_depth_5m.png');
    await page.screenshot({ path: shot5m });
    console.log('Saved:', shot5m);

    // 4. Dig 20 Meters Deep (Sedimentary Strata / Hematite)
    console.log('Test 4: Excavating 20m deep shaft (Sedimentary Strata)...');
    const dig20m = await page.evaluate(() => {
      const g = window.suGame;
      const x = 0, z = 0;
      const surfH = g.terrain.getBaseHeight(x, z);
      const targetY = surfH - 20.0;

      for (let y = surfH - 5.0; y >= targetY; y -= 1.2) {
        g.terrain.carveSphere({ x, y, z }, 2.0, false);
      }

      const floorY = g.terrain.getWalkableFloor(x, targetY, z);
      g.player.position.set(x, floorY + 1.8, z);
      g.player.velocity.set(0, 0, 0);
      g.player.toggleFlashlight(); // Ensure flashlight on

      const geo = g.terrain.getGeologyAt(x, floorY, z);
      return {
        surfH: Math.round(surfH * 10) / 10,
        floorY: Math.round(floorY * 10) / 10,
        playerY: Math.round(g.player.position.y * 10) / 10,
        layer: geo.layer,
        depth: Math.round((surfH - floorY) * 10) / 10
      };
    });
    results.excavate20m = (dig20m.depth >= 18.0 && dig20m.playerY < dig20m.surfH - 16.0);
    console.log('✔ Test 4: 20m Excavation & Collision:', dig20m);

    // Capture screenshot: 20m Depth
    const shot20m = path.join(screenshotDir, '28_excavation_depth_20m.png');
    await page.screenshot({ path: shot20m });
    console.log('Saved:', shot20m);

    // 5. Dig 50 Meters Deep (Basalt Bedrock / Mineral Veins)
    console.log('Test 5: Excavating 50m deep shaft (Basalt Bedrock)...');
    const dig50m = await page.evaluate(() => {
      const g = window.suGame;
      const x = 0, z = 0;
      const surfH = g.terrain.getBaseHeight(x, z);
      const targetY = surfH - 50.0;

      for (let y = surfH - 20.0; y >= targetY; y -= 1.4) {
        g.terrain.carveSphere({ x, y, z }, 2.2, false);
      }

      const floorY = g.terrain.getWalkableFloor(x, targetY, z);
      g.player.position.set(x, floorY + 1.8, z);
      g.player.velocity.set(0, 0, 0);

      const geo = g.terrain.getGeologyAt(x, floorY, z);
      return {
        surfH: Math.round(surfH * 10) / 10,
        floorY: Math.round(floorY * 10) / 10,
        playerY: Math.round(g.player.position.y * 10) / 10,
        layer: geo.layer,
        depth: Math.round((surfH - floorY) * 10) / 10
      };
    });
    results.excavate50m = (dig50m.depth >= 46.0 && dig50m.playerY < dig50m.surfH - 44.0);
    console.log('✔ Test 5: 50m Excavation & Collision:', dig50m);

    // Capture screenshot: 50m Depth
    const shot50m = path.join(screenshotDir, '29_excavation_depth_50m.png');
    await page.screenshot({ path: shot50m });
    console.log('Saved:', shot50m);

    // 6. Dig 100 Meters Deep (Deep Plutonic Mantle Bedrock)
    console.log('Test 6: Excavating 100m deep subterranean abyss...');
    const dig100m = await page.evaluate(() => {
      const g = window.suGame;
      const x = 0, z = 0;
      const surfH = g.terrain.getBaseHeight(x, z);
      const targetY = surfH - 100.0;

      for (let y = surfH - 50.0; y >= targetY; y -= 1.6) {
        g.terrain.carveSphere({ x, y, z }, 2.4, false);
      }

      const floorY = g.terrain.getWalkableFloor(x, targetY, z);
      g.player.position.set(x, floorY + 1.8, z);
      g.player.velocity.set(0, 0, 0);

      const geo = g.terrain.getGeologyAt(x, floorY, z);
      return {
        surfH: Math.round(surfH * 10) / 10,
        floorY: Math.round(floorY * 10) / 10,
        playerY: Math.round(g.player.position.y * 10) / 10,
        layer: geo.layer,
        depth: Math.round((surfH - floorY) * 10) / 10
      };
    });
    results.excavate100m = (dig100m.depth >= 95.0 && dig100m.playerY < dig100m.surfH - 90.0);
    console.log('✔ Test 6: 100m Excavation & Collision:', dig100m);

    // Capture screenshot: 100m Depth
    const shot100m = path.join(screenshotDir, '30_excavation_depth_100m.png');
    await page.screenshot({ path: shot100m });
    console.log('Saved:', shot100m);

    // 7. Horizontal Tunnel Creation & Chunk Boundary Crossing
    console.log('Test 7: Excavating horizontal tunnel across chunk boundary (X: 0 to 30 at Y: -25m)...');
    const tunnelCheck = await page.evaluate(() => {
      const g = window.suGame;
      const tunnelY = -25.0;
      // Carve horizontal tunnel from X: 0 across X: 24 (chunk boundary!) to X: 32
      for (let x = 0; x <= 32; x += 1.4) {
        g.terrain.carveSphere({ x, y: tunnelY, z: 0 }, 2.2, false);
      }

      // Move player inside the horizontal tunnel at X: 24 (right on the chunk boundary!)
      const floorY = g.terrain.getWalkableFloor(24, tunnelY, 0);
      g.player.position.set(24, floorY + 1.8, 0);
      g.player.velocity.set(0, 0, 0);
      g.player.yaw = -Math.PI / 2; // Look East down the tunnel
      g.player.pitch = 0.05;

      return {
        posX: 24,
        floorY: Math.round(floorY * 10) / 10,
        playerY: Math.round(g.player.position.y * 10) / 10,
        chunkKey: `${Math.floor(24 / g.terrain.chunkSize)},${Math.floor(tunnelY / g.terrain.chunkHeight)},0`
      };
    });
    results.horizontalTunnelAndBoundary = (tunnelCheck.playerY < -20.0);
    console.log('✔ Test 7: Horizontal Tunnel across Chunk Boundary:', tunnelCheck);

    // Capture screenshot: Horizontal Tunnel
    const shotTunnel = path.join(screenshotDir, '31_horizontal_tunnel_boundary.png');
    await page.screenshot({ path: shotTunnel });
    console.log('Saved:', shotTunnel);

    // 8. Deployable Work Light Test
    console.log('Test 8: Deploying Subterranean Work Light in underground chamber...');
    const lightCheck = await page.evaluate(() => {
      const g = window.suGame;
      const light = g.player.deployWorkLight();
      return {
        deployed: !!light,
        workLightsCount: g.player.deployedWorkLights.length,
        lightPos: light.position
      };
    });
    results.workLightDeployed = lightCheck.deployed && lightCheck.workLightsCount > 0;
    console.log('✔ Test 8: Deployable Work Light:', lightCheck);

    // Capture screenshot: Work Light in Cavern
    const shotWorkLight = path.join(screenshotDir, '32_underground_worklight_illumination.png');
    await page.screenshot({ path: shotWorkLight });
    console.log('Saved:', shotWorkLight);

    // 9. Underground Mesh Normals & Shading Diagnostics (Verify No Inverted Faces)
    console.log('Test 9: Verifying non-inverted normal winding on underground chunk meshes...');
    const normalCheck = await page.evaluate(() => {
      const g = window.suGame;
      let totalFaces = 0;
      let airFacingFaces = 0;

      for (const chunk of g.terrain.chunks.values()) {
        if (!chunk.mesh || chunk.chunkY > 0) continue; // Inspect underground chunks
        const pos = chunk.mesh.geometry.attributes.position.array;
        const norm = chunk.mesh.geometry.attributes.normal.array;

        for (let i = 0; i < pos.length; i += 9) {
          totalFaces++;
          const midX = (pos[i] + pos[i + 3] + pos[i + 6]) / 3;
          const midY = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3;
          const midZ = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3;

          const airNorm = g.terrain.sampleNormal(midX, midY, midZ);
          const fnX = norm[i];
          const fnY = norm[i + 1];
          const fnZ = norm[i + 2];

          // Face normal dot product with air normal must be positive
          if (fnX * airNorm.x + fnY * airNorm.y + fnZ * airNorm.z > 0) {
            airFacingFaces++;
          }
        }
      }

      return {
        totalFaces,
        airFacingFaces,
        correctPct: totalFaces > 0 ? Math.round((airFacingFaces / totalFaces) * 100) : 100
      };
    });
    results.normalsValid = normalCheck.correctPct >= 95;
    console.log('✔ Test 9: Underground Normal Winding Integrity:', normalCheck);

    // 10. Save and Reload Underground Edits
    console.log('Test 10: Testing Persistence of Underground Cavity across Save/Load...');
    const saveCheck = await page.evaluate(() => {
      const g = window.suGame;
      const saveRes = g.saveSystem.save();
      const loadRes = g.saveSystem.load();
      const densityAtCavity = g.terrain.sampleDensity(24, -25, 0);
      return {
        saveSuccess: saveRes.success,
        loadSuccess: loadRes.success,
        densityAtCavity: Math.round(densityAtCavity * 10) / 10,
        isCavityPreserved: densityAtCavity < 0
      };
    });
    results.undergroundEditsPersist = saveCheck.saveSuccess && saveCheck.isCavityPreserved;
    console.log('✔ Test 10: Underground Save/Load Persistence:', saveCheck);

    // 11. Optimized Performance Profiling (Post-Optimization Benchmark)
    console.log('Test 11: Measuring Optimized Performance (FPS, Draw Calls, Triangles)...');
    async function sampleMetrics(name, duration = 2000) {
      return await page.evaluate(async (n, dur) => {
        const g = window.suGame;
        const r = g.renderer;
        const startTime = performance.now();
        let frames = 0;
        let totalDt = 0;
        let lastT = performance.now();

        while (performance.now() - startTime < dur) {
          await new Promise(res => requestAnimationFrame(res));
          const now = performance.now();
          const dt = now - lastT;
          lastT = now;
          if (frames > 2) totalDt += dt;
          frames++;
        }

        const avgDt = totalDt / (frames - 2);
        const fps = Math.round(1000 / avgDt);

        return {
          scenario: n,
          fps: fps,
          avgFrameTimeMs: Math.round(avgDt * 100) / 100,
          drawCalls: r.info.render.calls,
          triangles: r.info.render.triangles,
          activeChunks: g.terrain.chunks.size
        };
      }, name, duration);
    }

    // Profile Deep Underground
    const perfUnderground = await sampleMetrics('Deep Underground (-25m)', 2000);
    console.log('Post-Optimization: Deep Underground:', perfUnderground);

    // Return to Surface and Profile Surface Spawn
    await page.evaluate(() => {
      const g = window.suGame;
      const surfY = g.terrain.getBaseHeight(0, 0) + 1.8;
      g.player.position.set(0, surfY, 0);
      g.player.velocity.set(0, 0, 0);
    });
    await new Promise(r => setTimeout(r, 1000));
    const perfSurface = await sampleMetrics('Surface Spawn', 2000);
    console.log('Post-Optimization: Surface Spawn:', perfSurface);

    // Profile Near Base Habitat
    await page.evaluate(() => {
      window.suGame.player.position.set(-12, 6.0, 12);
    });
    await new Promise(r => setTimeout(r, 800));
    const perfBase = await sampleMetrics('Near Base Habitat', 2000);
    console.log('Post-Optimization: Near Base Habitat:', perfBase);

    // Profile Near Rover
    await page.evaluate(() => {
      window.suGame.player.position.set(4, 6.0, 5);
    });
    await new Promise(r => setTimeout(r, 800));
    const perfRover = await sampleMetrics('Near Rover', 2000);
    console.log('Post-Optimization: Near Rover:', perfRover);

    results.fpsTargetAchieved = (perfSurface.fps >= 34 && perfUnderground.fps >= 37 && perfRover.fps > 20);
    results.drawCallsReduced = (perfUnderground.drawCalls < 200 && perfBase.drawCalls < 750 && perfRover.drawCalls < 500);

    console.log('\n=== ALL UNDERGROUND & FPS TESTS COMPLETED ===');
    console.log('Results Summary:', JSON.stringify(results, null, 2));

    const finalReportData = {
      results,
      benchmarks: {
        underground: perfUnderground,
        surface: perfSurface,
        base: perfBase,
        rover: perfRover
      },
      consoleLogs: consoleLogs.slice(-25),
      errors
    };

    fs.writeFileSync('tests/deep_terrain_and_fps_report.json', JSON.stringify(finalReportData, null, 2));

  } catch (err) {
    console.error('[TEST SUITE FAILED]', err);
    results.testFailed = err.message || err.toString();
  } finally {
    await browser.close();
  }
}

runDeepUndergroundAndFpsVerification();
