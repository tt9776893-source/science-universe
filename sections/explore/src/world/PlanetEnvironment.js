export const PLANET_ENVIRONMENTS = Object.freeze({
  mars: Object.freeze({
    planetId: 'mars',
    planetName: 'Mars',
    worldId: 'mars',
    surfaceRegion: 'Jezero Crater',
    gravityMps2: 3.71,
    hasSolidSurface: true
  }),
  mercury: Object.freeze({
    planetId: 'mercury',
    planetName: 'Mercury',
    worldId: 'mercury',
    surfaceRegion: 'Caloris Basin',
    gravityMps2: 3.70,
    hasSolidSurface: true
  }),
  venus: Object.freeze({
    planetId: 'venus',
    planetName: 'Venus',
    worldId: 'venus',
    surfaceRegion: 'Aphrodite Terra',
    gravityMps2: 8.87,
    hasSolidSurface: true
  }),
  earth: Object.freeze({
    planetId: 'earth',
    planetName: 'Earth',
    worldId: 'earth',
    surfaceRegion: 'Research Valley',
    gravityMps2: 9.81,
    hasSolidSurface: true
  }),
  moon: Object.freeze({
    planetId: 'moon',
    planetName: 'Moon',
    worldId: 'moon',
    surfaceRegion: 'Mare Tranquillitatis',
    gravityMps2: 1.62,
    hasSolidSurface: true
  })
});

const PLAYABLE_PLANET_IDS = new Set(['mars', 'moon', 'earth', 'mercury', 'venus', 'jupiter', 'saturn', 'uranus', 'neptune', 'sun']);

export const PLANET_WORLD_CONFIGS = Object.freeze({
  mars: Object.freeze({
    ...PLANET_ENVIRONMENTS.mars,
    gravityMps2: 3.71,
    terrainProfile: 'mars',
    atmosphere: Object.freeze({ kind: 'thin-dust', pressureKPa: 0.6, fogDensity: 0.0045 }),
    sky: Object.freeze({ day: '#c49b78', horizon: '#b89578', night: '#050409', sunIntensity: 2.1, dayDurationSeconds: 720, stars: true, dust: true }),
    lighting: Object.freeze({ ambient: '#7d6352', hemisphere: '#d8b598', sunset: '#4a88cc', sun: '#fff7ea', ambientIntensity: 0.65, hemisphereIntensity: 0.82 }),
    temperatureC: Object.freeze({ day: -18, night: -75 }),
    landingSite: Object.freeze({ name: 'Jezero Crater', x: 16, z: 16 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#b07358', dune: '#c98868', strata: '#79523f', basalt: '#3e3631' }) })
  }),
  mercury: Object.freeze({
    ...PLANET_ENVIRONMENTS.mercury,
    seed: 14531,
    terrainProfile: 'mercurian',
    atmosphere: Object.freeze({ kind: 'exosphere', pressureKPa: 0, fogDensity: 0 }),
    sky: Object.freeze({ day: '#03050a', horizon: '#0c1016', night: '#010207', sunIntensity: 3.0, dayDurationSeconds: 1000, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#20222a', hemisphere: '#8b9099', sunset: '#12151a', sun: '#fff3d4', ambientIntensity: 0.16, hemisphereIntensity: 0.16 }),
    temperatureC: Object.freeze({ day: 430, night: -180 }),
    landingSite: Object.freeze({ name: 'Caloris Basin', x: 0, z: 0 }),
    terrain: Object.freeze({
      baseHeight: 1,
      relief: 5,
      highlandRelief: 18,
      craterDepth: 10,
      colors: Object.freeze({ surface: '#77736d', dune: '#a29a8d', strata: '#5d5a56', basalt: '#34353a' }),
      craters: Object.freeze([
        Object.freeze({ x: 78, z: -35, radius: 36, depth: 13 }),
        Object.freeze({ x: -88, z: 72, radius: 28, depth: 9 }),
        Object.freeze({ x: 128, z: 92, radius: 25, depth: 8 }),
        Object.freeze({ x: -138, z: -86, radius: 41, depth: 14 })
      ])
    }),
    locations: Object.freeze([
      Object.freeze({ id: 'caloris-basin', name: 'Caloris Basin', x: 0, z: 0, mission: 'Map the basin floor and compare crater ejecta.' }),
      Object.freeze({ id: 'double-ring-crater', name: 'Double-Ring Crater', x: 78, z: -35, mission: 'Measure crater rim height and impact layering.' }),
      Object.freeze({ id: 'highland-scarp', name: 'Highland Scarp', x: -118, z: 94, mission: 'Survey ancient terrain fractures and slope.' })
    ])
  }),
  venus: Object.freeze({
    ...PLANET_ENVIRONMENTS.venus,
    seed: 26803,
    terrainProfile: 'venusian',
    atmosphere: Object.freeze({ kind: 'dense-carbon-dioxide', pressureKPa: 9200, fogDensity: 0.012 }),
    sky: Object.freeze({ day: '#d28a3e', horizon: '#e5a84e', night: '#392519', sunIntensity: 0.55, dayDurationSeconds: 1400, stars: false, dust: false }),
    lighting: Object.freeze({ ambient: '#986534', hemisphere: '#d39b58', sunset: '#be7143', sun: '#f5c174', ambientIntensity: 0.82, hemisphereIntensity: 0.72 }),
    temperatureC: Object.freeze({ day: 465, night: 465 }),
    landingSite: Object.freeze({ name: 'Aphrodite Terra', x: 0, z: 0 }),
    terrain: Object.freeze({
      baseHeight: 3,
      rollingRelief: 7,
      volcanicRelief: 28,
      lavaRidgeRelief: 5,
      colors: Object.freeze({ surface: '#9b673b', dune: '#c58a4c', strata: '#745038', basalt: '#3e3027' }),
      volcanoes: Object.freeze([
        Object.freeze({ x: -52, z: 38, radius: 58, height: 24 }),
        Object.freeze({ x: 104, z: -76, radius: 46, height: 19 }),
        Object.freeze({ x: 115, z: 82, radius: 34, height: 13 })
      ])
    }),
    locations: Object.freeze([
      Object.freeze({ id: 'aphrodite-terra', name: 'Aphrodite Terra', x: 0, z: 0, mission: 'Record surface pressure and temperature under dense haze.' }),
      Object.freeze({ id: 'maat-mons', name: 'Maat Mons Shield Volcano', x: -52, z: 38, mission: 'Measure volcanic cone profile and lava-flow ridges.' }),
      Object.freeze({ id: 'tessera-highlands', name: 'Tessera Highlands', x: 104, z: -76, mission: 'Survey folded highlands and fracture patterns.' })
    ])
  }),
  moon: Object.freeze({
    ...PLANET_ENVIRONMENTS.moon,
    planetId: 'moon',
    planetName: 'Moon',
    worldId: 'moon',
    seed: 2417,
    gravityMps2: 1.62,
    terrainProfile: 'lunar',
    atmosphere: Object.freeze({ kind: 'vacuum', pressureKPa: 0, fogDensity: 0 }),
    sky: Object.freeze({ day: '#080b12', horizon: '#1b2028', night: '#020307', sunIntensity: 2.8, dayDurationSeconds: 1200, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#242936', hemisphere: '#8e96a4', sunset: '#080b12', sun: '#fffbe8', ambientIntensity: 0.22, hemisphereIntensity: 0.18 }),
    temperatureC: Object.freeze({ day: 127, night: -173 }),
    surfaceRegion: 'Mare Tranquillitatis',
    landingSite: Object.freeze({ name: 'Mare Tranquillitatis', x: 0, z: 0 }),
    terrain: Object.freeze({
      baseHeight: 2,
      relief: 5,
      craterDepth: 8,
      highlandRelief: 12,
      colors: Object.freeze({ surface: '#77797d', dune: '#94969a', strata: '#62666b', basalt: '#393d42' }),
      craters: Object.freeze([
        Object.freeze({ x: 82, z: -42, radius: 34, depth: 11 }),
        Object.freeze({ x: -94, z: 76, radius: 29, depth: 9 }),
        Object.freeze({ x: 36, z: 118, radius: 23, depth: 7 }),
        Object.freeze({ x: -142, z: -84, radius: 38, depth: 13 })
      ])
    }),
    locations: Object.freeze([
      Object.freeze({ id: 'mare-tranquillitatis', name: 'Mare Tranquillitatis', x: 0, z: 0, mission: 'Survey basalt plains and compare impact ejecta.' }),
      Object.freeze({ id: 'south-rim', name: 'South Rim Highlands', x: 96, z: -72, mission: 'Measure crater-wall slope and elevation change.' }),
      Object.freeze({ id: 'polar-shadow', name: 'Polar Shadow Traverse', x: -118, z: 104, mission: 'Scan a permanently shadowed crater for volatile deposits.' })
    ])
  }),
  earth: Object.freeze({
    ...PLANET_ENVIRONMENTS.earth,
    seed: 9771,
    seed: 9771,
    terrainProfile: 'earthlike',
    atmosphere: Object.freeze({ kind: 'nitrogen-oxygen', pressureKPa: 101.3, fogDensity: 0.0015 }),
    sky: Object.freeze({ day: '#6fa7e7', horizon: '#c4deed', night: '#050816', sunIntensity: 1.8, dayDurationSeconds: 900, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#71879a', hemisphere: '#a6c8ed', sunset: '#ec9078', sun: '#fff6dc', ambientIntensity: 0.72, hemisphereIntensity: 1.0 }),
    temperatureC: Object.freeze({ day: 24, night: 10 }),
    landingSite: Object.freeze({ name: 'Research Valley', x: 0, z: 0 }),
    terrain: Object.freeze({
      baseHeight: 4,
      rollingRelief: 8,
      mountainRelief: 22,
      riverDepth: 8,
      colors: Object.freeze({ surface: '#526b42', dune: '#788553', strata: '#746b54', basalt: '#3f4b43' })
    }),
    locations: Object.freeze([
      Object.freeze({ id: 'research-valley', name: 'Research Valley', x: 0, z: 0, mission: 'Record baseline soil, temperature, and atmospheric pressure.' }),
      Object.freeze({ id: 'river-delta', name: 'River Delta Basin', x: 92, z: -64, mission: 'Map layered sediment and compare grain-size samples.' }),
      Object.freeze({ id: 'mountain-ridge', name: 'Mountain Ridge', x: -118, z: 96, mission: 'Measure elevation, slope, and local weather changes.' })
    ])
  }),
  jupiter: Object.freeze({
    planetId: 'jupiter',
    planetName: 'Jupiter',
    worldId: 'jupiter',
    surfaceRegion: 'Orbital Laboratory',
    gravityMps2: 24.79,
    hasSolidSurface: false,
    seed: 52819,
    terrainProfile: 'gas-giant',
    atmosphere: Object.freeze({ kind: 'gas-giant', pressureKPa: 20000, fogDensity: 0.03 }),
    sky: Object.freeze({ day: '#0b2e4a', horizon: '#16406b', night: '#020408', sunIntensity: 0.05, dayDurationSeconds: 3600, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#0a1e30', hemisphere: '#1e5a8a', sunset: '#2e4a6b', sun: '#ffe08a', ambientIntensity: 0.12, hemisphereIntensity: 0.18 }),
    temperatureC: Object.freeze({ day: -108, night: -108 }),
    landingSite: Object.freeze({ name: 'Jupiter Orbital Lab', x: 0, z: 0 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#d8c7b5', dune: '#e3d6ca', strata: '#b8a494', basalt: '#6e645c' }) }),
    locations: Object.freeze([
      Object.freeze({ id: 'jupiter-orbital-lab', name: 'Jupiter Orbital Laboratory', x: 0, z: 0, mission: 'Observe Great Red Spot from orbit; study hydrogen-helium atmosphere.' }),
      Object.freeze({ id: 'cloud-tops-survey', name: 'Cloud Tops Survey', x: 0, z: 0, mission: 'Sample upper cloud deck composition and wind shear.' })
    ])
  }),
  saturn: Object.freeze({
    planetId: 'saturn',
    planetName: 'Saturn',
    worldId: 'saturn',
    surfaceRegion: 'Orbital Laboratory',
    gravityMps2: 10.44,
    hasSolidSurface: false,
    seed: 83742,
    terrainProfile: 'gas-giant',
    atmosphere: Object.freeze({ kind: 'gas-giant', pressureKPa: 14000, fogDensity: 0.028 }),
    sky: Object.freeze({ day: '#1e3a5f', horizon: '#2a4a70', night: '#020306', sunIntensity: 0.01, dayDurationSeconds: 3600, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#0e1c30', hemisphere: '#2a4a70', sunset: '#3a5a8a', sun: '#ffe6b8', ambientIntensity: 0.08, hemisphereIntensity: 0.14 }),
    temperatureC: Object.freeze({ day: -138, night: -138 }),
    landingSite: Object.freeze({ name: 'Saturn Orbital Lab', x: 0, z: 0 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#e8dcc8', dune: '#f0e6d8', strata: '#c8b8a4', basalt: '#8e847c' }) }),
    locations: Object.freeze([
      Object.freeze({ id: 'saturn-orbital-lab', name: 'Saturn Orbital Laboratory', x: 0, z: 0, mission: 'Study ring system structure and atmospheric bands from orbit.' }),
      Object.freeze({ id: 'ring-plane-crossing', name: 'Ring Plane Crossing', x: 0, z: 0, mission: 'Fly through ring plane; measure ice particle density.' })
    ])
  }),
  uranus: Object.freeze({
    planetId: 'uranus',
    planetName: 'Uranus',
    worldId: 'uranus',
    surfaceRegion: 'Orbital Laboratory',
    gravityMps2: 8.87,
    hasSolidSurface: false,
    seed: 31905,
    terrainProfile: 'ice-giant',
    atmosphere: Object.freeze({ kind: 'ice-giant', pressureKPa: 13000, fogDensity: 0.025 }),
    sky: Object.freeze({ day: '#2a4a6b', horizon: '#3a5a8a', night: '#020308', sunIntensity: 0.003, dayDurationSeconds: 3600, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#1e2e4a', hemisphere: '#3a5a8a', sunset: '#4a6a9a', sun: '#c8e0f0', ambientIntensity: 0.06, hemisphereIntensity: 0.12 }),
    temperatureC: Object.freeze({ day: -195, night: -195 }),
    landingSite: Object.freeze({ name: 'Uranus Orbital Lab', x: 0, z: 0 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#a8c8e0', dune: '#b8d0e8', strata: '#88a8c8', basalt: '#5e7e9e' }) }),
    locations: Object.freeze([
      Object.freeze({ id: 'uranus-orbital-lab', name: 'Uranus Orbital Laboratory', x: 0, z: 0, mission: 'Study methane-rich atmosphere and extreme axial tilt from orbit.' }),
      Object.freeze({ id: 'ice-giant-survey', name: 'Ice Giant Survey', x: 0, z: 0, mission: 'Sample atmospheric composition; compare with Neptune.' })
    ])
  }),
  neptune: Object.freeze({
    planetId: 'neptune',
    planetName: 'Neptune',
    worldId: 'neptune',
    surfaceRegion: 'Orbital Laboratory',
    gravityMps2: 11.15,
    hasSolidSurface: false,
    seed: 74019,
    terrainProfile: 'ice-giant',
    atmosphere: Object.freeze({ kind: 'ice-giant', pressureKPa: 14000, fogDensity: 0.026 }),
    sky: Object.freeze({ day: '#1a2a5f', horizon: '#2a3a70', night: '#010206', sunIntensity: 0.001, dayDurationSeconds: 3600, stars: true, dust: false }),
    lighting: Object.freeze({ ambient: '#0e1a3a', hemisphere: '#2a3a70', sunset: '#3a4a9a', sun: '#a8c8f0', ambientIntensity: 0.05, hemisphereIntensity: 0.10 }),
    temperatureC: Object.freeze({ day: -200, night: -200 }),
    landingSite: Object.freeze({ name: 'Neptune Orbital Lab', x: 0, z: 0 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#78a8e8', dune: '#88b8f0', strata: '#5888c8', basalt: '#3e5e8e' }) }),
    locations: Object.freeze([
      Object.freeze({ id: 'neptune-orbital-lab', name: 'Neptune Orbital Laboratory', x: 0, z: 0, mission: 'Study deepest ice giant atmosphere and supersonic winds.' }),
      Object.freeze({ id: 'great-dark-spot', name: 'Great Dark Spot Survey', x: 0, z: 0, mission: 'Observe storm systems and atmospheric vortices from orbit.' })
    ])
  }),
  sun: Object.freeze({
    planetId: 'sun',
    planetName: 'Sun',
    worldId: 'sun',
    surfaceRegion: 'Solar Observation Station',
    gravityMps2: 274.0,
    hasSolidSurface: false,
    seed: 1,
    terrainProfile: 'stellar',
    atmosphere: Object.freeze({ kind: 'stellar-corona', pressureKPa: 0, fogDensity: 0 }),
    sky: Object.freeze({ day: '#ff6b00', horizon: '#ff8c00', night: '#1a0a00', sunIntensity: 100.0, dayDurationSeconds: 3600, stars: false, dust: false }),
    lighting: Object.freeze({ ambient: '#ff4400', hemisphere: '#ffaa00', sunset: '#ff8800', sun: '#ffff00', ambientIntensity: 1.0, hemisphereIntensity: 0.9 }),
    temperatureC: Object.freeze({ day: 5500, night: 5500 }),
    landingSite: Object.freeze({ name: 'Solar Observation Station', x: 0, z: 0 }),
    terrain: Object.freeze({ colors: Object.freeze({ surface: '#ffaa00', dune: '#ffcc44', strata: '#ff8800', basalt: '#ff4400' }) }),
    locations: Object.freeze([
      Object.freeze({ id: 'solar-observation-station', name: 'Solar Observation Station', x: 0, z: 0, mission: 'Study solar corona, flares, and heliophysics from safe distance.' }),
      Object.freeze({ id: 'coronal-monitoring', name: 'Coronal Mass Ejection Monitor', x: 0, z: 0, mission: 'Track CME events and space weather impacts.' })
    ])
  })
});

export function getPlanetWorldConfig(planet) {
  return PLANET_WORLD_CONFIGS[getPlanetId(planet)] || null;
}

export function getPlanetId(planet) {
  const value = typeof planet === 'string'
    ? planet
    : planet?.id ?? planet?.planetId ?? planet?.name;
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function resolvePlanetEnvironment(planet) {
  const planetId = getPlanetId(planet);
  return PLAYABLE_PLANET_IDS.has(planetId) ? PLANET_ENVIRONMENTS[planetId] || null : null;
}

export function getLandingUnavailableMessage(planet) {
  const planetId = getPlanetId(planet);
  const name = typeof planet === 'string'
    ? planet.trim()
    : planet?.name || (planetId ? planetId[0].toUpperCase() + planetId.slice(1) : 'Selected body');
  const env = PLANET_ENVIRONMENTS[planetId];
  const worldCfg = getPlanetWorldConfig(planetId);
  const hasNoSolidSurface = env?.hasSolidSurface === false ||
    worldCfg?.hasSolidSurface === false ||
    planet?.hasSolidSurface === false;

  // Unknown planet (not in registry at all).
  if (!env && !worldCfg && !planet?.hasSolidSurface) {
    return `${name} does not have a playable surface environment yet. Mars is currently the only supported landing destination.`;
  }

  if (planetId === 'sun') {
    return `${name} is not a landing target. Use solar observation from a safe distance instead.`;
  }
  if (hasNoSolidSurface) {
    return `${name} has no solid surface; use orbital observation and atmospheric probe missions instead of landing.`;
  }
  return `${name} does not have a playable surface environment yet. Mars is currently the only supported landing destination.`;
}