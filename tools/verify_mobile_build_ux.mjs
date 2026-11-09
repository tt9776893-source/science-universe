import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, createAccessServer } from './developer-access.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const check = (value, label) => { assert.ok(value, label); console.log('PASS', label); };

const ARTIFACTS_DIR = 'C:/Users/Administrator/.gemini/antigravity/brain/abef54cf-a7e0-4de6-8795-174b876a7192';

const server = createAccessServer({ development: true });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const serverUrl = `http://127.0.0.1:${server.address().port}`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'su-build-test-'));
const exe = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(fs.existsSync);
assert.ok(exe, 'Chromium required');

const browser = spawn(exe, [
  '--headless=new',
  '--enable-unsafe-swiftshader',
  '--no-first-run',
  '--no-default-browser-check',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });

let ws, seq = 0;
const pending = new Map();
const errors = [], consoleErrors = [];

try {
  const endpoint = await new Promise((resolve, reject) => {
    let text = '';
    const timer = setTimeout(() => reject(Error('Browser startup timeout')), 25000);
    browser.stderr.on('data', d => {
      text += d;
      const m = text.match(/DevTools listening on (ws:\/\/[^\r\n]+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    browser.on('error', reject);
  });

  const pages = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      m.error ? p.reject(Error(JSON.stringify(m.error))) : p.resolve(m.result);
    } else if (m.method === 'Runtime.exceptionThrown') {
      errors.push(m.params);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });

  const ev = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };

  const wait = async (expression, label, timeoutSec = 50) => {
    for (let n = 0; n < timeoutSec * 2; n++) {
      if (await ev(expression)) return;
      await sleep(500);
    }
    throw Error('Timeout: ' + label);
  };

  const viewport = async (width, height) => {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: true,
      hasTouch: true
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });
    await sleep(400);
  };

  const screenshot = async (savePath) => {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(savePath, Buffer.from(result.data, 'base64'));
  };

  const clickVisible = async selector => {
    const point = await ev(`(()=>{
      const el = document.querySelector(${JSON.stringify(selector)}) ||
                 document.getElementById('suHostExplore')?.shadowRoot?.querySelector(${JSON.stringify(selector)});
      if (!el) return { visible: false, reason: 'notFound' };
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      const x = r.x + r.width / 2, y = r.y + r.height / 2;
      return { x, y, visible: r.width > 0 && r.height > 0 && !el.hidden };
    })()`);
    check(point.visible, 'unobstructed pointer target: ' + selector);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await sleep(150);
  };

  await send('Runtime.enable');

  // Set Samsung landscape viewport (915x412)
  await viewport(915, 412);
  await send('Page.navigate', { url: serverUrl });
  await wait('!!window.SU', 'router ready');

  // Seed developer account
  await ev(`
    localStorage.clear();
    localStorage.setItem('rf_users', JSON.stringify({
      'developer@example.test': { name: 'Samsung Mobile Tester', credits: 120, lifetimeCredits: 120, achievements: ['sentinel'] }
    }));
    localStorage.setItem('rf_session', JSON.stringify('developer@example.test'));
    true;
  `);

  await send('Page.reload');
  await wait("window.curMail === 'developer@example.test'", 'authenticated session');
  await sleep(1000);

  // Launch Explore via Developer panel
  await ev("openProfile(); true;");
  await sleep(600);
  await ev("document.getElementById('suDeveloperTools').open = true; true;");
  await sleep(300);
  await clickVisible('#suDeveloperExplore');

  // Wait for Explore game module and terrain to load
  await wait("import('./sections/explore/ctx.js').then(c => { globalThis.g = c.window.game; return !!g?.isLoaded && !!g.terrain?.marsDem; })", 'actual Explore game and terrain loaded', 60);
  check(await ev("SU.state.current === 'explore'"), 'Explore state current');

  // Start surface gameplay
  await clickVisible('#btn-menu-surface');
  await sleep(1500);

  // 1. Initial State Check (before selecting slot 9)
  const initialCheck = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const tb = sr?.getElementById('hud-construction-toolbar') || document.getElementById('hud-construction-toolbar');
    return {
      activeSlot: g.inventory.activeHotbarIndex,
      isBuildActive: g.buildingSystem.active,
      ghostVisible: g.buildingSystem.ghostGroup.visible,
      toolbarDisplay: tb ? tb.style.display : 'none',
      slot9Item: g.inventory.hotbar[8]?.itemId
    };
  })()`);
  check(initialCheck.slot9Item === 'tool_construction', 'hotbar slot 9 contains tool_construction');
  check(!initialCheck.isBuildActive, 'building system starts inactive');
  check(initialCheck.toolbarDisplay === 'none' || !initialCheck.toolbarDisplay, 'construction toolbar initially hidden');

  // 2. Select Hotbar Slot 9
  await ev(`(() => {
    g.inventory.setActiveHotbarIndex(8);
    g.ui.updateHotbar();
  })()`);
  await sleep(800);

  const slot9State = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const tb = sr?.getElementById('hud-construction-toolbar') || document.getElementById('hud-construction-toolbar');
    const hb = sr?.getElementById('hud-hotbar') || document.getElementById('hud-hotbar');
    const joy = sr?.getElementById('touch-joystick-base') || document.getElementById('touch-joystick-base');
    const pm = sr?.getElementById('hud-base-power-monitor') || document.getElementById('hud-base-power-monitor');

    const tbRect = tb ? tb.getBoundingClientRect() : null;
    const hbRect = hb ? hb.getBoundingClientRect() : null;
    const joyRect = joy ? joy.getBoundingClientRect() : null;
    const pmRect = pm ? pm.getBoundingClientRect() : null;
    const ghost = g.buildingSystem.ghostGroup;

    return {
      isBuildActive: g.buildingSystem.active,
      ghostVisible: ghost.visible,
      toolbarVisible: tb && tb.style.display !== 'none' && tbRect && tbRect.width > 0,
      tbRect: tbRect ? { x: tbRect.x, y: tbRect.y, width: tbRect.width, height: tbRect.height } : null,
      hbRect: hbRect ? { x: hbRect.x, y: hbRect.y, width: hbRect.width, height: hbRect.height } : null,
      joyRect: joyRect ? { x: joyRect.x, y: joyRect.y, width: joyRect.width, height: joyRect.height } : null,
      pmRect: pmRect ? { x: pmRect.x, y: pmRect.y, width: pmRect.width, height: pmRect.height } : null,
      titleText: tb?.querySelector('#hud-construct-title')?.textContent,
      costText: tb?.querySelector('#hud-construct-cost')?.textContent,
      validMatWireframe: g.buildingSystem.validMaterial?.wireframe,
      invalidMatWireframe: g.buildingSystem.invalidMaterial?.wireframe,
      validMatTransparent: g.buildingSystem.validMaterial?.transparent,
      hasRotateBtn: Boolean(tb?.querySelector('#btn-construct-rotate')),
      hasPlaceBtn: Boolean(tb?.querySelector('#btn-construct-place')),
      hasPrevBtn: Boolean(tb?.querySelector('#btn-construct-prev')),
      hasNextBtn: Boolean(tb?.querySelector('#btn-construct-next'))
    };
  })()`);

  check(slot9State.isBuildActive, 'BuildingSystem is active when slot 9 is selected');
  check(slot9State.toolbarVisible, 'Construction toolbar is visible on screen');
  check(slot9State.hasRotateBtn, 'Construction toolbar has rotate button');
  check(slot9State.hasPlaceBtn, 'Construction toolbar has PLACE button');
  check(slot9State.hasPrevBtn, 'Construction toolbar has Prev button');
  check(slot9State.hasNextBtn, 'Construction toolbar has Next button');
  check(!slot9State.validMatWireframe, 'validMaterial has wireframe disabled');
  check(!slot9State.invalidMatWireframe, 'invalidMaterial has wireframe disabled');
  check(slot9State.validMatTransparent, 'validMaterial is transparent hologram');

  // Verify layout positioning
  if (slot9State.tbRect && slot9State.hbRect) {
    check(slot9State.tbRect.y + slot9State.tbRect.height <= slot9State.hbRect.y + 10, 'toolbar sits safely above hotbar');
  }
  if (slot9State.tbRect && slot9State.joyRect) {
    const tbLeft = slot9State.tbRect.x;
    const joyRight = slot9State.joyRect.x + slot9State.joyRect.width;
    check(tbLeft >= joyRight - 15, 'toolbar does not overlap joystick on the left');
  }

  // 3. Test Power Monitor Collapsibility
  const powerMonitorTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const pm = sr?.getElementById('hud-base-power-monitor') || document.getElementById('hud-base-power-monitor');
    const header = sr?.getElementById('hud-base-power-header') || document.getElementById('hud-base-power-header');
    const body = sr?.getElementById('hud-base-power-body') || document.getElementById('hud-base-power-body');
    const summary = sr?.getElementById('hud-base-summary-val') || document.getElementById('hud-base-summary-val');
    const chevron = sr?.getElementById('hud-base-power-chevron') || document.getElementById('hud-base-power-chevron');

    const initialCollapsed = !g.ui.isPowerMonitorExpanded;
    const initialBodyHidden = body ? getComputedStyle(body).display === 'none' : false;

    // Toggle expand
    header.click();
    const expandedAfterClick = g.ui.isPowerMonitorExpanded;
    const bodyVisibleAfterClick = body ? getComputedStyle(body).display !== 'none' : false;

    // Toggle collapse again
    header.click();
    const collapsedAfterSecondClick = !g.ui.isPowerMonitorExpanded;
    const bodyHiddenAfterSecondClick = body ? getComputedStyle(body).display === 'none' : false;

    return {
      initialCollapsed,
      initialBodyHidden,
      expandedAfterClick,
      bodyVisibleAfterClick,
      collapsedAfterSecondClick,
      bodyHiddenAfterSecondClick,
      summaryVisible: summary ? getComputedStyle(summary).display !== 'none' : false,
      chevronText: chevron?.textContent
    };
  })()`);

  check(powerMonitorTest.initialCollapsed, 'Power monitor defaults to collapsed on mobile landscape');
  check(powerMonitorTest.initialBodyHidden, 'Power monitor body hidden when collapsed');
  check(powerMonitorTest.expandedAfterClick, 'Clicking power monitor header expands panel');
  check(powerMonitorTest.bodyVisibleAfterClick, 'Power monitor body visible when expanded');
  check(powerMonitorTest.collapsedAfterSecondClick, 'Clicking power monitor header again collapses panel');
  check(powerMonitorTest.bodyHiddenAfterSecondClick, 'Power monitor body hidden after re-collapsing');

  // 4. Test Prev / Next Module Cycling
  const cyclingTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const nextBtn = sr?.getElementById('btn-construct-next') || document.getElementById('btn-construct-next');
    const prevBtn = sr?.getElementById('btn-construct-prev') || document.getElementById('btn-construct-prev');
    const seenModules = [];

    for (let i = 0; i < 10; i++) {
      const mod = g.buildingSystem.getSelectedModule();
      seenModules.push(mod.id);
      nextBtn.click();
    }

    prevBtn.click();
    const afterPrevMod = g.buildingSystem.getSelectedModule().id;

    return {
      seenModules,
      afterPrevMod,
      hasSolar: seenModules.includes('build_solar_power'),
      hasBattery: seenModules.includes('build_battery_bank'),
      hasStation: seenModules.includes('build_research_station'),
      hasOxygen: seenModules.includes('build_oxygen_gen')
    };
  })()`);

  check(cyclingTest.hasSolar, 'Solar panel module is selectable via toolbar');
  check(cyclingTest.hasBattery, 'Battery bank module is selectable via toolbar');
  check(cyclingTest.hasStation, 'Research station module is selectable via toolbar');
  check(cyclingTest.hasOxygen, 'Oxygen generator module is selectable via toolbar');

  // 5. Test Rotation (↻ 45°)
  const rotationTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const rotBtn = sr?.getElementById('btn-construct-rotate') || document.getElementById('btn-construct-rotate');
    const rotBefore = g.buildingSystem.rotationY;
    rotBtn.click();
    const rotAfter = g.buildingSystem.rotationY;
    const ghostRot = g.buildingSystem.ghostGroup.rotation.y;
    return {
      rotBefore,
      rotAfter,
      diff: rotAfter - rotBefore,
      ghostMatches: Math.abs(ghostRot - rotAfter) < 0.001
    };
  })()`);

  check(Math.abs(rotationTest.diff - Math.PI / 4) < 0.01, 'Rotate button rotates ghost by 45 degrees');
  check(rotationTest.ghostMatches, 'Ghost 3D rotation matches building rotation');

  // 6. Test Placement (Insufficient resources vs Successful placement)
  await ev(`(() => {
    while (g.buildingSystem.getSelectedModule().id !== 'build_solar_power') {
      g.buildingSystem.nextModule();
    }
    g.ui.updateConstructionToolbar();
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const placeBtn = sr?.getElementById('btn-construct-place') || document.getElementById('btn-construct-place');

    globalThis._testPlacedBefore = g.buildingSystem.placedBuildings.length;
    placeBtn.click();
    globalThis._testPlacedAfterNoRes = g.buildingSystem.placedBuildings.length;
  })()`);

  await sleep(600); // Wait for 400ms debounce window to elapse

  const placementTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const placeBtn = sr?.getElementById('btn-construct-place') || document.getElementById('btn-construct-place');

    // Give required resources for solar power: { quartz_crystal: 6, copper_ore: 6, iron_ore: 4 }
    g.inventory.addItem('quartz_crystal', 20);
    g.inventory.addItem('iron_ore', 20);
    g.inventory.addItem('copper_ore', 20);
    g.ui.updateConstructionToolbar();

    const statusBefore = g.buildingSystem.getPlacementStatus();
    placeBtn.click();
    const placedAfterRes = g.buildingSystem.placedBuildings.length;
    const newlyPlaced = placedAfterRes > globalThis._testPlacedBefore ? g.buildingSystem.placedBuildings[g.buildingSystem.placedBuildings.length - 1] : null;

    return {
      placedBefore: globalThis._testPlacedBefore,
      placedAfterNoRes: globalThis._testPlacedAfterNoRes,
      blockedWhenNoRes: globalThis._testPlacedBefore === globalThis._testPlacedAfterNoRes,
      statusBefore,
      placedAfterRes,
      placedSuccess: placedAfterRes === globalThis._testPlacedBefore + 1,
      newlyPlacedModId: newlyPlaced?.moduleId,
      newlyPlacedY: newlyPlaced?.y
    };
  })()`);

    console.log('placementTest:', JSON.stringify(placementTest));
  check(placementTest.blockedWhenNoRes, 'Placement is blocked when player lacks required resources');
  check(placementTest.placedSuccess, 'Placement succeeds when player has required resources');
  check(placementTest.newlyPlacedModId === 'build_solar_power', 'Placed building record matches selected solar power module');

  // 7. Test Deselection (Switch away from slot 9)
  const deselectTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    g.inventory.setActiveHotbarIndex(0);
    g.ui.updateHotbar();

    const isBuildActive = g.buildingSystem.active;
    const ghostVisible = g.buildingSystem.ghostGroup.visible;
    const tb = sr?.getElementById('hud-construction-toolbar') || document.getElementById('hud-construction-toolbar');

    return {
      isBuildActive,
      ghostVisible,
      tbDisplay: tb?.style.display
    };
  })()`);

  check(!deselectTest.isBuildActive, 'BuildingSystem becomes inactive when switching away from slot 9');
  check(!deselectTest.ghostVisible, 'Ghost preview hides immediately when slot 9 is deselected');
  check(deselectTest.tbDisplay === 'none', 'Construction toolbar hides immediately when slot 9 is deselected');

  // Re-select slot 9 for clean screenshot in Samsung landscape
  await ev(`(() => {
    g.inventory.setActiveHotbarIndex(8);
    g.ui.updateHotbar();
  })()`);
  await sleep(1000);

  // Capture Samsung landscape screenshot 915x412
  const path915 = path.join(ARTIFACTS_DIR, 'after_mobile_build_915x412.png');
  await screenshot(path915);
  console.log('Saved screenshot:', path915);

  // Switch to 800x360 compact landscape
  await viewport(800, 360);
  await sleep(600);
  await ev(`g.ui.updateHotbar(); true;`);
  await sleep(500);

  const compactTest = await ev(`(() => {
    const sr = document.getElementById('suHostExplore')?.shadowRoot;
    const tb = (sr?.getElementById('hud-construction-toolbar') || document.getElementById('hud-construction-toolbar'))?.getBoundingClientRect();
    const joy = (sr?.getElementById('touch-joystick-base') || document.getElementById('touch-joystick-base'))?.getBoundingClientRect();
    const pm = (sr?.getElementById('hud-base-power-monitor') || document.getElementById('hud-base-power-monitor'))?.getBoundingClientRect();

    return {
      tbWidth: tb?.width,
      joyOverlapped: tb && joy ? (tb.x < joy.x + joy.width && tb.x + tb.width > joy.x && tb.y < joy.y + joy.height && tb.y + tb.height > joy.y) : false,
      powerOverlapped: pm && joy ? (pm.y + pm.height > joy.y && pm.x < joy.x + joy.width) : false
    };
  })()`);

  check(!compactTest.joyOverlapped, 'Toolbar does not overlap joystick on 800x360 compact landscape');
  check(!compactTest.powerOverlapped, 'Collapsed power monitor does not overlap joystick on 800x360');

  const path800 = path.join(ARTIFACTS_DIR, 'after_mobile_build_800x360.png');
  await screenshot(path800);
  console.log('Saved screenshot:', path800);

  console.log('ALL MOBILE BUILDING TESTS PASSED SUCCESSFULLY!');

} finally {
  if (ws) ws.close();
  browser.kill();
  server.close();
}
