/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 · SOLAR SYSTEM EXPLORATION
   File: js/space/su-solar.js
   Interactive orrery: Sun, 8 planets, selection, spacecraft, travel.
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.core || !SU.core.ready) return;

  var C = SU.core;

  function visualRadius(radiusKm) {
    return 0.5 + Math.pow(Math.max(radiusKm, 200) / 6371, 0.42) * 1.05;
  }
  function orbitRadius(au) {
    return 4.4 + Math.pow(au, 0.55) * 5.3;
  }

  SU.solar = {
    create: function (opts) {
      var renderer = opts.renderer;
      var canvas = opts.canvas;
      var onSelect = opts.onSelect || function () {};
      var onLand = opts.onLand || function () {};
      var onToast = opts.onToast || function () {};
      var planetModels = {};
      var travel = null;
      var selectedKey = 'earth';
      var active = false;
      var keys = {};
      var thrust = { fwd: false, back: false, left: false, right: false, up: false, down: false };
      var raycaster = new THREE.Raycaster();
      var pointer = new THREE.Vector2();
      var drag = null;
      var time = 0;
      var followShip = false;
      var camYaw = 0.6;
      var camPitch = 0.55;
      var camDist = 48;
      var camTarget = new THREE.Vector3(0, 0, 0);
      var desiredDist = 48;
      var desiredTarget = new THREE.Vector3(0, 0, 0);

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x02040c);
      var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
      var sunGroup = new THREE.Group();
      var planetLayer = new THREE.Group();
      var ship = null;
      var selectionRing = null;
      var stars = null;

      scene.add(sunGroup, planetLayer);
      scene.add(new THREE.AmbientLight(0x8899bb, 0.32));
      var sunLight = new THREE.PointLight(0xffe2b0, 2.4, 500, 1.2);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      /* ------------------------------------------------------------ build */
      function build() {
        // Sun
        var sunMesh = new THREE.Mesh(
          new THREE.SphereGeometry(2.5, 40, 40),
          new THREE.MeshBasicMaterial({ color: 0xffcc66 })
        );
        sunGroup.add(sunMesh);
        sunGroup.add(C.makeGlowSprite(0xffb347, 13, 0.85));
        sunGroup.add(C.makeGlowSprite(0xfff1c0, 6.5, 0.95));
        var sunLightLocal = new THREE.PointLight(0xffd9a0, 1.6, 60, 2);
        sunGroup.add(sunLightLocal);

        stars = C.makeStars(C.isMobile() ? 700 : 1300, 420);
        scene.add(stars);

        var planets = SU.data.getSolarPlanets();
        var seg = C.isMobile() ? 32 : 56;
        planets.forEach(function (p) {
          var group = new THREE.Group();
          var r = visualRadius(p.radiusKm);
          var orbitR = orbitRadius(p.distanceAU);

          var mat = new THREE.MeshStandardMaterial({
            map: C.getPlanetTexture(p.key),
            roughness: p.type === 'gas' ? 0.9 : 0.82,
            metalness: 0.04
          });
          var mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(18, seg / 2)), mat);
          mesh.userData.planetKey = p.key;
          mesh.rotation.z = THREE.MathUtils.degToRad(p.tiltDeg || 0);
          group.add(mesh);

          if (p.key === 'earth' || p.key === 'venus') {
            var cloudTex = p.key === 'earth' ? C.getCloudTexture() : null;
            if (cloudTex) {
              var clouds = new THREE.Mesh(
                new THREE.SphereGeometry(r * 1.015, seg, Math.max(16, seg / 2)),
                new THREE.MeshStandardMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false, roughness: 1 })
              );
              group.add(clouds);
            }
          }

          if (p.key === 'saturn' || p.key === 'uranus') {
            var ringTex = C.getRingTexture();
            var ringGeo = new THREE.RingGeometry(r * 1.35, p.key === 'saturn' ? r * 2.35 : r * 1.7, 80);
            var ringMat = ringTex
              ? new THREE.MeshStandardMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: p.key === 'saturn' ? 0.85 : 0.3, roughness: 0.9 })
              : new THREE.MeshBasicMaterial({ color: p.key === 'saturn' ? 0xd8c49a : 0x9fe3e8, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
            var ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.rotation.z = THREE.MathUtils.degToRad(p.tiltDeg || 0);
            group.add(ring);
          }

          var orbitLine = C.circleLine(orbitR, p.key === 'earth' ? 0x4fa8ff : 0x334155, 128);
          orbitLine.material.opacity = p.key === 'earth' ? 0.5 : 0.28;
          planetLayer.add(orbitLine);

          var label = C.makeLabelSprite(p.name + ' · ' + p.en, p.color, 0.62);
          label.position.set(0, r + 0.75, 0);
          group.add(label);

          scene.add(group);
          planetModels[p.key] = {
            data: p, group: group, mesh: mesh, radius: r,
            orbitR: orbitR, baseAngle: Math.random() * Math.PI * 2,
            speed: 0.075 / Math.pow(Math.max(p.periodDays, 1) / 365.25, 0.62)
          };
        });

        // Spacecraft
        ship = buildShip();
        scene.add(ship);
        positionShipNear('earth');

        selectionRing = new THREE.Mesh(
          new THREE.RingGeometry(1, 1.06, 56),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
        );
        scene.add(selectionRing);

        applySelection('earth');
      }

      function buildShip() {
        var g = new THREE.Group();
        var bodyMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, metalness: 0.7, roughness: 0.28, emissive: 0x0b3a66, emissiveIntensity: 0.5 });
        var body = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.25, 6), bodyMat);
        body.rotation.x = Math.PI / 2;
        g.add(body);
        var wing = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.05, 0.42), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.6, roughness: 0.3 }));
        wing.position.z = -0.22;
        g.add(wing);
        var cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.2, roughness: 0.2 }));
        cockpit.position.set(0, 0.1, 0.2);
        g.add(cockpit);
        var engine = C.makeGlowSprite(0x38bdf8, 1.4, 0.9);
        engine.position.z = -0.72;
        g.add(engine);
        g.userData.engine = engine;
        g.scale.setScalar(1.5);
        return g;
      }

      function positionShipNear(key) {
        var m = planetModels[key];
        if (!m || !ship) return;
        var pos = m.group.position;
        ship.position.set(pos.x + m.radius + 1.6, pos.y + m.radius * 0.5, pos.z + m.radius + 1.6);
        ship.lookAt(pos.x, pos.y, pos.z);
      }

      /* ---------------------------------------------------------- selection */
      function applySelection(key) {
        selectedKey = key;
        var m = planetModels[key];
        if (m && selectionRing) {
          selectionRing.visible = true;
          selectionRing.scale.setScalar(m.radius + 0.22);
          selectionRing.position.copy(m.group.position);
        }
        onSelect(key);
      }

      function select(key, focus) {
        if (!planetModels[key]) return;
        applySelection(key);
        if (focus !== false) {
          var m = planetModels[key];
          followShip = false;
          desiredTarget.copy(m.group.position);
          desiredDist = Math.max(5.2, m.radius * 4.4);
        }
      }

      function resetView() {
        followShip = false;
        desiredTarget.set(0, 0, 0);
        desiredDist = 48;
        camYaw = 0.6;
        camPitch = 0.55;
        onToast('Нарны аймгийн ерөнхий харагдац');
      }

      /* ------------------------------------------------------------- travel */
      function travelTo(key) {
        var target = planetModels[key];
        if (!target || !ship) return;
        if (travel) return;
        var from = ship.position.clone();
        var to = new THREE.Vector3(
          target.group.position.x + target.radius + 1.6,
          target.group.position.y + target.radius * 0.5,
          target.group.position.z + target.radius + 1.6
        );
        var mid = from.clone().lerp(to, 0.5);
        mid.y += from.distanceTo(to) * 0.22 + 2;
        travel = { from: from, mid: mid, to: to, t: 0, duration: Math.min(4.2, 1.4 + from.distanceTo(to) / 22), key: key };
        followShip = true;
        onToast((target.data.en || target.data.name) + ' руу нислэг эхэллээ');
      }

      function updateTravel(dt) {
        if (!travel) return;
        travel.t += dt / travel.duration;
        var t = C.clamp(travel.t, 0, 1);
        var e = C.easeInOut(t);
        var a = travel.from.clone().lerp(travel.mid, e);
        var b = travel.mid.clone().lerp(travel.to, e);
        var pos = a.lerp(b, e);
        var prev = ship.position.clone();
        ship.position.copy(pos);
        if (prev.distanceTo(pos) > 0.0001) ship.lookAt(pos.clone().add(pos.clone().sub(prev)));
        if (travel.t >= 1) {
          var key = travel.key;
          travel = null;
          followShip = false;
          applySelection(key);
          var m = planetModels[key];
          desiredTarget.copy(m.group.position);
          desiredDist = Math.max(5.2, m.radius * 4.4);
          onToast((m.data.en || m.data.name) + ' тойрог замд хүрлээ. LAND дарж бууна уу.');
          if (opts.onArrive) opts.onArrive(key);
        }
      }

      /* ------------------------------------------------------------ controls */
      function onPointerDown(e) {
        if (e.target !== canvas) return;
        drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: 0, id: e.pointerId };
        if (canvas.setPointerCapture) { try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
      }

      function onPointerMove(e) {
        if (!drag || drag.id !== e.pointerId) return;
        var dx = e.clientX - drag.x;
        var dy = e.clientY - drag.y;
        drag.x = e.clientX; drag.y = e.clientY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        if (drag.moved > 4) {
          camYaw -= dx * 0.006;
          camPitch = C.clamp(camPitch + dy * 0.005, 0.08, 1.25);
        }
      }

      function onPointerUp(e) {
        if (!drag || drag.id !== e.pointerId) return;
        var moved = drag.moved;
        drag = null;
        if (moved < 7) pickPlanet(e);
      }

      function pickPlanet(e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        var meshes = Object.keys(planetModels).map(function (k) { return planetModels[k].mesh; });
        var hits = raycaster.intersectObjects(meshes, false);
        if (hits.length) {
          var key = hits[0].object.userData.planetKey;
          select(key, true);
        }
      }

      function onWheel(e) {
        e.preventDefault();
        desiredDist = C.clamp(desiredDist + e.deltaY * 0.02, 4, 90);
      }

      var pinch = null;
      function onTouchStart(e) {
        if (e.touches.length === 2) {
          pinch = touchDistance(e);
          drag = null;
        }
      }
      function onTouchMove(e) {
        if (e.touches.length === 2 && pinch != null) {
          e.preventDefault();
          var d = touchDistance(e);
          desiredDist = C.clamp(desiredDist - (d - pinch) * 0.12, 4, 90);
          pinch = d;
        }
      }
      function touchDistance(e) {
        var a = e.touches[0], b = e.touches[1];
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }

      function onKeyDown(e) {
        if (!active) return;
        var tag = (e.target && e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        var k = e.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') { thrust.fwd = true; e.preventDefault(); }
        else if (k === 's' || k === 'arrowdown') { thrust.back = true; e.preventDefault(); }
        else if (k === 'a' || k === 'arrowleft') { thrust.left = true; e.preventDefault(); }
        else if (k === 'd' || k === 'arrowright') { thrust.right = true; e.preventDefault(); }
        else if (k === 'q') thrust.down = true;
        else if (k === 'e') thrust.up = true;
      }
      function onKeyUp(e) {
        var k = e.key.toLowerCase();
        if (k === 'w' || k === 'arrowup') thrust.fwd = false;
        else if (k === 's' || k === 'arrowdown') thrust.back = false;
        else if (k === 'a' || k === 'arrowleft') thrust.left = false;
        else if (k === 'd' || k === 'arrowright') thrust.right = false;
        else if (k === 'q') thrust.down = false;
        else if (k === 'e') thrust.up = false;
      }

      /* -------------------------------------------------------------- update */
      function updateCamera(dt) {
        if (followShip && ship) desiredTarget.copy(ship.position);
        camTarget.lerp(desiredTarget, C.clamp(dt * 3.2, 0, 1));
        camDist = C.lerp(camDist, desiredDist, C.clamp(dt * 3.4, 0, 1));
        var cy = Math.cos(camPitch);
        camera.position.set(
          camTarget.x + Math.sin(camYaw) * cy * camDist,
          camTarget.y + Math.sin(camPitch) * camDist + 1.5,
          camTarget.z + Math.cos(camYaw) * cy * camDist
        );
        camera.lookAt(camTarget);
      }

      function updateThrust(dt) {
        if (!ship || travel) return;
        var fwd = new THREE.Vector3();
        camera.getWorldDirection(fwd);
        var right = new THREE.Vector3().crossVectors(fwd, camera.up).normalize();
        var up = new THREE.Vector3(0, 1, 0);
        var dir = new THREE.Vector3();
        if (thrust.fwd) dir.add(fwd);
        if (thrust.back) dir.sub(fwd);
        if (thrust.right) dir.add(right);
        if (thrust.left) dir.sub(right);
        if (thrust.up) dir.add(up);
        if (thrust.down) dir.sub(up);
        if (dir.lengthSq() > 0) {
          dir.normalize();
          ship.position.addScaledVector(dir, dt * 7.5);
          followShip = true;
          desiredTarget.copy(ship.position);
          desiredDist = Math.max(6, Math.min(desiredDist, 12));
          ship.lookAt(ship.position.clone().add(dir));
          if (ship.userData.engine) ship.userData.engine.material.opacity = 0.55 + Math.random() * 0.4;
        } else if (ship.userData.engine) {
          ship.userData.engine.material.opacity = 0.35 + Math.sin(time * 6) * 0.12;
        }
      }

      function update(dt) {
        time += dt;
        var planets = SU.data.getSolarPlanets();
        planets.forEach(function (p) {
          var m = planetModels[p.key];
          if (!m) return;
          m.baseAngle += dt * m.speed;
          var a = m.baseAngle;
          m.group.position.set(Math.cos(a) * m.orbitR, Math.sin(a * 0.6) * 0.55, Math.sin(a) * m.orbitR);
          m.mesh.rotation.y += dt * (p.rotationHours < 0 ? -0.25 : 0.25);
          if (m.group.children[1] && p.key === 'earth') m.group.children[1].rotation.y += dt * 0.06;
        });

        if (selectionRing && planetModels[selectedKey]) {
          var sm = planetModels[selectedKey];
          selectionRing.position.copy(sm.group.position);
          selectionRing.quaternion.copy(camera.quaternion);
          var pulse = 1 + Math.sin(time * 3.2) * 0.035;
          selectionRing.scale.setScalar((sm.radius + 0.24) * pulse);
        }
        if (stars) stars.rotation.y += dt * 0.003;

        updateTravel(dt);
        updateThrust(dt);
        updateCamera(dt);
      }

      /* -------------------------------------------------------------- public */
      function activate() {
        active = true;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        requestAnimationFrame(function () { if (active) resize(); });
      }
      function deactivate() {
        active = false;
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        thrust.fwd = thrust.back = thrust.left = thrust.right = thrust.up = thrust.down = false;
      }
      function resize() {
        C.resizeRenderer(renderer, camera, canvas);
      }
      function dispose() {
        deactivate();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        C.disposeObject(scene, true);
        scene.clear();
        planetModels = {};
      }

      build();

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      return {
        scene: scene,
        camera: camera,
        activate: activate,
        deactivate: deactivate,
        update: update,
        resize: resize,
        dispose: dispose,
        select: select,
        travelTo: travelTo,
        resetView: resetView,
        getSelected: function () { return selectedKey; },
        getShipPosition: function () { return ship ? { x: ship.position.x, y: ship.position.y, z: ship.position.z } : null; },
        isTravelling: function () { return !!travel; },
        setThrust: function (axis, on) { if (axis in thrust) thrust[axis] = !!on; },
        focusPlanet: function (key) { select(key, true); }
      };
    }
  };
})();
