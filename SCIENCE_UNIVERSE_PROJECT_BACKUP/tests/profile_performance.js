import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function profileGame() {
  console.log('=== STARTING BASELINE PERFORMANCE PROFILING ===\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 2500));

  console.log('✔ Game running. Measuring baseline metrics across game scenarios...');

  // Function to sample metrics over N frames
  async function sampleMetrics(scenarioName, durationMs = 2500) {
    return await page.evaluate(async (name, duration) => {
      const g = window.suGame;
      const r = g.renderer;
      const startTime = performance.now();
      let frames = 0;
      let totalFrameTime = 0;
      let lastTime = performance.now();
      let minFrameTime = 9999;
      let maxFrameTime = 0;

      while (performance.now() - startTime < duration) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const now = performance.now();
        const dt = now - lastTime;
        lastTime = now;
        if (frames > 2) { // Skip warm-up frames
          totalFrameTime += dt;
          if (dt < minFrameTime) minFrameTime = dt;
          if (dt > maxFrameTime) maxFrameTime = dt;
        }
        frames++;
      }

      const activeFrames = frames - 2;
      const avgFrameTime = totalFrameTime / activeFrames;
      const fps = Math.round(1000 / avgFrameTime);

      return {
        scenario: name,
        fps: fps,
        avgFrameTimeMs: Math.round(avgFrameTime * 100) / 100,
        minFrameTimeMs: Math.round(minFrameTime * 100) / 100,
        maxFrameTimeMs: Math.round(maxFrameTime * 100) / 100,
        drawCalls: r.info.render.calls,
        triangles: r.info.render.triangles,
        geometries: r.info.memory.geometries,
        textures: r.info.memory.textures,
        activeChunks: g.terrain ? g.terrain.chunks.size : 0
      };
    }, scenarioName, durationMs);
  }

  // 1. Surface Spawn
  const mSurface = await sampleMetrics('Surface Spawn', 2000);
  console.log('Scenario: Surface Spawn:', mSurface);

  // 2. Near Base Habitat
  await page.evaluate(() => {
    window.suGame.player.position.set(-12, 5.5, 12);
  });
  await new Promise(r => setTimeout(r, 800));
  const mBase = await sampleMetrics('Near Base Habitat', 2000);
  console.log('Scenario: Near Base Habitat:', mBase);

  // 3. Near Explorer Rover
  await page.evaluate(() => {
    window.suGame.player.position.set(4, 5.5, 5);
  });
  await new Promise(r => setTimeout(r, 800));
  const mRover = await sampleMetrics('Near Rover', 2000);
  console.log('Scenario: Near Rover:', mRover);

  // 4. During Excavation
  const mExcavating = await page.evaluate(async () => {
    const g = window.suGame;
    const startRemesh = performance.now();
    // Perform 3 carves
    g.terrain.carveSphere({ x: 0, y: 3, z: 0 }, 2.0, false);
    g.terrain.carveSphere({ x: 0, y: 1, z: 0 }, 2.0, false);
    g.terrain.carveSphere({ x: 0, y: -1, z: 0 }, 2.0, false);
    const remeshTime = performance.now() - startRemesh;

    return {
      remeshTimeMs: Math.round(remeshTime * 10) / 10,
      drawCalls: g.renderer.info.render.calls,
      triangles: g.renderer.info.render.triangles
    };
  });
  const mExcavateProfile = await sampleMetrics('While Excavating', 2000);
  mExcavateProfile.remeshTimeMs = mExcavating.remeshTimeMs;
  console.log('Scenario: While Excavating:', mExcavateProfile);

  // 5. Deep Underground (attempts to position at -10m and -25m)
  const mUnderground = await page.evaluate(() => {
    const g = window.suGame;
    const initialH = g.terrain.getBaseHeight(0, 0);
    // Dig vertical shaft down to -15m
    for (let y = initialH; y >= -15; y -= 1.5) {
      g.terrain.carveSphere({ x: 0, y: y, z: 0 }, 2.2, false);
    }
    const floorY = g.terrain.getWalkableFloor(0, -12, 0);
    g.player.position.set(0, floorY + 1.8, 0);
    return {
      intendedY: -12,
      actualFloorY: floorY,
      playerPositionY: g.player.position.y
    };
  });
  console.log('Underground position check (Current Code):', mUnderground);
  const mUndergroundProfile = await sampleMetrics('Deep Underground (-15m)', 2000);
  console.log('Scenario: Deep Underground:', mUndergroundProfile);

  const baselineData = {
    scenarios: [mSurface, mBase, mRover, mExcavateProfile, mUndergroundProfile],
    undergroundCheck: mUnderground
  };

  fs.writeFileSync('tests/baseline_performance.json', JSON.stringify(baselineData, null, 2));
  console.log('\n✔ Baseline performance data saved to tests/baseline_performance.json');

  await browser.close();
}

profileGame();
