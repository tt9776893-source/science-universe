/**
 * SCIENCE UNIVERSE — LIFE GENESIS ENGINE V2
 * File: js/life-genesis/LifeGenesisEnvironments.js
 *
 * Planet-specific environmental parameter presets for the LifeSimulationCore.
 * Earth is included ONLY as a scientific reference baseline, never as a target.
 *
 * Parameter sources (established observational values):
 *   - Mars:     NASA Mars Fact Sheet (610 Pa, 210 K mean, 95.3% CO2, perchlorate regolith)
 *   - Europa:   Europa surface (100 K, ~1e-12 bar, ~5.4 Sv/yr radiation) + subsurface
 *               ocean (273 K, >1000 bar, alkaline, radiolytic H2 from ice radiolysis)
 *   - Titan:    Titan surface (94 K, 1.47 bar, 95% N2 / 4.9% CH4, methane lakes,
 *               photochemical tholins, cryovolcanic heat)
 *   - Enceladus: Surface (75 K) + plume/ocean (275 K, ~100 bar implied, alkaline
 *               hydrothermal vents, H2/CH4 measured by Cassini INMS)
 *   - Earth:    Reference only (288 K, 1.013 bar, pH 7, 21% O2) — control baseline
 *
 * Each preset is passed to LifeSimulationCore.createEnvironment(id, params).
 * Evidence tags: values are 'established' (observed); modelled interior values
 * (ocean chemistry) are noted 'simplified' where extrapolated.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./LifeSimulationCore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./LifeSimulationCore'));
  } else {
    root.LifeGenesisEnvironments = factory(root.LifeSimulationCore);
  }
}(typeof self !== 'undefined' ? self : this, function (LifeSimulationCore) {
  'use strict';

  if (!LifeSimulationCore) {
    throw new Error('[LifeGenesisEnvironments] LifeSimulationCore must load first');
  }
  var createEnvironment = LifeSimulationCore.createEnvironment;

  /**
   * Preset catalog.
   * `region` distinguishes surface vs subsurface/aquifer sampling sites.
   */
  var PRESETS = {

    /* ------------------------------- MARS -------------------------------- */
    mars: createEnvironment('mars', {
      name: 'Mars — Subsurface Brine Aquifer',
      nameMn: 'Ангараг — Гүнзгий давсархаг усны судал',
      region: 'subsurface',
      temperatureK: 215,             // mean surface ~210 K; equatorial subsurface slightly warmer
      pressureBar: 0.006,            // 610 Pa (NASA fact sheet)
      pH: 8.2,                       // alkaline perchlorate regolith
      salinityPct: 3.5,              // perchlorate + chloride brines
      waterActivity: 0.85,           // brine aw reduced
      uvIndex: 9.5,                  // surface UV (no ozone layer)
      radiationDoseGyPerSol: 0.076,  // ~0.67 mSv/day Curiosity RAD, converted
      redoxPotentialMv: 250,         // oxidizing perchlorates
      energySourceType: 'redox',
      mineralSoup: { Fe2: 8, H2S: 0.5, H2: 0.2, CO2: 12, NH3: 0.05, PO4: 0.01, SO4: 1.5, CH4: 0.002 },
      evidence: 'established',
      notes: 'Noahian liquid water episodes; today only subsurface brines. Surface is dry, cold, UV-sterilized.'
    }),

    /* ------------------------------ EUROPA ------------------------------- */
    europa: createEnvironment('europa', {
      name: 'Europa — Subsurface Ocean (alkaline hydrothermal)',
      nameMn: 'Европа — Гүнзгий далай (шүлтлэг гидротермал)',
      region: 'subsurface_ocean',
      temperatureK: 275,             // ocean near 0°C, not 100 K surface
      pressureBar: 1200,             // ocean floor ~1000+ bar under 15-25 km ice
      pH: 9.0,                       // serpentinization-driven alkaline
      salinityPct: 4.8,              // MgSO4 + NaCl
      waterActivity: 0.98,
      uvIndex: 0,                    // ice crust blocks UV
      radiationDoseGyPerSol: 0.001,  // ocean shielded from Jupiter's belts
      redoxPotentialMv: -200,        // reducing (H2-rich)
      energySourceType: 'hydrothermal',
      mineralSoup: { Fe2: 6, H2S: 3, H2: 2.5, CO2: 4, NH3: 0.4, PO4: 0.05, SO4: 0.8, CH4: 0.05 },
      evidence: 'simplified',
      notes: 'Ocean chemistry extrapolated from Galileo/Cassini constraints + serpentinization models; not directly measured.'
    }),

    /* ------------------------------ TITAN -------------------------------- */
    titan: createEnvironment('titan', {
      name: 'Titan — Methane Lake (cryogenic hydrocarbon)',
      nameMn: 'Титан — Метаны нуур (криоген устөрөгчийн гидрорбон)',
      region: 'surface',
      temperatureK: 94,              // 94 K surface
      pressureBar: 1.47,             // 147 kPa — thick N2/CH4 atmosphere
      pH: 7.0,                       // no aqueous pH; nominal placeholder for model
      salinityPct: 12,               // ammonium thiocyanate salts in methane
      waterActivity: 0.0,            // NO liquid water: aw defined on water basis = 0
      uvIndex: 0.5,                  // dense haze blocks most UV at surface
      radiationDoseGyPerSol: 0.001,
      redoxPotentialMv: -300,        // strongly reducing hydrocarbon chemistry
      energySourceType: 'photochemical', // photochemical tholins in upper haze
      mineralSoup: { Fe2: 0, H2S: 0.2, H2: 0.1, CO2: 0.5, NH3: 0.3, PO4: 0.01, SO4: 0, CH4: 49 },
      evidence: 'established',
      nonAqueousSolvent: 'liquid CH4/C2H6',
      notes: 'Only world with standing surface liquid other than water. Aw=0 excludes water-based life; hypothetical azotosomes are pure speculation.'
    }),

    /* ----------------------------- ENCELADUS ----------------------------- */
    enceladus: createEnvironment('enceladus', {
      name: 'Enceladus — Subsurface Ocean (tiger-stripe vents)',
      nameMn: 'Энцелад — Гүнзгий далай (пучин рашаанууд)',
      region: 'subsurface_ocean',
      temperatureK: 275,             // ocean ~275 K, vents >363 K locally
      pressureBar: 100,              // ocean depth ~50-60 km water column
      pH: 10.2,                      // strongly alkaline hydrothermal
      salinityPct: 2.1,              // NaCl + NaHCO3 measured by Cassini
      waterActivity: 0.99,
      uvIndex: 0,
      radiationDoseGyPerSol: 0.001,
      redoxPotentialMv: -250,        // H2-rich reducing vents
      energySourceType: 'hydrothermal',
      mineralSoup: { Fe2: 4, H2S: 2, H2: 3, CO2: 2, NH3: 0.3, PO4: 0.04, SO4: 0.5, CH4: 1.4 },
      evidence: 'established',
      notes: 'Cassini INMS measured H2, CH4, CO2 in plumes — direct evidence of hydrothermal activity (Waite et al. 2017).'
    }),

    /* -------------------------- EARTH (REFERENCE) ------------------------ */
    earth_reference: createEnvironment('earth_reference', {
      name: 'Earth — Reference Baseline (CONTROL, not a target)',
      nameMn: 'Дэлхий — Хяналтын Санал (зөвхөн харьцуулга)',
      region: 'surface',
      temperatureK: 288,             // 15°C global mean
      pressureBar: 1.013,
      pH: 7.4,
      salinityPct: 0.03,
      waterActivity: 1.0,
      uvIndex: 4,
      radiationDoseGyPerSol: 0.001,
      redoxPotentialMv: 400,         // oxygenated
      energySourceType: 'photochemical',
      mineralSoup: { Fe2: 0.01, H2S: 0.01, H2: 0.001, CO2: 0.02, NH3: 0.001, PO4: 0.001, SO4: 2.7, CH4: 0.00002 },
      evidence: 'established',
      notes: 'Included for comparison only. Earth is the one known biosphere — it calibrates the model, it is never an experiment target.'
    }),

    /* ------------------- BONUS: VENUS CLOUD (speculative) ---------------- */
    venus_cloud: createEnvironment('venus_cloud', {
      name: 'Venus — Cloud Deck 50-60 km (speculative niche)',
      nameMn: 'Сугар — Үүлэн давхарга 50-60 км (таамаглалт)',
      region: 'atmosphere',
      temperatureK: 303,             // 30°C at cloud altitudes
      pressureBar: 0.5,              // ~0.5 bar at 55 km
      pH: 0.5,                       // concentrated H2SO4 droplets — extremely acidic
      salinityPct: 0,
      waterActivity: 0.4,            // aw too low even for extremeophiles
      uvIndex: 6,
      radiationDoseGyPerSol: 0.002,
      redoxPotentialMv: 350,
      energySourceType: 'photochemical',
      mineralSoup: { Fe2: 0, H2S: 0.1, H2: 0, CO2: 96, NH3: 0, PO4: 0, SO4: 90, CH4: 0 },
      evidence: 'speculative',
      notes: 'Temperature/pressure habitable zone but aw and acidity are hostile. Balloon-organism hypothesis is pure speculation (Landis 2005).'
    })
  };

  /**
   * List available presets (for UI dropdowns / Deep Space V7).
   * @param {boolean} includeReference - include Earth reference (default true)
   */
  function listEnvironments(includeReference) {
    if (includeReference === false) {
      return Object.keys(PRESETS).filter(function (k) { return k !== 'earth_reference'; });
    }
    return Object.keys(PRESETS);
  }

  /** Get a fresh, independent copy of a preset (so callers can mutate safely). */
  function getPreset(id) {
    var p = PRESETS[id];
    if (!p) return null;
    // Deep-ish copy: mineralSoup included
    return LifeSimulationCore.createEnvironment(p.id, Object.assign({}, p, {
      mineralSoup: Object.assign({}, p.mineralSoup)
    }));
  }

  return {
    PRESETS: PRESETS,
    listEnvironments: listEnvironments,
    getPreset: getPreset
  };
}));
