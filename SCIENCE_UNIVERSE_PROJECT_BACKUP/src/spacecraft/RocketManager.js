import * as THREE from 'three';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';
import { input } from '../core/InputManager.js';
import { getPlanetWorldConfig, resolvePlanetEnvironment } from '../world/PlanetEnvironment.js';

export const LANDING_SPEED_PROFILES = {
  NORMAL: { multiplier: 1.0, label: 'NORMAL (1×)' },
  FAST: { multiplier: 2.0, label: 'FAST (2×) [Default]' },
  CINEMATIC: { multiplier: 0.75, label: 'CINEMATIC (0.75×)' }
};

/**
 * Manages the surface rocket / spacecraft:
 * - Launch pad and rocket model placement on the planetary surface.
 * - Player enter / exit cockpit transitions with safe collision placement.
 * - Multi-stage cinematic launch sequence into solar system orbit.
 * - Multi-stage high-speed retro descent, smooth braking, and controlled touchdown.
 * - Clear game state machine: IN_SPACE, APPROACHING, DESCENDING, TOUCHDOWN, LANDED, EXITING, SURFACE_EXPLORATION.
 */
export class RocketManager {
  constructor(scene, terrain, player, camera, onLaunchComplete, onExitRocket) {
    this.scene = scene;
    this.terrain = terrain;
    this.player = player;
    this.camera = camera;
    this.onLaunchComplete = onLaunchComplete;
    this.onExitRocket = onExitRocket;

    // Spacecraft states: 'IN_SPACE', 'APPROACHING', 'DESCENDING', 'TOUCHDOWN', 'LANDED', 'EXITING', 'SURFACE_EXPLORATION', 'ASCENT'
    this.state = 'SURFACE_EXPLORATION';
    this.currentPlanetId = 'mars';
    this.isPlayerInside = false;
    this._isExiting = false;

    // Landing speed configuration (Default: FAST 2x)
    this.landingSpeedMode = 'FAST';
    this.touchdownTimer = 0;

    // Launch pad location (near Jezero Base at X = 16, Z = 16)
    this.padOrigin = new THREE.Vector3(16, 0, 16);
    this.surfaceRegion = 'Jezero Crater';
    this.rocketScale = 0.42;

    this.rocketGroup = new THREE.Group();
    this.scene.add(this.rocketGroup);

    this.launchTimer = 0;
    this.currentAltitude = 0;
    this.verticalVelocity = 0;
    this.landedY = 0;

    // Camera shake
    this.shakeAmount = 0;
    this.cockpitEyeOffset = new THREE.Vector3(0, 7.5, 0);

    this._initLaunchPadAndRocket();
    this._initExhaustPlume();
    this._initGroundDust();
    this._initKeyboardListener();
  }

  setLandingSpeedMode(mode) {
    if (LANDING_SPEED_PROFILES[mode]) {
      this.landingSpeedMode = mode;
      this._updateSpeedBadgeUI();
    }
  }

  getLandingSpeedMultiplier() {
    return LANDING_SPEED_PROFILES[this.landingSpeedMode]?.multiplier || 2.0;
  }

  _initKeyboardListener() {
    this._boundKeyHandler = (e) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (this.state === 'LANDED' && this.isPlayerInside) {
          e.preventDefault();
          this.exitRocket();
        }
      }
    };
    window.addEventListener('keydown', this._boundKeyHandler, true);
  }

  _initLaunchPadAndRocket() {
    const origin = this.padOrigin;
    const groundY = this.terrain.getBaseHeight(origin.x, origin.z);
    origin.y = groundY;

    // 1. Heavy Reinforced Concrete Launch Pad with blast deflector ring
    const padGeo = new THREE.CylinderGeometry(8.0, 8.8, 0.7, 32);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.8,
      metalness: 0.3
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(origin.x, origin.y + 0.35, origin.z);
    padMesh.receiveShadow = true;
    this.scene.add(padMesh);
    this.padMesh = padMesh;

    // Hazard ring markings
    const ringGeo = new THREE.RingGeometry(6.5, 7.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.set(origin.x, origin.y + 0.71, origin.z);
    this.scene.add(ringMesh);
    this.padRingMesh = ringMesh;

    // 2. Spawn Rocket Model (Vulcan Centaur or Planetary Lander fallback)
    let model = assetRegistry.getClonedModel('vulcan_centaur_rocket.glb');
    if (!model) {
      model = assetRegistry.getClonedModel('SU_Ship_Planetary_Lander.glb');
    }
    if (!model) {
      // Procedural rocket fallback
      const bodyGeo = new THREE.CylinderGeometry(1.6, 2.0, 16.0, 24);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.4, metalness: 0.6 });
      const coneGeo = new THREE.ConeGeometry(1.6, 4.0, 24);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
      const bMesh = new THREE.Mesh(bodyGeo, bodyMat);
      const cMesh = new THREE.Mesh(coneGeo, coneMat);
      cMesh.position.y = 10.0;
      model = new THREE.Group();
      model.add(bMesh);
      model.add(cMesh);
    } else {
      model.scale.setScalar(this.rocketScale);
    }

    // Align rocket base with pad surface
    model.updateMatrixWorld(true);
    const bbox = new THREE.Box3().setFromObject(model);
    const bottomY = bbox.min.y;
    const yOffset = (bottomY < 0 ? -bottomY : 0.0);

    this.rocketYOffset = 0.7 + yOffset;
    this.landedY = origin.y + this.rocketYOffset;
    this.rocketGroup.position.set(origin.x, this.landedY, origin.z);
    this.rocketGroup.add(model);
    this.rocketModel = model;

    // Consolidated launchpad floodlight illumination (replaces 4 separate SpotLights to protect integrated GPU fillrate)
    this.padFloodlight = new THREE.PointLight(0xfff5e6, 2.6, 36, 1.3);
    this.padFloodlight.position.set(origin.x - 4.0, origin.y + 9.0, origin.z - 4.0);
    this.scene.add(this.padFloodlight);
  }

  setPlanet(config) {
    if (!config?.landingSite) return false;
    this.currentPlanetId = config.planetId;
    this.surfaceRegion = config.surfaceRegion || config.landingSite.name;
    this.padOrigin.set(
      config.landingSite.x,
      this.terrain.getBaseHeight(config.landingSite.x, config.landingSite.z),
      config.landingSite.z
    );
    this.landedY = this.padOrigin.y + (this.rocketYOffset || 0.7);
    this.padMesh?.position.set(this.padOrigin.x, this.padOrigin.y + 0.35, this.padOrigin.z);
    this.padRingMesh?.position.set(this.padOrigin.x, this.padOrigin.y + 0.71, this.padOrigin.z);
    this.padFloodlight?.position.set(this.padOrigin.x - 4, this.padOrigin.y + 9, this.padOrigin.z - 4);
    this.rocketGroup.position.set(this.padOrigin.x, this.landedY, this.padOrigin.z);
    return true;
  }

  resetToSurfaceIdle() {
    this.isPlayerInside = false;
    this._isExiting = false;
    this.state = 'SURFACE_EXPLORATION';
    this.launchTimer = 0;
    this.currentAltitude = 0;
    this.verticalVelocity = 0;
    this.shakeAmount = 0;
    this.rocketGroup.visible = true;
    this.rocketGroup.position.set(this.padOrigin.x, this.landedY, this.padOrigin.z);
    this.rocketGroup.rotation.set(0, 0, 0);
    if (this.plumeGroup) this.plumeGroup.visible = false;
    if (this.rocketLight) this.rocketLight.intensity = 0;
    if (this.dustMat) this.dustMat.opacity = 0;
    this._hideCockpitHUD();
  }

  _initExhaustPlume() {
    this.plumeGroup = new THREE.Group();
    this.plumeGroup.visible = false;
    this.rocketGroup.add(this.plumeGroup);

    // Multi-layered animated rocket flame (Mach shock diamonds + outer fiery plasma)
    const vert = `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uThrust;
      void main() {
        vUv = uv;
        vec3 p = position;
        float down = 1.0 - uv.y;
        float wave = sin(down * 12.0 - uTime * 45.0) * 0.06;
        p.xz *= 1.0 + down * (0.8 + 0.4 * uThrust) + wave * down;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;

    const frag = `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uThrust;
      void main() {
        float down = 1.0 - vUv.y;
        float radial = abs(vUv.x - 0.5) * 2.0;
        float shock = pow(max(0.0, sin(down * 28.0 - uTime * 42.0)), 4.0) * (1.0 - down);
        vec3 hotCore = vec3(1.0, 0.98, 0.88);
        vec3 midFlame = vec3(1.0, 0.52, 0.12);
        vec3 tailFlame = vec3(0.92, 0.18, 0.04);
        vec3 col = mix(hotCore, midFlame, smoothstep(0.05, 0.45, down));
        col = mix(col, tailFlame, smoothstep(0.45, 0.95, down));
        col += vec3(0.6, 0.85, 1.0) * shock * 1.2;
        float alpha = smoothstep(1.0, 0.05, radial) * smoothstep(0.0, 0.08, down) * (1.0 - smoothstep(0.7, 1.0, down)) * uThrust;
        gl_FragColor = vec4(col * (1.6 + shock), clamp(alpha, 0.0, 1.0));
      }
    `;

    this.plumeUniforms = { uTime: { value: 0 }, uThrust: { value: 1.0 } };
    const plumeMat = new THREE.ShaderMaterial({
      uniforms: this.plumeUniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const coneGeo = new THREE.CylinderGeometry(0.4, 1.8, 9.0, 24, 16, true);
    coneGeo.translate(0, -4.5, 0);
    const plumeMesh = new THREE.Mesh(coneGeo, plumeMat);
    this.plumeGroup.add(plumeMesh);

    // Dynamic ground fire light
    this.rocketLight = new THREE.PointLight(0xff7722, 0, 45, 1.4);
    this.rocketLight.position.set(0, -1.0, 0);
    this.plumeGroup.add(this.rocketLight);
  }

  _initGroundDust() {
    const pCount = 350;
    const pos = new Float32Array(pCount * 3);
    this.dustVel = [];

    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 1.5 + Math.random() * 4.0;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      this.dustVel.push({
        vx: Math.cos(angle) * (6.0 + Math.random() * 12.0),
        vy: 1.0 + Math.random() * 4.0,
        vz: Math.sin(angle) * (6.0 + Math.random() * 12.0),
        life: Math.random()
      });
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(215, 130, 85, 0.9)');
    grad.addColorStop(0.35, 'rgba(185, 105, 65, 0.55)');
    grad.addColorStop(0.75, 'rgba(145, 80, 50, 0.15)');
    grad.addColorStop(1, 'rgba(120, 60, 40, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const dustTex = new THREE.CanvasTexture(canvas);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dustMat = new THREE.PointsMaterial({
      map: dustTex,
      size: 0.55,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.dustPoints = new THREE.Points(geo, this.dustMat);
    this.dustPoints.position.set(this.padOrigin.x, this.padOrigin.y + 0.5, this.padOrigin.z);
    this.scene.add(this.dustPoints);
  }

  _calculateSafeExitPosition() {
    this.rocketGroup.updateMatrixWorld(true);
    let rocketRadius = 2.2;
    if (this.rocketModel) {
      const box = new THREE.Box3().setFromObject(this.rocketModel);
      const spanX = (box.max.x - box.min.x) * 0.5;
      const spanZ = (box.max.z - box.min.z) * 0.5;
      rocketRadius = Math.max(rocketRadius, Math.max(spanX, spanZ));
    }

    // Safe clearance: outside rocket radius by at least 2.0m, min 4.8m from center
    const safeDistance = Math.max(rocketRadius + 2.0, 4.8);
    
    // Primary direction towards base / service access ramp (+X, +Z)
    const baseDir = new THREE.Vector3(1, 0, 1).normalize();
    const testAngles = [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2, Math.PI];

    for (const angle of testAngles) {
      const dir = baseDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      const targetX = this.padOrigin.x + dir.x * safeDistance;
      const targetZ = this.padOrigin.z + dir.z * safeDistance;

      const distFromCenter = Math.hypot(targetX - this.padOrigin.x, targetZ - this.padOrigin.z);
      const padSurfaceY = this.padOrigin.y + 0.7;

      let floorY = padSurfaceY;
      if (distFromCenter > 7.8) {
        const terrainFloor = this.terrain.getWalkableFloor(targetX, padSurfaceY + 2.0, targetZ);
        floorY = (terrainFloor !== undefined && !isNaN(terrainFloor)) ? terrainFloor : this.terrain.getBaseHeight(targetX, targetZ);
      }

      // Verify clearance for player capsule
      const waistDensity = this.terrain.sampleDensity(targetX, floorY + 0.9, targetZ);
      const headDensity = this.terrain.sampleDensity(targetX, floorY + 1.7, targetZ);

      if (waistDensity < 0.1 && headDensity < 0.1) {
        return new THREE.Vector3(targetX, floorY + 1.7, targetZ);
      }
    }

    // Fallback safe position on the pad
    return new THREE.Vector3(this.padOrigin.x + 4.2, this.padOrigin.y + 0.7 + 1.7, this.padOrigin.z + 4.2);
  }

  enterRocket() {
    input.exitPointerLock();
    this.isPlayerInside = true;
    this.state = 'LANDED';
    this.player.isMovementLocked = true;
    if (this.player.viewmodelHolder) this.player.viewmodelHolder.visible = false;

    // Attach player to cockpit seat so they move with the rocket during ascent
    this.player.position.set(this.padOrigin.x, this.landedY + 7.5, this.padOrigin.z);
    this.player.velocity.set(0, 0, 0);
    this.player.isGrounded = true;

    // Command capsule observation view overlooking rocket & launch complex
    this.camera.position.set(this.padOrigin.x - 14, this.landedY + 8.0, this.padOrigin.z - 14);
    this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y + 10, this.rocketGroup.position.z);

    this._showCockpitHUD();
    audio.playPowerUpChime?.();
  }

  exitRocket() {
    // Atomic check: prevent double triggering
    if (this.state !== 'LANDED' || !this.isPlayerInside || this._isExiting) return;
    this._isExiting = true;
    this.state = 'EXITING';

    // 1. Calculate safe exit coordinates
    const safePos = this._calculateSafeExitPosition();
    this.player.position.copy(safePos);
    this.player.velocity.set(0, 0, 0);
    this.player.isGrounded = true;
    this.player.yaw = Math.PI * 0.75; // Face towards the outpost base and parked rover
    this.player.pitch = 0;

    // 2. Synchronize camera with player
    this.camera.position.copy(this.player.position);
    const euler = new THREE.Euler(this.player.pitch, this.player.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);

    // 3. Unlock locomotion, mouse-look, and viewmodel
    this.player.isMovementLocked = false;
    if (this.player.viewmodelHolder) {
      this.player.viewmodelHolder.visible = true;
    }
    this.player.updateEquippedTool?.();

    // 4. Update states
    this.isPlayerInside = false;
    this.state = 'SURFACE_EXPLORATION';
    this._isExiting = false;

    // 5. Hide HUDs
    this._hideCockpitHUD();
    const prompt = document.getElementById('interaction-prompt');
    if (prompt) prompt.style.display = 'none';

    // 6. Request pointer lock for immediate mouse look
    const canvas = document.querySelector('canvas');
    if (!input.isTouchDevice && canvas && !document.pointerLockElement) {
      canvas.requestPointerLock?.().catch?.(() => {});
    }

    // 7. Invoke callback
    if (this.onExitRocket) {
      this.onExitRocket();
    }
  }

  startLaunch() {
    if (!this.isPlayerInside || this.state !== 'LANDED') return;
    this.state = 'ASCENT';
    this.launchTimer = 0;
    this.verticalVelocity = 0;
    audio.playThrusterFire?.();

    const launchBtn = document.getElementById('rocket-launch-btn');
    if (launchBtn) launchBtn.disabled = true;

    const exitBtn = document.getElementById('rocket-exit-btn');
    if (exitBtn) exitBtn.disabled = true;

    const statusText = document.getElementById('rocket-status-text');
    if (statusText) statusText.textContent = '🚀 MAIN ENGINES IGNITED • ASCENT PHASE';
  }

  startLandingSequence(targetPlanetId) {
    const environment = resolvePlanetEnvironment(targetPlanetId);
    if (!environment) return false;

    this.setPlanet(getPlanetWorldConfig(environment.planetId));
    this.state = 'APPROACHING';
    this.launchTimer = 0;
    this.touchdownTimer = 0;
    this._isExiting = false;
    this.isPlayerInside = true;
    this.player.isMovementLocked = true;
    if (this.player.viewmodelHolder) this.player.viewmodelHolder.visible = false;

    const M = this.getLandingSpeedMultiplier();
    this.verticalVelocity = -45.0 * M;

    // Position at entry altitude (420m above pad)
    this.rocketGroup.position.set(this.padOrigin.x, this.landedY + 420.0, this.padOrigin.z);
    this.rocketGroup.rotation.set(0, 0, 0);
    this.currentAltitude = 420.0;

    // Follow camera positioned viewing landing corridor
    this.camera.position.set(this.padOrigin.x + 36, this.landedY + 440, this.padOrigin.z + 42);
    this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y - 10, this.rocketGroup.position.z);

    this._showLandingHUD(environment.planetName);
    audio.playThrusterFire?.();
    return true;
  }

  _completeLaunchToSpace() {
    this.state = 'IN_SPACE';
    // Keep player seated inside the cockpit during transition to spaceflight.
    // Do not reset rocketGroup to pad position — SpaceflightSystem takes over rendering.
    this.plumeGroup.visible = false;
    this.rocketLight.intensity = 0;
    this.shakeAmount = 0;
    this._hideCockpitHUD();

    if (this.onLaunchComplete) {
      this.onLaunchComplete(this.currentPlanetId);
    }
  }

  _onLandedTouchdown() {
    input.exitPointerLock();
    this.dustMat.opacity = 0;
    this.dustPoints.visible = false;
    this.plumeGroup.visible = false;
    if (this.rocketLight) this.rocketLight.intensity = 0;
    this.shakeAmount = 0;

    const statusText = document.getElementById('rocket-status-text');
    if (statusText) {
      const environment = resolvePlanetEnvironment(this.currentPlanetId);
      statusText.textContent = `🛬 TOUCHDOWN COMPLETE • ${this.surfaceRegion}, ${environment.planetName.toUpperCase()}`;
    }

    const promptText = document.getElementById('rocket-exit-prompt');
    if (promptText) {
      promptText.style.display = 'block';
      promptText.textContent = 'PRESS [E] OR CLICK BELOW TO EXIT SPACECRAFT';
      promptText.style.color = '#38bdf8';
    }

    const exitBtn = document.getElementById('rocket-exit-btn');
    if (exitBtn) {
      exitBtn.style.display = 'inline-block';
      exitBtn.disabled = false;
      exitBtn.textContent = 'EXIT ROCKET [E]';
      exitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      exitBtn.style.borderColor = '#34d399';
      exitBtn.style.boxShadow = '0 0 16px rgba(16, 185, 129, 0.4)';
    }

    const screenPrompt = document.getElementById('interaction-prompt');
    if (screenPrompt) {
      screenPrompt.textContent = 'Press E to exit spacecraft';
      screenPrompt.style.display = 'block';
    }

    audio.playAirRelease?.();
  }

  update(delta, now) {
    if (this.plumeUniforms) {
      this.plumeUniforms.uTime.value = now * 0.001;
    }

    const M = this.getLandingSpeedMultiplier();

    // 1. High-Altitude Atmospheric Approach Phase
    if (this.state === 'APPROACHING') {
      this.launchTimer += delta;

      const maxDescentSpeed = -65.0 * M;
      this.verticalVelocity += (maxDescentSpeed - this.verticalVelocity) * Math.min(1.0, 3.2 * delta);
      this.rocketGroup.position.y += this.verticalVelocity * delta;
      this.currentAltitude = Math.max(0, this.rocketGroup.position.y - this.landedY);

      this.plumeGroup.visible = true;
      this.plumeUniforms.uThrust.value = 0.55 + Math.random() * 0.15;
      this.rocketLight.intensity = 4.0;
      this.shakeAmount = 0.03;

      this._updateLandingTelemetry(this.currentAltitude, Math.abs(this.verticalVelocity), 'APPROACHING');

      // High-angle approach camera
      const camY = Math.max(this.padOrigin.y + 14, this.rocketGroup.position.y + 18);
      this.camera.position.set(this.padOrigin.x + 36, camY, this.padOrigin.z + 42);
      this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y - 8, this.rocketGroup.position.z);

      if (this.currentAltitude <= 110.0) {
        this.state = 'DESCENDING';
        audio.playThrusterFire?.();
      }

      this._applyCameraShake();
      this._updateDustParticles(delta);
    }

    // 2. Terminal Braking & Final Soft Touchdown Phase
    else if (this.state === 'DESCENDING') {
      this.launchTimer += delta;

      let targetVy;
      if (this.currentAltitude > 14.0) {
        targetVy = -4.5 * M - (this.currentAltitude - 14.0) * 0.32 * M;
        this.verticalVelocity += (targetVy - this.verticalVelocity) * Math.min(1.0, 4.5 * delta);
      } else {
        targetVy = -1.8 - (this.currentAltitude / 14.0) * 3.0;
        this.verticalVelocity += (targetVy - this.verticalVelocity) * Math.min(1.0, 6.0 * delta);
      }

      this.rocketGroup.position.y += this.verticalVelocity * delta;
      this.currentAltitude = Math.max(0, this.rocketGroup.position.y - this.landedY);

      this.plumeGroup.visible = true;
      this.plumeUniforms.uThrust.value = 0.85 + Math.random() * 0.25;
      this.rocketLight.intensity = Math.min(10.0, 2.0 + (110.0 - this.currentAltitude) * 0.08);

      if (this.currentAltitude < 35.0) {
        this.dustMat.opacity = Math.min(0.9, (35.0 - this.currentAltitude) * 0.035);
        this.shakeAmount = 0.05 * (1.0 - this.currentAltitude / 35.0);
      }

      this._updateLandingTelemetry(this.currentAltitude, Math.abs(this.verticalVelocity), 'DESCENDING');

      // Cinematic landing camera: transitions smoothly to pad ground vantage point
      const groundCamY = Math.max(this.padOrigin.y + 3.8, this.landedY + 3.8);
      const padCamPos = new THREE.Vector3(this.padOrigin.x + 22, groundCamY, this.padOrigin.z + 22);
      const dynamicCamPos = new THREE.Vector3(
        this.padOrigin.x + 28,
        this.rocketGroup.position.y + 8,
        this.padOrigin.z + 28
      );
      const blend = Math.min(1.0, Math.max(0.0, (110.0 - this.currentAltitude) / 80.0));
      this.camera.position.lerpVectors(dynamicCamPos, padCamPos, blend);
      this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y + 3.0, this.rocketGroup.position.z);

      // Check touchdown threshold
      if (this.rocketGroup.position.y <= this.landedY + 0.08) {
        this.rocketGroup.position.y = this.landedY;
        this.rocketGroup.rotation.set(0, 0, 0);
        this.verticalVelocity = 0;
        this.state = 'TOUCHDOWN';
        this.touchdownTimer = 0;
        this.plumeGroup.visible = false;
        this.rocketLight.intensity = 0;
        this.shakeAmount = 0;
        audio.playAirRelease?.();
      }

      this._applyCameraShake();
      this._updateDustParticles(delta);
    }

    // 3. Touchdown Settling Phase
    else if (this.state === 'TOUCHDOWN') {
      this.touchdownTimer += delta;
      this.dustMat.opacity = Math.max(0, this.dustMat.opacity - delta * 1.5);

      this.camera.position.set(this.padOrigin.x + 18, this.padOrigin.y + 3.4, this.padOrigin.z + 18);
      this.camera.lookAt(this.rocketGroup.position.x, this.landedY + 3.5, this.rocketGroup.position.z);

      if (this.touchdownTimer >= 0.35) {
        this.state = 'LANDED';
        this._onLandedTouchdown();
      }
    }

    // 4. Landed Phase (waiting for player interaction)
    else if (this.state === 'LANDED') {
      if (this.isPlayerInside) {
        this.camera.position.set(this.padOrigin.x + 18, this.padOrigin.y + 3.4, this.padOrigin.z + 18);
        this.camera.lookAt(this.rocketGroup.position.x, this.landedY + 3.5, this.rocketGroup.position.z);

        if (input.isKeyDown('KeyE')) {
          this.exitRocket();
          return;
        }
      } else {
        const dist = this.player.position.distanceTo(this.padOrigin);
        const prompt = document.getElementById('interaction-prompt');
        if (dist < 6.8) {
          if (prompt) {
            prompt.textContent = '[E] ENTER SPACECRAFT / ROCKET';
            prompt.style.display = 'block';
          }
          if (input.isKeyDown('KeyE')) {
            this.enterRocket();
          }
        }
      }
    }

    // 5. Surface Exploration Phase
    else if (this.state === 'SURFACE_EXPLORATION') {
      const dist = this.player.position.distanceTo(this.padOrigin);
      const prompt = document.getElementById('interaction-prompt');
      if (dist < 6.8) {
        if (prompt) {
          prompt.textContent = '[E] ENTER SPACECRAFT / ROCKET';
          prompt.style.display = 'block';
        }
        if (input.isKeyDown('KeyE')) {
          this.enterRocket();
        }
      }
    }

    // 6. Launch Ascent Phase
    else if (this.state === 'ASCENT') {
      this.launchTimer += delta;
      const t = this.launchTimer;

      if (t < 2.5) {
        this.plumeGroup.visible = true;
        this.plumeUniforms.uThrust.value = t / 2.5;
        this.rocketLight.intensity = (t / 2.5) * 8.0;
        this.dustMat.opacity = Math.min(0.85, t * 0.4);
        this.shakeAmount = 0.08 + Math.random() * 0.06;

        this.camera.position.set(this.padOrigin.x - 20, this.landedY + 4.0, this.padOrigin.z - 20);
        this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y + 10, this.rocketGroup.position.z);
      } else if (t < 9.5) {
        const ascentT = (t - 2.5);
        this.verticalVelocity += delta * 42.0;
        this.rocketGroup.position.y += this.verticalVelocity * delta;
        this.currentAltitude = (this.rocketGroup.position.y - this.landedY);

        this.plumeUniforms.uThrust.value = 1.0 + Math.sin(t * 18.0) * 0.12;
        this.rocketLight.intensity = 8.0;
        this.dustMat.opacity = Math.max(0, 0.85 - (ascentT * 0.18));
        this.shakeAmount = 0.05 + (1.0 / (1.0 + ascentT * 0.2)) * 0.04;

        this._updateLaunchTelemetry(this.currentAltitude, this.verticalVelocity);

        this.camera.position.set(this.rocketGroup.position.x - 24, this.rocketGroup.position.y - 8, this.rocketGroup.position.z - 24);
        this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y + 12, this.rocketGroup.position.z);
      } else if (t < 13.5) {
        const turnT = (t - 9.5) / 4.0;
        this.rocketGroup.rotation.z = -turnT * 0.45;
        this.verticalVelocity += delta * 65.0;
        this.rocketGroup.position.y += this.verticalVelocity * delta;
        this.rocketGroup.position.x += turnT * 85.0 * delta;
        this.currentAltitude = (this.rocketGroup.position.y - this.landedY);

        this.shakeAmount = 0.02;
        this._updateLaunchTelemetry(this.currentAltitude, this.verticalVelocity);

        this.camera.position.set(this.rocketGroup.position.x - 30, this.rocketGroup.position.y - 6, this.rocketGroup.position.z - 30);
        this.camera.lookAt(this.rocketGroup.position.x, this.rocketGroup.position.y + 10, this.rocketGroup.position.z);
      } else {
        this._completeLaunchToSpace();
        return;
      }

      this._applyCameraShake();
      this._updateDustParticles(delta);
    }

    // Keep player seated in cockpit, moving with the rocket during ascent
    if (this.state === 'ASCENT' && this.isPlayerInside) {
      this.player.position.set(this.rocketGroup.position.x, this.rocketGroup.position.y + 7.5, this.rocketGroup.position.z);
      this.player.velocity.set(0, 0, 0);
      this.player.isGrounded = true;
    }
  }

  _updateDustParticles(delta) {
    if (this.dustMat.opacity <= 0.01) return;
    const pos = this.dustPoints.geometry.attributes.position.array;
    for (let i = 0; i < this.dustVel.length; i++) {
      const v = this.dustVel[i];
      pos[i * 3] += v.vx * delta;
      pos[i * 3 + 1] += v.vy * delta;
      pos[i * 3 + 2] += v.vz * delta;

      const r = Math.hypot(pos[i * 3], pos[i * 3 + 2]);
      if (r > 24.0 || pos[i * 3 + 1] > 8.0) {
        const angle = Math.random() * Math.PI * 2;
        const newR = 1.5 + Math.random() * 3.0;
        pos[i * 3] = Math.cos(angle) * newR;
        pos[i * 3 + 1] = 0.2 + Math.random() * 0.6;
        pos[i * 3 + 2] = Math.sin(angle) * newR;
      }
    }
    this.dustPoints.geometry.attributes.position.needsUpdate = true;
  }

  _applyCameraShake() {
    if (this.shakeAmount > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount * 0.6;
      this.camera.position.z += (Math.random() - 0.5) * this.shakeAmount;
    }
  }

  _showCockpitHUD() {
    let hud = document.getElementById('rocket-cockpit-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'rocket-cockpit-hud';
      hud.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 24px;
        font-family: 'Space Grotesk', system-ui, sans-serif;
      `;
      document.body.appendChild(hud);
    }
    hud.innerHTML = `
      <div style="background: rgba(10, 18, 30, 0.90); border: 1px solid rgba(80, 200, 255, 0.4); border-radius: 12px; padding: 18px 24px; max-width: 480px; pointer-events: auto; backdrop-filter: blur(12px); color: #e2f1ff; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 11px; color: #5bc0be; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">Spacecraft Command Terminal</div>
          <button id="rocket-speed-btn" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; cursor: pointer;">
            SPEED: ${this.landingSpeedMode} [${this.getLandingSpeedMultiplier()}×]
          </button>
        </div>
        <div id="rocket-status-text" style="font-size: 18px; font-weight: 800; margin-top: 6px; color: #ffffff;">🚀 VULCAN CENTAUR // READY FOR LAUNCH</div>
        <div id="rocket-exit-prompt" style="font-size: 13px; color: #38bdf8; font-weight: 700; margin-top: 4px; display: none;">PRESS [E] OR CLICK BELOW TO EXIT SPACECRAFT</div>
        <div id="rocket-telemetry" style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 8px; line-height: 1.6;">
          STATUS: IN COCKPIT • SYSTEMS CHECK OK<br/>
          FUEL: 100% [CH₄ / LOX] • OXYGEN: NOMINAL<br/>
          DESTINATION: SOLAR SYSTEM ORBIT
        </div>
        <div style="margin-top: 16px; display: flex; gap: 12px;">
          <button id="rocket-launch-btn" style="flex: 1; background: linear-gradient(135deg, #0284c7, #2563eb); border: 1px solid #38bdf8; color: white; font-weight: 800; padding: 12px 18px; border-radius: 8px; cursor: pointer; letter-spacing: 1px; font-size: 14px;">
            🚀 LAUNCH TO SPACE
          </button>
          <button id="rocket-exit-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25); color: #e2f1ff; font-weight: 700; padding: 12px 18px; border-radius: 8px; cursor: pointer; font-size: 14px;">
            EXIT ROCKET [E]
          </button>
        </div>
      </div>
    `;
    hud.style.display = 'flex';

    document.getElementById('rocket-launch-btn')?.addEventListener('click', () => this.startLaunch());
    document.getElementById('rocket-exit-btn')?.addEventListener('click', () => this.exitRocket());
    document.getElementById('rocket-speed-btn')?.addEventListener('click', () => {
      const modes = ['FAST', 'NORMAL', 'CINEMATIC'];
      const nextIdx = (modes.indexOf(this.landingSpeedMode) + 1) % modes.length;
      this.setLandingSpeedMode(modes[nextIdx]);
    });
  }

  _updateSpeedBadgeUI() {
    const btn = document.getElementById('rocket-speed-btn');
    if (btn) {
      btn.textContent = `SPEED: ${this.landingSpeedMode} [${this.getLandingSpeedMultiplier()}×]`;
    }
  }

  _showLandingHUD(planetName) {
    this._showCockpitHUD();
    const statusText = document.getElementById('rocket-status-text');
    if (statusText) {
      statusText.textContent = `🛬 RETRO DESCENT // APPROACHING ${planetName.toUpperCase()}`;
    }

    const launchBtn = document.getElementById('rocket-launch-btn');
    if (launchBtn) launchBtn.style.display = 'none';

    const exitBtn = document.getElementById('rocket-exit-btn');
    if (exitBtn) {
      exitBtn.disabled = true;
      exitBtn.textContent = 'EXIT ROCKET [E] (WAIT FOR TOUCHDOWN)';
      exitBtn.style.background = 'rgba(255,255,255,0.08)';
      exitBtn.style.borderColor = 'rgba(255,255,255,0.2)';
    }

    const promptText = document.getElementById('rocket-exit-prompt');
    if (promptText) {
      promptText.style.display = 'block';
      promptText.textContent = 'SYSTEM: DESCENT PROFILE ACTIVE — HOLD POSITION';
      promptText.style.color = '#94a3b8';
    }
  }

  _hideCockpitHUD() {
    const hud = document.getElementById('rocket-cockpit-hud');
    if (hud) hud.style.display = 'none';
  }

  _updateLaunchTelemetry(alt, vel) {
    const el = document.getElementById('rocket-telemetry');
    if (el) {
      el.innerHTML = `
        ALTITUDE: ${Math.round(alt)} m<br/>
        VELOCITY: ${Math.round(vel * 3.6)} km/h<br/>
        STAGE: 1ST STAGE BOOST • MAIN ENGINES 100%<br/>
        TRAJECTORY: VERTICAL ASCENT ➔ ORBITAL TURN
      `;
    }
  }

  _updateLandingTelemetry(alt, vel, phase = 'DESCENT') {
    const el = document.getElementById('rocket-telemetry');
    if (el) {
      const stageText = (phase === 'APPROACHING')
        ? 'HIGH-ALTITUDE RAPID DESCENT'
        : (alt > 14 ? 'RETRO-PROPULSION BRAKING BURN' : 'CONTROLLED SOFT TOUCHDOWN');
      el.innerHTML = `
        ALTITUDE: ${Math.round(alt)} m<br/>
        DESCENT RATE: ${vel.toFixed(1)} m/s<br/>
        STAGE: ${stageText}<br/>
        PROFILE: ${this.landingSpeedMode} [${this.getLandingSpeedMultiplier()}×] • ${this.surfaceRegion.toUpperCase()}
      `;
    }
  }
}
