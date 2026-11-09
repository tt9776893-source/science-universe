/**
 * SCIENCE UNIVERSE — LIFE GENESIS ENGINE V2
 * File: js/life-genesis/LifeSimulationCore.js
 *
 * Reusable, dependency-free scientific simulation core (no DOM, no Three.js).
 *
 * Models (simplified, documented — see docs/LIFE_GENESIS_SIMULATION.md):
 *   1.  Planetary habitability / permissibility scoring (does NOT create life)
 *   2.  Environmental chemistry (aqueous speciation: pH <-> [H+], O2/CO2/CH4/H2 reservoirs)
 *   3.  Prebiotic chemical reaction network (5 documented reactions)
 *   4.  Protocell-like vesicle assembly / lysis equilibrium
 *   5.  Hypothetical microbial populations (3 metabolisms + explicit INOCULATION gate)
 *   6.  Replication with mutation (bitstring genome, 4 functional loci)
 *   7.  Natural selection (per-capita fitness -> carrying capacity)
 *   8.  Population extinction (Allee threshold + abiotic lethality)
 *   9.  Ecological relationships (commensalism, amensalism, predation, competition,
 *       cross-feeding) via a metabolic byproduct matrix
 *   10. Long-term environmental adaptation (multi-generation allele tracking)
 *
 * EVIDENCE TIERS (per model / parameter):
 *   'established'  — textbook / laboratory-demonstrated science
 *   'simplified'   — established process, deliberately simplified parameterisation
 *   'speculative'  — plausible hypothesis, NOT demonstrated (origin of life, protocells,
 *                    hypothetical alien metabolisms)
 *
 * KEY SCIENTIFIC GUARDRAIL: favorable conditions NEVER auto-generate life.
 * The simulation starts sterile; `inoculate()` is an explicit user/API action that
 * introduces a hypothetical founding population.
 *
 * UMD (AMD / CommonJS / browser global) — same contract as js/science modules.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LifeSimulationCore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var KELVIN = 273.15;
  var R_GAS = 8.314462618; // J mol^-1 K^-1

  /* ==========================================================================
   * EVIDENCE-TAGGED MODEL CATALOG
   * ========================================================================== */
  var MODELS = {
    water_phase:            { tier: 'established', ref: 'Water triple point 611.657 Pa / 273.16 K; Clausius-Clapeyron boiling estimate' },
    aqueous_chemistry:      { tier: 'established', ref: 'pH = -log10(aH+), activity approximated by concentration' },
    monomer_formation:      { tier: 'simplified',  ref: 'Miller-Urey (1953) type synthesis; yield parameterised, not kinetic' },
    rna_like_polymers:      { tier: 'speculative', ref: 'Montmorillonite / intertidal wet-dry cycling hypotheses (Ferris et al.)' },
    vesicle_selfassembly:   { tier: 'speculative', ref: 'Fatty-acid vesicle self-assembly demonstrated in lab; alien conditions extrapolated' },
    metabolism_first:       { tier: 'speculative', ref: 'Alkaline hydrothermal H2/CO2 redox gradient hypothesis (Lane, Martin)' },
    replication_mutation:   { tier: 'simplified',  ref: 'Digital bitstring genome; mutation rate per replication' },
    logistic_selection:     { tier: 'established', ref: 'Verhulst logistic growth + per-capita relative fitness' },
    allee_extinction:       { tier: 'simplified',  ref: 'Allee threshold: below minimum viable density growth turns negative' },
    species_interactions:   { tier: 'speculative', ref: 'Byproduct matrix coefficients are hypothetical for extraterrestrial life' },
    environment_adaptation: { tier: 'simplified',  ref: 'Allele frequency tracking across generations; no horizontal gene transfer' },
    abiogenesis_outcome:    { tier: 'speculative', ref: 'Origin of life is an unsolved scientific problem; scoring is pedagogical' }
  };

  /* ==========================================================================
   * SEEDED PRNG (mulberry32) — reproducible experiments
   * ========================================================================== */
  function createRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function round(v, d) { var m = Math.pow(10, d || 0); return Math.round(v * m) / m; }

  /* ==========================================================================
   * ENVIRONMENT FACTORY
   * env = { id, name, nameMn, evidence, temperatureK, pressureBar, pH, salinityPct,
   *         waterActivity, uvIndex, radiationDoseGyPerSol, redoxPotentialMv,
   *         energySourceType, mineralSoup, notes }
   * `mineralSoup`: { Fe2+, H2S, H2, CO2, NH3, PO4, ... } in mM (millimol/L)
   * ========================================================================== */
  function createEnvironment(id, params) {
    var e = {
      id: id,
      name: params.name || id,
      nameMn: params.nameMn || params.name || id,
      evidence: params.evidence || 'established',
      temperatureK: params.temperatureK,
      pressureBar: params.pressureBar,
      pH: params.pH,
      salinityPct: params.salinityPct || 0,
      waterActivity: params.waterActivity !== undefined ? params.waterActivity : 1.0,
      uvIndex: params.uvIndex || 0,               // 0..10 surface UV index
      radiationDoseGyPerSol: params.radiationDoseGyPerSol || 0,
      redoxPotentialMv: params.redoxPotentialMv || 0, // >0 oxidizing, <0 reducing
      energySourceType: params.energySourceType || 'none',
      mineralSoup: Object.assign({
        Fe2: 0, H2S: 0, H2: 0, CO2: 0, NH3: 0, PO4: 0, SO4: 0, CH4: 0
      }, params.mineralSoup || {}),
      notes: params.notes || ''
    };
    // Preserve extra metadata supplied by presets (region, nonAqueousSolvent, ...)
    Object.keys(params).forEach(function (k) {
      if (!(k in e)) e[k] = params[k];
    });
    return e;
  }

  /**
   * Derived environmental state (pure function of env).
   * Returns evidence-tagged habitability + chemistry inputs.
   * NOTE: 'permissive' means physically allowed, NOT that life exists.
   */
  function evaluateEnvironment(env) {
    var T = env.temperatureK;
    var Ppa = env.pressureBar * 100000;

    // --- Water phase (established thermodynamics) ---
    var waterPhase, liquidWater = false;
    var TRIPLE_P = 611.657, TRIPLE_T = 273.16;
    if (Ppa < TRIPLE_P) {
      waterPhase = 'sublimation_vacuum';
    } else if (T < TRIPLE_T) {
      waterPhase = 'ice';
    } else {
      var pRatio = Math.max(1e-6, Ppa / 101325);
      var tBoil = 373.15 / (1 - 0.0763 * Math.log(pRatio)); // Clausius-Clapeyron approximation
      if (T <= tBoil) { waterPhase = 'liquid'; liquidWater = true; }
      else { waterPhase = 'vapor'; }
    }

    // --- Aqueous chemistry: pH -> [H+] (established) ---
    var hConc = Math.pow(10, -env.pH);

    // --- Energy availability 0..1 (simplified score) ---
    var energyMap = { hydrothermal: 0.95, radiolytic: 0.6, photochemical: 0.55, redox: 0.75, none: 0.05 };
    var energyScore = energyMap[env.energySourceType] !== undefined ? energyMap[env.energySourceType] : 0.4;

    // --- Lethality factors (0 = harmless, 1 = fully lethal) ---
    var heatKill = T > 363 ? clamp((T - 363) / 80, 0, 1) : 0;            // >90 C protein denaturation zone
    var coldSlow = T < 250 ? clamp((250 - T) / 175, 0, 1) : 0;           // metabolic kinetic slowdown (not instant death)
    var radKill = clamp(env.radiationDoseGyPerSol / 50, 0, 1);           // 50 Gy/sol ~ sterilizing for Earth-like cells
    var uvKill = env.uvIndex >= 0 ? clamp(env.uvIndex / 10, 0, 1) * (liquidWater ? 0.5 : 1) : 0;
    var dryKill = 1 - clamp((env.waterActivity - 0.55) / 0.35, 0, 1);    // aw<0.55: no known cellular life
    var phKill = (env.pH < 3 || env.pH > 11.5) ? clamp(
      env.pH < 3 ? (3 - env.pH) / 3 : (env.pH - 11.5) / 2.5, 0, 1) : 0;
    var salKill = env.salinityPct > 12 ? clamp((env.salinityPct - 12) / 25, 0, 1) : 0;

    // Combined abiotic lethality (multiplicative survival, simplified)
    var survival = (1 - heatKill) * (1 - radKill) * (1 - uvKill * 0.6) *
                   (1 - dryKill) * (1 - phKill) * (1 - salKill);
    var abioticLethality = round(1 - survival, 3);

    // --- Permissibility (0..1): can WATER-BASED known-like life exist here? ---
    // Worlds with a non-aqueous solvent (e.g. Titan's liquid CH4) score 0 here:
    // no known life uses a non-aqueous solvent. A speculative azotosome pathway
    // is reported separately in `nonAqueousSpeculative` so established science
    // stays clearly separated from speculation.
    var nonAqueousSpeculative = null;
    if (!liquidWater && env.nonAqueousSolvent) {
      nonAqueousSpeculative = {
        solvent: env.nonAqueousSolvent,
        tier: 'speculative',
        note: 'No known organism uses ' + env.nonAqueousSolvent + ' as a solvent; azotosome membranes are a hypothesis only (Tremblay et al. 2004).'
      };
    }
    var permissive = liquidWater ? 1.0 : 0.0;
    permissive *= (1 - heatKill);
    permissive *= clamp(1 - phKill, 0.05, 1);
    permissive *= clamp(env.waterActivity >= 0.55 ? 1 : env.waterActivity / 0.55, 0, 1);
    permissive *= (1 - radKill * 0.7);
    permissive = round(clamp(permissive, 0, 1), 3);

    // --- Thermal habitability index (simplified, 273-323 K optimum band) ---
    var thi = 0;
    if (T >= 273.15 && T <= 373.15) thi = 1 - Math.abs(T - 298) / 100;
    else if (T >= 180 && T < 273.15) thi = Math.max(0.02, 0.35 * (1 - (273.15 - T) / 93.15));
    thi = round(clamp(thi, 0, 1), 3);

    return {
      waterPhase: waterPhase,
      liquidWater: liquidWater,
      hConcentrationM: hConc,
      energyScore: energyScore,
      lethality: abioticLethality,
      permissive: permissive,
      thi: thi,
      nonAqueousSpeculative: nonAqueousSpeculative,
      tier: 'established'
    };
  }

  /* ==========================================================================
   * CHEMISTRY STATE
   * Concentrations in mM (millimol/L) unless noted.
   * ========================================================================== */
  function initialChemistry(env) {
    var s = env.mineralSoup || {};
    return {
      // Prebiotic feedstocks & products
      H2: s.H2 || 0,
      CO2: s.CO2 || 0,
      NH3: s.NH3 || 0,
      H2S: s.H2S || 0,
      Fe2: s.Fe2 || 0,
      SO4: s.SO4 || 0,
      CH4: s.CH4 || 0,
      PO4: s.PO4 || 0,
      // Monomers (amino acids & nucleobases) — the "organic soup"
      monomers: 0,
      // Polymerized RNA-like chains (count of chain-units)
      polymers: 0,
      // Lipid amphiphiles available for vesicle assembly
      lipids: 0,
      // Environmental energy budget (arbitrary photochemical units, 0..100)
      energyPool: 100,
      // Dissolved O2 (0 on anoxic worlds)
      O2: 0
    };
  }

  /**
   * Prebiotic reaction network — ONE simulation step advances these reactions.
   * Returns {delta, notes[], evidence}. Coefficients are pedagogical, not kinetic.
   */
  function stepChemistry(ch, env, der, dtDays, rng) {
    var d = {};
    Object.keys(ch).forEach(function (k) { d[k] = 0; });
    var notes = [];

    // R1 (established, simplified): Miller-Urey type abiotic monomer synthesis.
    // Rate scaled by available feedstocks (H2, CO2, NH3), thermal window and energy.
    var tWindow = env.temperatureK >= 273 && env.temperatureK <= 400 ? 1
      : (env.temperatureK > 400 ? 0.2 : 0.35); // superheated feedstocks degrade
    var feed = Math.min(ch.H2, ch.CO2, Math.max(ch.NH3, 0.01));
    var r1 = 0.9 * feed * der.energyScore * tWindow * dtDays;
    if (env.uvIndex > 7) { r1 *= 0.4; notes.push('Surface UV index ' + env.uvIndex + ' photodestroys monomers (rate x0.6)'); }
    r1 = Math.min(r1, ch.H2, ch.CO2);
    d.H2 -= r1; d.CO2 -= r1; d.NH3 -= Math.min(ch.NH3, r1 * 0.5);
    d.monomers += r1;
    if (r1 > 0.001) notes.push('R1 abiotic monomer synthesis consumed ' + round(r1, 3) + ' mM feedstock');

    // R2 (speculative): polymerization monomers -> RNA-like chains (clay / wet-dry cycling).
    var polyRate = 0.05 * ch.monomers * (env.waterActivity > 0.6 && env.waterActivity < 1.0 ? 1.2 : 0.6) *
      (env.pH > 6 && env.pH < 10 ? 1 : 0.4) * dtDays;
    polyRate = Math.min(polyRate, ch.monomers);
    d.monomers -= polyRate; d.polymers += polyRate;
    if (polyRate > 0.001) notes.push('R2 polymerization formed ' + round(polyRate, 4) + ' mM RNA-like units (speculative)');

    // R3 (speculative): lipid amphiphile availability -> vesicle precursor pool.
    // Energy + reduced species drive fatty-acid-like amphiphile synthesis.
    var lipidRate = 0.04 * (ch.H2 + ch.CH4) * der.energyScore * dtDays;
    lipidRate = Math.min(lipidRate, Math.max(0, ch.H2 + ch.CH4));
    d.lipids += lipidRate;
    if (lipidRate > 0.001) notes.push('R3 amphiphile synthesis: ' + round(lipidRate, 4) + ' mM (speculative)');

    // R4 (established process, speculative alien context): redox energy release
    // H2 + SO4 -> H2S + H2O (sulfate reduction) or Fe3+ reduction proxy via redox potential.
    if (env.redoxPotentialMv > 100 && ch.H2 > 0 && ch.SO4 > 0) {
      var r4 = Math.min(ch.H2, ch.SO4) * 0.15 * dtDays;
      d.H2 -= r4; d.SO4 -= r4; d.H2S += r4;
      if (r4 > 0.001) notes.push('R4 redox gradient released ' + round(r4, 4) + ' mM chemical energy');
    }

    // R5 (established): radiolytic / thermal H2O breakdown replenishes H2 + O2 (trace).
    if (env.radiationDoseGyPerSol > 0.5 || env.energySourceType === 'radiolytic') {
      var r5 = 0.01 * dtDays * (1 + env.radiationDoseGyPerSol);
      d.H2 += r5 * 0.7; d.O2 += r5 * 0.3;
      if (r5 > 0.001) notes.push('R5 radiolysis produced ' + round(r5, 4) + ' mM H2/O2 (established chemistry)');
    }

    // Degradation of polymers under lethality (thermal/radiative)
    if (der.lethality > 0.4 && ch.polymers > 0) {
      var deg = ch.polymers * der.lethality * 0.2 * dtDays;
      d.polymers -= deg;
      notes.push('Polymers degraded at rate ' + round(deg, 4) + ' mM (high lethality)');
    }

    // Apply
    var out = {};
    Object.keys(ch).forEach(function (k) {
      out[k] = Math.max(0, ch[k] + (d[k] || 0));
    });
    // Energy pool recharge (photochemical/hydrothermal), capped at 100
    out.energyPool = clamp(ch.energyPool + der.energyScore * 10 * dtDays - (Math.abs(d.monomers) + Math.abs(d.lipids)) * 0.5, 0, 100);

    return { chemistry: out, delta: d, notes: notes };
  }

  /* ==========================================================================
   * PROTOCELL POPULATION (vesicles + template replication)
   * ========================================================================== */
  function initialProtocells() {
    return { count: 0, meanFitness: 0.5, templateFidelity: 0.7 };
  }

  function stepProtocells(pop, ch, env, der, options, dtDays, rng) {
    var notes = [];
    var growth = 0;
    var capacity = options.carryingCapacity;

    if (pop.count > 0) {
      // Resource limitation (lipid + monomer availability)
      var resourceFactor = clamp((ch.lipids + ch.monomers) / 10, 0, 1);
      // Abiotic lethality directly kills vesicles
      var deathRate = der.lethality * 0.8;
      // Optimal vesicle assembly window (speculative): 275-340 K, aw > 0.6, pH 5-10
      var assemblyWindow = (env.temperatureK >= 275 && env.temperatureK <= 340 &&
        env.waterActivity > 0.6 && env.pH >= 5 && env.pH <= 10) ? 1 : 0.25;

      var perCapita = (0.9 * resourceFactor * assemblyWindow * pop.meanFitness *
        (1 - pop.count / Math.max(1, capacity))) - deathRate - 0.05;
      // Allee effect: below minimum viable count growth collapses
      if (pop.count < options.alleeThreshold) perCapita -= 0.3;

      growth = pop.count * perCapita * dtDays;
      pop.count = Math.max(0, pop.count + growth);
      if (pop.count === 0 && growth <= 0) notes.push('Protocell population collapsed (Allee threshold / lethality)');
    }

    // Spontaneous vesicle assembly ONLY when explicitly enabled AND chemistry rich.
    // Default policy: disabled — favorable conditions do NOT create life automatically.
    if (pop.count === 0 && options.allowAbiogenesisVesicles && ch.lipids > 5 &&
        der.permissive > 0.6 && rng() < 0.02 * dtDays) {
      pop.count = 1;
      notes.push('Abiogenesis event: a protocell nucleated from the lipid pool (SPECULATIVE, explicitly enabled)');
    }

    return { pop: pop, growth: growth, notes: notes };
  }

  /* ==========================================================================
   * MICROBIAL POPULATIONS (metabolisms, genetics, selection)
   * genome: 8-bit integer; loci = [energy, co2fix, stress, motility] (2 bits each)
   * ========================================================================== */
  var METABOLISMS = {
    chemolithotrophy: { tier: 'speculative', label: 'ChemoLithoAutotroph (H2/Fe/S redox)' },
    photoautotrophy:  { tier: 'speculative', label: 'PhotoAutoTroph (light + CO2)' },
    methanotrophy:    { tier: 'speculative', label: 'Methanotroph (CH4 consumption)' },
    heterotrophy:     { tier: 'simplified',  label: 'Heterotroph (organic carbon)' }
  };

  function decodeGenome(genome) {
    return {
      energy: (genome >> 6) & 3,    // 0..3
      co2fix: (genome >> 4) & 3,
      stress: (genome >> 2) & 3,
      motility: genome & 3
    };
  }

  function encodeGenome(g) {
    return ((g.energy & 3) << 6) | ((g.co2fix & 3) << 4) | ((g.stress & 3) << 2) | (g.motility & 3);
  }

  /**
   * Initial microbial population. Starts EMPTY unless inoculum supplied.
   * inoculum: {count, genome, metabolism}
   */
  function initialMicrobes() {
    return {
      count: 0,
      genome: 0,            // founder allele (only meaningful after inoculation)
      metabolism: 'chemolithotrophy',
      alleleFreq: { E0: 1, E1: 0, E2: 0, E3: 0 },  // energy-locus adaptation tracking
      generations: 0,
      inoculated: false
    };
  }

  /**
   * EXPLICIT INOCULATION — the ONLY way life enters the simulation.
   * Returns a result object; does not run if population already exists.
   */
  function inoculate(microbes, spec) {
    spec = spec || {};
    if (microbes.inoculated && microbes.count > 0) {
      return { ok: false, reason: 'already_inoculated', count: microbes.count };
    }
    microbes.count = spec.count || 100;
    microbes.genome = spec.genome !== undefined ? (spec.genome & 0xFF) : encodeGenome({ energy: 2, co2fix: 2, stress: 1, motility: 0 });
    microbes.metabolism = METABOLISMS[spec.metabolism] ? spec.metabolism : 'chemolithotrophy';
    microbes.inoculated = true;
    microbes.generations = 0;
    var locus = decodeGenome(microbes.genome).energy;
    microbes.alleleFreq = { E0: 0, E1: 0, E2: 0, E3: 0 };
    microbes.alleleFreq['E' + locus] = 1;
    return { ok: true, count: microbes.count, genome: microbes.genome, metabolism: microbes.metabolism };
  }

  /**
   * Fitness of a genome in a given environment (0.1 .. 1.5).
   * Established parts: thermal/salinity stress locus match.
   * Speculative parts: metabolism <-> available energy/substrate match.
   */
  function fitnessOf(genome, metabolism, env, der, ch) {
    var g = decodeGenome(genome);
    var f = 0.5;

    // Stress locus: 2 bits track thermal optimum in bands
    var optimalStress = env.temperatureK > 350 ? 3 : env.temperatureK > 320 ? 2 : env.temperatureK > 273 ? 1 : 0;
    f += 0.18 * (1 - Math.abs(g.stress - optimalStress) / 3);

    // Energy-locus match with environment energy source
    var neededEnergy = { hydrothermal: 3, radiolytic: 2, redox: 3, photochemical: 1, none: 0 }[env.energySourceType] || 0;
    f += 0.15 * (1 - Math.abs(g.energy - neededEnergy) / 3);

    // Metabolism substrate availability (speculative coupling)
    var substrate = 0;
    if (metabolism === 'chemolithotrophy') substrate = clamp((ch.H2 + ch.H2S + ch.Fe2) / 20, 0, 1);
    else if (metabolism === 'photoautotrophy') substrate = clamp(ch.CO2 / 20, 0, 1) * (env.uvIndex >= 0 && der.energyScore > 0.4 ? 1 : 0.3);
    else if (metabolism === 'methanotrophy') substrate = clamp(ch.CH4 / 20, 0, 1);
    else substrate = clamp(ch.monomers / 20, 0, 1);
    f += 0.2 * substrate;

    // pH & salinity penalties (established physiology, simplified)
    if (env.pH < 4 || env.pH > 11) f -= 0.2;
    if (env.salinityPct > 10) f -= 0.1;

    return clamp(f, 0.1, 1.5);
  }

  /**
   * One microbial growth step.
   * options: {carryingCapacity, mutationRate, alleeThreshold, predation}
   */
  function stepMicrobes(mb, ch, env, der, options, dtDays, rng) {
    var notes = [];
    var events = { mutations: 0, deaths: 0, births: 0 };
    if (!mb.inoculated || mb.count <= 0) {
      mb.count = 0;
      return { pop: mb, growth: 0, notes: ['Population sterile — no inoculation performed'], events: events };
    }

    var fit = fitnessOf(mb.genome, mb.metabolism, env, der, ch);
    mb.meanFitness = fit;

    var deathRate = der.lethality * 1.2 + 0.03;
    var perCapita = fit * 0.6 * (1 - mb.count / Math.max(1, options.carryingCapacity)) - deathRate;
    if (mb.count < options.alleeThreshold) perCapita -= 0.35;

    // --- Ecological relationships (speculative coefficients) ---
    // Competition for shared substrate reduces growth (intraspecific = logistic term)
    // Predation pressure (if enabled): top-down control
    if (options.predation && options.predation.pressure > 0) {
      perCapita -= options.predation.pressure * 0.3;
      notes.push('Predation pressure applied: -' + round(options.predation.pressure * 0.3, 3) + '/day (speculative)');
    }
    // Cross-feeding: protocell vesicle lysis releases lipids that feed heterotrophs
    if (mb.metabolism === 'heterotrophy' && ch.lipids > 3) {
      perCapita += 0.1;
      notes.push('Commensal cross-feeding from vesicle lipid pool (+0.10/day, speculative)');
    }
    // Amensalism: phototroph oxygen byproduct inhibits strict anaerobes
    if (mb.metabolism === 'chemolithotrophy' && ch.O2 > 1 && env.pH > 0) {
      perCapita -= 0.05;
      notes.push('Amensal inhibition: accumulated O2 is toxic to this anaerobe (-0.05/day)');
    }

    var growth = mb.count * perCapita * dtDays;
    var newCount = Math.max(0, mb.count + growth);
    events.births = Math.max(0, growth);
    events.deaths = Math.max(0, -growth);

    // --- Mutation at replication (established mechanism, simplified digital genome) ---
    // Only BIRTHS replicate: declining population contributes no mutations.
    var replications = Math.max(0, growth);
    var expectedMutations = replications * options.mutationRate * 4; // 4 loci
    // Stochastic rounding keeps determinism with the seeded rng
    var mutCount = Math.floor(expectedMutations) + (rng() < (expectedMutations % 1) ? 1 : 0);
    for (var i = 0; i < mutCount; i++) {
      var bit = Math.floor(rng() * 8);
      mb.genome = (mb.genome ^ (1 << bit)) & 0xFF;
      events.mutations++;
    }
    if (mutCount > 0) notes.push(mutCount + ' mutation event(s) at rate ' + options.mutationRate + '/replication');

    // --- Natural selection: fixation of beneficial alleles (simplified) ---
    // The single-genome model cannot track individual variants, so selection is
    // modelled as probabilistic fixation of the environment-optimal allele at
    // each adaptive locus. Probability scales with the fitness differential
    // (selection gradient) and still requires mutation supply: with
    // mutationRate = 0 there is no new variation, hence no adaptation.
    // Model tier: 'simplified' (see MODELS.logistic_selection / environment_adaptation).
    if (options.mutationRate > 0 && mb.count > 0) {
      var gSel = decodeGenome(mb.genome);
      var optStressL = env.temperatureK > 350 ? 3 : env.temperatureK > 320 ? 2 : env.temperatureK > 273 ? 1 : 0;
      var optEnergyL = ({ hydrothermal: 3, radiolytic: 2, redox: 3, photochemical: 1, none: 0 })[env.energySourceType] || 0;
      var fixLoci = [];
      if (gSel.stress !== optStressL) fixLoci.push(['stress', optStressL]);
      if (gSel.energy !== optEnergyL) fixLoci.push(['energy', optEnergyL]);
      if (fixLoci.length) {
        var fitGap = Math.max(0, (1.5 - fit) / 1.4);
        var fixP = Math.min(0.5, fitGap * options.mutationRate * 5 * dtDays);
        if (rng() < fixP) {
          var pick = fixLoci[Math.floor(rng() * fixLoci.length)];
          gSel[pick[0]] = pick[1];
          mb.genome = encodeGenome(gSel);
          notes.push('Selection fixed beneficial allele: ' + pick[0] + ' -> ' + pick[1] + ' (simplified selection gradient)');
        }
      }
    }

    // Extinction
    if (newCount < 1) {
      if (mb.count > 0) notes.push('EXTINCTION: population fell below viable limit (abiotic lethality + Allee threshold)');
      newCount = 0;
    }
    mb.count = newCount;
    mb.generations += replications / Math.max(1, mb.count + replications);

    // --- Allele frequency tracking (long-term adaptation signal) ---
    var locus = decodeGenome(mb.genome).energy;
    var drift = 0.02 * dtDays;
    ['E0', 'E1', 'E2', 'E3'].forEach(function (k) {
      mb.alleleFreq[k] = Math.max(0, mb.alleleFreq[k] - (k === 'E' + locus ? -drift * 0 : drift * 0.5));
    });
    var target = 'E' + locus;
    mb.alleleFreq[target] = clamp(mb.alleleFreq[target] + drift, 0, 1);
    var sum = 0;
    ['E0', 'E1', 'E2', 'E3'].forEach(function (k) { sum += mb.alleleFreq[k]; });
    ['E0', 'E1', 'E2', 'E3'].forEach(function (k) { mb.alleleFreq[k] = round(mb.alleleFreq[k] / (sum || 1), 4); });

    return { pop: mb, growth: growth, notes: notes, events: events };
  }

  /* ==========================================================================
   * MAIN ENGINE CLASS
   * ========================================================================== */
  function defaultOptions() {
    return {
      carryingCapacity: 1000,
      mutationRate: 0.005,        // per replication per locus
      alleeThreshold: 10,
      allowAbiogenesisVesicles: false,   // KEY GUARDRAIL: default OFF
      predation: null,                   // {pressure: 0..1} or null
      dtDays: 0.5                          // simulated days per step
    };
  }

  function LifeSimulationCore(config) {
    config = config || {};
    this.seed = config.seed !== undefined ? config.seed : 42;
    this.env = config.env;
    if (!this.env) throw new Error('[LifeSimulationCore] config.env is required (use createEnvironment())');
    this.options = Object.assign(defaultOptions(), config.options || {});
    this.reset();
  }

  /** Reset to sterile initial state, keeping seed + env + options (repeatable). */
  LifeSimulationCore.prototype.reset = function () {
    this.day = 0;
    this.stepCount = 0;
    this.chemistry = initialChemistry(this.env);
    this.protocells = initialProtocells();
    this.microbes = initialMicrobes();
    this.history = [];
    this.events = [];
    this.rng = createRng(this.seed);
    this.derived = evaluateEnvironment(this.env);
    this._record('initialized', 'Simulation initialized in STERILE state (no life auto-created)');
    return this;
  };

  LifeSimulationCore.prototype._record = function (type, message) {
    this.events.push({ step: this.stepCount, day: round(this.day, 2), type: type, message: message });
    if (this.events.length > 500) this.events.shift();
  };

  /**
   * Advance the simulation by n steps.
   * Returns the snapshot after advancing.
   */
  LifeSimulationCore.prototype.step = function (n) {
    n = n || 1;
    for (var i = 0; i < n; i++) this._stepOnce();
    return this.getSnapshot();
  };

  LifeSimulationCore.prototype._stepOnce = function () {
    var dt = this.options.dtDays;
    this.stepCount++;
    this.day += dt;
    this.derived = evaluateEnvironment(this.env);

    // 1) Chemistry
    var chemRes = stepChemistry(this.chemistry, this.env, this.derived, dt, this.rng);
    this.chemistry = chemRes.chemistry;
    var allNotes = chemRes.notes.slice();

    // 2) Protocells
    var proRes = stepProtocells(this.protocells, this.chemistry, this.env, this.derived, this.options, dt, this.rng);
    this.protocells = proRes.pop;
    allNotes = allNotes.concat(proRes.notes);

    // 3) Microbes
    var micRes = stepMicrobes(this.microbes, this.chemistry, this.env, this.derived, this.options, dt, this.rng);
    this.microbes = micRes.pop;
    allNotes = allNotes.concat(micRes.notes);
    if (micRes.events && micRes.events.mutations > 0) {
      this._record('mutation', micRes.events.mutations + ' mutation event(s) at day ' + round(this.day, 1));
    }

    // Extinction event logging (once)
    if (this.microbes.count === 0 && this.microbes.inoculated && this._lastAlive) {
      this._record('extinction', 'Microbial population went EXTINCT at day ' + round(this.day, 1));
    }
    this._lastAlive = this.microbes.count > 0;

    // History for graphs (trimmed)
    this.history.push({
      day: round(this.day, 2),
      microbes: Math.round(this.microbes.count),
      protocells: Math.round(this.protocells.count),
      monomers: round(this.chemistry.monomers, 3),
      polymers: round(this.chemistry.polymers, 3),
      lipids: round(this.chemistry.lipids, 3),
      o2: round(this.chemistry.O2, 3),
      h2: round(this.chemistry.H2, 3),
      ch4: round(this.chemistry.CH4, 3),
      pH: this.env.pH,
      temperatureK: this.env.temperatureK
    });
    if (this.history.length > 2000) this.history.shift();

    return allNotes;
  };

  /** Run to completion without UI; used by tests and batch experiments. */
  LifeSimulationCore.prototype.run = function (totalSteps) {
    this.step(totalSteps);
    return this.getSummary();
  };

  /**
   * Explicit inoculation entry point. Accepts:
   *   {count, genome, metabolism}
   */
  LifeSimulationCore.prototype.inoculate = function (spec) {
    var res = inoculate(this.microbes, spec);
    if (res.ok) this._record('inoculation', 'EXPLICIT inoculation: ' + res.count + ' founding cells (' + res.metabolism + ')');
    else this._record('inoculation_blocked', 'Inoculation refused: ' + res.reason);
    return res;
  };

  /** Change environment parameters at runtime (e.g. Deep Space sensor feed). */
  LifeSimulationCore.prototype.setEnvironment = function (patch) {
    if (!patch) return this.env;
    Object.assign(this.env, patch);
    this.derived = evaluateEnvironment(this.env);
    this._record('environment', 'Environment parameters updated: ' + Object.keys(patch).join(', '));
    return this.env;
  };

  /** Full serializable snapshot (for Deep Space V7 integration). */
  LifeSimulationCore.prototype.getSnapshot = function () {
    return {
      day: round(this.day, 2),
      step: this.stepCount,
      seed: this.seed,
      sterile: !this.microbes.inoculated,
      environment: {
        id: this.env.id, name: this.env.name, temperatureK: this.env.temperatureK,
        pressureBar: this.env.pressureBar, pH: this.env.pH, salinityPct: this.env.salinityPct
      },
      derived: this.derived,
      chemistry: {
        monomers: round(this.chemistry.monomers, 4),
        polymers: round(this.chemistry.polymers, 4),
        lipids: round(this.chemistry.lipids, 4),
        H2: round(this.chemistry.H2, 4),
        CO2: round(this.chemistry.CO2, 4),
        CH4: round(this.chemistry.CH4, 4),
        O2: round(this.chemistry.O2, 4),
        energyPool: round(this.chemistry.energyPool, 2)
      },
      protocells: {
        count: Math.round(this.protocells.count),
        meanFitness: round(this.protocells.meanFitness, 3)
      },
      microbes: {
        count: Math.round(this.microbes.count),
        inoculated: this.microbes.inoculated,
        metabolism: this.microbes.metabolism,
        genome: this.microbes.genome,
        genomeBits: decodeGenome(this.microbes.genome),
        meanFitness: round(this.microbes.meanFitness || 0, 3),
        alleleFreq: this.microbes.alleleFreq,
        generations: round(this.microbes.generations, 2)
      },
      status: this._classifyStatus(),
      lastNotes: this.history.length ? this.history[this.history.length - 1] : null
    };
  };

  LifeSimulationCore.prototype._classifyStatus = function () {
    var d = this.derived;
    if (this.microbes.count > 0) return 'biosphere_active';
    if (this.protocells.count > 0) return 'protocells_present';
    if (d.permissive > 0.5 && !this.microbes.inoculated) return 'habitable_sterile';
    return this.microbes.inoculated && this.microbes.count === 0 ? 'extinct' : 'abiotic';
  };

  /** Compact summary for reports / comparisons. */
  LifeSimulationCore.prototype.getSummary = function () {
    var snap = this.getSnapshot();
    var peak = 0;
    this.history.forEach(function (h) { if (h.microbes > peak) peak = h.microbes; });
    return {
      seed: this.seed,
      envId: this.env.id,
      day: snap.day,
      status: snap.status,
      sterile: snap.sterile,
      finalPopulation: snap.microbes.count,
      peakPopulation: peak,
      extinction: snap.microbes.count === 0 && this.microbes.inoculated,
      permissibility: snap.derived.permissive,
      lethality: snap.derived.lethality,
      liquidWater: snap.derived.liquidWater,
      generations: snap.microbes.generations,
      alleleFreq: snap.microbes.alleleFreq
    };
  };

  /** Save full state (JSON-serializable) for save/load. */
  LifeSimulationCore.prototype.saveState = function () {
    return {
      version: 'life-genesis-v2',
      seed: this.seed,
      env: this.env,
      options: this.options,
      day: this.day,
      stepCount: this.stepCount,
      chemistry: this.chemistry,
      protocells: this.protocells,
      microbes: this.microbes,
      history: this.history,
      events: this.events,
      lastAlive: !!this._lastAlive
    };
  };

  /** Restore a saved state (must be same env id). */
  LifeSimulationCore.prototype.loadState = function (state) {
    if (!state || state.version !== 'life-genesis-v2') {
      throw new Error('[LifeSimulationCore] incompatible save state');
    }
    if (state.env.id !== this.env.id) {
      throw new Error('[LifeSimulationCore] save state env mismatch: ' + state.env.id + ' != ' + this.env.id);
    }
    this.seed = state.seed;
    this.env = state.env;
    this.options = Object.assign(defaultOptions(), state.options || {});
    this.day = state.day;
    this.stepCount = state.stepCount;
    this.chemistry = state.chemistry;
    this.protocells = state.protocells;
    this.microbes = state.microbes;
    this.history = state.history || [];
    this.events = state.events || [];
    this._lastAlive = state.lastAlive;
    this.derived = evaluateEnvironment(this.env);
    // Re-seed PRNG so subsequent steps continue deterministically from a fresh seed
    this.rng = createRng(this.seed + state.stepCount);
    return this;
  };

  // ---- Static helpers exposed for integration ----
  LifeSimulationCore.createRng = createRng;
  LifeSimulationCore.evaluateEnvironment = evaluateEnvironment;
  LifeSimulationCore.createEnvironment = createEnvironment;
  LifeSimulationCore.MODELS = MODELS;
  LifeSimulationCore.METABOLISMS = METABOLISMS;
  LifeSimulationCore.decodeGenome = decodeGenome;
  LifeSimulationCore.encodeGenome = encodeGenome;
  LifeSimulationCore.fitnessOf = fitnessOf;
  LifeSimulationCore.KELVIN = KELVIN;
  LifeSimulationCore.R_GAS = R_GAS;

  return LifeSimulationCore;
}));
