/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 · SHARED 3D CORE
   File: js/space/su-space-core.js
   One renderer, shared textures, terrain field, disposal and small helpers.
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};

  var HAS_THREE = typeof THREE !== 'undefined';
  if (!HAS_THREE) {
    SU.core = { ready: false };
    return;
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile|Silk/i.test(navigator.userAgent || '') || window.innerWidth < 720;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function seededRandom(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  /* ---------------------------------------------------------------- renderer */
  function createRenderer(canvas) {
    var r = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !isMobile(),
      alpha: false,
      powerPreference: 'high-performance'
    });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.5 : 2));
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    r.setClearColor(0x030712, 1);
    // V7 Shadow Mapping Engine
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    return r;
  }

  function resizeRenderer(renderer, camera, canvas) {
    var w = Math.max(1, canvas.clientWidth || canvas.parentElement.clientWidth || 640);
    var h = Math.max(1, canvas.clientHeight || canvas.parentElement.clientHeight || 420);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------------ textures */
  var texCache = {};
  var cloudCache = null;

  function fallbackTexture(key) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');
    var palettes = {
      mercury: ['#4a4a4a', '#7a7a7a'], venus: ['#b88635', '#edd193'], earth: ['#0d3268', '#2f7d4f'],
      mars: ['#6b3520', '#c98b5a'], jupiter: ['#8a6a4a', '#e8cba4'], saturn: ['#9c8a62', '#e8dcb8'],
      uranus: ['#3f8f96', '#a9e6e9'], neptune: ['#24418f', '#7fa3ea'], moon: ['#4a4d55', '#a9adb7']
    };
    var p = palettes[key] || palettes.earth;
    var g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, p[0]); g.addColorStop(1, p[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    var rnd = seededRandom((key || 'x').length * 733 + 17);
    for (var i = 0; i < 900; i++) {
      ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(rnd() * 512, rnd() * 256, rnd() * 9 + 1, rnd() * 4 + 1);
    }
    return new THREE.CanvasTexture(c);
  }

  function getPlanetTexture(key) {
    if (texCache[key]) return texCache[key];
    var tex = null;
    try {
      if (typeof PlanetTextureFactory !== 'undefined' && PlanetTextureFactory && PlanetTextureFactory.getTexture) {
        tex = PlanetTextureFactory.getTexture(key);
      }
    } catch (e) { tex = null; }
    if (!tex) tex = fallbackTexture(key);

    // Mobile: downscale the 1024×512 canvas once into a smaller shared texture.
    if (isMobile() && tex.image && tex.image.width > 512) {
      var c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      c.getContext('2d').drawImage(tex.image, 0, 0, 512, 256);
      var small = new THREE.CanvasTexture(c);
      small.userData = { shared: true };
      texCache[key] = small;
      return small;
    }
    tex.userData = tex.userData || {};
    tex.userData.shared = true;
    texCache[key] = tex;
    return tex;
  }

  function getCloudTexture() {
    if (cloudCache) return cloudCache;
    try {
      if (typeof PlanetTextureFactory !== 'undefined' && PlanetTextureFactory.createEarthClouds) {
        cloudCache = PlanetTextureFactory.createEarthClouds();
      }
    } catch (e) { cloudCache = null; }
    if (cloudCache) {
      cloudCache.userData = cloudCache.userData || {};
      cloudCache.userData.shared = true;
    }
    return cloudCache;
  }

  function getRingTexture() {
    try {
      if (typeof PlanetTextureFactory !== 'undefined' && PlanetTextureFactory.createSaturnRings) {
        var t = PlanetTextureFactory.createSaturnRings();
        t.userData = t.userData || {};
        t.userData.shared = true;
        return t;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  /* ------------------------------------------------------------------ sprites */
  function makeLabelSprite(text, color, scale) {
    var canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = '600 40px "Inter", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(3,7,18,0.72)';
    var w = Math.min(500, ctx.measureText(text).width + 48);
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(256 - w / 2, 26, w, 76, 18); ctx.fill(); }
    else ctx.fillRect(256 - w / 2, 26, w, 76);
    ctx.fillStyle = color || '#e2e8f0';
    ctx.fillText(text, 256, 66);
    var tex = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
    var sprite = new THREE.Sprite(mat);
    var s = scale || 1;
    sprite.scale.set(6.4 * s, 1.6 * s, 1);
    return sprite;
  }

  function makeGlowSprite(color, size, opacity) {
    var canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    var ctx = canvas.getContext('2d');
    var g = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
    var c = new THREE.Color(color);
    var hex = '#' + c.getHexString();
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.25, hex);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    var tex = new THREE.CanvasTexture(canvas);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: opacity == null ? 0.9 : opacity });
    var sprite = new THREE.Sprite(mat);
    sprite.scale.set(size || 12, size || 12, 1);
    return sprite;
  }

  /* ------------------------------------------------------------------- stars */
  function makeStars(count, radius) {
    var n = count || 900;
    var positions = new Float32Array(n * 3);
    var rnd = seededRandom(20261025);
    for (var i = 0; i < n; i++) {
      var u = rnd() * 2 - 1;
      var a = rnd() * Math.PI * 2;
      var s = Math.sqrt(1 - u * u);
      var r = (radius || 300) * (0.75 + rnd() * 0.25);
      positions[i * 3] = Math.cos(a) * s * r;
      positions[i * 3 + 1] = u * r;
      positions[i * 3 + 2] = Math.sin(a) * s * r;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var mat = new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0.85 });
    return new THREE.Points(geo, mat);
  }

  /* ------------------------------------------------------------------ terrain */
  function makeHeightField(seed, amplitude, roughness) {
    var s = seed * 0.137;
    return function (x, z) {
      var h = Math.sin(x * 0.11 + s) * Math.cos(z * 0.09 - s) * 1.0;
      h += Math.sin(x * 0.27 + z * 0.19 + s * 2.1) * 0.34;
      h += Math.sin(x * 0.61 - z * 0.53 + s * 3.3) * 0.15;
      h += Math.sin(x * 1.37 + z * 1.11 + s * 1.7) * 0.05;
      return h * (amplitude || 1.5) * (roughness || 1);
    };
  }

  function terrainColor(THREE, h, maxH, palette, slope) {
    var t = clamp((h / (maxH || 1)) * 0.5 + 0.5, 0, 1);
    var low = new THREE.Color(palette[0]);
    var mid = new THREE.Color(palette[1]);
    var high = new THREE.Color(palette[2]);
    var c = t < 0.5 ? low.clone().lerp(mid, t * 2) : mid.clone().lerp(high, (t - 0.5) * 2);
    if (slope > 0.55) c.lerp(new THREE.Color(0x2a2a2a), 0.28);
    return c;
  }

  function buildTerrainMesh(planet, size, segments) {
    var heightAt = makeHeightField(planet.seed, planet.amplitude, planet.roughness);
    var geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);
    var pos = geo.attributes.position;
    var colors = new Float32Array(pos.count * 3);
    var maxH = planet.amplitude * planet.roughness;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i);
      var z = pos.getZ(i);
      var h = heightAt(x, z);
      pos.setY(i, h);
      var slope = Math.abs(heightAt(x + 0.7, z) - h) + Math.abs(heightAt(x, z + 0.7) - h);
      var c = terrainColor(THREE, h, maxH, planet.palette, slope);
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    var mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.02, flatShading: false });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = false;
    return { mesh: mesh, heightAt: heightAt, size: size };
  }

  /* ------------------------------------------------------------------ circles */
  function circleLine(radius, color, segments) {
    var pts = [];
    var n = segments || 96;
    for (var i = 0; i <= n; i++) {
      var a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    var geo = new THREE.BufferGeometry().setFromPoints(pts);
    var mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.35 });
    return new THREE.Line(geo, mat);
  }

  /* ----------------------------------------------------------------- disposal */
  function disposeObject(root, keepSharedTextures) {
    if (!root) return;
    root.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      var mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
      mats.forEach(function (mat) {
        if (!mat) return;
        ['map', 'emissiveMap', 'alphaMap', 'normalMap', 'roughnessMap'].forEach(function (k) {
          var t = mat[k];
          if (t && !(keepSharedTextures !== false && t.userData && t.userData.shared)) t.dispose();
        });
        mat.dispose();
      });
    });
  }

  function removeChildren(group, keepSharedTextures) {
    if (!group) return;
    while (group.children.length) {
      var child = group.children.pop();
      disposeObject(child, keepSharedTextures);
      group.remove(child);
    }
  }

  SU.core = {
    ready: true,
    isMobile: isMobile,
    clamp: clamp,
    lerp: lerp,
    easeInOut: easeInOut,
    seededRandom: seededRandom,
    createRenderer: createRenderer,
    resizeRenderer: resizeRenderer,
    getPlanetTexture: getPlanetTexture,
    getCloudTexture: getCloudTexture,
    getRingTexture: getRingTexture,
    makeLabelSprite: makeLabelSprite,
    makeGlowSprite: makeGlowSprite,
    makeStars: makeStars,
    makeHeightField: makeHeightField,
    buildTerrainMesh: buildTerrainMesh,
    circleLine: circleLine,
    disposeObject: disposeObject,
    removeChildren: removeChildren
  };
})();
