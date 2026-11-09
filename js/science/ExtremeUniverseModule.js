/**
 * SCIENCE UNIVERSE — EXTREME UNIVERSE MODULE
 * Module: ExtremeUniverseModule.js
 * 
 * Interactive Planetary Physics Sandbox:
 * - Real-time manipulation of Mass, Radius, Rotation Period, and Solar Radiation.
 * - Rigorous Newtonian and orbital calculations (g, v_esc, rho, a_c, H, flattening).
 * - Real-time 3D visual response (mesh deformation for oblateness, radius scaling, sunlight removal).
 * - Full Before-and-After scientific comparison table.
 * - Reset mechanism restoring grounded NASA baseline planetary values.
 * - Full compliance with Freebuff Module Lifecycle contract.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      './ScienceModuleAdapter',
      './PlanetData',
      './physics/OrbitalAtmosphericPhysics',
      './rendering/PlanetRenderer',
      './rendering/PlanetMaterials'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./ScienceModuleAdapter'),
      require('./PlanetData'),
      require('./physics/OrbitalAtmosphericPhysics'),
      require('./rendering/PlanetRenderer'),
      require('./rendering/PlanetMaterials')
    );
  } else {
    root.ExtremeUniverseModule = factory(
      root.ScienceModuleAdapter,
      root.PlanetData,
      root.OrbitalAtmosphericPhysics,
      root.PlanetRenderer,
      root.PlanetMaterials
    );
  }
}(typeof self !== 'undefined' ? self : this, function (
  ScienceModuleAdapter,
  PlanetData,
  OrbitalAtmosphericPhysics,
  PlanetRenderer,
  PlanetMaterials
) {
  'use strict';

  class ExtremeUniverseModule extends ScienceModuleAdapter {
    constructor() {
      super('extreme_universe');

      this.currentPlanetKey = 'earth';
      this.massMultiplier = 1.0;
      this.radiusMultiplier = 1.0;
      this.rotationMultiplier = 1.0;
      this.sunlightRemoved = false;

      this.renderer = null;
      this.planetMesh = null;
      this.atmosphereGlowMesh = null;
      this.uiRoot = null;
    }

    async mount(container, context = {}) {
      await super.mount(container, context);
      this.currentPlanetKey = context.planet || 'earth';

      this._buildDOM();

      const canvasWrap = this.uiRoot.querySelector('.eu-canvas-wrap');
      this.renderer = new PlanetRenderer({
        container: canvasWrap,
        cameraDistance: 7.2
      });
      this.renderer.init();

      this._rebuild3DScene();
      this._updateCalculationsAndUI();
    }

    _buildDOM() {
      this.uiRoot = document.createElement('div');
      this.uiRoot.className = 'eu-module-root';
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

      const planetKeys = PlanetData.getPlanetKeys();
      const planetButtonsHtml = planetKeys.map(k => {
        const p = PlanetData.getPlanet(k);
        const isSelected = k === this.currentPlanetKey;
        return `
          <button type="button" class="eu-planet-btn" data-planet="${k}" style="
            padding: 5px 12px;
            border-radius: 16px;
            border: 1px solid ${isSelected ? '#38bdf8' : 'rgba(255,255,255,0.18)'};
            background: ${isSelected ? '#0284c7' : 'rgba(255,255,255,0.06)'};
            color: #fff;
            font-size: 11px;
            font-weight: 600;
            cursor: pointer;
          ">${p.name_mn || p.name}</button>
        `;
      }).join('');

      this.uiRoot.innerHTML = `
        <!-- Top Controls Bar -->
        <div style="padding:10px 16px;background:rgba(15,23,42,0.88);backdrop-filter:blur(8px);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:10;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">🪐</span>
            <div>
              <strong style="font-size:14px;letter-spacing:0.04em">EXTREME UNIVERSE · ФИЗИКИЙН САНДБОКС</strong>
              <div style="font-size:11px;color:#94a3b8">Гравитаци, масс, радиус, эргэлтийн хэт туршилтууд</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            ${planetButtonsHtml}
          </div>
        </div>

        <!-- Viewport + Controls Layout -->
        <div style="position:relative;flex:1;display:flex;overflow:hidden">
          <div class="eu-canvas-wrap" style="position:relative;flex:1;height:100%;cursor:grab"></div>

          <!-- Sandbox Controls & Telemetry -->
          <div class="eu-hud-panel" style="width:min(100%,380px);background:rgba(10,14,35,0.94);backdrop-filter:blur(14px);border-left:1px solid rgba(255,255,255,0.12);display:flex;flex-direction:column;overflow-y:auto;padding:16px;gap:14px;z-index:5">
            <!-- Header & Reset -->
            <div style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <span id="euPlanetCategory" style="font-size:10px;text-transform:uppercase;color:#38bdf8;font-weight:700">TERRESTRIAL</span>
                <h2 id="euPlanetTitle" style="font-size:18px;margin:2px 0;color:#fff">Дэлхий (Earth)</h2>
              </div>
              <button type="button" id="euResetBtn" style="padding:6px 12px;border-radius:8px;border:1px solid #f87171;background:rgba(239,68,68,0.15);color:#fca5a5;font-size:11px;font-weight:600;cursor:pointer">
                ↺ Анхны төлөв
              </button>
            </div>

            <!-- Parameters Sliders -->
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:12px">
              <!-- Mass Multiplier -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Массын үржигдэхүүн (Mass):</span>
                  <strong id="euMassVal" style="color:#38bdf8">1.00 ×</strong>
                </div>
                <input type="range" id="euMassSlider" min="0.1" max="10.0" step="0.05" value="1.0" style="width:100%;accent-color:#38bdf8">
              </div>

              <!-- Radius Multiplier -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Радиусын үржигдэхүүн (Radius):</span>
                  <strong id="euRadiusVal" style="color:#a855f7">1.00 ×</strong>
                </div>
                <input type="range" id="euRadiusSlider" min="0.3" max="3.0" step="0.05" value="1.0" style="width:100%;accent-color:#a855f7">
              </div>

              <!-- Rotation Period Multiplier -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
                  <span style="color:#cbd5e1">Эргэлтийн хугацаа (Rotation):</span>
                  <strong id="euRotVal" style="color:#f59e0b">1.00 ×</strong>
                </div>
                <input type="range" id="euRotSlider" min="0.05" max="3.0" step="0.05" value="1.0" style="width:100%;accent-color:#f59e0b">
              </div>

              <!-- Sunlight Removal Toggle -->
              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:4px;border-top:1px solid rgba(255,255,255,0.06)">
                <span style="font-size:11px;color:#cbd5e1">Нарны гэрлийг унтраах (No Sunlight):</span>
                <input type="checkbox" id="euSunToggle" style="accent-color:#f59e0b;width:16px;height:16px;cursor:pointer">
              </div>
            </div>

            <!-- Real-time Physical Telemetry Grid -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Гадаргын гравитаци (g)</div>
                <div id="euGravityVal" style="font-size:15px;font-weight:700;color:#38bdf8">9.81 м/с²</div>
                <div id="euGravityRatio" style="font-size:10px;color:#cbd5e1">1.00 g (Дэлхийтэй адил)</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">2-р сансрын хурд (v_esc)</div>
                <div id="euEscapeVal" style="font-size:15px;font-weight:700;color:#34d399">11.19 км/с</div>
                <div id="euEscapeRatio" style="font-size:10px;color:#cbd5e1">Таталцлаас гарах хурд</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Дундаж нягт (Density)</div>
                <div id="euDensityVal" style="font-size:15px;font-weight:700;color:#f59e0b">5514 кг/м³</div>
                <div id="euDensityDesc" style="font-size:10px;color:#cbd5e1">Чулуун гариг</div>
              </div>

              <div style="background:rgba(0,0,0,0.3);padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:#94a3b8">Хүний үсрэх өндөр</div>
                <div id="euJumpVal" style="font-size:15px;font-weight:700;color:#f472b6">0.50 м</div>
                <div style="font-size:10px;color:#cbd5e1">Дэлхий дээрх 0.5м үсрэлт</div>
              </div>
            </div>

            <!-- Centrifugal & Flattening Warning -->
            <div id="euCentrifugalAlert" style="padding:10px;border-radius:8px;font-size:11px;line-height:1.4"></div>

            <!-- Before & After Comparison Table -->
            <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px">
              <div style="font-size:11px;font-weight:700;color:#cbd5e1;margin-bottom:8px">Харьцуулсан хүснэгт (Before vs After)</div>
              <table style="width:100%;font-size:10px;border-collapse:collapse;color:#94a3b8" id="euCompareTable">
                <thead>
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.1);text-align:left;color:#e2e8f0">
                    <th style="padding:4px">Хэмжигдэхүүн</th>
                    <th style="padding:4px">Анхны</th>
                    <th style="padding:4px">Өөрчлөгдсөн</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>

            <!-- Reference Datum Disclaimer for Gas Giants -->
            <div id="euGasGiantDisclaimer" style="font-size:10px;color:#94a3b8;line-height:1.4;padding:8px;background:rgba(56,189,248,0.06);border-radius:6px;border-left:3px solid #0284c7;display:none">
              <strong>Мэдэгдэл:</strong> Хийн болон мөсөн аварга гаригуудад хатуу гадарга байхгүй тул бүх утгыг 1-бар (100 кПа) атмосферийн лавлах түвшинд тооцсон болно.
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(this.uiRoot);
      this._bindEvents();
    }

    _bindEvents() {
      // Planet switch buttons
      const planetBtns = this.uiRoot.querySelectorAll('.eu-planet-btn');
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

      // Mass slider
      const massSlider = this.uiRoot.querySelector('#euMassSlider');
      massSlider.addEventListener('input', (e) => {
        this.massMultiplier = parseFloat(e.target.value);
        this.uiRoot.querySelector('#euMassVal').textContent = `${this.massMultiplier.toFixed(2)} ×`;
        this._updateCalculationsAndUI();
      });

      // Radius slider
      const radiusSlider = this.uiRoot.querySelector('#euRadiusSlider');
      radiusSlider.addEventListener('input', (e) => {
        this.radiusMultiplier = parseFloat(e.target.value);
        this.uiRoot.querySelector('#euRadiusVal').textContent = `${this.radiusMultiplier.toFixed(2)} ×`;
        this._update3DMeshScale();
        this._updateCalculationsAndUI();
      });

      // Rotation slider
      const rotSlider = this.uiRoot.querySelector('#euRotSlider');
      rotSlider.addEventListener('input', (e) => {
        this.rotationMultiplier = parseFloat(e.target.value);
        this.uiRoot.querySelector('#euRotVal').textContent = `${this.rotationMultiplier.toFixed(2)} ×`;
        this._update3DMeshFlattening();
        this._updateCalculationsAndUI();
      });

      // Sunlight toggle
      const sunToggle = this.uiRoot.querySelector('#euSunToggle');
      sunToggle.addEventListener('change', (e) => {
        this.sunlightRemoved = e.target.checked;
        this._updateSunlightState();
      });

      // Reset button
      const resetBtn = this.uiRoot.querySelector('#euResetBtn');
      resetBtn.addEventListener('click', () => {
        this.massMultiplier = 1.0;
        this.radiusMultiplier = 1.0;
        this.rotationMultiplier = 1.0;
        this.sunlightRemoved = false;

        this.uiRoot.querySelector('#euMassSlider').value = '1.0';
        this.uiRoot.querySelector('#euRadiusSlider').value = '1.0';
        this.uiRoot.querySelector('#euRotSlider').value = '1.0';
        this.uiRoot.querySelector('#euSunToggle').checked = false;

        this.uiRoot.querySelector('#euMassVal').textContent = '1.00 ×';
        this.uiRoot.querySelector('#euRadiusVal').textContent = '1.00 ×';
        this.uiRoot.querySelector('#euRotVal').textContent = '1.00 ×';

        this._update3DMeshScale();
        this._update3DMeshFlattening();
        this._updateSunlightState();
        this._updateCalculationsAndUI();
      });
    }

    _rebuild3DScene() {
      if (!this.renderer || !this.renderer.planetGroup) return;
      this.renderer.clearPlanetGroup();

      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      if (!planet) return;

      const baseRadius = 2.0;
      const texture = PlanetMaterials.getPlanetTexture(this.currentPlanetKey);

      const geo = new THREE.SphereGeometry(baseRadius, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: planet.hasSolidSurface ? 0.7 : 0.4,
        metalness: 0.05
      });
      this.planetMesh = new THREE.Mesh(geo, mat);
      this.renderer.planetGroup.add(this.planetMesh);

      // Atmospheric limb glow
      const glowMat = PlanetMaterials.createAtmosphereGlowMaterial(
        planet.category === 'gas_giant' ? 0xf59e0b : (planet.category === 'ice_giant' ? 0x06b6d4 : 0x38bdf8)
      );
      this.atmosphereGlowMesh = new THREE.Mesh(new THREE.SphereGeometry(baseRadius * 1.03, 32, 32), glowMat);
      this.renderer.planetGroup.add(this.atmosphereGlowMesh);

      this._update3DMeshScale();
      this._update3DMeshFlattening();
      this._updateSunlightState();
    }

    _update3DMeshScale() {
      if (!this.planetMesh) return;
      const s = Math.min(2.5, Math.max(0.4, this.radiusMultiplier));
      this.planetMesh.scale.set(s, s, s);
      if (this.atmosphereGlowMesh) {
        this.atmosphereGlowMesh.scale.set(s * 1.03, s * 1.03, s * 1.03);
      }
    }

    _update3DMeshFlattening() {
      if (!this.planetMesh) return;
      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      if (!planet) return;

      const state = OrbitalAtmosphericPhysics.computeModifiedPlanetState(
        planet,
        this.massMultiplier,
        this.radiusMultiplier,
        this.rotationMultiplier
      );

      // Flatten pole-to-pole axis (Y axis) if spinning rapidly
      const flatRatio = Math.min(0.45, state.computed.flatteningRatio);
      const s = this.radiusMultiplier;
      const yAxisScale = s * (1.0 - flatRatio);
      const eqScale = s * (1.0 + flatRatio * 0.5);

      this.planetMesh.scale.set(eqScale, yAxisScale, eqScale);
    }

    _updateSunlightState() {
      if (!this.renderer || !this.renderer.scene) return;
      // Dim or darken sunlight
      this.renderer.scene.traverse((obj) => {
        if (obj.isDirectionalLight) {
          obj.intensity = this.sunlightRemoved ? 0.02 : 1.85;
        }
        if (obj.isAmbientLight) {
          obj.intensity = this.sunlightRemoved ? 0.05 : 0.45;
        }
      });

      if (this.planetMesh && this.planetMesh.material) {
        this.planetMesh.material.roughness = this.sunlightRemoved ? 0.95 : 0.7;
      }
    }

    _updateCalculationsAndUI() {
      const planet = PlanetData.getPlanet(this.currentPlanetKey);
      if (!planet) return;

      const state = OrbitalAtmosphericPhysics.computeModifiedPlanetState(
        planet,
        this.massMultiplier,
        this.radiusMultiplier,
        this.rotationMultiplier
      );

      // Update titles
      this.uiRoot.querySelector('#euPlanetTitle').textContent = `${planet.name_mn || planet.name} (${planet.name})`;
      this.uiRoot.querySelector('#euPlanetCategory').textContent = planet.category.replace('_', ' ').toUpperCase();

      // Show/hide gas giant disclaimer
      const disc = this.uiRoot.querySelector('#euGasGiantDisclaimer');
      if (disc) disc.style.display = planet.hasSolidSurface ? 'none' : 'block';

      // Update telemetry
      const g = state.computed.surfaceGravity;
      const gRatio = state.computed.gravityRatioEarth;
      this.uiRoot.querySelector('#euGravityVal').textContent = `${g.toFixed(2)} м/с²`;
      this.uiRoot.querySelector('#euGravityRatio').textContent = `${gRatio.toFixed(2)} g (${gRatio >= 1 ? '+' : ''}${Math.round((gRatio - 1) * 100)}%)`;

      const v_esc = state.computed.escapeVelocityM_S / 1000;
      this.uiRoot.querySelector('#euEscapeVal').textContent = `${v_esc.toFixed(2)} км/с`;

      const rho = state.computed.meanDensityKgM3;
      this.uiRoot.querySelector('#euDensityVal').textContent = `${Math.round(rho)} кг/м³`;

      const jump = state.computed.humanJumpHeightM;
      this.uiRoot.querySelector('#euJumpVal').textContent = jump > 10 
        ? `${jump.toFixed(1)} м (Маш өндөр!)` 
        : `${jump.toFixed(2)} м`;

      // Centrifugal Alert
      const alertBox = this.uiRoot.querySelector('#euCentrifugalAlert');
      if (state.computed.isRotationalBreakup) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(239,68,68,0.2)';
        alertBox.style.border = '1px solid #ef4444';
        alertBox.style.color = '#fca5a5';
        alertBox.innerHTML = `<strong>⚠️ Ротацийн сүйрэл:</strong> Экваторын төвөөс зугтах хурдатгал (${state.computed.centrifugalAccM_S2.toFixed(1)} м/с²) таталцлаас давсан тул гариг бодисоо сансарт цацаж задарна!`;
      } else if (state.computed.flatteningPercent > 10) {
        alertBox.style.display = 'block';
        alertBox.style.background = 'rgba(245,158,11,0.15)';
        alertBox.style.border = '1px solid #f59e0b';
        alertBox.style.color = '#fde68a';
        alertBox.innerHTML = `<strong>Экваторын хавтгайралт:</strong> Эргэлтийн улмаас гариг ${state.computed.flatteningPercent.toFixed(1)}% хавтгайрч эллипсоид хэлбэртэй болов.`;
      } else {
        alertBox.style.display = 'none';
      }

      // Populate Comparison Table
      const tbody = this.uiRoot.querySelector('#euCompareTable tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:4px">Масс</td>
            <td style="padding:4px">${(planet.massKg).toExponential(3)} кг</td>
            <td style="padding:4px;color:#38bdf8">${(state.computed.massKg).toExponential(3)} кг</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:4px">Радиус</td>
            <td style="padding:4px">${(planet.meanRadiusM / 1000).toFixed(0)} км</td>
            <td style="padding:4px;color:#a855f7">${(state.computed.radiusM / 1000).toFixed(0)} км</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:4px">Гравитаци</td>
            <td style="padding:4px">${planet.surfaceGravity.toFixed(2)} м/с²</td>
            <td style="padding:4px;color:#38bdf8;font-weight:700">${g.toFixed(2)} м/с²</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:4px">2-р сансрын хурд</td>
            <td style="padding:4px">${(planet.escapeVelocityM_S / 1000).toFixed(1)} км/с</td>
            <td style="padding:4px;color:#34d399">${v_esc.toFixed(1)} км/с</td>
          </tr>
          <tr>
            <td style="padding:4px">Эргэлтийн үе</td>
            <td style="padding:4px">${(planet.rotationPeriodS / 3600).toFixed(1)} цаг</td>
            <td style="padding:4px;color:#f59e0b">${(state.computed.rotationPeriodS / 3600).toFixed(1)} цаг</td>
          </tr>
        `;
      }
    }

    async update(parameters = {}) {
      if (parameters.planet && parameters.planet !== this.currentPlanetKey) {
        this.currentPlanetKey = parameters.planet;
        this._rebuild3DScene();
        this._updateCalculationsAndUI();
      }
      if (parameters.massMultiplier !== undefined) {
        this.massMultiplier = parameters.massMultiplier;
      }
      if (parameters.radiusMultiplier !== undefined) {
        this.radiusMultiplier = parameters.radiusMultiplier;
      }
      this._updateCalculationsAndUI();
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
      const computed = planet 
        ? OrbitalAtmosphericPhysics.computeModifiedPlanetState(planet, this.massMultiplier, this.radiusMultiplier, this.rotationMultiplier)
        : null;

      return {
        ...super.getState(),
        activePlanet: this.currentPlanetKey,
        massMultiplier: this.massMultiplier,
        radiusMultiplier: this.radiusMultiplier,
        rotationMultiplier: this.rotationMultiplier,
        sunlightRemoved: this.sunlightRemoved,
        computed: computed ? computed.computed : null
      };
    }

    async unmount() {
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
      this.planetMesh = null;
      this.atmosphereGlowMesh = null;
      this.uiRoot = null;
      await super.unmount();
    }
  }

  return ExtremeUniverseModule;
}));
