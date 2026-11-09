import { HOTBAR_SLOTS, INVENTORY_SLOTS, TOOL_DEFINITIONS, BUILDING_MODULES } from '../core/Constants.js';
import { audio } from '../audio/ProceduralAudio.js';

export const ITEM_DATABASE = {
  // 12 Interactive Tools
  tool_mining_laser: {
    id: 'tool_mining_laser',
    name: 'Mining Laser MK-1',
    name_mn: 'Лазер өрөмдөгч MK-1',
    category: 'tool',
    icon: '⚡',
    maxStack: 1,
    toolDefIndex: 0,
    desc: 'Collimated plasma excavation beam. Deforms planetary terrain, digs trenches and tunnels, and fractures mineral deposits.'
  },
  tool_rock_hammer: {
    id: 'tool_rock_hammer',
    name: 'Geological Pick Hammer',
    name_mn: 'Геологийн алх',
    category: 'tool',
    icon: '⛏️',
    maxStack: 1,
    toolDefIndex: 1,
    desc: 'Forged titanium alloy pick. Strikes rock formations to chisel geological specimens and carve shallow trenches.'
  },
  tool_thermal_drill: {
    id: 'tool_thermal_drill',
    name: 'Thermal Core Drill',
    name_mn: 'Дулааны өрөм',
    category: 'tool',
    icon: '🔥',
    maxStack: 1,
    toolDefIndex: 2,
    desc: 'Heated rotary diamond-carbide core drill. Bores deep shafts and hollows out underground caverns in dense basalt.'
  },
  tool_terrain_manipulator: {
    id: 'tool_terrain_manipulator',
    name: 'Gravimetric Manipulator',
    name_mn: 'Хөрс хэлбэржүүлэгч',
    category: 'tool',
    icon: '🌀',
    maxStack: 1,
    toolDefIndex: 3,
    desc: 'Gravimetric field reshaper. Left-click carves terrain volume; Right-click builds up mounds and ramps.'
  },
  tool_sample_collector: {
    id: 'tool_sample_collector',
    name: 'Cryo Sample Vacuum',
    name_mn: 'Дээж цуглуулагч',
    category: 'tool',
    icon: '🔬',
    maxStack: 1,
    toolDefIndex: 4,
    desc: 'Hermetic pneumatic cryo canister for collecting delicate Martian dust, ice crystals, and trace gas samples.'
  },
  tool_scanner: {
    id: 'tool_scanner',
    name: 'Geological PIXL Scanner',
    name_mn: 'Геологийн сканнер',
    category: 'tool',
    icon: '📡',
    maxStack: 1,
    toolDefIndex: 5,
    desc: 'X-ray fluorescence and optical spectrometer. Projects diagnostic holographic cone identifying mineral grades.'
  },
  tool_multispectral_scanner: {
    id: 'tool_multispectral_scanner',
    name: 'Multispectral Infrared Scanner',
    name_mn: 'Олон зурваст хэт улаан сканнер',
    category: 'tool',
    icon: 'tool_multispectral_scanner',
    maxStack: 1,
    toolDefIndex: 6,
    desc: 'Multi-band infrared & thermal spectrometer. Scans across the planetary surface to detect subsurface water ice lenses and volatile hydrates.',
    function_desc: 'Hold RMB to scan terrain; highlights buried ice lenses and volatile deposits.',
    usage: 'Equip in hotbar and aim across terrain to identify hidden ice veins.'
  },
  tool_gpr_radar: {
    id: 'tool_gpr_radar',
    name: 'Subsurface GPR Pulse Radar',
    name_mn: 'Гүний үелзүүрт радарын төхөөрөмж',
    category: 'tool',
    icon: 'tool_gpr_radar',
    maxStack: 1,
    toolDefIndex: 7,
    desc: 'High-frequency pulsed ground-penetrating radar. Emits electromagnetic waves downward up to 25m depth to detect hollow lava tubes, caves, and mineral veins.',
    function_desc: 'Detects underground cavities, lava tubes, and depth of basalt strata.',
    usage: 'Equip to project planar sonar pings into the ground, detecting cave voids.'
  },
  tool_construction: {
    id: 'tool_construction',
    name: 'Modular Fabricator Tool',
    name_mn: 'Барилгын төхөөрөмж',
    category: 'tool',
    icon: '🏗️',
    maxStack: 1,
    toolDefIndex: 8,
    desc: 'Volumetric holographic field projector. Places and snaps modular planetary habitat components (Press [B]).'
  },
  tool_welding_tool: {
    id: 'tool_welding_tool',
    name: 'Plasma Arc Welder',
    name_mn: 'Плазм гагнуурын багаж',
    category: 'tool',
    icon: '✨',
    maxStack: 1,
    toolDefIndex: 9,
    desc: 'High-intensity electric arc welder. Fuses modular habitat bulkheads and seals pressurized joints.'
  },
  tool_repair_tool: {
    id: 'tool_repair_tool',
    name: 'Diagnostic Repair Tool',
    name_mn: 'Оношилгоо, засварын багаж',
    category: 'tool',
    icon: '🔧',
    maxStack: 1,
    toolDefIndex: 10,
    desc: 'Precision diagnostic probe and sealant applicator. Restores suit integrity and vehicle mechanics.'
  },
  tool_portable_analyzer: {
    id: 'tool_portable_analyzer',
    name: 'Handheld Elemental Analyzer',
    name_mn: 'Гар анализатор',
    category: 'tool',
    icon: '📊',
    maxStack: 1,
    toolDefIndex: 11,
    desc: 'Compact field mass-spectrometer. Displays elemental isotope breakdown of excavated Martian samples.'
  },

  // Excavated & Raw Geological Resources
  martian_regolith: {
    id: 'martian_regolith',
    name: 'Excavated Martian Regolith',
    name_mn: 'Ангарагийн хөрс',
    category: 'mineral',
    icon: '🏜️',
    maxStack: 128,
    desc: 'Fine silicate-iron regolith powder extracted directly from the Martian surface. Basic construction feed.'
  },
  lunar_regolith: {
    id: 'lunar_regolith',
    name: 'Lunar Regolith',
    name_mn: 'Сарны реголит',
    category: 'mineral',
    icon: '🌑',
    maxStack: 128,
    desc: 'Fine lunar dust and fragmented basaltic rock formed by billions of years of impact gardening.'
  },
  mercury_regolith: {
    id: 'mercury_regolith',
    name: 'Mercurian Regolith',
    name_mn: 'Будын реголит',
    category: 'mineral',
    icon: '☿',
    maxStack: 128,
    desc: 'Airless, impact-fragmented surface material exposed to intense solar radiation.'
  },
  volcanic_ash: {
    id: 'volcanic_ash',
    name: 'Venusian Volcanic Ash',
    name_mn: 'Сугарын галт уулын үнс',
    category: 'mineral',
    icon: '🌋',
    maxStack: 128,
    desc: 'Mineral ash and fragmented basalt collected from a volcanic plain.'
  },
  terrestrial_soil: {
    id: 'terrestrial_soil',
    name: 'Terrestrial Soil Sample',
    name_mn: 'Дэлхийн хөрсний дээж',
    category: 'sample',
    icon: '🌱',
    maxStack: 64,
    desc: 'A field sample of mineral grains and organic material from Earth’s research valley.'
  },
  river_sediment: {
    id: 'river_sediment',
    name: 'River Delta Sediment',
    name_mn: 'Голын дельтын тунамал',
    category: 'sample',
    icon: '🪨',
    maxStack: 64,
    desc: 'Water-transported sediment deposited in an ancient river delta.'
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Hematite Ore (Fe₂O₃)',
    name_mn: 'Гематит (Төмрийн хүдэр)',
    category: 'mineral',
    icon: '🪨',
    maxStack: 64,
    desc: 'High-grade Martian iron oxide ore. Essential base material for structural beams and habitat hulls.'
  },
  quartz_crystal: {
    id: 'quartz_crystal',
    name: 'Quartz Crystal (SiO₂)',
    name_mn: 'Кварцын талст',
    category: 'mineral',
    icon: '💎',
    maxStack: 64,
    desc: 'Hexagonal silicon dioxide crystals. Raw feed for solar photovoltaic arrays and optical sensors.'
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore (CuFeS₂)',
    name_mn: 'Зэсийн хүдэр',
    category: 'mineral',
    icon: '🔶',
    maxStack: 64,
    desc: 'Chalcopyrite mineral deposit. Primary conductor for electrical conduits and battery circuits.'
  },
  ice_chunk: {
    id: 'ice_chunk',
    name: 'Permafrost Ice (H₂O)',
    name_mn: 'Усны мөс',
    category: 'volatile',
    icon: '🧊',
    maxStack: 64,
    desc: 'Subsurface Martian water ice. Purifies into potable drinking water and rocket fuel oxidizer.'
  },
  sulfur: {
    id: 'sulfur',
    name: 'Native Sulfur (S₈)',
    name_mn: 'Хүхрийн талст',
    category: 'mineral',
    icon: '🟡',
    maxStack: 64,
    desc: 'Bright yellow crystalline sulfur. Used for chemical synthesis and battery electrolytes.'
  },
  basalt: {
    id: 'basalt',
    name: 'Dense Volcanic Basalt',
    name_mn: 'Базальт чулуу',
    category: 'rock',
    icon: '⚫',
    maxStack: 64,
    desc: 'Dense mafic volcanic rock. Crushed and fused for heavy radiation-shielded foundations.'
  },
  granite: {
    id: 'granite',
    name: 'Granite Fragment',
    name_mn: 'Боржин чулуу',
    category: 'rock',
    icon: '🔘',
    maxStack: 64,
    desc: 'Felsic intrusive crystalline rock with exceptional compressive strength.'
  },
  rare_metals: {
    id: 'rare_metals',
    name: 'Meteoric Nickel-Iron',
    name_mn: 'Солирын никель-төмөр',
    category: 'mineral',
    icon: '🌠',
    maxStack: 32,
    desc: 'Extraterrestrial kamacite/taenite alloy rich in nickel, platinum, and cobalt.'
  },
  silicate: {
    id: 'silicate',
    name: 'Refined Silicate Glass',
    name_mn: 'Цэвэршүүлсэн цахиур',
    category: 'refined',
    icon: '🧱',
    maxStack: 64,
    desc: 'Thermally fused quartz silicate used for habitat observation viewports and electronics.'
  },

  // Modular Base Building Kits (Pack 02)
  build_hab_living: {
    id: 'build_hab_living',
    name: 'Planetary Hab: Living Module',
    name_mn: 'Амьдрах сууц модуль',
    category: 'building',
    icon: '🏠',
    maxStack: 10,
    buildingIndex: 0,
    desc: 'Prefabricated pressurized habitat with atmospheric life-support seals.'
  },
  build_airlock: {
    id: 'build_airlock',
    name: 'Pressurized EVA Airlock',
    name_mn: 'Шлюз хаалгатай модуль',
    category: 'building',
    icon: '🚪',
    maxStack: 10,
    buildingIndex: 1,
    desc: 'Dual-door decompression airlock chamber connecting base interior with Martian exterior.'
  },
  build_corridor_straight: {
    id: 'build_corridor_straight',
    name: 'Modular Corridor (Straight)',
    name_mn: 'Шулуун холбогч хонгил',
    category: 'building',
    icon: '🛣️',
    maxStack: 10,
    buildingIndex: 2,
    desc: 'Pressurized connecting corridor with utility conduits and atmosphere circulation.'
  },

  sedimentary_rock: {
    id: 'sedimentary_rock',
    name: 'Sedimentary Rock Strata',
    name_mn: 'Тунамал чулуулаг',
    category: 'rock',
    icon: 'sedimentary_rock',
    maxStack: 64,
    desc: 'Layered clay-sulfate sedimentary formation excavated from ancient Martian lake beds. Used for composite ceramics and foundation blocks.',
    function_desc: 'Raw construction material for habitat foundations and structural ceramic tiles.',
    usage: 'Process in industrial fabricator or refine into building aggregate.'
  },

  // Survival Consumables
  o2_canister: {
    id: 'o2_canister',
    name: 'Pressurized O₂ Life Support Tank',
    name_mn: 'Хүчилтөрөгчийн баллон (O₂)',
    category: 'consumable',
    icon: 'o2_canister',
    maxStack: 16,
    replenish: { type: 'oxygen', amount: 50 },
    desc: 'Medical-grade pressurized pure oxygen canister. Immediately replenishes astronaut spacesuit oxygen reserves by +50%. Essential for extended planetary exploration.',
    function_desc: 'Restores +50% suit O₂ when consumed.',
    usage: 'Open inventory (I) and click [Use Item], or use automatically when O₂ falls below 10%.'
  },
  battery_pack: {
    id: 'battery_pack',
    name: 'Lithium-Sulfur Solid-State Battery',
    name_mn: 'Цэнэг хураагуур (Li-S)',
    category: 'consumable',
    icon: 'battery_pack',
    maxStack: 16,
    replenish: { type: 'power', amount: 50 },
    desc: 'High-density solid-state battery cell manufactured from Martian sulfur and lithium. Immediately recharges suit electrical systems and flashlight by +50%.',
    function_desc: 'Restores +50% suit electrical power when consumed.',
    usage: 'Open inventory (I) and click [Use Item] to recharge suit battery.'
  }
};

export class InventorySystem {
  constructor() {
    this.hotbar = new Array(HOTBAR_SLOTS).fill(null);
    this.backpack = new Array(INVENTORY_SLOTS).fill(null);
    this.activeHotbarIndex = 0;

    this._initStarterLoadout();
  }

  _initStarterLoadout() {
    // 10 Hotbar slots equipped with interactive tools
    this.hotbar[0] = { itemId: 'tool_mining_laser', count: 1 };
    this.hotbar[1] = { itemId: 'tool_rock_hammer', count: 1 };
    this.hotbar[2] = { itemId: 'tool_thermal_drill', count: 1 };
    this.hotbar[3] = { itemId: 'tool_terrain_manipulator', count: 1 };
    this.hotbar[4] = { itemId: 'tool_sample_collector', count: 1 };
    this.hotbar[5] = { itemId: 'tool_scanner', count: 1 };
    this.hotbar[6] = { itemId: 'tool_multispectral_scanner', count: 1 };
    this.hotbar[7] = { itemId: 'tool_gpr_radar', count: 1 };
    this.hotbar[8] = { itemId: 'tool_construction', count: 1 };
    this.hotbar[9] = { itemId: 'tool_welding_tool', count: 1 };

    // Remaining tools & emergency supplies in backpack
    this.backpack[0] = { itemId: 'tool_repair_tool', count: 1 };
    this.backpack[1] = { itemId: 'tool_portable_analyzer', count: 1 };
    this.backpack[2] = { itemId: 'o2_canister', count: 4 };
    this.backpack[3] = { itemId: 'battery_pack', count: 4 };
    this.backpack[4] = { itemId: 'build_hab_living', count: 1 };
    this.backpack[5] = { itemId: 'build_airlock', count: 1 };
    this.backpack[6] = { itemId: 'build_corridor_straight', count: 2 };
  }

  getItemDef(itemId) {
    return ITEM_DATABASE[itemId] || null;
  }

  setActiveHotbarIndex(index) {
    if (index >= 0 && index < HOTBAR_SLOTS) {
      if (this.activeHotbarIndex !== index) {
        this.activeHotbarIndex = index;
        audio.playClick();
      }
    }
  }

  getEquippedItem() {
    return this.hotbar[this.activeHotbarIndex];
  }

  getEquippedToolDef() {
    const item = this.getEquippedItem();
    if (!item) return null;
    const dbItem = ITEM_DATABASE[item.itemId];
    if (dbItem && dbItem.category === 'tool' && dbItem.toolDefIndex !== undefined) {
      return TOOL_DEFINITIONS[dbItem.toolDefIndex] || null;
    }
    return null;
  }

  addItem(itemId, count = 1) {
    const dbItem = ITEM_DATABASE[itemId];
    if (!dbItem) return 0;

    let remaining = count;

    // 1. Stack into hotbar
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      if (remaining <= 0) break;
      const slot = this.hotbar[i];
      if (slot && slot.itemId === itemId && slot.count < dbItem.maxStack) {
        const canAdd = Math.min(remaining, dbItem.maxStack - slot.count);
        slot.count += canAdd;
        remaining -= canAdd;
      }
    }

    // 2. Stack into backpack
    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      if (remaining <= 0) break;
      const slot = this.backpack[i];
      if (slot && slot.itemId === itemId && slot.count < dbItem.maxStack) {
        const canAdd = Math.min(remaining, dbItem.maxStack - slot.count);
        slot.count += canAdd;
        remaining -= canAdd;
      }
    }

    // 3. Put into empty hotbar
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      if (remaining <= 0) break;
      if (!this.hotbar[i]) {
        const toPut = Math.min(remaining, dbItem.maxStack);
        this.hotbar[i] = { itemId, count: toPut };
        remaining -= toPut;
      }
    }

    // 4. Put into empty backpack
    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      if (remaining <= 0) break;
      if (!this.backpack[i]) {
        const toPut = Math.min(remaining, dbItem.maxStack);
        this.backpack[i] = { itemId, count: toPut };
        remaining -= toPut;
      }
    }

    return count - remaining;
  }

  useItem(isHotbar, index, survivalSystem) {
    const container = isHotbar ? this.hotbar : this.backpack;
    const slot = container[index];
    if (!slot) return false;

    const dbItem = ITEM_DATABASE[slot.itemId];
    if (!dbItem) return false;

    if (dbItem.category === 'consumable' && dbItem.replenish) {
      if (dbItem.replenish.type === 'oxygen') {
        survivalSystem.replenishOxygen(dbItem.replenish.amount);
      } else if (dbItem.replenish.type === 'power') {
        survivalSystem.replenishPower(dbItem.replenish.amount);
      }
      slot.count--;
      if (slot.count <= 0) {
        container[index] = null;
      }
      return true;
    }
    return false;
  }

  getState() {
    return {
      hotbar: this.hotbar,
      backpack: this.backpack,
      activeHotbarIndex: this.activeHotbarIndex
    };
  }

  resetToStarterLoadout() {
    this.hotbar.fill(null);
    this.backpack.fill(null);
    this.activeHotbarIndex = 0;
    this._initStarterLoadout();
  }

  loadState(state) {
    if (!state) return;
    this.hotbar.fill(null);
    this.backpack.fill(null);
    if (state.hotbar && Array.isArray(state.hotbar)) {
      for (let i = 0; i < Math.min(state.hotbar.length, HOTBAR_SLOTS); i++) {
        this.hotbar[i] = state.hotbar[i] ? { ...state.hotbar[i] } : null;
      }
    }
    if (state.backpack && Array.isArray(state.backpack)) {
      for (let i = 0; i < Math.min(state.backpack.length, INVENTORY_SLOTS); i++) {
        this.backpack[i] = state.backpack[i] ? { ...state.backpack[i] } : null;
      }
    }
    if (state.activeHotbarIndex !== undefined) {
      this.activeHotbarIndex = state.activeHotbarIndex;
    }
  }
}
