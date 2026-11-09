import { window } from '../../ctx.js';
export const GAME_TITLE = 'SCIENCE UNIVERSE — FRONTIER';
export const GAME_VERSION = '3.0.0-planetary-realism';

// Mars Realistic Planetary Physics (g = 3.71 m/s²)
export const MARS_GRAVITY = 3.71;
export const PLAYER_HEIGHT = 1.8;
export const PLAYER_RADIUS = 0.4;
export const PLAYER_EYE_HEIGHT = 1.65;
export const CROUCH_EYE_HEIGHT = 1.0;

export const WALK_SPEED = 4.5;
export const SPRINT_SPEED = 8.0;
export const CROUCH_SPEED = 2.0;
// Low gravity jump velocity (achieves ~1.8m height with long realistic hang time)
export const JUMP_FORCE = 3.85;

// Verified surface gravitational acceleration (m/s²) for every explorable body.
// Source: NASA Fact Sheet / USGS Astrogeology. Used to calibrate jump, fall, and rover physics.
export const PLANET_GRAVITY = Object.freeze({
  mars: 3.71,
  moon: 1.62,
  mercury: 3.70,
  venus: 8.87,
  earth: 9.81
});

// Target jump height (m) per planet — kept consistent so EVA movement feels natural
// without pretending weak gravity is zero-g. Jump velocity is derived from v = sqrt(2·g·h).
export const PLANET_JUMP_HEIGHT = Object.freeze({
  mars: 2.0,
  moon: 3.2,
  mercury: 2.0,
  venus: 1.4,
  earth: 1.6
});

// Mars Solar Day Time Configuration (1 Sol = 24h 39m 35s = 88,775 Earth seconds)
export const MARS_SOL_CONFIG = {
  realSolSeconds: 88775.244,
  gameplaySolSeconds: 720, // 12 minutes per full Martian day
  solHourMinutes: 60,
  solDayHours: 24.659
};

export const HOTBAR_SLOTS = 10;
export const INVENTORY_SLOTS = 32;

export const SURVIVAL_CONFIG = {
  maxOxygen: 100,
  oxygenDepletionRate: 0.06,
  lowOxygenWarningThreshold: 25,
  criticalOxygenThreshold: 10,
  
  maxPower: 100,
  powerIdleDrainRate: 0.015,
  flashlightPowerDrain: 0.04,
  laserPowerDrain: 0.35,
  drillPowerDrain: 0.45,
  
  maxHealth: 100,
  suffocationDamageRate: 5.0,
  
  ambientTempDay: -18,
  ambientTempNight: -72,
  suitTargetTemp: 21,
  
  maxWater: 100,
  waterDrainRate: 0.012,
  
  maxFood: 100,
  foodDrainRate: 0.008
};

export const GRAPHICS_PRESETS = {
  LOW: {
    shadows: false,
    shadowMapSize: 512,
    softShadows: false,
    shadowUpdateInterval: 0.25,
    chunkRadius: 1,
    particleCount: 120,
    pixelRatio: 1.0,
    triplanarDetail: false
  },
  BALANCED: {
    shadows: true,
    shadowMapSize: 1024,
    softShadows: false,
    shadowUpdateInterval: 0.12,
    chunkRadius: 2,
    particleCount: 250,
    pixelRatio: 1.0,
    triplanarDetail: true
  },
  MEDIUM: {
    shadows: true,
    shadowMapSize: 1024,
    softShadows: false,
    shadowUpdateInterval: 0.12,
    chunkRadius: 2,
    particleCount: 250,
    pixelRatio: 1.0,
    triplanarDetail: true
  },
  HIGH: {
    shadows: true,
    shadowMapSize: 1024,
    softShadows: true,
    shadowUpdateInterval: 0.06,
    chunkRadius: 2,
    particleCount: 400,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25),
    triplanarDetail: true
  },
  ULTRA: {
    shadows: true,
    shadowMapSize: 2048,
    softShadows: true,
    shadowUpdateInterval: 0.0,
    chunkRadius: 3,
    particleCount: 650,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    triplanarDetail: true
  }
};

export const TOOL_DEFINITIONS = [
  {
    id: 'tool_mining_laser',
    slot: 0,
    name: 'Mining Laser MK-1',
    name_mn: 'Лазер өрөмдөгч MK-1',
    model: 'SU_Mining_Laser_MK1.glb',
    type: 'excavation_laser',
    damage: 32,
    excavationRadius: 1.75,
    excavationSpeed: 3.5, // m^3 per second
    energyCost: 0.35,
    range: 7.5,
    scale: 0.46,
    offset: [0.24, -0.25, -0.42],
    rotation: [0.08, -Math.PI / 2 + 0.1, -0.05],
    category: 'Excavation & Laser Mining',
    desc: 'Focused collimated plasma laser cutter. Deforms terrain volume, creates trenches/tunnels, and fractures ores.'
  },
  {
    id: 'tool_rock_hammer',
    slot: 1,
    name: 'Geological Pick Hammer',
    name_mn: 'Геологийн алх',
    model: 'SU_Rock_Hammer.glb',
    type: 'strike',
    damage: 40,
    excavationRadius: 1.2,
    excavationSpeed: 2.0,
    energyCost: 0.0,
    range: 3.8,
    scale: 0.48,
    offset: [0.22, -0.22, -0.40],
    rotation: [0.12, -Math.PI / 2 + 0.15, -0.05],
    category: 'Field Geology & Sampling',
    desc: 'Forged titanium alloy pick. Strikes rock formations to chisel geological specimens and carve shallow trenches.'
  },
  {
    id: 'tool_thermal_drill',
    slot: 2,
    name: 'Thermal Core Drill',
    name_mn: 'Дулааны өрөм',
    model: 'SU_Thermal_Drill.glb',
    type: 'drill',
    damage: 48,
    excavationRadius: 2.4,
    excavationSpeed: 5.5,
    energyCost: 0.55,
    range: 5.5,
    scale: 0.44,
    offset: [0.22, -0.26, -0.44],
    rotation: [0.1, -Math.PI / 2 + 0.08, -0.04],
    category: 'Subsurface Exploration',
    desc: 'High-speed heated rotary diamond-carbide bit. Penetrates deep basalt and permafrost ice, carving underground chambers.'
  },
  {
    id: 'tool_terrain_manipulator',
    slot: 3,
    name: 'Gravimetric Manipulator',
    name_mn: 'Хөрс хэлбэржүүлэгч',
    model: 'SU_Terrain_Manipulator.glb',
    type: 'manipulator',
    damage: 25,
    excavationRadius: 2.8,
    excavationSpeed: 6.0,
    energyCost: 0.4,
    range: 12.0,
    scale: 0.46,
    offset: [0.23, -0.24, -0.42],
    rotation: [0.08, -Math.PI / 2 + 0.1, -0.05],
    category: 'Planetary Engineering',
    desc: 'Gravimetric field projector. Supports dual modes: [LMB] Carve terrain volume, [RMB] Extrude / build terrain mounds.'
  },
  {
    id: 'tool_sample_collector',
    slot: 4,
    name: 'Cryo Sample Vacuum',
    name_mn: 'Дээж цуглуулагч',
    model: 'SU_Sample_Collector.glb',
    type: 'collector',
    damage: 15,
    excavationRadius: 0.8,
    excavationSpeed: 1.5,
    energyCost: 0.2,
    range: 5.5,
    scale: 0.46,
    offset: [0.22, -0.25, -0.43],
    rotation: [0.09, -Math.PI / 2 + 0.12, -0.05],
    category: 'Volatile Sampling',
    desc: 'Pneumatic hermetic cryo canister for collecting delicate planetary regolith dust, ice cores, and trace gases.'
  },
  {
    id: 'tool_scanner',
    slot: 5,
    name: 'Geological PIXL Scanner',
    name_mn: 'Геологийн сканнер',
    model: 'SU_Geological_Scanner.glb',
    type: 'scanner',
    damage: 0,
    energyCost: 0.1,
    range: 18.0,
    scale: 0.48,
    offset: [0.21, -0.23, -0.40],
    rotation: [0.05, -Math.PI / 2 + 0.1, -0.05],
    category: 'Scientific Spectrometry',
    desc: 'X-ray fluorescence and optical spectrometer. Projects holographic diagnostic cone, analyzing mineral composition.'
  },
  {
    id: 'tool_multispectral_scanner',
    slot: 6,
    name: 'Multispectral Scanner',
    name_mn: 'Олон зурваст сканнер',
    model: 'SU_Multispectral_Scanner.glb',
    type: 'scanner',
    damage: 0,
    energyCost: 0.15,
    range: 25.0,
    scale: 0.46,
    offset: [0.21, -0.23, -0.40],
    rotation: [0.06, -Math.PI / 2 + 0.12, -0.05],
    category: 'Optical Mineralogy',
    desc: 'Multi-band infrared and ultraviolet detector. Scans terrain to reveal underground mineral veins and ore concentrations.'
  },
  {
    id: 'tool_gpr_radar',
    slot: 7,
    name: 'Subsurface GPR Radar',
    name_mn: 'Гүний радарын төхөөрөмж',
    model: 'SU_GPR_Radar.glb',
    type: 'radar',
    damage: 0,
    energyCost: 0.25,
    range: 20.0,
    scale: 0.44,
    offset: [0.22, -0.26, -0.44],
    rotation: [0.1, -Math.PI / 2 + 0.08, -0.04],
    category: 'Ground Penetrating Radar',
    desc: 'Subsurface pulsed radar. Emits electromagnetic pulses downwards, detecting buried ice deposits and cavern voids.'
  },
  {
    id: 'tool_construction',
    slot: 8,
    name: 'Modular Fabricator Tool',
    name_mn: 'Барилгын төхөөрөмж',
    model: 'SU_Construction_Tool.glb',
    type: 'builder',
    damage: 0,
    energyCost: 0.25,
    range: 14.0,
    scale: 0.48,
    offset: [0.22, -0.24, -0.42],
    rotation: [0.08, -Math.PI / 2 + 0.1, -0.05],
    category: 'Base Construction',
    desc: 'Volumetric holographic field projector. Projects modular habitat ghosts (Habs, Airlocks, Corridors) for base assembly.'
  },
  {
    id: 'tool_welding_tool',
    slot: 9,
    name: 'Plasma Arc Welder',
    name_mn: 'Плазм гагнуурын багаж',
    model: 'SU_Welding_Tool.glb',
    type: 'welder',
    damage: 20,
    energyCost: 0.35,
    range: 4.5,
    scale: 0.47,
    offset: [0.22, -0.24, -0.41],
    rotation: [0.08, -Math.PI / 2 + 0.1, -0.05],
    category: 'Structural Fabrication',
    desc: 'High-intensity electric arc welder. Fuses modular habitat bulkheads and repairs pressurized seals.'
  },
  {
    id: 'tool_repair_tool',
    slot: 10,
    name: 'Diagnostic Repair Tool',
    name_mn: 'Оношилгоо, засварын багаж',
    model: 'SU_Repair_Tool.glb',
    type: 'repair',
    damage: 0,
    energyCost: 0.2,
    range: 5.0,
    scale: 0.47,
    offset: [0.22, -0.24, -0.41],
    rotation: [0.08, -Math.PI / 2 + 0.1, -0.05],
    category: 'Diagnostic Maintenance',
    desc: 'Precision diagnostic probe and sealant applicator. Restores integrity of suit modules, rovers, and habitat airlocks.'
  },
  {
    id: 'tool_portable_analyzer',
    slot: 11,
    name: 'Handheld Elemental Analyzer',
    name_mn: 'Гар анализатор',
    model: 'SU_Portable_Analyzer.glb',
    type: 'analyzer',
    damage: 0,
    energyCost: 0.1,
    range: 8.0,
    scale: 0.48,
    offset: [0.20, -0.22, -0.38],
    rotation: [0.05, -Math.PI / 2 + 0.1, -0.05],
    category: 'Mass Spectrometry',
    desc: 'Compact field mass-spectrometer. Displays elemental isotope breakdown of excavated Martian samples.'
  }
];

export const BUILDING_MODULES = [
  {
    id: 'build_hab_living',
    name: 'Planetary Hab: Living Quarters',
    name_mn: 'Амьдрах сууц модуль',
    model: 'SU_Base_Hab_Living.glb',
    cat: 'buildings',
    cost: { iron_ore: 12, silicate: 8, copper_ore: 4 },
    footprint: { x: 8, z: 8 },
    powerCost: 5,
    desc: 'Pressurized habitat module with life-support atmosphere, crew bunks, and terminal.'
  },
  {
    id: 'build_airlock',
    name: 'Pressurized EVA Airlock',
    name_mn: 'Шлюз хаалгатай модуль',
    model: 'SU_Base_Airlock.glb',
    cat: 'buildings',
    cost: { iron_ore: 8, silicate: 6, copper_ore: 2 },
    footprint: { x: 4, z: 6 },
    desc: 'Dual-door decompression chamber connecting external Martian regolith with base interior.'
  },
  {
    id: 'build_corridor_straight',
    name: 'Modular Corridor (Straight)',
    name_mn: 'Шулуун холбогч хонгил',
    model: 'SU_Base_Corridor_Straight.glb',
    cat: 'buildings',
    cost: { iron_ore: 6, silicate: 4 },
    footprint: { x: 4, z: 8 },
    desc: 'Pressurized connecting corridor module with utility cable trays and ambient LED strips.'
  },
  {
    id: 'build_corridor_corner',
    name: 'Modular Corridor (90° Corner)',
    name_mn: 'Булангийн хонгил',
    model: 'SU_Base_Corridor_Corner.glb',
    cat: 'buildings',
    cost: { iron_ore: 6, silicate: 4 },
    footprint: { x: 6, z: 6 },
    desc: 'Right-angle corridor turn for expanding base layout in multiple directions.'
  },
  {
    id: 'build_foundation',
    name: 'Reinforced Foundation Slab',
    name_mn: 'Суурийн бетон хавтан',
    model: 'SU_Base_Foundation.glb',
    cat: 'buildings',
    cost: { basalt: 8, silicate: 4 },
    footprint: { x: 8, z: 8 },
    desc: 'Level structural foundation slab with hydraulic stabilization anchors.'
  },
  {
    id: 'build_solar_power',
    name: 'Solar Power Generation Plant',
    name_mn: 'Нарны цахилгаан станц',
    model: 'SU_Infra_Solar_Power_Plant.glb',
    cat: 'energy',
    cost: { quartz_crystal: 6, copper_ore: 6, iron_ore: 4 },
    footprint: { x: 6, z: 6 },
    powerOutput: 35,
    desc: 'High-efficiency photovoltaic tracking array generating clean electrical power for the colony.'
  },
  {
    id: 'build_oxygen_gen',
    name: 'Water Electrolysis & Sabatier O₂ Generator',
    name_mn: 'Усны электролиз ба Сабатьегийн O₂ үүсгүүр',
    model: 'SU_Infra_Oxygen_Generator.glb',
    cat: 'energy',
    cost: { iron_ore: 10, copper_ore: 4, ice_chunk: 4 },
    footprint: { x: 4, z: 4 },
    powerCost: 15,
    desc: 'Integrated water electrolysis (2H₂O → 2H₂ + O₂) and Sabatier CO₂ reduction loop producing pressurized breathable oxygen.'
  },
  {
    id: 'build_ore_crusher',
    name: 'Industrial Ore Crusher',
    name_mn: 'Хүдэр бутлагч төхөөрөмж',
    model: 'SU_Mach_Ore_Crusher.glb',
    cat: 'industrial',
    cost: { iron_ore: 16, copper_ore: 8 },
    footprint: { x: 5, z: 5 },
    powerCost: 20,
    desc: 'High-torque hydraulic jaw crusher for breaking raw geological boulders into mineral concentrates.'
  },
  {
    id: 'build_research_station',
    name: 'Mars Geological Research Station',
    name_mn: 'Ангарагийн геологийн судалгааны станц',
    model: 'SU_Base_Hab_Living.glb',
    cat: 'research',
    cost: { iron_ore: 10, quartz_crystal: 4 },
    footprint: { x: 6, z: 6 },
    powerCost: 0,
    analysisEnergyCost: 15,
    desc: 'Compact research station for geological sample analysis and journal recording.'
  },
  {
    id: 'build_battery_bank',
    name: 'Colony Battery Storage Bank',
    name_mn: 'Баазын эрчим хүчний хураагуур (Батерей)',
    model: 'SU_Infra_Base_Control_Center.glb',
    cat: 'energy',
    cost: { iron_ore: 6, copper_ore: 6, quartz_crystal: 2 },
    footprint: { x: 4, z: 4 },
    batteryCapacity: 100,
    desc: 'High-capacity lithium-sulfur battery bank storing solar electrical energy for base operations and research analysis.'
  }
];

/**
 * PLANET BASE 2.1 — INDUSTRIAL ENERGY ACCOUNTING & ELECTROLYSIS MASS BALANCE CONFIGURATION
 *
 * 1. Physical Energy Relation:
 *    1 kWh = 1 kW sustained for 3600 seconds.
 *    energyDeltaKWh = powerKW * elapsedSeconds * timeScale / 3600
 *
 * 2. Industrial Ore Crusher (build_ore_crusher) — Batch-Processing Model (No Double Charging):
 *    - Recipe: 4 martian_regolith -> 1 iron_ore
 *    - Rated processing power: 20 kW
 *    - Equivalent simulated batch duration: 180 s
 *    - TOTAL energy per batch: 20 kW * 180 s / 3600 = 1.0 kWh (0 kW continuous idle drain)
 *
 * 3. Oxygen Generator (build_oxygen_gen) — Water Electrolysis (2 H₂O -> 2 H₂ + O₂) + Auxiliary Sabatier:
 *    - Stoichiometric water requirement: 36 / 32 = 1.125 kg purified H₂O per 1.0 kg O₂
 *    - Feedstock item: ice_chunk (Permafrost Ice H₂O)
 *    - Assumed raw mass per ice_chunk: 1.25 kg
 *    - Purification & electrolysis water recovery efficiency: η = 0.90 (90%)
 *    - Effective purified H₂O per ice_chunk: 1.25 kg * 0.90 = 1.125 kg H₂O
 *    - Output per 1 ice_chunk + 5.0 kWh (15 kW for 1200 simulated s): 1.0 kg O₂ = 1 o2_canister
 */
export const ENERGY_CONFIG = {
  unitPower: 'кВт',
  unitEnergy: 'кВт·ц',
  secondsPerHour: 3600,
  networkLinkRadius: 30.0, // Max 3D distance (units/m) between connected base structures
  solarPanelOutputRate: 35, // Peak generation rate (kW) per build_solar_power at solarFactor = 1.0
  batteryCapacity: 100, // Max stored energy (kWh) per build_battery_bank
  researchStationIdleLoad: 0, // Research Station consumes 0 kW idle power; draws discrete kWh on analysis
  researchAnalysisEnergyCost: 15, // Discrete energy (kWh) deducted per successful geological sample analysis

  // Oxygen Generator (build_oxygen_gen)
  oxygenGeneratorPowerKW: 15, // Continuous demand (kW) while actively electrolyzing water feedstock
  oxygenFeedstockItemId: 'ice_chunk', // Existing inventory item ID for Permafrost Ice (H₂O)
  iceChunkRawMassKg: 1.25, // Assumed raw ice mass (kg) per 1 ice_chunk
  icePurificationEfficiency: 0.90, // 90% purified liquid water yield after filtration/sublimation losses
  purifiedWaterPerIceChunkKg: 1.125, // 1.25 kg * 0.90 = 1.125 kg purified H₂O per 1 ice_chunk
  waterMassPerKgOxygen: 1.125, // Stoichiometric 2H₂O -> 2H₂ + O₂ requirement (1.125 kg H₂O / 1.0 kg O₂)
  oxygenMassPerCanisterKg: 1.0, // Simulated breathable O₂ mass (kg) per 1 o2_canister
  oxygenProductionKgPerKWh: 0.2, // Simulated O₂ mass (kg) produced per 1.0 kWh consumed (3.0 kg/h at 15 kW)
  oxygenCanisterEnergyKWh: 5.0, // Energy (kWh) required to produce 1.0 kg O₂ (1 o2_canister)

  // Industrial Ore Crusher (build_ore_crusher) — Batch Mode Only (0 kW continuous idle load)
  oreCrusherPowerKW: 20, // Rated processing power (kW) represented by a batch
  oreCrusherIdleLoadKW: 0, // 0 kW continuous load so batches are never double-charged
  oreCrusherBatchDurationSimulatedSeconds: 180, // Simulated processing duration (s) per batch at 20 kW
  oreCrusherBatchEnergyKWh: 1.0, // TOTAL energy (kWh) consumed per crushed batch (20 kW * 180 s / 3600 = 1.0 kWh)
  oreCrusherRecipe: {
    input: { itemId: 'martian_regolith', quantity: 4 },
    output: { itemId: 'iron_ore', quantity: 1 },
    energyCostKWh: 1.0,
    ratedPowerKW: 20,
    durationSimulatedSeconds: 180
  },

  // Planet Base 3.0 Phase 1: Habitat Life Support (build_hab_living)
  // Verified Mars reference: ambient surface pressure ~0.6 kPa, mean surface temp ~-60 °C; Earth cabin 101.3 kPa, +21 °C.
  // Simplified gameplay simulation parameters below are explicitly separated from oxygen tank mass:
  habitatPowerKW: 5, // Continuous electrical demand (kW) while lifeSupportEnabled is active
  habitatCanisterItemId: 'o2_canister', // Existing inventory item ID for Pressurized O₂ Canister
  habitatOxygenPerCanisterKg: 1.0, // Simulated breathable O₂ mass (kg) transferred per 1 o2_canister
  habitatOxygenCapacityKg: 10.0, // Max simulated O₂ storage capacity (kg) per habitat module
  habitatOxygenConsumptionKgPerHour: 0.36, // Simulated O₂ consumption rate (0.36 kg/h = 0.0001 kg/sim s) while active
  habitatAmbientPressureKPa: 0.6, // Mars exterior baseline atmospheric pressure (kPa)
  habitatTargetPressureKPa: 101.3, // Target pressurized habitat cabin pressure (kPa)
  habitatHabitableMinPressureKPa: 95.0, // Minimum cabin pressure (kPa) considered fully HABITABLE
  habitatPressurizationRateKPaPerSimSec: 0.50, // Active pressurization rate (+0.50 kPa / simulated s) when powered with O₂
  habitatDepressurizationLeakRateKPaPerSimSec: 0.05, // Passive seal bleed rate (-0.05 kPa / simulated s) toward 0.6 kPa when off
  habitatAmbientTemperatureC: -60.0, // Mars exterior baseline temperature (°C)
  habitatTargetTemperatureC: 21.0, // Target cabin thermal control temperature (°C)
  habitatHabitableMinTemperatureC: 18.0, // Minimum cabin temperature (°C) considered fully HABITABLE
  habitatHeatingRateCPerSimSec: 0.40, // Active electric heater rate (+0.40 °C / simulated s) toward +21 °C when powered
  habitatCoolingLossRateCPerSimSec: 0.04, // Passive thermal loss rate (-0.04 °C / simulated s) toward -60 °C when off

  maxSimulationStepSeconds: 0.5, // Max real frame delta (s) processed in live frame updates to prevent background/resume jumps
  defaultTimeScale: MARS_SOL_CONFIG.realSolSeconds / MARS_SOL_CONFIG.gameplaySolSeconds // ~123.29895 simulated s per real gameplay s
};
