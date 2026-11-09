/**
 * SCIENCE UNIVERSE — PLANETARY GEOPHYSICS & SEISMOLOGY ENGINE
 * Module: PlanetaryGeophysics.js
 * 
 * Provides geophysical interior models, hydrostatic equilibrium integration,
 * temperature gradients, and comparative planetary geophysics for ALL 8 Solar System planets.
 * 
 * Scientific References & Standards:
 * - Earth: Preliminary Reference Earth Model (PREM): Dziewonski & Anderson (1981).
 * - Mars: InSight SEIS Core & Mantle determinations: Stähler et al. (Science 2021), Khan et al. (Science 2021).
 * - Mercury: MESSENGER Gravity & Radar Topography: Genova et al. (2019), Margot et al. (2018).
 * - Venus: Magellan Radar Inversion & Geodynamic Models: Smrekar & Sotin (2012), Dumoulin et al. (2017).
 * - Jupiter: NASA Juno Gravity & Dynamo Mapping: Guillot et al. (Nature 2018), Connerney et al. (2018).
 * - Saturn: Cassini Grand Finale Ring Seismology & Gravity: Mankovich & Fuller (Nature Astronomy 2021).
 * - Uranus & Neptune: High-Pressure Laser Shock Experiments (Superionic Water): Millot et al. (Nature 2019), Helled et al. (2020).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../PlanetData'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../PlanetData'));
  } else {
    root.PlanetaryGeophysics = factory(root.PlanetData);
  }
}(typeof self !== 'undefined' ? self : this, function (PlanetData) {
  'use strict';

  /**
   * Authoritative Geophysical Interior Models for All 8 Solar System Planets
   */
  const INTERIOR_MODELS = {
    mercury: {
      planetId: 'mercury',
      name: 'Буд (Mercury)',
      totalRadiusM: 2439700,
      surfaceGravity: 3.70,
      type: 'terrestrial',
      scientificSource: 'NASA MESSENGER Gravimetry & Laser Altimeter (2011-2015)',
      uncertaintyLevel: 'moderate', // Core radius known to ±35 km; mantle thickness constrained
      layers: [
        {
          id: 'crust',
          name: 'Crust (Бүрхүүл)',
          state: 'solid',
          depthStartM: 0,
          depthEndM: 35000,
          radiusOuterM: 2439700,
          radiusInnerM: 2404700,
          densityAvgKgM3: 2900,
          composition: 'Silicate rocks, rich in Magnesium & Sulfur, low in Iron',
          pWaveSpeedM_S: 5200,
          sWaveSpeedM_S: 3100,
          temperatureK: { top: 440, bottom: 700 },
          colorHex: '#9ca3af',
          uncertainty: 'MESSENGER confirmed surprisingly high sulfur (~4 wt%) and potassium content.'
        },
        {
          id: 'mantle',
          name: 'Mantle (Манти)',
          state: 'solid_ductile',
          depthStartM: 35000,
          depthEndM: 420000,
          radiusOuterM: 2404700,
          radiusInnerM: 2019700,
          densityAvgKgM3: 3300,
          composition: 'Enstatite/Olivine pyroxene silicates; thin solid lithospheric shell',
          pWaveSpeedM_S: 7500,
          sWaveSpeedM_S: 4200,
          temperatureK: { top: 700, bottom: 1650 },
          colorHex: '#b45309',
          uncertainty: 'Very thin mantle (~385 km) compared to Earth, possibly due to a giant protoplanetary impact.'
        },
        {
          id: 'outer_core',
          name: 'Liquid Outer Core (Шингэн гадаад цөм)',
          state: 'liquid',
          depthStartM: 420000,
          depthEndM: 1900000,
          radiusOuterM: 2019700,
          radiusInnerM: 540000,
          densityAvgKgM3: 7200,
          composition: 'Liquid Fe-Ni-Si-S alloy (Iron-Nickel with light silicon/sulfur elements)',
          pWaveSpeedM_S: 6200,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 1650, bottom: 2100 },
          colorHex: '#ea580c',
          uncertainty: 'Active geodynamo maintains Mercury\'s intrinsic global magnetic field (~1% of Earth).'
        },
        {
          id: 'inner_core',
          name: 'Solid Inner Core (Хатуу дотоод цөм)',
          state: 'solid',
          depthStartM: 1900000,
          depthEndM: 2439700,
          radiusOuterM: 540000,
          radiusInnerM: 0,
          densityAvgKgM3: 8100,
          composition: 'Crystalline metallic iron-nickel alloy',
          pWaveSpeedM_S: 8800,
          sWaveSpeedM_S: 4100,
          temperatureK: { top: 2100, bottom: 2300 },
          colorHex: '#fed7aa',
          uncertainty: 'Radar libration data confirmed a solid inner core of radius ~540 km (Margot et al. 2018).'
        }
      ]
    },

    venus: {
      planetId: 'venus',
      name: 'Сугар (Venus)',
      totalRadiusM: 6051800,
      surfaceGravity: 8.87,
      type: 'terrestrial',
      scientificSource: 'Magellan Radar Mapping, Pioneer Venus, Geodynamic Thermal Evolution Models',
      uncertaintyLevel: 'high', // No direct seismometers have landed on Venus yet
      layers: [
        {
          id: 'crust',
          name: 'Crust (Бүрхүүл)',
          state: 'solid',
          depthStartM: 0,
          depthEndM: 50000,
          radiusOuterM: 6051800,
          radiusInnerM: 6001800,
          densityAvgKgM3: 2850,
          composition: 'Tholeiitic and alkaline basaltic crust; stagnant single-plate lithosphere',
          pWaveSpeedM_S: 6200,
          sWaveSpeedM_S: 3600,
          temperatureK: { top: 737, bottom: 1100 },
          colorHex: '#d97706',
          uncertainty: 'Lacks Earth-like plate tectonics; evidence of periodic global catastrophic resurfacing.'
        },
        {
          id: 'upper_mantle',
          name: 'Upper Mantle (Дээд манти)',
          state: 'solid_ductile',
          depthStartM: 50000,
          depthEndM: 700000,
          radiusOuterM: 6001800,
          radiusInnerM: 5351800,
          densityAvgKgM3: 3500,
          composition: 'Peridotite & high-pressure pyroxene ductile silicates',
          pWaveSpeedM_S: 8100,
          sWaveSpeedM_S: 4500,
          temperatureK: { top: 1100, bottom: 2300 },
          colorHex: '#b45309',
          uncertainty: 'Extremely dry lithosphere makes rocks stronger than Earth despite higher surface temperatures.'
        },
        {
          id: 'lower_mantle',
          name: 'Lower Mantle (Доод манти)',
          state: 'solid_plastic',
          depthStartM: 700000,
          depthEndM: 2950000,
          radiusOuterM: 5351800,
          radiusInnerM: 3101800,
          densityAvgKgM3: 4950,
          composition: 'Bridgmanite & Ferropericlase high-pressure perovskite minerals',
          pWaveSpeedM_S: 12200,
          sWaveSpeedM_S: 6600,
          temperatureK: { top: 2300, bottom: 3700 },
          colorHex: '#991b1b',
          uncertainty: 'Deep thermal mantle plumes generate massive volcanic shield structures (e.g. Maat Mons).'
        },
        {
          id: 'core',
          name: 'Iron Core (Төмөр цөм)',
          state: 'partially_molten',
          depthStartM: 2950000,
          depthEndM: 6051800,
          radiusOuterM: 3101800,
          radiusInnerM: 0,
          densityAvgKgM3: 10400,
          composition: 'Liquid and partially solid Iron-Nickel alloy (~88% Fe, ~5% Ni, ~7% light elements)',
          pWaveSpeedM_S: 9200,
          sWaveSpeedM_S: 1200,
          temperatureK: { top: 3700, bottom: 5100 },
          colorHex: '#fbbf24',
          uncertainty: 'CRITICAL MYSTERY: Venus has no intrinsic magnetic dynamo, possibly due to lack of core convection or absence of inner core crystallization.'
        }
      ]
    },

    earth: {
      planetId: 'earth',
      name: 'Дэлхий (Earth)',
      totalRadiusM: 6371000,
      surfaceGravity: 9.80665,
      type: 'terrestrial',
      scientificSource: 'Preliminary Reference Earth Model (PREM): Dziewonski & Anderson (1981)',
      uncertaintyLevel: 'low', // Global seismic network, millions of recorded earthquakes
      layers: [
        {
          id: 'crust',
          name: 'Crust (Бүрхүүл)',
          state: 'solid',
          depthStartM: 0,
          depthEndM: 35000,
          radiusOuterM: 6371000,
          radiusInnerM: 6336000,
          densityAvgKgM3: 2800,
          composition: 'Felsic Granite (continental) to Mafic Basalt (oceanic), and sediments',
          pWaveSpeedM_S: 6500,
          sWaveSpeedM_S: 3700,
          temperatureK: { top: 288, bottom: 870 },
          colorHex: '#8d6e63',
          uncertainty: 'Thickness varies between 5 km (mid-ocean ridges) and 70 km (Himalayan continental roots).'
        },
        {
          id: 'upper_mantle',
          name: 'Upper Mantle & Asthenosphere (Дээд манти)',
          state: 'solid_ductile',
          depthStartM: 35000,
          depthEndM: 660000,
          radiusOuterM: 6336000,
          radiusInnerM: 5711000,
          densityAvgKgM3: 3500,
          composition: 'Peridotite (Olivine, Pyroxene, Garnet)',
          pWaveSpeedM_S: 8200,
          sWaveSpeedM_S: 4600,
          temperatureK: { top: 870, bottom: 2100 },
          colorHex: '#e65100',
          uncertainty: '410 & 660 km phase boundaries host water-bearing ringwoodite minerals.'
        },
        {
          id: 'lower_mantle',
          name: 'Lower Mantle (Доод манти)',
          state: 'solid_plastic',
          depthStartM: 660000,
          depthEndM: 2891000,
          radiusOuterM: 5711000,
          radiusInnerM: 3480000,
          densityAvgKgM3: 4900,
          composition: 'Bridgmanite ((Mg,Fe)SiO3) and Ferropericlase ((Mg,Fe)O)',
          pWaveSpeedM_S: 12500,
          sWaveSpeedM_S: 6800,
          temperatureK: { top: 2100, bottom: 3800 },
          colorHex: '#bf360c',
          uncertainty: 'D" boundary layer displays Ultra-Low Velocity Zones (ULVZs) and Large Low-Shear-Velocity Provinces (LLSVPs).'
        },
        {
          id: 'outer_core',
          name: 'Outer Core (Гадаад шингэн цөм)',
          state: 'liquid',
          depthStartM: 2891000,
          depthEndM: 5150000,
          radiusOuterM: 3480000,
          radiusInnerM: 1221000,
          densityAvgKgM3: 11000,
          composition: 'Liquid Iron-Nickel Alloy (~85% Fe, ~5% Ni, ~10% light elements: O, S, Si)',
          pWaveSpeedM_S: 9000,
          sWaveSpeedM_S: 0, // Zero shear wave transmission
          temperatureK: { top: 3800, bottom: 5400 },
          colorHex: '#ff8f00',
          uncertainty: 'Rapid thermal and compositional convection drives the planetary geodynamo.'
        },
        {
          id: 'inner_core',
          name: 'Inner Core (Дотоод хатуу цөм)',
          state: 'solid',
          depthStartM: 5150000,
          depthEndM: 6371000,
          radiusOuterM: 1221000,
          radiusInnerM: 0,
          densityAvgKgM3: 12900,
          composition: 'Solid crystalline Iron-Nickel (hcp lattice crystal structures)',
          pWaveSpeedM_S: 11200,
          sWaveSpeedM_S: 3600,
          temperatureK: { top: 5400, bottom: 5800 },
          colorHex: '#fef08a',
          uncertainty: 'Displays seismic anisotropy (P-waves travel ~3% faster along polar axis than equatorial axis).'
        }
      ]
    },

    mars: {
      planetId: 'mars',
      name: 'Ангараг (Mars)',
      totalRadiusM: 3389500,
      surfaceGravity: 3.72,
      type: 'terrestrial',
      scientificSource: 'NASA InSight SEIS Seismology (Stähler et al. 2021, Khan et al. 2021)',
      uncertaintyLevel: 'low', // Direct seismology verified across >1300 marsquakes
      layers: [
        {
          id: 'crust',
          name: 'Crust (Бүрхүүл)',
          state: 'solid',
          depthStartM: 0,
          depthEndM: 50000,
          radiusOuterM: 3389500,
          radiusInnerM: 3339500,
          densityAvgKgM3: 2600,
          composition: 'Tholeiitic Basalt, iron-rich regolith, weathered clay minerals',
          pWaveSpeedM_S: 4500,
          sWaveSpeedM_S: 2500,
          temperatureK: { top: 210, bottom: 550 },
          colorHex: '#8c2f0b',
          uncertainty: 'Crustal dichotomy: Northern lowlands ~30 km thick, southern highlands ~60-80 km thick.'
        },
        {
          id: 'mantle',
          name: 'Mantle (Манти)',
          state: 'solid_ductile',
          depthStartM: 50000,
          depthEndM: 1560000,
          radiusOuterM: 3339500,
          radiusInnerM: 1830000,
          densityAvgKgM3: 3500,
          composition: 'Iron-rich Silicates (Olivine, Pyroxene; ~18% FeO vs 8% on Earth)',
          pWaveSpeedM_S: 7800,
          sWaveSpeedM_S: 4300,
          temperatureK: { top: 550, bottom: 1750 },
          colorHex: '#c0392b',
          uncertainty: 'Mars lacks a deep Bridgmanite lower mantle because internal pressure is insufficient before reaching the core.'
        },
        {
          id: 'core',
          name: 'Liquid Core (Шингэн цөм)',
          state: 'liquid',
          depthStartM: 1560000,
          depthEndM: 3389500,
          radiusOuterM: 1830000,
          radiusInnerM: 0,
          densityAvgKgM3: 6100,
          composition: 'Liquid Fe-Ni alloy with high Sulfur content (~15-18 wt%) plus light C, O, H elements',
          pWaveSpeedM_S: 5000,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 1750, bottom: 2200 },
          colorHex: '#f59e0b',
          uncertainty: 'InSight confirmed a surprisingly large, low-density molten core (1830 km radius). A solid inner core remains undetected.'
        }
      ]
    },

    jupiter: {
      planetId: 'jupiter',
      name: 'Бархасбадь (Jupiter)',
      totalRadiusM: 69911000,
      surfaceGravity: 24.79,
      type: 'gas_giant',
      scientificSource: 'NASA Juno Orbiter Gravimetry & Dynamo Mapping (Guillot et al. 2018, Connerney et al. 2018)',
      uncertaintyLevel: 'moderate', // Core dilution and metallic boundary accurately modeled
      layers: [
        {
          id: 'atmosphere',
          name: 'Molecular Atmosphere (Атмосфер)',
          state: 'gas',
          depthStartM: 0,
          depthEndM: 1000000,
          radiusOuterM: 69911000,
          radiusInnerM: 68911000,
          densityAvgKgM3: 80,
          composition: 'H2 (~89%), He (~10%), Ammonia, Water-ice clouds; intense zonal jet streams (3000 km deep)',
          pWaveSpeedM_S: 1800,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 165, bottom: 2000 },
          colorHex: '#d97706',
          uncertainty: 'Cloud decks exhibit anticyclonic storms (Great Red Spot) and ammonia plumes.'
        },
        {
          id: 'fluid_hydrogen',
          name: 'Supercritical Fluid Hydrogen (Шингэн молекулт устөрөгч)',
          state: 'fluid',
          depthStartM: 1000000,
          depthEndM: 14000000,
          radiusOuterM: 68911000,
          radiusInnerM: 55911000,
          densityAvgKgM3: 750,
          composition: 'Supercritical liquid H2 & He; continuous density gradient without solid phase boundary',
          pWaveSpeedM_S: 4500,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 2000, bottom: 8500 },
          colorHex: '#b45309',
          uncertainty: 'Transition from molecular gas to supercritical fluid occurs smoothly without phase surface.'
        },
        {
          id: 'metallic_hydrogen',
          name: 'Liquid Metallic Hydrogen (Шингэн металл устөрөгч)',
          state: 'liquid_metallic',
          depthStartM: 14000000,
          depthEndM: 56000000,
          radiusOuterM: 55911000,
          radiusInnerM: 13911000,
          densityAvgKgM3: 2400,
          composition: 'Degenerate metallic liquid hydrogen with dissociated protons and mobile electrons',
          pWaveSpeedM_S: 12000,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 8500, bottom: 20000 },
          colorHex: '#6366f1',
          uncertainty: 'Extremely high electrical conductivity drives Jupiter\'s immense magnetosphere (14x stronger than Earth).'
        },
        {
          id: 'diffuse_core',
          name: 'Diffuse "Fuzzy" Core (Сарнимал цөм)',
          state: 'dilute_solid_fluid',
          depthStartM: 56000000,
          depthEndM: 69911000,
          radiusOuterM: 13911000,
          radiusInnerM: 0,
          densityAvgKgM3: 11500,
          composition: 'Dilute mixture of rock, silicates, ices, and metallic hydrogen (~10-25 Earth masses)',
          pWaveSpeedM_S: 18000,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 20000, bottom: 24000 },
          colorHex: '#38bdf8',
          uncertainty: 'REVOLUTIONARY JUNO DISCOVERY: Jupiter does not possess a compact rocky core; instead, its core is dilute and dissolved across ~30-50% of the radius.'
        }
      ]
    },

    saturn: {
      planetId: 'saturn',
      name: 'Санчир (Saturn)',
      totalRadiusM: 58232000,
      surfaceGravity: 10.44,
      type: 'gas_giant',
      scientificSource: 'Cassini Grand Finale Ring Seismology & Gravity (Mankovich & Fuller 2021)',
      uncertaintyLevel: 'moderate', // Ring waves provided continuous seismological probe of interior
      hasRings: true,
      ringInnerRadiusM: 74500000,
      ringOuterRadiusM: 140220000,
      layers: [
        {
          id: 'atmosphere',
          name: 'Molecular Atmosphere (Атмосфер)',
          state: 'gas',
          depthStartM: 0,
          depthEndM: 1000000,
          radiusOuterM: 58232000,
          radiusInnerM: 57232000,
          densityAvgKgM3: 60,
          composition: 'H2 (~96%), He (~3%), Methane, Ammonia haze; equatorial jet streams up to 1800 km/h',
          pWaveSpeedM_S: 1600,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 134, bottom: 1800 },
          colorHex: '#eab308',
          uncertainty: 'Thicker haze layer than Jupiter due to weaker solar heating and lower gravity.'
        },
        {
          id: 'fluid_hydrogen',
          name: 'Liquid Hydrogen & Helium Rain (Шингэн устөрөгч ба гелийн бороо)',
          state: 'fluid',
          depthStartM: 1000000,
          depthEndM: 20000000,
          radiusOuterM: 57232000,
          radiusInnerM: 38232000,
          densityAvgKgM3: 600,
          composition: 'Liquid molecular hydrogen; helium immiscibility causes "helium rain" droplets falling into depth',
          pWaveSpeedM_S: 4200,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 1800, bottom: 6500 },
          colorHex: '#ca8a04',
          uncertainty: 'Helium raindrop condensation explains why Saturn emits 2.5x more heat than it receives from the Sun.'
        },
        {
          id: 'metallic_hydrogen',
          name: 'Convective Metallic Hydrogen (Металл устөрөгч)',
          state: 'liquid_metallic',
          depthStartM: 20000000,
          depthEndM: 45000000,
          radiusOuterM: 38232000,
          radiusInnerM: 13232000,
          densityAvgKgM3: 2000,
          composition: 'High-pressure liquid metallic hydrogen driving Saturn\'s axisymmetric magnetic field',
          pWaveSpeedM_S: 10500,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 6500, bottom: 10500 },
          colorHex: '#4f46e5',
          uncertainty: 'Magnetic field is almost perfectly aligned with the rotation axis (<0.01° tilt), shielded by a stably stratified outer shell.'
        },
        {
          id: 'diffuse_core',
          name: 'Massive Diffuse Core (Өргөн тархсан цөм)',
          state: 'dilute_solid_fluid',
          depthStartM: 45000000,
          depthEndM: 58232000,
          radiusOuterM: 13232000,
          radiusInnerM: 0,
          densityAvgKgM3: 7500,
          composition: 'Diffuse rock, silicate, and water-ice slurry (~17 Earth masses) extending across 60% of Saturn\'s radius',
          pWaveSpeedM_S: 15000,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 10500, bottom: 12500 },
          colorHex: '#06b6d4',
          uncertainty: 'Cassini ring seismology demonstrated that Saturn\'s core is stably stratified and spans 0.6 R_Saturn.'
        }
      ]
    },

    uranus: {
      planetId: 'uranus',
      name: 'Тэнгэрийн ван (Uranus)',
      totalRadiusM: 25362000,
      surfaceGravity: 8.69,
      type: 'ice_giant',
      scientificSource: 'Voyager 2 Flyby, High-Pressure Ice Shock Experiments (Millot et al. 2019, Helled et al. 2020)',
      uncertaintyLevel: 'high', // Visited by only one flyby (Voyager 2, 1986)
      layers: [
        {
          id: 'atmosphere',
          name: 'Hydrogen-Methane Atmosphere (Агаар мандал)',
          state: 'gas',
          depthStartM: 0,
          depthEndM: 4000000,
          radiusOuterM: 25362000,
          radiusInnerM: 21362000,
          densityAvgKgM3: 150,
          composition: 'H2 (~83%), He (~15%), Methane (~2.3%, absorbing red light to produce cyan hue)',
          pWaveSpeedM_S: 2100,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 76, bottom: 1200 },
          colorHex: '#22d3ee',
          uncertainty: 'Lowest internal heat flux of all giant planets; almost no excess heat radiated.'
        },
        {
          id: 'ionic_water_mantle',
          name: 'Supercritical "Slushy" Mantle (Ус, аммиакийн ионт манти)',
          state: 'ionic_fluid',
          depthStartM: 4000000,
          depthEndM: 20500000,
          radiusOuterM: 21362000,
          radiusInnerM: 4862000,
          densityAvgKgM3: 2200,
          composition: 'Hot, dense, electrically conductive fluid of Water (H2O), Ammonia (NH3), and Methane (CH4)',
          pWaveSpeedM_S: 6500,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 1200, bottom: 5000 },
          colorHex: '#0891b2',
          uncertainty: 'Convective motion in this thin conductive shell produces Uranus\'s highly tilted (59°) and offset multipolar magnetic field.'
        },
        {
          id: 'rocky_core',
          name: 'Silicate-Iron Rock Core (Чулуулаг цөм)',
          state: 'solid',
          depthStartM: 20500000,
          depthEndM: 25362000,
          radiusOuterM: 4862000,
          radiusInnerM: 0,
          densityAvgKgM3: 7800,
          composition: 'Silicate rock, iron, and nickel core (~0.5 - 1.0 Earth mass)',
          pWaveSpeedM_S: 10500,
          sWaveSpeedM_S: 4800,
          temperatureK: { top: 5000, bottom: 6000 },
          colorHex: '#94a3b8',
          uncertainty: 'May be partly mixed into the mantle rather than forming a distinct sharp interface.'
        }
      ]
    },

    neptune: {
      planetId: 'neptune',
      name: 'Далайн ван (Neptune)',
      totalRadiusM: 24622000,
      surfaceGravity: 11.15,
      type: 'ice_giant',
      scientificSource: 'Voyager 2 Flyby, Laser-Driven Compression Laboratory Benchmarks (Nature 2019)',
      uncertaintyLevel: 'high', // Visited once (Voyager 2, 1989)
      layers: [
        {
          id: 'atmosphere',
          name: 'Dynamic Blue Atmosphere (Агаар мандал)',
          state: 'gas',
          depthStartM: 0,
          depthEndM: 3500000,
          radiusOuterM: 24622000,
          radiusInnerM: 21122000,
          densityAvgKgM3: 180,
          composition: 'H2 (~80%), He (~19%), Methane (~1.5%, giving vivid azure color); supersonic winds up to 2100 km/h',
          pWaveSpeedM_S: 2300,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 72, bottom: 1300 },
          colorHex: '#2563eb',
          uncertainty: 'Active internal heat source powers violent storms like the Great Dark Spot.'
        },
        {
          id: 'superionic_water_mantle',
          name: 'Superionic Water Mantle & Diamond Rain (Суперионт ус ба алмазан бороо)',
          state: 'superionic_fluid',
          depthStartM: 3500000,
          depthEndM: 19500000,
          radiusOuterM: 21122000,
          radiusInnerM: 5122000,
          densityAvgKgM3: 2500,
          composition: 'Superionic water (oxygen forms crystal lattice, protons diffuse freely); pyrolytic methane precipitation ("Diamond Rain")',
          pWaveSpeedM_S: 7200,
          sWaveSpeedM_S: 0,
          temperatureK: { top: 1300, bottom: 5500 },
          colorHex: '#1d4ed8',
          uncertainty: 'Extreme pressure (>150 GPa) splits methane into pure carbon crystals, releasing gravitational heat as diamonds sink toward core.'
        },
        {
          id: 'rocky_core',
          name: 'Silicate-Iron Core (Чулуулаг цөм)',
          state: 'solid',
          depthStartM: 19500000,
          depthEndM: 24622000,
          radiusOuterM: 5122000,
          radiusInnerM: 0,
          densityAvgKgM3: 8200,
          composition: 'Dense silicate rock, metallic iron-nickel, and settled diamond carbon deposits',
          pWaveSpeedM_S: 11000,
          sWaveSpeedM_S: 5000,
          temperatureK: { top: 5500, bottom: 6500 },
          colorHex: '#cbd5e1',
          uncertainty: 'Core mass estimated at ~1.2 Earth masses; high pressure stabilizes iron-carbon alloys.'
        }
      ]
    }
  };

  /**
   * Retrieves interior model for any of the 8 planets
   */
  function getInteriorModel(planetKey) {
    if (!planetKey) return null;
    const key = String(planetKey).toLowerCase().trim();
    return INTERIOR_MODELS[key] || null;
  }

  /**
   * Identifies which layer a given depth (in meters) belongs to
   */
  function getLayerAtDepth(planetKey, depthM) {
    const model = getInteriorModel(planetKey);
    if (!model) return null;
    if (depthM < 0) depthM = 0;
    if (depthM > model.totalRadiusM) depthM = model.totalRadiusM;

    for (let i = 0; i < model.layers.length; i++) {
      const layer = model.layers[i];
      if (depthM >= layer.depthStartM && depthM <= layer.depthEndM) {
        return layer;
      }
    }
    return model.layers[model.layers.length - 1];
  }

  /**
   * Calculates hydrostatic pressure P(z) = integral(rho(r) * g(r) dr)
   * Accurately tuned for all 8 planets based on their internal gravity and density profiles.
   */
  function calculateHydrostaticPressurePa(planetKey, depthM) {
    const model = getInteriorModel(planetKey);
    if (!model) return 0;
    if (depthM <= 0) return 101325; // 1 atm surface / reference datum
    if (depthM > model.totalRadiusM) depthM = model.totalRadiusM;

    let totalPressurePa = 0;
    // Adapt step size to planetary scale: 20 km for small terrestrial, 200 km for gas giants
    const stepSizeM = model.totalRadiusM > 10000000 ? 250000 : 25000;
    let currentDepth = 0;

    while (currentDepth < depthM) {
      const step = Math.min(stepSizeM, depthM - currentDepth);
      const evalDepth = currentDepth + step * 0.5;
      const radiusAtStep = Math.max(0, model.totalRadiusM - evalDepth);
      const layer = getLayerAtDepth(planetKey, evalDepth);
      const density = layer ? layer.densityAvgKgM3 : 3000;

      // Realistic g(r) profile based on planetary differentiation
      let g_local;
      const rRatio = radiusAtStep / model.totalRadiusM;

      if (planetKey === 'earth') {
        if (evalDepth < 2891000) {
          g_local = 9.8 + (evalDepth / 2891000) * 0.9; // Mantle peak ~10.7 m/s^2 at CMB
        } else {
          g_local = 10.7 * Math.max(0, radiusAtStep / 3480000);
        }
      } else if (planetKey === 'jupiter') {
        // Jupiter's massive core concentration keeps g between 24 and 38 m/s^2 down to 0.4 R, then drops to 0
        if (rRatio > 0.3) {
          g_local = model.surfaceGravity * (1.0 + (1.0 - rRatio) * 0.45);
        } else {
          g_local = model.surfaceGravity * 1.35 * (rRatio / 0.3);
        }
      } else if (planetKey === 'saturn') {
        if (rRatio > 0.35) {
          g_local = model.surfaceGravity * (1.0 + (1.0 - rRatio) * 0.35);
        } else {
          g_local = model.surfaceGravity * 1.25 * (rRatio / 0.35);
        }
      } else {
        // General differentiated terrestrial / ice giant profile
        if (rRatio > 0.4) {
          g_local = model.surfaceGravity * (0.85 + 0.25 * (1.0 - rRatio));
        } else {
          g_local = model.surfaceGravity * (rRatio / 0.4);
        }
      }

      totalPressurePa += density * g_local * step;
      currentDepth += step;
    }

    return totalPressurePa;
  }

  /**
   * Calculates temperature approximation T(z) at a given depth
   */
  function calculateTemperatureK(planetKey, depthM) {
    const model = getInteriorModel(planetKey);
    if (!model) return 288;
    const layer = getLayerAtDepth(planetKey, depthM);
    if (!layer) return 288;

    const layerThickness = Math.max(1, layer.depthEndM - layer.depthStartM);
    const fraction = Math.min(1, Math.max(0, (depthM - layer.depthStartM) / layerThickness));
    const tTop = layer.temperatureK.top;
    const tBottom = layer.temperatureK.bottom;

    return tTop + fraction * (tBottom - tTop);
  }

  /**
   * Seismic Wave Behavior & Shadow Zone Raycaster
   */
  function calculateSeismicWaveProfile(planetKey, epicentralAngleDeg) {
    const model = getInteriorModel(planetKey);
    if (!model) return null;

    const angle = Math.abs(epicentralAngleDeg) % 360;
    const isTerrestrial = model.type === 'terrestrial';

    if (!isTerrestrial) {
      return {
        planet: planetKey,
        epicentralAngleDeg: angle,
        hasDirectP: false,
        hasDirectS: false,
        pStatus: 'Шингэн/хий төлөв: Сонгодог газар хөдлөлтийн голомт байхгүй',
        sStatus: 'Хийн болон мөсөн аваргуудад хөндлөн долгион (S-wave) тарахгүй',
        explanation: 'Хийн болон мөсөн аварга гаригууд хатуу гадаргагүй тул тектоник газар хөдлөлт үүсэхгүй; агаарын даралтын акустик долгионоор (Helioseismology) дотоод бүтцийг судалдаг.'
      };
    }

    if (planetKey === 'earth') {
      const hasDirectP = !(angle > 104 && angle < 140);
      const hasCoreRefractedPKP = (angle >= 140 && angle <= 180);
      const hasDirectS = (angle <= 104);

      let pStatus = 'Direct P-Wave Detected';
      if (!hasDirectP && !hasCoreRefractedPKP) {
        pStatus = 'P-Wave Shadow Zone (Refracted away by Core-Mantle Boundary)';
      } else if (hasCoreRefractedPKP) {
        pStatus = 'PKP Wave (Refracted through liquid Outer Core)';
      }

      let sStatus = hasDirectS 
        ? 'Direct S-Wave Detected'
        : 'S-Wave Shadow Zone: Shear waves cannot propagate through liquid Outer Core';

      return {
        planet: 'earth',
        epicentralAngleDeg: angle,
        hasDirectP,
        hasDirectS,
        hasCoreRefractedPKP,
        pStatus,
        sStatus,
        explanation: 'Дэлхийн шингэн гадаад цөм нь 104°-180° хооронд S-долгионы сүүдрийн бүсийг (Shadow Zone) үүсгэдэг учир шингэн нь хайчлах хүчдэлийг (Shear stress) дамжуулдаггүй (mu = 0).'
      };
    } else if (planetKey === 'mars') {
      const hasDirectS = (angle <= 98);
      return {
        planet: 'mars',
        epicentralAngleDeg: angle,
        hasDirectP: true,
        hasDirectS: hasDirectS,
        pStatus: 'InSight SEIS: P-Wave Detected',
        sStatus: hasDirectS 
          ? 'Direct S-Wave Detected' 
          : 'S-Wave Shadow Zone: Ангарагийн харьцангуй том шингэн цөмд хаагдсан',
        explanation: 'NASA InSight станц Ангарагийн шингэн төмөр цөм нь 1830 км радиустай том тул 98°-аас дээш өнцөгт S-долгионы сүүдрийн бүс үүсгэдгийг баталсан.'
      };
    } else if (planetKey === 'mercury') {
      const hasDirectS = (angle <= 82);
      return {
        planet: 'mercury',
        epicentralAngleDeg: angle,
        hasDirectP: true,
        hasDirectS: hasDirectS,
        pStatus: 'P-Wave Detected',
        sStatus: hasDirectS ? 'Direct S-Wave Detected' : 'S-Wave Blocked by Massive Core',
        explanation: 'Буд гаригийн 83% радиусыг эзэлдэг асар том шингэн гадаад цөм нь S-долгионыг ихэнх бөмбөрцөгт шууд хаадаг.'
      };
    } else {
      // Venus
      const hasDirectS = (angle <= 102);
      return {
        planet: 'venus',
        epicentralAngleDeg: angle,
        hasDirectP: true,
        hasDirectS: hasDirectS,
        pStatus: 'P-Wave Estimated',
        sStatus: hasDirectS ? 'Direct S-Wave Estimated' : 'S-Wave Blocked by Molten Core',
        explanation: 'Сугар гаригийн цөм хайламхай шингэн байх өндөр магадлалтай тул Дэлхийтэй адил S-долгионы сүүдрийн бүс үүсгэнэ гэж таамагладаг.'
      };
    }
  }

  /**
   * Generates comparative scientific telemetry and structural metrics between two planets
   */
  function generatePlanetComparisonData(planetAKey, planetBKey) {
    const pA = PlanetData ? PlanetData.getPlanet(planetAKey) : null;
    const pB = PlanetData ? PlanetData.getPlanet(planetBKey) : null;
    const mA = getInteriorModel(planetAKey);
    const mB = getInteriorModel(planetBKey);

    if (!pA || !pB || !mA || !mB) return null;

    const rA = pA.meanRadiusM;
    const rB = pB.meanRadiusM;
    const mA_kg = pA.massKg;
    const mB_kg = pB.massKg;
    const volA = (4 / 3) * Math.PI * Math.pow(rA, 3);
    const volB = (4 / 3) * Math.PI * Math.pow(rB, 3);
    const rhoA = Math.round(mA_kg / volA);
    const rhoB = Math.round(mB_kg / volB);

    const radiusRatio = rB / rA;
    const massRatio = mB_kg / mA_kg;
    const gravityRatio = pB.surfaceGravity / pA.surfaceGravity;
    const densityRatio = rhoB / rhoA;

    return {
      planetA: {
        key: planetAKey,
        data: pA,
        model: mA,
        radiusKm: Math.round(rA / 1000),
        massKg: mA_kg,
        surfaceGravity: pA.surfaceGravity,
        densityKgM3: rhoA,
        coreRadiusKm: Math.round(mA.layers[mA.layers.length - 1].radiusOuterM / 1000),
        coreRatioPercent: Math.round((mA.layers[mA.layers.length - 1].radiusOuterM / mA.totalRadiusM) * 100)
      },
      planetB: {
        key: planetBKey,
        data: pB,
        model: mB,
        radiusKm: Math.round(rB / 1000),
        massKg: mB_kg,
        surfaceGravity: pB.surfaceGravity,
        densityKgM3: rhoB,
        coreRadiusKm: Math.round(mB.layers[mB.layers.length - 1].radiusOuterM / 1000),
        coreRatioPercent: Math.round((mB.layers[mB.layers.length - 1].radiusOuterM / mB.totalRadiusM) * 100)
      },
      ratios: {
        radiusBToA: radiusRatio,
        massBToA: massRatio,
        gravityBToA: gravityRatio,
        densityBToA: densityRatio
      }
    };
  }

  /**
   * Generates an in-depth scientific explanation in clear Mongolian answering "Why Are They Different?"
   */
  function explainPlanetaryDifferences(planetAKey, planetBKey) {
    const mA = getInteriorModel(planetAKey);
    const mB = getInteriorModel(planetBKey);
    const pA = PlanetData ? PlanetData.getPlanet(planetAKey) : null;
    const pB = PlanetData ? PlanetData.getPlanet(planetBKey) : null;

    if (!mA || !mB || !pA || !pB) {
      return 'Харьцуулах гаригуудын өгөгдөл олдсонгүй.';
    }

    const nameA = pA.name_mn || pA.name;
    const nameB = pB.name_mn || pB.name;

    // Both Terrestrial
    if (mA.type === 'terrestrial' && mB.type === 'terrestrial') {
      return `
        <h4 style="color:#38bdf8;margin:0 0 8px">${nameA} ба ${nameB} гаригуудын үндсэн ялгааны шинжлэх ухааны учир:</h4>
        <p><strong>1. Нарнаас алслагдсан зай ба Цөм-Бүрхүүлийн харьцаа:</strong> Хоёулаа нарны аймгийн "цасан шугам"-ын (Frost line ~2.7 AU) наана үүссэн хатуу чулуулаг гаригууд боловч эхэн үеийн мөргөлдөөн ба дулааны түүх нь тэс өөр. Жишээлбэл, Буд гаригийн радиусын 83%-ийг асар том төмөр цөм эзэлдэг нь эрт үед гадаад бүрхүүлээ мөргөлдөөнөөр алдсантай холбоотой бол Дэлхийн цөм ~54%-ийг эзэлдэг.</p>
        <p><strong>2. Тектоник хөдөлгөөн ба Соронзон орон:</strong> Дэлхий нь ялтасны тектоник бүхий идэвхтэй гадарга, динамик шингэн гадаад цөмөөс үүдэлтэй хүчтэй соронзон бамбайтай. Харин Ангараг жижиг хэмжээтэй тул дотоод дулаанаа хурдан алдаж, дэлхийн хэмжээний геодинамо нь 4 тэрбум жилийн өмнө унтарсан. Сугар нь Дэлхийтэй адил хэмжээтэй ч эргэлт маш удаан, ялтасны хөдөлгөөнгүй тул нийтлэг соронзон орон үүсгэдэггүй.</p>
        <p><strong>3. Агаар мандал ба Усны төлөв:</strong> Масс багатай Ангарагийн татах хүч сул тул нарны салхинд агаараа алдсан бол Сугарын хэт өтгөн нүүрсхүчлийн хийн хүлэмжийн нөлөө гадаргыг 464 °C хүртэл шатаажээ. Зөвхөн Дэлхийд л ус 3 төлөвт зэрэг орших гурвалсан цэгийн тэнцвэрт оршдог.</p>
      `;
    }

    // Both Gas/Ice Giants
    if ((mA.type.includes('giant')) && (mB.type.includes('giant'))) {
      return `
        <h4 style="color:#38bdf8;margin:0 0 8px">${nameA} ба ${nameB} аварга гаригуудын шинжлэх ухааны ялгаа:</h4>
        <p><strong>1. Хийн аварга (Бархасбадь, Санчир) ба Мөсөн аварга (Тэнгэрийн ван, Далайн ван):</strong> Бархасбадь, Санчир нь маш их хэмжээний устөрөгч, гелийг шууд татаж авсан тул эзлэхүүний дийлэнх нь устөрөгч байдаг. Харин Тэнгэрийн ван, Далайн ван нь нарны аймгийн захын хүйтэн бүсэд ус, аммиак, метаны мөсөн бөөгнөрөл дээр суурилан хөгжсөн "Мөсөн аварга" юм.</p>
        <p><strong>2. Металл устөрөгч ба Суперионт ус:</strong> Бархасбадь, Санчирын гүнд хэт их даралтаас (1 сая атм-аас дээш) болж устөрөгч шингэн металл төлөвт шилжиж цахилгаан гүйдэл дамжуулдаг бол Тэнгэрийн ван, Далайн вангийн мантид "суперионт ус" (хүчилтөрөгчийн талст торон дундуур протонууд чөлөөтэй шингэн шиг урсдаг халуун мөс) оршдог.</p>
        <p><strong>3. Цөмийн бүтэц:</strong> Сүүлийн үеийн NASA Juno ба Cassini судалгаагаар хийн аваргуудын цөм нь хатуу чулуулаг биш, харин устөрөгчтэй холилдсон 30-60% хүртэл тэлсэн "сарнимал цөм" (diffuse fuzzy core) болох нь тогтоогдсон.</p>
      `;
    }

    // Terrestrial vs Giant
    return `
      <h4 style="color:#38bdf8;margin:0 0 8px">${nameA} (Чулуулаг) ба ${nameB} (Аварга) гаригийн эрс ялгаа:</h4>
      <p><strong>1. Цасан шугамын (Frost Line) зарчим:</strong> Нарны аймаг анх бүрэлдэхэд 2.7 AU (одоогийн Ангараг ба Бархасбадийн хоорондох солирын бүс) зайд ус, метан хөлдөж хатуу мөс болох "цасан шугам" оршиж байв. Энэ шугамын дотор зөвхөн төмөр, силикат чулуулаг конденсацлагдаж ${mA.type === 'terrestrial' ? nameA : nameB} мэтийн жижиг, нягт чулуулаг гаригууд үүссэн. Шугамын гадна мөс элбэг байсан тул богино хугацаанд асар том хүндийн хүчний төв үүсгэж хийг хуримтлуулжээ.</p>
      <p><strong>2. Хатуу гадарга ба Даралтын эрс ялгаа:</strong> Чулуулаг гариг дээр сансрын хөлөг буух хатуу царцдас гадарга байдаг бол хийн болон мөсөн аваргад буух гадарга байхгүй; агаар мандал гүн рүүгээ шингэн, цаашлаад металл болон өтгөрнө.</p>
      <p><strong>3. Хүндийн хүч ба Масс:</strong> Аварга гаригийн масс хэдэн арваас хэдэн зуу дахин их тул асар өндөр татах хүч үүсгэж, цагираг болон олон арван дагуулыг удирддаг.</p>
    `;
  }

  return {
    INTERIOR_MODELS,
    getInteriorModel,
    getLayerAtDepth,
    calculateHydrostaticPressurePa,
    calculateTemperatureK,
    calculateSeismicWaveProfile,
    generatePlanetComparisonData,
    explainPlanetaryDifferences
  };
}));
