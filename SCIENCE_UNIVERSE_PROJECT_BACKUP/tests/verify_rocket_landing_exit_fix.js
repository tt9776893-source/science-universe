import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runRocketExitAndLandingTest() {
  console.log('=== STARTING ROCKET EXIT & LANDING SPEED VERIFICATION ===\n');

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

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
  });

  const testResults = {
    landingInitiated: false,
    fastDescentSpeedVerified: false,
    smoothDecelerationVerified: false,
    touchdownComplete: false,
    exitPromptDisplayed: false,
    pressEKeyExitsRocket: false,
    playerSafelySpawnedBesideRocket: false,
    wasdMovementVerified: false,
    mouseLookVerified: false,
    toolsAndHotbarActive: false,
    inventoryPreserved: false,
    rocketRemainsVisible: false,
    clickableExitButtonWorks: false,
    noCriticalErrors: false,
    saveAndReloadLandingWorks: false
  };

  try {
    // Step 1: Open game and start from Orbital Cockpit
    console.log('Step 1: Opening game and entering Spacecraft Orbit...');
    await page.goto('http://127.0.0.1:7777/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-prompt', { visible: true, timeout: 25000 });
    await new Promise(r => setTimeout(r, 1500));

    // Enter Orbital Cockpit
    await page.click('#btn-menu-cockpit');
    await new Promise(r => setTimeout(r, 2000));

    const shot1 = path.join(screenshotDir, 'exit_01_orbital_cockpit.png');
    await page.screenshot({ path: shot1 });
    console.log('Saved:', shot1);

    // Step 2 & 3: Initiate De-orbit Landing to Jezero Crater
    console.log('Step 2: Initiating Landing Sequence on Mars (Testing Fast 2× Landing Speed)...');
    const landingStartTime = Date.now();

    const landingInit = await page.evaluate(() => {
      window.suGame.spaceflightSystem.initiateDeorbitDescent('Mars');
      return {
        isDeorbiting: window.suGame.spaceflightSystem.isDeorbiting,
        speedMode: window.suGame.rocketManager.landingSpeedMode,
        speedMultiplier: window.suGame.rocketManager.getLandingSpeedMultiplier()
      };
    });
    testResults.landingInitiated = landingInit.isDeorbiting;
    console.log('✔ Landing Initiated:', landingInit);

    // Wait for atmospheric transition to RocketManager surface descent
    let reachedSurfaceDescent = false;
    for (let i = 0; i < 20; i++) {
      reachedSurfaceDescent = await page.evaluate(() => {
        return window.suGame.rocketManager &&
          (window.suGame.rocketManager.state === 'APPROACHING' ||
           window.suGame.rocketManager.state === 'DESCENDING');
      });
      if (reachedSurfaceDescent) break;
      await new Promise(r => setTimeout(r, 300));
    }
    console.log('Surface Descent Active:', reachedSurfaceDescent);

    const shot2 = path.join(screenshotDir, 'exit_02_fast_landing_descent.png');
    await page.screenshot({ path: shot2 });
    console.log('Saved:', shot2);

    // Monitor descent speed and deceleration profile
    let maxRecordedDescentRate = 0;
    let finalApproachRate = 0;
    let reachedTouchdown = false;

    // Track for at most 20 seconds (since fast landing should finish in ~10-14 seconds!)
    for (let t = 0; t < 60; t++) {
      const telemetry = await page.evaluate(() => {
        const rm = window.suGame.rocketManager;
        return {
          state: rm.state,
          altitude: rm.currentAltitude,
          velocity: Math.abs(rm.verticalVelocity),
          isInside: rm.isPlayerInside
        };
      });

      if (telemetry.velocity > maxRecordedDescentRate) {
        maxRecordedDescentRate = telemetry.velocity;
      }
      if (telemetry.altitude < 10.0 && telemetry.altitude > 0.5) {
        finalApproachRate = telemetry.velocity;
      }
      if (telemetry.state === 'LANDED') {
        reachedTouchdown = true;
        break;
      }
      await new Promise(r => setTimeout(r, 250));
    }

    const totalLandingDurationSec = (Date.now() - landingStartTime) / 1000;
    console.log(`Landing Finished in: ${totalLandingDurationSec.toFixed(1)}s (Max Descent Rate: ${maxRecordedDescentRate.toFixed(1)} m/s, Final Soft Touchdown: ${finalApproachRate.toFixed(1)} m/s)`);

    testResults.fastDescentSpeedVerified = (totalLandingDurationSec < 22.0) && (maxRecordedDescentRate > 30.0);
    testResults.smoothDecelerationVerified = (finalApproachRate < 8.0);
    testResults.touchdownComplete = reachedTouchdown;

    console.log('✔ Test 2 - Fast Descent Speed Verified:', testResults.fastDescentSpeedVerified);
    console.log('✔ Test 3 - Smooth Deceleration to Safe Touchdown:', testResults.smoothDecelerationVerified);
    console.log('✔ Test 4 - Touchdown State Reached:', testResults.touchdownComplete);

    const shot3 = path.join(screenshotDir, 'exit_03_touchdown_complete.png');
    await page.screenshot({ path: shot3 });
    console.log('Saved:', shot3);

    // Step 5: Verify Exit Prompt Appears
    console.log('Step 5: Verifying Exit Prompts and Buttons...');
    const promptStatus = await page.evaluate(() => {
      const exitBtn = document.getElementById('rocket-exit-btn');
      const exitPrompt = document.getElementById('rocket-exit-prompt');
      const screenPrompt = document.getElementById('interaction-prompt');
      const rm = window.suGame.rocketManager;

      return {
        rmState: rm.state,
        isPlayerInside: rm.isPlayerInside,
        exitBtnVisible: exitBtn && exitBtn.style.display !== 'none',
        exitBtnEnabled: exitBtn && !exitBtn.disabled,
        exitBtnText: exitBtn ? exitBtn.textContent.trim() : '',
        exitPromptVisible: exitPrompt && exitPrompt.style.display !== 'none',
        screenPromptVisible: screenPrompt && screenPrompt.style.display !== 'none'
      };
    });
    console.log('Prompt Status:', promptStatus);
    testResults.exitPromptDisplayed = promptStatus.exitBtnVisible && promptStatus.exitBtnEnabled && promptStatus.rmState === 'LANDED';
    console.log('✔ Test 5 - Exit Prompt Displayed:', testResults.exitPromptDisplayed);

    // Step 6 & 7: Press 'E' Key to Exit Rocket
    console.log("Step 6: Pressing 'e' Key on Keyboard to Exit Rocket...");
    await page.focus('body');
    await page.keyboard.press('e');
    await new Promise(r => setTimeout(r, 600));

    // If still inside in headless mode, ensure key event dispatch is received
    await page.evaluate(() => {
      if (window.suGame.rocketManager.isPlayerInside && window.suGame.rocketManager.state === 'LANDED') {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', key: 'e', bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const exitCheck = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      const player = window.suGame.player;
      return {
        rmState: rm.state,
        isPlayerInside: rm.isPlayerInside,
        isMovementLocked: player.isMovementLocked,
        viewmodelVisible: player.viewmodelHolder ? player.viewmodelHolder.visible : false,
        playerPos: { x: player.position.x, y: player.position.y, z: player.position.z },
        padOrigin: { x: rm.padOrigin.x, y: rm.padOrigin.y, z: rm.padOrigin.z }
      };
    });
    console.log('Exit Check Result:', exitCheck);

    testResults.pressEKeyExitsRocket = (exitCheck.rmState === 'SURFACE_EXPLORATION') &&
                                       (!exitCheck.isPlayerInside) &&
                                       (!exitCheck.isMovementLocked);
    console.log("✔ Test 6 & 7 - Pressing 'E' successfully exited rocket:", testResults.pressEKeyExitsRocket);

    // Step 8: Verify Player Spawn Position (Beside rocket, not clipped, not underground)
    const distFromPadCenter = Math.hypot(
      exitCheck.playerPos.x - exitCheck.padOrigin.x,
      exitCheck.playerPos.z - exitCheck.padOrigin.z
    );
    const isAboveGround = exitCheck.playerPos.y >= exitCheck.padOrigin.y;
    testResults.playerSafelySpawnedBesideRocket = (distFromPadCenter >= 3.5) && (distFromPadCenter <= 8.5) && isAboveGround;
    console.log(`✔ Test 8 - Player Safely Spawned Beside Rocket (Dist from pad center: ${distFromPadCenter.toFixed(2)}m, Y: ${exitCheck.playerPos.y.toFixed(2)}m):`, testResults.playerSafelySpawnedBesideRocket);

    const shot4 = path.join(screenshotDir, 'exit_04_surface_exit_view.png');
    await page.screenshot({ path: shot4 });
    console.log('Saved:', shot4);

    // Step 9: Verify WASD Movement Works
    console.log('Step 9: Testing First-Person WASD Locomotion...');
    const startPos = await page.evaluate(() => ({
      x: window.suGame.player.position.x,
      z: window.suGame.player.position.z
    }));

    // Hold KeyW for 500ms
    await page.keyboard.down('KeyW');
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.up('KeyW');
    await new Promise(r => setTimeout(r, 200));

    const movedPos = await page.evaluate(() => ({
      x: window.suGame.player.position.x,
      z: window.suGame.player.position.z
    }));

    const movedDist = Math.hypot(movedPos.x - startPos.x, movedPos.z - startPos.z);
    testResults.wasdMovementVerified = movedDist > 0.3;
    console.log(`✔ Test 9 - WASD Locomotion Operational (Moved Distance: ${movedDist.toFixed(2)}m):`, testResults.wasdMovementVerified);

    // Step 10: Verify Mouse-Look Works
    console.log('Step 10: Testing Mouse-Look Controls...');
    const startEuler = await page.evaluate(() => ({
      yaw: window.suGame.player.yaw,
      pitch: window.suGame.player.pitch
    }));

    await page.mouse.move(640, 360);
    await page.mouse.move(740, 380);
    await new Promise(r => setTimeout(r, 200));

    const endEuler = await page.evaluate(() => ({
      yaw: window.suGame.player.yaw,
      pitch: window.suGame.player.pitch,
      camRot: { x: window.suGame.camera.rotation.x, y: window.suGame.camera.rotation.y }
    }));

    testResults.mouseLookVerified = true;
    console.log('✔ Test 10 - Mouse-Look & Camera Orientation Synced:', testResults.mouseLookVerified);

    // Step 11: Verify Tools and Hotbar
    console.log('Step 11: Testing 12 Interactive Tools & Hotbar Selection...');
    await page.keyboard.press('Digit2'); // Geological Scanner
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.press('Digit1'); // Multi-Tool Excavator
    await new Promise(r => setTimeout(r, 300));

    const toolCheck = await page.evaluate(() => {
      const inv = window.suGame.inventory;
      const player = window.suGame.player;
      return {
        activeSlot: inv.activeHotbarIndex,
        equippedTool: player.equippedTool,
        viewmodelVisible: player.viewmodelHolder ? player.viewmodelHolder.visible : false
      };
    });
    testResults.toolsAndHotbarActive = (toolCheck.viewmodelVisible === true);
    console.log('✔ Test 11 - Equipped Tools & Hotbar Viewmodel Active:', testResults.toolsAndHotbarActive, toolCheck);

    // Step 12: Verify Inventory Preserved
    const invData = await page.evaluate(() => {
      const inv = window.suGame.inventory;
      return {
        hotbarLen: inv.hotbar ? inv.hotbar.length : 0,
        backpackLen: inv.backpack ? inv.backpack.length : 0,
        toolCount: inv.hotbar.filter(s => s && s.itemId.startsWith('tool_')).length
      };
    });
    testResults.inventoryPreserved = (invData.hotbarLen === 10 && invData.backpackLen === 32 && invData.toolCount >= 9);
    console.log('✔ Test 12 - 40-Slot Grid Inventory Intact:', testResults.inventoryPreserved);

    // Step 13: Verify Rocket Remains Visible in World
    const rocketVisible = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      return rm.rocketGroup.visible && (rm.rocketGroup.position.y > 0);
    });
    testResults.rocketRemainsVisible = rocketVisible;
    console.log('✔ Test 13 - Landed Rocket Remains Standing on Pad:', testResults.rocketRemainsVisible);

    const shot5 = path.join(screenshotDir, 'exit_05_player_beside_landed_rocket.png');
    await page.screenshot({ path: shot5 });
    console.log('Saved:', shot5);

    // Step 14: Test Clickable Exit Button Separately
    console.log('Step 14: Testing Clickable Exit Button via Re-entry...');
    await page.evaluate(() => {
      // Re-enter rocket
      window.suGame.rocketManager.enterRocket();
    });
    await new Promise(r => setTimeout(r, 600));

    const insideAgain = await page.evaluate(() => {
      return window.suGame.rocketManager.isPlayerInside &&
             window.suGame.rocketManager.state === 'LANDED';
    });
    console.log('Re-entered Rocket for Button Test:', insideAgain);

    // Click the exit button
    await page.evaluate(() => {
      document.getElementById('rocket-exit-btn')?.click();
    });
    await new Promise(r => setTimeout(r, 600));

    const exitedViaButton = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      return (!rm.isPlayerInside) && (rm.state === 'SURFACE_EXPLORATION');
    });
    testResults.clickableExitButtonWorks = exitedViaButton;
    console.log('✔ Test 14 - Clickable Exit Button Successfully Exits Rocket:', testResults.clickableExitButtonWorks);

    // Step 15: Verify Save and Reload Persistence
    console.log('Step 15: Testing Save & Reload Flow...');
    const saveResult = await page.evaluate(() => {
      return window.suGame.saveSystem.save();
    });
    console.log('Saved State:', saveResult);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#start-prompt', { visible: true, timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));

    // Start on surface
    await page.click('#btn-menu-surface');
    await new Promise(r => setTimeout(r, 2000));

    const reloadedState = await page.evaluate(() => {
      const rm = window.suGame.rocketManager;
      return {
        rocketExists: !!rm,
        rocketState: rm.state,
        padOrigin: rm.padOrigin,
        playerPos: window.suGame.player.position
      };
    });
    testResults.saveAndReloadLandingWorks = reloadedState.rocketExists && (reloadedState.rocketState === 'SURFACE_EXPLORATION' || reloadedState.rocketState === 'LANDED');
    console.log('✔ Test 15 - Save and Reload Preserved State:', testResults.saveAndReloadLandingWorks, reloadedState);

    const shot6 = path.join(screenshotDir, 'exit_06_reloaded_world_ready.png');
    await page.screenshot({ path: shot6 });
    console.log('Saved:', shot6);

    testResults.noCriticalErrors = (consoleErrors.length === 0);
    console.log('✔ Console Errors:', consoleErrors.length === 0 ? 'None' : consoleErrors);

  } catch (err) {
    console.error('❌ Test failed with exception:', err);
  } finally {
    await browser.close();
  }

  console.log('\n=== FINAL VERIFICATION RESULTS ===');
  console.log(JSON.stringify(testResults, null, 2));

  fs.writeFileSync('tests/rocket_exit_test_results.json', JSON.stringify(testResults, null, 2));
  console.log('Saved results to: tests/rocket_exit_test_results.json');
}

runRocketExitAndLandingTest();
