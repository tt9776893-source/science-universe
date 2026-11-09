/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 · SHARED SCIENCE DATA
   File: js/space/su-space-data.js
   Classic script (no modules) so the portal keeps working from file://.
   Reuses the portal's existing PLANETS_DATA when available; never mutates it.
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};

  /* ---------------------------------------------------------------------
     1. Planet presentation + simulation metadata
     Established values come from PLANETS_DATA at runtime. This block only
     adds presentation and clearly-labelled simulation parameters.
     --------------------------------------------------------------------- */
  var META = {
    mercury: {
      key: 'mercury', order: 1, type: 'rocky', airless: true,
      sky: 0x04060c, fog: 0x04060c, palette: [0x4a4a4a, 0x6e6e6e, 0x9a9a9a], rock: 0x5b5b5b,
      amplitude: 1.6, roughness: 1.0, seed: 11, waterScore: 5, radiationScore: 10,
      simNotice: 'Гадаргын байршил нь бодит Калорис, Бетховен тогоонуудын загварчилсан дүрслэл. Нарийвчилсан координат симуляц.',
      features: [
        { id: 'caloris', type: 'geo', name: 'Калорис сав газар', evidence: 'established', x: 6, z: -5, desc: '1,550 км диаметртэй, Нарны аймгийн хамгийн том солирын тогоонуудын нэг.' },
        { id: 'beethoven', type: 'geo', name: 'Бетховен тогоо', evidence: 'established', x: -7, z: 4, desc: '643 км диаметртэй, лааваар дүүрсэн аварга тогоо.' },
        { id: 'iron', type: 'mineral', name: 'Төмөрт силикат реголит', evidence: 'established', x: 2, z: 8, desc: 'Гадаргын нарийн тоосонцор; төмөр, никель, силикат агуулна.' }
      ],
      minerals: [
        { name: 'Төмөр (Fe)', evidence: 'established', desc: 'Цөмийн 75%-ийг эзэлдэг гэж үздэг; гадарга дээр силикаттай холилдсон.' },
        { name: 'Никель (Ni)', evidence: 'established', desc: 'Солирын материал ба цөмийн найрлагад илэрдэг.' },
        { name: 'Хүхэр (S)', evidence: 'model', desc: 'Тогоонуудын захад хүхрийн баялаг давхарга байж болзошгүй — загварын таамаг.' }
      ],
      labFocus: ['physics', 'engineering'],
      localGravityNote: 'Барзгар, агааргүй гадарга. Чөлөөт уналт Дэлхийн 38%.'
    },
    venus: {
      key: 'venus', order: 2, type: 'rocky', airless: false,
      sky: 0xd3a24a, fog: 0xc08c3a, palette: [0x6b4a2f, 0x8a6038, 0xc9a06a], rock: 0x7a5533,
      amplitude: 1.2, roughness: 0.9, seed: 23, waterScore: 0, radiationScore: 15,
      simNotice: 'Гадарга дээр 92 атм, 465°C. Буух төхөөрөмж нь даралтат хамгаалалттай загварчилсан станц; бодит хүн буух боломжгүй.',
      features: [
        { id: 'maxwell', type: 'geo', name: 'Максвелл уулс', evidence: 'established', x: -5, z: -6, desc: 'Сугар гаргийн хамгийн өндөр уул (11 км).' },
        { id: 'venera13', type: 'geo', name: 'Венера-13 буусан цэг', evidence: 'established', x: 7, z: 3, desc: '1982 онд 457°C, 89 атм даралтад ажилласан Зөвлөлтийн станц.' },
        { id: 'so2', type: 'atm', name: 'Хүхрийн хүчлийн үүл', evidence: 'established', x: 1, z: 8, desc: '50–70 км өндөрт H₂SO₄ дусал бүхий өтгөн үүлэн давхарга.' }
      ],
      minerals: [
        { name: 'Базальт', evidence: 'established', desc: 'Галт уулын гадаргын гол чулуулаг.' },
        { name: 'Хүхрийн давхарга', evidence: 'established', desc: 'Гадарга дахь хүхрийн нэгдлүүд.' },
        { name: 'Усны мөс', evidence: 'model', desc: 'Дээд үүлэн давхаргад ул мөр байж болзошгүй — баталгаажаагүй.' }
      ],
      labFocus: ['physics', 'chemistry'],
      localGravityNote: 'Хүчиллэг, 465°C, 92 атм. Зөвхөн даралтат станцын дотор ажиллана.'
    },
    earth: {
      key: 'earth', order: 3, type: 'rocky', airless: false,
      sky: 0x3f7fbf, fog: 0x7fa8c9, palette: [0x2f5f35, 0x5b7a3a, 0x8d8b72], rock: 0x6b6b5e,
      amplitude: 2.2, roughness: 1.0, seed: 31, waterScore: 100, radiationScore: 95,
      simNotice: 'Буух бүс нь тивтийн өндөрлөг; далай, хот, бодит газар зүйн нарийвчилсан байршил симуляц.',
      features: [
        { id: 'everest', type: 'geo', name: 'Гималайн өндөрлөг', evidence: 'established', x: -6, z: -7, desc: 'Дэлхийн хамгийн өндөр уулсын бүс; тектоник хавтангийн мөргөлдөөнөөс үүссэн.' },
        { id: 'sahara', type: 'geo', name: 'Сахрын цөл', evidence: 'established', x: 8, z: 4, desc: '9.2 сая км² талбайтай, дэлхийн хамгийн том халуун цөл.' },
        { id: 'granite', type: 'mineral', name: 'Гранит цул', evidence: 'established', x: 1, z: 9, desc: 'Кварц, фельдспар, гялтгануураас тогтох магмын чулуулаг.' }
      ],
      minerals: [
        { name: 'Кварц (SiO₂)', evidence: 'established', desc: 'Элс, гранит, цахиурын гол эрдэс.' },
        { name: 'Төмрийн хүдэр', evidence: 'established', desc: 'Гематит, магнетит хэлбэрээр уулсын чулуулагт.' },
        { name: 'Ус (H₂O)', evidence: 'established', desc: 'Гадаргын 71% шингэн ус.' }
      ],
      labFocus: ['biology', 'physics'],
      localGravityNote: 'Стандарт 1 g, 1 атм. Хүний биеийн бүх туршилтын суурь.'
    },
    moon: {
      key: 'moon', order: 3.5, type: 'rocky', airless: true,
      sky: 0x020308, fog: 0x020308, palette: [0x4a4d55, 0x70747d, 0xa9adb7], rock: 0x6a6e77,
      amplitude: 1.9, roughness: 1.05, seed: 37, waterScore: 25, radiationScore: 5,
      simNotice: 'Гадаргын байршил нь Аполло 11, Тихо, Шеклтон бүсүүдийн загварчилсан дүрслэл.',
      features: [
        { id: 'tycho', type: 'geo', name: 'Тихо тогоо', evidence: 'established', x: -4, z: -6, desc: '85 км диаметртэй, 1,500 км цацарсан цайвар цацрагтай.' },
        { id: 'apollo11', type: 'geo', name: 'Аполло 11 буусан цэг', evidence: 'established', x: 6, z: 2, desc: '1969 онд хүн төрөлхтөн анх Сард хөл тавьсан Tranquility Base.' },
        { id: 'ilmenite', type: 'mineral', name: 'Ильменит реголит', evidence: 'established', x: 0, z: 8, desc: 'Титан, төмөр агуулсан эрдэс; хүчилтөрөгч гаргаж авах боломжтой.' }
      ],
      minerals: [
        { name: 'Ильменит (FeTiO₃)', evidence: 'established', desc: 'Титан ба хүчилтөрөгчийн эх үүсвэр.' },
        { name: 'Оливин', evidence: 'established', desc: 'Мантиас гаралтай ногоовтор эрдэс.' },
        { name: 'Усны мөс', evidence: 'established', desc: 'Өмнөд туйлын мөнхийн сүүдэрт тогоонд баталгаажсан.' }
      ],
      labFocus: ['physics', 'engineering'],
      localGravityNote: '1/6 g. Урт, удаан үсрэлт боломжтой.'
    },
    mars: {
      key: 'mars', order: 4, type: 'rocky', airless: false,
      sky: 0xb05a33, fog: 0x8f4527, palette: [0x6b3520, 0x9c4f2c, 0xc98b5a], rock: 0x7d3f26,
      amplitude: 2.0, roughness: 1.1, seed: 43, waterScore: 30, radiationScore: 15,
      simNotice: 'Гадаргын байршил нь Олимп, Валлес Маринерис, Жезеро бүсүүдийн загварчилсан дүрслэл.',
      features: [
        { id: 'olympus', type: 'geo', name: 'Олимп уулын энгэр', evidence: 'established', x: -7, z: -6, desc: '21.9 км өндөр, Нарны аймгийн хамгийн том бамбайт галт уул.' },
        { id: 'jezero', type: 'geo', name: 'Жезеро тогооны дельта', evidence: 'established', x: 7, z: 3, desc: 'Эртний голын бэлчир; Perseverance ровер энд ажиллаж байна.' },
        { id: 'ironoxide', type: 'mineral', name: 'Төмрийн исэл (Fe₂O₃)', evidence: 'established', x: 1, z: 9, desc: 'Гадаргын улаан өнгийг өгдөг гематит.' }
      ],
      minerals: [
        { name: 'Гематит (Fe₂O₃)', evidence: 'established', desc: 'Улаан гадаргын гол пигмент.' },
        { name: 'Оливин', evidence: 'established', desc: 'Галт уулын чулуулагт илэрдэг.' },
        { name: 'Перхлорат', evidence: 'established', desc: 'Хөрсөнд агуулагдах исэлдүүлэгч давс.' }
      ],
      labFocus: ['physics', 'engineering', 'biology'],
      localGravityNote: '0.38 g, 0.006 атм. Костюмгүй гарч болохгүй.'
    },
    jupiter: {
      key: 'jupiter', order: 5, type: 'gas', airless: false,
      sky: 0xc8a077, fog: 0x9b7650, palette: [0x8a6a4a, 0xc9a077, 0xe8cba4], rock: 0x9b7650,
      amplitude: 0, roughness: 0, seed: 53, waterScore: 0, radiationScore: 80,
      pressureAtm: 1.0, datumLevel: '1.0 Bar Cloud Deck (0 km Datum)', tempMean: -110,
      simNotice: 'Хийн аваргад хатуу гадарга байхгүй. Энэ нь 1 бар даралтын түвшинд хөвөх АЭРОСТАТ СТАНЦЫН загвар — бодит бус, боловч физикийн хувьд үндэслэлтэй.',
      features: [
        { id: 'grs', type: 'atm', name: 'Их Улаан Толбо', evidence: 'established', x: -4, z: -3, desc: '16,350 км өргөн, 350+ жилийн турш эргэлдэж буй антициклон.' },
        { id: 'ammonia', type: 'atm', name: 'Аммиакийн үүлэн бүс', evidence: 'established', x: 4, z: 2, desc: 'Устөрөгч, гели, аммиак, метан агуулсан зурваст үүл.' },
        { id: 'metalH', type: 'mineral', name: 'Металл устөрөгчийн хилийн бүс', evidence: 'model', desc: 'Гүнзгий давхаргад устөрөгч металл төлөвт шилждэг гэсэн онол — шууд хэмжилтгүй.', x: 0, z: 5 }
      ],
      minerals: [
        { name: 'Аммиакийн мөс (NH₃)', evidence: 'established', desc: 'Үүлэн дэх аммиакийн талст.' },
        { name: 'Метан (CH₄)', evidence: 'established', desc: 'Агаар мандалд бага хэмжээгээр.' },
        { name: 'Металл устөрөгч', evidence: 'model', desc: 'Гүн дотоод давхаргын онолын төлөв.' }
      ],
      labFocus: ['physics', 'space'],
      localGravityNote: 'Аэростат станц 1 бар түвшинд хөвнө. Гадарга гэж үзэх ёсгүй.'
    },
    saturn: {
      key: 'saturn', order: 6, type: 'gas', airless: false,
      sky: 0xd8c49a, fog: 0xb3a078, palette: [0x9c8a62, 0xc9b78d, 0xe8dcb8], rock: 0xb3a078,
      amplitude: 0, roughness: 0, seed: 61, waterScore: 0, radiationScore: 75,
      pressureAtm: 1.0, datumLevel: '1.0 Bar Cloud Deck (0 km Datum)', tempMean: -139,
      simNotice: 'Хийн аваргад хатуу гадарга байхгүй. 1 бар түвшний АЭРОСТАТ СТАНЦЫН загвар; цагиргийг алсаас ажиглана.',
      features: [
        { id: 'hexagon', type: 'atm', name: 'Хойд туйлын зургаан өнцөгт', evidence: 'established', x: -4, z: -2, desc: '30,000 км өргөн, геометрийн тогтвортой туйлын шуурга.' },
        { id: 'hex2', type: 'atm', name: 'Экваторын тийрэлтэт салхи', evidence: 'established', x: 3, z: 3, desc: '1,450 км/ц хүртэл хурдтай зүүн зүгийн хүчирхэг салхи.' },
        { id: 'ringice', type: 'mineral', name: 'Цагиргийн мөсөн хэсэг', evidence: 'established', x: 0, z: 6, desc: 'Гол төлөв усны мөс (99%), силикат тоосонцрын хольцтой хэсгүүд.' }
      ],
      minerals: [
        { name: 'Аэрозоль шингэн дусал', evidence: 'established', desc: 'Аммиак-усны 1 бар түвшний ууршилтын мананцар.' },
        { name: 'Аммонийн гидросульфид', evidence: 'established', desc: '2 бар гүний үүлэн давхаргын шар-хүрэн талст.' },
        { name: 'Молекулт устөрөгч (H₂)', evidence: 'established', desc: 'Агаар мандлын 96.3%-ийг эзлэгч үндсэн хий.' }
      ],
      labFocus: ['space', 'physics'],
      localGravityNote: '1.065 g (10.44 m/s²). Аэростат станцын тавцан дээрх хүндийн хүч.'
    },
    uranus: {
      key: 'uranus', order: 7, type: 'gas', airless: false,
      sky: 0x7fd6d9, fog: 0x4fa9b0, palette: [0x3f8f96, 0x6fc3c9, 0xa9e6e9], rock: 0x4fa9b0,
      amplitude: 0, roughness: 0, seed: 71, waterScore: 10, radiationScore: 70,
      pressureAtm: 1.0, datumLevel: '1.0 Bar Cloud Deck (0 km Datum)', tempMean: -195,
      simNotice: 'Мөсөн аварга. Хатуу гадарга байхгүй; метан агуулсан аэростат станцын загвар (симуляц).',
      features: [
        { id: 'methanehaze', type: 'atm', name: 'Метан мананцар', evidence: 'established', x: -3, z: -3, desc: 'Метан гэрлийг шингээж, гаригт цэнхэр-ногоон өнгө өгдөг.' },
        { id: 'zonal', type: 'atm', name: 'Зурваст салхины профайл', evidence: 'established', x: 3, z: 2, desc: '97.8° хазайсан тэнхлэгийн улмаас туйл орчмын улирлын салхи.' },
        { id: 'icerock', type: 'mineral', name: 'Мөс-чулуулаг цөм', evidence: 'model', desc: 'Ус, аммиак, метаны мөсөн манти бүхий цөм гэсэн загвар — шууд дээжгүй.', x: 0, z: 5 }
      ],
      minerals: [
        { name: 'Метан (CH₄)', evidence: 'established', desc: 'Дээд агаар мандлын 2.3%.' },
        { name: 'Усны мөс', evidence: 'established', desc: 'Манти дахь мөсөн фаз.' },
        { name: 'Аммиак', evidence: 'established', desc: 'Мөсөн мантийн бүрэлдэхүүн.' }
      ],
      labFocus: ['space', 'physics'],
      localGravityNote: 'Аэростат станц. Маш хүйтэн (-224°C), метан агуулсан орчин.'
    },
    neptune: {
      key: 'neptune', order: 8, type: 'gas', airless: false,
      sky: 0x3f6fd8, fog: 0x2c4fa0, palette: [0x24418f, 0x3f6fd8, 0x7fa3ea], rock: 0x2c4fa0,
      amplitude: 0, roughness: 0, seed: 79, waterScore: 10, radiationScore: 70,
      pressureAtm: 1.0, datumLevel: '1.0 Bar Cloud Deck (0 km Datum)', tempMean: -201,
      simNotice: 'Мөсөн аварга. Хатуу гадарга байхгүй; 1 бар түвшний аэростат станцын загвар (симуляц).',
      features: [
        { id: 'gds', type: 'atm', name: 'Их Хар Толбо', evidence: 'established', x: -4, z: -2, desc: '13,000 км өргөн, 2,100 км/ц хурдтай салхитай антициклон.' },
        { id: 'winds', type: 'atm', name: 'Хэт дууны салхи', evidence: 'established', x: 4, z: 3, desc: 'Нарны аймгийн хамгийн хурдан салхи (дууны хурднаас 2 дахин).' },
        { id: 'methaneice', type: 'mineral', name: 'Метаны мөсөн талст', evidence: 'established', x: 0, z: 6, desc: 'Дээд үүлэн дэх метаны циррус.' }
      ],
      minerals: [
        { name: 'Метан (CH₄)', evidence: 'established', desc: 'Гадаргын цэнхэр өнгийг өгдөг.' },
        { name: 'Усны мөс', evidence: 'established', desc: 'Дотоод мөсөн манти.' },
        { name: 'Аммиак', evidence: 'established', desc: 'Мөсөн бүрхүүл.' }
      ],
      labFocus: ['space', 'computer'],
      localGravityNote: 'Аэростат станц. 2,100 км/ц салхи, -218°C.'
    },
    europa: {
      key: 'europa', order: 5.2, type: 'icy', airless: true,
      sky: 0x010206, fog: 0x050a14, palette: [0xb8d4eb, 0xd9e8f5, 0x8b4513], rock: 0x7fa3c2,
      amplitude: 1.4, roughness: 1.15, seed: 57, waterScore: 90, radiationScore: 10,
      simNotice: 'Мөсөн царцдас (~15-25 км), гүний шингэн далай (~100 км). Бархасбадийн хүчтэй цацрагийн бүс.',
      features: [
        { id: 'thera', type: 'geo', name: 'Thera Macula (Хаос гадарга)', evidence: 'established', x: -5, z: -4, desc: 'Гүний далайн халуун урсгал мөсөн царцдасыг хайлуулж эвдсэн хаос бүс.' },
        { id: 'pwyll', type: 'geo', name: 'Pwyll тогоо', evidence: 'established', x: 6, z: 3, desc: '26 км голчтой залуу тогоо; гүний цагаан мөс цацарсан цацраг бүтэцтэй.' },
        { id: 'linea', type: 'geo', name: 'Улаан хүрэн Lineae ан цав', evidence: 'established', x: 1, z: 7, desc: 'Түрлэгийн хүчээр цуурсан давсархаг магнийн сульфат, эпсомит бүхий ан цав.' }
      ],
      minerals: [
        { name: 'Усны мөс (H₂O Cryogenic Ice)', evidence: 'established', desc: '100 К температурт төмөр шиг хатуу талсжсан цэвэр усны мөс.' },
        { name: 'Магнийн сульфат (MgSO₄·7H₂O)', evidence: 'established', desc: 'Гүний шүлтлэг далайн уснаас гадарга руу шахагдан гарсан эрдэст давс.' },
        { name: 'Хүхрийн хүчлийн гидрат (H₂SO₄)', evidence: 'model', desc: 'Бархасбадийн ионы цацрагийн нөлөөгөөр үүссэн радиолитик нэгдэл.' }
      ],
      labFocus: ['biology', 'physics', 'engineering'],
      localGravityNote: '0.134 g (1.315 m/s²). Мөсөн царцдас дээр хөнгөн өндөр үсрэх боломжтой.'
    },
    titan: {
      key: 'titan', order: 6.6, type: 'rocky', airless: false,
      sky: 0xd97706, fog: 0xb45309, palette: [0x451a03, 0x78350f, 0xb45309], rock: 0x5a341a,
      amplitude: 1.5, roughness: 0.95, seed: 67, waterScore: 75, radiationScore: 60,
      simNotice: 'Өтгөн агаар мандалтай цорын ганц дагуул (1.47 бар). Шингэн метан/этаны гол, нуур, толины манхан.',
      features: [
        { id: 'kraken', type: 'geo', name: 'Kraken Mare (Шингэн метаны тэнгис)', evidence: 'established', x: -6, z: -5, desc: '400,000 км² талбайтай шингэн метан-этаны тэнгис.' },
        { id: 'shangrila', type: 'geo', name: 'Shangri-La толины элсэн манхан', evidence: 'established', x: 5, z: 2, desc: 'Агаар мандлын фотохимийн урвалаар үүссэн органик толин тоосонцрын манхан.' },
        { id: 'methaneriver', type: 'geo', name: 'Метаны голын бэлчир', evidence: 'established', x: 2, z: 7, desc: 'Huygens буугчийн гэрэл зурагт буусан шингэн нүүрсустөрөгчийн урсацын суваг.' }
      ],
      minerals: [
        { name: 'Органик Толин (Tholin Complex)', evidence: 'established', desc: 'Азот-метаны фотолизийн нарийн нийлмэл макромолекул органик нэгдэл.' },
        { name: 'Боржин шиг хатуу Усны мөс', evidence: 'established', desc: '-179°C хүйтэнд силикат чулуу шиг механик шинж чанартай болсон суурь мөс.' },
        { name: 'Хатуу Ацетилен (C₂H₂ flakes)', evidence: 'model', desc: 'Агаараас тунадасжиж буусан пребиотик нүүрсустөрөгчийн талст.' }
      ],
      labFocus: ['biology', 'engineering', 'computer'],
      localGravityNote: '0.138 g (1.352 m/s²), өтгөн агаар мандал (1.47 бар). Сэрүүн бөгөөд агаар нь тогтуун.'
    },
    enceladus: {
      key: 'enceladus', order: 6.2, type: 'icy', airless: true,
      sky: 0x010208, fog: 0x081525, palette: [0xf8fafc, 0xe2e8f0, 0x0284c7], rock: 0x93c5fd,
      amplitude: 1.2, roughness: 1.2, seed: 63, waterScore: 92, radiationScore: 25,
      simNotice: 'Өмнөд туйлын Tiger Stripes халуун ан цавуудаас идэвхтэй крио-гейзерүүд далайн усыг сансарт цацаж байна.',
      features: [
        { id: 'damascus', type: 'geo', name: 'Damascus Sulcus (Tiger Stripe гейзер)', evidence: 'established', x: -4, z: -3, desc: 'Гүний шүлтлэг далайгаас 400 м/с хурдтайгаар ус, хий сансарт цацаж буй халуун ан цав.' },
        { id: 'cairo', type: 'geo', name: 'Cairo Sulcus ан цав', evidence: 'established', x: 5, z: 4, desc: 'Кассини хөлгийн хэмжсэн гидротермал дулааны урсгалтай крио-хагархай.' },
        { id: 'plumevent', type: 'geo', name: 'Крио-галт уулын амсар', evidence: 'established', x: 0, z: 8, desc: 'Нано-силикат, устөрөгч, органик молекулууд агуулсан далайн шороо цацагч бүс.' }
      ],
      minerals: [
        { name: 'Далайн шүлтлэг Давс (NaCl, NaHCO₃)', evidence: 'established', desc: 'pH 9-11 шүлтлэг далайгаас гарч хөлдсөн натрийн давсны нано-талст.' },
        { name: 'Гидротермал Нано-Силикат (SiO₂)', evidence: 'established', desc: '>90°C халуун ёроолын булаг ундарч буйн баталгаа болсон цахиурын тоосонцор.' },
        { name: 'Молекул Устөрөгч агуулсан Мөс (H₂)', evidence: 'established', desc: 'Серпентинизацийн урвалаар үүссэн метаногенез бичил биетний тэжээл.' }
      ],
      labFocus: ['biology', 'physics', 'engineering'],
      localGravityNote: '0.0115 g (0.113 m/s²). Микро-хүндийн хүч; үсрэлт маш өндөр хөөрнө.'
    }
  };

  /* ---------------------------------------------------------------------
     2. Solar-system ordering + safe accessors
     --------------------------------------------------------------------- */
  var SOLAR_ORDER = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  var ALL_KEYS = SOLAR_ORDER.concat(['moon', 'europa', 'titan', 'enceladus']);
  var LANDING_DESTINATIONS = ['mars', 'europa', 'titan', 'enceladus', 'moon', 'mercury', 'venus'];
  var DEFAULT_EXPLORATION_KEY = 'mars';

  var FALLBACK = {
    mercury: { name: 'Буд', en: 'Mercury', color: '#a0a0a0', radiusKm: 2439.7, distanceAU: 0.387, periodDays: 87.97, rotationHours: 1407.6, gravity: 3.7, tempMin: -180, tempMean: 167, tempMax: 430, pressureAtm: 1e-12, moons: 0, atmosphere: [], layers: [], habitability: { score: 3 } },
    venus: { name: 'Сугар', en: 'Venus', color: '#e3bb76', radiusKm: 6051.8, distanceAU: 0.723, periodDays: 224.7, rotationHours: -5832.5, gravity: 8.87, tempMin: 438, tempMean: 464, tempMax: 482, pressureAtm: 92, moons: 0, atmosphere: [], layers: [], habitability: { score: 5 } },
    earth: { name: 'Дэлхий', en: 'Earth', color: '#4fa8ff', radiusKm: 6371, distanceAU: 1, periodDays: 365.25, rotationHours: 23.93, gravity: 9.81, tempMin: -89.2, tempMean: 15, tempMax: 56.7, pressureAtm: 1, moons: 1, atmosphere: [], layers: [], habitability: { score: 100 } },
    moon: { name: 'Сар', en: 'Moon', color: '#c4c8d4', radiusKm: 1737.4, distanceAU: 1, periodDays: 27.3, rotationHours: 655.7, gravity: 1.62, tempMin: -173, tempMean: -20, tempMax: 120, pressureAtm: 1e-14, moons: 0, atmosphere: [], layers: [], habitability: { score: 12 } },
    mars: { name: 'Ангараг', en: 'Mars', color: '#e27b58', radiusKm: 3389.5, distanceAU: 1.524, periodDays: 687, rotationHours: 24.62, gravity: 3.72, tempMin: -143, tempMean: -63, tempMax: 35, pressureAtm: 0.006, moons: 2, atmosphere: [], layers: [], habitability: { score: 14 } },
    jupiter: { name: 'Бархасбадь', en: 'Jupiter', color: '#d8ca9d', radiusKm: 69911, distanceAU: 5.204, periodDays: 4332.6, rotationHours: 9.93, gravity: 24.79, tempMin: -145, tempMean: -110, tempMax: -108, pressureAtm: 1.0, moons: 95, datumLevel: '1.0 Bar Cloud Top (0 km Datum)', atmosphere: ['H₂ 89.8%', 'He 10.2%', 'CH₄ 0.3%', 'NH₃ 0.026%'], layers: ['Аммиакийн дээд үүл (0.5 - 1.0 бар)', 'Аммонийн гидросульфид (1.5 - 2.5 бар)', 'Усны үүл (3 - 7 бар)', 'Шингэн металл устөрөгч (200 ГПа)', 'Хүнд элементүүдийн цөм'], habitability: { score: 0 } },
    saturn: { name: 'Санчир', en: 'Saturn', color: '#e3d9b8', radiusKm: 58232, distanceAU: 9.583, periodDays: 10759, rotationHours: 10.66, gravity: 10.44, tempMin: -178, tempMean: -139, tempMax: -130, pressureAtm: 1.0, moons: 146, datumLevel: '1.0 Bar Cloud Top (0 km Datum)', atmosphere: ['H₂ 96.3%', 'He 3.25%', 'CH₄ 0.45%', 'NH₃ 0.02%'], layers: ['Аммиакийн мөсөн үүл (0.5 - 1.5 бар)', 'Аммонийн гидросульфид (2.5 - 4 бар)', 'Усны үүл (10 - 20 бар)', 'Шингэн молекулт устөрөгч', 'Металл устөрөгч', 'Чулуу-төмөр цөм'], habitability: { score: 0 } },
    uranus: { name: 'Тэнгэрийн ван', en: 'Uranus', color: '#9fe3e8', radiusKm: 25362, distanceAU: 19.191, periodDays: 30687, rotationHours: -17.24, gravity: 8.87, tempMin: -224, tempMean: -195, tempMax: -190, pressureAtm: 1.0, moons: 28, datumLevel: '1.0 Bar Methane Cloud (0 km Datum)', atmosphere: ['H₂ 82.5%', 'He 15.2%', 'CH₄ 2.3%'], layers: ['Метаны мананцар үүл', 'Ус-аммиакийн шингэн манти', 'Чулуулаг цөм'], habitability: { score: 0 } },
    neptune: { name: 'Далайн ван', en: 'Neptune', color: '#4f7fe0', radiusKm: 24622, distanceAU: 30.07, periodDays: 60190, rotationHours: 16.11, gravity: 11.15, tempMin: -218, tempMean: -201, tempMax: -195, pressureAtm: 1.0, moons: 16, datumLevel: '1.0 Bar Methane Cloud (0 km Datum)', atmosphere: ['H₂ 80.0%', 'He 19.0%', 'CH₄ 1.5%'], layers: ['Дээд метаны циррус үүл', 'Хэт халуун ус-аммиакийн манти', 'Чулуулаг цөм'], habitability: { score: 0 } },
    europa: { name: 'Европа', en: 'Europa', color: '#c5d8ea', radiusKm: 1560.8, distanceAU: 5.204, periodDays: 3.55, rotationHours: 85.2, gravity: 1.315, tempMin: -220, tempMean: -171, tempMax: -148, pressureAtm: 1e-12, moons: 0, atmosphere: ['O₂ trace'], layers: ['Мөсөн царцдас', 'Гүний далай', 'Силикат манти', 'Төмөр цөм'], habitability: { score: 68 } },
    titan: { name: 'Титан', en: 'Titan', color: '#f59e0b', radiusKm: 2574.7, distanceAU: 9.583, periodDays: 15.95, rotationHours: 382.7, gravity: 1.352, tempMin: -182, tempMean: -179, tempMax: -175, pressureAtm: 1.47, moons: 0, atmosphere: ['N₂ 95%', 'CH₄ 4.9%', 'H₂ 0.1%'], layers: ['Органик мананцар', 'Мөсөн царцдас', 'Гүний ус-аммиак далай', 'Өндөр даралтын мөс'], habitability: { score: 62 } },
    enceladus: { name: 'Энцелад', en: 'Enceladus', color: '#f1f5f9', radiusKm: 252.1, distanceAU: 9.583, periodDays: 1.37, rotationHours: 32.9, gravity: 0.113, tempMin: -240, tempMean: -198, tempMax: -116, pressureAtm: 1e-13, moons: 0, atmosphere: ['H₂O geyser plume', 'N₂', 'CO₂', 'CH₄'], layers: ['Цэвэр цасан мөсөн бүрхүүл', 'Гүний шүлтлэг далай', 'Сүвэрхэг чулуурхаг цөм'], habitability: { score: 74 } }
  };

  function basePlanet(key) {
    if (typeof PLANETS_DATA !== 'undefined' && PLANETS_DATA && PLANETS_DATA[key]) return PLANETS_DATA[key];
    return FALLBACK[key] || FALLBACK.earth;
  }

  function getPlanet(key) {
    var k = META[key] ? key : 'earth';
    var base = basePlanet(k);
    var meta = META[k];
    var out = {};
    for (var prop in base) if (Object.prototype.hasOwnProperty.call(base, prop)) out[prop] = base[prop];
    for (var m in meta) if (Object.prototype.hasOwnProperty.call(meta, m)) out[m] = meta[m];
    out.key = k;
    out.habitabilityScore = (base.habitability && typeof base.habitability.score === 'number') ? base.habitability.score : 0;
    return out;
  }

  function getSolarPlanets() {
    return SOLAR_ORDER.map(getPlanet);
  }

  /* ---------------------------------------------------------------------
     3. Habitability model (clearly a model estimate, not a measurement)
     --------------------------------------------------------------------- */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function habitabilityComponents(p) {
    var temp = clamp(100 - Math.abs(p.tempMean - 15) * 1.1, 0, 100);
    var pressure = clamp(100 * Math.exp(-Math.abs(Math.log10(Math.max(p.pressureAtm || 1e-12, 1e-12))) * 0.75), 0, 100);
    var gravity = clamp(100 * Math.exp(-Math.abs(p.gravity - 9.81) / 7.5), 0, 100);
    var water = clamp(p.waterScore, 0, 100);
    var radiation = clamp(p.radiationScore, 0, 100);
    var total = Math.round(0.35 * temp + 0.20 * pressure + 0.15 * gravity + 0.20 * water + 0.10 * radiation);
    return { temp: Math.round(temp), pressure: Math.round(pressure), gravity: Math.round(gravity), water: Math.round(water), radiation: Math.round(radiation), total: total };
  }

  /* ---------------------------------------------------------------------
     4. Research missions
     --------------------------------------------------------------------- */
  function makeMissions(p) {
    var atmoFirst = p.type === 'gas';
    return [
      { id: 'scan2', text: atmoFirst ? '2 үүлэн давхаргын цэг сканнердах' : '2 геологийн цэг сканнердах', need: 2 },
      { id: 'atmo', text: 'Агаар мандлын дээж авах', need: 1 },
      { id: 'measure', text: 'Таталцал ба температурыг хэмжих', need: 2 },
      { id: 'hab', text: 'Амьдрах орчны үнэлгээ гаргах', need: 1 }
    ];
  }

  /* ---------------------------------------------------------------------
     5. Sandbox equipment catalog
     --------------------------------------------------------------------- */
  var MODULES = [
    { id: 'habitat', name: 'Habitat Dome', short: 'HAB', cost: 120, mass: 8, power: -4, water: -1, oxygen: 4, food: 0, research: 0, heat: 1, crew: 4, color: 0x38bdf8, desc: '4 хүний багийн орон сууц. Хүчилтөрөгч, эрчим хүч шаардна.' },
    { id: 'solar', name: 'Solar Array', short: 'SOL', cost: 80, mass: 3, power: 9, water: 0, oxygen: 0, food: 0, research: 0, heat: 0, crew: 0, color: 0xfbbf24, desc: 'Нарны зайнаас хамаарсан эрчим хүч. Гариг холдох тусам үр ашиг буурна.' },
    { id: 'rtg', name: 'RTG Generator', short: 'RTG', cost: 150, mass: 6, power: 6, water: 0, oxygen: 0, food: 0, research: 0, heat: 2, crew: 0, scale: 1, color: 0xf97316, desc: 'Радиоизотопын термоэлектрик генератор. Тогтмол эрчим хүч, нэмэлт дулаан.' },
    { id: 'greenhouse', name: 'Greenhouse', short: 'GRN', cost: 100, mass: 5, power: -3, water: -2, oxygen: 2, food: 4, research: 0, heat: 1, crew: 0, color: 0x4ade80, desc: 'Хүнс, хүчилтөрөгч үйлдвэрлэнэ. Хэт хүйтэн/халуунд үр ашиггүй.' },
    { id: 'extractor', name: 'Water Extractor', short: 'H₂O', cost: 90, mass: 4, power: -5, water: 6, oxygen: 0, food: 0, research: 0, heat: 0, crew: 0, color: 0x60a5fa, desc: 'Мөсөн нөөцөөс ус гаргана. Мөс ихсэх тусам үр ашигтай.' },
    { id: 'drill', name: 'Thermal Drill', short: 'DRL', cost: 110, mass: 6, power: -6, water: 0, oxygen: 0, food: 0, research: 2, minerals: 3, heat: 3, crew: 0, color: 0xef4444, desc: 'Эрдэс дээж өрөмдөнө. Дулаан ялгаруулна.' },
    { id: 'processor', name: 'Atmosphere Processor', short: 'ATM', cost: 160, mass: 7, power: -8, water: 0, oxygen: 3, food: 0, research: 0, heat: 1, crew: 0, color: 0xa78bfa, desc: 'CO₂-г хувааж хүчилтөрөгч үйлдвэрлэнэ. Даралтыг бага зэрэг нэмэгдүүлнэ.' },
    { id: 'lab', name: 'Science Lab', short: 'LAB', cost: 130, mass: 5, power: -4, water: 0, oxygen: 0, food: 0, research: 5, heat: 0, crew: 0, color: 0x22d3ee, desc: 'Судалгааны оноо үйлдвэрлэнэ. Энергийн хомсдолд зогсоно.' }
  ];

  /* ---------------------------------------------------------------------
     6. Educational lab links
     --------------------------------------------------------------------- */
  var LAB_LINKS = {
    physics: {
      key: 'physics', name: 'Physics Lab', selector: '.cell.physics .card',
      focus: 'Таталцал, даралт, чөлөөт уналт, орбит',
      fallbackFormula: 'F = G·m₁m₂ / r²',
      question: 'Энэ гаригийн таталцал, зугтах хурд, агаар мандлын даралт хоорондоо хэрхэн холбоотой вэ?'
    },
    engineering: {
      key: 'engineering', name: 'Engineering Lab', selector: '#engineeringCard',
      focus: 'Бүтэц, эрчим хүч, терморегуляц',
      fallbackFormula: 'P = V·I,  σ = F / A',
      question: 'Бага таталцалтай гариг дээр колони станцын бүтцийг хэрхэн зохион байгуулах вэ?'
    },
    computer: {
      key: 'computer', name: 'Computer Lab', selector: '#computerCard',
      focus: 'Симуляц, алгоритм, автомат удирдлага',
      fallbackFormula: 'O(1) < O(log n) < O(n) < O(n log n)',
      question: 'Гаригийн судалгааны автомат системд ямар алгоритм, мэдээллийн бүтэц тохиромжтой вэ?'
    },
    space: {
      key: 'space', name: 'Space Scanner', selector: null, focus: 'Орбит, гаригийн шинж чанар',
      fallbackFormula: 'T² / a³ = 4π² / (G(M+m))',
      question: 'Нарны аймгийн гаригуудын тойрог зам, хурд, гаригийн бүтцийн ялгааг тайлбарла.'
    },
    ai: {
      key: 'ai', name: 'AI Lab', selector: '#aiLabCard',
      focus: 'Загвар, таамаглал, өгөгдлийн дүн шинжилгээ',
      fallbackFormula: 'ESI = Π (1 − |(x−x₀)/(x+x₀)|)^(w/n)',
      question: 'Гаригийн амьдрах орчны үнэлгээг AI загвараар хийхэд ямар өгөгдөл, арга ашиглах вэ?'
    }
  };

  function getLabFormulas(key) {
    try {
      if (typeof SCIENCE_KNOWLEDGE !== 'undefined' && SCIENCE_KNOWLEDGE && SCIENCE_KNOWLEDGE[key] && SCIENCE_KNOWLEDGE[key].formulas) {
        return SCIENCE_KNOWLEDGE[key].formulas.slice(0, 2);
      }
    } catch (e) { /* keep fallback */ }
    return [LAB_LINKS[key] ? LAB_LINKS[key].fallbackFormula : ''];
  }

  /* ---------------------------------------------------------------------
     7. Formatting helpers shared by every module
     --------------------------------------------------------------------- */
  function fmt(n, digits) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    var d = typeof digits === 'number' ? digits : 2;
    return n.toFixed(d).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }

  function pressureLabel(atm) {
    if (atm >= 1) return fmt(atm, 2) + ' атм';
    if (atm >= 0.001) return fmt(atm * 1000, 2) + ' мТорр (×10⁻³ атм)';
    return atm.toExponential(1) + ' атм';
  }

  SU.data = {
    META: META,
    SOLAR_ORDER: SOLAR_ORDER,
    ALL_KEYS: ALL_KEYS,
    LANDING_DESTINATIONS: LANDING_DESTINATIONS,
    DEFAULT_EXPLORATION_KEY: DEFAULT_EXPLORATION_KEY,
    MODULES: MODULES,
    LAB_LINKS: LAB_LINKS,
    getPlanet: getPlanet,
    getSolarPlanets: getSolarPlanets,
    habitabilityComponents: habitabilityComponents,
    makeMissions: makeMissions,
    getLabFormulas: getLabFormulas,
    fmt: fmt,
    pressureLabel: pressureLabel,
    clamp: clamp
  };
})();
