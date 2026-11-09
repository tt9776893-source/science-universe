import { document, window, requestAnimationFrame, cancelAnimationFrame } from '../ctx.js';
import * as THREE from 'three';
import { GAME_TITLE, GAME_VERSION, GRAPHICS_PRESETS, BUILDING_MODULES } from './core/Constants.js';
import { assetRegistry } from './core/AssetRegistry.js';
import { audio } from './audio/ProceduralAudio.js';
import { input } from './core/InputManager.js';
import { MarsSky } from './world/MarsSky.js';
import { VolumetricTerrain } from './world/VolumetricTerrain.js';
import { ResourceManager } from './world/ResourceManager.js';
import { InventorySystem, ITEM_DATABASE } from './inventory/InventorySystem.js';
import { SurvivalSystem } from './survival/SurvivalSystem.js';
import { BuildingSystem } from './building/BuildingSystem.js';
import { PowerNetworkSystem } from './building/PowerNetworkSystem.js';
import { VehicleSystem } from './vehicles/VehicleSystem.js';
import { PlayerController } from './player/PlayerController.js';
import { PhysicsManager } from './physics/PhysicsManager.js';
import { HabitatManager } from './building/HabitatManager.js';
import { RocketManager } from './spacecraft/RocketManager.js';
import { SpaceflightSystem } from './spacecraft/SpaceflightSystem.js';
import { SaveSystem } from './save/SaveSystem.js';
import { UIManager } from './ui/UIManager.js';
import { ScienceAcademy } from './education/ScienceAcademy.js';
import { ResearchJournal } from './research/ResearchJournal.js';
import { ResearchJournalUI } from './ui/ResearchJournalUI.js';
import { InventionSystem } from './invention/InventionSystem.js';
import { InventionUI } from './ui/InventionUI.js';
import { TutorialSystem } from './tutorial/TutorialSystem.js';
import { TutorialUI } from './tutorial/TutorialUI.js';
import { ContextualTutorials } from './tutorial/ContextualTutorials.js';
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
    this._enginePersistAccumulator = 0;
    this._enginePersistInterval = 1.0;

    // Adaptive render resolution for mobile GPUs
    this.renderScale = 1.0; // 0.5..1.0, multiplier on canvas backing resolution
    this._frameTimeSamples = 0;
    this._frameTimeTotal = 0;
    this._lastFpsCheck = 0;
    this._qualityCooldown = 0; // hysteresis: frames before allowing another quality change

    // Touch event listener references for cleanup
    this._touchListeners = [];
    this.input = input;
    this._lastGeologyScanAt = 0;
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
          INITIALIZATION HALTED: ${stepName}
        </div>
        <div style="color: #e2f1ff; font-size: 12px; margin-bottom: 12px; font-family: monospace; background: rgba(0,0,0,0.4); padding: 8px; border-radius: 4px;">
          ${err ? (err.message || err.toString()) : 'Unknown error'}
        </div>
        <div style="color: #8da4be; font-size: 11px; margin-bottom: 16px; line-height: 1.5;">
          Recommended: Ensure the local HTTP server is active.<br/>
          Check developer console (F12) for detailed trace.
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button id="btn-retry-init" style="min-height:44px;padding: 8px 18px; background: #00f0ff; color: #080509; border: none; border-radius: 6px; font-weight: 800; cursor: pointer; text-transform: uppercase;">
            Дахин оролдох
          </button>
          <button id="btn-back-main-init" style="min-height:44px;padding: 8px 18px; background: rgba(15,28,46,0.92); color: #e2f1ff; border: 1px solid rgba(125,211,252,0.45); border-radius: 6px; font-weight: 700; cursor: pointer;">
            ‹ Үндсэн лаб руу буцах
          </button>
        </div>
      `;

      document.getElementById('btn-retry-init')?.addEventListener('click', () => {
        if (window.SU && typeof window.SU.reopen === 'function') window.SU.reopen('explore');
        else window.location.reload();
      });
      document.getElementById('btn-back-main-init')?.addEventListener('click', () => {
        if (window.SU && typeof window.SU.open === 'function') window.SU.open('home');
        else window.location.href = 'index.html';
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
       this.scene.background = new THREE.Color(0xc49b78);

      // 4. Volumetric Editable Terrain (Marching Cubes)
      updateStatus('Step 4/8: Building Marching Cubes volumetric planetary terrain...', 75);
      this.terrain = new VolumetricTerrain(this.scene);
      this.terrain.onTerrainModified = () => this._requestShadowUpdate();
      if (this.terrain.marsDemLoadPromise) {
        await this.terrain.marsDemLoadPromise;
      }

      // 5. Geological Resources & Props
      updateStatus('Step 5/8: Populating geological formations & ore veins...', 82);
      this.resourceManager = new ResourceManager(this.scene, this.terrain);

      // 6. Base Construction & Vehicle Systems
      updateStatus('Step 6/8: Preparing modular habitats, airlocks and Explorer Rover...', 88);
      this.inventory = new InventorySystem();
      this.physics = new PhysicsManager(this.scene, this.terrain);
      this.buildingSystem = new BuildingSystem(this.scene, this.camera, this.terrain, this.inventory);
      this.powerNetwork = new PowerNetworkSystem(this);
      this.buildingSystem.onBuildingsChanged = () => {
        this.powerNetwork?.rebuildNetworks();
        this.ui?.updateBasePowerMonitor?.();
      };
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

      this.player.onOrganismScan = (position) => {
        return this.livingWorldSystem?.scanOrganismsNear(position, 10);
      };
      this.player.onScanResult = (result) => {
        const org = result.organism;
        const traits = result.traits;
        this.ui?.showToast(
          `[SCAN] ${org.ecologicalRole || 'organism'} #${org.id} | E: ${Math.round(org.energy)}/${Math.round(org.maxEnergy)} | Size: ${(traits.size || 0).toFixed(2)} | Motility: ${(traits.motility || 0).toFixed(2)} | Metabolism: ${(traits.metabolism || 0).toFixed(2)}`
        );
        if (this.researchJournal) {
          this.researchJournal.addScan({
            organismId: org.id,
            role: org.ecologicalRole,
            traits,
            energy: org.energy,
            maxEnergy: org.maxEnergy,
            type: org.type,
            position: { x: org.position.x, y: org.position.y, z: org.position.z },
            planetId: this.currentPlanetId
          });
        }
      };
      this.player.onSampleCollected = (sample) => {
        if (this.researchJournal) {
          const scannedJustNow = this._lastGeologyScanAt && (Date.now() - this._lastGeologyScanAt < 80);
          if (!scannedJustNow) {
            if (!this.researchJournal.isExperimentActive()) {
              this.researchJournal.startExperiment(sample.itemId || 'geology_sample', 'geology', sample.planetId || this.currentPlanetId);
            }
            const pos = sample.position || (this.player?.position ? { x: this.player.position.x, y: this.player.position.y, z: this.player.position.z } : null);
            const geo = (pos && this.terrain?.getGeologyAt) ? this.terrain.getGeologyAt(pos.x, pos.y, pos.z) : null;
            const dbItem = sample.itemId ? ITEM_DATABASE[sample.itemId] : null;
            const nameMn = sample.name_mn || geo?.name_mn || dbItem?.name_mn || dbItem?.name || sample.itemId;
            const layer = sample.layer || geo?.layer || 'SURFACE';
            const rx = pos && Number.isFinite(pos.x) ? Math.round(pos.x * 10) / 10 : null;
            const ry = pos && Number.isFinite(pos.y) ? Math.round(pos.y * 10) / 10 : null;
            const rz = pos && Number.isFinite(pos.z) ? Math.round(pos.z * 10) / 10 : null;
            const identity = sample.identity || `${nameMn}|${layer}|${rx},${ry},${rz}`;
            const exp = this.researchJournal.currentExperiment;
            const isDup = Array.isArray(exp?.samples) && exp.samples.some(s => s && s.identity === identity);
            if (!isDup) {
              this.researchJournal.addSample({
                identity,
                itemId: sample.itemId,
                count: sample.count,
                name_mn: nameMn,
                layer,
                hardness: sample.hardness ?? geo?.hardness ?? 3.5,
                desc_mn: sample.desc_mn || geo?.desc_mn || dbItem?.desc || '',
                position: pos,
                planetId: sample.planetId || this.currentPlanetId,
                simulated: true
              });
              this.researchJournalUI?._render?.();
            }
          }
          this.ui?.showToast(`[SAMPLE] Collected: ${sample.itemId}`);
        }
      };

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
      this.researchJournal = new ResearchJournal(() => this.saveSystem.activeSlotId);
      this.researchJournalUI = new ResearchJournalUI(this, this.researchJournal).init();
      this.inventionSystem = new InventionSystem(this, this.researchJournal);
      this.inventionUI = new InventionUI(this, this.inventionSystem).init();
      this.livingWorldSystem = new LivingWorldSystem(this.scene, this.terrain, this.academy, this.habitatManager);
      this.civilizationWorldSystem = new CivilizationWorldSystem(this.scene, this.terrain, this.academy);
      this.livingWorldSystem.setPlanet(this.currentPlanetId);
      this.civilizationWorldSystem.setPlanet(this.currentPlanetId);
      input.init(this.renderer.domElement);
      this._setupTouchControls();
      this.ui = new UIManager(this);
      this.tutorialSystem = new TutorialSystem(this).init();
      this.tutorialUI = new TutorialUI(this, this.tutorialSystem).init();
      this.contextualTutorials = new ContextualTutorials(this, this.tutorialSystem, this.tutorialUI);

      this.player.onResourceCollected = (drop) => {
        this.academy.recordFieldSample();
        this.ui.showToast(`⛏️ +${drop.count} ${drop.name}`);
      };

       this.player.onGeologyDiscovered = (geo) => {
         if (geo.name_mn) {
           this.ui.showToast(`🔬 Шинэ эрдэс: ${geo.name_mn}`);
         }
       };
        this.player.onGeologyScan = (geo) => {
          if (geo && geo.name_mn) {
            this._lastGeologyScanAt = Date.now();
            this.ui.showToast(`🔬 ${geo.name_mn} | ${geo.desc_mn} | Хатуулаг: ${geo.hardness}`);
            if (this.researchJournal) {
              if (!this.researchJournal.isExperimentActive()) {
                this.researchJournal.startExperiment(geo.id || geo.name_mn, 'geology', this.currentPlanetId);
              }
              const pos = geo.position || (this.player?.position ? { x: this.player.position.x, y: this.player.position.y, z: this.player.position.z } : null);
              const rx = pos ? Math.round(pos.x * 10) / 10 : null;
              const ry = pos ? Math.round(pos.y * 10) / 10 : null;
              const rz = pos ? Math.round(pos.z * 10) / 10 : null;
              const identity = `${geo.name_mn}|${geo.layer}|${rx},${ry},${rz}`;
              const exp = this.researchJournal.currentExperiment;
              const isDup = Array.isArray(exp?.samples) && exp.samples.some(s => s.identity === identity);
              if (isDup) {
                this.ui.showToast(`🔬 Аль хэдийн бүртгэгдсэн: ${geo.name_mn}`);
                return;
              }
              this.researchJournal.addSample({
                identity,
                itemId: 'geology_scan',
                resourceItemId: geo.item || null,
                count: 1,
                name_mn: geo.name_mn,
                layer: geo.layer,
                hardness: geo.hardness,
                desc_mn: geo.desc_mn,
                position: pos,
                planetId: this.currentPlanetId,
                simulated: true
              });
              this.researchJournalUI?._render();
            }
          } else {
            this.ui.showToast('🔬 Зорилт олдсонгүй');
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

         // 3.5. Interactive placed base structures (Research Station, Oxygen Generator, Ore Crusher)
         if (this.buildingSystem?.placedBuildings) {
           let nearest = null;
           let nearestMod = null;
           let nearestDist = Infinity;
           for (const b of this.buildingSystem.placedBuildings) {
             if (!b || !b.mesh?.position) continue;
             const mod = BUILDING_MODULES[b.moduleIndex] ||
               BUILDING_MODULES.find(m => m && m.id === b.moduleId);
             if (!mod) continue;
             const maxRange = mod.id === 'build_research_station'
               ? 3.0
               : ((mod.id === 'build_oxygen_gen' || mod.id === 'build_ore_crusher') ? 3.5 : 0);
             if (maxRange <= 0) continue;
             const dist = this.player.position.distanceTo(b.mesh.position);
             if (dist < maxRange && dist < nearestDist) {
               nearestDist = dist;
               nearest = b;
               nearestMod = mod;
             }
           }
           if (nearest && nearestMod) {
             if (nearestMod.id === 'build_research_station') {
               this.ui?.openStationAnalysis?.(nearest);
               return;
             }
             if (nearestMod.id === 'build_oxygen_gen') {
               this.ui?.openOxygenGeneratorModal?.(nearest);
               return;
             }
             if (nearestMod.id === 'build_ore_crusher') {
               this.ui?.openOreCrusherModal?.(nearest);
               return;
             }
           }
         }
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
      input.onPauseToggle = (forceState) => this.ui.togglePause(forceState);

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
          // Auto-start tutorial on first surface session
          if (!this.tutorialSystem.started && !this.tutorialSystem.completed) {
            this.tutorialSystem.start();
          }
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
    const displayW = Math.max(1, Math.floor(window.innerWidth * this.renderScale));
    const displayH = Math.max(1, Math.floor(window.innerHeight * this.renderScale));
    this.renderer.setSize(displayW, displayH, false);
    this.renderer.domElement.style.width = `${window.innerWidth}px`;
    this.renderer.domElement.style.height = `${window.innerHeight}px`;
  }

  // ------------------------------------------------------------
  // Memory Management — dispose Three.js resources and listeners
  // ------------------------------------------------------------
  dispose() {
    this._stopLoop();
    input.exitPointerLock();

    // Remove touch event listeners stored during setup
    for (const listener of this._touchListeners || []) {
      window.removeEventListener(listener.type, listener.handler, listener.options);
    }
    this._touchListeners = [];

    // Dispose renderer (frees WebGL programs, buffers, textures)
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }

    // Dispose scene objects (geometries, materials, textures)
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    this.isLoaded = false;
    this._isLoopRunning = false;
    console.log('[Memory] Game resources disposed');
  }

  // ------------------------------------------------------------
  // Mobile Touch Controls — wires HTML touch UI to InputManager
  // ------------------------------------------------------------
  _setupTouchControls() {
    const joystickBase = document.getElementById('touch-joystick-base');
    const joystickKnob = document.getElementById('touch-joystick-knob');
    const lookZone = document.getElementById('touch-look-zone');
    if (!joystickBase || !joystickKnob || !lookZone) return;

    let joyActiveId = null;
    let joyCenter = { x: 0, y: 0 };
    let lookActiveId = null;
    let lookStart = { x: 0, y: 0 };

    const clampKnob = (dx, dy) => {
      const maxR = joystickBase.clientWidth / 2 - joystickKnob.clientWidth / 2;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR) {
        const scale = maxR / dist;
        dx *= scale;
        dy *= scale;
      }
      joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      input.touchMove.x = dx / maxR;
      input.touchMove.y = -dy / maxR; // up is negative Y in screen space
    };

    const resetJoystick = () => {
      joyActiveId = null;
      joystickKnob.style.transform = 'translate(-50%, -50%)';
      input.touchMove.x = 0;
      input.touchMove.y = 0;
    };

    const startJoystick = (id, clientX, clientY) => {
      const rect = joystickBase.getBoundingClientRect();
      joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      joyActiveId = id;
      clampKnob(clientX - joyCenter.x, clientY - joyCenter.y);
      joystickBase.style.opacity = '0.9';
    };

    const moveJoystick = (id, clientX, clientY) => {
      if (id !== joyActiveId) return;
      clampKnob(clientX - joyCenter.x, clientY - joyCenter.y);
    };

    const startLook = (id, clientX, clientY) => {
      lookActiveId = id;
      lookStart = { x: clientX, y: clientY };
    };

    const moveLook = (id, clientX, clientY) => {
      if (id !== lookActiveId) return;
      input.touchLook.x += (clientX - lookStart.x) * 0.004;
      input.touchLook.y += (clientY - lookStart.y) * 0.004;
      lookStart = { x: clientX, y: clientY };
    };

    const endTouch = (id) => {
      if (id === joyActiveId) resetJoystick();
      if (id === lookActiveId) lookActiveId = null;
    };

    // Joystick events
    joystickBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) startJoystick(t.identifier, t.clientX, t.clientY);
    }, { passive: false });

    const onTouchMove = (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === joyActiveId) moveJoystick(t.identifier, t.clientX, t.clientY);
        if (t.identifier === lookActiveId) moveLook(t.identifier, t.clientX, t.clientY);
      }
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    this._touchListeners.push({ type: 'touchmove', handler: onTouchMove, options: { passive: false } });

    const onTouchEnd = (e) => {
      for (const t of e.changedTouches) endTouch(t.identifier);
      input.touchMining = false;
      input.touchJump = false;
      input.touchSprint = false;
    };
    window.addEventListener('touchend', onTouchEnd);
    this._touchListeners.push({ type: 'touchend', handler: onTouchEnd });

    const onTouchCancel = (e) => {
      for (const t of e.changedTouches) endTouch(t.identifier);
    };
    window.addEventListener('touchcancel', onTouchCancel);
    this._touchListeners.push({ type: 'touchcancel', handler: onTouchCancel });

    // Look zone events
    lookZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) startLook(t.identifier, t.clientX, t.clientY);
    }, { passive: false });

    // Touch button tap handlers
    const bindTouchBtn = (id, onPress, onRelease = null) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        btn.classList.add('active');
        onPress();
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (onRelease) onRelease();
      });
      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (onRelease) onRelease();
      });
    };

    bindTouchBtn('touch-btn-inv', () => input.onInventoryToggle?.());
    bindTouchBtn('touch-btn-mission', () => {
      this.ui?.openAcademy?.('missions');
    });
    bindTouchBtn('touch-btn-interact', () => input.onInteract?.());
    bindTouchBtn('touch-btn-menu', () => this.ui?.togglePause?.());
    bindTouchBtn('touch-btn-light', () => input.onFlashlightToggle?.());
    bindTouchBtn('touch-btn-sprint', () => { input.touchSprint = true; }, () => { input.touchSprint = false; });
    bindTouchBtn('touch-btn-jump', () => { input.touchJump = true; });
    bindTouchBtn('touch-btn-mine', () => { input.touchMining = true; }, () => { input.touchMining = false; });
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
    if (this.academy) {
      const lifeEngine = this.academy.getOrCreateLifeEngine();
      lifeEngine.setPlanet(config.planetId, config);
    }
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

    // Adaptive render resolution: measure frame time and adjust renderScale
    const frameDelta = now - this._lastFpsCheck;
    this._frameTimeTotal += delta;
    this._frameTimeSamples += 1;
    if (this._qualityCooldown > 0) this._qualityCooldown -= 1;
    if (frameDelta >= 1000) {
      const avgMs = this._frameTimeTotal / this._frameTimeSamples;
      const fps = 1000 / Math.max(avgMs, 0.001);
      const isMobile = navigator.maxTouchPoints > 0 || ('ontouchstart' in window) || window.matchMedia('(pointer: coarse)').matches;
      const minScale = isMobile ? 0.5 : 0.75;
      if (fps < 30 && this.renderScale > minScale && this._qualityCooldown <= 0) {
        this.renderScale = Math.max(minScale, this.renderScale - 0.1);
        this._qualityCooldown = 60;
        this._onResize();
      } else if (fps > 55 && this.renderScale < 1.0 && this._qualityCooldown <= 0) {
        this.renderScale = Math.min(1.0, this.renderScale + 0.05);
        this._qualityCooldown = 60;
        this._onResize();
      }
      this._frameTimeTotal = 0;
      this._frameTimeSamples = 0;
      this._lastFpsCheck = now;
    }

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

      // Step the Life Engine and Civilization Engine continuously in the 3D world.
      if (this.academy) {
        const lifeEngine = this.academy.getOrCreateLifeEngine();
        const lifeState = lifeEngine.getState();
        if (lifeState.running) {
          this.academy.stepLifeEngineSilent(delta);
        }

        if (this.academy.isCivilizationUnlocked && this.academy.isCivilizationUnlocked()) {
          const civ = this.academy.getOrCreateCivilizationEngine();
          const civState = civ.getState();
          if (civState.running) {
            this.academy.stepCivilizationEngineSilent(delta);
          }
        }

        // Persist engine state to localStorage at a throttled interval (not every frame).
        this._enginePersistAccumulator += delta;
        if (this._enginePersistAccumulator >= this._enginePersistInterval) {
          this._enginePersistAccumulator = 0;
          this.academy.persistLifeEngineState();
          this.academy.persistCivilizationEngineState();
        }

        // Re-render academy UI only when the life tab is open.
        if (this.ui?.isAcademyOpen && this.ui?.academyTab === 'life') {
          this.ui._renderAcademy();
        }
      }

      if (this.rocketManager) {
        this.rocketManager.update(delta, now);
      }

      this.sky.update(delta, this.player.position);
      if (this.powerNetwork) {
        this.powerNetwork.update(delta);
      }
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

      // Reset momentary touch input flags after all gameplay systems
      // have consumed them. touchMining, touchSprint, and touchCrouch
      // are held states and are NOT cleared here (managed by
      // touchstart/touchend). Only touchMove, touchLook, and touchJump
      // are reset each frame.
      input.resetTouchState();

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

/* Integrated build: the original DOMContentLoaded bootstrap is exposed as startExplore(),
   called by the Science Universe router when the Explore section opens. */
export async function startExplore() {
  console.info('[SU-BUILD]', window.__SU_BUILD_ID__);
  const exitToHome = () => {
    if (window.SU && typeof window.SU.open === 'function') window.SU.open('home');
    else window.location.href = 'index.html';
  };
  document.getElementById('btn-exit-explore-home')?.addEventListener('click', exitToHome);
  document.getElementById('btn-pause-exit-home')?.addEventListener('click', exitToHome);
  try {
    const game = new Game();
    window.suGame = game;
    window.game = game;
    await game.init();
    return game;
  } catch (err) {
    console.error('[SU-EXPLORE] Planetary Exploration Init error:', err);
    const ls = document.getElementById('loading-screen');
    if (ls) ls.style.display = 'none';
    const errBox = document.getElementById('loading-error-box');
    if (errBox) {
      errBox.style.display = 'block';
      errBox.innerHTML = '<div style="color:#ff3355;font-weight:800;font-size:15px;margin-bottom:8px">EXPLORATION ENGINE NOTICE</div><div style="font-family:monospace;font-size:12px;background:rgba(0,0,0,0.5);padding:8px;border-radius:4px;color:#e2f1ff">' + (err.message || err) + '</div>';
    }
  }
}
