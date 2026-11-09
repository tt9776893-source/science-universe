import { window } from '../../ctx.js';
// SCIENCE UNIVERSE — FRONTIER
// Step 14: Living 3D Civilizations & World Visualization
//
// Renders CivilizationEngine simulation state as visible 3D objects in the game world.
// Settlements, social groups, infrastructure, and space facilities are driven solely
// by actual simulation data. No GLB model dependencies — procedural geometry only,
// consistent with LivingWorldSystem and safe for mobile (DPR capped at 2).

import * as THREE from 'three';
import { getPlanetWorldConfig } from './PlanetEnvironment.js';

const SIM_TO_WORLD_SCALE = 1.2; // simulation units -> world units
const CIV_ZONE_OFFSET_X = 60;   // civilization zone offset from landing site
const CIV_ZONE_OFFSET_Z = 60;
const RENDER_DISTANCE = 120;    // cull beyond this distance from player
const MAX_GROUP_FIGURES = 12;   // cap NPC figures per group for mobile

const PLANET_SURFACE_BODIES = new Set(['mars', 'moon', 'earth', 'mercury', 'venus']);

const MATERIAL_COLORS = Object.freeze({
  settlement: 0x8fa8b8,
  settlementGlow: 0x4a7a9a,
  habitat: 0x9fb6c8,
  lab: 0x5aa0b8,
  greenhouse: 0x6aad8a,
  solar: 0x5ca0b3,
  nuclear: 0xc07d48,
  energyStorage: 0x7a8ba0,
  oxygenGen: 0x4a9b8a,
  waterPurifier: 0x4a8ab0,
  airFilter: 0x6a8a9a,
  thermalControl: 0x8a7a6a,
  wasteRecycler: 0x6a5a4a,
  shieldDome: 0x55f0c2,
  controlCenter: 0x3c8aaf,
  road: 0x555555,
  landingPad: 0x444444,
  rocket: 0xd84a3a,
  antenna: 0x768692,
  npcAstronaut: 0x9ec8d4,
  npcScientist: 0xf4a261,
  groupHalo: 0x00f0ff
});

function material(color, roughness = 0.7, metalness = 0.12, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, ...opts });
}

function emissiveMaterial(color, intensity = 1.0) {
  return new THREE.MeshBasicMaterial({ color });
}

function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

function cylinder(rTop, rBot, h, segs, mat) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs || 8), mat);
}

function sphere(r, segs, mat) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, segs || 8, segs || 8), mat);
}

// ------------------------------------------------------------
// CivilizationWorldSystem
// ------------------------------------------------------------
export class CivilizationWorldSystem {
  constructor(scene, terrain, academy) {
    this.scene = scene;
    this.terrain = terrain;
    this.academy = academy;
    this.planetId = null;
    this.root = null;
    this.enabled = true;
    this.civZoneOrigin = new THREE.Vector3(0, 0, 0);
    this.settlementMeshes = new Map(); // settlementId -> THREE.Group
    this.groupMeshes = new Map(); // groupId -> THREE.Group
    this.infraMeshes = new Map(); // infraKey -> THREE.Mesh
    this.lastStateHash = null;
    this.saveTimer = 0;
  }

  // ---- lifecycle ----

  setPlanet(planetId) {
    if (this.planetId === planetId && this.root) {
      this.root.visible = this.enabled;
      return true;
    }
    this._dispose();
    this.planetId = planetId;
    this.root = new THREE.Group();
    this.root.name = `civilization-world-${planetId}`;
    this.scene.add(this.root);
    this.settlementMeshes.clear();
    this.groupMeshes.clear();
    this.infraMeshes.clear();

    const isSurface = PLANET_SURFACE_BODIES.has(planetId);
    const cfg = this._planetConfig();
    const landing = cfg?.landingSite || { x: 0, z: 0 };
    const baseY = this.terrain ? this.terrain.getBaseHeight(landing.x, landing.z) : 0;

    // Civilization zone sits offset from the landing site, on the surface.
    this.civZoneOrigin.set(
      landing.x + (isSurface ? CIV_ZONE_OFFSET_X : 0),
      baseY,
      landing.z + (isSurface ? CIV_ZONE_OFFSET_Z : 0)
    );

    // For gas giants and sun, place civilization in orbit (elevated above base).
    if (!isSurface) {
      this.civZoneOrigin.y = baseY + 40;
    }

    return true;
  }

  setVisible(visible) {
    this.enabled = Boolean(visible);
    if (this.root) this.root.visible = this.enabled;
  }

  _planetConfig() {
    return getPlanetWorldConfig(this.planetId) || null;
  }

  dispose() {
    this._dispose();
  }

  _dispose() {
    if (!this.root) return;
    this.scene.remove(this.root);
    this.root.traverse(object => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
      else object.material?.dispose?.();
    });
    this.root = null;
    this.settlementMeshes.clear();
    this.groupMeshes.clear();
    this.infraMeshes.clear();
  }

  // ---- main step ----

  step(delta, playerPosition) {
    if (!this.enabled || !this.root || !this.academy) return;

    const civ = this.academy.getOrCreateCivilizationEngine();
    if (!civ || !civ.running) return;

    const state = civ.getState();
    if (!state) return;

    const hash = JSON.stringify({
      settlements: state.settlements,
      groups: state.groups,
      technologies: state.technologies,
      spaceMilestones: state.spaceMilestones
    });
    if (hash === this.lastStateHash) return;
    this.lastStateHash = hash;

    const isSurface = PLANET_SURFACE_BODIES.has(this.planetId);
    const playerPos = playerPosition || new THREE.Vector3(0, 0, 0);

    // Build/rebuild settlement clusters.
    const activeSettlements = (state.settlements || []).filter(s => !s.isAbandoned);
    const seenSettlementIds = new Set();

    for (const s of activeSettlements) {
      seenSettlementIds.add(s.id);
      const worldPos = this._simToWorld(s.location);
      const dist = Math.hypot(worldPos.x - playerPos.x, worldPos.z - playerPos.z);
      if (dist > RENDER_DISTANCE) continue;
      this._renderSettlement(s, worldPos);
    }

    // Remove settlements that no longer exist.
    for (const [sid] of this.settlementMeshes) {
      if (!seenSettlementIds.has(sid)) {
        this._removeSettlement(sid);
      }
    }

    // Render group NPC figures at settlement locations (groups map to settlements).
    const activeGroups = (state.groups || []).filter(g => !g.isExtinct && (g.memberIds?.length || g.memberIds?.size || 0) > 0);
    const seenGroupIds = new Set();

    for (const g of activeGroups) {
      seenGroupIds.add(g.id);
      const settlement = this._findSettlementByGroup(state, g.id);
      const loc = settlement ? settlement.location : g.location;
      const worldPos = this._simToWorld(loc);
      const dist = Math.hypot(worldPos.x - playerPos.x, worldPos.z - playerPos.z);
      if (dist > RENDER_DISTANCE) continue;
      this._renderGroupFigures(g, settlement, worldPos);
    }

    for (const [gid] of this.groupMeshes) {
      if (!seenGroupIds.has(gid)) {
        this._removeGroup(gid);
      }
    }

    // Render infrastructure per settlement.
    for (const s of activeSettlements) {
      const worldPos = this._simToWorld(s.location);
      const dist = Math.hypot(worldPos.x - playerPos.x, worldPos.z - playerPos.z);
      if (dist > RENDER_DISTANCE) continue;
      this._renderInfrastructure(s, worldPos);
    }

    // Space facilities (spaceports, etc.) when space milestones reached.
    if (state.spaceMilestones && state.spaceMilestones.length > 0) {
      const milestoneTypes = new Set(state.spaceMilestones.map(m => m.type));
      for (const s of activeSettlements) {
        if (s.spaceportLevel > 0) {
          const worldPos = this._simToWorld(s.location);
          const dist = Math.hypot(worldPos.x - playerPos.x, worldPos.z - playerPos.z);
          if (dist > RENDER_DISTANCE) continue;
          this._renderSpaceport(s, worldPos, milestoneTypes);
        }
      }
    }

    // Distance culling: hide meshes beyond render distance.
    this._cullByDistance(playerPos);
  }

  // ---- coordinate mapping ----

  _simToWorld(simLoc) {
    const x = this.civZoneOrigin.x + (simLoc.x || 0) * SIM_TO_WORLD_SCALE;
    const z = this.civZoneOrigin.z + (simLoc.z || 0) * SIM_TO_WORLD_SCALE;
    let y = this.civZoneOrigin.y;
    if (this.terrain) {
      const ground = this.terrain.getBaseHeight(x, z);
      if (Number.isFinite(ground)) y = ground;
    }
    return new THREE.Vector3(x, y, z);
  }

  _findSettlementByGroup(state, groupId) {
    for (const s of state.settlements || []) {
      if (s.founderGroupId === groupId) return s;
    }
    return null;
  }

  // ---- settlement rendering ----

  _renderSettlement(s, worldPos) {
    let group = this.settlementMeshes.get(s.id);
    if (!group) {
      group = new THREE.Group();
      group.name = `settlement-${s.id}`;
      group.userData = { settlementId: s.id };
      this.root.add(group);
      this.settlementMeshes.set(s.id, group);
    } else {
      // Clear existing children for rebuild.
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    }

    group.position.copy(worldPos);
    group.position.y = worldPos.y;

    const techLevel = s.techLevel || 0;
    const infrastructure = s.infrastructure || 0;
    const pop = s.population || 0;
    const isAbandoned = s.isAbandoned;

    // Base platform / foundation.
    const platformSize = Math.min(14, 6 + infrastructure * 0.8);
    const platform = box(platformSize, 0.4, platformSize, material(
      isAbandoned ? 0x444444 : MATERIAL_COLORS.settlement,
      0.8, 0.1
    ));
    platform.position.y = 0.2;
    platform.receiveShadow = true;
    group.add(platform);

    // Central habitat module (always present).
    const habSize = Math.min(6, 3 + techLevel * 0.3);
    const hab = box(habSize, habSize * 0.5, habSize, material(
      isAbandoned ? 0x333333 : MATERIAL_COLORS.habitat,
      0.6, 0.2
    ));
    hab.position.set(0, habSize * 0.5 + 0.2, 0);
    hab.castShadow = true;
    hab.receiveShadow = true;
    group.add(hab);

    // Habitat dome / window band.
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(habSize * 0.45, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      material(isAbandoned ? 0x222222 : 0x68b8c5, 0.3, 0.05, { transparent: true, opacity: 0.35 })
    );
    dome.position.set(0, habSize * 0.5 + 0.2 + habSize * 0.45, 0);
    group.add(dome);

    // Additional habitat wings based on infrastructure level.
    if (infrastructure >= 3) {
      const wing = box(habSize * 0.7, habSize * 0.4, habSize * 0.7, material(
        isAbandoned ? 0x2a2a2a : MATERIAL_COLORS.habitat,
        0.6, 0.2
      ));
      wing.position.set(habSize * 0.9, habSize * 0.2 + 0.2, 0);
      wing.castShadow = true;
      wing.receiveShadow = true;
      group.add(wing);

      const wing2 = box(habSize * 0.7, habSize * 0.4, habSize * 0.7, material(
        isAbandoned ? 0x2a2a2a : MATERIAL_COLORS.habitat,
        0.6, 0.2
      ));
      wing2.position.set(-habSize * 0.9, habSize * 0.2 + 0.2, 0);
      wing2.castShadow = true;
      wing2.receiveShadow = true;
      group.add(wing2);
    }

    // Corridor connectors between wings.
    if (infrastructure >= 5) {
      const corridor = box(1.2, 0.6, habSize * 1.8, material(
        isAbandoned ? 0x222222 : MATERIAL_COLORS.settlement,
        0.7, 0.15
      ));
      corridor.position.set(0, habSize * 0.3 + 0.2, 0);
      group.add(corridor);
    }

    // Lights on settlement (glow when active).
    if (!isAbandoned && techLevel > 0) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 6, 6),
        emissiveMaterial(0x00f0ff, 1.5)
      );
      light.position.set(0, habSize * 0.5 + 0.2 + habSize * 0.9, 0);
      group.add(light);

      const light2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 6, 6),
        emissiveMaterial(0xffaa00, 1.2)
      );
      light2.position.set(habSize * 0.7, habSize * 0.3 + 0.2, habSize * 0.7);
      group.add(light2);
    }

    // Population indicator — small figures around the settlement.
    const popFigures = Math.min(Math.max(pop, 0), 8);
    for (let i = 0; i < popFigures; i++) {
      const angle = (i / Math.max(popFigures, 1)) * Math.PI * 2;
      const radius = platformSize * 0.6;
      const fig = this._createSettlementFigure(isAbandoned);
      fig.position.set(
        Math.cos(angle) * radius,
        0.5,
        Math.sin(angle) * radius
      );
      group.add(fig);
    }

    // Abandoned marker.
    if (isAbandoned) {
      const marker = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 2, 0.4),
        emissiveMaterial(0xff3333, 1.0)
      );
      marker.position.set(0, 1.2, 0);
      group.add(marker);
    }

    group.visible = true;
  }

  _createSettlementFigure(isAbandoned) {
    const fig = new THREE.Group();
    const suitColor = isAbandoned ? 0x444444 : MATERIAL_COLORS.npcAstronaut;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.4, 6), material(suitColor, 0.6, 0.1));
    body.position.y = 0.3;
    fig.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), material(suitColor, 0.6, 0.1));
    head.position.y = 0.58;
    fig.add(head);
    fig.position.y = 0.2;
    return fig;
  }

  // ---- group figures ----

  _renderGroupFigures(g, settlement, worldPos) {
    let group = this.groupMeshes.get(g.id);
    if (!group) {
      group = new THREE.Group();
      group.name = `group-${g.id}`;
      group.userData = { groupId: g.id };
      this.root.add(group);
      this.groupMeshes.set(g.id, group);
    } else {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    }

    group.position.copy(worldPos);

    const memberCount = Math.min(g.memberIds?.length || g.memberIds?.size || 0, MAX_GROUP_FIGURES);
    const stability = g.stability || 0.5;
    const conflict = g.conflictLevel || 0;
    const techLevel = g.techLevel || 0;

    // Group halo showing stability.
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 1.2, 12),
      material(
        stability > 0.6 ? 0x00ff88 : conflict > 0.6 ? 0xff4444 : 0xffff00,
        0, 0, { transparent: true, opacity: 0.25, side: THREE.DoubleSide }
      )
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.05;
    group.add(halo);

    // Figures arranged in a circle.
    const radius = 0.8;
    for (let i = 0; i < memberCount; i++) {
      const angle = (i / Math.max(memberCount, 1)) * Math.PI * 2;
      const fig = this._createGroupFigure(g, i, memberCount, techLevel);
      fig.position.set(
        Math.cos(angle) * radius,
        0.25,
        Math.sin(angle) * radius
      );
      group.add(fig);
    }

    // Leader marker (slightly taller figure).
    if (memberCount > 0) {
      const leader = this._createGroupFigure(g, 0, memberCount, techLevel, true);
      leader.position.set(0, 0.25, radius * 1.1);
      leader.scale.setScalar(1.15);
      group.add(leader);
    }

    group.visible = true;
  }

  _createGroupFigure(g, index, total, techLevel, isLeader = false) {
    const fig = new THREE.Group();
    const suitColor = index % 2 === 0 ? MATERIAL_COLORS.npcAstronaut : MATERIAL_COLORS.npcScientist;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.35, 6), material(suitColor, 0.6, 0.1));
    body.position.y = 0.25;
    fig.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), material(suitColor, 0.6, 0.1));
    head.position.y = 0.5;
    fig.add(head);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), material(0x63b7c9, 0.3, 0.5));
    visor.position.set(0, 0.51, 0.06);
    visor.scale.set(1, 0.7, 0.4);
    fig.add(visor);
    fig.position.y = 0.1;
    return fig;
  }

  // ---- infrastructure rendering ----

  _renderInfrastructure(s, worldPos) {
    const infraKey = `infra-${s.id}`;
    let infraGroup = this.infraMeshes.get(infraKey);
    if (!infraGroup) {
      infraGroup = new THREE.Group();
      infraGroup.name = `infrastructure-${s.id}`;
      this.root.add(infraGroup);
      this.infraMeshes.set(infraKey, infraGroup);
    } else {
      while (infraGroup.children.length > 0) {
        const child = infraGroup.children[0];
        infraGroup.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    }

    infraGroup.position.copy(worldPos);
    const techLevel = s.techLevel || 0;

    // Energy infrastructure — solar arrays.
    const energyLevel = s.energyInfrastructure || 0;
    if (energyLevel > 0) {
      const solarCount = Math.min(Math.ceil(energyLevel / 2), 4);
      for (let i = 0; i < solarCount; i++) {
        const solar = this._createSolarArray(
          (i - solarCount / 2) * 3.5 - 1.75,
          0,
          MATERIAL_COLORS.solar
        );
        solar.position.y = 0.6;
        infraGroup.add(solar);
      }
    }

    // Scientific facilities — lab structures.
    const scienceLevel = s.scientificFacilities || 0;
    if (scienceLevel > 0) {
      const labCount = Math.min(Math.ceil(scienceLevel / 2), 3);
      for (let i = 0; i < labCount; i++) {
        const lab = this._createLabModule(
          (i - labCount / 2) * 2.5 - 1.25,
          4,
          MATERIAL_COLORS.lab
        );
        lab.position.y = 0.7;
        infraGroup.add(lab);
      }
    }

    // Communication systems — antenna dishes.
    const commLevel = s.communicationSystems || 0;
    if (commLevel > 0) {
      const dish = this._createAntennaDish(0, 6, MATERIAL_COLORS.antenna);
      dish.position.y = 1.2;
      infraGroup.add(dish);
    }

    // Life support — greenhouse.
    const lifeSupport = s.lifeSupport || 0;
    if (lifeSupport > 0) {
      const greenhouse = this._createGreenhouse(0, -3, MATERIAL_COLORS.greenhouse);
      greenhouse.position.y = 0.5;
      infraGroup.add(greenhouse);
    }

    // Transportation infrastructure — roads / pads.
    const transportLevel = s.transportationInfrastructure || 0;
    if (transportLevel > 0) {
      const padSize = Math.min(8, 4 + transportLevel);
      const pad = new THREE.Mesh(
        new THREE.RingGeometry(padSize * 0.3, padSize, 16),
        material(MATERIAL_COLORS.landingPad, 0.8, 0.1)
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.y = 0.02;
      infraGroup.add(pad);
    }

    infraGroup.visible = true;
  }

  _createSolarArray(x, z, color) {
    const array = new THREE.Group();
    array.position.set(x, 0, z);
    const frame = box(4, 0.1, 2, material(0x8798a0, 0.7, 0.1));
    frame.position.y = 0.5;
    frame.rotation.x = -0.24;
    array.add(frame);
    const cells = box(3.75, 0.05, 1.75, material(color, 0.3, 0.45));
    cells.position.y = 0.53;
    cells.rotation.x = -0.24;
    array.add(cells);
    for (const xo of [-1.4, 1.4]) {
      const leg = cylinder(0.05, 0.07, 1.2, 6, material(0x7d8b91));
      leg.position.set(xo, -0.1, 0);
      array.add(leg);
    }
    return array;
  }

  _createLabModule(x, z, color) {
    const lab = new THREE.Group();
    lab.position.set(x, 0, z);
    const main = box(3, 2.5, 3, material(color, 0.5, 0.2));
    main.position.y = 1.25;
    lab.add(main);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.5, 8), material(0x768692));
    dish.position.set(0, 2.1, 0);
    dish.rotation.x = -0.4;
    lab.add(dish);
    const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), emissiveMaterial(0x00f0ff, 1.0));
    sensor.position.set(0, 2.15, 0.7);
    lab.add(sensor);
    return lab;
  }

  _createAntennaDish(x, z, color) {
    const antenna = new THREE.Group();
    antenna.position.set(x, 0, z);
    const mast = cylinder(0.04, 0.06, 3, 8, material(0x768692));
    mast.position.y = 1.5;
    antenna.add(mast);
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      material(0xd4e1e6)
    );
    dish.position.y = 3;
    dish.rotation.x = Math.PI;
    antenna.add(dish);
    return antenna;
  }

  _createGreenhouse(x, z, color) {
    const gh = new THREE.Group();
    gh.position.set(x, 0, z);
    const frame = box(5, 0.12, 3, material(0x8299a5, 0.68, 0.38));
    frame.position.y = 1.8;
    frame.rotation.x = -0.1;
    gh.add(frame);
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 2.4, 2.6),
      material(0x68b8c5, 0.2, 0.1, { transparent: true, opacity: 0.3 })
    );
    glass.position.y = 1.8;
    gh.add(glass);
    for (let i = 0; i < 6; i++) {
      const plant = this._createPlant(0x55a95b, 0.6);
      plant.position.set(-1.5 + i * 0.6, 0.62, 0);
      gh.add(plant);
    }
    return gh;
  }

  _createPlant(color, scale = 1) {
    const plant = new THREE.Group();
    const stem = cylinder(0.015, 0.025, 0.5, 5, material(0x4b8c45));
    stem.position.y = 0.25;
    plant.add(stem);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), material(color));
    leaves.position.y = 0.52;
    leaves.scale.set(1, 1.2, 0.8);
    plant.add(leaves);
    plant.scale.setScalar(scale);
    return plant;
  }

  // ---- spaceport rendering ----

  _renderSpaceport(s, worldPos, milestoneTypes) {
    const padKey = `spaceport-${s.id}`;
    let padGroup = this.infraMeshes.get(padKey);
    if (!padGroup) {
      padGroup = new THREE.Group();
      padGroup.name = `spaceport-${s.id}`;
      this.root.add(padGroup);
      this.infraMeshes.set(padKey, padGroup);
    } else {
      while (padGroup.children.length > 0) {
        const child = padGroup.children[0];
        padGroup.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    }

    padGroup.position.copy(worldPos);
    const level = s.spaceportLevel || 0;
    const padSize = Math.min(12, 6 + level * 1.2);

    // Launch pad platform.
    const pad = new THREE.Mesh(
      new THREE.RingGeometry(padSize * 0.25, padSize, 24),
      material(MATERIAL_COLORS.landingPad, 0.85, 0.15)
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.1;
    padGroup.add(pad);

    // Pad lights around edge.
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        emissiveMaterial(0xffaa00, 1.5)
      );
      light.position.set(Math.cos(angle) * padSize * 0.85, 0.2, Math.sin(angle) * padSize * 0.85);
      padGroup.add(light);
    }

    // Rocket model when rocketry milestone reached.
    if (milestoneTypes.has('rocket_research') || milestoneTypes.has('satellite')) {
      const rocket = this._createRocket(level);
      rocket.position.set(0, 1.5 + level * 0.3, 0);
      rocket.scale.setScalar(Math.min(1, 0.6 + level * 0.1));
      padGroup.add(rocket);
    }

    // Orbital station indicator when station milestone reached.
    if (milestoneTypes.has('orbital_station')) {
      const station = this._createOrbitalStationMarker();
      station.position.set(padSize * 1.1, 2, 0);
      padGroup.add(station);
    }

    padGroup.visible = true;
  }

  _createRocket(level) {
    const rocket = new THREE.Group();
    const body = cylinder(0.5, 0.5, 4, 12, material(MATERIAL_COLORS.rocket));
    body.position.y = 2;
    rocket.add(body);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 12), material(0xffaa00));
    nose.position.y = 2.6;
    rocket.add(nose);
    for (const side of [-1, 1]) {
      const fin = box(0.15, 1, 0.5, material(0x333333));
      fin.position.set(side * 0.55, 1.4, 0);
      fin.rotation.z = side * 0.2;
      rocket.add(fin);
    }
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1, 8),
      emissiveMaterial(0xff4400, 2.0)
    );
    flame.position.y = -0.5;
    flame.rotation.x = Math.PI;
    rocket.add(flame);
    return rocket;
  }

  _createOrbitalStationMarker() {
    const station = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.1, 16),
      material(0x00f0ff, 0.4, 0.1, { transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    station.add(ring);
    const hub = sphere(0.25, 8, material(0x00f0ff));
    hub.position.y = 0.05;
    station.add(hub);
    return station;
  }

  // ---- removal ----

  _removeSettlement(settlementId) {
    const group = this.settlementMeshes.get(settlementId);
    if (group) {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
      this.root.remove(group);
      group.geometry?.dispose?.();
      group.material?.dispose?.();
      this.settlementMeshes.delete(settlementId);
    }
  }

  _removeGroup(groupId) {
    const group = this.groupMeshes.get(groupId);
    if (group) {
      while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
      this.root.remove(group);
      this.groupMeshes.delete(groupId);
    }
  }

  // ---- culling ----

  _cullByDistance(playerPos) {
    const checkGroup = (map) => {
      for (const [id, obj] of map) {
        if (!obj.position) continue;
        const dist = Math.hypot(
          obj.position.x - playerPos.x,
          obj.position.z - playerPos.z
        );
        obj.visible = dist <= RENDER_DISTANCE;
      }
    };
    checkGroup(this.settlementMeshes);
    checkGroup(this.groupMeshes);
    checkGroup(this.infraMeshes);
  }

  // ---- state for save/load ----

  getState() {
    return {
      enabled: this.enabled,
      planetId: this.planetId,
      civZoneOrigin: { x: this.civZoneOrigin.x, y: this.civZoneOrigin.y, z: this.civZoneOrigin.z },
      settlementCount: this.settlementMeshes.size,
      groupCount: this.groupMeshes.size
    };
  }

  setState(state) {
    if (!state) return;
    this.enabled = state.enabled !== undefined ? state.enabled : this.enabled;
    this.planetId = state.planetId || this.planetId;
    if (state.civZoneOrigin) {
      this.civZoneOrigin.copy(state.civZoneOrigin);
    }
  }
}

export default CivilizationWorldSystem;
