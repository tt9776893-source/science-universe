import { document, window } from '../../ctx.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { assetRegistry } from '../core/AssetRegistry.js';
import { audio } from '../audio/ProceduralAudio.js';
import { input } from '../core/InputManager.js';
import { getLandingUnavailableMessage, getPlanetId, resolvePlanetEnvironment } from '../world/PlanetEnvironment.js';

export const SOLAR_PLANETS = [
  {
    id: 'mercury',
    name: 'Mercury',
    mn: 'Буд',
    r: 4.2,
    orbit: 78,
    spin: 0.11,
    tilt: 0.01,
    distance: '57.9 сая км',
    diameter: '4,879 км',
    year: '88 өдөр',
    temp: '−180–430°C',
    gravity: '0.38g',
    solidSurface: true,
    desc: 'Наранд хамгийн ойр, тогоо ихтэй жижиг чулуурхаг гараг. Хатуу гадаргуутай тул газардах боломжтой.'
  },
  {
    id: 'venus',
    name: 'Venus',
    mn: 'Сугар',
    r: 7.0,
    orbit: 126,
    spin: -0.025,
    tilt: 0.05,
    distance: '108.2 сая км',
    diameter: '12,104 км',
    year: '225 өдөр',
    temp: '≈465°C',
    gravity: '0.90g',
    solidSurface: true,
    desc: 'Өтгөн нүүрсхүчлийн хийн агаар мандалтай, маш халуун чулуурхаг гараг.'
  },
  {
    id: 'earth',
    name: 'Earth',
    mn: 'Дэлхий',
    r: 7.6,
    orbit: 182,
    spin: 0.34,
    tilt: 0.41,
    distance: '149.6 сая км',
    diameter: '12,742 км',
    year: '365.25 өдөр',
    temp: '≈15°C',
    gravity: '1.0g',
    solidSurface: true,
    desc: 'Шингэн устай, амьдрал оршдог бидний эх гараг.'
  },
  {
    id: 'moon',
    name: 'Moon',
    mn: 'Сар',
    r: 2.2,
    orbit: 24,
    parentId: 'earth',
    spin: 0.035,
    tilt: 0.03,
    distance: '384,400 км',
    diameter: '3,475 км',
    year: '27.3 өдөр',
    temp: '−173–127°C',
    gravity: '0.165g',
    solidSurface: true,
    desc: 'Дэлхийн байгалийн дагуул. Агаар мандалгүй, тогоо ихтэй базальтлаг гадаргуутай.'
  },
  {
    id: 'mars',
    name: 'Mars',
    mn: 'Ангараг',
    r: 5.8,
    orbit: 246,
    spin: 0.32,
    tilt: 0.44,
    distance: '227.9 сая км',
    diameter: '6,779 км',
    year: '687 өдөр',
    temp: '≈−63°C',
    gravity: '0.38g',
    solidSurface: true,
    desc: 'Төмрийн исэл ихтэй учраас улаан харагддаг чулуурхаг гараг. Jezero суурин байрлаж буй газар.'
  },
  {
    id: 'sun',
    name: 'Sun',
    mn: 'Нар',
    r: 22.0,
    orbit: 0,
    spin: 0.18,
    tilt: 0.0,
    distance: '0 км',
    diameter: '1,391,000 км',
    year: '~225 сая жил',
    temp: '≈5,500°C',
    gravity: '27.9g',
    solidSurface: false,
    observationOnly: true,
    desc: 'Нарны төв. Аюулгүй зайнаас нарны цацрагийн шинж чанар, гэнэтийн гялбаа, гэрлийн хүчийг ажиглах боломжтой.'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    mn: 'Бархасбадь',
    r: 19.8,
    orbit: 368,
    spin: 0.55,
    tilt: 0.055,
    distance: '778.5 сая км',
    diameter: '139,820 км',
    year: '11.86 жил',
    temp: '≈−110°C',
    gravity: '2.53g',
    solidSurface: false,
    probeProfile: { cloudTopPressureKPa: 20, cloudTopTemperatureK: 165, warmingK: 310 },
    desc: 'Нарны аймгийн хамгийн том хийн аварга. Хатуу гадаргуу байхгүй тул газардах боломжгүй.'
  },
  {
    id: 'saturn',
    name: 'Saturn',
    mn: 'Санчир',
    r: 16.6,
    orbit: 508,
    spin: 0.49,
    tilt: 0.47,
    ring: true,
    distance: '1.43 тэрбум км',
    diameter: '116,460 км',
    year: '29.5 жил',
    temp: '≈−140°C',
    gravity: '1.06g',
    solidSurface: false,
    probeProfile: { cloudTopPressureKPa: 10, cloudTopTemperatureK: 134, warmingK: 280 },
    desc: 'Өргөн мөсөн цагирагаараа алдартай хийн аварга. Хатуу гадаргуу байхгүй.'
  },
  {
    id: 'uranus',
    name: 'Uranus',
    mn: 'Тэнгэрийн ван',
    r: 11.4,
    orbit: 658,
    spin: -0.26,
    tilt: 1.71,
    distance: '2.87 тэрбум км',
    diameter: '50,724 км',
    year: '84 жил',
    temp: '≈−195°C',
    gravity: '0.89g',
    solidSurface: false,
    probeProfile: { cloudTopPressureKPa: 10, cloudTopTemperatureK: 76, warmingK: 220 },
    desc: 'Тэнхлэг нь хажуугаараа хэвтсэн мөсөн аварга гараг.'
  },
  {
    id: 'neptune',
    name: 'Neptune',
    mn: 'Далайн ван',
    r: 11.0,
    orbit: 815,
    spin: 0.29,
    tilt: 0.49,
    distance: '4.50 тэрбум км',
    diameter: '49,244 км',
    year: '164.8 жил',
    temp: '≈−200°C',
    gravity: '1.14g',
    solidSurface: false,
    probeProfile: { cloudTopPressureKPa: 15, cloudTopTemperatureK: 72, warmingK: 230 },
    desc: 'Алслагдсан, хөх өнгөтэй мөсөн аварга гараг.'
  }
];

function fitModelToRadius(model, targetRadius) {
  model.traverse((child) => {
    if (child.isMesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const m of mats) {
        if (m && m.transmission > 0) {
          m.transmission = 0;
          m.transparent = true;
          if (m.opacity > 0.85) m.opacity = 0.65;
        }
      }
    }
  });
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  model.position.sub(center);
  const wrap = new THREE.Group();
  wrap.add(model);
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  wrap.scale.setScalar((targetRadius * 2.0) / maxDim);
  return wrap;
}

export class SpaceflightSystem {
  constructor(renderer, onLandOnPlanet, onLandingUnavailable = null, onProbeComplete = null) {
    this.renderer = renderer;
    this.onLandOnPlanet = onLandOnPlanet;
    this.onLandingUnavailable = onLandingUnavailable;
    this.onProbeComplete = onProbeComplete;

    this.isActive = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010208);

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 18000);
    this.camera.position.set(0, 350, 650);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 3500;
    this.controls.minDistance = 2;
    this.controls.enabled = false;

    // Flight state: 'FREE_FLIGHT', 'TRANSFER_TRAJECTORY', 'ORBIT_HOLD', 'DEORBIT_BURN'
    this.flightState = 'FREE_FLIGHT';
    this.selectedBody = null;
    this.selectedPlanetId = null;
    this.pendingLandingDestination = null;
    this.probeMission = null;
    this.observationMission = null;
    this.areControlsEnabled = true;
    this.cameraMode = 'COCKPIT'; // 'COCKPIT' (First Person) | 'CHASE' (Third Person) | 'ORBIT'

    // Spacecraft velocity & orientation
    this.rocketPos = new THREE.Vector3(0, 0, 246); // Starting in Mars orbit
    this.rocketVel = new THREE.Vector3(0, 0, 0);
    this.rocketSpeed = 18.0;
    this.rocketForward = new THREE.Vector3(0, 0, -1);
    this.steerPitch = 0;
    this.steerYaw = 0;
    this.steerRoll = 0;

    // Chase camera spring-damper state
    this.cameraChasePos = new THREE.Vector3();
    this.cameraChaseVel = new THREE.Vector3();

    // Cockpit head look
    this.cockpitLookYaw = 0;
    this.cockpitLookPitch = 0;

    // Re-entry deorbit sequence
    this.deorbitTimer = 0;
    this.isDeorbiting = false;
    this.reentryShake = 0;

    // Transfer trajectory
    this.transferT = 0;
    this.transferDuration = 12.0;
    this.transferStartPos = new THREE.Vector3();
    this.transferEndPos = new THREE.Vector3();

    this.bodies = [];
    this.moons = [];

    this._initSolarSystem();
    this._initRocketCraft();
    this._initCockpitInterior();
    this._initSpaceHUD();
  }

  _initSolarSystem() {
    // 1. Deep Space Starfield (16,000 spectral stars)
    const starCount = 16000;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const tints = [
      [0.7, 0.82, 1.0],
      [0.9, 0.95, 1.0],
      [1.0, 1.0, 1.0],
      [1.0, 0.92, 0.8],
      [1.0, 0.72, 0.4]
    ];

    for (let i = 0; i < starCount; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(2600 + Math.random() * 5000);
      starPos[i * 3] = v.x;
      starPos[i * 3 + 1] = v.y;
      starPos[i * 3 + 2] = v.z;

      const tint = tints[Math.floor(Math.random() * tints.length)];
      const brightness = 0.4 + Math.random() * 0.6;
      starCol[i * 3] = tint[0] * brightness;
      starCol[i * 3 + 1] = tint[1] * brightness;
      starCol[i * 3 + 2] = tint[2] * brightness;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false
    });
    this.scene.add(new THREE.Points(starGeo, starMat));

    // 2. Central Sun
    let sunModel = assetRegistry.getClonedModel('sun.glb');
    let sunMesh;
    if (sunModel) {
      sunMesh = fitModelToRadius(sunModel, 24.0);
    } else {
      const geo = new THREE.SphereGeometry(24, 48, 32);
      const mat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
      sunMesh = new THREE.Mesh(geo, mat);
    }
    this.scene.add(sunMesh);

    const sunLight = new THREE.PointLight(0xfffaed, 3.2, 5000, 0.25);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);
    this.scene.add(new THREE.AmbientLight(0x1a2436, 0.65));

    // 3. Populate Planets
    SOLAR_PLANETS.forEach((d, i) => {
      if (d.id === 'sun') return;

      // Orbital Ring Guide
      const ringGeo = new THREE.RingGeometry(d.orbit - 0.25, d.orbit + 0.25, 180);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const orbitRing = new THREE.Mesh(ringGeo, ringMat);
      orbitRing.rotation.x = Math.PI / 2;
      this.scene.add(orbitRing);

      // Planet Orbit Pivot Group
      const pivot = new THREE.Group();
      pivot.rotation.y = i * 0.75 + 0.35;
      const parentBody = d.parentId ? this.bodies.find(body => body.data.id === d.parentId) : null;
      (parentBody?.bodyMesh || this.scene).add(pivot);

      // Planet Sphere / Model
      let bodyMesh = null;
      if (d.id === 'moon') {
        const geo = new THREE.SphereGeometry(d.r, 36, 24);
        const mat = new THREE.MeshStandardMaterial({ color: 0x929397, roughness: 0.98, metalness: 0.02 });
        bodyMesh = new THREE.Mesh(geo, mat);
      } else if (d.name === 'Neptune') {
        const neptuneModel = assetRegistry.getClonedModel('neptune.glb');
        if (neptuneModel) {
          bodyMesh = fitModelToRadius(neptuneModel, d.r);
        }
      } else if (d.name === 'Mars') {
        // High fidelity procedural Mars texture
        bodyMesh = this._createMarsGlobe(d.r);
      }

      if (!bodyMesh) {
        const geo = new THREE.SphereGeometry(d.r, 48, 32);
        const colMap = {
          Mercury: 0x88827b,
          Venus: 0xd7a45d,
          Earth: 0x2e80d0,
          Jupiter: 0xc59a73,
          Saturn: 0xd9c69a,
          Uranus: 0x76d4df
        };
        const mat = new THREE.MeshStandardMaterial({
          color: colMap[d.name] || 0x888888,
          roughness: 0.8,
          metalness: 0.1
        });
        bodyMesh = new THREE.Mesh(geo, mat);
      }

      bodyMesh.position.x = d.orbit;
      bodyMesh.rotation.z = d.tilt;
      bodyMesh.userData = d;
      pivot.add(bodyMesh);

      // Saturn Rings
      if (d.ring) {
        const satRingGeo = new THREE.RingGeometry(d.r * 1.35, d.r * 2.35, 64);
        const satRingMat = new THREE.MeshStandardMaterial({
          color: 0xd1be9d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const satRing = new THREE.Mesh(satRingGeo, satRingMat);
        satRing.rotation.x = Math.PI / 2.3;
        bodyMesh.add(satRing);
      }

      // Atmospheric Limb Glow Shader
      if (!d.parentId && ['Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(d.name)) {
        const atm = this._createAtmosphereLimb(d.r, d.name);
        atm.position.x = d.orbit;
        pivot.add(atm);
      }

      this.bodies.push({ data: d, pivot, bodyMesh });
    });

    // 4. Distant Black Hole (TON 618)
    const blackHoleModel = assetRegistry.getClonedModel('ton_618_black_hole.glb');
    if (blackHoleModel) {
      const blackHole = fitModelToRadius(blackHoleModel, 75.0);
      blackHole.position.set(2200, 500, -2800);
      blackHole.rotation.set(0.3, -0.4, 0.2);
      this.scene.add(blackHole);
    }
  }

  _createMarsGlobe(radius) {
    const geo = new THREE.SphereGeometry(radius, 64, 48);
    // Generate realistic Mars map canvas texture with polar caps, Jezero crater, and maria
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base terracotta Martian regolith
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#f1f5f9'); // North polar ice cap
    grad.addColorStop(0.12, '#9a3412');
    grad.addColorStop(0.35, '#c2410c');
    grad.addColorStop(0.5, '#ea580c'); // Equatorial deserts
    grad.addColorStop(0.7, '#7c2d12'); // Dark volcanic maria
    grad.addColorStop(0.88, '#9a3412');
    grad.addColorStop(1.0, '#f1f5f9'); // South polar ice cap
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Multi-octave dark basaltic maria & crater dust
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 1024;
      const y = 80 + Math.random() * 350;
      const r = 15 + Math.random() * 85;
      const op = 0.05 + Math.random() * 0.15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = (Math.random() > 0.4) ? `rgba(60, 20, 10, ${op})` : `rgba(220, 100, 50, ${op})`;
      ctx.fill();
    }

    // Prominent Jezero Crater landing target circle
    ctx.beginPath();
    ctx.arc(580, 210, 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(75, 25, 12, 0.65)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.stroke();

    const marsTex = new THREE.CanvasTexture(canvas);
    marsTex.wrapS = THREE.RepeatWrapping;

    const mat = new THREE.MeshStandardMaterial({
      map: marsTex,
      roughness: 0.78,
      metalness: 0.12
    });

    return new THREE.Mesh(geo, mat);
  }

  _createAtmosphereLimb(radius, planetName) {
    const colMap = {
      Venus: 0xffd9a0,
      Earth: 0x5aa8ff,
      Mars: 0xe07855,
      Jupiter: 0xe9d2b0,
      Saturn: 0xf0dfb4,
      Uranus: 0x9ee6ea,
      Neptune: 0x4d78ff
    };

    const uniforms = {
      uColor: { value: new THREE.Color(colMap[planetName] || 0x66aaff) },
      uK: { value: 1.25 }
    };

    const vert = `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
      }
    `;

    const frag = `
      uniform vec3 uColor;
      uniform float uK;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.2);
        gl_FragColor = vec4(uColor * f * uK, f * 0.85);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.045, 48, 32), mat);
  }

  _initRocketCraft() {
    this.spaceRocketGroup = new THREE.Group();
    this.scene.add(this.spaceRocketGroup);

    let craft = assetRegistry.getClonedModel('vulcan_centaur_rocket.glb');
    if (!craft) {
      craft = assetRegistry.getClonedModel('electron_-_rocket_lab.glb');
    }
    if (!craft) {
      const geo = new THREE.ConeGeometry(0.8, 4.5, 16);
      const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8, roughness: 0.3 });
      craft = new THREE.Mesh(geo, mat);
      craft.rotation.x = -Math.PI / 2;
    } else {
      craft.scale.setScalar(0.12);
      craft.rotation.x = -Math.PI / 2;
    }
    this.externalCraftMesh = craft;
    this.spaceRocketGroup.add(craft);

    // Atmospheric probe (deployed for gas/ice giants and Sun)
    this._initAtmosphericProbe();

    // Engine exhaust plasma plume
    this._initSpacePlume();

    // Start in Mars orbital neighborhood
    const mars = this.bodies.find(b => b.data.name === 'Mars');
    if (mars) {
      const v = new THREE.Vector3();
      mars.bodyMesh.getWorldPosition(v);
      this.rocketPos.set(v.x + 14.0, v.y + 2.5, v.z + 14.0);
      this.selectedBody = mars.data;
    }
    this.spaceRocketGroup.position.copy(this.rocketPos);
  }

  _initCockpitInterior() {
    this.cockpitGroup = new THREE.Group();
    this.spaceRocketGroup.add(this.cockpitGroup);

    // Load authentic SU_Part_Cockpit model
    let cockpitModel = assetRegistry.getClonedModel('SU_Part_Cockpit.glb');
    if (cockpitModel) {
      cockpitModel.scale.setScalar(1.2);
      cockpitModel.position.set(0, 0, 0);

      // Make canopy glass transparent with cyan tint (avoid transmission multipass refraction on integrated GPUs)
      cockpitModel.traverse(child => {
        if (child.isMesh) {
          if (child.name.toLowerCase().includes('canopy')) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              metalness: 0.2,
              roughness: 0.1,
              transparent: true,
              opacity: 0.16,
              depthWrite: false
            });
          } else if (child.material && child.material.transmission > 0) {
            child.material.transmission = 0;
            child.material.transparent = true;
          }
        }
      });
      this.cockpitGroup.add(cockpitModel);
    }

    // Cockpit Pilot Camera attachment node
    this.cockpitCamNode = new THREE.Group();
    this.cockpitCamNode.position.set(0, 0.42, 0.15); // Eye level in pilot seat
    this.cockpitGroup.add(this.cockpitCamNode);

    // Re-entry atmospheric ionization plasma visor overlay
    const plasmaGeo = new THREE.PlaneGeometry(1.8, 1.2);
    const plasmaVert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const plasmaFrag = `
      uniform float uTime;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        float edge = distance(vUv, vec2(0.5)) * 2.0;
        float heat = sin(vUv.y * 30.0 - uTime * 25.0) * cos(vUv.x * 20.0 + uTime * 15.0);
        vec3 col = mix(vec3(1.0, 0.4, 0.05), vec3(1.0, 0.85, 0.3), heat * 0.5 + 0.5);
        float a = smoothstep(0.4, 1.0, edge) * uIntensity * 0.75;
        gl_FragColor = vec4(col * 1.5, a);
      }
    `;
    this.plasmaUniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 0.0 }
    };
    this.plasmaMat = new THREE.ShaderMaterial({
      uniforms: this.plasmaUniforms,
      vertexShader: plasmaVert,
      fragmentShader: plasmaFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.plasmaMesh = new THREE.Mesh(plasmaGeo, this.plasmaMat);
    this.plasmaMesh.position.set(0, 0, -0.65);
    this.cockpitCamNode.add(this.plasmaMesh);

    // 3 Holographic Dynamic MFD Screens
    this._initMfdDisplays();
  }

  _initMfdDisplays() {
    // 1. Left MFD: Systems & Propulsion
    this.leftMfdCanvas = document.createElement('canvas');
    this.leftMfdCanvas.width = 256;
    this.leftMfdCanvas.height = 256;
    this.leftMfdTex = new THREE.CanvasTexture(this.leftMfdCanvas);
    const leftMat = new THREE.MeshBasicMaterial({ map: this.leftMfdTex, transparent: true, opacity: 0.95 });
    const leftMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.30), leftMat);
    leftMesh.position.set(-0.44, -0.16, -0.60);
    leftMesh.rotation.y = 0.36;
    leftMesh.rotation.x = -0.32;
    this.cockpitCamNode.add(leftMesh);

    // 2. Center HUD: Artificial Horizon & Flight Director
    this.centerHudCanvas = document.createElement('canvas');
    this.centerHudCanvas.width = 384;
    this.centerHudCanvas.height = 256;
    this.centerHudTex = new THREE.CanvasTexture(this.centerHudCanvas);
    const centerMat = new THREE.MeshBasicMaterial({ map: this.centerHudTex, transparent: true, opacity: 0.95 });
    const centerMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.30), centerMat);
    centerMesh.position.set(0, -0.15, -0.62);
    centerMesh.rotation.x = -0.35;
    this.cockpitCamNode.add(centerMesh);

    // 3. Right MFD: Orbital Radar & Navigation Altimeter
    this.rightMfdCanvas = document.createElement('canvas');
    this.rightMfdCanvas.width = 256;
    this.rightMfdCanvas.height = 256;
    this.rightMfdTex = new THREE.CanvasTexture(this.rightMfdCanvas);
    const rightMat = new THREE.MeshBasicMaterial({ map: this.rightMfdTex, transparent: true, opacity: 0.95 });
    const rightMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.30), rightMat);
    rightMesh.position.set(0.44, -0.16, -0.60);
    rightMesh.rotation.y = -0.36;
    rightMesh.rotation.x = -0.32;
    this.cockpitCamNode.add(rightMesh);
  }

  _drawCockpitDisplays(delta, now) {
    // 1. Draw Left MFD
    const lCtx = this.leftMfdCanvas.getContext('2d');
    lCtx.fillStyle = 'rgba(5, 15, 30, 0.92)';
    lCtx.fillRect(0, 0, 256, 256);
    lCtx.strokeStyle = '#0284c7';
    lCtx.lineWidth = 3;
    lCtx.strokeRect(4, 4, 248, 248);

    lCtx.font = 'bold 16px monospace';
    lCtx.fillStyle = '#38bdf8';
    lCtx.fillText('SPACECRAFT PROPULSION', 16, 28);
    lCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    lCtx.beginPath();
    lCtx.moveTo(16, 36);
    lCtx.lineTo(240, 36);
    lCtx.stroke();

    lCtx.font = '13px monospace';
    lCtx.fillStyle = '#94a3b8';
    lCtx.fillText(`MAIN ENGINE:`, 16, 68);
    lCtx.fillStyle = (this.isDeorbiting) ? '#ef4444' : '#10b981';
    lCtx.fillText(this.isDeorbiting ? 'DE-ORBIT RETRO' : 'NOMINAL [ARMED]', 120, 68);

    lCtx.fillStyle = '#94a3b8';
    lCtx.fillText(`VELOCITY:`, 16, 96);
    lCtx.fillStyle = '#38bdf8';
    lCtx.fillText(`${Math.round(this.rocketSpeed)} km/s`, 120, 96);

    lCtx.fillStyle = '#94a3b8';
    lCtx.fillText(`RCS PROPELLANT:`, 16, 124);
    lCtx.fillStyle = '#38bdf8';
    lCtx.fillText(`94.2 %`, 140, 124);

    // Throttle bar
    lCtx.fillStyle = '#94a3b8';
    lCtx.fillText('THROTTLE OUTPUT:', 16, 160);
    lCtx.fillStyle = 'rgba(255,255,255,0.1)';
    lCtx.fillRect(16, 172, 224, 18);
    const thrustPct = (this.flightState === 'TRANSFER_TRAJECTORY' || this.isDeorbiting) ? 1.0 : (input.isKeyDown('KeyW') ? 0.85 : 0.25);
    lCtx.fillStyle = this.isDeorbiting ? '#f59e0b' : '#0284c7';
    lCtx.fillRect(16, 172, 224 * thrustPct, 18);

    lCtx.fillStyle = '#64748b';
    lCtx.font = '11px monospace';
    lCtx.fillText('[W/S] Throttle • [Q/E] Roll', 16, 224);
    lCtx.fillText('[A/D] Yaw • [V] Toggle Cam', 16, 240);

    this.leftMfdTex.needsUpdate = true;

    // 2. Draw Center HUD
    const cCtx = this.centerHudCanvas.getContext('2d');
    cCtx.clearRect(0, 0, 384, 256);

    // Artificial horizon pitch ladder
    cCtx.save();
    cCtx.translate(192, 128);
    cCtx.rotate(this.steerRoll);

    cCtx.strokeStyle = '#38bdf8';
    cCtx.lineWidth = 2;
    // Central boresight
    cCtx.beginPath();
    cCtx.moveTo(-35, 0);
    cCtx.lineTo(-12, 0);
    cCtx.moveTo(12, 0);
    cCtx.lineTo(35, 0);
    cCtx.arc(0, 0, 6, 0, Math.PI * 2);
    cCtx.stroke();

    // Pitch rungs
    for (let p = -2; p <= 2; p++) {
      if (p === 0) continue;
      const y = p * 28 + this.steerPitch * 40;
      cCtx.beginPath();
      cCtx.moveTo(-24, y);
      cCtx.lineTo(24, y);
      cCtx.stroke();
    }
    cCtx.restore();

    // Top heading tape
    cCtx.font = 'bold 12px monospace';
    cCtx.fillStyle = '#38bdf8';
    cCtx.fillText(`HDG: ${Math.round((this.steerYaw * (180 / Math.PI) + 360) % 360)}°`, 160, 24);
    cCtx.fillText(`ALT: 340 KM`, 20, 24);
    cCtx.fillText(`TARGET: MARS`, 260, 24);

    if (this.isDeorbiting) {
      cCtx.font = 'bold 15px monospace';
      cCtx.fillStyle = (Math.sin(now * 0.01) > 0) ? '#ef4444' : '#ffffff';
      cCtx.fillText('⚠️ DE-ORBIT BURN IN PROGRESS ⚠️', 60, 230);
    }

    this.centerHudTex.needsUpdate = true;

    // 3. Draw Right MFD
    const rCtx = this.rightMfdCanvas.getContext('2d');
    rCtx.fillStyle = 'rgba(5, 15, 30, 0.92)';
    rCtx.fillRect(0, 0, 256, 256);
    rCtx.strokeStyle = '#0284c7';
    rCtx.lineWidth = 3;
    rCtx.strokeRect(4, 4, 248, 248);

    rCtx.font = 'bold 16px monospace';
    rCtx.fillStyle = '#38bdf8';
    rCtx.fillText('ORBITAL RADAR', 16, 28);

    // Draw radar sweep circle
    rCtx.save();
    rCtx.translate(128, 120);
    rCtx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    rCtx.lineWidth = 1.5;
    rCtx.beginPath();
    rCtx.arc(0, 0, 65, 0, Math.PI * 2);
    rCtx.arc(0, 0, 35, 0, Math.PI * 2);
    rCtx.moveTo(-75, 0);
    rCtx.lineTo(75, 0);
    rCtx.moveTo(0, -75);
    rCtx.lineTo(0, 75);
    rCtx.stroke();

    // Radar blip for Mars Jezero Crater
    const sweepAngle = now * 0.002;
    rCtx.strokeStyle = '#38bdf8';
    rCtx.beginPath();
    rCtx.moveTo(0, 0);
    rCtx.lineTo(Math.cos(sweepAngle) * 65, Math.sin(sweepAngle) * 65);
    rCtx.stroke();

    rCtx.fillStyle = '#ef4444';
    rCtx.beginPath();
    rCtx.arc(22, -18, 5, 0, Math.PI * 2);
    rCtx.fill();
    rCtx.restore();

    rCtx.font = '12px monospace';
    rCtx.fillStyle = '#94a3b8';
    rCtx.fillText('LANDING SITE: JEZERO CRATER', 16, 215);
    rCtx.fillStyle = '#10b981';
    rCtx.fillText('PRESS [L] TO DE-ORBIT & LAND', 16, 235);

    this.rightMfdTex.needsUpdate = true;
  }

  _initSpacePlume() {
    const vert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const frag = `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        float down = 1.0 - vUv.y;
        float radial = abs(vUv.x - 0.5) * 2.0;
        float diamond = pow(max(0.0, sin(down * 24.0 - uTime * 35.0)), 3.0) * (1.0 - down);
        vec3 col = mix(vec3(0.5, 0.85, 1.0), vec3(1.0, 0.55, 0.15), down) + vec3(0.8, 0.95, 1.0) * diamond;
        float alpha = smoothstep(1.0, 0.05, radial) * smoothstep(0.0, 0.1, down) * (1.0 - smoothstep(0.65, 1.0, down));
        gl_FragColor = vec4(col * 1.8, clamp(alpha, 0.0, 1.0));
      }
    `;

    this.spacePlumeMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const cone = new THREE.CylinderGeometry(0.12, 0.75, 4.2, 16, 8, true);
    cone.translate(0, -2.1, 0);
    cone.rotateX(-Math.PI / 2);
    this.spacePlumeMesh = new THREE.Mesh(cone, this.spacePlumeMat);
    this.spacePlumeMesh.position.set(0, 0, -2.5);
    this.spaceRocketGroup.add(this.spacePlumeMesh);
  }

  _initAtmosphericProbe() {
    this.probeMesh = new THREE.Group();

    // Probe main body
    const bodyGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.2, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.6, roughness: 0.3 });
    const probeBody = new THREE.Mesh(bodyGeo, bodyMat);
    probeBody.rotation.x = Math.PI / 2;
    probeBody.position.y = -0.6;
    this.probeMesh.add(probeBody);

    // Probe nose cone
    const noseGeo = new THREE.ConeGeometry(0.25, 0.8, 12);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.8, roughness: 0.2 });
    const probeNose = new THREE.Mesh(noseGeo, noseMat);
    probeNose.rotation.x = Math.PI / 2;
    probeNose.position.y = -1.3;
    this.probeMesh.add(probeNose);

    // Heat shield at base
    const shieldGeo = new THREE.CircleGeometry(0.32, 12);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0xf39c12 });
    const probeShield = new THREE.Mesh(shieldGeo, shieldMat);
    probeShield.rotation.x = -Math.PI / 2;
    probeShield.position.y = 0.05;
    this.probeMesh.add(probeShield);

    // Parachute (deployed visually during descent)
    const chuteGeo = new THREE.ConeGeometry(0.9, 0.5, 16, 1, true);
    chuteGeo.translate(0, -0.25, 0);
    const chuteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    this.probeChute = new THREE.Mesh(chuteGeo, chuteMat);
    this.probeChute.rotation.x = -Math.PI / 2;
    this.probeChute.position.y = -0.9;
    this.probeChute.visible = false;
    this.probeMesh.add(this.probeChute);

    // Probe telemetry light
    this.probeLight = new THREE.PointLight(0x00ff88, 2, 12, 1);
    this.probeLight.position.set(0, -0.6, 0);
    this.probeMesh.add(this.probeLight);

    this.probeMesh.visible = false;
    this.spaceRocketGroup.add(this.probeMesh);

    this.probeDeployed = false;
    this.probeDescentAlt = 0;
    this.probeDescentSpeed = 0;
    this.probeDescentStartPos = new THREE.Vector3();
    this.probeDescentTargetPos = new THREE.Vector3();
  }

  _initSpaceHUD() {
    this.hudContainer = document.createElement('div');
    this.hudContainer.id = 'spaceflight-hud';
    this.hudContainer.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 120;
      font-family: 'Space Grotesk', system-ui, sans-serif;
      color: #e2f1ff;
    `;
    document.body.appendChild(this.hudContainer);

    this.hudContainer.innerHTML = `
      <!-- Top Title Bar -->
      <div class="spaceflight-title-bar" style="position: absolute; top: 16px; left: 20px; display: flex; gap: 12px; align-items: center; pointer-events: auto;">
        <div class="spaceflight-title-card" style="background: rgba(7, 17, 33, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 10px 18px; backdrop-filter: blur(12px);">
          <span style="font-size: 14px; font-weight: 800; color: #38bdf8; letter-spacing: 1.5px;">SCIENCE UNIVERSE</span>
          <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">ORBITAL COMMAND COCKPIT</span>
        </div>
      </div>

      <!-- Left Planet Navigation Rail -->
      <div id="planet-nav-rail" style="position: absolute; left: 20px; top: 76px; width: 175px; background: rgba(7, 17, 33, 0.9); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 14px; padding: 12px; backdrop-filter: blur(12px); pointer-events: auto; max-height: calc(100vh - 160px); overflow-y: auto;">
        <div style="font-size: 10px; font-weight: 800; color: #38bdf8; letter-spacing: 1px; margin-bottom: 8px;">CELESTIAL DESTINATIONS</div>
        <div id="planet-nav-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
      </div>

      <!-- Right Planet Info Panel -->
      <div id="planet-info-panel" style="position: absolute; right: 20px; top: 20px; width: 330px; background: rgba(7, 17, 33, 0.94); border: 1px solid rgba(56, 189, 248, 0.45); border-radius: 14px; padding: 18px; backdrop-filter: blur(14px); pointer-events: auto; display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div id="info-target-name" style="font-size: 22px; font-weight: 800; color: #ffffff;">MARS</div>
            <div id="info-target-sub" style="font-size: 11px; color: #38bdf8; letter-spacing: 1px;">АНГАРАГ ГАРАГ // JEZERO BASIN</div>
          </div>
          <button id="close-info-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;">✕</button>
        </div>
        <div id="info-target-desc" style="font-size: 12px; line-height: 1.5; color: #cbd5e1; margin-top: 10px;"></div>
        <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
          <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
            <span style="color: #64748b; display: block; font-size: 9px;">DIAMETER</span>
            <b id="info-diameter">6,779 км</b>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
            <span style="color: #64748b; display: block; font-size: 9px;">SURFACE TEMP</span>
            <b id="info-temp">−63°C</b>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
            <span style="color: #64748b; display: block; font-size: 9px;">GRAVITY</span>
            <b id="info-gravity">0.38g</b>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 8px; border-radius: 6px;">
            <span style="color: #64748b; display: block; font-size: 9px;">DISTANCE</span>
            <b id="info-distance">227.9M km</b>
          </div>
        </div>
        <div id="landing-action-container" style="margin-top: 16px;">
          <button id="fly-target-btn" style="width: 100%; background: linear-gradient(135deg, #0284c7, #2563eb); border: 1px solid #38bdf8; color: white; font-weight: 800; padding: 12px; border-radius: 8px; cursor: pointer; letter-spacing: 1px;">
            ⚡ FLY TO DESTINATION
          </button>
          <button id="land-planet-btn" style="width: 100%; margin-top: 8px; background: linear-gradient(135deg, #10b981, #059669); border: 1px solid #34d399; color: white; font-weight: 800; padding: 12px; border-radius: 8px; cursor: pointer; letter-spacing: 1px; display: block;">
            🛬 INITIATE DE-ORBIT & LANDING [L]
          </button>
        </div>
      </div>

      <!-- Bottom Flight Telemetry & Controls -->
      <div class="spaceflight-controls" style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; align-items: center; pointer-events: auto;">
        <div style="background: rgba(7, 17, 33, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 10px 20px; backdrop-filter: blur(12px); font-family: monospace; font-size: 12px;">
          SPEED: <b id="space-speed">18.0 km/s</b> &nbsp;|&nbsp; 
          TARGET: <b id="space-target" style="color: #38bdf8;">MARS</b> &nbsp;|&nbsp; 
          MODE: <b id="space-cam" style="color: #10b981;">COCKPIT [V]</b> &nbsp;|&nbsp;
          <span id="space-probe" style="color: #8ce2d2;">PROBE: --</span>
        </div>
        <button id="toggle-cam-btn" style="background: rgba(7, 17, 33, 0.9); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 10px; color: #e2f1ff; padding: 10px 14px; font-weight: 700; cursor: pointer;">
          🎥 VIEW: COCKPIT / CHASE [V]
        </button>
        <button id="quick-land-btn" style="background: linear-gradient(135deg, #10b981, #059669); border: 1px solid #34d399; border-radius: 10px; color: #ffffff; padding: 10px 18px; font-weight: 800; cursor: pointer; letter-spacing: 0.5px;">
          🛬 LAND ON SELECTED PLANET [L]
        </button>
      </div>

      <!-- Deorbit Warning Siren Banner -->
      <div id="deorbit-banner" style="display: none; position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); background: rgba(220, 38, 38, 0.88); border: 2px solid #f87171; border-radius: 12px; padding: 18px 36px; text-align: center; color: white; backdrop-filter: blur(8px);">
        <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px;">⚠️ DE-ORBIT BURN INITIATED ⚠️</div>
        <div id="deorbit-target-text" style="font-size: 13px; margin-top: 6px; letter-spacing: 1px;">ENTERING SELECTED PLANET ATMOSPHERE</div>
      </div>
      <div id="probe-mission-banner" style="display: none; position: absolute; top: 38%; left: 50%; transform: translate(-50%, -50%); width: min(460px, calc(100vw - 32px)); background: rgba(8, 24, 30, 0.94); border: 1px solid rgba(81, 214, 190, 0.72); border-radius: 8px; padding: 18px 20px; color: #e2f1ff; box-shadow: 0 12px 40px rgba(0,0,0,0.5);">
        <div id="probe-mission-status" style="font-weight: 800; color: #8ce2d2;">ATMOSPHERIC PROBE READY</div>
        <div id="probe-mission-report" style="margin-top: 8px; font-size: 12px; line-height: 1.5; color: #c4d6df;">Pressure and temperature readings will appear here.</div>
      </div>
    `;

    this._populatePlanetNav();
    this._attachHUDEvents();
  }

  _populatePlanetNav() {
    const list = document.getElementById('planet-nav-list');
    if (!list) return;

    const colors = {
      Mercury: '#88827b',
      Venus: '#d7a45d',
      Earth: '#2e80d0',
      Moon: '#a5a7aa',
      Mars: '#e07855',
      Jupiter: '#c59a73',
      Saturn: '#d9c69a',
      Uranus: '#76d4df',
      Neptune: '#315dcc'
    };

    SOLAR_PLANETS.forEach(p => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 6px 8px;
        color: #e2f1ff;
        font-size: 11px;
        cursor: pointer;
        text-align: left;
        width: 100%;
      `;
      btn.innerHTML = `
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${colors[p.name] || '#fff'}; display: inline-block;"></span>
        <b>${p.name}</b>
      `;
      btn.addEventListener('click', () => this.selectTarget(p));
      list.appendChild(btn);
    });
  }

  _attachHUDEvents() {
    document.getElementById('close-info-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('planet-info-panel');
      if (panel) panel.style.display = 'none';
    });

    document.getElementById('fly-target-btn')?.addEventListener('click', () => {
      if (this.selectedBody) {
        this.startTransferTo(this.selectedBody);
      }
    });

    document.getElementById('land-planet-btn')?.addEventListener('click', () => {
      this.initiateSelectedDestinationAction();
    });

    document.getElementById('quick-land-btn')?.addEventListener('click', () => {
      this.initiateSelectedDestinationAction();
    });

    document.getElementById('toggle-cam-btn')?.addEventListener('click', () => {
      this.toggleCameraMode();
    });

    // Keyboard listener in spaceflight
    window.addEventListener('keydown', (e) => {
      if (!this.isActive || !this.areControlsEnabled) return;
      if (e.code === 'KeyV' || e.code === 'KeyC') {
        this.toggleCameraMode();
      }
      if (e.code === 'KeyL') {
        this.initiateSelectedDestinationAction();
      }
      if (e.code === 'KeyM') {
        const rail = document.getElementById('planet-nav-rail');
        if (rail) rail.style.display = (rail.style.display === 'none') ? 'block' : 'none';
      }
    });

  }

  _resetCockpitLook() {
    this.cockpitLookYaw = 0;
    this.cockpitLookPitch = 0;
  }

  selectTarget(planetData) {
    if (this.probeMission && !this.probeMission.completed && this.probeMission.planetId !== getPlanetId(planetData)) {
      this.probeMission = null;
      const probeBanner = document.getElementById('probe-mission-banner');
      if (probeBanner) probeBanner.style.display = 'none';
    }
    if (this.observationMission && !this.observationMission.completed && this.observationMission.planetId !== getPlanetId(planetData)) {
      this.observationMission = null;
      const probeBanner = document.getElementById('probe-mission-banner');
      if (probeBanner) probeBanner.style.display = 'none';
    }
    this.selectedBody = planetData;
    this.selectedPlanetId = getPlanetId(planetData);
    const panel = document.getElementById('planet-info-panel');
    if (!panel) return;

    panel.style.display = 'block';
    document.getElementById('info-target-name').textContent = planetData.name.toUpperCase();
    document.getElementById('info-target-sub').textContent = `${planetData.mn} ГАРАГ`;
    const landingEnvironment = resolvePlanetEnvironment(planetData);
    const observationAvailable = Boolean(planetData.observationOnly || this.selectedPlanetId === 'sun');
    const probeAvailable = planetData.solidSurface === false && Boolean(planetData.probeProfile);
    const detailMessage = observationAvailable
      ? getLandingUnavailableMessage(planetData)
      : landingEnvironment || probeAvailable
        ? `${planetData.desc} ${probeAvailable ? getLandingUnavailableMessage(planetData) : ''}`.trim()
        : `${planetData.desc} ${getLandingUnavailableMessage(planetData)}`;
    document.getElementById('info-target-desc').textContent = detailMessage;
    document.getElementById('info-diameter').textContent = planetData.diameter;
    document.getElementById('info-temp').textContent = planetData.temp;
    document.getElementById('info-gravity').textContent = planetData.gravity;
    document.getElementById('info-distance').textContent = planetData.distance;

    const landBtn = document.getElementById('land-planet-btn');
    if (landBtn) {
      landBtn.style.display = 'block';
      landBtn.disabled = !landingEnvironment && !probeAvailable && !observationAvailable;
      landBtn.textContent = landingEnvironment
        ? `LAND ON ${planetData.name.toUpperCase()} [L]`
        : probeAvailable ? `DEPLOY ${planetData.name.toUpperCase()} ATMOSPHERIC PROBE [L]`
          : observationAvailable ? `OBSERVE ${planetData.name.toUpperCase()} [L]`
            : `${planetData.name.toUpperCase()} LANDING UNAVAILABLE`;
      landBtn.title = landingEnvironment || probeAvailable || observationAvailable ? '' : getLandingUnavailableMessage(planetData);
    }

    const quickLandBtn = document.getElementById('quick-land-btn');
    if (quickLandBtn) {
      quickLandBtn.disabled = !landingEnvironment && !probeAvailable && !observationAvailable;
      quickLandBtn.textContent = landingEnvironment
        ? `🛬 LAND ON ${planetData.name.toUpperCase()} [L]`
        : probeAvailable ? `PROBE ${planetData.name.toUpperCase()} ATMOSPHERE [L]`
          : observationAvailable ? `OBSERVE ${planetData.name.toUpperCase()} [L]`
            : `${planetData.name.toUpperCase()} LANDING UNAVAILABLE`;
      quickLandBtn.title = landingEnvironment || probeAvailable || observationAvailable ? '' : getLandingUnavailableMessage(planetData);
    }

    const targetLabel = document.getElementById('space-target');
    if (targetLabel) targetLabel.textContent = planetData.name.toUpperCase();
  }

  startTransferTo(planetData) {
    const targetObj = this.bodies.find(b => b.data.name === planetData.name);
    if (!targetObj) return;

    const targetWorldPos = new THREE.Vector3();
    targetObj.bodyMesh.getWorldPosition(targetWorldPos);

    this.flightState = 'TRANSFER_TRAJECTORY';
    this.transferT = 0;
    this.transferStartPos.copy(this.rocketPos);
    this.transferEndPos.copy(targetWorldPos).add(new THREE.Vector3(targetObj.data.r * 1.8, 2.0, targetObj.data.r * 1.8));
    this.transferDeparturePos = this.rocketPos.clone();

    this._drawTransferTrajectory(this.transferStartPos, this.transferEndPos);

    audio.playPowerUpChime?.();
  }

  _drawTransferTrajectory(start, end) {
    if (this.transferLine) {
      this.scene.remove(this.transferLine);
      this.transferLine.geometry.dispose();
      this.transferLine.material.dispose();
    }
    const points = [start.clone(), end.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35
    });
    this.transferLine = new THREE.Line(geo, mat);
    this.transferLine.frustumCulled = false;
    this.scene.add(this.transferLine);
  }

  _hideTransferTrajectory() {
    if (this.transferLine) {
      this.scene.remove(this.transferLine);
      this.transferLine = null;
    }
  }

  toggleCameraMode() {
    if (this.cameraMode === 'COCKPIT') {
      this.cameraMode = 'CHASE';
      this._resetCockpitLook();
      if (this.externalCraftMesh) this.externalCraftMesh.visible = true;
      this.controls.enabled = false;
      this.cameraChasePos.copy(this.rocketPos);
      this.cameraChaseVel.set(0, 0, 0);
    } else if (this.cameraMode === 'CHASE') {
      this.cameraMode = 'ORBIT';
      this._resetCockpitLook();
      this.controls.enabled = this.areControlsEnabled;
      this.controls.target.copy(this.rocketPos);
    } else {
      this.cameraMode = 'COCKPIT';
      this._resetCockpitLook();
      this.controls.enabled = false;
    }

    const label = document.getElementById('space-cam');
    if (label) label.textContent = `${this.cameraMode} [V]`;
  }

  setControlsEnabled(enabled) {
    this.areControlsEnabled = Boolean(enabled);
    this.controls.enabled = this.areControlsEnabled && this.cameraMode === 'ORBIT';
  }

  initiateDeorbitDescent() {
    if (!this.isActive || this.isDeorbiting) return false;
    const destination = resolvePlanetEnvironment(this.selectedBody || this.selectedPlanetId);
    if (!destination) {
      this.onLandingUnavailable?.(getLandingUnavailableMessage(this.selectedBody || this.selectedPlanetId));
      return false;
    }

    this.pendingLandingDestination = destination;
    this.isDeorbiting = true;
    this.flightState = 'DEORBIT_BURN';
    this.deorbitTimer = 0;

    const banner = document.getElementById('deorbit-banner');
    if (banner) banner.style.display = 'block';
    const landingText = document.getElementById('deorbit-target-text');
    if (landingText) landingText.textContent = `ENTERING ${destination.planetName.toUpperCase()} ATMOSPHERE • TARGET: ${destination.worldId.toUpperCase()}`;

    audio.playAlarm?.();
    audio.playThrusterFire?.();
    return true;
  }

  initiateSelectedDestinationAction() {
    if (this.selectedBody?.observationOnly || this.selectedPlanetId === 'sun') {
      return this.startSolarObservation();
    }
    if (this.selectedBody?.solidSurface === false && this.selectedBody.probeProfile) {
      return this.startAtmosphericProbe();
    }
    return this.initiateDeorbitDescent();
  }

  startSolarObservation() {
    if (!this.isActive || (this.observationMission && !this.observationMission.completed) || (this.selectedPlanetId || '').toLowerCase() !== 'sun') return false;
    this.probeMission = null;
    this.observationMission = {
      planetId: this.selectedPlanetId,
      planetName: this.selectedBody?.name || 'Sun',
      elapsed: 0,
      completed: false
    };
    const banner = document.getElementById('probe-mission-banner');
    const status = document.getElementById('probe-mission-status');
    const report = document.getElementById('probe-mission-report');
    if (banner) banner.style.display = 'block';
    if (status) status.textContent = 'SUN SOLAR OBSERVATION ACTIVE';
    if (report) report.textContent = 'Tracking flare activity and solar irradiance from a safe-distance orbit.';
    audio.playPowerUpChime?.();
    return true;
  }

  startAtmosphericProbe() {
    if (!this.isActive || (this.probeMission && !this.probeMission.completed) || this.selectedBody?.solidSurface !== false || !this.selectedBody.probeProfile) return false;
    this.probeMission = {
      planetId: this.selectedPlanetId,
      planetName: this.selectedBody.name,
      profile: this.selectedBody.probeProfile,
      elapsed: 0,
      nextSample: 0,
      samples: [],
      completed: false
    };
    this.probeDeployed = true;
    if (this.probeMesh) {
      this.probeMesh.visible = true;
      this.probeMesh.position.copy(this.rocketPos);
      this.probeMesh.rotation.copy(this.spaceRocketGroup?.rotation);
    }
    this.probeDescentAlt = 0;
    this.probeDescentSpeed = 0;
    if (!this.probeDescentStartPos) this.probeDescentStartPos = new THREE.Vector3();
    if (this.rocketPos) this.probeDescentStartPos.copy(this.rocketPos);
    // Target: descend toward planet cloud tops (simulate entry interface)
    const targetObj = this.bodies?.find(b => b.data.id === this.selectedPlanetId);
    if (targetObj) {
      const center = new THREE.Vector3();
      targetObj.bodyMesh.getWorldPosition(center);
      if (!this.probeDescentTargetPos) this.probeDescentTargetPos = new THREE.Vector3();
      this.probeDescentTargetPos.copy(center).add(new THREE.Vector3(0, targetObj.data.r * 0.85, 0));
    } else {
      if (!this.probeDescentTargetPos) this.probeDescentTargetPos = new THREE.Vector3();
      if (this.rocketPos) this.probeDescentTargetPos.copy(this.rocketPos).add(new THREE.Vector3(0, -this.selectedBody.r * 0.85, 0));
    }
    const banner = document.getElementById('probe-mission-banner');
    const status = document.getElementById('probe-mission-status');
    const report = document.getElementById('probe-mission-report');
    if (banner) banner.style.display = 'block';
    if (status) status.textContent = `${this.selectedBody.name.toUpperCase()} ATMOSPHERIC PROBE DEPLOYED`;
    if (report) report.textContent = 'Probe separating from spacecraft and descending through cloud layers.';
    audio.playThrusterFire?.();
    return true;
  }

  _updateSolarObservation(delta) {
    const mission = this.observationMission;
    if (!mission || mission.completed) return;
    mission.elapsed += delta;
    const report = document.getElementById('probe-mission-report');
    const status = document.getElementById('probe-mission-status');

    if (mission.elapsed < 4.5) {
      if (report) report.textContent = `Monitoring solar flux | ${Math.round((mission.elapsed / 4.5) * 100)}% complete`;
      return;
    }

    mission.completed = true;
    if (status) status.textContent = 'SUN OBSERVATION DATA TRANSMITTED';
    if (report) report.textContent = 'Solar flare and irradiance log complete. No landing attempted; continuing safe-distance observation.';
  }

  _updateAtmosphericProbe(delta) {
    const mission = this.probeMission;
    if (!mission || mission.completed) return;
    mission.elapsed += delta;

    // Animate probe descent from spacecraft to cloud tops
    if (this.probeDeployed && this.probeMesh) {
      const t = Math.min(1.0, mission.elapsed / 6.0);
      const smoothT = t * t * (3.0 - 2.0 * t);
      this.probeMesh.position.lerpVectors(this.probeDescentStartPos, this.probeDescentTargetPos, smoothT);
      this.probeMesh.lookAt(this.probeDescentTargetPos);

      // Deploy parachute during final descent
      if (t > 0.55 && this.probeChute) this.probeChute.visible = true;
      if (t > 0.55 && this.probeLight) this.probeLight.intensity = 3.0;
      if (t <= 0.55 && this.probeLight) this.probeLight.intensity = 0.5;

      // Rotate probe body for visual effect
      const probeBody = this.probeMesh.children[0];
      if (probeBody) {
        probeBody.rotation.z += delta * 0.5;
      }
    }

    if (mission.elapsed >= mission.nextSample) {
      const progress = Math.min(1, mission.elapsed / 6);
      const sample = {
        elapsedSeconds: Math.min(6, Math.round(mission.elapsed * 10) / 10),
        pressureKPa: Math.round(mission.profile.cloudTopPressureKPa * (1 + progress * 24)),
        temperatureK: Math.round(mission.profile.cloudTopTemperatureK + progress * mission.profile.warmingK)
      };
      mission.samples.push(sample);
      mission.nextSample += 1.5;
      const report = document.getElementById('probe-mission-report');
      if (report) report.textContent = `Pressure ${sample.pressureKPa} kPa | Temperature ${sample.temperatureK} K | ${mission.samples.length} readings`;
    }

    if (mission.elapsed < 6) return;
    mission.completed = true;
    this.probeDeployed = false;
    if (this.probeMesh) this.probeMesh.visible = false;
    if (this.probeChute) this.probeChute.visible = false;
    if (this.probeLight) this.probeLight.intensity = 0;
    const status = document.getElementById('probe-mission-status');
    const report = document.getElementById('probe-mission-report');
    if (status) status.textContent = `${mission.planetName.toUpperCase()} PROBE DATA TRANSMITTED`;
    if (report) report.textContent = `${mission.samples.length} atmospheric readings logged. Probe crushed below the cloud layer; no surface landing attempted.`;
    this.onProbeComplete?.({ planetId: mission.planetId, samples: mission.samples });
  }

  _completePlanetLanding() {
    const destination = this.pendingLandingDestination;
    if (!destination) return false;

    // Touchdown sequence: touchdown burn, touchdown confirmed, then hand off to surface rocket
    this.isDeorbiting = false;
    this.flightState = 'TOUCHDOWN';
    this.deorbitTimer = 0;
    if (this.spacePlumeMesh) this.spacePlumeMesh.visible = true;
    this.reentryShake = 0.06;

    const touchdownBanner = document.getElementById('deorbit-banner');
    if (touchdownBanner) {
      touchdownBanner.style.display = 'block';
      touchdownBanner.style.background = 'rgba(16, 185, 129, 0.92)';
      touchdownBanner.style.borderColor = '#34d399';
      const targetText = document.getElementById('deorbit-target-text');
      if (targetText) targetText.textContent = `🛬 TOUCHDOWN CONFIRMED • ${destination.planetName.toUpperCase()} SURFACE`;
    }

    audio.playAirRelease?.();
    audio.playThrusterFire?.();

    // Handoff to surface rocket landing
    this.exitSpaceflight();
    this.pendingLandingDestination = null;
    this.onLandOnPlanet?.(destination.planetId);
    return true;
  }

  enterSpaceflight(originPlanetName = 'Mars') {
    const originPlanetId = getPlanetId(originPlanetName);
    const origin = this.bodies.find(body => getPlanetId(body.data) === originPlanetId);
    if (!origin) {
      this.isActive = false;
      return false;
    }

    this.isActive = true;
    this.isDeorbiting = false;
    this.pendingLandingDestination = null;
    this.cameraMode = 'COCKPIT';
    this._resetCockpitLook();
    if (this.hudContainer) this.hudContainer.style.display = 'block';

    this.selectTarget(origin.data);
    const v = new THREE.Vector3();
    origin.bodyMesh.getWorldPosition(v);
    this.rocketPos.set(v.x + 14.0, v.y + 2.5, v.z + 14.0);
    this.spaceRocketGroup.position.copy(this.rocketPos);
    this.spaceRocketGroup.rotation.set(0, 0, 0);
    this.cameraChasePos.copy(this.rocketPos);
    this.cameraChaseVel.set(0, 0, 0);

    audio.playWarpJump?.();
    return true;
  }

  exitSpaceflight() {
    this.isActive = false;
    this.isDeorbiting = false;
    this.pendingLandingDestination = null;
    this.probeMission = null;
    this.observationMission = null;
    this._hideTransferTrajectory();
    if (this.probeMesh) this.probeMesh.visible = false;
    if (this.probeChute) this.probeChute.visible = false;
    if (this.probeLight) this.probeLight.intensity = 0;
    if (this.hudContainer) this.hudContainer.style.display = 'none';
    const banner = document.getElementById('deorbit-banner');
    if (banner) banner.style.display = 'none';
    const probeBanner = document.getElementById('probe-mission-banner');
    if (probeBanner) probeBanner.style.display = 'none';
  }

  update(delta, now) {
    if (!this.isActive) return;
    this._updateAtmosphericProbe(delta);
    this._updateSolarObservation(delta);

    if (this.spacePlumeMat) {
      this.spacePlumeMat.uniforms.uTime.value = now * 0.001;
    }
    if (this.plasmaMat) {
      this.plasmaMat.uniforms.uTime.value = now * 0.001;
      this.plasmaMat.uniforms.uIntensity.value = this.isDeorbiting ? Math.min(1.0, this.deorbitTimer * 0.35) : 0.0;
    }

    // Spin planets around axis
    this.bodies.forEach(b => {
      b.bodyMesh.rotation.y += b.data.spin * delta * 0.4;
      b.pivot.rotation.y += (1.0 / b.data.orbit) * delta * 2.5;
    });

    // Handle de-orbit descent
    if (this.isDeorbiting) {
      this.deorbitTimer += delta;
      this.reentryShake = Math.min(0.12, this.deorbitTimer * 0.035);
      this.rocketSpeed = Math.max(3.0, 18.0 - this.deorbitTimer * 4.0);

      // Descend toward target planet surface if available
      const destination = this.pendingLandingDestination;
      let landed = false;
      if (destination) {
        const targetObj = this.bodies.find(b => getPlanetId(b.data) === destination.planetId);
        if (targetObj) {
          const center = new THREE.Vector3();
          targetObj.bodyMesh.getWorldPosition(center);
          const surfaceAlt = targetObj.data.r * 1.15;
          const descentDir = new THREE.Vector3().subVectors(center, this.rocketPos).normalize();
          const descentRate = Math.min(12.0, this.deorbitTimer * 2.5);
          this.rocketPos.addScaledVector(descentDir, descentRate * delta);
          this.spaceRocketGroup.position.copy(this.rocketPos);
          this.spaceRocketGroup.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 0, -1),
            descentDir
          );
          const distToSurface = this.rocketPos.distanceTo(center) - targetObj.data.r;
          if (distToSurface <= surfaceAlt + 2.0) {
            landed = true;
          }
        }
      }

      this.steerPitch = -0.35;
      if (this.spaceRocketGroup?.rotation) this.spaceRocketGroup.rotation.x = this.steerPitch;

      if (landed || this.deorbitTimer >= 3.8) {
        this._completePlanetLanding();
        return;
      }
    }

    // Spacecraft movement logic
    if (this.flightState === 'FREE_FLIGHT') {
      let thrust = 0;
      if (input.isKeyDown('KeyW')) thrust += 1.0;
      if (input.isKeyDown('KeyS')) thrust -= 0.6;
      if (input.isKeyDown('KeyA')) this.steerYaw += delta * 1.2;
      if (input.isKeyDown('KeyD')) this.steerYaw -= delta * 1.2;
      if (input.isKeyDown('KeyQ')) this.steerRoll -= delta * 1.5;
      if (input.isKeyDown('KeyE')) this.steerRoll += delta * 1.5;

      this.rocketForward.set(
        Math.sin(this.steerYaw) * Math.cos(this.steerPitch),
        -Math.sin(this.steerPitch),
        -Math.cos(this.steerYaw) * Math.cos(this.steerPitch)
      ).normalize();

      this.spaceRocketGroup.rotation.set(this.steerPitch, this.steerYaw, this.steerRoll);

      this.rocketVel.copy(this.rocketForward).multiplyScalar(this.rocketSpeed * (0.3 + thrust * 0.7));
      this.rocketPos.addScaledVector(this.rocketVel, delta);
      this.spaceRocketGroup.position.copy(this.rocketPos);

      this.spacePlumeMesh.visible = (thrust > 0.05);
    } else if (this.flightState === 'TRANSFER_TRAJECTORY') {
      this.transferT += delta / this.transferDuration;
      const t = Math.min(1.0, this.transferT);
      const smoothT = t * t * (3.0 - 2.0 * t);

      if (t < 0.33) this.transferPhase = 'DEPARTURE_BURN';
      else if (t < 0.66) this.transferPhase = 'TRANSFER_CRUISE';
      else this.transferPhase = 'INSERTION_BURN';

      this.rocketPos.lerpVectors(this.transferStartPos, this.transferEndPos, smoothT);
      this.spaceRocketGroup.position.copy(this.rocketPos);
      this.spacePlumeMesh.visible = t < 0.33 || t > 0.66;

      const dir = new THREE.Vector3().subVectors(this.transferEndPos, this.transferStartPos).normalize();
      if (dir.lengthSq() > 0.01) {
        this.spaceRocketGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
      }

      if (t >= 1.0) {
        this.flightState = 'ORBIT_HOLD';
        this.spacePlumeMesh.visible = false;
        this._hideTransferTrajectory();
        audio.playAirRelease?.();
      }
    } else if (this.flightState === 'ORBIT_HOLD') {
      const targetObj = this.bodies.find(b => getPlanetId(b.data) === this.selectedPlanetId);
      if (targetObj) {
        const center = new THREE.Vector3();
        targetObj.bodyMesh.getWorldPosition(center);
        const orbitR = targetObj.data.r * 2.2;
        const angle = now * 0.0006;
        this.rocketPos.set(
          center.x + Math.cos(angle) * orbitR,
          center.y + Math.sin(angle * 0.5) * 2.0,
          center.z + Math.sin(angle) * orbitR
        );
        this.spaceRocketGroup.position.copy(this.rocketPos);

        const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle));
        this.spaceRocketGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
      }
    }

    // Camera positioning based on mode
    if (this.cameraMode === 'COCKPIT') {
      const mouseLook = input.consumeMouseDelta();
      if (this.areControlsEnabled && document.pointerLockElement) {
        this.cockpitLookYaw -= mouseLook.x * 0.0022;
        this.cockpitLookPitch -= mouseLook.y * 0.0022;
        this.cockpitLookYaw = THREE.MathUtils.clamp(this.cockpitLookYaw, -1.1, 1.1);
        this.cockpitLookPitch = THREE.MathUtils.clamp(this.cockpitLookPitch, -0.65, 0.65);
      }

      // Place camera inside cockpit looking forward + cockpit mouse head look
      const headOffset = new THREE.Vector3(0, 0.42, 0.15);
      headOffset.applyQuaternion(this.spaceRocketGroup.quaternion);

      this.camera.position.copy(this.rocketPos).add(headOffset);

      if (this.reentryShake > 0.001) {
        this.camera.position.x += (Math.random() - 0.5) * this.reentryShake;
        this.camera.position.y += (Math.random() - 0.5) * this.reentryShake;
        this.camera.position.z += (Math.random() - 0.5) * this.reentryShake;
      }

      // Compute forward look direction combining ship orientation and head look
      const lookEuler = new THREE.Euler(this.steerPitch + this.cockpitLookPitch, this.steerYaw + this.cockpitLookYaw, this.steerRoll, 'YXZ');
      const lookQuat = new THREE.Quaternion().setFromEuler(lookEuler);
      this.camera.quaternion.copy(lookQuat);

      if (this.externalCraftMesh) this.externalCraftMesh.visible = false;
    } else if (this.cameraMode === 'CHASE') {
      if (this.externalCraftMesh) this.externalCraftMesh.visible = true;
      const followOffset = this.rocketForward.clone().multiplyScalar(-22.0).add(new THREE.Vector3(0, 7.0, 0));
      const camTarget = this.rocketPos.clone().add(followOffset);
      // Spring-damper chase camera for smooth tracking
      const springK = 6.0;
      const damping = 2.2;
      const diff = new THREE.Vector3().subVectors(camTarget, this.cameraChasePos);
      const accel = diff.multiplyScalar(springK).sub(this.cameraChaseVel.multiplyScalar(damping));
      this.cameraChaseVel.addScaledVector(accel, delta);
      this.cameraChasePos.addScaledVector(this.cameraChaseVel, delta);
      this.camera.position.copy(this.cameraChasePos);
      this.camera.lookAt(this.rocketPos);
    } else {
      if (this.externalCraftMesh) this.externalCraftMesh.visible = true;
      this.controls.target.copy(this.rocketPos);
      this.controls.update();
    }

    // Update canvas MFD displays at ~12 Hz to eliminate per-frame synchronous CanvasTexture GPU stalls
    this._mfdTimer = (this._mfdTimer === undefined) ? 1.0 : (this._mfdTimer + delta);
    if (this._mfdTimer >= 0.083) {
      this._mfdTimer = 0;
      this._drawCockpitDisplays(delta, now);

      const spdEl = document.getElementById('space-speed');
      if (spdEl) {
        spdEl.textContent = `${Math.round(this.rocketSpeed + Math.sin(now * 0.002) * 1.5)} km/s`;
      }

      const probeEl = document.getElementById('space-probe');
      if (probeEl) {
        if (this.probeMission && !this.probeMission.completed) {
          const progress = Math.round((this.probeMission.elapsed / 6) * 100);
          probeEl.textContent = `PROBE: DESCENDING ${progress}%`;
          probeEl.style.color = '#8ce2d2';
        } else if (this.probeMission && this.probeMission.completed) {
          probeEl.textContent = `PROBE: DATA TRANSMITTED`;
          probeEl.style.color = '#10b981';
        } else {
          probeEl.textContent = 'PROBE: --';
          probeEl.style.color = '#64748b';
        }
      }
    }
  }

  render() {
    if (this.isActive) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
