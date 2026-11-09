import * as THREE from 'three';
import { MARS_SOL_CONFIG } from '../core/Constants.js';
import { getPlanetWorldConfig } from './PlanetEnvironment.js';

/**
 * Dynamic Martian Atmosphere & Day/Night System
 * Calibrated to true Mars solar day (24h 39m 35s), forward-scattering blue sunset,
 * low-gravity atmospheric dust storms, and temperature gradients.
 */
export class MarsSky {
  constructor(scene) {
    this.scene = scene;
    this.solCount = 1;
    this.timeOfDay = 0.28; // 0.28 = mid-morning, 0.5 = solar noon, 0.72 = blue sunset, 0.85 = night
    this.dayDurationSeconds = MARS_SOL_CONFIG.gameplaySolSeconds; // 720 seconds per Sol
    this.sunDistance = 450;

    // Atmospheric palette calibrated to Perseverance true-color telemetry
    this.daySkyColor = new THREE.Color(0xc49b78);       // Warm dusty ochre daytime
    this.nightSkyColor = new THREE.Color(0x050409);     // Deep cosmic black
    this.dayFogColor = new THREE.Color(0xb89578);       // Soft atmospheric dust haze
    this.nightFogColor = new THREE.Color(0x06050e);     // Deep night fog
    this.sunColorDay = new THREE.Color(0xfff7ea);       // Natural daylight
    this.sunColorSunset = new THREE.Color(0x4a88cc);    // Scientific Martian blue twilight (Rayleigh/Mie scatter)

    // Dynamic environmental state
    this.isStormActive = false;
    this.stormTimer = 220; // Time until next storm
    this.stormDuration = 0;
    this.currentTemp = -18; // Celsius

    this._initSkyDome();
    this._initLighting();
    this._initStarsAndMoons();
    this._initDustParticles();
    this.setPlanet(getPlanetWorldConfig('mars'));
  }

  setPlanet(config) {
    if (!config) return false;
    this.planetId = config.planetId;
    this.planetConfig = config;
    this.dayDurationSeconds = config.sky.dayDurationSeconds || MARS_SOL_CONFIG.gameplaySolSeconds;
    this.daySkyColor.set(config.sky.day);
    this.nightSkyColor.set(config.sky.night);
    this.dayFogColor.set(config.sky.horizon);
    this.nightFogColor.set(config.sky.night);
    this.sunColorDay.set(config.lighting.sun || '#fff7ea');
    this.sunColorSunset.set(config.lighting.sunset);
    this.ambientLight.color.set(config.lighting.ambient);
    this.ambientLight.intensity = config.lighting.ambientIntensity ?? 0.65;
    this.hemiLight.color.set(config.lighting.hemisphere);
    this.hemiLight.intensity = config.lighting.hemisphereIntensity ?? 0.82;
    this.scene.fog = new THREE.FogExp2(this.dayFogColor, config.atmosphere.fogDensity);
    this.skyMesh.material.uniforms.topColor.value.copy(this.daySkyColor);
    this.skyMesh.material.uniforms.bottomColor.value.copy(this.dayFogColor);
    this.sunLight.color.copy(this.sunColorDay);
    this.sunMesh.material.color.copy(this.sunColorDay);
    this.hasDust = Boolean(config.sky.dust);
    this.isStormActive = false;
    this.stormTimer = this.hasDust ? 220 : Number.POSITIVE_INFINITY;
    this.dustParticles.visible = this.hasDust;
    this.phobos.visible = config.planetId === 'mars';
    this.deimos.visible = config.planetId === 'mars';
    this.earthInMoonSky.visible = config.planetId === 'moon';
    this.sunIntensity = config.sky.sunIntensity;
    this.atmosphereFogDensity = config.atmosphere.fogDensity;
    this.dayTemperature = config.temperatureC.day;
    this.nightTemperature = config.temperatureC.night;
    this.currentTemp = this.dayTemperature;
    return true;
  }

  _initSkyDome() {
    const skyGeo = new THREE.SphereGeometry(650, 32, 16);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0xc49b78) },
        bottomColor: { value: new THREE.Color(0xb89578) },
        sunPosition: { value: new THREE.Vector3(0, 100, 0) },
        blueSunsetFactor: { value: 0.0 },
        offset: { value: 30 },
        exponent: { value: 0.65 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 sunPosition;
        uniform float blueSunsetFactor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(vWorldPosition);
          vec3 sunDir = normalize(sunPosition);
          float cosTheta = dot(viewDir, sunDir);

          float h = normalize(vWorldPosition + offset).y;
          vec3 skyGrad = mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0));

          // Forward-scatter blue twilight halo around the Sun (Curiosity / Perseverance effect)
          if (blueSunsetFactor > 0.01) {
            float sunHalo = pow(max(cosTheta, 0.0), 12.0) * blueSunsetFactor * 1.4;
            vec3 blueHaloCol = vec3(0.28, 0.52, 0.85);
            skyGrad = mix(skyGrad, blueHaloCol, clamp(sunHalo, 0.0, 0.85));
          }

          gl_FragColor = vec4(skyGrad, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Distance Fog (soft atmospheric perspective without excessive saturation)
    this.scene.fog = new THREE.FogExp2(this.dayFogColor, 0.0032);
  }

  _initLighting() {
    this.ambientLight = new THREE.AmbientLight(0x7d6352, 0.65);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xd8b598, 0x5c3e2e, 0.82);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(this.sunColorDay, 2.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 110;
    const d = 40;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    const sunGeo = new THREE.SphereGeometry(14, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffcf5 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);
  }

  _initStarsAndMoons() {
    const starCount = 1600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 580;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 15;
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      transparent: true,
      opacity: 0.0
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.stars);

    // Phobos (Fast orbit, rises in west, sets in east)
    const phobosGeo = new THREE.SphereGeometry(3.6, 12, 12);
    const phobosMat = new THREE.MeshStandardMaterial({ color: 0x8a8178, roughness: 0.9 });
    this.phobos = new THREE.Mesh(phobosGeo, phobosMat);
    this.scene.add(this.phobos);

    // Deimos (Small distant moon)
    const deimosGeo = new THREE.SphereGeometry(2.2, 8, 8);
    const deimosMat = new THREE.MeshStandardMaterial({ color: 0x9e988f, roughness: 0.95 });
    this.deimos = new THREE.Mesh(deimosGeo, deimosMat);
    this.scene.add(this.deimos);

    const earthGeo = new THREE.SphereGeometry(5.2, 24, 16);
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x397bb0, roughness: 0.88, metalness: 0.02 });
    this.earthInMoonSky = new THREE.Mesh(earthGeo, earthMat);
    this.earthInMoonSky.visible = false;
    this.scene.add(this.earthInMoonSky);
  }

  _initDustParticles() {
    const particleCount = 400;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    this.dustVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 18 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      this.dustVelocities.push({
        x: (Math.random() * 1.8 + 0.8) * 1.5,
        y: (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 1.0
      });
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    // Circular soft radial glow sprite texture (no unnatural square quads!)
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(215, 165, 125, 0.7)');
    grad.addColorStop(0.4, 'rgba(195, 135, 95, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const dustTex = new THREE.CanvasTexture(canvas);

    this.dustMat = new THREE.PointsMaterial({
      map: dustTex,
      color: 0xd4a582,
      size: 0.28,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.dustParticles = new THREE.Points(geo, this.dustMat);
    this.scene.add(this.dustParticles);
  }

  update(delta, playerPos) {
    const prevTime = this.timeOfDay;
    this.timeOfDay = (this.timeOfDay + delta / this.dayDurationSeconds) % 1.0;
    if (this.timeOfDay < prevTime) {
      this.solCount++;
    }

    // Solar angle: 0 = midnight, 0.25 = sunrise (06:00), 0.5 = noon (12:00), 0.75 = sunset (18:00)
    const sunAngle = this.timeOfDay * Math.PI * 2 - Math.PI / 2;
    const sunY = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle) * 0.85;
    const sunZ = Math.sin(sunAngle * 0.5) * 0.4;

    const sunDir = new THREE.Vector3(sunX, sunY, sunZ).normalize();
    const sunPos = sunDir.clone().multiplyScalar(this.sunDistance).add(playerPos);

    this.sunLight.position.copy(sunPos);
    this.sunLight.target.position.copy(playerPos);
    this.sunLight.target.updateMatrixWorld();
    this.sunMesh.position.copy(sunPos);

    this.skyMesh.position.copy(playerPos);
    this.skyMesh.material.uniforms.sunPosition.value.copy(sunPos);
    this.stars.position.copy(playerPos);

    // Day factor (0 = full night, 1 = midday)
    const dayFactor = THREE.MathUtils.clamp((sunY + 0.12) / 0.42, 0, 1);

    // Blue sunset detection (Sun near horizon with forward-scattering dust halo)
    const isSunset = (sunY > -0.18 && sunY < 0.26);
    const blueSunsetIntensity = isSunset ? (1.0 - Math.abs(sunY - 0.05) / 0.22) : 0.0;
    this.skyMesh.material.uniforms.blueSunsetFactor.value = THREE.MathUtils.clamp(blueSunsetIntensity, 0, 1);

    // Dust storm simulation
    if (this.hasDust) this.stormTimer -= delta;
    if (this.hasDust && this.stormTimer <= 0 && !this.isStormActive) {
      this.isStormActive = true;
      this.stormDuration = 65; // 65 seconds dust storm
    }
    if (this.isStormActive) {
      this.stormDuration -= delta;
      if (this.stormDuration <= 0) {
        this.isStormActive = false;
        this.stormTimer = 280 + Math.random() * 120; // 5-7 minutes until next storm
      }
    }

    // Colors
    const currentSky = new THREE.Color().lerpColors(this.nightSkyColor, this.daySkyColor, dayFactor);
    const currentFog = new THREE.Color().lerpColors(this.nightFogColor, this.dayFogColor, dayFactor);
    if (isSunset && this.atmosphereFogDensity > 0) {
      currentFog.lerp(this.sunColorSunset, blueSunsetIntensity * 0.45);
    }
    if (this.isStormActive) {
      currentFog.lerp(new THREE.Color(0xd18656), 0.5);
    }
    this.scene.fog.density = this.atmosphereFogDensity * (this.isStormActive ? 2.7 : 1.0);

    this.skyMesh.material.uniforms.topColor.value.copy(currentSky);
    this.skyMesh.material.uniforms.bottomColor.value.copy(currentFog);
    this.scene.fog.color.copy(currentFog);

    // Sunlight intensity (drops during dust storm)
    const stormMultiplier = this.isStormActive ? 0.35 : 1.0;
    this.sunLight.intensity = dayFactor * this.sunIntensity * stormMultiplier;
    this.ambientLight.intensity = THREE.MathUtils.lerp(0.22, 0.75, dayFactor) * (this.isStormActive ? 0.6 : 1.0);
    this.hemiLight.intensity = THREE.MathUtils.lerp(0.28, 0.95, dayFactor) * (this.isStormActive ? 0.65 : 1.0);

    this.starMat.opacity = this.atmosphereFogDensity === 0 ? 0.95 : (1 - dayFactor) * 0.95;

    // Surface temperature follows the active world's day/night thermal range.
    if (this.isStormActive) {
      this.currentTemp = -45;
    } else {
      this.currentTemp = Math.round(THREE.MathUtils.lerp(this.nightTemperature, this.dayTemperature, dayFactor));
    }

    // Mars's small moons are shown only from its surface.
    const phobosAngle = this.timeOfDay * Math.PI * 5;
    this.phobos.position.set(
      playerPos.x + Math.cos(phobosAngle) * 400,
      playerPos.y + 170 + Math.sin(phobosAngle) * 80,
      playerPos.z + Math.sin(phobosAngle) * 400
    );
    const deimosAngle = this.timeOfDay * Math.PI * 1.8;
    this.deimos.position.set(
      playerPos.x + Math.sin(deimosAngle) * 460,
      playerPos.y + 240,
      playerPos.z + Math.cos(deimosAngle) * 460
    );
    this.earthInMoonSky.position.set(playerPos.x - 330, playerPos.y + 230, playerPos.z - 360);

    if (!this.hasDust) return;

    // Dust particles
    this.dustParticles.position.x = playerPos.x;
    this.dustParticles.position.z = playerPos.z;
    const positions = this.dustParticles.geometry.attributes.position.array;
    const windSpeedMult = this.isStormActive ? 3.2 : 1.0;

    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += this.dustVelocities[i].x * delta * windSpeedMult;
      positions[i * 3 + 1] += this.dustVelocities[i].y * delta;
      positions[i * 3 + 2] += this.dustVelocities[i].z * delta * windSpeedMult;

      if (positions[i * 3] > 45) positions[i * 3] -= 90;
      if (positions[i * 3] < -45) positions[i * 3] += 90;
      if (positions[i * 3 + 1] > 22) positions[i * 3] = 0.5;
      if (positions[i * 3 + 1] < 0.2) positions[i * 3 + 1] = 20;
      if (positions[i * 3 + 2] > 45) positions[i * 3 + 2] -= 90;
      if (positions[i * 3 + 2] < -45) positions[i * 3 + 2] += 90;
    }
    this.dustParticles.geometry.attributes.position.needsUpdate = true;
  }

  getSolarFactor() {
    const raw = THREE.MathUtils.clamp((Math.sin(this.timeOfDay * Math.PI * 2 - Math.PI / 2) + 0.12) / 0.42, 0, 1);
    return this.isStormActive ? raw * 0.35 : raw;
  }

  getHourString() {
    const totalMinutes = Math.floor(this.timeOfDay * 24.659 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const stormTag = this.isStormActive ? ' [DUST STORM]' : '';
    return `SOL ${this.solCount} // ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} SOL-TIME${stormTag}`;
  }
}
