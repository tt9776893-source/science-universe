/* ==========================================================================
   SCIENCE UNIVERSE — DEEP SPACE V7
   Module: Open-World Survival, Mining Laser, Inventory & Holographic Construction
   File: js/space/su-survival-gameplay.js

   Inspired by Astroneer (Terrain Deformer & Resource Extraction),
   Subnautica (Holographic Fabricator & Blueprint Construction),
   and Space Engineers (Modular Planetary Base Engineering).

   Features:
   1. Active Hotbar (Keys 1-8) with smooth switching & weapon/tool states.
   2. Handheld Mining Laser with animated particle suction beam, sparks, and real-time terrain excavation.
   3. Physical 3D Resource Nuggets (Hematite, Ilmenite, Silicate, Water-Ice, Basalt) with vacuum attraction physics.
   4. Subnautica-style Holographic Blueprint Preview (cyan ghost mesh snapping to terrain height).
   5. NASA In-Situ Resource Utilization (ISRU) Fabricator & Crafting System.
   6. Persistent Modular Base Construction (Foundations, Airlock Domes, Solar Arrays, MOXIE Processors).
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.survival) SU.survival = {};

  /* ------------------------------------------------------------- 1. Data & Recipes */
  var RAW_RESOURCES = {
    hematite: { id: 'hematite', name: 'Гематит (Төмрийн хүдэр)', en: 'Hematite Ore (Fe₂O₃)', formula: 'Fe₂O₃', color: '#b91c1c', icon: '🪨', desc: 'Ангарагийн улаан хөрснөөс ялган авсан төмрийн өндөр агууламжит эрдэс.' },
    ilmenite: { id: 'ilmenite', name: 'Ильменит (Титан хүдэр)', en: 'Ilmenite Ore (FeTiO₃)', formula: 'FeTiO₃', color: '#64748b', icon: '⛰️', desc: 'Сансрын бүтээцэд ашиглах титаны үндсэн эх үүсвэр.' },
    silicate: { id: 'silicate', name: 'Кварц цахиур (Silicate)', en: 'Silicate Sand (SiO₂)', formula: 'SiO₂', color: '#e2e8f0', icon: '💎', desc: 'Нарны зай, оптик шил, хагас дамжуулагч хийх цахиурын түүхий эд.' },
    water_ice: { id: 'water_ice', name: 'Цэвдэг усан мөс', en: 'Subsurface Water Ice (H₂O)', formula: 'H₂O', color: '#38bdf8', icon: '🧊', desc: 'Хөрсний доорх цэвдэг мөс. Хүчилтөрөгч, ус, устөрөгч гарган авна.' },
    basalt: { id: 'basalt', name: 'Базальт чулуулаг', en: 'Basalt Aggregate', formula: 'SiO₂-MgO-CaO', color: '#334155', icon: '🧱', desc: 'Галт уулын суурь чулуулаг. Бааз, суурийн цутгамал хийцэд хэрэглэнэ.' }
  };

  var CRAFTING_RECIPES = [
    {
      id: 'iron_plate',
      name: 'Төмөр хавтан (Iron Plate)',
      category: 'materials',
      icon: '🛡️',
      req: { hematite: 2 },
      yieldCount: 1,
      desc: 'Гематитын хүдрээс шууд ангижруулан гаргаж авсан бүтээцийн цэвэр төмөр хавтан (ISRU Carbon Monoxide Reduction).'
    },
    {
      id: 'titanium_strut',
      name: 'Титан тулгуур (Titanium Strut)',
      category: 'materials',
      icon: '📐',
      req: { ilmenite: 2 },
      yieldCount: 1,
      desc: 'Ильменитээс ялгасан өндөр даралт, сансрын хүйтэнд тэсвэртэй хөнгөн цагаан-титаны хайлш.'
    },
    {
      id: 'silicon_glass',
      name: 'Цахиур хайлмал шил (Silicon Glass)',
      category: 'materials',
      icon: '🪟',
      req: { silicate: 2 },
      yieldCount: 1,
      desc: 'Сансрын цацраг сааруулагч кварцын хайлмал тунгалаг шилэн хавтан.'
    },
    {
      id: 'o2_canister',
      name: 'Шингэрүүлсэн O₂ баллон',
      category: 'life_support',
      icon: '🫧',
      req: { water_ice: 2 },
      yieldCount: 1,
      desc: 'Усан мөсийг электролизоор задалж гарган авсан өндөр даралтын хүчилтөрөгчийн цэнэг (+50% хүчилтөрөгч).'
    },
    {
      id: 'foundation_kit',
      name: 'Зургаан талт суурь тавцан (Foundation)',
      category: 'structures',
      icon: '🛑',
      req: { iron_plate: 2, basalt: 2 },
      yieldCount: 1,
      desc: 'Баазын барилга угсрах тэгш өндөрлөсөн ган тулгуурт суурь платформ.'
    },
    {
      id: 'hab_dome_kit',
      name: 'Судалгааны амьдрах дом (Hab Dome)',
      category: 'structures',
      icon: '🏛️',
      req: { iron_plate: 4, titanium_strut: 2, silicon_glass: 1 },
      yieldCount: 1,
      desc: 'Агаарын даралт, дулаан тусгаарлагчтай 6м диаметртэй модульчлагдсан судалгааны байгууламж.'
    },
    {
      id: 'solar_kit',
      name: 'Фотоволтайк нарны зай (Solar Array)',
      category: 'power',
      icon: '☀️',
      req: { silicon_glass: 2, titanium_strut: 1 },
      yieldCount: 1,
      desc: 'Нар дагагч автомат серво систем бүхий өндөр үр ашигт нарны цахилгаан станц.'
    },
    {
      id: 'moxie_unit',
      name: 'MOXIE Агаар мандлын компрессор',
      category: 'life_support',
      icon: '⚡',
      req: { titanium_strut: 2, iron_plate: 2 },
      yieldCount: 1,
      desc: 'НАСА-гийн MOXIE төхөөрөмж: Ангарагийн 95% CO₂ агаар мандлаас электролизоор тасралтгүй хүчилтөрөгч ялгана.'
    }
  ];

  var HOTBAR_ITEMS = [
    { slot: 1, key: '1', id: 'tool_mining', name: 'Лазер өрөмдөгч', icon: '⛏️', type: 'tool', desc: 'Хөрсийг деформацлан ухах, эрдэс чулуулгийг бутлан сорох лазер цацраг.' },
    { slot: 2, key: '2', id: 'tool_builder', name: 'Барилгын голограф', icon: '🏗️', type: 'tool', desc: 'Голограф дүрсээр барилга, байгууламж байршуулан гагнах багаж.' },
    { slot: 3, key: '3', id: 'tool_scanner', name: 'PIXL Спектрометр', icon: '🔬', type: 'tool', desc: 'Хөрс, чулуулаг руу тусган химийн бүтцийг рентген долгионоор нарийвчлан шинжлэх.' },
    { slot: 4, key: '4', id: 'item_o2', name: 'O₂ Хүчилтөрөгч', icon: '🫧', type: 'consumable', reqItem: 'o2_canister', desc: 'Сканфандрын хүчилтөрөгчийн түвшинг дүүргэх.' },
    { slot: 5, key: '5', id: 'struct_foundation', name: 'Суурь тавцан', icon: '🛑', type: 'blueprint', structType: 'foundation', reqItem: 'foundation_kit', desc: 'Гадарга дээр суурь платформ барих.' },
    { slot: 6, key: '6', id: 'struct_hab', name: 'Амьдрах дом', icon: '🏛️', type: 'blueprint', structType: 'hab', reqItem: 'hab_dome_kit', desc: 'Модульчлагдсан даралтат дом угсрах.' },
    { slot: 7, key: '7', id: 'struct_solar', name: 'Нарны зай', icon: '☀️', type: 'blueprint', structType: 'solar', reqItem: 'solar_kit', desc: 'Баазыг цахилгаанаар хангах нарны станц.' },
    { slot: 8, key: '8', id: 'struct_moxie', name: 'MOXIE станц', icon: '⚡', type: 'blueprint', structType: 'moxie', reqItem: 'moxie_unit', desc: 'Хүчилтөрөгчийн үүсгүүр байршуулах.' }
  ];

  /* ------------------------------------------------------------- 2. Inventory State */
  var inventory = {
    hematite: 6,
    ilmenite: 3,
    silicate: 6,
    water_ice: 3,
    basalt: 8,
    iron_plate: 1,      // 1 emergency starter plate
    titanium_strut: 0,
    silicon_glass: 0,
    o2_canister: 1,     // 1 backup oxygen canister
    foundation_kit: 0,  // PLAYER MUST CRAFT IN ISRU
    hab_dome_kit: 0,    // PLAYER MUST CRAFT IN ISRU
    solar_kit: 0,       // PLAYER MUST CRAFT IN ISRU
    moxie_unit: 0       // PLAYER MUST CRAFT IN ISRU
  };

  var activeHotbarIndex = 0; // 0 to 7 (Slot 1 to 8)
  var isFiringMiningLaser = false;
  var laserBeamGroup = null;
  var ghostMeshGroup = null;
  var activeGhostType = null;
  var reticleMesh = null;
  var resourceNuggets = []; // floating physics meshes

  function loadInventory(planetKey) {
    try {
      var raw = localStorage.getItem('su_inventory_v7_' + (planetKey || 'mars'));
      if (raw) {
        var parsed = JSON.parse(raw);
        for (var k in parsed) {
          inventory[k] = parsed[k];
        }
      }
    } catch (e) {
      console.warn('Failed to load inventory:', e);
    }
  }

  function saveInventory(planetKey) {
    try {
      localStorage.setItem('su_inventory_v7_' + (planetKey || 'mars'), JSON.stringify(inventory));
    } catch (e) {}
  }

  function addResource(id, count) {
    var c = count || 1;
    inventory[id] = (inventory[id] || 0) + c;
    saveInventory(SU.surfaceCurrentPlanetKey || 'mars');
    updateHotbarUI();
  }

  function consumeResource(id, count) {
    var c = count || 1;
    if ((inventory[id] || 0) < c) return false;
    inventory[id] -= c;
    saveInventory(SU.surfaceCurrentPlanetKey || 'mars');
    updateHotbarUI();
    return true;
  }

  /* ------------------------------------------------------------- 3. Mining Laser & Particle Suction VFX */
  function createMiningLaserVisuals(scene) {
    var group = new THREE.Group();
    group.name = 'miningLaserGroup';

    // 1. Core Laser Beam (Cyan high-energy plasma)
    var beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
    beamGeo.rotateX(Math.PI / 2);
    var beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });
    var beamCore = new THREE.Mesh(beamGeo, beamMat);
    group.add(beamCore);

    // 2. Outer Glow Cylinder
    var glowGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 8);
    glowGeo.rotateX(Math.PI / 2);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    var beamGlow = new THREE.Mesh(glowGeo, glowMat);
    group.add(beamGlow);

    // 3. Impact Crater Spark Particles
    var sparkCount = 28;
    var sparkPos = new Float32Array(sparkCount * 3);
    var sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    var sparkMat = new THREE.PointsMaterial({
      color: 0xfacc15,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    var sparks = new THREE.Points(sparkGeo, sparkMat);
    group.add(sparks);

    group.visible = false;
    scene.add(group);

    return {
      group: group,
      beamCore: beamCore,
      beamGlow: beamGlow,
      sparks: sparks,
      sparkPos: sparkPos,
      sparkGeo: sparkGeo
    };
  }

  /* ------------------------------------------------------------- 4. Terrain Reticle */
  function createTerrainReticle(scene) {
    var ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    ringGeo.rotateX(-Math.PI / 2);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.visible = false;
    scene.add(ring);
    return ring;
  }

  /* ------------------------------------------------------------- 5. Physical Resource Nuggets */
  function spawnResourceNugget(scene, origin, resourceId) {
    var meta = RAW_RESOURCES[resourceId] || RAW_RESOURCES.hematite;
    var geo = new THREE.DodecahedronGeometry(0.24, 0);
    var mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(meta.color),
      roughness: 0.6,
      metalness: 0.4,
      emissive: new THREE.Color(meta.color).multiplyScalar(0.25)
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);
    mesh.position.y += 0.4;

    // Upward bursting velocity
    var angle = Math.random() * Math.PI * 2;
    var speed = 1.2 + Math.random() * 1.5;
    var vel = new THREE.Vector3(
      Math.cos(angle) * speed,
      2.5 + Math.random() * 2.0,
      Math.sin(angle) * speed
    );

    scene.add(mesh);
    resourceNuggets.push({
      mesh: mesh,
      vel: vel,
      resourceId: resourceId,
      meta: meta,
      age: 0,
      collected: false
    });
  }

  function updateResourceNuggets(scene, playerPos, delta, onToast) {
    for (var i = resourceNuggets.length - 1; i >= 0; i--) {
      var n = resourceNuggets[i];
      n.age += delta;

      if (!n.collected) {
        // Gravity & parabolic motion
        n.vel.y -= 9.8 * delta;
        n.mesh.position.addScaledVector(n.vel, delta);
        n.mesh.rotation.x += delta * 4;
        n.mesh.rotation.y += delta * 5;

        // Player vacuum suction (within 10 meters)
        var dx = playerPos.x - n.mesh.position.x;
        var dy = (playerPos.y - 0.5) - n.mesh.position.y;
        var dz = playerPos.z - n.mesh.position.z;
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 10.0 && n.age > 0.25) {
          var suctionSpeed = Math.min(18.0, 24.0 / Math.max(0.4, dist));
          n.mesh.position.x += (dx / dist) * suctionSpeed * delta;
          n.mesh.position.y += (dy / dist) * suctionSpeed * delta;
          n.mesh.position.z += (dz / dist) * suctionSpeed * delta;
        }

        // Collection radius
        if (dist < 1.2) {
          n.collected = true;
          addResource(n.resourceId, 1);
          if (onToast) {
            onToast(n.meta.icon + ' ' + n.meta.name + ' (+1) сорогдлоо', 'good');
          }
          scene.remove(n.mesh);
          resourceNuggets.splice(i, 1);
        } else if (n.age > 45.0) {
          // Despawn timeout
          scene.remove(n.mesh);
          resourceNuggets.splice(i, 1);
        }
      }
    }
  }

  /* ------------------------------------------------------------- 6. Holographic Construction Ghost */
  var holoMatValid = null;
  var holoWireMatValid = null;
  var holoMatInvalid = null;
  var holoWireMatInvalid = null;

  function createHolographicGhostMeshes(scene) {
    var ghostGroup = new THREE.Group();
    ghostGroup.name = 'holographicGhostGroup';

    holoMatValid = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
      transparent: true,
      opacity: 0.45
    });

    holoWireMatValid = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    holoMatInvalid = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      wireframe: false,
      transparent: true,
      opacity: 0.55
    });

    holoWireMatInvalid = new THREE.MeshBasicMaterial({
      color: 0xf87171,
      wireframe: true,
      transparent: true,
      opacity: 0.88
    });

    var holoMat = holoMatValid;
    var holoWireMat = holoWireMatValid;

    // 1. Foundation Ghost
    var fGroup = new THREE.Group();
    fGroup.name = 'ghost_foundation';
    var fDeck = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 6), holoMat);
    var fWire = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 6), holoWireMat);
    fGroup.add(fDeck); fGroup.add(fWire);
    ghostGroup.add(fGroup);

    // 2. Hab Dome Ghost
    var hGroup = new THREE.Group();
    hGroup.name = 'ghost_hab';
    var hDome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), holoMat);
    var hWire = new THREE.Mesh(new THREE.SphereGeometry(3.2, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), holoWireMat);
    var hAirlock = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 1.8), holoMat);
    hAirlock.position.set(0, 0.9, 2.8);
    hGroup.add(hDome); hGroup.add(hWire); hGroup.add(hAirlock);
    ghostGroup.add(hGroup);

    // 3. Solar Array Ghost
    var sGroup = new THREE.Group();
    sGroup.name = 'ghost_solar';
    var sPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), holoMat);
    sPole.position.y = 1.3;
    var sPanel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.8), holoMat);
    sPanel.position.set(0, 2.6, 0);
    sPanel.rotation.x = -Math.PI / 6;
    var sWire = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 1.8), holoWireMat);
    sWire.position.set(0, 2.6, 0);
    sWire.rotation.x = -Math.PI / 6;
    sGroup.add(sPole); sGroup.add(sPanel); sGroup.add(sWire);
    ghostGroup.add(sGroup);

    // 4. MOXIE Unit Ghost
    var mGroup = new THREE.Group();
    mGroup.name = 'ghost_moxie';
    var mBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 1.4), holoMat);
    mBody.position.y = 1.0;
    var mStack = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8), holoWireMat);
    mStack.position.set(0.4, 2.2, 0);
    mGroup.add(mBody); mGroup.add(mStack);
    ghostGroup.add(mGroup);

    ghostGroup.visible = false;
    scene.add(ghostGroup);

    return ghostGroup;
  }

  /* ------------------------------------------------------------- 7. High-Fidelity Physical Base Structures */
  function buildPhysicalStructure(scene, type, x, y, z, planetKey) {
    var group = new THREE.Group();
    group.position.set(x, y, z);

    var steelMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.35, metalness: 0.85 });
    var darkAlloy = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.7 });
    var insulationWhite = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85, metalness: 0.1 });
    var glassCyan = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.75 });
    var solarBlue = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.9 });
    var hazardStripe = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.4 });

    if (type === 'foundation') {
      // Hexagonal Elevated Steel Platform with Hydraulic Footings
      var deck = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.4, 6), steelMat);
      deck.position.y = 0.2;
      deck.receiveShadow = true;
      group.add(deck);

      for (var leg = 0; leg < 6; leg++) {
        var ang = (leg / 6) * Math.PI * 2;
        var lx = Math.cos(ang) * 3.1;
        var lz = Math.sin(ang) * 3.1;
        var footing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.2, 8), darkAlloy);
        footing.position.set(lx, -0.4, lz);
        group.add(footing);
      }
    } else if (type === 'solar') {
      // Photovoltaic Tracking Solar Array
      var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.6, 12), darkAlloy);
      mast.position.y = 1.3;
      mast.castShadow = true;
      group.add(mast);

      var panel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.8), solarBlue);
      panel.position.set(0, 2.6, 0);
      panel.rotation.x = -Math.PI / 6;
      panel.castShadow = true;
      group.add(panel);

      var frame = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.1, 1.9), steelMat);
      frame.position.set(0, 2.58, 0);
      frame.rotation.x = -Math.PI / 6;
      group.add(frame);
    } else if (type === 'moxie') {
      // NASA MOXIE Atmosphere Processor Unit
      var moxBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.0, 1.4), insulationWhite);
      moxBody.position.y = 1.0;
      moxBody.castShadow = true;
      group.add(moxBody);

      var intake = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), darkAlloy);
      intake.rotation.x = Math.PI / 2;
      intake.position.set(0, 1.5, 0.72);
      group.add(intake);

      var o2Tank = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.4, 12), glassCyan);
      o2Tank.position.set(-0.5, 1.0, -0.6);
      group.add(o2Tank);

      var banner = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.04), hazardStripe);
      banner.position.set(0, 0.5, 0.71);
      group.add(banner);
    } else {
      // Pressurized Habitat Dome with Airlock & Observation Bay
      var dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.5), insulationWhite);
      dome.castShadow = true;
      dome.receiveShadow = true;
      group.add(dome);

      // Observation Porthole
      var windowMesh = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 8, 0, Math.PI * 0.6, 0, Math.PI * 0.6), glassCyan);
      windowMesh.position.set(0, 1.8, -2.4);
      group.add(windowMesh);

      // Pressurized Airlock Tunnel
      var airlock = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 1.8), darkAlloy);
      airlock.position.set(0, 0.9, 2.8);
      airlock.castShadow = true;
      group.add(airlock);

      var door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.05), steelMat);
      door.position.set(0, 0.9, 3.71);
      group.add(door);
    }

    var record = {
      id: 'SU_BLD_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: type,
      x: x, y: y, z: z,
      planetKey: planetKey || 'mars',
      timestamp: Date.now()
    };
    group.userData = record;
    scene.add(group);

    // Save persistent structure
    saveStructure(record);
    return group;
  }

  function saveStructure(record) {
    try {
      var key = 'su_' + record.planetKey + '_structures_v7';
      var raw = localStorage.getItem(key);
      var arr = raw ? JSON.parse(raw) : [];
      arr.push(record);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {}
  }

  function loadPersistentStructures(scene, planetKey) {
    try {
      var key = 'su_' + (planetKey || 'mars') + '_structures_v7';
      var raw = localStorage.getItem(key);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          arr.forEach(function (rec) {
            buildPhysicalStructure(scene, rec.type, rec.x, rec.y, rec.z, rec.planetKey);
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load structures:', e);
    }
  }

  /* ------------------------------------------------------------- 8. UI Overlay & Hotbar */
  function mountUI() {
    if (document.getElementById('su-survival-hotbar')) return;

    var container = document.createElement('div');
    container.id = 'su-survival-hud';
    container.style.cssText = 'position:fixed;left:0;right:0;bottom:18px;pointer-events:none;z-index:10050;font-family:system-ui,-apple-system,sans-serif;user-select:none;display:flex;justify-content:center;';

    container.innerHTML = `
      <!-- BOTTOM HOTBAR (V7 Elevated above mode tabs) -->
      <div id="su-survival-hotbar" style="display:flex;justify-content:center;align-items:center;gap:6px;padding:6px 12px;pointer-events:auto;max-width:96vw;overflow-x:auto;background:rgba(2,6,23,0.75);border-radius:12px;border:1px solid rgba(56,189,248,0.25);box-shadow:0 8px 28px rgba(0,0,0,0.65);backdrop-filter:blur(8px);">
        ${HOTBAR_ITEMS.map(function (it, idx) {
          return `
            <div class="su-hotbar-slot" id="su-hotbar-${idx}" onclick="window.SU.survival.selectSlot(${idx})"
                 style="width:58px;height:62px;min-width:52px;background:rgba(15,23,42,0.92);border:2px solid ${idx === 0 ? '#38bdf8' : 'rgba(255,255,255,0.18)'};border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;backdrop-filter:blur(6px);box-shadow:${idx === 0 ? '0 0 14px rgba(56,189,248,0.55)' : 'none'};transition:all 0.15s ease;">
              <span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:bold;color:#94a3b8;">${it.key}</span>
              <span style="font-size:22px;line-height:1;">${it.icon}</span>
              <span style="font-size:9px;color:#cbd5e1;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:52px;">${it.name}</span>
            </div>
          `;
        }).join('')}
        <button onclick="window.SU.survival.toggleFabricator()"
                style="height:62px;padding:0 14px;background:linear-gradient(135deg,rgba(14,165,233,0.85),rgba(2,132,199,0.95));border:1px solid #38bdf8;border-radius:8px;color:#fff;font-size:12px;font-weight:bold;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(2,132,199,0.4);flex-shrink:0;">
          <span>🧪 ISRU</span>
          <span style="font-size:10px;color:#e0f2fe;">ЦЭНЭГЛЭГЧ [B]</span>
        </button>
      </div>

      <!-- BLUEPRINT FABRICATOR & INVENTORY MODAL -->
      <div id="su-fabricator-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:780px;max-width:92vw;max-height:82vh;background:rgba(11,17,32,0.98);border:1px solid rgba(56,189,248,0.45);border-radius:14px;backdrop-filter:blur(20px);box-shadow:0 24px 60px rgba(0,0,0,0.8);pointer-events:auto;color:#f8fafc;flex-direction:column;overflow:hidden;z-index:10060;">
        <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;background:rgba(30,41,59,0.5);">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:24px;">🔬</span>
            <div>
              <div style="font-size:16px;font-weight:bold;letter-spacing:0.5px;">NASA ISRU САНСРЫН БОЛОВСРУУЛАХ & БАРИЛГЫН СИСТЕМ</div>
              <div style="font-size:11px;color:#94a3b8;">In-Situ Resource Utilization (ISRU) Science Fabricator</div>
            </div>
          </div>
          <button onclick="window.SU.survival.toggleFabricator()" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;">&times;</button>
        </div>

        <div style="display:flex;flex:1;overflow:hidden;min-height:420px;">
          <!-- LEFT: INVENTORY -->
          <div style="width:260px;border-right:1px solid rgba(255,255,255,0.1);padding:14px;overflow-y:auto;background:rgba(15,23,42,0.4);">
            <div style="font-size:12px;font-weight:bold;color:#38bdf8;margin-bottom:10px;text-transform:uppercase;">🎒 Таны агуулах (Inventory)</div>
            <div id="su-inventory-list" style="display:flex;flex-direction:column;gap:6px;"></div>
          </div>

          <!-- RIGHT: CRAFTING BLUEPRINTS -->
          <div style="flex:1;padding:16px;overflow-y:auto;">
            <div style="font-size:12px;font-weight:bold;color:#fbbf24;margin-bottom:10px;text-transform:uppercase;">🔨 Шинжлэх ухааны боловсруулалт (Crafting Recipes)</div>
            <div id="su-recipes-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    updateHotbarUI();
    renderFabricatorUI();

    // Hotkey listener
    window.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k >= '1' && k <= '8') {
        selectSlot(parseInt(k, 10) - 1);
      } else if (k.toLowerCase() === 'b' || k === 'Tab') {
        if (k === 'Tab') e.preventDefault();
        toggleFabricator();
      }
    });
  }

  function selectSlot(idx) {
    activeHotbarIndex = idx;
    if (typeof SU !== 'undefined' && SU.updateViewmodels) SU.updateViewmodels();
    var slots = document.querySelectorAll('.su-hotbar-slot');
    slots.forEach(function (el, i) {
      if (i === idx) {
        el.style.borderColor = '#38bdf8';
        el.style.boxShadow = '0 0 14px rgba(56,189,248,0.6)';
        el.style.transform = 'translateY(-3px)';
      } else {
        el.style.borderColor = 'rgba(255,255,255,0.15)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }
    });

    var activeItem = HOTBAR_ITEMS[idx];
    if (activeItem.type === 'blueprint') {
      activeGhostType = activeItem.structType;
    } else {
      activeGhostType = null;
    }
  }

  function updateHotbarUI() {
    HOTBAR_ITEMS.forEach(function (it, idx) {
      var slotEl = document.getElementById('su-hotbar-' + idx);
      if (!slotEl) return;
      var countBadge = slotEl.querySelector('.su-count-badge');
      if (it.reqItem) {
        var count = inventory[it.reqItem] || 0;
        if (!countBadge) {
          countBadge = document.createElement('span');
          countBadge.className = 'su-count-badge';
          countBadge.style.cssText = 'position:absolute;bottom:2px;right:4px;font-size:10px;font-weight:bold;color:#facc15;background:rgba(0,0,0,0.6);padding:1px 3px;border-radius:4px;';
          slotEl.appendChild(countBadge);
        }
        countBadge.innerText = 'x' + count;
      }
    });
  }

  function toggleFabricator() {
    var modal = document.getElementById('su-fabricator-modal');
    if (!modal) return;
    if (modal.style.display === 'none' || !modal.style.display) {
      renderFabricatorUI();
      modal.style.display = 'flex';
    } else {
      modal.style.display = 'none';
    }
  }

  function renderFabricatorUI() {
    var invList = document.getElementById('su-inventory-list');
    var recList = document.getElementById('su-recipes-list');
    if (!invList || !recList) return;

    // Render Inventory
    var invHtml = '';
    for (var rk in RAW_RESOURCES) {
      var raw = RAW_RESOURCES[rk];
      var count = inventory[rk] || 0;
      invHtml += `
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(30,41,59,0.6);padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:18px;">${raw.icon}</span>
            <div>
              <div style="font-size:11px;font-weight:bold;color:#f8fafc;">${raw.name}</div>
              <div style="font-size:9px;color:#94a3b8;">${raw.formula}</div>
            </div>
          </div>
          <span style="font-size:13px;font-weight:bold;color:#38bdf8;">${count}</span>
        </div>
      `;
    }
    invList.innerHTML = invHtml;

    // Render Recipes
    var recHtml = '';
    CRAFTING_RECIPES.forEach(function (rec) {
      var canCraft = true;
      var reqStrings = [];
      for (var reqKey in rec.req) {
        var needed = rec.req[reqKey];
        var available = inventory[reqKey] || 0;
        if (available < needed) canCraft = false;
        var rName = RAW_RESOURCES[reqKey] ? RAW_RESOURCES[reqKey].name : reqKey;
        reqStrings.push(`${rName}: ${available}/${needed}`);
      }

      recHtml += `
        <div style="background:rgba(30,41,59,0.5);border:1px solid ${canCraft ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'};border-radius:8px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:22px;">${rec.icon}</span>
              <div style="font-size:12px;font-weight:bold;color:${canCraft ? '#38bdf8' : '#e2e8f0'};">${rec.name}</div>
            </div>
            <div style="font-size:10px;color:#94a3b8;margin-bottom:8px;line-height:1.3;">${rec.desc}</div>
            <div style="font-size:10px;color:#cbd5e1;background:rgba(0,0,0,0.25);padding:4px 6px;border-radius:4px;margin-bottom:8px;">
              ${reqStrings.map(s => `<div>• ${s}</div>`).join('')}
            </div>
          </div>
          <button onclick="window.SU.survival.craft('${rec.id}')"
                  style="width:100%;padding:6px;border:none;border-radius:6px;background:${canCraft ? 'linear-gradient(135deg,#0284c7,#0369a1)' : '#334155'};color:${canCraft ? '#ffffff' : '#64748b'};font-size:11px;font-weight:bold;cursor:${canCraft ? 'pointer' : 'not-allowed'};">
            ${canCraft ? '🛠️ БОЛОВСРУУЛАХ (Craft)' : 'Түүхий эд дутуу'}
          </button>
        </div>
      `;
    });
    recList.innerHTML = recHtml;
  }

  function craft(recipeId) {
    var rec = CRAFTING_RECIPES.find(r => r.id === recipeId);
    if (!rec) return;

    for (var reqKey in rec.req) {
      if ((inventory[reqKey] || 0) < rec.req[reqKey]) {
        if (SU.surfaceOnToast) SU.surfaceOnToast('Түүхий эд хүрэлцэхгүй байна: ' + reqKey, 'warn');
        return;
      }
    }

    for (var rKey in rec.req) {
      consumeResource(rKey, rec.req[rKey]);
    }

    addResource(rec.id, rec.yieldCount || 1);
    if (SU.surfaceOnToast) {
      SU.surfaceOnToast('✨ ' + rec.name + ' амжилттай боловсруулагдлаа!', 'good');
    }
    renderFabricatorUI();
  }

  /* ------------------------------------------------------------- 9. Main Controller Interface */
  function initSurvivalEngine(opts) {
    var scene = opts.scene;
    var camera = opts.camera;
    var chunkManager = opts.chunkManager;
    var planet = opts.planet;
    var onToast = opts.onToast;

    SU.surfaceCurrentPlanetKey = planet.key;
    SU.surfaceOnToast = onToast;
    SU.updateViewmodels = updateViewmodelVisibility;

    loadInventory(planet.key);

    var laserVFX = createMiningLaserVisuals(scene);
    var reticle = createTerrainReticle(scene);
    var ghostGroup = createHolographicGhostMeshes(scene);

    loadPersistentStructures(scene, planet.key);
    mountUI();

    // -----------------------------------------------------------
    // Production 3D Viewmodel Pipeline (Mining Laser & Scanner)
    // -----------------------------------------------------------
    var viewmodelGroup = new THREE.Group();
    viewmodelGroup.name = 'firstPersonViewmodelGroup';
    viewmodelGroup.renderOrder = 999;
    camera.add(viewmodelGroup);

    // Dedicated viewmodel fill light for crisp PBR materials in any planetary lighting
    var vmLight = new THREE.PointLight(0xffffff, 0.55, 3.0);
    vmLight.position.set(0.15, 0.25, 0.1);
    viewmodelGroup.add(vmLight);

    var miningLaserModel = null;
    var geoScannerModel = null;
    var viewmodelBobTime = 0;
    var laserRecoil = 0;

    function updateViewmodelVisibility() {
      var item = HOTBAR_ITEMS[activeHotbarIndex];
      var isMining = item && item.id === 'tool_mining';
      var isScanner = item && (item.id === 'tool_scanner' || item.id === 'tool_builder');

      if (miningLaserModel) miningLaserModel.visible = !!isMining;
      if (geoScannerModel) geoScannerModel.visible = !!isScanner;
    }

    if (typeof THREE.GLTFLoader === 'function') {
      var vmLoader = new THREE.GLTFLoader();
      vmLoader.load('assets/models/tool_mining_laser.glb', function (gltf) {
        miningLaserModel = gltf.scene;
        miningLaserModel.scale.set(0.55, 0.55, 0.55);
        miningLaserModel.position.set(0.18, -0.14, -0.36);
        miningLaserModel.rotation.set(-0.06, 0.14, -0.04);
        miningLaserModel.traverse(function (o) {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = false;
            o.renderOrder = 999;
            if (o.material) {
              o.material.depthTest = true;
              o.material.depthWrite = true;
            }
          }
        });
        viewmodelGroup.add(miningLaserModel);
        updateViewmodelVisibility();
      });

      vmLoader.load('assets/models/tool_geo_scanner.glb', function (gltf) {
        geoScannerModel = gltf.scene;
        geoScannerModel.scale.set(0.58, 0.58, 0.58);
        geoScannerModel.position.set(0.17, -0.13, -0.34);
        geoScannerModel.rotation.set(-0.10, 0.18, -0.05);
        geoScannerModel.traverse(function (o) {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = false;
            o.renderOrder = 999;
            if (o.material) {
              o.material.depthTest = true;
              o.material.depthWrite = true;
            }
          }
        });
        viewmodelGroup.add(geoScannerModel);
        updateViewmodelVisibility();
      });
    }

    var mouseWorldTarget = new THREE.Vector3();
    var hasValidAim = false;
    var raycaster = new THREE.Raycaster();

    function update(playerPos, isMouseDown, delta) {
      updateViewmodelVisibility();

      // 1. Raycast to find terrain impact point
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      var chunkMeshes = chunkManager ? chunkManager.getChunkMeshes() : [];
      var hits = raycaster.intersectObjects(chunkMeshes, false);

      if (hits.length > 0 && hits[0].distance < 38.0) {
        hasValidAim = true;
        mouseWorldTarget.copy(hits[0].point);
        reticle.position.copy(mouseWorldTarget);
        reticle.position.y += 0.05;
        reticle.visible = true;

        // Orient reticle along terrain normal
        if (chunkManager && chunkManager.getNormalAt) {
          var n = chunkManager.getNormalAt(mouseWorldTarget.x, mouseWorldTarget.z);
          reticle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(n.x, n.y, n.z));
        }
      } else {
        hasValidAim = false;
        reticle.visible = false;
      }

      // Viewmodel breathing bob & laser recoil animation
      viewmodelBobTime += delta * 3.5;
      var bobY = Math.sin(viewmodelBobTime) * 0.003;
      var bobX = Math.cos(viewmodelBobTime * 0.5) * 0.002;

      var activeTool = HOTBAR_ITEMS[activeHotbarIndex];
      if (activeTool.id === 'tool_mining' && isMouseDown && hasValidAim) {
        laserRecoil = Math.min(0.04, laserRecoil + delta * 0.7);
        if (miningLaserModel) {
          miningLaserModel.traverse(function (o) {
            if (o.name && o.name.indexOf('Laser_CoilRing') !== -1 && o.material) {
              o.material.emissiveIntensity = 4.0 + Math.sin(performance.now() * 0.03) * 3.0;
            }
          });
        }
        laserVFX.group.visible = true;
      } else {
        laserRecoil = Math.max(0, laserRecoil - delta * 0.22);
      }

      if (miningLaserModel && miningLaserModel.visible) {
        miningLaserModel.position.set(0.18 + bobX, -0.14 + bobY, -0.36 + laserRecoil);
      }
      if (geoScannerModel && geoScannerModel.visible) {
        geoScannerModel.position.set(0.17 + bobX, -0.13 + bobY, -0.34);
      }

      // 2. Mining Laser Execution
      if (activeTool.id === 'tool_mining' && isMouseDown && hasValidAim) {

        // Laser beam origin aligned with physical 3D model nozzle
        var emitterPos = new THREE.Vector3();
        if (miningLaserModel && miningLaserModel.visible) {
          var nozzleObj = miningLaserModel.getObjectByName('Laser_Nozzle');
          if (nozzleObj) {
            nozzleObj.getWorldPosition(emitterPos);
          } else {
            emitterPos = new THREE.Vector3(0, 0, -0.3).applyMatrix4(miningLaserModel.matrixWorld);
          }
        } else {
          emitterPos = new THREE.Vector3(0.35, -0.28, -0.6).applyMatrix4(camera.matrixWorld);
        }
        var dir = new THREE.Vector3().subVectors(mouseWorldTarget, emitterPos);
        var beamLen = dir.length();

        laserVFX.group.position.copy(emitterPos);
        laserVFX.group.lookAt(mouseWorldTarget);
        laserVFX.beamCore.scale.set(1, 1, beamLen);
        laserVFX.beamGlow.scale.set(1, 1, beamLen);
        laserVFX.beamCore.position.set(0, 0, beamLen * 0.5);
        laserVFX.beamGlow.position.set(0, 0, beamLen * 0.5);

        // Sparks at impact
        for (var si = 0; si < 28; si++) {
          laserVFX.sparkPos[si * 3] = (Math.random() - 0.5) * 0.8;
          laserVFX.sparkPos[si * 3 + 1] = (Math.random() - 0.5) * 0.8;
          laserVFX.sparkPos[si * 3 + 2] = beamLen + (Math.random() - 0.5) * 0.8;
        }
        laserVFX.sparkGeo.attributes.position.needsUpdate = true;

        // Real-time terrain excavation
        if (chunkManager && chunkManager.modifyTerrain) {
          chunkManager.modifyTerrain(mouseWorldTarget.x, mouseWorldTarget.z, 2.2, delta * 2.0);
        }

        // Spawn resource nuggets probabilistically while mining
        if (Math.random() < 0.22) {
          var pickRes = 'hematite';
          var roll = Math.random();
          if (roll > 0.75) pickRes = 'ilmenite';
          else if (roll > 0.5) pickRes = 'silicate';
          else if (roll > 0.3) pickRes = 'water_ice';
          else if (roll > 0.15) pickRes = 'basalt';
          spawnResourceNugget(scene, mouseWorldTarget, pickRes);
        }
      } else {
        laserVFX.group.visible = false;
      }

      // 3. Holographic Ghost Preview
      if (activeGhostType && hasValidAim) {
        ghostGroup.visible = true;
        ghostGroup.position.copy(mouseWorldTarget);

        ghostGroup.children.forEach(function (child) {
          child.visible = (child.name === 'ghost_' + activeGhostType);
        });
      } else {
        ghostGroup.visible = false;
      }

      // 4. Update physical resource nuggets
      updateResourceNuggets(scene, playerPos, delta, onToast);
    }

    function placeActiveStructure() {
      if (!activeGhostType) return false;
      if (!hasValidAim) {
        var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        fwd.y = 0;
        if (fwd.lengthSq() > 0) fwd.normalize();
        else fwd.set(0, 0, -1);
        var tx = camera.position.x + fwd.x * 6.0;
        var tz = camera.position.z + fwd.z * 6.0;
        var ty = chunkManager ? chunkManager.getHeightAt(tx, tz) : camera.position.y - 1.7;
        mouseWorldTarget.set(tx, ty, tz);
      }

      var dist = camera.position.distanceTo(mouseWorldTarget);
      if (dist < 2.5 || dist > 14.0) {
        if (onToast) onToast('⚠️ Байршуулах зайд хүрэхгүй байна (3м - 12м)', 'warn');
        return false;
      }

      var activeTool = HOTBAR_ITEMS[activeHotbarIndex];
      if (activeTool.reqItem && (inventory[activeTool.reqItem] || 0) < 1) {
        if (onToast) onToast('⚠️ [ISRU ШААРДЛАГА]: Энэ байгууламжийг барихад \'' + activeTool.name + '\' шаардлагатай! Эхлээд түүхий эд цуглуулан ISRU төхөөрөмжөөр (B товч) угсарна уу.', 'warn');
        return false;
      }

      if (activeTool.reqItem) {
        consumeResource(activeTool.reqItem, 1);
      }

      var bld = buildPhysicalStructure(scene, activeGhostType, mouseWorldTarget.x, mouseWorldTarget.y, mouseWorldTarget.z, planet.key);
      if (onToast) onToast('🏗️ Модуль амжилттай суурилагдлаа: ' + activeTool.name, 'good');
      return bld;
    }

    function dispose() {
      if (viewmodelGroup) {
        camera.remove(viewmodelGroup);
        viewmodelGroup = null;
      }
      if (laserVFX && laserVFX.group) scene.remove(laserVFX.group);
      if (reticle) scene.remove(reticle);
      if (ghostGroup) scene.remove(ghostGroup);
      resourceNuggets.forEach(function (n) {
        scene.remove(n.mesh);
      });
      resourceNuggets = [];
      var hud = document.getElementById('su-survival-hud');
      if (hud) hud.remove();
    }

    return {
      update: update,
      placeActiveStructure: placeActiveStructure,
      selectSlot: selectSlot,
      toggleFabricator: toggleFabricator,
      craft: craft,
      getInventory: function () { return inventory; },
      addResource: addResource,
      dispose: dispose
    };
  }

  SU.survival = {
    initEngine: initSurvivalEngine,
    selectSlot: selectSlot,
    toggleFabricator: toggleFabricator,
    craft: craft
  };
})();
