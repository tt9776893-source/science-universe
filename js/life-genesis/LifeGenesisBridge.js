/**
 * SCIENCE UNIVERSE — LIFE GENESIS ENGINE V2
 * File: js/life-genesis/LifeGenesisBridge.js
 *
 * PUBLIC INTEGRATION API for Deep Space V7 (Antigravity workstream).
 *
 * This is the ONLY surface other systems should use. It is a thin, dependency-free
 * facade over LifeSimulationCore: Deep Space sends what it measured/collected,
 * the bridge translates it into a run, and returns state + measurements +
 * hypothetical outcomes + a report. No Deep Space file needs to change beyond
 * calling this API, and this workstream never edits Deep Space files.
 *
 * REQUEST SHAPE (all fields optional except planetId):
 * {
 *   planetId: 'mars' | 'europa' | 'titan' | 'enceladus' | 'venus' | 'earth' | 'moon' | ...,
 *   environment: {                 // live sensor measurements from Deep Space (partial)
 *     temperatureK, pressureBar, pH, salinityPct, waterActivity,
 *     uvIndex, radiationDoseGyPerSol, redoxPotentialMv, energySourceType
 *   },
 *   materials: {                   // collected sample composition (partial)
 *     // concentration in mM if known; aliases accepted (see _normalizeMaterials)
 *     Fe2, H2S, H2, CO2, NH3, PO4, SO4, CH4, organicsPpm, water: {available: bool}
 *   },
 *   equipment: [                   // research equipment capabilities (ids)
 *     'incubator' | 'radiation_shield' | 'ph_controller' | 'nutrient_feeder' |
 *     'mass_spectrometer' | 'microscope' | 'uv_sterilizer' | 'pressure_chamber'
 *   ],
 *   params: {                      // experimental parameters
 *     seed, steps, dtDays, carryingCapacity, mutationRate, alleeThreshold,
 *     allowAbiogenesisVesicles, predation: {pressure},
 *     inoculation: {count, metabolism, genome}   // OPTIONAL — omit => sterile run
 *   }
 * }
 *
 * RESPONSE SHAPE:
 * {
 *   ok, planetId, mappedFrom,
 *   state,            // full LifeSimulationCore.getSnapshot()
 *   measurements,     // derived scientific quantities (permissibility, chemistry…)
 *   outcomes,         // hypothetical biological outcomes (always tagged speculative)
 *   report,           // plain-text scientific report
 *   equipmentEffects, // what the supplied equipment changed
 *   warnings[]        // e.g. unmapped planet, missing liquid water
 * }
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./LifeSimulationCore', './LifeGenesisEnvironments'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./LifeSimulationCore'), require('./LifeGenesisEnvironments'));
  } else {
    root.LifeGenesisBridge = factory(root.LifeSimulationCore, root.LifeGenesisEnvironments);
  }
}(typeof self !== 'undefined' ? self : this, function (LifeSimulationCore, Environments) {
  'use strict';

  /* Planet id mapping: Deep Space keys -> environment presets.
   * Unknown ids fall back to mars with a warning (never silently). */
  var PLANET_MAP = {
    mars: 'mars',
    europa: 'europa',
    titan: 'titan',
    enceladus: 'enceladus',
    venus: 'venus_cloud',
    earth: 'earth_reference',
    moon: 'mars',          // airless silicate: closest preset is cold desert
    mercury: 'mars',
    titan_surface: 'titan'
  };

  /* Equipment capability model: each entry declares what it changes.
   * Values are applied BEFORE the run and reported back to the caller. */
  var EQUIPMENT = {
    incubator: {
      label: 'Incubator (temperature stabilisation)',
      apply: function (env) { env.temperatureK = Math.min(340, Math.max(275, env.temperatureK)); },
      note: 'Holds the sample near 275-340 K window.'
    },
    radiation_shield: {
      label: 'Radiation shield',
      apply: function (env) { env.radiationDoseGyPerSol = env.radiationDoseGyPerSol * 0.05; },
      note: 'Reduces radiation dose by 95%.'
    },
    ph_controller: {
      label: 'pH buffer/controller',
      apply: function (env) { env.pH = Math.min(9.5, Math.max(5.5, env.pH)); },
      note: 'Buffers pH into 5.5-9.5, the range compatible with known biochemistry.'
    },
    nutrient_feeder: {
      label: 'Nutrient feeder (prebiotic feedstock)',
      apply: null,   // handled via materials boost below
      note: 'Adds 5 mM each of H2, CO2, NH3 and 10 mM monomer precursors.'
    },
    mass_spectrometer: {
      label: 'Mass spectrometer',
      apply: null,
      note: 'Measurement precision only — increases reported significant digits.'
    },
    microscope: {
      label: 'Microscope',
      apply: null,
      note: 'Allows direct observation of protocells/cells (measurement only).'
    },
    uv_sterilizer: {
      label: 'UV sterilizer',
      apply: function (env) { env.uvIndex = 11; },
      note: 'Deliberate sterilisation control — used for negative-control runs.'
    },
    pressure_chamber: {
      label: 'Pressure chamber',
      apply: function (env) { if (env.pressureBar < 0.01) env.pressureBar = 1.0; },
      note: 'Raises vacuum samples to 1 bar where the phase diagram allows liquid water.'
    }
  };

  /* Accept human/Deep-Space material aliases -> core mM names. */
  var MATERIAL_ALIASES = {
    iron: 'Fe2', fe: 'Fe2', ferrous: 'Fe2',
    h2s: 'H2S', hydrogen_sulfide: 'H2S',
    h2: 'H2', hydrogen: 'H2',
    co2: 'CO2', carbon_dioxide: 'CO2',
    nh3: 'NH3', ammonia: 'NH3',
    po4: 'PO4', phosphate: 'PO4',
    sulfate: 'SO4', so4: 'SO4',
    methane: 'CH4', ch4: 'CH4',
    oxygen: 'O2', o2: 'O2'
  };

  function normalizeMaterials(materials, warnings) {
    var out = {};
    if (!materials || typeof materials !== 'object') return out;
    Object.keys(materials).forEach(function (k) {
      var key = MATERIAL_ALIASES[k.toLowerCase()] || k;
      var v = materials[k];
      if (typeof v === 'number' && isFinite(v) && v >= 0) out[key] = v;
      else if (warnings && typeof v === 'number') warnings.push('material "' + k + '" has non-physical value; ignored');
    });
    // organicsPpm (Deep Space spectral reading) -> monomer pool (1 ppm ~ 0.001 mM)
    if (typeof materials.organicsPpm === 'number' && materials.organicsPpm > 0) {
      out.__monomersFromOrganics = materials.organicsPpm * 0.001;
    }
    return out;
  }

  function resolveEnv(planetId, warnings) {
    var presetId = PLANET_MAP[String(planetId || '').toLowerCase()];
    if (!presetId) {
      warnings.push('Unknown planetId "' + planetId + '" — no preset mapping; falling back to mars baseline');
      presetId = 'mars';
    }
    return { presetId: presetId, env: Environments.getPreset(presetId) };
  }

  function applyEquipment(equipment, env, materials) {
    var effects = [];
    if (!Array.isArray(equipment)) return effects;
    equipment.forEach(function (id) {
      var spec = EQUIPMENT[id];
      if (!spec) { effects.push({ id: id, applied: false, note: 'unknown equipment id' }); return; }
      if (spec.apply) spec.apply(env);
      if (id === 'nutrient_feeder') {
        materials.H2 = (materials.H2 || 0) + 5;
        materials.CO2 = (materials.CO2 || 0) + 5;
        materials.NH3 = (materials.NH3 || 0) + 5;
        materials.__monomersFromOrganics = (materials.__monomersFromOrganics || 0) + 10;
      }
      effects.push({ id: id, applied: true, note: spec.note });
    });
    return effects;
  }

  var VALID_METABOLISMS = ['chemolithotrophy', 'photoautotrophy', 'methanotrophy', 'heterotrophy'];

  var LifeGenesisBridge = {

    /* ---- introspection ---- */
    version: '2.0.0',
    listPlanets: function () { return Object.keys(PLANET_MAP); },
    listEquipment: function () {
      return Object.keys(EQUIPMENT).map(function (k) {
        return { id: k, label: EQUIPMENT[k].label, note: EQUIPMENT[k].note };
      });
    },
    listMetabolisms: function () { return VALID_METABOLISMS.slice(); },
    listModels: function () { return LifeSimulationCore.MODELS; },

    /**
     * Main entry: run an experiment defined by Deep Space measurements.
     * Synchronous; `params.steps` bounded to 5000 to protect the main thread.
     */
    runExperiment: function (request) {
      request = request || {};
      var warnings = [];

      /* 1. Resolve environment from planet id */
      var resolved = resolveEnv(request.planetId, warnings);
      var env = resolved.env;

      /* 2. Overlay live sensor measurements (Deep Space is authoritative for
       *    whatever it actually measured; unset fields keep preset values). */
      var sensor = request.environment || {};
      ['temperatureK', 'pressureBar', 'pH', 'salinityPct', 'waterActivity',
       'uvIndex', 'radiationDoseGyPerSol', 'redoxPotentialMv'].forEach(function (k) {
        if (typeof sensor[k] === 'number' && isFinite(sensor[k])) env[k] = sensor[k];
      });
      if (typeof sensor.energySourceType === 'string') env.energySourceType = sensor.energySourceType;

      /* 3. Materials -> chemistry seed */
      var materials = normalizeMaterials(request.materials, warnings);

      /* 4. Equipment effects */
      var equipmentEffects = applyEquipment(request.equipment, env, materials);

      /* 5. Experimental parameters */
      var p = request.params || {};
      var options = {
        dtDays: typeof p.dtDays === 'number' && p.dtDays > 0 ? p.dtDays : 0.5,
        carryingCapacity: typeof p.carryingCapacity === 'number' && p.carryingCapacity > 0 ? p.carryingCapacity : 1000,
        mutationRate: typeof p.mutationRate === 'number' ? Math.min(0.2, Math.max(0, p.mutationRate)) : 0.005,
        alleeThreshold: typeof p.alleeThreshold === 'number' ? p.alleeThreshold : 10,
        allowAbiogenesisVesicles: p.allowAbiogenesisVesicles === true,
        predation: p.predation && typeof p.predation.pressure === 'number' ? { pressure: p.predation.pressure } : null
      };
      if (options.allowAbiogenesisVesicles) {
        warnings.push('allowAbiogenesisVesicles=true: vesicle nucleation is SPECULATIVE and explicitly enabled by the caller.');
      }

      var seed = typeof p.seed === 'number' ? p.seed : 42;
      var steps = Math.min(5000, Math.max(1, typeof p.steps === 'number' ? p.steps : 400));

      var core = new LifeSimulationCore({ env: env, seed: seed, options: options });

      /* 6. Seed chemistry from collected materials */
      var ch = core.chemistry;
      ['Fe2', 'H2S', 'H2', 'CO2', 'NH3', 'PO4', 'SO4', 'CH4'].forEach(function (k) {
        if (materials[k]) ch[k] = materials[k];
      });
      if (materials.__monomersFromOrganics) ch.monomers += materials.__monomersFromOrganics;
      core._record('materials', 'Sample composition imported from collector: ' +
        Object.keys(materials).filter(function (k) { return k.indexOf('__') !== 0; }).join(', ') || 'none');

      /* 7. Protocol: warm-up → optional inoculation → main run */
      var warmup = Math.min(40, Math.floor(steps * 0.1));
      core.step(warmup);

      var inoculation = p.inoculation || null;
      var inocResult = null;
      if (inoculation) {
        var meta = VALID_METABOLISMS.indexOf(inoculation.metabolism) >= 0 ? inoculation.metabolism : 'chemolithotrophy';
        if (inoculation.metabolism && meta !== inoculation.metabolism) {
          warnings.push('Unknown metabolism "' + inoculation.metabolism + '" — using ' + meta);
        }
        inocResult = core.inoculate({
          count: typeof inoculation.count === 'number' ? inoculation.count : 100,
          metabolism: meta,
          genome: inoculation.genome
        });
      }

      core.step(steps - warmup);

      /* 8. Assemble response */
      var state = core.getSnapshot();
      var summary = core.getSummary();

      var measurements = {
        waterPhase: state.derived.waterPhase,
        liquidWater: state.derived.liquidWater,
        permissibility: state.derived.permissive,
        abioticLethality: state.derived.lethality,
        thermalHabitabilityIndex: state.derived.thi,
        hConcentrationM: state.derived.hConcentrationM,
        energyScore: state.derived.energyScore,
        chemistry: state.chemistry,
        peakPopulation: summary.peakPopulation,
        finalPopulation: summary.finalPopulation,
        generations: summary.generations
      };

      var outcomes = {
        tagged: 'SPECULATIVE',
        sterile: state.sterile,
        status: state.status,
        inoculation: inocResult,
        extinct: summary.extinction,
        adapted: state.microbes.alleleFreq,
        hypothesis: LifeGenesisBridge._hypothesis(state, summary),
        caveat: 'Hypothetical biological outcomes are model predictions under simplified assumptions, NOT evidence of real extraterrestrial life.'
      };

      if (!state.derived.liquidWater && !env.nonAqueousSolvent) {
        warnings.push('No liquid water under current measurements — water-based biochemistry is not physically possible here.');
      }

      return {
        ok: true,
        planetId: request.planetId || null,
        mappedFrom: resolved.presetId,
        state: state,
        measurements: measurements,
        outcomes: outcomes,
        equipmentEffects: equipmentEffects,
        report: LifeGenesisBridge._buildReport(env, state, summary, equipmentEffects, warnings),
        warnings: warnings
      };
    },

    /**
     * Lightweight query WITHOUT running a simulation — for UI pre-checks
     * ("could life exist here?"). Returns established-science values only.
     */
    assessEnvironment: function (planetId, sensorMeasurements) {
      var warnings = [];
      var resolved = resolveEnv(planetId, warnings);
      var env = resolved.env;
      var sensor = sensorMeasurements || {};
      ['temperatureK', 'pressureBar', 'pH', 'salinityPct', 'waterActivity',
       'uvIndex', 'radiationDoseGyPerSol', 'redoxPotentialMv'].forEach(function (k) {
        if (typeof sensor[k] === 'number' && isFinite(sensor[k])) env[k] = sensor[k];
      });
      var der = LifeSimulationCore.evaluateEnvironment(env);
      return {
        ok: true,
        planetId: planetId || null,
        mappedFrom: resolved.presetId,
        waterPhase: der.waterPhase,
        liquidWater: der.liquidWater,
        permissibility: der.permissive,
        abioticLethality: der.lethality,
        thermalHabitabilityIndex: der.thi,
        nonAqueousSpeculative: der.nonAqueousSpeculative,
        note: 'Permissibility measures physical habitability only. It does not imply life exists or will arise.',
        warnings: warnings
      };
    },

    /* ---- internal helpers ---- */
    _hypothesis: function (state, summary) {
      if (state.sterile) {
        return 'Sterile run: no life introduced. Physical permissibility = ' +
          state.derived.permissive + ' — habitability alone never generates life in this model.';
      }
      if (summary.extinction) {
        return 'Inoculated population went extinct: abiotic lethality (' + state.derived.lethality +
          ') and Allee threshold exceeded the growth rate under these conditions.';
      }
      if (state.microbes.count > summary.peakPopulation * 0.5 && state.microbes.count > 0) {
        return 'Population persisted at ' + state.microbes.count +
          ' cells with mean fitness ' + state.microbes.meanFitness +
          '. Allele drift shows adaptation pressure toward locus E=' + state.microbes.genomeBits.energy + '.';
      }
      return 'Population survived at reduced density (' + state.microbes.count +
        ' cells) — marginal conditions with selection pressure ongoing.';
    },

    _buildReport: function (env, state, summary, equipmentEffects, warnings) {
      var L = [];
      L.push('LIFE GENESIS ENGINE V2 — EXPERIMENT REPORT (auto-generated)');
      L.push('Planet: ' + env.name + ' [' + state.environment.id + '] · seed=' + summary.seed + ' · day=' + summary.day);
      L.push('Equipment: ' + (equipmentEffects.map(function (e) { return e.id + (e.applied ? '(ok)' : '(unknown)'); }).join(', ') || 'none'));
      L.push('--- ESTABLISHED SCIENCE INPUTS ---');
      L.push('T=' + env.temperatureK + 'K P=' + env.pressureBar + 'bar pH=' + env.pH +
        ' aw=' + env.waterActivity + ' salinity=' + env.salinityPct + '%');
      L.push('waterPhase=' + state.derived.waterPhase + ' permissibility=' + state.derived.permissive +
        ' lethality=' + state.derived.lethality);
      L.push('--- SPECULATIVE MODEL OUTPUT ---');
      L.push('status=' + state.status + ' sterile=' + state.sterile +
        ' microbes=' + state.microbes.count + ' peak=' + summary.peakPopulation +
        ' extinct=' + summary.extinction);
      L.push('chemistry: monomers=' + state.chemistry.monomers + ' polymers=' + state.chemistry.polymers +
        ' lipids=' + state.chemistry.lipids + ' mM');
      L.push('--- CAVEATS ---');
      L.push('Origin-of-life and population models are simplified/speculative (see LifeSimulationCore.MODELS).');
      warnings.forEach(function (w) { L.push('WARNING: ' + w); });
      return L.join('\n');
    }
  };

  return LifeGenesisBridge;
}));
