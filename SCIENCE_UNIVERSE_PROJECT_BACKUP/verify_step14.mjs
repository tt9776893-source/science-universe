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
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', err => errors.push(err.message));

console.log('Loading game...');
await page.goto('http://localhost:7777/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_01_initial.png`, fullPage: true });

const sessionStarted = await page.evaluate(() => {
  const btn = document.getElementById('btn-menu-surface');
  if (btn) { btn.click(); return 'surface-clicked'; }
  return 'no-surface-btn';
});
console.log('Session start:', sessionStarted);
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_02_after_start.png`, fullPage: true });

const injectResult = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (!game?.academy) return 'no-academy';
  const civ = game.academy.getOrCreateCivilizationEngine();
  civ.setRunning(true);
  civ.setSpeed(1);

  const testState = {
    running: true,
    speed: 1,
    sessionTime: 100,
    groups: [{
      id: 'test-group-1',
      founderId: 'org-1',
      memberIds: ['org-1', 'org-2', 'org-3', 'org-4', 'org-5', 'org-6'],
      leaderId: 'org-1',
      formedAt: 100,
      sharedResources: 200,
      groupMemory: [],
      traditions: {},
      toolsKnown: ['tool-1', 'tool-2', 'tool-3'],
      techLevel: 3,
      stability: 0.8,
      conflictLevel: 0.1,
      location: { x: 0, z: 0 },
      isExtinct: false,
      extinctionTime: null
    }],
    cultures: [],
    technologies: [
      {
        id: 'tech_solar_power', name: 'Solar Power', field: 'energy', domain: 'energy',
        prerequisites: { cognitive: 0.5, social: 5, material: 8, energy: 6 }, prerequisiteTech: [],
        resourceCost: { food: 0, materials: 100, energy: 50 }, researchCost: 7,
        description: 'Solar energy system', discoveryCost: 150, researchProgress: 100,
        discoveredBy: 'test-group-1', discoveredAt: 100, adopterGroups: ['test-group-1'],
        totalUses: 1, unlocked: true, fieldLabel: 'Энергийн технологи'
      },
      {
        id: 'tech_rocketry_basic', name: 'Basic Rocketry', field: 'spacecraft', domain: 'spacecraft',
        prerequisites: { cognitive: 0.6, social: 10, material: 20, energy: 15 }, prerequisiteTech: [],
        resourceCost: { food: 0, materials: 500, energy: 300 }, researchCost: 15,
        description: 'Basic rocketry', discoveryCost: 800, researchProgress: 100,
        discoveredBy: 'test-group-1', discoveredAt: 100, adopterGroups: ['test-group-1'],
        totalUses: 1, unlocked: true, fieldLabel: 'Ангилойн технологи'
      }
    ],
    settlements: [{
      id: 'test-settlement-1', founderGroupId: 'test-group-1', foundedAt: 100,
      location: { x: 0, z: 0 }, population: 6, maxPopulation: 50,
      storedFood: 150, storedMaterials: 200, storedEnergy: 100, infrastructure: 5, techLevel: 4,
      populationHistory: [{ t: 100, population: 6 }], isAbandoned: false, abandonmentTime: null, collapseReason: null,
      energyInfrastructure: 3, scientificFacilities: 2, communicationSystems: 1,
      transportationInfrastructure: 2, lifeSupport: 3, foodProduction: 2.5,
      materialProduction: 1.5, energyProduction: 3.0, environmentalImpact: 0.3, sustainability: 0.8,
      spaceportLevel: 2, satelliteUplink: true, orbitalStationAccess: false
    }],
    groupRelations: {}, crisisActive: null, crisisHistory: [],
    spaceMilestones: [
      { t: 100, type: 'rocket_research', description: 'Rocket research unlocked', data: { tech: 'tech_rocketry_basic' } },
      { t: 100, type: 'satellite', description: 'Satellite launched', data: { tech: 'tech_satellite' } }
    ],
    fieldProgress: {
      energy: { label: 'Энергийн технологи', unlocked: 1, total: 3, avgProgress: 33 },
      spacecraft: { label: 'Ангилойн технологи', unlocked: 1, total: 5, avgProgress: 20 }
    },
    events: []
  };

  civ.setState(testState);
  return {
    groupCount: civ.population.socialGroups.size,
    settlementCount: civ.population.settlements.size,
    techCount: civ.population.technologies.size,
    civRunning: civ.running,
    settlements: [...civ.population.settlements.values()].map(s => ({ id: s.id, population: s.population, infrastructure: s.infrastructure, spaceportLevel: s.spaceportLevel }))
  };
});
console.log('Injection result:', JSON.stringify(injectResult, null, 2));
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_03_data_injected.png`, fullPage: true });

const toggleResult = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (game?.civilizationWorldSystem) { game.civilizationWorldSystem.setVisible(true); return 'enabled'; }
  return 'no-cws';
});
console.log('3D visualization:', toggleResult);
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_04_3d_enabled.png`, fullPage: true });

const meshInfo = await page.evaluate(() => {
  const game = window.suGame || window.game;
  const cws = game.civilizationWorldSystem;
  if (!cws?.root) return null;
  
  // Manually trigger step to see if it renders
  const civ = game.academy?.getOrCreateCivilizationEngine();
  const state = civ?.getState();
  
  // Try calling step manually with player at origin
  try {
    cws.step(0.016, { x: 0, y: 0, z: 0 });
  } catch(e) {
    return { error: e.message, rootChildren: cws.root.children.length };
  }
  
  const settlements = [];
  for (const [id, group] of cws.settlementMeshes) {
    settlements.push({ id, children: group.children.length, position: group.position ? { x: Math.round(group.position.x*100)/100, y: Math.round(group.position.y*100)/100, z: Math.round(group.position.z*100)/100 } : null, visible: group.visible });
  }
  const groups = [];
  for (const [id, group] of cws.groupMeshes) {
    groups.push({ id, children: group.children.length, position: group.position ? { x: Math.round(group.position.x*100)/100, y: Math.round(group.position.y*100)/100, z: Math.round(group.position.z*100)/100 } : null, visible: group.visible });
  }

  return {
    rootChildren: cws.root.children.length,
    rootVisible: cws.root.visible,
    enabled: cws.enabled,
    lastStateHash: cws.lastStateHash ? 'set' : 'null',
    stateHasSettlements: state?.settlements?.length || 0,
    stateHasGroups: state?.groups?.length || 0,
    settlements,
    groups,
    infraCount: cws.infraMeshes.size
  };
});
console.log('Mesh info:', JSON.stringify(meshInfo, null, 2));

if (errors.length > 0) { console.log('Console errors:'); errors.forEach(e => console.log('  -', e)); }
else { console.log('No console errors'); }

const saveLoadResult = await page.evaluate(() => {
  const game = window.suGame || window.game;
  if (!game?.saveSystem) return 'no-savesystem';
  const cws = game.civilizationWorldSystem;
  const before = cws.getState();
  const saveResult = game.saveSystem.save();
  cws.setVisible(false);
  const afterToggle = cws.enabled;
  const loadResult = game.saveSystem.load();
  const after = cws.getState();
  return { saveSuccess: saveResult.success, loadSuccess: loadResult.success, beforeEnabled: before.enabled, afterToggleEnabled: afterToggle, afterLoadEnabled: after.enabled, beforePlanet: before.planetId, afterLoadPlanet: after.planetId };
});
console.log('Save/load result:', JSON.stringify(saveLoadResult, null, 2));
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_05_saveload.png`, fullPage: true });

const terrainCheck = await page.evaluate(() => {
  const game = window.suGame || window.game;
  const cws = game.civilizationWorldSystem;
  if (!cws?.terrain || cws.settlementMeshes.size === 0) return 'no-terrain-or-settlements';
  const checks = [];
  for (const [id, group] of cws.settlementMeshes) {
    const { x, z } = group.position;
    const groundY = cws.terrain.getBaseHeight(x, z);
    const meshY = group.position.y;
    checks.push({ id, meshY: Math.round(meshY*100)/100, groundY: Math.round(groundY*100)/100, anchored: Math.abs(meshY-groundY) < 0.5 });
  }
  return checks;
});
console.log('Terrain anchoring:', JSON.stringify(terrainCheck, null, 2));
await sleep(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}\\step14_06_terrain.png`, fullPage: true });

await browser.close();
console.log('Verification complete');
