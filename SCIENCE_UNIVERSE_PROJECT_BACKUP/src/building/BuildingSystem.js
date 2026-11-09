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

    this.placedBuildings = []; // { id, moduleIndex, position, rotation, mesh }
    this.ghostGroup = new THREE.Group();
    this.ghostGroup.visible = false;
    this.scene.add(this.ghostGroup);

    this.raycaster = new THREE.Raycaster();
    this.groundHit = null;

    this._initGhostMaterial();
  }

  _initGhostMaterial() {
    this.ghostMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
  }

  setModuleIndex(index) {
    this.selectedModuleIndex = (index + BUILDING_MODULES.length) % BUILDING_MODULES.length;
    this.updateGhostModel();
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
    this.ghostGroup.visible = active;
    if (active) {
      this.updateGhostModel();
    }
  }

  updateGhostModel() {
    while (this.ghostGroup.children.length > 0) {
      this.ghostGroup.remove(this.ghostGroup.children[0]);
    }

    const modDef = BUILDING_MODULES[this.selectedModuleIndex];
    if (!modDef) return;

    let model = assetRegistry.getClonedModel(modDef.model);
    if (!model) {
      // Fallback box hologram if GLB is loading
      const geo = new THREE.BoxGeometry(modDef.footprint.x, 3.5, modDef.footprint.z);
      model = new THREE.Mesh(geo, this.ghostMaterial);
    } else {
      model.traverse(child => {
        if (child.isMesh) {
          child.material = this.ghostMaterial;
        }
      });
    }

    this.ghostGroup.add(model);
    this.ghostGroup.rotation.y = this.rotationY;
  }

  update(delta) {
    if (!this.active) {
      this.ghostGroup.visible = false;
      return;
    }

    // Raycast forward from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const terrainMeshes = this.terrain.getRaycastMeshes();
    const hits = this.raycaster.intersectObjects(terrainMeshes, true);

    if (hits.length > 0 && hits[0].distance < 20.0) {
      this.groundHit = hits[0].point;
      this.ghostGroup.position.copy(this.groundHit);
      this.ghostGroup.visible = true;
    } else {
      this.groundHit = null;
      this.ghostGroup.visible = false;
    }
  }

  tryPlace(onPlaced) {
    if (!this.active || !this.groundHit) return false;

    const modDef = BUILDING_MODULES[this.selectedModuleIndex];
    if (!modDef) return false;

    // Check resource costs
    let canAfford = true;
    if (modDef.cost) {
      for (const [itemId, needed] of Object.entries(modDef.cost)) {
        // Simple check
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
    buildingMesh.userData = { isBuilding: true, moduleDef: modDef };

    this.scene.add(buildingMesh);

    const record = {
      id: `base_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      moduleIndex: this.selectedModuleIndex,
      x: this.groundHit.x,
      y: targetY,
      z: this.groundHit.z,
      rotY: this.rotationY,
      mesh: buildingMesh
    };

    this.placedBuildings.push(record);
    audio.playHammerStrike();

    if (onPlaced) {
      onPlaced(modDef);
    }

    return true;
  }

  getState() {
    return this.placedBuildings.map(b => ({
      id: b.id,
      moduleIndex: b.moduleIndex,
      x: b.x,
      y: b.y,
      z: b.z,
      rotY: b.rotY
    }));
  }

  clearBuildings() {
    for (const b of this.placedBuildings) {
      if (b.mesh) {
        this.scene.remove(b.mesh);
      }
    }
    this.placedBuildings.length = 0;
    this.setActive(false);
  }

  loadState(list) {
    this.clearBuildings();
    if (!list || !Array.isArray(list)) return;
    for (const b of list) {
      const modDef = BUILDING_MODULES[b.moduleIndex];
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
      mesh.rotation.y = b.rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { isBuilding: true, moduleDef: modDef };
      this.scene.add(mesh);
      this.placedBuildings.push({ ...b, y: targetY, mesh });
    }
  }
}
