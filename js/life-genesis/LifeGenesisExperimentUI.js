/**
 * SCIENCE UNIVERSE — LIFE GENESIS ENGINE V2
 * File: js/life-genesis/LifeGenesisExperimentUI.js
 *
 * Interactive experiment interface for the LifeSimulationCore.
 * Standalone DOM module (no Three.js dependency): mount() into any container element.
 *
 * Features:
 *   - Environment preset selector (Mars, Europa, Titan, Enceladus, Venus cloud, Earth ref)
 *   - Live environmental parameter sliders (T, P, pH, salinity, UV, radiation, redox)
 *   - Start / Pause / Resume / Reset / Step, simulation speed (steps/sec)
 *   - Seeded repeatable simulations (seed field) — same seed => same outcome
 *   - EXPLICIT inoculation gate: favorable conditions never create life automatically
 *   - Live population + chemical concentration graphs (canvas, no chart library)
 *   - Experiment comparison: run a batch across seeds and diff outcomes
 *   - Scientific result report generation (text, copyable/downloadable)
 *   - Save / load via localStorage + JSON export/import
 *
 * Lifecycle contract mirrors js/science/ScienceModuleAdapter.js:
 *   new LifeGenesisExperimentUI().mount(container) / .dispose()
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./LifeSimulationCore', './LifeGenesisEnvironments'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./LifeSimulationCore'), require('./LifeGenesisEnvironments'));
  } else {
    root.LifeGenesisExperimentUI = factory(root.LifeSimulationCore, root.LifeGenesisEnvironments);
  }
}(typeof self !== 'undefined' ? self : this, function (LifeSimulationCore, Environments) {
  'use strict';

  var SAVE_KEY = 'su_life_genesis_v2_state';
  var COMPARE_KEY = 'su_life_genesis_v2_comparisons';
  var KELVIN = 273.15;

  var SPEEDS = [
    { label: '0.5x', stepsPerSec: 1 },
    { label: '1x', stepsPerSec: 4 },
    { label: '2x', stepsPerSec: 10 },
    { label: '4x', stepsPerSec: 25 },
    { label: '8x', stepsPerSec: 60 }
  ];

  /* Small helpers ---------------------------------------------------------- */
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'style') n.style.cssText = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function fmt(v, d) { return (v === undefined || v === null) ? '—' : Number(v).toFixed(d === undefined ? 2 : d); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------------ */
  function LifeGenesisExperimentUI() {
    this.isMounted = false;
    this.container = null;
    this.core = null;
    this.envId = 'mars';
    this.running = false;
    this.speedIdx = 1;         // 1x
    this.timer = null;
    this.pendingSeed = 42;
    this.pendingMetabolism = 'chemolithotrophy';
    this.pendingInoculum = 100;
    this.comparisons = [];
    this._rafDraw = null;
  }

  /* ============================ LIFECYCLE ================================ */
  LifeGenesisExperimentUI.prototype.mount = function (container) {
    if (!container) throw new Error('[LifeGenesisExperimentUI] mount() requires a container');
    if (!LifeSimulationCore) throw new Error('[LifeGenesisExperimentUI] LifeSimulationCore missing');
    this.container = container;
    this.isMounted = true;

    try {
      var saved = this._loadComparisons();
      this.comparisons = saved || [];
    } catch (e) { this.comparisons = []; }

    this._newCore(this.envId, this.pendingSeed);
    this._render();
    this._bind();
    this._drawGraphs();
    return this;
  };

  LifeGenesisExperimentUI.prototype.dispose = function () {
    this.pause();
    this.isMounted = false;
    if (this.container) this.container.innerHTML = '';
    this.container = null;
    this.core = null;
    if (this._rafDraw) { cancelAnimationFrame(this._rafDraw); this._rafDraw = null; }
  };

  LifeGenesisExperimentUI.prototype.pause = function () {
    this.running = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this._updateRunButtons();
  };

  LifeGenesisExperimentUI.prototype.resume = function () {
    if (!this.core) return;
    this.running = true;
    this._startTimer();
    this._updateRunButtons();
  };

  /* ============================== CORE =================================== */
  LifeGenesisExperimentUI.prototype._newCore = function (envId, seed) {
    var env = Environments.getPreset(envId);
    if (!env) env = Environments.getPreset('mars');
    this.envId = envId;
    this.core = new LifeSimulationCore({ env: env, seed: seed, options: { dtDays: 0.5 } });
    this.pendingSeed = seed;
  };

  LifeGenesisExperimentUI.prototype._startTimer = function () {
    if (this.timer) clearInterval(this.timer);
    var self = this;
    var sps = SPEEDS[this.speedIdx].stepsPerSec;
    var interval = Math.max(16, Math.round(1000 / sps));
    this.timer = setInterval(function () {
      if (!self.running || !self.core) return;
      var notes = self.core._stepOnce();
      self._afterStep(notes);
    }, interval);
  };

  LifeGenesisExperimentUI.prototype._afterStep = function (notes) {
    this._updateReadouts();
    if (this._rafDraw) cancelAnimationFrame(this._rafDraw);
    var self = this;
    this._rafDraw = requestAnimationFrame(function () { self._drawGraphs(); });
    if (notes && notes.length) this._pushEvents(notes);
  };

  /* ============================== RENDER ================================= */
  LifeGenesisExperimentUI.prototype._render = function () {
    var self = this;
    var presetOpts = Environments.listEnvironments(true).map(function (id) {
      var p = Environments.PRESETS[id];
      return '<option value="' + id + '"' + (id === self.envId ? ' selected' : '') + '>' + esc(p.name) + '</option>';
    }).join('');

    var metaOpts = Object.keys(LifeSimulationCore.MODELS).map(function (k) {
      var m = LifeSimulationCore.MODELS[k];
      var color = m.tier === 'established' ? '#22c55e' : (m.tier === 'simplified' ? '#38bdf8' : '#f59e0b');
      return '<li style="display:flex;gap:6px;align-items:baseline"><span style="min-width:74px;font-size:9px;font-weight:800;color:' + color + '">' +
        m.tier.toUpperCase() + '</span><span style="font-size:10px;color:#94a3b8"><b style="color:#cbd5e1">' + esc(k) + '</b> — ' + esc(m.ref) + '</span></li>';
    }).join('');

    this.container.innerHTML = '';
    var rootDiv = el('div', { style: 'display:flex;flex-direction:column;gap:10px;height:100%;overflow-y:auto;padding:10px;color:#e2e8f0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#060919;' });

    /* ---- Header ---- */
    rootDiv.appendChild(el('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px 14px' },
      '<div><div style="font-size:15px;font-weight:800;color:#38bdf8;display:flex;gap:8px;align-items:center">🧫 LIFE GENESIS ENGINE V2 — SCIENTIFIC LIFE &amp; EVOLUTION SIM<span style="font-size:9px;background:#0284c7;color:#fff;padding:2px 8px;border-radius:10px">v2.0</span></div>' +
      '<div style="font-size:11px;color:#94a3b8;margin-top:2px">Харь гарагийн орчин → пребиотик химийн урвал → прото-эс → бичил биетэн → сонголт, хувьслал, устах</div></div>' +
      '<div id="lgv2Status" style="font-size:11px;font-weight:700;padding:6px 12px;border-radius:8px;background:#1e293b;border:1px solid #334155">STERILE — initialized</div>'
    ));

    /* ---- Controls row ---- */
    var ctrl = el('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px' });
    ctrl.innerHTML =
      '<label style="font-size:11px;color:#94a3b8">Гариг/Дундаралт <select id="lgv2Env" style="background:#0f172a;border:1px solid #38bdf8;color:#38bdf8;padding:5px 8px;border-radius:6px;font-size:11px;max-width:260px">' + presetOpts + '</select></label>' +
      '<label style="font-size:11px;color:#94a3b8">Seed <input id="lgv2Seed" type="number" value="' + this.pendingSeed + '" style="width:80px;background:#0f172a;border:1px solid #334155;color:#f59e0b;padding:5px;border-radius:6px;font-size:11px"></label>' +
      '<button id="lgv2Start" class="lgv2-btn" style="background:linear-gradient(180deg,#0284c7,#0369a1);border:1px solid #38bdf8">▶ Эхлүүлэх</button>' +
      '<button id="lgv2Pause" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155">⏸ Түр зогсоох</button>' +
      '<button id="lgv2Step" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155">⏭ 1 алхам</button>' +
      '<button id="lgv2Reset" class="lgv2-btn" style="background:#7f1d1d;border:1px solid #ef4444">⟲ Шинээр эхлэх (Reset)</button>' +
      '<label style="font-size:11px;color:#94a3b8">Хурд <select id="lgv2Speed" style="background:#0f172a;border:1px solid #334155;color:#e2e8f0;padding:5px;border-radius:6px;font-size:11px">' +
      SPEEDS.map(function (s, i) { return '<option value="' + i + '"' + (i === self.speedIdx ? ' selected' : '') + '>' + s.label + '</option>'; }).join('') + '</select></label>';
    rootDiv.appendChild(ctrl);

    /* ---- Inoculation gate (explicit, prominent) ---- */
    var inoc = el('div', { style: 'background:rgba(245,158,11,0.07);border:1px dashed rgba(245,158,11,0.5);border-radius:10px;padding:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center' });
    inoc.innerHTML =
      '<div style="font-size:11px;color:#fbbf24;max-width:420px"><b>⚠️ Амьдрал АЯНДАА ҮҮСДЭГГҮЙ.</b> Таатай орчин бүрдсэн ч симуляц стерил хэвээр үлдэнэ. Дараах товчийг дарвал <b>ТААМАГЛАЛТ</b> үүлдэр (inoculum) оруулна.</div>' +
      '<label style="font-size:11px;color:#94a3b8">Метаболизм <select id="lgv2Meta" style="background:#0f172a;border:1px solid #334155;color:#e2e8f0;padding:5px;border-radius:6px;font-size:11px">' +
      Object.keys(LifeSimulationCore.METABOLISMS).map(function (k) { return '<option value="' + k + '">' + esc(LifeSimulationCore.METABOLISMS[k].label) + '</option>'; }).join('') + '</select></label>' +
      '<label style="font-size:11px;color:#94a3b8">Эх тоо <input id="lgv2Inoc" type="number" min="1" max="10000" value="' + this.pendingInoculum + '" style="width:76px;background:#0f172a;border:1px solid #334155;color:#e2e8f0;padding:5px;border-radius:6px;font-size:11px"></label>' +
      '<button id="lgv2InocBtn" class="lgv2-btn" style="background:#7c2d12;border:1px solid #f59e0b;color:#fde68a">🧬 Үүлдэр оруулах (Inoculate)</button>';
    rootDiv.appendChild(inoc);

    /* ---- Main grid: params | graphs | status ---- */
    var grid = el('div', { style: 'display:grid;grid-template-columns:250px 1fr 300px;gap:10px;flex:1;min-height:420px' });

    /* Params column */
    var params = el('div', { style: 'background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:12px;overflow-y:auto' });
    params.innerHTML = '<div style="font-size:12px;font-weight:800;color:#38bdf8">🧪 Орчны Параметрүүд</div>' +
      this._sliderHtml('lgv2T', 'Температур', 60, 500, 1, this.core.env.temperatureK, 'K') +
      this._sliderHtml('lgv2P', 'Даралт', -5, 3, 0.01, Math.log10(Math.max(1e-6, this.core.env.pressureBar)), 'log10 bar') +
      this._sliderHtml('lgv2PH', 'pH', 0, 14, 0.1, this.core.env.pH, 'pH') +
      this._sliderHtml('lgv2Sal', 'Туургийн агууламж', 0, 40, 0.1, this.core.env.salinityPct, '%') +
      this._sliderHtml('lgv2Aw', 'Усны үйлчилгээ (aw)', 0.3, 1, 0.01, this.core.env.waterActivity, 'aw') +
      this._sliderHtml('lgv2UV', 'Хэт ягаан туяаны индекс', 0, 11, 0.5, this.core.env.uvIndex, 'UV') +
      this._sliderHtml('lgv2Rad', 'Цацрагийн тун', 0, 60, 0.01, this.core.env.radiationDoseGyPerSol, 'Gy/sol') +
      this._sliderHtml('lgv2Redox', 'Редокс потенциал', -400, 500, 10, this.core.env.redoxPotentialMv, 'mV') +
      '<div style="font-size:11px;color:#94a3b8">Эрчим хүч: <b style="color:#38bdf8">' + esc(this.core.env.energySourceType) + '</b></div>' +
      '<div style="font-size:10px;color:#64748b;border-top:1px solid #334155;padding-top:6px">' + esc(this.core.env.notes) + '</div>';
    grid.appendChild(params);

    /* Graphs column */
    var graphs = el('div', { style: 'display:flex;flex-direction:column;gap:10px' });
    graphs.innerHTML =
      '<div style="background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><b style="color:#38bdf8">📈 Популяцийн график</b>' +
      '<span style="color:#94a3b8"><span style="color:#38bdf8">■</span> Бичил биетэн &nbsp;<span style="color:#a78bfa">■</span> Прото-эс</span></div>' +
      '<canvas id="lgv2PopGraph" style="width:100%;height:190px;display:block"></canvas></div>' +
      '<div style="background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px">' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px"><b style="color:#22c55e">⚗️ Химийн нэгдлүүдийн концентрац</b>' +
      '<span style="color:#94a3b8"><span style="color:#f59e0b">■</span> Мономер <span style="color:#22c55e">■</span> Полимер <span style="color:#38bdf8">■</span> Липид <span style="color:#ef4444">■</span> O₂</span></div>' +
      '<canvas id="lgv2ChemGraph" style="width:100%;height:170px;display:block"></canvas></div>' +
      '<div style="background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px;flex:1;min-height:120px">' +
      '<div style="font-size:11px;font-weight:700;color:#f59e0b;margin-bottom:4px">📜 Үйл явдлын лог</div>' +
      '<div id="lgv2EventLog" style="font-size:10px;color:#94a3b8;line-height:1.5;max-height:130px;overflow-y:auto;font-family:ui-monospace,monospace">—</div></div>';
    grid.appendChild(graphs);

    /* Status column */
    var status = el('div', { style: 'background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;overflow-y:auto' });
    status.innerHTML =
      '<div style="font-size:12px;font-weight:800;color:#22c55e">🔬 Тухай байдал (Live Snapshot)</div>' +
      '<div id="lgv2Snapshot" style="font-size:11px;line-height:1.7;font-family:ui-monospace,monospace;color:#cbd5e1">—</div>' +
      '<div style="font-size:12px;font-weight:800;color:#a78bfa;margin-top:4px">⚖️ Туршилтын харьцуулалт</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="lgv2AddCmp" class="lgv2-btn" style="background:#1e293b;border:1px solid #a78bfa;font-size:10px">+ Одоогийн үр дүнг хадгал</button>' +
      '<button id="lgv2RunCmp" class="lgv2-btn" style="background:#1e293b;border:1px solid #a78bfa;font-size:10px">▶ 5 seed batch харьцуулалт</button>' +
      '<button id="lgv2ClearCmp" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155;font-size:10px">✕ Цэвэрлэх</button></div>' +
      '<div id="lgv2CmpTable" style="font-size:10px;max-height:170px;overflow-y:auto"></div>' +
      '<div style="font-size:12px;font-weight:800;color:#38bdf8;margin-top:4px">📄 Шинжлэх ухааны тайлан</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="lgv2Report" class="lgv2-btn" style="background:#0284c7;border:1px solid #38bdf8;font-size:10px">Тайлан үүсгэх</button>' +
      '<button id="lgv2Save" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155;font-size:10px">💾 Хадгалах</button>' +
      '<button id="lgv2Load" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155;font-size:10px">📂 Ачаалах</button>' +
      '<button id="lgv2Export" class="lgv2-btn" style="background:#1e293b;border:1px solid #334155;font-size:10px">⤓ JSON</button></div>' +
      '<div id="lgv2ReportBox" style="font-size:10px;color:#94a3b8;white-space:pre-wrap;background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:8px;max-height:180px;overflow-y:auto;font-family:ui-monospace,monospace">—</div>';
    grid.appendChild(status);

    rootDiv.appendChild(grid);

    /* Model legend (evidence tiers) */
    rootDiv.appendChild(el('div', { style: 'background:rgba(15,23,42,0.92);border:1px solid #334155;border-radius:10px;padding:10px' },
      '<div style="font-size:11px;font-weight:800;color:#e2e8f0;margin-bottom:6px">📖 Загварууд ба шинжлэх ухааны түвшин (Evidence Tiers)</div>' +
      '<ul style="margin:0;padding-left:4px;list-style:none;display:flex;flex-direction:column;gap:3px">' + metaOpts + '</ul>'));

    /* Button base style */
    var style = document.createElement('style');
    style.textContent = '.lgv2-btn{padding:6px 12px;border-radius:7px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;transition:filter .15s}' +
      '.lgv2-btn:hover{filter:brightness(1.25)}.lgv2-btn:disabled{opacity:.45;cursor:not-allowed}';
    rootDiv.appendChild(style);

    this.container.appendChild(rootDiv);
  };

  LifeGenesisExperimentUI.prototype._sliderHtml = function (id, label, min, max, step, value, unit) {
    return '<div><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">' +
      '<span style="color:#cbd5e1">' + esc(label) + '</span>' +
      '<b id="' + id + 'Val" style="color:#f59e0b">' + fmt(value, step < 1 ? 2 : 0) + ' ' + esc(unit) + '</b></div>' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '" style="width:100%;accent-color:#38bdf8"></div>';
  };

  /* ============================== BIND =================================== */
  LifeGenesisExperimentUI.prototype._bind = function () {
    var self = this;
    var $ = function (id) { return document.getElementById(id); };

    // Note: ids are unique per page only if one instance is mounted. Deep Space V7
    // integration should mount ONE instance at a time (documented in API doc).

    $('lgv2Env').onchange = function () {
      self.pause();
      self._newCore(this.value, Number($('lgv2Seed').value) || 42);
      self._render(); self._bind(); self._drawGraphs(); self._updateReadouts();
      self._pushEvents(['Environment switched to ' + self.core.env.name]);
    };

    $('lgv2Seed').onchange = function () {
      var s = Math.abs(parseInt(this.value, 10) || 0) % 2147483647;
      self.pendingSeed = s;
      self.pause();
      self._newCore(self.envId, s);
      self._render(); self._bind(); self._drawGraphs(); self._updateReadouts();
      self._pushEvents(['Seed set to ' + s + ' — new sterile run']);
    };

    $('lgv2Speed').onchange = function () {
      self.speedIdx = Number(this.value);
      if (self.running) self._startTimer();
    };

    $('lgv2Start').onclick = function () {
      if (self.running) return;
      self.resume();
      self._pushEvents(['▶ Simulation started (seed=' + self.core.seed + ', ' + SPEEDS[self.speedIdx].label + ')']);
    };
    $('lgv2Pause').onclick = function () { self.pause(); self._pushEvents(['⏸ Paused at day ' + fmt(self.core.day, 1)]); };
    $('lgv2Step').onclick = function () {
      self.pause();
      var notes = self.core._stepOnce();
      self._afterStep(notes);
    };
    $('lgv2Reset').onclick = function () {
      self.pause();
      var seedInput = Number($('lgv2Seed').value);
      self._newCore(self.envId, isNaN(seedInput) ? 42 : seedInput);
      self._updateReadouts(); self._drawGraphs();
      self._pushEvents(['⟲ RESET — sterile re-initialization with seed ' + self.core.seed]);
    };

    $('lgv2InocBtn').onclick = function () {
      var meta = $('lgv2Meta').value;
      var n = Math.max(1, Number($('lgv2Inoc').value) || 100);
      var res = self.core.inoculate({ count: n, metabolism: meta });
      if (res.ok) self._pushEvents(['🧬 INOCULATED ' + res.count + ' cells (' + res.metabolism + ') — SPECULATIVE founding population']);
      else self._pushEvents(['⛔ Inoculation refused: ' + res.reason]);
      self._updateReadouts();
    };

    // Parameter sliders -> live environment patch
    var sliderMap = [
      ['lgv2T', function (v) { return { temperatureK: v }; }],
      ['lgv2P', function (v) { return { pressureBar: Math.pow(10, v) }; }],
      ['lgv2PH', function (v) { return { pH: v }; }],
      ['lgv2Sal', function (v) { return { salinityPct: v }; }],
      ['lgv2Aw', function (v) { return { waterActivity: v }; }],
      ['lgv2UV', function (v) { return { uvIndex: v }; }],
      ['lgv2Rad', function (v) { return { radiationDoseGyPerSol: v }; }],
      ['lgv2Redox', function (v) { return { redoxPotentialMv: v }; }]
    ];
    sliderMap.forEach(function (pair) {
      var node = $(pair[0]);
      if (!node) return;
      node.oninput = function () {
        var v = Number(this.value);
        var lbl = $(pair[0] + 'Val');
        if (lbl) {
          var unit = lbl.textContent.replace(/^[-\d.\s]+/, '');
          lbl.textContent = fmt(v, Math.abs(v) < 100 && String(this.step).indexOf('.') >= 0 ? 2 : 0) + ' ' + unit;
        }
        self.core.setEnvironment(pair[1](v));
        self._updateReadouts();
      };
    });

    // Comparison tray
    $('lgv2AddCmp').onclick = function () { self._addComparison(self._currentComparison()); };
    $('lgv2RunCmp').onclick = function () { self._runComparisonBatch(); };
    $('lgv2ClearCmp').onclick = function () {
      self.comparisons = [];
      try { localStorage.removeItem(COMPARE_KEY); } catch (e) {}
      self._renderCmpTable();
    };

    // Report / save / load / export
    $('lgv2Report').onclick = function () { $('lgv2ReportBox').textContent = self.generateReport(); };
    $('lgv2Save').onclick = function () { self.saveToStorage(); self._pushEvents(['💾 State saved to localStorage']); };
    $('lgv2Load').onclick = function () {
      if (self.loadFromStorage()) { self._render(); self._bind(); self._drawGraphs(); self._updateReadouts(); self._pushEvents(['📂 State loaded']); }
      else self._pushEvents(['⛔ No saved state found']);
    };
    $('lgv2Export').onclick = function () { self.exportJson(); };

    this._renderCmpTable();
    this._updateReadouts();
  };

  /* ============================ READOUTS ================================= */
  LifeGenesisExperimentUI.prototype._updateReadouts = function () {
    if (!this.core) return;
    var snap = this.core.getSnapshot();
    var $ = function (id) { return document.getElementById(id); };

    var badge = $('lgv2Status');
    if (badge) {
      var map = {
        sterile: ['#1e293b', '#94a3b8', 'STERILE — ' + snap.derived.waterPhase],
        habitable_sterile: ['#064e3b', '#34d399', 'HABITABLE but STERILE'],
        protocells_present: ['#0c4a6e', '#38bdf8', 'PROTOCELLS — ' + snap.protocells.count],
        biosphere_active: ['#064e3b', '#34d399', 'BIOSPHERE ACTIVE — N=' + snap.microbes.count],
        extinct: ['#7f1d1d', '#fca5a5', 'EXTINCT'],
        abiotic: ['#1e293b', '#94a3b8', 'ABIOTIC — hostile']
      };
      var m = map[snap.status] || map.sterile;
      badge.style.background = m[0]; badge.style.color = m[1]; badge.textContent = m[2];
    }

    var box = $('lgv2Snapshot');
    if (box) {
      var g = snap.microbes.genomeBits;
      box.innerHTML =
        'day: <b style="color:#f59e0b">' + fmt(snap.day, 1) + '</b> · steps: ' + snap.step + ' · seed: ' + snap.seed + '<br>' +
        'permissive: <b style="color:' + (snap.derived.permissive > 0.5 ? '#34d399' : '#f87171') + '">' + snap.derived.permissive + '</b>' +
        ' · lethality: ' + snap.derived.lethality + '<br>' +
        'water: <b>' + snap.derived.waterPhase + '</b> · THI: ' + snap.derived.thi + '<br>' +
        'T: ' + snap.environment.temperatureK + ' K · P: ' + (snap.environment.pressureBar < 0.01 ? snap.environment.pressureBar.toExponential(1) : fmt(snap.environment.pressureBar, 3)) + ' bar · pH: ' + snap.environment.pH + '<br>' +
        '<span style="color:#38bdf8">monomers</span> ' + snap.chemistry.monomers + ' · <span style="color:#22c55e">polymers</span> ' + snap.chemistry.polymers + ' mM<br>' +
        '<span style="color:#a78bfa">lipids</span> ' + snap.chemistry.lipids + ' · O₂ ' + snap.chemistry.O2 + ' · H₂ ' + snap.chemistry.H2 + ' mM<br>' +
        'protocells: ' + snap.protocells.count + '<br>' +
        '<b style="color:#34d399">microbes: ' + snap.microbes.count + '</b>' + (snap.sterile ? ' <span style="color:#f59e0b">(sterile)</span>' : '') + '<br>' +
        'metabolism: ' + snap.microbes.metabolism + '<br>' +
        'genome: 0b' + snap.microbes.genome.toString(2).padStart(8, '0') +
        ' (E=' + g.energy + ' C=' + g.co2fix + ' S=' + g.stress + ' M=' + g.motility + ')<br>' +
        'fitness: ' + snap.microbes.meanFitness + ' · gens: ' + snap.microbes.generations + '<br>' +
        'allele freq: E0=' + snap.microbes.alleleFreq.E0 + ' E1=' + snap.microbes.alleleFreq.E1 +
        ' E2=' + snap.microbes.alleleFreq.E2 + ' E3=' + snap.microbes.alleleFreq.E3;
    }
    this._updateRunButtons();
  };

  LifeGenesisExperimentUI.prototype._updateRunButtons = function () {
    var start = document.getElementById('lgv2Start');
    var pause = document.getElementById('lgv2Pause');
    if (start) start.disabled = this.running;
    if (pause) pause.disabled = !this.running;
  };

  LifeGenesisExperimentUI.prototype._pushEvents = function (notes) {
    var log = document.getElementById('lgv2EventLog');
    if (!log) return;
    if (log.textContent === '—') log.textContent = '';
    var stamp = this.core ? '[' + fmt(this.core.day, 1) + 'd] ' : '';
    notes.slice(-3).forEach(function (n) {
      log.innerHTML = esc(stamp + n) + '<br>' + log.innerHTML;
    });
    while (log.childNodes.length > 60) log.removeChild(log.lastChild);
  };

  /* ============================== GRAPHS ================================= */
  LifeGenesisExperimentUI.prototype._drawGraphs = function () {
    if (!this.core) return;
    this._drawSeries('lgv2PopGraph', [
      { data: this.core.history.map(function (h) { return h.microbes; }), color: '#38bdf8' },
      { data: this.core.history.map(function (h) { return h.protocells; }), color: '#a78bfa' }
    ]);
    this._drawSeries('lgv2ChemGraph', [
      { data: this.core.history.map(function (h) { return h.monomers; }), color: '#f59e0b' },
      { data: this.core.history.map(function (h) { return h.polymers; }), color: '#22c55e' },
      { data: this.core.history.map(function (h) { return h.lipids; }), color: '#38bdf8' },
      { data: this.core.history.map(function (h) { return h.o2; }), color: '#ef4444' }
    ]);
  };

  LifeGenesisExperimentUI.prototype._drawSeries = function (canvasId, series) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 600;
    var h = canvas.clientHeight || 180;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Frame + grid
    ctx.strokeStyle = 'rgba(148,163,184,0.18)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    for (var gy = 1; gy < 4; gy++) {
      ctx.beginPath(); ctx.moveTo(0, (h * gy) / 4); ctx.lineTo(w, (h * gy) / 4); ctx.stroke();
    }

    var n = 0;
    series.forEach(function (s) { if (s.data.length > n) n = s.data.length; });
    if (n < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('Туршилт эхлүүлнэ үү — өгөгдөл цуглаагүй байна…', 14, h / 2);
      return;
    }

    var maxV = 1;
    series.forEach(function (s) {
      s.data.forEach(function (v) { if (v > maxV) maxV = v; });
    });
    var pad = 6;
    series.forEach(function (s) {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      s.data.forEach(function (v, i) {
        var x = pad + (i / (n - 1)) * (w - pad * 2);
        var y = h - pad - (v / maxV) * (h - pad * 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '9px ui-monospace,monospace';
    ctx.fillText('max=' + (maxV >= 1000 ? (maxV / 1000).toFixed(1) + 'k' : maxV), 6, 11);
    ctx.fillText('n=' + n + ' steps', w - 54, 11);
  };

  /* ============================ COMPARISONS ============================== */
  LifeGenesisExperimentUI.prototype._currentComparison = function () {
    var s = this.core.getSummary();
    return {
      envId: s.envId,
      envName: this.core.env.name,
      seed: s.seed,
      day: s.day,
      status: s.status,
      sterile: s.sterile,
      finalPopulation: s.finalPopulation,
      peakPopulation: s.peakPopulation,
      extinction: s.extinction,
      permissibility: s.permissibility,
      lethality: s.lethality,
      temperatureK: this.core.env.temperatureK,
      pH: this.core.env.pH,
      timestamp: new Date().toISOString()
    };
  };

  LifeGenesisExperimentUI.prototype._addComparison = function (entry) {
    this.comparisons.push(entry);
    if (this.comparisons.length > 40) this.comparisons.shift();
    this._saveComparisons();
    this._renderCmpTable();
  };

  /** Run 5 fresh seeded runs of the CURRENT environment (batch, headless). */
  LifeGenesisExperimentUI.prototype._runComparisonBatch = function () {
    var env = Environments.getPreset(this.envId);
    var baseSeed = this.pendingSeed;
    var results = [];
    for (var i = 0; i < 5; i++) {
      var core = new LifeSimulationCore({ env: Environments.getPreset(this.envId), seed: baseSeed + i * 17, options: { dtDays: 0.5 } });
      // Deterministic scripted protocol: warm-up, inoculate, run
      core.step(20);
      core.inoculate({ count: 100, metabolism: this.pendingMetabolism });
      core.step(180);
      var s = core.getSummary();
      results.push({
        envId: s.envId, envName: env.name, seed: s.seed, day: s.day, status: s.status,
        sterile: s.sterile, finalPopulation: s.finalPopulation, peakPopulation: s.peakPopulation,
        extinction: s.extinction, permissibility: s.permissibility, lethality: s.lethality,
        temperatureK: env.temperatureK, pH: env.pH, timestamp: new Date().toISOString()
      });
    }
    var self = this;
    results.forEach(function (r) { self.comparisons.push(r); });
    if (this.comparisons.length > 40) this.comparisons = this.comparisons.slice(-40);
    this._saveComparisons();
    this._renderCmpTable();
    this._pushEvents(['Ran 5-seed comparison batch for ' + env.name + ' — outcomes: ' +
      results.map(function (r) { return r.finalPopulation; }).join(', ')]);
  };

  LifeGenesisExperimentUI.prototype._renderCmpTable = function () {
    var box = document.getElementById('lgv2CmpTable');
    if (!box) return;
    if (!this.comparisons.length) {
      box.innerHTML = '<span style="color:#64748b">Харьцуулалтын үр дүн алга — "хадгал" эсвэл "batch" дарна уу.</span>';
      return;
    }
    var rows = this.comparisons.slice(-12).map(function (c) {
      var color = c.extinction ? '#f87171' : (c.finalPopulation > 0 ? '#34d399' : '#94a3b8');
      return '<tr style="border-bottom:1px solid #1e293b">' +
        '<td style="padding:2px 4px;color:#38bdf8">' + esc(String(c.envId).slice(0, 8)) + '</td>' +
        '<td style="padding:2px 4px;color:#f59e0b">' + c.seed + '</td>' +
        '<td style="padding:2px 4px;color:' + color + ';text-align:right">' + c.finalPopulation + '</td>' +
        '<td style="padding:2px 4px;color:#94a3b8;text-align:right">' + c.peakPopulation + '</td>' +
        '<td style="padding:2px 4px;color:' + (c.extinction ? '#f87171' : '#64748b') + ';text-align:center">' + (c.extinction ? '☠' : '—') + '</td></tr>';
    }).join('');
    box.innerHTML = '<table style="width:100%;border-collapse:collapse;font-family:ui-monospace,monospace">' +
      '<tr style="color:#64748b;font-size:9px"><th>env</th><th>seed</th><th style="text-align:right">final</th><th style="text-align:right">peak</th><th>ext</th></tr>' +
      rows + '</table>';
  };

  LifeGenesisExperimentUI.prototype._saveComparisons = function () {
    try { localStorage.setItem(COMPARE_KEY, JSON.stringify(this.comparisons)); } catch (e) {}
  };
  LifeGenesisExperimentUI.prototype._loadComparisons = function () {
    try {
      var raw = localStorage.getItem(COMPARE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };

  /* ============================== REPORT ================================= */
  LifeGenesisExperimentUI.prototype.generateReport = function () {
    var snap = this.core.getSnapshot();
    var sum = this.core.getSummary();
    var env = this.core.env;
    var lines = [];
    lines.push('SCIENCE UNIVERSE — LIFE GENESIS ENGINE V2 · SCIENTIFIC RESULT REPORT');
    lines.push('='.repeat(72));
    lines.push('Generated: ' + new Date().toISOString());
    lines.push('Environment: ' + env.name + ' (' + env.nameMn + ') [region: ' + (env.region || 'n/a') + ']');
    lines.push('Seed: ' + snap.seed + ' · Steps: ' + snap.step + ' · Simulated days: ' + fmt(snap.day, 1));
    lines.push('');
    lines.push('1. ENVIRONMENTAL CONDITIONS (established observational inputs)');
    lines.push('   Temperature      : ' + env.temperatureK + ' K (' + fmt(env.temperatureK - KELVIN, 1) + ' °C)');
    lines.push('   Pressure         : ' + (env.pressureBar < 0.01 ? env.pressureBar.toExponential(2) : fmt(env.pressureBar, 3)) + ' bar');
    lines.push('   pH               : ' + env.pH);
    lines.push('   Salinity         : ' + env.salinityPct + ' %');
    lines.push('   Water activity   : ' + env.waterActivity + ' aw');
    lines.push('   UV index         : ' + env.uvIndex + ' · Radiation: ' + env.radiationDoseGyPerSol + ' Gy/sol');
    lines.push('   Redox potential  : ' + env.redoxPotentialMv + ' mV · Energy: ' + env.energySourceType);
    lines.push('');
    lines.push('2. DERIVED HABITABILITY (established thermodynamics)');
    lines.push('   Water phase      : ' + snap.derived.waterPhase);
    lines.push('   Liquid water     : ' + (snap.derived.liquidWater ? 'YES' : 'NO'));
    lines.push('   Permissibility   : ' + snap.derived.permissive + '  (0=hostile, 1=physically permissive)');
    lines.push('   Abiotic lethality: ' + snap.derived.lethality);
    lines.push('   Thermal index    : ' + snap.derived.thi);
    if (snap.derived.nonAqueousSpeculative) {
      lines.push('   NOTE (SPECULATIVE): non-aqueous solvent present — ' + snap.derived.nonAqueousSpeculative.note);
    }
    lines.push('');
    lines.push('3. CHEMISTRY (simplified prebiotic network)');
    lines.push('   Monomers ' + snap.chemistry.monomers + ' mM · Polymers ' + snap.chemistry.polymers +
      ' mM · Lipids ' + snap.chemistry.lipids + ' mM');
    lines.push('   H2 ' + snap.chemistry.H2 + ' · CO2 ' + snap.chemistry.CO2 + ' · CH4 ' + snap.chemistry.CH4 +
      ' · O2 ' + snap.chemistry.O2 + ' mM · energy pool ' + snap.chemistry.energyPool);
    lines.push('');
    lines.push('4. BIOLOGICAL OUTCOME (SPECULATIVE models)');
    lines.push('   Status           : ' + snap.status);
    lines.push('   Inoculated       : ' + (snap.microbes.inoculated ? 'YES (explicit user action)' : 'NO — simulation sterile'));
    lines.push('   Protocells       : ' + snap.protocells.count);
    lines.push('   Microbes         : ' + snap.microbes.count + ' (peak ' + sum.peakPopulation + ')');
    lines.push('   Metabolism       : ' + snap.microbes.metabolism);
    lines.push('   Genome           : 0b' + snap.microbes.genome.toString(2).padStart(8, '0') +
      ' · fitness ' + snap.microbes.meanFitness + ' · generations ' + snap.microbes.generations);
    lines.push('   Allele frequency : E0=' + snap.microbes.alleleFreq.E0 + ' E1=' + snap.microbes.alleleFreq.E1 +
      ' E2=' + snap.microbes.alleleFreq.E2 + ' E3=' + snap.microbes.alleleFreq.E3);
    lines.push('   Extinction       : ' + (sum.extinction ? 'YES' : 'NO'));
    lines.push('');
    lines.push('5. SCIENTIFIC CAVEATS');
    lines.push('   - Favorable conditions do NOT create life: the engine starts sterile by design.');
    lines.push('   - Origin-of-life, protocell and alien-metabolism models are SPECULATIVE, not established.');
    lines.push('   - Population dynamics use simplified logistic/Allee models, not calibrated kinetics.');
    lines.push('   - Results are pedagogical hypotheses, not predictions about real moons or planets.');
    return lines.join('\n');
  };

  /* ============================ SAVE / LOAD ============================== */
  LifeGenesisExperimentUI.prototype.saveToStorage = function () {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 'life-genesis-v2',
        state: this.core.saveState()
      }));
      return true;
    } catch (e) { return false; }
  };

  LifeGenesisExperimentUI.prototype.loadFromStorage = function () {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.state) return false;
      this.pause();
      this.envId = parsed.state.env.id;
      this.core = new LifeSimulationCore({ env: Environments.getPreset(this.envId), seed: parsed.state.seed });
      this.core.loadState(parsed.state);
      return true;
    } catch (e) { return false; }
  };

  LifeGenesisExperimentUI.prototype.exportJson = function () {
    var payload = {
      report: this.generateReport(),
      snapshot: this.core.getSnapshot(),
      comparisons: this.comparisons
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'life-genesis-report-' + this.envId + '-' + this.core.seed + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  return LifeGenesisExperimentUI;
}));
