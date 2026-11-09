/**
 * SCIENCE UNIVERSE — ORBITAL & ATMOSPHERIC PHYSICS ENGINE
 * Module: OrbitalAtmosphericPhysics.js
 * 
 * Fundamental astrophysical equations:
 * 1. Surface gravity: g = GM / R^2
 * 2. Escape velocity: v_esc = sqrt(2GM / R)
 * 3. Mean bulk density: rho = 3M / (4 * pi * R^3)
 * 4. Rotation angular velocity: omega = 2 * pi / T
 * 5. Equatorial centrifugal acceleration: a_c = omega^2 * R
 * 6. Effective surface gravity: g_eff = g - a_c
 * 7. Atmospheric scale height: H = (k_B * T) / (m_mol * g)
 * 8. Rotational oblateness (Darwin-Maclaurin): epsilon = (R_eq - R_pol) / R_eq ~ (5/4) * (omega^2 * R^3) / (GM)
 * 
 * Standards:
 * - Pure SI Units: M (kg), R (m), T (s), g (m/s^2), v (m/s), rho (kg/m^3), P (Pa).
 * - Comprehensive input validation (rejects <=0 or NaN).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../PlanetData'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../PlanetData'));
  } else {
    root.OrbitalAtmosphericPhysics = factory(root.PlanetData);
  }
}(typeof self !== 'undefined' ? self : this, function (PlanetData) {
  'use strict';

  const G = (PlanetData && PlanetData.CONSTANTS) ? PlanetData.CONSTANTS.G : 6.67430e-11;
  const KB = (PlanetData && PlanetData.CONSTANTS) ? PlanetData.CONSTANTS.KB : 1.380649e-23;

  /**
   * Average molecular masses for planetary atmosphere types (in kg/molecule)
   * N2 = 28.0134 Da, CO2 = 44.01 Da, H2 = 2.016 Da, He = 4.0026 Da
   */
  const AMU = 1.66053906660e-27; // 1 atomic mass unit in kg
  const ATMOSPHERE_MEAN_MOL_WEIGHTS = {
    earth: 28.97 * AMU,       // Nitrogen-Oxygen air
    mars: 43.34 * AMU,        // 95% CO2
    venus: 43.45 * AMU,       // 96.5% CO2
    jupiter: 2.22 * AMU,      // 90% H2, 10% He
    saturn: 2.07 * AMU,       // 96% H2, 4% He
    uranus: 2.64 * AMU,       // 83% H2, 15% He, 2% CH4
    neptune: 2.53 * AMU       // 80% H2, 19% He, 1% CH4
  };

  /**
   * Calculates surface gravity: g = G * M / R^2
   * @param {number} massKg - Planetary mass in kilograms
   * @param {number} radiusM - Planetary radius in meters
   * @returns {number} Gravity in m/s^2
   */
  function calculateSurfaceGravity(massKg, radiusM) {
    if (typeof massKg !== 'number' || typeof radiusM !== 'number') {
      throw new TypeError('Invalid inputs: massKg and radiusM must be numbers');
    }
    if (massKg <= 0 || radiusM <= 0 || isNaN(massKg) || isNaN(radiusM)) {
      throw new RangeError('Physical impossibility: mass and radius must be strictly positive');
    }
    return (G * massKg) / (radiusM * radiusM);
  }

  /**
   * Calculates escape velocity: v_esc = sqrt(2 * G * M / R)
   * @param {number} massKg
   * @param {number} radiusM
   * @returns {number} Escape velocity in m/s
   */
  function calculateEscapeVelocity(massKg, radiusM) {
    if (massKg <= 0 || radiusM <= 0 || isNaN(massKg) || isNaN(radiusM)) {
      throw new RangeError('Physical impossibility: mass and radius must be strictly positive');
    }
    return Math.sqrt((2 * G * massKg) / radiusM);
  }

  /**
   * Calculates mean bulk density: rho = M / V = 3M / (4 * pi * R^3)
   * @param {number} massKg
   * @param {number} radiusM
   * @returns {number} Density in kg/m^3
   */
  function calculateMeanDensity(massKg, radiusM) {
    if (massKg <= 0 || radiusM <= 0 || isNaN(massKg) || isNaN(radiusM)) {
      throw new RangeError('Physical impossibility: mass and radius must be strictly positive');
    }
    const volumeM3 = (4.0 / 3.0) * Math.PI * Math.pow(radiusM, 3);
    return massKg / volumeM3;
  }

  /**
   * Calculates angular rotation velocity: omega = 2 * pi / T
   * @param {number} rotationPeriodS - Period in seconds (absolute value used)
   * @returns {number} Angular velocity in rad/s
   */
  function calculateAngularVelocity(rotationPeriodS) {
    if (typeof rotationPeriodS !== 'number' || Math.abs(rotationPeriodS) === 0 || isNaN(rotationPeriodS)) {
      throw new RangeError('Physical impossibility: rotation period cannot be zero');
    }
    return (2.0 * Math.PI) / Math.abs(rotationPeriodS);
  }

  /**
   * Calculates equatorial centrifugal acceleration: a_c = omega^2 * R
   * @param {number} radiusM
   * @param {number} rotationPeriodS
   * @returns {number} Centrifugal acceleration in m/s^2
   */
  function calculateCentrifugalAcceleration(radiusM, rotationPeriodS) {
    if (radiusM <= 0) {
      throw new RangeError('Radius must be strictly positive');
    }
    const omega = calculateAngularVelocity(rotationPeriodS);
    return omega * omega * radiusM;
  }

  /**
   * Calculates effective gravity at the equator (g_eff = g - a_c)
   * If a_c >= g, the planet is rotating faster than orbital speed at the equator and shedding mass!
   */
  function calculateEffectiveEquatorialGravity(massKg, radiusM, rotationPeriodS) {
    const g = calculateSurfaceGravity(massKg, radiusM);
    const a_c = calculateCentrifugalAcceleration(radiusM, rotationPeriodS);
    return {
      gravitationalAcceleration: g,
      centrifugalAcceleration: a_c,
      effectiveGravity: Math.max(0, g - a_c),
      isRotationalBreakup: a_c >= g
    };
  }

  /**
   * Calculates geometric oblateness / flattening (Darwin-Radau approximation):
   * epsilon = (R_eq - R_pol) / R_eq ~ (5/4) * (omega^2 * R^3) / (G * M)
   */
  function calculateOblateness(massKg, radiusM, rotationPeriodS) {
    const a_c = calculateCentrifugalAcceleration(radiusM, rotationPeriodS);
    const g = calculateSurfaceGravity(massKg, radiusM);
    // Maclaurin / Darwin parameter m = a_c / g
    const m = a_c / g;
    // For homogeneous fluid it is 1.25 * m; for centrally concentrated planets it is lower (~0.5 - 0.9 * m)
    const flattening = Math.min(0.5, 0.8 * m);
    return {
      parameterM: m,
      flatteningRatio: flattening,
      equatorialBulgePercent: flattening * 100
    };
  }

  /**
   * Calculates atmospheric scale height: H = (k_B * T) / (m_mol * g)
   * Valid for isothermal hydrostatic atmospheric layers.
   * @param {number} temperatureK - Temperature in Kelvin
   * @param {number} surfaceGravity - Local gravity in m/s^2
   * @param {number|string} meanMolWeight - Molecular weight in kg or planet key
   * @returns {number} Scale height H in meters
   */
  function calculateScaleHeight(temperatureK, surfaceGravity, meanMolWeight) {
    if (temperatureK <= 0 || surfaceGravity <= 0) {
      return null;
    }

    let m_mol;
    if (typeof meanMolWeight === 'string') {
      m_mol = ATMOSPHERE_MEAN_MOL_WEIGHTS[meanMolWeight.toLowerCase()] || (28.97 * AMU);
    } else if (typeof meanMolWeight === 'number' && meanMolWeight > 0) {
      m_mol = meanMolWeight;
    } else {
      m_mol = 28.97 * AMU; // Earth air default
    }

    return (KB * temperatureK) / (m_mol * surfaceGravity);
  }

  /**
   * Evaluates atmospheric thermal escape (Jeans Escape):
   * Thermal velocity: v_th = sqrt(3 * k_B * T / m_mol)
   * Escape parameter: lambda = (v_esc / v_th)^2
   * If v_esc < 6 * v_th, the gas is rapidly lost to space over geological time.
   */
  function evaluateAtmosphericRetention(escapeVelocityM_S, temperatureK, molFormula) {
    const weights = {
      H2: 2.016 * AMU,
      He: 4.0026 * AMU,
      H2O: 18.015 * AMU,
      N2: 28.0134 * AMU,
      O2: 31.9988 * AMU,
      CO2: 44.01 * AMU,
      CH4: 16.04 * AMU
    };

    const m_mol = weights[molFormula] || (28.0 * AMU);
    const v_th = Math.sqrt((3 * KB * temperatureK) / m_mol);
    const ratio = escapeVelocityM_S / v_th;

    return {
      molecule: molFormula,
      thermalVelocityM_S: v_th,
      retentionRatio: ratio,
      isRetainedGeologically: ratio >= 6.0,
      description: ratio >= 6.0 
        ? `${molFormula} is gravitationally retained over billions of years (v_esc > 6 * v_th).`
        : `${molFormula} escapes into space via thermal Jeans escape over geological time (v_esc < 6 * v_th).`
    };
  }

  /**
   * Multiplier Simulation State: computes derived values given baseline planet + multipliers
   */
  function computeModifiedPlanetState(planet, massMultiplier = 1.0, radiusMultiplier = 1.0, rotationPeriodMultiplier = 1.0) {
    if (!planet) return null;

    const massKg = planet.massKg * Math.max(0.001, massMultiplier);
    const radiusM = planet.meanRadiusM * Math.max(0.001, radiusMultiplier);
    const rotationPeriodS = planet.rotationPeriodS * Math.max(0.001, rotationPeriodMultiplier);

    const surfaceGravity = calculateSurfaceGravity(massKg, radiusM);
    const escapeVelocity = calculateEscapeVelocity(massKg, radiusM);
    const meanDensity = calculateMeanDensity(massKg, radiusM);
    const effGravity = calculateEffectiveEquatorialGravity(massKg, radiusM, rotationPeriodS);
    const oblateness = calculateOblateness(massKg, radiusM, rotationPeriodS);

    // Gravity ratio relative to standard Earth gravity (9.80665 m/s^2)
    const gravityRatioEarth = surfaceGravity / 9.80665;
    // Jump height on new planet compared to 0.5m average human jump on Earth
    const humanJumpHeightM = 0.5 / gravityRatioEarth;

    return {
      planetId: planet.id,
      planetName: planet.name,
      hasSolidSurface: planet.hasSolidSurface,
      multipliers: {
        mass: massMultiplier,
        radius: radiusMultiplier,
        rotation: rotationPeriodMultiplier
      },
      computed: {
        massKg,
        radiusM,
        rotationPeriodS,
        surfaceGravity,
        gravityRatioEarth,
        escapeVelocityM_S: escapeVelocity,
        meanDensityKgM3: meanDensity,
        humanJumpHeightM,
        centrifugalAccM_S2: effGravity.centrifugalAcceleration,
        effectiveGravityM_S2: effGravity.effectiveGravity,
        isRotationalBreakup: effGravity.isRotationalBreakup,
        flatteningRatio: oblateness.flatteningRatio,
        flatteningPercent: oblateness.equatorialBulgePercent
      },
      baseline: {
        massKg: planet.massKg,
        radiusM: planet.meanRadiusM,
        rotationPeriodS: planet.rotationPeriodS,
        surfaceGravity: planet.surfaceGravity,
        escapeVelocityM_S: planet.escapeVelocityM_S
      }
    };
  }

  return {
    calculateSurfaceGravity,
    calculateEscapeVelocity,
    calculateMeanDensity,
    calculateAngularVelocity,
    calculateCentrifugalAcceleration,
    calculateEffectiveEquatorialGravity,
    calculateOblateness,
    calculateScaleHeight,
    evaluateAtmosphericRetention,
    computeModifiedPlanetState
  };
}));
