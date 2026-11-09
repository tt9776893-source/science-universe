/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 · PLANET SANDBOX (COLONY ZERO)
   File: js/space/su-sandbox.js
   Grid builder + resource simulation. Fictional simulation with plausible
   constraints (power, gravity load, ice, sunlight, temperature).
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.core || !SU.core.ready || !SU.data) return;

  var C = SU.core;
  var GRID = 8;
  var CELL = 2;
  var HALF = GRID * CELL / 2;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function keyFor(planetKey) { return 'su_sandbox_v1_' + planetKey; }

  function freshState(planet) {
    return {
      grid: (function () {
        var g = [];
        for (var r = 0; r < GRID; r++) { g.push([]); for (var c = 0; c < GRID; c++) g[r].push(null); }
        return g;
      })(),
      alloy: 1000,
      sol: 0,
      env: { tempOffset: 0, ice: 40 },
      resources: { power: 0, water: 24, oxygen: 24, food: 12, research: 0, minerals: 0, temp: planet.tempMean },
      log: [{ sol: 0, text: 'Колони үүсгэгдлээ. Модуль байрлуулж эхэлнэ үү.' }]
    };
  }

  function loadState(planet) {
    var f = freshState(planet);
    try {
      var raw = window.localStorage.getItem(keyFor(planet.key));
      if (!raw) return f;
      var s = JSON.parse(raw);
      if (!s || typeof s !== 'object') return f;
      var validIds = {};
      SU.data.MODULES.forEach(function (m) { validIds[m.id] = true; });
      var grid = f.grid;
      if (Array.isArray(s.grid)) {
        for (var r = 0; r < GRID; r++) {
          if (!Array.isArray(s.grid[r])) continue;
          for (var c = 0; c < GRID; c++) {
            var id = s.grid[r][c];
            grid[r][c] = (typeof id === 'string' && validIds[id]) ? id : null;
          }
        }
      }
      return {
        grid: grid,
        alloy: typeof s.alloy === 'number' && isFinite(s.alloy) ? Math.max(0, s.alloy) : 1000,
        sol: typeof s.sol === 'number' && isFinite(s.sol) ? Math.max(0, Math.floor(s.sol)) : 0,
        env: Object.assign({}, f.env, s.env || {}),
        resources: Object.assign({}, f.resources, s.resources || {}),
        log: Array.isArray(s.log) ? s.log.slice(0, 20) : []
      };
    } catch (e) { return f; }
  }

  SU.sandbox = {
    create: function (opts) {
      var renderer = opts.renderer;
      var canvas = opts.canvas;
      var container = opts.container;
      var planet = SU.data.getPlanet(opts.planetKey);
      var onToast = opts.onToast || function () {};
      var onChange = opts.onChange || function () {};

      var state = loadState(planet);
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(52, 1, 0.1, 400);
      scene.background = new THREE.Color(planet.sky);
      scene.fog = new THREE.Fog(planet.fog, 45, 150);

      var active = false;
      var selectedTool = null;
      var drag = null;
      var hoverCell = null;
      var simTimer = null;
      var runRemaining = 0;
      var confirmReset = false;
      var time = 0;

      var moduleGroup = new THREE.Group();
      scene.add(moduleGroup);
      var meshByCell = {};
      var highlight = null;
      var raycaster = new THREE.Raycaster();
      var pointer = new THREE.Vector2();
      var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      var camYaw = 0.85, camPitch = 0.78, camDist = 26;
      var camTarget = new THREE.Vector3(0, 1, 0);

      scene.add(new THREE.HemisphereLight(0xdbeafe, 0x3b2f24, 0.8));
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      var sun = new THREE.DirectionalLight(0xfff0d0, 1.2);
      sun.position.set(-30, 45, -20);
      scene.add(sun);

      /* ---------------------------------------------------------------- scene */
      function buildScene() {
        var pad = new THREE.Mesh(
          new THREE.BoxGeometry(GRID * CELL + 2.5, 0.35, GRID * CELL + 2.5),
          new THREE.MeshStandardMaterial({ color: planet.palette[1], roughness: 0.95, metalness: 0.04 })
        );
        pad.position.y = -0.18;
        scene.add(pad);

        var grid = new THREE.GridHelper(GRID * CELL, GRID, 0x38bdf8, 0x334155);
        grid.position.y = 0.01;
        grid.material.opacity = 0.55;
        grid.material.transparent = true;
        scene.add(grid);

        // Perimeter beacons
        for (var i = 0; i < 4; i++) {
          var a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          var post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.09, 0.12, 1.6, 6),
            new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 })
          );
          post.position.set(Math.cos(a) * (HALF + 0.9), 0.8, Math.sin(a) * (HALF + 0.9));
          scene.add(post);
          var lamp = C.makeGlowSprite(0x38bdf8, 1.2, 0.7);
          lamp.position.set(post.position.x, 1.8, post.position.z);
          scene.add(lamp);
        }

        highlight = new THREE.Mesh(
          new THREE.PlaneGeometry(CELL * 0.9, CELL * 0.9),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
        );
        highlight.rotation.x = -Math.PI / 2;
        highlight.visible = false;
        scene.add(highlight);

        rebuildMeshes();
      }

      function cellPos(col, row) {
        return { x: -HALF + CELL / 2 + col * CELL, z: -HALF + CELL / 2 + row * CELL };
      }

      function rebuildMeshes() {
        C.removeChildren(moduleGroup, true);
        meshByCell = {};
        for (var r = 0; r < GRID; r++) {
          for (var c = 0; c < GRID; c++) {
            var id = state.grid[r][c];
            if (!id) continue;
            var def = getDef(id);
            if (!def) continue;
            var m = makeModuleMesh(def);
            var p = cellPos(c, r);
            m.position.set(p.x, 0, p.z);
            moduleGroup.add(m);
            meshByCell[r + ':' + c] = m;
          }
        }
      }

      function getDef(id) {
        for (var i = 0; i < SU.data.MODULES.length; i++) if (SU.data.MODULES[i].id === id) return SU.data.MODULES[i];
        return null;
      }

      function makeModuleMesh(def) {
        var g = new THREE.Group();
        var metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.35 });
        var dark = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4, roughness: 0.65 });
        var accent = new THREE.MeshStandardMaterial({ color: def.color, emissive: def.color, emissiveIntensity: 0.65, metalness: 0.4, roughness: 0.35 });

        if (def.id === 'habitat') {
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.25, 16), dark));
          var dome = new THREE.Mesh(new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.45, roughness: 0.4 }));
          dome.position.y = 0.12;
          g.add(dome);
          var ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 24), accent);
          ring.rotation.x = Math.PI / 2; ring.position.y = 0.42;
          g.add(ring);
        } else if (def.id === 'solar') {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 1.2), dark));
          var panel = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 1.0), new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x2563eb, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.25 }));
          panel.position.set(0, 0.9, 0); panel.rotation.x = -0.5;
          g.add(panel);
          var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), metal);
          mast.position.y = 0.45; g.add(mast);
        } else if (def.id === 'rtg') {
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.9, 12), dark));
          for (var f = 0; f < 4; f++) {
            var fin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.06), metal);
            fin.rotation.y = f * Math.PI / 4;
            fin.position.y = 1.1;
            g.add(fin);
          }
          var glow = C.makeGlowSprite(0xf97316, 1.6, 0.6);
          glow.position.y = 1.1; g.add(glow);
        } else if (def.id === 'greenhouse') {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.15, 1.5), dark));
          var glass = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.0, 1.35), new THREE.MeshStandardMaterial({ color: 0x4ade80, transparent: true, opacity: 0.38, emissive: 0x22c55e, emissiveIntensity: 0.25, roughness: 0.2 }));
          glass.position.y = 0.65; g.add(glass);
          var crop = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 8), new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 }));
          crop.scale.set(1, 0.55, 1); crop.position.y = 0.4; g.add(crop);
        } else if (def.id === 'extractor') {
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.3, 14), dark));
          var tank = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.15, 14), new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 0.35, metalness: 0.5, roughness: 0.3 }));
          tank.position.y = 0.75; g.add(tank);
          var pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 6), metal);
          pipe.rotation.z = Math.PI / 3; pipe.position.set(0.55, 0.6, 0); g.add(pipe);
        } else if (def.id === 'drill') {
          g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.25, 12), dark));
          var tower = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.5, 8), metal);
          tower.position.y = 0.9; g.add(tower);
          var bit = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 8), accent);
          bit.rotation.x = Math.PI; bit.position.y = 0.18; g.add(bit);
        } else if (def.id === 'processor') {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.2), dark));
          var body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.0), metal);
          body.position.y = 0.6; g.add(body);
          for (var t = 0; t < 2; t++) {
            var cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.4, 10), accent);
            cyl.position.set(t ? 0.55 : -0.55, 1.0, 0); g.add(cyl);
          }
        } else if (def.id === 'lab') {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.25, 1.5), dark));
          var block = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.8, 1.25), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.45 }));
          block.position.y = 0.5; g.add(block);
          var sensor = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), accent);
          sensor.position.y = 1.15; g.add(sensor);
          var beam = C.makeGlowSprite(0x22d3ee, 1.1, 0.4);
          beam.position.y = 1.15; g.add(beam);
        } else {
          g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.2), accent));
        }
        g.scale.setScalar(0.92);
        g.userData.defId = def.id;
        return g;
      }

      /* --------------------------------------------------------------- stats */
      function calcStats() {
        var counts = {};
        var mass = 0;
        for (var r = 0; r < GRID; r++) {
          for (var c = 0; c < GRID; c++) {
            var id = state.grid[r][c];
            if (!id) continue;
            counts[id] = (counts[id] || 0) + 1;
            var d = getDef(id);
            if (d) mass += d.mass;
          }
        }
        function n(id) { return counts[id] || 0; }
        var solarFactor = C.clamp(1 / Math.pow(Math.max(planet.distanceAU, 0.1), 0.65), 0.06, 1.15);
        var gen = n('solar') * 9 * solarFactor + n('rtg') * 6;
        var use = n('habitat') * 4 + n('greenhouse') * 3 + n('extractor') * 5 + n('drill') * 6 + n('processor') * 8 + n('lab') * 4;
        var ratio = use > 0 ? C.clamp(gen / use, 0, 1) : 1;
        var crew = n('habitat') * 4;
        var temp = planet.tempMean + state.env.tempOffset + n('rtg') * 2 + n('drill') * 3 + n('greenhouse') * 1 + n('processor') * 1;
        var tempOK = temp >= -5 && temp <= 40;
        var oxygenProd = (n('habitat') * 1 + n('greenhouse') * 2 + n('processor') * 3) * ratio;
        var oxygenUse = crew * 1;
        var waterProd = n('extractor') * 6 * (0.25 + state.env.ice / 100) * ratio;
        var waterUse = n('greenhouse') * 2 + crew * 0.5;
        var foodProd = n('greenhouse') * 4 * (tempOK ? 1 : 0.15) * ratio;
        var foodUse = crew;
        var research = n('lab') * 5 * ratio;
        var minerals = n('drill') * 3 * ratio;
        var load = mass * planet.gravity / 9.81;
        var capacity = 55 + n('habitat') * 18;
        var stability = C.clamp(100 - (load / Math.max(capacity, 1)) * 100, 0, 100);
        var status = 'NOMINAL';
        if (!mass) status = 'IDLE';
        else if (stability < 30) status = 'STRUCTURAL RISK';
        else if (gen + 0.001 < use) status = 'POWER DEFICIT';
        else if (state.resources.oxygen <= 0) status = 'OXYGEN CRITICAL';
        else if (state.resources.water <= 0) status = 'WATER CRITICAL';
        else if (!tempOK) status = 'THERMAL STRESS';
        return {
          counts: counts, mass: mass, gen: gen, use: use, ratio: ratio, crew: crew,
          temp: temp, tempOK: tempOK, oxygenProd: oxygenProd, oxygenUse: oxygenUse,
          waterProd: waterProd, waterUse: waterUse, foodProd: foodProd, foodUse: foodUse,
          research: research, minerals: minerals, stability: stability, status: status,
          solarFactor: solarFactor
        };
      }

      /* ---------------------------------------------------------------- tick */
      function tick() {
        var s = calcStats();
        state.sol += 1;
        state.resources.water = C.clamp(state.resources.water + s.waterProd - s.waterUse, -40, 400);
        state.resources.oxygen = C.clamp(state.resources.oxygen + s.oxygenProd - s.oxygenUse, -40, 400);
        state.resources.food = C.clamp(state.resources.food + s.foodProd - s.foodUse, -40, 400);
        state.resources.research += s.research;
        state.resources.minerals += s.minerals;
        state.resources.temp = s.temp;
        state.resources.power = s.gen - s.use;

        if (state.sol % 1 === 0) {
          if (s.status === 'POWER DEFICIT' && !hasRecent('Эрчим хүчний хомсдол')) logEvent('Эрчим хүчний хомсдол: модулиудын гаралт буурлаа.');
          if (state.resources.oxygen < 0) logEvent('Хүчилтөрөгч хязгаарт хүрлээ — баг аюулд орлоо.');
          if (state.resources.water < 0) logEvent('Усны нөөц хязгаарт хүрлээ.');
          if (s.stability < 30) logEvent('Бүтцийн тогтвортой байдал буурлаа: ' + SU.data.fmt(s.stability, 0) + '%');
          if (!s.tempOK) logEvent('Температур ' + SU.data.fmt(s.temp, 1) + '°C — хүлэмжийн үр ашиг буурлаа.');
        }
        if (s.stability < 30) {
          logEvent('STRUCTURAL FAILURE: симуляц зогслоо. Модулийн ачааллыг бууруулна уу.');
          stopRun();
        }
        save();
        refresh();
      }

      function hasRecent(text) {
        for (var i = 0; i < Math.min(4, state.log.length); i++) if (state.log[i].text.indexOf(text) === 0) return true;
        return false;
      }

      function logEvent(text) {
        state.log.unshift({ sol: state.sol, text: text });
        if (state.log.length > 20) state.log.length = 20;
      }

      function save() {
        try {
          var slim = {
            grid: state.grid, alloy: state.alloy, sol: state.sol, env: state.env,
            resources: state.resources, log: state.log.slice(0, 20)
          };
          window.localStorage.setItem(keyFor(planet.key), JSON.stringify(slim));
        } catch (e) {}
      }

      /* ------------------------------------------------------------ placement */
      function selectTool(id) {
        selectedTool = (selectedTool === id) ? null : id;
        confirmReset = false;
        refresh();
        if (selectedTool === 'demolish') onToast('DEMOLISH: устгах модуль дээр дарна уу');
        else if (selectedTool) {
          var d = getDef(selectedTool);
          onToast((d ? d.name : selectedTool) + ' сонгогдлоо · ' + (d ? d.cost + ' alloy' : ''));
        }
      }

      function place(col, row) {
        if (!selectedTool) { onToast('Эхлээд каталогогоос модуль сонгоно уу'); return; }
        if (selectedTool === 'demolish') {
          var existing = state.grid[row][col];
          if (!existing) { onToast('Энэ нүдэнд модуль алга'); return; }
          var def = getDef(existing);
          state.grid[row][col] = null;
          if (def) state.alloy += Math.floor(def.cost * 0.5);
          removeMesh(row, col);
          logEvent((def ? def.name : 'Модуль') + ' устгагдлаа. 50% alloy буцаагдлаа.');
          save(); refresh();
          return;
        }
        var d = getDef(selectedTool);
        if (!d) return;
        if (state.grid[row][col]) { onToast('Нүд эзлэгдсэн байна'); return; }
        if (state.alloy < d.cost) { onToast('Alloy хүрэлцэхгүй: ' + d.cost + ' шаардлагатай'); return; }
        state.alloy -= d.cost;
        state.grid[row][col] = d.id;
        var mesh = makeModuleMesh(d);
        var p = cellPos(col, row);
        mesh.position.set(p.x, 0, p.z);
        moduleGroup.add(mesh);
        meshByCell[row + ':' + col] = mesh;
        logEvent(d.name + ' байрлууллаа (−' + d.cost + ' alloy).');
        save(); refresh(); onChange();
      }

      function removeMesh(row, col) {
        var key = row + ':' + col;
        var mesh = meshByCell[key];
        if (mesh) {
          moduleGroup.remove(mesh);
          C.disposeObject(mesh, true);
          delete meshByCell[key];
        }
      }

      /* -------------------------------------------------------------- running */
      function runSimulation() {
        if (simTimer) { stopRun(); return; }
        if (!calcStats().mass) { onToast('Эхлээд дор хаяж нэг модуль байрлуулна уу'); return; }
        runRemaining = 10;
        simTimer = setInterval(function () {
          if (!runRemaining || !active) { stopRun(); return; }
          tick();
          runRemaining--;
          if (runRemaining <= 0) stopRun();
        }, 190);
        refresh();
      }

      function stopRun() {
        if (simTimer) { clearInterval(simTimer); simTimer = null; }
        runRemaining = 0;
        save();
        refresh();
      }

      function resetColony() {
        if (!confirmReset) {
          confirmReset = true;
          refresh();
          onToast('Колониг эхлүүлэхдээ RESET-ийг дахин дарна уу');
          return;
        }
        confirmReset = false;
        state = freshState(planet);
        rebuildMeshes();
        save();
        refresh();
        onToast('Колони 0 төлөвт буцлаа');
      }

      /* ---------------------------------------------------------------- UI */
      function refresh() {
        if (!container) return;
        var s = calcStats();
        var res = state.resources;

        var statusEl = container.querySelector('#suSbStatus');
        if (statusEl) {
          statusEl.textContent = s.status;
          statusEl.className = 'su-sb-status ' + (s.status === 'NOMINAL' || s.status === 'IDLE' ? 'ok' : s.status === 'STRUCTURAL RISK' ? 'bad' : 'warn');
        }

        var solEl = container.querySelector('#suSbSol');
        if (solEl) solEl.textContent = 'SOL ' + state.sol;

        var resEl = container.querySelector('#suSbResources');
        if (resEl) {
          resEl.innerHTML =
            '<div><small>ALLOY</small><b>' + Math.round(state.alloy) + '</b></div>' +
            '<div><small>POWER</small><b class="' + (res.power < 0 ? 'bad' : '') + '">' + (res.power >= 0 ? '+' : '') + SU.data.fmt(res.power, 1) + '</b></div>' +
            '<div><small>WATER</small><b class="' + (res.water < 0 ? 'bad' : '') + '">' + SU.data.fmt(res.water, 0) + '</b></div>' +
            '<div><small>O₂</small><b class="' + (res.oxygen < 0 ? 'bad' : '') + '">' + SU.data.fmt(res.oxygen, 0) + '</b></div>' +
            '<div><small>FOOD</small><b class="' + (res.food < 0 ? 'bad' : '') + '">' + SU.data.fmt(res.food, 0) + '</b></div>' +
            '<div><small>RESEARCH</small><b>' + SU.data.fmt(res.research, 0) + '</b></div>';
        }

        var catalog = container.querySelector('#suSbCatalog');
        if (catalog) {
          catalog.innerHTML = SU.data.MODULES.map(function (m) {
            var affordable = state.alloy >= m.cost;
            return '<button type="button" class="su-mod ' + (selectedTool === m.id ? 'active' : '') + (affordable ? '' : ' poor') + '" data-module="' + m.id + '">' +
              '<span class="su-mod-dot" style="background:#' + ('000000' + m.color.toString(16)).slice(-6) + '"></span>' +
              '<b>' + m.name + '</b><small>' + m.short + ' · ' + m.cost + ' alloy</small>' +
              '<em>' + (m.power >= 0 ? '+' : '') + m.power + ' pwr · ' + m.mass + ' t</em></button>';
          }).join('');
        }

        var envEl = container.querySelector('#suSbEnv');
        if (envEl) {
          envEl.innerHTML =
            '<div class="su-env-row"><span>Гадаад температур</span><b>' + SU.data.fmt(planet.tempMean + state.env.tempOffset, 0) + '°C</b></div>' +
            '<input type="range" class="su-slider" id="suSbTemp" min="-60" max="60" step="1" value="' + state.env.tempOffset + '">' +
            '<div class="su-env-row"><span>Мөсний нөөц</span><b>' + state.env.ice + '%</b></div>' +
            '<input type="range" class="su-slider" id="suSbIce" min="0" max="100" step="1" value="' + state.env.ice + '">' +
            '<div class="su-env-row"><span>Нарны урсгал</span><b>' + SU.data.fmt(s.solarFactor, 2) + '× (1/d^0.65)</b></div>' +
            '<div class="su-env-row"><span>Гаригийн даралт</span><b>' + SU.data.pressureLabel(planet.pressureAtm) + '</b></div>';

          var tempSlider = envEl.querySelector('#suSbTemp');
          if (tempSlider) tempSlider.addEventListener('input', function () {
            state.env.tempOffset = Number(this.value);
            save(); refresh();
          });
          var iceSlider = envEl.querySelector('#suSbIce');
          if (iceSlider) iceSlider.addEventListener('input', function () {
            state.env.ice = Number(this.value);
            save(); refresh();
          });
        }

        var derived = container.querySelector('#suSbDerived');
        if (derived) {
          derived.innerHTML =
            '<div class="su-der-row"><span>Power generation</span><b>' + SU.data.fmt(s.gen, 1) + ' / ' + SU.data.fmt(s.use, 1) + '</b></div>' +
            '<div class="su-der-row"><span>Crew</span><b>' + s.crew + '</b></div>' +
            '<div class="su-der-row"><span>Colony temperature</span><b class="' + (s.tempOK ? '' : 'bad') + '">' + SU.data.fmt(s.temp, 1) + '°C</b></div>' +
            '<div class="su-der-row"><span>Structure stability</span><b class="' + (s.stability < 50 ? 'bad' : '') + '">' + SU.data.fmt(s.stability, 0) + '%</b></div>' +
            '<div class="su-bar-row"><span>Load</span><div class="su-bar"><i style="width:' + C.clamp(100 - s.stability, 0, 100) + '%"></i></div><b>' + SU.data.fmt(s.mass * planet.gravity / 9.81, 0) + ' t·g</b></div>';
        }

        var runBtn = container.querySelector('#suSbRun');
        if (runBtn) runBtn.textContent = simTimer ? 'STOP (' + runRemaining + ')' : 'RUN 10 SOLS';
        var resetBtn = container.querySelector('#suSbReset');
        if (resetBtn) resetBtn.textContent = confirmReset ? 'CONFIRM RESET' : 'RESET COLONY';
        var demoBtn = container.querySelector('#suSbDemolish');
        if (demoBtn) demoBtn.classList.toggle('active', selectedTool === 'demolish');

        var logEl = container.querySelector('#suSbLog');
        if (logEl) {
          logEl.innerHTML = state.log.slice(0, 8).map(function (e) {
            return '<div class="su-sb-log"><span>SOL ' + e.sol + '</span>' + esc(e.text) + '</div>';
          }).join('') || '<div class="su-muted">Үйл явдал бүртгэгдээгүй.</div>';
        }

        onChange();
      }

      function render() {
        container.innerHTML =
          '<div class="su-card su-sandbox">' +
            '<div class="su-card-head"><span>COLONY ZERO · SANDBOX</span><span class="su-chip warn" id="suSbSol">SOL 0</span></div>' +
            '<div class="su-badge-line"><span class="su-badge simulated">FICTIONAL SIMULATION</span><span class="su-sb-status ok" id="suSbStatus">IDLE</span></div>' +
            '<div class="su-sub">Модуль байрлуулж, нөөцийн циклийг 10 солоор туршина. Эрчим хүч, таталцал, мөс, температур бодит хязгаарт тооцогдоно.</div>' +
            '<div class="su-res-grid" id="suSbResources"></div>' +
            '<div class="su-section-title">EQUIPMENT CATALOG</div>' +
            '<div class="su-catalog" id="suSbCatalog"></div>' +
            '<div class="su-sb-actions"><button type="button" class="su-btn warn" id="suSbDemolish">DEMOLISH</button><button type="button" class="su-btn primary" id="suSbRun">RUN 10 SOLS</button><button type="button" class="su-btn" id="suSbReset">RESET COLONY</button></div>' +
            '<div class="su-section-title">ENVIRONMENT</div>' +
            '<div class="su-env" id="suSbEnv"></div>' +
            '<div class="su-section-title">COLONY TELEMETRY</div>' +
            '<div class="su-derived" id="suSbDerived"></div>' +
            '<div class="su-section-title">EVENT LOG</div>' +
            '<div class="su-sb-log-wrap" id="suSbLog"></div>' +
            '<div class="su-muted">Симуляц нь боловсролын зориулалттай; инженерийн баталгаажуулалт биш. Байршил, нөөцийн утгууд нь загварчилсан.</div>' +
          '</div>';

        container.addEventListener('click', function (e) {
          var mod = e.target.closest ? e.target.closest('[data-module]') : null;
          if (mod) { selectTool(mod.getAttribute('data-module')); return; }
        });
        var runBtn = container.querySelector('#suSbRun');
        if (runBtn) runBtn.addEventListener('click', runSimulation);
        var resetBtn = container.querySelector('#suSbReset');
        if (resetBtn) resetBtn.addEventListener('click', resetColony);
        var demoBtn = container.querySelector('#suSbDemolish');
        if (demoBtn) demoBtn.addEventListener('click', function () { selectTool('demolish'); });

        refresh();
      }

      /* ------------------------------------------------------------ controls */
      function pointerCell(e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        var hit = new THREE.Vector3();
        if (!raycaster.ray.intersectPlane(groundPlane, hit)) return null;
        var col = Math.floor((hit.x + HALF) / CELL);
        var row = Math.floor((hit.z + HALF) / CELL);
        if (col < 0 || col >= GRID || row < 0 || row >= GRID) return null;
        return { col: col, row: row, x: hit.x, z: hit.z };
      }

      function updateHover(cell) {
        if (!highlight) return;
        if (!cell || !selectedTool) { highlight.visible = false; hoverCell = null; return; }
        var p = cellPos(cell.col, cell.row);
        highlight.position.set(p.x, 0.02, p.z);
        highlight.visible = true;
        hoverCell = cell;
        var isDemolish = selectedTool === 'demolish';
        var occupied = !!state.grid[cell.row][cell.col];
        var def = getDef(selectedTool);
        var ok = isDemolish ? occupied : (!occupied && state.alloy >= (def ? def.cost : 0));
        highlight.material.color.setHex(ok ? 0x38bdf8 : 0xef4444);
        highlight.material.opacity = ok ? 0.35 : 0.45;
      }

      function onPointerDown(e) {
        if (!active || e.target !== canvas) return;
        drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: 0 };
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
      }
      function onPointerMove(e) {
        if (!active) return;
        if (drag && drag.id === e.pointerId) {
          var dx = e.clientX - drag.x;
          var dy = e.clientY - drag.y;
          drag.x = e.clientX; drag.y = e.clientY;
          drag.moved += Math.abs(dx) + Math.abs(dy);
          if (drag.moved > 5) {
            camYaw -= dx * 0.006;
            camPitch = C.clamp(camPitch + dy * 0.005, 0.25, 1.35);
            highlight && (highlight.visible = false);
          }
        } else if (e.pointerType !== 'touch') {
          updateHover(pointerCell(e));
        }
      }
      function onPointerUp(e) {
        if (!active) return;
        if (!drag || drag.id !== e.pointerId) return;
        var moved = drag.moved;
        drag = null;
        if (moved > 7) return;
        var cell = pointerCell(e);
        if (cell) place(cell.col, cell.row);
      }
      function onWheel(e) {
        if (!active) return;
        e.preventDefault();
        camDist = C.clamp(camDist + e.deltaY * 0.03, 12, 46);
      }
      var pinch = null;
      function onTouchStart(e) {
        if (e.touches.length === 2) { pinch = dist(e); drag = null; }
      }
      function onTouchMove(e) {
        if (e.touches.length === 2 && pinch != null) {
          e.preventDefault();
          var d = dist(e);
          camDist = C.clamp(camDist - (d - pinch) * 0.14, 12, 46);
          pinch = d;
        }
      }
      function dist(e) {
        var a = e.touches[0], b = e.touches[1];
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }

      function updateCamera() {
        var cy = Math.cos(camPitch);
        camera.position.set(
          camTarget.x + Math.sin(camYaw) * cy * camDist,
          camTarget.y + Math.sin(camPitch) * camDist,
          camTarget.z + Math.cos(camYaw) * cy * camDist
        );
        camera.lookAt(camTarget);
      }

      function update(dt) {
        time += dt;
        updateCamera();
        if (highlight && highlight.visible) {
          highlight.material.opacity = 0.27 + Math.sin(time * 4) * 0.08;
        }
        moduleGroup.children.forEach(function (m, i) {
          if (m.userData.defId === 'rtg' || m.userData.defId === 'lab') {
            m.rotation.y += dt * 0.12;
          }
        });
      }

      function activate() {
        active = true;
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        requestAnimationFrame(function () { if (active) resize(); });
      }
      function deactivate() {
        active = false;
        stopRun();
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        if (highlight) highlight.visible = false;
      }
      function projectCell(col, row) {
        var p = cellPos(col, row);
        var v = new THREE.Vector3(p.x, 0.6, p.z).project(camera);
        var rect = canvas.getBoundingClientRect();
        return {
          x: rect.left + (v.x * 0.5 + 0.5) * rect.width,
          y: rect.top + (-v.y * 0.5 + 0.5) * rect.height
        };
      }

      function resize() { C.resizeRenderer(renderer, camera, canvas); }
      function dispose() {
        deactivate();
        if (simTimer) { clearInterval(simTimer); simTimer = null; }
        C.disposeObject(scene, true);
        scene.clear();
      }

      buildScene();
      render();
      updateCamera();

      return {
        scene: scene,
        camera: camera,
        activate: activate,
        deactivate: deactivate,
        update: update,
        resize: resize,
        dispose: dispose,
        refresh: refresh,
        getState: function () { return state; },
        getSelectedTool: function () { return selectedTool; },
        projectCell: projectCell,
        getStats: function () { return calcStats(); }
      };
    }
  };
})();
