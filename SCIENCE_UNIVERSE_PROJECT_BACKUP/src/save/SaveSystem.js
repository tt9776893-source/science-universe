export const SAVE_SLOTS = [
  { id: 'slot_1', label: 'Slot 1 (Original Save)' },
  { id: 'slot_2', label: 'Slot 2 (Expedition B)' },
  { id: 'slot_3', label: 'Slot 3 (Expedition C)' }
];

export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.baseStorageKey = 'SCIENCE_UNIVERSE_FRONTIER_SAVE_V3';
    this.activeSlotStorageKey = 'SU_ACTIVE_SAVE_SLOT';
    this.backupStorageKey = 'SCIENCE_UNIVERSE_FRONTIER_SAVE_BACKUP';
    this.activeSlotId = localStorage.getItem(this.activeSlotStorageKey) || 'slot_1';
    this.autoSaveIntervalSeconds = 45;
    this.autoSaveTimer = 0;
  }

  getStorageKeyForSlot(slotId = this.activeSlotId) {
    if (!slotId || slotId === 'slot_1') {
      return this.baseStorageKey;
    }
    return `${this.baseStorageKey}_${slotId}`;
  }

  get storageKey() {
    return this.getStorageKeyForSlot(this.activeSlotId);
  }

  setActiveSlot(slotId) {
    if (!slotId) return;
    this.activeSlotId = slotId;
    localStorage.setItem(this.activeSlotStorageKey, slotId);
  }

  getSlotsInfo() {
    return SAVE_SLOTS.map((slot) => {
      const key = this.getStorageKeyForSlot(slot.id);
      const raw = localStorage.getItem(key) ||
        (slot.id === 'slot_1' ? localStorage.getItem('SCIENCE_UNIVERSE_FRONTIER_SAVE_V2') : null);
      let dateString = null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          dateString = parsed.dateString || null;
        } catch (e) {}
      }
      return {
        id: slot.id,
        label: slot.label,
        hasSave: Boolean(raw),
        dateString,
        isActive: slot.id === this.activeSlotId
      };
    });
  }

  backupSlotSave(slotId = this.activeSlotId) {
    try {
      const saveKey = this.getStorageKeyForSlot(slotId);
      const rawSave = localStorage.getItem(saveKey);
      const terrainKey = this.game.terrain ? this.game.terrain.getStorageKeyForSlot(slotId) : 'MARS_VOXEL_EDITS_V4';
      const rawTerrain = localStorage.getItem(terrainKey);

      if (rawSave || rawTerrain) {
        const backupPayload = {
          backedUpFromSlot: slotId,
          timestamp: Date.now(),
          dateString: new Date().toLocaleString(),
          saveRaw: rawSave || null,
          terrainRaw: rawTerrain || null
        };
        localStorage.setItem(this.backupStorageKey, JSON.stringify(backupPayload));
      }
      return true;
    } catch (e) {
      console.warn('[SaveSystem] Backup warning:', e);
      return false;
    }
  }

  save(targetSlotId = this.activeSlotId) {
    try {
      if (targetSlotId && targetSlotId !== this.activeSlotId) {
        this.setActiveSlot(targetSlotId);
      }

      const data = {
        version: 3,
        slotId: this.activeSlotId,
        timestamp: Date.now(),
        dateString: new Date().toLocaleString(),
        player: this.game.player.getState(),
        inventory: this.game.inventory.getState(),
        survival: this.game.survival.getState(),
        buildings: this.game.buildingSystem ? this.game.buildingSystem.getState() : [],
        vehicle: this.game.vehicleSystem ? this.game.vehicleSystem.getState() : null,
        habitat: this.game.habitatManager ? this.game.habitatManager.getState() : null,
        spacecraft: {
          isSpaceflight: this.game.spaceflightSystem ? this.game.spaceflightSystem.isActive : false,
          selectedPlanetId: this.game.spaceflightSystem?.selectedPlanetId || 'mars',
          selectedPlanet: this.game.spaceflightSystem?.selectedBody?.name || 'Mars',
          rocketState: this.game.rocketManager ? this.game.rocketManager.state : 'SURFACE_EXPLORATION'
        },
        world: {
          planetId: this.game.currentPlanetId || this.game.terrain.planetId || 'mars',
          timeOfDay: this.game.sky.timeOfDay,
          solCount: this.game.sky.solCount,
          seed: this.game.terrain.seed,
          depletedNodes: Array.from(this.game.resourceManager.depletedNodeIds),
          civilization: {
            enabled: this.game.civilizationWorldSystem ? this.game.civilizationWorldSystem.enabled : true
          },
          lifeEngine: this.game.academy ? this.game.academy.getLifeEngineState() : null,
          civilizationEngine: this.game.academy ? this.game.academy.getCivilizationState() : null,
          invention: this.game.inventionSystem ? this.game.inventionSystem.getState() : null
        }
      };

      const key = this.getStorageKeyForSlot(this.activeSlotId);
      localStorage.setItem(key, JSON.stringify(data));

      if (this.game.terrain) {
        if (this.game.terrain.activeSlotId !== this.activeSlotId) {
          this.game.terrain.activeSlotId = this.activeSlotId;
        }
        this.game.terrain.flushEditsToStorage();
      }

      console.log(`[SaveSystem] Saved ${this.activeSlotId} (${key}) at ${data.dateString}`);
      return { success: true, slotId: this.activeSlotId, timestamp: data.dateString };
    } catch (e) {
      console.error('Failed to save game state to localStorage:', e);
      return { success: false, error: e.message };
    }
  }

  load(targetSlotId = this.activeSlotId, options = {}) {
    try {
      if (targetSlotId && targetSlotId !== this.activeSlotId) {
        this.setActiveSlot(targetSlotId);
      }

      const key = this.getStorageKeyForSlot(this.activeSlotId);
      let raw = localStorage.getItem(key);
      if (!raw && this.activeSlotId === 'slot_1') {
        raw = localStorage.getItem('SCIENCE_UNIVERSE_FRONTIER_SAVE_V2');
      }
      if (!raw) {
        return { success: false, slotId: this.activeSlotId, reason: 'No save file found' };
      }

      const data = JSON.parse(raw);

      if (this.game.resourceManager?.setSaveSlot) {
        this.game.resourceManager.setSaveSlot(this.activeSlotId);
      }
      if (data.world?.planetId && this.game.setPlanetEnvironment) {
        this.game.setPlanetEnvironment(data.world.planetId);
      }
      if (this.game.terrain) {
        if (this.game.terrain.activeSlotId !== this.activeSlotId) {
          this.game.terrain.activeSlotId = this.activeSlotId;
        }
        this.game.terrain.reloadForActiveSlot();
      }

      if (this.game.physics) this.game.physics.clearDrops();
      if (this.game.player) this.game.player.clearDeployedWorkLights();

      if (data.inventory) this.game.inventory.loadState(data.inventory);
      if (data.survival) this.game.survival.loadState(data.survival);
      if (this.game.buildingSystem) this.game.buildingSystem.loadState(data.buildings || []);
      if (data.vehicle && this.game.vehicleSystem) this.game.vehicleSystem.loadState(data.vehicle);
      if (data.habitat && this.game.habitatManager) this.game.habitatManager.loadState(data.habitat);
      if (data.world?.planetId && this.game.setPlanetEnvironment) {
        this.game.setPlanetEnvironment(data.world.planetId);
      }

      if (data.world) {
        if (data.world.timeOfDay !== undefined) this.game.sky.timeOfDay = data.world.timeOfDay;
        if (data.world.solCount !== undefined) this.game.sky.solCount = data.world.solCount;
        if (this.game.resourceManager) {
          this.game.resourceManager.setDepletedNodes(data.world.depletedNodes || []);
        }
        if (data.world.civilization && this.game.civilizationWorldSystem) {
          this.game.civilizationWorldSystem.setState(data.world.civilization);
        }
        if (data.world.lifeEngine && this.game.academy) {
          const lifeEngine = this.game.academy.getOrCreateLifeEngine();
          this.game.academy.setLifeEngineState(data.world.lifeEngine);
        }
        if (data.world.civilizationEngine && this.game.academy) {
          const civEngine = this.game.academy.getOrCreateCivilizationEngine();
          civEngine.setState(data.world.civilizationEngine);
          this.game.academy.persistCivilizationEngineState();
        }
        if (data.world.invention && this.game.inventionSystem) {
          this.game.inventionSystem.loadState(data.world.invention);
        }
      }

      if (data.player) {
        this.game.player.loadState(data.player);
        this.game.terrain.update(this.game.player.position, true);
        if (this.game.resourceManager) {
          this.game.resourceManager.update(0.016, this.game.player.position);
        }
        this.game.player.updateEquippedTool();
      }

      if (!options.forceSurface) {
        if (data.spacecraft && data.spacecraft.isSpaceflight && this.game.enterSpaceflight) {
          this.game.enterSpaceflight(data.spacecraft.selectedPlanetId || data.spacecraft.selectedPlanet || 'mars');
        } else {
          if (this.game.spaceflightSystem && this.game.spaceflightSystem.isActive) {
            this.game.spaceflightSystem.exitSpaceflight();
          }
          if (this.game.rocketManager) {
            this.game.rocketManager.resetToSurfaceIdle();
          }
        }
      } else {
        if (this.game.spaceflightSystem && this.game.spaceflightSystem.isActive) {
          this.game.spaceflightSystem.exitSpaceflight();
        }
        if (this.game.rocketManager) {
          this.game.rocketManager.resetToSurfaceIdle();
        }
      }

      console.log(`[SaveSystem] Loaded ${this.activeSlotId} from ${data.dateString}`);
      return { success: true, slotId: this.activeSlotId, dateString: data.dateString };
    } catch (e) {
      console.error('Failed to load game state:', e);
      return { success: false, error: e.message };
    }
  }

  hasSave(slotId = this.activeSlotId) {
    const key = this.getStorageKeyForSlot(slotId);
    if (localStorage.getItem(key)) return true;
    if (slotId === 'slot_1' && localStorage.getItem('SCIENCE_UNIVERSE_FRONTIER_SAVE_V2')) return true;
    return false;
  }

  startNewGameInSeparateSlot(explicitSlotId = null) {
    // 1. Preserve current active save in backup AND never touch slot_1 unless explicitly confirmed overwrite
    this.backupSlotSave(this.activeSlotId);
    if (this.game.terrain) {
      this.game.terrain.flushEditsToStorage();
    }

    // Choose a separate slot so original slot_1 progress is 100% preserved
    let targetSlot = explicitSlotId;
    if (!targetSlot) {
      if (this.activeSlotId === 'slot_1') {
        targetSlot = !this.hasSave('slot_2') ? 'slot_2' : (!this.hasSave('slot_3') ? 'slot_3' : 'slot_2');
      } else if (this.activeSlotId === 'slot_2') {
        targetSlot = 'slot_3';
      } else {
        targetSlot = 'slot_2';
      }
    }

    this.setActiveSlot(targetSlot);
    if (this.game.resourceManager?.setSaveSlot) {
      this.game.resourceManager.setSaveSlot(targetSlot);
    }

    // 2. Reset ONLY the new slot's terrain edits
    if (this.game.terrain) {
      this.game.terrain.setSaveSlot(targetSlot, true);
    }

    // 3. Reset world, inventory, vitals, buildings, vehicles, habitat, rocket, drops
    if (this.game.spaceflightSystem && this.game.spaceflightSystem.isActive) {
      this.game.spaceflightSystem.exitSpaceflight();
    }
    if (this.game.vehicleSystem) {
      if (this.game.vehicleSystem.isDriving) {
        this.game.vehicleSystem.exitVehicle(this.game.player);
      }
      this.game.vehicleSystem.resetToStarterPosition();
    }
    if (this.game.buildingSystem) {
      this.game.buildingSystem.clearBuildings();
    }
    if (this.game.physics) {
      this.game.physics.clearDrops();
    }
    if (this.game.habitatManager) {
      this.game.habitatManager.resetToInitialState();
    }
    if (this.game.rocketManager) {
      this.game.rocketManager.resetToSurfaceIdle();
    }
    if (this.game.sky) {
      this.game.sky.timeOfDay = 0.28; // Crisp morning Martian sunlight
      this.game.sky.solCount = 1;
    }

    this.game.inventory.resetToStarterLoadout();
    this.game.survival.resetToFullVitals();
    this.game.player.clearDeployedWorkLights();
    this.game.player.respawnToSafeSurface();
    this.game.player.currentToolDef = null;
    this.game.player.updateEquippedTool();

    if (this.game.resourceManager) {
      this.game.resourceManager.setDepletedNodes([], this.game.player.position);
    }

    this.autoSaveTimer = 0;
    const saved = this.save(targetSlot);
    return {
      success: saved.success,
      slotId: targetSlot
    };
  }

  update(delta) {
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer >= this.autoSaveIntervalSeconds) {
      this.autoSaveTimer = 0;
      const res = this.save();
      if (res.success && this.game.ui) {
        this.game.ui.showToast('💾 Auto-saved telemetry & terrain state');
      }
    }
  }
}
