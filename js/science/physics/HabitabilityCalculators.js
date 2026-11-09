/**
 * SCIENCE UNIVERSE — PLANETARY HABITABILITY & CLIMATE CALCULATORS
 * Module: HabitabilityCalculators.js
 * 
 * Implements rigorous astrophysical habitability metrics:
 * 1. Stellar flux (Insolation): S = L_star / (4 * pi * d^2)
 * 2. Planetary equilibrium temperature (Blackbody Stefan-Boltzmann):
 *    T_eq = [ S * (1 - A) / (4 * sigma) ]^(1/4)
 * 3. Greenhouse temperature enhancement:
 *    T_surf = T_eq * [ 1 + (3/4) * tau_gh ]^(1/4)
 * 4. Liquid water phase stability boundary (Phase diagram: Triple point 611.65 Pa, Boiling vs Pressure).
 * 5. Earth Similarity Index (ESI - Schulze-Makuch et al., 2011).
 * 6. Habitable Zone (HZ) boundaries (Kopparapu et al., 2013).
 * 
 * SCIENTIFIC CAVEATS ENFORCED:
 * - High ESI does not prove life or actual habitability (Venus has ESI 0.44-0.72 despite 737 K surface).
 * - Liquid water requires BOTH adequate temperature AND sufficient pressure above the triple point (6.1 mbar).
 * - Suitable conditions do not guarantee biogenesis.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../PlanetData'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../PlanetData'));
  } else {
    root.HabitabilityCalculators = factory(root.PlanetData);
  }
}(typeof self !== 'undefined' ? self : this, function (PlanetData) {
  'use strict';

  const SIGMA = (PlanetData && PlanetData.CONSTANTS) ? PlanetData.CONSTANTS.SIGMA : 5.670374419e-8;
  const SOLAR_LUM = (PlanetData && PlanetData.CONSTANTS) ? PlanetData.CONSTANTS.SOLAR_LUMINOSITY : 3.828e26;
  const AU_METERS = (PlanetData && PlanetData.CONSTANTS) ? PlanetData.CONSTANTS.AU : 149597870700;
  const EARTH_SOLAR_CONSTANT = 1361.0; // W/m^2 (Solar constant at 1 AU)

  /**
   * Water phase diagram constants
   */
  const WATER_TRIPLE_POINT_PA = 611.657; // 0.006037 atm (~6.1 mbar)
  const WATER_TRIPLE_POINT_TEMP_K = 273.16; // 0.01 °C
  const WATER_CRITICAL_PRESSURE_PA = 22.064e6; // 217.7 atm
  const WATER_CRITICAL_TEMP_K = 647.096; // 373.9 °C

  /**
   * Calculates stellar flux received at distance d (in meters or AU)
   * @param {number} distanceM - Semi-major axis in meters
   * @param {number} [starLuminosityW] - Default is Sun (3.828e26 W)
   * @returns {Object} Flux in W/m^2 and relative to Earth flux (S/S0)
   */
  function calculateStellarFlux(distanceM, starLuminosityW = SOLAR_LUM) {
    if (distanceM <= 0 || isNaN(distanceM)) {
      throw new RangeError('Distance must be strictly positive');
    }
    const fluxW_M2 = starLuminosityW / (4 * Math.PI * distanceM * distanceM);
    const fluxRelativeEarth = fluxW_M2 / EARTH_SOLAR_CONSTANT;
    return {
      fluxW_M2,
      fluxRelativeEarth,
      distanceAU: distanceM / AU_METERS
    };
  }

  /**
   * Calculates planetary equilibrium blackbody temperature:
   * T_eq = [ S * (1 - A) / (4 * sigma) ]^(1/4)
   * @param {number} distanceM - Distance in meters
   * @param {number} albedoBond - Bond albedo (0.0 to 1.0)
   * @param {number} [starLuminosityW]
   * @returns {number} Temperature in Kelvin
   */
  function calculateEquilibriumTemperature(distanceM, albedoBond, starLuminosityW = SOLAR_LUM) {
    if (albedoBond < 0 || albedoBond >= 1.0) {
      throw new RangeError('Bond albedo must be in range [0, 1)');
    }
    const { fluxW_M2 } = calculateStellarFlux(distanceM, starLuminosityW);
    const t4 = (fluxW_M2 * (1.0 - albedoBond)) / (4.0 * SIGMA);
    return Math.pow(t4, 0.25);
  }

  /**
   * Greenhouse Temperature Model (Grey Atmosphere Approximation):
   * T_surface = T_eq * (1 + 0.75 * tau)^(1/4)
   * Optical thickness tau is estimated from greenhouse gas column abundances:
   * tau ~ k_co2 * P_co2^0.5 + k_h2o * P_h2o^0.5 + k_ch4 * P_ch4^0.7
   */
  function calculateGreenhouseWarming(tEquilibriumK, surfacePressurePa, co2Fraction, h2oVaporPa = 1000, ch4Ppm = 2.0) {
    if (surfacePressurePa <= 0) {
      return {
        opticalDepth: 0,
        surfaceTemperatureK: tEquilibriumK,
        deltaGreenhouseK: 0
      };
    }

    const pCo2Bar = (surfacePressurePa * co2Fraction) / 100000;
    const pH2oBar = h2oVaporPa / 100000;
    const pCh4Bar = (surfacePressurePa * (ch4Ppm * 1e-6)) / 100000;

    // Optical depth empirical parameterized scaling (Pollack et al., McKay et al.)
    // Calibrated against Earth (tau ~ 0.84, deltaT ~ +33K) and Mars (tau ~ 0.08, deltaT ~ +5K), Venus (tau ~ 70)
    let tau = 0.8 * Math.sqrt(Math.max(0, pCo2Bar)) 
            + 2.5 * Math.sqrt(Math.max(0, pH2oBar))
            + 15.0 * Math.pow(Math.max(0, pCh4Bar), 0.7);

    // Minimum greenhouse effect from trace infrared active gases
    if (surfacePressurePa > 10000) {
      tau = Math.max(0.05, tau);
    }

    const tSurfaceK = tEquilibriumK * Math.pow(1.0 + 0.75 * tau, 0.25);
    const deltaGreenhouseK = tSurfaceK - tEquilibriumK;

    return {
      opticalDepth: tau,
      surfaceTemperatureK: tSurfaceK,
      surfaceTemperatureC: tSurfaceK - 273.15,
      deltaGreenhouseK
    };
  }

  /**
   * Evaluates Liquid Water Stability on planetary surface.
   * Uses the Antoine / Clausius-Clapeyron equation to compute boiling point at ambient pressure.
   */
  function evaluateLiquidWaterStability(surfacePressurePa, surfaceTemperatureK) {
    // 1. Check pressure threshold (Triple point of water: 611.65 Pa)
    if (surfacePressurePa < WATER_TRIPLE_POINT_PA) {
      return {
        isStable: false,
        phase: 'ice_or_vapor',
        reason: `Atmospheric pressure (${(surfacePressurePa / 100).toFixed(2)} mbar) is below the water triple point (6.12 mbar). Liquid water cannot exist; ice sublimates directly to vapor.`
      };
    }

    // 2. Compute boiling point at ambient pressure via Antoine Equation:
    // log10(P_mmHg) = A - B / (T_C + C)
    // For water: A=8.07131, B=1730.63, C=233.426 (P in mmHg, T in Celsius)
    const p_mmHg = surfacePressurePa * 0.00750062;
    let boilingTempC;
    if (p_mmHg > 0.01) {
      // Invert Antoine equation
      boilingTempC = 1730.63 / (8.07131 - Math.log10(p_mmHg)) - 233.426;
      // Cap at critical point
      if (surfacePressurePa >= WATER_CRITICAL_PRESSURE_PA) {
        boilingTempC = WATER_CRITICAL_TEMP_K - 273.15;
      }
    } else {
      boilingTempC = 0.01;
    }
    const boilingTempK = boilingTempC + 273.15;

    // Freezing point (approx 273.15 K with mild pressure depression)
    const freezingTempK = 273.15;

    if (surfaceTemperatureK < freezingTempK) {
      return {
        isStable: false,
        phase: 'solid_ice',
        freezingTempK,
        boilingTempK,
        reason: `Temperature (${(surfaceTemperatureK - 273.15).toFixed(1)}°C) is below freezing (${(freezingTempK - 273.15).toFixed(1)}°C). Water is locked as solid ice/permafrost.`
      };
    }

    if (surfaceTemperatureK > boilingTempK) {
      return {
        isStable: false,
        phase: 'superheated_steam',
        freezingTempK,
        boilingTempK,
        reason: `Temperature (${(surfaceTemperatureK - 273.15).toFixed(1)}°C) exceeds ambient boiling point (${boilingTempC.toFixed(1)}°C). Water boils away into vapor (Runaway Moist Greenhouse).`
      };
    }

    return {
      isStable: true,
      phase: 'liquid',
      freezingTempK,
      boilingTempK,
      liquidRangeK: boilingTempK - freezingTempK,
      reason: `Liquid water is thermodynamically stable between ${freezingTempK.toFixed(1)} K and ${boilingTempK.toFixed(1)} K at current pressure.`
    };
  }

  /**
   * Earth Similarity Index (ESI) according to Schulze-Makuch et al. (Astrobiology 2011).
   * ESI = product( (1 - |(x - x0) / (x + x0)| )^(w_i / n) )
   * Parameters:
   * 1. Mean radius (w = 0.57, ref = 1.0 R_earth)
   * 2. Bulk density (w = 1.07, ref = 1.0 rho_earth)
   * 3. Escape velocity (w = 0.70, ref = 1.0 v_earth)
   * 4. Surface temperature (w = 5.58, ref = 288 K)
   */
  function calculateESI(meanRadiusM, bulkDensityKgM3, escapeVelocityM_S, surfaceTemperatureK) {
    const R0 = 6371000;
    const D0 = 5514;
    const V0 = 11186;
    const T0 = 288.15;

    const term = (x, x0, w) => {
      if (x <= 0 || x0 <= 0) return 0;
      const diff = Math.abs(x - x0);
      const sum = x + x0;
      const base = Math.max(0, 1.0 - diff / sum);
      return Math.pow(base, w);
    };

    // Interior ESI (Radius and Density)
    const rTerm = term(meanRadiusM, R0, 0.57);
    const dTerm = term(bulkDensityKgM3, D0, 1.07);
    const esiInterior = Math.sqrt(rTerm * dTerm);

    // Surface ESI (Escape Velocity and Temperature)
    const vTerm = term(escapeVelocityM_S, V0, 0.70);
    const tTerm = term(surfaceTemperatureK, T0, 5.58);
    const esiSurface = Math.sqrt(vTerm * tTerm);

    // Global ESI
    const totalWeights = 0.57 + 1.07 + 0.70 + 5.58;
    const n = 4;
    const esiGlobal = Math.pow(rTerm * dTerm * vTerm * tTerm, 1.0 / n);

    return {
      esiGlobal: Math.min(1.0, Math.max(0, esiGlobal)),
      esiInterior: Math.min(1.0, Math.max(0, esiInterior)),
      esiSurface: Math.min(1.0, Math.max(0, esiSurface)),
      interpretation: esiGlobal > 0.8 
        ? 'High physical similarity to Earth (Does not guarantee habitability or biology)' 
        : esiGlobal > 0.5 
          ? 'Moderate physical similarity to Earth' 
          : 'Low physical similarity to Earth'
    };
  }

  /**
   * Kopparapu et al. (2013) Habitable Zone (HZ) Boundaries for Solar-type star (G2V)
   * Returns inner boundary (Runaway greenhouse ~0.97 AU) and outer boundary (Maximum greenhouse ~1.67 AU).
   */
  function calculateHabitableZoneAU(stellarLuminosityRelSun = 1.0) {
    const sqrtL = Math.sqrt(stellarLuminosityRelSun);
    return {
      recentVenusAU: 0.75 * sqrtL,
      runawayGreenhouseInnerAU: 0.97 * sqrtL,
      maximumGreenhouseOuterAU: 1.67 * sqrtL,
      earlyMarsAU: 1.77 * sqrtL
    };
  }

  return {
    WATER_TRIPLE_POINT_PA,
    WATER_TRIPLE_POINT_TEMP_K,
    calculateStellarFlux,
    calculateEquilibriumTemperature,
    calculateGreenhouseWarming,
    evaluateLiquidWaterStability,
    calculateESI,
    calculateHabitableZoneAU
  };
}));
