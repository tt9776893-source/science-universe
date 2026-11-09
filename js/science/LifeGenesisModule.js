/**
 * SCIENCE UNIVERSE — LIFE GENESIS LAB (PHASE 4)
 * Module: LifeGenesisModule.js
 * 
 * Advanced Astrobiology, Planetary Habitability & Prebiotic Origin of Life Simulation:
 * 1. Planetary Habitability Lab (Phase 4.1):
 *    - In-situ assessment of extraterrestrial worlds (Mars, Europa, Titan, Enceladus, Moon, Mercury, Venus).
 *    - Interactive experimental adjustments: Temperature, Liquid water stability (phase diagram),
 *      Atmospheric pressure, Atmospheric composition, Cosmic/Solar radiation,
 *      Organic prebiotic molecules, Geochemical energy gradients, pH, and Salinity.
 *    - Real-time computation of Earth Similarity Index (ESI), Thermal Habitability Index (THI),
 *      and thermodynamic water phase state.
 *    - Strict educational disclaimer: Habitability evaluates physical permissibility, NOT proof of life.
 * 2. Hypothetical Prebiotic Life Origin Speculative Simulator (Phase 4.2):
 *    - Five-stage speculative simulation: Energy Activation -> Monomer Synthesis -> Protocell Lipids ->
 *      Catalysis/Replication -> Microbial Metabolism.
 *    - Probabilistic, uncertain, and diverse outcomes: Sterilized/Degraded, Prebiotic Stagnation,
 *      Subsurface Chemotrophic Extremophile, or Flourishing Biosphere.
 *    - Clear disclaimer: The exact origin of life (abiogenesis) is an active, unsolved scientific frontier.
 * 3. Planetary Evolution & Genesis Engine Connection (Phase 4.3):
 *    - Atmospheric evolution, climate stability, and terraforming scenarios.
 * 4. Modular Planetary Research Stations (Phase 4.4):
 *    - Habitats, Solar arrays, Sensor masts, Astrobiology bioreactors, Spectrometry pods.
 * 5. Long-term Scientific Discovery Progression (Phase 4.5):
 *    - Versioned persistent journal (su_deepspace_journal_v3) tracking discoveries, unlocked instruments,
 *      and completed habitability experiments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LifeGenesisModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Physical & Thermodynamic Constants
  const WATER_TRIPLE_POINT_PA = 611.657; // 0.006037 atm (~6.1 mbar)
  const WATER_TRIPLE_POINT_TEMP_K = 273.16; // 0.01 °C
  const WATER_CRITICAL_PRESSURE_PA = 22.064e6; // 217.7 atm
  const WATER_CRITICAL_TEMP_K = 647.096; // 373.9 °C
  const KELVIN_OFFSET = 273.15;

  /**
   * Extraterrestrial World Habitability Baselines
   */
  const WORLD_BASELINES = {
    mars: {
      name: 'Mars (Ангараг)',
      type: 'Terrestrial Desert',
      tempK: 210, // -63 °C
      pressureBar: 0.006, // 600 Pa
      radiationWm2: 590, // Solar + cosmic
      co2Pct: 95.3,
      n2Pct: 2.6,
      ch4Ppm: 0.01,
      organicsPpm: 15,
      waterState: 'Subsurface Permafrost / Cryo-Brine',
      energySources: ['Solar UV', 'Basaltic Iron Redox', 'Subsurface Geothermal'],
      pH: 8.2, // Alkaline perchlorate regolith
      salinityPct: 3.5,
      esi: 0.697,
      nicheDesc: 'Ноахийн галавт шингэн устай байсан; одоо гадарга нь хүйтэн, хуурай, хэт ягаан туяаны ариутгалтай. Гүний давсархаг усан судал амьдрах боломжит орчин.'
    },
    europa: {
      name: 'Europa (Европа — Бархасбадь II)',
      type: 'Ocean World (Ice Crust)',
      tempK: 102, // -171 °C surface (ocean: ~273 K)
      pressureBar: 1e-12, // Surface vacuum; ocean bottom: >1000 bar
      radiationWm2: 50, // Massive radiation belt at surface, 0 in ocean
      co2Pct: 1.0,
      n2Pct: 0.5,
      ch4Ppm: 120,
      organicsPpm: 85,
      waterState: '100 km Subsurface Liquid Water Ocean',
      energySources: ['Hydrothermal Vent Serpentinization', 'Tidal Flexure Heat', 'Radiolytic Oxidants'],
      pH: 9.5, // Alkaline serpentine ocean
      salinityPct: 4.8, // Magnesium sulfate & sodium chloride
      esi: 0.680,
      nicheDesc: '15-25 км мөсөн хучлагын дор Дэлхийн бүх далайгаас 2 дахин их шингэн устай аварга далай бий. Далайн ёроолын шүлтлэг гидротермал рашаанууд нь амьдрал үүсэх таатай орчин.'
    },
    titan: {
      name: 'Titan (Титан — Санчир VI)',
      type: 'Hydrocarbon Atmosphere & Methane Lakes',
      tempK: 94, // -179 °C
      pressureBar: 1.47, // 147 kPa (dense!)
      radiationWm2: 15, // Atmosphere blocks solar UV
      co2Pct: 0.0,
      n2Pct: 95.0,
      ch4Ppm: 49000, // 4.9% CH4
      organicsPpm: 12000, // Rich photochemical tholins
      waterState: 'Deep Silicate Ice Bedrock / Deep Subsurface Water-Ammonia Ocean',
      energySources: ['Photochemical Hydrocarbon Acetylene', 'Cryovolcanic Thermal Plumes'],
      pH: 7.0,
      salinityPct: 12.0,
      esi: 0.620,
      nicheDesc: 'Шингэн метан/этаны нуур, голуудтай нарны аймгийн цорын ганц ертөнц. Уснаас өөр уусгагчид суурилсан пребиотик харь гарагийн амьдралын судалгааны төв.'
    },
    enceladus: {
      name: 'Enceladus (Энцелад — Санчир II)',
      type: 'Active Cryovolcanic Ocean Moon',
      tempK: 75, // -198 °C surface (vents: ~157 K, ocean: 275 K)
      pressureBar: 1e-13,
      radiationWm2: 15,
      co2Pct: 3.2,
      n2Pct: 4.0,
      ch4Ppm: 14000, // 1.4% CH4 in geysers
      organicsPpm: 420,
      waterState: 'Global Subsurface Alkaline Ocean with Cryogeysers',
      energySources: ['Active Hydrothermal Vents (>90°C)', 'Molecular Hydrogen (H2) Redox', 'Tidal Heating'],
      pH: 10.2, // Alkaline hydrothermal
      salinityPct: 2.1, // NaCl + NaHCO3
      esi: 0.740,
      nicheDesc: 'Tiger Stripes хагарлуудаас сансарт цацагдаж буй гейзерээс Кассини хөлөг нано-силикат, H2, CH4, макромолекул органик нэгдлүүдийг баталсан. Нарны аймгийн хамгийн өндөр био-боломжит ертөнц.'
    },
    moon: {
      name: 'Moon (Сар)',
      type: 'Airless Silicate Satellite',
      tempK: 253,
      pressureBar: 1e-14,
      radiationWm2: 1361,
      co2Pct: 0.0,
      n2Pct: 0.0,
      ch4Ppm: 0.0,
      organicsPpm: 0.1,
      waterState: 'Permanently Shadowed Polar Ice Trap',
      energySources: ['Solar Photovoltaic'],
      pH: 7.0,
      salinityPct: 0.0,
      esi: 0.560,
      nicheDesc: 'Агаар мандалгүй, нарны шууд цацрагтай. Зөвхөн туйлын мөнхийн сүүдэрт тогоонуудад устөрөгч, мөс хуримтлагдсан.'
    },
    mercury: {
      name: 'Mercury (Буд)',
      type: 'Dense Metallic Planet',
      tempK: 440,
      pressureBar: 1e-12,
      radiationWm2: 9126,
      co2Pct: 0.0,
      n2Pct: 0.0,
      ch4Ppm: 0.0,
      organicsPpm: 0.0,
      waterState: 'Deep Polar Crater Cold Traps (<100 K)',
      energySources: ['Solar Radiation'],
      pH: 7.0,
      salinityPct: 0.0,
      esi: 0.390,
      nicheDesc: 'Нарны хэт хүчтэй халуун ба шөнийн хэт хүйтний эрс тэс хэлбэлзэлтэй. Биологийн амьдралд тохиромжгүй.'
    },
    venus: {
      name: 'Venus (Сугар)',
      type: 'Super-Greenhouse Volcanic',
      tempK: 737, // 464 °C
      pressureBar: 92.0, // 9.2 MPa
      radiationWm2: 2613,
      co2Pct: 96.5,
      n2Pct: 3.5,
      ch4Ppm: 0.0,
      organicsPpm: 1.0,
      waterState: 'Superheated Runaway Steam Trace in Clouds',
      energySources: ['Solar Upper Clouds', 'Geothermal Volcanic'],
      pH: 0.1, // Concentrated sulfuric acid clouds
      salinityPct: 0.0,
      esi: 0.440,
      nicheDesc: 'Гадарга нь 464°C, 92 атм даралттай там. 50-65 км-ийн өндөрт агаарын даралт 1 атм, температур 20-40°C байдаг нь агаар мандлын бичил биетний таамаглал дэвшүүлдэг.'
    }
  };

  /**
   * Prebiotic Chemistry Energy Pathways
   */
  const PREBIOTIC_PATHWAYS = {
    hydrothermal: {
      name: 'Шүлтлэг Гидротермал Булаг (Alkaline Hydrothermal Vent)',
      energyType: 'Протоны Градиент & H2 Редокс',
      yieldMonomers: 0.88,
      riskDegradation: 0.15,
      catalysts: 'Fe-Ni Сульфид (Грейгит), Серпентин, Нано-Силикат',
      desc: 'Далайн ёроолын шүлтлэг халуун рашаан дээр хүчиллэг далайн устай үүсгэх байгалийн цахилгаан-химийн протоны градиент (pH 9 vs pH 6). Орчин үеийн АТФ-синтаза ферментийн эх загвар.'
    },
    spark: {
      name: 'Миллер-Юрийн Цахилгаан Цахилалт (Spark Discharge)',
      energyType: 'Аянга цахилгаан / Плазмын цэнэг',
      yieldMonomers: 0.72,
      riskDegradation: 0.45,
      catalysts: 'Шингэн ус, Метан, Аммиак, Устөрөгч',
      desc: '1953 оны сонгодог туршилт. Буурах агаар мандалд цахилгаан цэнэг өгснөөр амин хүчлүүд (глицин, аланин) аяндаа нийлэгждэг.'
    },
    intertidal: {
      name: 'Шаварлаг Завсрын Нуур (Fluctuating Intertidal Clay)',
      energyType: 'Нарны дулаан хатаалт ба чийгшлийн мөчлөг',
      yieldMonomers: 0.65,
      riskDegradation: 0.30,
      catalysts: 'Монтмориллонит шавар, Zn/Mn силикат',
      desc: 'Шаварлаг эрдсийн гадарга дээр нойтон-хуурай мөчлөг ээлжилснээр нуклеотидууд хоорондоо усгүйжин холбогдож РНХ гинж үүсэх нөхцөл бүрддэг.'
    },
    radiolytic: {
      name: 'Криоген Радиолизийн Мөс (Radiolytic Ice Matrix)',
      energyType: 'Сансрын туяа ба ионы цацраг',
      yieldMonomers: 0.54,
      riskDegradation: 0.50,
      catalysts: 'H2O-CO2-CH4 крио-мөс, Солирын эрдэс',
      desc: 'Европа, Энцеладын мөсөн дээр сансрын хүчтэй цацраг туссанаар чөлөөт радикалууд үүсэж, бага температурт органик нэгдлүүдийг хувиргадаг.'
    }
  };

  /**
   * Modular Research Station Components
   */
  const STATION_MODULES = [
    { id: 'hab', name: 'Inflatable Bio-Habitat Dome', category: 'Life Support', powerKw: -3.5, o2GenL_min: 12.0, desc: 'Хийлдэг 3 үет даралтат амьдрах ба судалгааны битүүмжлэлтэй модуль.' },
    { id: 'solar', name: 'Photovoltaic Solar/RTG Array', category: 'Power', powerKw: +8.5, o2GenL_min: 0.0, desc: 'Өндөр үр ашигт нарны хавтан ба радиоизотопын дулааны генератор.' },
    { id: 'sensor', name: 'Meteo & Radiation Sensor Mast', category: 'Telemetry', powerKw: -0.8, o2GenL_min: 0.0, desc: 'Салхи, даралт, соронзон орон ба сансрын цацрагийн хяналтын цамхаг.' },
    { id: 'bioreactor', name: 'Astrobiology Genesis Bioreactor', category: 'Research', powerKw: -2.2, o2GenL_min: 4.5, desc: 'Харь гарагийн дээжийн бичил биетэн, пребиотик хөгжлийг өсгөвөрлөх тусгаарлагч лаб.' },
    { id: 'spectro', name: 'Raman & X-Ray Diffraction Station', category: 'Geology', powerKw: -1.5, o2GenL_min: 0.0, desc: 'Дээжийн органик болон силикат бүтцийг 0.1 ppm нарийвчлалтай шинжлэх суурь багаж.' }
  ];

  class LifeGenesisModule {
    constructor() {
      this.isMounted = false;
      this.container = null;
      this.currentWorldKey = 'mars';

      // Live experiment states
      this.experimentWorld = Object.assign({}, WORLD_BASELINES.mars);
      this.selectedPathwayKey = 'hydrothermal';
      this.activeTab = 'habitability'; // 'habitability', 'origin', 'stations', 'progression'

      // Speculative Origin Simulation state
      this.originStep = 1; // 1: Energy & Prebiotic, 2: Monomers, 3: Protocells, 4: Replication, 5: Microbial Outcome
      this.originSimulationResult = null;
      this.isSimulating = false;

      // Research Station deployed structures
      this.deployedStationUnits = [];
      this._loadPersistentData();
    }

    /**
     * Mounts Life Genesis Module into target DOM element
     */
    mount(container) {
      if (!container) return;
      this.container = container;
      this.isMounted = true;
      this._renderBaseLayout();
      this._initDomBindings();
      this._updateHabitabilityComputations();
    }

    pause() {}
    resume() {
      this._updateHabitabilityComputations();
    }

    dispose() {
      this.isMounted = false;
      if (this.container) this.container.innerHTML = '';
      this.container = null;
    }

    /**
     * Loads persistent progression data from localStorage
     */
    _loadPersistentData() {
      if (typeof localStorage === 'undefined') return;
      try {
        const rawV3 = localStorage.getItem('su_deepspace_journal_v3');
        const rawV2 = localStorage.getItem('su_deepspace_journal_v2');
        if (rawV3) {
          const parsed = JSON.parse(rawV3);
          this.deployedStationUnits = Array.isArray(parsed.stationUnits) ? parsed.stationUnits : [];
        } else if (rawV2) {
          // Migration from v2
          const parsed = JSON.parse(rawV2);
          this.deployedStationUnits = [];
          this._savePersistentData(parsed);
        }
      } catch (e) {
        console.warn('Failed to load journal v3:', e);
      }
    }

    _savePersistentData(baseJournal = null) {
      if (typeof localStorage === 'undefined') return;
      try {
        let journal = baseJournal;
        if (!journal) {
          const raw = localStorage.getItem('su_deepspace_journal_v3');
          journal = raw ? JSON.parse(raw) : { version: '3.0', visitedPlanets: {}, reports: [], discoveries: [], unlockedTools: [] };
        }
        journal.version = '3.0';
        journal.stationUnits = this.deployedStationUnits;
        if (!journal.unlockedTools) journal.unlockedTools = ['Basic Scanner', 'Mechanical Sampler'];
        
        // Ensure habitability discoveries recorded
        if (!journal.discoveries) journal.discoveries = [];
        const discEntry = `Genesis Lab Habitability Evaluated: ${this.experimentWorld.name}`;
        if (!journal.discoveries.includes(discEntry)) {
          journal.discoveries.push(discEntry);
        }

        localStorage.setItem('su_deepspace_journal_v3', JSON.stringify(journal));
        // Backwards compatibility mirror
        localStorage.setItem('su_deepspace_journal_v2', JSON.stringify(journal));
      } catch (e) {
        console.warn('Failed to save journal v3:', e);
      }
    }

    /**
     * Calculates Earth Similarity Index & Thermodynamic Indicators
     */
    calculateHabitability(params = this.experimentWorld) {
      const p = (typeof params === 'string' && WORLD_BASELINES[params]) ? WORLD_BASELINES[params] : (params || this.experimentWorld);
      const tempK = p.tempK;
      const pressPa = p.pressureBar * 100000;
      const pressAtm = p.pressureBar * 0.986923;

      // 1. Water phase determination based on phase diagram
      let waterPhase = 'Solid Ice (Хөлдүү мөс)';
      let liquidStable = false;
      if (pressPa < WATER_TRIPLE_POINT_PA) {
        waterPhase = 'Sublimation Vacuum (< 611 Pa — Шингэн ус орших боломжгүй)';
      } else if (tempK < WATER_TRIPLE_POINT_TEMP_K) {
        waterPhase = 'Solid Cryo-Ice (Цэвдэг мөс)';
      } else {
        // Approximate boiling curve: Clausius-Clapeyron
        // T_boil ≈ 373.15 / (1 - (8.314 * 373.15 / 40660) * ln(P/101325))
        const pRatio = Math.max(0.0001, pressPa / 101325);
        const tBoilK = 373.15 / (1 - 0.0763 * Math.log(pRatio));
        if (tempK <= tBoilK) {
          waterPhase = 'Liquid Water Stable (Шингэн ус тогтвортой!)';
          liquidStable = true;
        } else {
          waterPhase = 'Superheated Vapor Steam (Хэт халсан уур)';
        }
      }

      // 2. Earth Similarity Index (ESI - Interior & Surface)
      // Reference Earth: T=288.15 K, P=1 bar, EscVel=11.19 km/s
      const wTemp = 0.55, wPress = 0.45;
      const vT = Math.pow(1 - Math.abs((tempK - 288.15) / (tempK + 288.15)), wTemp);
      const vP = Math.pow(1 - Math.abs((pressAtm - 1.0) / (pressAtm + 1.0)), wPress);
      const surfaceESI = Math.max(0.01, Math.min(1.0, vT * vP));

      // 3. Thermal Habitability Index (THI): Optimal 273.15 K to 323.15 K
      let thi = 0.0;
      if (tempK >= 273.15 && tempK <= 373.15) {
        thi = 1.0 - Math.abs(tempK - 295.15) / 80.0;
      } else if (tempK < 273.15 && tempK >= 180.0) {
        thi = Math.max(0.05, 0.4 * (1.0 - (273.15 - tempK) / 93.15));
      } else {
        thi = 0.0;
      }

      // 4. Astrobiological Redox Energy Potential (kJ/mol available)
      let redoxEnergy = 15;
      const energyList = p.energySources || [];
      if (energyList.some(s => s.includes('Hydrothermal') || s.includes('Hydrogen'))) {
        redoxEnergy = 42; // Rich serpentinization
      } else if (energyList.some(s => s.includes('Photochemical'))) {
        redoxEnergy = 34;
      }

      return {
        esi: Number(surfaceESI.toFixed(3)),
        surfaceESI: Number(surfaceESI.toFixed(3)),
        thi: Number(Math.max(0, thi).toFixed(2)),
        score: Math.round(surfaceESI * 100),
        waterPhase: waterPhase,
        liquidStable: liquidStable,
        redoxEnergyKjMol: redoxEnergy
      };
    }

    evaluatePlanetHabitability(key) {
      return this.calculateHabitability(key);
    }

    runPrebioticSimulation(pathwayKey, planetKey) {
      if (planetKey) this.setWorld(planetKey);
      if (pathwayKey) this.selectedPathwayKey = pathwayKey;
      return this.runSpeculativeOriginSimulation();
    }

    /**
     * Runs Speculative Origin of Life simulation
     */
    runSpeculativeOriginSimulation() {
      this.isSimulating = true;
      const pathway = PREBIOTIC_PATHWAYS[this.selectedPathwayKey] || PREBIOTIC_PATHWAYS.hydrothermal;
      const hab = this.calculateHabitability();

      // Multi-factor probabilistic outcome
      const tempSafe = this.experimentWorld.tempK >= 200 && this.experimentWorld.tempK <= 390;
      const hasOrganics = this.experimentWorld.organicsPpm >= 10;
      const phPermissive = this.experimentWorld.pH >= 4.5 && this.experimentWorld.pH <= 11.5;

      let score = 0;
      if (tempSafe) score += 25;
      if (hab.liquidStable || this.experimentWorld.waterState.includes('Ocean')) score += 30;
      if (hasOrganics) score += 20;
      if (phPermissive) score += 15;
      score += Math.round(pathway.yieldMonomers * 20);
      score -= Math.round(pathway.riskDegradation * 15);

      let outcomeType = 'stagnant';
      let title = '';
      let desc = '';
      let badgeColor = '#f59e0b';

      if (this.experimentWorld.tempK > 410 || this.experimentWorld.radiationWm2 > 3000) {
        outcomeType = 'sterilized';
        title = 'Ариутгагдсан / Молекулууд задарсан (Sterilized & Degraded)';
        desc = 'Хэт өндөр температур эсвэл хатуу сансрын цацраг пептид болон нуклейн гинжийг бүрэн задалж ариутгав.';
        badgeColor = '#ef4444';
      } else if (score >= 70 && (hab.liquidStable || this.experimentWorld.waterState.includes('Ocean'))) {
        outcomeType = 'extremophile';
        title = 'Гүний Хемотроф Бичил Биетэн (Chemolithoautotrophs Thriving)';
        desc = 'Нарны гэрэл шаардлагагүйгээр H2 ба Fe/S редокс урвалаар амьдрах чадвартай гүний экстемофил бичил биетний тогтвортой экосистем үүслээ (Европа/Энцеладын аналог).';
        badgeColor = '#22c55e';
      } else if (score >= 45 && hasOrganics) {
        outcomeType = 'protocells';
        title = 'Прото-эс Липидийн Бөмбөлөгүүд (Stable Protocell Vesicles)';
        desc = 'Липидийн давхар хальстай прото-эсүүд үүссэн боловч бие даан хуваагдах РНХ катализ хараахан тогтворжоогүй байна.';
        badgeColor = '#38bdf8';
      } else {
        outcomeType = 'stagnant';
        title = 'Пребиотик Тэнцвэрийн Зогсонги Байдал (Prebiotic Equilibrium)';
        desc = 'Энгийн амин хүчлүүд бий болсон ч полимержих энергийн градиент дутагдаж, химийн тэнцвэрт зогсов.';
        badgeColor = '#f59e0b';
      }

      this.originSimulationResult = {
        outcomeType: outcomeType,
        score: score,
        title: title,
        desc: desc,
        badgeColor: badgeColor,
        pathwayUsed: pathway.name,
        timestamp: new Date().toISOString()
      };

      this.isSimulating = false;
      this._savePersistentData();
      return this.originSimulationResult;
    }

    /**
     * Deploys modular research station component
     */
    deployStationModule(moduleId) {
      const mod = STATION_MODULES.find(m => m.id === moduleId) || STATION_MODULES[0];
      const entry = {
        id: 'MOD_' + Date.now(),
        type: mod.id,
        name: mod.name,
        category: mod.category,
        planetKey: this.currentWorldKey,
        powerKw: mod.powerKw,
        deployedAt: new Date().toISOString()
      };
      this.deployedStationUnits.unshift(entry);
      this._savePersistentData();
      return entry;
    }

    /**
     * Sets active world for investigation
     */
    setWorld(key) {
      if (!WORLD_BASELINES[key]) return;
      this.currentWorldKey = key;
      this.experimentWorld = Object.assign({}, WORLD_BASELINES[key]);
      this.originSimulationResult = null;
      this._updateHabitabilityComputations();
      this._renderBaseLayout();
      this._initDomBindings();
    }

    /* =========================================================================
     * DOM RENDERING & UI
     * ========================================================================= */
    _renderBaseLayout() {
      if (typeof document === 'undefined' || !this.container) return;

      const p = this.experimentWorld;
      const hab = this.calculateHabitability(p);

      this.container.innerHTML = `
        <div class="lg-container" style="display:flex;flex-direction:column;gap:12px;color:#e2e8f0;font-family:sans-serif;height:100%;overflow-y:auto;padding:8px">
          <!-- Header Bar -->
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(15,23,42,0.9);padding:10px 14px;border-radius:10px;border:1px solid #334155">
            <div>
              <div style="font-size:16px;font-weight:700;color:#38bdf8;display:flex;align-items:center;gap:8px">
                <span>🧬 LIFE GENESIS & HABITABILITY LAB V3</span>
                <span style="font-size:10px;background:#0284c7;color:#fff;padding:2px 8px;border-radius:12px">ASTROBIOLOGY FRONTIER</span>
              </div>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">Харь гарагийн амьдрал орших боломж ба пребиотик үүслийн туршилтын лаборатори</div>
            </div>
            <!-- Destination World Selector -->
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:11px;color:#cbd5e1">Гариг / Дагуул:</span>
              <select id="lgWorldSel" style="background:#0f172a;border:1px solid #38bdf8;color:#38bdf8;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600">
                ${Object.keys(WORLD_BASELINES).map(k => `
                  <option value="${k}" ${k === this.currentWorldKey ? 'selected' : ''}>${WORLD_BASELINES[k].name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Sub-navigation Tabs -->
          <div style="display:flex;gap:8px">
            <button class="lg-tab-btn ${this.activeTab === 'habitability' ? 'active' : ''}" data-tab="habitability" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;background:${this.activeTab === 'habitability' ? 'linear-gradient(180deg,#0284c7,#0369a1)' : '#1e293b'};color:#fff;border:1px solid ${this.activeTab === 'habitability' ? '#38bdf8' : '#334155'};cursor:pointer">
              🪐 Амьдрах Боломж (Habitability Assay)
            </button>
            <button class="lg-tab-btn ${this.activeTab === 'origin' ? 'active' : ''}" data-tab="origin" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;background:${this.activeTab === 'origin' ? 'linear-gradient(180deg,#0284c7,#0369a1)' : '#1e293b'};color:#fff;border:1px solid ${this.activeTab === 'origin' ? '#38bdf8' : '#334155'};cursor:pointer">
              🧪 Пребиотик Үүсэл (Speculative Biogenesis)
            </button>
            <button class="lg-tab-btn ${this.activeTab === 'stations' ? 'active' : ''}" data-tab="stations" style="flex:1;padding:8px;border-radius:8px;font-size:12px;font-weight:600;background:${this.activeTab === 'stations' ? 'linear-gradient(180deg,#0284c7,#0369a1)' : '#1e293b'};color:#fff;border:1px solid ${this.activeTab === 'stations' ? '#38bdf8' : '#334155'};cursor:pointer">
              🏗️ Судалгааны Станц (Research Habitats)
            </button>
          </div>

          <!-- Tab Content Views -->
          <div id="lgTabContent" style="display:flex;flex-direction:column;gap:10px">
            ${this._getTabContentHtml(hab)}
          </div>

          <!-- Scientific Caution Note -->
          <div style="background:rgba(2,132,199,0.1);border-left:4px solid #38bdf8;padding:8px 12px;border-radius:6px;font-size:11px;color:#cbd5e1">
            <b>🔬 Эрдэм Шинжилгээний Мэдэгдэл:</b> 
            Амьдрах боломжийн индекс (ESI болон THI) нь тухайн гаригийн физик, термодинамикийн зөвшөөрөгдөх хязгаарыг хэмждэг бөгөөд <b>харь гараг дээр амьдрал бий гэсэн баталгаа биш</b> юм. Пребиотик химийн симуляци нь орчин үеийн астробиологийн таамаглалд суурилсан сургалтын загвар болно.
          </div>
        </div>
      `;
    }

    _getTabContentHtml(hab) {
      if (this.activeTab === 'habitability') {
        return this._getHabitabilityHtml(hab);
      } else if (this.activeTab === 'origin') {
        return this._getOriginHtml(hab);
      } else {
        return this._getStationsHtml();
      }
    }

    _getHabitabilityHtml(hab) {
      const p = this.experimentWorld;
      return `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px">
          <!-- Left: Experimental Parameter Controls -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#38bdf8">🧪 Туршилтын Физик Параметрүүд</div>
            
            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                <span>Гадаргын Температур:</span>
                <b id="lgTempLbl" style="color:#f59e0b">${p.tempK} K (${(p.tempK - KELVIN_OFFSET).toFixed(1)} °C)</b>
              </div>
              <input type="range" id="lgTempSlider" min="50" max="800" value="${p.tempK}" style="width:100%">
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                <span>Агаар Мандлын Даралт:</span>
                <b id="lgPressLbl" style="color:#38bdf8">${p.pressureBar.toFixed(3)} bar (${(p.pressureBar * 100).toFixed(1)} kPa)</b>
              </div>
              <input type="range" id="lgPressSlider" min="0" max="100" step="0.01" value="${Math.min(100, p.pressureBar)}" style="width:100%">
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                <span>Органик Молекул (Пребиотик нүүрстөрөгч):</span>
                <b id="lgOrgLbl" style="color:#a78bfa">${p.organicsPpm} ppm</b>
              </div>
              <input type="range" id="lgOrgSlider" min="0" max="2000" step="10" value="${p.organicsPpm}" style="width:100%">
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
                <span>Хүчиллэг/Шүлтлэг Орчин (pH):</span>
                <b id="lgPhLbl" style="color:#34d399">pH ${p.pH.toFixed(1)}</b>
              </div>
              <input type="range" id="lgPhSlider" min="0" max="14" step="0.1" value="${p.pH}" style="width:100%">
            </div>

            <div style="font-size:11px;color:#94a3b8;border-top:1px solid #334155;padding-top:8px">
              <b>Эрчим хүчний эх үүсвэрүүд:</b> ${p.energySources.join(' · ')}
            </div>
            <div style="font-size:11px;color:#cbd5e1">
              <b>Ажиглалтын Тэмдэглэл:</b> ${p.nicheDesc}
            </div>
          </div>

          <!-- Right: Live Computation & Astrobiology Indicators -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#22c55e">📊 Астробиологийн Тооцоолсон Үзүүлэлтүүд</div>

            <!-- ESI Gauge -->
            <div style="background:#0f172a;padding:10px;border-radius:8px;border:1px solid #1e293b">
              <div style="font-size:10px;color:#94a3b8">ДЭЛХИЙТЭЙ ТӨСӨӨТЭЙ БАЙДЛЫН ИНДЕКС (ESI)</div>
              <div id="lgEsiVal" style="font-size:24px;font-weight:800;color:${hab.surfaceESI > 0.7 ? '#22c55e' : (hab.surfaceESI > 0.5 ? '#f59e0b' : '#38bdf8')}">
                ${hab.surfaceESI} / 1.000
              </div>
              <div style="font-size:10px;color:#64748b">Schulze-Makuch et al. гадаргын масс ба дулааны тэгшитгэл</div>
            </div>

            <!-- Water Phase State -->
            <div style="background:#0f172a;padding:10px;border-radius:8px;border:1px solid #1e293b">
              <div style="font-size:10px;color:#94a3b8">ТЕРМОДИНАМИКИЙН УСНЫ ТӨЛӨВ БАЙДАЛ</div>
              <div id="lgWaterVal" style="font-size:13px;font-weight:700;color:${hab.liquidStable ? '#22c55e' : '#f59e0b'};margin-top:2px">
                ${hab.waterPhase}
              </div>
              <div style="font-size:10px;color:#64748b">Гурвалсан цэг (611 Па) ба фазын диаграммын шалгалт</div>
            </div>

            <!-- Thermal Habitability & Redox Energy -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:#0f172a;padding:8px;border-radius:8px;border:1px solid #1e293b">
                <div style="font-size:10px;color:#94a3b8">ДУЛААНЫ ТОХИРОМЖ (THI)</div>
                <div id="lgThiVal" style="font-size:16px;font-weight:700;color:#38bdf8">${hab.thi}</div>
              </div>
              <div style="background:#0f172a;padding:8px;border-radius:8px;border:1px solid #1e293b">
                <div style="font-size:10px;color:#94a3b8">РЕДОКС ЭНЕРГИ</div>
                <div id="lgRedoxVal" style="font-size:16px;font-weight:700;color:#a78bfa">${hab.redoxEnergyKjMol} кЖ/моль</div>
              </div>
            </div>

            <button id="lgResetWorldBtn" style="padding:6px;background:#334155;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;margin-top:auto">
              🔄 Эх Параметрт Буцаах (Reset to Baseline)
            </button>
          </div>
        </div>
      `;
    }

    _getOriginHtml(hab) {
      const p = this.experimentWorld;
      const sim = this.originSimulationResult;
      return `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px">
          <!-- Left: Prebiotic Pathway Selection -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#38bdf8">🧪 Пребиотик Химийн Механизм Сонгох</div>
            
            <div style="display:flex;flex-direction:column;gap:6px">
              ${Object.keys(PREBIOTIC_PATHWAYS).map(k => {
                const pw = PREBIOTIC_PATHWAYS[k];
                const isSelected = k === this.selectedPathwayKey;
                return `
                  <div class="lg-pathway-card" data-pathway="${k}" style="background:${isSelected ? 'rgba(2,132,199,0.2)' : '#0f172a'};border:1px solid ${isSelected ? '#38bdf8' : '#1e293b'};padding:8px 10px;border-radius:8px;cursor:pointer">
                    <div style="font-size:12px;font-weight:700;color:${isSelected ? '#38bdf8' : '#e2e8f0'}">${pw.name}</div>
                    <div style="font-size:10px;color:#94a3b8;margin:2px 0"><b>Катализатор:</b> ${pw.catalysts}</div>
                    <div style="font-size:10px;color:#64748b">${pw.desc}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <button id="lgRunOriginSimBtn" style="padding:10px;background:linear-gradient(180deg,#0284c7,#0369a1);border:1px solid #38bdf8;color:#fff;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;margin-top:4px">
              ⚡ ТААМАГ СИМУЛЯЦИЙГ ЭХЛҮҮЛЭХ (RUN SPECULATIVE SIMULATION)
            </button>
          </div>

          <!-- Right: Simulation Progress & Scientific Outcome -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#22c55e">🧬 Симуляцийн Үр Дүн</div>

            ${sim ? `
              <div style="background:#0f172a;padding:12px;border-radius:8px;border:1px solid ${sim.badgeColor};display:flex;flex-direction:column;gap:6px">
                <div style="font-size:10px;color:#94a3b8">ТААМАГ ГАРЦ (SPECULATIVE OUTCOME):</div>
                <div style="font-size:14px;font-weight:800;color:${sim.badgeColor}">${sim.title}</div>
                <div style="font-size:11px;color:#cbd5e1;line-height:1.4">${sim.desc}</div>
                <div style="font-size:10px;color:#64748b;margin-top:4px">
                  Ашигласан механизм: <b>${sim.pathwayUsed}</b> · Нийлмэл оноо: <b>${sim.score}/100</b>
                </div>
              </div>
            ` : `
              <div style="background:#0f172a;padding:24px 12px;border-radius:8px;border:1px dashed #334155;text-align:center;color:#64748b;font-size:12px">
                Пребиотик химийн механизмыг сонгоод симуляцийн товчийг дарж харь ертөнцийн нөхцөл дэх гарцыг туршина уу.
              </div>
            `}

            <div style="background:#0f172a;padding:10px;border-radius:8px;border:1px solid #1e293b;font-size:11px;color:#94a3b8">
              <b>Байгалийн 5 үе шат:</b>
              <ol style="margin:4px 0 0 16px;padding:0">
                <li>Эрчим хүчний идэвхжилт (Цахилалт/Рашаан)</li>
                <li>Органик мономерүүд (Амин хүчил/Сууриуд)</li>
                <li>Прото-эс липидийн давхар хальс</li>
                <li>РНХ/Каталитик хуулбарлалтын тест</li>
                <li>Метаболик амьдрах чадвар (Хемотрофи)</li>
              </ol>
            </div>
          </div>
        </div>
      `;
    }

    _getStationsHtml() {
      return `
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:12px">
          <!-- Left: Deployable Modules Catalog -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#38bdf8">🏗️ Модуляр Судалгааны Станцын Каталог</div>
            
            <div style="display:flex;flex-direction:column;gap:6px">
              ${STATION_MODULES.map(m => `
                <div style="background:#0f172a;border:1px solid #1e293b;padding:8px 10px;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <div style="font-size:12px;font-weight:700;color:#e2e8f0">${m.name}</div>
                    <div style="font-size:10px;color:#94a3b8">${m.desc}</div>
                    <div style="font-size:10px;color:#38bdf8">Эрчим хүч: ${m.powerKw > 0 ? '+' + m.powerKw : m.powerKw} кВт</div>
                  </div>
                  <button class="lg-deploy-btn" data-mod="${m.id}" style="padding:6px 12px;background:#0284c7;color:#fff;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap">
                    Байрлуулах
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Active Planetary Base Structures -->
          <div style="background:rgba(15,23,42,0.85);padding:12px;border-radius:10px;border:1px solid #334155;display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;font-weight:700;color:#22c55e">🛰️ Идэвхтэй Судалгааны Станцууд (${this.currentWorldKey.toUpperCase()})</div>

            <div style="display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto">
              ${this.deployedStationUnits.filter(u => u.planetKey === this.currentWorldKey).length > 0 ? 
                this.deployedStationUnits.filter(u => u.planetKey === this.currentWorldKey).map(u => `
                  <div style="background:#0f172a;padding:8px;border-radius:6px;border:1px solid #334155;font-size:11px">
                    <div style="font-weight:700;color:#38bdf8">${u.name}</div>
                    <div style="font-size:10px;color:#64748b">Ангилал: ${u.category} · Суурилуулсан: ${new Date(u.deployedAt).toLocaleTimeString()}</div>
                  </div>
                `).join('') : `
                  <div style="background:#0f172a;padding:20px;border-radius:6px;text-align:center;color:#64748b;font-size:11px">
                    Энэ гариг дээр судалгааны станцын модуль хараахан байрлуулаагүй байна.
                  </div>
                `
              }
            </div>
          </div>
        </div>
      `;
    }

    _updateHabitabilityComputations() {
      if (typeof document === 'undefined') return;
      const hab = this.calculateHabitability(this.experimentWorld);
      const esiEl = document.getElementById('lgEsiVal');
      if (esiEl) esiEl.textContent = `${hab.surfaceESI} / 1.000`;
      const waterEl = document.getElementById('lgWaterVal');
      if (waterEl) {
        waterEl.textContent = hab.waterPhase;
        waterEl.style.color = hab.liquidStable ? '#22c55e' : '#f59e0b';
      }
      const thiEl = document.getElementById('lgThiVal');
      if (thiEl) thiEl.textContent = hab.thi;
      const redoxEl = document.getElementById('lgRedoxVal');
      if (redoxEl) redoxEl.textContent = `${hab.redoxEnergyKjMol} кЖ/моль`;
    }

    _initDomBindings() {
      if (!this.container) return;

      // World selector
      const worldSel = document.getElementById('lgWorldSel');
      if (worldSel) {
        worldSel.onchange = (e) => this.setWorld(e.target.value);
      }

      // Tab buttons
      this.container.querySelectorAll('.lg-tab-btn').forEach(btn => {
        btn.onclick = () => {
          this.activeTab = btn.getAttribute('data-tab');
          this._renderBaseLayout();
          this._initDomBindings();
        };
      });

      // Habitability Sliders
      const tempSlider = document.getElementById('lgTempSlider');
      if (tempSlider) {
        tempSlider.oninput = (e) => {
          this.experimentWorld.tempK = Number(e.target.value);
          const lbl = document.getElementById('lgTempLbl');
          if (lbl) lbl.textContent = `${this.experimentWorld.tempK} K (${(this.experimentWorld.tempK - KELVIN_OFFSET).toFixed(1)} °C)`;
          this._updateHabitabilityComputations();
        };
      }

      const pressSlider = document.getElementById('lgPressSlider');
      if (pressSlider) {
        pressSlider.oninput = (e) => {
          this.experimentWorld.pressureBar = Number(e.target.value);
          const lbl = document.getElementById('lgPressLbl');
          if (lbl) lbl.textContent = `${this.experimentWorld.pressureBar.toFixed(3)} bar (${(this.experimentWorld.pressureBar * 100).toFixed(1)} kPa)`;
          this._updateHabitabilityComputations();
        };
      }

      const orgSlider = document.getElementById('lgOrgSlider');
      if (orgSlider) {
        orgSlider.oninput = (e) => {
          this.experimentWorld.organicsPpm = Number(e.target.value);
          const lbl = document.getElementById('lgOrgLbl');
          if (lbl) lbl.textContent = `${this.experimentWorld.organicsPpm} ppm`;
          this._updateHabitabilityComputations();
        };
      }

      const phSlider = document.getElementById('lgPhSlider');
      if (phSlider) {
        phSlider.oninput = (e) => {
          this.experimentWorld.pH = Number(e.target.value);
          const lbl = document.getElementById('lgPhLbl');
          if (lbl) lbl.textContent = `pH ${this.experimentWorld.pH.toFixed(1)}`;
          this._updateHabitabilityComputations();
        };
      }

      const resetBtn = document.getElementById('lgResetWorldBtn');
      if (resetBtn) {
        resetBtn.onclick = () => this.setWorld(this.currentWorldKey);
      }

      // Prebiotic pathway selection
      this.container.querySelectorAll('.lg-pathway-card').forEach(card => {
        card.onclick = () => {
          this.selectedPathwayKey = card.getAttribute('data-pathway');
          this._renderBaseLayout();
          this._initDomBindings();
        };
      });

      // Origin sim button
      const simBtn = document.getElementById('lgRunOriginSimBtn');
      if (simBtn) {
        simBtn.onclick = () => {
          this.runSpeculativeOriginSimulation();
          this._renderBaseLayout();
          this._initDomBindings();
        };
      }

      // Deploy buttons
      this.container.querySelectorAll('.lg-deploy-btn').forEach(btn => {
        btn.onclick = () => {
          const mod = btn.getAttribute('data-mod');
          this.deployStationModule(mod);
          this._renderBaseLayout();
          this._initDomBindings();
        };
      });
    }
  }

  return LifeGenesisModule;
}));
