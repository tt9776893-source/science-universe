/**
 * SCIENCE UNIVERSE — PLANETARY DATA REPOSITORY
 * Module: PlanetData.js
 * 
 * Authoritative scientific dataset for all eight major solar system planets.
 * Data Sources:
 * - NASA Planetary Fact Sheet (Dr. David R. Williams, NASA GSFC, 2024 update)
 * - IAU Working Group on Cartographic Coordinates and Rotational Elements (Archinal et al., 2018)
 * - Preliminary Reference Earth Model (PREM - Dziewonski & Anderson, 1981)
 * - NASA InSight Mission SEIS Data (Stähler et al., Science 2021; Khan et al., Science 2021)
 * 
 * Standards:
 * - Pure SI units (kg, m, s, N, Pa, K, m/s).
 * - Documented reference datum (e.g. 1-bar / 100 kPa level for gas/ice giants).
 * - Null used with documented reason where values are physically non-existent or undefined.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PlanetData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Physical constants (CODATA 2018 recommended values)
  const CONSTANTS = {
    G: 6.67430e-11,            // Gravitational constant (m^3 kg^-1 s^-2)
    AU: 149597870700,          // Astronomical Unit in meters
    SIGMA: 5.670374419e-8,     // Stefan-Boltzmann constant (W m^-2 K^-4)
    SOLAR_LUMINOSITY: 3.828e26,// Solar luminosity (Watts)
    STANDARD_G: 9.80665,       // Standard Earth gravity (m s^-2)
    STANDARD_ATM: 101325,      // Standard atmosphere (Pa)
    KB: 1.380649e-23           // Boltzmann constant (J K^-1)
  };

  const PLANETS = {
    mercury: {
      id: 'mercury',
      name: 'Mercury',
      name_mn: 'Буд',
      category: 'terrestrial',
      hasSolidSurface: true,
      massKg: 3.3011e23,
      meanRadiusM: 2439700,
      equatorialRadiusM: 2440500,
      polarRadiusM: 2438300,
      surfaceGravity: 3.70, // m/s^2
      rotationPeriodS: 5067032, // 58.646 days (sidereal)
      orbitPeriodS: 7600530, // 87.969 days
      meanSolarDistanceM: 57909050000, // 0.3871 AU
      perihelionM: 46001200000,
      aphelionM: 69816900000,
      orbitalEccentricity: 0.2056,
      axialTiltDeg: 0.034,
      surfacePressurePa: 1.0e-9, // Tenuous surface-bound exosphere
      surfacePressureContext: 'Surface-bound exosphere; essentially a hard vacuum at surface level (< 10^-9 Pa).',
      atmosphericComposition: [
        { formula: 'O', name: 'Oxygen', fraction: 0.42 },
        { formula: 'Na', name: 'Sodium', fraction: 0.29 },
        { formula: 'H2', name: 'Hydrogen', fraction: 0.22 },
        { formula: 'He', name: 'Helium', fraction: 0.06 },
        { formula: 'K', name: 'Potassium', fraction: 0.005 }
      ],
      meanTemperatureK: 440,
      temperatureRangeK: { min: 100, max: 700 },
      temperatureContext: 'Diurnal surface extremes from 100 K (-173°C) at night to 700 K (427°C) at local noon.',
      escapeVelocityM_S: 4250,
      albedoBond: 0.088,
      magneticFieldTesla: 3.0e-7, // Global dipole (~1% of Earth)
      dataSources: ['NASA Planetary Fact Sheet (Williams 2024)', 'MESSENGER Mission (Solomon et al. 2018)'],
      uncertainties: 'Internal sulfur fraction in large metallic core is constrained to 5-10 wt%; deep mantle silicates are exceptionally thin (approx. 400 km).'
    },

    venus: {
      id: 'venus',
      name: 'Venus',
      name_mn: 'Сугар',
      category: 'terrestrial',
      hasSolidSurface: true,
      massKg: 4.8675e24,
      meanRadiusM: 6051800,
      equatorialRadiusM: 6051800,
      polarRadiusM: 6051800,
      surfaceGravity: 8.87,
      rotationPeriodS: -20996798, // Retrograde: 243.025 days
      orbitPeriodS: 19414080, // 224.70 days
      meanSolarDistanceM: 108208000000, // 0.7233 AU
      perihelionM: 107477000000,
      aphelionM: 108939000000,
      orbitalEccentricity: 0.0067,
      axialTiltDeg: 177.36, // Retrograde spin
      surfacePressurePa: 9.3e6, // ~92-93 bars
      surfacePressureContext: 'Direct in-situ measurements by Venera 7-14 probes at solid basaltic surface.',
      atmosphericComposition: [
        { formula: 'CO2', name: 'Carbon Dioxide', fraction: 0.965 },
        { formula: 'N2', name: 'Nitrogen', fraction: 0.035 },
        { formula: 'SO2', name: 'Sulfur Dioxide', fraction: 0.00015 },
        { formula: 'Ar', name: 'Argon', fraction: 0.00007 },
        { formula: 'H2O', name: 'Water Vapor', fraction: 0.00002 }
      ],
      meanTemperatureK: 737, // 464°C
      temperatureRangeK: { min: 710, max: 750 },
      temperatureContext: 'Super-greenhouse surface temperature; nearly isothermal from equator to poles due to atmospheric thermal inertia.',
      escapeVelocityM_S: 10360,
      albedoBond: 0.76,
      magneticFieldTesla: null, // No intrinsic dipolar dynamo detected
      magneticFieldContext: 'Intrinsic magnetic field is absent; induced ionospheric magnetosphere created by solar wind interaction (< 10^-8 T).',
      dataSources: ['NASA Planetary Fact Sheet', 'Venera Landers', 'Venus Express (ESA 2014)'],
      uncertainties: 'Core state (solid inner core vs completely liquid) remains unverified due to lack of surface seismic network.'
    },

    earth: {
      id: 'earth',
      name: 'Earth',
      name_mn: 'Дэлхий',
      category: 'terrestrial',
      hasSolidSurface: true,
      massKg: 5.9722e24,
      meanRadiusM: 6371000,
      equatorialRadiusM: 6378137,
      polarRadiusM: 6356752,
      surfaceGravity: 9.80665,
      rotationPeriodS: 86164.09, // 23h 56m 4.09s (sidereal day)
      orbitPeriodS: 31558149.8, // 365.256 days
      meanSolarDistanceM: 149598023000, // 1.000 AU
      perihelionM: 147095000000,
      aphelionM: 152100000000,
      orbitalEccentricity: 0.0167,
      axialTiltDeg: 23.44,
      surfacePressurePa: 101325, // 1 atm
      surfacePressureContext: 'Standard sea-level atmospheric datum.',
      atmosphericComposition: [
        { formula: 'N2', name: 'Nitrogen', fraction: 0.7808 },
        { formula: 'O2', name: 'Oxygen', fraction: 0.2095 },
        { formula: 'Ar', name: 'Argon', fraction: 0.0093 },
        { formula: 'CO2', name: 'Carbon Dioxide', fraction: 0.00042 }, // ~420 ppm
        { formula: 'H2O', name: 'Water Vapor', fraction: 0.004 } // Variable 0-4%
      ],
      meanTemperatureK: 288.15, // 15°C
      temperatureRangeK: { min: 184, max: 330 },
      temperatureContext: 'Surface air temperature measured 2m above ground (Vostok -89°C to Furnace Creek +57°C).',
      escapeVelocityM_S: 11186,
      albedoBond: 0.306,
      magneticFieldTesla: 3.1e-5, // ~31-60 microTesla active geodynamo
      dataSources: ['IERS Conventions (2010)', 'PREM (Dziewonski & Anderson 1981)', 'NOAA Global Monitoring Lab'],
      uncertainties: 'Geophysical standard reference benchmark; minor regional geoid and mantle plume variations.'
    },

    mars: {
      id: 'mars',
      name: 'Mars',
      name_mn: 'Ангараг',
      category: 'terrestrial',
      hasSolidSurface: true,
      massKg: 6.4171e23,
      meanRadiusM: 3389500,
      equatorialRadiusM: 3396200,
      polarRadiusM: 3376200,
      surfaceGravity: 3.72076,
      rotationPeriodS: 88642.66, // 24h 37m 22.66s (1 sol = 88775.24s)
      orbitPeriodS: 59355072, // 686.98 days
      meanSolarDistanceM: 227939366000, // 1.5237 AU
      perihelionM: 206650000000,
      aphelionM: 249261000000,
      orbitalEccentricity: 0.0934,
      axialTiltDeg: 25.19,
      surfacePressurePa: 610, // ~6.1 mbar (average surface)
      surfacePressureContext: 'Viking, Curiosity, Perseverance in-situ surface pressure; seasonal variation 400-870 Pa due to CO2 polar cap exchange.',
      atmosphericComposition: [
        { formula: 'CO2', name: 'Carbon Dioxide', fraction: 0.951 },
        { formula: 'N2', name: 'Nitrogen', fraction: 0.0259 },
        { formula: 'Ar', name: 'Argon', fraction: 0.0194 },
        { formula: 'O2', name: 'Oxygen', fraction: 0.0016 },
        { formula: 'CO', name: 'Carbon Monoxide', fraction: 0.0006 }
      ],
      meanTemperatureK: 210, // -63°C
      temperatureRangeK: { min: 140, max: 295 },
      temperatureContext: 'Surface diurnal swings from ~140 K at polar winter to ~295 K at equatorial summer noon.',
      escapeVelocityM_S: 5027,
      albedoBond: 0.250,
      magneticFieldTesla: null, // No global dipolar field
      magneticFieldContext: 'No active core geodynamo. Local remnant crustal paleomagnetism up to 1.5 microTesla in southern highlands.',
      dataSources: ['NASA Planetary Fact Sheet', 'NASA InSight Mission (Science 2021)', 'MGS Magnetometer'],
      uncertainties: 'InSight SEIS confirms a large liquid outer core radius (1830 ± 40 km) rich in light elements (S, C, O, H); existence of a solid inner core is currently unconfirmed and theoretical.'
    },

    jupiter: {
      id: 'jupiter',
      name: 'Jupiter',
      name_mn: 'Бархасбадь',
      category: 'gas_giant',
      hasSolidSurface: false,
      massKg: 1.8982e27,
      meanRadiusM: 69911000,
      equatorialRadiusM: 71492000,
      polarRadiusM: 66854000,
      surfaceGravity: 24.79, // At 1-bar level
      gravityContext: 'Evaluated at the conventional 1-bar (100 kPa) atmospheric pressure datum. No solid surface.',
      rotationPeriodS: 35730, // 9h 55m 30s (System III magnetic frame)
      orbitPeriodS: 374335776, // 11.862 yr
      meanSolarDistanceM: 778570000000, // 5.2044 AU
      perihelionM: 740595000000,
      aphelionM: 816363000000,
      orbitalEccentricity: 0.0489,
      axialTiltDeg: 3.13,
      surfacePressurePa: null,
      surfacePressureContext: 'Not applicable: Gas giant transitions continuously from gas to supercritical fluid to liquid metallic hydrogen without a sharp phase boundary.',
      referenceLevelPressurePa: 100000, // 1-bar datum
      atmosphericComposition: [
        { formula: 'H2', name: 'Molecular Hydrogen', fraction: 0.898 },
        { formula: 'He', name: 'Helium', fraction: 0.102 },
        { formula: 'CH4', name: 'Methane', fraction: 0.003 },
        { formula: 'NH3', name: 'Ammonia', fraction: 0.00026 },
        { formula: 'HD', name: 'Hydrogen Deuteride', fraction: 0.000028 }
      ],
      meanTemperatureK: 165, // At 1-bar level
      temperatureRangeK: { min: 112, max: 165 },
      temperatureContext: '165 K (-108°C) at 1-bar level; 112 K at 0.1-bar tropopause; deep interior exceeds 20,000 K.',
      escapeVelocityM_S: 59500,
      albedoBond: 0.503,
      magneticFieldTesla: 4.28e-4, // Huge equatorial field ~4.28 Gauss (14x Earth)
      dataSources: ['NASA Planetary Fact Sheet', 'Galileo Atmospheric Probe', 'Juno Mission (Bolton et al. 2017)'],
      uncertainties: 'Juno gravity data indicates a dilute, fuzzy core extending up to 0.3-0.5 Jovian radii rather than a compact rocky sphere.'
    },

    saturn: {
      id: 'saturn',
      name: 'Saturn',
      name_mn: 'Сугарчиг',
      category: 'gas_giant',
      hasSolidSurface: false,
      massKg: 5.6834e26,
      meanRadiusM: 58232000,
      equatorialRadiusM: 60268000,
      polarRadiusM: 54364000,
      surfaceGravity: 10.44, // At 1-bar level
      gravityContext: 'Evaluated at 1-bar atmospheric datum; lower than Earth surface gravity despite vast mass due to low mean density (687 kg/m^3).',
      rotationPeriodS: 38360, // ~10h 39m (Cassini ring seismology determination)
      orbitPeriodS: 929596608, // 29.457 yr
      meanSolarDistanceM: 1433530000000, // 9.582 AU
      perihelionM: 1357554000000,
      aphelionM: 1506500000000,
      orbitalEccentricity: 0.0565,
      axialTiltDeg: 26.73,
      surfacePressurePa: null,
      surfacePressureContext: 'Not applicable: Gas giant without solid surface. Reference datum set to 1-bar.',
      referenceLevelPressurePa: 100000,
      atmosphericComposition: [
        { formula: 'H2', name: 'Molecular Hydrogen', fraction: 0.963 },
        { formula: 'He', name: 'Helium', fraction: 0.0325 },
        { formula: 'CH4', name: 'Methane', fraction: 0.0045 },
        { formula: 'NH3', name: 'Ammonia', fraction: 0.000125 }
      ],
      meanTemperatureK: 134, // At 1-bar level
      temperatureRangeK: { min: 84, max: 134 },
      temperatureContext: '134 K (-139°C) at 1-bar level; 84 K at 0.1-bar level.',
      escapeVelocityM_S: 35500,
      albedoBond: 0.342,
      magneticFieldTesla: 2.1e-5, // Symmetrical dipole aligned with rotation axis (< 0.005° tilt)
      dataSources: ['NASA Planetary Fact Sheet', 'Cassini-Huygens Mission (Spilker et al. 2019)'],
      uncertainties: 'Exact bulk helium depletion mechanism (helium rainout) and inner diffuse core mass remain active research topics.'
    },

    uranus: {
      id: 'uranus',
      name: 'Uranus',
      name_mn: 'Тэнгэрийн ван',
      category: 'ice_giant',
      hasSolidSurface: false,
      massKg: 8.6810e25,
      meanRadiusM: 25362000,
      equatorialRadiusM: 25559000,
      polarRadiusM: 24973000,
      surfaceGravity: 8.69, // At 1-bar level
      gravityContext: 'Evaluated at 1-bar level. No solid planetary surface.',
      rotationPeriodS: -62064, // Retrograde: 17h 14m 24s
      orbitPeriodS: 2651486400, // 84.020 yr
      meanSolarDistanceM: 2872460000000, // 19.201 AU
      perihelionM: 2732696000000,
      aphelionM: 3001390000000,
      orbitalEccentricity: 0.0457,
      axialTiltDeg: 97.77, // Extreme side tilt (retrograde)
      surfacePressurePa: null,
      surfacePressureContext: 'Not applicable: Ice giant composed predominantly of supercritical water, methane, and ammonia "ices" under a thick H-He envelope.',
      referenceLevelPressurePa: 100000,
      atmosphericComposition: [
        { formula: 'H2', name: 'Molecular Hydrogen', fraction: 0.825 },
        { formula: 'He', name: 'Helium', fraction: 0.152 },
        { formula: 'CH4', name: 'Methane', fraction: 0.023 }
      ],
      meanTemperatureK: 76, // At 1-bar level
      temperatureRangeK: { min: 49, max: 76 },
      temperatureContext: '76 K (-197°C) at 1-bar level; 49 K minimum tropopause temperature (coldest recorded planetary atmosphere in Solar System).',
      escapeVelocityM_S: 21300,
      albedoBond: 0.300,
      magneticFieldTesla: 2.3e-5, // Tilted 59° from rotation axis and offset 0.3 radii from center
      dataSources: ['NASA Planetary Fact Sheet', 'Voyager 2 Flyby (Stone et al. 1986)'],
      uncertainties: 'Internal heat flow is anomalously low compared to Neptune; whether a giant impact stratified the interior or trapped interior heat is uncertain.'
    },

    neptune: {
      id: 'neptune',
      name: 'Neptune',
      name_mn: 'Далайн ван',
      category: 'ice_giant',
      hasSolidSurface: false,
      massKg: 1.02413e26,
      meanRadiusM: 24622000,
      equatorialRadiusM: 24764000,
      polarRadiusM: 24341000,
      surfaceGravity: 11.15, // At 1-bar level
      gravityContext: 'Evaluated at 1-bar level. No solid planetary surface.',
      rotationPeriodS: 57996, // 16h 6m 36s
      orbitPeriodS: 5200418560, // 164.79 yr
      meanSolarDistanceM: 4495060000000, // 30.047 AU
      perihelionM: 4471050000000,
      aphelionM: 4537380000000,
      orbitalEccentricity: 0.0113,
      axialTiltDeg: 28.32,
      surfacePressurePa: null,
      surfacePressureContext: 'Not applicable: Ice giant without solid surface. Reference level set to 1-bar.',
      referenceLevelPressurePa: 100000,
      atmosphericComposition: [
        { formula: 'H2', name: 'Molecular Hydrogen', fraction: 0.80 },
        { formula: 'He', name: 'Helium', fraction: 0.19 },
        { formula: 'CH4', name: 'Methane', fraction: 0.015 }
      ],
      meanTemperatureK: 72, // At 1-bar level
      temperatureRangeK: { min: 55, max: 72 },
      temperatureContext: '72 K (-201°C) at 1-bar level; strong internal heat source radiates 2.61 times the energy received from the Sun.',
      escapeVelocityM_S: 23500,
      albedoBond: 0.290,
      magneticFieldTesla: 1.4e-5, // Highly tilted (47°) and offset by 0.55 radii
      dataSources: ['NASA Planetary Fact Sheet', 'Voyager 2 Flyby (Smith et al. 1989)'],
      uncertainties: 'High-pressure physics of water-ammonia ionic and superionic mantle phases under megabar pressures is based on laser-driven shock experiments and ab-initio simulations.'
    }
  };

  /**
   * Helper to retrieve all planets or a single planet by key
   */
  function getPlanet(key) {
    if (!key) return null;
    const cleanKey = String(key).toLowerCase().trim();
    return PLANETS[cleanKey] || null;
  }

  function getAllPlanets() {
    return Object.values(PLANETS);
  }

  function getPlanetKeys() {
    return Object.keys(PLANETS);
  }

  function getRockyPlanets() {
    return Object.values(PLANETS).filter(p => p.hasSolidSurface);
  }

  return {
    CONSTANTS,
    PLANETS,
    getPlanet,
    getAllPlanets,
    getPlanetKeys,
    getRockyPlanets
  };
}));
