import assert from 'node:assert/strict';
import test from 'node:test';
import { SaveSystem } from '../src/save/SaveSystem.js';
import { RocketManager } from '../src/spacecraft/RocketManager.js';
import { SOLAR_PLANETS, SpaceflightSystem } from '../src/spacecraft/SpaceflightSystem.js';
import { VolumetricTerrain } from '../src/world/VolumetricTerrain.js';
import {
  getLandingUnavailableMessage,
  getPlanetId,
  getPlanetWorldConfig,
  resolvePlanetEnvironment
} from '../src/world/PlanetEnvironment.js';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

function makeDocument() {
  const ids = [
    'planet-info-panel', 'info-target-name', 'info-target-sub', 'info-target-desc',
    'info-diameter', 'info-temp', 'info-gravity', 'info-distance',
    'land-planet-btn', 'quick-land-btn', 'space-target', 'deorbit-banner',
    'deorbit-target-text', 'probe-mission-banner', 'probe-mission-status', 'probe-mission-report'
  ];
  const elements = new Map(ids.map((id) => [id, {
    id,
    style: {},
    textContent: '',
    title: '',
    disabled: false
  }]));
  return {
    elements,
    document: { getElementById: (id) => elements.get(id) || null }
  };
}

function withStorage(storage, action) {
  const previous = globalThis.localStorage;
  globalThis.localStorage = storage;
  try {
    return action();
  } finally {
    if (previous === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previous;
  }
}

function withDocument(document, action) {
  const previous = globalThis.document;
  globalThis.document = document;
  try {
    return action();
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
}

test('planet identifiers resolve the real Mars environment without name-only substitution', () => {
  const mars = resolvePlanetEnvironment({ id: 'mars', name: 'Mars' });
  assert.equal(getPlanetId({ id: 'earth', name: 'Earth' }), 'earth');
  assert.deepEqual(mars, {
    planetId: 'mars',
    planetName: 'Mars',
    worldId: 'mars',
    surfaceRegion: 'Jezero Crater',
    gravityMps2: 3.71,
    hasSolidSurface: true
  });
  assert.equal(resolvePlanetEnvironment({ id: 'earth', name: 'Earth' }).gravityMps2, 9.81);
  assert.equal(resolvePlanetEnvironment('venus').gravityMps2, 8.87);
});

test('unsupported rocky and giant-planet destinations explain why landing is unavailable', () => {
  assert.match(getLandingUnavailableMessage({ id: 'ceres', name: 'Ceres', solidSurface: true }), /does not have a playable surface environment/i);
  assert.match(getLandingUnavailableMessage({ id: 'jupiter', name: 'Jupiter', solidSurface: false }), /no solid surface/i);
});

test('selecting a gas giant offers an atmospheric probe instead of solid-surface landing', () => {
  const { document, elements } = makeDocument();
  const flight = Object.create(SpaceflightSystem.prototype);
  const unavailableMessages = [];
  flight.isActive = true;
  flight.isDeorbiting = false;
  flight.onLandingUnavailable = (message) => unavailableMessages.push(message);

  withDocument(document, () => {
    flight.selectTarget(SOLAR_PLANETS.find((planet) => planet.id === 'jupiter'));
    assert.equal(flight.selectedPlanetId, 'jupiter');
    assert.equal(elements.get('land-planet-btn').disabled, false);
    assert.match(elements.get('land-planet-btn').textContent, /ATMOSPHERIC PROBE/);
    assert.equal(elements.get('quick-land-btn').disabled, false);
    assert.match(elements.get('info-target-desc').textContent, /no solid surface/i);
    assert.equal(flight.initiateSelectedDestinationAction(), true);
    assert.equal(flight.probeMission.planetId, 'jupiter');
  });

  assert.equal(flight.isDeorbiting, false);
  assert.deepEqual(unavailableMessages, []);
});

test('selecting the Sun offers solar observation instead of landing or probing', () => {
  const { document, elements } = makeDocument();
  const flight = Object.create(SpaceflightSystem.prototype);
  flight.isActive = true;
  flight.isDeorbiting = false;

  withDocument(document, () => {
    flight.selectTarget(SOLAR_PLANETS.find((planet) => planet.id === 'sun'));
    assert.equal(flight.selectedPlanetId, 'sun');
    assert.equal(elements.get('land-planet-btn').disabled, false);
    assert.match(elements.get('land-planet-btn').textContent, /OBSERVE SUN|SOLAR OBSERVATION/i);
    assert.equal(flight.initiateSelectedDestinationAction(), true);
    assert.equal(flight.observationMission.planetId, 'sun');
  });
});

test('Mars de-orbit dispatches the selected environment ID to the landing callback', () => {
  const { document } = makeDocument();
  const landedPlanetIds = [];
  const flight = Object.create(SpaceflightSystem.prototype);
  flight.isActive = true;
  flight.isDeorbiting = false;
  flight.selectedBody = SOLAR_PLANETS.find((planet) => planet.id === 'mars');
  flight.selectedPlanetId = 'mars';
  flight.bodies = [];
  flight.spacePlumeMat = null;
  flight.plasmaMat = null;
  flight.spaceRocketGroup = { rotation: { x: 0 } };
  flight.onLandOnPlanet = (planetId) => landedPlanetIds.push(planetId);

  withDocument(document, () => {
    assert.equal(flight.initiateDeorbitDescent(), true);
    assert.equal(flight.pendingLandingDestination.planetId, 'mars');
    flight.update(4, 0);
  });

  assert.deepEqual(landedPlanetIds, ['mars']);
  assert.equal(flight.isActive, false);
});

test('all five playable surfaces expose their own enabled landing action', () => {
  for (const planetId of ['mars', 'moon', 'earth', 'mercury', 'venus']) {
    const { document, elements } = makeDocument();
    const flight = Object.create(SpaceflightSystem.prototype);
    withDocument(document, () => {
      flight.selectTarget(SOLAR_PLANETS.find((planet) => planet.id === planetId));
    });
    assert.equal(flight.selectedPlanetId, planetId);
    assert.equal(elements.get('land-planet-btn').disabled, false, `${planetId} Land action`);
    assert.match(elements.get('land-planet-btn').textContent, new RegExp(planetId.toUpperCase()));
  }
});

test('planet excavation storage keeps Mars legacy data separate from other worlds', () => {
  const terrain = Object.create(VolumetricTerrain.prototype);
  terrain.activeSlotId = 'slot_1';
  terrain.planetId = 'mars';
  assert.equal(terrain.getStorageKeyForSlot(), 'MARS_VOXEL_EDITS_V4');
  terrain.planetId = 'moon';
  assert.equal(terrain.getStorageKeyForSlot(), 'SCIENCE_UNIVERSE_MOON_VOXEL_EDITS_V1');
  terrain.activeSlotId = 'slot_2';
  assert.equal(terrain.getStorageKeyForSlot(), 'SCIENCE_UNIVERSE_MOON_VOXEL_EDITS_V1_slot_2');
});

test('rocket landing system rejects a destination without an implemented world', () => {
  const rocket = Object.create(RocketManager.prototype);
  assert.equal(rocket.startLandingSequence('saturn'), false);
});

test('pausing orbital flight disables input and orbit controls until resumed', () => {
  const flight = Object.create(SpaceflightSystem.prototype);
  flight.cameraMode = 'ORBIT';
  flight.controls = { enabled: true };

  flight.setControlsEnabled(false);
  assert.equal(flight.areControlsEnabled, false);
  assert.equal(flight.controls.enabled, false);

  flight.setControlsEnabled(true);
  assert.equal(flight.areControlsEnabled, true);
  assert.equal(flight.controls.enabled, true);

  flight.cameraMode = 'COCKPIT';
  flight.setControlsEnabled(true);
  assert.equal(flight.controls.enabled, false);
});

test('save stores selected planet ID and load prefers it over the legacy display name', () => {
  const storage = new MemoryStorage();
  const game = {
    player: { getState: () => ({}), loadState() {}, clearDeployedWorkLights() {}, updateEquippedTool() {}, position: {} },
    inventory: { getState: () => ({}), loadState() {} },
    survival: { getState: () => ({}), loadState() {} },
    spaceflightSystem: {
      isActive: true,
      selectedPlanetId: 'earth',
      selectedBody: SOLAR_PLANETS.find((planet) => planet.id === 'earth')
    },
    rocketManager: { state: 'IN_SPACE' },
    sky: { timeOfDay: 0.5, solCount: 1 },
    terrain: { seed: 'test-seed', activeSlotId: 'slot_1', flushEditsToStorage() {}, reloadForActiveSlot() {}, update() {} },
    resourceManager: { depletedNodeIds: new Set(), setDepletedNodes() {}, update() {} },
    enterSpaceflight(planetId) { this.loadedPlanetId = planetId; }
  };
  const saveSystem = Object.assign(Object.create(SaveSystem.prototype), {
    game,
    baseStorageKey: 'TEST_SAVE',
    activeSlotStorageKey: 'TEST_ACTIVE_SLOT',
    activeSlotId: 'slot_1'
  });

  withStorage(storage, () => {
    assert.equal(saveSystem.save().success, true);
    const saved = JSON.parse(storage.getItem('TEST_SAVE'));
    assert.equal(saved.spacecraft.selectedPlanetId, 'earth');
    assert.equal(saved.spacecraft.selectedPlanet, 'Earth');
    assert.equal(saveSystem.load().success, true);
  });

  assert.equal(game.loadedPlanetId, 'earth');
});

test('legacy orbital save names still restore the matching planet', () => {
  const storage = new MemoryStorage();
  storage.setItem('TEST_SAVE', JSON.stringify({
    dateString: 'legacy save',
    spacecraft: { isSpaceflight: true, selectedPlanet: 'Earth' }
  }));
  const game = {
    terrain: { activeSlotId: 'slot_1', reloadForActiveSlot() {} },
    player: { clearDeployedWorkLights() {} },
    enterSpaceflight(planetId) { this.loadedPlanetId = planetId; }
  };
  const saveSystem = Object.assign(Object.create(SaveSystem.prototype), {
    game,
    baseStorageKey: 'TEST_SAVE',
    activeSlotStorageKey: 'TEST_ACTIVE_SLOT',
    activeSlotId: 'slot_1'
  });

  withStorage(storage, () => assert.equal(saveSystem.load().success, true));
  assert.equal(game.loadedPlanetId, 'Earth');
});

test('Moon has a distinct vacuum, low-gravity, cratered world profile', () => {
  const moon = getPlanetWorldConfig('moon');
  assert.equal(moon.gravityMps2, 1.62);
  assert.equal(moon.atmosphere.kind, 'vacuum');
  assert.equal(moon.atmosphere.fogDensity, 0);
  assert.equal(moon.terrainProfile, 'lunar');
  assert.equal(moon.terrain.craterDepth, 8);
  assert.equal(resolvePlanetEnvironment('moon').gravityMps2, 1.62);
});

test('Moon terrain produces crater bowls and lunar strata instead of the Mars profile', () => {
  const terrain = Object.create(VolumetricTerrain.prototype);
  terrain.planetConfig = getPlanetWorldConfig('moon');
  terrain.macroNoise = { noise2D: () => 0 };
  terrain.ridgeNoise = { noise2D: () => 0, noise3D: () => 0 };
  terrain.canyonNoise = { noise3D: () => 0 };
  terrain.duneNoise = { noise3D: () => 0 };

  const mareHeight = terrain.getBaseHeight(0, 0);
  const craterFloor = terrain.getBaseHeight(82, -42);
  const highland = terrain.getBaseHeight(120, -40);
  assert.ok(highland > mareHeight);
  assert.ok(mareHeight > craterFloor);
  assert.equal(terrain.getGeologyAt(0, mareHeight - 1, 0).item, 'lunar_regolith');
  assert.equal(terrain.getGeologyAt(0, mareHeight - 10, 0).item, 'basalt');
});

test('Earth has a temperate, pressurized, higher-gravity exploration profile', () => {
  const earth = getPlanetWorldConfig('earth');
  assert.equal(earth.gravityMps2, 9.81);
  assert.equal(earth.atmosphere.kind, 'nitrogen-oxygen');
  assert.equal(earth.atmosphere.pressureKPa, 101.3);
  assert.equal(earth.terrainProfile, 'earthlike');
  assert.ok(earth.locations.some((location) => location.id === 'river-delta'));
  assert.equal(resolvePlanetEnvironment('earth').gravityMps2, 9.81);
});

test('Earth terrain builds rolling continents, a river delta, and mountain relief distinct from Mars', () => {
  const makeTerrain = (planetId) => {
    const terrain = Object.create(VolumetricTerrain.prototype);
    terrain.planetConfig = getPlanetWorldConfig(planetId);
    terrain.macroNoise = { noise2D: (x, z) => Math.sin(x * 13 + z * 7) };
    terrain.ridgeNoise = { noise2D: (x, z) => Math.cos(x * 9 - z * 11), noise3D: () => 0 };
    terrain.duneNoise = { noise2D: (x, z) => Math.sin(x * 5 + z * 3), noise3D: () => 0 };
    terrain.canyonNoise = { noise2D: () => 0, noise3D: () => 0 };
    return terrain;
  };
  const earth = makeTerrain('earth');
  const mars = makeTerrain('mars');
  const river = earth.getBaseHeight(0, -24);
  const delta = earth.getBaseHeight(92, -64);
  const ridge = earth.getBaseHeight(-118, 96);

  assert.notEqual(river, delta);
  assert.notEqual(ridge, river);
  assert.notEqual(river, mars.getBaseHeight(0, -24));
  assert.equal(earth.getGeologyAt(0, river - 1, -24).item, 'terrestrial_soil');
  assert.equal(earth.getGeologyAt(0, river - 8, -24).item, 'river_sediment');
});

test('Mercury and Venus define separate cratered and volcanic physical environments', () => {
  const mercury = getPlanetWorldConfig('mercury');
  const venus = getPlanetWorldConfig('venus');
  assert.equal(mercury.gravityMps2, 3.7);
  assert.equal(mercury.atmosphere.kind, 'exosphere');
  assert.equal(mercury.terrainProfile, 'mercurian');
  assert.equal(venus.gravityMps2, 8.87);
  assert.equal(venus.atmosphere.kind, 'dense-carbon-dioxide');
  assert.equal(venus.temperatureC.day, 465);
  assert.equal(venus.terrainProfile, 'venusian');
  assert.equal(resolvePlanetEnvironment('mercury').gravityMps2, 3.7);
  assert.equal(resolvePlanetEnvironment('venus').gravityMps2, 8.87);
});

test('Mercury crater bowls and Venus shield volcanoes create distinct heightfields', () => {
  const makeTerrain = (planetId) => {
    const terrain = Object.create(VolumetricTerrain.prototype);
    terrain.planetConfig = getPlanetWorldConfig(planetId);
    terrain.macroNoise = { noise2D: (x, z) => Math.sin(x * 13 + z * 7) };
    terrain.ridgeNoise = { noise2D: (x, z) => Math.cos(x * 9 - z * 11), noise3D: () => 0 };
    terrain.duneNoise = { noise2D: (x, z) => Math.sin(x * 5 + z * 3), noise3D: () => 0 };
    terrain.canyonNoise = { noise2D: () => 0, noise3D: () => 0 };
    return terrain;
  };
  const mercury = makeTerrain('mercury');
  const venus = makeTerrain('venus');
  const mercuryCraterFloor = mercury.getBaseHeight(78, -35);
  const mercuryCraterRim = mercury.getBaseHeight(117, -35);
  const venusPlain = venus.getBaseHeight(0, 0);
  const venusMons = venus.getBaseHeight(-52, 38);

  assert.ok(mercuryCraterRim > mercuryCraterFloor);
  assert.ok(venusMons > venusPlain);
  assert.equal(mercury.getGeologyAt(0, mercury.getBaseHeight(0, 0) - 1, 0).item, 'mercury_regolith');
  assert.equal(venus.getGeologyAt(0, venusPlain - 1, 0).item, 'volcanic_ash');
});

test('unpowered suit temperature responds to Venus heat and damages health outside safe limits', async () => {
  const previousWindow = globalThis.window;
  globalThis.window ||= { devicePixelRatio: 1 };
  const { SurvivalSystem } = await import('../src/survival/SurvivalSystem.js');
  const survival = new SurvivalSystem();
  survival.power = 0;
  survival.setPlanet(getPlanetWorldConfig('venus'));
  for (let frame = 0; frame < 3000; frame += 1) {
    survival.update(0.1, false, false, 0, frame * 100, 465);
  }
  assert.ok(survival.temperature > 45);
  assert.ok(survival.health < 100);
  if (previousWindow === undefined) delete globalThis.window;
  else globalThis.window = previousWindow;
});