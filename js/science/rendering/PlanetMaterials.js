/**
 * SCIENCE UNIVERSE — HIGH-FIDELITY PLANETARY MATERIALS & SHADERS
 * Module: PlanetMaterials.js
 * 
 * Provides:
 * - Photorealistic NASA Blue Marble Earth (Diffuse, Normal bump, Specular ocean, Clouds, Night lights)
 * - High-resolution USGS/SolarSystemScope Mars (2K Viking/MOLA terrain)
 * - Complete 2K Maps for Jupiter, Saturn, Venus, Mercury, Uranus, Neptune, Moon
 * - Realistic 3D Saturn Rings Geometry & Alpha-blended Material
 * - Atmospheric Scattering Fresnel Shaders (Delicate Rayleigh limb glow without solid cyan shells)
 * - Physically distinct Geophysical Interior Layer Materials:
 *   1. Terrestrial Crusts: Rugged lithospheric silicate rocks with micro-relief
 *   2. Mantles: Convective ductile peridotite & Bridgmanite with thermal glow
 *   3. Liquid Cores: Churning molten liquid iron-nickel with convective lava textures
 *   4. Solid Inner Cores: Balanced crystalline hexagonal close-packed iron-nickel (tempered, non-reflective)
 *   5. Gas Giant Atmospheres & Supercritical Fluids
 *   6. Liquid Metallic Hydrogen: Dense degenerate conductive plasma
 *   7. Diffuse "Fuzzy" Cores: Superheated mineral-ice slurry
 *   8. Ice Giant Ionic & Superionic Water Mantles
 * - Texture provider API: getPlanetTexture(planetKey)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PlanetMaterials = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const textureCache = new Map();
  const textureLoader = (typeof THREE !== 'undefined') ? new THREE.TextureLoader() : null;

  const isDevHarness = (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/dev/'));
  const pfx = isDevHarness ? '../assets/textures/planets/' : 'assets/textures/planets/';

  // Local asset paths with CDN fallbacks
  const TEXTURE_PATHS = {
    earth_day: [
      pfx + 'earth_atmos_2048.jpg',
      'assets/textures/planets/earth_atmos_2048.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg'
    ],
    earth_normal: [
      pfx + 'earth_normal_2048.jpg',
      'assets/textures/planets/earth_normal_2048.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_normal_2048.jpg'
    ],
    earth_specular: [
      pfx + 'earth_specular_2048.jpg',
      'assets/textures/planets/earth_specular_2048.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_specular_2048.jpg'
    ],
    earth_clouds: [
      pfx + 'earth_clouds_1024.png',
      'assets/textures/planets/earth_clouds_1024.png',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_clouds_1024.png'
    ],
    earth_lights: [
      pfx + 'earth_lights_2048.png',
      'assets/textures/planets/earth_lights_2048.png',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_lights_2048.png'
    ],
    mars: [
      pfx + 'mars_2k.jpg',
      'assets/textures/planets/mars_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/4/46/Solarsystemscope_texture_2k_mars.jpg'
    ],
    lava: [
      pfx + 'lavatile.jpg',
      'assets/textures/planets/lavatile.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/lava/lavatile.jpg'
    ],
    moon: [
      pfx + 'moon_1024.jpg',
      'assets/textures/planets/moon_1024.jpg',
      'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/moon_1024.jpg'
    ],
    jupiter: [
      pfx + 'jupiter_2k.jpg',
      'assets/textures/planets/jupiter_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b3/Solarsystemscope_texture_2k_jupiter.jpg'
    ],
    saturn: [
      pfx + 'saturn_2k.jpg',
      'assets/textures/planets/saturn_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_2k_saturn.jpg'
    ],
    venus: [
      pfx + 'venus_2k.jpg',
      'assets/textures/planets/venus_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/1/19/Solarsystemscope_texture_2k_venus_surface.jpg'
    ],
    mercury: [
      pfx + 'mercury_2k.jpg',
      'assets/textures/planets/mercury_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/3/30/Solarsystemscope_texture_2k_mercury.jpg'
    ],
    uranus: [
      pfx + 'uranus_2k.jpg',
      'assets/textures/planets/uranus_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg'
    ],
    neptune: [
      pfx + 'neptune_2k.jpg',
      'assets/textures/planets/neptune_2k.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/20/Solarsystemscope_texture_2k_neptune.jpg'
    ]
  };

  /**
   * Safe asynchronous texture loader with fallbacks
   */
  function loadTextureWithFallback(textureKey) {
    if (typeof THREE === 'undefined') return null;
    if (textureCache.has(textureKey)) {
      return textureCache.get(textureKey);
    }

    const paths = TEXTURE_PATHS[textureKey];
    if (!paths || paths.length === 0) return null;

    if (!textureLoader) return null;

    let pathIndex = 0;
    const tex = textureLoader.load(
      paths[pathIndex],
      () => {},
      undefined,
      () => {
        pathIndex++;
        if (pathIndex < paths.length) {
          tex.image.src = paths[pathIndex];
        }
      }
    );

    textureCache.set(textureKey, tex);
    return tex;
  }

  /**
   * Retrieves planet exterior texture for any of the 8 Solar System planets
   */
  function getPlanetTexture(planetKey) {
    const key = String(planetKey || 'earth').toLowerCase();
    if (key === 'earth') return loadTextureWithFallback('earth_day');
    return loadTextureWithFallback(key) || loadTextureWithFallback('earth_day');
  }

  /**
   * Photorealistic NASA Blue Marble Earth Materials
   */
  function createPhotorealisticEarthMaterials() {
    const dayMap = loadTextureWithFallback('earth_day');
    const normalMap = loadTextureWithFallback('earth_normal');
    const specularMap = loadTextureWithFallback('earth_specular');
    const cloudsMap = loadTextureWithFallback('earth_clouds');

    const surfaceMat = new THREE.MeshStandardMaterial({
      map: dayMap,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      roughness: 0.65,
      metalness: 0.1,
      roughnessMap: specularMap,
      side: THREE.DoubleSide
    });

    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    return { surfaceMat, cloudMat };
  }

  /**
   * High-Resolution Mars Terrain Material
   */
  function createPhotorealisticMarsMaterial() {
    const marsMap = loadTextureWithFallback('mars');
    return new THREE.MeshStandardMaterial({
      map: marsMap,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
  }

  /**
   * Dedicated Material for Any Planet Exterior
   */
  function createPlanetSurfaceMaterial(planetKey) {
    if (planetKey === 'earth') {
      return createPhotorealisticEarthMaterials().surfaceMat;
    }
    if (planetKey === 'mars') {
      return createPhotorealisticMarsMaterial();
    }
    const tex = getPlanetTexture(planetKey);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: (planetKey === 'jupiter' || planetKey === 'saturn' || planetKey === 'uranus' || planetKey === 'neptune') ? 0.45 : 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
  }

  /**
   * Realistic 3D Saturn Rings Geometry & Procedural Bands Material
   */
  function createSaturnRings(innerRadius = 2.4, outerRadius = 4.2) {
    // Canvas procedural ring texture for Cassini division and ring bands
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');

    // Gradient representing C-ring, B-ring, Cassini division, A-ring, Encke gap
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0.00, 'rgba(0,0,0,0)');
    grad.addColorStop(0.12, 'rgba(160,140,110,0.35)'); // C Ring
    grad.addColorStop(0.28, 'rgba(215,195,160,0.85)'); // B Ring Inner
    grad.addColorStop(0.55, 'rgba(240,225,185,0.95)'); // B Ring Outer (densest)
    grad.addColorStop(0.58, 'rgba(10,10,15,0.02)');    // Cassini Division
    grad.addColorStop(0.64, 'rgba(10,10,15,0.02)');    // Cassini Division
    grad.addColorStop(0.68, 'rgba(195,175,145,0.80)'); // A Ring Inner
    grad.addColorStop(0.85, 'rgba(175,155,130,0.70)'); // A Ring Outer
    grad.addColorStop(0.88, 'rgba(10,10,15,0.05)');    // Encke Gap
    grad.addColorStop(0.92, 'rgba(160,145,120,0.60)');
    grad.addColorStop(1.00, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1);

    const ringTex = new THREE.CanvasTexture(canvas);
    ringTex.generateMipmaps = true;

    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 64);
    
    // Adjust UV coordinates for concentric mapping
    const pos = ringGeo.attributes.position;
    const uvs = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const u = (dist - innerRadius) / (outerRadius - innerRadius);
      uvs.setXY(i, u, 0.5);
    }
    uvs.needsUpdate = true;

    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
      roughness: 0.6,
      metalness: 0.1
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    return ringMesh;
  }

  /**
   * Delicate Atmospheric Scattering Fresnel Glow Shader
   */
  function createAtmosphereFresnelMaterial(colorHex = 0x38bdf8) {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vec3 viewDir = normalize(-vPosition);
        float viewDot = clamp(dot(vNormal, viewDir), 0.0, 1.0);
        float intensity = pow(1.0 - viewDot, 3.5);
        gl_FragColor = vec4(glowColor, intensity * 0.45);
      }
    `;

    return new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        glowColor: { value: new THREE.Color(colorHex) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false
    });
  }

  /**
   * Distinct Interior Layer Materials based on Geophysics for All 8 Planets
   */
  function createGeophysicalLayerMaterial(layerData) {
    const id = layerData.id;

    // 1. CRUST / REGOLITH: Rugged lithospheric silicate rock with matte roughness
    if (id === 'crust') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(layerData.colorHex || '#8d6e63'),
        roughness: 0.92,
        metalness: 0.08,
        side: THREE.DoubleSide
      });
    }

    // 2. MANTLES (Earth, Mars, Venus, Mercury): Ductile convective silicates
    if (id.includes('mantle')) {
      const isLower = id === 'lower_mantle';
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(layerData.colorHex || (isLower ? '#991b1b' : '#c2410c')),
        emissive: new THREE.Color(isLower ? '#7f1d1d' : '#9a3412'),
        emissiveIntensity: isLower ? 0.30 : 0.20,
        roughness: 0.78,
        metalness: 0.15,
        side: THREE.DoubleSide
      });
    }

    // 3. LIQUID CORES (Earth Outer Core, Mars Liquid Core, Mercury Outer Core, Venus Core)
    if (id === 'outer_core' || id === 'core') {
      const lavaMap = loadTextureWithFallback('lava');
      if (lavaMap) {
        lavaMap.wrapS = THREE.RepeatWrapping;
        lavaMap.wrapT = THREE.RepeatWrapping;
        lavaMap.repeat.set(2, 2);
      }

      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#f59e0b'),
        emissive: new THREE.Color('#ea580c'),
        emissiveMap: lavaMap,
        emissiveIntensity: 0.65, // Moderated so it conveys molten convection without blinding blowout
        roughness: 0.45,
        metalness: 0.40,
        side: THREE.DoubleSide
      });
    }

    // 4. SOLID INNER CORES (Earth, Mercury): Crystalline metallic iron-nickel lattice
    // Balanced lighting, physically grounded: NOT excessive white reflections
    if (id === 'inner_core') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#fef08a'),
        emissive: new THREE.Color('#d97706'),
        emissiveIntensity: 0.20, // Subtle geothermal heat glow, clean and readable
        roughness: 0.55,         // Matte crystalline structure
        metalness: 0.35,         // Moderate metallicity, eliminates blown-out reflections
        side: THREE.DoubleSide
      });
    }

    // 5. GAS GIANT ATMOSPHERE LAYERS (Jupiter, Saturn, Uranus, Neptune)
    if (id === 'atmosphere') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(layerData.colorHex || '#f59e0b'),
        roughness: 0.70,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
    }

    // 6. SUPERCRITICAL FLUID HYDROGEN & HELIUM RAIN (Jupiter, Saturn)
    if (id === 'fluid_hydrogen' || id === 'molecular_hydrogen_ocean') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(layerData.colorHex || '#ca8a04'),
        emissive: new THREE.Color('#854d0e'),
        emissiveIntensity: 0.22,
        roughness: 0.50,
        metalness: 0.25,
        side: THREE.DoubleSide
      });
    }

    // 7. LIQUID METALLIC HYDROGEN (Jupiter, Saturn)
    // Deep opalescent indigo/violet metallic sheen
    if (id === 'metallic_hydrogen') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#6366f1'),
        emissive: new THREE.Color('#3730a3'),
        emissiveIntensity: 0.35,
        roughness: 0.32,
        metalness: 0.70, // High conductivity degenerate metallic state
        side: THREE.DoubleSide
      });
    }

    // 8. DIFFUSE / FUZZY CORES (Jupiter, Saturn)
    // Juno/Cassini benchmark: Slurry of silicate rock and hydrogen
    if (id === 'diffuse_core') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#06b6d4'),
        emissive: new THREE.Color('#0891b2'),
        emissiveIntensity: 0.30,
        roughness: 0.60,
        metalness: 0.30,
        side: THREE.DoubleSide
      });
    }

    // 9. ICE GIANT IONIC & SUPERIONIC WATER MANTLES (Uranus, Neptune)
    if (id === 'ionic_water_mantle' || id === 'superionic_water_mantle') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(layerData.colorHex || '#0891b2'),
        emissive: new THREE.Color('#0e7490'),
        emissiveIntensity: 0.28,
        roughness: 0.40,
        metalness: 0.45,
        side: THREE.DoubleSide
      });
    }

    // 10. ROCKY CORES (Uranus, Neptune)
    if (id === 'rocky_core') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#94a3b8'),
        emissive: new THREE.Color('#475569'),
        emissiveIntensity: 0.15,
        roughness: 0.70,
        metalness: 0.30,
        side: THREE.DoubleSide
      });
    }

    // Default fallback
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(layerData.colorHex || '#f59e0b'),
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
  }

  return {
    TEXTURE_PATHS,
    loadTextureWithFallback,
    getPlanetTexture,
    createPhotorealisticEarthMaterials,
    createPhotorealisticMarsMaterial,
    createPlanetSurfaceMaterial,
    createSaturnRings,
    createAtmosphereFresnelMaterial,
    createAtmosphereGlowMaterial: createAtmosphereFresnelMaterial,
    createGeophysicalLayerMaterial
  };
}));
