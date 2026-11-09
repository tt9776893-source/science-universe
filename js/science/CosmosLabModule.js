/**
 * SCIENCE UNIVERSE — COSMOS LAB V2
 * Module: CosmosLabModule.js
 * 
 * Advanced Scientific Simulations for Astrophysics & Planetary Defense:
 * 1. Black Hole Simulator (General Relativity & Relativistic Accretion Disk):
 *    - Physically grounded Schwarzschild radius: rs = 2GM / c^2
 *    - Gravitational time dilation: dt_obs = dt_local / sqrt(1 - rs / r)
 *    - Photon sphere (1.5 rs) & ISCO (3.0 rs)
 *    - Lensing ring approximation & Doppler-beamed accretion disk
 *    - Mass selection (Stellar, Intermediate, Sgr A*, M87*) & distance orbit
 * 2. DART Asteroid Planetary Defense:
 *    - Momentum enhancement factor beta: Δp = beta * m_sc * v_imp * cos(theta)
 *    - Velocity change: Δv = Δp / M_ast
 *    - Trajectory deflection vs Earth impact intersection
 * 3. Cosmic Scale Logarithmic Explorer:
 *    - 10^-18 m (Quarks) to 10^26 m (Observable Universe)
 *    - Real astronomical diameters & comparative visual scale
 * 4. Interstellar Travel & Relativistic Physics:
 *    - Special relativity Lorentz factor: gamma = 1 / sqrt(1 - v^2/c^2)
 *    - Crew proper time vs Earth observer time dilation
 *    - Relativistic kinetic energy: Ek = (gamma - 1) * m * c^2
 *    - Distinguishes TRL 1-3 theoretical physics from established aerospace tech
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CosmosLabModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Physical Constants
  const G = 6.67430e-11;      // Gravitational constant (m^3 kg^-1 s^-2)
  const C = 299792458;         // Speed of light (m/s)
  const M_SUN = 1.98847e30;    // Solar mass (kg)
  const SEC_PER_YEAR = 31557600;

  /**
   * Authoritative Black Hole Presets
   */
  const BLACK_HOLE_PRESETS = {
    stellar: {
      name: 'Stellar Black Hole (Cygnus X-1)',
      massSolar: 21.2,
      desc: 'Үүсэл: Аварга од супернова дэлбэрэлтээр мөхөхөд үүссэн одот хар нүх.',
      type: 'Stellar Mass'
    },
    intermediate: {
      name: 'Intermediate Mass (HLX-1)',
      massSolar: 500,
      desc: 'Үүсэл: Оддын бөөгнөрлийн төвд үүссэн дунд оврын ховор хар нүх.',
      type: 'Intermediate'
    },
    sgra: {
      name: 'Sagittarius A* (Сүүн замын төв)',
      massSolar: 4.297e6,
      desc: 'Үүсэл: Манай галактикийн төв дэх 4.3 сая нарны масстай супер масст хар нүх (EHT зурагласан).',
      type: 'Supermassive'
    },
    m87: {
      name: 'M87* (Messier 87 төв)',
      massSolar: 6.5e9,
      desc: 'Үүсэл: Хүн төрөлхтний анх түүхэндээ зургийг нь авсан 6.5 тэрбум нарны масстай эртний аварга хар нүх.',
      type: 'Supermassive'
    }
  };

  /**
   * Interstellar Destination Catalog
   */
  const INTERSTELLAR_DESTINATIONS = [
    { id: 'proxima', name: 'Proxima Centauri', distLy: 4.246, type: 'Улаан одой (Хамгийн ойрын од)', planets: 'Proxima b, c, d' },
    { id: 'barnard', name: 'Барнардын од (Barnard)', distLy: 5.96, type: 'Улаан одой од', planets: 'Barnard b' },
    { id: 'wolf359', name: 'Wolf 359', distLy: 7.86, type: 'Хүйтэн од', planets: 'Wolf 359 b, c' },
    { id: 'sirius', name: 'Сириус A & B (Sirius)', distLy: 8.611, type: 'Тэнгэрийн хамгийн тод од', planets: 'Хос одын систем' },
    { id: 'tauceti', name: 'Tau Ceti', distLy: 11.9, type: 'Нар төст шар од (G-class)', planets: '4 гарагтай систем' },
    { id: 'trappist1', name: 'TRAPPIST-1', distLy: 39.46, type: 'Хэт хүйтэн одой од', planets: '7 эх газрын гараг (3 нь алтан бүсэд)' },
    { id: 'center', name: 'Сүүн замын төв (Sagittarius A*)', distLy: 26670, type: 'Галактикийн төв', planets: 'Супер хар нүхний хүрээ' }
  ];

  /**
   * Spacecraft Propulsion Options
   */
  const PROPULSION_CATALOG = [
    { id: 'chem', name: 'Химийн пуужин (Apollo / SLS)', speedC: 0.000037, speedKmS: 11.1, trl: 9, note: 'Өнөөгийн практик технологи. Шаталтын дээд хурд ~4.5 км/с.' },
    { id: 'ion', name: 'Ион тийрэлтэт (Dawn / Deep Space 1)', speedC: 0.00018, speedKmS: 54, trl: 9, note: 'Ксенон ионы цахилгаан хурдасгуур. Маш өндөр Isp (~3000s).' },
    { id: 'fusion', name: 'Цөмийн нэгдлийн пуужин (Fusion D-He3)', speedC: 0.08, speedKmS: 24000, trl: 3, note: 'Дейтери-Гели-3 халуун цөмийн реактор. Лабораторийн загвар шатанд.' },
    { id: 'laser_sail', name: 'Лазер далбаат зонд (Breakthrough Starshot)', speedC: 0.20, speedKmS: 60000, trl: 3, note: 'Дэлхийгээс 100 ГВт лазераар түлхэгдэх 1 грамм чип зонд.' },
    { id: 'antimatter', name: 'Антиматерийн фотон хөдөлгүүр (Positron Beam)', speedC: 0.85, speedKmS: 255000, trl: 2, note: 'Матери-антиматерийн аннигиляцийн 100% E=mc^2 үр ашиг. Өндөр релятивист.' },
    { id: 'ramjet', name: 'Релятивист Бассард Рамжет (Interstellar Ramjet)', speedC: 0.98, speedKmS: 294000, trl: 1, note: 'Сансрын устөрөгчийг сорж шатаах онолын хөлөг. Цаг хугацаа 5 дахин удааширна.' }
  ];

  /**
   * Cosmic Logarithmic Scale Milestones
   */
  const SCALE_MILESTONES = [
    { exp: -18, sizeM: 1e-18, name: 'Кварк (Quark)', cat: 'Эгэл бөөмс', desc: 'Протон, нейтроны бүрэлдэхүүн. Орчин үеийн физикт хэмжээсгүй цэгэн масс.' },
    { exp: -15, sizeM: 1e-15, name: 'Протон (Proton)', cat: 'Цөмийн бөөм', desc: 'Устөрөгчийн атомын цөм. Диаметр нь ~1 фемтометр.' },
    { exp: -10, sizeM: 1e-10, name: 'Атом (Atom)', cat: 'Химийн элемент', desc: 'Бодисын химийн шинж чанарыг хадгалах өчүүхэн хэсэг (~0.1 нм).' },
    { exp: -9,  sizeM: 2e-9,  name: 'ДНХ спираль (DNA)', cat: 'Биомолекул', desc: 'Амьд биетийн генетик мэдээллийн хоёрч мушгиа (~2 нм өргөн).' },
    { exp: -7,  sizeM: 1e-7,  name: 'Вирус (SARS-CoV-2)', cat: 'Бичил биет', desc: 'Эсийн дотор шимэгчлэгч генетик бүрхүүл (~100 нанометр).' },
    { exp: -5,  sizeM: 1e-5,  name: 'Цусны улаан эс (Cell)', cat: 'Амьд эс', desc: 'Хүний биеийн эс. Хүний үсний өргөнөөс 10 дахин нарийн.' },
    { exp: -3,  sizeM: 5e-3,  name: 'Шоргоолж (Ant)', cat: 'Амьтан', desc: 'Хүний нүдээр микроскопгүйгээр шууд харж болох хэмжээ.' },
    { exp: 0,   sizeM: 1.75,  name: 'Хүн төрөлхтөн (Human)', cat: 'Биологийн төрөл', desc: 'Дэлхий дээрх ухаант амьдрал. Ойролцоогоор 37 их наяд эсээс тогтоно.' },
    { exp: 3,   sizeM: 8848,  name: 'Эверест оргил (Mt. Everest)', cat: 'Геологи', desc: 'Далайн түвшнээс дээш хамгийн өндөр хуурай газрын цэг (8.8 км).' },
    { exp: 5,   sizeM: 504e3, name: 'Энцелад (Enceladus)', cat: 'Далайн мөсөн дагуул', desc: 'Санчирын дагуул (504 км). Өмнөд туйлын Tiger Stripe хагарлаас далайн криогейзер сансарт цацдаг.' },
    { exp: 6,   sizeM: 3121e3, name: 'Европа (Europa)', cat: 'Далайн мөсөн дагуул', desc: 'Бархасбадийн дагуул (3,121 км). Мөсөн царцдас доороо 100 км гүн дэлхийн бүх далайгаас 2 дахин их шингэн устай.' },
    { exp: 6,   sizeM: 3474e3, name: 'Сар (The Moon)', cat: 'Эх газрын дагуул', desc: 'Дэлхийн цорын ганц байгалийн дагуул (Диаметр: 3,474 км).' },
    { exp: 6,   sizeM: 5150e3, name: 'Титан (Titan)', cat: 'Агаар мандалтай дагуул', desc: 'Санчирын хамгийн том дагуул (5,150 км). Зузаан азотын хий мандалтай, шингэн метан нууруудтай.' },
    { exp: 7,   sizeM: 12742e3,name: 'Дэлхий гараг (Earth - Reference)', cat: 'Лавлах гараг', desc: 'Амьдралтай цэнхэр гараг. Экваторын диаметр: 12,742 км. Харь гарагийн харьцуулалтын лавлах цэг.' },
    { exp: 8,   sizeM: 139820e3,name: 'Бархасбадь (Jupiter)', cat: 'Хийн аварга гараг', desc: 'Нарны аймгийн хамгийн том гараг. Дэлхийг 1,300 ширхэг багтаана.' },
    { exp: 9,   sizeM: 1.392e9,name: 'Нар од (The Sun)', cat: 'Шар одой од (G2V)', desc: 'Нарны аймгийн төв од (Диаметр: 1.39 сая км, Дэлхийгээс 109 дахин том).' },
    { exp: 10,  sizeM: 2.38e9, name: 'Сириус A (Sirius A)', cat: 'Цагаан од (A1V)', desc: 'Тэнгэрийн хамгийн тод од. Нарнаас 1.7 дахин том диаметртэй.' },
    { exp: 12,  sizeM: 1.2e12, name: 'Бетельгейз (Betelgeuse)', cat: 'Улаан супер аварга', desc: 'Орионы одны ордны аварга од. Нарны оронд тавибал Бархасбадийн тойрог зам хүртэл хүрэхээр том!' },
    { exp: 12,  sizeM: 2.99e12, name: 'Stephenson 2-18', cat: 'Хэт аварга улаан од', desc: 'Мэдэгдэж буй хамгийн том оддын нэг (Нарнаас 2,150 дахин том диаметртэй).' },
    { exp: 13,  sizeM: 9e12,   name: 'Нарны аймаг (Kuiper Belt)', cat: 'Одон орны систем', desc: 'Нептун ба Койперын бүслүүрийн зах хүртэлх зайн хэмжээ (~60 AU).' },
    { exp: 16,  sizeM: 9.46e15,name: 'Гэрлийн жил (Light Year)', cat: 'Одон орны нэгж', desc: 'Гэрэл вакуумд 1 жилийн хугацаанд туулах зай (9.46 их наяд км).' },
    { exp: 21,  sizeM: 1e21,   name: 'Сүүн зам (Milky Way Galaxy)', cat: 'Спираль Галактик', desc: '100-400 тэрбум од, манай нарны аймгийг багтаасан галактик (~105,700 гэрлийн жил).' },
    { exp: 23,  sizeM: 9.5e22, name: 'Орон нутгийн бүлэг (Local Group)', cat: 'Галактикийн бүлэг', desc: 'Сүүн зам, Андромеда болон 50 гаруй одой галактикуудын цугларалт.' },
    { exp: 26,  sizeM: 8.8e26, name: 'Ажиглагдах орчлон (Observable Universe)', cat: 'Космологи', desc: 'Их Тэсрэлтээс хойш гэрэл нь бидэнд хүрч амжсан 93 тэрбум гэрлийн жилийн диаметртэй орчлон.' }
  ];

  class CosmosLabModule {
    constructor() {
      this.id = 'cosmos_lab_v2';
      this.isMounted = false;
      this.isPaused = false;
      this.container = null;
      this.activeSubtab = 'blackhole';

      // 1. Black Hole State
      this.bhState = {
        presetKey: 'stellar',
        massSolar: 21.2,
        distRsNorm: 15.0, // Distance in units of Schwarzschild radius
        observerTimeHrs: 1.0,
        scene: null,
        camera: null,
        renderer: null,
        holeMesh: null,
        diskMesh: null,
        lensRingMesh: null,
        photonSphereMesh: null,
        orbitAngle: 0,
        isDragging: false,
        prevMouse: { x: 0, y: 0 },
        animId: null
      };

      // 2. DART Defense State
      this.dartState = {
        astMassKg: 4.3e9,      // Dimorphos equivalent
        scMassKg: 570,          // DART spacecraft
        impactVelKmS: 6.14,     // 6.14 km/s impact
        impactAngleDeg: 15,     // 15 degrees off-axis
        betaFactor: 3.6,        // Crater ejecta recoil multiplier
        isFlying: false,
        progress: 0,
        deflected: false,
        animId: null,
        canvas: null,
        ctx: null
      };

      // 3. Scale State
      this.scaleState = {
        currentExp: 0,
        canvas: null,
        ctx: null
      };

      // 4. Interstellar Travel State
      this.voyageState = {
        destId: 'proxima',
        propId: 'fusion',
        shipMassKg: 100000 // 100 tonnes
      };
    }

    /**
     * Mounts Cosmos Lab into container
     */
    mount(container) {
      this.container = container;
      this.isMounted = true;
      this.isPaused = false;

      this._initDomBindings();
      this._initBlackHole3D();
      this._initDartCanvas();
      this._initScaleCanvas();
      this._updateVoyageCalculations();
    }

    pause() {
      this.isPaused = true;
      if (this.bhState.animId) {
        cancelAnimationFrame(this.bhState.animId);
        this.bhState.animId = null;
      }
      if (this.dartState.animId) {
        cancelAnimationFrame(this.dartState.animId);
        this.dartState.animId = null;
      }
    }

    resume() {
      this.isPaused = false;
      if (this.activeSubtab === 'blackhole' && !this.bhState.animId) {
        this._startBhLoop();
      }
    }

    unmount() {
      this.pause();
      this.isMounted = false;
      if (this.bhState.renderer) {
        this.bhState.renderer.dispose();
        this.bhState.renderer = null;
      }
    }

    dispose() {
      this.unmount();
    }

    /* =========================================================================
     * 1. BLACK HOLE SIMULATION (General Relativity & Relativistic Optics)
     * ========================================================================= */
    _initBlackHole3D() {
      const canvas = document.getElementById('seBlackholeCanvas');
      if (!canvas) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(320, rect.width || 600);
      const height = Math.max(300, rect.height || 360);

      this.bhState.scene = new THREE.Scene();
      this.bhState.scene.background = new THREE.Color(0x030712);

      this.bhState.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.bhState.camera.position.set(0, 3.5, 12);
      this.bhState.camera.lookAt(0, 0, 0);

      this.bhState.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      this.bhState.renderer.setSize(width, height);
      this.bhState.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Stars in background
      const starGeo = new THREE.BufferGeometry();
      const starCount = 350;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 80 + Math.random() * 40;
        starPos[i] = r * Math.sin(phi) * Math.cos(theta);
        starPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPos[i + 2] = r * Math.cos(phi);
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8, transparent: true, opacity: 0.8 });
      this.bhState.scene.add(new THREE.Points(starGeo, starMat));

      // 1. Pitch-Black Event Horizon (rs = 1.0 in normalized model units)
      const holeGeo = new THREE.SphereGeometry(1.0, 64, 64);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      this.bhState.holeMesh = new THREE.Mesh(holeGeo, holeMat);
      this.bhState.scene.add(this.bhState.holeMesh);

      // 2. Photon Sphere Ring (r = 1.5 rs)
      const photonGeo = new THREE.RingGeometry(1.48, 1.54, 80);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      this.bhState.photonSphereMesh = new THREE.Mesh(photonGeo, photonMat);
      this.bhState.photonSphereMesh.rotation.x = Math.PI / 2;
      this.bhState.scene.add(this.bhState.photonSphereMesh);

      // 3. Procedural Relativistic Accretion Disk (Inner boundary ISCO at 3.0 rs, outer at 7.5 rs)
      const diskGeo = new THREE.RingGeometry(1.6, 6.8, 96);
      const diskTex = this._createAccretionDiskTexture();
      const diskMat = new THREE.MeshBasicMaterial({
        map: diskTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      this.bhState.diskMesh = new THREE.Mesh(diskGeo, diskMat);
      this.bhState.diskMesh.rotation.x = Math.PI / 2.3;
      this.bhState.scene.add(this.bhState.diskMesh);

      // 4. Gravitational Lensing Halo (Secondary warped image of disk above and below)
      const lensGeo = new THREE.RingGeometry(1.05, 1.45, 96);
      const lensTex = this._createLensingHaloTexture();
      const lensMat = new THREE.MeshBasicMaterial({
        map: lensTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      this.bhState.lensRingMesh = new THREE.Mesh(lensGeo, lensMat);
      this.bhState.scene.add(this.bhState.lensRingMesh);

      // Setup Camera Orbit Controls
      this._setupBhOrbit(canvas);

      // Recalculate physics & update UI
      this._updateBlackHolePhysics();
      this._startBhLoop();
    }

    _createAccretionDiskTexture() {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 64;
      const ctx = c.getContext('2d');

      // Gradient representing hot synchrotron emission: white-blue inner -> golden amber -> deep orange-red
      const grad = ctx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.08, 'rgba(255, 255, 255, 0.98)');
      grad.addColorStop(0.20, 'rgba(125, 211, 252, 0.95)'); // High temperature synchrotron blue
      grad.addColorStop(0.40, 'rgba(245, 158, 11, 0.92)');  // Warm amber
      grad.addColorStop(0.70, 'rgba(220, 38, 38, 0.65)');   // Cooler reddish rim
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 64);
      return new THREE.CanvasTexture(c);
    }

    _createLensingHaloTexture() {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 32;
      const ctx = c.getContext('2d');

      const grad = ctx.createLinearGradient(0, 0, 256, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.3, 'rgba(253, 224, 71, 0.85)');
      grad.addColorStop(0.7, 'rgba(245, 158, 11, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 32);
      return new THREE.CanvasTexture(c);
    }

    _setupBhOrbit(canvas) {
      canvas.addEventListener('mousedown', (e) => {
        this.bhState.isDragging = true;
        this.bhState.prevMouse = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.bhState.isDragging || !this.bhState.camera) return;
        const dx = e.clientX - this.bhState.prevMouse.x;
        const dy = e.clientY - this.bhState.prevMouse.y;
        this.bhState.prevMouse = { x: e.clientX, y: e.clientY };

        this.bhState.orbitAngle += dx * 0.008;
        const currentY = this.bhState.camera.position.y - dy * 0.05;
        this.bhState.camera.position.y = Math.max(-10, Math.min(10, currentY));
      });

      window.addEventListener('mouseup', () => { this.bhState.isDragging = false; });

      // Touch orbit
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.bhState.isDragging = true;
          this.bhState.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      });
      window.addEventListener('touchmove', (e) => {
        if (!this.bhState.isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - this.bhState.prevMouse.x;
        const dy = e.touches[0].clientY - this.bhState.prevMouse.y;
        this.bhState.prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        this.bhState.orbitAngle += dx * 0.008;
        const currentY = this.bhState.camera.position.y - dy * 0.05;
        this.bhState.camera.position.y = Math.max(-10, Math.min(10, currentY));
      });
      window.addEventListener('touchend', () => { this.bhState.isDragging = false; });

      // Zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const dist = this.bhState.camera.position.z + e.deltaY * 0.015;
        this.bhState.camera.position.z = Math.max(4.0, Math.min(28.0, dist));
      }, { passive: false });
    }

    _updateBlackHolePhysics() {
      const massSolar = this.bhState.massSolar;
      const rRs = this.bhState.distRsNorm; // Normalized distance in units of rs (1.05 to 50)

      // 1. Schwarzschild Radius: rs = 2 * G * M / c^2
      // For M = 1 M_sun, rs ≈ 2.953 km
      const rsKm = (2 * G * (massSolar * M_SUN)) / (C * C * 1000);
      const actualDistKm = rsKm * rRs;

      // 2. Gravitational Time Dilation Factor:
      // dt_observer = dt_local / sqrt(1 - rs / r)
      // gamma_grav = 1 / sqrt(1 - 1 / rRs)
      const ratio = 1 / Math.max(1.0001, rRs);
      const timeDilationGamma = 1 / Math.sqrt(Math.max(0.00001, 1 - ratio));

      // 3. Photon Sphere & ISCO
      const photonSphereKm = rsKm * 1.5;
      const iscoKm = rsKm * 3.0;

      // 4. Tidal Force Differential (Spaghettification Gradient)
      // dF/dr ≈ 2GM / r^3 (per unit human height ~1.8 m)
      const rMeters = actualDistKm * 1000;
      const tidalAccelM_S2 = (2 * G * (massSolar * M_SUN) * 1.8) / Math.pow(rMeters, 3);
      const tidalG = tidalAccelM_S2 / 9.80665;

      // Update UI elements
      const badge = document.getElementById('seBhDilationBadge');
      if (badge) {
        badge.textContent = `γ = ${timeDilationGamma > 9999 ? '∞ (Хязгааргүй)' : timeDilationGamma.toFixed(2) + 'x'}`;
        badge.style.color = timeDilationGamma > 5 ? '#ef4444' : (timeDilationGamma > 1.5 ? '#f59e0b' : '#38bdf8');
      }

      const distLbl = document.getElementById('seBhDistanceLabel');
      if (distLbl) {
        const fmtDist = actualDistKm > 1e6 ? `${(actualDistKm / 1e6).toFixed(2)} сая км` : `${Math.round(actualDistKm).toLocaleString()} км`;
        distLbl.textContent = `Ажиглагчийн зай: ${fmtDist} (${rRs.toFixed(1)} rs)`;
      }

      const rsEl = document.getElementById('seBhRsVal');
      if (rsEl) {
        const fmtRs = rsKm > 1e6 ? `${(rsKm / 1e6).toFixed(2)} сая км` : `${rsKm.toFixed(1)} км`;
        rsEl.textContent = fmtRs;
      }

      const iscoEl = document.getElementById('seBhIscoVal');
      if (iscoEl) {
        const fmtIsco = iscoKm > 1e6 ? `${(iscoKm / 1e6).toFixed(2)} сая км` : `${iscoKm.toFixed(1)} км`;
        iscoEl.textContent = fmtIsco;
      }

      const tidalEl = document.getElementById('seBhTidalVal');
      if (tidalEl) {
        if (tidalG < 0.1) {
          tidalEl.textContent = 'Аюулгүй (< 0.1 G)';
          tidalEl.style.color = '#22c55e';
        } else if (tidalG < 10) {
          tidalEl.textContent = `${tidalG.toFixed(1)} G (Мэдрэгдэх таталт)`;
          tidalEl.style.color = '#f59e0b';
        } else {
          tidalEl.textContent = `${Math.round(tidalG).toLocaleString()} G (Спагеттификаци!)`;
          tidalEl.style.color = '#ef4444';
        }
      }

      // Earth Observer vs Ship Astronaut Clock
      const earthClock = document.getElementById('seBhEarthClock');
      const earthSub = document.getElementById('seBhEarthSub');
      if (earthClock) {
        const factor = timeDilationGamma;
        if (factor < 1.05) {
          earthClock.textContent = '1.0 цаг';
          if (earthSub) earthSub.textContent = 'Цагийн зөрүү бараг үгүй';
        } else if (factor < 24) {
          earthClock.textContent = `${factor.toFixed(1)} цаг`;
          if (earthSub) earthSub.textContent = 'Дэлхий дээрх цаг мэдэгдэхүйц хурдан өнгөрнө';
        } else if (factor < 8760) {
          const days = (factor / 24).toFixed(1);
          earthClock.textContent = `${days} өдөр`;
          if (earthSub) earthSub.textContent = 'Хар нүхний дэргэдэх 1 цаг = Дэлхийн хэдэн өдөр';
        } else if (factor < 500000) {
          const years = (factor / 8760).toFixed(1);
          earthClock.textContent = `${years} жил!`;
          if (earthSub) earthSub.textContent = `Interstellar кино шиг: 1 цаг = ${years} жил өнгөрнө!`;
        } else {
          earthClock.textContent = 'Сая сая жил (Цаг хугацаа зогсоно)';
          if (earthSub) earthSub.textContent = 'Үйл явдлын хаяанд гэрэл болон цаг ажиглагчийн хувьд бүрэн царцана!';
        }
      }
    }

    _startBhLoop() {
      const tick = () => {
        if (this.isPaused) return;

        if (this.bhState.diskMesh) {
          this.bhState.diskMesh.rotation.z += 0.008;
        }

        // Relativistic camera look-at & gentle orbit
        if (this.bhState.camera) {
          const radius = Math.sqrt(this.bhState.camera.position.x ** 2 + this.bhState.camera.position.z ** 2) || 12;
          this.bhState.camera.position.x = Math.sin(this.bhState.orbitAngle) * radius;
          this.bhState.camera.position.z = Math.cos(this.bhState.orbitAngle) * radius;
          this.bhState.camera.lookAt(0, 0, 0);
        }

        // Lensing halo billboarding towards camera
        if (this.bhState.lensRingMesh && this.bhState.camera) {
          this.bhState.lensRingMesh.lookAt(this.bhState.camera.position);
        }

        if (this.bhState.renderer && this.bhState.scene && this.bhState.camera) {
          this.bhState.renderer.render(this.bhState.scene, this.bhState.camera);
        }

        this.bhState.animId = requestAnimationFrame(tick);
      };
      this.bhState.animId = requestAnimationFrame(tick);
    }

    /* =========================================================================
     * 2. DART PLANETARY DEFENSE SIMULATION (Orbital Mechanics & Impact Recoil)
     * ========================================================================= */
    _initDartCanvas() {
      const canvas = document.getElementById('seDartCanvas');
      if (!canvas) return;
      this.dartState.canvas = canvas;
      this.dartState.ctx = canvas.getContext('2d');

      this._drawDartScene();
    }

    calculateDartPhysics() {
      const mAst = this.dartState.astMassKg;
      const mSc = this.dartState.scMassKg;
      const vImp = this.dartState.impactVelKmS * 1000; // m/s
      const thetaRad = (this.dartState.impactAngleDeg * Math.PI) / 180;
      const beta = this.dartState.betaFactor;

      // Effective momentum transferred: Δp = beta * m_sc * v_imp * cos(theta)
      const deltaP = beta * mSc * vImp * Math.cos(thetaRad);

      // Asteroid velocity change: Δv = Δp / M_ast (m/s)
      const deltaV = deltaP / mAst;
      const deltaVMmS = deltaV * 1000; // mm/s

      // Planetary defense orbital propagation lead time (8-year early interception window)
      const leadTimeYears = 8;
      const timeToEarthSec = leadTimeYears * 365.25 * 86400;
      const missDistanceKm = (deltaV * timeToEarthSec) / 1000;

      return {
        deltaP_Ns: deltaP,
        deltaV_m_s: deltaV,
        deltaV_mm_s: deltaVMmS,
        leadTimeYears: leadTimeYears,
        missDistanceKm: Math.round(missDistanceKm),
        deflected: deltaVMmS > 0.01,
        isSafeMiss: missDistanceKm > 500 // Significant miss distance safely outside keyhole
      };
    }

    launchDartSimulation() {
      if (this.dartState.isFlying) return;
      this.dartState.isFlying = true;
      this.dartState.progress = 0;
      this.dartState.deflected = false;

      const statusEl = document.getElementById('seDartStatus');
      if (statusEl) statusEl.textContent = '🚀 DART хөлөг хөөрлөө... Чиглүүлэгч радараар ойртож байна!';

      const anim = () => {
        this.dartState.progress += 0.015;
        this._drawDartScene();

        if (this.dartState.progress >= 0.5 && !this.dartState.deflected) {
          this.dartState.deflected = true;
          const stats = this.calculateDartPhysics();
          if (statusEl) {
            statusEl.textContent = `💥 МӨРГӨЛТ! β=${this.dartState.betaFactor}X хүчээр хазайж, солирын хурд ${stats.deltaV_mm_s.toFixed(2)} мм/с-ээр өөрчлөгдлөө!`;
          }
        }

        if (this.dartState.progress < 1.0) {
          this.dartState.animId = requestAnimationFrame(anim);
        } else {
          this.dartState.isFlying = false;
          const stats = this.calculateDartPhysics();
          if (statusEl) {
            statusEl.textContent = stats.isSafeMiss 
              ? `✅ ДААЛГАВАР БИЕЛЛЭЭ! Солир Дэлхийг ${stats.missDistanceKm.toLocaleString()} км зайтай зөрж өнгөрлөө!`
              : `⚠️ АЮУЛ: Хазайлт хангалтгүй! Дэлхийг шүргэх эрсдэлтэй (${stats.missDistanceKm.toLocaleString()} км).`;
          }
        }
      };
      this.dartState.animId = requestAnimationFrame(anim);
    }

    _drawDartScene() {
      const canvas = this.dartState.canvas;
      if (!canvas) return;
      const ctx = this.dartState.ctx;

      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const w = rect.width;
      const h = rect.height;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Deep space starfield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 35; i++) {
        ctx.fillRect((i * 41) % w, (i * 67) % h, 1, 1);
      }

      // Earth at bottom-left
      const ex = 95, ey = h - 90, er = 46;
      const earthGrad = ctx.createRadialGradient(ex - 12, ey - 12, 6, ex, ey, er);
      earthGrad.addColorStop(0, '#7dd3fc');
      earthGrad.addColorStop(0.5, '#0284c7');
      earthGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();

      // Earth atmosphere glow
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillText('ДЭЛХИЙ (Target Earth)', ex - 45, ey + er + 18);

      // Asteroid Trajectory
      const startX = w - 70, startY = 55;
      const stats = this.calculateDartPhysics();
      const missOffset = Math.min(180, (stats.missDistanceKm / 60000) * 120);
      const targetX = this.dartState.deflected ? ex + 90 + missOffset : ex;
      const targetY = this.dartState.deflected ? ey - 80 - missOffset * 0.5 : ey;

      const curX = startX + (targetX - startX) * this.dartState.progress;
      const curY = startY + (targetY - startY) * this.dartState.progress;

      // Trajectory lines (Original vs Deflected)
      ctx.setLineDash([4, 4]);
      // Original dangerous path
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Deflected safe path
      if (this.dartState.deflected) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo((startX + ex) * 0.5, (startY + ey) * 0.5);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Asteroid (Dimorphos 3D shading)
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(curX, curY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = this.dartState.deflected ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // DART Interceptor flight
      if (this.dartState.isFlying && this.dartState.progress < 0.52) {
        const prog = this.dartState.progress * 2;
        const rx = ex + ((startX + ex) * 0.5 - ex) * prog;
        const ry = ey + ((startY + ey) * 0.5 - ey) * prog;

        // Spacecraft icon & thruster exhaust
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(rx, ry, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Ejecta Cloud on impact (Momentum enhancement beta)
      if (this.dartState.progress >= 0.48 && this.dartState.progress <= 0.60) {
        ctx.fillStyle = 'rgba(253, 224, 71, 0.85)';
        ctx.beginPath();
        ctx.arc(curX, curY, 26, 0, Math.PI * 2);
        ctx.fill();

        // Ejecta plume particles
        ctx.fillStyle = '#f97316';
        for (let p = 0; p < 8; p++) {
          const a = p * (Math.PI / 4);
          ctx.fillRect(curX + Math.cos(a) * 22, curY + Math.sin(a) * 22, 3, 3);
        }
      }

      ctx.restore();
    }

    /* =========================================================================
     * 3. COSMIC LOGARITHMIC SCALE EXPLORER
     * ========================================================================= */
    _initScaleCanvas() {
      this._updateScaleDisplay(0);
    }

    _updateScaleDisplay(exp) {
      this.scaleState.currentExp = exp;

      // Find nearest milestone
      let nearest = SCALE_MILESTONES[0];
      let minDiff = 999;
      for (const m of SCALE_MILESTONES) {
        const diff = Math.abs(m.exp - exp);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = m;
        }
      }

      const badge = document.getElementById('seScaleExponentBadge');
      if (badge) badge.textContent = `Хэмжээ: 10^${exp} метр (${nearest.name})`;

      const meterVal = document.getElementById('seScaleMeterVal');
      if (meterVal) {
        meterVal.textContent = nearest.sizeM < 0.01 
          ? `10^${nearest.exp} м` 
          : (nearest.sizeM > 1e6 ? `${(nearest.sizeM / 1e3).toLocaleString()} км` : `${nearest.sizeM} м`);
      }

      const titleEl = document.getElementById('seScaleTitle');
      if (titleEl) titleEl.textContent = `${nearest.name} [${nearest.cat}]`;

      const descEl = document.getElementById('seScaleDesc');
      if (descEl) descEl.textContent = nearest.desc;
    }

    /* =========================================================================
     * 4. INTERSTELLAR VOYAGE & RELATIVISTIC CALCULATOR
     * ========================================================================= */
    _updateVoyageCalculations() {
      const dest = INTERSTELLAR_DESTINATIONS.find(d => d.id === this.voyageState.destId) || INTERSTELLAR_DESTINATIONS[0];
      const prop = PROPULSION_CATALOG.find(p => p.id === this.voyageState.propId) || PROPULSION_CATALOG[2];

      const distLy = dest.distLy;
      const speedC = prop.speedC;

      // 1. Earth Observer Time: t_earth = distance / speed
      const earthYears = distLy / speedC;

      // 2. Relativistic Lorentz Factor: gamma = 1 / sqrt(1 - v^2/c^2)
      const beta = speedC;
      const gamma = 1 / Math.sqrt(Math.max(0.000001, 1 - beta * beta));

      // 3. Proper Time for Spacecraft Crew: tau_ship = t_earth / gamma
      const shipYears = earthYears / gamma;

      // 4. Relativistic Kinetic Energy: Ek = (gamma - 1) * m * c^2
      const shipMass = this.voyageState.shipMassKg;
      const kineticJoules = (gamma - 1) * shipMass * C * C;
      const megatonsTNT = kineticJoules / 4.184e15;

      // Formatter
      const fmtTime = (y) => {
        if (y < 1) return `${Math.round(y * 365.25)} өдөр`;
        if (y < 100) return `${y.toFixed(1)} жил`;
        return `${Math.round(y).toLocaleString()} жил`;
      };

      const earthEl = document.getElementById('seVoyageEarthTime');
      if (earthEl) earthEl.textContent = fmtTime(earthYears);

      const shipEl = document.getElementById('seVoyageShipTime');
      if (shipEl) shipEl.textContent = fmtTime(shipYears);

      const subEl = document.getElementById('seVoyageShipSub');
      if (subEl) {
        if (gamma > 1.05) {
          subEl.textContent = `Эйнштейний Харьцангуйн үр дүн: Хөлгийн цаг ${gamma.toFixed(2)}x удааширна! (γ=${gamma.toFixed(2)})`;
          subEl.style.color = '#38bdf8';
        } else {
          subEl.textContent = 'Ньютоны механиктай ижил (Цагийн удаашрал мэдрэгдэхгүй)';
          subEl.style.color = '#94a3b8';
        }
      }

      const gammaEl = document.getElementById('seVoyageGammaVal');
      if (gammaEl) gammaEl.textContent = `${gamma.toFixed(3)}x`;

      const energyEl = document.getElementById('seVoyageEnergyVal');
      if (energyEl) {
        energyEl.textContent = megatonsTNT > 1e6 
          ? `${(megatonsTNT / 1e6).toFixed(2)} сая Мегатонн` 
          : `${Math.round(megatonsTNT).toLocaleString()} Мегатонн TNT`;
      }

      const noteEl = document.getElementById('seVoyageTechNote');
      if (noteEl) noteEl.textContent = `[TRL ${prop.trl}] ${prop.note}`;
    }

    setBlackHolePreset(key) {
      const preset = BLACK_HOLE_PRESETS[key];
      if (preset) {
        this.bhState.presetKey = key;
        this.bhState.massSolar = preset.massSolar;
        const desc = document.getElementById('seBhPresetDesc');
        if (desc) desc.textContent = preset.desc;
        const massSel = document.getElementById('seBhPresetSel');
        if (massSel) massSel.value = key;
        this._updateBlackHolePhysics();
      }
    }

    switchSubtab(target) {
      this.activeSubtab = target;
      document.querySelectorAll('.se-subtab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-se-subtab') === target);
      });
      document.querySelectorAll('.se-subpanel').forEach(p => p.style.display = 'none');
      if (target === 'blackhole') {
        const el = document.getElementById('seSubBlackhole');
        if (el) el.style.display = 'block';
        if (!this.bhState.renderer) this._initBlackHole3D();
        else this.resume();
      } else if (target === 'dart') {
        const el = document.getElementById('seSubDart');
        if (el) el.style.display = 'block';
        this._drawDartScene();
      } else if (target === 'scale') {
        const el = document.getElementById('seSubScale');
        if (el) el.style.display = 'block';
        this._initScaleCanvas();
      } else if (target === 'voyage') {
        const el = document.getElementById('seSubVoyage');
        if (el) el.style.display = 'block';
        this._updateVoyageCalculations();
      }
    }

    /* =========================================================================
     * DOM EVENT BINDINGS
     * ========================================================================= */
    _initDomBindings() {
      // Subtab switching
      document.querySelectorAll('.se-subtab-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const target = btn.getAttribute('data-se-subtab');
          this.switchSubtab(target);
        };
      });

      // Black Hole Distance Slider
      const distSlider = document.getElementById('seBhSliderDist');
      if (distSlider) {
        distSlider.oninput = (e) => {
          // Map slider 1 (close ~1.05 rs) to 100 (far ~45 rs)
          const val = Number(e.target.value);
          this.bhState.distRsNorm = 1.05 + Math.pow(val / 100, 2) * 44;
          this._updateBlackHolePhysics();
        };
      }

      // Black Hole Mass Selector
      const massSel = document.getElementById('seBhPresetSel');
      if (massSel) {
        massSel.onchange = (e) => {
          this.setBlackHolePreset(e.target.value);
        };
      }

      // DART Controls
      const launchBtn = document.getElementById('seDartLaunchBtn');
      if (launchBtn) {
        launchBtn.onclick = () => this.launchDartSimulation();
      }

      const betaSlider = document.getElementById('seDartBetaSlider');
      if (betaSlider) {
        betaSlider.oninput = (e) => {
          this.dartState.betaFactor = Number(e.target.value);
          const lbl = document.getElementById('seDartBetaVal');
          if (lbl) lbl.textContent = `${this.dartState.betaFactor.toFixed(1)}x`;
          this._drawDartScene();
        };
      }

      const velSlider = document.getElementById('seDartVelSlider');
      if (velSlider) {
        velSlider.oninput = (e) => {
          this.dartState.impactVelKmS = Number(e.target.value);
          const lbl = document.getElementById('seDartVelVal');
          if (lbl) lbl.textContent = `${this.dartState.impactVelKmS.toFixed(1)} км/с`;
          this._drawDartScene();
        };
      }

      // Scale Slider
      const scaleSlider = document.getElementById('seScaleSlider');
      if (scaleSlider) {
        scaleSlider.oninput = (e) => {
          this._updateScaleDisplay(Number(e.target.value));
        };
      }

      // Interstellar Voyage Selectors
      const voyageDest = document.getElementById('seVoyageDest');
      if (voyageDest) {
        voyageDest.onchange = (e) => {
          this.voyageState.destId = e.target.value;
          this._updateVoyageCalculations();
        };
      }

      const voyageProp = document.getElementById('seVoyageProp');
      if (voyageProp) {
        voyageProp.onchange = (e) => {
          this.voyageState.propId = e.target.value;
          this._updateVoyageCalculations();
        };
      }
    }
  }

  return CosmosLabModule;
}));
