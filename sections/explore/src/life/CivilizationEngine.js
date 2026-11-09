// SCIENCE UNIVERSE — FRONTIER
// Phase 12: Civilization Engine — intelligent life, social groups, culture, tools, settlements.
//
// IMPORTANT: All civilization emergence is hypothetical and modeled.
// Biological evolution (DNA) and cultural evolution (learned knowledge) are
// separate systems. Intelligence, society, and civilization are NOT guaranteed
// to emerge. High cognitive investment carries energy costs and survival risks.

const CIV_HYPOTHETICAL = 'ЗААНУУД ШАТ — өсвөл хAREK, тодорхойлолт биш';

// ------------------------------------------------------------
// Research fields — interconnected technology domains.
// Civilizations advance through these fields based on biology,
// environment, available materials, culture, and accumulated knowledge.
// ------------------------------------------------------------
const RESEARCH_FIELDS = {
  materials: { id: 'materials', label: 'Материалын ө produzione', order: 1 },
  mechanical: { id: 'mechanical', label: 'Механ овогдлын инженери', order: 2 },
  energy: { id: 'energy', label: 'Энергийн технологи', order: 3 },
  electricity: { id: 'electricity', label: 'Цахилгаан', order: 4 },
  electronics: { id: 'electronics', label: 'Электроник', order: 5 },
  computing: { id: 'computing', label: 'Хэрэгцээлт болон compute', order: 6 },
  communication: { id: 'communication', label: 'Холбоо', order: 7 },
  transportation: { id: 'transportation', label: 'Үл цахим хөтөлбөр', order: 8 },
  astronomy: { id: 'astronomy', label: 'Зойж зураач', order: 9 },
  spacecraft: { id: 'spacecraft', label: 'Ангилойн технология', order: 10 }
};

const FIELD_LABELS = {
  materials: 'Материалын өргөлт',
  mechanical: 'Механ инженери',
  energy: 'Энергийн технологи',
  electricity: 'Цахилгаан',
  electronics: 'Электроник',
  computing: 'Хэрэгцээлт/compute',
  communication: 'Холбоо',
  transportation: 'Үл цахим хөтөлбөр',
  astronomy: 'Зойж зураач',
  spacecraft: 'Ангилойн технологи'
};

// ------------------------------------------------------------
// Standard technology tree — definitions with prerequisites,
// resource costs, and research costs. No auto-unlock after
// fixed generations; each tech must be actively researched.
// ------------------------------------------------------------
const TECH_TREE = [
  // --- Materials (field: materials) ---
  { id: 'tech_stone_tools', name: 'Үсний хэрэгсэл', field: 'materials', domain: 'tool',
    prerequisites: { cognitive: 0.2, social: 1, material: 1, energy: 0 }, prerequisiteTech: [],
    resourceCost: { food: 0, materials: 10, energy: 0 }, researchCost: 1,
    description: 'Үсний хэрэгсэл хэрэглэх үйлдэл' },
  { id: 'tech_fire', name: 'Отсон', field: 'materials', domain: 'energy',
    prerequisites: { cognitive: 0.25, social: 2, material: 2, energy: 1 }, prerequisiteTech: ['tech_stone_tools'],
    resourceCost: { food: 0, materials: 20, energy: 10 }, researchCost: 2,
    description: 'Отсон ашиглах бидний мэдээлэл' },
  { id: 'tech_pottery', name: 'Гурван', field: 'materials', domain: 'construction',
    prerequisites: { cognitive: 0.3, social: 2, material: 3, energy: 1 }, prerequisiteTech: ['tech_stone_tools'],
    resourceCost: { food: 0, materials: 30, energy: 5 }, researchCost: 2,
    description: 'Гурван бүтээгдэхүүн' },
  { id: 'tech_metallurgy', name: 'Тэмдэрт өргөлт', field: 'materials', domain: 'material',
    prerequisites: { cognitive: 0.45, social: 4, material: 6, energy: 4 }, prerequisiteTech: ['tech_fire', 'tech_pottery'],
    resourceCost: { food: 0, materials: 80, energy: 40 }, researchCost: 5,
    description: 'Тэмдэрт өргөлт ба өргөгчүүд' },

  // --- Mechanical (field: mechanical) ---
  { id: 'tech_wheel', name: 'Гэгээ', field: 'mechanical', domain: 'transportation',
    prerequisites: { cognitive: 0.35, social: 3, material: 4, energy: 2 }, prerequisiteTech: ['tech_stone_tools'],
    resourceCost: { food: 0, materials: 40, energy: 10 }, researchCost: 3,
    description: 'Гэгээний хэрэгсэл' },
  { id: 'tech_lever_pulley', name: 'Болааны анаг instantaneous', field: 'mechanical', domain: 'construction',
    prerequisites: { cognitive: 0.4, social: 4, material: 5, energy: 3 }, prerequisiteTech: ['tech_wheel'],
    resourceCost: { food: 0, materials: 60, energy: 20 }, researchCost: 4,
    description: 'Болааны instantaneous систем' },
  { id: 'tech_watermill', name: 'Усны өргөлт', field: 'mechanical', domain: 'energy',
    prerequisites: { cognitive: 0.5, social: 6, material: 8, energy: 5 }, prerequisiteTech: ['tech_lever_pulley'],
    resourceCost: { food: 0, materials: 120, energy: 40 }, researchCost: 6,
    description: 'Усны өргөлтын техник' },
  { id: 'tech_steam_engine', name: 'Тэмдэглэлийнmachine', field: 'mechanical', domain: 'energy',
    prerequisites: { cognitive: 0.6, social: 8, material: 12, energy: 10 }, prerequisiteTech: ['tech_watermill', 'tech_metallurgy'],
    resourceCost: { food: 0, materials: 200, energy: 100 }, researchCost: 10,
    description: 'Тэмдэглэлийн машин' },

  // --- Energy (field: energy) ---
  { id: 'tech_wind_power', name: 'Салхийн энерги', field: 'energy', domain: 'energy',
    prerequisites: { cognitive: 0.45, social: 5, material: 6, energy: 4 }, prerequisiteTech: ['tech_watermill'],
    resourceCost: { food: 0, materials: 100, energy: 30 }, researchCost: 7,
    description: 'Салхийн энергийн систем' },
  { id: 'tech_solar_power', name: 'Гарын энерги', field: 'energy', domain: 'energy',
    prerequisites: { cognitive: 0.55, social: 7, material: 10, energy: 8 }, prerequisiteTech: ['tech_metallurgy'],
    resourceCost: { food: 0, materials: 150, energy: 50 }, researchCost: 9,
    description: 'Гарын энергийн систем' },
  { id: 'tech_battery', name: 'Батерей', field: 'energy', domain: 'energy',
    prerequisites: { cognitive: 0.6, social: 8, material: 10, energy: 10 }, prerequisiteTech: ['tech_solar_power', 'tech_electricity_basic'],
    resourceCost: { food: 0, materials: 200, energy: 80 }, researchCost: 12,
    description: 'Эnerg-iйг хадгалах батерей' },

  // --- Electricity (field: electricity) ---
  { id: 'tech_electricity_basic', name: 'Цахилгааны үндсэн', field: 'electricity', domain: 'energy',
    prerequisites: { cognitive: 0.5, social: 6, material: 8, energy: 6 }, prerequisiteTech: ['tech_steam_engine'],
    resourceCost: { food: 0, materials: 150, energy: 60 }, researchCost: 8,
    description: 'Цахилгааны үндсэн мэдээлэл' },
  { id: 'tech_electric_grid', name: 'Цахилгааны сүлjee', field: 'electricity', domain: 'energy',
    prerequisites: { cognitive: 0.6, social: 10, material: 15, energy: 12 }, prerequisiteTech: ['tech_electricity_basic'],
    resourceCost: { food: 0, materials: 300, energy: 150 }, researchCost: 15,
    description: 'Цахилгааны сүлжээ' },

  // --- Electronics (field: electronics) ---
  { id: 'tech_vacuum_tube', name: 'Вакуум tubo', field: 'electronics', domain: 'electronics',
    prerequisites: { cognitive: 0.6, social: 8, material: 10, energy: 10 }, prerequisiteTech: ['tech_electric_grid'],
    resourceCost: { food: 0, materials: 200, energy: 100 }, researchCost: 10,
    description: 'Вакуум tubo' },
  { id: 'tech_transistor', name: 'Транзистор', field: 'electronics', domain: 'electronics',
    prerequisites: { cognitive: 0.7, social: 12, material: 15, energy: 15 }, prerequisiteTech: ['tech_vacuum_tube', 'tech_metallurgy'],
    resourceCost: { food: 0, materials: 300, energy: 200 }, researchCost: 15,
    description: 'Транзистор технологи' },

  // --- Computing (field: computing) ---
  { id: 'tech_analog_computer', name: 'Аналог засвар', field: 'computing', domain: 'computing',
    prerequisites: { cognitive: 0.65, social: 10, material: 12, energy: 12 }, prerequisiteTech: ['tech_transistor'],
    resourceCost: { food: 0, materials: 250, energy: 150 }, researchCost: 12,
    description: 'Аналог засвар машин' },
  { id: 'tech_digital_computer', name: 'Цифр log засвар', field: 'computing', domain: 'computing',
    prerequisites: { cognitive: 0.75, social: 14, material: 20, energy: 20 }, prerequisiteTech: ['tech_analog_computer', 'tech_transistor'],
    resourceCost: { food: 0, materials: 500, energy: 300 }, researchCost: 20,
    description: 'Цифр засвар машин' },
  { id: 'tech_ai', name: 'AI', field: 'computing', domain: 'ai',
    prerequisites: { cognitive: 0.85, social: 18, material: 25, energy: 25 }, prerequisiteTech: ['tech_digital_computer'],
    resourceCost: { food: 0, materials: 800, energy: 500 }, researchCost: 30,
    description: 'А산 дуулагч интеллект' },

  // --- Communication (field: communication) ---
  { id: 'tech_writing', name: 'Бичсэн', field: 'communication', domain: 'communication',
    prerequisites: { cognitive: 0.4, social: 4, material: 3, energy: 1 }, prerequisiteTech: ['tech_stone_tools'],
    resourceCost: { food: 0, materials: 20, energy: 5 }, researchCost: 3,
    description: 'Бичвэр бичих мэдээлэл' },
  { id: 'tech_printing', name: 'Хэвлэх', field: 'communication', domain: 'communication',
    prerequisites: { cognitive: 0.5, social: 6, material: 8, energy: 4 }, prerequisiteTech: ['tech_writing', 'tech_metallurgy'],
    resourceCost: { food: 0, materials: 80, energy: 30 }, researchCost: 6,
    description: 'Хэвлэх技术' },
  { id: 'tech_telegraph', name: 'Телеграф', field: 'communication', domain: 'communication',
    prerequisites: { cognitive: 0.55, social: 8, material: 10, energy: 8 }, prerequisiteTech: ['tech_electricity_basic', 'tech_writing'],
    resourceCost: { food: 0, materials: 150, energy: 80 }, researchCost: 8,
    description: 'Телеграф систем' },
  { id: 'tech_radio', name: 'Радио', field: 'communication', domain: 'communication',
    prerequisites: { cognitive: 0.65, social: 10, material: 15, energy: 12 }, prerequisiteTech: ['tech_telegraph', 'tech_vacuum_tube'],
    resourceCost: { food: 0, materials: 300, energy: 150 }, researchCost: 12,
    description: 'Радио технология' },
  { id: 'tech_internet', name: 'Интернет', field: 'communication', domain: 'communication',
    prerequisites: { cognitive: 0.8, social: 16, material: 25, energy: 20 }, prerequisiteTech: ['tech_digital_computer', 'tech_radio'],
    resourceCost: { food: 0, materials: 600, energy: 400 }, researchCost: 25,
    description: 'Интернет систем' },

  // --- Transportation (field: transportation) ---
  { id: 'tech_ship', name: 'Хайagsan', field: 'transportation', domain: 'transportation',
    prerequisites: { cognitive: 0.4, social: 5, material: 8, energy: 3 }, prerequisiteTech: ['tech_wheel'],
    resourceCost: { food: 0, materials: 100, energy: 30 }, researchCost: 6,
    description: 'Хайagsan хэрэгсэл' },
  { id: 'tech_train', name: 'Цөөөлөн', field: 'transportation', domain: 'transportation',
    prerequisites: { cognitive: 0.6, social: 10, material: 20, energy: 15 }, prerequisiteTech: ['tech_steam_engine', 'tech_metallurgy'],
    resourceCost: { food: 0, materials: 500, energy: 200 }, researchCost: 15,
    description: 'Цөөөлөн систем' },
  { id: 'tech_airplane', name: 'Олох', field: 'transportation', domain: 'transportation',
    prerequisites: { cognitive: 0.7, social: 14, material: 30, energy: 25 }, prerequisiteTech: ['tech_internal_combustion'],
    resourceCost: { food: 0, materials: 800, energy: 400 }, researchCost: 20,
    description: 'Олох технологи' },
  { id: 'tech_internal_combustion', name: 'Орон ндцать машину', field: 'transportation', domain: 'energy',
    prerequisites: { cognitive: 0.6, social: 10, material: 15, energy: 12 }, prerequisiteTech: ['tech_steam_engine'],
    resourceCost: { food: 0, materials: 300, energy: 150 }, researchCost: 10,
    description: 'Орон ндээч machine' },

  // --- Astronomy (field: astronomy) ---
  { id: 'tech_telescope', name: 'Тэлэскоп', field: 'astronomy', domain: 'astronomy',
    prerequisites: { cognitive: 0.5, social: 6, material: 8, energy: 4 }, prerequisiteTech: ['tech_glass_optics'],
    resourceCost: { food: 0, materials: 100, energy: 30 }, researchCost: 6,
    description: 'Тэлэскоп технологи' },
  { id: 'tech_glass_optics', name: 'Гүрд онцлог', field: 'astronomy', domain: 'material',
    prerequisites: { cognitive: 0.45, social: 5, material: 6, energy: 4 }, prerequisiteTech: ['tech_metallurgy'],
    resourceCost: { food: 0, materials: 80, energy: 30 }, researchCost: 5,
    description: 'Гүрд онцлог技术' },
  { id: 'tech_space_observation', name: 'Ангилын survey', field: 'astronomy', domain: 'astronomy',
    prerequisites: { cognitive: 0.7, social: 12, material: 20, energy: 15 }, prerequisiteTech: ['tech_telescope', 'tech_rocketry_basic'],
    resourceCost: { food: 0, materials: 500, energy: 300 }, researchCost: 15,
    description: 'Ангилын survey технологи' },

  // --- Spacecraft (field: spacecraft) ---
  { id: 'tech_rocketry_basic', name: 'Ангилын үндсэн', field: 'spacecraft', domain: 'spacecraft',
    prerequisites: { cognitive: 0.65, social: 12, material: 20, energy: 15 }, prerequisiteTech: ['tech_internal_combustion', 'tech_metallurgy'],
    resourceCost: { food: 0, materials: 500, energy: 300 }, researchCost: 15,
    description: 'Ангилын үндэн technologу' },
  { id: 'tech_satellite', name: 'Ангилын суулга', field: 'spacecraft', domain: 'spacecraft',
    prerequisites: { cognitive: 0.75, social: 16, material: 35, energy: 30 }, prerequisiteTech: ['tech_rocketry_basic', 'tech_radio'],
    resourceCost: { food: 0, materials: 1000, energy: 600 }, researchCost: 25,
    description: 'Ангилын суулга технологи' },
  { id: 'tech_space_probe', name: 'Ангилын шатны exploring', field: 'spacecraft', domain: 'spacecraft',
    prerequisites: { cognitive: 0.8, social: 20, material: 45, energy: 40 }, prerequisiteTech: ['tech_satellite', 'tech_digital_computer'],
    resourceCost: { food: 0, materials: 2000, energy: 1000 }, researchCost: 40,
    description: 'Ангилын шатны exploring технологи' },
  { id: 'tech_orbital_station', name: 'Ангилын өмнөх', field: 'spacecraft', domain: 'spacecraft',
    prerequisites: { cognitive: 0.85, social: 25, material: 60, energy: 50 }, prerequisiteTech: ['tech_space_probe', 'tech_ai'],
    resourceCost: { food: 0, materials: 4000, energy: 2000 }, researchCost: 60,
    description: 'Ангилын өмнөх суулга' },
  { id: 'tech_interplanetary', name: 'Хүйсээс гаيرةа antaras', field: 'spacecraft', domain: 'spacecraft',
    prerequisites: { cognitive: 0.9, social: 30, material: 80, energy: 70 }, prerequisiteTech: ['tech_orbital_station', 'tech_internet'],
    resourceCost: { food: 0, materials: 8000, energy: 5000 }, researchCost: 100,
    description: 'Хүйсээс гаירהа antaras travel' },
  { id: 'tech_space_habitat', name: 'Ангилын хот', field: 'spacecraft', domain: 'habitat',
    prerequisites: { cognitive: 0.85, social: 25, material: 70, energy: 60 }, prerequisiteTech: ['tech_orbital_station', 'tech_ai'],
    resourceCost: { food: 200, materials: 6000, energy: 3000 }, researchCost: 80,
    description: 'Ангилын хот байгуулах' }
];

const TECH_BY_ID = new Map();
for (const def of TECH_TREE) TECH_BY_ID.set(def.id, def);

const MAX_TECH_LEVEL = 10;
const RESEARCH_RATE_PER_STEP = 0.5; // base research progress per step
const GROUP_RESEARCH_BONUS = 0.1; // per group member with abstractReasoning
const CRISIS_CHECK_INTERVAL = 60; // sim seconds between crisis checks
const ENVIRONMENTAL_STRESS_BASE = 0.05;

function fieldLabel(fieldId) {
  return FIELD_LABELS[fieldId] || fieldId;
}

// ------------------------------------------------------------
// Thresholds (tunable, biologically plausible but simplified).
// ------------------------------------------------------------
const INTELLIGENCE_THRESHOLD = 0.55;   // combined cognitive score to count as "intelligent"
const GROUP_FORM_DISTANCE = 3;         // max distance for group membership
const GROUP_MIN_MEMBERS = 3;           // min organisms to form a social group
const TOOL_DISCOVERY_COST = 20;        // energy cost to discover a tool
const CULTURE_SPREAD_CHANCE = 0.15;    // per-step chance a technique spreads
const SETTLEMENT_MIN_MEMBERS = 6;      // min group size to found a settlement
const SETTLEMENT_MIN_TOOLS = 2;        // min distinct tools to found a settlement
const SETTLEMENT_MIN_RESOURCES = 40;   // min stored resources to found a settlement

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

// ------------------------------------------------------------
// Cognitive score — combined intelligence proxy from genome traits.
// Not a guarantee of civilization; just potential.
// ------------------------------------------------------------
function cognitiveScore(genome) {
  const g = genome.traits;
  return (
    g.neuralProcessing * 0.25 +
    g.abstractReasoning * 0.25 +
    g.toolUse * 0.2 +
    g.symbolicComm * 0.15 +
    g.socialLearning * 0.15
  );
}

// ------------------------------------------------------------
// SocialGroup — organisms cooperating around shared knowledge/resources.
// ------------------------------------------------------------
class SocialGroup {
  constructor(id, founderId, environment) {
    this.id = id;
    this.founderId = founderId;
    this.memberIds = new Set([founderId]);
    this.leaderId = founderId;
    this.formedAt = environment.simTime;
    this.sharedResources = 0; // pooled food/energy equivalent
    this.groupMemory = []; // cultural technique ids known by group
    this.traditions = {}; // techniqueId -> adoption count (cultural strength)
    this.toolsKnown = new Set(); // tool technique ids
    this.techLevel = 0; // 0..5 aggregate technology level
    this.stability = 0.5; // 0..1 group cohesion
    this.conflictLevel = 0; // 0..1 internal conflict
    this.location = { x: 0, z: 0 }; // group centroid
    this.isExtinct = false;
    this.extinctionTime = null;
  }

  addMember(orgId) {
    this.memberIds.add(orgId);
  }

  removeMember(orgId) {
    this.memberIds.delete(orgId);
    if (this.leaderId === orgId) {
      // Elect new leader: member with highest cooperation + toolUse.
      const alive = [...this.memberIds];
      if (alive.length === 0) {
        this.leaderId = null;
      } else {
        // leaderId will be set externally by engine using member traits.
        this.leaderId = alive[0];
      }
    }
  }

  memberCount() {
    return this.memberIds.size;
  }

  toJSON() {
    return {
      id: this.id,
      founderId: this.founderId,
      memberIds: [...this.memberIds],
      leaderId: this.leaderId,
      formedAt: this.formedAt,
      sharedResources: this.sharedResources,
      groupMemory: [...this.groupMemory],
      traditions: { ...this.traditions },
      toolsKnown: [...this.toolsKnown],
      techLevel: this.techLevel,
      stability: this.stability,
      conflictLevel: this.conflictLevel,
      location: { ...this.location },
      isExtinct: this.isExtinct,
      extinctionTime: this.extinctionTime
    };
  }

  static fromJSON(json) {
    const g = new SocialGroup(json.id, json.founderId, { simTime: json.formedAt || 0 });
    g.memberIds = new Set(json.memberIds || []);
    g.leaderId = json.leaderId;
    g.sharedResources = json.sharedResources || 0;
    g.groupMemory = Array.isArray(json.groupMemory) ? json.groupMemory : [];
    g.traditions = json.traditions || {};
    g.toolsKnown = new Set(json.toolsKnown || []);
    g.techLevel = json.techLevel || 0;
    g.stability = json.stability || 0.5;
    g.conflictLevel = json.conflictLevel || 0;
    g.location = json.location || { x: 0, z: 0 };
    g.isExtinct = json.isExtinct || false;
    g.extinctionTime = json.extinctionTime;
    return g;
  }
}

// ------------------------------------------------------------
// Culture — learned knowledge transmitted socially, NOT via DNA.
// ------------------------------------------------------------
class Culture {
  constructor(id, originGroupId, environment) {
    this.id = id;
    this.originGroupId = originGroupId;
    this.createdAt = environment.simTime;
    this.knowledge = {}; // techniqueId -> { name, domain, discoveryCost, spreadCount }
    this.techniqueCount = 0;
    this.totalTransmissions = 0;
    this.lossCount = 0;
  }

  addTechnique(techniqueId, info) {
    if (!this.knowledge[techniqueId]) {
      this.knowledge[techniqueId] = { ...info, spreadCount: 0 };
      this.techniqueCount += 1;
    }
  }

  transmit(techniqueId, toGroupId) {
    const k = this.knowledge[techniqueId];
    if (k) {
      k.spreadCount += 1;
      this.totalTransmissions += 1;
    }
  }

  loseTechnique(techniqueId) {
    if (this.knowledge[techniqueId]) {
      delete this.knowledge[techniqueId];
      this.techniqueCount = Math.max(0, this.techniqueCount - 1);
      this.lossCount += 1;
    }
  }

  toJSON() {
    return {
      id: this.id,
      originGroupId: this.originGroupId,
      createdAt: this.createdAt,
      knowledge: { ...this.knowledge },
      techniqueCount: this.techniqueCount,
      totalTransmissions: this.totalTransmissions,
      lossCount: this.lossCount
    };
  }

  static fromJSON(json) {
    const c = new Culture(json.id, json.originGroupId, { simTime: json.createdAt || 0 });
    c.knowledge = json.knowledge || {};
    c.techniqueCount = json.techniqueCount || 0;
    c.totalTransmissions = json.totalTransmissions || 0;
    c.lossCount = json.lossCount || 0;
    return c;
  }
}

// ------------------------------------------------------------
// Technology — a discovered tool/technique with prerequisites,
// research progress, resource costs, and tech-tree dependencies.
// ------------------------------------------------------------
class Technology {
  constructor(id, name, field, domain, prerequisites, resourceCost, researchCost, description) {
    // Backward-compatible: if field is a string domain (old signature),
    // map it to a research field. Otherwise use the provided field id.
    const oldDomains = ['tool', 'material', 'energy', 'construction', 'agriculture', 'communication', 'transportation', 'electronics', 'computing', 'ai', 'spacecraft', 'habitat'];
    this.id = id;
    this.name = name;
    // New signature: field is a research field id. Old signature: domain was a string.
    if (typeof field === 'string' && oldDomains.includes(field) && typeof domain === 'object') {
      // Old call: Technology(id, name, domain, prerequisites, discoveryCost, description)
      // In old signature, field param was actually `domain`, domain param was `prerequisites`.
      // We detect this by checking if the 4th arg (prerequisites) is an object and 5th (resourceCost) is a number.
      this.field = this._domainToField(field);
      this.domain = field; // old domain becomes domain
      this.prerequisites = domain; // old domain object becomes prerequisites
      this.prerequisiteTech = [];
      this.resourceCost = { food: 0, materials: 0, energy: 0 };
      this.discoveryCost = resourceCost; // old discoveryCost
      this.researchCost = 0;
      this.description = researchCost; // old description (was a number, now we shift)
      // Fix: old signature had description as 6th arg, but here resourceCost is 5th (number)
      // We need to handle this carefully. Let's re-derive below.
    } else {
      this.field = field || 'tool';
      this.domain = domain || 'tool';
      this.prerequisites = prerequisites || { cognitive: 0, social: 0, material: 0, energy: 0 };
      this.prerequisiteTech = [];
      this.resourceCost = resourceCost || { food: 0, materials: 0, energy: 0 };
      this.discoveryCost = (this.resourceCost.food || 0) + (this.resourceCost.materials || 0) + (this.resourceCost.energy || 0);
      this.researchCost = researchCost || 0;
      this.description = description || '';
    }
    this.researchProgress = 0; // 0..100
    this.discoveredBy = null; // groupId that first discovered it
    this.discoveredAt = null;
    this.adopterGroups = new Set(); // groupIds that know this tech
    this.totalUses = 0;
    this.unlocked = false; // true when researchProgress >= 100
    this.fieldLabel = fieldLabel(this.field);
  }

  _domainToField(domain) {
    const map = {
      tool: 'materials', material: 'materials', energy: 'energy',
      construction: 'mechanical', agriculture: 'materials',
      communication: 'communication', transportation: 'transportation',
      electronics: 'electronics', computing: 'computing', ai: 'computing',
      spacecraft: 'spacecraft', habitat: 'spacecraft'
    };
    return map[domain] || 'materials';
  }

  canDiscover(group) {
    const cogPrereq = this.prerequisites.cognitive || 0;
    const socPrereq = this.prerequisites.social || 0;
    const matPrereq = this.prerequisites.material || 0;
    const engPrereq = this.prerequisites.energy || 0;

    const cogMet = group.techLevel * 0.2 >= cogPrereq * 0.2;
    const socMet = group.memberCount() >= socPrereq;
    const matMet = group.sharedResources >= matPrereq * 10;
    const engMet = group.sharedResources >= engPrereq * 5;
    return cogMet && socMet && matMet && engMet;
  }

  // ---- New: research-based discovery ----
  canResearch(group, population) {
    if (this.unlocked) return false;

    // Tech prerequisite chain: all prerequisite technologies must be unlocked.
    for (const prereqId of this.prerequisiteTech) {
      const prereqTech = population.technologies.get(prereqId);
      if (!prereqTech || !prereqTech.unlocked) return false;
    }

    // Cognitive/social/material/energy thresholds.
    const cogPrereq = this.prerequisites.cognitive || 0;
    const socPrereq = this.prerequisites.social || 0;
    const matPrereq = this.prerequisites.material || 0;
    const engPrereq = this.prerequisites.energy || 0;

    const cogMet = group.techLevel * 0.2 >= cogPrereq * 0.2;
    const socMet = group.memberCount() >= socPrereq;
    const matMet = group.sharedResources >= matPrereq * 10;
    const engMet = group.sharedResources >= engPrereq * 5;

    // Resource cost check.
    const costMet = group.sharedResources >= (this.resourceCost.food || 0) +
      (this.resourceCost.materials || 0) + (this.resourceCost.energy || 0);

    return cogMet && socMet && matMet && engMet && costMet;
  }

  research(group, population, delta) {
    if (this.unlocked) return 0;
    if (!this.canResearch(group, population)) return 0;

    // Research progress depends on group tech level, member abstractReasoning, and delta.
    const members = [...group.memberIds].map(id => population._findOrg(id)).filter(m => m && m.alive);
    const avgAbstract = members.length > 0
      ? members.reduce((s, m) => s + (m.genome.traits.abstractReasoning || 0), 0) / members.length
      : 0;
    const techBonus = Math.min(group.techLevel / MAX_TECH_LEVEL, 1);

    const progressGain = (RESEARCH_RATE_PER_STEP + avgAbstract * GROUP_RESEARCH_BONUS + techBonus * 0.5) * delta;
    this.researchProgress = Math.min(100, this.researchProgress + progressGain);

    // Consume resources proportionally to progress gain.
    const totalCost = (this.resourceCost.food || 0) + (this.resourceCost.materials || 0) + (this.resourceCost.energy || 0);
    const consumeAmount = totalCost * (progressGain / 100) * 0.1;
    group.sharedResources = Math.max(0, group.sharedResources - consumeAmount);

    if (this.researchProgress >= 100 && !this.unlocked) {
      this.unlocked = true;
      this.discoveredBy = group.id;
      this.discoveredAt = population.environment.simTime;
      this.adopt(group.id);
      population.recordEvent('tech_discovered', `Group #${group.id} discovered ${this.name}`, {
        groupId: group.id, technology: this.id, field: this.field
      });
    }
    return progressGain;
  }

  adopt(groupId) {
    this.adopterGroups.add(groupId);
    this.totalUses += 1;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      field: this.field,
      domain: this.domain,
      prerequisites: { ...this.prerequisites },
      prerequisiteTech: [...this.prerequisiteTech],
      resourceCost: { ...this.resourceCost },
      researchCost: this.researchCost,
      description: this.description,
      discoveryCost: this.discoveryCost,
      researchProgress: this.researchProgress,
      discoveredBy: this.discoveredBy,
      discoveredAt: this.discoveredAt,
      adopterGroups: [...this.adopterGroups],
      totalUses: this.totalUses,
      unlocked: this.unlocked,
      fieldLabel: this.fieldLabel
    };
  }

  static fromJSON(json) {
    const t = new Technology(json.id, json.name, json.field, json.domain, json.prerequisites, json.resourceCost, json.researchCost, json.description);
    t.prerequisiteTech = new Set(json.prerequisiteTech || []);
    t.resourceCost = json.resourceCost || { food: 0, materials: 0, energy: 0 };
    t.researchCost = json.researchCost || 0;
    t.description = json.description || '';
    t.discoveryCost = json.discoveryCost || 0;
    t.researchProgress = json.researchProgress || 0;
    t.discoveredBy = json.discoveredBy;
    t.discoveredAt = json.discoveredAt;
    t.adopterGroups = new Set(json.adopterGroups || []);
    t.totalUses = json.totalUses || 0;
    t.unlocked = json.unlocked || false;
    t.fieldLabel = json.fieldLabel || fieldLabel(json.field);
    return t;
  }
}

// ------------------------------------------------------------
// Settlement — a populated center with stored resources, infrastructure,
// energy networks, scientific facilities, and environmental impact.
// ------------------------------------------------------------
class Settlement {
  constructor(id, founderGroupId, environment) {
    this.id = id;
    this.founderGroupId = founderGroupId;
    this.foundedAt = environment.simTime;
    this.location = { ...environment.location || { x: 0, z: 0 } };
    this.population = 0;
    this.maxPopulation = 50; // settlement capacity, grows with infrastructure
    this.storedFood = 0;
    this.storedMaterials = 0;
    this.storedEnergy = 0;
    this.infrastructure = 0; // 0..10 shelter/construction level
    this.techLevel = 0;
    this.populationHistory = []; // {t, population}
    this.isAbandoned = false;
    this.abandonmentTime = null;
    this.collapseReason = null;

    // Infrastructure subsystems (0..10 each).
    this.energyInfrastructure = 0; // energy generation & distribution
    this.scientificFacilities = 0; // labs, observatories, research centers
    this.communicationSystems = 0; // radios, networks, satellites
    this.transportationInfrastructure = 0; // roads, vehicles, launch pads
    this.lifeSupport = 0; // air, water, food production

    // Resource production rates (per second).
    this.foodProduction = 0;
    this.materialProduction = 0;
    this.energyProduction = 0;

    // Environmental impact.
    this.environmentalImpact = 0; // 0..1, pollution/ecological damage
    this.sustainability = 1; // 1 = sustainable, lower = damaging

    // Spacefaring capability.
    this.spaceportLevel = 0; // 0..5, launch pad capability
    this.satelliteUplink = false;
    this.orbitalStationAccess = false;
  }

  addPopulation(n) {
    this.population = Math.max(0, Math.min(this.maxPopulation, this.population + n));
  }

  // Update settlement systems each step. Returns event descriptions.
  update(delta, group, population) {
    const events = [];
    if (this.isAbandoned) return events;

    const members = [...group.memberIds].map(id => population._findOrg(id)).filter(m => m && m.alive);
    this.population = members.length;
    this.populationHistory.push({ t: population.environment.simTime, population: members.length });
    if (this.populationHistory.length > 120) this.populationHistory.shift();

    // Population growth when resources are sufficient.
    const totalStored = this.storedFood + this.storedMaterials + this.storedEnergy;
    const avgTech = this.techLevel || 0;
    if (members.length > 0 && totalStored > 100 && this.population < this.maxPopulation) {
      const growthChance = 0.001 * delta * (1 + avgTech * 0.1) * (totalStored / 500);
      if (population.rng.bool(growthChance)) {
        this.addPopulation(1);
        events.push({ type: 'population_growth', description: `Settlement #${this.id} population grew`, data: { settlementId: this.id, population: this.population } });
      }
    }

    // Resource production from infrastructure.
    this.foodProduction = this.lifeSupport * 0.1 * members.length;
    this.materialProduction = this.infrastructure * 0.05 * members.length;
    this.energyProduction = this.energyInfrastructure * 0.1 * members.length;

    // Consumption scales with population and tech level.
    const foodConsumption = members.length * 0.1 * delta * (1 + avgTech * 0.05);
    const materialConsumption = members.length * 0.05 * delta * (1 + avgTech * 0.1);
    const energyConsumption = members.length * 0.08 * delta * (1 + avgTech * 0.15) + this.scientificFacilities * 0.2 * delta;

    this.storedFood = Math.max(0, this.storedFood + this.foodProduction * delta - foodConsumption);
    this.storedMaterials = Math.max(0, this.storedMaterials + this.materialProduction * delta - materialConsumption);
    this.storedEnergy = Math.max(0, this.storedEnergy + this.energyProduction * delta - energyConsumption);

    // Environmental impact rises with industry and population.
    const impactFromIndustry = (this.infrastructure + this.energyInfrastructure + this.scientificFacilities) * 0.001 * delta;
    const impactFromPopulation = members.length * 0.0005 * delta;
    this.environmentalImpact = Math.min(1, this.environmentalImpact + impactFromIndustry + impactFromPopulation);
    // Sustainability slowly recovers if impact is low.
    this.sustainability = Math.max(0, Math.min(1, 1 - this.environmentalImpact + 0.001 * delta));

    // Collapse check: critical resource depletion or environmental disaster.
    if (!this.isAbandoned) {
      const critical = this.storedFood <= 0 && this.storedMaterials <= 0 && this.storedEnergy <= 0;
      const envDisaster = this.environmentalImpact > 0.9 && this.sustainability < 0.2;
      if (critical || envDisaster) {
        this.isAbandoned = true;
        this.abandonmentTime = population.environment.simTime;
        this.collapseReason = critical ? 'resource_depletion' : 'environmental_collapse';
        population.recordEvent('settlement_collapse', `Settlement #${this.id} collapsed: ${this.collapseReason}`, {
          settlementId: this.id, groupId: this.founderGroupId, reason: this.collapseReason
        });
        events.push({ type: 'settlement_collapse', description: `Settlement #${this.id} collapsed: ${this.collapseReason}`, data: { settlementId: this.id, reason: this.collapseReason } });
      }
    }

    return events;
  }

  // Can this settlement support launching a spacecraft?
  canLaunch() {
    return !this.isAbandoned && this.spaceportLevel >= 1 && this.storedEnergy >= 100 && this.storedMaterials >= 200;
  }

  toJSON() {
    return {
      id: this.id,
      founderGroupId: this.founderGroupId,
      foundedAt: this.foundedAt,
      location: { ...this.location },
      population: this.population,
      maxPopulation: this.maxPopulation,
      storedFood: this.storedFood,
      storedMaterials: this.storedMaterials,
      storedEnergy: this.storedEnergy,
      infrastructure: this.infrastructure,
      techLevel: this.techLevel,
      populationHistory: this.populationHistory.slice(-120),
      isAbandoned: this.isAbandoned,
      abandonmentTime: this.abandonmentTime,
      collapseReason: this.collapseReason,
      energyInfrastructure: this.energyInfrastructure,
      scientificFacilities: this.scientificFacilities,
      communicationSystems: this.communicationSystems,
      transportationInfrastructure: this.transportationInfrastructure,
      lifeSupport: this.lifeSupport,
      foodProduction: this.foodProduction,
      materialProduction: this.materialProduction,
      energyProduction: this.energyProduction,
      environmentalImpact: this.environmentalImpact,
      sustainability: this.sustainability,
      spaceportLevel: this.spaceportLevel,
      satelliteUplink: this.satelliteUplink,
      orbitalStationAccess: this.orbitalStationAccess
    };
  }

  static fromJSON(json) {
    const s = new Settlement(json.id, json.founderGroupId, { simTime: json.foundedAt || 0, location: json.location });
    s.location = json.location || { x: 0, z: 0 };
    s.population = json.population || 0;
    s.maxPopulation = json.maxPopulation || 50;
    s.storedFood = json.storedFood || 0;
    s.storedMaterials = json.storedMaterials || 0;
    s.storedEnergy = json.storedEnergy || 0;
    s.infrastructure = json.infrastructure || 0;
    s.techLevel = json.techLevel || 0;
    s.populationHistory = Array.isArray(json.populationHistory) ? json.populationHistory : [];
    s.isAbandoned = json.isAbandoned || false;
    s.abandonmentTime = json.abandonmentTime;
    s.collapseReason = json.collapseReason;
    s.energyInfrastructure = json.energyInfrastructure || 0;
    s.scientificFacilities = json.scientificFacilities || 0;
    s.communicationSystems = json.communicationSystems || 0;
    s.transportationInfrastructure = json.transportationInfrastructure || 0;
    s.lifeSupport = json.lifeSupport || 0;
    s.foodProduction = json.foodProduction || 0;
    s.materialProduction = json.materialProduction || 0;
    s.energyProduction = json.energyProduction || 0;
    s.environmentalImpact = json.environmentalImpact || 0;
    s.sustainability = json.sustainability !== undefined ? json.sustainability : 1;
    s.spaceportLevel = json.spaceportLevel || 0;
    s.satelliteUplink = json.satelliteUplink || false;
    s.orbitalStationAccess = json.orbitalStationAccess || false;
    return s;
  }
}

// ------------------------------------------------------------
// CivilizationEngine — orchestrates civilization emergence from a LifeEngine population.
// ------------------------------------------------------------
class CivilizationEngine {
  constructor(lifeEngine) {
    this.lifeEngine = lifeEngine;
    this.population = lifeEngine.population;
    this.environment = lifeEngine.environment;
    this.rng = lifeEngine.rng;
    this.running = false;
    this.speed = 1;
    this.sessionTime = 0;
    this.notes = [];
    this.civilizationEvents = [];
    this.maxEvents = 200;

    // Initialize standard tech tree (unlocked = false, researchProgress = 0).
    for (const def of TECH_TREE) {
      if (!this.population.technologies.has(def.id)) {
        const tech = new Technology(def.id, def.name, def.field, def.domain, def.prerequisites, def.resourceCost, def.researchCost, def.description);
        tech.prerequisiteTech = new Set(def.prerequisiteTech);
        this.population.technologies.set(def.id, tech);
      }
    }

    // Intergroup relations: groupId -> { otherGroupId -> relation (-1..1) }
    // -1 = hostile, 0 = neutral, 1 = allied.
    this.groupRelations = new Map();

    // Crisis tracking.
    this.crisisActive = null; // { type, startTime, severity, affectedGroups }
    this.crisisHistory = [];
    this.maxCrisisHistory = 100;
    this.lastCrisisCheck = 0;

    // Spacefaring milestone tracking.
    this.spaceMilestones = []; // { t, type, description, data }
    this.maxSpaceMilestones = 50;
  }

  // ---- configuration ----
  setRunning(running) {
    this.running = Boolean(running);
    return this.running;
  }

  setSpeed(speed) {
    this.speed = Math.max(0, Math.min(10, Number(speed) || 1));
    return this.speed;
  }

  addNote(text) {
    this.notes.push({ t: this.sessionTime, text });
    if (this.notes.length > 100) this.notes.shift();
    return this.notes;
  }

  recordEvent(type, description, data = {}) {
    this.civilizationEvents.push({
      t: this.environment.simTime,
      type,
      description,
      data
    });
    if (this.civilizationEvents.length > this.maxEvents) this.civilizationEvents.shift();
  }

  // ---- core step ----
  step(delta) {
    if (!this.running) return this.getState();
    const stepDelta = Math.min(delta * this.speed, 0.1);
    this.sessionTime += stepDelta;

    const orgs = this.population.organisms;
    const env = this.environment;

    // 1. Identify intelligent organisms (cognitive score above threshold).
    const intelligent = orgs.filter(o => o.alive && cognitiveScore(o.genome) >= INTELLIGENCE_THRESHOLD);

    // 2. Social group formation (Phase 3).
    this._formSocialGroups(intelligent, orgs);

    // 3. Cultural knowledge transfer (Phase 4).
    this._spreadCulture(intelligent);

    // 4. Tool discovery & technology (Phase 5).
    this._discoverTools(intelligent, orgs);

    // 4b. Research phase — advance technology research based on group capability.
    this._researchPhase(stepDelta, intelligent);

    // 5. Settlement founding & update (Phase 6).
    this._foundSettlements();
    this._updateSettlements(stepDelta, intelligent);

    // 6. Resource economy (Phase 7).
    this._updateResources(stepDelta, intelligent);

    // 7. Group stability & dissolution.
    this._updateGroupStability(stepDelta);

    // 8. Intergroup cooperation, conflict, trade, migration.
    this._updateGroupInteractions(stepDelta);

    // 9. Environmental crises & collapse/recovery.
    this._updateCrises(stepDelta);

    // 10. Spacefaring milestone checks.
    this._checkSpaceMilestones();

    return this.getState();
  }

  // ---- Phase 3: Social group formation ----
  _formSocialGroups(intelligent, allOrgs) {
    const ungrouped = intelligent.filter(o => o.groupId === null);
    const used = new Set();

    for (const founder of ungrouped) {
      if (used.has(founder.id)) continue;

      // Find nearby intelligent organisms with sufficient cooperation/communication.
      const nearby = ungrouped.filter(o => {
        if (used.has(o.id) || o.id === founder.id) return false;
        const d = Math.hypot(o.position.x - founder.position.x, o.position.z - founder.position.z);
        return d <= GROUP_FORM_DISTANCE &&
          o.genome.traits.cooperation > 0.3 &&
          o.genome.traits.symbolicComm > 0.2;
      });

      if (nearby.length >= GROUP_MIN_MEMBERS - 1) {
        const group = new SocialGroup(this.population.nextGroupId++, founder.id, this.environment);
        this.population.socialGroups.set(group.id, group);

        const members = [founder, ...nearby.slice(0, 5)];
        for (const m of members) {
          m.groupId = group.id;
          group.addMember(m.id);
          used.add(m.id);
        }

        // Leader = highest combined cooperation + toolUse.
        let best = members[0];
        let bestScore = -1;
        for (const m of members) {
          const s = m.genome.traits.cooperation + m.genome.traits.toolUse;
          if (s > bestScore) { bestScore = s; best = m; }
        }
        group.leaderId = best.id;
        group.location = {
          x: members.reduce((s, m) => s + m.position.x, 0) / members.length,
          z: members.reduce((s, m) => s + m.position.z, 0) / members.length
        };

        this.recordEvent('group_formed', `Social group #${group.id} formed by organism ${founder.id}`, { groupId: group.id, memberCount: members.length });
        this.addNote(`Social group #${group.id} formed (${members.length} members)`);
      }
    }

    // Remove members that died from groups.
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;
      const dead = [...group.memberIds].filter(id => {
        const o = allOrgs.find(o => o.id === id);
        return !o || !o.alive;
      });
      for (const id of dead) {
        group.removeMember(id);
        const o = allOrgs.find(o => o.id === id);
        if (o) o.groupId = null;
      }
      if (group.memberCount() === 0 && !group.isExtinct) {
        group.isExtinct = true;
        group.extinctionTime = this.environment.simTime;
        this.recordEvent('group_extinct', `Social group #${gid} went extinct`, { groupId: gid });
      }
    }
  }

  // ---- Phase 4: Cultural knowledge transfer ----
  _spreadCulture(intelligent) {
    // Each group may innovate a new technique based on abstractReasoning + toolUse.
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;

      // Innovation: rare, depends on leader's abstractReasoning.
      const leader = this._findOrg(group.leaderId);
      if (leader && this.rng.bool(0.02)) {
        const techId = `tech_${this.population.nextTechId++}`;
        const name = this._techniqueName();
        const technique = {
          id: techId,
          name,
          domain: 'tool',
          discoveryCost: TOOL_DISCOVERY_COST,
          description: `Learned technique: ${name}`
        };
        group.groupMemory.push(techId);
        group.toolsKnown.add(techId);
        group.traditions[techId] = 1;

        // Create a Technology record.
        const tech = new Technology(techId, name, 'tool', { cognitive: 0.4, social: 2, material: 1, energy: 1}, TOOL_DISCOVERY_COST, technique.description);
        tech.discoveredBy = gid;
        tech.discoveredAt = this.environment.simTime;
        tech.adopt(gid);
        this.population.technologies.set(techId, tech);

        leader.innovationCount += 1;
        leader.culturalKnowledge.push(techId);
        leader.toolSkill = Math.min(1, leader.toolSkill + 0.1);

        this.recordEvent('cultural_innovation', `Group #${gid} innovated: ${name}`, { groupId: gid, technique: techId });
        this.addNote(`Group #${gid} innovated: ${name}`);
      }

      // Cultural transmission: techniques spread between nearby groups.
      this._transmitBetweenGroups(group);
    }
  }

  _transmitBetweenGroups(sourceGroup) {
    const groups = [...this.population.socialGroups.values()].filter(g => !g.isExtinct && g.id !== sourceGroup.id);
    for (const target of groups) {
      const dist = Math.hypot(target.location.x - sourceGroup.location.x, target.location.z - sourceGroup.location.z);
      if (dist > GROUP_FORM_DISTANCE * 3) continue;

      for (const techId of sourceGroup.groupMemory) {
        if (target.groupMemory.includes(techId)) continue;
        const leader = this._findOrg(target.leaderId);
        const canAdopt = leader && leader.genome.traits.socialLearning > 0.3 && this.rng.bool(CULTURE_SPREAD_CHANCE);
        if (canAdopt) {
          target.groupMemory.push(techId);
          target.toolsKnown.add(techId);
          target.traditions[techId] = (target.traditions[techId] || 0) + 1;
          target.sharedResources = Math.max(0, target.sharedResources - 5); // cost of adoption
          const tech = this.population.technologies.get(techId);
          if (tech) tech.adopt(target.id);
          this.recordEvent('cultural_transmission', `Technique ${techId} spread from group #${sourceGroup.id} to #${target.id}`, { from: sourceGroup.id, to: target.id, technique: techId });
        }
      }
    }
  }

  // ---- Phase 5: Tool discovery & technology ----
  _discoverTools(intelligent, allOrgs) {
    for (const org of intelligent) {
      if (!org.alive || org.groupId === null) continue;
      const group = this.population.socialGroups.get(org.groupId);
      if (!group || group.isExtinct) continue;

      // Individual tool-use skill grows with practice.
      const tu = org.genome.traits.toolUse;
      if (tu > 0.4 && org.energy > 40 && this.rng.bool(0.01)) {
        org.toolSkill = Math.min(1, org.toolSkill + 0.05);
        org.energy = Math.max(0, org.energy - 2);
      }
    }
  }

  // ---- Phase 4b: Research phase — advance technology research ----
  _researchPhase(delta, intelligent) {
    // Each active group can research one technology per step based on capability.
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;

      const members = [...group.memberIds].map(id => this._findOrg(id)).filter(m => m && m.alive);
      if (members.length === 0) continue;

      // Find candidate technologies: not unlocked, prerequisites met, affordable.
      const candidates = [];
      for (const [tid, tech] of this.population.technologies) {
        if (tech.unlocked) continue;
        if (tech.canResearch(group, this.population)) {
          // Priority: lower research cost first, then by field order.
          const fieldOrder = RESEARCH_FIELDS[tech.field]?.order || 99;
          candidates.push({ tech, fieldOrder, cost: tech.researchCost });
        }
      }

      if (candidates.length === 0) continue;

      // Sort: by research cost ascending, then field order.
      candidates.sort((a, b) => a.cost - b.cost || a.fieldOrder - b.fieldOrder);
      const target = candidates[0];

      // Research effort depends on group's abstract reasoning and tech level.
      const avgAbstract = members.reduce((s, m) => s + (m.genome.traits.abstractReasoning || 0), 0) / members.length;
      const effort = (0.2 + avgAbstract * 0.5 + Math.min(group.techLevel / MAX_TECH_LEVEL, 1) * 0.3) * delta;

      const progress = target.tech.research(group, this.population, effort);
      if (progress > 0) {
        const leader = this._findOrg(group.leaderId);
        if (leader) leader.culturalKnowledge.push(target.tech.id);
        this.addNote(`Group #${gid} researching ${target.tech.name} (${Math.round(target.tech.researchProgress)}%)`);
      }
    }
  }

  // ---- External research boost (e.g. from ScienceAcademy lab completion) ----
  boostResearch(fieldId, amount = 10) {
    if (!RESEARCH_FIELDS[fieldId]) return 0;
    let totalBoosted = 0;
    for (const [tid, tech] of this.population.technologies) {
      if (tech.unlocked) continue;
      if (tech.field !== fieldId) continue;
      // Only boost researchable (prerequisites met) technologies.
      const anyGroup = [...this.population.socialGroups.values()].find(g => !g.isExtinct && g.memberCount() > 0);
      if (!anyGroup || !tech.canResearch(anyGroup, this.population)) continue;
      const before = tech.researchProgress;
      tech.researchProgress = Math.min(100, tech.researchProgress + amount);
      totalBoosted += tech.researchProgress - before;
      if (tech.researchProgress >= 100 && !tech.unlocked) {
        tech.unlocked = true;
        tech.discoveredBy = 'external';
        tech.discoveredAt = this.environment.simTime;
        tech.adopt('external');
        this.recordEvent('tech_discovered', `External research unlocked ${tech.name}`, { technology: tech.id, field: tech.field, source: 'lab' });
        this.addNote(`External research unlocked ${tech.name}`);
      }
    }
    return totalBoosted;
  }

  // ---- Phase 6b: Settlement update — infrastructure, production, environmental impact ----
  _updateSettlements(delta, intelligent) {
    for (const [sid, settlement] of this.population.settlements) {
      if (settlement.isAbandoned) continue;

      const group = this.population.socialGroups.get(settlement.founderGroupId);
      if (!group || group.isExtinct) continue;

      const events = settlement.update(delta, group, this.population);
      for (const e of events) {
        this.recordEvent(e.type, e.description, e.data);
        this.addNote(e.description);
      }

      // Upgrade infrastructure when resources allow.
      const totalStored = settlement.storedFood + settlement.storedMaterials + settlement.storedEnergy;
      if (totalStored > 200 && settlement.infrastructure < 10 && this.rng.bool(0.002)) {
        settlement.infrastructure = Math.min(10, settlement.infrastructure + 1);
        settlement.maxPopulation = Math.min(200, settlement.maxPopulation + 10);
        group.sharedResources = Math.max(0, group.sharedResources - 50);
        this.recordEvent('settlement_upgrade', `Settlement #${sid} infrastructure upgraded to ${settlement.infrastructure}`, { settlementId: sid });
      }

      // Build scientific facilities when tech level supports it.
      if (settlement.techLevel >= 3 && settlement.scientificFacilities < 10 && totalStored > 500 && this.rng.bool(0.001)) {
        settlement.scientificFacilities = Math.min(10, settlement.scientificFacilities + 1);
        group.sharedResources = Math.max(0, group.sharedResources - 100);
        this.recordEvent('facility_built', `Settlement #${sid} built scientific facility #${settlement.scientificFacilities}`, { settlementId: sid });
      }

      // Build energy infrastructure.
      if (settlement.techLevel >= 4 && settlement.energyInfrastructure < 10 && totalStored > 800 && this.rng.bool(0.001)) {
        settlement.energyInfrastructure = Math.min(10, settlement.energyInfrastructure + 1);
        group.sharedResources = Math.max(0, group.sharedResources - 150);
        this.recordEvent('energy_built', `Settlement #${sid} energy infrastructure #${settlement.energyInfrastructure}`, { settlementId: sid });
      }

      // Build spaceport when space tech unlocked.
      const rocketry = this.population.technologies.get('tech_rocketry_basic');
      if (rocketry && rocketry.unlocked && settlement.spaceportLevel < 5 && totalStored > 2000 && this.rng.bool(0.0005)) {
        settlement.spaceportLevel = Math.min(5, settlement.spaceportLevel + 1);
        group.sharedResources = Math.max(0, group.sharedResources - 500);
        this.recordEvent('spaceport_built', `Settlement #${sid} spaceport level ${settlement.spaceportLevel}`, { settlementId: sid });
      }

      // Settlement tech level from group.
      settlement.techLevel = Math.min(MAX_TECH_LEVEL, group.techLevel * 2);

      // If group goes extinct, settlement may be abandoned.
      if (group.memberCount() === 0) {
        settlement.isAbandoned = true;
        settlement.abandonmentTime = this.environment.simTime;
        settlement.collapseReason = 'group_extinction';
        this.recordEvent('settlement_abandoned', `Settlement #${sid} abandoned (group extinct)`, { settlementId: sid });
      }
    }
  }

  // ---- Phase 8: Intergroup cooperation, conflict, trade, migration ----
  _updateGroupInteractions(delta) {
    const groups = [...this.population.socialGroups.values()].filter(g => !g.isExtinct && g.memberCount() > 0);
    if (groups.length < 2) return;

    // Initialize relations for new group pairs.
    for (const a of groups) {
      if (!this.groupRelations.has(a.id)) this.groupRelations.set(a.id, new Map());
      for (const b of groups) {
        if (a.id === b.id) continue;
        if (!this.groupRelations.get(a.id).has(b.id)) {
          this.groupRelations.get(a.id).set(b.id, 0); // neutral
        }
      }
    }

    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const ga = groups[i];
        const gb = groups[j];
        const relMapA = this.groupRelations.get(ga.id);
        const relMapB = this.groupRelations.get(gb.id);
        const relation = relMapA.get(gb.id) ?? 0;

        const dist = Math.hypot(ga.location.x - gb.location.x, ga.location.z - gb.location.z);

        // Distant groups drift toward neutral.
        if (dist > GROUP_FORM_DISTANCE * 5) {
          const newRel = clamp(relation + (0 - relation) * 0.001 * delta);
          relMapA.set(gb.id, newRel);
          relMapB.set(ga.id, newRel);
          continue;
        }

        // Interaction chance based on proximity and relation.
        const interactChance = 0.005 * delta * (1 + Math.abs(relation));
        if (!this.rng.bool(interactChance)) continue;

        // Resource trade: friendly groups exchange surplus.
        if (relation > 0.3 && ga.sharedResources > 100 && gb.sharedResources < 50) {
          const transfer = Math.min(50, ga.sharedResources * 0.2);
          ga.sharedResources -= transfer;
          gb.sharedResources += transfer;
          relMapA.set(gb.id, clamp(relation + 0.01));
          relMapB.set(ga.id, clamp(relation + 0.01));
          this.recordEvent('resource_trade', `Group #${ga.id} traded resources with group #${gb.id}`, { from: ga.id, to: gb.id, amount: transfer });
          continue;
        }

        // Competition over scarce resources: negative relation drift.
        if (relation < -0.3 && ga.sharedResources > 0 && gb.sharedResources > 0) {
          const loss = Math.min(10, ga.sharedResources * 0.05);
          ga.sharedResources = Math.max(0, ga.sharedResources - loss);
          relMapA.set(gb.id, clamp(relation - 0.005));
          relMapB.set(ga.id, clamp(relation - 0.005));
          this.recordEvent('resource_competition', `Group #${ga.id} competed with group #${gb.id} over resources`, { from: ga.id, to: gb.id, loss });
          continue;
        }

        // Migration: members move from struggling to thriving groups.
        if (relation > 0.5 && ga.memberCount() > 6 && gb.memberCount() < 6 && gb.sharedResources > ga.sharedResources * 1.5) {
          const migrantId = [...ga.memberIds][Math.floor(this.rng.next() * ga.memberIds.size)];
          const migrant = this._findOrg(migrantId);
          if (migrant && migrant.alive) {
            ga.removeMember(migrantId);
            gb.addMember(migrantId);
            migrant.groupId = gb.id;
            ga.sharedResources = Math.max(0, ga.sharedResources - 10);
            gb.sharedResources = Math.min(500, gb.sharedResources + 10);
            this.recordEvent('migration', `Organism ${migrantId} migrated from group #${ga.id} to #${gb.id}`, { from: ga.id, to: gb.id, organismId: migrantId });
          }
        }

        // Neutral drift: small random relation changes.
        if (this.rng.bool(0.001 * delta)) {
          const drift = this.rng.range(-0.02, 0.02);
          relMapA.set(gb.id, clamp(relation + drift));
          relMapB.set(ga.id, clamp(relation + drift));
        }
      }
    }
  }

  // ---- Phase 9: Environmental crises & collapse/recovery ----
  _updateCrises(delta) {
    this.lastCrisisCheck += delta;
    if (this.lastCrisisCheck < CRISIS_CHECK_INTERVAL) return;
    this.lastCrisisCheck = 0;

    const activeGroups = [...this.population.socialGroups.values()].filter(g => !g.isExtinct && g.memberCount() > 0);
    if (activeGroups.length === 0) return;

    // Environmental stress from planet conditions.
    const envStress = this._computeEnvironmentalStress();

    // Random crisis trigger based on stress and RNG.
    const crisisChance = envStress * 0.02 * (delta / CRISIS_CHECK_INTERVAL);
    if (!this.rng.bool(crisisChance)) {
      // If no crisis, existing crisis may resolve.
      if (this.crisisActive) {
        this.crisisActive.severity = Math.max(0, this.crisisActive.severity - 0.1 * delta);
        if (this.crisisActive.severity <= 0) {
          this._resolveCrisis();
        }
      }
      return;
    }

    // Start a new crisis if none active.
    if (this.crisisActive) return;

    const crisisTypes = ['resource_shortage', 'radiation_spike', 'temperature_extreme', 'technological_failure', 'environmental_crisis'];
    const type = this.rng.pick(crisisTypes);
    const severity = clamp(envStress + this.rng.range(0.2, 0.6));
    const affectedCount = Math.max(1, Math.floor(activeGroups.length * this.rng.range(0.3, 0.8)));
    const affected = this.rng.pick(activeGroups).id; // simplify: affect one primary group

    this.crisisActive = {
      type,
      startTime: this.environment.simTime,
      severity,
      affectedGroupId: affected
    };

    // Apply crisis effects.
    const group = this.population.socialGroups.get(affected);
    if (group) {
      if (type === 'resource_shortage') {
        group.sharedResources = Math.max(0, group.sharedResources * 0.5);
      } else if (type === 'technological_failure') {
        // Lose one technique.
        const techs = [...group.groupMemory];
        if (techs.length > 0) {
          const lost = techs[Math.floor(this.rng.next() * techs.length)];
          group.groupMemory = group.groupMemory.filter(t => t !== lost);
          group.toolsKnown.delete(lost);
          group.techLevel = Math.min(5, group.toolsKnown.size * 0.5);
        }
      } else if (type === 'radiation_spike' || type === 'temperature_extreme') {
        // Reduce member energy/health.
        for (const id of group.memberIds) {
          const org = this._findOrg(id);
          if (org && org.alive) org.energy = Math.max(0, org.energy - 20);
        }
      } else if (type === 'environmental_crisis') {
        group.sharedResources = Math.max(0, group.sharedResources * 0.3);
        group.conflictLevel = Math.min(1, group.conflictLevel + 0.3);
      }

      this.recordEvent('crisis_started', `Crisis: ${type} affecting group #${affected} (severity ${severity.toFixed(1)})`, {
        type, groupId: affected, severity
      });
      this.addNote(`Crisis: ${type} (severity ${severity.toFixed(1)})`);
    }

    this.crisisHistory.push({ ...this.crisisActive, resolved: false, resolvedAt: null });
    if (this.crisisHistory.length > this.maxCrisisHistory) this.crisisHistory.shift();
  }

  _computeEnvironmentalStress() {
    const e = this.environment;
    let stress = 0;
    // Temperature deviation.
    const temp = typeof e.temperature === 'number' ? e.temperature : 20;
    stress += Math.abs(temp - 27.5) / 40 * 0.3;
    // Radiation.
    const radiation = typeof e.radiation === 'number' ? e.radiation : 0;
    stress += radiation / 100 * 0.3;
    // Water scarcity.
    const water = typeof e.water === 'number' ? e.water : 50;
    stress += (1 - water / 100) * 0.2;
    // Toxins.
    const toxins = typeof e.toxins === 'number' ? e.toxins : 0;
    stress += toxins / 100 * 0.2;
    return clamp(stress, 0, 1);
  }

  _resolveCrisis() {
    if (!this.crisisActive) return;
    this.crisisActive.resolvedAt = this.environment.simTime;
    this.crisisHistory.push({ ...this.crisisActive, resolved: true, resolvedAt: this.environment.simTime });
    if (this.crisisHistory.length > this.maxCrisisHistory) this.crisisHistory.shift();
    this.recordEvent('crisis_resolved', `Crisis resolved: ${this.crisisActive.type}`, { type: this.crisisActive.type });
    this.addNote(`Crisis resolved: ${this.crisisActive.type}`);
    this.crisisActive = null;
  }

  // ---- Phase 10: Spacefaring milestone checks ----
  _checkSpaceMilestones() {
    // Rocket launch milestone: basic rocketry unlocked + spaceport exists.
    const rocketry = this.population.technologies.get('tech_rocketry_basic');
    if (rocketry && rocketry.unlocked && !this._hasMilestone('rocket_research')) {
      this._addMilestone('rocket_research', 'Ангилын үндсэн tech авагдалаа', { tech: 'tech_rocketry_basic' });
    }

    // Satellite milestone.
    const satellite = this.population.technologies.get('tech_satellite');
    if (satellite && satellite.unlocked && !this._hasMilestone('satellite')) {
      const hasSpaceport = [...this.population.settlements.values()].some(s => s.spaceportLevel >= 1 && !s.isAbandoned);
      if (hasSpaceport) {
        this._addMilestone('satellite', 'Ангилын суулга тунгааragsан', { tech: 'tech_satellite' });
      }
    }

    // Space probe milestone.
    const probe = this.population.technologies.get('tech_space_probe');
    if (probe && probe.unlocked && !this._hasMilestone('space_probe')) {
      const hasSpaceport = [...this.population.settlements.values()].some(s => s.spaceportLevel >= 2 && !s.isAbandoned);
      if (hasSpaceport) {
        this._addMilestone('space_probe', 'Ангилын шатны exploring устьээс шигдсэн', { tech: 'tech_space_probe' });
      }
    }

    // Orbital station milestone.
    const station = this.population.technologies.get('tech_orbital_station');
    if (station && station.unlocked && !this._hasMilestone('orbital_station')) {
      const hasSpaceport = [...this.population.settlements.values()].some(s => s.spaceportLevel >= 3 && !s.isAbandoned);
      if (hasSpaceport) {
        this._addMilestone('orbital_station', 'Ангилын өмнөх суулга байгуулагдсан', { tech: 'tech_orbital_station' });
      }
    }

    // Space habitat milestone.
    const habitat = this.population.technologies.get('tech_space_habitat');
    if (habitat && habitat.unlocked && !this._hasMilestone('space_habitat')) {
      const hasSpaceport = [...this.population.settlements.values()].some(s => s.spaceportLevel >= 4 && !s.isAbandoned);
      if (hasSpaceport) {
        this._addMilestone('space_habitat', 'Ангилын хот байгуулагдсан', { tech: 'tech_space_habitat' });
      }
    }

    // Interplanetary milestone.
    const interplanetary = this.population.technologies.get('tech_interplanetary');
    if (interplanetary && interplanetary.unlocked && !this._hasMilestone('interplanetary')) {
      const hasSpaceport = [...this.population.settlements.values()].some(s => s.spaceportLevel >= 5 && !s.isAbandoned);
      if (hasSpaceport) {
        this._addMilestone('interplanetary', 'Хүйсээс гаירהа antaras travel эрсэлт', { tech: 'tech_interplanetary' });
      }
    }
  }

  _hasMilestone(type) {
    return this.spaceMilestones.some(m => m.type === type);
  }

  _addMilestone(type, description, data = {}) {
    this.spaceMilestones.push({
      t: this.environment.simTime,
      type,
      description,
      data
    });
    if (this.spaceMilestones.length > this.maxSpaceMilestones) this.spaceMilestones.shift();
    this.recordEvent('space_milestone', description, { type, ...data });
    this.addNote(`🚀 ${description}`);
  }

  // ---- Phase 6: Settlement founding ----
  _foundSettlements() {
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;
      if (this.population.settlements.has(gid)) continue; // one settlement per group max

      const members = [...group.memberIds].map(id => this._findOrg(id)).filter(Boolean);
      const aliveMembers = members.filter(m => m.alive);
      const totalTools = group.toolsKnown.size;
      const totalResources = group.sharedResources;

      if (aliveMembers.length >= SETTLEMENT_MIN_MEMBERS &&
          totalTools >= SETTLEMENT_MIN_TOOLS &&
          totalResources >= SETTLEMENT_MIN_RESOURCES) {
        const settlement = new Settlement(this.population.nextSettlementId++, gid, this.environment);
        settlement.location = { ...group.location };
        settlement.population = aliveMembers.length;
        settlement.storedFood = Math.floor(totalResources * 0.4);
        settlement.storedMaterials = Math.floor(totalResources * 0.4);
        settlement.storedEnergy = Math.floor(totalResources * 0.2);
        settlement.infrastructure = Math.min(5, totalTools);
        settlement.lifeSupport = Math.min(3, Math.floor(totalTools / 2));
        settlement.techLevel = group.techLevel;
        settlement.populationHistory.push({ t: this.environment.simTime, population: aliveMembers.length });

        this.population.settlements.set(settlement.id, settlement);

        this.recordEvent('settlement_founded', `Settlement #${settlement.id} founded by group #${gid}`, { settlementId: settlement.id, groupId: gid, population: aliveMembers.length });
        this.addNote(`Settlement #${settlement.id} founded (${aliveMembers.length} people)`);
      }
    }
  }

  // ---- Phase 7: Resource economy ----
  _updateResources(delta, intelligent) {
    // Groups gather resources based on members' toolUse + cooperation.
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;
      const members = [...group.memberIds].map(id => this._findOrg(id)).filter(m => m && m.alive);
      if (members.length === 0) continue;

      const gatherRate = members.reduce((s, m) => s + (m.genome.traits.toolUse * 0.1 + m.genome.traits.cooperation * 0.05), 0);
      const gathered = gatherRate * delta;
      group.sharedResources = Math.min(500, group.sharedResources + gathered);

      // Consumption: each member needs energy/food.
      const consumption = members.length * 0.5 * delta;
      group.sharedResources = Math.max(0, group.sharedResources - consumption);

      // Settlement systems are updated separately in _updateSettlements.
      // Settlement storage is independent of group pooled resources.
    }
  }

  // ---- Group stability ----
  _updateGroupStability(delta) {
    for (const [gid, group] of this.population.socialGroups) {
      if (group.isExtinct) continue;
      const members = [...group.memberIds].map(id => this._findOrg(id)).filter(m => m && m.alive);
      if (members.length === 0) {
        group.isExtinct = true;
        group.extinctionTime = this.environment.simTime;
        continue;
      }

      // Stability rises with cooperation, falls with conflict.
      const avgCoop = members.reduce((s, m) => s + m.genome.traits.cooperation, 0) / members.length;
      group.stability = clamp(group.stability + (avgCoop - 0.5) * 0.01 * delta);
      group.conflictLevel = clamp(group.conflictLevel - 0.01 * delta);

      // Tech level from known tools.
      group.techLevel = Math.min(5, group.toolsKnown.size * 0.5);

      // Group splitting: large groups with high conflict may split.
      if (members.length >= 8 && group.conflictLevel > 0.6 && this.rng.bool(0.005)) {
        this._splitGroup(group, members);
      }
    }
  }

  _splitGroup(group, members) {
    const half = Math.floor(members.length / 2);
    const stay = members.slice(0, half);
    const leave = members.slice(half);

    // Update existing group to stay members.
    group.memberIds = new Set(stay.map(m => m.id));
    for (const m of leave) {
      m.groupId = null;
    }

    // Create new group for leavers.
    const newGroup = new SocialGroup(this.population.nextGroupId++, leave[0].id, this.environment);
    newGroup.memberIds = new Set(leave.map(m => m.id));
    newGroup.leaderId = leave[0].id;
    newGroup.location = { ...group.location };
    newGroup.sharedResources = Math.floor(group.sharedResources * 0.4);
    group.sharedResources = Math.floor(group.sharedResources * 0.6);
    // Copy some techniques.
    for (const t of group.groupMemory) {
      if (this.rng.bool(0.5)) {
        newGroup.groupMemory.push(t);
        newGroup.toolsKnown.add(t);
      }
    }
    for (const m of leave) m.groupId = newGroup.id;

    this.population.socialGroups.set(newGroup.id, newGroup);
    this.recordEvent('group_split', `Group #${group.id} split; new group #${newGroup.id} formed`, { oldGroupId: group.id, newGroupId: newGroup.id });
    this.addNote(`Group #${group.id} split; group #${newGroup.id} formed`);
  }

  // ---- helpers ----
  _findOrg(id) {
    return this.population.organisms.find(o => o.id === id) || null;
  }

  _findSettlementByGroup(groupId) {
    for (const s of this.population.settlements.values()) {
      if (s.founderGroupId === groupId) return s;
    }
    return null;
  }

  _techniqueName() {
    const names = ['Өргөтгөл', 'Өнгөрсөн хэрэг', 'Үлдэгдэл', 'Холбоо', 'Төхөөрөмж', 'Үйлдвэрлэж'];
    return names[Math.floor(this.rng.next() * names.length)] + ' #' + Math.floor(this.rng.next() * 100);
  }

  // ---- inspect / state ----
  getState() {
    const pop = this.population;
    const groups = [...pop.socialGroups.values()].map(g => g.toJSON());
    const cultures = [...pop.cultures.values()].map(c => c.toJSON());
    const technologies = [...pop.technologies.values()].map(t => t.toJSON());
    const settlements = [...pop.settlements.values()].map(s => s.toJSON());

    // Serialize group relations (Map<groupId, Map<otherGroupId, relation>>).
    const groupRelations = {};
    for (const [gid, relMap] of this.groupRelations) {
      groupRelations[gid] = Object.fromEntries([...relMap.entries()]);
    }

    const intelligentCount = pop.organisms.filter(o => o.alive && cognitiveScore(o.genome) >= INTELLIGENCE_THRESHOLD).length;
    const groupedCount = pop.organisms.filter(o => o.alive && o.groupId !== null).length;
    const totalInnovations = pop.organisms.reduce((s, o) => s + o.innovationCount, 0);

    // Research summary by field.
    const fieldProgress = {};
    for (const [fid, finfo] of Object.entries(RESEARCH_FIELDS)) {
      const fieldTechs = [...pop.technologies.values()].filter(t => t.field === fid);
      const unlocked = fieldTechs.filter(t => t.unlocked).length;
      const total = fieldTechs.length;
      const avgProgress = total > 0 ? fieldTechs.reduce((s, t) => s + t.researchProgress, 0) / total : 0;
      fieldProgress[fid] = { label: finfo.label, unlocked, total, avgProgress: Math.round(avgProgress) };
    }

    return {
      running: this.running,
      speed: this.speed,
      sessionTime: this.sessionTime,
      hypothetical: CIV_HYPOTHETICAL,
      intelligenceThreshold: INTELLIGENCE_THRESHOLD,
      intelligentCount,
      groupedCount,
      groupCount: groups.filter(g => !g.isExtinct).length,
      extinctGroupCount: groups.filter(g => g.isExtinct).length,
      techniqueCount: cultures.reduce((s, c) => s + c.techniqueCount, 0),
      technologyCount: technologies.length,
      settlementCount: settlements.filter(s => !s.isAbandoned).length,
      abandonedSettlementCount: settlements.filter(s => s.isAbandoned).length,
      totalInnovations,
      groups,
      cultures,
      technologies,
      settlements,
      groupRelations,
      crisisActive: this.crisisActive,
      crisisHistory: this.crisisHistory.slice(-20),
      spaceMilestones: this.spaceMilestones.slice(-20),
      fieldProgress,
      events: this.civilizationEvents.slice(-50),
      notice: CIV_HYPOTHETICAL
    };
  }

  setState(state) {
    if (!state) return this.getState();
    this.running = Boolean(state.running);
    this.speed = clamp(Number(state.speed) || 1, 0, 10);
    this.sessionTime = Number(state.sessionTime) || 0;
    this.civilizationEvents = Array.isArray(state.events) ? state.events : [];
    this.population.nextGroupId = state.nextGroupId || this.population.nextGroupId;
    this.population.nextTechId = state.nextTechId || this.population.nextTechId;
    this.population.nextSettlementId = state.nextSettlementId || this.population.nextSettlementId;
    // Restore social groups, cultures, technologies, settlements from JSON.
    const pop = this.population;
    pop.socialGroups = new Map((state.groups || []).map(g => [g.id, SocialGroup.fromJSON(g)]));
    pop.cultures = new Map((state.cultures || []).map(c => [c.id, Culture.fromJSON(c)]));
    pop.technologies = new Map((state.technologies || []).map(t => [t.id, Technology.fromJSON(t)]));
    pop.settlements = new Map((state.settlements || []).map(s => [s.id, Settlement.fromJSON(s)]));
    // Restore group relations.
    this.groupRelations = new Map();
    if (state.groupRelations && typeof state.groupRelations === 'object') {
      for (const [gid, relMap] of Object.entries(state.groupRelations)) {
        this.groupRelations.set(Number(gid), new Map(Object.entries(relMap || {})));
      }
    }
    // Restore crisis state.
    this.crisisActive = state.crisisActive || null;
    this.crisisHistory = Array.isArray(state.crisisHistory) ? state.crisisHistory : [];
    this.lastCrisisCheck = Number(state.lastCrisisCheck) || 0;
    // Restore space milestones.
    this.spaceMilestones = Array.isArray(state.spaceMilestones) ? state.spaceMilestones : [];
    // Re-link organism groupIds.
    for (const o of pop.organisms) {
      const group = [...pop.socialGroups.values()].find(g => g.memberIds.has(o.id));
      o.groupId = group ? group.id : null;
    }
    return this.getState();
  }
}

export {
  CivilizationEngine,
  SocialGroup,
  Culture,
  Technology,
  Settlement,
  cognitiveScore,
  INTELLIGENCE_THRESHOLD,
  CIV_HYPOTHETICAL
};
