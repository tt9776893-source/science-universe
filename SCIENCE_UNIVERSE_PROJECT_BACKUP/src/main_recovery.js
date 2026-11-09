import * as THREE from 'three';
import { GAME_TITLE, GAME_VERSION, GRAPHICS_PRESETS } from './core/Constants.js';
import { assetRegistry } from './core/AssetRegistry.js';
import { audio } from './audio/ProceduralAudio.js';
import { input } from './core/InputManager.js';
import { MarsSky } from './world/MarsSky.js';
import { VolumetricTerrain } from './world/VolumetricTerrain.js';
import { ResourceManager } from './world/ResourceManager.js';
import { InventorySystem } from './inventory/InventorySystem.js';
import { SurvivalSystem } from './survival/SurvivalSystem.js';
import { BuildingSystem } from './building/BuildingSystem.js';
import { VehicleSystem } from './vehicles/VehicleSystem.js';
import { PlayerController } from './player/PlayerController.js';
import { PhysicsManager } from './physics/PhysicsManager.js';
import { HabitatManager } from './building/HabitatManager.js';
import { RocketManager } from './spacecraft/RocketManager.js';
import { SpaceflightSystem } from './spacecraft/SpaceflightSystem.js';
import { SaveSystem } from './save/SaveSystem.js';
import { UIManager } from './ui/UIManager.js';
import { ScienceAcademy } from './education/ScienceAcademy.js';
import { getLandingUnavailableMessage, getPlanetWorldConfig, resolvePlanetEnvironment } from './world/PlanetEnvironment.js';
import { LivingWorldSystem } from './world/LivingWorldSystem.js';
import CivilizationWorldSystem from './world/CivilizationWorldSystem.js';

if (typeof window !== 'undefined') {
  window.THREE = THREE;
}

class Game {
  constructor() {
    this.container = document.getElementById('game-container');
    this.clock = new THREE.Clock();
    this.isPaused = false;
    this.isLoaded = false;
    this.currentInitStep = 'Starting Engine';
    this.currentGfxPreset = 'HIGH';
    this.animationFrameId = null;
    this._resizeFrame = null;
    this._isLoopRunning = false;
    this._boundAnimate = () => this._animate();
    this._shadowTimer = 0;
    this._shadowUpdateInterval = 0.12;
    this.restartCount = 0;
    this.currentPlanetId = 'mars';
    this.planetMissionCheckTimer = 0;
  }

  showInitError(stepName, err) {
    console.error(`[CRITICAL INIT FAILURE] at ${stepName}:`, err);
    const errBox = document.getElementById('loading-error-box');
    const statusText = document.getElementById('loading-status-text');
    const loadingTrack = document.querySelector('.loading-bar-track');

    if (loadingTrack) loadingTrack.style.display = 'none';
    if (statusText) statusText.style.display = 'none';

    if (errBox) {
      errBox.style.display = 'block';
      errBox.innerHTML = `
        <div style="color: #ff3355; font-size: 16px; font-weight: 800; margin-bottom: 8px;">
          ⚠️ INITIALIZATION HALTED: ${stepName}
        </div>
        <div style="color: #e2f1ff; font-size: 12px; margin-bottom: 12px; font-family: monospace; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px;">
          ${err ? (err.message || err.toString()) : 'Unknown error'}
        </div>
        <div style="color: #8da4be; font-size: 11px; margin-bottom: 16px; line-height: 1.5;">
          Recommended: Ensure the development server is active via <code>npm run dev</code>.<br/>
          Check developer console (F12) for detailed trace.
        </div>
        <button id="btn-retry-init" style="padding: 8px 20px; background: #00f0ff; color: #080509; border: none; border-radius: 4px; font-weight: 700; cursor: pointer; text-transform: uppercase;">
          Retry Initialization
        </button>
      `;

      document.getElementById('btn-retry-init')?.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  _detectDefaultPreset() {
    if (!this.renderer) return 'HIGH';
    if (navigator.maxTouchPoints > 0 || ('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches) return 'BALANCED';
    try {
      const gl = this.renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const gpuStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      if (/Intel|UHD|Iris|HD Graphics|SwiftShader|Basic Render/i.test(gpuStr)) {
        return 'BALANCED';
      }
    } catch (e) {}
    return 'HIGH';
  }

  _requestShadowUpdate() {
    if (this.renderer && this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.needsUpdate = true;
    }
  }

  setGraphicsQuality(presetName) {
    const preset = GRAPHICS_PRESETS[presetName] || GRAPHICS_PRESETS.HIGH;
    this.currentGfxPreset = presetName;
    this._shadowUpdateInterval = preset.shadowUpdateInterval ?? 0.08;

    if (this.renderer) {
      this.renderer.shadowMap.enabled = preset.shadows;
      this.renderer.shadowMap.type = preset.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      this.renderer.shadowMap.autoUpdate = (this._shadowUpdateInterval <= 0);
      this.renderer.shadowMap.needsUpdate = true;
      const mobileDevice = navigator.maxTouchPoints > 0 || ('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches;
      this.renderer.setPixelRatio(mobileDevice ? Math.min(preset.pixelRatio, 1.25) : preset.pixelRatio);
    }
    if (this.sky && this.sky.sunLight) {
      this.sky.sunLight.castShadow = preset.shadows;
      this.sky.sunLight.shadow.mapSize.width = preset.shadowMapSize;
      this.sky.sunLight.shadow.mapSize.height = preset.shadowMapSize;
      if (this.sky.sunLight.shadow.map) {
        this.sky.sunLight.shadow.map.dispose();
        this.sky.sunLight.shadow.map = null;
      }
    }
    if (this.terrain) {
      this.terrain.activeRadius = preset.chunkRadius;
      if (this.player) this.terrain.update(this.player.position, true);
    }
    console.log(`[Graphics] Switched to preset: ${presetName}`);
  }

  async init() {
    const progressBar = document.getElementById('loading-bar-fill');
    const progressStatus = document.getElementById('loading-status-text');

    const updateStatus = (text, pct) => {
      this.currentInitStep = text;
      if (progressStatus) progressStatus.textContent = text;
      if (progressBar && pct !== undefined) progressBar.style.width = `${pct}%`;
    };

    try {
      console.log(`Starting ${GAME_TITLE} v${GAME_VERSION}`);

      // 1. Three.js Scene & Renderer
      updateStatus('Step 1/8: Initializing WebGL 3D PBR renderer...', 10);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.scene.add(this.camera);

      const mobileDevice = navigator.maxTouchPoints > 0 || ('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches;
      this.renderer = new THREE.WebGLRenderer({ antialias: !mobileDevice, powerPreference: mobileDevice ? 'default' : 'high-performance' });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      const defaultPreset = this._detectDefaultPreset();
      const initialPresetCfg = GRAPHICS_PRESETS[defaultPreset] || GRAPHICS_PRESETS.BALANCED;
      this.currentGfxPreset = defaultPreset;
      this._shadowUpdateInterval = initialPresetCfg.shadowUpdateInterval ?? 0.12;
      this.renderer.setPixelRatio(mobileDevice ? Math.min(initialPresetCfg.pixelRatio, 1.25) : initialPresetCfg.pixelRatio);
      this.renderer.shadowMap.enabled = initialPresetCfg.shadows;
      this.renderer.shadowMap.type = initialPresetCfg.softShadows ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
      this.renderer.shadowMap.autoUpdate = false;
      this.renderer.shadowMap.needsUpdate = true;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.1;
      this.container.appendChild(this.renderer.domElement);

      // 2. Preload assets
      this.assetRegistry = assetRegistry;
      updateStatus('Step 2/8: Pre-warming 12 tools and geological assets...', 25);
      await this.assetRegistry.init((loaded, total, filename) => {
        const pct = 25 + Math.round((loaded / total) * 35);
        updateStatus(`Streaming: ${filename} (${loaded}/${total})`, pct);
      });

      // 3. Sky & Atmosphere
      updateStatus('Step 3/8: Setting up atmospheric lighting & Sol cycle...', 65);
      this.sky = new MarsSky(this.scene);

      // 4. Volumetric Editable Terrain (Marching Cubes)
      updateStatus('Step 4/8: Building Marching Cubes volumetric planetary terrain...', 75);
      this.terrain = new VolumetricTerrain(this.scene);
      this.terrain.onTerrainModified = () => this._requestShadowUpdate();

      // 5. Geological Resources & Props
      updateStatus('Step 5/8: Populating geological formations & ore veins...', 82);
      this.resourceManager = new ResourceManager(this.scene, this.terrain);

      // 6. Base Construction & Vehicle Systems
      updateStatus('Step 6/8: Preparing modular habitats, airlocks and Explorer Rover...', 88);
      this.inventory = new InventorySystem();
      this.physics = new PhysicsManager(this.scene, this.terrain);
      this.buildingSystem = new BuildingSystem(this.scene, this.camera, this.terrain, this.inventory);
      this.vehicleSystem = new VehicleSystem(this.scene, this.terrain);

      // 7. Player Life Support & Controls
      updateStatus('Step 7/9: Engaging astronaut EVA spacesuit & tools...', 90);
      this.survival = new SurvivalSystem();
      this.habitatManager = new HabitatManager(this.scene, this.terrain, this.inventory, this.survival);
      this.player = new PlayerController(
        this.camera,
        this.scene,
        this.terrain,
        this.resourceManager,
        this.inventory,
        this.survival,
        this.buildingSystem,
        this.vehicleSystem,
        this.physics,
        this.habitatManager
      );

      // 8. Surface Rocket & Solar System Spaceflight
      updateStatus('Step 8/9: Initializing Vulcan Centaur rocket & Solar System spaceflight...', 94);
      this.rocketManager = new RocketManager(
        this.scene,
        this.terrain,
        this.player,
        this.camera,
        (originPlanet) => {
          this.academy?.recordRocketLaunch();
          this.enterSpaceflight(originPlanet);
        },
        () => this.onExitRocket()
      );

      this.spaceflightSystem = new SpaceflightSystem(
        this.renderer,
        (targetPlanet) => this.landOnPlanet(targetPlanet),
        (message) => this.ui?.showToast(message),
        (report) => {
          this.academy?.recordAtmosphericProbe(report.planetId, report.samples);
          this.ui?.showToast(`${report.planetId.toUpperCase()} atmospheric probe data transmitted`);
        }
      );

      // 9. Save System & Telemetry HUD
      updateStatus('Step 9/9: Restoring planetary telemetry...', 98);
      this.saveSystem = new SaveSystem(this);
      this.academy = new ScienceAcademy(() => this.saveSystem.activeSlotId);
      this.livingWorldSystem = new LivingWorldSystem(this.scene, this.terrain, this.academy, this.habitatManager);
      this.civilizationWorldSystem = new CivilizationWorldSystem(this.scene, this.terrain, this.academy);
      this.livingWorldSystem.setPlanet(this.currentPlanetId);
      this.civilizationWorldSystem.setPlanet(this.currentPlanetId);
      input.init(this.renderer.domElement);
      this.ui = new UIManager(this);

      this.player.onResourceCollected = (drop) => {
        this.academy.recordFieldSample();
        this.ui.showToast(`⛏️ +${drop.count} ${drop.name}`);
      };

      this.player.onGeologyDiscovered = (geo) => {
        if (geo.name_mn) {
          this.ui.showToast(`🔬 Шинэ эрдэс: ${geo.name_mn}`);
        }
      };

      // Input hooks
      input.onHotbarSelect = (index) => {
        this.inventory.setActiveHotbarIndex(index);
        this.ui.updateHotbar();
      };
      input.onInventoryToggle = () => this.ui.toggleInventory();
      input.onFlashlightToggle = () => this.player.toggleFlashlight();
      input.onDeployWorkLight = () => {
        if (this.player) {
          this.player.deployWorkLight();
          this.ui.showToast('💡 Deployed Subterranean Work Light [L]');
        }
      };
      input.onPerformanceToggle = () => {
        if (this.ui) {
          const state = this.ui.togglePerformanceOverlay();
          this.ui.showToast(`[F3] Performance Telemetry: ${state ? 'ENABLED' : 'DISABLED'}`);
        }
      };
      input.onInteract = () => {
        // 1. Spacecraft exit takes priority if player is inside landed rocket
        if (this.rocketManager) {
          if (this.rocketManager.state === 'LANDED' && this.rocketManager.isPlayerInside) {
            this.rocketManager.exitRocket();
            return;
          }
        }

        // 2. Rover vehicle entry / exit
        if (this.vehicleSystem) {
          if (this.vehicleSystem.isDriving) {
            this.vehicleSystem.exitVehicle(this.player);
            this.ui.showToast('Exited Explorer Rover');
            return;
          } else if (this.vehicleSystem.getDistanceToPlayer(this.player.position) < 3.8) {
            this.vehicleSystem.enterVehicle(this.player);
            this.ui.showToast('Driving Explorer Rover (WASD to Drive, [E] to Exit)');
            return;
          }
        }

        // 3. Spacecraft entry from outside
        if (this.rocketManager && (this.rocketManager.state === 'LANDED' || this.rocketManager.state === 'SURFACE_EXPLORATION')) {
          const dist = this.player.position.distanceTo(this.rocketManager.padOrigin);
          if (dist < 6.8 && !this.rocketManager.isPlayerInside) {
            this.rocketManager.enterRocket();
            this.ui.showToast('🚀 Entered Vulcan Centaur Command Cockpit');
            return;
          }
        }

        // 4. Select the nearest habitat or field-research interaction.
        const habitatPrompt = this.habitatManager?.getInteractionPrompt(this.player.position);
        const researchPrompt = this.livingWorldSystem?.getInteractionPrompt(this.player.position);
        if (researchPrompt?.action && (!habitatPrompt || researchPrompt.distance <= habitatPrompt.distance)) {
          const result = researchPrompt.action();
          if (result?.msg) this.ui.showToast(result.msg);
          return;
        }
        if (habitatPrompt?.action) {
          const result = habitatPrompt.action();
          if (result?.msg) this.ui.showToast(result.msg);
          else if (habitatPrompt.text) this.ui.showToast(habitatPrompt.text);
          if (habitatPrompt.labId) this.ui.openAcademy('labs', habitatPrompt.labId);
        }
      };
      input.onBuildingRotate = () => {
        if (this.buildingSystem && this.buildingSystem.active) {
          this.buildingSystem.rotate();
        }
      };
      input.onQuickSave = () => {
        const res = this.saveSystem.save();
        if (res.success) this.ui.showToast('💾 Quick-saved world & terrain');
      };
      input.onQuickLoad = () => {
        const res = this.saveSystem.load();
        if (res.success) this.ui.showToast('⚡ Quick-loaded state');
        else this.ui.showToast('⚠️ No save found');
      };
      input.onPauseToggle = () => this.ui.togglePause();

      // Mouse wheel hotbar switch (10 slots)
      window.addEventListener('wheel', () => {
        const w = input.consumeWheelDelta();
        if (w !== 0) {
          let newIdx = (this.inventory.activeHotbarIndex + w) % 10;
          if (newIdx < 0) newIdx += 10;
          this.inventory.setActiveHotbarIndex(newIdx);
          this.ui.updateHotbar();
        }
      });

      const scheduleViewportResize = () => {
        if (this._resizeFrame !== null) cancelAnimationFrame(this._resizeFrame);
        this._resizeFrame = requestAnimationFrame(() => {
          this._resizeFrame = null;
          this._onResize();
        });
      };
      const handleOrientationChange = () => {
        input.resetState();
        document.querySelectorAll('.touch-btn.active').forEach(button => button.classList.remove('active'));
        scheduleViewportResize();
      };
      window.addEventListener('resize', scheduleViewportResize, { passive: true });
      window.addEventListener('orientationchange', handleOrientationChange, { passive: true });
      window.visualViewport?.addEventListener('resize', scheduleViewportResize, { passive: true });
      window.addEventListener('beforeunload', () => {
        if (this.terrain) this.terrain.flushEditsToStorage();
      });

      this.setGraphicsQuality(this.currentGfxPreset);
      if (this.ui) {
        this.ui.syncGraphicsPresetUI(this.currentGfxPreset);
        this.ui.refreshSaveSlotsUI();
      }

      // Restore save or initial spawn on surface
      if (this.saveSystem.hasSave()) {
        this.saveSystem.load();
      } else {
        this.player.respawnToSafeSurface();
      }

      updateStatus('Expedition Ready!', 100);
      this.isLoaded = true;
      this._requestShadowUpdate();

      const loadingScreen = document.getElementById('loading-screen');
      const startPrompt = document.getElementById('start-prompt');
      if (loadingScreen) loadingScreen.style.display = 'none';

      if (startPrompt) {
        startPrompt.style.display = 'flex';

        const btnCockpit = document.getElementById('btn-menu-cockpit');
        const btnSurface = document.getElementById('btn-menu-surface');
        const btnSpace = document.getElementById('btn-menu-space');

        const beginSession = (lockPointer = true) => {
          audio.init();
          audio.resume();
          if (lockPointer) {
            input.requestPointerLock();
          } else {
            input.exitPointerLock();
          }
          startPrompt.style.display = 'none';
          this.isPaused = false;
        };
        this.beginSession = beginSession;

        if (btnCockpit) {
          btnCockpit.addEventListener('click', (e) => {
            e.stopPropagation();
            beginSession(false);
            this.enterSpaceflight('Mars');
            this.ui.showToast('🚀 In Mars Orbit: Survey planet and press [L] to initiate De-Orbit Landing');
          });
        }

        if (btnSurface) {
          btnSurface.addEventListener('click', (e) => {
            e.stopPropagation();
            beginSession(true);
            this.ui.showToast('🏕️ Surface EVA active at Jezero Crater Base');
          });
        }

        if (btnSpace) {
          btnSpace.addEventListener('click', (e) => {
            e.stopPropagation();
            beginSession(false);
            this.enterSpaceflight('Mars');
          });
        }

        // Generic fallback for click anywhere on modal (for automated test scripts)
        startPrompt.addEventListener('click', () => {
          beginSession();
        });
      }

      this._startLoop();
    } catch (err) {
      this.showInitError(this.currentInitStep, err);
    }
  }

  _startLoop() {
    if (this._isLoopRunning) return;
    this._isLoopRunning = true;
    this.clock.getDelta(); // Reset elapsed delta spike
    this.animationFrameId = requestAnimationFrame(this._boundAnimate);
  }

  _stopLoop() {
    this._isLoopRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Safe Restart Current Game Lifecycle:
   * - Stops current gameplay loop without creating duplicate loops or listeners
   * - Releases pointer lock, clears active inputs, velocity, and transient interactions
   * - Closes temporary UI modals
   * - Restores active slot's saved state (preserving all saved progress & terrain excavations)
   * - Ensures player is on a valid safe position and resumes gameplay
   */
  restartCurrentGame() {
    this._stopLoop();
    if (this.terrain) this.terrain.flushEditsToStorage();

    input.exitPointerLock();
    input.resetState();

    if (this.vehicleSystem && this.vehicleSystem.isDriving) {
      this.vehicleSystem.exitVehicle(this.player);
    }
    if (this.buildingSystem) {
      this.buildingSystem.setActive(false);
    }
    if (this.player) {
      this.player.resetTransientState();
    }
    if (this.ui) {
      this.ui.closeAllModals(false);
    }

    const activeSlot = this.saveSystem.activeSlotId;
    if (this.saveSystem.hasSave(activeSlot)) {
      this.saveSystem.load(activeSlot, { forceSurface: true });
      // Ensure restored coordinates are valid and not stuck underground/in solid fill
      const px = this.player.position.x;
      const py = this.player.position.y;
      const pz = this.player.position.z;
      if (!Number.isFinite(py) || py < -160 || this.terrain.sampleDensity(px, py - 0.5, pz) > 0.25) {
        const safePos = this.player.findSafeSurfacePosition(px, pz);
        this.player.position.copy(safePos);
        this.player.syncCameraTransform();
      }
    } else {
      if (this.spaceflightSystem && this.spaceflightSystem.isActive) {
        this.spaceflightSystem.exitSpaceflight();
      }
      if (this.rocketManager) {
        this.rocketManager.resetToSurfaceIdle();
      }
      if (this.terrain) {
        this.terrain.reloadForActiveSlot();
      }
      this.player.respawnToSafeSurface();
    }

    this.player.updateEquippedTool();
    this.isPaused = false;
    this.restartCount++;
    this._requestShadowUpdate();

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateHotbar(true);
      this.ui.refreshSaveSlotsUI();
      this.ui.showToast(`🔄 Session restarted (${activeSlot.toUpperCase()} progress preserved)`);
    }

    this._startLoop();
    return {
      success: true,
      restartCount: this.restartCount,
      slotId: activeSlot,
      activeLoopRunning: this._isLoopRunning
    };
  }

  /**
   * Starts a clean New Game in a separate save slot after user confirmation,
   * preserving and backing up the original save in Slot 1.
   */
  startNewGame(explicitSlotId = null) {
    this._stopLoop();
    input.exitPointerLock();
    input.resetState();

    if (this.ui) {
      this.ui.closeAllModals(false);
    }

    const res = this.saveSystem.startNewGameInSeparateSlot(explicitSlotId);
    this.isPaused = false;
    this._requestShadowUpdate();

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateHotbar(true);
      this.ui.refreshSaveSlotsUI();
      this.ui.showToast(`✨ Started New Game in ${res.slotId.toUpperCase()} (Original Slot 1 preserved)`);
    }

    this._startLoop();
    return res;
  }

  /**
   * Switches between expedition save slots (e.g., returning to Slot 1 Original Save).
   */
  switchSaveSlot(slotId) {
    if (!slotId) return { success: false };
    this._stopLoop();

    // Save current slot's terrain edits before switching
    if (this.terrain) this.terrain.flushEditsToStorage();

    input.exitPointerLock();
    input.resetState();
    if (this.vehicleSystem && this.vehicleSystem.isDriving) {
      this.vehicleSystem.exitVehicle(this.player);
    }
    if (this.player) {
      this.player.resetTransientState();
    }
    if (this.ui) {
      this.ui.closeAllModals(false);
    }

    let res;
    if (this.saveSystem.hasSave(slotId)) {
      res = this.saveSystem.load(slotId, { forceSurface: true });
    } else {
      res = this.saveSystem.startNewGameInSeparateSlot(slotId);
    }

    this.isPaused = false;
    this._requestShadowUpdate();

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateHotbar(true);
      this.ui.refreshSaveSlotsUI();
      this.ui.showToast(`📂 Switched to ${slotId.toUpperCase()}`);
    }

    this._startLoop();
    return res;
  }

  /**
   * Rescues player from underground/stuck position to a safe surface coordinate
   * while keeping all inventory, buildings, and world progress intact.
   */
  respawnPlayer() {
    input.exitPointerLock();
    input.resetState();

    if (this.spaceflightSystem && this.spaceflightSystem.isActive) {
      this.spaceflightSystem.exitSpaceflight();
    }
    if (this.vehicleSystem && this.vehicleSystem.isDriving) {
      this.vehicleSystem.exitVehicle(this.player);
    }
    if (this.rocketManager && this.rocketManager.isPlayerInside) {
      this.rocketManager.resetToSurfaceIdle();
    }
    if (this.ui) {
      this.ui.closeAllModals(false);
    }

    const safePos = this.player.respawnToSafeSurface();
    this.isPaused = false;
    this._requestShadowUpdate();

    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateHotbar();
      this.ui.showToast('🛟 Respawned at safe Jezero surface location');
    }

    if (!this._isLoopRunning) {
      this._startLoop();
    }
    return { success: true, position: { x: safePos.x, y: safePos.y, z: safePos.z } };
  }

  _onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    if (this.spaceflightSystem && this.spaceflightSystem.camera) {
      this.spaceflightSystem.camera.aspect = window.innerWidth / window.innerHeight;
      this.spaceflightSystem.camera.updateProjectionMatrix();
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  setPlanetEnvironment(planetId) {
    const config = getPlanetWorldConfig(planetId);
    if (!config || !this.terrain?.setPlanet(config.planetId)) return false;

    this.currentPlanetId = config.planetId;
    this.livingWorldSystem?.setPlanet(config.planetId);
    this.civilizationWorldSystem?.setPlanet(config.planetId);
    this.sky?.setPlanet(config);
    this.resourceManager?.setPlanet(config.planetId);
    if (this.physics) {
      this.physics.setPlanetGravity(config.planetId);
    }
    if (this.player) {
      this.player.setPlanetGravity(config.planetId);
    }
    this.survival?.setPlanet(config);
    this.rocketManager?.setPlanet(config);
    const marsInfrastructureVisible = config.planetId === 'mars';
    if (!marsInfrastructureVisible && this.vehicleSystem?.isDriving) {
      this.vehicleSystem.exitVehicle(this.player);
    }
    if (this.habitatManager?.baseGroup) this.habitatManager.baseGroup.visible = marsInfrastructureVisible;
    if (this.vehicleSystem?.activeRover?.model) this.vehicleSystem.activeRover.model.visible = marsInfrastructureVisible;
    if (!marsInfrastructureVisible) this.buildingSystem?.setActive(false);
    for (const building of this.buildingSystem?.placedBuildings || []) {
      if (building.mesh) building.mesh.visible = marsInfrastructureVisible;
    }

    if (this.player) {
      this.terrain.update(this.player.position, true);
      this.resourceManager?.update(0.016, this.player.position);
    }
    this.academy?.recordPlanetLanding(config.planetId);
    const location = document.querySelector('.location-text');
    if (location) location.textContent = `${config.surfaceRegion.toUpperCase()} // ${config.planetName.toUpperCase()}`;
    return true;
  }

  enterSpaceflight(originPlanet = 'Mars') {
    input.exitPointerLock();
    this.livingWorldSystem?.setVisible(false);
    this.civilizationWorldSystem?.setVisible(false);
    if (this.ui) this.ui.hideHUD();
    const cockHud = document.getElementById('rocket-cockpit-hud');
    if (cockHud) cockHud.style.display = 'none';
    const entered = this.spaceflightSystem?.enterSpaceflight(originPlanet);
    if (!entered) {
      this.livingWorldSystem?.setVisible(true);
      this.civilizationWorldSystem?.setVisible(true);
      this.ui?.showHUD();
      this.ui?.showToast(`Orbital environment unavailable for ${originPlanet}`);
      return { success: false };
    }
    this.academy?.recordOrbitVisit();
    if (this.ui) this.ui.showToast('🚀 Entered Solar System Spaceflight (WASD to steer, [C] camera toggle)');
    return { success: true };
  }

  launchRocketFromSurface() {
    const rocket = this.rocketManager;
    if (this.spaceflightSystem?.isActive) {
      this.ui?.showToast('Land on Mars before launching the surface rocket');
      return { success: false, reason: 'spaceflight-active' };
    }
    if (!rocket || !['SURFACE_EXPLORATION', 'LANDED'].includes(rocket.state)) {
      this.ui?.showToast('Surface rocket is not ready to launch');
      return { success: false };
    }

    this.ui?.closeAllModals(false);
    this.beginSession?.(false);
    if (!rocket.isPlayerInside) rocket.enterRocket();
    rocket.startLaunch();
    this.ui?.showToast('Rocket ascent sequence started');
    return { success: true };
  }

  landOnPlanet(targetPlanet) {
    const destination = resolvePlanetEnvironment(targetPlanet);
    if (!destination) {
      this.ui?.showToast(getLandingUnavailableMessage(targetPlanet));
      return { success: false, reason: 'environment-unavailable' };
    }
    if (!destination.hasSolidSurface) {
      this.ui?.showToast(getLandingUnavailableMessage(destination));
      return { success: false, reason: 'no-solid-surface' };
    }
    if (!this.rocketManager) {
      this.ui?.showToast(`${destination.planetName} landing system is unavailable`);
      return { success: false, reason: 'landing-system-unavailable' };
    }

    if (this.spaceflightSystem) {
      this.spaceflightSystem.exitSpaceflight();
    }
    if (!this.setPlanetEnvironment(destination.planetId)) {
      this.ui?.showToast(`${destination.planetName} environment could not be loaded`);
      return { success: false, reason: 'environment-load-failed' };
    }
    if (this.ui) this.ui.showHUD();
    const started = this.rocketManager.startLandingSequence(destination.planetId);
    if (!started) return { success: false, reason: 'environment-unavailable' };
    if (this.ui) this.ui.showToast(`🛬 Retro-propulsion descent initiated on ${destination.planetName}!`);
    return { success: true, planetId: destination.planetId };
  }

  onExitRocket() {
    if (this.ui) {
      this.ui.showHUD();
      this.ui.updateHotbar();
      const world = getPlanetWorldConfig(this.currentPlanetId);
      this.ui.showToast(`Stepped out onto ${world?.surfaceRegion || world?.planetName || 'planetary surface'}. All equipment ready.`);
    }
  }

  _animate() {
    if (!this._isLoopRunning) return;
    this.animationFrameId = requestAnimationFrame(this._boundAnimate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const now = performance.now();

    // Spaceflight Solar System branch
    if (this.spaceflightSystem && this.spaceflightSystem.isActive) {
      if (!this.isPaused) this.spaceflightSystem.update(delta, now);
      this.spaceflightSystem.render();
      return;
    }

    if (!this.isPaused && this.isLoaded) {
      if (this.vehicleSystem && this.vehicleSystem.isDriving) {
        this.vehicleSystem.update(delta, this.player, this.camera);
      } else {
        this.player.update(delta, now);
      }

      if (this.buildingSystem) {
        this.buildingSystem.update(delta);
      }

      if (this.physics) {
        const pt0 = performance.now();
        this.physics.update(delta);
        this.lastPhysicsTimeMs = performance.now() - pt0;
      }

      if (this.habitatManager) {
        this.habitatManager.update(delta, this.player.position);
      }
      this.livingWorldSystem?.update(delta, this.player.position, this.sky);
      this.civilizationWorldSystem?.step(delta, this.player.position);

      // Step the Life Engine simulation when the Life Lab panel is open.
      if (this.ui?.isAcademyOpen && this.ui?.academyTab === 'life' && this.academy) {
        const engine = this.academy.getOrCreateLifeEngine();
        const state = engine.getState();
        if (state.running) {
          this.academy.stepLifeEngine(delta);
          this.ui._renderAcademy();
        } else if (!this._lifeLabRendered) {
          this._lifeLabRendered = true;
          this.ui._renderAcademy();
        }

        // Step the Civilization Engine when civilization is unlocked and running.
        if (this.academy.isCivilizationUnlocked && this.academy.isCivilizationUnlocked()) {
          const civ = this.academy.getOrCreateCivilizationEngine();
          const civState = civ.getState();
          if (civState.running) {
            this.academy.stepCivilizationEngine(delta);
            this.ui._renderAcademy();
          }
        }
      } else {
        this._lifeLabRendered = false;
      }

      if (this.rocketManager) {
        this.rocketManager.update(delta, now);
      }

      this.sky.update(delta, this.player.position);
      this.terrain.update(this.player.position);
      this.resourceManager.update(delta, this.player.position);
      this.planetMissionCheckTimer += delta;
      if (this.planetMissionCheckTimer >= 1.0) {
        this.planetMissionCheckTimer = 0;
        const world = getPlanetWorldConfig(this.currentPlanetId);
        const visited = new Set(this.academy?.getState().visitedLocations || []);
        for (const location of world?.locations || []) {
          const locationKey = `${world.planetId}:${location.id}`;
          if (visited.has(locationKey)) continue;
          const distance = Math.hypot(this.player.position.x - location.x, this.player.position.z - location.z);
          if (distance <= 12 && this.academy.recordPlanetLocation(world.planetId, location.id)) {
            this.ui.showToast(`Survey logged: ${location.name} (+15 research XP)`);
          }
        }
      }

      const isFiring = this.player.isMining;
      const isLight = this.player.isFlashlightOn;
      const solarFactor = this.sky.getSolarFactor();
      this.survival.update(delta, isLight, isFiring, solarFactor, now, this.sky.currentTemp);

      this.saveSystem.update(delta);
      this.ui.update(delta);

      if (this.renderer && this.renderer.shadowMap.enabled && !this.renderer.shadowMap.autoUpdate) {
        this._shadowTimer += delta;
        if (this._shadowTimer >= this._shadowUpdateInterval) {
          this._shadowTimer = 0;
          this.renderer.shadowMap.needsUpdate = true;
        }
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.__SU_BUILD_ID__ = 'DEV-RECOVERY-20261030-V1';

window.addEventListener('DOMContentLoaded', () => {
  console.info('[SU-BUILD]', window.__SU_BUILD_ID__);
  let badge = document.getElementById('dev-build-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'dev-build-badge';
    badge.style.cssText = 'position:fixed;bottom:4px;right:8px;z-index:99999;font:10px/1.2 monospace;color:rgba(140,220,255,0.65);pointer-events:none;background:rgba(0,0,0,0.45);padding:2px 6px;border-radius:3px;';
    badge.textContent = window.__SU_BUILD_ID__;
    document.body.appendChild(badge);
  }
  const game = new Game();
  window.suGame = game;
  window.game = game;
  game.init().catch(err => {
    game.showInitError('Bootstrap', err);
  });
});
