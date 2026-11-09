// SCIENCE UNIVERSE — FRONTIER
// InventionSystem — player-driven device assembly and testing
// Workflow: Select components → Assemble → Validate → Test → Read → Save
// First device: Planetary Environmental Sensor

import { PLANET_WORLD_CONFIGS } from '../world/PlanetEnvironment.js';

const DEVICE_ID = 'env_sensor';
const DEVICE_NAME = 'Planetary Environmental Sensor';
const DEVICE_NAME_MN = 'Орчин шинжлэх угь';

// Component definitions mapped to inventory item IDs
const COMPONENTS = {
  sensor_probe: {
    id: 'sensor_probe',
    name: 'Sensor Probe',
    name_mn: 'шинжлэх өгүүлэл',
    inventoryItemId: 'quartz_crystal',
    powerDraw: 3,
    durability: 100,
    role: 'sensing'
  },
  power_cell: {
    id: 'power_cell',
    name: 'Power Cell',
    name_mn: 'энергийн cell',
    inventoryItemId: 'battery_pack',
    powerDraw: 0,
    durability: 100,
    role: 'power'
  },
  circuit_board: {
    id: 'circuit_board',
    name: 'Circuit Board',
    name_mn: ' schéma hall',
    inventoryItemId: 'copper_ore',
    powerDraw: 2,
    durability: 100,
    role: 'processing'
  },
  housing: {
    id: 'housing',
    name: 'Protective Housing',
    name_mn: 'хамарлалын хэрэг',
    inventoryItemId: 'silicate',
    powerDraw: 0,
    durability: 100,
    role: 'protection'
  },
  antenna: {
    id: 'antenna',
    name: 'Data Antenna',
    name_mn: 'antenna',
    inventoryItemId: 'rare_metals',
    powerDraw: 4,
    durability: 100,
    role: 'communication'
  },
  data_logger: {
    id: 'data_logger',
    name: 'Data Logger',
    name_mn: 'мэдээллээр log',
    inventoryItemId: 'silicate',
    powerDraw: 1,
    durability: 100,
    role: 'storage'
  }
};

// Required components for the environmental sensor (in assembly order)
const REQUIRED_COMPONENTS = ['sensor_probe', 'power_cell', 'circuit_board', 'housing', 'antenna'];

const POWER_BUDGET = 15; // max total power draw allowed

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export class InventionSystem {
  constructor(game, researchJournal) {
    this.game = game;
    this.researchJournal = researchJournal;

    // Assembly state
    this.selectedComponents = {}; // componentId -> { inventoryItemId, count }
    this.assembledDevice = null; // { id, components, status, readings, createdAt }
    this.assemblyStep = 'select'; // select | assemble | validate | test | read | complete
    this.validationResult = null;
    this.testResult = null;
  }

  // ---- Component catalog ----

  getComponents() {
    return COMPONENTS;
  }

  getRequiredComponents() {
    return REQUIRED_COMPONENTS;
  }

  getDeviceBlueprint() {
    return {
      id: DEVICE_ID,
      name: DEVICE_NAME,
      name_mn: DEVICE_NAME_MN,
      components: REQUIRED_COMPONENTS,
      powerBudget: POWER_BUDGET,
      description: 'Measures temperature, pressure, radiation, and atmospheric composition.'
    };
  }

  // ---- Inventory helpers ----

  getInventory() {
    return this.game?.inventory;
  }

  hasComponent(componentId, count = 1) {
    const inv = this.getInventory();
    if (!inv) return false;
    const comp = COMPONENTS[componentId];
    if (!comp) return false;
    // Check hotbar + backpack for the inventory item
    const itemId = comp.inventoryItemId;
    let total = 0;
    for (const slot of inv.hotbar) {
      if (slot && slot.itemId === itemId) total += slot.count;
    }
    for (const slot of inv.backpack) {
      if (slot && slot.itemId === itemId) total += slot.count;
    }
    return total >= count;
  }

  consumeComponent(componentId, count = 1) {
    const inv = this.getInventory();
    if (!inv) return false;
    const comp = COMPONENTS[componentId];
    if (!comp) return false;
    const itemId = comp.inventoryItemId;
    let remaining = count;

    // Consume from hotbar first
    for (let i = 0; i < inv.hotbar.length && remaining > 0; i++) {
      const slot = inv.hotbar[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(remaining, slot.count);
        slot.count -= take;
        remaining -= take;
        if (slot.count <= 0) inv.hotbar[i] = null;
      }
    }
    // Then backpack
    for (let i = 0; i < inv.backpack.length && remaining > 0; i++) {
      const slot = inv.backpack[i];
      if (slot && slot.itemId === itemId) {
        const take = Math.min(remaining, slot.count);
        slot.count -= take;
        remaining -= take;
        if (slot.count <= 0) inv.backpack[i] = null;
      }
    }
    return remaining <= 0;
  }

  // ---- Assembly workflow ----

  selectComponent(componentId) {
    if (this.assemblyStep !== 'select') return false;
    if (!this.hasComponent(componentId, 1)) return false;
    if (!REQUIRED_COMPONENTS.includes(componentId)) return false;
    if (this.selectedComponents[componentId]) return false; // one of each

    this.selectedComponents[componentId] = { inventoryItemId: COMPONENTS[componentId].inventoryItemId, count: 1 };
    return true;
  }

  deselectComponent(componentId) {
    if (this.assemblyStep !== 'select') return false;
    delete this.selectedComponents[componentId];
    return true;
  }

  isSelectionComplete() {
    return REQUIRED_COMPONENTS.every(cid => Boolean(this.selectedComponents[cid]));
  }

  assembleDevice() {
    if (this.assemblyStep !== 'select') return false;
    if (!this.isSelectionComplete()) return false;

    // Consume components from inventory
    for (const cid of REQUIRED_COMPONENTS) {
      if (!this.consumeComponent(cid, 1)) {
        // Rollback any already consumed
        for (const consumed of REQUIRED_COMPONENTS) {
          if (consumed !== cid) this.selectedComponents[consumed] = null;
        }
        return false;
      }
    }

    // Calculate total power draw
    const totalPowerDraw = REQUIRED_COMPONENTS.reduce((sum, cid) => {
      return sum + COMPONENTS[cid].powerDraw;
    }, 0);

    this.assembledDevice = {
      id: `device_${Date.now()}`,
      deviceId: DEVICE_ID,
      components: { ...this.selectedComponents },
      totalPowerDraw,
      powerBudget: POWER_BUDGET,
      status: 'assembled', // assembled | validated | tested | failed
      createdAt: Date.now(),
      readings: null,
      testResult: null
    };

    this.assemblyStep = 'validate';
    return true;
  }

  // ---- Validation ----

  validateDevice() {
    if (this.assemblyStep !== 'validate') return false;
    if (!this.assembledDevice) return false;

    const { totalPowerDraw, powerBudget } = this.assembledDevice;
    const powerOk = totalPowerDraw <= powerBudget;

    // Check all components have valid durability
    const allDurable = REQUIRED_COMPONENTS.every(cid => {
      const comp = this.assembledDevice.components[cid];
      return comp && COMPONENTS[cid].durability > 0;
    });

    this.validationResult = {
      powerOk,
      allDurable,
      totalPowerDraw,
      powerBudget,
      valid: powerOk && allDurable
    };

    if (this.validationResult.valid) {
      this.assembledDevice.status = 'validated';
    } else {
      this.assembledDevice.status = 'failed';
    }

    return this.validationResult;
  }

  // ---- Testing ----

  testDevice() {
    if (this.assemblyStep !== 'validate' || !this.validationResult?.valid) return false;

    const config = PLANET_WORLD_CONFIGS[this.game?.currentPlanetId || 'mars'];
    if (!config) return false;

    // Simulate sensor readings based on real planet environment data
    const tempDay = config.temperatureC?.day ?? 20;
    const tempNight = config.temperatureC?.night ?? 0;
    const avgTemp = (tempDay + tempNight) / 2;
    const pressure = config.atmosphere?.pressureKPa ?? 0;
    const gravity = config.gravityMps2 ?? 9.81;
    const radiation = config.atmosphere?.kind === 'vacuum' || config.atmosphere?.kind === 'exosphere' ? 60 :
                      config.atmosphere?.kind === 'thin-dust' ? 30 :
                      config.atmosphere?.kind === 'dense-carbon-dioxide' ? 10 : 5;

    const testResult = {
      planetId: this.game.currentPlanetId || 'mars',
      planetName: config.planetName || 'Unknown',
      temperatureC: avgTemp,
      pressureKPa: pressure,
      gravityMps2: gravity,
      radiation: radiation,
      atmosphereKind: config.atmosphere?.kind || 'unknown',
      fogDensity: config.atmosphere?.fogDensity || 0,
      testedAt: Date.now(),
      deviceId: this.assembledDevice.id,
      success: true
    };

    this.testResult = testResult;
    this.assembledDevice.status = 'tested';
    this.assembledDevice.readings = testResult;
    this.assemblyStep = 'read';
    return true;
  }

  // ---- Save results to Research Journal ----

  saveResults() {
    if (this.assemblyStep !== 'read' || !this.testResult) return false;

    const discovery = this.researchJournal.recordDiscovery(
      `Environmental Sensor: ${this.testResult.planetName}`,
      `Deployed planetary environmental sensor on ${this.testResult.planetName}. ` +
      `Temperature: ${this.testResult.temperatureC.toFixed(1)}°C, ` +
      `Pressure: ${this.testResult.pressureKPa} kPa, ` +
      `Radiation: ${this.testResult.radiation}, ` +
      `Gravity: ${this.testResult.gravityMps2.toFixed(2)} m/s².`,
      'minor'
    );

    this.assemblyStep = 'complete';
    return discovery;
  }

  // ---- Reset ----

  reset() {
    // Return components to inventory (if assembled but not consumed already consumed)
    // Components are consumed at assemble time, so we can't easily return them.
    // For simplicity, just reset state.
    this.selectedComponents = {};
    this.assembledDevice = null;
    this.assemblyStep = 'select';
    this.validationResult = null;
    this.testResult = null;
  }

  // ---- Queries ----

  getState() {
    return {
      selectedComponents: { ...this.selectedComponents },
      assembledDevice: this.assembledDevice ? { ...this.assembledDevice } : null,
      assemblyStep: this.assemblyStep,
      validationResult: this.validationResult ? { ...this.validationResult } : null,
      testResult: this.testResult ? { ...this.testResult } : null
    };
  }

  loadState(state) {
    if (!state) return;
    this.selectedComponents = state.selectedComponents || {};
    this.assembledDevice = state.assembledDevice || null;
    this.assemblyStep = state.assemblyStep || 'select';
    this.validationResult = state.validationResult || null;
    this.testResult = state.testResult || null;
  }
}
