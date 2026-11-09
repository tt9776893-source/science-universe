import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runV3RealismVerification() {
  console.log('=== [PHASE 1-8] SCIENCE UNIVERSE FRONTIER V3 REALISM VERIFICATION ===');
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
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error('[PAGE ERROR]', err);
  });

  console.log('1. Connecting to Vite server http://127.0.0.1:7777/ ...');
  await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('2. Waiting for game initialization...');
  await page.waitForSelector('#start-prompt', { visible: true, timeout: 30000 });
  await page.click('#start-prompt');
  await new Promise(r => setTimeout(r, 2000));

  const screenshotDir = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\screenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  const results = {
    timestamp: new Date().toISOString(),
    geology: {},
    physics: {},
    dayNight: {},
    habitat: {},
    inventoryIcons: {},
    screenshots: []
  };

  // --------------------------------------------------------------------------
  // TEST 1: UNDERGROUND GEOLOGY & EXCAVATION
  // --------------------------------------------------------------------------
  console.log('\n--- 1. Testing Volumetric Underground Geology ---');
  results.geology = await page.evaluate(() => {
    const game = window.suGame;
    const terrain = game.terrain;
    const testPoints = [
      { depth: 0.5, ...terrain.getGeologyAt(0, terrain.getBaseHeight(0, 0) - 0.5, 0) },
      { depth: 2.0, ...terrain.getGeologyAt(0, terrain.getBaseHeight(0, 0) - 2.0, 0) },
      { depth: 4.5, ...terrain.getGeologyAt(0, terrain.getBaseHeight(0, 0) - 4.5, 0) },
      { depth: 7.0, ...terrain.getGeologyAt(0, terrain.getBaseHeight(0, 0) - 7.0, 0) },
      { depth: 15.0, ...terrain.getGeologyAt(0, terrain.getBaseHeight(0, 0) - 15.0, 0) },
    ];

    // Perform deep excavation test
    const carveCenter = { x: 5, y: terrain.getBaseHeight(5, 5) - 1.5, z: 5 };
    const carveResult = terrain.carveSphere(carveCenter, 3.2, false);

    // Aim player camera at excavated hole
    game.player.position.set(5, terrain.getBaseHeight(5, 5) + 1.8, 8);
    game.camera.lookAt(5, terrain.getBaseHeight(5, 5) - 1.5, 5);

    return {
      testPoints,
      carveResult,
      densityLookupSuccess: testPoints.every(p => p.layer !== undefined)
    };
  });
  console.log('Geology layers sample:', JSON.stringify(results.geology.testPoints.map(p => ({ depth: p.depth, layer: p.layer, item: p.yieldItem, name_mn: p.name_mn }))));

  await new Promise(r => setTimeout(r, 800));
  const shot14 = path.join(screenshotDir, '14_underground_geology_strata.png');
  await page.screenshot({ path: shot14 });
  results.screenshots.push(shot14);
  console.log(`Saved screenshot: ${shot14}`);

  // --------------------------------------------------------------------------
  // TEST 2: REALISTIC MARS PHYSICS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Testing Martian Physics (g = 3.71 m/s²) ---');
  results.physics = await page.evaluate(async () => {
    const game = window.suGame;
    const phys = game.physics;
    const player = game.player;

    const gravityVal = phys.gravity;
    // Test drop body starting with zero velocity so it immediately falls
    const drop = phys.spawnPhysicsDrop('ice_chunk', { x: 5, y: player.position.y + 4.0, z: 6 }, { x: 0, y: 0, z: 0 });
    const initialY = drop.position.y;

    // Simulate 30 frames of drop
    for (let i = 0; i < 30; i++) {
      phys.update(0.016);
    }
    const finalY = drop.position.y;
    const dropFell = finalY < initialY;

    // Test player low gravity jump
    const startY = player.position.y;
    player.velocity.y = 3.85; // JUMP_FORCE
    player.isGrounded = false;

    let peakY = startY;
    let hangFrames = 0;
    for (let f = 0; f < 60; f++) {
      player._handleMovement(0.016);
      if (player.position.y > peakY) peakY = player.position.y;
      if (!player.isGrounded) hangFrames++;
    }

    return {
      gravityVal,
      dropSpawned: !!drop,
      dropFell,
      initialDropY: initialY,
      finalDropY: finalY,
      jumpHeightGain: peakY - startY,
      hangTimeSec: (hangFrames * 0.016).toFixed(2),
      isLowGravityCalibrated: (peakY - startY) > 1.2 && (peakY - startY) < 2.5
    };
  });
  console.log('Physics validation:', JSON.stringify(results.physics));

  // --------------------------------------------------------------------------
  // TEST 3: MARTIAN DAY & NIGHT SOL CYCLE + BLUE SUNSET
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Testing Martian Day/Night Sol Cycle & Blue Sunset ---');
  results.dayNight = await page.evaluate(() => {
    const game = window.suGame;
    const sky = game.sky;

    const noonHour = sky.getHourString();
    const noonSolar = sky.getSolarFactor();

    // Advance to twilight sunset (18:15)
    sky.timeOfDay = 0.74;
    sky.update(0.001, game.player.position);
    const sunsetHour = sky.getHourString();
    const sunsetSolar = sky.getSolarFactor();
    const sunsetSunColor = '#' + sky.sunLight.color.getHexString();
    const sunsetSkyColor = '#' + sky.hemiLight.color.getHexString();

    // Aim camera towards sunset sun
    const sunDir = sky.sunLight.position.clone().sub(game.player.position).normalize();
    game.camera.lookAt(game.player.position.clone().add(sunDir));

    return {
      noonHour,
      noonSolar,
      sunsetHour,
      sunsetSolar,
      sunsetSunColor,
      sunsetSkyColor,
      isSolTimeAccurate: noonHour.includes('SOL') && sunsetHour.includes('SOL')
    };
  });
  console.log('Day/Night Sol info:', JSON.stringify(results.dayNight));

  await new Promise(r => setTimeout(r, 800));
  const shot15 = path.join(screenshotDir, '15_martian_day_and_blue_sunset.png');
  await page.screenshot({ path: shot15 });
  results.screenshots.push(shot15);
  console.log(`Saved screenshot: ${shot15}`);

  // --------------------------------------------------------------------------
  // TEST 4: ENTERABLE AIRLOCK & HABITAT
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Testing Enterable Research Base & Airlock Cycle ---');
  results.habitat = await page.evaluate(async () => {
    const game = window.suGame;
    const hab = game.habitatManager;
    const player = game.player;

    // Reset sky to clear day
    game.sky.solTimeSeconds = 13.0 * 3600;
    game.sky.update(0.1, player.position);

    // 1. Move player in front of exterior airlock
    const airlockApproach = hab.baseOrigin.clone().add({ x: 0, y: 1.8, z: -2.0 });
    player.position.copy(airlockApproach);
    game.camera.position.copy(airlockApproach);
    game.camera.lookAt(hab.baseOrigin.x, hab.baseOrigin.y + 1.8, hab.baseOrigin.z + 0.5);

    const initialPrompt = hab.getInteractionPrompt(player.position);

    // 2. Open outer hatch
    hab.toggleOuterHatch();
    const hatchStateOpen = hab.airlockState;

    // 3. Step inside airlock chamber
    const chamberPos = hab.baseOrigin.clone().add({ x: 0, y: 1.8, z: 0.5 });
    player.position.copy(chamberPos);
    game.camera.position.copy(chamberPos);

    // 4. Start pressurization cycle
    hab.startPressurizationCycle(true);
    const cycleInitiated = hab.isCycleInProgress;

    // Simulate cycle duration (3.5 seconds)
    for (let i = 0; i < 40; i++) {
      hab.update(0.1, player.position);
    }
    const finalPressure = hab.airlockPressure;
    const stateAfterPressurize = hab.airlockState;

    // 5. Walk into Research Hab
    const habCenter = hab.baseOrigin.clone().add({ x: 0, y: 1.8, z: 6.5 });
    player.position.copy(habCenter);
    game.camera.position.copy(habCenter);
    hab.update(0.1, player.position);
    const isPlayerInside = hab.isPlayerInside;

    // 6. Test Life-Support safe zone refill
    game.survival.oxygen = 40;
    game.survival.temperature = -45;
    hab.update(1.0, player.position);
    const oxygenAfterBuff = game.survival.oxygen;
    const tempAfterBuff = game.survival.temperature;

    return {
      initialPrompt: initialPrompt?.text,
      hatchStateOpen,
      cycleInitiated,
      finalPressure: Math.round(finalPressure),
      stateAfterPressurize,
      isPlayerInside,
      oxygenRefilling: oxygenAfterBuff > 40,
      tempRegulated: tempAfterBuff === 21
    };
  });
  console.log('Habitat interaction results:', JSON.stringify(results.habitat));

  await new Promise(r => setTimeout(r, 800));
  const shot16 = path.join(screenshotDir, '16_enterable_airlock_and_habitat.png');
  await page.screenshot({ path: shot16 });
  results.screenshots.push(shot16);
  console.log(`Saved screenshot: ${shot16}`);

  // --------------------------------------------------------------------------
  // TEST 5: FUNCTIONAL LAB EQUIPMENT INTERACTION
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Testing Functional Interior Lab Workstations ---');
  results.lab = await page.evaluate(() => {
    const game = window.suGame;
    const hab = game.habitatManager;
    const player = game.player;

    // Look at Analysis Computer and Spectrometer
    player.position.set(hab.baseOrigin.x, hab.baseOrigin.y + 1.8, hab.baseOrigin.z + 5.5);
    game.camera.position.copy(player.position);
    game.camera.lookAt(hab.baseOrigin.x - 2.2, hab.baseOrigin.y + 1.5, hab.baseOrigin.z + 6.0);

    // Give player sample minerals
    game.inventory.addItem('iron_ore', 5);
    game.inventory.addItem('ice_chunk', 3);

    // Operate Spectrometer
    const spec = hab.labEquip.find(e => e.type === 'spectrometer');
    const specResult = hab.operateEquipment(spec);

    // Operate Electrolysis Bioreactor
    const bio = hab.labEquip.find(e => e.type === 'electrolysis');
    const bioResult = hab.operateEquipment(bio);

    // Check colony storage
    const storage = hab.colonyStorage.filter(s => s !== null);

    return {
      workstationsCount: hab.labEquip.length,
      specResult,
      bioResult,
      researchPoints: hab.researchPoints,
      unlockedTechs: Array.from(hab.unlockedTechs),
      colonyStorageItems: storage.length
    };
  });
  console.log('Lab equipment results:', JSON.stringify(results.lab));

  await new Promise(r => setTimeout(r, 800));
  const shot17 = path.join(screenshotDir, '17_functional_lab_equipment.png');
  await page.screenshot({ path: shot17 });
  results.screenshots.push(shot17);
  console.log(`Saved screenshot: ${shot17}`);

  // --------------------------------------------------------------------------
  // TEST 6: CLARIFIED TOOL AND INVENTORY ICONS
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Verifying Tool and Resource SVG Icons & Metadata ---');
  results.inventoryIcons = await page.evaluate(() => {
    const game = window.suGame;
    const inv = game.inventory;

    // Check item definitions
    const o2Tank = inv.getItemDef('o2_canister');
    const scanner = inv.getItemDef('tool_multispectral_scanner');
    const radar = inv.getItemDef('tool_gpr_radar');

    // Check hotbar slots
    const hotbarItems = inv.hotbar.filter(s => s !== null).map(s => {
      const def = inv.getItemDef(s.itemId);
      return { id: s.itemId, name: def.name, name_mn: def.name_mn, category: def.category };
    });

    return {
      o2Tank: { id: o2Tank.id, name: o2Tank.name, name_mn: o2Tank.name_mn, desc_mn: o2Tank.desc_mn },
      scanner: { id: scanner.id, name: scanner.name, name_mn: scanner.name_mn, desc_mn: scanner.desc_mn },
      radar: { id: radar.id, name: radar.name, name_mn: radar.name_mn, desc_mn: radar.desc_mn },
      hotbarCount: hotbarItems.length
    };
  });
  console.log('Clarified items:', JSON.stringify(results.inventoryIcons));

  // --------------------------------------------------------------------------
  // TEST 7: PERSISTENCE V3
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Testing Save & Load V3 Persistence ---');
  results.saveLoad = await page.evaluate(() => {
    const game = window.suGame;
    const saveRes = game.saveSystem.save();
    const rawData = localStorage.getItem('SCIENCE_UNIVERSE_FRONTIER_SAVE_V3');
    const parsed = rawData ? JSON.parse(rawData) : null;

    return {
      saveSuccess: saveRes.success,
      hasKeyV3: !!parsed,
      savedSol: parsed?.worldTime?.solCount,
      savedResearchPoints: parsed?.habitat?.researchPoints,
      savedAirlockState: parsed?.habitat?.airlockState
    };
  });
  console.log('Persistence V3:', JSON.stringify(results.saveLoad));

  // Write out test report
  const reportPath = 'C:\\Users\\Administrator\\Desktop\\SCIENCE_UNIVERSE_GAME\\tests\\v3_realism_test_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nTest report saved to: ${reportPath}`);

  await browser.close();
  console.log('Verification finished successfully!');
}

runV3RealismVerification().catch(err => {
  console.error('[TEST FAILED]', err);
  process.exit(1);
});
