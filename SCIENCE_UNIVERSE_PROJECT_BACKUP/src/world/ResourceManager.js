import * as THREE from 'three';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';

export const RESOURCE_TYPES = [
  {
    id: 'hematite',
    name: 'Hematite Deposit [Fe₂O₃]',
    name_mn: 'Гематит (Төмрийн хүдэр)',
    file: 'SU_Mineral_Hematite.glb',
    baseHp: 100,
    hardness: 5.5,
    minDist: 15,
    yieldItem: 'iron_ore',
    yieldCount: 3,
    color: 0x8b3a2b,
    scale: 1.2
  },
  {
    id: 'quartz',
    name: 'Quartz Crystal Cluster [SiO₂]',
    name_mn: 'Кварцын талст',
    file: 'SU_Mineral_Quartz.glb',
    baseHp: 80,
    hardness: 7.0,
    minDist: 25,
    yieldItem: 'quartz_crystal',
    yieldCount: 2,
    color: 0xe0e8f0,
    scale: 1.0
  },
  {
    id: 'copper_ore',
    name: 'Copper Deposit [CuFeS₂]',
    name_mn: 'Зэсийн хүдэр',
    file: 'SU_Deposit_CopperOre.glb',
    baseHp: 90,
    hardness: 4.0,
    minDist: 30,
    yieldItem: 'copper_ore',
    yieldCount: 2,
    color: 0xc87040,
    scale: 1.1
  },
  {
    id: 'ice_deposit',
    name: 'Subsurface Ice Lens [H₂O]',
    name_mn: 'Мөсөн хуримтлал',
    file: 'SU_Ice_WaterDeposit.glb',
    baseHp: 60,
    hardness: 2.0,
    minDist: 35,
    yieldItem: 'ice_chunk',
    yieldCount: 4,
    color: 0x90d4f5,
    scale: 1.3
  },
  {
    id: 'sulfur',
    name: 'Sulfur Crystal [S₈]',
    name_mn: 'Хүхрийн талст',
    file: 'SU_Mineral_Sulfur.glb',
    baseHp: 50,
    hardness: 2.0,
    minDist: 40,
    yieldItem: 'sulfur',
    yieldCount: 3,
    color: 0xd4c830,
    scale: 0.9
  },
  {
    id: 'basalt',
    name: 'Basalt Formation',
    name_mn: 'Базальт чулуулаг',
    file: 'SU_Rock_Basalt.glb',
    baseHp: 120,
    hardness: 6.0,
    minDist: 12,
    yieldItem: 'basalt',
    yieldCount: 4,
    color: 0x4a4340,
    scale: 1.4
  },
  {
    id: 'granite',
    name: 'Granite Outcrop',
    name_mn: 'Боржин чулуулаг',
    file: 'SU_Rock_Granite.glb',
    baseHp: 140,
    hardness: 6.5,
    minDist: 20,
    yieldItem: 'granite',
    yieldCount: 3,
    color: 0x7c726c,
    scale: 1.3
  },
  {
    id: 'meteorite',
    name: 'Chondrite Meteorite Fragment',
    name_mn: 'Солирын хэлтэрхий',
    file: 'SU_Meteorite_IronNickel.glb',
    baseHp: 150,
    hardness: 8.0,
    minDist: 50,
    yieldItem: 'rare_metals',
    yieldCount: 2,
    color: 0x2e2c33,
    scale: 1.1
  },
  {
    id: 'large_boulder',
    name: 'Martian Basaltic Boulder',
    name_mn: 'Ангарагийн том хад чулуу',
    file: 'SU_Rock_LargeBoulder.glb',
    baseHp: 180,
    hardness: 6.5,
    minDist: 10,
    yieldItem: 'basalt',
    yieldCount: 5,
    color: 0x5a483e,
    scale: 1.5
  },
  {
    id: 'sandstone_rock',
    name: 'Sedimentary Sandstone Rock',
    name_mn: 'Элсэн чулуулаг',
    file: 'SU_Rock_Sandstone.glb',
    baseHp: 80,
    hardness: 4.0,
    minDist: 8,
    yieldItem: 'sedimentary_rock',
    yieldCount: 3,
    color: 0x9b6448,
    scale: 1.1
  },
  {
    id: 'impact_ejecta',
    name: 'Crater Impact Ejecta Stone',
    name_mn: 'Солирын тогооны хэлтэрхий',
    file: 'SU_Geo_ImpactEjecta.glb',
    baseHp: 110,
    hardness: 5.5,
    minDist: 12,
    yieldItem: 'iron_ore',
    yieldCount: 2,
    color: 0x6e3b2e,
    scale: 1.2
  },
  {
    id: 'small_stone',
    name: 'Weathered Field Pebble',
    name_mn: 'Жижиг чулуу',
    file: 'SU_Rock_SmallStone.glb',
    baseHp: 40,
    hardness: 3.5,
    minDist: 4,
    yieldItem: 'regolith',
    yieldCount: 2,
    color: 0x8a5b42,
    scale: 0.8
  },
  {
    id: 'crystal_quartz_cluster',
    name: 'Subterranean Quartz Geode [SiO₂]',
    name_mn: 'Газар доорх ягаан кварцын талст',
    file: 'SU_Crystal_Quartz.glb',
    baseHp: 90,
    hardness: 7.0,
    minDist: 10,
    yieldItem: 'quartz_crystal',
    yieldCount: 3,
    color: 0xc084fc,
    emissiveColor: 0xa855f7,
    scale: 1.15
  },
  {
    id: 'crystal_ice_cluster',
    name: 'Subterranean Permafrost Ice Geode [H₂O]',
    name_mn: 'Мөсөн талстын бөөгнөрөл',
    file: 'SU_Ice_CrystalCluster.glb',
    baseHp: 75,
    hardness: 3.5,
    minDist: 10,
    yieldItem: 'ice_chunk',
    yieldCount: 4,
    color: 0x38bdf8,
    emissiveColor: 0x0284c7,
    scale: 1.2
  },
  {
    id: 'crystal_sulfur_cluster',
    name: 'Subterranean Sulfur Needle Cluster [S₈]',
    name_mn: 'Хүхрийн зүү талст',
    file: 'SU_Crystal_Sulfur.glb',
    baseHp: 70,
    hardness: 3.0,
    minDist: 12,
    yieldItem: 'sulfur',
    yieldCount: 4,
    color: 0xfacc15,
    emissiveColor: 0xeab308,
    scale: 1.1
  },
  {
    id: 'mercury_regolith',
    name: 'Mercurian Regolith Sample',
    name_mn: 'Будын гадаргын хөрс',
    file: null,
    baseHp: 45,
    hardness: 1.8,
    minDist: 8,
    yieldItem: 'mercury_regolith',
    yieldCount: 3,
    color: 0x8c8274,
    scale: 0.8
  },
  {
    id: 'venus_ash',
    name: 'Venusian Volcanic Ash Sample',
    name_mn: 'Сугарын галт уулын үнс',
    file: null,
    baseHp: 55,
    hardness: 1.9,
    minDist: 8,
    yieldItem: 'volcanic_ash',
    yieldCount: 3,
    color: 0xa77546,
    scale: 0.9
  }
];

export class ResourceManager {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;
    this.nodes = new Map(); // id -> node data
    this.depletedNodeIds = new Set();
    this.spawnedChunkKeys = new Set();
    this.planetId = terrain.planetId || 'mars';
    this.activeSlotId = localStorage.getItem('SU_ACTIVE_SAVE_SLOT') || 'slot_1';
    this._loadPlanetDepletion();

    // Hit particle system
    this._initParticles();
  }

  _initParticles() {
    const maxParticles = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(maxParticles * 3);
    const cols = new Float32Array(maxParticles * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    this.sparks = new THREE.Points(geo, mat);
    this.sparkData = [];
    this.scene.add(this.sparks);
  }

  _depletionStorageKey(planetId = this.planetId, slotId = this.activeSlotId) {
    return `SU_RESOURCE_DEPLETION_V1_${slotId}_${planetId}`;
  }

  _savePlanetDepletion() {
    try {
      localStorage.setItem(this._depletionStorageKey(), JSON.stringify(Array.from(this.depletedNodeIds)));
    } catch (error) {
      console.warn('[ResourceManager] Could not save depleted-node state:', error);
    }
  }

  _loadPlanetDepletion() {
    try {
      const saved = JSON.parse(localStorage.getItem(this._depletionStorageKey()) || '[]');
      this.depletedNodeIds = new Set(Array.isArray(saved) ? saved : []);
    } catch (error) {
      this.depletedNodeIds = new Set();
    }
  }

  setPlanet(planetId) {
    if (!planetId || planetId === this.planetId) return false;
    this._savePlanetDepletion();
    for (const node of this.nodes.values()) {
      if (node.mesh) this.scene.remove(node.mesh);
    }
    this.nodes.clear();
    this.spawnedChunkKeys.clear();
    this.sparkData.length = 0;
    this.planetId = planetId;
    this._loadPlanetDepletion();
    return true;
  }

  setSaveSlot(slotId) {
    if (!slotId || slotId === this.activeSlotId) return;
    this._savePlanetDepletion();
    this.activeSlotId = slotId;
    this._loadPlanetDepletion();
    for (const node of this.nodes.values()) {
      if (node.mesh) this.scene.remove(node.mesh);
    }
    this.nodes.clear();
    this.spawnedChunkKeys.clear();
  }

  spawnHitParticles(pos, colorHex, count = 12) {
    const color = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      this.sparkData.push({
        x: pos.x,
        y: pos.y + 0.2,
        z: pos.z,
        vx: (Math.random() - 0.5) * 4.5,
        vy: Math.random() * 3.5 + 1.2,
        vz: (Math.random() - 0.5) * 4.5,
        r: color.r,
        g: color.g,
        b: color.b,
        life: 0.45,
        maxLife: 0.45
      });
      if (this.sparkData.length > 200) this.sparkData.shift();
    }
  }

  updateParticles(delta) {
    const pos = this.sparks.geometry.attributes.position.array;
    const cols = this.sparks.geometry.attributes.color.array;

    for (let i = this.sparkData.length - 1; i >= 0; i--) {
      const p = this.sparkData[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.sparkData.splice(i, 1);
        continue;
      }
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.z += p.vz * delta;
      p.vy -= 9.8 * delta; // Gravity

      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;

      const alpha = p.life / p.maxLife;
      cols[i * 3] = p.r * alpha;
      cols[i * 3 + 1] = p.g * alpha;
      cols[i * 3 + 2] = p.b * alpha;
    }

    // Zero out unused slots
    for (let i = this.sparkData.length; i < 200; i++) {
      pos[i * 3 + 1] = -9999;
    }

    this.sparks.geometry.attributes.position.needsUpdate = true;
    this.sparks.geometry.attributes.color.needsUpdate = true;
  }

  update(delta, playerPos) {
    this._lastPlayerPos = playerPos;
    this.updateParticles(delta);

    // Check surrounding chunks to spawn resources deterministically
    const currentChunkX = Math.round(playerPos.x / this.terrain.chunkSize);
    const currentChunkZ = Math.round(playerPos.z / this.terrain.chunkSize);
    const activeRadius = this.terrain.activeRadius || 2;

    for (let dx = -activeRadius; dx <= activeRadius; dx++) {
      for (let dz = -activeRadius; dz <= activeRadius; dz++) {
        const cx = currentChunkX + dx;
        const cz = currentChunkZ + dz;
        const key = `${cx},${cz}`;
        if (!this.spawnedChunkKeys.has(key)) {
          this.spawnChunkResources(cx, cz);
          this.spawnedChunkKeys.add(key);
        }
      }
    }

    // High-performance distance-based culling, depth occlusion, and shadow LOD (zero per-frame traverse!)
    const isPlayerDeep = (playerPos.y < -6.0);
    const maxActiveDistSq = 36.0 * 36.0;
    const maxShadowDistSq = 16.0 * 16.0;

    for (const node of this.nodes.values()) {
      if (!node.mesh || node.isDepleted) continue;

      if (isPlayerDeep && node.position.y > -3.0) {
        node.mesh.visible = false;
        continue;
      }

      const distSq = node.position.distanceToSquared(playerPos);
      if (distSq > maxActiveDistSq) {
        node.mesh.visible = false;
      } else {
        node.mesh.visible = true;
        if (node.primaryMesh) {
          node.primaryMesh.castShadow = (distSq < maxShadowDistSq);
        }
      }
    }
  }

  spawnChunkResources(cx, cz) {
    const size = this.terrain.chunkSize;
    const startX = cx * size;
    const startZ = cz * size;

    // Deterministic pseudo-random based on chunk coordinates
    const seed = Math.sin(cx * 12.9898 + cz * 78.233) * 43758.5453;
    const rng = (offset) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Spawn 3 to 5 natural rocks, boulders, and resource formations per chunk for balanced density & performance
    const availableTypes = this.planetId === 'moon'
      ? RESOURCE_TYPES.filter((type) => ['basalt', 'meteorite', 'impact_ejecta', 'small_stone', 'ice_deposit'].includes(type.id))
      : this.planetId === 'earth'
        ? RESOURCE_TYPES.filter((type) => ['quartz', 'copper_ore', 'granite', 'sandstone_rock', 'small_stone'].includes(type.id))
        : this.planetId === 'mercury'
          ? RESOURCE_TYPES.filter((type) => ['mercury_regolith', 'basalt', 'meteorite', 'impact_ejecta', 'small_stone'].includes(type.id))
          : this.planetId === 'venus'
            ? RESOURCE_TYPES.filter((type) => ['venus_ash', 'basalt', 'sulfur', 'large_boulder', 'small_stone'].includes(type.id))
      : RESOURCE_TYPES;
    const count = 3 + Math.floor(rng(1) * 3);

    for (let i = 0; i < count; i++) {
      const localX = (rng(i * 4 + 2) - 0.5) * (size * 0.85);
      const localZ = (rng(i * 4 + 3) - 0.5) * (size * 0.85);
      const worldX = startX + localX;
      const worldZ = startZ + localZ;

      const typeIndex = Math.floor(rng(i * 7 + 5) * availableTypes.length);
      const resType = availableTypes[typeIndex];
      const nodeId = `res_${cx}_${cz}_${i}`;

      if (this.depletedNodeIds.has(nodeId)) continue;
      if (this.nodes.has(nodeId)) continue;

      const normal = this.terrain.getNormalAt(worldX, worldZ);
      // Skip spawning on near-vertical cliffs to avoid unnatural floating overhangs
      if (normal.y < 0.65) continue;

      const worldY = this.terrain.getWalkableFloor(worldX, this.terrain.getHeightAt(worldX, worldZ), worldZ);

      // Try to load cloned GLB model
      let mesh = assetRegistry.getClonedModel(resType.file);
      if (!mesh) {
        // Fallback procedural geometry if GLB still streaming
        const geo = new THREE.DodecahedronGeometry(1.2 * resType.scale, 1);
        const mat = new THREE.MeshStandardMaterial({
          color: resType.color,
          roughness: 0.8,
          metalness: 0.2
        });
        mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = false;
        mesh.receiveShadow = true;
      }

      mesh.scale.setScalar(resType.scale * (0.85 + rng(i + 10) * 0.3));
      mesh.updateMatrixWorld(true);
      const bbox = new THREE.Box3().setFromObject(mesh);
      const bottomY = bbox.min.y;
      // Embed slightly (10-15cm) so rocks sit firmly on the Martian soil
      const yOffset = (bottomY < 0 ? -bottomY : 0.0) - 0.12;

      mesh.position.set(worldX, worldY + yOffset, worldZ);

      // Natural slope alignment while preserving deterministic yaw
      const yaw = rng(i + 20) * Math.PI * 2;
      const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      const tangent = new THREE.Vector3().crossVectors(normal, forward).cross(normal).normalize();
      const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      const rotMatrix = new THREE.Matrix4().makeBasis(right, normal, tangent);
      mesh.quaternion.setFromRotationMatrix(rotMatrix);

      // Emissive crystal illumination for subterranean & rare crystal geodes (PBR emissive glow without extra PointLights)
      let primaryMesh = null;
      mesh.traverse(child => {
        if (child.isMesh) {
          if (!primaryMesh) primaryMesh = child;
          child.castShadow = false;
          if (resType.emissiveColor && child.material) {
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(resType.emissiveColor);
            child.material.emissiveIntensity = 1.45;
          }
        }
      });

      this.scene.add(mesh);

      const nodeData = {
        id: nodeId,
        type: resType,
        mesh: mesh,
        primaryMesh: primaryMesh,
        maxHp: resType.baseHp,
        currentHp: resType.baseHp,
        position: new THREE.Vector3(worldX, worldY, worldZ),
        isDepleted: false
      };

      // Tag mesh for raycasting
      mesh.userData = { isResource: true, nodeId: nodeId };
      mesh.traverse(child => {
        child.userData = { isResource: true, nodeId: nodeId };
      });

      this.nodes.set(nodeId, nodeData);
    }
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  damageNode(nodeId, amount, toolDef, onDepleted) {
    const node = this.nodes.get(nodeId);
    if (!node || node.isDepleted) return false;

    // Apply hardness formula
    const effectiveDamage = Math.max(5, amount * (6.0 / (node.type.hardness || 5.0)));
    node.currentHp -= effectiveDamage;

    // Sound and particle feedback
    if (toolDef && toolDef.type === 'strike') {
      audio.playHammerStrike();
      this.spawnHitParticles(node.position, node.type.color, 16);
    } else {
      this.spawnHitParticles(node.position, 0xffaa44, 6);
    }

    // Subtle shake animation
    node.mesh.position.y += 0.05;
    setTimeout(() => {
      if (node.mesh) node.mesh.position.y = node.position.y;
    }, 50);

    if (node.currentHp <= 0) {
      this.depleteNode(nodeId, onDepleted);
    }

    return true;
  }

  depleteNode(nodeId, callback) {
    const node = this.nodes.get(nodeId);
    if (!node || node.isDepleted) return;

    node.isDepleted = true;
    this.depletedNodeIds.add(nodeId);

    // Shatter particles
    this.spawnHitParticles(node.position, node.type.color, 40);
    audio.playRockCrumble();
    audio.playPickupChime();

    // Remove mesh with scale-down animation
    let s = 1.0;
    const shrink = () => {
      s -= 0.15;
      if (s > 0 && node.mesh) {
        node.mesh.scale.multiplyScalar(0.85);
        requestAnimationFrame(shrink);
      } else {
        if (node.mesh) this.scene.remove(node.mesh);
        this.nodes.delete(nodeId);
      }
    };
    shrink();

    if (callback) {
      callback({
        itemId: node.type.yieldItem,
        count: node.type.yieldCount,
        name: node.type.name,
        name_mn: node.type.name_mn
      });
    }
  }

  setDepletedNodes(depletedArray = [], playerPos = null) {
    this.depletedNodeIds = new Set(Array.isArray(depletedArray) ? depletedArray : []);
    // Remove meshes for newly depleted nodes
    for (const [id, node] of this.nodes.entries()) {
      if (this.depletedNodeIds.has(id)) {
        if (node.mesh) this.scene.remove(node.mesh);
        this.nodes.delete(id);
      }
    }
    // Re-allow spawning chunks so pristine nodes in a New Game slot respawn cleanly
    this.spawnedChunkKeys.clear();
    if (playerPos) {
      this.update(0.016, playerPos);
    }
  }

  getRaycastTargets() {
    const targets = [];
    const pPos = this._lastPlayerPos;
    for (const node of this.nodes.values()) {
      if (!node.isDepleted && node.mesh && node.mesh.visible) {
        if (!pPos || node.position.distanceToSquared(pPos) <= 324) {
          targets.push(node.mesh);
        }
      }
    }
    return targets;
  }
}
