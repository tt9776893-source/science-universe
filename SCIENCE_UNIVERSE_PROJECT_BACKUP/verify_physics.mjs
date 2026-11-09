import puppeteer from 'puppeteer-core';

const SCREENSHOT_DIR = 'C:\\Users\\ADMINI~1\\AppData\\Local\\Temp\\kilo';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-web-security'],
  defaultViewport: { width: 1280, height: 720 }
});

const page = await browser.newPage();
const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(err.message));

const results = [];

console.log('Loading game...');
await page.goto('http://localhost:7777/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\physics_01_initial.png`, fullPage: true });

// Start surface session
const sessionStarted = await page.evaluate(() => {
  const btn = document.getElementById('btn-menu-surface');
  if (btn) { btn.click(); return 'clicked'; }
  return 'no-btn';
});
console.log('Session start:', sessionStarted);
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\physics_02_surface.png`, fullPage: true });

// ============ TEST 1: Rocket boarding and launch ============
console.log('\n=== TEST 1: Rocket boarding & launch ===');

const rocketTest = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (!game?.rocketManager) return { error: 'no-rocket-manager' };

  const rm = game.rocketManager;
  const player = game.player;

  // Check initial state
  const initialState = {
    rocketState: rm.state,
    isPlayerInside: rm.isPlayerInside,
    playerMovementLocked: player.isMovementLocked,
    playerPos: { x: player.position.x, y: player.position.y, z: player.position.z }
  };

  // Enter rocket
  rm.enterRocket();

  const afterEnter = {
    rocketState: rm.state,
    isPlayerInside: rm.isPlayerInside,
    playerMovementLocked: player.isMovementLocked,
    playerPos: { x: player.position.x, y: player.position.y, z: player.position.z }
  };

  // Start launch
  rm.startLaunch();

  const afterStartLaunch = {
    rocketState: rm.state,
    isPlayerInside: rm.isPlayerInside,
    playerMovementLocked: player.isMovementLocked
  };

  // Simulate ascent frames (~3.2s, past the 2.5s ignition phase)
  for (let i = 0; i < 200; i++) {
    rm.update(0.016, performance.now());
  }

  const duringAscent = {
    rocketState: rm.state,
    isPlayerInside: rm.isPlayerInside,
    playerPos: { x: player.position.x, y: player.position.y, z: player.position.z },
    rocketPos: { x: rm.rocketGroup.position.x, y: rm.rocketGroup.position.y, z: rm.rocketGroup.position.z },
    currentAltitude: rm.currentAltitude
  };

  // Complete launch
  rm._completeLaunchToSpace();

  const afterComplete = {
    rocketState: rm.state,
    isPlayerInside: rm.isPlayerInside,
    playerInsidePreserved: rm.isPlayerInside === true
  };

  return { initialState, afterEnter, afterStartLaunch, duringAscent, afterComplete };
});
console.log('Rocket test result:', JSON.stringify(rocketTest, null, 2));
results.push({ test: 'rocket_launch', result: rocketTest });
await sleep(1000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\physics_03_rocket.png`, fullPage: true });

// ============ TEST 2: Digging / terrain collision ============
console.log('\n=== TEST 2: Digging & terrain collision ===');

const digTest = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (!game?.terrain || !game?.player) return { error: 'no-terrain-or-player' };

  const terrain = game.terrain;
  const player = game.player;
  const physics = game.physics;

  // Player at surface position on Mars
  const startX = 0;
  const startZ = 0;
  const surfaceH = terrain.getBaseHeight(startX, startZ);

  player.position.set(startX, surfaceH + 2, startZ);
  player.velocity.set(0, 0, 0);
  player.isGrounded = true;
  player.isMovementLocked = false; // Reset from prior rocket test
  terrain.update(player.position, true);

  const beforeDig = {
    surfaceH,
    playerY: player.position.y,
    isGrounded: player.isGrounded,
    densityAtFeet: terrain.sampleDensity(startX, surfaceH - 0.5, startZ)
  };

  // Carve a hole directly below player
  const carveResult = terrain.carveSphere({ x: startX, y: surfaceH, z: startZ }, 3.0, false);

  // Player should now be over air (no floor below)
  const afterDig = {
    carveResult: { success: carveResult.success, modifiedVoxels: carveResult.modifiedVoxels },
    densityAtFeet: terrain.sampleDensity(startX, surfaceH - 0.5, startZ),
    walkableFloor: terrain.getWalkableFloor(startX, surfaceH + 2, startZ),
    densityBelowFeet: terrain.sampleDensity(startX, surfaceH - 1, startZ)
  };

  // Simulate player falling - multiple update frames
  const fallFrames = [];
  for (let i = 0; i < 100; i++) {
    player.update(0.016, performance.now());
    fallFrames.push({
      frame: i,
      playerY: Math.round(player.position.y * 100) / 100,
      isGrounded: player.isGrounded,
      velocityY: Math.round(player.velocity.y * 100) / 100
    });
    if (player.position.y < surfaceH - 10) break; // Fallen well below surface
  }

  const finalFall = fallFrames[fallFrames.length - 1];

  return { beforeDig, afterDig, fallFrames: fallFrames.slice(0, 5), finalFall, totalFrames: fallFrames.length };
});
console.log('Dig test result:', JSON.stringify(digTest, null, 2));
results.push({ test: 'digging_collision', result: digTest });
await sleep(1000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\physics_04_digging.png`, fullPage: true });

// ============ TEST 3: Gravity on different planets ============
console.log('\n=== TEST 3: Gravity on different planets ===');

const gravityTest = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (!game?.player || !game?.terrain) return { error: 'no-player-or-terrain' };

  const player = game.player;
  const physics = game.physics;
  const PLANET_GRAVITY = { mars: 3.71, moon: 1.62, mercury: 3.70, venus: 8.87, earth: 9.81 };

  const planetResults = {};

  for (const [planetId, expectedG] of Object.entries(PLANET_GRAVITY)) {
    const envResult = game.setPlanetEnvironment(planetId);
    const gAfterSet = player.gravity;
    const jumpForce = player.getJumpForce();

    // Simulate a jump: set upward velocity, then apply gravity for 1 second
    player.velocity.set(0, jumpForce, 0);
    player.isGrounded = false;

    let maxHeight = player.position.y;
    let steps = 0;
    for (let i = 0; i < 60 / 0.016; i++) {
      // Manual integration similar to _handleMovement
      player.velocity.y -= player.gravity * 0.016;
      player.position.y += player.velocity.y * 0.016;
      if (player.position.y > maxHeight) maxHeight = player.position.y;
      steps++;
      if (player.velocity.y < 0 && player.position.y < maxHeight - 0.01) break; // Started descending past peak
    }

    const jumpHeight = maxHeight - (player.position.y - player.velocity.y * 0.016); // approx

    planetResults[planetId] = {
      expectedGravity: expectedG,
      actualGravity: gAfterSet,
      envSet: envResult,
      gravityMatches: Math.abs(gAfterSet - expectedG) < 0.01,
      jumpForce,
      hasSolidSurface: player.hasSolidSurface
    };
  }

  return planetResults;
});
console.log('Gravity test result:', JSON.stringify(gravityTest, null, 2));
results.push({ test: 'planet_gravity', result: gravityTest });
await sleep(1000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\physics_05_gravity.png`, fullPage: true });

// ============ SUMMARY ============
console.log('\n=== SUMMARY ===');
console.log('Console errors:', errors.length > 0 ? errors.join('\n') : 'None');

let allPassed = true;

// Check rocket test
if (rocketTest.error) { console.log('ROCKET: ERROR -', rocketTest.error); allPassed = false; }
else {
  const r = rocketTest;
  console.log('ROCKET:');
  console.log('  Initial state:', JSON.stringify(r.initialState));
  console.log('  After enter:', JSON.stringify(r.afterEnter));
  console.log('  After startLaunch:', JSON.stringify(r.afterStartLaunch));
  console.log('  During ascent:', JSON.stringify(r.duringAscent));
  console.log('  After complete:', JSON.stringify(r.afterComplete));

  if (!r.afterEnter.isPlayerInside) { console.log('  FAIL: Player not inside after enterRocket'); allPassed = false; }
  if (!r.afterStartLaunch.isPlayerInside) { console.log('  FAIL: Player not inside after startLaunch'); allPassed = false; }
  if (!r.afterComplete.playerInsidePreserved) { console.log('  FAIL: Player ejected on _completeLaunchToSpace'); allPassed = false; }
  if (r.duringAscent.playerPos.y <= r.initialState.playerPos.y) { console.log('  FAIL: Player did not move up with rocket during ascent'); allPassed = false; }
}

  // Check dig test
  if (digTest.error) { console.log('DIG: ERROR -', digTest.error); allPassed = false; }
  else {
    const d = digTest;
    console.log('DIG:');
    console.log('  Before dig:', JSON.stringify(d.beforeDig));
    console.log('  After dig:', JSON.stringify(d.afterDig));
    console.log('  Final fall frame:', JSON.stringify(d.finalFall));
    console.log('  Total fall frames:', d.totalFrames);

    // PASS: walkableFloor should now find the hole bottom (finite), not null/-Infinity
    if (d.afterDig.walkableFloor === null) { console.log('  FAIL: Walkable floor should find hole bottom, not null'); allPassed = false; }
    // PASS: Player should land on hole bottom (grounded), not fall through
    if (!d.finalFall || !d.finalFall.isGrounded) { console.log('  FAIL: Player did not land on hole bottom'); allPassed = false; }
    if (!d.finalFall || d.finalFall.playerY >= d.beforeDig.surfaceH - 0.1) { console.log('  FAIL: Player did not descend into hole'); allPassed = false; }
  }

// Check gravity test
if (gravityTest.error) { console.log('GRAVITY: ERROR -', gravityTest.error); allPassed = false; }
else {
  console.log('GRAVITY:');
  for (const [p, r] of Object.entries(gravityTest)) {
    console.log(`  ${p}: g=${r.actualGravity} (expected ${r.expectedGravity}, match=${r.gravityMatches}), hasSolidSurface=${r.hasSolidSurface}`);
    if (!r.gravityMatches) { console.log(`    FAIL: Gravity mismatch (envSet=${r.envSet})`); allPassed = false; }
    if (p !== 'sun' && !r.hasSolidSurface) { console.log(`    FAIL: ${p} should have solid surface`); allPassed = false; }
  }
}

if (errors.length > 0) { console.log('Console errors:'); errors.forEach(e => console.log('  -', e)); allPassed = false; }

console.log(allPassed ? '\nALL TESTS PASSED' : '\nSOME TESTS FAILED');

await browser.close();
console.log('Verification complete');
