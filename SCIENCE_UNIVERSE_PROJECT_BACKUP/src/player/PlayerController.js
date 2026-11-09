import * as THREE from 'three';
import {
  WALK_SPEED,
  SPRINT_SPEED,
  CROUCH_SPEED,
  JUMP_FORCE,
  MARS_GRAVITY,
  PLANET_GRAVITY,
  PLANET_JUMP_HEIGHT,
  PLAYER_EYE_HEIGHT,
  CROUCH_EYE_HEIGHT
} from '../core/Constants.js';
import { input } from '../core/InputManager.js';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';
import { getPlanetWorldConfig } from '../world/PlanetEnvironment.js';

export class PlayerController {
  constructor(camera, scene, terrain, resourceManager, inventory, survival, buildingSystem, vehicleSystem, physics, habitat) {
    this.camera = camera;
    this.scene = scene;
    this.terrain = terrain;
    this.gravity = terrain.planetConfig?.gravityMps2 || MARS_GRAVITY;
    this.jumpHeight = 2.0;
    this.hasSolidSurface = terrain.planetConfig?.hasSolidSurface !== false;
    this.resourceManager = resourceManager;
    this.inventory = inventory;
    this.survival = survival;
    this.buildingSystem = buildingSystem;
    this.vehicleSystem = vehicleSystem;
    this.physics = physics;
    this.habitat = habitat;

    this.onGeologyDiscovered = null;
    this.onOrganismScan = null;
    this.onSampleCollected = null;

    this.scannerCooldown = 0;
    this._prevPrimaryActive = false;

    // Position & Orientation
    this.position = new THREE.Vector3(0, 5, 0);
    this.velocity = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;

    // Movement States
    this.isGrounded = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.currentEyeHeight = PLAYER_EYE_HEIGHT;

    // View bobbing & step cadence
    this.bobTimer = 0;
    this.bobAmount = { x: 0, y: 0 };
    this.lastStepDist = 0;

    // Viewmodel / First-Person Rig
    this.viewmodelHolder = new THREE.Group();
    this.camera.add(this.viewmodelHolder);
    this.toolGroup = new THREE.Group();
    this.handsGroup = new THREE.Group();
    this.viewmodelHolder.add(this.handsGroup);
    this.viewmodelHolder.add(this.toolGroup);

    // Tool sway
    this.swayTarget = { x: 0, y: 0 };
    this.currentSway = { x: 0, y: 0 };

    // Tool Action animations
    this.activeToolModel = null;
    this.currentToolDef = null;
    this.isMining = false;
    this.hammerSwingProgress = -1;
    this.drillRotation = 0;
    this.currentTargetNode = null;
    this.terrainExcavateCooldown = 0;

    // Interactive Visual FX
    this._initLaserBeam();
    this._initFlashlight();
    this._initScannerCone();
    this._initReticleRing();
    this._loadHands();

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 16.0;
    this._centerNDC = new THREE.Vector2(0, 0);
    this._zAxis = new THREE.Vector3(0, 0, 1);
    this.deployedWorkLights = [];

    // Camera obstruction raycaster: prevents camera from clipping through walls/buildings
    this._camRaycaster = new THREE.Raycaster();
    this._camRaycaster.far = 2.0;
    this._camRayOrigin = new THREE.Vector3();
    this._camRayDir = new THREE.Vector3();
  }

  _initFlashlight() {
    this.flashlight = new THREE.SpotLight(0xfffaed, 3.8, 65, Math.PI / 4.5, 0.45, 1.2);
    this.flashlight.position.set(0.15, -0.1, 0.1);
    this.flashlight.target.position.set(0, 0, -10);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlight.target);

    // Soft local ambient fill light around the astronaut's suit helmet
    this.suitFillLight = new THREE.PointLight(0xfffaed, 0.55, 12, 1.5);
    this.suitFillLight.position.set(0, 0.2, 0);
    this.camera.add(this.suitFillLight);
    this.suitFillLight.visible = false;

    this.isFlashlightOn = false;
    this.flashlight.visible = false;
  }

  toggleFlashlight() {
    this.isFlashlightOn = !this.isFlashlightOn;
    this.flashlight.visible = this.isFlashlightOn;
    if (this.suitFillLight) this.suitFillLight.visible = this.isFlashlightOn;
    audio.playToggleLight();
  }

  deployWorkLight() {
    const origin = this.position.clone();
    const floorY = this.terrain.getWalkableFloor(origin.x, origin.y, origin.z);
    origin.y = Number.isFinite(floorY) ? floorY : origin.y;

    const group = new THREE.Group();
    group.position.copy(origin);

    // Industrial yellow tripod stand
    const tripodGeo = new THREE.CylinderGeometry(0.04, 0.35, 1.3, 6);
    const tripodMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.6 });
    const tripodMesh = new THREE.Mesh(tripodGeo, tripodMat);
    tripodMesh.position.y = 0.65;
    group.add(tripodMesh);

    // Work light lamp head
    const headGeo = new THREE.BoxGeometry(0.35, 0.22, 0.25);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.8 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.35;
    group.add(headMesh);

    // Glowing emitter lens
    const lensGeo = new THREE.PlaneGeometry(0.3, 0.18);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffaea });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.position.set(0, 1.35, 0.13);
    group.add(lensMesh);

    // High-intensity 360-degree area illumination for dark caverns
    const workLight = new THREE.PointLight(0xfff6ea, 3.8, 38, 1.3);
    workLight.position.set(0, 1.45, 0);
    group.add(workLight);

    this.scene.add(group);
    if (!this.deployedWorkLights) this.deployedWorkLights = [];
    this.deployedWorkLights.push(group);

    audio.playToggleLight();
    return group;
  }

  _initLaserBeam() {
    const geo = new THREE.CylinderGeometry(0.015, 0.035, 1, 8);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, 0.5);

    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    this.laserBeam = new THREE.Mesh(geo, mat);
    this.laserBeam.visible = false;
    this.scene.add(this.laserBeam);

    const glowGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x33ffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.laserGlow = new THREE.Mesh(glowGeo, glowMat);
    this.laserGlow.visible = false;
    this.scene.add(this.laserGlow);

    this.laserLight = new THREE.PointLight(0x00f0ff, 1.5, 6);
    this.laserLight.visible = false;
    this.scene.add(this.laserLight);
  }

  _initScannerCone() {
    const coneGeo = new THREE.ConeGeometry(1.2, 5.0, 16, 1, true);
    coneGeo.rotateX(-Math.PI / 2);
    coneGeo.translate(0, 0, 2.5);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.scannerCone = new THREE.Mesh(coneGeo, coneMat);
    this.scannerCone.visible = false;
    this.camera.add(this.scannerCone);
  }

  _initReticleRing() {
    // Holographic excavation target circle indicator
    const ringGeo = new THREE.RingGeometry(0.08, 0.1, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    this.excavationIndicator = new THREE.Mesh(ringGeo, ringMat);
    this.excavationIndicator.visible = false;
    this.scene.add(this.excavationIndicator);
  }

  _loadHands() {
    const hands = assetRegistry.getClonedModel('SU_Suit_FirstPerson_Hands.glb');
    if (hands) {
      hands.scale.setScalar(0.75);
      hands.position.set(0.15, -0.32, -0.45);
      hands.rotation.set(0, Math.PI, 0);
      hands.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      this.handsGroup.add(hands);
    }
  }

  updateEquippedTool() {
    const toolDef = this.inventory.getEquippedToolDef();
    if (toolDef === this.currentToolDef) return;

    this.currentToolDef = toolDef;
    this.isMining = false;
    this.laserBeam.visible = false;
    this.laserGlow.visible = false;
    this.laserLight.visible = false;
    this.scannerCone.visible = false;
    this.excavationIndicator.visible = false;
    audio.stopLaser();

    // Toggle construction mode if tool is construction fabricator
    if (this.buildingSystem) {
      this.buildingSystem.setActive(toolDef && toolDef.type === 'builder');
    }

    // Clear current tool model
    while (this.toolGroup.children.length > 0) {
      this.toolGroup.remove(this.toolGroup.children[0]);
    }

    if (!toolDef) return;

    const model = assetRegistry.getClonedModel(toolDef.model);
    if (model) {
      model.scale.setScalar(toolDef.scale || 0.46);
      const off = toolDef.offset || [0.22, -0.24, -0.42];
      const rot = toolDef.rotation || [0.08, -Math.PI / 2 + 0.1, -0.05];
      model.position.set(off[0], off[1], off[2]);
      model.rotation.set(rot[0], rot[1], rot[2]);
      model.traverse(c => {
        if (c.isMesh) {
          c.castShadow = false;
          c.receiveShadow = false;
        }
      });
      this.toolGroup.add(model);
      this.activeToolModel = model;
    }
  }

  setPlanetGravity(planetId) {
    const g = PLANET_GRAVITY[planetId] || MARS_GRAVITY;
    if (this.gravity === g) return;
    this.gravity = g;
    this.jumpHeight = PLANET_JUMP_HEIGHT[planetId] || 2.0;
    const config = getPlanetWorldConfig(planetId);
    this.hasSolidSurface = config?.hasSolidSurface !== false;
  }

  getJumpForce() {
    // Derive launch velocity from the target jump height so the arc stays
    // consistent across planets instead of using a hardcoded Mars-only value.
    return Math.sqrt(2 * this.gravity * this.jumpHeight);
  }

  update(delta, now) {
    if (this.isMovementLocked || (this.vehicleSystem && this.vehicleSystem.isDriving)) {
      if (this.viewmodelHolder) this.viewmodelHolder.visible = false;
      return;
    }
    this.viewmodelHolder.visible = true;

    this._handleLook(delta);
    this._handleMovement(delta);
    this._handleViewBobbing(delta);
    this._updateToolSway(delta);
    this._handleToolActions(delta, now);
    this.updateEquippedTool();

    // Auto-pickup nearby physical drops
    if (this.physics) {
      const picked = this.physics.getNearbyDrops(this.position, 2.2);
      for (const drop of picked) {
        this.inventory.addItem(drop.itemId, 1);
        audio.playPickupChime();
        this.onResourceCollected?.({ name: drop.itemId, count: 1 });
      }
    }
  }

  _handleLook(delta) {
    const mouseDelta = input.consumeMouseDelta();
    const sensitivity = 0.0022;

    this.yaw -= mouseDelta.x * sensitivity;
    this.pitch -= mouseDelta.y * sensitivity;

    const maxPitch = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);

    this.swayTarget.x = THREE.MathUtils.clamp(-mouseDelta.x * 0.0008, -0.04, 0.04);
    this.swayTarget.y = THREE.MathUtils.clamp(mouseDelta.y * 0.0008, -0.04, 0.04);
  }

  _handleMovement(delta) {
    // No solid surface (gas giants, ice giants, Sun): lock player in place.
    if (!this.hasSolidSurface) {
      this.velocity.set(0, 0, 0);
      this.isGrounded = false;
      return;
    }

    const moveInput = input.getMovementVector();
    this.isSprinting = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight') || input.touchSprint;
    this.isCrouching = input.isKeyDown('KeyC') || input.isKeyDown('ControlLeft') || input.touchCrouch;

    let targetSpeed = WALK_SPEED;
    if (this.isCrouching) targetSpeed = CROUCH_SPEED;
    else if (this.isSprinting && moveInput.forward > 0) targetSpeed = SPRINT_SPEED;

    const forwardVec = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const rightVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const desiredDir = new THREE.Vector3()
      .addScaledVector(forwardVec, moveInput.forward)
      .addScaledVector(rightVec, moveInput.right);

    if (desiredDir.lengthSq() > 0.001) desiredDir.normalize();

    const accel = this.isGrounded ? 18.0 : 4.0;
    this.velocity.x += (desiredDir.x * targetSpeed - this.velocity.x) * Math.min(1.0, accel * delta);
    this.velocity.z += (desiredDir.z * targetSpeed - this.velocity.z) * Math.min(1.0, accel * delta);

    // Gravity
    this.velocity.y -= this.gravity * delta;

    // Jump
    const jumpRequested = input.isKeyDown('Space') || input.touchJump;
    if (jumpRequested && this.isGrounded) {
      this.velocity.y = this.getJumpForce();
      this.isGrounded = false;
      audio.playFootstep('rock');
    }

    // Integrate position with subterranean collision safeguards
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;
    const playerRadius = 0.4; // Approximate astronaut collision radius
    const checkHeights = [
      this.position.y - 0.85, // Feet level
      this.position.y - 0.7,  // Waist level (existing)
      this.position.y + 0.45  // Head / camera level
    ];

    // Check if moving horizontally into unexcavated solid rock at any body height.
    // Offset the check point by playerRadius in the movement direction so the
    // player's full collision volume is tested, not just the center line.
    const dxSign = this.velocity.x > 0 ? playerRadius : this.velocity.x < 0 ? -playerRadius : 0;
    const dzSign = this.velocity.z > 0 ? playerRadius : this.velocity.z < 0 ? -playerRadius : 0;

    let hitSolidX = false;
    let hitSolidZ = false;
    for (const cy of checkHeights) {
      if (this.terrain.sampleDensity(nextX + dxSign, cy, this.position.z + dzSign * 0.5) > 0.1) {
        hitSolidX = true;
      }
      if (this.terrain.sampleDensity(this.position.x + dxSign * 0.5, cy, nextZ + dzSign) > 0.1) {
        hitSolidZ = true;
      }
      if (hitSolidX && hitSolidZ) break;
    }

    if (hitSolidX) {
      this.velocity.x = 0;
    } else {
      this.position.x = nextX;
    }

    if (hitSolidZ) {
      this.velocity.z = 0;
    } else {
      this.position.z = nextZ;
    }

    // Building collision: prevent walking into placed structures
    if (this.buildingSystem && this.buildingSystem.placedBuildings) {
      const playerY = this.position.y;
      const playerTop = playerY + PLAYER_EYE_HEIGHT;
      for (const b of this.buildingSystem.placedBuildings) {
        if (!b.mesh) continue;
        const box = new THREE.Box3().setFromObject(b.mesh);
        // Expand box slightly by player radius for comfortable clearance
        box.expandByScalar(0.35);
        if (nextX >= box.min.x && nextX <= box.max.x &&
            nextZ >= box.min.z && nextZ <= box.max.z &&
            playerY < box.max.y && playerTop > box.min.y) {
          // Inside building: reject movement
          this.velocity.x = 0;
          this.velocity.z = 0;
          break;
        }
      }
    }

    // Ceiling collision check when jumping in a tunnel
    if (this.velocity.y > 0) {
      const headY = this.position.y + PLAYER_EYE_HEIGHT + 0.1;
      if (this.terrain.sampleDensity(this.position.x, headY, this.position.z) > 0.05) {
        this.velocity.y = 0; // Bonk ceiling
      }
    }
    this.position.y += this.velocity.y * delta;

    // Walkable floor sampling (accounts for excavated trenches, deep shafts, and underground caverns)
    const groundFloor = this.terrain.getWalkableFloor(this.position.x, this.position.y, this.position.z);
    const targetEyeH = this.isCrouching ? CROUCH_EYE_HEIGHT : PLAYER_EYE_HEIGHT;
    this.currentEyeHeight += (targetEyeH - this.currentEyeHeight) * Math.min(1.0, 10.0 * delta);

    if (!Number.isFinite(groundFloor)) {
      // No solid floor below — player is in an excavated hole or shaft.
      // Let gravity pull them down; do not snap to an invisible undeformed surface.
      this.isGrounded = false;
    } else {
      const minPlayerY = groundFloor + this.currentEyeHeight;

      if (this.position.y <= minPlayerY) {
        this.position.y = minPlayerY;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        this.isGrounded = false;
      }
    }

    // Safety net: if player falls out of world bounds below -165m, recover safely to surface
    if (this.position.y < -165) {
      this.respawnToSafeSurface();
      return;
    }

    this.camera.position.copy(this.position);

    // Step audio cadence
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.isGrounded && horizSpeed > 0.6) {
      this.lastStepDist += horizSpeed * delta;
      const stepInterval = this.isSprinting ? 2.2 : 1.6;
      if (this.lastStepDist > stepInterval) {
        audio.playFootstep('regolith');
        this.lastStepDist = 0;
      }
    }
  }

  _handleViewBobbing(delta) {
    const horizSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (this.isGrounded && horizSpeed > 0.5) {
      const bobFreq = this.isSprinting ? 14 : 9;
      this.bobTimer += delta * bobFreq;
      this.bobAmount.x = Math.cos(this.bobTimer * 0.5) * 0.012;
      this.bobAmount.y = Math.sin(this.bobTimer) * 0.018;
    } else {
      this.bobAmount.x += (0 - this.bobAmount.x) * Math.min(1.0, 8.0 * delta);
      this.bobAmount.y += (0 - this.bobAmount.y) * Math.min(1.0, 8.0 * delta);
    }
    this.viewmodelHolder.position.set(this.bobAmount.x, this.bobAmount.y, 0);
  }

  _updateToolSway(delta) {
    this.currentSway.x += (this.swayTarget.x - this.currentSway.x) * Math.min(1.0, 12.0 * delta);
    this.currentSway.y += (this.swayTarget.y - this.currentSway.y) * Math.min(1.0, 12.0 * delta);
    this.toolGroup.position.x = this.currentSway.x;
    this.toolGroup.position.y = this.currentSway.y;
  }

  _handleToolActions(delta, now) {
    this.terrainExcavateCooldown -= delta;

    // 1. Raycast against Resources & Volumetric Terrain
    this.raycaster.setFromCamera(this._centerNDC, this.camera);
    this.raycaster.far = 16.0;
    const resourceTargets = this.resourceManager.getRaycastTargets();
    const terrainMeshes = this.terrain.getRaycastMeshes();
    const allTargets = resourceTargets.length > 0 ? resourceTargets.concat(terrainMeshes) : terrainMeshes;

    const hits = this.raycaster.intersectObjects(allTargets, true);

    let targetResource = null;
    let targetTerrainHit = null;

    if (hits.length > 0) {
      for (const h of hits) {
        // Stop searching behind solid terrain once a closer terrain surface was already hit
        if (targetTerrainHit && h.distance > targetTerrainHit.distance + 0.35) {
          break;
        }
        let p = h.object;
        while (p && !p.userData.isResource && !p.userData.isTerrain) {
          p = p.parent;
        }
        if (p && p.userData.isResource && !targetResource) {
          targetResource = {
            nodeId: p.userData.nodeId,
            point: h.point,
            distance: h.distance
          };
          break;
        } else if (p && p.userData.isTerrain && !targetTerrainHit) {
          const worldNormal = h.face
            ? h.face.normal.clone().transformDirection(h.object.matrixWorld)
            : new THREE.Vector3(0, 1, 0);
          targetTerrainHit = {
            point: h.point,
            distance: h.distance,
            chunkKey: p.userData.chunkKey,
            normal: worldNormal
          };
        }
      }
    }

    this.currentTargetNode = targetResource ? this.resourceManager.getNode(targetResource.nodeId) : null;
    this.currentTerrainHit = targetTerrainHit;

    // Update Excavation Reticle Indicator
    const toolDef = this.currentToolDef;
    if (targetTerrainHit && toolDef && (toolDef.type === 'excavation_laser' || toolDef.type === 'drill' || toolDef.type === 'manipulator' || toolDef.type === 'collector')) {
      this.excavationIndicator.position.copy(targetTerrainHit.point).addScaledVector(targetTerrainHit.normal, 0.05);
      this.excavationIndicator.quaternion.setFromUnitVectors(this._zAxis, targetTerrainHit.normal);
      const rad = toolDef.excavationRadius || 1.8;
      this.excavationIndicator.scale.set(rad, rad, rad);
      this.excavationIndicator.visible = true;
    } else {
      this.excavationIndicator.visible = false;
    }

    // 2. Process Tool Usage (LMB, Touch Mine, or RMB for Gravimetric Manipulator fill)
    const isPrimaryActive = input.isPrimaryActionActive();
    const isSecondaryFill = toolDef && toolDef.type === 'manipulator' && input.isSecondaryActionActive();

    if ((isPrimaryActive || isSecondaryFill) && toolDef) {
      // A. EXCAVATION LASER (Continuous beam, deforms terrain, mines ores)
      if (toolDef.type === 'excavation_laser') {
        const maxRange = toolDef.range || 8.5;
        const emitterPos = new THREE.Vector3();
        if (this.activeToolModel) {
          this.activeToolModel.getWorldPosition(emitterPos);
        } else {
          emitterPos.copy(this.camera.position).addScaledVector(this.camera.getWorldDirection(new THREE.Vector3()), 0.4);
        }

        const laserEnd = new THREE.Vector3();
        const useResource = targetResource && targetResource.distance <= maxRange &&
          (!targetTerrainHit || targetResource.distance <= targetTerrainHit.distance + 0.35);

        if (useResource) {
          laserEnd.copy(targetResource.point);
          // Mine mineral deposit
          this.resourceManager.damageNode(targetResource.nodeId, toolDef.damage * delta, toolDef, (depleted) => {
            this.inventory.addItem(depleted.itemId, depleted.count);
            if (this.onResourceCollected) this.onResourceCollected(depleted);
          });
        } else if (targetTerrainHit && targetTerrainHit.distance <= maxRange) {
          laserEnd.copy(targetTerrainHit.point);

          // REAL TERRAIN EXCAVATION (Deform volumetric terrain volume)
          if (this.terrainExcavateCooldown <= 0) {
            const rad = toolDef.excavationRadius || 1.75;
            const res = this.terrain.carveSphere(targetTerrainHit.point, rad, false);
            this.resourceManager.spawnHitParticles(targetTerrainHit.point, 0xff7722, 10);
            audio.playRockCrumble();

            if (this.physics) {
              this.physics.onTerrainCarved(targetTerrainHit.point, rad);
            }

            if (res.yieldCount > 0) {
              this.inventory.addItem(res.yieldItem, 1);
              if (this.onGeologyDiscovered) {
                this.onGeologyDiscovered(res);
              }
            }
            this.terrainExcavateCooldown = 0.12; // Continuous smooth carving
          }
        } else {
          const dir = new THREE.Vector3();
          this.camera.getWorldDirection(dir);
          laserEnd.copy(this.camera.position).addScaledVector(dir, maxRange);
        }

        // Render laser beam
        const bDir = new THREE.Vector3().subVectors(laserEnd, emitterPos);
        const bLen = bDir.length();
        this.laserBeam.position.copy(emitterPos);
        this.laserBeam.quaternion.setFromUnitVectors(this._zAxis, bDir.normalize());
        this.laserBeam.scale.set(1 + Math.sin(now * 0.05) * 0.2, 1 + Math.sin(now * 0.05) * 0.2, bLen);
        this.laserBeam.visible = true;

        if (useResource || (targetTerrainHit && targetTerrainHit.distance <= maxRange)) {
          this.laserGlow.position.copy(laserEnd);
          this.laserGlow.visible = true;
        } else {
          this.laserGlow.visible = false;
        }

        audio.startLaser();
        this.isMining = true;
      }
      // B. THERMAL CORE DRILL (Heavy excavation & rotary boring)
      else if (toolDef.type === 'drill') {
        this.drillRotation += delta * 24.0;
        if (this.activeToolModel) {
          this.activeToolModel.rotation.z += delta * 20.0;
        }

        if (targetTerrainHit && targetTerrainHit.distance <= (toolDef.range || 5.5)) {
          if (this.terrainExcavateCooldown <= 0) {
            const rad = toolDef.excavationRadius || 2.4;
            const res = this.terrain.carveSphere(targetTerrainHit.point, rad, false);
            this.resourceManager.spawnHitParticles(targetTerrainHit.point, 0xffaa33, 14);
            audio.playHammerStrike();

            if (this.physics) {
              this.physics.onTerrainCarved(targetTerrainHit.point, rad);
            }

            if (res && res.yieldCount > 0 && res.yieldItem) {
              this.inventory.addItem(res.yieldItem, res.yieldCount);
              if (this.onGeologyDiscovered) {
                this.onGeologyDiscovered(res);
              }
            }
            this.terrainExcavateCooldown = 0.18;
          }
        }
      }
      // C. GRAVIMETRIC TERRAIN MANIPULATOR (Carve or Extrude)
      else if (toolDef.type === 'manipulator') {
        if (targetTerrainHit && targetTerrainHit.distance <= (toolDef.range || 12.0)) {
          if (this.terrainExcavateCooldown <= 0) {
            const rad = toolDef.excavationRadius || 2.8;
            const isFill = input.mouseButtons[2]; // Right click builds
            const res = this.terrain.carveSphere(targetTerrainHit.point, rad, isFill);
            this.resourceManager.spawnHitParticles(targetTerrainHit.point, isFill ? 0x00ff88 : 0x00f0ff, 8);
            if (this.physics && !isFill) {
              this.physics.onTerrainCarved(targetTerrainHit.point, rad);
            }
            if (!isFill && res && res.yieldCount > 0 && res.yieldItem) {
              this.inventory.addItem(res.yieldItem, 1);
              if (this.onGeologyDiscovered) {
                this.onGeologyDiscovered(res);
              }
            }
            this.terrainExcavateCooldown = 0.15;
          }
        }
      }
      // D. ROCK HAMMER (Strike)
      else if (toolDef.type === 'strike') {
        if (this.hammerSwingProgress < 0) {
          this.hammerSwingProgress = 0;
        }
      }
      // D2. CRYO SAMPLE COLLECTOR (Gentle regolith/ice scoop)
      else if (toolDef.type === 'collector') {
        if (targetTerrainHit && targetTerrainHit.distance <= (toolDef.range || 5.0) && this.terrainExcavateCooldown <= 0) {
          const rad = toolDef.excavationRadius || 1.25;
          const res = this.terrain.carveSphere(targetTerrainHit.point, rad, false);
          this.resourceManager.spawnHitParticles(targetTerrainHit.point, 0x90e4f5, 8);
          audio.playPickupChime();
          if (res && res.yieldItem) {
            this.inventory.addItem(res.yieldItem, 1);
            if (this.onGeologyDiscovered) this.onGeologyDiscovered(res);
            if (this.onSampleCollected) {
              this.onSampleCollected({
                itemId: res.yieldItem,
                count: 1,
                position: { x: targetTerrainHit.point.x, y: targetTerrainHit.point.y, z: targetTerrainHit.point.z },
                planetId: this.terrain?.planetId || 'mars'
              });
            }
          }
          this.terrainExcavateCooldown = 0.25;
        }
      }
      // E. SCIENTIFIC SCANNERS
      else if (toolDef.type === 'scanner') {
        this.scannerCone.visible = true;
        const justPressed = isPrimaryActive && !this._prevPrimaryActive;
        if (justPressed && this.scannerCooldown <= 0 && this.onOrganismScan) {
          const result = this.onOrganismScan(this.position);
          audio.playScannerPing();
          if (result?.organism) {
            this.scannerCooldown = 1.0;
            if (this.onScanResult) this.onScanResult(result);
          } else {
            this.scannerCooldown = 0.5;
          }
        }
      }
      // F. MODULAR BASE FABRICATOR
      else if (toolDef.type === 'builder') {
        if (this.buildingSystem) {
          this.buildingSystem.tryPlace((placedMod) => {
            if (this.onResourceCollected) {
              this.onResourceCollected({ name: `Built: ${placedMod.name}`, count: 1 });
            }
          });
        }
      }
    } else {
      if (this.isMining) {
        this.isMining = false;
        this.laserBeam.visible = false;
        this.laserGlow.visible = false;
        audio.stopLaser();
      }
      if (toolDef && toolDef.type === 'scanner') {
        this.scannerCone.visible = false;
      }
    }

    // Animate hammer swing
    if (this.hammerSwingProgress >= 0) {
      this.hammerSwingProgress += delta * 4.5;
      if (this.activeToolModel) {
        if (this.hammerSwingProgress < 0.5) {
          const f = this.hammerSwingProgress / 0.5;
          this.activeToolModel.rotation.x = 0.08 + Math.sin(f * Math.PI) * 0.85;
          this.activeToolModel.position.z = -0.42 - Math.sin(f * Math.PI) * 0.15;
        } else if (this.hammerSwingProgress < 1.0) {
          const f = (this.hammerSwingProgress - 0.5) / 0.5;
          this.activeToolModel.rotation.x = 0.08 + (1 - f) * 0.85;
          this.activeToolModel.position.z = -0.42 - (1 - f) * 0.15;
        } else {
          // Impact point strike
          if (targetResource && targetResource.distance <= 3.8) {
            this.resourceManager.damageNode(targetResource.nodeId, toolDef.damage, toolDef, (depleted) => {
              this.inventory.addItem(depleted.itemId, depleted.count);
              if (this.onResourceCollected) this.onResourceCollected(depleted);
            });
          } else if (targetTerrainHit && targetTerrainHit.distance <= 3.8) {
            // Chisel small terrain volume
            this.terrain.carveSphere(targetTerrainHit.point, 1.2, false);
            this.resourceManager.spawnHitParticles(targetTerrainHit.point, 0x887766, 12);
            audio.playHammerStrike();
            this.inventory.addItem('martian_regolith', 1);
          }
          this.hammerSwingProgress = -1;
          const off = toolDef.offset || [0.22, -0.22, -0.40];
          const rot = toolDef.rotation || [0.12, -Math.PI / 2 + 0.15, -0.05];
          this.activeToolModel.position.set(off[0], off[1], off[2]);
          this.activeToolModel.rotation.set(rot[0], rot[1], rot[2]);
        }
      }
    }

    this._prevPrimaryActive = isPrimaryActive;
    if (this.scannerCooldown > 0) this.scannerCooldown -= delta;
  }

  syncCameraTransform() {
    const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
    this.camera.position.copy(this.position);
    this.camera.updateMatrixWorld(true);

    // Camera obstruction: if camera is inside building/terrain geometry,
    // push it back along the view direction to prevent clipping.
    const camPos = this.camera.position;
    const camDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this._camRayOrigin.copy(camPos).addScaledVector(camDir, -0.15);
    this._camRayDir.copy(camDir).negate();
    this._camRaycaster.ray.origin.copy(this._camRayOrigin);
    this._camRaycaster.ray.direction.copy(this._camRayDir);

    const obstructions = [];
    if (this.buildingSystem && this.buildingSystem.placedBuildings) {
      for (const b of this.buildingSystem.placedBuildings) {
        if (b.mesh) obstructions.push(b.mesh);
      }
    }
    const terrainMeshes = this.terrain ? this.terrain.getRaycastMeshes() : [];
    const allTargets = obstructions.concat(terrainMeshes);

    if (allTargets.length > 0) {
      const hits = this._camRaycaster.intersectObjects(allTargets, false);
      if (hits.length > 0 && hits[0].distance < 0.35) {
        // Camera is inside or too close to geometry; push it forward out of the obstruction
        const pushDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        camPos.copy(hits[0].point).addScaledVector(pushDir, 0.12);
        this.camera.position.copy(camPos);
        this.camera.updateMatrixWorld(true);
      }
    }
  }

  resetTransientState() {
    this.velocity.set(0, 0, 0);
    this.isMining = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.isMovementLocked = false;
    this.hammerSwingProgress = -1;
    this.terrainExcavateCooldown = 0;
    this.currentTargetNode = null;
    this.currentTerrainHit = null;
    this.swayTarget.x = 0;
    this.swayTarget.y = 0;
    this.currentSway.x = 0;
    this.currentSway.y = 0;
    this.bobAmount.x = 0;
    this.bobAmount.y = 0;
    if (this.laserBeam) this.laserBeam.visible = false;
    if (this.laserGlow) this.laserGlow.visible = false;
    if (this.laserLight) this.laserLight.visible = false;
    if (this.scannerCone) this.scannerCone.visible = false;
    if (this.excavationIndicator) this.excavationIndicator.visible = false;
    if (this.viewmodelHolder) this.viewmodelHolder.visible = true;
    audio.stopLaser();
    this.syncCameraTransform();
  }

  clearDeployedWorkLights() {
    if (!this.deployedWorkLights) return;
    for (const grp of this.deployedWorkLights) {
      this.scene.remove(grp);
    }
    this.deployedWorkLights.length = 0;
  }

  findSafeSurfacePosition(preferredX = 0, preferredZ = 2) {
    // No solid surface: return orbital observation position.
    if (!this.hasSolidSurface) {
      return new THREE.Vector3(preferredX, 50, preferredZ);
    }

    const candidates = [
      [preferredX, preferredZ],
      [0, 2],
      [4, 4],
      [-4, 4],
      [6, -2],
      [0, -6]
    ];

    for (const [cx, cz] of candidates) {
      this.terrain.update({ x: cx, y: 8, z: cz }, true);
      const baseH = this.terrain.getBaseHeight(cx, cz);
      let safeFloor = this.terrain.getWalkableFloor(cx, baseH + 6.0, cz, 20.0);
      if (!Number.isFinite(safeFloor) || safeFloor < baseH - 12.0) {
        safeFloor = baseH;
      }
      let eyeY = safeFloor + PLAYER_EYE_HEIGHT;
      // Ensure body & head are not inside solid voxel fill
      let guard = 0;
      while (guard < 12 && (
        this.terrain.sampleDensity(cx, eyeY - 0.7, cz) > 0.05 ||
        this.terrain.sampleDensity(cx, eyeY, cz) > 0.05
      )) {
        eyeY += 1.0;
        guard++;
      }
      if (guard < 12) {
        return new THREE.Vector3(cx, eyeY, cz);
      }
    }

    const fallbackH = this.terrain.getBaseHeight(0, 2);
    return new THREE.Vector3(0, fallbackH + PLAYER_EYE_HEIGHT + 0.5, 2);
  }

  respawnToSafeSurface() {
    this.resetTransientState();
    const safePos = this.findSafeSurfacePosition(0, 2);
    this.position.copy(safePos);
    this.yaw = 0;
    this.pitch = -0.08;
    this.currentEyeHeight = PLAYER_EYE_HEIGHT;
    this.isGrounded = this.hasSolidSurface;
    this.terrain.update(this.position, true);
    this.syncCameraTransform();
    return safePos;
  }

  getState() {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      yaw: this.yaw,
      pitch: this.pitch,
      flashlight: this.isFlashlightOn
    };
  }

  loadState(state) {
    if (!state) return;
    this.resetTransientState();
    this.position.set(
      Number.isFinite(state.x) ? state.x : 0,
      Number.isFinite(state.y) ? state.y : 5,
      Number.isFinite(state.z) ? state.z : 0
    );
    this.yaw = Number.isFinite(state.yaw) ? state.yaw : 0;
    this.pitch = Number.isFinite(state.pitch) ? state.pitch : 0;
    if (state.flashlight !== undefined) {
      this.isFlashlightOn = Boolean(state.flashlight);
      this.flashlight.visible = this.isFlashlightOn;
      if (this.suitFillLight) this.suitFillLight.visible = this.isFlashlightOn;
    }
    this.syncCameraTransform();
  }
}
