import * as THREE from 'three';

export const LIVING_WORLD_PROFILES = Object.freeze({
  mars: Object.freeze({
    actors: Object.freeze([
      Object.freeze({ id: 'mars-scientist', name: 'Dr. Lin', kind: 'astronaut', role: 'Colony biologist', speed: 0.72, offset: [2, 0, 9], route: [[-5, 0, 8], [5, 0, 8], [4, 0, 13], [-4, 0, 13]], action: 'mars-colony-assignment', dialogue: 'The greenhouse is our best controlled life-support experiment. Record a growth cycle and check our reserves.' }),
      Object.freeze({ id: 'mars-autonomous-rover', name: 'Ares Survey Rover', kind: 'rover', role: 'Autonomous geology survey', speed: 1.15, offset: [-8, 0, 3], route: [[-12, 0, 0], [-4, 0, 1], [-3, 0, 8], [-12, 0, 8]], action: 'mars-rover-calibration', dialogue: 'Ares rover telemetry is ready. Calibration will add a route to the colony survey plan.' })
    ]),
    stations: Object.freeze([
      Object.freeze({ id: 'mars-greenhouse', name: 'Controlled Greenhouse', type: 'greenhouse', offset: [7, 0, 10], action: 'greenhouse', prompt: '[E] Tend greenhouse crop' }),
      Object.freeze({ id: 'mars-life-support', name: 'Life Support Monitor', type: 'console', offset: [-5, 0, 13], action: 'resources', prompt: '[E] Check oxygen, water, and energy' }),
      Object.freeze({ id: 'hypothetical-life-simulation', name: 'Hypothetical Biosignature Simulator', type: 'console', offset: [10, 0, 3], action: 'hypothetical', prompt: '[E] Open fictional life simulation' })
    ])
  }),
  moon: Object.freeze({
    actors: Object.freeze([
      Object.freeze({ id: 'moon-astronaut', name: 'Commander Okafor', kind: 'astronaut', role: 'Lunar field geologist', speed: 0.68, offset: [1, 0, 4], route: [[-4, 0, 4], [4, 0, 4], [4, 0, 10], [-4, 0, 10]], action: 'moon-outpost-assignment', dialogue: 'We are surveying the south rim for accessible regolith and polar-volatiles analogues.' }),
      Object.freeze({ id: 'moon-rover', name: 'Lunar Traverse Rover', kind: 'rover', role: 'Resource prospecting rover', speed: 0.95, offset: [-5, 0, 7], route: [[-8, 0, 3], [3, 0, 0], [8, 0, 7], [0, 0, 12]], action: 'moon-rover-survey', dialogue: 'Rover spectrometer is ready to log a lunar regolith traverse.' })
    ]),
    stations: Object.freeze([
      Object.freeze({ id: 'moon-polar-instrument', name: 'Polar Volatile Instrument', type: 'instrument', offset: [7, 0, -4], action: 'moon-polar-survey', prompt: '[E] Scan polar volatile analogues' }),
      Object.freeze({ id: 'moon-airlock', name: 'Lunar Habitat Airlock', type: 'airlock', offset: [4, 0, 5], action: 'airlock', prompt: '[E] Cycle lunar habitat airlock' }),
      Object.freeze({ id: 'moon-life-support', name: 'Lunar Life Support Monitor', type: 'console', offset: [5, 0, 12], action: 'resources', prompt: '[E] Check outpost oxygen, water, and energy' })
    ])
  }),
  earth: Object.freeze({
    actors: Object.freeze([
      Object.freeze({ id: 'earth-ecologist', name: 'Dr. Rivera', kind: 'astronaut', role: 'Field ecologist', speed: 0.78, offset: [-5, 0, 2], route: [[-10, 0, 3], [-3, 0, 7], [5, 0, 5], [2, 0, -2]], action: 'earth-ecosystem-observation', dialogue: 'Observe how vegetation, soil moisture, herbivores, and birds respond to the local conditions.' }),
      Object.freeze({ id: 'earth-hare', name: 'Field Hare', kind: 'wildlife', role: 'Small herbivore', speed: 1.15, offset: [8, 0, 5], route: [[7, 0, 4], [13, 0, 6], [10, 0, 12], [5, 0, 9]], action: 'earth-ecosystem-observation', dialogue: 'The hare is browsing near the water margin. Record its habitat use without disturbing it.' }),
      Object.freeze({ id: 'earth-bird-1', name: 'Riparian Songbird', kind: 'bird', role: 'Wildlife observation', speed: 1.6, offset: [-7, 7, -4], route: [[-10, 7, -5], [-2, 8, -2], [6, 7, -6], [0, 9, -10]], action: 'earth-ecosystem-observation', dialogue: 'A riparian bird is using the canopy edge. Log the observation from a distance.' }),
      Object.freeze({ id: 'earth-bird-2', name: 'Canopy Songbird', kind: 'bird', role: 'Wildlife observation', speed: 1.35, offset: [8, 8, -8], route: [[8, 8, -8], [0, 9, -12], [-8, 8, -9], [0, 8, -4]], action: 'earth-ecosystem-observation', dialogue: 'The bird is moving between canopy patches. Log its route as an ecological observation.' })
    ]),
    stations: Object.freeze([
      Object.freeze({ id: 'earth-water-sample', name: 'Stream Water Sampler', type: 'instrument', offset: [5, 0, 3], action: 'earth-water-sample', prompt: '[E] Collect a surface-water sample' }),
      Object.freeze({ id: 'earth-weather-station', name: 'Weather Station', type: 'console', offset: [-8, 0, -4], action: 'earth-weather-check', prompt: '[E] Record weather and wind readings' })
    ])
  }),
  mercury: Object.freeze({
    actors: Object.freeze([
      Object.freeze({ id: 'mercury-thermal-probe', name: 'MESSENGER Thermal Lander', kind: 'robot', role: 'Thermal and regolith survey', speed: 0.12, offset: [0, 0, 0], route: [[0, 0, 0], [1.5, 0, 0], [1.5, 0, 1.5], [0, 0, 1.5]], action: 'mercury-thermal-probe', dialogue: 'Thermal probe data available. Surface temperatures change dramatically between illumination and darkness.' })
    ]),
    stations: Object.freeze([Object.freeze({ id: 'mercury-heat-shield-check', name: 'Radiation and Thermal Shield Test', type: 'instrument', offset: [4, 0, 2], action: 'mercury-shield-check', prompt: '[E] Review robotic thermal shielding data' })])
  }),
  venus: Object.freeze({
    actors: Object.freeze([
      Object.freeze({ id: 'venus-atmosphere-probe', name: 'Venera Atmospheric Probe', kind: 'robot', role: 'Pressure and chemistry package', speed: 0.1, offset: [0, 0, 0], route: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], action: 'venus-atmosphere-probe', dialogue: 'Probe telemetry is ready. The lander operates under extreme heat and pressure; the mission is time-limited.' })
    ]),
    stations: Object.freeze([Object.freeze({ id: 'venus-pressure-vessel', name: 'Pressure Vessel Recorder', type: 'instrument', offset: [4, 0, 2], action: 'venus-pressure-check', prompt: '[E] Review pressure-vessel telemetry' })])
  })
});

export class ResearchNPCBrain {
  constructor({ id, position, waypoints, speed = 0.7, kind = 'astronaut', schedule = 'day', reactRadius = 3.4, isBlocked = () => false }) {
    this.id = id;
    this.position = position;
    this.waypoints = waypoints.length ? waypoints : [position.clone()];
    this.speed = speed;
    this.kind = kind;
    this.schedule = schedule;
    this.reactRadius = reactRadius;
    this.isBlocked = isBlocked;
    this.avoidanceSide = 1;
    this.state = 'walking';
    this.waypointIndex = 0;
    this.accumulator = 0;
    this.taskTimer = 0;
  }

  update(delta, playerPosition, detailed = true, dayActive = true) {
    const dx = playerPosition.x - this.position.x;
    const dz = playerPosition.z - this.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 140) return { distance, state: this.state, updated: false };

    this.accumulator += delta;
    const interval = distance < 45 && detailed ? 0.25 : 1.5;
    if (this.accumulator < interval) return { distance, state: this.state, updated: false };
    const step = Math.min(this.accumulator, interval * 2);
    this.accumulator = 0;

    if (distance <= this.reactRadius) {
      this.state = this.kind === 'wildlife' || this.kind === 'bird' ? 'fleeing' : 'reacting';
      this.taskTimer = 1.5;
      if (this.state === 'fleeing' && distance > 0.01) {
        const fleeDistance = this.speed * step * 1.8;
        this.position.x -= (dx / distance) * fleeDistance;
        this.position.z -= (dz / distance) * fleeDistance;
      }
      return { distance, state: this.state, updated: true };
    }

    if (!dayActive && this.schedule === 'day') {
      this.state = this.kind === 'bird' ? 'perching' : 'resting';
      return { distance, state: this.state, updated: true };
    }

    if (this.taskTimer > 0) {
      this.taskTimer -= step;
      this.state = this.kind === 'wildlife' ? 'feeding' : this.kind === 'bird' ? 'perching' : 'working';
      return { distance, state: this.state, updated: true };
    }

    this.state = 'walking';
    const target = this.waypoints[this.waypointIndex];
    const tx = target.x - this.position.x;
    const tz = target.z - this.position.z;
    const targetDistance = Math.hypot(tx, tz);
    if (targetDistance < 0.35) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      this.state = this.kind === 'wildlife' ? 'feeding' : this.kind === 'bird' ? 'perching' : 'working';
      this.taskTimer = 1 + (this.waypointIndex % 3) * 0.5;
    } else if (targetDistance > 0) {
      const travel = Math.min(targetDistance, this.speed * step);
      const nextX = this.position.x + (tx / targetDistance) * travel;
      const nextZ = this.position.z + (tz / targetDistance) * travel;
      if (this.isBlocked(nextX, nextZ, this.id)) {
        this.state = 'avoiding';
        this.position.x += (tz / targetDistance) * this.avoidanceSide * travel * 0.8;
        this.position.z -= (tx / targetDistance) * this.avoidanceSide * travel * 0.8;
        this.avoidanceSide *= -1;
      } else {
        this.position.x = nextX;
        this.position.z = nextZ;
      }
    }
    return { distance, state: this.state, updated: true };
  }
}

const MATERIAL_COLORS = Object.freeze({
  astronaut: 0xd8e7ed,
  scientist: 0xd8e7ed,
  rover: 0x667783,
  robot: 0x93a4ad,
  wildlife: 0x806447,
  bird: 0x374756,
  plant: 0x4c9a55,
  metal: 0x768692,
  water: 0x287fa0
});

export class LivingWorldSystem {
  constructor(scene, terrain, academy, habitatManager = null) {
    this.scene = scene;
    this.terrain = terrain;
    this.academy = academy;
    this.habitatManager = habitatManager;
    this.planetId = null;
    this.root = null;
    this.actors = [];
    this.interactions = [];
    this.greenhousePlants = [];
    this.simulationTime = 0;
    this.saveTimer = 0;
    this.weatherTimer = 0;
    this.weather = 'clear';
    this.windStrength = 0.4;
    this.airlockState = 'SEALED';
    this.airlockCycleTimer = 0;
    this.windTrees = [];
    this.weatherParticles = null;
    this.waterMesh = null;
    this.fieldResources = null;
    this.organismMeshes = new Map();
    this.organismDisplayScale = 1.0;
  }

  setPlanet(planetId) {
    if (this.planetId === planetId && this.root) {
      this.root.visible = true;
      return true;
    }
    this._disposeWorld();
    this.planetId = planetId;
    const profile = LIVING_WORLD_PROFILES[planetId];
    if (!profile) return false;

    this.root = new THREE.Group();
    this.root.name = `living-world-${planetId}`;
    this.scene.add(this.root);
    this.actors = [];
    this.interactions = [];
    this.greenhousePlants = [];
    this.airlockCycleTimer = 0;
    this.airlockState = planetId === 'moon' ? this.academy.getOutpostSystems('moon').airlockState : 'SEALED';
    this.fieldResources = null;
    this.windTrees = [];
    this.weatherParticles = null;
    const origin = this._getOrigin(planetId);

    if (planetId === 'earth') this._buildEarthEcosystem(origin);
    if (planetId === 'mars') this._buildMarsColony(origin);
    if (planetId === 'moon') this._buildLunarOutpost(origin);
    if (planetId === 'mercury' || planetId === 'venus') this._buildRoboticFieldSite(origin);

    for (const actor of profile.actors) this._addActor(actor, origin);
    for (const station of profile.stations) this._addStation(station, origin);
    this._syncOrganisms();
    return true;
  }

  setVisible(visible) {
    if (this.root) this.root.visible = Boolean(visible);
  }

  _getOrigin(planetId) {
    if (planetId === 'mars' && this.habitatManager?.baseOrigin) return this.habitatManager.baseOrigin.clone();
    const site = planetId === 'earth' ? [0, 0, 0] : [0, 0, 0];
    return new THREE.Vector3(site[0], this.terrain.getBaseHeight(site[0], site[2]), site[2]);
  }

  _ground(x, z) {
    return this.terrain.getBaseHeight(x, z);
  }

  _buildMarsColony(origin) {
    const greenhouse = new THREE.Group();
    greenhouse.position.set(origin.x + 7, this._ground(origin.x + 7, origin.z + 10), origin.z + 10);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8299a5, metalness: 0.68, roughness: 0.38 });
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x68b8c5, transparent: true, opacity: 0.23, metalness: 0.1, roughness: 0.2 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(8, 3.4, 5), glassMaterial);
    frame.position.y = 1.8;
    greenhouse.add(frame);
    for (let x = -4; x <= 4; x += 4) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 0.12), frameMaterial);
      post.position.set(x, 1.9, 0);
      greenhouse.add(post);
    }
    for (let z = -2.5; z <= 2.5; z += 5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.12, 0.12), frameMaterial);
      beam.position.set(0, 3.6, z);
      greenhouse.add(beam);
    }
    const bed = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.24, 2.4), new THREE.MeshStandardMaterial({ color: 0x46392d, roughness: 0.95 }));
    bed.position.set(0, 0.38, 0);
    greenhouse.add(bed);
    for (let index = 0; index < 9; index++) {
      const plant = this._createPlant(0x55a95b, 0.65);
      plant.position.set(-2.7 + (index % 5) * 1.35, 0.5, index < 5 ? -0.65 : 0.65);
      greenhouse.add(plant);
      this.greenhousePlants.push(plant);
    }
    this.root.add(greenhouse);
    const panel = this._createSolarArray(origin.x - 8, origin.z + 3, 0x5ca0b3);
    this.root.add(panel);
  }

  _buildLunarOutpost(origin) {
    const habitat = new THREE.Group();
    habitat.position.set(origin.x + 1, this._ground(origin.x + 1, origin.z + 2), origin.z + 2);
    const shell = this._material(0xb7c2c7, 0.58, 0.34);
    const module = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 4.4, 12), shell);
    module.rotation.z = Math.PI / 2;
    module.position.y = 1.8;
    habitat.add(module);
    for (const z of [-2.2, 2.2]) {
      const endCap = new THREE.Mesh(new THREE.SphereGeometry(1.53, 10, 7), shell);
      endCap.scale.set(0.35, 1, 1);
      endCap.position.set(0, 1.8, z);
      habitat.add(endCap);
    }
    const airlock = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 1.25, 10), this._material(0x567b8d, 0.52, 0.34));
    airlock.rotation.x = Math.PI / 2;
    airlock.position.set(0, 1.3, 2.9);
    habitat.add(airlock);
    const door = new THREE.Mesh(new THREE.CircleGeometry(0.48, 10), this._material(0x49b6a7, 0.4, 0.22));
    door.position.set(0, 1.3, 3.55);
    habitat.add(door);
    this.root.add(habitat);
    const solar = this._createSolarArray(origin.x - 7, origin.z + 3, 0x547eae);
    this.root.add(solar);
    const antenna = new THREE.Group();
    antenna.position.set(origin.x + 8, this._ground(origin.x + 8, origin.z - 4), origin.z - 4);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3, 8), this._material(MATERIAL_COLORS.metal));
    mast.position.y = 1.5;
    antenna.add(mast);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), this._material(0xd4e1e6));
    dish.position.y = 3;
    dish.rotation.x = Math.PI;
    antenna.add(dish);
    this.root.add(antenna);
  }

  _buildRoboticFieldSite(origin) {
    const shield = this._createSolarArray(origin.x + 4, origin.z + 2, this.planetId === 'mercury' ? 0x8c8272 : 0xb88552);
    this.root.add(shield);
  }

  _buildEarthEcosystem(origin) {
    const trees = new THREE.Group();
    trees.name = 'earth-native-vegetation';
    const treePositions = [[-18, -12], [-12, -18], [-16, 8], [17, -14], [20, 2], [16, 15], [-20, 18]];
    for (let index = 0; index < treePositions.length; index++) {
      const [dx, dz] = treePositions[index];
      const x = origin.x + dx;
      const z = origin.z + dz;
      const tree = this._createTree(index % 3);
      tree.position.set(x, this._ground(x, z), z);
      trees.add(tree);
    }
    this.root.add(trees);
    this.windTrees = trees.children;

    const grassGeometry = new THREE.ConeGeometry(0.11, 0.55, 3);
    const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x4f8d43, roughness: 0.95 });
    const grass = new THREE.InstancedMesh(grassGeometry, grassMaterial, 48);
    grass.name = 'earth-instanced-grass';
    const matrix = new THREE.Object3D();
    let seed = 41;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let index = 0; index < grass.count; index++) {
      const x = origin.x + (random() - 0.5) * 32;
      const z = origin.z + (random() - 0.5) * 32;
      matrix.position.set(x, this._ground(x, z) + 0.26, z);
      matrix.rotation.y = random() * Math.PI * 2;
      matrix.scale.setScalar(0.55 + random() * 0.9);
      matrix.updateMatrix();
      grass.setMatrixAt(index, matrix.matrix);
    }
    grass.instanceMatrix.needsUpdate = true;
    this.root.add(grass);

    this.waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(15, 8), new THREE.MeshStandardMaterial({ color: MATERIAL_COLORS.water, transparent: true, opacity: 0.74, roughness: 0.22, metalness: 0.12, emissive: 0x07394a, emissiveIntensity: 0.2, side: THREE.DoubleSide }));
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(origin.x + 5, this._ground(origin.x + 5, origin.z + 3) + 0.06, origin.z + 3);
    this.root.add(this.waterMesh);

    const rainPositions = new Float32Array(36 * 3);
    let rainSeed = 317;
    const rainRandom = () => { rainSeed = (rainSeed * 1664525 + 1013904223) >>> 0; return rainSeed / 4294967296; };
    for (let index = 0; index < 36; index++) {
      rainPositions[index * 3] = (rainRandom() - 0.5) * 32;
      rainPositions[index * 3 + 1] = rainRandom() * 12;
      rainPositions[index * 3 + 2] = (rainRandom() - 0.5) * 32;
    }
    const rainGeometry = new THREE.BufferGeometry();
    rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    this.weatherParticles = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: 0xb9dcec, size: 0.11, transparent: true, opacity: 0.55, depthWrite: false }));
    this.weatherParticles.position.set(origin.x, this._ground(origin.x, origin.z) + 8, origin.z);
    this.weatherParticles.visible = false;
    this.root.add(this.weatherParticles);

    for (let index = 0; index < 8; index++) {
      const x = origin.x + (index % 4) * 2.4 - 4;
      const z = origin.z + Math.floor(index / 4) * 2.2 + 11;
      const flower = this._createPlant(index % 2 ? 0xf3cb66 : 0xe589ae, 0.55);
      flower.position.set(x, this._ground(x, z), z);
      this.root.add(flower);
    }
  }

  _createTree(variant) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.4, 6), this._material(0x735236));
    trunk.position.y = 1.2;
    tree.add(trunk);
    const colors = [0x44784a, 0x5c8a4b, 0x78844b];
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.35 + variant * 0.12, 8, 6), this._material(colors[variant]));
    canopy.position.y = 3;
    canopy.scale.y = 1.2;
    tree.add(canopy);
    tree.userData.canopy = canopy;
    return tree;
  }

  _createPlant(color, scale = 1) {
    const plant = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.6, 5), this._material(0x4b8c45));
    stem.position.y = 0.3;
    plant.add(stem);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), this._material(color));
    leaves.position.y = 0.62;
    leaves.scale.set(1, 1.35, 0.8);
    plant.add(leaves);
    plant.scale.setScalar(scale);
    return plant;
  }

  _createSolarArray(x, z, color) {
    const array = new THREE.Group();
    array.position.set(x, this._ground(x, z), z);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.12, 2.4), this._material(0x8798a0));
    frame.position.y = 1.4;
    frame.rotation.x = -0.24;
    array.add(frame);
    const cells = new THREE.Mesh(new THREE.BoxGeometry(4.25, 0.06, 2.1), this._material(color, 0.28, 0.45));
    cells.position.y = 1.48;
    cells.rotation.x = -0.24;
    array.add(cells);
    for (const xOffset of [-1.6, 1.6]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), this._material(0x7d8b91));
      leg.position.set(xOffset, 0.7, 0);
      array.add(leg);
    }
    return array;
  }

  _material(color, roughness = 0.75, metalness = 0.12) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  _addActor(definition, origin) {
    const position = new THREE.Vector3(
      origin.x + definition.offset[0],
      this._ground(origin.x + definition.offset[0], origin.z + definition.offset[2]) + definition.offset[1],
      origin.z + definition.offset[2]
    );
    const waypoints = definition.route.map(([x, y, z]) => new THREE.Vector3(origin.x + x, this._ground(origin.x + x, origin.z + z) + y, origin.z + z));
    const brain = new ResearchNPCBrain({
      id: definition.id,
      position: position.clone(),
      waypoints,
      speed: definition.speed,
      kind: definition.kind,
      schedule: definition.schedule || (definition.kind === 'robot' || definition.kind === 'rover' ? 'continuous' : 'day'),
      isBlocked: (x, z, actorId) => this.actors.some(other => other.id !== actorId && Math.hypot(x - other.brain.position.x, z - other.brain.position.z) < 1.1) ||
        this.interactions.some(item => Math.hypot(x - item.position.x, z - item.position.z) < 1.15)
    });
    const model = definition.kind === 'rover' || definition.kind === 'robot'
      ? this._createRover(definition.kind)
      : definition.kind === 'wildlife'
        ? this._createWildlife()
        : definition.kind === 'bird'
          ? this._createBird()
          : this._createAstronaut(definition.kind === 'scientist' ? 0xf4a261 : 0x9ec8d4);
    model.position.copy(position);
    model.name = definition.name;
    this.root.add(model);
    this.actors.push({ ...definition, brain, model, baseY: position.y, animTime: 0, detailTimer: 0 });
    this.interactions.push({
      id: definition.id,
      name: definition.name,
      position: brain.position,
      radius: definition.kind === 'bird' ? 4.2 : 2.8,
      prompt: definition.kind === 'wildlife' || definition.kind === 'bird' ? `[E] Observe ${definition.name}` : `[E] Talk to ${definition.name}`,
      action: 'research'
    });
  }

  _createAstronaut(suitColor) {
    const person = new THREE.Group();
    const suit = this._material(suitColor, 0.68, 0.12);
    const dark = this._material(0x283842, 0.45, 0.25);
    const visor = this._material(0x63b7c9, 0.25, 0.5);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.72, 7), suit);
    torso.position.y = 1.08;
    person.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 6), suit);
    head.position.y = 1.68;
    person.add(head);
    const faceplate = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 5), visor);
    faceplate.position.set(0, 1.69, 0.16);
    faceplate.scale.set(1, 0.72, 0.4);
    person.add(faceplate);
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.55, 0.2), dark);
    backpack.position.set(0, 1.1, -0.27);
    person.add(backpack);
    person.userData.limbs = [];
    for (const side of [-1, 1]) {
      const armPivot = new THREE.Group();
      armPivot.position.set(side * 0.35, 1.32, 0);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.54, 6), suit);
      arm.position.y = -0.24;
      armPivot.add(arm);
      person.add(armPivot);
      person.userData.limbs.push(armPivot);
      const legPivot = new THREE.Group();
      legPivot.position.set(side * 0.15, 0.76, 0);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.56, 6), suit);
      leg.position.y = -0.27;
      legPivot.add(leg);
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), dark);
      boot.position.set(0, -0.56, 0.05);
      legPivot.add(boot);
      person.add(legPivot);
      person.userData.limbs.push(legPivot);
    }
    return person;
  }

  _createRover(robot = false) {
    const rover = new THREE.Group();
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.46, 1.9), this._material(robot ? 0xc07d48 : 0xc46f35, 0.42, 0.52));
    chassis.position.y = 0.72;
    rover.add(chassis);
    rover.userData.wheels = [];
    for (const side of [-1, 1]) for (const end of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.16, 8), this._material(0x28353b, 0.88, 0.08));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side * 0.76, 0.38, end * 0.62);
      rover.add(wheel);
      rover.userData.wheels.push(wheel);
    }
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 1.1, 6), this._material(0x9baeb3, 0.5, 0.5));
    mast.position.set(0, 1.35, -0.25);
    rover.add(mast);
    const camera = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.24), this._material(0x39a9b5, 0.28, 0.34));
    camera.position.set(0, 1.9, -0.25);
    rover.add(camera);
    return rover;
  }

  _createWildlife() {
    const animal = new THREE.Group();
    const fur = this._material(MATERIAL_COLORS.wildlife, 0.95, 0);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 7, 5), fur);
    body.position.y = 0.5;
    body.scale.set(1.35, 0.8, 0.82);
    animal.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 7, 5), fur);
    head.position.set(0, 0.66, 0.38);
    animal.add(head);
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.42, 5), fur);
      ear.position.set(side * 0.1, 1.02, 0.4);
      animal.add(ear);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.34, 5), fur);
      leg.position.set(side * 0.18, 0.22, 0.18);
      animal.add(leg);
    }
    return animal;
  }

  _createBird() {
    const bird = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), this._material(MATERIAL_COLORS.bird, 0.8, 0));
    bird.add(body);
    bird.userData.wings = [];
    for (const side of [-1, 1]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.045, 0.18), this._material(0x596d79, 0.8, 0));
      wing.position.x = side * 0.34;
      bird.add(wing);
      bird.userData.wings.push(wing);
    }
    return bird;
  }

  _addStation(definition, origin) {
    const x = origin.x + definition.offset[0];
    const z = origin.z + definition.offset[2];
    const position = new THREE.Vector3(x, this._ground(x, z), z);
    const station = new THREE.Group();
    station.position.copy(position);
    station.name = definition.name;
    const color = definition.type === 'greenhouse' ? 0x53a667 : definition.type === 'instrument' ? 0x54aeb8 : 0x3c8aaf;
    const base = new THREE.Mesh(new THREE.BoxGeometry(definition.type === 'greenhouse' ? 1.5 : 0.8, 0.72, 0.5), this._material(color, 0.55, 0.28));
    base.position.y = 0.55;
    station.add(base);
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.42, 0.06), this._material(0x92e4d7, 0.3, 0.18));
    screen.position.set(0, 1.15, 0.28);
    station.add(screen);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0x55f0c2 }));
    beacon.position.set(0.48, 1.25, -0.05);
    station.add(beacon);
    this.root.add(station);
    const entry = { ...definition, position, station, radius: definition.type === 'greenhouse' ? 3.4 : 2.6 };
    this.interactions.push(entry);
    if (definition.type === 'greenhouse') entry.plants = this.greenhousePlants;
  }

  // ---- Life Engine 3D organism visualization ----

  _organismColor(organism) {
    const role = organism.ecologicalRole || 'producer';
    const t = organism.genome?.traits || {};
    switch (role) {
      case 'producer': return 0x6ab04c;
      case 'herbivore': return 0x7ed6df;
      case 'carnivore': return 0xe74c3c;
      case 'omnivore': return 0xf0932b;
      case 'decomposer': return 0x7d6608;
      default: return 0x48c9b0;
    }
  }

  _createOrganismMesh(organism) {
    const group = new THREE.Group();
    const color = this._organismColor(organism);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });
    const size = 0.18 + (organism.genome?.traits?.size ?? 0.4) * 0.4;
    const isMulti = organism.type === 'multicellular' || organism.multicellularId !== null;

    if (isMulti) {
      const core = new THREE.Mesh(new THREE.SphereGeometry(size * 1.4, 8, 6), material);
      core.position.y = size * 0.7;
      group.add(core);
      for (let i = 0; i < 3; i++) {
        const cell = new THREE.Mesh(new THREE.SphereGeometry(size * 0.75, 6, 5), material);
        const angle = (i / 3) * Math.PI * 2;
        cell.position.set(Math.cos(angle) * size * 0.9, size * 0.3, Math.sin(angle) * size * 0.9);
        group.add(cell);
      }
    } else if (organism.ecologicalRole === 'producer') {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, size * 0.9, 5), this._material(0x4b8c45));
      stem.position.y = size * 0.45;
      group.add(stem);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(size * 0.5, 6, 5), material);
      cap.position.y = size * 0.95;
      group.add(cap);
    } else {
      const body = new THREE.Mesh(new THREE.SphereGeometry(size, 7, 5), material);
      body.position.y = size * 0.6;
      group.add(body);
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, size * 0.7, 4), material);
        leg.position.set(side * size * 0.45, size * 0.25, 0);
        leg.rotation.x = -Math.PI / 4;
        group.add(leg);
      }
    }

    group.scale.setScalar(this.organismDisplayScale);
    group.userData.organismId = organism.id;
    group.userData.energy = organism.energy;
    group.userData.maxEnergy = organism.maxEnergy;
    group.userData.role = organism.ecologicalRole;
    return group;
  }

  _worldPositionForOrganism(organism) {
    const origin = this._getOrigin(this.planetId);
    const gx = origin.x + organism.position.x;
    const gz = origin.z + organism.position.z;
    const gy = this._ground(gx, gz) + (organism.position.y || 0);
    return { x: gx, y: gy, z: gz };
  }

  _syncOrganisms() {
    if (!this.academy) return;
    const engine = this.academy.lifeEngine;
    if (!engine) return;

    const aliveIds = new Set();
    for (const organism of engine.population.organisms) {
      if (!organism.alive) continue;
      aliveIds.add(organism.id);
      let mesh = this.organismMeshes.get(organism.id);
      if (!mesh) {
        mesh = this._createOrganismMesh(organism);
        this.root.add(mesh);
        this.organismMeshes.set(organism.id, mesh);
      }
      const pos = this._worldPositionForOrganism(organism);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.userData.energy = organism.energy;
      mesh.userData.maxEnergy = organism.maxEnergy;
      mesh.visible = true;
    }

    for (const [id, mesh] of this.organismMeshes) {
      if (!aliveIds.has(id)) {
        this.root.remove(mesh);
        mesh.geometry?.dispose?.();
        if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose?.());
        else mesh.material?.dispose?.();
        mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose?.();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose?.());
            else child.material.dispose?.();
          }
        });
        this.organismMeshes.delete(id);
      }
    }
  }

  _disposeWorld() {
    if (!this.root) return;
    this.scene.remove(this.root);
    this.root.traverse(object => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
      else object.material?.dispose?.();
    });
    this.root = null;
    this.actors = [];
    this.interactions = [];
    this.greenhousePlants = [];
    this.windTrees = [];
    this.weatherParticles = null;
    this.waterMesh = null;
    for (const [, mesh] of this.organismMeshes) {
      this.root.remove(mesh);
      mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose?.());
          else child.material.dispose?.();
        }
      });
    }
    this.organismMeshes.clear();
  }

  _getInteractionEntry(playerPosition) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const entry of this.interactions) {
      const distance = Math.hypot(playerPosition.x - entry.position.x, playerPosition.z - entry.position.z);
      if (distance <= entry.radius && distance < nearestDistance) {
        nearest = entry;
        nearestDistance = distance;
      }
    }
    return nearest;
  }

  getInteractionPrompt(playerPosition) {
    const entry = this._getInteractionEntry(playerPosition);
    return entry ? {
      text: entry.prompt,
      text_mn: entry.role || entry.name,
      distance: Math.hypot(playerPosition.x - entry.position.x, playerPosition.z - entry.position.z),
      action: () => this.interact(entry.id)
    } : null;
  }

  // ---- Organism scanning ----

  scanOrganismsNear(position, radius = 8) {
    const results = [];
    for (const [id, mesh] of this.organismMeshes) {
      const distance = Math.hypot(position.x - mesh.position.x, position.z - mesh.position.z);
      if (distance <= radius) {
        const organism = this._findOrganismById(id);
        if (organism && organism.alive) {
          results.push({
            organism,
            mesh,
            distance,
            traits: organism.genome?.traits || {},
            energy: organism.energy,
            maxEnergy: organism.maxEnergy,
            role: organism.ecologicalRole,
            type: organism.type,
            age: organism.age,
            biomass: organism.biomass,
            speciesId: organism.speciesId,
            behavior: organism.behavior
          });
        }
      }
    }
    results.sort((a, b) => a.distance - b.distance);
    return results;
  }

  _findOrganismById(id) {
    if (!this.academy || !this.academy.lifeEngine) return null;
    return this.academy.lifeEngine.organisms.find(o => o.id === id) || null;
  }

  interact(id) {
    const actor = this.actors.find(candidate => candidate.id === id);
    if (actor) {
      const completed = this.academy.recordResearchAction(actor.action);
      return { success: true, msg: completed ? actor.dialogue : `${actor.name}: Research assignment remains available in Mission Control.` };
    }
    const station = this.interactions.find(candidate => candidate.id === id);
    if (!station) return { success: false, msg: 'Research target is no longer available.' };

    if (station.action === 'greenhouse') {
      const result = this.academy.advanceGreenhouse(station.id);
      station.plants?.forEach(plant => plant.scale.setScalar(0.52 + result.stage * 0.18));
      const state = this.academy.getState();
      if (state.greenhouseStages[station.id] >= 2) this.academy.recordResearchAction(`${station.id}:harvest`);
      return { success: true, msg: result.advanced ? `Greenhouse growth advanced to stage ${result.stage}/3. Water and oxygen telemetry updated.` : 'Greenhouse crop is ready for harvest; growth data has been logged.' };
    }
    if (station.action === 'resources') {
      const resources = this.academy.getOutpostResources(this.planetId);
      if (resources.energy < 55 || resources.water < 45 || resources.oxygen < 55) {
        this.academy.serviceOutpost(this.planetId);
      }
      this.academy.recordResearchAction(station.id === 'mars-life-support' ? 'mars-life-support-check' : 'moon-life-support-check');
      const updated = this.academy.getOutpostResources(this.planetId);
      return { success: true, msg: `Outpost reserves — O₂ ${Math.round(updated.oxygen)}%, water ${Math.round(updated.water)}%, energy ${Math.round(updated.energy)}%.` };
    }
    if (station.action === 'hypothetical') {
      this.academy.recordResearchAction('hypothetical-life-simulation');
      return { success: true, msg: 'Fictional educational simulation only: hypothetical biosignatures are not evidence of confirmed extraterrestrial life.' };
    }
    if (station.action === 'airlock') {
      if (this.airlockState === 'PRESSURIZING' || this.airlockState === 'DEPRESSURIZING') {
        return { success: true, msg: `Lunar airlock cycle in progress: ${this.airlockState.toLowerCase()}.` };
      }
      this.airlockState = this.airlockState === 'PRESSURIZED' ? 'DEPRESSURIZING' : 'PRESSURIZING';
      this.airlockCycleTimer = 0;
      this.academy.setOutpostAirlockState('moon', this.airlockState);
      this.academy.recordResearchAction('moon-airlock-cycle');
      return { success: true, msg: `Lunar airlock ${this.airlockState.toLowerCase()}. Cycle will complete in four seconds.` };
    }
    const completed = this.academy.recordResearchAction(station.action);
    if (station.id === 'earth-water-sample') return { success: true, msg: 'Surface-water sample logged with a clean control and contamination notes.' };
    if (station.id === 'earth-weather-station') return { success: true, msg: `Weather logged: ${this.weather}, wind ${this.windStrength.toFixed(1)} m/s.` };
    if (station.id === 'moon-polar-instrument') return { success: true, msg: 'Lunar polar instrument recorded a volatile-prospecting traverse.' };
    if (station.id === 'mercury-thermal-probe') return { success: true, msg: 'Mercury robotic probe data logged: thermal cycling and regolith response.' };
    if (station.id === 'venus-atmosphere-probe') return { success: true, msg: 'Venus robotic probe data logged: high-pressure atmospheric chemistry and thermal load.' };
    return { success: true, msg: completed ? `Research data recorded at ${station.name}.` : `${station.name} readings are already in the mission log.` };
  }

  update(delta, playerPosition, sky = null) {
    if (!this.root || !this.root.visible) return;
    this.simulationTime += delta;
    for (const actor of this.actors) {
      const distance = Math.hypot(playerPosition.x - actor.brain.position.x, playerPosition.z - actor.brain.position.z);
      actor.model.visible = distance < 140;
      if (!actor.model.visible) continue;
      actor.detailTimer += delta;
      const tickRate = distance < 45 ? 0.25 : 1.5;
      if (actor.detailTimer < tickRate) continue;
      const actorDelta = Math.min(actor.detailTimer, tickRate * 2);
      actor.detailTimer = 0;
      const localHour = Number.isFinite(sky?.timeOfDay) ? sky.timeOfDay : 12;
      const result = actor.brain.update(actorDelta, playerPosition, distance < 45, localHour >= 6 && localHour < 20);
      actor.model.position.x = actor.brain.position.x;
      actor.model.position.z = actor.brain.position.z;
      actor.model.position.y = this._ground(actor.model.position.x, actor.model.position.z) + (actor.kind === 'bird' ? 6.5 + Math.sin(this.simulationTime * 2 + actor.id.length) * 1.2 : 0);
      if (result.state === 'walking' || result.state === 'fleeing' || result.state === 'avoiding') {
        const next = actor.brain.waypoints[actor.brain.waypointIndex];
        actor.model.rotation.y = Math.atan2(next.x - actor.model.position.x, next.z - actor.model.position.z);
      } else if (result.distance > 0.01 && result.distance < actor.brain.reactRadius) {
        actor.model.rotation.y = Math.atan2(playerPosition.x - actor.model.position.x, playerPosition.z - actor.model.position.z);
      }
      actor.animTime += actorDelta;
      for (let index = 0; index < (actor.model.userData.limbs || []).length; index++) {
        actor.model.userData.limbs[index].rotation.x = result.state === 'walking' || result.state === 'fleeing' || result.state === 'avoiding'
          ? Math.sin(actor.animTime * 7 + index * Math.PI) * 0.34
          : 0;
      }
      for (const wheel of actor.model.userData.wheels || []) wheel.rotation.x += actorDelta * actor.brain.speed;
      for (const wing of actor.model.userData.wings || []) wing.rotation.z = Math.sin(this.simulationTime * 12) * 0.3;
    }

    this._syncOrganisms();

    if (this.planetId === 'earth') {
      this.weatherTimer += delta;
      if (this.weatherTimer >= 45) {
        this.weatherTimer = 0;
        this.weather = this.weather === 'clear' ? 'breezy' : this.weather === 'breezy' ? 'light rain' : 'clear';
      }
      this.windStrength = 1.2 + (Math.sin(this.simulationTime * 0.035) + 1) * 2.1;
      for (let index = 0; index < this.windTrees.length; index++) {
        const canopy = this.windTrees[index].userData.canopy;
        if (canopy) canopy.rotation.z = Math.sin(this.simulationTime * 0.6 + index) * this.windStrength * 0.012;
      }
      if (this.weatherParticles) {
        this.weatherParticles.visible = this.weather === 'light rain';
        if (this.weatherParticles.visible) {
          const positions = this.weatherParticles.geometry.attributes.position;
          for (let index = 0; index < positions.count; index++) {
            let y = positions.getY(index) - delta * 7;
            if (y < 0) {
              y = 8 + Math.sin(this.simulationTime + index) * 4;
              positions.setX(index, positions.getX(index) + Math.cos(this.simulationTime * 0.3) * delta);
            }
            positions.setY(index, y);
          }
          positions.needsUpdate = true;
        }
      }
      if (this.waterMesh) this.waterMesh.position.y += (Math.sin(this.simulationTime * 1.2) * 0.018 - (this.waterMesh.position.y - this._ground(this.waterMesh.position.x, this.waterMesh.position.z) - 0.06)) * Math.min(1, delta * 2);
    } else if (this.planetId === 'mars') {
      this.weatherTimer += delta;
      if (this.weatherTimer >= 60) { this.weatherTimer = 0; this.weather = 'regional dust gust'; }
      this.windStrength = 0.6 + Math.abs(Math.sin(this.simulationTime * 0.025)) * 4;
    }

    if (this.planetId === 'moon' && (this.airlockState === 'PRESSURIZING' || this.airlockState === 'DEPRESSURIZING')) {
      this.airlockCycleTimer += delta;
      if (this.airlockCycleTimer >= 4) {
        this.airlockState = this.airlockState === 'PRESSURIZING' ? 'PRESSURIZED' : 'SEALED';
        this.airlockCycleTimer = 0;
        this.academy.setOutpostAirlockState('moon', this.airlockState);
      }
    }

    if (this.planetId === 'mars' || this.planetId === 'moon') {
      this.saveTimer += delta;
      if (this.saveTimer >= 60) {
        this.saveTimer = 0;
        const stage = this.academy.getState().greenhouseStages['mars-greenhouse'] || 0;
        this.academy.simulateOutpostMinute(this.planetId, this.planetId === 'mars' ? stage : 0);
      }
    }
    if (sky && this.planetId === 'earth') this.lightPhase = sky.timeOfDay;
  }
}