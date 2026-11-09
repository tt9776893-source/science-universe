/**
 * SCIENCE UNIVERSE — GENESIS ENGINE MODULE
 * Module: GenesisEngineModule.js
 * 
 * Planetary Habitability & Climate Transformation Engine:
 * - Multi-parameter astrophysical climate simulation (Insolation, Greenhouse optical depth, Albedo).
 * - Thermodynamic Water Phase Stability (Phase diagram boundary evaluation).
 * - Earth Similarity Index (ESI) calculation.
 * - Dynamic 3D procedural texture adaptation (ice glaciation, liquid ocean formation, biosphere greening).
 * - Strict Astrobiological Caution: Distinguishes habitability constraints from speculative origin of life.
 * - Full compliance with Freebuff Module Lifecycle contract.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      './ScienceModuleAdapter',
      './PlanetData',
      './physics/HabitabilityCalculators',
      './physics/OrbitalAtmosphericPhysics',
      './rendering/PlanetRenderer',
      './rendering/PlanetMaterials'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./ScienceModuleAdapter'),
      require('./PlanetData'),
      require('./physics/HabitabilityCalculators'),
      require('./physics/OrbitalAtmosphericPhysics'),
      require('./rendering/PlanetRenderer'),
      require('./rendering/PlanetMaterials')
    );
  } else {
    root.GenesisEngineModule = factory(
      root.ScienceModuleAdapter,
      root.PlanetData,
      root.HabitabilityCalculators,
      root.OrbitalAtmosphericPhysics,
      root.PlanetRenderer,
      root.PlanetMaterials
    );
  }
}(typeof self !== 'undefined' ? self : this, function (
  ScienceModuleAdapter,
  PlanetData,
  HabitabilityCalculators,
  OrbitalAtmosphericPhysics,
  PlanetRenderer,
  PlanetMaterials
) {
  'use strict';

  class GenesisEngineModule extends ScienceModuleAdapter {
    constructor() {
      super('genesis_engine');

      this.currentPlanetKey = 'mars';
      // Environmental parameters
      this.distanceAU = 1.524;
      this.surfacePressureBar = 0.006;
      this.co2Fraction = 0.95;
      this.albedoBond = 0.25;
      this.ecosystemStage = 0; // 0: Sterile, 1: Extremophiles, 2: Cyanobacteria, 3: Lichen/Flora, 4: Complex Biosphere

      this.renderer = null;
      this.planetMesh = null;
      this.cloudMesh = null;
      this.uiRoot = null;

      // Dynamic canvas for real-time procedural terraforming texture
      this.dynamicCanvas = null;
      this.dynamicTexture = null;
    }

    async mount(container, context = {}) {
      await super.mount(container, context);
      this.currentPlanetKey = context.planet || 'mars';

      this._buildDOM();

      const canvasWrap = this.uiRoot.querySelector('.ge-canvas-wrap');
      this.renderer = new PlanetRenderer({
        container: canvasWrap,
        cameraDistance: 6.8
      });
      this.renderer.init();

      this._initPlanetBaseline();
      this._rebuild3DScene();
      this._updateSimulationAndUI();
    }

    _initPlanetBaseline() {
      const p = PlanetData.getPlanet(this.currentPlanetKey);
      if (!p) return;

      if (!p.hasSolidSurface) {
        // Gas/Ice giant unsupported message handled in UI
        return;
      }

      this.distanceAU = p.meanSolarDistanceM / PlanetData.CONSTANTS.AU;
      this.surfacePressureBar = (p.surfacePressurePa || 100) / 100000;
      this.albedoBond = p.albedoBond || 0.25;
      this.co2Fraction = 0.95;
      this.ecosystemStage = 0;
    }

    _buildDOM() {
      this.uiRoot = document.createElement('div');
      this.uiRoot.className = 'ge-module-root';
      this.uiRoot.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: #060919;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
      `;

      this.uiRoot.innerHTML = `
        <!-- Header -->
        <div style="padding:10px 16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:10;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">🌱</span>
            <div>
              <strong style="font-size:14px;letter-spacing:0.04em">GENESIS ENGINE · АМЬДРАЛ ТЭТГЭХ СИМУЛЯЦ</strong>
              <div style="font-size:11px;color:#94a3b8">Уур амьсгал, шингэн ус, агаар мандал, гаригийн өөрчлөлт</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:#94a3b8">Чулуун гариг:</span>
            <button type="button" class="ge-planet-btn" data-planet="mars" style="padding:4px 12px;border-radius:14px;border:1px solid #38bdf8;background:#0284c7;color:#fff;font-size:11px;font-weight:600;cursor:pointer">🔴 Ангараг</button>
            <button type="button" class="ge-planet-btn" data-planet="earth" style="padding:4px 12px;border-radius:14px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#fff;font-size:11px;font-weight:600;cursor:pointer">🌍 Дэлхий</button>
            <button type="button" class="ge-planet-btn" data-planet="venus" style="padding:4px 12px;border-radius:14px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#fff;font-size:11px;font-weight:600;cursor:pointer">🟡 Сугар</button>
            <button type="button" class="ge-planet-btn" data-planet="mercury" style="padding:4px 12px;border-radius:14px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#fff;font-size:11px;font-weight:600;cursor:pointer">⚪ Буд</button>
            <button type="button" class="ge-planet-btn" data-planet="jupiter" style="padding:4px 12px;border-radius:14px;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.06);color:#94a3b8;font-size:11px;cursor:pointer">Бархасбадь (Хийн)</button>
          </div>
        </div>

        <!-- Main Viewport + HUD -->
        <div style="position:relative;flex:1;display:flex;overflow:hidden">
          <div class="ge-canvas-wrap" style="position:relative;flex:1;height:100%;cursor:grab"></div>

          <!-- Side Habitability Controls Panel -->
          <div class="ge-hud-panel" style="width:min(100%,380px);background:rgba(10,14,35,0.94);backdrop-filter:blur(14px);border-left:1px solid rgba(255,255,255,0.12);display:flex;flex-direction:column;overflow-y:auto;padding:16px;gap:14px;z-index:5">
            <!-- Planet Header & Unsupported Alert -->
            <div>
              <div style="font-size:10px;text-transform:uppercase;color:#38bdf8;font-weight:700" id="gePlanetSub">MARS HABITABILITY</div>
              <h2 style="font-size:18px;margin:2px 0 6px;color:#fff" id="gePlanetTitle">Ангараг (Mars)</h2>
              <div id="geGasGiantAlert" style="display:none;padding:10px;background:rgba(239,68,68,0.18);border:1px solid #ef4444;border-radius:8px;font-size:11px;color:#fca5a5;line-height:1.4">
                <strong>⚠️ Симуляц боломжгүй:</strong> Хийн болон мөсөн аварга гаригууд нь хатуу гадаргагүй, асар их устөрөгчийн нягт бүрхүүлтэй тул тераформ болон гадаргын экосистем үүсэх физик боломжгүй юм.
              </div>
            </div>

            <!-- Parameters Sliders -->
            <div id="geControlsBox" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px">
              <!-- Solar Distance Slider -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Нарнаас алслалт (Orbital Distance):</span>
                  <strong id="geDistVal" style="color:#f59e0b">1.52 AU</strong>
                </div>
                <input type="range" id="geDistSlider" min="0.4" max="2.5" step="0.02" value="1.52" style="width:100%;accent-color:#f59e0b">
              </div>

              <!-- Surface Pressure Slider -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Агаар мандлын даралт (Pressure):</span>
                  <strong id="gePressVal" style="color:#38bdf8">0.006 бар</strong>
                </div>
                <input type="range" id="gePressSlider" min="0.001" max="2.0" step="0.005" value="0.006" style="width:100%;accent-color:#38bdf8">
              </div>

              <!-- Greenhouse CO2 fraction -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Хүлэмжийн хий (CO₂ / GHG):</span>
                  <strong id="geCO2Val" style="color:#34d399">95%</strong>
                </div>
                <input type="range" id="geCO2Slider" min="0.01" max="1.0" step="0.02" value="0.95" style="width:100%;accent-color:#34d399">
              </div>

              <!-- Surface Albedo -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Альбедо (Гадаргын ойлт):</span>
                  <strong id="geAlbedoVal" style="color:#a855f7">0.25</strong>
                </div>
                <input type="range" id="geAlbedoSlider" min="0.05" max="0.8" step="0.02" value="0.25" style="width:100%;accent-color:#a855f7">
              </div>
            </div>

            <!-- Calculated Metrics -->
            <div id="geMetricsBox" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Тэнцвэрт температур (T_eq)</div>
                <div id="geTeqVal" style="font-size:14px;font-weight:700;color:#94a3b8">210 K</div>
                <div style="font-size:10px;color:#64748b">Хүлэмжийн нөлөөгүй</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Гадаргын бодит дулаан</div>
                <div id="geTsurfVal" style="font-size:14px;font-weight:700;color:#ef4444">-63 °C</div>
                <div id="geGreenhouseDelta" style="font-size:10px;color:#34d399">+5 K хүлэмж</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Шингэн усны төлөв</div>
                <div id="geWaterStatus" style="font-size:12px;font-weight:700;color:#f87171">Мөс / Уур</div>
                <div id="geWaterSub" style="font-size:9px;color:#94a3b8">Даралт хүрэлцэхгүй</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Earth Similarity (ESI)</div>
                <div id="geESIVal" style="font-size:14px;font-weight:700;color:#38bdf8">0.64</div>
                <div id="geESISub" style="font-size:9px;color:#cbd5e1">Дэлхийтэй төстэй байдал</div>
              </div>
            </div>

            <!-- Water Stability Detailed Verdict -->
            <div id="geWaterVerdict" style="padding:10px;border-radius:8px;font-size:11px;line-height:1.4"></div>

            <!-- Hypothetical Ecosystem Stage Selection -->
            <div id="geEcosystemBox" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-size:11px;font-weight:600;color:#e2e8f0">Таамаглалт био-хөгжил:</span>
                <span style="font-size:9px;background:rgba(245,158,11,0.2);color:#fbbf24;padding:2px 6px;border-radius:4px;font-weight:700">SPECULATIVE</span>
              </div>
              <div style="display:flex;gap:4px">
                <button type="button" class="ge-eco-btn" data-stage="0" style="flex:1;padding:6px 2px;font-size:10px;border-radius:6px;border:1px solid #38bdf8;background:#0284c7;color:#fff;cursor:pointer">Үхмэл</button>
                <button type="button" class="ge-eco-btn" data-stage="1" style="flex:1;padding:6px 2px;font-size:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer">Бактери</button>
                <button type="button" class="ge-eco-btn" data-stage="2" style="flex:1;padding:6px 2px;font-size:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer">Хөх замаг</button>
                <button type="button" class="ge-eco-btn" data-stage="3" style="flex:1;padding:6px 2px;font-size:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer">Хаг / Ургамал</button>
                <button type="button" class="ge-eco-btn" data-stage="4" style="flex:1;padding:6px 2px;font-size:10px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.05);color:#cbd5e1;cursor:pointer">Биосфер</button>
              </div>
              <div id="geEcoDescription" style="font-size:10px;color:#94a3b8;margin-top:8px;line-height:1.4">
                Үе 0: Гадаргын радиац өндөр, органик бус эрдэст үхмэл орчин.
              </div>
            </div>

            <!-- Strict Astrobiological Caveat -->
            <div style="padding:10px;background:rgba(245,158,11,0.08);border:1px dashed rgba(245,158,11,0.3);border-radius:8px">
              <strong style="font-size:10px;color:#fbbf24">Астробиологийн шинжлэх ухааны анхааруулга:</strong>
              <p style="font-size:10px;color:#cbd5e1;margin:4px 0 0;line-height:1.4">
                Тохиромжтой температур ба шингэн усны орчин бүрдсэн ч <strong>амьдрал өөрөө аяндаа үүсэх нь баталгаагүй</strong>. Биогенез нь молекул биологийн маш нарийн химийн хувьслын үр дүн бөгөөд ESI индекс өндөр байх нь амьдрал оршин тогтнох баталгаа биш юм.
              </p>
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(this.uiRoot);
      this._bindEvents();
    }

    _bindEvents() {
      // Planet switch buttons
      const planetBtns = this.uiRoot.querySelectorAll('.ge-planet-btn');
      planetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          planetBtns.forEach(b => {
            b.style.borderColor = 'rgba(255,255,255,0.18)';
            b.style.background = 'rgba(255,255,255,0.06)';
          });
          btn.style.borderColor = '#38bdf8';
          btn.style.background = '#0284c7';

          this.update({ planet: btn.dataset.planet });
        });
      });

      // Distance slider
      const distSlider = this.uiRoot.querySelector('#geDistSlider');
      distSlider.addEventListener('input', (e) => {
        this.distanceAU = parseFloat(e.target.value);
        this.uiRoot.querySelector('#geDistVal').textContent = `${this.distanceAU.toFixed(2)} AU`;
        this._updateSimulationAndUI();
      });

      // Pressure slider
      const pressSlider = this.uiRoot.querySelector('#gePressSlider');
      pressSlider.addEventListener('input', (e) => {
        this.surfacePressureBar = parseFloat(e.target.value);
        this.uiRoot.querySelector('#gePressVal').textContent = `${this.surfacePressureBar.toFixed(3)} бар`;
        this._updateSimulationAndUI();
      });

      // CO2 fraction slider
      const co2Slider = this.uiRoot.querySelector('#geCO2Slider');
      co2Slider.addEventListener('input', (e) => {
        this.co2Fraction = parseFloat(e.target.value);
        this.uiRoot.querySelector('#geCO2Val').textContent = `${Math.round(this.co2Fraction * 100)}%`;
        this._updateSimulationAndUI();
      });

      // Albedo slider
      const albedoSlider = this.uiRoot.querySelector('#geAlbedoSlider');
      albedoSlider.addEventListener('input', (e) => {
        this.albedoBond = parseFloat(e.target.value);
        this.uiRoot.querySelector('#geAlbedoVal').textContent = this.albedoBond.toFixed(2);
        this._updateSimulationAndUI();
      });

      // Ecosystem stage buttons
      const ecoBtns = this.uiRoot.querySelectorAll('.ge-eco-btn');
      ecoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          ecoBtns.forEach(b => {
            b.style.borderColor = 'rgba(255,255,255,0.15)';
            b.style.background = 'rgba(255,255,255,0.05)';
            b.style.color = '#cbd5e1';
          });
          btn.style.borderColor = '#38bdf8';
          btn.style.background = '#0284c7';
          btn.style.color = '#fff';

          this.ecosystemStage = parseInt(btn.dataset.stage, 10);
          this._updateSimulationAndUI();
        });
      });
    }

    _rebuild3DScene() {
      if (!this.renderer || !this.renderer.planetGroup) return;
      this.renderer.clearPlanetGroup();

      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      if (!planet) return;

      const alertBox = this.uiRoot.querySelector('#geGasGiantAlert');
      const controlsBox = this.uiRoot.querySelector('#geControlsBox');
      const metricsBox = this.uiRoot.querySelector('#geMetricsBox');
      const ecoBox = this.uiRoot.querySelector('#geEcosystemBox');

      if (!planet.hasSolidSurface) {
        if (alertBox) alertBox.style.display = 'block';
        if (controlsBox) controlsBox.style.display = 'none';
        if (metricsBox) metricsBox.style.display = 'none';
        if (ecoBox) ecoBox.style.display = 'none';
        return;
      } else {
        if (alertBox) alertBox.style.display = 'none';
        if (controlsBox) controlsBox.style.display = 'flex';
        if (metricsBox) metricsBox.style.display = 'grid';
        if (ecoBox) ecoBox.style.display = 'block';
      }

      // Initialize dynamic procedural terraforming canvas
      this.dynamicCanvas = document.createElement('canvas');
      this.dynamicCanvas.width = 1024;
      this.dynamicCanvas.height = 512;
      this.dynamicTexture = new THREE.CanvasTexture(this.dynamicCanvas);

      const geo = new THREE.SphereGeometry(2.0, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        map: this.dynamicTexture,
        roughness: 0.75,
        metalness: 0.05
      });
      this.planetMesh = new THREE.Mesh(geo, mat);
      this.renderer.planetGroup.add(this.planetMesh);

      // Cloud sphere
      const cloudGeo = new THREE.SphereGeometry(2.03, 48, 48);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: PlanetMaterials.getPlanetTexture('earth'), // Reusable white cloud pattern
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      this.cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.renderer.planetGroup.add(this.cloudMesh);

      this._renderDynamicTexture();
    }

    _updateSimulationAndUI() {
      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      if (!planet || !planet.hasSolidSurface) return;

      const distanceM = this.distanceAU * PlanetData.CONSTANTS.AU;
      const tEqK = HabitabilityCalculators.calculateEquilibriumTemperature(distanceM, this.albedoBond);
      const pressurePa = this.surfacePressureBar * 100000;
      const gh = HabitabilityCalculators.calculateGreenhouseWarming(tEqK, pressurePa, this.co2Fraction);
      const tSurfK = gh.surfaceTemperatureK;

      const water = HabitabilityCalculators.evaluateLiquidWaterStability(pressurePa, tSurfK);
      const meanRadiusM = planet.meanRadiusM;
      const bulkDensity = planet.massKg / ((4 / 3) * Math.PI * Math.pow(meanRadiusM, 3));
      const v_esc = Math.sqrt((2 * PlanetData.CONSTANTS.G * planet.massKg) / meanRadiusM);
      const esi = HabitabilityCalculators.calculateESI(meanRadiusM, bulkDensity, v_esc, tSurfK);

      // UI text updates
      this.uiRoot.querySelector('#gePlanetTitle').textContent = `${planet.name_mn || planet.name} (${planet.name})`;
      this.uiRoot.querySelector('#geTeqVal').textContent = `${Math.round(tEqK)} K (${Math.round(tEqK - 273.15)} °C)`;
      this.uiRoot.querySelector('#geTsurfVal').textContent = `${Math.round(tSurfK - 273.15)} °C (${Math.round(tSurfK)} K)`;
      this.uiRoot.querySelector('#geGreenhouseDelta').textContent = `+${Math.round(gh.deltaGreenhouseK)} K хүлэмж (tau: ${gh.opticalDepth.toFixed(2)})`;

      const waterStatusEl = this.uiRoot.querySelector('#geWaterStatus');
      const waterSubEl = this.uiRoot.querySelector('#geWaterSub');
      const waterVerdictEl = this.uiRoot.querySelector('#geWaterVerdict');

      if (water.isStable) {
        waterStatusEl.textContent = 'Шингэн ус тогтвортой';
        waterStatusEl.style.color = '#38bdf8';
        waterSubEl.textContent = `Буцлах: ${Math.round(water.boilingTempK - 273.15)}°C | Хөлдөх: 0°C`;
        waterVerdictEl.style.background = 'rgba(56,189,248,0.15)';
        waterVerdictEl.style.border = '1px solid #0284c7';
        waterVerdictEl.style.color = '#bae6fd';
        waterVerdictEl.innerHTML = `<strong>Далай үүсэх нөхцөл бүрдэв:</strong> ${water.reason}`;
      } else {
        waterStatusEl.textContent = water.phase === 'solid_ice' ? 'Мөс / Цэвдэг' : 'Уур / Буцалсан';
        waterStatusEl.style.color = '#f87171';
        waterSubEl.textContent = water.phase === 'solid_ice' ? 'Температур хэт хүйтэн' : 'Температур эсвэл даралт хүрэхгүй';
        waterVerdictEl.style.background = 'rgba(239,68,68,0.15)';
        waterVerdictEl.style.border = '1px solid #ef4444';
        waterVerdictEl.style.color = '#fca5a5';
        waterVerdictEl.innerHTML = `<strong>Шингэн ус боломжгүй:</strong> ${water.reason}`;
      }

      this.uiRoot.querySelector('#geESIVal').textContent = esi.esiGlobal.toFixed(2);
      this.uiRoot.querySelector('#geESISub').textContent = esi.interpretation;

      // Update Ecosystem description
      const ecoDescEl = this.uiRoot.querySelector('#geEcoDescription');
      const stages = [
        'Үе 0 (Стерил): Гадаргын радиац өндөр, усгүй, органик бус эрдэст үхмэл орчин.',
        'Үе 1 (Экстремофил бичил биетэн): Давсархаг гүний усанд тэсвэртэй анаэроб анаэробик метан үүсгэгч бактериуд.',
        'Үе 2 (Хөх-ногоон замаг): Фотосинтез явуулж, агаар мандалд чөлөөт хүчилтөрөгч (O2) ялгаруулж эхэлнэ.',
        'Үе 3 (Хаг ба хөвд ургамал): Хөрсний үржил шим бүрдэж, тундрын ургамалжилт үүснэ.',
        'Үе 4 (Цогц биосфер): Хүчилтөрөгчийн баялаг агаар мандал, озон бүрхүүл, биохимийн тогтвортой эргэлт.'
      ];
      if (ecoDescEl) ecoDescEl.textContent = stages[this.ecosystemStage];

      this._renderDynamicTexture(water.isStable, tSurfK);
    }

    _renderDynamicTexture(isWaterStable, tSurfK) {
      if (!this.dynamicCanvas || !this.dynamicTexture) return;

      const ctx = this.dynamicCanvas.getContext('2d');
      const w = 1024, h = 512;

      // Base terrain color depending on temperature
      let baseGrad;
      if (tSurfK < 240) {
        // Deep frozen white-blue
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#e2e8f0');
        baseGrad.addColorStop(0.5, '#cbd5e1');
        baseGrad.addColorStop(1, '#94a3b8');
      } else if (this.currentPlanetKey === 'mars') {
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#a73b11');
        baseGrad.addColorStop(0.5, '#cf5219');
        baseGrad.addColorStop(1, '#8c2f0b');
      } else {
        baseGrad = ctx.createLinearGradient(0, 0, 0, h);
        baseGrad.addColorStop(0, '#475569');
        baseGrad.addColorStop(0.5, '#64748b');
        baseGrad.addColorStop(1, '#334155');
      }

      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Draw liquid ocean basin if water is stable
      if (isWaterStable) {
        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        // Northern ocean basin on Mars (Vastitas Borealis)
        ctx.ellipse(w * 0.5, h * 0.25, w * 0.45, h * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Craters filled as crater lakes
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(w * 0.28, h * 0.6, 35, 0, Math.PI * 2); // Hellas Basin sea
        ctx.arc(w * 0.72, h * 0.55, 28, 0, Math.PI * 2); // Argyre Basin sea
        ctx.fill();
      }

      // Draw ecosystem vegetation if stage > 1 and temperature is hospitable
      if (this.ecosystemStage >= 2 && tSurfK >= 265 && tSurfK <= 330) {
        ctx.fillStyle = this.ecosystemStage === 2 ? 'rgba(74, 222, 128, 0.45)' : '#15803d';
        ctx.beginPath();
        // Coastal shoreline vegetation belts
        ctx.ellipse(w * 0.5, h * 0.38, w * 0.46, h * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.ecosystemStage >= 3) {
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.ellipse(w * 0.28, h * 0.6, 45, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Polar caps
      ctx.fillStyle = '#ffffff';
      const capHeight = tSurfK < 240 ? 60 : (tSurfK < 273 ? 30 : 15);
      ctx.beginPath();
      ctx.ellipse(w * 0.5, 0, w * 0.25, capHeight, 0, 0, Math.PI * 2);
      ctx.ellipse(w * 0.5, h, w * 0.25, capHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      this.dynamicTexture.needsUpdate = true;

      // Update cloud opacity
      if (this.cloudMesh) {
        this.cloudMesh.material.opacity = isWaterStable ? Math.min(0.65, this.surfacePressureBar * 0.4) : 0.05;
      }
    }

    async update(parameters = {}) {
      if (parameters.planet && parameters.planet !== this.currentPlanetKey) {
        this.currentPlanetKey = parameters.planet;
        this._initPlanetBaseline();
        this._rebuild3DScene();
        this._updateSimulationAndUI();
      }
      if (parameters.distanceAU !== undefined) this.distanceAU = parameters.distanceAU;
      if (parameters.surfacePressureBar !== undefined) this.surfacePressureBar = parameters.surfacePressureBar;
      this._updateSimulationAndUI();
    }

    pause() {
      super.pause();
      if (this.renderer) this.renderer.pause();
    }

    resume() {
      super.resume();
      if (this.renderer) this.renderer.resume();
    }

    getState() {
      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      const distanceM = this.distanceAU * PlanetData.CONSTANTS.AU;
      const tEqK = HabitabilityCalculators.calculateEquilibriumTemperature(distanceM, this.albedoBond);
      const pressurePa = this.surfacePressureBar * 100000;
      const gh = HabitabilityCalculators.calculateGreenhouseWarming(tEqK, pressurePa, this.co2Fraction);
      const tSurfK = gh.surfaceTemperatureK;
      const water = HabitabilityCalculators.evaluateLiquidWaterStability(pressurePa, tSurfK);

      return {
        ...super.getState(),
        activePlanet: this.currentPlanetKey,
        distanceAU: this.distanceAU,
        surfacePressureBar: this.surfacePressureBar,
        co2Fraction: this.co2Fraction,
        albedoBond: this.albedoBond,
        ecosystemStage: this.ecosystemStage,
        equilibriumTemperatureK: tEqK,
        surfaceTemperatureK: tSurfK,
        liquidWaterStable: water.isStable,
        waterPhase: water.phase
      };
    }

    async unmount() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
      if (this.dynamicTexture) {
        this.dynamicTexture.dispose();
        this.dynamicTexture = null;
      }
      this.dynamicCanvas = null;
      this.planetMesh = null;
      this.cloudMesh = null;
      this.uiRoot = null;
      await super.unmount();
    }
  }

  return GenesisEngineModule;
}));
