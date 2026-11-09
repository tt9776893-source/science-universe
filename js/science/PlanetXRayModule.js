/**
 * SCIENCE UNIVERSE — PLANET X-RAY V3 & COMPARISON ENGINE
 * Module: PlanetXRayModule.js
 * 
 * Comprehensive 3D Planetary Research Simulator:
 * 1. Precision 270° Concentric Cross-Section for ALL 8 Solar System Planets:
 *    - Terrestrial (Mercury, Venus, Earth, Mars)
 *    - Gas Giants (Jupiter, Saturn with 3D Rings)
 *    - Ice Giants (Uranus, Neptune)
 * 2. Museum-grade Geophysical Cutaway:
 *    - Concentric shells with perfectly aligned semi-annular caps
 *    - Sharp boundary demarcations (Moho, CMB, ICB, phase boundaries)
 *    - Realistic non-reflective inner cores & convective molten liquid cores
 *    - Clean depth probe laser cursor (no interior-cutting orbital lines)
 * 3. Interactive Depth Probe (0 km to center) with Hydrostatic Pressure P(z) & Geothermal T(z)
 * 4. Interactive Seismic Wave Raycaster (P-wave refraction vs S-wave shadow zones)
 * 5. Interactive DUAL-PLANET COMPARISON MODE:
 *    - Side-by-side 3D visualization of any two planets
 *    - Normalized structural scale vs True relative astronomical scale
 *    - Dual independent X-Ray cutaways
 *    - "Яагаад тэд өөр вэ?" (Why Are They Different?) in-depth educational synthesis
 *    - Interactive planetary challenge quiz
 * 6. Full Freebuff Module Lifecycle compliance & zero-leak resource disposal.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      './ScienceModuleAdapter',
      './PlanetData',
      './physics/PlanetaryGeophysics',
      './rendering/PlanetRenderer',
      './rendering/PlanetMaterials'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./ScienceModuleAdapter'),
      require('./PlanetData'),
      require('./physics/PlanetaryGeophysics'),
      require('./rendering/PlanetRenderer'),
      require('./rendering/PlanetMaterials')
    );
  } else {
    root.PlanetXRayModule = factory(
      root.ScienceModuleAdapter,
      root.PlanetData,
      root.PlanetaryGeophysics,
      root.PlanetRenderer,
      root.PlanetMaterials
    );
  }
}(typeof self !== 'undefined' ? self : this, function (
  ScienceModuleAdapter,
  PlanetData,
  PlanetaryGeophysics,
  PlanetRenderer,
  PlanetMaterials
) {
  'use strict';

  class PlanetXRayModule extends ScienceModuleAdapter {
    constructor() {
      super('planet_xray');

      // Mode state: 'single' or 'compare'
      this.viewMode = 'single';

      // Single mode planet
      this.currentPlanetKey = 'earth';
      this.isXRayActive = false;
      this.inspectDepthKm = 0;
      this.seismicAngleDeg = 120;
      this.showSeismicRays = true;
      this.selectedLayerId = 'crust';

      // Comparison mode state
      this.comparePlanetA = 'earth';
      this.comparePlanetB = 'mars';
      this.compareXRayA = true;
      this.compareXRayB = true;
      this.compareTrueScale = false;

      // Three.js instances
      this.renderer = null;
      this.singlePlanetContainer = null;
      this.compareGroupA = null;
      this.compareGroupB = null;
      this.layerMeshMap = new Map(); // layerId -> Mesh[]
      this.probeMarkerMesh = null;
      this.seismicGroup = null;

      this.uiRoot = null;
      this._raycaster = null;
      this._mouse = null;
    }

    async mount(container, context = {}) {
      await super.mount(container, context);
      this.currentPlanetKey = context.planet || 'earth';

      this._buildDOM();

      const canvasWrap = this.uiRoot.querySelector('.px-canvas-wrap');
      this.renderer = new PlanetRenderer({
        container: canvasWrap,
        cameraDistance: 7.2
      });
      this.renderer.init();

      // Hook per-frame rotation
      this.renderer.lifecycle.onTick = (dt) => {
        this._onFrameTick(dt);
      };

      this._setupRaycasting();
      this._rebuild3DScene();
      this._updateHUD();
    }

    _onFrameTick(dt) {
      if (this.viewMode === 'single') {
        if (this.singlePlanetContainer) {
          // Slow ambient rotation
          this.singlePlanetContainer.rotation.y += dt * 0.12;
        }
      } else {
        if (this.compareGroupA) this.compareGroupA.rotation.y += dt * 0.12;
        if (this.compareGroupB) this.compareGroupB.rotation.y += dt * 0.12;
      }
    }

    _buildDOM() {
      this.uiRoot = document.createElement('div');
      this.uiRoot.className = 'px-cinematic-root';
      this.uiRoot.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: radial-gradient(circle at 50% 50%, #0a1128 0%, #040612 100%);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
        user-select: none;
      `;

      const allPlanetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

      const planetPillsHtml = allPlanetKeys.map(k => {
        const p = PlanetData.getPlanet(k);
        const isActive = k === this.currentPlanetKey;
        const icon = p.category === 'gas_giant' ? '🪐' : (p.category === 'ice_giant' ? '❄️' : '🪨');
        return `
          <button type="button" class="px-planet-pill ${isActive ? 'active' : ''}" data-planet="${k}" style="
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 5px 11px;
            border-radius: 16px;
            border: 1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.15)'};
            background: ${isActive ? 'linear-gradient(135deg, #0284c7, #38bdf8)' : 'rgba(255,255,255,0.05)'};
            color: ${isActive ? '#fff' : '#94a3b8'};
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
          ">
            <span>${icon}</span>
            <span>${p.name_mn || p.name}</span>
          </button>
        `;
      }).join('');

      this.uiRoot.innerHTML = `
        <!-- Top App Navigation & Mode Switcher -->
        <div style="padding:10px 16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:20;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:20px">🔬</span>
            <div>
              <div style="font-family:'Orbitron',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.06em;color:#fff">PLANET X-RAY · ДОТООД БҮТЭЦ</div>
              <div style="font-size:10px;color:#94a3b8">8 гаригийн геофизик, даралт, температур, газар хөдлөлтийн долгион</div>
            </div>
          </div>

          <!-- View Mode Toggle: Single vs Compare -->
          <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.35);padding:3px;border-radius:20px;border:1px solid rgba(255,255,255,0.1)">
            <button type="button" id="pxModeSingleBtn" style="padding:4px 12px;border-radius:14px;border:none;background:#0284c7;color:#fff;font-size:11px;font-weight:600;cursor:pointer">Нэг гариг</button>
            <button type="button" id="pxModeCompareBtn" style="padding:4px 12px;border-radius:14px;border:none;background:transparent;color:#94a3b8;font-size:11px;font-weight:600;cursor:pointer">⚖️ Харьцуулах</button>
          </div>

          <!-- Compact 8-Planet Selector (Single View) -->
          <div id="pxSinglePlanetBar" style="display:flex;align-items:center;gap:6px;overflow-x:auto;padding-bottom:2px;max-width:100%">
            ${planetPillsHtml}
          </div>

          <!-- Comparison Planet Pickers (Hidden in Single View) -->
          <div id="pxComparePlanetBar" style="display:none;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:4px">
              <span style="font-size:11px;color:#38bdf8;font-weight:700">Гариг A:</span>
              <select id="pxCompareSelectA" style="background:#0f172a;color:#fff;border:1px solid #38bdf8;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer">
                ${allPlanetKeys.map(k => `<option value="${k}" ${k==='earth'?'selected':''}>${PlanetData.getPlanet(k).name_mn || k}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;align-items:center;gap:4px">
              <span style="font-size:11px;color:#f59e0b;font-weight:700">Гариг B:</span>
              <select id="pxCompareSelectB" style="background:#0f172a;color:#fff;border:1px solid #f59e0b;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer">
                ${allPlanetKeys.map(k => `<option value="${k}" ${k==='mars'?'selected':''}>${PlanetData.getPlanet(k).name_mn || k}</option>`).join('')}
              </select>
            </div>
            <button type="button" id="pxScaleToggleBtn" style="padding:4px 10px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#e2e8f0;font-size:10px;font-weight:600;cursor:pointer">Бодит хэмжээ: Унтраастай</button>
            <button type="button" id="pxWhyDifferentBtn" style="padding:4px 12px;border-radius:12px;border:1px solid #38bdf8;background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(14,165,233,0.35));color:#38bdf8;font-size:11px;font-weight:700;cursor:pointer">💡 Яагаад өөр вэ?</button>
          </div>
        </div>

        <!-- Main Viewport + HUD Layout -->
        <div style="position:relative;flex:1;display:flex;overflow:hidden">
          <!-- 3D Canvas Area -->
          <div class="px-canvas-wrap" style="position:relative;flex:1;height:100%;cursor:grab"></div>

          <!-- SINGLE MODE HUD (Right Panel) -->
          <div id="pxSingleHUD" class="px-hud-panel" style="width:min(100%,380px);background:rgba(10,14,35,0.92);backdrop-filter:blur(14px);border-left:1px solid rgba(255,255,255,0.12);display:flex;flex-direction:column;overflow-y:auto;padding:16px;gap:14px;z-index:10">
            <!-- Header Title & X-Ray Toggle -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <span id="pxPlanetCategory" style="font-size:10px;text-transform:uppercase;color:#38bdf8;font-weight:700;letter-spacing:0.05em">TERRESTRIAL</span>
                <h3 id="pxPlanetTitle" style="margin:2px 0 0;font-size:16px;font-weight:700;color:#fff">Дэлхий (Earth)</h3>
              </div>
              <button type="button" id="pxActivateXRayBtn" style="
                padding:7px 14px;
                border-radius:8px;
                border:1px solid rgba(245,158,11,0.5);
                background:linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.35));
                color:#fbbf24;
                font-weight:700;
                font-size:11px;
                cursor:pointer;
                display:flex;
                align-items:center;
                gap:6px;
                transition:all 0.2s;
              ">
                <span>✂️</span>
                <span id="pxXRayBtnLabel">X-Ray Нээх (Activate)</span>
              </button>
            </div>

            <!-- Active Selected Layer Card -->
            <div id="pxLayerInspectCard" style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <strong id="pxLayerName" style="color:#38bdf8;font-size:13px">Crust (Бүрхүүл)</strong>
                <span id="pxLayerStateBadge" style="font-size:9px;padding:2px 7px;border-radius:10px;border:1px solid #38bdf8;color:#e2e8f0;text-transform:uppercase">SOLID</span>
              </div>
              <p id="pxLayerDescText" style="margin:0;font-size:11px;color:#94a3b8;line-height:1.45">
                Силикат чулуулаг, боржин, базальт.
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px">
                <div>
                  <div style="color:#64748b;font-size:10px">Гүний хязгаар:</div>
                  <div id="pxLayerDepthRange" style="color:#f1f5f9;font-weight:600">0 - 35 км</div>
                </div>
                <div>
                  <div style="color:#64748b;font-size:10px">Дундаж нягт:</div>
                  <div id="pxLayerDensity" style="color:#f1f5f9;font-weight:600">2,800 кг/м³</div>
                </div>
                <div>
                  <div style="color:#64748b;font-size:10px">P-долгионы хурд:</div>
                  <div id="pxLayerPWave" style="color:#22d3ee;font-weight:600">6.5 км/с</div>
                </div>
                <div>
                  <div style="color:#64748b;font-size:10px">S-долгионы хурд:</div>
                  <div id="pxLayerSWave" style="color:#f97316;font-weight:600">3.7 км/с</div>
                </div>
              </div>
            </div>

            <!-- Depth Exploration Probe Slider -->
            <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-size:11px;color:#94a3b8;font-weight:600">Гүний датчик (Depth Probe):</span>
                <span id="pxDepthReadout" style="font-size:14px;font-weight:700;color:#38bdf8;font-family:'Orbitron',sans-serif">0 км</span>
              </div>
              <input type="range" id="pxDepthSlider" min="0" max="6371" value="0" step="25" style="width:100%;accent-color:#38bdf8;cursor:pointer">

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8;text-transform:uppercase">Гидростатик даралт</div>
                  <div id="pxPressureReadout" style="font-size:12px;color:#38bdf8;font-weight:700">1.0 атм</div>
                </div>
                <div style="background:rgba(0,0,0,0.3);padding:8px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8;text-transform:uppercase">Геотермал температур</div>
                  <div id="pxTempReadout" style="font-size:12px;color:#f59e0b;font-weight:700">15 °C (288 K)</div>
                </div>
              </div>
            </div>

            <!-- Seismic Wave Demonstration Section -->
            <div id="pxSeismicSection" style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:11px;color:#e2e8f0;font-weight:700">Сейсмик долгионы цацралт</span>
                <label style="display:flex;align-items:center;gap:6px;font-size:10px;color:#94a3b8;cursor:pointer">
                  <input type="checkbox" id="pxSeismicToggle" checked style="accent-color:#f59e0b">
                  <span>Харуулах</span>
                </label>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Газар хөдлөлтийн өнцөг (Epicenter):</span>
                  <strong id="pxEpicenterAngleVal" style="color:#f59e0b;font-family:'Orbitron',sans-serif">120°</strong>
                </div>
                <input type="range" id="pxEpicenterSlider" min="10" max="180" value="120" step="2" style="width:100%;accent-color:#f59e0b;cursor:pointer">
              </div>

              <div id="pxSeismicAlertCard" style="padding:10px;border-radius:8px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.12);line-height:1.4">
                <div id="pxSeismicHeadline" style="font-weight:700;font-size:11px;color:#fca5a5">S-Wave Shadow Zone Detected</div>
                <p id="pxSeismicExplanation" style="font-size:10px;color:#cbd5e1;margin:4px 0 0">
                  104°-180° өнцөгт шингэн гадаад цөм нь хөндлөн долгионыг (S-wave) бүрэн шингээж саатуулдаг.
                </p>
              </div>
            </div>

            <!-- Scientific Grounding Notice -->
            <div style="padding:10px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:10px;font-size:10px;color:#cbd5e1;line-height:1.4">
              <strong style="color:#38bdf8">Шинжлэх ухааны эх сурвалж:</strong>
              <p id="pxScientificDisclaimer" style="margin:4px 0 0">
                PREM стандарт (Dziewonski & Anderson), NASA InSight, Juno, Cassini, MESSENGER өгөгдлүүд.
              </p>
            </div>
          </div>

          <!-- COMPARISON MODE HUD (Right Panel) -->
          <div id="pxCompareHUD" class="px-hud-panel" style="display:none;width:min(100%,420px);background:rgba(10,14,35,0.94);backdrop-filter:blur(14px);border-left:1px solid rgba(255,255,255,0.12);flex-direction:column;overflow-y:auto;padding:16px;gap:14px;z-index:10">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <span style="font-size:10px;text-transform:uppercase;color:#38bdf8;font-weight:700">DUAL PLANETARY TELEMETRY</span>
                <h3 style="margin:2px 0 0;font-size:16px;font-weight:700;color:#fff">Гаригийн бүтцийн харьцуулалт</h3>
              </div>
              <div style="display:flex;gap:6px">
                <button type="button" id="pxCompareXRayBtnA" style="padding:5px 9px;border-radius:6px;border:1px solid #38bdf8;background:rgba(56,189,248,0.2);color:#38bdf8;font-size:10px;font-weight:700;cursor:pointer">X-Ray A</button>
                <button type="button" id="pxCompareXRayBtnB" style="padding:5px 9px;border-radius:6px;border:1px solid #f59e0b;background:rgba(245,158,11,0.2);color:#f59e0b;font-size:10px;font-weight:700;cursor:pointer">X-Ray B</button>
              </div>
            </div>

            <!-- Comparison Table -->
            <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:10px;overflow:hidden">
              <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:left">
                <thead>
                  <tr style="background:rgba(255,255,255,0.05);color:#94a3b8;font-size:10px">
                    <th style="padding:8px 10px">Үзүүлэлт</th>
                    <th id="pxCompColA" style="padding:8px 10px;color:#38bdf8">Дэлхий</th>
                    <th id="pxCompColB" style="padding:8px 10px;color:#f59e0b">Ангараг</th>
                  </tr>
                </thead>
                <tbody id="pxCompareTableBody" style="color:#e2e8f0">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>

            <!-- Layer Thickness Comparison Bar -->
            <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px">
              <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-bottom:8px">Цөмийн радиусын эзлэх хувь (%):</div>
              <div style="margin-bottom:6px">
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#38bdf8">
                  <span id="pxCompBarLabelA">Дэлхий:</span>
                  <span id="pxCompBarValA">55%</span>
                </div>
                <div style="width:100%;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;margin-top:2px">
                  <div id="pxCompBarFillA" style="width:55%;height:100%;background:#38bdf8"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#f59e0b">
                  <span id="pxCompBarLabelB">Ангараг:</span>
                  <span id="pxCompBarValB">54%</span>
                </div>
                <div style="width:100%;height:8px;background:rgba(255,255,255,0.1);border-radius:4px;overflow:hidden;margin-top:2px">
                  <div id="pxCompBarFillB" style="width:54%;height:100%;background:#f59e0b"></div>
                </div>
              </div>
            </div>

            <!-- Interactive Educational Explanation Card ("Яагаад тэд өөр вэ?") -->
            <div id="pxWhyCard" style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:12px;font-size:11px;line-height:1.5;color:#e2e8f0">
              <div id="pxWhyContent">
                Дээрх "💡 Яагаад өөр вэ?" товчийг дарж энэхүү хоёр гаригийн үүсэл, цасан шугам, бүтэц ба соронзон орны эрс ялгааны шинжлэх ухааны шалтгааныг үзнэ үү.
              </div>
            </div>

            <!-- Interactive Planetary Challenge Quiz -->
            <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px">
              <div style="font-size:11px;font-weight:700;color:#fbbf24;margin-bottom:4px">🎯 Сурч мэдэх сорил:</div>
              <div id="pxChallengeQuestion" style="font-size:11px;color:#cbd5e1;line-height:1.4">
                Аль гариг нь илүү өндөр дундаж нягттай бөгөөд яагаад?
              </div>
              <div id="pxChallengeOptions" style="display:flex;gap:6px;margin-top:8px">
                <!-- Dynamically populated options -->
              </div>
              <div id="pxChallengeFeedback" style="font-size:10px;margin-top:6px;display:none"></div>
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(this.uiRoot);
      this._bindEvents();
    }

    _bindEvents() {
      // 1. Mode Buttons (Single vs Compare)
      const singleBtn = this.uiRoot.querySelector('#pxModeSingleBtn');
      const compBtn = this.uiRoot.querySelector('#pxModeCompareBtn');
      const singleBar = this.uiRoot.querySelector('#pxSinglePlanetBar');
      const compBar = this.uiRoot.querySelector('#pxComparePlanetBar');
      const singleHUD = this.uiRoot.querySelector('#pxSingleHUD');
      const compHUD = this.uiRoot.querySelector('#pxCompareHUD');

      singleBtn.addEventListener('click', () => {
        this.viewMode = 'single';
        singleBtn.style.background = '#0284c7';
        singleBtn.style.color = '#fff';
        compBtn.style.background = 'transparent';
        compBtn.style.color = '#94a3b8';

        singleBar.style.display = 'flex';
        compBar.style.display = 'none';
        singleHUD.style.display = 'flex';
        compHUD.style.display = 'none';

        this.renderer.camera.position.set(0, 0, 7.2);
        this._rebuild3DScene();
        this._updateHUD();
      });

      compBtn.addEventListener('click', () => {
        this.viewMode = 'compare';
        compBtn.style.background = '#0284c7';
        compBtn.style.color = '#fff';
        singleBtn.style.background = 'transparent';
        singleBtn.style.color = '#94a3b8';

        singleBar.style.display = 'none';
        compBar.style.display = 'flex';
        singleHUD.style.display = 'none';
        compHUD.style.display = 'flex';

        this.renderer.camera.position.set(0, 0, 9.6);
        this._rebuild3DScene();
        this._updateComparisonHUD();
      });

      // 2. Planet selection pills (Single mode)
      const pills = this.uiRoot.querySelectorAll('.px-planet-pill');
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => {
            p.classList.remove('active');
            p.style.background = 'rgba(255,255,255,0.05)';
            p.style.color = '#94a3b8';
            p.style.borderColor = 'rgba(255,255,255,0.15)';
          });
          pill.classList.add('active');
          pill.style.background = 'linear-gradient(135deg, #0284c7, #38bdf8)';
          pill.style.color = '#fff';
          pill.style.borderColor = '#38bdf8';

          this.update({ planet: pill.dataset.planet });
        });
      });

      // 3. X-Ray toggle button (Single mode)
      const xRayBtn = this.uiRoot.querySelector('#pxActivateXRayBtn');
      xRayBtn.addEventListener('click', () => {
        this.isXRayActive = !this.isXRayActive;
        this.uiRoot.querySelector('#pxXRayBtnLabel').textContent = this.isXRayActive 
          ? 'Бүрэн бөмбөрцөг (Close X-Ray)' 
          : 'X-Ray Нээх (Activate)';
        xRayBtn.style.background = this.isXRayActive 
          ? 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.4))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.35))';

        this._rebuild3DScene();
      });

      // 4. Depth Slider (Single mode)
      const depthSlider = this.uiRoot.querySelector('#pxDepthSlider');
      depthSlider.addEventListener('input', (e) => {
        this.inspectDepthKm = parseInt(e.target.value, 10);
        this._updateDepthProbeUI();
        this._updateHolographicProbePosition();
      });

      // 5. Epicenter Angle Slider
      const epicenterSlider = this.uiRoot.querySelector('#pxEpicenterSlider');
      epicenterSlider.addEventListener('input', (e) => {
        this.seismicAngleDeg = parseInt(e.target.value, 10);
        this.uiRoot.querySelector('#pxEpicenterAngleVal').textContent = `${this.seismicAngleDeg}°`;
        this._rebuildSeismicRays();
        this._updateSeismicFeedback();
      });

      // 6. Seismic Toggle
      const seismicToggle = this.uiRoot.querySelector('#pxSeismicToggle');
      seismicToggle.addEventListener('change', (e) => {
        this.showSeismicRays = e.target.checked;
        if (this.seismicGroup) {
          this.seismicGroup.visible = this.showSeismicRays;
        }
      });

      // 7. Comparison Mode Selectors & Buttons
      const selectA = this.uiRoot.querySelector('#pxCompareSelectA');
      const selectB = this.uiRoot.querySelector('#pxCompareSelectB');
      const scaleBtn = this.uiRoot.querySelector('#pxScaleToggleBtn');
      const whyBtn = this.uiRoot.querySelector('#pxWhyDifferentBtn');
      const btnXRayA = this.uiRoot.querySelector('#pxCompareXRayBtnA');
      const btnXRayB = this.uiRoot.querySelector('#pxCompareXRayBtnB');

      selectA.addEventListener('change', (e) => {
        this.comparePlanetA = e.target.value;
        this._rebuild3DScene();
        this._updateComparisonHUD();
      });

      selectB.addEventListener('change', (e) => {
        this.comparePlanetB = e.target.value;
        this._rebuild3DScene();
        this._updateComparisonHUD();
      });

      scaleBtn.addEventListener('click', () => {
        this.compareTrueScale = !this.compareTrueScale;
        scaleBtn.textContent = `Бодит хэмжээ: ${this.compareTrueScale ? 'ИДЭВХЖСЭН' : 'Унтраастай'}`;
        scaleBtn.style.borderColor = this.compareTrueScale ? '#38bdf8' : 'rgba(255,255,255,0.2)';
        scaleBtn.style.color = this.compareTrueScale ? '#38bdf8' : '#e2e8f0';
        this._rebuild3DScene();
      });

      whyBtn.addEventListener('click', () => {
        const text = PlanetaryGeophysics.explainPlanetaryDifferences(this.comparePlanetA, this.comparePlanetB);
        this.uiRoot.querySelector('#pxWhyContent').innerHTML = text;
      });

      btnXRayA.addEventListener('click', () => {
        this.compareXRayA = !this.compareXRayA;
        btnXRayA.style.background = this.compareXRayA ? 'rgba(56,189,248,0.4)' : 'rgba(56,189,248,0.1)';
        this._rebuild3DScene();
      });

      btnXRayB.addEventListener('click', () => {
        this.compareXRayB = !this.compareXRayB;
        btnXRayB.style.background = this.compareXRayB ? 'rgba(245,158,11,0.4)' : 'rgba(245,158,11,0.1)';
        this._rebuild3DScene();
      });
    }

    _setupRaycasting() {
      this._raycaster = new THREE.Raycaster();
      this._mouse = new THREE.Vector2();

      const canvas = this.renderer.lifecycle.canvas;
      if (!canvas) return;

      canvas.addEventListener('click', (e) => {
        if (this.viewMode !== 'single') return;

        const rect = canvas.getBoundingClientRect();
        this._mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this._mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this.renderer.camera);
        const clickable = [];
        this.layerMeshMap.forEach(meshArr => {
          meshArr.forEach(m => clickable.push(m));
        });

        const intersects = this._raycaster.intersectObjects(clickable, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          if (hit.userData && hit.userData.id) {
            this._selectLayer(hit.userData);
          }
        }
      });
    }

    _rebuild3DScene() {
      if (!this.renderer || !this.renderer.planetGroup) return;
      this.renderer.clearPlanetGroup();
      this.layerMeshMap.clear();

      if (this.viewMode === 'single') {
        this._buildSinglePlanetScene();
      } else {
        this._buildComparisonScene();
      }
    }

    /**
     * Builds single planet view with full concentric 270° cutaway
     */
    _buildSinglePlanetScene() {
      const model = PlanetaryGeophysics.getInteriorModel(this.currentPlanetKey);
      const planetData = PlanetData.getPlanet(this.currentPlanetKey);
      if (!model || !planetData) return;

      const R_VISUAL = 2.0;

      // Container for axial tilt & rotation
      this.singlePlanetContainer = new THREE.Group();
      if (planetData.axialTiltDeg) {
        this.singlePlanetContainer.rotation.z = (planetData.axialTiltDeg * Math.PI) / 180;
      }
      this.renderer.planetGroup.add(this.singlePlanetContainer);

      // Add 3D Saturn Rings if planet has rings
      if (planetData.hasRings || this.currentPlanetKey === 'saturn') {
        const rings = PlanetMaterials.createSaturnRings(R_VISUAL * 1.35, R_VISUAL * 2.35);
        this.singlePlanetContainer.add(rings);
      }

      if (!this.isXRayActive) {
        // STATE 1: FULL 360° PLANET GLOBE
        const surfMat = PlanetMaterials.createPlanetSurfaceMaterial(this.currentPlanetKey);
        const globeMesh = new THREE.Mesh(new THREE.SphereGeometry(R_VISUAL, 64, 64), surfMat);
        this.singlePlanetContainer.add(globeMesh);

        // Atmosphere glow
        const glowColor = planetData.category === 'gas_giant' ? 0xf59e0b : (planetData.category === 'ice_giant' ? 0x06b6d4 : 0x38bdf8);
        const atmosMat = PlanetMaterials.createAtmosphereFresnelMaterial(glowColor);
        const atmosMesh = new THREE.Mesh(new THREE.SphereGeometry(R_VISUAL * 1.025, 32, 32), atmosMat);
        this.singlePlanetContainer.add(atmosMesh);

        // Clouds for Earth
        if (this.currentPlanetKey === 'earth') {
          const { cloudMat } = PlanetMaterials.createPhotorealisticEarthMaterials();
          const clouds = new THREE.Mesh(new THREE.SphereGeometry(R_VISUAL * 1.012, 64, 64), cloudMat);
          this.singlePlanetContainer.add(clouds);
        }
      } else {
        // STATE 2: 270° SOLID CONCENTRIC GEOPHYSICAL CUTAWAY
        this._buildConcentricCutaway(this.singlePlanetContainer, model, R_VISUAL, this.currentPlanetKey, true);

        // Seismic Ray Visualizer
        this.seismicGroup = new THREE.Group();
        this.singlePlanetContainer.add(this.seismicGroup);
        this._rebuildSeismicRays();

        // Non-intersecting Depth Probe Laser Cursor
        // Positioned cleanly along the visible cut face at 0° (z=0, x <= 0)
        const cursorGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 16);
        const cursorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        this.probeMarkerMesh = new THREE.Mesh(cursorGeo, cursorMat);
        this.probeMarkerMesh.rotation.z = Math.PI / 2;
        this.singlePlanetContainer.add(this.probeMarkerMesh);
        this._updateHolographicProbePosition();
      }

      // Update max depth slider
      const depthSlider = this.uiRoot.querySelector('#pxDepthSlider');
      if (depthSlider) {
        depthSlider.max = Math.round(model.totalRadiusM / 1000);
      }

      // Default select outermost layer
      this._selectLayer(model.layers[0]);
    }

    /**
     * Builds dual planet comparison scene side-by-side
     */
    _buildComparisonScene() {
      const modelA = PlanetaryGeophysics.getInteriorModel(this.comparePlanetA);
      const modelB = PlanetaryGeophysics.getInteriorModel(this.comparePlanetB);
      const dataA = PlanetData.getPlanet(this.comparePlanetA);
      const dataB = PlanetData.getPlanet(this.comparePlanetB);

      if (!modelA || !modelB || !dataA || !dataB) return;

      let rVisA = 1.85;
      let rVisB = 1.85;

      if (this.compareTrueScale) {
        // Scale relative to Earth
        const earthRadius = 6371;
        const scaleA = (dataA.meanRadiusM / 1000) / earthRadius;
        const scaleB = (dataB.meanRadiusM / 1000) / earthRadius;
        const maxScale = Math.max(scaleA, scaleB);
        // Normalize so max fits nicely in viewport
        rVisA = Math.max(0.35, (scaleA / maxScale) * 2.3);
        rVisB = Math.max(0.35, (scaleB / maxScale) * 2.3);
      }

      // Left Planet A Group
      this.compareGroupA = new THREE.Group();
      this.compareGroupA.position.set(-2.8, 0, 0);
      if (dataA.axialTiltDeg) this.compareGroupA.rotation.z = (dataA.axialTiltDeg * Math.PI) / 180;
      this.renderer.planetGroup.add(this.compareGroupA);

      if (this.comparePlanetA === 'saturn' || dataA.hasRings) {
        this.compareGroupA.add(PlanetMaterials.createSaturnRings(rVisA * 1.35, rVisA * 2.35));
      }

      if (this.compareXRayA) {
        this._buildConcentricCutaway(this.compareGroupA, modelA, rVisA, this.comparePlanetA, false);
      } else {
        const matA = PlanetMaterials.createPlanetSurfaceMaterial(this.comparePlanetA);
        this.compareGroupA.add(new THREE.Mesh(new THREE.SphereGeometry(rVisA, 48, 48), matA));
      }

      // Right Planet B Group
      this.compareGroupB = new THREE.Group();
      this.compareGroupB.position.set(2.8, 0, 0);
      if (dataB.axialTiltDeg) this.compareGroupB.rotation.z = (dataB.axialTiltDeg * Math.PI) / 180;
      this.renderer.planetGroup.add(this.compareGroupB);

      if (this.comparePlanetB === 'saturn' || dataB.hasRings) {
        this.compareGroupB.add(PlanetMaterials.createSaturnRings(rVisB * 1.35, rVisB * 2.35));
      }

      if (this.compareXRayB) {
        this._buildConcentricCutaway(this.compareGroupB, modelB, rVisB, this.comparePlanetB, false);
      } else {
        const matB = PlanetMaterials.createPlanetSurfaceMaterial(this.comparePlanetB);
        this.compareGroupB.add(new THREE.Mesh(new THREE.SphereGeometry(rVisB, 48, 48), matB));
      }
    }

    /**
     * Builds concentric 270° cutaway with mathematically precise cut face alignment
     */
    _buildConcentricCutaway(parentGroup, model, visualRadius, planetKey, isInteractive) {
      const PHI_LENGTH = Math.PI * 1.5; // Exactly 270° cutaway
      const totalLayers = model.layers.length;

      // Calculate radial boundaries for each layer based on real physical proportion
      const boundaries = [];
      for (let i = 0; i < totalLayers; i++) {
        const layer = model.layers[i];
        const rOuter = (layer.radiusOuterM / model.totalRadiusM) * visualRadius;
        const rInner = (layer.radiusInnerM / model.totalRadiusM) * visualRadius;
        boundaries.push({
          layer: layer,
          index: i,
          rOuter: Math.max(0.05, rOuter),
          rInner: Math.max(0, rInner)
        });
      }

      boundaries.forEach((b) => {
        const layerData = b.layer;
        const meshList = [];

        // Select material
        let mat;
        if (b.index === 0) {
          // Outermost shell uses authentic planetary surface texture
          mat = PlanetMaterials.createPlanetSurfaceMaterial(planetKey);
        } else {
          mat = PlanetMaterials.createGeophysicalLayerMaterial(layerData);
        }

        // A. Curved 270° Spherical Shell
        const shellGeo = new THREE.SphereGeometry(b.rOuter, 48, 48, 0, PHI_LENGTH);
        const shellMesh = new THREE.Mesh(shellGeo, mat);
        shellMesh.userData = layerData;
        parentGroup.add(shellMesh);
        meshList.push(shellMesh);

        // B. Precision-aligned Solid Face Caps
        // Cut Face 1: Plane z = 0, where x <= 0.
        // RingGeometry thetaStart = PI/2, thetaLength = PI covers x <= 0
        if (b.rInner > 0.02) {
          // Semi-annular ring cap for spherical shells
          const ringGeo1 = new THREE.RingGeometry(b.rInner, b.rOuter, 32, 1, Math.PI * 0.5, Math.PI);
          const cap1 = new THREE.Mesh(ringGeo1, mat);
          cap1.rotation.y = 0; // XY plane (z = 0)
          cap1.userData = layerData;
          parentGroup.add(cap1);
          meshList.push(cap1);

          // Cut Face 2: Plane x = 0, where z <= 0.
          // Rotated by -PI/2 around Y axis
          const ringGeo2 = new THREE.RingGeometry(b.rInner, b.rOuter, 32, 1, Math.PI * 0.5, Math.PI);
          const cap2 = new THREE.Mesh(ringGeo2, mat);
          cap2.rotation.y = -Math.PI * 0.5;
          cap2.userData = layerData;
          parentGroup.add(cap2);
          meshList.push(cap2);
        } else {
          // Central Solid Core (Circle disc cap)
          const discGeo1 = new THREE.CircleGeometry(b.rOuter, 32, Math.PI * 0.5, Math.PI);
          const cap1 = new THREE.Mesh(discGeo1, mat);
          cap1.rotation.y = 0;
          cap1.userData = layerData;
          parentGroup.add(cap1);
          meshList.push(cap1);

          const discGeo2 = new THREE.CircleGeometry(b.rOuter, 32, Math.PI * 0.5, Math.PI);
          const cap2 = new THREE.Mesh(discGeo2, mat);
          cap2.rotation.y = -Math.PI * 0.5;
          cap2.userData = layerData;
          parentGroup.add(cap2);
          meshList.push(cap2);
        }

        // C. Sharp Scientific Demarcation Boundary Lines
        const boundaryLineMat = new THREE.LineBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.45
        });

        const arcPoints1 = [];
        const arcPoints2 = [];
        const segs = 32;
        for (let s = 0; s <= segs; s++) {
          const theta = Math.PI * 0.5 + (s / segs) * Math.PI;
          const x = b.rOuter * Math.cos(theta);
          const y = b.rOuter * Math.sin(theta);
          arcPoints1.push(new THREE.Vector3(x, y, 0));
          arcPoints2.push(new THREE.Vector3(0, y, x));
        }

        const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints1), boundaryLineMat);
        const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPoints2), boundaryLineMat);
        parentGroup.add(line1);
        parentGroup.add(line2);

        if (isInteractive) {
          this.layerMeshMap.set(layerData.id, meshList);
        }
      });
    }

    _rebuildSeismicRays() {
      if (!this.seismicGroup) return;

      while (this.seismicGroup.children.length > 0) {
        const child = this.seismicGroup.children[0];
        this.seismicGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      }

      if (!this.showSeismicRays) return;

      const R = 2.0;
      const model = PlanetaryGeophysics.getInteriorModel(this.currentPlanetKey);
      if (!model || model.type !== 'terrestrial') return;

      // Epicenter beacon on surface
      const beaconGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(-R, 0, 0);
      this.seismicGroup.add(beacon);

      const targetAngleRad = (this.seismicAngleDeg * Math.PI) / 180;
      const targetPos = new THREE.Vector3(
        -R * Math.cos(targetAngleRad),
        R * Math.sin(targetAngleRad),
        0
      );

      // Receiver station pin
      const recGeo = new THREE.SphereGeometry(0.035, 16, 16);
      const recMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
      const rec = new THREE.Mesh(recGeo, recMat);
      rec.position.copy(targetPos);
      this.seismicGroup.add(rec);

      const profile = PlanetaryGeophysics.calculateSeismicWaveProfile(this.currentPlanetKey, this.seismicAngleDeg);
      if (!profile) return;

      // Draw P-wave ray path (Cyan)
      const pCurve = new THREE.QuadraticBezierCurve3(
        beacon.position,
        new THREE.Vector3(-0.6 * R, 0.4 * R, 0),
        targetPos
      );
      const pGeo = new THREE.BufferGeometry().setFromPoints(pCurve.getPoints(32));
      const pLine = new THREE.Line(pGeo, new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 }));
      this.seismicGroup.add(pLine);

      // Draw S-wave ray path (Orange), terminated if inside shadow zone
      if (profile.hasDirectS) {
        const sCurve = new THREE.QuadraticBezierCurve3(
          beacon.position,
          new THREE.Vector3(-0.8 * R, 0.3 * R, 0),
          targetPos
        );
        const sGeo = new THREE.BufferGeometry().setFromPoints(sCurve.getPoints(32));
        const sLine = new THREE.Line(sGeo, new THREE.LineBasicMaterial({ color: 0xf97316, linewidth: 2 }));
        this.seismicGroup.add(sLine);
      }
    }

    _selectLayer(layer) {
      if (!layer) return;
      this.selectedLayerId = layer.id;

      this.uiRoot.querySelector('#pxLayerName').textContent = layer.name;
      this.uiRoot.querySelector('#pxLayerStateBadge').textContent = layer.state.toUpperCase();
      this.uiRoot.querySelector('#pxLayerStateBadge').style.borderColor = layer.colorHex || '#38bdf8';
      this.uiRoot.querySelector('#pxLayerDescText').innerHTML = `
        ${layer.composition}<br/>
        <em style="color:#fbbf24">${layer.uncertainty}</em>
      `;
      this.uiRoot.querySelector('#pxLayerDepthRange').textContent = `${(layer.depthStartM / 1000).toFixed(0)} - ${(layer.depthEndM / 1000).toFixed(0)} км`;
      this.uiRoot.querySelector('#pxLayerDensity').textContent = `${layer.densityAvgKgM3.toLocaleString()} кг/м³`;
      this.uiRoot.querySelector('#pxLayerPWave').textContent = `${(layer.pWaveSpeedM_S / 1000).toFixed(1)} км/с`;
      this.uiRoot.querySelector('#pxLayerSWave').textContent = layer.sWaveSpeedM_S === 0 
        ? '0 км/с (Шингэнд үл тарна)' 
        : `${(layer.sWaveSpeedM_S / 1000).toFixed(1)} км/с`;

      // Highlight selected layer in 3D
      this.layerMeshMap.forEach((meshList, id) => {
        const isSelected = id === layer.id;
        meshList.forEach(m => {
          if (m.material.emissive) {
            m.material.emissiveIntensity = isSelected ? 0.7 : 0.2;
          }
        });
      });
    }

    _updateDepthProbeUI() {
      const depthM = this.inspectDepthKm * 1000;
      const pressurePa = PlanetaryGeophysics.calculateHydrostaticPressurePa(this.currentPlanetKey, depthM);
      const tempK = PlanetaryGeophysics.calculateTemperatureK(this.currentPlanetKey, depthM);
      const layer = PlanetaryGeophysics.getLayerAtDepth(this.currentPlanetKey, depthM);

      this.uiRoot.querySelector('#pxDepthReadout').textContent = `${this.inspectDepthKm.toLocaleString()} км`;
      
      const pressureGPa = pressurePa / 1e9;
      this.uiRoot.querySelector('#pxPressureReadout').textContent = pressureGPa >= 1 
        ? `${pressureGPa.toFixed(2)} ГПа (${(pressurePa / 101325).toLocaleString('en-US', {maximumFractionDigits:0})} атм)` 
        : `${(pressurePa / 1e6).toFixed(1)} МПа`;

      const tempC = tempK - 273.15;
      this.uiRoot.querySelector('#pxTempReadout').textContent = `${Math.round(tempC).toLocaleString()} °C (${Math.round(tempK).toLocaleString()} K)`;

      if (layer && layer.id !== this.selectedLayerId) {
        this._selectLayer(layer);
      }
    }

    _updateHolographicProbePosition() {
      if (!this.probeMarkerMesh) return;
      const model = PlanetaryGeophysics.getInteriorModel(this.currentPlanetKey);
      if (!model) return;

      const rFraction = Math.max(0, 1.0 - (this.inspectDepthKm / (model.totalRadiusM / 1000)));
      const xPos = -rFraction * 2.0;
      this.probeMarkerMesh.position.set(xPos, 0, 0);
    }

    _updateSeismicFeedback() {
      const profile = PlanetaryGeophysics.calculateSeismicWaveProfile(this.currentPlanetKey, this.seismicAngleDeg);
      const alertCard = this.uiRoot.querySelector('#pxSeismicAlertCard');
      const headline = this.uiRoot.querySelector('#pxSeismicHeadline');
      const expl = this.uiRoot.querySelector('#pxSeismicExplanation');

      if (!profile || !alertCard) return;

      const isSBlocked = !profile.hasDirectS;
      alertCard.style.borderColor = isSBlocked ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)';
      alertCard.style.background = isSBlocked ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)';

      headline.textContent = isSBlocked ? 'S-Wave Shadow Zone Detected' : 'Direct S-Wave Reachable';
      headline.style.color = isSBlocked ? '#fca5a5' : '#86efac';
      expl.textContent = profile.explanation;
    }

    _updateHUD() {
      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      const model = PlanetaryGeophysics.getInteriorModel(this.currentPlanetKey);
      if (!planet || !model) return;

      this.uiRoot.querySelector('#pxPlanetTitle').textContent = `${planet.name_mn || planet.name} (${planet.name})`;
      this.uiRoot.querySelector('#pxPlanetCategory').textContent = planet.category.replace('_', ' ').toUpperCase();
      this.uiRoot.querySelector('#pxScientificDisclaimer').textContent = `${model.scientificSource} (${model.uncertaintyLevel.toUpperCase()} UNCERTAINTY)`;

      // Hide seismic raycaster on gas giants (no surface seismic sources)
      const seismicSec = this.uiRoot.querySelector('#pxSeismicSection');
      if (seismicSec) {
        seismicSec.style.display = model.type === 'terrestrial' ? 'flex' : 'none';
      }

      this._updateDepthProbeUI();
      this._updateSeismicFeedback();
    }

    /**
     * Updates Comparison HUD table, bars, and interactive challenge
     */
    _updateComparisonHUD() {
      const compData = PlanetaryGeophysics.generatePlanetComparisonData(this.comparePlanetA, this.comparePlanetB);
      if (!compData) return;

      const pA = compData.planetA.data;
      const pB = compData.planetB.data;
      const mA = compData.planetA.model;
      const mB = compData.planetB.model;

      this.uiRoot.querySelector('#pxCompColA').textContent = pA.name_mn || pA.name;
      this.uiRoot.querySelector('#pxCompColB').textContent = pB.name_mn || pB.name;

      const tbody = this.uiRoot.querySelector('#pxCompareTableBody');
      tbody.innerHTML = `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Радиус</td>
          <td style="padding:6px 10px">${compData.planetA.radiusKm.toLocaleString()} км</td>
          <td style="padding:6px 10px">${compData.planetB.radiusKm.toLocaleString()} км (${compData.ratios.radiusBToA.toFixed(2)}×)</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Масс</td>
          <td style="padding:6px 10px">${compData.planetA.massKg.toExponential(2)} кг</td>
          <td style="padding:6px 10px">${compData.planetB.massKg.toExponential(2)} кг (${compData.ratios.massBToA.toFixed(2)}×)</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Гадаргын татах хүч</td>
          <td style="padding:6px 10px">${compData.planetA.surfaceGravity.toFixed(2)} м/с²</td>
          <td style="padding:6px 10px">${compData.planetB.surfaceGravity.toFixed(2)} м/с² (${compData.ratios.gravityBToA.toFixed(2)}×)</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Дундаж нягт</td>
          <td style="padding:6px 10px">${compData.planetA.densityKgM3.toLocaleString()} кг/м³</td>
          <td style="padding:6px 10px">${compData.planetB.densityKgM3.toLocaleString()} кг/м³</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Дотоод үе давхарга</td>
          <td style="padding:6px 10px">${mA.layers.length} үе</td>
          <td style="padding:6px 10px">${mB.layers.length} үе</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
          <td style="padding:6px 10px;color:#94a3b8">Цөмийн төлөв</td>
          <td style="padding:6px 10px">${mA.layers[mA.layers.length - 1].state}</td>
          <td style="padding:6px 10px">${mB.layers[mB.layers.length - 1].state}</td>
        </tr>
        <tr>
          <td style="padding:6px 10px;color:#94a3b8">Соронзон орон</td>
          <td style="padding:6px 10px">${pA.magneticFieldTesla ? (pA.magneticFieldTesla * 10000).toFixed(2) + ' G' : 'Байхгүй'}</td>
          <td style="padding:6px 10px">${pB.magneticFieldTesla ? (pB.magneticFieldTesla * 10000).toFixed(2) + ' G' : 'Байхгүй'}</td>
        </tr>
      `;

      // Update comparison core bars
      this.uiRoot.querySelector('#pxCompBarLabelA').textContent = `${pA.name_mn || pA.name} (${compData.planetA.coreRadiusKm.toLocaleString()} км):`;
      this.uiRoot.querySelector('#pxCompBarValA').textContent = `${compData.planetA.coreRatioPercent}%`;
      this.uiRoot.querySelector('#pxCompBarFillA').style.width = `${compData.planetA.coreRatioPercent}%`;

      this.uiRoot.querySelector('#pxCompBarLabelB').textContent = `${pB.name_mn || pB.name} (${compData.planetB.coreRadiusKm.toLocaleString()} км):`;
      this.uiRoot.querySelector('#pxCompBarValB').textContent = `${compData.planetB.coreRatioPercent}%`;
      this.uiRoot.querySelector('#pxCompBarFillB').style.width = `${compData.planetB.coreRatioPercent}%`;

      // Interactive Challenge Quiz
      const qBox = this.uiRoot.querySelector('#pxChallengeQuestion');
      const optBox = this.uiRoot.querySelector('#pxChallengeOptions');
      const feedBox = this.uiRoot.querySelector('#pxChallengeFeedback');

      const isADenser = compData.planetA.densityKgM3 >= compData.planetB.densityKgM3;
      qBox.textContent = `Асуулт: ${pA.name_mn} ба ${pB.name_mn} хоёрын аль нь илүү өндөр дундаж нягттай вэ?`;
      optBox.innerHTML = `
        <button type="button" class="px-quiz-opt" data-choice="A" style="flex:1;padding:6px;border-radius:6px;border:1px solid #38bdf8;background:rgba(56,189,248,0.15);color:#38bdf8;font-size:11px;font-weight:700;cursor:pointer">${pA.name_mn}</button>
        <button type="button" class="px-quiz-opt" data-choice="B" style="flex:1;padding:6px;border-radius:6px;border:1px solid #f59e0b;background:rgba(245,158,11,0.15);color:#f59e0b;font-size:11px;font-weight:700;cursor:pointer">${pB.name_mn}</button>
      `;

      optBox.querySelectorAll('.px-quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const choice = btn.dataset.choice;
          const isCorrect = (choice === 'A' && isADenser) || (choice === 'B' && !isADenser);
          feedBox.style.display = 'block';
          feedBox.style.color = isCorrect ? '#4ade80' : '#f87171';
          const denserName = isADenser ? pA.name_mn : pB.name_mn;
          const denserVal = Math.max(compData.planetA.densityKgM3, compData.planetB.densityKgM3);
          feedBox.innerHTML = isCorrect 
            ? `✅ <strong>Зөв!</strong> ${denserName} нь ${denserVal.toLocaleString()} кг/м³ нягттай бөгөөд хүнд металл, чулуулгийн өндөр агууламжтай.`
            : `❌ <strong>Буруу.</strong> ${denserName} нь ${denserVal.toLocaleString()} кг/м³ нягттай тул илүү их нягттай.`;
        });
      });
    }

    async update(parameters = {}) {
      if (parameters.planet && parameters.planet !== this.currentPlanetKey) {
        this.currentPlanetKey = parameters.planet;
        this.inspectDepthKm = 0;
        this._rebuild3DScene();
        this._updateHUD();
      }
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
      return {
        id: this.id,
        currentPlanetKey: this.currentPlanetKey,
        isXRayActive: this.isXRayActive,
        inspectDepthKm: this.inspectDepthKm,
        viewMode: this.viewMode,
        comparePlanetA: this.comparePlanetA,
        comparePlanetB: this.comparePlanetB
      };
    }

    async unmount() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
      this.layerMeshMap.clear();
      this.singlePlanetContainer = null;
      this.compareGroupA = null;
      this.compareGroupB = null;
      this.probeMarkerMesh = null;
      this.seismicGroup = null;

      if (this.uiRoot && this.uiRoot.parentNode) {
        this.uiRoot.parentNode.removeChild(this.uiRoot);
      }
      this.uiRoot = null;
      await super.unmount();
    }
  }

  return PlanetXRayModule;
}));
