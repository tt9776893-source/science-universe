/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 & V2 · PLANETARY RESEARCH & LAB ANALYSIS
   File: js/space/su-research.js
   
   Deep Space V2 Capabilities:
   - Raycasting-driven geological scanner
   - Interactive geological sample collection
   - Research station spectrometer & lab analysis
   - Survival telemetry status (Oxygen, Power, Suit Temp, Inventory)
   - Persistent versioned research journal review & export
   - Saved spacecraft integration (SU_SAVED_ROCKET)
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.core || !SU.core.ready) return;

  var BADGE = {
    established: { cls: 'established', label: 'ESTABLISHED FACT' },
    measured: { cls: 'measured', label: 'MEASURED (ROVER/ORBITER)' },
    model: { cls: 'model', label: 'SCIENTIFIC MODEL' },
    simulated: { cls: 'simulated', label: 'SIMULATED DATA' }
  };

  function storageKey(key) { return 'su_research_v1_' + key; }

  function loadState(key) {
    var f = freshState();
    try {
      var raw = window.localStorage.getItem(storageKey(key));
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === 'object') {
          return {
            counts: Object.assign({}, f.counts, s.counts || {}),
            scannedIds: Array.isArray(s.scannedIds) ? s.scannedIds : [],
            minerals: Array.isArray(s.minerals) ? s.minerals : [],
            measurements: Object.assign({}, f.measurements, s.measurements || {}),
            values: s.values || {},
            atmosphereSampled: !!s.atmosphereSampled,
            habitabilityDone: !!s.habitabilityDone,
            hab: s.hab || null,
            completed: Array.isArray(s.completed) ? s.completed : [],
            creditAwarded: !!s.creditAwarded,
            log: Array.isArray(s.log) ? s.log.slice(0, 40) : []
          };
        }
      }
    } catch (e) {}
    return f;
  }

  function freshState() {
    return {
      counts: { geo: 0, atm: 0, mineral: 0 },
      scannedIds: [],
      minerals: [],
      measurements: { gravity: false, temp: false, pressure: false },
      values: {},
      atmosphereSampled: false,
      habitabilityDone: false,
      hab: null,
      completed: [],
      creditAwarded: false,
      log: []
    };
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  SU.research = {
    create: function (opts) {
      var surface = opts.surface;
      var container = opts.container;
      var planet = SU.data.getPlanet(opts.planetKey);
      var onToast = opts.onToast || function () {};
      var onCredits = opts.onCredits || function () {};
      var onChange = opts.onChange || function () {};
      var state = loadState(planet.key) || freshState();
      var busy = false;

      function save() {
        try { window.localStorage.setItem(storageKey(planet.key), JSON.stringify(state)); } catch (e) {}
      }

      function badge(evidence) {
        var b = BADGE[evidence] || BADGE.simulated;
        return '<span class="su-badge ' + b.cls + '">' + b.label + '</span>';
      }

      /* ------------------------------------------------------------- markup */
      function render() {
        container.innerHTML =
          '<div class="su-card su-research">' +
            '<div class="su-card-head"><span>PLANETARY RESEARCH</span><span class="su-chip" id="suResearchPlanet">' + esc(planet.name) + '</span></div>' +
            '<div class="su-sub" id="suResearchSub"></div>' +
            
            '<!-- Survival Environmental Gauges (Deep Space V2) -->' +
            '<div class="su-survival-grid" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px;margin:8px 0;background:rgba(15,23,42,0.85);padding:8px;border-radius:10px;border:1px solid rgba(56,189,248,0.25)">' +
              '<div style="text-align:center"><small style="font-size:9px;color:#94a3b8;display:block">OXYGEN</small><b id="suSurvO2" style="color:#38bdf8;font-size:12px">100%</b></div>' +
              '<div style="text-align:center"><small style="font-size:9px;color:#94a3b8;display:block">POWER</small><b id="suSurvPwr" style="color:#f59e0b;font-size:12px">100%</b></div>' +
              '<div style="text-align:center"><small style="font-size:9px;color:#94a3b8;display:block">SUIT TEMP</small><b id="suSurvTemp" style="color:#22c55e;font-size:12px">21°C</b></div>' +
              '<div style="text-align:center"><small style="font-size:9px;color:#94a3b8;display:block">INVENTORY</small><b id="suSurvInv" style="color:#a78bfa;font-size:12px">0/6</b></div>' +
            '</div>' +

            '<div class="su-scan-hint" id="suScanHint">SCAN цэг хайж байна…</div>' +
            '<div class="su-tool-grid" style="grid-template-columns:repeat(3, 1fr)">' +
              '<button type="button" class="su-tool" data-tool="scan"><b>SCAN</b><small>Raycast / Цэг</small></button>' +
              '<button type="button" class="su-tool" data-tool="dig" style="border-color:#eab308"><b>DIG [G]</b><small>Хөрс ухах</small></button>' +
              '<button type="button" class="su-tool" data-tool="collect" style="border-color:#38bdf8"><b>COLLECT</b><small>Дээж авах [E]</small></button>' +
              '<button type="button" class="su-tool" data-tool="analyze" style="border-color:#22c55e"><b>ANALYZE</b><small>Станцын лаб</small></button>' +
              '<button type="button" class="su-tool" data-tool="buildbase" style="border-color:#e879f9"><b>BUILD BASE</b><small>Модуль [B]</small></button>' +
              '<button type="button" class="su-tool" data-tool="dropsonde" style="border-color:#f59e0b"><b>DROPSONDE</b><small>Гүн зонд [D]</small></button>' +
              '<button type="button" class="su-tool" data-tool="radar" style="border-color:#06b6d4"><b>GPR RADAR</b><small>Мөс/далай [R]</small></button>' +
              '<button type="button" class="su-tool" data-tool="genesis" style="border-color:#34d399"><b>GENESIS LAB</b><small>Амьдралын үүсэл</small></button>' +
              '<button type="button" class="su-tool" data-tool="journal" style="border-color:#f59e0b"><b>JOURNAL</b><small>Тэмдэглэл</small></button>' +
              '<button type="button" class="su-tool" data-tool="gravity"><b>GRAVITY</b><small>Чөлөөт уналт</small></button>' +
              '<button type="button" class="su-tool" data-tool="temp"><b>TEMP</b><small>Радиометр</small></button>' +
              '<button type="button" class="su-tool" data-tool="pressure"><b>PRESSURE</b><small>Барометр</small></button>' +
              '<button type="button" class="su-tool" data-tool="hab"><b>HABITABILITY</b><small>Загвар</small></button>' +
              '<button type="button" class="su-tool" data-tool="export"><b>EXPORT</b><small>Тайлан</small></button>' +
            '</div>' +
            '<div class="su-progress" id="suProgressWrap" hidden><div class="su-progress-label" id="suProgressLabel"></div><div class="su-progress-track"><i id="suProgressBar"></i></div></div>' +
            '<div id="suScanFeedback"></div>' +
            '<div class="su-section-title">ACTIVE MISSION</div>' +
            '<div id="suMissions"></div>' +
            '<div class="su-section-title">ATMOSPHERE SAMPLE</div>' +
            '<div id="suAtmo"></div>' +
            '<div class="su-section-title">MEASUREMENTS</div>' +
            '<div id="suMeasure"></div>' +
            '<div id="suHabWrap"></div>' +
            '<div class="su-section-title">EVIDENCE LOG <span id="suLogCount"></span></div>' +
            '<div class="su-log" id="suLog"></div>' +
          '</div>';

        container.querySelectorAll('[data-tool]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var tool = btn.getAttribute('data-tool');
            if (tool === 'scan') startScan();
            else if (tool === 'dig') triggerDig();
            else if (tool === 'collect') triggerCollect();
            else if (tool === 'analyze') triggerAnalyze();
            else if (tool === 'buildbase') {
              if (surface && surface.deployStructure) surface.deployStructure('hab');
            }
            else if (tool === 'dropsonde') startDropsonde();
            else if (tool === 'radar') startRadar();
            else if (tool === 'genesis') showGenesisLabModal();
            else if (tool === 'journal') showJournalModal();
            else if (tool === 'gravity' || tool === 'temp' || tool === 'pressure') startMeasure(tool);
            else if (tool === 'hab') startHabitability();
            else if (tool === 'export') exportReport();
          });
        });
        refresh();
      }

      /* ------------------------------------------------------------ progress */
      function progress(duration, label, done) {
        var wrap = container.querySelector('#suProgressWrap');
        var bar = container.querySelector('#suProgressBar');
        var lbl = container.querySelector('#suProgressLabel');
        if (!wrap || !bar) { done(); return; }
        busy = true;
        setButtonsDisabled(true);
        wrap.hidden = false;
        lbl.textContent = label;
        bar.style.width = '0%';
        var start = performance.now();
        function frame(now) {
          if (!container || !container.querySelector('#suProgressBar')) return;
          var t = Math.min(1, (now - start) / duration);
          bar.style.width = (t * 100).toFixed(1) + '%';
          if (t < 1) requestAnimationFrame(frame);
          else {
            wrap.hidden = true;
            busy = false;
            setButtonsDisabled(false);
            done();
            onChange();
          }
        }
        requestAnimationFrame(frame);
      }

      function setButtonsDisabled(disabled) {
        container.querySelectorAll('[data-tool]').forEach(function (b) {
          if (b.getAttribute('data-tool') === 'export' || b.getAttribute('data-tool') === 'journal') return;
          b.disabled = disabled;
        });
      }

      function feedback(html, cls) {
        var el = container.querySelector('#suScanFeedback');
        if (!el) return;
        el.innerHTML = '<div class="su-result ' + (cls || '') + '">' + html + '</div>';
      }

      /* --------------------------------------------------------------- scans */
      function startScan() {
        if (busy) return;
        
        // Try true 3D raycast first
        var rayHit = surface.getRaycastTarget ? surface.getRaycastTarget(14) : null;
        if (rayHit && rayHit.type === 'rock') {
          progress(1100, '3D Raycast сканнер: ' + rayHit.data.name, function () {
            completeRockScan(rayHit);
          });
          return;
        }

        var target = surface.getNearestTarget(8.5, true);
        if (!target) {
          feedback('<b>Сканнердах цэг олдсонгүй.</b><p>3D чулуулаг эсвэл гэрэлтдэг BEACON руу ойртож түүн рүү харна уу. RESEARCH горимд цэгүүд харагдана.</p>', 'warn');
          onToast('Ойролцоо сканнердах цэг алга', 'warn');
          return;
        }
        progress(1200, 'Сканнердах: ' + target.name, function () { completeScan(target); });
      }

      function completeRockScan(rayHit) {
        if (!rayHit || !rayHit.data) return;
        var d = rayHit.data;
        var entry = {
          title: d.name,
          type: 'geo',
          evidence: 'measured',
          body: 'Ангилал: ' + d.classification + ' | Найрлага: ' + d.composition + ' | Тодорхойлолт: ' + (d.desc || ''),
          note: d.confidence + ' · Зай: ' + rayHit.distance.toFixed(1) + ' метр',
          stamp: Date.now()
        };
        state.log.unshift(entry);
        if (state.log.length > 40) state.log.length = 40;
        state.counts.geo = (state.counts.geo || 0) + 1;
        save();

        feedback('<div class="su-result-head">' + esc(entry.title) + badge('measured') + '</div><p>' + esc(entry.body) + '</p><small>' + esc(entry.note) + '</small>', 'ok');
        refresh();
        checkMissions();
      }

      function triggerDig() {
        if (busy) return;
        if (surface && surface.digTerrain) {
          progress(900, 'Хөрс ухаж нүх гаргаж байна...', function () {
            var mod = surface.digTerrain(3.0, 1.8);
            if (mod) {
              feedback('<b>⛏️ ХӨРС УХАВ (TERRAIN EXCAVATION)</b><p>Байршил: (' + mod.x.toFixed(1) + ', ' + mod.z.toFixed(1) + ') | Радиус: ' + mod.radius + 'м | Гүн: ' + mod.depth + 'м<br>Гадарга хэлбэрээ өөрчилж, өөрчлөлт хадгалагдлаа.</p>', 'good');
              refresh();
            }
          });
        }
      }

      function triggerCollect() {
        if (busy) return;
        var rayHit = surface.getRaycastTarget ? surface.getRaycastTarget(4.5) : null;
        if (rayHit && rayHit.type === 'rock') {
          var sample = surface.collectSample(rayHit.mesh);
          if (sample) {
            feedback('<b>ДЭЭЖ ЦУГЛУУЛАВ: ' + esc(sample.name) + '</b><p>Жин: ' + sample.massGrams + 'г | Бүтэц: ' + esc(sample.composition) + '<br>Станцын лабораторид аваачиж ANALYZE дарна уу.</p>', 'good');
            refresh();
          }
        } else {
          onToast('⚠️ Ойрхон дээж авах чулуулаг алга! Чулуулаг руу 4.5м дотор ойртоод чиглүүлнэ үү.', 'warn');
        }
      }

      function triggerAnalyze() {
        if (busy) return;
        var isNear = surface.isNearStation ? surface.isNearStation() : false;
        if (!isNear) {
          onToast('⚠️ Станцын лаборатори хол байна! Буух модулийн дэргэд очиж шинжилнэ үү.', 'warn');
          feedback('<b>Станцын лаборатори хол байна.</b><p>Судалгааны станц/Буух модуль руу 5.5 метрийн дотор ойртож дээжээ шинжлүүлнэ үү.</p>', 'warn');
          return;
        }

        var inv = surface.getInventory ? surface.getInventory() : [];
        if (inv.length === 0) {
          onToast('⚠️ Шинжлэх дээж байхгүй! Эхлээд COLLECT товчоор чулуулаг авна уу.', 'warn');
          return;
        }

        progress(1800, 'Спектрометр ба рентген дифракцийн шинжилгээ...', function () {
          var rep = surface.analyzeSample();
          if (rep) {
            var entry = {
              title: 'Лабораторийн шинжилгээ: ' + rep.sampleName,
              type: 'mineral',
              evidence: 'measured',
              body: 'Ангилал: ' + rep.classification + ' | Найрлага: ' + rep.composition + ' | Спектр: ' + rep.spectrometry.siPeak + ', ' + rep.spectrometry.hydratedBand,
              note: rep.confidence + ' · Лабораторийн батлагдсан үр дүн',
              stamp: Date.now()
            };
            state.log.unshift(entry);
            if (state.log.length > 40) state.log.length = 40;
            save();

            feedback('<div class="su-result-head">' + esc(entry.title) + badge('measured') + '</div><p>' + esc(entry.body) + '</p><small>' + esc(entry.note) + '</small>', 'ok');
            refresh();
            checkMissions();
          }
        });
      }

      function startDropsonde() {
        if (busy) return;
        if (!surface || !surface.launchDropsonde) {
          onToast('Энэ орчинд зонд хөөргөх боломжгүй', 'warn');
          return;
        }
        progress(1600, 'Агаар мандлын гүн рүү Dropsonde зонд буулгаж байна...', function () {
          var res = surface.launchDropsonde();
          if (!res) return;
          var layersHtml = (res.layers || []).map(function(l) {
            return '<li style="margin-bottom:3px"><b>' + l.depthKm + ' км</b> (' + l.pressureBar + ' бар, ' + l.tempC + '°C): ' + esc(l.gas) + ' — <small style="color:#94a3b8">' + esc(l.desc) + '</small></li>';
          }).join('');

          var entry = {
            title: res.planetName + ' Агаар Мандлын Гүн Зондчлол',
            type: 'atm',
            evidence: 'measured',
            body: 'Гүний үелбэр: ' + res.layers.length + ' давхарга илрэв. Термодинамик өгөгдөл бүртгэгдэв.',
            note: '[CASSINI / IN-SITU DATA MODEL] Даралт 82 бар хүртэл хэмжилт амжилттай.',
            stamp: Date.now()
          };
          state.log.unshift(entry);
          if (state.log.length > 40) state.log.length = 40;
          state.counts.atm = (state.counts.atm || 0) + 1;
          state.atmosphereSampled = true;
          save();

          feedback('<div class="su-result-head">' + esc(entry.title) + badge('measured') + '</div>' +
            '<ul style="margin:6px 0 6px 16px;padding:0;font-size:11px;color:#e2e8f0">' + layersHtml + '</ul>' +
            '<small>' + esc(entry.note) + '</small>', 'ok');
          refresh();
          checkMissions();
        });
      }

      function startRadar() {
        if (busy) return;
        if (!surface || !surface.scanRadar) {
          onToast('GPR радар бэлэн бус байна', 'warn');
          return;
        }
        progress(1400, 'GPR георадараар хөрсний гүнийг дуу авиа/радио долгионоор сканнердаж байна...', function () {
          var res = surface.scanRadar();
          if (!res) return;
          var soundingsHtml = (res.soundings || []).map(function(s) {
            var note = s.note ? (' <b style="color:#38bdf8">[' + esc(s.note) + ']</b>') : '';
            return '<li style="margin-bottom:3px"><b>' + esc(s.depthM) + '</b>: ' + esc(s.layer) + ' (e=' + s.dielectric + ')' + note + '</li>';
          }).join('');

          var entry = {
            title: res.planetName + ' GPR Гүний Радарын Зондчлол',
            type: 'geo',
            evidence: 'measured',
            body: res.summary,
            note: '[SHARAD / RIME RADAR MODEL] Хөрс ба мөсөн доорх бүтцийг зураглав.',
            stamp: Date.now()
          };
          state.log.unshift(entry);
          if (state.log.length > 40) state.log.length = 40;
          state.counts.geo = (state.counts.geo || 0) + 1;
          save();

          feedback('<div class="su-result-head">' + esc(entry.title) + badge('measured') + '</div>' +
            '<p style="margin:4px 0;font-weight:600;color:#38bdf8">' + esc(res.summary) + '</p>' +
            '<ul style="margin:6px 0 6px 16px;padding:0;font-size:11px;color:#e2e8f0">' + soundingsHtml + '</ul>' +
            '<small>' + esc(entry.note) + '</small>', 'ok');
          refresh();
          checkMissions();
        });
      }

      function showJournalModal() {
        var journal = surface.getJournal ? surface.getJournal() : null;
        var visited = (journal && journal.visitedPlanets) ? Object.keys(journal.visitedPlanets) : [];
        var reports = (journal && journal.reports) ? journal.reports : [];
        var stationUnits = (journal && journal.stationUnits) ? journal.stationUnits : (surface.getDeployedStructures ? surface.getDeployedStructures() : []);
        var rocket = (journal && journal.savedSpacecraft) ? journal.savedSpacecraft : (window.SU_SAVED_ROCKET || null);

        var html = '<div style="position:fixed;inset:0;background:rgba(2,6,23,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px">' +
          '<div style="background:#0f172a;border:1px solid #38bdf8;border-radius:14px;max-width:640px;width:100%;max-height:85vh;overflow-y:auto;padding:20px;color:#f8fafc;font-family:Inter,sans-serif">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid #334155;padding-bottom:10px">' +
              '<div style="font-size:16px;font-weight:700;color:#38bdf8;display:flex;align-items:center;gap:6px"><span>📓</span> СУДАЛГААНЫ ТЭМДЭГЛЭЛ V3 (RESEARCH JOURNAL)</div>' +
              '<button type="button" id="suJournalClose" style="background:#ef4444;border:0;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:700">Хаах</button>' +
            '</div>';

        if (rocket) {
          html += '<div style="background:rgba(56,189,248,0.1);border:1px solid #0284c7;border-radius:8px;padding:10px;margin-bottom:12px;font-size:12px">' +
            '<strong style="color:#38bdf8">🚀 Хөлөг: ' + esc(rocket.name || 'Аполло-SU') + '</strong>' +
            '<div style="color:#cbd5e1;font-size:11px;margin-top:2px">Масс: ' + (rocket.physics ? rocket.physics.wetMassTon : '546') + 'т | TWR: ' + (rocket.physics ? rocket.physics.twr : '1.57') + ' | Δv: ' + (rocket.physics ? rocket.physics.deltaVM_S : '11,384') + ' м/с</div>' +
          '</div>';
        }

        html += '<div style="font-size:13px;font-weight:700;margin-bottom:6px;color:#e2e8f0">Айлчилсан гарагууд (' + visited.length + '):</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
            visited.map(function(k) { return '<span style="background:#1e293b;border:1px solid #475569;border-radius:12px;padding:3px 10px;font-size:11px;color:#93c5fd">' + esc(k.toUpperCase()) + '</span>'; }).join('') +
          '</div>';

        if (stationUnits.length > 0) {
          html += '<div style="font-size:13px;font-weight:700;margin-bottom:6px;color:#e879f9">Байрлуулсан Судалгааны Станцын Модулиуд (' + stationUnits.length + '):</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">' +
              stationUnits.map(function(u) { return '<span style="background:#1e1b4b;border:1px solid #c084fc;border-radius:8px;padding:3px 8px;font-size:10px;color:#f5d0fe">🏛️ ' + esc(u.name) + ' (' + esc(u.planetKey) + ')</span>'; }).join('') +
            '</div>';
        }

        html += '<div style="font-size:13px;font-weight:700;margin-bottom:6px;color:#e2e8f0">Лабораторид шинжилсэн дээжүүд (' + reports.length + '):</div>';
        if (!reports.length) {
          html += '<div style="color:#64748b;font-size:12px;margin-bottom:12px">Одоогоор шинжилсэн дээж бүртгэгдээгүй байна. Чулуулаг дээр COLLECT дарж дээж аваад, станцын лабораторид ANALYZE дарна уу.</div>';
        } else {
          html += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">';
          reports.slice(0, 10).forEach(function(r) {
            var biosigTag = (r.spectrometry && r.spectrometry.biosignatureStatus) ? (' · <b style="color:#34d399">' + esc(r.spectrometry.biosignatureStatus) + '</b>') : '';
            html += '<div style="background:#1e293b;border-radius:8px;padding:10px;border-left:3px solid #38bdf8;font-size:12px">' +
              '<div style="font-weight:700;color:#fde047;display:flex;justify-content:space-between"><span>' + esc(r.sampleName) + '</span><small style="color:#94a3b8">' + esc(r.planetName || r.planetKey) + '</small></div>' +
              '<div style="color:#94a3b8;font-size:11px;margin-top:2px">Ангилал: ' + esc(r.classification) + ' · Жин: ' + r.massGrams + 'г' + biosigTag + '</div>' +
              '<div style="color:#cbd5e1;font-size:11px;margin-top:2px">Бүтэц: ' + esc(r.composition) + '</div>' +
              '<div style="color:#38bdf8;font-size:10px;margin-top:2px">' + esc(r.confidence) + '</div>' +
            '</div>';
          });
          html += '</div>';
        }

        html += '</div></div>';

        var modalDiv = document.createElement('div');
        modalDiv.id = 'suJournalModalRoot';
        modalDiv.innerHTML = html;
        document.body.appendChild(modalDiv);
        document.getElementById('suJournalClose').onclick = function() {
          modalDiv.remove();
        };
      }

      function showGenesisLabModal() {
        var modalDiv = document.createElement('div');
        modalDiv.id = 'suGenesisLabModalRoot';
        modalDiv.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.92);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';
        
        var wrap = document.createElement('div');
        wrap.style.cssText = 'background:#0f172a;border:1px solid #38bdf8;border-radius:14px;max-width:850px;width:100%;height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.85)';
        
        var topBar = document.createElement('div');
        topBar.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-bottom:1px solid #334155;background:#090d16';
        topBar.innerHTML = '<span style="font-weight:700;color:#38bdf8;font-size:15px">🧬 LIFE GENESIS & HABITABILITY LAB V3</span>';
        
        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Хаах';
        closeBtn.style.cssText = 'background:#ef4444;border:0;color:#fff;border-radius:6px;padding:4px 12px;cursor:pointer;font-weight:700';
        closeBtn.onclick = function() {
          if (mod) mod.dispose();
          modalDiv.remove();
        };
        topBar.appendChild(closeBtn);
        wrap.appendChild(topBar);

        var bodyDiv = document.createElement('div');
        bodyDiv.style.cssText = 'flex:1;overflow-y:auto;padding:10px';
        wrap.appendChild(bodyDiv);
        modalDiv.appendChild(wrap);
        document.body.appendChild(modalDiv);

        var Cls = window.LifeGenesisModule || (typeof LifeGenesisModule !== 'undefined' ? LifeGenesisModule : null);
        var mod = null;
        if (Cls) {
          mod = new Cls();
          mod.mount(bodyDiv);
          if (mod.setWorld && planet && planet.key) {
            mod.setWorld(planet.key);
          }
        }
      }

      function compositionText(p) {
        if (!p.atmosphere || !p.atmosphere.length) return 'Хэмжигдэхүүн агаар мандал байхгүй (вакуум).';
        return p.atmosphere.map(function (a) { return a.gas + ' — ' + a.pct + '%'; }).join(' · ');
      }

      function completeScan(target) {
        if (!target) return;
        if (state.scannedIds.indexOf(target.id) === -1) state.scannedIds.push(target.id);
        surface.markScanned(target.id);

        state.counts[target.type] = (state.counts[target.type] || 0) + 1;
        var evidence = target.evidence || 'established';
        var body = target.desc;

        if (target.type === 'atm') {
          state.atmosphereSampled = true;
          body = compositionText(planet) + '. Даралт: ' + SU.data.pressureLabel(planet.pressureAtm) + '. ' + (target.desc || '');
        } else if (target.type === 'mineral') {
          var pool = (planet.minerals || []).filter(function (m) { return state.minerals.indexOf(m.name) === -1; });
          var mineral = pool[0] || (planet.minerals && planet.minerals[0]);
          if (mineral) {
            state.minerals.push(mineral.name);
            evidence = mineral.evidence || evidence;
            body = mineral.name + ' — ' + mineral.desc + ' ' + (target.desc || '');
          }
        }

        var entry = {
          title: target.name,
          type: target.type,
          evidence: evidence,
          body: body,
          note: target.type === 'geo' ? 'Байршил нь симуляц; геологийн тодорхойлолт нь баталгаажсан мэдээлэл.' : '',
          stamp: Date.now()
        };
        state.log.unshift(entry);
        if (state.log.length > 40) state.log.length = 40;
        save();
        feedback('<div class="su-result-head">' + esc(entry.title) + badge(entry.evidence) + '</div><p>' + esc(entry.body) + '</p>' + (entry.note ? '<small>' + esc(entry.note) + '</small>' : ''), 'ok');
        refresh();
        checkMissions();
      }

      /* --------------------------------------------------------- measurements */
      function startMeasure(kind) {
        if (busy) return;
        if (state.measurements[kind]) { onToast('Энэ хэмжилт аль хэдийн хийгдсэн'); return; }
        if (kind === 'gravity') {
          var h = 5;
          var t = Math.sqrt(2 * h / planet.gravity);
          progress(1400, 'Туршилтын масс унагаж хурдатгал хэмжиж байна…', function () {
            state.measurements.gravity = true;
            state.values.gravity = planet.gravity;
            var entry = {
              title: 'Гадаргын таталцлын хурдатгал',
              type: 'geo',
              evidence: 'established',
              body: 'Туршилтын 5 м өндрөөс чөлөөт уналт: ' + t.toFixed(2) + ' с. Тооцсон g = ' + planet.gravity + ' м/с² (' + (planet.gravity / 9.81).toFixed(2) + ' g).',
              note: 'Хэмжигдсэн утга нь бодит одон орны өгөгдөлтэй таарч байна.',
              stamp: Date.now()
            };
            state.log.unshift(entry);
            save();
            feedback('<div class="su-result-head">' + esc(entry.title) + badge('established') + '</div><p>' + esc(entry.body) + '</p>', 'ok');
            refresh();
            checkMissions();
          });
        } else if (kind === 'temp') {
          progress(1200, 'Хэт улаан туяаны радиометрээр хэмжиж байна…', function () {
            state.measurements.temp = true;
            state.values.temp = planet.tempMean;
            var entry = {
              title: 'Гадаргын температур',
              type: 'atm',
              evidence: 'established',
              body: 'Дундаж: ' + planet.tempMean + ' °C (хамгийн бага ' + planet.tempMin + ' °C … хамгийн их ' + planet.tempMax + ' °C).',
              note: planet.airless ? 'Агаар мандалгүй тул өдөр/шөнийн температурын зөрүү эрс тэс.' : 'Агаар мандлын хүлэмжийн нөлөө ба дулаан дамжуулалттай.',
              stamp: Date.now()
            };
            state.log.unshift(entry);
            save();
            feedback('<div class="su-result-head">' + esc(entry.title) + badge('established') + '</div><p>' + esc(entry.body) + '</p>', 'ok');
            refresh();
            checkMissions();
          });
        } else if (kind === 'pressure') {
          progress(1200, 'Барометрийн мэдрэгчээр хэмжиж байна…', function () {
            state.measurements.pressure = true;
            state.values.pressure = planet.pressureAtm;
            var entry = {
              title: 'Гадаргын агаарын даралт',
              type: 'atm',
              evidence: 'established',
              body: 'Хэмжигдсэн даралт: ' + SU.data.pressureLabel(planet.pressureAtm) + ' (' + planet.pressureAtm + ' атм).',
              note: planet.type === 'gas' ? 'Аэростат тавцангийн 1 бар лавлагааны түвшинд хийсэн хэмжилт.' : '',
              stamp: Date.now()
            };
            state.log.unshift(entry);
            save();
            feedback('<div class="su-result-head">' + esc(entry.title) + badge('established') + '</div><p>' + esc(entry.body) + '</p>', 'ok');
            refresh();
            checkMissions();
          });
        }
      }

      /* -------------------------------------------------------- habitability */
      function startHabitability() {
        if (busy) return;
        progress(1500, 'Амьдрал тэтгэх индексийг тооцоолж байна…', function () {
          var hab = SU.data.computeHabitability(planet, state.measurements);
          state.habitabilityDone = true;
          state.hab = hab;
          var entry = {
            title: 'Амьдрал тэтгэх загварын үнэлгээ',
            type: 'geo',
            evidence: 'model',
            body: 'Нийт оноо: ' + hab.total + '/100. ' + hab.verdict + ' (Температур: ' + hab.temp + '/25, Даралт: ' + hab.pressure + '/20, Ус/Мөс: ' + hab.water + '/25, Цацраг: ' + hab.radiation + '/15, Таталцал: ' + hab.gravity + '/15).',
            note: 'Загварын тооцоолол. Дэлхийтэй харьцуулсан оноо.',
            stamp: Date.now()
          };
          state.log.unshift(entry);
          save();
          feedback('<div class="su-result-head">' + esc(entry.title) + badge('model') + '</div><p>' + esc(entry.body) + '</p>', 'ok');
          refresh();
          checkMissions();
        });
      }

      /* ------------------------------------------------------------- missions */
      function missionDone() {
        var map = {};
        state.completed.forEach(function (id) { map[id] = true; });
        return map;
      }

      function checkMissions() {
        var list = SU.data.makeMissions(planet);
        var changed = false;
        list.forEach(function (m) {
          if (state.completed.indexOf(m.id) !== -1) return;
          var ok = false;
          if (m.type === 'scan_count') {
            var total = state.counts.geo + state.counts.atm + state.counts.mineral;
            ok = total >= m.count;
          } else if (m.type === 'scan_type') {
            ok = (state.counts[m.scanType] || 0) >= m.count;
          } else if (m.type === 'measure') {
            ok = !!state.measurements[m.measure];
          } else if (m.type === 'hab') {
            ok = state.habitabilityDone;
          } else if (m.type === 'atm_sample') {
            ok = state.atmosphereSampled;
          } else if (m.type === 'mineral_count') {
            ok = state.minerals.length >= m.count;
          }
          if (ok) {
            state.completed.push(m.id);
            changed = true;
            onToast('Даалгавар биеллээ: ' + m.text, 'good');
          }
        });
        if (changed) {
          save();
          if (!state.creditAwarded && state.completed.length === list.length && list.length > 0) {
            state.creditAwarded = true;
            save();
            onCredits(100);
            onToast('Баяр хүргэе! Энэ эрхсийн бүх судалгааны даалгавар биелж 100 Кредит нэмэгдлээ!', 'good');
          }
        }
      }

      /* --------------------------------------------------------------- render */
      function refresh() {
        var sub = container.querySelector('#suResearchSub');
        if (sub) {
          sub.textContent = planet.en + ' · ' + (planet.type === 'gas' ? 'AEROSTAT PLATFORM' : 'SURFACE ZONE') + ' · ' + (state.counts.geo + state.counts.atm + state.counts.mineral) + ' сканнердсан';
        }

        // Update Survival Gauges
        var readout = surface.getReadout ? surface.getReadout() : null;
        if (readout && readout.survival) {
          var o2El = container.querySelector('#suSurvO2');
          if (o2El) {
            o2El.textContent = Math.round(readout.survival.oxygen) + '%';
            o2El.style.color = readout.survival.oxygen < 25 ? '#ef4444' : '#38bdf8';
          }
          var pwrEl = container.querySelector('#suSurvPwr');
          if (pwrEl) {
            pwrEl.textContent = Math.round(readout.survival.power) + '%';
            pwrEl.style.color = readout.survival.power < 25 ? '#ef4444' : '#f59e0b';
          }
          var tempEl = container.querySelector('#suSurvTemp');
          if (tempEl) tempEl.textContent = readout.survival.suitTempC + '°C';
          var invEl = container.querySelector('#suSurvInv');
          if (invEl) invEl.textContent = (readout.inventoryCount || 0) + '/6';
        }

        // Missions markup
        var mEl = container.querySelector('#suMissions');
        if (mEl) {
          var mList = SU.data.makeMissions(planet);
          var dMap = missionDone();
          mEl.innerHTML = mList.map(function (m) {
            var done = !!dMap[m.id];
            return '<div class="su-mission-item ' + (done ? 'done' : '') + '">' +
              '<span class="su-chk">' + (done ? '✓' : '') + '</span>' +
              '<span>' + esc(m.text) + '</span>' +
            '</div>';
          }).join('');
        }

        // Atmosphere status
        var aEl = container.querySelector('#suAtmo');
        if (aEl) {
          aEl.innerHTML = '<div class="su-atmo-box">' +
            '<div><b>Найрлага:</b> ' + esc(compositionText(planet)) + '</div>' +
            '<div><b>Даралт:</b> ' + SU.data.pressureLabel(planet.pressureAtm) + '</div>' +
            '<div><b>Төлөв:</b> ' + (state.atmosphereSampled ? '<span class="su-ok">Дээжлэгдсэн ✓</span>' : '<span class="su-muted">Дээж аваагүй</span>') + '</div>' +
          '</div>';
        }

        // Measurements markup
        var meEl = container.querySelector('#suMeasure');
        if (meEl) {
          var items = [
            { k: 'gravity', name: 'Таталцал', val: state.measurements.gravity ? (planet.gravity + ' м/с²') : 'хэмжээгүй' },
            { k: 'temp', name: 'Температур', val: state.measurements.temp ? (planet.tempMean + ' °C') : 'хэмжээгүй' },
            { k: 'pressure', name: 'Даралт', val: state.measurements.pressure ? SU.data.pressureLabel(planet.pressureAtm) : 'хэмжээгүй' }
          ];
          meEl.innerHTML = '<div class="su-measure-grid">' +
            items.map(function (i) {
              return '<div><small>' + i.name + '</small><b>' + i.val + '</b></div>';
            }).join('') +
          '</div>';
        }

        // Habitability markup
        var hEl = container.querySelector('#suHabWrap');
        if (hEl) {
          if (state.habitabilityDone && state.hab) {
            hEl.innerHTML = '<div class="su-hab-card">' +
              '<div class="su-hab-score">' + state.hab.total + '<span>/100</span></div>' +
              '<div class="su-hab-body"><b>' + esc(state.hab.verdict) + '</b><small>Загвар: Т ' + state.hab.temp + ' · P ' + state.hab.pressure + ' · g ' + state.hab.gravity + ' · H₂O ' + state.hab.water + ' · Rad ' + state.hab.radiation + '</small></div>' +
            '</div>';
          } else {
            hEl.innerHTML = '<div class="su-muted" style="margin-top:6px">Амьдрал тэтгэх индексийг үнэлээгүй байна.</div>';
          }
        }

        // Evidence log markup
        var logEl = container.querySelector('#suLog');
        if (logEl) {
          var countEl = container.querySelector('#suLogCount');
          if (countEl) countEl.textContent = '(' + state.log.length + ')';
          logEl.innerHTML = state.log.length
            ? state.log.map(function (e) {
                return '<div class="su-log-entry"><div class="su-log-head"><b>' + esc(e.title) + '</b>' + badge(e.evidence) + '</div>' +
                  '<p>' + esc(e.body) + '</p>' + (e.note ? '<small style="color:#94a3b8;font-size:10px">' + esc(e.note) + '</small>' : '') + '</div>';
              }).join('')
            : '<div class="su-muted">Судалгааны бүртгэл хоосон. SCAN эсвэл хэмжилтээр эхэлнэ үү.</div>';
        }

        updatePrompt();
      }

      function updatePrompt() {
        var hint = container.querySelector('#suScanHint');
        if (!hint) return;

        // 1. Raycast detection (Deep Space V2)
        var rayHit = surface.getRaycastTarget ? surface.getRaycastTarget(12) : null;
        if (rayHit && rayHit.type === 'rock') {
          hint.innerHTML = '🎯 [3D RAYCAST]: <b>' + esc(rayHit.data.name) + '</b> (' + rayHit.distance.toFixed(1) + 'м) · ' + esc(rayHit.data.confidence);
          hint.classList.add('ready');
          return;
        }

        // 2. Research station proximity
        if (surface.isNearStation && surface.isNearStation()) {
          var inv = surface.getInventory ? surface.getInventory() : [];
          hint.innerHTML = '🔬 [СТАНЦЫН ЛАБ]: ' + (inv.length > 0 ? 'Дээжээ спектрометрт оруулна уу [E] / ANALYZE' : 'Буух станцын бүс (Амьдрах систем цэнэглэгдэж байна)');
          hint.classList.add('ready');
          return;
        }

        // 3. Fallback to nearest beacon
        var near = surface.getNearestTarget(8.5, false);
        if (near) {
          hint.textContent = 'SCAN → ' + near.name + ' (' + near.type.toUpperCase() + ')';
          hint.classList.add('ready');
        } else {
          hint.textContent = 'Ойролцоо SCAN цэг алга — чулуулаг руу ойртоод чиглүүлнэ үү';
          hint.classList.remove('ready');
        }
      }

      /* --------------------------------------------------------------- export */
      function exportReport() {
        var lines = [];
        lines.push('SCIENCE UNIVERSE — PLANETARY RESEARCH REPORT');
        lines.push('Planet: ' + planet.name + ' (' + planet.en + ')');
        lines.push('Generated: ' + new Date().toISOString());
        lines.push('Mode: ' + (planet.type === 'gas' ? 'Aerostat platform (SIMULATED)' : 'Surface landing zone (simulated placement)'));
        lines.push('');
        lines.push('ESTABLISHED PLANETARY FACTS');
        lines.push('  Radius: ' + planet.radiusKm + ' km');
        lines.push('  Surface gravity: ' + planet.gravity + ' m/s²');
        lines.push('  Mean temperature: ' + planet.tempMean + ' °C (' + planet.tempMin + ' … ' + planet.tempMax + ')');
        lines.push('  Surface pressure: ' + SU.data.pressureLabel(planet.pressureAtm));
        lines.push('  Atmosphere: ' + compositionText(planet));
        lines.push('');
        lines.push('MISSION OBJECTIVES');
        var doneMap = missionDone();
        SU.data.makeMissions(planet).forEach(function (m) {
          lines.push('  [' + (doneMap[m.id] ? 'x' : ' ') + '] ' + m.text);
        });
        lines.push('');
        lines.push('MEASUREMENTS & EXPERIMENTS');
        lines.push('  Gravity: ' + (state.measurements.gravity ? (planet.gravity + ' m/s²') : 'not measured'));
        lines.push('  Temperature: ' + (state.measurements.temp ? (planet.tempMean + ' °C') : 'not measured'));
        lines.push('  Pressure: ' + (state.measurements.pressure ? SU.data.pressureLabel(planet.pressureAtm) : 'not measured'));
        lines.push('  Minerals sampled: ' + (state.minerals.length ? state.minerals.join(', ') : 'none'));
        lines.push('');
        lines.push('HABITABILITY (MODEL ESTIMATE)');
        if (state.hab) {
          lines.push('  Score: ' + state.hab.total + '/100');
          lines.push('  T ' + state.hab.temp + ' | P ' + state.hab.pressure + ' | g ' + state.hab.gravity + ' | H2O ' + state.hab.water + ' | Rad ' + state.hab.radiation);
        } else {
          lines.push('  Not computed');
        }
        lines.push('');
        lines.push('EVIDENCE LOG (' + state.log.length + ' ENTRIES)');
        state.log.forEach(function (e, idx) {
          lines.push('  ' + (idx + 1) + '. ' + e.title + ' [' + (BADGE[e.evidence] ? BADGE[e.evidence].label : e.evidence) + ']');
          lines.push('     ' + e.body);
          if (e.note) lines.push('     Note: ' + e.note);
        });

        var blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'SCIENCE_UNIVERSE_' + planet.key.toUpperCase() + '_RESEARCH_REPORT.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
        onToast('Тайлан амжилттай татагдлаа', 'good');
      }

      function applyScanned() {
        state.scannedIds.forEach(function (id) { surface.markScanned(id); });
      }

      render();
      applyScanned();

      return {
        render: render,
        refresh: refresh,
        updatePrompt: updatePrompt,
        startScan: startScan,
        triggerCollect: triggerCollect,
        triggerAnalyze: triggerAnalyze,
        showJournalModal: showJournalModal,
        exportReport: exportReport,
        getState: function () { return state; },
        getPlanet: function () { return planet; },
        container: container
      };
    }
  };
})();
