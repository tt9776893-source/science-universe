/* ==========================================================================
   SCIENCE UNIVERSE — DEEP SPACE V4 · REALISTIC PLANETARY WORLDS & EXPLORATION
   File: js/space/su-surface.js
   
   Deep Space V4 Capabilities:
   1. Unique, destination-specific 3D environments for ALL worlds:
      - Mars: Red rocky terrain, craters, dunes, dust particles, Ares Hab, Rover, GPR.
      - Mercury: Heavily cratered terrain, high-contrast harsh sunlight, Sunshield Lander.
      - Venus: Dense amber sulfuric fog, 92 bar / 465°C, armored titanium Venera probe.
      - Europa: Fractured chaos ice ridges, giant detailed Jupiter in sky, deep ocean sonar.
      - Titan: Orange photochemical smog, reflective liquid methane lake, tholin dunes.
      - Enceladus: Bright snowy terrain, active 3D particle cryogeysers, Saturn with rings in sky.
      - Saturn: High-altitude 1-bar Aerostat Station, deep multi-layer clouds, tilted 3D rings,
        interactive atmospheric dropsonde launcher, multi-channel gas spectrometer.
      - Jupiter, Uranus, Neptune: Floating atmospheric aerostats / probe stations (NO fake solid ground).
   2. Replaced primitive cubes with recognizable, high-detail scientific equipment:
      - Pressurized habitat / lander with airlocks, solar arrays / RTGs, comm dishes.
      - Multi-axis robotic arm with drill turret.
      - Sample analysis glovebox chamber with astrobiological biosignature detection.
      - Ground-penetrating radar (GPR) console for subsurface ice investigation.
      - Atmospheric dropsonde launcher with live depth descent telemetry.
   3. First-Person exploration with accurate planet gravity, collision, jumping, interaction HUD.
   4. Versioned persistent research journal (localStorage['su_deepspace_journal_v3']).
   5. Seamless connection to Life Genesis Engine.
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.core || !SU.core.ready) return;

  var C = SU.core;

  /**
   * Authoritative Geological & Environmental Sample Catalog by Destination
   */
  var GEOLOGY_CATALOG = {
    mars: [
      { name: 'Шүлтлэг базальт (Basaltic Crust)', cls: 'Магмын чулуулаг', comp: 'SiO₂ 48%, FeO 17%, Al₂O₃ 10%, CaO 8%', conf: '[ESTABLISHED NASA/ESA]', desc: 'Төмрөөр баялаг лаавын урсацаас хөрсөн галт уулын эртний царцдас.' },
      { name: 'Оливин баялаг элсэн чулуу (Olivine Cumulate)', cls: 'Хэт суурьлаг чулуулаг', comp: 'Mg₂SiO₄ 62%, Fe₂SiO₄ 24%, Cr₂O₃ 1.2%', conf: '[MEASURED CURIOSITY]', desc: 'Усанд бага өртсөн эртний хуурай уур амьсгалын гэрч оливины хуримтлал.' },
      { name: 'Төмрийн исэлт реголит (Hematite Spherule)', cls: 'Гидротермал тунадас', comp: 'Fe₂O₃ 88%, SiO₂ 6%, Ni 0.4%', conf: '[MEASURED OPPORTUNITY]', desc: 'Ангарагийн "нэрс" (blueberries) гэгддэг эртний усан орчинд үүссэн гематит бөмбөлөг.' },
      { name: 'Перхлорат давсны талст (Perchlorate Salt)', cls: 'Ууршилтын давс', comp: 'Mg(ClO₄)₂ 74%, Ca(ClO₄)₂ 18%', conf: '[MEASURED PHOENIX]', desc: 'Хөлдөх цэгийг бууруулагч идэвхтэй хлорт давсны тунадас.' },
      { name: 'Филлосиликат шавар (Smectite Clay)', cls: 'Усан тунамал чулуулаг', comp: 'Al₂Si₄O₁₀(OH)₂ 55%, H₂O 14%', conf: '[MEASURED PERSEVERANCE]', desc: 'Эртний Ноахийн галавт төвийг сахисан pH-тай шингэн ус урсаж байсны нотолгоо.' }
    ],
    mercury: [
      { name: 'Магни баялаг анортозит (Magnesian Anorthosite)', cls: 'Плутоник чулуулаг', comp: 'MgO 32%, SiO₂ 44%, FeO 2.1%', conf: '[MEASURED MESSENGER]', desc: 'Төмөр маш бага, магнигаар баялаг Мөнгөн-Усны эртний анхдагч царцдас.' },
      { name: 'Титант илменит реголит (Ilmenite Regolith)', cls: 'Цохилтын реголит', comp: 'FeTiO₃ 42%, MgSiO₃ 38%', conf: '[ESTABLISHED MESSENGER]', desc: 'Сансрын цацраг ба солирын бөмбөгдөлтөөр нунтаглагдсан титан исэлт тоосонцор.' },
      { name: 'Шилэрхэг цохилтын брекчи (Impact Melt Breccia)', cls: 'Цохилтын чулуулаг', comp: 'Шил 60%, Плагиоклаз 30%', conf: '[MEASURED MESSENGER]', desc: 'Аварга солир маш өндөр хурдтай мөргөхөд хайлж царцсан шилэрхэг бүтэц.' }
    ],
    venus: [
      { name: 'Толеит базальт хайлмаг (Tholeiitic Basalt)', cls: 'Галт уулын базальт', comp: 'SiO₂ 49%, Al₂O₃ 16%, FeO 9%, CaO 10%', conf: '[MEASURED VENERA 14]', desc: '465°C халуун, 92 атм даралтад гадаргын хайлмал лаавын талстжилт.' },
      { name: 'Сульфат бүрхүүл силикат (Sulfatized Silicate)', cls: 'Хүхрийн хүчлийн урвал', comp: 'CaSO₄ 52%, FeSO₄ 28%', conf: '[MEASURED VENERA 13]', desc: 'Агаар мандлын хүхрийн хүчлийн нөлөөгөөр химийн хувиралд орсон гадарга.' }
    ],
    moon: [
      { name: 'Сарны анортозит (Lunar Ferroan Anorthosite)', cls: 'Магмын хөнгөн чулуулаг', comp: 'Plagioclase 95%, CaAl₂Si₂O₈ 90%', conf: '[MEASURED APOLLO 16]', desc: 'Сарны магмын далай хөрөх үед хөвж тогтсон 4.4 тэрбум жилийн настай анхдагч өндөрлөгийн чулуу.' },
      { name: 'Сарны тэнгисийн титант базальт (High-Ti Basalt)', cls: 'Тэнгисийн базальт', comp: 'TiO₂ 12%, FeO 18%, SiO₂ 40%', conf: '[MEASURED APOLLO 11]', desc: 'Аполло-11-ийн авчирсан Сарны нам дор тэнгисийг бүрдүүлэгч хар өнгийн лаав.' }
    ],
    europa: [
      { name: 'Криоген усны мөс (Cryogenic Hexagonal Ice)', cls: 'Мөсөн царцдас', comp: 'H₂O 96%, Органик ул мөр 2%', conf: '[ESTABLISHED GALILEO]', desc: '100 К температурт төмөр шиг хатуурсан, цацрагт тэсвэртэй цэвэр усны талст мөс.' },
      { name: 'Магнийн сульфат давс (Epsomite Brine)', cls: 'Шүлтлэг далайн давс', comp: 'MgSO₄·7H₂O 78%, NaCl 14%', conf: '[MEASURED KECK/JWST]', desc: 'Гүний далайнаас ан цаваар түрэн гарч ууршин тунасан шүлтлэг эрдэс.' },
      { name: 'Хүхрийн хүчлийн гидрат (Radiolytic Hydrate)', cls: 'Цацрагийн химийн бүтээгдэхүүн', comp: 'H₂SO₄·4H₂O 82%, SO₂ 12%', conf: '[MEASURED GALILEO NIMS]', desc: 'Бархасбадийн ионы бүсийн хүхрийн бөмбөгдөлтөөс үүссэн улаан хүрэн судал.' },
      { name: 'Хаос мужийн дахин хөлдсөн мөс (Conamara Ice Block)', cls: 'Диапирик мөс', comp: 'H₂O 91%, Давс 9%', conf: '[ESTABLISHED GALILEO]', desc: 'Гүний дулаан урсгалаар хайлж эвдрээд дахин хөлдсөн мөсөн уул.' }
    ],
    titan: [
      { name: 'Фотохимийн Органик Толин (Prebiotic Tholin)', cls: 'Макромолекул полимер', comp: 'C:H:N (11:11:1), Амин хүчлийн угтал', conf: '[MEASURED CASSINI-HUYGENS]', desc: 'Азот-метаны фотолизоор үүссэн амьдралын урьдал нарийн органик толин.' },
      { name: 'Боржин шиг хатуу усны суурь мөс (Silicate-like Water Ice)', cls: 'Крио-суурь чулуулаг', comp: 'H₂O 98%, NH₃ 2%', conf: '[MEASURED HUYGENS DISR]', desc: '-179°C хэмд боржин чулуу мэт бат бэх болсон Титаны царцдасын суурь.' },
      { name: 'Хатуу Ацетилен тунадас (Solid Acetylene Flakes)', cls: 'Органик эрдэс', comp: 'C₂H₂ 92%, HCN 6%', conf: '[MEASURED CASSINI VIMS]', desc: 'Агаар мандлаас орсон органик талст цас, амьдралын урьдал пурин үүсгэгч.' },
      { name: 'Шингэн метан шингээсэн реголит (Methane-soaked Regolith)', cls: 'Нүүрсустөрөгчийн тунадас', comp: 'CH₄ 70%, C₂H₆ 18%, N₂ 8%', conf: '[MEASURED HUYGENS SSP]', desc: 'Шингэн метаны голын бэлчирт норсон органик элсэн хөрс.' }
    ],
    enceladus: [
      { name: 'Гейзерийн шүлтлэг давст мөс (Alkaline Ocean Ice)', cls: 'Далайн крио-тунадас', comp: 'NaCl 85%, NaHCO₃ 10%, H₂O 5%', conf: '[MEASURED CASSINI CDA]', desc: 'pH 9-11 шүлтлэг гүний далайгаас сансарт цацагдаж хөлдсөн давсны нано-талст.' },
      { name: 'Гидротермал Нано-Силикат (Hydrothermal Silica)', cls: 'Ёроолын гүний эрдэс', comp: 'SiO₂ 98%, H₂O 2%', conf: '[MEASURED CASSINI INMS]', desc: 'Далайн ёроолд >90°C халуун рашаан ундарч буйн баталгаа болсон нано-талст.' },
      { name: 'Молекул Устөрөгч агуулсан мөсөн клатрат (H₂ Clathrate)', cls: 'Химийн эрчим хүчний эх үүсвэр', comp: 'H₂ 4%, CH₄ 2%, H₂O 94%', conf: '[MEASURED CASSINI INMS]', desc: 'Серпентинизацийн урвалаар үүссэн метан үүсгэгч архейн тэжээл.' },
      { name: 'Макромолекул Органик хэлтэрхий (Refractory Organics)', cls: 'Пребиотик органик нэгдэл', comp: 'Ароматик ба алифатик нүүрсустөрөгч', conf: '[MEASURED CASSINI CDA 2018]', desc: 'Далайн гадарга дээр хөвж буй органик хальснаас цацагдсан нарийн органик молекул.' }
    ],
    saturn: [
      { name: 'Аммиакийн мананцар аэрозоль (NH₃ Aerosol)', cls: '1-бар Үүлэн дусал', comp: 'NH₃ 82%, H₂O 14%, Фотометр ул мөр 4%', conf: '[MEASURED CASSINI CIRS]', desc: '1 бар түвшинд хөвөх цайвар алтан өнгөт аммиакийн хөлдүү талст дуслууд.' },
      { name: 'Аммонийн гидросульфид бөөмс (NH₄SH Slurry)', cls: 'Гүний үүлэн бүс (2.5 бар)', comp: 'NH₄SH 92%, H₂S 5%, PH₃ 3%', conf: '[ESTABLISHED MODEL]', desc: '2-4 бар даралтад устөрөгчийн сульфид ба аммиакийн урвалаар үүссэн шар-бор үүл.' },
      { name: 'Өндөр хурдат салхины устөрөгчийн урсгал', cls: 'Экваторын тийрэлтэт хий', comp: 'H₂ 96.3%, He 3.25%, CH₄ 0.45%', conf: '[MEASURED VOYAGER/CASSINI]', desc: '1,450 км/ц хурдтай экваторын зүүн зүгийн салхинаас барьж авсан хийн дээж.' }
    ],
    jupiter: [
      { name: 'Их Улаан Толбоны хромофор (Phosphorus Chromophore)', cls: 'Шуурганы аэрозоль', comp: 'P₄/Органик 68%, NH₃ 24%', conf: '[MEASURED JUNO MWR]', desc: 'Нарны хэт ягаан туяанд өнгөө хувиргасан 350 жилийн настай супер антициклоны улаан тоосонцор.' },
      { name: 'Аммиакийн өндөр даралтын мөс (Dense Jovian NH₃)', cls: 'Агаар мандлын талст', comp: 'NH₃ 90%, H₂O 10%', conf: '[MEASURED GALILEO PROBE]', desc: 'Бархасбадийн цагаан зурваст үүлнээс шүүсэн крио-талст.' }
    ],
    default: [
      { name: 'Силикат чулуулаг (Silicate Crust)', cls: 'Ерөнхий царцдас', comp: 'SiO₂ 52%, Al₂O₃ 14%, FeO 11%', conf: '[MODEL PREDICTION]', desc: 'Гаригийн царцдасын нийтлэг цахиур-хөнгөнцагааны нэгдэл.' },
      { name: 'Цохилтын брекчи (Meteorite Breccia)', cls: 'Цохилтын чулуулаг', comp: 'Талстлаг реголит 80%', conf: '[MODEL PREDICTION]', desc: 'Солирын мөргөлтөөс үүссэн хэлтэрхий чулуулгийн барьцалдсан хэлбэр.' }
    ]
  };

  SU.surface = {
    create: function (opts) {
      var renderer = opts.renderer;
      var canvas = opts.canvas;
      var onToast = opts.onToast || function () {};
      var onEnter = opts.onEnter || function () {};

      var scene = null;
      var camera = new THREE.PerspectiveCamera(68, 1, 0.08, 600);

      function createCircularParticleTexture() {
        var cv = document.createElement('canvas');
        cv.width = 64; cv.height = 64;
        var ctx = cv.getContext('2d');
        var radGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        radGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        radGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.65)');
        radGrad.addColorStop(0.70, 'rgba(255, 255, 255, 0.15)');
        radGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, 64, 64);
        var tex = new THREE.CanvasTexture(cv);
        return tex;
      }
      var heightAt = function () { return 0; };
      var chunkManager = null;
      var planet = null;
      var platform = false;
      var active = false;
      var researchMode = false;
      var targets = [];
      var targetGroup = null;
      var keys = {};
      var joy = { x: 0, y: 0 };
      var yaw = 0, pitch = 0;
      var velocityY = 0;
      var grounded = true;
      var eye = 1.65;
      var playerPos = new THREE.Vector3(0, 0, 5.5);
      var physicsAccumulator = 0.0;
      var lastRecordedCamY = 0;
      var physicsDebugEnabled = false;
      var bounds = 55;
      var bobT = 0;
      var spawn = new THREE.Vector3(0, 0, 5.5);
      var drag = null;
      var time = 0;

      // Deep Space V4 additions
      var raycaster = new THREE.Raycaster();
      var rayCenter = new THREE.Vector2(0, 0);
      var interactiveRocks = [];
      var interactiveEquip = [];
      var playerInventory = [];
      var landerGroup = null;
      var landerPos = new THREE.Vector3(0, 0, 0);
      var deployedStructures = [];
      var survivalEngine = null;
      var isMouseDown = false;
      var sunDir = null;

      var survival = {
        oxygen: 100,
        power: 100,
        suitTempC: 21,
        pressureAtm: 1.0,
        radiationRisk: 'Low'
      };

      var tmpFwd = new THREE.Vector3();
      var tmpRight = new THREE.Vector3();

      /* ----------------------------------------------- Venus Volumetric Sky Dome */
      function createVenusSkyTexture() {
        var cv = document.createElement('canvas');
        cv.width = 1024; cv.height = 512;
        var ctx = cv.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.00, '#b88628'); // Upper dense amber-gold sulfuric haze
        grad.addColorStop(0.35, '#a47320'); // Upper sulfuric acid clouds
        grad.addColorStop(0.65, '#8c5e18'); // Mid-sky heavy cloud deck
        grad.addColorStop(0.85, '#7a5214'); // Horizon atmospheric scattering band
        grad.addColorStop(1.00, '#5a3b0e'); // Nadir ground shadow
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        var rnd = C.seededRandom(9421);
        for (var b = 0; b < 45; b++) {
          var by = rnd() * 400;
          var bh = 4 + rnd() * 26;
          ctx.fillStyle = rnd() > 0.5 ? 'rgba(234, 179, 8, 0.08)' : 'rgba(90, 55, 12, 0.12)';
          ctx.beginPath();
          ctx.ellipse(rnd() * 1024, by, 180 + rnd() * 400, bh, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        var tex = new THREE.CanvasTexture(cv);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        return tex;
      }

      /* ----------------------------------------------- Earth Atmospheric Rayleigh Sky */
      function createEarthSkyTexture() {
        var cv = document.createElement('canvas');
        cv.width = 1024; cv.height = 512;
        var ctx = cv.getContext('2d');
        var grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0.00, '#1e40af'); // Deep zenith blue (Rayleigh scattering)
        grad.addColorStop(0.35, '#3b82f6'); // Mid-sky azure
        grad.addColorStop(0.70, '#93c5fd'); // Soft lower atmosphere
        grad.addColorStop(0.90, '#dbeafe'); // Horizon light haze band
        grad.addColorStop(1.00, '#e2e8f0'); // Ground horizon blending
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        // Soft procedural cumulus cloud puffs
        var rnd = C.seededRandom(31415);
        for (var c = 0; c < 32; c++) {
          var cx = rnd() * 1024;
          var cy = 120 + rnd() * 220;
          var cw = 120 + rnd() * 260;
          var ch = 15 + rnd() * 35;
          ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.12 + rnd() * 0.22) + ')';
          ctx.beginPath();
          ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        var tex = new THREE.CanvasTexture(cv);
        tex.mapping = THREE.EquirectangularReflectionMapping;
        return tex;
      }

      /* -------------------------------------------------------------- build */
      function build(key) {
        disposeScene();
        planet = SU.data.getPlanet(key);
        platform = planet.type === 'gas';
        bounds = platform ? 12.0 : 2500;

        // Reset survival physics based on authoritative environment
        survival.oxygen = 100;
        survival.power = 100;
        survival.suitTempC = 21;
        survival.pressureAtm = planet.pressureAtm || (platform ? 1.0 : 0.001);
        survival.radiationRisk = (platform || planet.airless) ? 'Өндөр (Сансрын цацраг)' : 'Бага (Агаар мандал)';

        scene = new THREE.Scene();
        scene.add(camera);
        if (planet.key === 'venus') {
          scene.background = createVenusSkyTexture();
          scene.fog = new THREE.Fog(0x7a5214, 15, 135);
        } else if (planet.key === 'earth') {
          scene.background = createEarthSkyTexture();
          scene.fog = new THREE.Fog(0xb8d5eb, 60, 480);
        } else if (platform) {
          scene.background = new THREE.Color(planet.sky);
          scene.fog = new THREE.Fog(planet.fog, 35, 180);
        } else if (planet.key === 'mars') {
          scene.background = new THREE.Color(planet.sky);
          scene.fog = new THREE.Fog(planet.fog, 35, 180);
        } else if (planet.key === 'titan') {
          scene.background = new THREE.Color(planet.sky);
          scene.fog = new THREE.Fog(0x9a5814, 20, 180);
        } else if (planet.airless) {
          scene.background = new THREE.Color(0x010204);
          scene.fog = new THREE.Fog(0x010204, 350, 1200); // Sharp vacuum visibility
        } else {
          scene.background = new THREE.Color(planet.sky);
          scene.fog = new THREE.Fog(planet.fog, 45, 260);
        }

        // Lighting tailored to destination
        var hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, platform ? 1.0 : 0.6);
        if (planet.key === 'mars') {
          hemi.color.setHex(0xfba680); // Salmon atmospheric diffuse
          hemi.groundColor.setHex(0x2d1206); // Deep basalt ground bounce
          hemi.intensity = 0.26; // Controlled ambient bounce to preserve geological shadow depth
        } else if (planet.key === 'venus') {
          hemi.color.setHex(0xf59e0b); // Dense amber sulfuric sky bounce
          hemi.groundColor.setHex(0x1e1408); // Dark volcanic basalt ground bounce
          hemi.intensity = 0.38; // Balanced ambient so normal maps & shadows have deep 3D relief
        } else if (planet.key === 'earth') {
          hemi.color.setHex(0xdbeafe); // Clear blue sky diffuse
          hemi.groundColor.setHex(0x223d1c); // Lush green continental soil bounce
          hemi.intensity = 0.52; // Natural daylight ambient
        } else if (planet.airless) {
          hemi.color.setHex(0x080c14); // Vacuum of space - minimal ambient bounce
          hemi.groundColor.setHex(0x030408);
          hemi.intensity = 0.15; // High contrast harsh shadows
        } else if (planet.key === 'europa') {
          hemi.color.setHex(0xdbeafe);
          hemi.groundColor.setHex(0x0f172a);
          hemi.intensity = 0.45;
        }
        scene.add(hemi);

        var ambientIntensity = platform ? 0.5 : (planet.key === 'venus' ? 0.22 : (planet.key === 'mars' ? 0.18 : 0.30));
        var ambientColor = planet.key === 'venus' ? 0x543a18 : (planet.key === 'mars' ? 0x4a2c20 : 0xffffff);
        var ambient = new THREE.AmbientLight(ambientColor, ambientIntensity);
        scene.add(ambient);

        var sunIntensity = platform ? 1.1 : (planet.key === 'venus' ? 1.45 : (planet.key === 'mars' ? 1.85 : (planet.key === 'earth' ? 1.65 : (planet.airless ? 2.1 : 1.35))));
        var sunColor = planet.key === 'venus' ? 0xffdc88 : (planet.key === 'mars' ? 0xffeedb : (planet.key === 'earth' ? 0xfffaea : (planet.airless ? 0xffffff : 0xfff6e5)));
        sunDir = new THREE.DirectionalLight(sunColor, sunIntensity);
        sunDir.position.set(planet.key === 'mars' ? 75 : (planet.key === 'venus' ? 40 : -45), 55, planet.key === 'mars' ? 60 : (planet.key === 'venus' ? 35 : -35));
        sunDir.castShadow = true;

        // V7 Adaptive High-Resolution Directional Shadow Frustum
        var shadowDim = platform ? 25 : 85;
        var shadowRes = C.isMobile() ? 1024 : 2048;
        sunDir.shadow.mapSize.width = shadowRes;
        sunDir.shadow.mapSize.height = shadowRes;
        sunDir.shadow.camera.near = 1.0;
        sunDir.shadow.camera.far = 280.0;
        sunDir.shadow.camera.left = -shadowDim;
        sunDir.shadow.camera.right = shadowDim;
        sunDir.shadow.camera.top = shadowDim;
        sunDir.shadow.camera.bottom = -shadowDim;
        sunDir.shadow.bias = -0.0004;
        sunDir.shadow.normalBias = 0.04;
        scene.add(sunDir);
        scene.add(sunDir.target);

        var sunSprite = C.makeGlowSprite(0xfff2cc, platform ? 18 : (planet.key === 'mercury' ? 32 : 18), platform ? 0.45 : 0.65);
        sunSprite.position.set(-90, 75, -130);
        if (planet.key === 'venus') sunSprite.visible = false; // Completely obscured by 90 atm sulfuric overcast
        scene.add(sunSprite);

        // Deep Space Stars for worlds with thin/no air
        if (planet.airless || planet.pressureAtm < 0.02) {
          var stars = C.makeStars(C.isMobile() ? 500 : 950, 280);
          stars.material.size = 0.55;
          stars.material.opacity = 0.95;
          scene.add(stars);
        }

        // Celestial Sky Objects (Europa's Jupiter, Enceladus' Saturn, Saturn's Rings)
        buildSkyCelestialBodies();

        interactiveRocks = [];
        interactiveEquip = [];

        if (platform) {
          buildAerostatPlatform();
        } else {
          buildTerrain();
        }

        targetGroup = new THREE.Group();
        scene.add(targetGroup);
        buildTargets();

        // Build authentic Scientific Equipment & Lander
        buildScientificEquipment();

        // Spawn position (V10 Deterministic Physics)
        var sy = heightAt(spawn.x, spawn.z);
        playerPos.set(spawn.x, sy, spawn.z);
        camera.position.set(spawn.x, sy + eye, spawn.z);
        lastRecordedCamY = camera.position.y;
        yaw = 0; pitch = 0;
        velocityY = 0;
        grounded = true;
        physicsAccumulator = 0.0;
        applyRotation();

        // Save visit to journal v3
        saveJournalVisit();

        // Initialize V7 Survival & Holographic Construction Engine
        if (SU.survival && SU.survival.initEngine) {
          survivalEngine = SU.survival.initEngine({
            scene: scene,
            camera: camera,
            chunkManager: chunkManager,
            planet: planet,
            onToast: onToast
          });
        }

        resize();
        onEnter(planet);
      }

      /* ---------------------------------------------------- Celestial Bodies */
      function buildSkyCelestialBodies() {
        if (planet.key === 'europa') {
          // Breathtaking detailed Jupiter in Europa's sky
          var jupCanvas = document.createElement('canvas');
          jupCanvas.width = 256; jupCanvas.height = 128;
          var jctx = jupCanvas.getContext('2d');
          var jBands = ['#8c6239', '#e3d5b8', '#b58552', '#f3e6cf', '#9c6f44', '#cfb997', '#b07d62', '#e8dcb9'];
          for (var j = 0; j < jBands.length; j++) {
            jctx.fillStyle = jBands[j];
            jctx.fillRect(0, j * (128 / jBands.length), 256, (128 / jBands.length) + 1);
          }
          // Great Red Spot
          jctx.fillStyle = '#b91c1c';
          jctx.beginPath();
          jctx.ellipse(165, 78, 22, 13, 0, 0, Math.PI * 2);
          jctx.fill();
          jctx.fillStyle = '#fca5a5';
          jctx.beginPath();
          jctx.ellipse(165, 78, 12, 6, 0, 0, Math.PI * 2);
          jctx.fill();

          var jupTex = new THREE.CanvasTexture(jupCanvas);
          var jupMesh = new THREE.Mesh(new THREE.SphereGeometry(28, 32, 32), new THREE.MeshBasicMaterial({ map: jupTex }));
          jupMesh.position.set(80, 55, -170);
          scene.add(jupMesh);
        } else if (planet.key === 'enceladus') {
          // Saturn with tilted 3D rings in Enceladus' sky
          var satMesh = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), new THREE.MeshBasicMaterial({ color: 0xe8dcb8 }));
          satMesh.position.set(75, 58, -160);
          
          var ringTex = createSaturnRingTexture();
          var satRing = new THREE.Mesh(
            new THREE.RingGeometry(24, 44, 48),
            new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
          );
          satRing.rotation.x = Math.PI / 2.6;
          satRing.rotation.y = 0.25;
          satMesh.add(satRing);
          scene.add(satMesh);
        }
      }

      function createSaturnRingTexture() {
        var cv = document.createElement('canvas');
        cv.width = 512; cv.height = 32;
        var ctx = cv.getContext('2d');
        var g = ctx.createLinearGradient(0, 0, 512, 0);
        g.addColorStop(0.00, 'rgba(0,0,0,0)');
        g.addColorStop(0.12, 'rgba(180, 160, 130, 0.4)'); // C Ring
        g.addColorStop(0.24, 'rgba(235, 220, 190, 0.95)'); // B Ring (dense, bright)
        g.addColorStop(0.55, 'rgba(220, 205, 175, 0.95)');
        g.addColorStop(0.56, 'rgba(0, 0, 0, 0.08)'); // Cassini Division gap!
        g.addColorStop(0.62, 'rgba(0, 0, 0, 0.08)');
        g.addColorStop(0.63, 'rgba(215, 195, 165, 0.88)'); // A Ring
        g.addColorStop(0.92, 'rgba(195, 180, 155, 0.7)');
        g.addColorStop(0.94, 'rgba(0,0,0,0)');
        g.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 32);
        return new THREE.CanvasTexture(cv);
      }

      /* ---------------------------------------------------- Terrain Builder */
      function buildTerrain() {
        var rnd = C.seededRandom(planet.seed * 97 + 5);
        if (SU.terrainChunk && SU.terrainChunk.createManager) {
          chunkManager = SU.terrainChunk.createManager({
            scene: scene,
            planet: planet,
            camera: camera,
            onToast: onToast
          });
          heightAt = chunkManager.getHeightAt;
        } else {
          var seg = C.isMobile() ? 56 : 96;
          var t = C.buildTerrainMesh(planet, 140, seg);
          heightAt = t.heightAt;
          scene.add(t.mesh);
          var geoList = GEOLOGY_CATALOG[planet.key] || GEOLOGY_CATALOG.default;
          var geo = new THREE.IcosahedronGeometry(1, 1);
          var mat = new THREE.MeshStandardMaterial({ color: planet.rock, roughness: 0.92, metalness: 0.05, flatShading: true });
          var count = C.isMobile() ? 24 : 42;

          for (var i = 0; i < count; i++) {
            var ang = rnd() * Math.PI * 2;
            var rad = 5 + rnd() * 48;
            var x = Math.cos(ang) * rad;
            var z = Math.sin(ang) * rad;
            var s = 0.4 + rnd() * 1.1;

            var rock = new THREE.Mesh(geo, mat.clone());
            rock.position.set(x, heightAt(x, z) + s * 0.05, z);
            rock.scale.set(s, s * (0.6 + rnd() * 0.4), s * (0.8 + rnd() * 0.5));
            rock.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);

            var meta = geoList[i % geoList.length];
            rock.userData = {
              id: 'rock_' + planet.key + '_' + i,
              name: meta.name,
              classification: meta.cls,
              composition: meta.comp,
              confidence: meta.conf,
              desc: meta.desc,
              massGrams: Math.round(250 + rnd() * 700),
              isSample: true,
              collected: false
            };

            scene.add(rock);
            interactiveRocks.push(rock);
          }
        }

        // 1. Mars Atmospheric Dust particles
        if (planet.key === 'mars') {
          var dustCount = C.isMobile() ? 120 : 250;
          var dustPos = new Float32Array(dustCount * 3);
          for (var di = 0; di < dustCount; di++) {
            dustPos[di * 3] = (rnd() - 0.5) * 90;
            dustPos[di * 3 + 1] = 0.5 + rnd() * 16;
            dustPos[di * 3 + 2] = (rnd() - 0.5) * 90;
          }
          var dustGeo = new THREE.BufferGeometry();
          dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
          var dustMat = new THREE.PointsMaterial({ color: 0xf97316, size: 0.32, map: createCircularParticleTexture(), transparent: true, opacity: 0.60, depthWrite: false });
          var dustPoints = new THREE.Points(dustGeo, dustMat);
          scene.add(dustPoints);
          scene.userData.dustParticles = dustPoints;
        }

        // 1b. Venus Dense Atmospheric Sulfuric Haze particles
        if (planet.key === 'venus') {
          var hazeCount = C.isMobile() ? 200 : 420;
          var hazePos = new Float32Array(hazeCount * 3);
          for (var hi = 0; hi < hazeCount; hi++) {
            var a = rnd() * Math.PI * 2;
            var dist = 5.0 + rnd() * 70.0;
            hazePos[hi * 3] = Math.cos(a) * dist;
            hazePos[hi * 3 + 1] = 0.4 + rnd() * 4.5; // Hovering near ground like heavy volcanic haze
            hazePos[hi * 3 + 2] = Math.sin(a) * dist;
          }
          var hazeGeo = new THREE.BufferGeometry();
          hazeGeo.setAttribute('position', new THREE.BufferAttribute(hazePos, 3));
          var hazeMat = new THREE.PointsMaterial({
            color: 0xeab308,
            size: 0.85,
            map: createCircularParticleTexture(),
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });
          var hazePoints = new THREE.Points(hazeGeo, hazeMat);
          scene.add(hazePoints);
          scene.userData.dustParticles = hazePoints;
        }

        // 2. Active 3D Cryogeysers (Enceladus Tiger Stripes)
        if (planet.key === 'enceladus') {
          var plumeCount = C.isMobile() ? 220 : 420;
          var plumePos = new Float32Array(plumeCount * 3);
          for (var pi = 0; pi < plumeCount; pi++) {
            var a = rnd() * Math.PI * 2;
            var r = rnd() * 7.0;
            plumePos[pi * 3] = -14 + Math.cos(a) * r;
            plumePos[pi * 3 + 1] = 0.5 + rnd() * 45;
            plumePos[pi * 3 + 2] = -18 + Math.sin(a) * r;
          }
          var plumeGeo = new THREE.BufferGeometry();
          plumeGeo.setAttribute('position', new THREE.BufferAttribute(plumePos, 3));
          var plumeMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.35, transparent: true, opacity: 0.85, depthWrite: false });
          var geyserPoints = new THREE.Points(plumeGeo, plumeMat);
          scene.add(geyserPoints);
          scene.userData.cryogeysers = geyserPoints;
        }

        // 3. Liquid Hydrocarbon Shoreline (Titan Kraken Mare)
        if (planet.key === 'titan') {
          var lakeGeo = new THREE.PlaneGeometry(160, 160, 1, 1);
          var lakeMat = new THREE.MeshStandardMaterial({
            color: 0x1e1b18,
            metalness: 0.95,
            roughness: 0.08,
            transparent: true,
            opacity: 0.92
          });
          var lake = new THREE.Mesh(lakeGeo, lakeMat);
          lake.rotation.x = -Math.PI / 2;
          lake.position.set(-25, 0.05, 0);
          scene.add(lake);

          var buoy = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
          buoy.position.set(-16, 0.3, 0);
          var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
          mast.position.y = 0.6;
          buoy.add(mast);
          buoy.userData = {
            id: 'titan_lake_buoy',
            name: 'Kraken Mare Шингэн метаны хөвөгч мэдрэгч (Buoy)',
            classification: 'Шингэн нүүрсустөрөгчийн тэнгис',
            composition: 'CH₄ 75%, C₂H₆ 20%, C₃H₈ 3%, N₂ 2%',
            confidence: '[MEASURED CASSINI RADAR]',
            desc: '-179°C хүйтэн шингэн метан-этаны тэнгисээс авсан дээж.',
            massGrams: 450,
            isSample: true,
            collected: false
          };
          scene.add(buoy);
          interactiveRocks.push(buoy);
        }
      }

      /* --------------------------------------------------- Aerostat Platform */
      function buildAerostatPlatform() {
        heightAt = function () { return 0; };
        var metal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });
        var darkSteel = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.5 });
        var goldThermal = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
        var glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.38, roughness: 0.1 });

        var platGroup = new THREE.Group();

        // 1. Massive Overhead Aerostat Balloon / Lifting Envelope
        var balloonGeo = new THREE.SphereGeometry(1.0, 32, 24);
        var balloonMat = new THREE.MeshStandardMaterial({
          color: planet.key === 'saturn' ? 0xe2d4b7 : (planet.key === 'uranus' ? 0x9fe3e8 : 0x5a7fe0),
          metalness: 0.3,
          roughness: 0.6
        });
        var balloon = new THREE.Mesh(balloonGeo, balloonMat);
        balloon.scale.set(13.5, 7.5, 24.0);
        balloon.position.set(0, 16.5, 0);
        balloon.userData = { isAerostatEnvelope: true };
        platGroup.add(balloon);

        // Balloon solar spine
        var solarSpine = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.2, 22.0), goldThermal);
        solarSpine.position.set(0, 23.8, 0);
        platGroup.add(solarSpine);

        // Structural Carbon Truss Girders from balloon to deck
        var trussGeo = new THREE.CylinderGeometry(0.08, 0.08, 14.5, 6);
        for (var c = 0; c < 8; c++) {
          var ang = (c / 8) * Math.PI * 2;
          var truss = new THREE.Mesh(trussGeo, metal);
          truss.position.set(Math.cos(ang) * 6.5, 8.5, Math.sin(ang) * 6.5);
          truss.rotation.z = Math.cos(ang) * 0.28;
          truss.rotation.x = -Math.sin(ang) * 0.28;
          platGroup.add(truss);
        }

        // 2. High-Tech Octagonal Research Observation Deck
        var deck = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 12.2, 0.8, 8), darkSteel);
        deck.position.y = -0.4;
        platGroup.add(deck);

        // Outer Industrial Warning Perimeter Railing & Windscreens
        var rim = new THREE.Mesh(new THREE.TorusGeometry(11.2, 0.18, 8, 8), metal);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.05;
        platGroup.add(rim);

        var topRail = new THREE.Mesh(new THREE.TorusGeometry(10.8, 0.08, 6, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.8 }));
        topRail.rotation.x = Math.PI / 2;
        topRail.position.y = 1.35;
        platGroup.add(topRail);

        // Windscreens along the perimeter
        for (var ws = 0; ws < 8; ws++) {
          var aWs = (ws / 8) * Math.PI * 2 + Math.PI / 8;
          var pane = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.25, 0.08), glassMat);
          pane.position.set(Math.cos(aWs) * 10.6, 0.65, Math.sin(aWs) * 10.6);
          pane.rotation.y = -aWs + Math.PI / 2;
          platGroup.add(pane);
        }

        // Central Pressurized Observation Hab & Pod
        var habCenter = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.0, 3.2, 8), metal);
        habCenter.position.y = 1.6;
        platGroup.add(habCenter);

        // Hab windows with interior warm science glow
        var winGeo = new THREE.BoxGeometry(1.6, 0.8, 0.1);
        var winMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });
        for (var w = 0; w < 4; w++) {
          var aWin = (w / 4) * Math.PI * 2;
          var winMesh = new THREE.Mesh(winGeo, winMat);
          winMesh.position.set(Math.cos(aWin) * 3.75, 1.8, Math.sin(aWin) * 3.75);
          winMesh.rotation.y = -aWin + Math.PI / 2;
          platGroup.add(winMesh);
        }

        // 3. Interactive Atmospheric Dropsonde Deployment Bay
        var dropsondeGantry = new THREE.Group();
        dropsondeGantry.position.set(6.8, 0.0, 0);

        var gantryArm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.6), metal);
        gantryArm.position.set(0.6, 1.1, 0);
        dropsondeGantry.add(gantryArm);

        var probeCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }));
        probeCyl.position.set(1.4, 0.4, 0);
        dropsondeGantry.add(probeCyl);

        var probeLabel = C.makeLabelSprite('🛰️ ГҮНИЙ ЗОНД (DROPSONDE)', '#f59e0b', 0.32);
        probeLabel.position.set(1.4, 1.8, 0);
        dropsondeGantry.add(probeLabel);

        probeCyl.userData = {
          id: 'dropsonde_' + planet.key,
          name: planet.name + ' Гүний агаар мандлын зонд (Dropsonde)',
          classification: 'Агаар мандлын гүний спектр',
          composition: 'H₂ 96.3%, He 3.25%, CH₄ 0.45%, NH₃ 0.02%',
          confidence: '[CASSINI / JUNO / GALILEO IN-SITU]',
          desc: '1 барын агаарын давхаргаас 100 бар гүн рүү буух парашют бүхий шинжлэх ухааны зонд.',
          massGrams: 750,
          isSample: true,
          collected: false
        };
        interactiveRocks.push(probeCyl);
        platGroup.add(dropsondeGantry);

        // 4. Anemometer & Meteorology Mast
        var mastGroup = new THREE.Group();
        mastGroup.position.set(-6.2, 0, 3.5);
        var mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), metal);
        mastPole.position.y = 2.1;
        mastGroup.add(mastPole);
        
        var anemometer = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8 }));
        anemometer.position.y = 4.3;
        mastGroup.add(anemometer);

        var mastLabel = C.makeLabelSprite('💨 АНЭМОМЕТР (1,450 км/ц)', '#38bdf8', 0.28);
        mastLabel.position.y = 4.8;
        mastGroup.add(mastLabel);
        platGroup.add(mastGroup);

        scene.add(platGroup);

        // 5. Saturn's Majestic 3D Rings in the Sky
        if (planet.key === 'saturn') {
          var satSkyRing = new THREE.Mesh(
            new THREE.RingGeometry(85, 175, 64),
            new THREE.MeshBasicMaterial({ map: createSaturnRingTexture(), side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
          );
          satSkyRing.rotation.x = Math.PI / 2.7;
          satSkyRing.rotation.y = 0.35;
          satSkyRing.position.set(-20, -15, -60);
          scene.add(satSkyRing);
        }

        // 6. Multi-layer Animated Cloud Decks Below Platform
        var cloudTex = makeCloudTexture();
        var cloudTop = new THREE.Mesh(
          new THREE.PlaneGeometry(550, 550, 1, 1),
          new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.85, depthWrite: false })
        );
        cloudTop.rotation.x = -Math.PI / 2;
        cloudTop.position.y = -14;
        scene.add(cloudTop);

        var cloudDeep = new THREE.Mesh(
          new THREE.PlaneGeometry(550, 550, 1, 1),
          new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, opacity: 0.55, depthWrite: false, color: 0xb58552 })
        );
        cloudDeep.rotation.x = -Math.PI / 2;
        cloudDeep.position.y = -28;
        scene.add(cloudDeep);

        scene.userData.clouds = [cloudTop, cloudDeep];
      }

      function makeCloudTexture() {
        var cv = document.createElement('canvas');
        cv.width = 512; cv.height = 512;
        var ctx = cv.getContext('2d');
        var g = ctx.createLinearGradient(0, 0, 0, 512);
        g.addColorStop(0, planet.key === 'saturn' ? '#f5eedb' : (planet.key === 'uranus' ? '#c7f3f5' : '#eed7b0'));
        g.addColorStop(0.5, planet.key === 'saturn' ? '#d4ba8a' : (planet.key === 'uranus' ? '#7fc3c8' : '#c99f66'));
        g.addColorStop(1, planet.key === 'saturn' ? '#997341' : (planet.key === 'uranus' ? '#3e8f96' : '#734c26'));
        ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);

        var rnd = C.seededRandom(planet.seed * 31 + 7);
        for (var i = 0; i < 160; i++) {
          var y = rnd() * 512;
          var h = 3 + rnd() * 20;
          ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(70,40,20,0.14)';
          ctx.beginPath();
          ctx.ellipse(rnd() * 512, y, 90 + rnd() * 220, h, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        var tex = new THREE.CanvasTexture(cv);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        return tex;
      }

      /* ------------------------------------------- Mission Touchdown Lander */
      function buildScientificEquipment() {
        var g = new THREE.Group();
        if (platform) {
          landerPos.set(0, 0, 0);
          landerGroup = g;
          return;
        }

        var titaniumAlloy = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.35, metalness: 0.85 });
        var goldMLIFoil = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.28, metalness: 0.95 });
        var darkComposite = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.6 });
        var heatShieldMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.92, metalness: 0.2 });

        // Compact Touchdown Descent Lander (The mission touchdown pod)
        // Notice: Player does NOT receive a pre-built base! Player builds habitats piece by piece.
        var landerHull = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.7, 8), titaniumAlloy);
        landerHull.position.y = 1.30;
        landerHull.castShadow = true;
        g.add(landerHull);

        var mliSkirt = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.95, 0.80, 8), goldMLIFoil);
        mliSkirt.position.y = 0.62;
        mliSkirt.castShadow = true;
        g.add(mliSkirt);

        var heatShield = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.85, 0.22, 16), heatShieldMat);
        heatShield.position.y = 0.16;
        g.add(heatShield);

        // Quad Hydraulic Shock Struts & Surface Footpads
        for (var l = 0; l < 4; l++) {
          var aLeg = (l / 4) * Math.PI * 2 + Math.PI / 4;
          var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.75, 6), titaniumAlloy);
          leg.position.set(Math.cos(aLeg) * 1.75, 0.75, Math.sin(aLeg) * 1.75);
          leg.rotation.z = Math.cos(aLeg) * 0.40;
          leg.rotation.x = -Math.sin(aLeg) * 0.40;
          leg.castShadow = true;
          g.add(leg);

          var footPad = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.08, 8), goldMLIFoil);
          footPad.position.set(Math.cos(aLeg) * 2.25, 0.04, Math.sin(aLeg) * 2.25);
          g.add(footPad);
        }

        // Twin Retro Thruster Nozzles
        for (var t = 0; t < 2; t++) {
          var tBell = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.45, 10, 1, true), darkComposite);
          tBell.position.set(t === 0 ? -0.7 : 0.7, 0.10, 0);
          tBell.rotation.x = Math.PI;
          g.add(tBell);
        }

        // Ingress Hatch & LED
        var hatch = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.15, 0.14), darkComposite);
        hatch.position.set(0, 1.35, 1.45);
        g.add(hatch);

        var hatchLED = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
        hatchLED.position.set(0.28, 1.80, 1.54);
        g.add(hatchLED);

        // Integrated Exterior ISRU Fabricator Console
        var isruBox = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 0.38), darkComposite);
        isruBox.position.set(1.5, 1.1, 0);
        g.add(isruBox);

        var isruScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.42), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        isruScreen.position.set(1.70, 1.15, 0);
        isruScreen.rotation.y = Math.PI / 2;
        g.add(isruScreen);

        var isruLabel = C.makeLabelSprite('⚙️ ISRU ҮЙЛДВЭРЛЭГЧ [B ТОВЧ]', '#38bdf8', 0.32);
        isruLabel.position.set(1.85, 1.65, 0);
        g.add(isruLabel);

        // Telemetry Dish Mast
        var antMast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8), titaniumAlloy);
        antMast.position.set(-0.75, 2.6, -0.55);
        g.add(antMast);

        var antDish = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), titaniumAlloy);
        antDish.position.set(-0.75, 3.25, -0.55);
        antDish.rotation.x = -Math.PI / 3;
        g.add(antDish);

        var landerLabel = C.makeLabelSprite('🚀 ДЕСАНТ БУУХ СТАНЦ', '#38bdf8', 0.38);
        landerLabel.position.set(0, 3.8, 0);
        g.add(landerLabel);

        var px = -3.2, pz = -4.4;
        var py = heightAt(px, pz);
        g.position.set(px, py, pz);

        landerGroup = g;
        landerPos.set(px, py, pz);
        scene.add(g);
      }

      function buildTargets() {
        targets = [];
        var colors = { geo: 0x38bdf8, atm: 0xa78bfa, mineral: 0xfbbf24 };
        planet.features.forEach(function (f) {
          var x = platform ? C.clamp(f.x, -9.5, 9.5) : C.clamp(f.x, -45, 45);
          var z = platform ? C.clamp(f.z, -9.5, 9.5) : C.clamp(f.z, -45, 45);
          var y = heightAt(x, z);
          var root = new THREE.Group();
          root.position.set(x, y, z);
          var color = colors[f.type] || 0x38bdf8;

          var base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.34, 0.42, 0.28, 10),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4, emissive: color, emissiveIntensity: 0.15 })
          );
          base.position.y = 0.14;
          root.add(base);

          var beaconGeo = new THREE.OctahedronGeometry(0.32, 0);
          var beaconMat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.9,
            metalness: 0.2,
            roughness: 0.1,
            wireframe: false
          });
          var gem = new THREE.Mesh(beaconGeo, beaconMat);
          gem.position.y = 1.25;
          root.add(gem);

          var pulse = C.makeGlowSprite(color, 2.2, 0.85);
          pulse.position.y = 1.25;
          root.add(pulse);

          var labelSprite = C.makeLabelSprite(f.name, '#ffffff', 0.28);
          labelSprite.position.y = 2.15;
          root.add(labelSprite);

          root.userData = { beaconId: f.id };
          targetGroup.add(root);

          targets.push({
            id: f.id,
            name: f.name,
            type: f.type,
            desc: f.desc,
            evidence: f.evidence,
            x: x,
            z: z,
            root: root,
            gem: gem,
            scanned: false
          });
        });
      }

      /* --------------------------------------------------- Raycasting & Scanner */
      function getRaycastTarget(maxDist) {
        if (!scene || !camera) return null;
        raycaster.setFromCamera(rayCenter, camera);
        var searchDist = maxDist || 14;

        // 1. Raycast against physical 3D rocks & equipment
        var allRocks = chunkManager ? interactiveRocks.concat(chunkManager.getInteractiveRocks()) : interactiveRocks;
        var validRocks = allRocks.filter(function (r) { return !r.userData.collected; });
        var rockHits = raycaster.intersectObjects(validRocks, false);
        if (rockHits && rockHits.length > 0) {
          var hit = rockHits[0];
          if (hit.distance <= searchDist) {
            return {
              type: 'rock',
              mesh: hit.object,
              data: hit.object.userData,
              distance: hit.distance,
              point: hit.point
            };
          }
        }

        // 2. Raycast against beacons
        if (targets && targets.length > 0) {
          var roots = targets.map(function (t) { return t.root; }).filter(Boolean);
          var beaconHits = raycaster.intersectObjects(roots, true);
          if (beaconHits && beaconHits.length > 0) {
            var bHit = beaconHits[0];
            if (bHit.distance <= searchDist) {
              var obj = bHit.object;
              while (obj.parent && !obj.userData.beaconId && obj.parent !== scene) {
                obj = obj.parent;
              }
              var bFound = targets.find(function (t) { return t.id === obj.userData.beaconId; });
              if (bFound) {
                return {
                  type: 'beacon',
                  target: bFound,
                  distance: bHit.distance,
                  point: bHit.point
                };
              }
            }
          }
        }

        return null;
      }

      function getNearestTarget(maxDist, requireAim) {
        var rayHit = getRaycastTarget(maxDist);
        if (rayHit && rayHit.type === 'beacon') return rayHit.target;

        if (!targets.length) return null;
        var best = null, bestD = Infinity;
        var cx = camera.position.x, cz = camera.position.z;
        var fwdX = -Math.sin(yaw), fwdZ = -Math.cos(yaw);
        for (var i = 0; i < targets.length; i++) {
          var t = targets[i];
          if (t.scanned) continue;
          var dx = t.x - cx, dz = t.z - cz;
          var d = Math.hypot(dx, dz);
          if (d > maxDist) continue;
          if (requireAim) {
            var dot = (dx / (d || 1)) * fwdX + (dz / (d || 1)) * fwdZ;
            if (dot < 0.15) continue;
          }
          if (d < bestD) { bestD = d; best = t; }
        }
        return best;
      }

      function markScanned(id) {
        var t = null;
        for (var i = 0; i < targets.length; i++) if (targets[i].id === id) t = targets[i];
        if (!t) return false;
        t.scanned = true;
        if (t.root) t.root.visible = false;
        return true;
      }

      /* ------------------------------------------- Terrain Digging & Modification */
      function digAtAim(radius, depth) {
        if (!scene || !camera) return null;
        raycaster.setFromCamera(rayCenter, camera);
        var meshes = [];
        if (chunkManager && chunkManager.getChunkMeshes) {
          meshes = chunkManager.getChunkMeshes();
        } else if (terrainMesh) {
          meshes = [terrainMesh];
        }
        var hits = raycaster.intersectObjects(meshes, false);
        var r = radius || 3.0;
        var d = depth || 1.8;
        if (hits && hits.length > 0) {
          var pt = hits[0].point;
          if (chunkManager && chunkManager.modifyTerrain) {
            var mod = chunkManager.modifyTerrain(pt.x, pt.z, r, d);
            onToast('⛏️ Хөрс ухаж нүх гаргалаа: (' + pt.x.toFixed(1) + ', ' + pt.z.toFixed(1) + ') -' + d.toFixed(1) + 'м', 'good');
            return mod;
          }
        } else {
          // If aiming slightly off, dig 4m in front of camera
          var fwdX = -Math.sin(yaw);
          var fwdZ = -Math.cos(yaw);
          var targetX = camera.position.x + fwdX * 4.0;
          var targetZ = camera.position.z + fwdZ * 4.0;
          if (chunkManager && chunkManager.modifyTerrain) {
            var mod = chunkManager.modifyTerrain(targetX, targetZ, r, d);
            onToast('⛏️ Хөрс ухаж нүх гаргалаа: (' + targetX.toFixed(1) + ', ' + targetZ.toFixed(1) + ') -' + d.toFixed(1) + 'м', 'good');
            return mod;
          }
        }
        return null;
      }

      /* ------------------------------------------- Sample Collection & Analysis */
      function collectSample(rockMesh) {
        var data = rockMesh ? (rockMesh.userData || rockMesh) : null;
        if (!data || data.collected) return false;

        if (playerInventory.length >= 6) {
          onToast('⚠️ Дээжний цүнх дүүрсэн байна (6/6). Лабораторийн станцад шинжилгээнд өгнө үү!', 'warn');
          return false;
        }

        data.collected = true;
        if (rockMesh && rockMesh.visible !== undefined) rockMesh.visible = false;

        var sample = {
          id: data.id || ('rock_' + planet.key + '_' + Date.now()),
          name: data.name,
          planetKey: planet.key,
          planetName: planet.name,
          classification: data.classification,
          composition: data.composition,
          confidence: data.confidence,
          massGrams: data.massGrams || 350,
          collectedAt: new Date().toISOString()
        };
        playerInventory.push(sample);

        onToast('🪨 Дээж цуглуулагдлаа: ' + sample.name + ' (' + sample.massGrams + 'г). Станцад аваачиж шинжилнэ үү!', 'success');
        return sample;
      }

      function analyzeSample() {
        if (playerInventory.length === 0) {
          onToast('⚠️ Шинжлэх дээж олдсонгүй! Эхлээд гадарга дээрээс чулуулгийн дээж цуглуулна уу.', 'warn');
          return null;
        }

        var sample = playerInventory.shift();
        
        // Astrobiology & Biosignature Evaluation
        var isOrganic = sample.composition.indexOf('C') !== -1 || sample.classification.indexOf('Органик') !== -1 || sample.classification.indexOf('Полимер') !== -1;
        var hasWater = sample.composition.indexOf('H₂O') !== -1 || sample.composition.indexOf('OH') !== -1;
        var isHydrated = sample.classification.indexOf('Гидротермал') !== -1 || sample.classification.indexOf('давс') !== -1;

        var biosig = '[NEGATIVE] (Абиотик силикат)';
        if (isOrganic && (hasWater || isHydrated)) {
          biosig = '[ANOMALOUS CANDIDATE] (Пребиотик органик + гидротермал усан орчин!)';
        } else if (isOrganic) {
          biosig = '[PREBIOTIC] (Амин хүчил / толины угтал макромолекул)';
        } else if (hasWater || isHydrated) {
          biosig = '[HABITABLE NICHE] (Эрдэст ус / шүлтлэг далайн тунадас)';
        }

        var report = {
          id: 'REP_' + Date.now(),
          sampleName: sample.name,
          classification: sample.classification,
          composition: sample.composition,
          confidence: sample.confidence,
          planetKey: planet.key,
          planetName: planet.name,
          massGrams: sample.massGrams,
          timestamp: new Date().toISOString(),
          spectrometry: {
            siPeak: '9.8 - 10.4 µm (Силикатын холбоо)',
            feAbsorption: '1.05 µm (Оливин / Пироксены шингээлт)',
            hydratedBand: hasWater 
              ? '3.0 µm (Усны гидроксил бүлэг батлагдсан!)' 
              : 'Усны молекулын шингээлт илрээгүй',
            organicBand: isOrganic ? '3.4 µm (C-H алифатик/ароматик суналтын пик)' : 'Органик C-H илрээгүй',
            biosignatureStatus: biosig
          }
        };

        saveReportToJournal(report);

        // Recharge life support
        survival.oxygen = 100;
        survival.power = 100;

        onToast('✅ Шинжилгээ амжилттай! ' + sample.name + ' (' + biosig + ') тэмдэглэлд хадгалагдлаа.', 'success');
        return report;
      }

      /* ------------------------------------------------ Modular Research Station */
      function deployStructure(type, customPos) {
        if (!scene || !planet) return null;
        var pX = customPos ? customPos.x : (camera.position.x - Math.sin(yaw) * 3.5);
        var pZ = customPos ? customPos.z : (camera.position.z - Math.cos(yaw) * 3.5);
        var pY = heightAt(pX, pZ);

        var group = new THREE.Group();
        group.position.set(pX, pY, pZ);

        if (type === 'solar') {
          var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }));
          pole.position.y = 1.1;
          var panelMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 1.4), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 }));
          panelMesh.position.set(0, 2.2, 0);
          panelMesh.rotation.x = 0.35;
          group.add(pole);
          group.add(panelMesh);
        } else if (type === 'sensor') {
          var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
          mast.position.y = 1.6;
          var dish = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), new THREE.MeshStandardMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }));
          dish.position.set(0, 3.2, 0);
          dish.rotation.x = -Math.PI / 4;
          group.add(mast);
          group.add(dish);
        } else if (type === 'bioreactor') {
          var tank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.4 }));
          tank.position.y = 0.9;
          var glass = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x34d399, transparent: true, opacity: 0.7, emissive: 0x059669, emissiveIntensity: 0.5 }));
          glass.position.y = 1.0;
          group.add(tank);
          group.add(glass);
        } else {
          // Default: Inflatable Habitat Dome
          var dome = new THREE.Mesh(
            new THREE.SphereGeometry(2.4, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
            new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.2 })
          );
          var airlock = new THREE.Mesh(
            new THREE.BoxGeometry(1.0, 1.4, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
          );
          airlock.position.set(0, 0.7, 2.0);
          group.add(dome);
          group.add(airlock);
        }

        var entry = {
          id: 'STRUCT_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          type: type || 'hab',
          name: type === 'solar' ? 'Photovoltaic Array' : (type === 'sensor' ? 'Sensor Mast' : (type === 'bioreactor' ? 'Astrobiology Bioreactor' : 'Research Habitat Dome')),
          x: pX, y: pY, z: pZ,
          planetKey: planet.key,
          deployedAt: new Date().toISOString()
        };

        group.userData = entry;
        scene.add(group);
        deployedStructures.push(group);

        saveStructureToJournal(entry);
        onToast('🏗️ Модуль амжилттай суурилагдлаа: ' + entry.name, 'success');
        return entry;
      }

      function saveStructureToJournal(entry) {
        try {
          var raw = localStorage.getItem('su_deepspace_journal_v3');
          var journal = raw ? JSON.parse(raw) : { version: '3.0', visitedPlanets: {}, reports: [], stationUnits: [] };
          if (!journal.stationUnits) journal.stationUnits = [];
          journal.stationUnits.unshift(entry);
          if (journal.stationUnits.length > 40) journal.stationUnits = journal.stationUnits.slice(0, 40);
          localStorage.setItem('su_deepspace_journal_v3', JSON.stringify(journal));
          localStorage.setItem('su_deepspace_journal_v2', JSON.stringify(journal));
        } catch (e) {}
      }

      /* ------------------------------------------------------- Research Journal V3 */
      function saveJournalVisit() {
        if (!planet) return;
        try {
          var raw = localStorage.getItem('su_deepspace_journal_v3') || localStorage.getItem('su_deepspace_journal_v2');
          var journal = raw ? JSON.parse(raw) : { version: '3.0', visitedPlanets: {}, reports: [], stationUnits: [] };
          journal.version = '3.0';
          if (!journal.visitedPlanets) journal.visitedPlanets = {};

          journal.visitedPlanets[planet.key] = {
            name: planet.name,
            en: planet.en,
            gravity: planet.gravity,
            temp: planet.tempMean,
            pressure: planet.pressureAtm,
            datumLevel: planet.datumLevel || 'Surface',
            lastLanded: new Date().toISOString()
          };

          try {
            var r = localStorage.getItem('SU_SAVED_ROCKET');
            if (r) journal.savedSpacecraft = JSON.parse(r);
          } catch (err) {}

          localStorage.setItem('su_deepspace_journal_v3', JSON.stringify(journal));
          localStorage.setItem('su_deepspace_journal_v2', JSON.stringify(journal));
        } catch (e) {
          console.warn('Journal storage error:', e);
        }
      }

      function saveReportToJournal(rep) {
        try {
          var raw = localStorage.getItem('su_deepspace_journal_v3') || localStorage.getItem('su_deepspace_journal_v2');
          var journal = raw ? JSON.parse(raw) : { version: '3.0', visitedPlanets: {}, reports: [], stationUnits: [] };
          journal.version = '3.0';
          if (!journal.visitedPlanets) journal.visitedPlanets = {};
          if (planet && planet.key) {
            journal.visitedPlanets[planet.key] = {
              name: planet.name,
              en: planet.en,
              gravity: planet.gravity,
              temp: planet.tempMean,
              pressure: planet.pressureAtm,
              lastLanded: new Date().toISOString()
            };
          }
          try {
            var r = localStorage.getItem('SU_SAVED_ROCKET');
            if (r) journal.savedSpacecraft = JSON.parse(r);
          } catch (err) {}

          if (!journal.reports) journal.reports = [];
          journal.reports.unshift(rep);
          if (journal.reports.length > 50) journal.reports = journal.reports.slice(0, 50);

          localStorage.setItem('su_deepspace_journal_v3', JSON.stringify(journal));
          localStorage.setItem('su_deepspace_journal_v2', JSON.stringify(journal));
        } catch (e) {
          console.warn('Failed to save report to journal:', e);
        }
      }

      function getJournal() {
        try {
          var raw = localStorage.getItem('su_deepspace_journal_v3') || localStorage.getItem('su_deepspace_journal_v2');
          return raw ? JSON.parse(raw) : { version: '3.0', visitedPlanets: {}, reports: [] };
        } catch (e) {
          return { version: '3.0', visitedPlanets: {}, reports: [] };
        }
      }

      /* ------------------------------------------------ Dropsonde Launch (V4) */
      function launchDropsonde() {
        if (!scene || !planet) return null;
        var dropData = {
          planetKey: planet.key,
          planetName: planet.name,
          launchedAt: new Date().toISOString(),
          layers: [
            { depthKm: 0, pressureBar: 1.0, tempC: planet.tempMean || -139, gas: 'NH3 Ice Cloud Haze', desc: '1.0 Bar Cloud Deck Datum. Оптик тунгалаг байдал 32%.' },
            { depthKm: 45, pressureBar: 4.8, tempC: (planet.tempMean || -139) + 75, gas: 'NH4SH (Аммоний гидросульфид)', desc: 'Өтгөн аммоний үүл, цахилгаан цэнэгжилт илрэв.' },
            { depthKm: 130, pressureBar: 19.5, tempC: (planet.tempMean || -139) + 160, gas: 'H2O Усан үүл / Шингэн дусал', desc: 'Усан дуслуудтай өтгөн давхарга, салхи 1,200 км/ц.' },
            { depthKm: 280, pressureBar: 78.0, tempC: 175, gas: 'Суперкритик H2/He шингэн', desc: 'Хэт өндөр даралт! Зондын дохио 82 бар даралтад тасарлаа.' }
          ]
        };

        // Create 3D falling probe visual
        var dropProbe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.4, 0.9, 8),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 })
        );
        dropProbe.position.set(7.5, 0.0, 0);
        scene.add(dropProbe);

        var dropInterval = setInterval(function() {
          if (!dropProbe.parent) { clearInterval(dropInterval); return; }
          dropProbe.position.y -= 0.8;
          dropProbe.rotation.x += 0.05;
          if (dropProbe.position.y < -60) {
            clearInterval(dropInterval);
            scene.remove(dropProbe);
          }
        }, 50);

        saveReportToJournal({
          sampleName: planet.name + ' Агаар Мандлын Гүн Зонд (Dropsonde)',
          planetKey: planet.key,
          planetName: planet.name,
          classification: 'Агаар мандлын гүний зонд',
          massGrams: 850,
          composition: 'H2 96.3%, He 3.25%, CH4 0.45%, NH3 0.02%',
          confidence: '[CASSINI / GALILEO ATMOSPHERIC DESCENT]',
          spectrometry: {
            siPeak: 'NH4SH 4.8 bar',
            hydratedBand: 'H2O 19.5 bar',
            biosignatureStatus: 'Abiotic Supercritical Fluid'
          },
          timestamp: new Date().toISOString()
        });

        return dropData;
      }

      /* ------------------------------------------------ Subsurface GPR Radar (V4) */
      function scanRadar() {
        if (!planet) return null;
        var rData = {
          planetKey: planet.key,
          planetName: planet.name,
          timestamp: new Date().toISOString()
        };

        if (planet.key === 'mars') {
          rData.soundings = [
            { depthM: '0 - 0.4m', layer: 'Хуурай базальт тоос ба төмрийн оксид', dielectric: 3.2 },
            { depthM: '0.4 - 1.8m', layer: 'Цементлэгдсэн реголит ба CO2 хуримтлал', dielectric: 4.8 },
            { depthM: '1.8 - 4.5m', layer: 'Цэвдэг Усан Мөсний Линз (H2O Ice Lens)', dielectric: 3.15, note: '85% цэвэр усны мөс илрэв!' },
            { depthM: '4.5 - 250m', layer: 'Гүн базальт ан цавт чулуулаг', dielectric: 6.5 }
          ];
          rData.summary = 'GPR радар 1.8 метрийн гүнд Усан Мөсний цэвдэг линзийг тодорхойллоо!';
        } else if (planet.key === 'europa') {
          rData.soundings = [
            { depthM: '0 - 3.2 км', layer: 'Хагарсан хэврэг мөсөн царцдас (Brittle Ice Crust)', dielectric: 3.1 },
            { depthM: '3.2 - 19.5 км', layer: 'Конвектив уян хатан дулаан мөс (Ductile Ice)', dielectric: 3.8 },
            { depthM: '19.5 км+', layer: 'Шингэн Давст Далай (Liquid Saline Ocean Interface)', dielectric: 80.0, note: 'Өндөр дамжуулалттай шингэн давст далайн зааг!' }
          ];
          rData.summary = 'GPR гүний зонд 19.5 км зузаан мөсөн доор шингэн давст далайг бүртгэлээ!';
        } else if (planet.key === 'enceladus') {
          rData.soundings = [
            { depthM: '0 - 1.5 км', layer: 'Барзгар сийрэг цас, мөсөн бүрхүүл', dielectric: 2.8 },
            { depthM: '1.5 - 5.0 км', layer: 'Tiger Stripes тектоник хагарлын суваг', dielectric: 4.2 },
            { depthM: '5.0 км+', layer: 'Шингэн Усны Гидротермал Резервуар', dielectric: 78.0, note: 'Гейзерийн тэжээгч даралтат гидротермал эх үүсвэр!' }
          ];
          rData.summary = 'GPR радар криогейзерийг тэжээгч 5.0 км гүн дэх усан санг тогтоолоо!';
        } else if (planet.key === 'titan') {
          rData.soundings = [
            { depthM: '0 - 2.5m', layer: 'Толин органик элс, тоосорхог хуримтлал', dielectric: 2.2 },
            { depthM: '2.5 - 65m', layer: 'Шингэн метан/этан нэвчсэн сүвэрхэг царцдас', dielectric: 1.8 },
            { depthM: '65 - 120 км', layer: 'Төмөр чулуун цөм рүү шилжих мөсөн чулуулаг', dielectric: 4.5 }
          ];
          rData.summary = 'GPR радар метан нэвчсэн сүвэрхэг хөрсийг 65м хүртэл тодорхойлов.';
        } else {
          rData.soundings = [
            { depthM: '0 - 1.2m', layer: 'Сийрэг реголит тоос', dielectric: 2.9 },
            { depthM: '1.2 - 35m', layer: 'Ан цавт брекчи чулуулаг', dielectric: 5.8 },
            { depthM: '35 - 150m', layer: 'Цул магмын базальт суурь чулуулаг', dielectric: 7.2 }
          ];
          rData.summary = 'GPR радар 35м хүртэл реголит болон брекчи үе давхаргыг зураглалаа.';
        }

        saveReportToJournal({
          sampleName: planet.name + ' GPR Хөрсний Радарын Зондчлол',
          planetKey: planet.key,
          planetName: planet.name,
          classification: 'Гүний радарын зондчлол',
          massGrams: 0,
          composition: rData.summary,
          confidence: '[SHARAD / MARSIS / RIME RADAR MODEL]',
          spectrometry: {
            siPeak: 'Dielectric e=' + (rData.soundings[1] ? rData.soundings[1].dielectric : '4.5'),
            hydratedBand: rData.soundings[2] ? rData.soundings[2].layer : 'Deep Rock',
            biosignatureStatus: (planet.key === 'europa' || planet.key === 'enceladus') ? 'Subsurface Ocean Detected' : 'Abiotic Geological Layer'
          },
          timestamp: new Date().toISOString()
        });

        return rData;
      }

      function setResearchMode(on) {
        researchMode = !!on;
        if (targetGroup) targetGroup.visible = researchMode;
      }

      function getReadout() {
        var distToLander = landerPos ? Math.hypot(camera.position.x - landerPos.x, camera.position.z - landerPos.z) : 99;
        return {
          planet: planet,
          platform: platform,
          gravity: planet ? planet.gravity : 9.81,
          temp: planet ? planet.tempMean : 15,
          pressure: planet ? planet.pressureAtm : 1,
          datumLevel: planet ? (planet.datumLevel || 'Surface Ground Datum') : 'Surface',
          atmosphere: planet ? (planet.atmosphere || []).join(', ') : 'None',
          altitude: camera.position.y - (heightAt(camera.position.x, camera.position.z) + eye),
          grounded: grounded,
          x: camera.position.x,
          z: camera.position.z,
          distToLander: distToLander,
          isNearStation: distToLander < 6.0,
          survival: survival,
          inventoryCount: playerInventory.length
        };
      }

      function getCamera() { return camera; }
      function getScene() { return scene; }

      function activate() {
        active = true;
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
      }

      function deactivate() {
        active = false;
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        keys = {};
        joy.x = joy.y = 0;
      }

      function setMove(x, y) { joy.x = C.clamp(x, -1, 1); joy.y = C.clamp(y, -1, 1); }
      
      function resize() {
        if (!renderer || !camera || !canvas) return;
        C.resizeRenderer(renderer, camera, canvas);
      }

      function dispose() {
        deactivate();
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        disposeScene();
      }

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);

      /* --------------------------------------------------------- Controls */
      function onKeyDown(e) {
        var k = e.key.toLowerCase();
        keys[k] = true;
        if (k === ' ' || k === 'spacebar') { e.preventDefault(); jump(); }
        if (k === 'e') {
          // Quick raycast sample pickup
          var hit = getRaycastTarget(6.5);
          if (hit && hit.type === 'rock') collectSample(hit.mesh);
        }
        if (k === 'g') {
          digAtAim(3.0, 1.8);
        }
        if (k === 'd') {
          if (planet && planet.isGasGiant) launchDropsonde();
        }
        if (k === 'r') {
          scanRadar();
        }
      }

      function onKeyUp(e) {
        keys[e.key.toLowerCase()] = false;
      }

      function onPointerDown(e) {
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
        isMouseDown = true;
        if (survivalEngine && e.button === 0) {
          survivalEngine.placeActiveStructure();
        }
      }

      function onPointerMove(e) {
        if (!drag || drag.id !== e.pointerId) return;
        var dx = e.clientX - drag.x;
        var dy = e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        var sens = 0.0028;
        yaw -= dx * sens;
        pitch = C.clamp(pitch - dy * sens, -1.35, 1.35);
        applyRotation();
      }

      function onPointerUp(e) {
        if (drag && drag.id === e.pointerId) drag = null;
        isMouseDown = false;
      }

      function applyRotation() {
        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
        camera.rotation.z = 0;
      }

      function jump() {
        if (!grounded) return;
        grounded = false;
        var g = (planet && planet.gravity) ? planet.gravity : 9.81;
        // Physically calibrated jump height: h = 1.25m
        var jumpHeight = platform ? 0.85 : 1.25;
        velocityY = Math.sqrt(2.0 * g * jumpHeight);
      }

      function update(dt) {
        if (!scene) return;
        time += dt;

        var mx = joy.x, mz = joy.y;
        if (keys['w'] || keys['arrowup']) mz += 1;
        if (keys['s'] || keys['arrowdown']) mz -= 1;
        if (keys['d'] || keys['arrowright']) mx += 1;
        if (keys['a'] || keys['arrowleft']) mx -= 1;
        mx = C.clamp(mx, -1, 1); mz = C.clamp(mz, -1, 1);

        tmpFwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
        tmpRight.set(Math.cos(yaw), 0, -Math.sin(yaw));
        var speed = 4.8;
        var moving = Math.abs(mx) + Math.abs(mz) > 0.01;
        if (moving) {
          var dir = new THREE.Vector3()
            .addScaledVector(tmpFwd, mz)
            .addScaledVector(tmpRight, mx);
          if (dir.lengthSq() > 0) dir.normalize();
          camera.position.x += dir.x * speed * dt;
          camera.position.z += dir.z * speed * dt;
          if (grounded) bobT += dt * 9;
        } else {
          bobT += dt * 2;
        }

        // Platform / Perimeter Bounds
        var radius = Math.hypot(camera.position.x, camera.position.z);
        if (platform && radius > bounds) {
          var s = bounds / radius;
          camera.position.x *= s;
          camera.position.z *= s;
        } else if (!platform && !chunkManager) {
          camera.position.x = C.clamp(camera.position.x, -bounds, bounds);
          camera.position.z = C.clamp(camera.position.z, -bounds, bounds);
        }

        // Continuous Open-World Chunk Streaming (V6)
        if (chunkManager) {
          chunkManager.updateStreaming(camera.position.x, camera.position.z);
        }

        // V7 Survival Gameplay Engine (Mining laser, vacuum nuggets, holographic building)
        if (survivalEngine) {
          survivalEngine.update(camera.position, isMouseDown, dt);
        }

        // Dynamic Directional Shadow Tracking
        if (sunDir && !platform && sunDir.target) {
          sunDir.position.set(camera.position.x + 75, 55, camera.position.z + 60);
          sunDir.target.position.set(camera.position.x, 0, camera.position.z);
          sunDir.target.updateMatrixWorld();
        }

        // -------------------------------------------------------------
        // V10 DETERMINISTIC FIXED-TIMESTEP PHYSICS (60 Hz ACCUMULATOR)
        // -------------------------------------------------------------
        // Check for external camera repositioning (e.g. tests or teleports)
        if (Math.abs(camera.position.y - lastRecordedCamY) > 0.35 ||
            Math.hypot(camera.position.x - playerPos.x, camera.position.z - playerPos.z) > 1.2) {
          playerPos.set(camera.position.x, camera.position.y - eye, camera.position.z);
          var hNow = heightAt(playerPos.x, playerPos.z);
          if (playerPos.y > hNow + 0.12) {
            grounded = false;
          }
        }

        var FIXED_DT = 1.0 / 60.0;
        var gVal = (planet && planet.gravity) ? planet.gravity : 9.81;
        physicsAccumulator += Math.min(0.1, dt);

        var moveVec = new THREE.Vector3();
        if (moving) {
          moveVec.addScaledVector(tmpFwd, mz).addScaledVector(tmpRight, mx);
          if (moveVec.lengthSq() > 0) moveVec.normalize();
        }

        var substeps = 0;
        while (physicsAccumulator >= FIXED_DT && substeps < 5) {
          physicsAccumulator -= FIXED_DT;
          substeps++;

          var currentGroundH = heightAt(playerPos.x, playerPos.z);
          var norm = (chunkManager && chunkManager.getNormalAt) ?
            chunkManager.getNormalAt(playerPos.x, playerPos.z) : { nx: 0, ny: 1, nz: 0, slope: 0 };

          // Check if player is airborne (e.g. walked off cliff or jumped)
          var distAbove = playerPos.y - currentGroundH;
          if (distAbove > 0.08 || velocityY > 0.02) {
            grounded = false;
          }

          if (!grounded) {
            // Apply true planetary gravitational acceleration
            velocityY -= gVal * FIXED_DT;
            if (velocityY < -45.0) velocityY = -45.0; // Terminal velocity
            playerPos.y += velocityY * FIXED_DT;

            // Ground impact collision
            if (playerPos.y <= currentGroundH) {
              playerPos.y = currentGroundH;
              velocityY = 0;
              grounded = true;
            }
          } else {
            // Player is grounded
            if (norm.slope > 0.72) {
              // Steep slope slide (cannot stand on slope > 45 degrees)
              playerPos.x += norm.nx * gVal * 0.40 * FIXED_DT;
              playerPos.z += norm.nz * gVal * 0.40 * FIXED_DT;
              playerPos.y = heightAt(playerPos.x, playerPos.z);
            } else {
              playerPos.y = currentGroundH;
              velocityY = 0;
            }
          }

          // Horizontal movement with step handling and slope limits
          if (moving && moveVec.lengthSq() > 0.001) {
            var stepDist = speed * FIXED_DT;
            var nextX = playerPos.x + moveVec.x * stepDist;
            var nextZ = playerPos.z + moveVec.z * stepDist;
            var nextGroundH = heightAt(nextX, nextZ);
            var stepDelta = nextGroundH - playerPos.y;
            var nextNorm = (chunkManager && chunkManager.getNormalAt) ?
              chunkManager.getNormalAt(nextX, nextZ) : { slope: 0 };

            // Step-up limit is 0.45m; max climbable slope is 44 degrees (slope < 0.72)
            if (stepDelta <= 0.45 && nextNorm.slope < 0.72) {
              playerPos.x = nextX;
              playerPos.z = nextZ;
              if (grounded) {
                playerPos.y = nextGroundH;
              }
            } else if (stepDelta <= 0.45) {
              // Slope wall slide along tangent
              var tX = -moveVec.z * 0.5 * stepDist;
              var tZ = moveVec.x * 0.5 * stepDist;
              if (heightAt(playerPos.x + tX, playerPos.z + tZ) - playerPos.y <= 0.45) {
                playerPos.x += tX;
                playerPos.z += tZ;
              }
            }
          }

          // Physical Lander Collision Barrier (Radius 2.4m around Touchdown Lander)
          var ldx = playerPos.x - (-3.2);
          var ldz = playerPos.z - (-4.4);
          var lDist = Math.hypot(ldx, ldz);
          if (lDist < 2.45) {
            if (lDist < 0.01) {
              playerPos.x = -3.2 + 2.45;
            } else {
              var push = 2.45 / lDist;
              playerPos.x = -3.2 + ldx * push;
              playerPos.z = -4.4 + ldz * push;
            }
          }
        }

        // Synchronize camera to physical player capsule
        var bobOffset = (grounded && moving) ? Math.sin(bobT) * 0.035 : 0;
        camera.position.x = playerPos.x;
        camera.position.y = playerPos.y + eye + bobOffset;
        camera.position.z = playerPos.z;
        lastRecordedCamY = camera.position.y;

        // Life Support / Environmental Thermal Load
        var distToLander = landerPos ? Math.hypot(camera.position.x - landerPos.x, camera.position.z - landerPos.z) : 99;
        if (distToLander < 6.0) {
          survival.oxygen = Math.min(100, survival.oxygen + 45 * dt);
          survival.power = Math.min(100, survival.power + 40 * dt);
        } else {
          var exertion = moving ? 1.3 : 1.0;
          survival.oxygen = Math.max(0, survival.oxygen - 0.08 * exertion * dt);
          var tempDiff = Math.abs((planet.tempMean || 0) - 21);
          var thermalLoad = Math.min(2.5, 1.0 + tempDiff * 0.012);
          survival.power = Math.max(0, survival.power - 0.05 * thermalLoad * dt);
        }

        // Beacon animations
        if (targets.length) {
          for (var i = 0; i < targets.length; i++) {
            var t = targets[i];
            if (t.scanned || !t.gem) continue;
            t.gem.rotation.y += dt * 1.4;
            t.gem.position.y = 1.25 + Math.sin(time * 2.2 + i) * 0.1;
          }
        }

        // Clouds drift
        if (scene.userData.clouds) {
          scene.userData.clouds.forEach(function (cl, idx) {
            if (cl.material.map) cl.material.map.offset.x += dt * (idx === 0 ? 0.008 : 0.004);
          });
        }

        // Dust particle animation (Mars)
        if (scene.userData.dustParticles) {
          var dpos = scene.userData.dustParticles.geometry.attributes.position;
          for (var di = 0; di < dpos.count; di++) {
            var dx = dpos.getX(di) + dt * 2.8;
            if (dx > 45) dx = -45;
            dpos.setX(di, dx);
          }
          dpos.needsUpdate = true;
        }

        // Cryogeyser upward jet stream animation (Enceladus)
        if (scene.userData.cryogeysers) {
          var gpos = scene.userData.cryogeysers.geometry.attributes.position;
          for (var gi = 0; gi < gpos.count; gi++) {
            var gy = gpos.getY(gi) + dt * 22.0;
            if (gy > 50) gy = 0.5 + Math.random() * 2;
            gpos.setY(gi, gy);
          }
          gpos.needsUpdate = true;
        }
      }

      function disposeScene() {
        if (survivalEngine) {
          survivalEngine.dispose();
          survivalEngine = null;
        }
        if (chunkManager) {
          chunkManager.dispose();
          chunkManager = null;
        }
        sunDir = null;
        if (!scene) return;
        while (scene.children.length > 0) {
          var obj = scene.children[0];
          scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(function (m) { m.dispose(); });
            else obj.material.dispose();
          }
        }
        interactiveRocks = [];
        interactiveEquip = [];
        deployedStructures = [];
      }

      function getPhysicsTelemetry() {
        var gH = heightAt(playerPos.x, playerPos.z);
        var norm = (chunkManager && chunkManager.getNormalAt) ? chunkManager.getNormalAt(playerPos.x, playerPos.z) : { slope: 0 };
        return {
          planet: planet ? planet.key : 'unknown',
          gravity: (planet && planet.gravity) ? planet.gravity : 9.81,
          playerPos: { x: Math.round(playerPos.x * 100) / 100, y: Math.round(playerPos.y * 100) / 100, z: Math.round(playerPos.z * 100) / 100 },
          cameraPos: { x: Math.round(camera.position.x * 100) / 100, y: Math.round(camera.position.y * 100) / 100, z: Math.round(camera.position.z * 100) / 100 },
          groundHeight: Math.round(gH * 100) / 100,
          velocityY: Math.round(velocityY * 100) / 100,
          grounded: grounded,
          slopeAngleDeg: Math.round(Math.asin(Math.min(1.0, norm.slope || 0)) * (180 / Math.PI)),
          chunkCount: chunkManager ? chunkManager.getChunkCount() : 0,
          physicsStepMs: 16.67
        };
      }

      function setPhysicsDebug(enable) {
        physicsDebugEnabled = !!enable;
      }

      function teleport(x, y, z) {
        playerPos.set(x, y, z);
        camera.position.set(x, y + eye, z);
        lastRecordedCamY = camera.position.y;
        var gH = heightAt(x, z);
        if (y > gH + 0.1) {
          grounded = false;
        } else {
          grounded = true;
          playerPos.y = gH;
          camera.position.y = gH + eye;
        }
        velocityY = 0;
      }
      return {
        getPhysicsTelemetry: getPhysicsTelemetry,
        setPhysicsDebug: setPhysicsDebug,
        getPlayerPos: function() { return playerPos; },
        teleport: teleport,
        build: build,
        activate: activate,
        deactivate: deactivate,
        update: update,
        resize: resize,
        dispose: dispose,
        jump: jump,
        setMove: setMove,
        setResearchMode: setResearchMode,
        getNearestTarget: getNearestTarget,
        getRaycastTarget: getRaycastTarget,
        collectSample: collectSample,
        analyzeSample: analyzeSample,
        digTerrain: digAtAim,
        modifyTerrain: function (x, z, r, d) {
          if (chunkManager && chunkManager.modifyTerrain) return chunkManager.modifyTerrain(x, z, r, d);
          return null;
        },
        launchDropsonde: launchDropsonde,
        scanRadar: scanRadar,
        deployStructure: deployStructure,
        getDeployedStructures: function () { return deployedStructures.map(function(s) { return s.userData; }); },
        getInventory: function () { return playerInventory; },
        getSurvival: function () { return survival; },
        getSurvivalEngine: function () { return survivalEngine; },
        getJournal: getJournal,
        getInteractiveRocks: function () {
          if (chunkManager) {
            return interactiveRocks.concat(chunkManager.getInteractiveRocks());
          }
          return interactiveRocks;
        },
        getChunkManager: function () { return chunkManager; },
        markScanned: markScanned,
        getReadout: getReadout,
        getCamera: getCamera,
        getScene: getScene,
        getPlanet: function () { return planet; },
        isPlatform: function () { return platform; },
        getTargets: function () { return targets; },
        isNearStation: function () {
          return landerPos ? Math.hypot(camera.position.x - landerPos.x, camera.position.z - landerPos.z) < 6.0 : false;
        }
      };
    }
  };
})();
