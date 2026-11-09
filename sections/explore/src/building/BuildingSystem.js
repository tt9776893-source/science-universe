import * as THREE from 'three';
import { BUILDING_MODULES } from '../core/Constants.js';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';

export class BuildingSystem {
  constructor(scene, camera, terrain, inventory) {
    this.scene = scene;
    this.camera = camera;
    this.terrain = terrain;
    this.inventory = inventory;

    this.active = false;
    this.selectedModuleIndex = 0;
    this.rotationY = 0;

    this.placedBuildings = []; // { id, moduleId, moduleIndex, x, y, z, rotY, storedEnergy, mesh }
    this._idCounter = 0;
    this.onBuildingsChanged = null;
    this.ghostGroup = new THREE.Group();
    this.ghostGroup.visible = false;
    this.scene.add(this.ghostGroup);

    this.raycaster = new THREE.Raycaster();
    this.groundHit = null;

    this._initGhostMaterial();
  }

  _initGhostMaterial() {
    this.validMaterial = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.5,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      wireframe: false,
      side: THREE.DoubleSide
    });
    this.invalidMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 0.5,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      wireframe: false,
      side: THREE.DoubleSide
    });
    this.ghostMaterial = this.validMaterial;
  }

  setModuleIndex(index) {
    this.selectedModuleIndex = (index + BUILDING_MODULES.length) % BUILDING_MODULES.length;
    this.updateGhostModel();
    return BUILDING_MODULES[this.selectedModuleIndex] || null;
  }

  setModuleById(moduleId) {
    const idx = BUILDING_MODULES.findIndex(m => m && m.id === moduleId);
    if (idx === -1) return null;
    return this.setModuleIndex(idx);
  }

  getSelectedModule() {
    return BUILDING_MODULES[this.selectedModuleIndex] || null;
  }

  nextModule() {
    this.setModuleIndex(this.selectedModuleIndex + 1);
  }

  prevModule() {
    this.setModuleIndex(this.selectedModuleIndex - 1);
  }

  rotate() {
    this.rotationY = (this.rotationY + Math.PI / 4) % (Math.PI * 2);
    this.ghostGroup.rotation.y = this.rotationY;
    audio.playClick();
  }

  setActive(active) {
    this.active = active;
    this.ghostGroup.visible = Boolean(active && this.groundHit);
    if (active) {
      this.updateGhostModel();
    } else {
      this.groundHit = null;
      while (this.ghostGroup.children.length > 0) {
        this.ghostGroup.remove(this.ghostGroup.children[0]);
      }
    }
  }

  updateGhostModel() {
    while (this.ghostGroup.children.length > 0) {
      this.ghostGroup.remove(this.ghostGroup.children[0]);
    }

    const modDef = BUILDING_MODULES[this.selectedModuleIndex];
    if (!modDef) return;

    // Use clean translucent hologram material without overwhelming wireframes
    let model = assetRegistry.getClonedModel(modDef.model);
    if (!model) {
      const geo = new THREE.BoxGeometry(modDef.footprint.x, 3.5, modDef.footprint.z);
      model = new THREE.Mesh(geo, this.ghostMaterial);
    } else {
      model.traverse(child => {
        if (child.isMesh) {
          child.material = this.ghostMaterial;
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
    }

    // Anchor model locally so base sits on local ground Y = 0
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    model.position.y = -box.min.y;

    // Translucent ground footprint indicator
    const footGeo = new THREE.BoxGeometry(modDef.footprint.x, 0.12, modDef.footprint.z);
    const footMesh = new THREE.Mesh(footGeo, this.ghostMaterial);
    footMesh.position.y = 0.06;
    this.ghostFootprint = footMesh;

    this.ghostModel = model;
    this.ghostGroup.add(model);
    this.ghostGroup.add(footMesh);
    this.ghostGroup.rotation.y = this.rotationY;
  }

  update(delta) {
    if (!this.active) {
      this.ghostGroup.visible = false;
      return;
    }

    // Raycast forward from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const terrainMeshes = this.terrain ? this.terrain.getRaycastMeshes() : [];
    const hits = this.raycaster.intersectObjects(terrainMeshes, true);

    const camPos = this.camera.position;
    let hitPoint = null;
    let hitDistance = Infinity;

    if (hits.length > 0) {
      hitPoint = hits[0].point;
      hitDistance = hits[0].distance;
    }

    // Safe placement range: min 3.5m (prevents clipping into camera), max 18.0m
    const minRange = 3.5;
    const maxRange = 18.0;

    let targetPos = null;
    let inRange = false;

    if (hitPoint && hitDistance <= maxRange) {
      if (hitDistance < minRange) {
        // Project horizontally ahead of player to safe distance so building never covers camera
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0;
        if (dir.lengthSq() > 0.01) {
          dir.normalize();
          const safeX = camPos.x + dir.x * 4.5;
          const safeZ = camPos.z + dir.z * 4.5;
          const safeY = this.terrain.getBaseHeight(safeX, safeZ);
          targetPos = new THREE.Vector3(safeX, safeY, safeZ);
          inRange = true;
        }
      } else {
        targetPos = hitPoint;
        inRange = true;
      }
    } else {
      // Fallback for mobile / horizontal view: project 6.0m ahead onto terrain floor
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      dir.y = 0;
      if (dir.lengthSq() > 0.01 && this.terrain) {
        dir.normalize();
        const safeX = camPos.x + dir.x * 6.0;
        const safeZ = camPos.z + dir.z * 6.0;
        const floorY = this.terrain.getFloorHeightForBody(safeX, camPos.y + 2.0, safeZ);
        const safeY = Number.isFinite(floorY) ? floorY : this.terrain.getBaseHeight(safeX, safeZ);
        targetPos = new THREE.Vector3(safeX, safeY, safeZ);
        inRange = true;
      }
    }

    if (targetPos && inRange) {
      this.groundHit = targetPos.clone();
      const floorY = this.terrain.getFloorHeightForBody(this.groundHit.x, this.groundHit.y + 2.0, this.groundHit.z);
      this.groundHit.y = Number.isFinite(floorY) ? floorY : this.terrain.getBaseHeight(this.groundHit.x, this.groundHit.z);
      this.ghostGroup.position.copy(this.groundHit);
      this.ghostGroup.visible = true;

      // Check resource status for green/red hologram indication
      const modDef = BUILDING_MODULES[this.selectedModuleIndex];
      const hasRes = modDef?.cost && this.inventory ? this.inventory.hasItems(modDef.cost) : true;
      const isValid = hasRes && inRange;

      const activeMat = isValid ? this.validMaterial : this.invalidMaterial;
      if (this.ghostModel) {
        this.ghostModel.traverse(c => {
          if (c.isMesh) c.material = activeMat;
        });
      }
      if (this.ghostFootprint) {
        this.ghostFootprint.material = activeMat;
      }
    } else {
      this.groundHit = null;
      this.ghostGroup.visible = false;
    }
  }

  getPlacementStatus() {
    if (!this.active || !this.groundHit) {
      return { canPlace: false, reason: 'no_target' };
    }
    const modDef = BUILDING_MODULES[this.selectedModuleIndex];
    if (!modDef) {
      return { canPlace: false, reason: 'invalid_module' };
    }
    if (modDef.cost && this.inventory && !this.inventory.hasItems(modDef.cost)) {
      return { canPlace: false, reason: 'insufficient_resources', cost: modDef.cost, moduleDef: modDef };
    }
    return { canPlace: true, moduleDef: modDef };
  }

  tryPlace(onPlaced) {
    if (!this.active || !this.groundHit) return false;
    const now = Date.now();
    if (this._placing || (now - (this._lastPlaceTime || 0) < 400)) return false;
    this._placing = true;
    this._lastPlaceTime = now;

    const modDef = BUILDING_MODULES[this.selectedModuleIndex];
    if (!modDef) { this._placing = false; return false; }

    // Check resource costs
    if (modDef.cost && this.inventory) {
      if (!this.inventory.hasItems(modDef.cost)) {
        this._placing = false;
        return false;
      }
    }

    // Consume resources before placement; rollback on failure
    if (modDef.cost && this.inventory) {
      const actuallyRemoved = {};
      for (const [itemId, needed] of Object.entries(modDef.cost)) {
        const removed = this.inventory.removeItem(itemId, needed);
        if (removed > 0) {
          actuallyRemoved[itemId] = (actuallyRemoved[itemId] || 0) + removed;
        }
        if (removed !== needed) {
          for (const [k, v] of Object.entries(actuallyRemoved)) {
            this.inventory.addItem(k, v);
          }
          this._placing = false;
          return false;
        }
      }
    }

    // Spawn physical building mesh
    let buildingMesh = assetRegistry.getClonedModel(modDef.model);
    if (!buildingMesh) {
      const geo = new THREE.BoxGeometry(modDef.footprint.x, 3.5, modDef.footprint.z);
      const mat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.6 });
      buildingMesh = new THREE.Mesh(geo, mat);
    }

    // Anchor mesh base to the terrain floor so structures never float or sink
    buildingMesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(buildingMesh);
    const floorY = this.terrain.getFloorHeightForBody(this.groundHit.x, this.groundHit.y + 2.0, this.groundHit.z);
    const targetY = Number.isFinite(floorY) ? floorY : this.terrain.getBaseHeight(this.groundHit.x, this.groundHit.z);
    buildingMesh.position.set(this.groundHit.x, targetY - box.min.y, this.groundHit.z);
    buildingMesh.rotation.y = this.rotationY;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    const buildingId = `base_${Date.now()}_${++this._idCounter}`;
    buildingMesh.userData = { isBuilding: true, buildingId, moduleDef: modDef };

    this.scene.add(buildingMesh);

    const record = {
      id: buildingId,
      moduleId: modDef.id,
      moduleIndex: this.selectedModuleIndex,
      x: this.groundHit.x,
      y: targetY,
      z: this.groundHit.z,
      rotY: this.rotationY,
      storedEnergy: 0,
      isOperating: false,
      oxygenGenerated: 0,
      oxygenCanisterProgress: 0,
      oxygenCanistersStored: 0,
      waterFeedstockKg: 0,
      iceChunksConsumed: 0,
      crusherBatchesCompleted: 0,
      lastStopReason: null,
      mesh: buildingMesh
    };

    this.placedBuildings.push(record);
    audio.playHammerStrike();

    if (onPlaced) {
      onPlaced(modDef, record);
    }
    this.onBuildingsChanged?.();

    setTimeout(() => {
      this._placing = false;
    }, 400);

    return record;
  }

  removeBuilding(target, refundResources = true) {
    if (target === null || target === undefined) return false;
    let idx = -1;
    if (typeof target === 'number') {
      idx = target;
    } else if (typeof target === 'string') {
      idx = this.placedBuildings.findIndex(b => b && b.id === target);
    } else if (typeof target === 'object') {
      idx = this.placedBuildings.findIndex(b => b === target || (target.id && b && b.id === target.id));
    }
    if (idx < 0 || idx >= this.placedBuildings.length) return false;

    const [removed] = this.placedBuildings.splice(idx, 1);
    if (removed?.mesh) {
      this.scene.remove(removed.mesh);
    }

    const modDef = BUILDING_MODULES[removed.moduleIndex] ||
      BUILDING_MODULES.find(m => m && m.id === removed.moduleId);
    if (refundResources && modDef?.cost && this.inventory) {
      for (const [itemId, qty] of Object.entries(modDef.cost)) {
        this.inventory.addItem(itemId, qty);
      }
    }

    this.onBuildingsChanged?.();
    return true;
  }

  getState() {
    return this.placedBuildings.map(b => {
      const modDef = BUILDING_MODULES[b.moduleIndex];
      const maxCap = modDef?.batteryCapacity || 0;
      const clampedEnergy = maxCap > 0
        ? Math.max(0, Math.min(maxCap, Number(b.storedEnergy) || 0))
        : 0;
      const isContinuousOperating = modDef?.id === 'build_oxygen_gen' ? Boolean(b.isOperating) : false;
      return {
        id: b.id,
        moduleId: b.moduleId || modDef?.id || null,
        moduleIndex: b.moduleIndex,
        x: b.x,
        y: b.y,
        z: b.z,
        rotY: b.rotY,
        storedEnergy: Math.round(clampedEnergy * 1000) / 1000,
        isOperating: isContinuousOperating,
        oxygenGenerated: Math.max(0, Math.round((Number(b.oxygenGenerated) || 0) * 1e6) / 1e6),
        oxygenCanisterProgress: Math.max(0, Math.min(1, Math.round((Number(b.oxygenCanisterProgress) || 0) * 1e6) / 1e6)),
        oxygenCanistersStored: Math.max(0, Math.floor(Number(b.oxygenCanistersStored) || 0)),
        waterFeedstockKg: Math.max(0, Math.round((Number(b.waterFeedstockKg) || 0) * 1e6) / 1e6),
        iceChunksConsumed: Math.max(0, Math.floor(Number(b.iceChunksConsumed) || 0)),
        crusherBatchesCompleted: Math.max(0, Math.floor(Number(b.crusherBatchesCompleted) || 0)),
        lastStopReason: b.lastStopReason || null
      };
    });
  }

  clearBuildings() {
    for (const b of this.placedBuildings) {
      if (b.mesh) {
        this.scene.remove(b.mesh);
      }
    }
    this.placedBuildings.length = 0;
    this.setActive(false);
    this.onBuildingsChanged?.();
  }

  loadState(list) {
    this.clearBuildings();
    if (!list || !Array.isArray(list)) return;
    const usedIds = new Set();
    for (const b of list) {
      if (!b) continue;
      let resolvedIdx = -1;
      if (b.moduleId) {
        resolvedIdx = BUILDING_MODULES.findIndex(m => m && m.id === b.moduleId);
      }
      if (resolvedIdx === -1 && Number.isInteger(b.moduleIndex)) {
        resolvedIdx = b.moduleIndex;
      }
      const modDef = BUILDING_MODULES[resolvedIdx];
      if (!modDef) continue;
      let mesh = assetRegistry.getClonedModel(modDef.model);
      if (!mesh) {
        const geo = new THREE.BoxGeometry(modDef.footprint.x, 3.5, modDef.footprint.z);
        const mat = new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.6 });
        mesh = new THREE.Mesh(geo, mat);
      }
      mesh.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(mesh);
      const floorY = this.terrain.getFloorHeightForBody(b.x, b.y + 2.0, b.z);
      const targetY = Number.isFinite(floorY) ? floorY : b.y;
      mesh.position.set(b.x, targetY - box.min.y, b.z);
      mesh.rotation.y = b.rotY || 0;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      let stableId = (typeof b.id === 'string' && b.id.trim().length > 0 && !usedIds.has(b.id))
        ? b.id
        : `base_${Date.now()}_${++this._idCounter}`;
      usedIds.add(stableId);

      mesh.userData = { isBuilding: true, buildingId: stableId, moduleDef: modDef };
      this.scene.add(mesh);

      const maxCap = modDef.batteryCapacity || 0;
      const storedEnergy = maxCap > 0
        ? Math.max(0, Math.min(maxCap, Number(b.storedEnergy) || 0))
        : 0;

      this.placedBuildings.push({
        ...b,
        id: stableId,
        moduleId: modDef.id,
        moduleIndex: resolvedIdx,
        y: targetY,
        rotY: b.rotY || 0,
        storedEnergy,
        isOperating: modDef.id === 'build_oxygen_gen' ? Boolean(b.isOperating) : false,
        oxygenGenerated: Math.max(0, Number(b.oxygenGenerated) || 0),
        oxygenCanisterProgress: Math.max(0, Math.min(1, Number(b.oxygenCanisterProgress) || 0)),
        oxygenCanistersStored: Math.max(0, Math.floor(Number(b.oxygenCanistersStored) || 0)),
        waterFeedstockKg: Math.max(0, Number(b.waterFeedstockKg) || 0),
        iceChunksConsumed: Math.max(0, Math.floor(Number(b.iceChunksConsumed) || 0)),
        crusherBatchesCompleted: Math.max(0, Math.floor(Number(b.crusherBatchesCompleted) || 0)),
        lastStopReason: b.lastStopReason || null,
        mesh
      });
    }
    this.onBuildingsChanged?.();
  }
}
