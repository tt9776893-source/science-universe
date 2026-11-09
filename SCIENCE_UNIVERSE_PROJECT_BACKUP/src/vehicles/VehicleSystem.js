import * as THREE from 'three';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';
import { input } from '../core/InputManager.js';

export class VehicleSystem {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    this.activeRover = null;
    this.isDriving = false;
    this.roverSpeed = 0;
    this.roverSteer = 0;
    this.maxSpeed = 16.0; // m/s
    this.accel = 12.0;

    this._spawnStarterRover();
  }

  _spawnStarterRover() {
    const startX = 4;
    const startZ = 5;
    const startY = this.terrain.getBaseHeight(startX, startZ);

    let model = assetRegistry.getClonedModel('SU_Vehicle_Explorer_Rover.glb');
    if (!model) {
      // Procedural rover fallback
      const geo = new THREE.BoxGeometry(3.2, 1.6, 4.8);
      const mat = new THREE.MeshStandardMaterial({ color: 0xcc7722, metalness: 0.6, roughness: 0.4 });
      model = new THREE.Mesh(geo, mat);
    } else {
      model.scale.setScalar(0.95);
    }

    // Compute bounding box to ensure wheels align with terrain floor
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const bottomY = bbox.min.y;
    const wheelOffset = (bottomY < 0 ? -bottomY : 0.1);

    model.position.set(startX, startY + wheelOffset, startZ);
    model.rotation.y = -Math.PI / 4;
    model.castShadow = true;
    model.receiveShadow = true;
    this.scene.add(model);

    // Rover Headlight (enabled only when driving to save GPU fragment shader cost while parked)
    const headLight = new THREE.SpotLight(0xfffaea, 3.6, 40, Math.PI / 4.2, 0.45);
    headLight.position.set(0, 1.1, 2.2);
    headLight.target.position.set(0, 0, 16);
    headLight.visible = false;
    model.add(headLight);
    model.add(headLight.target);

    this.activeRover = {
      model: model,
      position: model.position,
      yaw: 0,
      wheelOffset: wheelOffset,
      lights: [headLight]
    };

    this._alignRoverToTerrain();
  }

  _alignRoverToTerrain() {
    if (!this.activeRover) return;
    const pos = this.activeRover.position;
    const normal = this.terrain.getNormalAt(pos.x, pos.z);

    // Build orientation aligning with terrain slope
    const forward = new THREE.Vector3(Math.sin(this.activeRover.yaw), 0, Math.cos(this.activeRover.yaw));
    const tangent = new THREE.Vector3().crossVectors(normal, forward).cross(normal).normalize();
    const right = new THREE.Vector3().crossVectors(tangent, normal).normalize();

    const rotMatrix = new THREE.Matrix4().makeBasis(right, normal, tangent);
    this.activeRover.model.quaternion.setFromRotationMatrix(rotMatrix);
  }

  getDistanceToPlayer(playerPos) {
    if (!this.activeRover) return 999;
    return this.activeRover.position.distanceTo(playerPos);
  }

  enterVehicle(player) {
    if (!this.activeRover || this.isDriving) return false;
    this.isDriving = true;
    for (const l of this.activeRover.lights) l.visible = true;
    audio.playClick();
    return true;
  }

  exitVehicle(player) {
    if (!this.isDriving || !this.activeRover) return false;
    this.isDriving = false;
    this.roverSpeed = 0;
    for (const l of this.activeRover.lights) l.visible = false;
    // Position player safely beside rover
    if (player) {
      player.position.set(
        this.activeRover.position.x - 2.5,
        this.activeRover.position.y + 1.6,
        this.activeRover.position.z
      );
    }
    audio.playClick();
    return true;
  }

  resetToStarterPosition() {
    this.isDriving = false;
    this.roverSpeed = 0;
    this.roverSteer = 0;
    if (!this.activeRover) return;
    for (const l of this.activeRover.lights) l.visible = false;
    const startX = 4;
    const startZ = 5;
    const startY = this.terrain.getBaseHeight(startX, startZ);
    this.activeRover.position.set(startX, startY + this.activeRover.wheelOffset, startZ);
    this.activeRover.yaw = 0;
    this._alignRoverToTerrain();
  }

  update(delta, player, camera) {
    if (!this.activeRover) return;

    if (this.isDriving) {
      // Read driving input
      const move = input.getMovementVector();
      const steerInput = move.right;
      const throttleInput = move.forward;

      // Steering
      this.activeRover.yaw -= steerInput * 1.8 * delta;

      // Acceleration & Braking
      if (throttleInput !== 0) {
        this.roverSpeed += throttleInput * this.accel * delta;
        this.roverSpeed = THREE.MathUtils.clamp(this.roverSpeed, -this.maxSpeed * 0.4, this.maxSpeed);
      } else {
        // Coasting friction
        this.roverSpeed += (0 - this.roverSpeed) * 3.0 * delta;
      }

      // Move rover forward
      const fwd = new THREE.Vector3(Math.sin(this.activeRover.yaw), 0, Math.cos(this.activeRover.yaw));
      this.activeRover.position.addScaledVector(fwd, this.roverSpeed * delta);

      // Clamp to terrain floor (uses the body-safe query so carved shafts don't teleport the rover)
      const groundY = this.terrain.getFloorHeightForBody(this.activeRover.position.x, this.activeRover.position.y, this.activeRover.position.z);
      this.activeRover.position.y = groundY + this.activeRover.wheelOffset;

      // Align model to terrain slope
      this._alignRoverToTerrain();

      // Follow camera
      const camOffset = new THREE.Vector3(
        -Math.sin(this.activeRover.yaw) * 6.5,
        3.2,
        -Math.cos(this.activeRover.yaw) * 6.5
      );
      camera.position.copy(this.activeRover.position).add(camOffset);
      camera.lookAt(this.activeRover.position.x, this.activeRover.position.y + 1.2, this.activeRover.position.z);

      // Keep player coordinates synced
      player.position.copy(this.activeRover.position);
    }
  }

  getState() {
    if (!this.activeRover) return null;
    return {
      x: this.activeRover.position.x,
      y: this.activeRover.position.y,
      z: this.activeRover.position.z,
      yaw: this.activeRover.yaw
    };
  }

  loadState(state) {
    if (!state || !this.activeRover) return;
    this.activeRover.position.set(state.x, state.y, state.z);
    this.activeRover.yaw = state.yaw || 0;
    this._alignRoverToTerrain();
  }
}
