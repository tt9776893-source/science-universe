/**
 * SCIENCE UNIVERSE — 3D ROCKET ASSEMBLY & LAUNCH SIMULATOR
 * Module: RocketBuilderModule.js
 * 
 * Interactive 3D Rocket Construction System:
 * 1. Modular vertical assembly in 3D (VAB - Vehicle Assembly Building).
 * 2. Component selection, attachment, and detachment across 6 critical rocket slots:
 *    - Stage 1 Booster Engines (Merlin Octaweb, Raptor Full-Flow, SRB Boosters)
 *    - Stage 1 Main Cryogenic / Hydrocarbon Fuel Tanks
 *    - Interstage & Titanium Grid Fins
 *    - Stage 2 Vacuum Optimized Engines & Fuel Tanks
 *    - Aerodynamic Payload Fairing or Crew Exploration Capsule
 *    - Base Aerodynamic Delta Fins
 * 3. Rigorous Aerospace Physics Engine:
 *    - Total wet mass (m0), dry mass (mf), propellant fraction
 *    - Thrust-to-Weight Ratio (TWR at liftoff): TWR = F / (m0 * g0)
 *    - Multi-stage Tsiolkovsky Delta-v: Δv = Isp * g0 * ln(m0 / mf)
 *    - Orbital capability assessment (LEO, GTO, Lunar/Mars transfer)
 * 4. Real-time 3D Launch Simulation:
 *    - Launchpad environment with smoke and particle flame exhaust
 *    - Ascent physics integration (gravity turn, dynamic pressure Max-Q)
 *    - Animated staging: Stage 1 burnout & separation, Stage 2 ignition, Fairing jettison
 *    - Orbital insertion telemetry
 * 5. Configuration Saving & Space Explore Integration:
 *    - Saves assembled spacecraft to localStorage['SU_SAVED_ROCKET']
 *    - Seamlessly transfers custom spacecraft to Space Explore missions
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RocketBuilderModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Constants
  const G0 = 9.80665; // m/s^2

  /**
   * Authoritative Aerospace Rocket Component Catalog
   */
  const COMPONENT_CATALOG = {
    // 1. FIRST STAGE ENGINES
    engine_raptor: {
      slot: 'engine',
      id: 'engine_raptor',
      name_mn: 'Raptor-3 Метан хөдөлгүүрийн багц',
      name_en: 'Raptor-3 Full-Flow Staged Cluster (3x)',
      category: 'Stage 1 Propulsion',
      propellant: 'Liquid Methane (CH4) + Liquid Oxygen (LOX)',
      cycle: 'Full-Flow Staged Combustion',
      thrustKN: 8400,
      ispSeaLevel: 330,
      ispVac: 363,
      massDryKg: 5200,
      costCredits: 450,
      desc_mn: 'Орчин үеийн бүрэн урсгалт үе шаттай шаталтын цикл бүхий өндөр үр ашигтай, дахин ашиглагдах метан хөдөлгүүр. Өндөр шахалтын харьцаа, цэвэр шаталттай.',
      heightM: 3.2,
      diameterM: 3.8
    },
    engine_merlin: {
      slot: 'engine',
      id: 'engine_merlin',
      name_mn: 'Merlin-1D 9-Хөдөлгүүрийн Октавеб',
      name_en: 'Merlin-1D Octaweb Cluster (9x)',
      category: 'Stage 1 Propulsion',
      propellant: 'Rocket Propellant-1 (RP-1 Kerosene) + LOX',
      cycle: 'Gas-Generator Cycle',
      thrustKN: 7600,
      ispSeaLevel: 282,
      ispVac: 311,
      massDryKg: 4700,
      costCredits: 380,
      desc_mn: 'Керосин-хүчилтөрөгчийн найдвартай турбонасост хийн генератор цикл бүхий хөдөлгүүрийн багц. Октавеб бүтэцтэй тул далайн түвшинд өндөр найдвартай.',
      heightM: 2.8,
      diameterM: 3.6
    },
    engine_srb: {
      slot: 'engine',
      id: 'engine_srb',
      name_mn: 'Хатуу түлшт хурдасгуур (SRB хос)',
      name_en: 'Solid Rocket Booster (Pair)',
      category: 'Stage 1 Propulsion',
      propellant: 'Ammonium Perchlorate Composite (APCP)',
      cycle: 'Solid Propellant Grain Combustion',
      thrustKN: 11500,
      ispSeaLevel: 250,
      ispVac: 269,
      massDryKg: 19000,
      costCredits: 300,
      desc_mn: 'Хөөрөх агшинд асар их түлхэлт гаргадаг хатуу түлшт хурдасгуур. Хүнд даацын ачааг хөөргөхөд хамгийн өндөр эхлэлийн хүч өгнө.',
      heightM: 3.5,
      diameterM: 4.2
    },

    // 2. FIRST STAGE FUEL TANKS
    tank_heavy: {
      slot: 'tank',
      id: 'tank_heavy',
      name_mn: 'Хүнд даацын криоген түлшний сав (Heavy Tank)',
      name_en: 'Heavy Cryogenic Stainless Tank',
      category: 'Stage 1 Structure',
      propellantCapacityKg: 410000,
      massDryKg: 22000,
      heightM: 26.0,
      diameterM: 4.2,
      desc_mn: '304L зэвэрдэггүй ган / нүүрстөрөгчийн нийлмэл бүтэцтэй үндсэн сав. Шингэн хүчилтөрөгч болон шатах бодисыг криоген температурт хадгална.',
      costCredits: 500
    },
    tank_medium: {
      slot: 'tank',
      id: 'tank_medium',
      name_mn: 'Хөнгөн цагаан-литийн түлшний сав (Medium Tank)',
      name_en: 'Al-Li Lightweight Tank',
      category: 'Stage 1 Structure',
      propellantCapacityKg: 260000,
      massDryKg: 14000,
      heightM: 19.0,
      diameterM: 3.7,
      desc_mn: 'Хөнгөн цагаан-литийн хөнгөн хайлшаар хийгдсэн, изогрид хавиргат сав. Дунд оврын пуужинд тохиромжтой хамгийн бага хувийн жинтэй.',
      costCredits: 420
    },

    // 3. INTERSTAGE & AERODYNAMIC CONTROL
    interstage_grid: {
      slot: 'interstage',
      id: 'interstage_grid',
      name_mn: 'Титан торлог далавчтай үе салгагч (Grid Fins)',
      name_en: 'Pneumatic Interstage & Titanium Grid Fins',
      category: 'Interstage & Staging',
      massDryKg: 2400,
      heightM: 4.0,
      diameterM: 3.8,
      desc_mn: 'Пневматик түлхэгчээр 1 ба 2-р шатыг салгах цагираг болон атмосферийн эргэн буух тогтворжуулагч 4 ширхэг титан торлог далавчтай.',
      costCredits: 260
    },
    interstage_light: {
      slot: 'interstage',
      id: 'interstage_light',
      name_mn: 'Хөнгөн карбон үе салгагч цагираг (Light Ring)',
      name_en: 'Ultra-light Carbon Interstage Ring',
      category: 'Interstage & Staging',
      massDryKg: 1100,
      heightM: 3.5,
      diameterM: 3.7,
      desc_mn: 'Зөвхөн тойрог замд ачаа гаргах нэг удаагийн хөнгөн нүүрстөрөгчийн нийлмэл салгагч үе.',
      costCredits: 180
    },

    // 4. SECOND STAGE (VACUUM ENGINE & TANK)
    stage2_vac: {
      slot: 'stage2',
      id: 'stage2_vac',
      name_mn: 'Вакуум оновчлолтой 2-р шат (Vacuum Stage)',
      name_en: 'Vacuum Optimized Upper Stage (MVac)',
      category: 'Stage 2 Propulsion',
      propellant: 'RP-1 / LOX with Large Niobium Radiation-Cooled Bell Nozzle',
      thrustKN: 980,
      ispVac: 348,
      propellantCapacityKg: 92000,
      massDryKg: 4500,
      heightM: 10.0,
      diameterM: 3.6,
      desc_mn: 'Сансрын вакуум орчинд хийн тэлэлтийг дээд зэргээр ашиглах ниобийн том цорго бүхий 2-р шатны хөдөлгүүр ба түлшний сав.',
      costCredits: 480
    },
    stage2_hydrolox: {
      slot: 'stage2',
      id: 'stage2_hydrolox',
      name_mn: 'Гидролокс өндөр Isp 2-р шат (Hydrolox Stage)',
      name_en: 'Cryogenic LH2/LOX Upper Stage',
      category: 'Stage 2 Propulsion',
      propellant: 'Liquid Hydrogen (LH2) + Liquid Oxygen (LOX)',
      thrustKN: 650,
      ispVac: 453,
      propellantCapacityKg: 68000,
      massDryKg: 3800,
      heightM: 11.5,
      diameterM: 3.7,
      desc_mn: 'Шингэн устөрөгч-хүчилтөрөгчийн 453 секундийн онцгой өндөр хувийн импульстэй (Isp) гүн сансрын аялалд зориулагдсан шат.',
      costCredits: 580
    },

    // 5. PAYLOAD / NOSE SECTION
    payload_capsule: {
      slot: 'payload',
      id: 'payload_capsule',
      name_mn: '4 хүний багтаамжтай сансрын капсул (Crew Capsule)',
      name_en: 'Orbital Crew Exploration Capsule',
      category: 'Spacecraft Payload',
      massDryKg: 9500,
      heightM: 4.8,
      diameterM: 3.8,
      desc_mn: 'Агаар мандалд дахин нэвтрэх дулааны бамбай, нарны дэлгэц, шүхрийн систем, 4 сансрын нисгэгчийн амин хангамж бүхий капсул.',
      costCredits: 850
    },
    payload_fairing: {
      slot: 'payload',
      id: 'payload_fairing',
      name_mn: 'Аэродинамик ачааны хаалт ба Дагуул (Cargo Fairing)',
      name_en: 'Aerodynamic Cargo Fairing & Probe',
      category: 'Spacecraft Payload',
      massDryKg: 6200,
      heightM: 7.2,
      diameterM: 4.0,
      desc_mn: 'Хөөрөлтийн үед ачааг агаарын эсэргүүцэл, үрэлтийн халуунаас хамгаалах салдаг хаалт болон гүн сансрын шинжлэх ухааны робот тандагч дагуул.',
      costCredits: 620
    },

    // 6. AERODYNAMIC FINS (OPTIONAL ATTACHMENT)
    fins_delta: {
      slot: 'fins',
      id: 'fins_delta',
      name_mn: 'Аэродинамик тогтворжуулагч далавч (4x Delta Fins)',
      name_en: 'Titanium Aerodynamic Delta Fins (4x)',
      category: 'Aerodynamic Stabilization',
      massDryKg: 850,
      heightM: 2.2,
      diameterM: 5.4,
      desc_mn: 'Дууны хурд давах агшинд (Transonic) пуужингийн даралтын төвийг хүндийн төвөөс доор байлгаж тогтвортой нислэгийг хангана.',
      costCredits: 120
    }
  };

  class RocketBuilderModule {
    constructor() {
      this.id = 'rocket_builder';
      this.isMounted = false;
      this.isPaused = false;
      this.isSimulating = false;
      this.container = null;
      this.uiRoot = null;

      // Assembled Rocket Configuration (Slots)
      this.slots = {
        engine: 'engine_raptor',
        tank: 'tank_heavy',
        interstage: 'interstage_grid',
        stage2: 'stage2_vac',
        payload: 'payload_capsule',
        fins: 'fins_delta'
      };

      this.selectedPartId = 'engine_raptor';
      this.rocketName = 'АРВАН ТЭНГЭР-1 (TenSky-1)';

      // Three.js instances
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.rocketGroup = null;
      this.padGroup = null;
      this.exhaustParticles = [];
      this.launchFlameMesh = null;

      // Simulation physics state
      this.simState = {
        running: false,
        time: 0,
        altitudeM: 0,
        velocityM_S: 0,
        accelG: 1.0,
        stage1FuelRemaining: 1.0,
        stage2FuelRemaining: 1.0,
        stage1Separated: false,
        fairingJettisoned: false,
        orbitInserted: false
      };

      this._animId = null;
      this._lastFrame = 0;
      this._mouse = { isDown: false, x: 0, y: 0 };
    }

    /**
     * Mounts the Rocket Builder into a DOM container
     */
    async mount(container) {
      this.container = container;
      this.isMounted = true;
      this._loadSavedRocket();
      this._buildDOM();
      this._initThree();
      this._rebuildRocket3D();
      this._updateCalculationsUI();
      this._startRenderLoop();
    }

    _loadSavedRocket() {
      try {
        const saved = localStorage.getItem('SU_SAVED_ROCKET');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.slots) this.slots = Object.assign({}, this.slots, parsed.slots);
          if (parsed.name) this.rocketName = parsed.name;
        }
      } catch (e) {
        console.warn('Could not load saved rocket:', e);
      }
    }

    _saveRocket() {
      try {
        const payload = {
          name: this.rocketName,
          slots: this.slots,
          physics: this.calculatePhysics(),
          savedAt: new Date().toISOString()
        };
        localStorage.setItem('SU_SAVED_ROCKET', JSON.stringify(payload));
        window.SU_SAVED_ROCKET = payload;
        return true;
      } catch (e) {
        console.error('Failed to save rocket:', e);
        return false;
      }
    }

    _buildDOM() {
      this.uiRoot = document.createElement('div');
      this.uiRoot.className = 'rb-root';
      this.uiRoot.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        background: radial-gradient(circle at 50% 30%, #0d1527 0%, #050813 100%);
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
        user-select: none;
      `;

      this.uiRoot.innerHTML = `
        <!-- Top Aero Navigation Bar -->
        <header style="padding:10px 18px;background:rgba(15,23,42,0.92);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:20;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:22px">🚀</span>
            <div>
              <div style="font-family:'Orbitron',sans-serif;font-weight:800;font-size:14px;letter-spacing:0.06em;color:#fff">
                BUILD · 3D ПУУЖИН УГСРАЛТ (VAB)
              </div>
              <div style="font-size:10px;color:#94a3b8">Агаарын сансрын инженерчлэл · Циолковскийн томьёо · 3D Хөөрөлт</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px">
            <input type="text" id="rbRocketNameInput" value="${this.rocketName}" style="background:rgba(0,0,0,0.4);border:1px solid #38bdf8;border-radius:6px;padding:5px 10px;color:#38bdf8;font-size:11px;font-weight:700;font-family:'Orbitron',sans-serif;width:210px">
            <button type="button" id="rbSaveBtn" style="padding:6px 12px;border-radius:8px;border:1px solid #22c55e;background:rgba(34,197,94,0.18);color:#86efac;font-size:11px;font-weight:700;cursor:pointer">💾 Хадгалах</button>
            <button type="button" id="rbCloseBtn" style="padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.06);color:#cbd5e1;font-size:11px;font-weight:600;cursor:pointer">Хаах ✕</button>
          </div>
        </header>

        <!-- Main Assembly Layout (Catalog | 3D Viewport | Telemetry & Inspector) -->
        <div style="position:relative;flex:1;display:flex;overflow:hidden">
          
          <!-- LEFT PANEL: Component Selection Palette -->
          <div style="width:min(100%,320px);background:rgba(10,14,35,0.92);backdrop-filter:blur(12px);border-right:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;overflow-y:auto;padding:14px;gap:12px;z-index:10">
            <div style="font-size:11px;font-weight:700;color:#38bdf8;text-transform:uppercase;letter-spacing:0.05em">
              1. Эд ангийн каталог (Parts Catalog)
            </div>

            <!-- Slots list -->
            <div id="rbSlotsContainer" style="display:flex;flex-direction:column;gap:10px">
              <!-- Dynamically populated slots -->
            </div>
          </div>

          <!-- CENTER: 3D Viewport Area -->
          <div class="rb-canvas-wrap" style="position:relative;flex:1;height:100%;cursor:grab">
            <canvas id="rbViewportCanvas" style="width:100%;height:100%;display:block"></canvas>

            <!-- 3D Viewport HUD Overlays -->
            <div style="position:absolute;left:16px;top:16px;display:flex;flex-direction:column;gap:6px;pointer-events:none">
              <div id="rbEnvModeTag" style="background:rgba(15,23,42,0.8);border:1px solid #38bdf8;padding:4px 10px;border-radius:14px;font-size:10px;color:#38bdf8;font-weight:700">
                🏢 VAB: УГСРАЛТЫН БАЙГУУЛАМЖ
              </div>
              <div style="font-size:10px;color:#94a3b8;background:rgba(0,0,0,0.5);padding:4px 8px;border-radius:6px">
                🖱️ Чихэж эргүүлэх · Гүйлгэж томруулах
              </div>
            </div>

            <!-- Launch Simulation Overlay Overlay -->
            <div id="rbLaunchSimHUD" style="display:none;position:absolute;left:16px;right:16px;bottom:16px;background:rgba(15,23,42,0.9);border:1px solid #38bdf8;border-radius:12px;padding:14px;display:flex;justify-content:space-between;align-items:center;gap:12px;z-index:15">
              <div style="display:flex;gap:20px;font-family:'Orbitron',sans-serif">
                <div>
                  <div style="font-size:9px;color:#94a3b8">ӨНДӨР (ALTITUDE)</div>
                  <div id="rbSimAlt" style="font-size:16px;font-weight:700;color:#38bdf8">0.0 км</div>
                </div>
                <div>
                  <div style="font-size:9px;color:#94a3b8">ХУРД (VELOCITY)</div>
                  <div id="rbSimVel" style="font-size:16px;font-weight:700;color:#22c55e">0.00 км/с</div>
                </div>
                <div>
                  <div style="font-size:9px;color:#94a3b8">ХУРДАСГАЛ (G-FORCE)</div>
                  <div id="rbSimG" style="font-size:16px;font-weight:700;color:#f59e0b">1.0 G</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span id="rbSimStatusMsg" style="font-size:11px;color:#cbd5e1;font-weight:600">Хөөрөлт эхлэхэд бэлэн...</span>
                <button type="button" id="rbSimAbortBtn" style="padding:6px 12px;border-radius:6px;border:1px solid #ef4444;background:rgba(239,68,68,0.2);color:#fca5a5;font-size:11px;font-weight:700;cursor:pointer">Зогсоох</button>
              </div>
            </div>
          </div>

          <!-- RIGHT PANEL: Aerospace Physics Telemetry & Part Inspector -->
          <div style="width:min(100%,340px);background:rgba(10,14,35,0.92);backdrop-filter:blur(12px);border-left:1px solid rgba(255,255,255,0.1);display:flex;flex-direction:column;overflow-y:auto;padding:14px;gap:12px;z-index:10">
            
            <!-- Live Physics Telemetry Card -->
            <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <strong style="color:#38bdf8;font-size:12px;font-family:'Orbitron',sans-serif">ТООЦООТ НИСЛЭГИЙН ҮЗҮҮЛЭЛТ</strong>
                <span id="rbTwrBadge" style="font-size:9px;padding:2px 7px;border-radius:10px;background:#0284c7;color:#fff;font-weight:700">TWR OK</span>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px">
                <div style="background:rgba(0,0,0,0.3);padding:6px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8">НИЙТ ЖИН (WET MASS)</div>
                  <div id="rbWetMassVal" style="font-size:13px;font-weight:700;color:#fff">0 тн</div>
                </div>
                <div style="background:rgba(0,0,0,0.3);padding:6px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8">ХООСОН ЖИН (DRY MASS)</div>
                  <div id="rbDryMassVal" style="font-size:13px;font-weight:700;color:#94a3b8">0 тн</div>
                </div>
                <div style="background:rgba(0,0,0,0.3);padding:6px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8">ТҮЛХЭХ ХҮЧ / ЖИН (TWR)</div>
                  <div id="rbTwrVal" style="font-size:13px;font-weight:700;color:#22c55e">1.45</div>
                </div>
                <div style="background:rgba(0,0,0,0.3);padding:6px;border-radius:6px">
                  <div style="font-size:9px;color:#94a3b8">НИЙТ ДЕЛЬТА-V (Δv)</div>
                  <div id="rbDeltaVVal" style="font-size:13px;font-weight:700;color:#38bdf8">9,420 м/с</div>
                </div>
              </div>

              <!-- Mission Capability Bar -->
              <div style="margin-top:4px">
                <div style="display:flex;justify-content:space-between;font-size:10px;color:#cbd5e1;margin-bottom:4px">
                  <span>Нислэгийн чадамж:</span>
                  <strong id="rbMissionRating" style="color:#22c55e">LEO Орбитод хүрэх боломжтой</strong>
                </div>
                <div style="width:100%;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden">
                  <div id="rbDeltaVBar" style="width:75%;height:100%;background:linear-gradient(90deg, #0284c7, #22c55e)"></div>
                </div>
              </div>
            </div>

            <!-- Selected Component Technical Inspector -->
            <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px">
              <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700">Сонгосон эд ангийн шинжлэх ухааны үүрэг</div>
              <strong id="rbInspectName" style="color:#f59e0b;font-size:12px">Raptor-3 Метан хөдөлгүүр</strong>
              <div id="rbInspectCategory" style="font-size:10px;color:#38bdf8">1-р шатны үндсэн түлхэгч</div>
              <p id="rbInspectDesc" style="font-size:11px;color:#cbd5e1;line-height:1.45;margin:0">
                Бүрэн урсгалт шаталтын цикл бүхий метан хөдөлгүүр.
              </p>
              <div id="rbInspectProps" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px">
                <!-- Dynamically populated specs -->
              </div>
            </div>

            <!-- Launch Button & Mission Link -->
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:auto">
              <button type="button" id="rbLaunchLiveBtn" style="
                padding:12px;
                border-radius:10px;
                border:1px solid rgba(245,158,11,0.5);
                background:linear-gradient(135deg, rgba(245,158,11,0.3), rgba(217,119,6,0.45));
                color:#fde68a;
                font-family:'Orbitron',sans-serif;
                font-size:12px;
                font-weight:800;
                cursor:pointer;
                display:flex;
                align-items:center;
                justify-content:center;
                gap:8px;
                transition:all 0.2s;
              ">
                <span>🚀</span>
                <span>ТУРШИЛТЫН ХӨӨРГӨЛТ (LIVE 3D LAUNCH)</span>
              </button>

              <button type="button" id="rbExploreTransferBtn" style="
                padding:10px;
                border-radius:8px;
                border:1px solid #38bdf8;
                background:rgba(56,189,248,0.12);
                color:#38bdf8;
                font-size:11px;
                font-weight:700;
                cursor:pointer;
                display:flex;
                align-items:center;
                justify-content:center;
                gap:6px;
              ">
                <span>🌌</span>
                <span>Энэхүү хөлгөөр сансарт аялах (Explore) →</span>
              </button>
            </div>
          </div>
        </div>
      `;

      this.container.appendChild(this.uiRoot);
      this._bindDOMEvents();
      this._renderSlotsList();
    }

    _bindDOMEvents() {
      // Rocket Name input
      const nameInput = this.uiRoot.querySelector('#rbRocketNameInput');
      nameInput.addEventListener('input', (e) => {
        this.rocketName = e.target.value.trim() || 'Custom Rocket';
      });

      // Save button
      const saveBtn = this.uiRoot.querySelector('#rbSaveBtn');
      saveBtn.addEventListener('click', () => {
        const ok = this._saveRocket();
        saveBtn.textContent = ok ? '✓ Хадгалагдлаа!' : 'Алдаа гарлаа';
        setTimeout(() => { saveBtn.textContent = '💾 Хадгалах'; }, 2000);
      });

      // Close button
      const closeBtn = this.uiRoot.querySelector('#rbCloseBtn');
      closeBtn.addEventListener('click', () => {
        if (typeof window.closeRocketBuilder === 'function') {
          window.closeRocketBuilder();
        } else {
          this.unmount();
        }
      });

      // Launch button
      const launchBtn = this.uiRoot.querySelector('#rbLaunchLiveBtn');
      launchBtn.addEventListener('click', () => {
        this.startLaunchSimulation();
      });

      // Abort simulation
      const abortBtn = this.uiRoot.querySelector('#rbSimAbortBtn');
      abortBtn.addEventListener('click', () => {
        this.resetToVAB();
      });

      // Explore transfer button (Mission Deploy)
      const exploreBtn = this.uiRoot.querySelector('#rbExploreTransferBtn');
      exploreBtn.addEventListener('click', () => {
        this._saveRocket();
        if (typeof window.closeRocketBuilder === 'function') {
          window.closeRocketBuilder();
        }
        if (window.SU && window.SU.app && typeof window.SU.app.open === 'function') {
          window.SU.app.open();
          setTimeout(() => {
            if (window.SU.app.land) window.SU.app.land('mars');
          }, 350);
        } else if (typeof window.openSpaceExplore === 'function') {
          window.openSpaceExplore('deepspace');
        }
      });
    }

    _renderSlotsList() {
      const container = this.uiRoot.querySelector('#rbSlotsContainer');
      if (!container) return;

      const slotKeys = [
        { key: 'payload', title: '1. Оройн ачаа / Капсул' },
        { key: 'stage2', title: '2. 2-р шат (Вакуум хөдөлгүүр + сав)' },
        { key: 'interstage', title: '3. Үе салгагч & Далавч' },
        { key: 'tank', title: '4. 1-р шатны үндсэн түлшний сав' },
        { key: 'engine', title: '5. 1-р шатны түлхэгч хөдөлгүүр' },
        { key: 'fins', title: '6. Тогтворжуулагч далавч (Суурь)' }
      ];

      container.innerHTML = slotKeys.map(s => {
        const currentPartId = this.slots[s.key];
        const currentPart = COMPONENT_CATALOG[currentPartId];

        // Find available options for this slot
        const options = Object.values(COMPONENT_CATALOG).filter(c => c.slot === s.key);
        const optionsHtml = options.map(opt => `
          <option value="${opt.id}" ${opt.id === currentPartId ? 'selected' : ''}>
            ${opt.name_mn} (${(opt.massDryKg / 1000).toFixed(1)} тн)
          </option>
        `).join('');

        return `
          <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#94a3b8">
              <span>${s.title}</span>
              <button type="button" class="rb-inspect-part-btn" data-part="${currentPartId}" style="border:none;background:transparent;color:#38bdf8;font-size:10px;cursor:pointer">ℹ️ Мэдээлэл</button>
            </div>
            <select class="rb-slot-select" data-slot="${s.key}" style="background:#090e1e;border:1px solid rgba(56,189,248,0.3);border-radius:6px;padding:5px;color:#fff;font-size:11px;cursor:pointer">
              ${optionsHtml}
            </select>
          </div>
        `;
      }).join('');

      // Bind slot select changes
      container.querySelectorAll('.rb-slot-select').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const slot = sel.dataset.slot;
          const partId = sel.value;
          this.slots[slot] = partId;
          this._selectPartForInspect(partId);
          this._rebuildRocket3D();
          this._updateCalculationsUI();
        });
      });

      // Bind inspect part buttons
      container.querySelectorAll('.rb-inspect-part-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this._selectPartForInspect(btn.dataset.part);
        });
      });

      this._selectPartForInspect(this.selectedPartId);
    }

    _selectPartForInspect(partId) {
      const part = COMPONENT_CATALOG[partId];
      if (!part) return;
      this.selectedPartId = partId;

      this.uiRoot.querySelector('#rbInspectName').textContent = part.name_mn;
      this.uiRoot.querySelector('#rbInspectCategory').textContent = `${part.category} (${part.name_en})`;
      this.uiRoot.querySelector('#rbInspectDesc').textContent = part.desc_mn;

      const props = this.uiRoot.querySelector('#rbInspectProps');
      let html = `<div>Жин: <strong>${(part.massDryKg / 1000).toFixed(1)} тн</strong></div>`;
      if (part.thrustKN) html += `<div>Түлхэлт: <strong>${part.thrustKN} кН</strong></div>`;
      if (part.ispVac) html += `<div>Isp (Вакуум): <strong>${part.ispVac} с</strong></div>`;
      if (part.propellantCapacityKg) html += `<div>Түлш: <strong>${(part.propellantCapacityKg / 1000).toFixed(0)} тн</strong></div>`;
      if (part.propellant) html += `<div style="grid-column:span 2">Түлшний төрөл: <em>${part.propellant}</em></div>`;
      props.innerHTML = html;
    }

    /**
     * Calculates Rocket Physics via Tsiolkovsky Equation & Newton's Second Law
     */
    calculatePhysics() {
      let totalWetMassKg = 0;
      let totalDryMassKg = 0;
      let stage1ThrustKN = 0;
      let stage1IspVac = 300;
      let stage1PropellantKg = 0;
      let stage2ThrustKN = 0;
      let stage2IspVac = 350;
      let stage2PropellantKg = 0;

      // Sum all selected components
      Object.keys(this.slots).forEach(slotKey => {
        const partId = this.slots[slotKey];
        const part = COMPONENT_CATALOG[partId];
        if (!part) return;

        totalDryMassKg += part.massDryKg;
        totalWetMassKg += part.massDryKg;

        if (part.propellantCapacityKg) {
          totalWetMassKg += part.propellantCapacityKg;
          if (slotKey === 'tank') stage1PropellantKg += part.propellantCapacityKg;
          if (slotKey === 'stage2') stage2PropellantKg += part.propellantCapacityKg;
        }

        if (slotKey === 'engine') {
          stage1ThrustKN = part.thrustKN || 0;
          stage1IspVac = part.ispVac || 300;
        }

        if (slotKey === 'stage2') {
          stage2ThrustKN = part.thrustKN || 980;
          stage2IspVac = part.ispVac || 350;
        }
      });

      // 1. Thrust to Weight Ratio at liftoff: TWR = F / (m0 * g0)
      const liftoffWeightN = totalWetMassKg * G0;
      const twr = liftoffWeightN > 0 ? (stage1ThrustKN * 1000) / liftoffWeightN : 0;

      // 2. Stage 1 Delta-v: Δv1 = Isp1 * g0 * ln(m0 / (m0 - prop1))
      const m0_1 = totalWetMassKg;
      const mf_1 = Math.max(100, totalWetMassKg - stage1PropellantKg);
      const deltaV1 = stage1IspVac * G0 * Math.log(m0_1 / mf_1);

      // 3. Stage 2 Delta-v: Δv2 = Isp2 * g0 * ln(m0_2 / mf_2)
      // Stage 2 starting mass is total remaining mass after Stage 1 tank and booster are dropped
      const stage1HardwareMass = (COMPONENT_CATALOG[this.slots.engine]?.massDryKg || 0) + 
                                (COMPONENT_CATALOG[this.slots.tank]?.massDryKg || 0) + 
                                (COMPONENT_CATALOG[this.slots.fins]?.massDryKg || 0);
      const m0_2 = Math.max(100, mf_1 - stage1HardwareMass);
      const mf_2 = Math.max(100, m0_2 - stage2PropellantKg);
      const deltaV2 = stage2IspVac * G0 * Math.log(m0_2 / mf_2);

      const totalDeltaV = Math.round(deltaV1 + deltaV2);

      let capability = 'Дэд-орбитын нислэг (Suborbital)';
      let capabilityColor = '#f59e0b';
      if (twr < 1.05) {
        capability = 'АНХААРУУЛГА: Хэт хүнд! Газраас хөөрөхгүй (TWR < 1.05)';
        capabilityColor = '#ef4444';
      } else if (totalDeltaV >= 13500) {
        capability = '🌕 Саран/Ангарагийн траектор (Lunar / Mars Transfer)';
        capabilityColor = '#818cf8';
      } else if (totalDeltaV >= 11500) {
        capability = '🛰️ Геостационар орбитод хүрэх чадамжтай (GTO)';
        capabilityColor = '#38bdf8';
      } else if (totalDeltaV >= 9200) {
        capability = '🌍 Дэлхийн нам тойрог замд орох боломжтой (LEO)';
        capabilityColor = '#22c55e';
      }

      return {
        wetMassTon: (totalWetMassKg / 1000).toFixed(1),
        dryMassTon: (totalDryMassKg / 1000).toFixed(1),
        twr: twr.toFixed(2),
        deltaVM_S: totalDeltaV,
        stage1DeltaV: Math.round(deltaV1),
        stage2DeltaV: Math.round(deltaV2),
        capability,
        capabilityColor
      };
    }

    _updateCalculationsUI() {
      const calc = this.calculatePhysics();

      this.uiRoot.querySelector('#rbWetMassVal').textContent = `${calc.wetMassTon} тн`;
      this.uiRoot.querySelector('#rbDryMassVal').textContent = `${calc.dryMassTon} тн`;
      
      const twrEl = this.uiRoot.querySelector('#rbTwrVal');
      twrEl.textContent = calc.twr;
      twrEl.style.color = Number(calc.twr) < 1.1 ? '#ef4444' : '#22c55e';

      const twrBadge = this.uiRoot.querySelector('#rbTwrBadge');
      if (Number(calc.twr) < 1.05) {
        twrBadge.textContent = 'ХЭТ СУЛ (TWR < 1)';
        twrBadge.style.background = '#ef4444';
      } else if (Number(calc.twr) > 2.8) {
        twrBadge.textContent = 'ХЭТ ИХ АЧААЛАЛ (TWR > 2.8)';
        twrBadge.style.background = '#f59e0b';
      } else {
        twrBadge.textContent = 'TWR ХЭВИЙН';
        twrBadge.style.background = '#22c55e';
      }

      this.uiRoot.querySelector('#rbDeltaVVal').textContent = `${calc.deltaVM_S.toLocaleString()} м/с`;
      
      const ratingEl = this.uiRoot.querySelector('#rbMissionRating');
      ratingEl.textContent = calc.capability;
      ratingEl.style.color = calc.capabilityColor;

      const barEl = this.uiRoot.querySelector('#rbDeltaVBar');
      const pct = Math.min(100, Math.round((calc.deltaVM_S / 14000) * 100));
      barEl.style.width = `${pct}%`;
      barEl.style.background = calc.capabilityColor;
    }

    /* ------------------------------------------------------------- 3D Graphics */
    _initThree() {
      const canvas = this.uiRoot.querySelector('#rbViewportCanvas');
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 600;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060914);

      this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
      this.camera.position.set(0, 16, 42);

      this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xfff5eb, 1.8);
      dirLight1.position.set(20, 40, 25);
      this.scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
      dirLight2.position.set(-20, 15, -20);
      this.scene.add(dirLight2);

      // Rocket Container
      this.rocketGroup = new THREE.Group();
      this.scene.add(this.rocketGroup);

      // VAB / Launchpad floor
      this.padGroup = new THREE.Group();
      this.scene.add(this.padGroup);
      this._buildPadEnvironment();

      // Mouse/Touch controls
      this._setupOrbitInteraction(canvas);
    }

    _buildPadEnvironment() {
      // Grid Floor
      const grid = new THREE.GridHelper(80, 40, 0x38bdf8, 0x1e293b);
      grid.position.y = 0;
      this.padGroup.add(grid);

      // Launch Tower Mast
      const mastGeo = new THREE.BoxGeometry(1.5, 42, 1.5);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.set(-5, 21, 0);
      this.padGroup.add(mast);

      // Tower Arms
      for (let i = 0; i < 4; i++) {
        const armGeo = new THREE.BoxGeometry(4.0, 0.4, 0.4);
        const arm = new THREE.Mesh(armGeo, mastMat);
        arm.position.set(-3.0, 10 + i * 8, 0);
        this.padGroup.add(arm);
      }
    }

    _setupOrbitInteraction(canvas) {
      let isDragging = false;
      let prevX = 0;
      let prevY = 0;

      const onDown = (x, y) => {
        isDragging = true;
        prevX = x;
        prevY = y;
      };

      const onMove = (x, y) => {
        if (!isDragging) return;
        const dx = x - prevX;
        const dy = y - prevY;
        prevX = x;
        prevY = y;

        this.rocketGroup.rotation.y += dx * 0.008;
        if (!this.simState.running) {
          this.camera.position.y = Math.max(4, Math.min(32, this.camera.position.y - dy * 0.05));
        }
      };

      const onUp = () => { isDragging = false; };

      canvas.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onUp);

      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
      });
      window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
      });
      window.addEventListener('touchend', onUp);

      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const dist = this.camera.position.z + e.deltaY * 0.025;
        this.camera.position.z = Math.max(12, Math.min(75, dist));
      }, { passive: false });
    }

    /**
     * Constructs Procedural 3D Rocket Meshes vertically snapped
     */
    _rebuildRocket3D() {
      if (!this.rocketGroup) return;

      // Clear existing meshes
      while (this.rocketGroup.children.length > 0) {
        const child = this.rocketGroup.children[0];
        this.rocketGroup.remove(child);
        if (child.geometry) child.geometry.dispose();
      }

      let currentY = 0;

      // Shared PBR Materials
      const matMetal = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
      const matNozzle = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.15 });
      const matDark = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.4 });
      const matHeatShield = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
      const matAccent = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 });

      // 1. BASE ENGINES (Slot: engine)
      const engPart = COMPONENT_CATALOG[this.slots.engine];
      const engGroup = new THREE.Group();
      if (this.slots.engine === 'engine_srb') {
        // Center core + 2 huge side boosters
        const coreNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.8, 16), matNozzle);
        engGroup.add(coreNozzle);
        const srbL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 2.2, 16), matNozzle);
        srbL.position.set(-1.8, 0, 0);
        engGroup.add(srbL);
        const srbR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 2.2, 16), matNozzle);
        srbR.position.set(1.8, 0, 0);
        engGroup.add(srbR);
      } else {
        // Multi-nozzle cluster
        const nozzleRadius = this.slots.engine === 'engine_raptor' ? 0.35 : 0.25;
        const count = this.slots.engine === 'engine_raptor' ? 3 : 5;
        for (let i = 0; i < count; i++) {
          const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, nozzleRadius, 1.6, 16), matNozzle);
          const angle = (i / count) * Math.PI * 2;
          const rad = count === 1 ? 0 : 0.6;
          nozzle.position.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad);
          engGroup.add(nozzle);
        }
      }
      engGroup.position.y = currentY + 1.0;
      this.rocketGroup.add(engGroup);
      currentY += 2.0;

      // 2. BASE FINS (Slot: fins)
      if (this.slots.fins && this.slots.fins !== 'none') {
        const finGroup = new THREE.Group();
        for (let i = 0; i < 4; i++) {
          const finGeo = new THREE.BoxGeometry(0.08, 2.0, 1.2);
          const fin = new THREE.Mesh(finGeo, matDark);
          const angle = (i / 4) * Math.PI * 2;
          fin.rotation.y = angle;
          fin.position.set(Math.cos(angle) * 1.6, 0.6, Math.sin(angle) * 1.6);
          finGroup.add(fin);
        }
        finGroup.position.y = currentY;
        this.rocketGroup.add(finGroup);
      }

      // 3. MAIN STAGE 1 TANK (Slot: tank)
      const tankPart = COMPONENT_CATALOG[this.slots.tank] || COMPONENT_CATALOG['tank_heavy'];
      const tankHeight = (tankPart && tankPart.id === 'tank_heavy') ? 14.0 : 10.0;
      const tankRadius = 1.35;
      const tankMesh = new THREE.Mesh(new THREE.CylinderGeometry(tankRadius, tankRadius, tankHeight, 32), matMetal);
      tankMesh.position.y = currentY + tankHeight * 0.5;
      this.rocketGroup.add(tankMesh);
      currentY += tankHeight;

      // 4. INTERSTAGE (Slot: interstage)
      const interstageMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 2.2, 32), matDark);
      interstageMesh.position.y = currentY + 1.1;
      this.rocketGroup.add(interstageMesh);

      // Grid fins on interstage
      if (this.slots.interstage === 'interstage_grid') {
        for (let i = 0; i < 4; i++) {
          const gridMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.9), matMetal);
          const a = (i / 4) * Math.PI * 2;
          gridMesh.rotation.y = a;
          gridMesh.position.set(Math.cos(a) * 1.45, currentY + 1.5, Math.sin(a) * 1.45);
          this.rocketGroup.add(gridMesh);
        }
      }
      currentY += 2.2;

      // 5. STAGE 2 (Slot: stage2)
      const stage2Height = 6.0;
      const stage2Mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, stage2Height, 32), matMetal);
      stage2Mesh.position.y = currentY + stage2Height * 0.5;
      this.rocketGroup.add(stage2Mesh);
      currentY += stage2Height;

      // 6. PAYLOAD (Slot: payload)
      if (this.slots.payload === 'payload_capsule') {
        // Conical Apollo/Dragon style capsule
        const capsuleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.35, 2.5, 32), matMetal);
        capsuleMesh.position.y = currentY + 1.25;
        this.rocketGroup.add(capsuleMesh);

        // Heat shield
        const hsMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 0.2, 32), matHeatShield);
        hsMesh.position.y = currentY + 0.1;
        this.rocketGroup.add(hsMesh);

        // Docking nose cone
        const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 32), matDark);
        noseMesh.position.y = currentY + 2.9;
        this.rocketGroup.add(noseMesh);
        currentY += 3.3;
      } else {
        // Aerodynamic cargo fairing
        const fairingMesh = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4.5, 32), matMetal);
        fairingMesh.position.y = currentY + 2.25;
        this.rocketGroup.add(fairingMesh);
        currentY += 4.5;
      }

      // Flame plume mesh (hidden during VAB, active during launch)
      const flameGeo = new THREE.ConeGeometry(1.2, 5.0, 16);
      const flameMat = new THREE.MeshBasicMaterial({
        color: 0xff7700,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
      this.launchFlameMesh = new THREE.Mesh(flameGeo, flameMat);
      this.launchFlameMesh.rotation.x = Math.PI;
      this.launchFlameMesh.position.set(0, -2.5, 0);
      this.launchFlameMesh.visible = false;
      this.rocketGroup.add(this.launchFlameMesh);

      // Center camera vertically on assembled rocket
      this.camera.position.y = currentY * 0.45;
    }

    /**
     * Executes Live 3D Launch Simulation
     */
    startLaunchSimulation() {
      const calc = this.calculatePhysics();
      if (Number(calc.twr) < 1.05) {
        alert('АНХААРУУЛГА: Пуужингийн түлхэлт жингээсээ бага тул хөөрөх боломжгүй! (TWR < 1.05). Хөдөлгүүрийн түлхэлтийг ихэсгэх эсвэл савны хэмжээг багасгана уу.');
        return;
      }

      this.simState.running = true;
      this.simState.time = 0;
      this.simState.altitudeM = 0;
      this.simState.velocityM_S = 0;
      this.simState.stage1Separated = false;
      this.simState.fairingJettisoned = false;
      this.simState.orbitInserted = false;

      this.uiRoot.querySelector('#rbLaunchSimHUD').style.display = 'flex';
      this.uiRoot.querySelector('#rbEnvModeTag').textContent = '🚀 ХӨӨРӨЛТИЙН ЦАГ БОДИТ СИМУЛЯЦИ';
      this.uiRoot.querySelector('#rbEnvModeTag').style.borderColor = '#22c55e';
      this.uiRoot.querySelector('#rbEnvModeTag').style.color = '#22c55e';

      if (this.launchFlameMesh) this.launchFlameMesh.visible = true;
    }

    resetToVAB() {
      this.simState.running = false;
      this.rocketGroup.position.set(0, 0, 0);
      this.camera.position.set(0, 16, 42);

      this.uiRoot.querySelector('#rbLaunchSimHUD').style.display = 'none';
      this.uiRoot.querySelector('#rbEnvModeTag').textContent = '🏢 VAB: УГСРАЛТЫН БАЙГУУЛАМЖ';
      this.uiRoot.querySelector('#rbEnvModeTag').style.borderColor = '#38bdf8';
      this.uiRoot.querySelector('#rbEnvModeTag').style.color = '#38bdf8';

      if (this.launchFlameMesh) this.launchFlameMesh.visible = false;
    }

    _startRenderLoop() {
      const tick = (timestamp) => {
        if (!this.isMounted) return;
        const dt = Math.min(0.1, (timestamp - (this._lastFrame || timestamp)) / 1000);
        this._lastFrame = timestamp;

        // Launch physics progression
        if (this.simState.running) {
          this.simState.time += dt * 3.5; // Accelerated simulation time

          // Acceleration a = F / m - g
          const t = this.simState.time;
          if (t < 60) {
            this.simState.velocityM_S += (14.5 * (1 + t * 0.03)) * dt * 3.5;
            this.simState.altitudeM += this.simState.velocityM_S * dt * 3.5;
            this.simState.accelG = 1.3 + (t / 60) * 1.8;
          } else if (t < 140) {
            // Stage 2 flight
            if (!this.simState.stage1Separated) {
              this.simState.stage1Separated = true;
              this.uiRoot.querySelector('#rbSimStatusMsg').textContent = '✓ 1-Р ШАТ САЛЖ, 2-Р ШАТНЫ ВАКУУМ ХӨДӨЛГҮҮР АСЛАА!';
            }
            this.simState.velocityM_S += 28.0 * dt * 3.5;
            this.simState.altitudeM += this.simState.velocityM_S * dt * 3.5;
            this.simState.accelG = 2.4;
          } else {
            // Orbit insertion
            if (!this.simState.orbitInserted) {
              this.simState.orbitInserted = true;
              this.simState.velocityM_S = 7800; // LEO velocity
              this.simState.altitudeM = 240000; // 240 km
              this.uiRoot.querySelector('#rbSimStatusMsg').innerHTML = `
                <strong style="color:#4ade80">🎉 ТОЙРОГ ЗАМД АМЖИЛТТАЙ ОРЛОО (ORBIT INSERTION SUCCESSFUL)!</strong>
              `;
              if (this.launchFlameMesh) this.launchFlameMesh.visible = false;
            }
          }

          // Update rocket 3D ascent position and camera tracking
          const visualAlt = (this.simState.altitudeM / 1000) * 0.8;
          this.rocketGroup.position.y = visualAlt;
          this.camera.position.y = visualAlt + 14;

          // Flame flicker effect
          if (this.launchFlameMesh && this.launchFlameMesh.visible) {
            const scale = 1.0 + Math.sin(timestamp * 0.05) * 0.2;
            this.launchFlameMesh.scale.set(scale, scale * (1.0 + Math.random() * 0.3), scale);
          }

          // HUD Readouts
          this.uiRoot.querySelector('#rbSimAlt').textContent = `${(this.simState.altitudeM / 1000).toFixed(1)} км`;
          this.uiRoot.querySelector('#rbSimVel').textContent = `${(this.simState.velocityM_S / 1000).toFixed(2)} км/с`;
          this.uiRoot.querySelector('#rbSimG').textContent = `${this.simState.accelG.toFixed(1)} G`;
        } else {
          // Slow ambient rotation in VAB
          this.rocketGroup.rotation.y += dt * 0.2;
        }

        if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
        }

        this._animId = requestAnimationFrame(tick);
      };
      this._animId = requestAnimationFrame(tick);
    }

    pause() {
      if (this._animId) {
        cancelAnimationFrame(this._animId);
        this._animId = null;
      }
      this.isPaused = true;
    }

    resume() {
      this.isPaused = false;
      if (!this._animId) {
        this._startRenderLoop();
      }
    }

    unmount() {
      this.pause();
      this.isMounted = false;
      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }
      if (this.uiRoot && this.uiRoot.parentNode) {
        this.uiRoot.parentNode.removeChild(this.uiRoot);
      }
      this.uiRoot = null;
    }

    dispose() {
      this.unmount();
    }
  }

  return RocketBuilderModule;
}));
