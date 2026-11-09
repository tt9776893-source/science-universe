import * as THREE from 'three';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';

/**
 * Manages functional, enterable planetary habitats, airlocks, and interior laboratory equipment.
 */
export class HabitatManager {
  constructor(scene, terrain, inventory, survival) {
    this.scene = scene;
    this.terrain = terrain;
    this.inventory = inventory;
    this.survival = survival;

    // Airlock states: 'EXTERIOR_CLOSED', 'EXTERIOR_OPEN', 'PRESSURIZING', 'INTERIOR_OPEN', 'DEPRESSURIZING'
    this.airlockState = 'EXTERIOR_CLOSED';
    this.airlockPressure = 0.6; // kPa (Mars atmospheric baseline)
    this.targetPressure = 0.6;
    this.isCycleInProgress = false;
    this.cycleTimer = 0;

    // Player habitat presence
    this.isPlayerInside = false;

    // Base storage cargo (24 slots)
    this.colonyStorage = new Array(24).fill(null);
    this.unlockedTechs = new Set();
    this.researchPoints = 0;

    this.baseOrigin = new THREE.Vector3(-12, 0, 12);
    this._initBase();
  }

  _initBase() {
    const origin = this.baseOrigin;
    const groundY = this.terrain.getBaseHeight(origin.x, origin.z);
    origin.y = groundY;

    this.baseGroup = new THREE.Group();
    this.baseGroup.position.copy(origin);
    this.scene.add(this.baseGroup);

    // 0. Centerpiece Assembled Planetary Research Center (Pack 02)
    const assembledBase = assetRegistry.getClonedModel('SU_Base_B_Scientific_Research_Center.glb');
    if (assembledBase) {
      this._anchorToGround(assembledBase, 0, 4.0, 0.0);
      this.baseGroup.add(assembledBase);
    }

    // 1. Perimeter Navigation Light Pylons (Red and Cyan Beacon LED Markers)
    const beaconCoords = [
      [-14, 0], [-10, -10], [0, -14], [10, -10],
      [14, 0], [14, 10], [10, 16], [0, 18],
      [-10, 16], [-14, 10]
    ];
    beaconCoords.forEach(([bx, bz], idx) => {
      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(bx, 0, bz);
      
      const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 0.6;
      pylonGroup.add(post);

      const isCyan = (idx % 2 === 0);
      const beaconColor = isCyan ? 0x00f0ff : 0xff3344;
      const bulbGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const bulbMat = new THREE.MeshBasicMaterial({ color: beaconColor });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = 1.25;
      pylonGroup.add(bulb);

      this.baseGroup.add(pylonGroup);
    });

    // 2. Foundation Platform
    const foundGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.6, 24);
    const foundMat = new THREE.MeshStandardMaterial({ color: 0x2b313d, roughness: 0.7, metalness: 0.4 });
    const foundation = new THREE.Mesh(foundGeo, foundMat);
    foundation.position.set(0, 0.3, 4);
    foundation.receiveShadow = true;
    this.baseGroup.add(foundation);

    // Exterior Solar Power Plant
    const solarModel = assetRegistry.getClonedModel('SU_Infra_Solar_Power_Plant.glb');
    if (solarModel) {
      this._anchorToGround(solarModel, -8.5, 3.0, 0.0);
      solarModel.rotation.y = Math.PI / 4;
      solarModel.scale.setScalar(0.85);
      this.baseGroup.add(solarModel);
    }

    // Exterior Compact Nuclear Reactor
    const reactorModel = assetRegistry.getClonedModel('SU_Infra_Compact_Nuclear_Reactor.glb');
    if (reactorModel) {
      this._anchorToGround(reactorModel, 7.5, 7.5, 0.0);
      reactorModel.rotation.y = -Math.PI / 3;
      reactorModel.scale.setScalar(0.8);
      this.baseGroup.add(reactorModel);
    }

    // Exterior Telemetry & Control Tower
    const commModel = assetRegistry.getClonedModel('SU_Infra_Base_Control_Center.glb');
    if (commModel) {
      this._anchorToGround(commModel, 6.5, 1.0, 0.0);
      commModel.rotation.y = -Math.PI / 6;
      commModel.scale.setScalar(0.75);
      this.baseGroup.add(commModel);
    }

    // 2. EVA Airlock Module (SU_Base_Airlock.glb)
    this.airlockModule = assetRegistry.getClonedModel('SU_Base_Airlock.glb');
    if (!this.airlockModule) {
      const geo = new THREE.BoxGeometry(3.2, 2.8, 3.0);
      const mat = new THREE.MeshStandardMaterial({ color: 0x485566, roughness: 0.6, metalness: 0.4 });
      this.airlockModule = new THREE.Mesh(geo, mat);
    } else {
      this.airlockModule.traverse(child => {
        if (child.isMesh && child.material) child.material.side = THREE.DoubleSide;
      });
    }
    this._anchorToGround(this.airlockModule, 0, 0, 0.0);
    this.airlockModule.rotation.y = 0;
    this.baseGroup.add(this.airlockModule);

    // Locate airlock door nodes for interactive animation
    this.outerHatchNode = null;
    this.lockWheelNode = null;
    this.led1 = null;
    this.led2 = null;

    this.airlockModule.traverse(child => {
      if (child.name.includes('Pressure_Hatch_Outer') || child.name.includes('HatchFrame')) {
        this.outerHatchNode = child;
      }
      if (child.name.includes('Locking_Wheel') || child.name.includes('LockWheel')) {
        this.lockWheelNode = child;
      }
      if (child.name.includes('LED_1')) this.led1 = child;
      if (child.name.includes('LED_2')) this.led2 = child;
    });

    // 3. Interior Sliding Door between Airlock and Research Hab
    this.slidingDoorModule = assetRegistry.getClonedModel('SU_Base_Door_Sliding.glb');
    this.doorLeftLeaf = null;
    this.doorRightLeaf = null;

    if (this.slidingDoorModule) {
      this._anchorToGround(this.slidingDoorModule, 0, 1.5, 0.0);
      this.slidingDoorModule.rotation.y = 0;
      this.baseGroup.add(this.slidingDoorModule);

      this.slidingDoorModule.traverse(child => {
        if (child.name.includes('Left')) this.doorLeftLeaf = child;
        if (child.name.includes('Right')) this.doorRightLeaf = child;
      });
    }

    // 4. Research Laboratory Hab (SU_Base_Hab_Research.glb)
    this.researchHab = assetRegistry.getClonedModel('SU_Base_Hab_Research.glb');
    if (!this.researchHab) {
      const geo = new THREE.CylinderGeometry(4.5, 4.5, 3.4, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.5 });
      this.researchHab = new THREE.Mesh(geo, mat);
    } else {
      this.researchHab.traverse(child => {
        if (child.isMesh && child.material) child.material.side = THREE.DoubleSide;
      });
    }
    this.researchHab.position.set(0, 0.8, 6.5);
    this.baseGroup.add(this.researchHab);

    // 5. Interior Walkable Floor & Lighting
    const floorGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.2, 16);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a212b, roughness: 0.6, metalness: 0.5 });
    this.interiorFloor = new THREE.Mesh(floorGeo, floorMat);
    this.interiorFloor.position.set(0, 0.85, 6.5);
    this.interiorFloor.receiveShadow = true;
    this.baseGroup.add(this.interiorFloor);

    // Consolidated warm-cyan scientific interior illumination (avoids multi-PointLight shader overhead)
    this.interiorLight = new THREE.PointLight(0xa8f0ff, 2.4, 15, 1.2);
    this.interiorLight.position.set(0, 2.8, 5.5);
    this.baseGroup.add(this.interiorLight);

    // 6. Interactive Laboratory Equipment (Pack 04)
    this.labEquip = [];

    // A. Analysis Computer Console
    let compModel = assetRegistry.getClonedModel('SU_Lab_Analysis_Computer.glb');
    if (!compModel) {
      const geo = new THREE.BoxGeometry(1.2, 1.4, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5, metalness: 0.6 });
      compModel = new THREE.Mesh(geo, mat);
    }
    compModel.position.set(-2.2, 0.9, 6.0);
    compModel.rotation.y = Math.PI / 3;
    compModel.scale.setScalar(0.75);
    this.baseGroup.add(compModel);
    this.labEquip.push({
      id: 'equip_computer',
      name: 'Scientific Analysis Terminal',
      name_mn: 'Шинжлэх ухааны анализын компьютер',
      type: 'computer',
      labId: 'computer',
      position: new THREE.Vector3().addVectors(origin, compModel.position),
      radius: 1.8
    });

    // B. Spectrometer Workstation
    let specModel = assetRegistry.getClonedModel('SU_Lab_Spectrometer.glb');
    if (!specModel) {
      const geo = new THREE.BoxGeometry(1.4, 1.2, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4, metalness: 0.5 });
      specModel = new THREE.Mesh(geo, mat);
    }
    specModel.position.set(2.2, 0.9, 6.0);
    specModel.rotation.y = -Math.PI / 3;
    specModel.scale.setScalar(0.75);
    this.baseGroup.add(specModel);
    this.labEquip.push({
      id: 'equip_spectrometer',
      name: 'PIXL XRF Spectrometer Bench',
      name_mn: 'Спектрометрийн лабораторийн ширээ',
      type: 'spectrometer',
      labId: 'chemistry',
      position: new THREE.Vector3().addVectors(origin, specModel.position),
      radius: 1.8
    });

    // C. Sample Storage Locker
    let storageModel = assetRegistry.getClonedModel('SU_Lab_Sample_Storage.glb');
    if (!storageModel) {
      const geo = new THREE.BoxGeometry(1.0, 1.8, 0.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.6 });
      storageModel = new THREE.Mesh(geo, mat);
    }
    storageModel.position.set(-2.0, 0.9, 8.2);
    storageModel.rotation.y = Math.PI / 2;
    storageModel.scale.setScalar(0.75);
    this.baseGroup.add(storageModel);
    this.labEquip.push({
      id: 'equip_storage',
      name: 'Cryogenic Colony Storage Locker',
      name_mn: 'Баазын дээж, ачаа хадгалах шүүгээ',
      type: 'storage',
      labId: 'biology',
      position: new THREE.Vector3().addVectors(origin, storageModel.position),
      radius: 1.8
    });

    // D. Bioreactor / Electrolysis Life-Support Unit
    let bioModel = assetRegistry.getClonedModel('SU_Lab_Bioreactor.glb');
    if (!bioModel) {
      const geo = new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12);
      const mat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, metalness: 0.7 });
      bioModel = new THREE.Mesh(geo, mat);
    }
    bioModel.position.set(2.0, 0.9, 8.2);
    bioModel.rotation.y = -Math.PI / 2;
    bioModel.scale.setScalar(0.75);
    this.baseGroup.add(bioModel);
    this.labEquip.push({
      id: 'equip_electrolysis',
      name: 'Electrolysis Water Purifier & MOXIE Unit',
      name_mn: 'Ус цэвэршүүлэгч ба Хүчилтөрөгчийн электролиз төхөөрөмж',
      type: 'electrolysis',
      labId: 'chemistry',
      position: new THREE.Vector3().addVectors(origin, bioModel.position),
      radius: 1.8
    });

    // Seed starter supplies in colony storage
    this.colonyStorage[0] = { itemId: 'o2_canister', count: 4 };
    this.colonyStorage[1] = { itemId: 'battery_pack', count: 4 };
    this.colonyStorage[2] = { itemId: 'iron_ore', count: 16 };
  }

  /**
   * Anchors a model (GLB or fallback geometry) so its lowest point sits exactly
   * on the terrain floor at the given local offset. This prevents floating or
   * sunken structures caused by arbitrary hardcoded Y offsets.
   */
  _anchorToGround(model, localX, localZ, baseOffset = 0.0) {
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const bottomY = box.min.y;
    model.position.set(localX, baseOffset - bottomY, localZ);
  }

  /**
   * Evaluates player distance to exterior door, airlock cycle, and lab equipment
   */
  getInteractionPrompt(playerPos) {
    const origin = this.baseOrigin;
    const localPos = playerPos.clone().sub(origin);

    // 1. Exterior Airlock Door (at local Z ~ -1.5)
    const distToOuterHatch = Math.hypot(localPos.x, localPos.z - (-1.5));
    if (distToOuterHatch < 2.5 && localPos.z < 0) {
      if (this.airlockState === 'EXTERIOR_CLOSED') {
        return {
          text: '[E] Open Exterior Airlock Hatch',
          text_mn: '[E] Шлюзийн гадна хаалгыг онгойлгох',
          distance: distToOuterHatch,
          action: () => this.toggleOuterHatch()
        };
      } else if (this.airlockState === 'EXTERIOR_OPEN') {
        return {
          text: '[E] Close Exterior Airlock Hatch',
          text_mn: '[E] Гадна хаалгыг хаах',
          distance: distToOuterHatch,
          action: () => this.toggleOuterHatch()
        };
      }
    }

    // 2. Inside Airlock Decontamination Chamber (local Z ~ 0.5)
    const distInChamber = Math.hypot(localPos.x, localPos.z - 0.5);
    if (distInChamber < 1.6) {
      if (this.isCycleInProgress) {
        return {
          text: `Pressurization Cycle Active (${Math.round(this.airlockPressure)} kPa)...`,
          text_mn: `Шлюз даралт тохируулж байна (${Math.round(this.airlockPressure)} кПа)...`,
          distance: distInChamber,
          action: null
        };
      }

      if (this.airlockState === 'EXTERIOR_OPEN' || this.airlockState === 'EXTERIOR_CLOSED') {
        return {
          text: '[E] Cycle Airlock & Pressurize (Enter Base)',
          text_mn: '[E] Шлюзийг даралтжуулж, бааз руу орох',
          distance: distInChamber,
          action: () => this.startPressurizationCycle(true)
        };
      } else if (this.airlockState === 'INTERIOR_OPEN') {
        return {
          text: '[E] Cycle Airlock & Depressurize (Exit to Mars)',
          text_mn: '[E] Даралтыг бууруулж, гадарга руу гарах',
          distance: distInChamber,
          action: () => this.startPressurizationCycle(false)
        };
      }
    }

    // 3. Interactive Laboratory Equipment inside Research Hab
    for (const eq of this.labEquip) {
      if (playerPos.distanceTo(eq.position) <= eq.radius) {
        return {
          text: `[E] Operate ${eq.name}`,
          text_mn: `[E] ${eq.name_mn}-г ашиглах`,
          distance: playerPos.distanceTo(eq.position),
          labId: eq.labId,
          action: () => this.operateEquipment(eq)
        };
      }
    }

    return null;
  }

  toggleOuterHatch() {
    if (this.isCycleInProgress) return;
    if (this.airlockState === 'EXTERIOR_CLOSED') {
      this.airlockState = 'EXTERIOR_OPEN';
      audio.playClick();
      this._animateOuterHatch(true);
    } else if (this.airlockState === 'EXTERIOR_OPEN') {
      this.airlockState = 'EXTERIOR_CLOSED';
      audio.playClick();
      this._animateOuterHatch(false);
    }
  }

  startPressurizationCycle(toInterior) {
    if (this.isCycleInProgress) return;
    this.isCycleInProgress = true;
    this.cycleTimer = 3.5; // 3.5 second cycle
    audio.playClick();

    if (toInterior) {
      // 1. Close outer hatch
      this._animateOuterHatch(false);
      this.targetPressure = 101.3; // Earth normal atmosphere inside hab
    } else {
      // 1. Close interior sliding door
      this._animateSlidingDoor(false);
      this.targetPressure = 0.6; // Mars atmosphere outside
    }
  }

  _animateOuterHatch(open) {
    if (this.outerHatchNode) {
      this.outerHatchNode.rotation.y = open ? -Math.PI / 1.8 : 0;
    }
    if (this.lockWheelNode) {
      this.lockWheelNode.rotation.z += Math.PI * 2;
    }
  }

  _animateSlidingDoor(open) {
    if (this.doorLeftLeaf) {
      this.doorLeftLeaf.position.x = open ? -0.85 : 0;
    }
    if (this.doorRightLeaf) {
      this.doorRightLeaf.position.x = open ? 0.85 : 0;
    }
  }

  operateEquipment(eq) {
    audio.playClick();
    if (eq.type === 'computer' || eq.type === 'spectrometer') {
      // Analyze player's inventory minerals
      let analyzedCount = 0;
      const discoveredItems = [];

      for (const slot of this.inventory.backpack) {
        if (!slot) continue;
        if (['iron_ore', 'ice_chunk', 'copper_ore', 'sulfur', 'quartz_crystal', 'basalt'].includes(slot.itemId)) {
          if (!this.unlockedTechs.has(slot.itemId)) {
            this.unlockedTechs.add(slot.itemId);
            this.researchPoints += 50;
            discoveredItems.push(slot.itemId);
            analyzedCount++;
          }
        }
      }

      if (analyzedCount > 0) {
        return {
          type: 'research',
          success: true,
          msg: `Анализ амжилттай! Шинэ технологийн +${analyzedCount * 50} оноо олгогдлоо.`,
          techs: discoveredItems
        };
      } else {
        return {
          type: 'research',
          success: true,
          msg: `Лаборатори идэвхтэй. Судалгааны нийт оноо: ${this.researchPoints} SP.`
        };
      }
    } else if (eq.type === 'electrolysis') {
      // Convert ice_chunk into potable water and refill suit O2
      const iceSlotIdx = this.inventory.backpack.findIndex(s => s && s.itemId === 'ice_chunk');
      if (iceSlotIdx !== -1) {
        this.inventory.backpack[iceSlotIdx].count--;
        if (this.inventory.backpack[iceSlotIdx].count <= 0) {
          this.inventory.backpack[iceSlotIdx] = null;
        }
        this.inventory.addItem('o2_canister', 1);
        this.survival.oxygen = 100;
        audio.playPickupChime();
        return {
          type: 'electrolysis',
          success: true,
          msg: `Цэвэршүүлэлт хийгдлээ: Мөсийг хайлуулж O₂ хүчилтөрөгчийн баллон цэнэглэлээ!`
        };
      } else {
        return {
          type: 'electrolysis',
          success: false,
          msg: `Электролизын төхөөрөмж: Багцад Гүний мөс (H₂O) байх шаардлагатай.`
        };
      }
    } else if (eq.type === 'storage') {
      return {
        type: 'storage',
        success: true,
        storage: this.colonyStorage
      };
    }
  }

  update(delta, playerPos) {
    // 1. Process active airlock cycle
    if (this.isCycleInProgress) {
      this.cycleTimer -= delta;
      // Interpolate pressure
      this.airlockPressure += (this.targetPressure - this.airlockPressure) * Math.min(1.0, 2.0 * delta);

      if (this.cycleTimer <= 0) {
        this.isCycleInProgress = false;
        this.airlockPressure = this.targetPressure;

        if (this.targetPressure > 50) {
          // Pressurized: open interior door
          this.airlockState = 'INTERIOR_OPEN';
          this._animateSlidingDoor(true);
        } else {
          // Depressurized: open exterior hatch
          this.airlockState = 'EXTERIOR_OPEN';
          this._animateOuterHatch(true);
        }
      }
    }

    // 2. Check if player is inside the Pressurized Habitat
    const origin = this.baseOrigin;
    const localPos = playerPos.clone().sub(origin);
    const distToHabCenter = Math.hypot(localPos.x, localPos.z - 6.5);

    this.isPlayerInside = (distToHabCenter < 4.2 && localPos.y >= 0.5 && localPos.y <= 4.0);

    // 3. Apply Habitat Safe Zone buffs
    if (this.isPlayerInside) {
      // Oxygen consumption halts & suit refills
      this.survival.oxygen = Math.min(100, this.survival.oxygen + 5.0 * delta);
      // Temperature is comfortably regulated to +21°C
      this.survival.temperature = 21;
      // Battery recharges from base reactor
      this.survival.power = Math.min(100, this.survival.power + 2.5 * delta);
    }
  }

  getState() {
    return {
      airlockState: this.airlockState,
      airlockPressure: this.airlockPressure,
      colonyStorage: this.colonyStorage,
      researchPoints: this.researchPoints,
      unlockedTechs: Array.from(this.unlockedTechs)
    };
  }

  resetToInitialState() {
    this.airlockState = 'EXTERIOR_CLOSED';
    this.airlockPressure = 0.6;
    this.targetPressure = 0.6;
    this.isCycleInProgress = false;
    this.cycleTimer = 0;
    this.isPlayerInside = false;
    this.colonyStorage = new Array(24).fill(null);
    this.unlockedTechs = new Set();
    this.researchPoints = 0;
    this._animateOuterHatch?.(false);
    this._animateSlidingDoor?.(false);
  }

  loadState(state) {
    if (!state) return;
    this.isCycleInProgress = false;
    this.cycleTimer = 0;
    this.airlockState = state.airlockState || 'EXTERIOR_CLOSED';
    this.airlockPressure = state.airlockPressure ?? 0.6;
    this.targetPressure = this.airlockPressure;
    this.colonyStorage = Array.isArray(state.colonyStorage) ? state.colonyStorage : new Array(24).fill(null);
    this.researchPoints = state.researchPoints || 0;
    this.unlockedTechs = new Set(Array.isArray(state.unlockedTechs) ? state.unlockedTechs : []);
  }
}
