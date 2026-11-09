// SCIENCE UNIVERSE — FRONTIER
// Life Engine Core — independent life creation & evolution simulation
//
// IMPORTANT: Origin-of-life mechanisms (abiogenesis) and speculative evolutionary
// branches are NOT fully understood. Every hypothetical mechanism in this module
// is explicitly labeled as a model / hypothesis, not established fact.
// Real science: genetics, mutation, natural selection, energy flow, ecosystems.
// Hypothetical: spontaneous protocell self-assembly, directed panspermia, guaranteed
// progression toward intelligence or civilization.

const HYPOTHETICAL_SHORT = 'ЗААНУУД ШАТ';

// Minimal seeded PRNG (LCG) so simulations are deterministic & reproducible.
function createRng(seed = 1) {
  let state = (seed >>> 0) || 1;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    },
    range(min, max) {
      return min + this.next() * (max - min);
    },
    bool(p) {
      return this.next() < p;
    },
    pick(list) {
      return list[Math.floor(this.next() * list.length)];
    },
    reset(s) {
      state = (s >>> 0) || 1;
    }
  };
}

// ---------------------------------------------------------------------------
// Traits encoded in an organism's genome. All values are 0..1 unless noted.
// These are heritable and mutate during reproduction.
// ---------------------------------------------------------------------------
const DEFAULT_TRAITS = {
  metabolism: 0.4,        // energy consumed per unit time (0..1)
  size: 0.4,              // cell size (affects uptake & division cost)
  membrane: 0.5,          // membrane integrity / protection (0..1)
  efficiency: 0.4,        // nutrient -> energy conversion efficiency
  tempTolerance: 0.5,     // tolerance to temperature extremes
  radiationTolerance: 0.3,// tolerance to radiation
  reproductionCost: 0.6,  // energy required to divide
  growthRate: 0.4,        // biomass accumulation speed
  motility: 0.2,          // movement / resource seeking ability
  cooperation: 0.1,       // tendency to share resources / aggregate
  adhesion: 0.1,          // tendency to stick to other cells (enables multicellularity)
  chemicalSense: 0.1,     // ability to detect chemical/resource gradients (0..1)
  lightSense: 0.1,        // ability to detect light/energy sources (0..1)
  tempSense: 0.1,         // ability to detect temperature gradients (0..1)
  threatSense: 0.1,       // ability to detect harmful conditions/threats (0..1)
  // Step 11: Nervous system traits — heritable, optional evolutionary outcome.
  neuralProcessing: 0.1,     // sensory processing / integration ability
  reactionSpeed: 0.1,        // how quickly organism responds to stimuli
  neuralCoordination: 0.1,   // movement/behavior coordination
  environmentalAwareness: 0.1, // awareness of surroundings beyond immediate senses
  movementControl: 0.1,      // fine motor control / path planning
  neuralEnergyCost: 0.05     // base energy cost of neural activity per second (0..1)
};

// Civilization-relevant cognitive traits (Phase 12 — Intelligent Life & Civilization).
// Optional, heritable, energetically costly, NOT guaranteed to evolve.
Object.assign(DEFAULT_TRAITS, {
  toolUse: 0.05,          // ability to manipulate objects / make simple tools
  socialLearning: 0.05,   // ability to learn behaviors from other organisms
  symbolicComm: 0.05,     // complex symbolic communication (language-like)
  abstractReasoning: 0.05 // problem solving / environmental reasoning
});

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function mutateTrait(value, rate, rng) {
  if (!rng.bool(rate)) return value;
  const delta = rng.range(-0.15, 0.15);
  return clamp(value + delta);
}

class Genome {
  constructor(traits = {}, mutationRate = 0.03) {
    this.traits = { ...DEFAULT_TRAITS, ...traits };
    this.mutationRate = clamp(mutationRate, 0, 0.5);
    this.generation = 0;
  }

  static random(rng) {
    const traits = {};
    for (const key of Object.keys(DEFAULT_TRAITS)) {
      traits[key] = clamp(rng.range(0.2, 0.8));
    }
    return new Genome(traits, rng.range(0.01, 0.08));
  }

  mutate(rng, mutationRateOverride) {
    const rate = mutationRateOverride !== undefined ? mutationRateOverride : this.mutationRate;
    const next = {};
    for (const key of Object.keys(DEFAULT_TRAITS)) {
      next[key] = mutateTrait(this.traits[key], rate, rng);
    }
    const child = new Genome(next, this.mutationRate);
    child.generation = this.generation + 1;
    // Mutation rate itself can drift slightly (evolution of evolvability).
    child.mutationRate = clamp(this.mutationRate + rng.range(-0.01, 0.01), 0, 0.2);
    return child;
  }

  clone() {
    const copy = new Genome({ ...this.traits }, this.mutationRate);
    copy.generation = this.generation;
    return copy;
  }

  toJSON() {
    return { traits: this.traits, mutationRate: this.mutationRate, generation: this.generation };
  }

  static fromJSON(json) {
    const g = new Genome(json.traits || DEFAULT_TRAITS, json.mutationRate || 0.03);
    g.generation = json.generation || 0;
    return g;
  }
}

// ---------------------------------------------------------------------------
// Organism — a single simulated cell-like entity.
// ---------------------------------------------------------------------------
class Organism {
  constructor(id, genome, position, environment) {
    this.id = id;
    this.genome = genome;
    this.position = { x: position.x, y: position.y, z: position.z };
    this.environment = environment;
    this.age = 0;
    this.lifetime = 0;
    this.energy = 50;
    this.maxEnergy = 100;
    this.nutrients = 20;
    this.biomass = 1;
    this.membraneIntegrity = genome.traits.membrane;
    this.alive = true;
    this.birthCause = 'spawn';
    this.parentId = null;
    this.parent2Id = null;
    this.children = 0;
    this.reproductionCooldown = 0;
    this.mutationsSinceBirth = 0;
    this.lastEnergyDelta = 0;
    this.type = 'prokaryote'; // prokaryote | eukaryote | multicellular (set by engine)
    this.multicellularId = null; // null if unicellular; set if part of a multicellular organism
    this.cellRole = null; // role within multicellular organism: producer | consumer | structural | reproductive
    this.adhesion = 0; // tendency to stick to other cells (0..1)
    // Movement & behavior state (Step 9).
    this.velocity = { x: 0, z: 0 };
    this.behavior = 'idle'; // idle | foraging | avoiding | resting | cooperating
    this.moveEnergyCost = 0; // energy spent on movement this step
    this.sensoryRange = 0; // computed from sensory traits
    this.lastMoveTime = 0; // last time the organism moved
    this.pathHistory = []; // recent positions for visualization (capped)
    this.behaviorHistory = []; // recent behavior states
    // Step 10: Species & ecological role.
    this.speciesId = null; // assigned by Population on step
    this.ecologicalRole = null; // producer | herbivore | carnivore | omnivore | decomposer
    // Step 11: Nervous system, memory & learning.
    this.neuralActivityCost = 0; // energy spent on neural processing this step
    this.memory = {              // short-term memory (lifetime, not inherited)
      resourceLocations: [],     // {x, z, quality, t} remembered good spots
      threatLocations: [],       // {x, z, severity, t} remembered dangerous spots
      recentEvents: [],          // {type, x, z, t} recent experiences
      learningEfficiency: 0,     // current learning rate (derived from genome + experience)
    };
    this.experience = {          // lifetime experience (not inherited)
      totalEncounters: 0,        // total resource/threat encounters
      successfulForages: 0,      // successful resource finds
      avoidedThreats: 0,         // threats successfully avoided
      socialInteractions: 0,     // communication events participated in
    };
    // Phase 12: Civilization state (per-organism, not inherited via DNA).
    this.groupId = null;           // social group membership (null = solitary)
    this.toolSkill = 0;            // personal tool-use proficiency (0..1, learned)
    this.culturalKnowledge = [];   // list of learned technique ids (cultural, not genetic)
    this.innovationCount = 0;      // times this organism discovered a new technique
  }

  trait(key) {
    return this.genome.traits[key] ?? 0;
  }

  // Energy & maintenance costs per second.
  maintenanceCost() {
    const g = this.genome.traits;
    // Bigger / faster / better-protected cells cost more to maintain.
    let cost = (
      0.05 +
      g.metabolism * 0.12 +
      g.size * 0.06 +
      g.membrane * 0.04 +
      g.motility * 0.05
    );
    // Step 11: Neural activity cost — advanced cognition is energetically expensive.
    // Organisms without neural investment pay nothing extra.
    cost += (g.neuralProcessing + g.reactionSpeed + g.neuralCoordination + g.environmentalAwareness + g.movementControl) * g.neuralEnergyCost * 0.5;
    return cost;
  }

  // Environmental stress reduces energy / integrity.
  stressFactor() {
    const e = this.environment;
    const g = this.genome.traits;
    let stress = 0;
    // Temperature deviation from comfortable band (20-35 C).
    const temp = typeof e.temperature === 'number' ? e.temperature : 20;
    const tempOpt = 27.5;
    stress += Math.abs(temp - tempOpt) / 40 * (1 - g.tempTolerance);
    // Radiation stress.
    const radiation = typeof e.radiation === 'number' ? e.radiation : 0;
    stress += radiation / 10 * (1 - g.radiationTolerance);
    // Low water / energy availability increases maintenance cost.
    const water = typeof e.water === 'number' ? e.water : 50;
    stress += (1 - water / 100) * 0.2;
    return clamp(stress, 0, 2);
  }

  // Attempt to divide. Returns a child Organism or null.
  canDivide() {
    const g = this.genome.traits;
    return (
      this.alive &&
      this.energy >= g.reproductionCost * 60 &&
      this.biomass >= 1.5 &&
      this.membraneIntegrity >= 0.25 &&
      this.reproductionCooldown <= 0 &&
      this.age > 5
    );
  }

  divide(rng, idCounter, mutationRateOverride) {
    if (!this.canDivide()) return null;
    const cost = this.genome.traits.reproductionCost * 60;
    this.energy = Math.max(0, this.energy - cost);
    this.biomass *= 0.6;
    this.membraneIntegrity *= 0.9;
    this.reproductionCooldown = 15 + this.genome.traits.size * 20;
    this.children += 1;
    const childGenome = this.genome.mutate(rng, mutationRateOverride);
    const offset = rng.range(-1.5, 1.5);
    const child = new Organism(
      idCounter.next(),
      childGenome,
      { x: this.position.x + offset, y: this.position.y, z: this.position.z + offset },
      this.environment
    );
    child.parentId = this.id;
    child.birthCause = 'division';
    child.mutationsSinceBirth = this.mutationsSinceBirth + (childGenome.generation - this.genome.generation);
    return child;
  }

  // ---- Movement & Behavior (Step 9) ----

  // Sensory range derived from sensory traits (max ~10 units).
  computeSensoryRange() {
    const g = this.genome.traits;
    return (g.chemicalSense + g.lightSense + g.tempSense + g.threatSense) * 2.5;
  }

  // Sense the environment at a given position. Returns a suitability score (-1..1).
  // Positive = favorable, negative = harmful. Uses sensory traits to weight detection.
  senseEnvironment(x, z, environment) {
    const g = this.genome.traits;
    const e = environment;
    let score = 0;
    let weight = 0;

    // Resource availability (chemical sensing).
    const resources = typeof e.available === 'number' ? e.available : 50;
    score += g.chemicalSense * (resources / 100 - 0.5) * 2;
    weight += g.chemicalSense;

    // Temperature suitability (temperature sensing).
    const temp = typeof e.temperature === 'number' ? e.temperature : 20;
    const tempOpt = 27.5;
    const tempSuit = 1 - Math.abs(temp - tempOpt) / 40;
    score += g.tempSense * (tempSuit - 0.5) * 2;
    weight += g.tempSense;

    // Light / energy availability (light sensing).
    const energy = typeof e.energy === 'number' ? e.energy : 50;
    score += g.lightSense * (energy / 100 - 0.5) * 2;
    weight += g.lightSense;

    // Threat detection (radiation, toxins).
    const radiation = typeof e.radiation === 'number' ? e.radiation : 0;
    const toxins = typeof e.toxins === 'number' ? e.toxins : 0;
    const threat = (radiation + toxins) / 200;
    score -= g.threatSense * threat * 2;
    weight += g.threatSense;

    return weight > 0 ? clamp(score / weight, -1, 1) : 0;
  }

  // Determine behavior based on energy, environment, and traits.
  determineBehavior(environment, nearbyOrgs) {
    const g = this.genome.traits;
    const ePct = this.energy / this.maxEnergy;
    const stress = this.stressFactor();

    // Low energy -> forage or rest.
    if (ePct < 0.3) {
      if (g.motility > 0.3 && g.chemicalSense > 0.2) return 'foraging';
      return 'resting';
    }
    // High stress -> avoid.
    if (stress > 0.6) {
      if (g.motility > 0.3 && g.threatSense > 0.2) return 'avoiding';
      return 'resting';
    }
    // High cooperation + nearby organisms -> cooperate.
    if (g.cooperation > 0.5 && nearbyOrgs.length > 0 && ePct > 0.5) return 'cooperating';
    // Default: idle or slow forage.
    if (g.motility > 0.4) return 'foraging';
    return 'idle';
  }

  // Move the organism based on behavior and sensory input.
  // Returns movement delta {dx, dz} and energy cost.
  move(behavior, environment, nearbyOrgs, rng, delta) {
    const g = this.genome.traits;
    const moveSpeed = g.motility * 3; // max units per second
    const energyCostPerUnit = 0.15 * (1 + g.motility); // more motility = more cost per unit

    if (moveSpeed <= 0.05 || delta <= 0) {
      this.velocity = { x: 0, z: 0 };
      this.moveEnergyCost = 0;
      return { dx: 0, dz: 0, cost: 0 };
    }

    let dx = 0;
    let dz = 0;

    if (behavior === 'foraging' || behavior === 'avoiding') {
      // Sense current position and a few candidate directions.
      const curSuit = this.senseEnvironment(this.position.x, this.position.z, environment);
      const dirs = [
        { x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 },
        { x: 0.7, z: 0.7 }, { x: -0.7, z: 0.7 }, { x: 0.7, z: -0.7 }, { x: -0.7, z: -0.7 }
      ];
      let bestDir = { x: 0, z: 0 };
      let bestSuit = curSuit;

      for (const d of dirs) {
        const sx = this.position.x + d.x * 2;
        const sz = this.position.z + d.z * 2;
        const suit = this.senseEnvironment(sx, sz, environment);
        // Foraging: move toward higher suitability. Avoiding: move away from low suitability.
        const weighted = behavior === 'avoiding' ? -suit : suit;
        if (weighted > bestSuit) {
          bestSuit = weighted;
          bestDir = d;
        }
      }

      // Add slight randomness so movement isn't perfectly deterministic.
      bestDir.x += rng.range(-0.2, 0.2);
      bestDir.z += rng.range(-0.2, 0.2);
      const len = Math.hypot(bestDir.x, bestDir.z) || 1;
      dx = (bestDir.x / len) * moveSpeed * delta;
      dz = (bestDir.z / len) * moveSpeed * delta;
    } else if (behavior === 'cooperating' && nearbyOrgs.length > 0) {
      // Move toward nearest cooperative neighbor.
      const nearest = nearbyOrgs[0];
      const dirX = nearest.position.x - this.position.x;
      const dirZ = nearest.position.z - this.position.z;
      const len = Math.hypot(dirX, dirZ) || 1;
      dx = (dirX / len) * moveSpeed * 0.5 * delta;
      dz = (dirZ / len) * moveSpeed * 0.5 * delta;
    } else {
      // Idle or resting: minimal random drift.
      dx = rng.range(-0.3, 0.3) * moveSpeed * 0.3 * delta;
      dz = rng.range(-0.3, 0.3) * moveSpeed * 0.3 * delta;
    }

    // Apply movement.
    this.position.x += dx;
    this.position.z += dz;
    this.velocity = { x: dx / delta, z: dz / delta };

    // Energy cost proportional to distance moved and motility.
    const dist = Math.hypot(dx, dz);
    this.moveEnergyCost = dist * energyCostPerUnit;
    this.energy = Math.max(0, this.energy - this.moveEnergyCost);

    // Record path history (cap at 20 entries for memory).
    this.pathHistory.push({ x: this.position.x, z: this.position.z, t: this.age });
    if (this.pathHistory.length > 20) this.pathHistory.shift();

    // Record behavior history.
    this.behaviorHistory.push({ behavior, t: this.age });
    if (this.behaviorHistory.length > 10) this.behaviorHistory.shift();

    this.lastMoveTime = this.age;
    return { dx, dz, cost: this.moveEnergyCost };
  }

  // ---- Step 11: Memory & Learning ----

  // Record an experience in short-term memory. Called during update() when
  // the organism encounters resources or threats.
  recordExperience(type, x, z, quality) {
    const now = this.age;
    const entry = { type, x, z, quality, t: now };
    this.memory.recentEvents.push(entry);
    if (this.memory.recentEvents.length > 20) this.memory.recentEvents.shift();

    if (type === 'resource') {
      this.memory.resourceLocations.push({ x, z, quality, t: now });
      if (this.memory.resourceLocations.length > 10) this.memory.resourceLocations.shift();
      this.experience.totalEncounters += 1;
      if (quality > 0.5) this.experience.successfulForages += 1;
    } else if (type === 'threat') {
      this.memory.threatLocations.push({ x, z, severity: quality, t: now });
      if (this.memory.threatLocations.length > 10) this.memory.threatLocations.shift();
      this.experience.totalEncounters += 1;
    }
  }

  // Decay old memories over time. Learning fades without reinforcement.
  decayMemory(delta) {
    const decayRate = 0.1 * delta;
    // Remove old recent events.
    const now = this.age;
    this.memory.recentEvents = this.memory.recentEvents.filter(
      e => now - e.t < 60 // keep last 60 seconds of sim time
    );
    this.memory.resourceLocations = this.memory.resourceLocations.filter(
      e => now - e.t < 120 // keep resource memory for 2 minutes
    );
    this.memory.threatLocations = this.memory.threatLocations.filter(
      e => now - e.t < 180 // keep threat memory longer (3 minutes)
    );
    // Learning efficiency drifts toward genome-based baseline.
    const g = this.genome.traits;
    const baseline = g.neuralProcessing * 0.5 + g.reactionSpeed * 0.3;
    if (this.memory.learningEfficiency > baseline) {
      this.memory.learningEfficiency = Math.max(baseline, this.memory.learningEfficiency - decayRate * 0.1);
    } else {
      this.memory.learningEfficiency = Math.min(baseline, this.memory.learningEfficiency + decayRate * 0.1);
    }
    this.memory.learningEfficiency = clamp(this.memory.learningEfficiency, 0, 1);
  }

  // Recall the best remembered resource location within range. Returns null if none.
  recallBestResource(maxRange) {
    let best = null;
    let bestScore = -Infinity;
    const now = this.age;
    for (const mem of this.memory.resourceLocations) {
      const age = now - mem.t;
      if (age > 120) continue; // memory too old
      const d = Math.hypot(mem.x - this.position.x, mem.z - this.position.z);
      if (d > maxRange) continue;
      // Score = quality - distance penalty - age penalty
      const score = mem.quality - d * 0.1 - age * 0.005;
      if (score > bestScore) {
        bestScore = score;
        best = mem;
      }
    }
    return best;
  }

  // Recall the nearest remembered threat within range. Returns null if none.
  recallNearestThreat(maxRange) {
    let nearest = null;
    let nearestDist = Infinity;
    const now = this.age;
    for (const mem of this.memory.threatLocations) {
      const age = now - mem.t;
      if (age > 180) continue;
      const d = Math.hypot(mem.x - this.position.x, mem.z - this.position.z);
      if (d > maxRange) continue;
      if (d < nearestDist) {
        nearestDist = d;
        nearest = mem;
      }
    }
    return nearest;
  }

  // Communicate a signal to nearby organisms. Returns list of recipients.
  // Signal types: 'warning' (threat), 'resource' (food), 'coordinate' (grouping)
  communicate(signalType, nearbyOrgs) {
    const g = this.genome.traits;
    const range = 4 * (g.neuralProcessing + g.environmentalAwareness) * 2; // max ~16 units
    const recipients = [];

    for (const other of nearbyOrgs) {
      if (!other.alive || other === this) continue;
      const d = Math.hypot(other.position.x - this.position.x, other.position.z - this.position.z);
      if (d > range) continue;

      // Reception probability depends on receiver's neural processing.
      const receiveChance = g.neuralProcessing * 0.5 + other.genome.traits.neuralProcessing * 0.5;
      if (!this._commRng || (this._commRng = createRng(this.id + this.age))) {}
      if (Math.random() < receiveChance) {
        other.receiveSignal(signalType, this.position.x, this.position.z, this);
        recipients.push(other.id);
        this.experience.socialInteractions += 1;
        other.experience.socialInteractions += 1;
      }
    }
    return recipients;
  }

  // Receive a signal from another organism and update memory/behavior.
  receiveSignal(signalType, srcX, srcZ, sender) {
    if (signalType === 'warning') {
      this.recordExperience('threat', srcX, srcZ, 0.8);
      if (this.behavior !== 'avoiding') this.behavior = 'avoiding';
    } else if (signalType === 'resource') {
      this.recordExperience('resource', srcX, srcZ, 0.6);
      if (this.energy / this.maxEnergy < 0.5 && this.behavior !== 'foraging') {
        this.behavior = 'foraging';
      }
    } else if (signalType === 'coordinate') {
      this.experience.socialInteractions += 1;
      if (this.genome.traits.cooperation > 0.4 && this.behavior === 'idle') {
        this.behavior = 'cooperating';
      }
    }
  }

  update(delta, resources, nearbyOrgs = [], environmentOverride = null) {
    if (!this.alive) return { died: false, consumed: 0 };
    const g = this.genome.traits;
    const env = environmentOverride || this.environment;
    const stress = this.stressFactor();

    // Step 11: Memory decay — learning fades without reinforcement.
    this.decayMemory(delta);

    // Movement & behavior (Step 9).
    this.sensoryRange = this.computeSensoryRange();
    this.behavior = this.determineBehavior(env, nearbyOrgs);
    const moveResult = this.move(this.behavior, env, nearbyOrgs, this._moveRng || (this._moveRng = createRng(this.id * 1000 + this.age)), delta);

    // Resource uptake depends on membrane integrity, size, motility, environment availability.
    const uptake =
      resources.available * 0.4 * g.membrane * (0.5 + g.size * 0.5) * (0.6 + g.motility * 0.4);
    const gained = uptake * delta * g.efficiency;
    const consumed = uptake * delta;

    this.nutrients = Math.min(100, this.nutrients + gained);
    this.energy = Math.min(this.maxEnergy, this.energy + gained * 0.6);

    // Maintenance + stress drain + movement cost.
    // Neural energy cost is included in maintenanceCost() via neural traits.
    // Track neural cost portion separately for UI display (not added again to drain).
    const g2 = this.genome.traits;
    const neuralCostPortion = (g2.neuralProcessing + g2.reactionSpeed + g2.neuralCoordination + g2.environmentalAwareness + g2.movementControl) * g2.neuralEnergyCost * 0.5;
    this.neuralActivityCost = neuralCostPortion * delta;
    const drain = (this.maintenanceCost() + stress * 0.15) * delta + moveResult.cost;
    this.energy = Math.max(0, this.energy - drain);
    this.lastEnergyDelta = gained - drain - moveResult.cost;

    // Step 11: Memory & learning — record encounters.
    if (gained > 0.1) {
      this.recordExperience('resource', this.position.x, this.position.z, Math.min(1, gained));
    }
    if (stress > 0.6 && g.threatSense > 0.2) {
      this.recordExperience('threat', this.position.x, this.position.z, stress);
    }

    // Step 11: Communication — send signals based on experience.
    if (nearbyOrgs.length > 0 && g.neuralProcessing > 0.2) {
      // Warning signal when stressed.
      if (stress > 0.7) {
        this.communicate('warning', nearbyOrgs);
      }
      // Resource signal when energy is high and resources found.
      if (gained > 0.5 && this.energy > 60) {
        this.communicate('resource', nearbyOrgs);
      }
    }

    // Membrane wear from stress; repair costs energy.
    const membraneDamage = stress * 0.08 * delta;
    this.membraneIntegrity = Math.max(0, this.membraneIntegrity - membraneDamage);
    if (this.energy > 30 && this.membraneIntegrity < g.membrane) {
      const repair = Math.min(0.05 * delta, g.membrane - this.membraneIntegrity);
      this.membraneIntegrity = Math.min(g.membrane, this.membraneIntegrity + repair);
      this.energy = Math.max(0, this.energy - repair * 10);
    }

    this.age += delta;
    this.lifetime += delta;
    this.biomass = Math.min(10, this.biomass + g.growthRate * 0.02 * delta);
    this.reproductionCooldown = Math.max(0, this.reproductionCooldown - delta);

    // Death conditions.
    if (this.energy <= 0) {
      this.alive = false;
      this.birthCause = 'starvation';
      return { died: true, reason: 'starvation', consumed };
    }
    if (this.membraneIntegrity <= 0.1) {
      this.alive = false;
      this.birthCause = 'rupture';
      return { died: true, reason: 'membrane-rupture', consumed };
    }
    if (this.age > 120 + g.metabolism * 80) {
      this.alive = false;
      this.birthCause = 'old-age';
      return { died: true, reason: 'old-age', consumed };
    }
    return { died: false, consumed };
  }

  toJSON() {
    return {
      id: this.id,
      genome: this.genome.toJSON(),
      position: this.position,
      age: this.age,
      lifetime: this.lifetime,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      nutrients: this.nutrients,
      biomass: this.biomass,
      membraneIntegrity: this.membraneIntegrity,
      alive: this.alive,
      birthCause: this.birthCause,
      parentId: this.parentId,
      parent2Id: this.parent2Id,
      children: this.children,
      reproductionCooldown: this.reproductionCooldown,
      mutationsSinceBirth: this.mutationsSinceBirth,
      type: this.type,
      multicellularId: this.multicellularId,
      cellRole: this.cellRole,
      adhesion: this.adhesion,
      velocity: this.velocity,
      behavior: this.behavior,
      sensoryRange: this.sensoryRange,
      pathHistory: this.pathHistory,
      behaviorHistory: this.behaviorHistory,
      lastMoveTime: this.lastMoveTime,
      speciesId: this.speciesId,
      ecologicalRole: this.ecologicalRole,
      // Step 11: Nervous system & memory state.
      neuralActivityCost: this.neuralActivityCost,
      memory: {
        resourceLocations: [...this.memory.resourceLocations],
        threatLocations: [...this.memory.threatLocations],
        recentEvents: [...this.memory.recentEvents],
        learningEfficiency: this.memory.learningEfficiency
      },
      experience: { ...this.experience },
      // Phase 12: Civilization state (per-organism, not inherited via DNA).
      groupId: this.groupId,
      toolSkill: this.toolSkill,
      culturalKnowledge: [...this.culturalKnowledge],
      innovationCount: this.innovationCount
    };
  }

  static fromJSON(json, environment) {
    const o = new Organism(
      json.id,
      Genome.fromJSON(json.genome),
      json.position || { x: 0, y: 0, z: 0 },
      environment
    );
    o.age = json.age || 0;
    o.lifetime = json.lifetime || 0;
    o.energy = json.energy ?? 50;
    o.maxEnergy = json.maxEnergy ?? 100;
    o.nutrients = json.nutrients ?? 20;
    o.biomass = json.biomass ?? 1;
    o.membraneIntegrity = json.membraneIntegrity ?? 0.5;
    o.alive = json.alive !== false;
    o.birthCause = json.birthCause || 'spawn';
    o.parentId = json.parentId || null;
    o.parent2Id = json.parent2Id || null;
    o.children = json.children || 0;
    o.reproductionCooldown = json.reproductionCooldown || 0;
    o.mutationsSinceBirth = json.mutationsSinceBirth || 0;
    o.type = json.type || 'prokaryote';
    o.multicellularId = json.multicellularId || null;
    o.cellRole = json.cellRole || null;
    o.adhesion = json.adhesion ?? 0;
    o.velocity = json.velocity || { x: 0, z: 0 };
    o.behavior = json.behavior || 'idle';
    o.sensoryRange = json.sensoryRange ?? 0;
    o.pathHistory = json.pathHistory || [];
    o.behaviorHistory = json.behaviorHistory || [];
    o.lastMoveTime = json.lastMoveTime ?? 0;
    o.speciesId = json.speciesId || null;
    o.ecologicalRole = json.ecologicalRole || null;
    // Step 11: Restore nervous system & memory state.
    o.neuralActivityCost = json.neuralActivityCost ?? 0;
    o.memory = {
      resourceLocations: json.memory?.resourceLocations || [],
      threatLocations: json.memory?.threatLocations || [],
      recentEvents: json.memory?.recentEvents || [],
      learningEfficiency: json.memory?.learningEfficiency ?? 0
    };
    o.experience = {
      totalEncounters: json.experience?.totalEncounters ?? 0,
      successfulForages: json.experience?.successfulForages ?? 0,
      avoidedThreats: json.experience?.avoidedThreats ?? 0,
      socialInteractions: json.experience?.socialInteractions ?? 0
    };
    // Phase 12: Restore civilization state.
    o.groupId = json.groupId ?? null;
    o.toolSkill = json.toolSkill ?? 0;
    o.culturalKnowledge = Array.isArray(json.culturalKnowledge) ? json.culturalKnowledge : [];
    o.innovationCount = json.innovationCount ?? 0;
    return o;
  }
}

// ---------------------------------------------------------------------------
// CellRole — functional role of a cell within a multicellular organism.
// ---------------------------------------------------------------------------
const CellRole = {
  PRODUCER: 'producer',     // photosynthesizes, creates energy/organic
  CONSUMER: 'consumer',     // eats other cells/organisms for energy
  STRUCTURAL: 'structural', // provides adhesion, protection, shape
  REPRODUCTIVE: 'reproductive' // specialized for division/budding
};

// ---------------------------------------------------------------------------
// MulticellularOrganism — a group of cooperating cells functioning as one unit.
// Emerges when cooperation trait is high and environmental conditions allow.
// ---------------------------------------------------------------------------
class MulticellularOrganism {
  constructor(id, cells, environment, genome) {
    this.id = id;
    this.cells = cells; // array of Organism cells
    this.environment = environment;
    this.genome = genome; // inherited from founder cell
    this.age = 0;
    this.lifetime = 0;
    this.energy = 50; // shared pool
    this.maxEnergy = 100;
    this.alive = true;
    this.birthCause = 'spawn';
    this.parentId = null;
    this.parent2Id = null;
    this.children = 0;
    this.reproductionCooldown = 0;
    this.mutationsSinceBirth = 0;
    this.type = 'multicellular';
    this.size = cells.length; // number of cells
    this.adhesion = genome.traits.cooperation; // how well cells stick together
    this.lastEnergyDelta = 0;
  }

  // Total energy across all cells.
  totalEnergy() {
    return this.cells.reduce((s, c) => s + c.energy, 0);
  }

  // Alive cell count.
  aliveCellCount() {
    return this.cells.filter(c => c.alive).length;
  }

  // Fraction of cells alive.
  aliveFraction() {
    return this.cells.length === 0 ? 0 : this.aliveCellCount() / this.cells.length;
  }

  // Can the multicellular organism reproduce? Needs enough cells and energy.
  canDivide() {
    const g = this.genome.traits;
    return (
      this.alive &&
      this.aliveCellCount() >= 3 &&
      this.energy >= g.reproductionCost * 80 &&
      this.aliveFraction() > 0.5 &&
      this.reproductionCooldown <= 0 &&
      this.age > 10
    );
  }

  // Divide by fragmentation: split cells into two groups.
  divide(rng, idCounter) {
    if (!this.canDivide()) return null;
    const cost = this.genome.traits.reproductionCost * 80;
    this.energy = Math.max(0, this.energy - cost);
    this.reproductionCooldown = 20 + this.genome.traits.size * 30;
    this.children += 1;

    // Split cells into two groups.
    const alive = this.cells.filter(c => c.alive);
    if (alive.length < 4) return null;

    const half = Math.floor(alive.length / 2);
    const parentCells = alive.slice(0, half);
    const childCells = alive.slice(half);

    // Keep parent cells with parent organism.
    this.cells = parentCells;
    this.size = this.cells.length;
    this.energy = this.totalEnergy() * 0.6;
    this.mutationsSinceBirth += 1;

    // Create child organism with remaining cells.
    const childGenome = this.genome.mutate(rng);
    const child = new MulticellularOrganism(
      idCounter.next(),
      childCells,
      this.environment,
      childGenome
    );
    child.parentId = this.id;
    child.birthCause = 'fragmentation';
    child.energy = childCells.reduce((s, c) => s + c.energy, 0) * 0.6;
    child.mutationsSinceBirth = this.mutationsSinceBirth + (childGenome.generation - this.genome.generation);
    child.size = childCells.length;

    // Update cell references.
    for (const c of parentCells) c.multicellularId = this.id;
    for (const c of childCells) c.multicellularId = child.id;

    return child;
  }

  // Update all cells and manage energy sharing within the organism.
  update(delta, resources) {
    if (!this.alive) return { died: false, consumed: 0 };

    const g = this.genome.traits;
    const aliveCells = this.cells.filter(c => c.alive);
    if (aliveCells.length === 0) {
      this.alive = false;
      this.birthCause = 'cellular-collapse';
      return { died: true, reason: 'cellular-collapse', consumed: 0 };
    }

    // Each cell updates individually.
    let totalConsumed = 0;
    let totalEnergyGain = 0;
    let cellDeaths = 0;

    for (const cell of aliveCells) {
      const result = cell.update(delta, resources);
      totalConsumed += result.consumed || 0;
      if (!cell.alive) {
        cellDeaths += 1;
      } else {
        totalEnergyGain += cell.lastEnergyDelta || 0;
      }
    }

    // Energy sharing: surplus energy from productive cells flows to needy cells.
    const totalEnergy = this.totalEnergy();
    const avgEnergy = totalEnergy / aliveCells.length;
    for (const cell of aliveCells) {
      if (cell.energy < avgEnergy * 0.5 && totalEnergy > 0) {
        const transfer = Math.min(avgEnergy * 0.3, totalEnergy * 0.1, cell.maxEnergy - cell.energy);
        cell.energy += transfer;
        this.energy -= transfer;
      }
    }

    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + totalEnergyGain * 0.3));
    this.lastEnergyDelta = totalEnergyGain - totalConsumed;

    this.age += delta;
    this.lifetime += delta;
    this.size = aliveCells.length;
    this.reproductionCooldown = Math.max(0, this.reproductionCooldown - delta);

    // Group survival: organism dies if too many cells die or energy is depleted.
    if (this.energy <= 0) {
      this.alive = false;
      this.birthCause = 'starvation';
      return { died: true, reason: 'starvation', consumed: totalConsumed };
    }
    if (this.aliveFraction() < 0.3) {
      this.alive = false;
      this.birthCause = 'cellular-collapse';
      return { died: true, reason: 'cellular-collapse', consumed: totalConsumed };
    }

    return { died: false, consumed: totalConsumed };
  }

  toJSON() {
    return {
      id: this.id,
      cells: this.cells.map(c => c.toJSON()),
      genome: this.genome.toJSON(),
      age: this.age,
      lifetime: this.lifetime,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      alive: this.alive,
      birthCause: this.birthCause,
      parentId: this.parentId,
      parent2Id: this.parent2Id,
      children: this.children,
      reproductionCooldown: this.reproductionCooldown,
      mutationsSinceBirth: this.mutationsSinceBirth,
      type: this.type,
      size: this.size,
      adhesion: this.adhesion
    };
  }

  static fromJSON(json, environment) {
    const cells = (json.cells || []).map(c => Organism.fromJSON(c, environment));
    const genome = Genome.fromJSON(json.genome);
    const m = new MulticellularOrganism(json.id, cells, environment, genome);
    m.age = json.age || 0;
    m.lifetime = json.lifetime || 0;
    m.energy = json.energy ?? 50;
    m.maxEnergy = json.maxEnergy ?? 100;
    m.alive = json.alive !== false;
    m.birthCause = json.birthCause || 'spawn';
    m.parentId = json.parentId || null;
    m.parent2Id = json.parent2Id || null;
    m.children = json.children || 0;
    m.reproductionCooldown = json.reproductionCooldown || 0;
    m.mutationsSinceBirth = json.mutationsSinceBirth || 0;
    m.type = json.type || 'multicellular';
    m.size = json.size || cells.length;
    m.adhesion = json.adhesion ?? 0;
    return m;
  }
}

// ---------------------------------------------------------------------------
// Species — a group of organisms sharing genetic similarity above a divergence
// threshold. Speciation happens when genetic distance between lineages exceeds
// the species threshold; extinction when the last member dies.
// ---------------------------------------------------------------------------
class Species {
  constructor(id, name, representativeTraits, birthTime) {
    this.id = id;
    this.name = name; // e.g. "Species A", "Species B" or descriptive name
    this.representativeTraits = { ...representativeTraits }; // trait centroid
    this.birthTime = birthTime; // sim time when species formed
    this.extinctionTime = null; // sim time when species went extinct
    this.memberCount = 0;
    this.generation = 0;
    this.lineageRootId = null; // id of founding organism
    this.isExtinct = false;
  }

  updateTraits(traits) {
    // Blend representative traits toward population mean (slow drift).
    const keys = Object.keys(traits);
    for (const k of keys) {
      this.representativeTraits[k] = clamp(
        this.representativeTraits[k] * 0.9 + traits[k] * 0.1, 0, 1
      );
    }
  }

  geneticDistance(traits) {
    const keys = Object.keys(traits);
    let dist = 0;
    for (const k of keys) {
      dist += Math.abs(this.representativeTraits[k] - (traits[k] ?? 0));
    }
    return dist / keys.length;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      representativeTraits: { ...this.representativeTraits },
      birthTime: this.birthTime,
      extinctionTime: this.extinctionTime,
      memberCount: this.memberCount,
      generation: this.generation,
      lineageRootId: this.lineageRootId,
      isExtinct: this.isExtinct
    };
  }

  static fromJSON(json) {
    const s = new Species(json.id, json.name, json.representativeTraits, json.birthTime);
    s.extinctionTime = json.extinctionTime;
    s.memberCount = json.memberCount;
    s.generation = json.generation;
    s.lineageRootId = json.lineageRootId;
    s.isExtinct = json.isExtinct || false;
    return s;
  }
}

// ---------------------------------------------------------------------------
// Ecological role determination based on simulated traits and resources.
// Roles: producer | herbivore | carnivore | omnivore | decomposer
// ---------------------------------------------------------------------------
const ECOLOGICAL_ROLES = {
  PRODUCER: 'producer',
  HERBIVORE: 'herbivore',
  CARNIVORE: 'carnivore',
  OMNIVORE: 'omnivore',
  DECOMPOSER: 'decomposer'
};

function determineEcologicalRole(g, environment) {
  // Producer: high efficiency, low motility, can fix energy from light/minerals.
  if (g.efficiency > 0.5 && g.motility < 0.3 && g.metabolism < 0.4) {
    return ECOLOGICAL_ROLES.PRODUCER;
  }
  // Decomposer: high membrane tolerance, low motility, thrives on toxins/dead matter.
  if (g.membrane > 0.6 && g.motility < 0.4 && g.radiationTolerance > 0.4) {
    return ECOLOGICAL_ROLES.DECOMPOSER;
  }
  // Carnivore: high motility, high metabolism, preys on other consumers.
  if (g.motility > 0.6 && g.metabolism > 0.5) {
    return ECOLOGICAL_ROLES.CARNIVORE;
  }
  // Omnivore: moderate motility/metabolism, flexible diet.
  if (g.motility > 0.35 && g.metabolism > 0.35) {
    return ECOLOGICAL_ROLES.OMNIVORE;
  }
  // Herbivore: eats producers, moderate traits.
  return ECOLOGICAL_ROLES.HERBIVORE;
}

function roleDisplayName(role) {
  const names = {
    producer: 'Уурхай',       // Producer
    herbivore: 'Ивээн уух',     // Herbivore
    carnivore: 'Мал уух',       // Carnivore
    omnivore: 'Хослолт',        // Omnivore
    decomposer: 'Цэвэрлүүлэгч'  // Decomposer
  };
  return names[role] || role;
}

// ---------------------------------------------------------------------------
// Population — a bounded group of organisms undergoing reproduction & death.
// ---------------------------------------------------------------------------
class Population {
  constructor(environment, rng) {
    this.environment = environment;
    this.rng = rng;
    this.organisms = [];
    this.idCounter = { value: 0 };
    this.idCounter.next = () => this.idCounter.value++;
    this.stats = {
      births: 0,
      deaths: 0,
      extinctions: 0,
      maxPopulation: 0,
      avgGeneration: 0,
      dominantLineage: null,
      totalMutations: 0,
      geneticDiversity: 0,
      traitDistribution: {}
    };
    this.history = []; // per-generation snapshots for evolution timeline
    this.historyTick = 0;
    this.lineageTree = new Map(); // id -> { parentId, birthTime, offspringCount }
    // Species tracking (Step 10).
    this.speciesMap = new Map(); // speciesId -> Species
    this.nextSpeciesId = 1;
    this.speciationThreshold = 0.35; // genetic distance threshold for speciation
    this.speciesHistory = []; // speciation/extinction events timeline
    this.maxSpeciesHistory = 200;
    // Phase 12: Civilization tracking.
    this.socialGroups = new Map(); // groupId -> SocialGroup
    this.cultures = new Map(); // cultureId -> Culture
    this.technologies = new Map(); // techId -> Technology
    this.settlements = new Map(); // settlementId -> Settlement
    this.nextGroupId = 1;
    this.nextCultureId = 1;
    this.nextTechId = 1;
    this.nextSettlementId = 1;
    this.civilizationEvents = []; // timeline of civilization milestones
  }

  nextId() {
    return this.idCounter.next();
  }

  _findOrg(id) {
    return this.organisms.find(o => o.id === id) || null;
  }

  recordEvent(type, description, data = {}) {
    this.civilizationEvents.push({ t: this.environment.simTime, type, description, data });
    if (this.civilizationEvents.length > 200) this.civilizationEvents.shift();
  }

  spawn(genome, position) {
    const organism = new Organism(this.nextId(), genome, position, this.environment);
    this.organisms.push(organism);
    this.stats.births += 1;
    return organism;
  }

  spawnMulticellular(genome, position, cellCount = 4) {
    const cells = [];
    for (let i = 0; i < cellCount; i++) {
      const cellGenome = genome.clone();
      // Assign roles based on traits.
      let role = null;
      if (cellGenome.traits.cooperation > 0.6) role = CellRole.PRODUCER;
      else if (cellGenome.traits.motility > 0.6) role = CellRole.CONSUMER;
      else if (cellGenome.traits.membrane > 0.6) role = CellRole.STRUCTURAL;
      else role = CellRole.REPRODUCTIVE;
      const cell = new Organism(
        this.nextId(),
        cellGenome,
        { x: position.x + this.rng.range(-1, 1), y: position.y, z: position.z + this.rng.range(-1, 1) },
        this.environment
      );
      cell.multicellularId = null; // will be set when organism created
      cell.cellRole = role;
      cell.adhesion = cellGenome.traits.adhesion;
      cell.energy = 30;
      cell.biomass = 1;
      cells.push(cell);
      this.organisms.push(cell);
      this.stats.births += 1;
    }
    const morg = new MulticellularOrganism(this.nextId(), cells, this.environment, genome);
    // Set multicellularId on cells.
    for (const c of cells) c.multicellularId = morg.id;
    this.stats.births += 1;
    return morg;
  }

  step(delta, resources, mutationRateOverride) {
    const survivors = [];
    const births = [];
    const deaths = [];
    let totalConsumed = 0;

    for (const organism of this.organisms) {
      // Skip cells that are part of a multicellular organism (updated by the organism).
      if (organism.multicellularId && organism.multicellularId !== null) continue;

      // Multicellular organisms use their own update/divide.
      if (organism instanceof MulticellularOrganism) {
        const result = organism.update(delta, resources);
        totalConsumed += result.consumed || 0;
        if (!organism.alive) {
          deaths.push({ id: organism.id, reason: result.reason, generation: organism.genome.generation, multicellular: true });
          this.stats.deaths += 1;
          continue;
        }
        // Division by fragmentation.
        if (organism.canDivide() && this.organisms.length + births.length < this.environment.maxPopulation) {
          const child = organism.divide(this.rng, this.idCounter, mutationRateOverride);
          if (child) {
            // Add child cells to organisms list.
            for (const c of child.cells) this.organisms.push(c);
            child.type = this.environment.defaultType;
            births.push(child);
            this.stats.totalMutations += child.mutationsSinceBirth;
          }
        }
        survivors.push(organism);
        continue;
      }

      // Regular unicellular organism.
      // Gather nearby organisms within sensory range for behavior decisions.
      const sensoryRange = organism.computeSensoryRange ? organism.computeSensoryRange() : 0;
      const nearbyOrgs = this.organisms.filter(o =>
        o !== organism && o.alive &&
        Math.hypot(o.position.x - organism.position.x, o.position.z - organism.position.z) <= sensoryRange
      );
      const result = organism.update(delta, resources, nearbyOrgs);
      totalConsumed += result.consumed || 0;
      if (!organism.alive) {
        deaths.push({ id: organism.id, reason: result.reason, generation: organism.genome.generation, multicellular: false });
        this.stats.deaths += 1;
        continue;
      }

      // Division.
      if (organism.canDivide() && this.organisms.length + births.length < this.environment.maxPopulation) {
        const child = organism.divide(this.rng, this.idCounter, mutationRateOverride);
        if (child) {
          child.type = this.environment.defaultType;
          births.push(child);
          this.stats.totalMutations += child.mutationsSinceBirth;
          // Check if child should join a multicellular group (emergent multicellularity).
          if (this.environment.available > 60 && child.genome.traits.cooperation > 0.7 && child.genome.traits.adhesion > 0.6 && this.rng.bool(0.1)) {
            this._tryFormMulticellular(child);
          }
        }
      }
      survivors.push(organism);
    }

    // Try to form multicellular organisms from nearby cooperative cells.
    this._tryFormMulticellularGroups();

    for (const child of births) this.organisms.push(child);
    this.organisms = survivors;
    this.stats.births += births.length;

    // Deplete the shared resource pool by total consumption (clamped at 0).
    if (resources && typeof resources.available === 'number') {
      resources.available = Math.max(0, resources.available - totalConsumed);
    }

    // Step 10: Assign species, ecological roles, and process food web interactions.
    this._assignSpeciesAndRoles();
    this._processFoodWeb(delta, resources);

    const aliveCount = this.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism).length;
    if (aliveCount === 0) {
      this.stats.extinctions += 1;
    } else {
      this.stats.maxPopulation = Math.max(this.stats.maxPopulation, aliveCount);
      this.stats.avgGeneration =
        this.organisms.reduce((s, o) => s + (o instanceof MulticellularOrganism ? o.genome.generation : o.genome.generation), 0) / aliveCount;

      // Genetic diversity: average variance across all traits.
      const traitKeys = Object.keys(DEFAULT_TRAITS);
      let totalVariance = 0;
      const traitStats = {};
      const viableOrgs = this.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism);
      for (const key of traitKeys) {
        const values = viableOrgs.map(o => o.genome.traits[key]);
        const mean = values.reduce((s, v) => s + v, 0) / values.length;
        const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
        totalVariance += variance;
        traitStats[key] = { min: Math.min(...values), max: Math.max(...values), mean, variance };
      }
      const diversity = clamp(totalVariance / traitKeys.length, 0, 1);
      this.stats.geneticDiversity = diversity;
      this.stats.traitDistribution = traitStats;

      // Lineage tracking: record births and count offspring per lineage root.
      for (const child of births) {
        let rootId = child.parentId;
        while (this.lineageTree.has(rootId) && this.lineageTree.get(rootId).parentId) {
          rootId = this.lineageTree.get(rootId).parentId;
        }
        this.lineageTree.set(child.id, { parentId: child.parentId, birthTime: this.environment.simTime, offspringCount: 0 });
        if (child.parentId && this.lineageTree.has(child.parentId)) {
          this.lineageTree.get(child.parentId).offspringCount += 1;
        } else if (child.parentId) {
          this.lineageTree.set(child.parentId, { parentId: null, birthTime: this.environment.simTime, offspringCount: 1 });
        }
      }

      // Dominant lineage = root with most offspring.
      let bestRoot = null;
      let bestCount = -1;
      for (const [id, info] of this.lineageTree) {
        if (!info.parentId && info.offspringCount > bestCount) {
          bestRoot = id;
          bestCount = info.offspringCount;
        }
      }
      this.stats.dominantLineage = bestRoot !== null ? { rootId: bestRoot, offspringCount: bestCount } : null;

      // Prune dead lineages from tree to bound memory.
      const aliveIds = new Set(viableOrgs.map(o => o.id));
      for (const id of this.lineageTree.keys()) {
        if (!aliveIds.has(id) && this.lineageTree.get(id).offspringCount === 0) {
          this.lineageTree.delete(id);
        }
      }
    }

    // Record history snapshot every second of sim time for evolution timeline.
    this.historyTick += delta;
    if (this.historyTick >= 1.0) {
      this.historyTick = 0;
      this.history.push({
        t: this.environment.simTime,
        population: aliveCount,
        avgGeneration: this.stats.avgGeneration,
        avgEnergy: this.avg('energy'),
        avgSize: this.avg(o => o.genome.traits.size),
        avgMembrane: this.avg(o => o.genome.traits.membrane),
        avgMetabolism: this.avg(o => o.genome.traits.metabolism),
        geneticDiversity: this.stats.geneticDiversity,
        traitDistribution: JSON.parse(JSON.stringify(this.stats.traitDistribution)),
        births: births.length,
        deaths: deaths.length
      });
      if (this.history.length > 600) this.history.shift(); // cap memory
    }

    return { survivors: aliveCount, births: births.length, deaths: deaths.length, consumed: totalConsumed };
  }

  // Try to form a multicellular organism from a cooperative cell.
  _tryFormMulticellular(seedCell) {
    // Find nearby cells with high cooperation/adhesion.
    const nearby = this.organisms.filter(o =>
      o !== seedCell &&
      o.alive &&
      !o.multicellularId &&
      o.genome.traits.cooperation > 0.6 &&
      o.genome.traits.adhesion > 0.5 &&
      Math.hypot(o.position.x - seedCell.position.x, o.position.z - seedCell.position.z) < 2
    );
    if (nearby.length < 2) return;

    // Take up to 3 nearby cells to form a 4-cell organism.
    const group = [seedCell, ...nearby.slice(0, 3)];
    const genome = seedCell.genome.clone();
    const morg = new MulticellularOrganism(this.nextId(), group, this.environment, genome);
    for (const c of group) {
      c.multicellularId = morg.id;
      c.cellRole = c.genome.traits.motility > 0.5 ? CellRole.CONSUMER :
                    c.genome.traits.cooperation > 0.6 ? CellRole.PRODUCER :
                    c.genome.traits.membrane > 0.6 ? CellRole.STRUCTURAL :
                    CellRole.REPRODUCTIVE;
      c.adhesion = c.genome.traits.adhesion;
    }
    this.stats.births += 1;
    // Remove individual stats for grouped cells (they're now part of morg).
    // morg is NOT added to organisms list (cells are, but morg is tracked separately via cells' multicellularId).
    // We need to track morg somewhere. Let's add it to organisms too but mark it.
    this.organisms.push(morg);
  }

  // Scan for groups of cooperative cells that can form multicellular organisms.
  _tryFormMulticellularGroups() {
    const ungrouped = this.organisms.filter(o =>
      o.alive && !o.multicellularId && o.genome.traits.cooperation > 0.7 && o.genome.traits.adhesion > 0.6
    );
    // Group nearby cells.
    const used = new Set();
    for (const cell of ungrouped) {
      if (used.has(cell.id)) continue;
      const nearby = ungrouped.filter(o =>
        !used.has(o.id) &&
        o !== cell &&
        Math.hypot(o.position.x - cell.position.x, o.position.z - cell.position.z) < 2
      );
      if (nearby.length >= 2) {
        const group = [cell, ...nearby.slice(0, 2)];
        const genome = cell.genome.clone();
        const morg = new MulticellularOrganism(this.nextId(), group, this.environment, genome);
        for (const c of group) {
          c.multicellularId = morg.id;
          c.cellRole = c.genome.traits.motility > 0.5 ? CellRole.CONSUMER :
                        c.genome.traits.cooperation > 0.6 ? CellRole.PRODUCER :
                        c.genome.traits.membrane > 0.6 ? CellRole.STRUCTURAL :
                        CellRole.REPRODUCTIVE;
          c.adhesion = c.genome.traits.adhesion;
          used.add(c.id);
        }
        used.add(cell.id);
        this.organisms.push(morg);
        this.stats.births += 1;
      }
    }
  }

  // Step 10: Assign species based on genetic divergence, determine ecological roles,
  // and track speciation/extinction events.
  _assignSpeciesAndRoles() {
    const viableOrgs = this.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism);

    // Reset member counts for all active species.
    for (const s of this.speciesMap.values()) {
      if (!s.isExtinct) s.memberCount = 0;
    }

    if (viableOrgs.length === 0) {
      // Mark all active species as extinct.
      for (const s of this.speciesMap.values()) {
        if (!s.isExtinct) {
          s.isExtinct = true;
          s.extinctionTime = this.environment.simTime;
          this._recordSpeciesEvent('extinction', s.id, s.name);
        }
      }
      return;
    }

    // Determine ecological role for each organism based on traits.
    for (const org of viableOrgs) {
      org.ecologicalRole = determineEcologicalRole(org.genome.traits, this.environment);
    }

    const activeSpecies = [...this.speciesMap.values()].filter(s => !s.isExtinct);

    for (const org of viableOrgs) {
      // Find closest active species centroid within threshold.
      let bestSpecies = null;
      let bestDist = Infinity;
      for (const s of activeSpecies) {
        const d = s.geneticDistance(org.genome.traits);
        if (d < bestDist) {
          bestDist = d;
          bestSpecies = s;
        }
      }

      if (bestSpecies && bestDist <= this.speciationThreshold) {
        // Assign to existing species.
        org.speciesId = bestSpecies.id;
        bestSpecies.memberCount += 1;
        bestSpecies.generation = Math.max(bestSpecies.generation, org.genome.generation);
      } else {
        // Speciation event: create a new species.
        const speciesId = this.nextSpeciesId++;
        const speciesName = `Заан ${speciesId}`;
        const newSpecies = new Species(speciesId, speciesName, org.genome.traits, this.environment.simTime);
        newSpecies.memberCount = 1;
        newSpecies.generation = org.genome.generation;
        newSpecies.lineageRootId = org.id;
        this.speciesMap.set(speciesId, newSpecies);
        org.speciesId = speciesId;
        this._recordSpeciesEvent('speciation', speciesId, speciesName);
      }
    }

    // Update representative traits for each species.
    for (const org of viableOrgs) {
      if (org.speciesId && this.speciesMap.has(org.speciesId)) {
        const s = this.speciesMap.get(org.speciesId);
        if (!s.isExtinct) s.updateTraits(org.genome.traits);
      }
    }

    // Mark species extinct if no living members remain.
    const activeSpeciesIds = new Set(viableOrgs.map(o => o.speciesId).filter(Boolean));
    for (const [id, s] of this.speciesMap.entries()) {
      if (!s.isExtinct && !activeSpeciesIds.has(id)) {
        s.isExtinct = true;
        s.extinctionTime = this.environment.simTime;
        this._recordSpeciesEvent('extinction', id, s.name);
      }
    }
  }

  // Step 10: Record a speciation or extinction event in the timeline.
  _recordSpeciesEvent(type, speciesId, speciesName) {
    this.speciesHistory.push({
      t: this.environment.simTime,
      type, // 'speciation' | 'extinction'
      speciesId,
      speciesName
    });
    if (this.speciesHistory.length > this.maxSpeciesHistory) this.speciesHistory.shift();
  }

  // Step 10: Process food web interactions — production, consumption, predation,
  // decomposition, nutrient recycling, energy transfer, population feedback.
  _processFoodWeb(delta, resources) {
    const viableOrgs = this.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism);
    if (viableOrgs.length === 0) return;

    const producers = viableOrgs.filter(o => o.ecologicalRole === 'producer');
    const consumers = viableOrgs.filter(o => o.ecologicalRole !== 'producer' && o.ecologicalRole !== 'decomposer');
    const decomposers = viableOrgs.filter(o => o.ecologicalRole === 'decomposer');

    // --- Resource production by producers (photosynthesis-like) ---
    let organicProduced = 0;
    for (const p of producers) {
      const g = p.genome.traits;
      const production = g.efficiency * 0.25 * (this.environment.energy / 100) * (this.environment.minerals / 100);
      organicProduced += production;
    }
    if (resources && typeof resources.available === 'number') {
      resources.available = Math.min(100, resources.available + organicProduced * 0.5);
    }

    // --- Consumption / predation ---
    for (const c of consumers) {
      if (!c.alive) continue;
      const g = c.genome.traits;
      const role = c.ecologicalRole;

      // Determine prey pool by role.
      let preyPool = [];
      if (role === 'herbivore') {
        preyPool = producers.filter(o => o.alive);
      } else if (role === 'carnivore') {
        preyPool = consumers.filter(o => o.alive && o.id !== c.id && o.ecologicalRole !== 'carnivore');
      } else if (role === 'omnivore') {
        preyPool = [...producers, ...consumers.filter(o => o.alive && o.id !== c.id)];
      }

      if (preyPool.length === 0 || g.motility <= 0.15) continue;

      // Predation attempt: probability based on motility and efficiency.
      const prey = preyPool[Math.floor(this.rng.next() * preyPool.length)];
      if (!prey || !prey.alive) continue;

      const successChance = clamp(g.motility * 0.5 + g.efficiency * 0.3, 0, 0.6);
      if (!this.rng.bool(successChance)) continue;

      // Successful consumption: transfer energy from prey to consumer.
      const energyGain = 12 * (0.5 + g.efficiency * 0.5);
      c.energy = Math.min(c.maxEnergy, c.energy + energyGain);
      prey.energy = Math.max(0, prey.energy - energyGain * 0.6);
      if (prey.energy <= 0) {
        prey.alive = false;
        prey.birthCause = 'predation';
      }
    }

    // --- Decomposition: decomposers recycle dead matter into nutrients ---
    for (const d of decomposers) {
      if (!d.alive) continue;
      const g = d.genome.traits;
      const recycled = g.efficiency * 0.15 * delta;
      if (resources && typeof resources.available === 'number') {
        resources.available = Math.min(100, resources.available + recycled);
      }
    }
  }

  avg(accessor) {
    if (this.organisms.length === 0) return 0;
    const viable = this.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism);
    if (viable.length === 0) return 0;
    const sum = viable.reduce((s, o) => s + (typeof accessor === 'function' ? accessor(o) : o[accessor]), 0);
    return sum / viable.length;
  }

  toJSON() {
    return {
      organisms: this.organisms.map(o => o.toJSON()),
      stats: { ...this.stats },
      history: this.history.slice(-120),
      idCounter: this.idCounter.value,
      lineageTree: [...this.lineageTree.entries()],
      // Step 10: Species data.
      speciesMap: [...this.speciesMap.entries()].map(([id, s]) => [id, s.toJSON()]),
      nextSpeciesId: this.nextSpeciesId,
      speciationThreshold: this.speciationThreshold,
      speciesHistory: this.speciesHistory.slice(-200)
    };
  }

  fromJSON(json, environment) {
    this.environment = environment;
    this.rng = this.rng || createRng(Date.now());
    this.idCounter = { value: json.idCounter || 0 };
    this.idCounter.next = () => this.idCounter.value++;
    this.organisms = (json.organisms || []).map(o => {
      if (o.type === 'multicellular') {
        return MulticellularOrganism.fromJSON(o, environment);
      }
      return Organism.fromJSON(o, environment);
    });
    this.stats = { ...this.stats, ...(json.stats || {}) };
    this.history = json.history || [];
    // Step 10: Restore species data.
    this.nextSpeciesId = json.nextSpeciesId || 1;
    this.speciationThreshold = json.speciationThreshold !== undefined ? json.speciationThreshold : 0.35;
    this.speciesMap = new Map((json.speciesMap || []).map(e => [Number(e[0]), Species.fromJSON(e[1])]));
    this.speciesHistory = json.speciesHistory || [];
    this.lineageTree = new Map((json.lineageTree || []).map(e => [Number(e[0]), e[1]]));
    return this;
  }
}

// ---------------------------------------------------------------------------
// Environment — measurable simulation conditions.
// ---------------------------------------------------------------------------
class Environment {
  constructor(planetId = 'mars') {
    this.planetId = planetId;
    // Measurable variables (0..100 unless noted).
    this.temperature = 20;          // Celsius
    this.water = 50;                // availability
    this.energy = 50;               // energy flux / light
    this.minerals = 50;             // chemical resources
    this.radiation = 0;             // radiation dose
    this.gravity = 1;               // relative to Earth
    this.pressure = 1;              // relative pressure
    this.oxygen = 0;                // free oxygen availability
    this.toxins = 0;                // chemical toxicity
    this.maxPopulation = 500;       // hard cap for performance
    this.defaultType = 'prokaryote';
    this.simTime = 0;
    this.resourceRegen = 0.2;       // resources replenish per second
    this.resourceConsumption = 0.05;// per organism uptake reduces pool
    this.available = 100;           // current resource pool
    this.labMode = 'natural';       // 'natural' (planet conditions) | 'controlled' (user-set)
    // Step 10: Seasonal / periodic environmental variation.
    this.season = 0;                // 0..1 (0=winter, 0.25=spring, 0.5=summer, 0.75=autumn)
    this.seasonalCycle = 0;         // accumulates sim time for seasonal progression
    this.seasonalPeriod = 3600;     // sim seconds per full seasonal cycle (1 hour)
    this.seasonalAmplitude = 15;    // temperature swing from seasonal change (C)
  }

  applyPlanetConfig(config) {
    if (!config) return this;
    // Controlled laboratory mode: do not override user-set conditions.
    if (this.labMode === 'natural') {
      const temp = config.temperatureC;
      if (temp) {
        // Use midpoint of day/night as baseline simulation temperature.
        this.temperature = (Number(temp.day) + Number(temp.night)) / 2;
      }
      if (typeof config.gravityMps2 === 'number') {
        this.gravity = config.gravityMps2 / 9.81;
      }
      const atm = config.atmosphere;
      if (atm) {
        this.pressure = Math.min(10, (atm.pressureKPa || 0) / 10);
        if (atm.kind === 'vacuum' || atm.kind === 'exosphere') {
          this.radiation = 60;
          this.oxygen = 0;
          this.water = 0;
          this.minerals = 40;
          this.toxins = 0;
        } else if (atm.kind === 'thin-dust') {
          this.radiation = 30;
          this.oxygen = 5;
          this.water = 10;
          this.minerals = 50;
          this.toxins = 10;
        } else if (atm.kind === 'dense-carbon-dioxide') {
          this.radiation = 10;
          this.oxygen = 0;
          this.water = 0;
          this.toxins = 40;
          this.minerals = 30;
        } else if (atm.kind === 'nitrogen-oxygen') {
          this.radiation = 5;
          this.oxygen = 80;
          this.water = 70;
          this.minerals = 60;
          this.toxins = 0;
        } else if (atm.kind === 'gas-giant') {
          // No solid surface; orbital laboratory only. Extreme pressure, no free water/oxygen.
          this.radiation = 80;
          this.oxygen = 0;
          this.water = 0;
          this.minerals = 30;
          this.toxins = 20;
        } else if (atm.kind === 'ice-giant') {
          // No solid surface; orbital laboratory only. Cold, methane-rich, water ice present.
          this.radiation = 60;
          this.oxygen = 0;
          this.water = 20;
          this.minerals = 20;
          this.toxins = 10;
        } else if (atm.kind === 'stellar-corona') {
          // Sun: safe-distance observation only. Extreme heat and radiation.
          this.radiation = 100;
          this.oxygen = 0;
          this.water = 0;
          this.minerals = 0;
          this.toxins = 0;
        }
      }
      const sky = config.sky;
      if (sky && typeof sky.sunIntensity === 'number') {
        this.energy = clamp(sky.sunIntensity * 20, 0, 100);
      }
    }
    return this;
  }

  setCondition(name, value) {
    const clamped = clamp(Number(value), 0, 100);
    if (name === 'temperature') this.temperature = clamped;
    else if (name === 'water') this.water = clamped;
    else if (name === 'energy') this.energy = clamped;
    else if (name === 'minerals') this.minerals = clamped;
    else if (name === 'radiation') this.radiation = clamped;
    else if (name === 'oxygen') this.oxygen = clamped;
    else if (name === 'toxins') this.toxins = clamped;
    else if (name === 'gravity') this.gravity = clamped / 100;
    else return false;
    return true;
  }

  setLabMode(mode) {
    if (mode !== 'natural' && mode !== 'controlled') return this.labMode;
    this.labMode = mode;
    return this.labMode;
  }

  update(delta) {
    this.simTime += delta;
    // Step 10: Seasonal / periodic environmental variation.
    this.seasonalCycle += delta;
    const cycle = this.seasonalPeriod > 0 ? this.seasonalCycle / this.seasonalPeriod : 0;
    this.season = cycle - Math.floor(cycle); // 0..1 within cycle
    // Seasonal temperature swing: sinusoidal, amplitude around baseline.
    const seasonalTempShift = Math.sin(this.season * Math.PI * 2) * this.seasonalAmplitude;
    // Seasonal energy (light) variation: weaker in "winter" (season near 0 or 1).
    const seasonalEnergyShift = -Math.abs(Math.cos(this.season * Math.PI * 2)) * 15;

    // Slow resource regeneration toward baseline.
    const target = 100;
    this.available = Math.min(target, this.available + this.resourceRegen * delta);
  }

  toJSON() {
    return {
      planetId: this.planetId,
      temperature: this.temperature,
      water: this.water,
      energy: this.energy,
      minerals: this.minerals,
      radiation: this.radiation,
      gravity: this.gravity,
      pressure: this.pressure,
      oxygen: this.oxygen,
      toxins: this.toxins,
      maxPopulation: this.maxPopulation,
      defaultType: this.defaultType,
      simTime: this.simTime,
      available: this.available,
      labMode: this.labMode,
      // Step 10: Seasonal state.
      season: this.season,
      seasonalCycle: this.seasonalCycle,
      seasonalPeriod: this.seasonalPeriod,
      seasonalAmplitude: this.seasonalAmplitude
    };
  }

  static fromJSON(json) {
    const env = new Environment(json.planetId || 'mars');
    Object.assign(env, json);
    return env;
  }
}

// ---------------------------------------------------------------------------
// Ecosystem — producers, consumers, decomposers & resource cycles.
// Built on top of Population; tracks trophic groups and biodiversity.
// ---------------------------------------------------------------------------
class Ecosystem {
  constructor(rng) {
    this.rng = rng;
    this.producers = new Population(new Environment(), rng);
    this.consumers = new Population(new Environment(), rng);
    this.decomposers = new Population(new Environment(), rng);
    this.environments = {
      producer: new Environment(),
      consumer: new Environment(),
      decomposer: new Environment()
    };
    this.resources = { organic: 50, nutrients: 50, oxygen: 20, co2: 80 };
    this.biodiversity = { producer: 0, consumer: 0, decomposer: 0 };
    this.foodWeb = { predationEvents: 0, symbiosisEvents: 0, competitionEvents: 0 };
    this.collapseRisk = 0;
  }

  linkEnvironments(env) {
    this.environments.producer = env;
    this.environments.consumer = env;
    this.environments.decomposer = env;
    this.producers.environment = env;
    this.consumers.environment = env;
    this.decomposers.environment = env;
    this.producers.defaultType = 'producer';
    this.consumers.defaultType = 'consumer';
    this.decomposers.defaultType = 'decomposer';
  }

  step(delta) {
    const stepDelta = Math.min(delta, 0.1);
    const env = this.environments.producer;
    env.update(stepDelta);

    // Resource uptake by producers (photosynthesis-like).
    const producerUptake = this.producers.organisms.length * 0.05 * stepDelta;
    this.resources.nutrients = Math.max(0, this.resources.nutrients - producerUptake * 0.5);
    this.resources.organic = Math.min(100, this.resources.organic + producerUptake * 0.8);
    this.resources.oxygen = Math.min(100, this.resources.oxygen + producerUptake * 0.3);
    this.resources.co2 = Math.max(0, this.resources.co2 - producerUptake * 0.2);

    const envRes = { available: Math.min(100, this.resources.nutrients + this.resources.organic) };

    const pResult = this.producers.step(stepDelta, envRes);
    const cResult = this.consumers.step(stepDelta, envRes);
    const dResult = this.decomposers.step(stepDelta, envRes);

    // Consumers eat producers (predation).
    const predation = Math.min(pResult.survivors * 0.02 * stepDelta, cResult.survivors * 0.1);
    this.foodWeb.predationEvents += predation;
    const energyTransfer = predation * 0.4;
    for (const c of this.consumers.organisms) {
      c.energy = Math.min(c.maxEnergy, c.energy + energyTransfer / Math.max(1, cResult.survivors));
    }
    // Producer loss from predation.
    const lost = Math.floor(predation * 5);
    for (let i = 0; i < lost && this.producers.organisms.length > 0; i++) {
      const victim = this.producers.organisms.pop();
      victim.alive = false;
      this.producers.stats.deaths += 1;
    }

    // Decomposers recycle dead matter -> nutrients.
    const recycled = (pResult.deaths + cResult.deaths + dResult.deaths) * 0.3;
    this.resources.nutrients = Math.min(100, this.resources.nutrients + recycled);
    this.resources.organic = Math.max(0, this.resources.organic - recycled * 0.5);

    // Resource regen.
    this.resources.nutrients = Math.min(100, this.resources.nutrients + 0.1 * stepDelta);
    this.resources.co2 = Math.min(100, this.resources.co2 + 0.05 * stepDelta);

    // Biodiversity = number of distinct generations / lineages present.
    const distinct = (pop) => new Set(pop.organisms.map(o => o.genome.generation)).size;
    this.biodiversity.producer = distinct(this.producers);
    this.biodiversity.consumer = distinct(this.consumers);
    this.biodiversity.decomposer = distinct(this.decomposers);

    // Collapse risk rises when all populations are low or resources depleted.
    const total = pResult.survivors + cResult.survivors + dResult.survivors;
    this.collapseRisk = clamp(
      1 - total / 50 + (1 - this.resources.nutrients / 100) * 0.5 + (1 - this.resources.water || 0) * 0,
      0, 1
    );

    return {
      producers: pResult,
      consumers: cResult,
      decomposers: dResult,
      resources: { ...this.resources },
      biodiversity: { ...this.biodiversity },
      foodWeb: { ...this.foodWeb },
      collapseRisk: this.collapseRisk
    };
  }

  seedProducer(genome, position) {
    return this.producers.spawn(genome, position);
  }
  seedConsumer(genome, position) {
    return this.consumers.spawn(genome, position);
  }
  seedDecomposer(genome, position) {
    return this.decomposers.spawn(genome, position);
  }

  toJSON() {
    return {
      producers: this.producers.toJSON(),
      consumers: this.consumers.toJSON(),
      decomposers: this.decomposers.toJSON(),
      resources: { ...this.resources },
      biodiversity: { ...this.biodiversity },
      foodWeb: { ...this.foodWeb },
      collapseRisk: this.collapseRisk
    };
  }

  fromJSON(json) {
    this.resources = { ...this.resources, ...(json.resources || {}) };
    this.biodiversity = { ...this.biodiversity, ...(json.biodiversity || {}) };
    this.foodWeb = { ...this.foodWeb, ...(json.foodWeb || {}) };
    this.collapseRisk = json.collapseRisk || 0;
    this.producers.fromJSON(json.producers, this.environments.producer);
    this.consumers.fromJSON(json.consumers, this.environments.consumer);
    this.decomposers.fromJSON(json.decomposers, this.environments.decomposer);
    return this;
  }
}

// ---------------------------------------------------------------------------
// LifeEngine — orchestrator. One instance per research chamber / save slot.
// ---------------------------------------------------------------------------
class LifeEngine {
  constructor(options = {}) {
    this.version = 1;
    this.id = options.id || 'life-engine-1';
    this.label = options.label || 'Research Chamber';
    this.rng = createRng(options.seed || Date.now());
    this.environment = new Environment(options.planetId || 'mars');
    if (options.planetConfig) this.environment.applyPlanetConfig(options.planetConfig);
    this.population = new Population(this.environment, this.rng);
    this.ecosystem = new Ecosystem(this.rng);
    this.ecosystem.linkEnvironments(this.environment);
    this.running = false;
    this.speed = 1; // simulation speed multiplier
    this.mode = 'single'; // single | ecosystem
    this.hypothetical = true; // flag: all mechanisms here are models
    this.notes = [];
    this.maxOrganisms = 400;
    this.environment.maxPopulation = this.maxOrganisms;
    this.sessionTime = 0;
    this.mutationRate = 0.03; // engine-level mutation rate multiplier (0..0.5)
    this.experimentHistory = []; // { planetId, labMode, conditions, result, timestamp }
  }

  // ---- configuration ----
  setPlanet(planetId, config) {
    const prevLabMode = this.environment?.labMode || 'natural';
    this.environment = new Environment(planetId);
    this.environment.setLabMode(prevLabMode);
    if (config) this.environment.applyPlanetConfig(config);
    this.environment.maxPopulation = this.maxOrganisms;
    this.population.environment = this.environment;
    this.ecosystem.linkEnvironments(this.environment);
    return this.environment.toJSON();
  }

  setLabMode(mode) {
    return this.environment.setLabMode(mode);
  }

  setCondition(name, value) {
    return this.environment.setCondition(name, value);
  }

  setSpeed(speed) {
    this.speed = Math.max(0, Math.min(10, Number(speed) || 1));
    return this.speed;
  }

  setRunning(running) {
    this.running = Boolean(running);
    return this.running;
  }

  setMutationRate(rate) {
    this.mutationRate = clamp(Number(rate) || 0, 0, 0.5);
    return this.mutationRate;
  }

  getMutationRate() {
    return this.mutationRate;
  }

  setMode(mode) {
    if (mode !== 'single' && mode !== 'ecosystem') return this.mode;
    this.mode = mode;
    return this.mode;
  }

  setMaxOrganisms(n) {
    this.maxOrganisms = Math.max(10, Math.min(2000, Math.floor(Number(n) || 400)));
    this.environment.maxPopulation = this.maxOrganisms;
    return this.maxOrganisms;
  }

  recordExperiment(planetId, labMode, conditions, result) {
    const entry = {
      planetId,
      labMode,
      conditions: { ...conditions },
      result: { ...result },
      timestamp: Date.now(),
      simTime: this.environment.simTime
    };
    this.experimentHistory.push(entry);
    if (this.experimentHistory.length > 200) this.experimentHistory.shift();
    return entry;
  }

  addNote(text) {
    this.notes.push({ t: this.sessionTime, text });
    if (this.notes.length > 100) this.notes.shift();
    return this.notes;
  }

  // ---- seeding ----
  seedOrganism(traits, position = null) {
    const genome = traits ? new Genome(traits) : Genome.random(this.rng);
    const pos = position || {
      x: this.rng.range(-5, 5),
      y: 0,
      z: this.rng.range(-5, 5)
    };
    const organism = this.population.spawn(genome, pos);
    organism.type = this.population.environment.defaultType;
    return organism;
  }

  seedProducers(count = 3) {
    const created = [];
    for (let i = 0; i < count; i++) {
      const g = Genome.random(this.rng);
      g.traits.metabolism = clamp(g.traits.metabolism * 0.7, 0, 1); // producers use less
      g.traits.efficiency = clamp(g.traits.efficiency * 1.2, 0, 1);
      const org = this.ecosystem.seedProducer(g, {
        x: this.rng.range(-8, 8), y: 0, z: this.rng.range(-8, 8)
      });
      org.type = 'producer';
      created.push(org);
    }
    return created;
  }

  seedConsumers(count = 2) {
    const created = [];
    for (let i = 0; i < count; i++) {
      const g = Genome.random(this.rng);
      g.traits.motility = clamp(g.traits.motility * 1.5, 0, 1);
      g.traits.metabolism = clamp(g.traits.metabolism * 1.2, 0, 1);
      const org = this.ecosystem.seedConsumer(g, {
        x: this.rng.range(-8, 8), y: 0, z: this.rng.range(-8, 8)
      });
      org.type = 'consumer';
      created.push(org);
    }
    return created;
  }

  seedMulticellular(count = 2, cellCount = 4) {
    const created = [];
    for (let i = 0; i < count; i++) {
      const g = Genome.random(this.rng);
      // Multicellular founders need high cooperation and adhesion.
      g.traits.cooperation = clamp(g.traits.cooperation * 1.5, 0, 1);
      g.traits.adhesion = clamp(g.traits.adhesion * 1.5, 0, 1);
      g.traits.metabolism = clamp(g.traits.metabolism * 0.8, 0, 1);
      const pos = {
        x: this.rng.range(-8, 8),
        y: 0,
        z: this.rng.range(-8, 8)
      };
      const morg = this.population.spawnMulticellular(g, pos, cellCount);
      morg.type = 'multicellular';
      created.push(morg);
    }
    return created;
  }

  // Step 11: Selective breeding — create offspring from two parent organisms
  // with blended genomes. Returns the child organism or null if incompatible.
  breed(parent1Id, parent2Id) {
    const pop = this.population;
    const p1 = pop.organisms.find(o => o.id === parent1Id);
    const p2 = pop.organisms.find(o => o.id === parent2Id);
    if (!p1 || !p2 || !p1.alive || !p2.alive) return null;
    if (p1.id === p2.id) return null;

    // Compatibility: both must have sufficient energy and biomass.
    const g1 = p1.genome.traits;
    const g2 = p2.genome.traits;
    const minEnergy = 30;
    if (p1.energy < minEnergy || p2.energy < minEnergy) return null;

    // Genetic distance: too distant = incompatible (speciation barrier).
    const traitKeys = Object.keys(DEFAULT_TRAITS);
    let geneticDistance = 0;
    for (const k of traitKeys) {
      geneticDistance += Math.abs((g1[k] || 0) - (g2[k] || 0));
    }
    geneticDistance /= traitKeys.length;
    const compatibilityThreshold = 0.5;
    if (geneticDistance > compatibilityThreshold) return null;

    // Blend traits: average with slight random variation toward either parent.
    const childTraits = {};
    for (const k of traitKeys) {
      const a = g1[k] || 0;
      const b = g2[k] || 0;
      const blend = (a + b) / 2;
      const jitter = this.rng.range(-0.05, 0.05);
      childTraits[k] = clamp(blend + jitter, 0, 1);
    }

    const childGenome = new Genome(childTraits, (g1.mutationRate + g2.mutationRate) / 2);
    const pos = {
      x: (p1.position.x + p2.position.x) / 2 + this.rng.range(-1, 1),
      y: 0,
      z: (p1.position.z + p2.position.z) / 2 + this.rng.range(-1, 1)
    };
    const child = pop.spawn(childGenome, pos);
    child.parentId = p1.id;
    child.parent2Id = p2.id;
    child.birthCause = 'breeding';
    child.energy = (p1.energy + p2.energy) / 4; // child starts with shared energy
    p1.energy = Math.max(0, p1.energy - minEnergy);
    p2.energy = Math.max(0, p2.energy - minEnergy);
    p1.children += 1;
    p2.children += 1;

    // Record in lineage tree (primary parent).
    pop.lineageTree.set(child.id, {
      parentId: p1.id,
      birthTime: this.environment.simTime,
      offspringCount: 0
    });
    if (pop.lineageTree.has(p1.id)) {
      pop.lineageTree.get(p1.id).offspringCount += 1;
    }

    return child;
  }

  clear() {
    this.population.organisms = [];
    this.ecosystem.producers.organisms = [];
    this.ecosystem.consumers.organisms = [];
    this.ecosystem.decomposers.organisms = [];
    this.sessionTime = 0;
    return { cleared: true };
  }

  reset() {
    this.clear();
    this.environment = new Environment(this.environment.planetId);
    this.environment.maxPopulation = this.maxOrganisms;
    this.population.environment = this.environment;
    this.ecosystem.linkEnvironments(this.environment);
    this.rng = createRng(Date.now());
    this.running = false;
    this.sessionTime = 0;
    return this.getState();
  }

  // ---- step ----
  step(delta) {
    if (!this.running) return this.getState();
    const stepDelta = Math.min(delta * this.speed, 0.1);
    this.sessionTime += stepDelta;
    this.environment.update(stepDelta);

    if (this.mode === 'ecosystem') {
      this.ecosystem.step(stepDelta);
      this.population.step(stepDelta, {
        available: Math.min(100, this.ecosystem.resources.organic + this.ecosystem.resources.nutrients)
      }, this.mutationRate);
    } else {
      this.population.step(stepDelta, { available: this.environment.available }, this.mutationRate);
    }

    return this.getState();
  }

  // ---- inspect ----
  getOrganism(id) {
    const all = [
      ...this.population.organisms,
      ...this.ecosystem.producers.organisms,
      ...this.ecosystem.consumers.organisms,
      ...this.ecosystem.decomposers.organisms
    ];
    return all.find(o => o.id === id) || null;
  }

  getState() {
    const popStats = this.population.stats;
    return {
      version: this.version,
      id: this.id,
      label: this.label,
      hypothetical: this.hypothetical,
      running: this.running,
      speed: this.speed,
      mode: this.mode,
      sessionTime: this.sessionTime,
      maxOrganisms: this.maxOrganisms,
      environment: this.environment.toJSON(),
      population: {
        count: this.population.organisms.length,
        multicellularCount: this.population.organisms.filter(o => o instanceof MulticellularOrganism).length,
        unicellularCount: this.population.organisms.filter(o => !(o instanceof MulticellularOrganism) && !o.multicellularId).length,
        cellCount: this.population.organisms.filter(o => o.multicellularId && !(o instanceof MulticellularOrganism)).length,
        stats: { ...popStats },
        avgGeneration: popStats.avgGeneration,
        avgEnergy: this.population.avg('energy'),
        avgSize: this.population.avg(o => o.genome.traits.size),
        avgMembrane: this.population.avg(o => o.genome.traits.membrane),
        avgMetabolism: this.population.avg(o => o.genome.traits.metabolism),
        avgMotility: this.population.avg(o => o.genome.traits.motility),
        avgSensory: this.population.avg(o => (o.genome.traits.chemicalSense + o.genome.traits.lightSense + o.genome.traits.tempSense + o.genome.traits.threatSense) / 4),
        // Step 11: Neural trait averages.
        avgNeuralProcessing: this.population.avg(o => o.genome.traits.neuralProcessing),
        avgReactionSpeed: this.population.avg(o => o.genome.traits.reactionSpeed),
        avgNeuralCoordination: this.population.avg(o => o.genome.traits.neuralCoordination),
        avgEnvironmentalAwareness: this.population.avg(o => o.genome.traits.environmentalAwareness),
        avgMovementControl: this.population.avg(o => o.genome.traits.movementControl),
        avgNeuralEnergyCost: this.population.avg(o => o.genome.traits.neuralEnergyCost),
        geneticDiversity: popStats.geneticDiversity,
        traitDistribution: popStats.traitDistribution,
        dominantLineage: popStats.dominantLineage,
        // Step 10: Species data for save/load.
        speciesMap: [...this.population.speciesMap.entries()].map(([id, s]) => [id, s.toJSON()]),
        nextSpeciesId: this.population.nextSpeciesId,
        speciationThreshold: this.population.speciationThreshold,
        speciesHistory: this.population.speciesHistory.slice(-200)
      },
      mutationRate: this.mutationRate,
      ecosystem: this.mode === 'ecosystem' ? {
        producers: this.ecosystem.producers.organisms.length,
        consumers: this.ecosystem.consumers.organisms.length,
        decomposers: this.ecosystem.decomposers.organisms.length,
        resources: { ...this.ecosystem.resources },
        biodiversity: { ...this.ecosystem.biodiversity },
        foodWeb: { ...this.ecosystem.foodWeb },
        collapseRisk: this.ecosystem.collapseRisk
      } : null,
      history: this.population.history.slice(-60),
      // Step 10: Species & ecosystem data.
      species: this._getSpeciesState(),
      experimentHistory: this.experimentHistory.slice(-100),
      notice: HYPOTHETICAL_SHORT
    };
  }

  // Step 10: Get species state for UI and save/load.
  _getSpeciesState() {
    const pop = this.population;
    const viableOrgs = pop.organisms.filter(o => !o.multicellularId || o instanceof MulticellularOrganism);
    const speciesList = [];
    const roleCounts = { producer: 0, herbivore: 0, carnivore: 0, omnivore: 0, decomposer: 0 };

    for (const org of viableOrgs) {
      const role = org.ecologicalRole || 'producer';
      if (roleCounts[role] !== undefined) roleCounts[role] += 1;
    }

    for (const [id, s] of pop.speciesMap.entries()) {
      speciesList.push({
        id: s.id,
        name: s.name,
        memberCount: s.memberCount,
        generation: s.generation,
        birthTime: s.birthTime,
        extinctionTime: s.extinctionTime,
        isExtinct: s.isExtinct,
        lineageRootId: s.lineageRootId,
        representativeTraits: { ...s.representativeTraits }
      });
    }

    // Sort: active species first, then extinct.
    speciesList.sort((a, b) => {
      if (a.isExtinct !== b.isExtinct) return a.isExtinct ? 1 : -1;
      return b.memberCount - a.memberCount;
    });

    return {
      species: speciesList,
      activeCount: speciesList.filter(s => !s.isExtinct).length,
      extinctCount: speciesList.filter(s => s.isExtinct).length,
      totalSpeciationEvents: pop.speciesHistory.filter(e => e.type === 'speciation').length,
      totalExtinctionEvents: pop.speciesHistory.filter(e => e.type === 'extinction').length,
      roleCounts,
      speciationThreshold: pop.speciationThreshold,
      speciesHistory: pop.speciesHistory.slice(-50)
    };
  }

  setState(state) {
    if (!state) return this.getState();
    this.version = state.version || this.version;
    this.id = state.id || this.id;
    this.label = state.label || this.label;
    this.hypothetical = state.hypothetical !== false;
    this.running = Boolean(state.running);
    this.speed = clamp(Number(state.speed) || 1, 0, 10);
    this.mode = state.mode === 'ecosystem' ? 'ecosystem' : 'single';
    this.sessionTime = Number(state.sessionTime) || 0;
    this.maxOrganisms = Math.max(10, Math.min(2000, Number(state.maxOrganisms) || 400));
    this.environment = Environment.fromJSON(state.environment || {});
    this.environment.maxPopulation = this.maxOrganisms;
    this.population = new Population(this.environment, this.rng);
    this.population.fromJSON(state.population, this.environment);
    this.mutationRate = clamp(Number(state.mutationRate) || 0.03, 0, 0.5);
    this.ecosystem = new Ecosystem(this.rng);
    this.ecosystem.linkEnvironments(this.environment);
    if (state.ecosystem) this.ecosystem.fromJSON(state.ecosystem);
    this.experimentHistory = Array.isArray(state.experimentHistory) ? state.experimentHistory : [];
    return this.getState();
  }
}

// Hypothetical origin-of-life (protocell) model — separate from population genetics.
// Clearly labeled; NOT a claim that life definitely arose this way.
class ProtocellModel {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.stage = 'sterile'; // sterile | prebiotic | protocell | replicator
    this.monomers = 0;
    this.polymers = 0;
    this.membranes = 0;
    this.replicators = 0;
    this.energy = 20;
    this.log = [];
    this.generation = 0;
  }

  // NOTE: Origin-of-life mechanisms are hypothetical models, not established fact.
  step(delta, conditions) {
    // conditions: { water, temperature, energy, minerals, organic } each 0..100
    const waterSuit = clamp(conditions.water / 60, 0, 1);
    const tempSuit = clamp(1 - Math.abs(conditions.temperature - 30) / 30, 0, 1);
    const energySuit = clamp(conditions.energy / 50, 0, 1);
    const mineralSuit = clamp(conditions.minerals / 50, 0, 1);
    const organicSuit = clamp(conditions.organic / 40, 0, 1);
    const suitability = (waterSuit + tempSuit + energySuit + mineralSuit + organicSuit) / 5;

    const log = (msg) => { this.log.push(msg); if (this.log.length > 12) this.log.shift(); };

    if (this.stage === 'sterile') {
      const gain = suitability * 0.5 * delta;
      this.monomers = Math.min(100, this.monomers + gain);
      this.energy = Math.min(100, this.energy + gain * 0.5);
      if (this.monomers >= 10) {
        this.stage = 'prebiotic';
        log('Organic monomers accumulated (hypothetical prebiotic chemistry).');
      }
    } else if (this.stage === 'prebiotic') {
      const gain = suitability * 0.4 * delta;
      this.polymers = Math.min(100, this.polymers + gain);
      this.monomers = Math.max(0, this.monomers - gain * 0.5);
      if (this.polymers >= 25) {
        this.stage = 'protocell';
        this.membranes = 1;
        log('Protocell-like membrane aggregates formed (hypothetical).');
      }
    } else if (this.stage === 'protocell') {
      const gain = suitability * 0.3 * delta;
      this.replicators = Math.min(100, this.replicators + gain);
      this.polymers = Math.max(0, this.polymers - gain * 0.3);
      this.energy = Math.max(0, this.energy - 0.1 * delta);
      if (this.replicators >= 50) {
        this.stage = 'replicator';
        log('Self-replicating molecule-like system emerged (highly speculative).');
      }
      if (this.energy <= 0) {
        this.stage = 'prebiotic';
        log('Protocell dissolved; chemistry reverted to prebiotic stage.');
      }
    } else {
      // replicator: maintain.
      this.energy = Math.max(0, this.energy - 0.05 * delta);
    }
    this.generation = this.stage === 'sterile' ? 0 :
      this.stage === 'prebiotic' ? 1 :
      this.stage === 'protocell' ? 2 : 3;
    return this.getState();
  }

  getState() {
    return {
      stage: this.stage,
      monomers: this.monomers,
      polymers: this.polymers,
      membranes: this.membranes,
      replicators: this.replicators,
      energy: this.energy,
      generation: this.generation,
      log: [...this.log],
      notice: 'HYPOTHETICAL: origin-of-life mechanism is a model, not established fact.'
    };
  }
}

export {
  createRng,
  Genome,
  Organism,
  Population,
  Environment,
  Ecosystem,
  LifeEngine,
  ProtocellModel,
  MulticellularOrganism,
  CellRole,
  Species,
  ECOLOGICAL_ROLES,
  determineEcologicalRole,
  roleDisplayName,
  DEFAULT_TRAITS,
  HYPOTHETICAL_SHORT,
  clamp
};
