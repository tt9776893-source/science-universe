import { PLANET_WORLD_CONFIGS } from '../world/PlanetEnvironment.js';
import { LifeEngine } from '../life/LifeEngine.js';
import { CivilizationEngine } from '../life/CivilizationEngine.js';

export const SCIENCE_LABS = [
  {
    id: 'physics',
    name: 'Физик лаборатори',
    field: 'Үүсэл, хүч болон motion шат',
    model: 'SU_Lab_Spectrometer.glb',
    questions: [
      { prompt: 'Мартаас илүү их цогцлох эерэг хүний төлөв юугаа боломжтой вэ?', choices: ['Мартын хүчтэй баagsan', 'Март хүчтэй биш', 'Хүний массаа лүүсэн'], answer: 0, explanation: 'Мартын дэлгэрэнгүй хүчтэй 3.71 m/s2, Earth дээр 9.81 m/s2.' },
      { prompt: 'Хоосон оранд ямар нэгэн объект илүү хурдан насна уу?', choices: ['Ирээдүг эерэг', 'Ирээдүг багатай', 'Бүгдээрээ тэнцүү хурдтай'], answer: 2, explanation: 'Хоосон оранд бүх объект тэнцүү хурдтай насна.' },
      { prompt: 'Хурд 2 аргуудаа нэмэгдвэл kinetic energy хэрхэн өөрчлөгдөж байна вэ?', choices: ['2- argumentos', '4- argumentos', 'Цөнгөрөөгүй'], answer: 1, explanation: 'Kinetic energy = 1/2 mv2, хурдын квадрарт пропорционал.' }
    ]
  },
  {
    id: 'engineering',
    name: 'Инженерийн лаборатори',
    field: 'КомODOстроительство, модуль, энергийн системиууд',
    model: 'SU_Lab_Experiment_Chamber.glb',
    questions: [
      { prompt: 'Airlock-ийн үндэн зориулга юу вэ?', choices: ['Багтаammt орц нөөц хадгалах', 'Роверын хурд нэмэх', 'Нарны хурд өргөн болгох'], answer: 0, explanation: 'Airlock багтаammt орц нөөц бус орохонд илерчлэвэл хадгалах зориулгомтой.' },
      { prompt: 'Solar panel-үүд Garang чиглэлээс илүү их энергийг шилдэгчэлээ уу?', choices: ['Тийм ээ', 'ДAGALAA khurhdand bichigdsen', 'Дөрөвлөгөө өөрчлөгдөж'], answer: 0, explanation: 'Panel-үүд Garang чиглэлээс илүү их энергийн үүслээд хAREX болно.' },
      { prompt: 'Ямар шимтэгэл нарийн ажиллуулж болно вэ?', choices: ['Трамбуулсан', 'Дэлгэрэнгүй цирк', 'Зогсооsenal шавь'], answer: 0, explanation: 'Трамбуулсан шимтэгэлыг khangal zoriuldad bichigdsen байна.' }
    ]
  },
  {
    id: 'chemistry',
    name: 'Химийн лаборатори',
    field: 'Элемэнт, угфалзүй, хAREX үйл явц',
    model: 'SU_Lab_Chemical_Reactor.glb',
    questions: [
      { prompt: 'Water-ыг chemical formula юу гэж бичигдэнэ вэ?', choices: ['CO2', 'H2O', 'O2'], answer: 1, explanation: 'Нэг water molecule-рд ерөнхийлөө 2 hydrogen, 1 oxygen бие болно.' },
      { prompt: 'Water-ыг хAREX болгоход ямар гас гардаг вэ?', choices: ['Hydrogen болон oxygen гас', 'Carbon болон nitrogen', 'Iron болон sulfur'], answer: 0, explanation: 'Electrical energy-рд water-ыг hydrogen болон oxygen гастаа хAREX болгодог.' },
      { prompt: 'pH 3 токiotорын өнцөгт юугээр бичигдэнэ вэ?', choices: ['Acidic', 'Neutral', 'Basic'], answer: 0, explanation: '7-аас бага бол acidic, 7 neutral, 7-аас их бол basic.' }
    ]
  },
  {
    id: 'biology',
    name: 'Биологийн лаборатори',
    field: 'Амьцгаgal, organic molecule, эcosystem',
    model: 'SU_Lab_Bioreactor.glb',
    questions: [
      { prompt: 'Маш их амьцгаgal-д ямаар чэрээ шаардлагатай вэ?', choices: ['Цэцэрлэг цэцэрлэг, organic molecule, энергийн дэвсгээр', 'Лишь Garang', 'Лишь хAREX'], answer: 0, explanation: 'Mash амьцгаgalд цэцэрлэг цэцэрлэг, organic molecule болон нээлттэй энергийхэрэг.' },
      { prompt: 'Greenhouse-г эcosystem гэж зэрэгцээч үзэхийг зэрэгцээч байна уу?', choices: ['Өмнөх өмнөх бус өмнөх', 'Plant-ууд цэцэрлэггүй', 'Oxygen өгсөн боломжгүй'], answer: 0, explanation: 'Цэцэрлэг, organic, Garang, CO2, oxygen zorig tai.' },
      { prompt: 'Sample амьцгаgal боломжтой бол эхний үе шат юу вэ?', choices: ['Тодорхойлолт, хAREX controllers', 'Илжийн дэлгэрэнгүй бүлэгтэй болгож', 'Контролыг Delete болгох'], answer: 0, explanation: 'Контрол болон загварлалтыг ашигласнаар амьцгаgal шаттай болно.' }
    ]
  },
  {
    id: 'cell-biology',
    name: 'Цэлийн лаборатори',
    field: 'Цэл, цэлийн сэлвэр, органел',
    model: 'SU_Lab_Bioreactor.glb',
    questions: [
      { prompt: 'Ямар бүтээгдэл бүх цэлд ундаа байна вэ?', choices: ['Цэлийн сэлвэр', 'Нүклеус', 'Митохондрий'], answer: 0, explanation: 'Бүх цэл цэлийн сэлвэрт хилсэн.' },
      { prompt: 'Нүклеус-р ямар үйл ажиллагаа хAREX байна вэ?', choices: ['ДНК genetic instruc', 'ATP', 'Протеин'], answer: 0, explanation: 'Нүклеус-р ДНК genetic instruc хадгалагдаж байна.' },
      { prompt: 'Ямар органел энергийн үйл ажиллагааг хAREX байна вэ?', choices: ['Митохондрий', 'Рибосом', 'Лизиосом'], answer: 0, explanation: 'Митохондрий-р organic-ээс энергийн үүслээд хAREX болно.' }
    ]
  },
  {
    id: 'genetics',
    name: 'Генетикийн лаборатори',
    field: 'ДНК, gen, хAREX урлаг',
    model: 'SU_Lab_Analysis_Computer.glb',
    questions: [
      { prompt: 'Ямар объект protein-ыг бүтээх instructions-ыг хадгалах вэ?', choices: ['ДНК', 'ATP', 'Glucose'], answer: 0, explanation: 'ДНК-р хAREK обつлагыг хадгална.' },
      { prompt: 'Gen best described as:', choices: ['Дэнд зориулсан gen', 'Протеин', 'Сахар'], answer: 0, explanation: 'Gen = Дэнд зориулсан gen.' },
      { prompt: 'Генетикийн өөрчлөлт population-д маш чухал юугаа央?', choices: ['Natural selection-д өмнөх', 'Мутацияуудыг устгах', 'Ижил offspring-г буулгах'], answer: 0, explanation: 'Өөрчлөлт population-т өөрчлөгдөж хAREX боломжтой болгодог.' }
    ]
  },
  {
    id: 'ecosystems',
    name: 'Эcosystem лаборатори',
    field: 'Энергийн хAREX, food web, nutrient cycling',
    model: 'SU_Lab_Experiment_Chamber.glb',
    questions: [
      { prompt: 'Food chain-д энергийг хAREX:', choices: ['Производ士д consumer-д', 'Consumer-д production-д', 'Soil direct air-д'], answer: 0, explanation: 'Энергийг production-ээс consumer-р дагах.' },
      { prompt: 'Дээдэл түүхэн чinii role юу вэ?', choices: ['Нүүрэлт цэцэрлэгч', 'Оxygen бүтээх', 'Heat бүтээх'], answer: 0, explanation: 'Дээдэл үүсэлтүүд цэцэрлэгч байна.' },
      { prompt: 'Ямар нь biotic influence вэ?', choices: ['Хокьо business', 'Гарын usug', 'Цэцэрлэгийн usug'], answer: 0, explanation: 'Biotic influence = хAREX амьцгаgal.' }
    ]
  },
  {
    id: 'origin-of-life',
    name: 'Өсвөр эхэллэгийн лаборатори',
    field: 'Абиогенез, предбиотик хAREK',
    model: 'SU_Lab_Chemical_Reactor.glb',
    questions: [
      { prompt: 'Абиогенез = өсвөр өмнөх хAREK боломжтой вэ?', choices: ['Химийн үйл явц', 'ХAREX төрлөөсөө болсон', 'Далбай бурханы үйл'], answer: 0, explanation: 'Абиогенез = өсвөр өмнөх химийн үйл явц.' },
      { prompt: 'Ямар орц үе шат өсвөрийн хAREK боломжтой вэ?', choices: ['ХAREX бассейны шат', 'Химийн шат', 'Цэргийн шат'], answer: 0, explanation: 'ХAREX бассейны шат өсвөрийн хAREK боломжтой.' },
      { prompt: 'Ямар molecule самбарт самбар өсвөрийн хAREK боломжтой вэ?', choices: ['РНК-like polymer', 'Целлюлоз', 'Хлорофил'], answer: 0, explanation: 'РНК-like polymer өсвөрийн хAREK боломжтой.' }
    ]
  },
  {
    id: 'life-experiment',
    name: 'Амьдрал үүсгэх туршилт',
    field: 'Протолзин, өсвөл хAREK, мемBRAIN хэлбэржилtee',
    model: 'SU_Lab_Bioreactor.glb',
    questions: [
      { prompt: 'Ямар нөхцөлд өсвөл үүсч болох вэ?', choices: ['Цэцэрлэг болон энергийн дэвсгэр', 'Лишь хAREX', 'Лишь цэг'], answer: 0, explanation: 'Өсвөлд цэцэрлэг болон энергийн дэвсгэр шаардлагатай.' },
      { prompt: 'МемBRAIN-ийн үүрэг юу вэ?', choices: ['Орцийн нөөц хадгалах', 'Энергийн д өргөн болгох', 'Temperature хасах'], answer: 0, explanation: 'Цэлийн сэлвэр орцийн нөөчт өөрчлөлтөөс хамгаална.' },
      { prompt: 'Ямар нь зААНУУД ШАТ үйл явц вэ?', choices: ['Протолиzinus хэлбэржилtee', 'Цэлүүд өмнөх байсан', 'Бүгд тодорхой'], answer: 0, explanation: 'ЗААНУУД ШАТ: протолиzinus хэлбэржилtee гэдэг бол хичээл, тодорхойлолт биш юм.' }
    ]
  },
  {
    id: 'astrobiology',
    name: 'Астроөсвөрийн лаборатори',
    field: 'Экстремофил, biosignature, өсвөр шINELEH',
    model: 'SU_Lab_Spectrometer.glb',
    questions: [
      { prompt: 'Экстремофил = өсвөрийн хAREK', choices: ['Тепфил usug', 'Carnivore', 'ХAREX'], answer: 0, explanation: 'Экстремофил = өсвөрийн хAREK.' },
      { prompt: 'Biosignature = өсвөрийн хAREK', choices: ['Химийн албаны signal', 'Цэнэглэлийнүүл', 'Минерал'], answer: 0, explanation: 'Biosignature = өсвөрийн хAREК.' },
      { prompt: 'Ямар нь biosignature proof-ыг сэргээнэ уу?', choices: ['ХAREK бус өмнөх', 'Proof', 'Detectable'], answer: 0, explanation: 'Бүх biosignature proof-ыг сэргээнэгүй.' }
    ]
  },
  {
    id: 'mathematics',
    name: 'Математик лаборатори',
    field: 'ХAREX, ratio, mission calculations',
    model: 'SU_Lab_Analysis_Computer.glb',
    questions: [
      { prompt: 'Ровер 4 m/s 3 секунд дээр хAREX?', choices: ['7 m', '12 m', '1.3 m'], answer: 1, explanation: 'ХAREX = 4 x 3 = 12.' },
      { prompt: '10 m талбай 2 m уулах ratio?', choices: ['1:5', '1:2', '5:1'], answer: 0, explanation: '2:10 = 1:5.' },
      { prompt: 'Батерей 80 charge-ыг 25% =?', choices: ['20', '25', '55'], answer: 0, explanation: '80-ын 25% = 20.' }
    ]
  },
  {
    id: 'ai',
    name: 'AI лаборатори',
    field: 'Training data, evaluation, responsible automation',
    model: 'SU_Lab_Analysis_Computer.glb',
    questions: [
      { prompt: 'AI хAREK training data-д зориуулсан?', choices: ['Training data', 'Rules', 'Экран'], answer: 0, explanation: 'AI training data-д зориуулсан.' },
      { prompt: 'Ямар нь AI evaluation-д хAREK вэ?', choices: ['Generalize', 'ХAREX', 'Устгах'], answer: 0, explanation: 'AI evaluation-д generalize хAREК.' },
      { prompt: 'Ямар нь AI training data-д хAREK вэ?', choices: ['Groups', 'Fair', 'Экран'], answer: 0, explanation: 'AI training data-д groups хAREК.' }
    ]
  },
  {
    id: 'computer',
    name: 'Компьютер лаборатори',
    field: 'Logic, data representation, reliable systems',
    model: 'SU_Lab_Analysis_Computer.glb',
    questions: [
      { prompt: '8 бит = хAREK?', choices: ['8', '128', '256'], answer: 2, explanation: '8 бит = 2^8 = 256.' },
      { prompt: 'Decimal 13 = binary?', choices: ['1011', '1101', '1110'], answer: 1, explanation: '1101 = 8 + 4 + 1 = 13.' },
      { prompt: 'Ямар нь mission data recovery-с зориулсан?', choices: ['Backups', 'One device', 'Disable checks'], answer: 0, explanation: 'Backups mission data recovery-д зориулсан.' }
    ]
  }
];

// Lab -> research field mapping: completing a lab advances civilization research in linked fields.
const LAB_RESEARCH_FIELDS = {
  physics: ['energy', 'materials', 'electronics'],
  engineering: ['mechanical', 'transportation', 'spacecraft'],
  chemistry: ['materials', 'energy'],
  biology: ['materials', 'energy'],
  mathematics: ['computing', 'electronics'],
  ai: ['computing', 'ai'],
  computer: ['computing', 'electronics', 'communication']
};

const emptyProgress = () => ({
  version: 1,
  xp: 0,
  answers: {},
  completedLabs: [],
  fieldSamples: 0,
  hasReachedOrbit: false,
  hasLaunchedRocket: false,
  planetVisits: [],
  visitedLocations: [],
  probedPlanets: [],
  probeReports: {},
  researchActions: [],
  greenhouseStages: {},
  outpostResources: {},
  outpostSystems: {},
  lifeCreation: {
    unlocked: false,
    simulation: {
      water: 35, temperature: 18, energy: 20, minerals: 25, organic: 12,
      biomass: 0, generation: 0, status: 'sterile', log: []
    },
    simulationRunning: false,
    simulationElapsed: 0
  },
  lifeEngine: {
    unlocked: false,
    id: 'research-chamber-1',
    label: 'Биологийн лаборатори',
    running: false,
    speed: 1,
    mode: 'single',
    maxOrganisms: 400,
    sessionTime: 0,
    environment: { planetId: 'mars', temperature: 20, water: 50, energy: 50, minerals: 50, radiation: 0, gravity: 1, pressure: 1, oxygen: 0, toxins: 0, maxPopulation: 400, available: 100 },
    population: { count: 0, stats: { births: 0, deaths: 0, extinctions: 0, maxPopulation: 0, avgGeneration: 0, dominantLineage: null, totalMutations: 0 }, avgGeneration: 0, avgEnergy: 0, avgSize: 0, avgMembrane: 0, avgMetabolism: 0 },
    ecosystem: null,
    history: [],
    notice: 'ЗААНУУД ШАТ — буюу хичээл, боломжтой тодорхойлолт'
  },
  lifeExperiments: {
    history: [],
    byPlanet: {}
  },
  civilization: {
    unlocked: false,
    running: false,
    speed: 1,
    sessionTime: 0,
    state: null
  }
});

export class ScienceAcademy {
  constructor(getSlotId, storage = globalThis.localStorage) {
    this.getSlotId = getSlotId;
    this.storage = storage;
    this.lifeEngine = null;
    this.civilizationEngine = null;
  }

  _storageKey() {
    const slotId = this.getSlotId?.() || 'slot_1';
    return `SU_SCIENCE_ACADEMY_V1_${slotId}`;
  }

  getState() {
    try {
      const saved = JSON.parse(this.storage?.getItem(this._storageKey()) || 'null');
      if (!saved || saved.version !== 1) return emptyProgress();
      return {
        ...emptyProgress(),
        ...saved,
        answers: saved.answers && typeof saved.answers === 'object' ? saved.answers : {},
        completedLabs: Array.isArray(saved.completedLabs) ? saved.completedLabs : [],
        planetVisits: Array.isArray(saved.planetVisits) ? saved.planetVisits : [],
        visitedLocations: Array.isArray(saved.visitedLocations) ? saved.visitedLocations : [],
        probedPlanets: Array.isArray(saved.probedPlanets) ? saved.probedPlanets : [],
        probeReports: saved.probeReports && typeof saved.probeReports === 'object' ? saved.probeReports : {},
        researchActions: Array.isArray(saved.researchActions) ? saved.researchActions : [],
        greenhouseStages: saved.greenhouseStages && typeof saved.greenhouseStages === 'object' ? saved.greenhouseStages : {},
        outpostResources: saved.outpostResources && typeof saved.outpostResources === 'object' ? saved.outpostResources : {},
        outpostSystems: saved.outpostSystems && typeof saved.outpostSystems === 'object' ? saved.outpostSystems : {},
        lifeCreation: saved.lifeCreation && typeof saved.lifeCreation === 'object' ? saved.lifeCreation : emptyProgress().lifeCreation,
        lifeEngine: saved.lifeEngine && typeof saved.lifeEngine === 'object' ? saved.lifeEngine : emptyProgress().lifeEngine,
        lifeExperiments: saved.lifeExperiments && typeof saved.lifeExperiments === 'object' ? saved.lifeExperiments : emptyProgress().lifeExperiments,
        civilization: saved.civilization && typeof saved.civilization === 'object' ? saved.civilization : emptyProgress().civilization
      };
    } catch (error) {
      return emptyProgress();
    }
  }

  _save(state) {
    try {
      this.storage?.setItem(this._storageKey(), JSON.stringify(state));
    } catch (error) {
      console.warn('[ScienceAcademy] Could not save learning progress:', error);
    }
    return state;
  }

  setLifeEngine(engine) {
    this.lifeEngine = engine;
  }

  getLifeEngineState() {
    if (!this.lifeEngine) return null;
    return this.lifeEngine.getState();
  }

  setLifeEngineState(state) {
    if (!this.lifeEngine) return null;
    return this.lifeEngine.setState(state);
  }

  isLifeEngineUnlocked() {
    const state = this.getState();
    return state.lifeEngine?.unlocked === true && this.isLifeCreationUnlocked();
  }

  updateLifeEngineUnlock() {
    const state = this.getState();
    const shouldUnlock = this.isLifeCreationUnlocked();
    if (state.lifeEngine.unlocked !== shouldUnlock) {
      state.lifeEngine.unlocked = shouldUnlock;
      this._save(state);
    }
    return state.lifeEngine.unlocked;
  }

  isCivilizationUnlocked() {
    const state = this.getState();
    // Civilization unlocks after life creation is unlocked AND an intelligent population exists.
    if (!this.isLifeCreationUnlocked()) return false;
    try {
      const engine = this.getOrCreateLifeEngine();
      const engState = engine.getState();
      return engState.population?.count > 0;
    } catch (e) {
      return false;
    }
  }

  getLab(labId) {
    return SCIENCE_LABS.find((lab) => lab.id === labId) || null;
  }

  answerQuestion(labId, questionIndex, choiceIndex) {
    const lab = this.getLab(labId);
    const question = lab?.questions[questionIndex];
    if (!question || !Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= question.choices.length) {
      return { valid: false, correct: false, completed: false, xpAwarded: 0 };
    }

    const state = this.getState();
    const answerKey = `${labId}:${questionIndex}`;
    const priorAnswer = state.answers[answerKey];
    if (priorAnswer?.correct) {
      return {
        valid: true,
        correct: true,
        completed: state.completedLabs.includes(labId),
        xpAwarded: 0,
        explanation: question.explanation,
        alreadyAnswered: true
      };
    }

    const correct = choiceIndex === question.answer;
    state.answers[answerKey] = { choiceIndex, correct };
    const xpAwarded = correct && !priorAnswer?.correct ? 25 : 0;
    state.xp += xpAwarded;

    const labAnswers = lab.questions.map((_, index) => state.answers[`${labId}:${index}`]).filter(Boolean);
    const correctCount = labAnswers.filter((answer) => answer.correct).length;
    const completed = labAnswers.length === lab.questions.length && correctCount >= 2;
    if (completed && !state.completedLabs.includes(labId)) state.completedLabs.push(labId);
    this._save(state);
    this.updateLifeEngineUnlock();

    // Step 13: Completing a lab advances civilization research in linked fields.
    if (completed) {
      this.boostCivilizationResearch(labId);
    }

    return { valid: true, correct, completed, xpAwarded, explanation: question.explanation, alreadyAnswered: false };
  }

  recordFieldSample() {
    const state = this.getState();
    state.fieldSamples += 1;
    this._save(state);
  }

  recordOrbitVisit() {
    const state = this.getState();
    state.hasReachedOrbit = true;
    this._save(state);
  }

  recordRocketLaunch() {
    const state = this.getState();
    state.hasLaunchedRocket = true;
    this._save(state);
  }

  recordPlanetLanding(planetId) {
    const state = this.getState();
    if (!PLANET_WORLD_CONFIGS[planetId] || state.planetVisits.includes(planetId)) return false;
    state.planetVisits.push(planetId);
    state.xp += 25;
    this._save(state);
    return true;
  }

  recordPlanetLocation(planetId, locationId) {
    const locationKey = `${planetId}:${locationId}`;
    const state = this.getState();
    if (state.visitedLocations.includes(locationKey)) return false;
    state.visitedLocations.push(locationKey);
    state.xp += 15;
    this._save(state);
    return true;
  }

  recordAtmosphericProbe(planetId, samples) {
    const state = this.getState();
    if (!['jupiter', 'saturn', 'uranus', 'neptune'].includes(planetId) || state.probedPlanets.includes(planetId)) return false;
    state.probedPlanets.push(planetId);
    state.probeReports[planetId] = Array.isArray(samples) ? samples : [];
    state.xp += 50;
    this._save(state);
    return true;
  }

  recordResearchAction(actionId) {
    if (typeof actionId !== 'string' || !actionId.trim()) return false;
    const state = this.getState();
    if (state.researchActions.includes(actionId)) return false;
    state.researchActions.push(actionId);
    state.xp += 15;
    this._save(state);
    return true;
  }

  advanceGreenhouse(siteId) {
    const state = this.getState();
    const currentStage = Math.max(0, Math.min(3, Number(state.greenhouseStages[siteId]) || 0));
    if (currentStage >= 3) return { stage: currentStage, advanced: false };
    const stage = currentStage + 1;
    state.greenhouseStages[siteId] = stage;
    state.xp += 10;
    if (stage >= 2 && !state.researchActions.includes(`${siteId}:harvest`)) {
      state.researchActions.push(`${siteId}:harvest`);
    }
    this._save(state);
    return { stage, advanced: true };
  }

  getOutpostResources(planetId) {
    const defaults = { oxygen: 82, water: 74, energy: 91 };
    const stored = this.getState().outpostResources[planetId] || {};
    return Object.fromEntries(Object.keys(defaults).map((key) => [key, Math.max(0, Math.min(100, Number(stored[key] ?? defaults[key])))]));
  }

  serviceOutpost(planetId) {
    const state = this.getState();
    const defaults = { oxygen: 82, water: 74, energy: 91 };
    const current = state.outpostResources[planetId] || defaults;
    const updated = Object.fromEntries(Object.keys(defaults).map((key) => [key, Math.min(100, Math.max(0, Number(current[key] ?? defaults[key])) + 12)]));
    state.outpostResources[planetId] = updated;
    this._save(state);
    return updated;
  }

  simulateOutpostMinute(planetId, greenhouseStage = 0) {
    const state = this.getState();
    const defaults = { oxygen: 82, water: 74, energy: 91 };
    const current = state.outpostResources[planetId] || defaults;
    const updated = {
      oxygen: Math.max(0, Number(current.oxygen ?? defaults.oxygen) - 0.05 + greenhouseStage * 0.04),
      water: Math.max(0, Number(current.water ?? defaults.water) - 0.08),
      energy: Math.max(0, Number(current.energy ?? defaults.energy) - 0.12)
    };
    state.outpostResources[planetId] = updated;
    this._save(state);
    return updated;
  }

  getOutpostSystems(planetId) {
    const saved = this.getState().outpostSystems[planetId] || {};
    return { airlockState: saved.airlockState || 'SEALED' };
  }

  setOutpostAirlockState(planetId, airlockState) {
    const state = this.getState();
    const systems = state.outpostSystems[planetId] || {};
    state.outpostSystems[planetId] = { ...systems, airlockState };
    this._save(state);
  }

  // ---- Life Creation System (Origin of Life simulation) ----
  _ensureLifeCreation(state) {
    if (!state.lifeCreation || typeof state.lifeCreation !== 'object') {
      state.lifeCreation = emptyProgress().lifeCreation;
    }
    if (!state.lifeCreation.simulation || typeof state.lifeCreation.simulation !== 'object') {
      state.lifeCreation.simulation = emptyProgress().lifeCreation.simulation;
    }
    return state.lifeCreation;
  }

  getLifeCreationState() {
    const state = this.getState();
    return this._ensureLifeCreation(state);
  }

  isLifeCreationUnlocked() {
    const state = this.getState();
    const required = ['biology', 'cell-biology', 'genetics', 'ecosystems', 'origin-of-life'];
    return required.every((labId) => state.completedLabs.includes(labId));
  }

  updateLifeCreationUnlock() {
    const state = this.getState();
    this._ensureLifeCreation(state);
    const shouldUnlock = this.isLifeCreationUnlocked();
    if (state.lifeCreation.unlocked !== shouldUnlock) {
      state.lifeCreation.unlocked = shouldUnlock;
      this._save(state);
    }
    return state.lifeCreation.unlocked;
  }

  // ---- Life Engine instance management ----
  getOrCreateLifeEngine() {
    if (!this.lifeEngine) {
      const state = this.getState();
      const saved = state.lifeEngine || emptyProgress().lifeEngine;
      const engine = new LifeEngine({
        id: saved.id || 'research-chamber-1',
        label: saved.label || 'Биологийн лаборатори',
        seed: Date.now(),
        planetId: saved.environment?.planetId || 'mars'
      });
      if (saved.environment) engine.setPlanet(saved.environment.planetId, saved.environment);
      engine.setState(saved);
      this.lifeEngine = engine;
    }
    return this.lifeEngine;
  }

  stepLifeEngine(delta) {
    if (!this.lifeEngine) return null;
    const result = this.lifeEngine.step(delta);
    this.persistLifeEngineState();
    return result;
  }

  stepLifeEngineSilent(delta) {
    if (!this.lifeEngine) return null;
    return this.lifeEngine.step(delta);
  }

  persistLifeEngineState() {
    if (!this.lifeEngine) return;
    const state = this.getState();
    state.lifeEngine = this.lifeEngine.getState();
    this._save(state);
  }

  seedLifeOrganism(traits) {
    const engine = this.getOrCreateLifeEngine();
    const organism = engine.seedOrganism(traits);
    this.persistLifeEngineState();
    return organism;
  }

  resetLifeEngine() {
    const engine = this.getOrCreateLifeEngine();
    const result = engine.reset();
    this.persistLifeEngineState();
    return result;
  }

  // ---- Civilization Engine instance management ----
  getOrCreateCivilizationEngine() {
    if (!this.civilizationEngine) {
      const lifeEngine = this.getOrCreateLifeEngine();
      const state = this.getState();
      const saved = state.civilization || emptyProgress().civilization;
      const civ = new CivilizationEngine(lifeEngine);
      civ.setRunning(saved.running);
      civ.setSpeed(saved.speed);
      civ.sessionTime = saved.sessionTime || 0;
      if (saved.state) civ.setState(saved.state);
      this.civilizationEngine = civ;
    }
    return this.civilizationEngine;
  }

  stepCivilizationEngine(delta) {
    if (!this.civilizationEngine) return null;
    const result = this.civilizationEngine.step(delta);
    this.persistCivilizationEngineState();
    return result;
  }

  stepCivilizationEngineSilent(delta) {
    if (!this.civilizationEngine) return null;
    return this.civilizationEngine.step(delta);
  }

  persistCivilizationEngineState() {
    if (!this.civilizationEngine) return;
    const state = this.getState();
    state.civilization = {
      unlocked: state.civilization.unlocked,
      running: this.civilizationEngine.running,
      speed: this.civilizationEngine.speed,
      sessionTime: this.civilizationEngine.sessionTime,
      state: this.civilizationEngine.getState()
    };
    this._save(state);
  }

  setCivilizationRunning(running) {
    const civ = this.getOrCreateCivilizationEngine();
    civ.setRunning(running);
    this.persistCivilizationEngineState();
    return civ.running;
  }

  setCivilizationSpeed(speed) {
    const civ = this.getOrCreateCivilizationEngine();
    civ.setSpeed(speed);
    this.persistCivilizationEngineState();
    return civ.speed;
  }

  resetCivilizationEngine() {
    const civ = this.getOrCreateCivilizationEngine();
    // Reset by creating a fresh CivilizationEngine over the same life engine.
    const lifeEngine = this.getOrCreateLifeEngine();
    const fresh = new CivilizationEngine(lifeEngine);
    this.civilizationEngine = fresh;
    this.persistCivilizationEngineState();
    return fresh.getState();
  }

  // ---- Step 13: Lab-driven civilization research integration ----
  boostCivilizationResearch(labId) {
    const fields = LAB_RESEARCH_FIELDS[labId];
    if (!fields || !Array.isArray(fields)) return 0;
    const civ = this.getOrCreateCivilizationEngine();
    let total = 0;
    for (const field of fields) {
      total += civ.boostResearch(field, 15);
    }
    this.persistCivilizationEngineState();
    return total;
  }

  getCivilizationState() {
    const civ = this.civilizationEngine;
    if (!civ) return null;
    return civ.getState();
  }

  getResearchProgressByField() {
    const state = this.getCivilizationState();
    if (!state || !state.fieldProgress) return {};
    return state.fieldProgress;
  }

  setLifeCreationInput(inputName, value) {
    const state = this.getState();
    this._ensureLifeCreation(state);
    const sim = state.lifeCreation.simulation;
    const clamped = Math.max(0, Math.min(100, Number(value) || 0));
    if (inputName === 'water') sim.water = clamped;
    else if (inputName === 'temperature') sim.temperature = clamped;
    else if (inputName === 'energy') sim.energy = clamped;
    else if (inputName === 'minerals') sim.minerals = clamped;
    else if (inputName === 'organic') sim.organic = clamped;
    else return false;
    this._save(state);
    return true;
  }

  resetLifeSimulation() {
    const state = this.getState();
    this._ensureLifeCreation(state);
    state.lifeCreation.simulation = JSON.parse(JSON.stringify(emptyProgress().lifeCreation.simulation));
    state.lifeCreation.simulationRunning = false;
    state.lifeCreation.simulationElapsed = 0;
    this._save(state);
    return state.lifeCreation.simulation;
  }

  stepLifeSimulation(delta) {
    const state = this.getState();
    this._ensureLifeCreation(state);
    const sim = state.lifeCreation.simulation;
    const s = sim;

    const waterSuit = Math.min(1, s.water / 60);
    const tempSuit = 1 - Math.abs(s.temperature - 30) / 30;
    const energySuit = Math.min(1, s.energy / 50);
    const mineralSuit = Math.min(1, s.minerals / 50);
    const organicSuit = Math.min(1, s.organic / 40);
    const suitability = (waterSuit + tempSuit + energySuit + mineralSuit + organicSuit) / 5;

    const logEntry = (msg) => {
      s.log.push(msg);
      if (s.log.length > 12) s.log.shift();
    };

    if (s.biomass < 0.4) {
      const monomerGain = suitability * 0.6 * delta;
      s.organic = Math.min(100, s.organic + monomerGain * 0.8);
      s.biomass = Math.min(0.4, s.biomass + monomerGain * 0.2);
      if (s.generation === 0 && s.biomass >= 0.05) {
        s.generation = 1;
        logEntry('Organic polymers began accumulating.');
      }
      if (s.generation >= 1 && s.biomass >= 0.4) {
        s.generation = 2;
        logEntry('Protocell-like aggregates formed.');
      }
      s.status = s.generation >= 1 ? 'prebiotic' : 'sterile';
    } else {
      const consumption = suitability * 0.4 * delta;
      s.water = Math.max(0, s.water - consumption * 0.3);
      s.energy = Math.max(0, s.energy - consumption * 0.4);
      s.minerals = Math.max(0, s.minerals - consumption * 0.2);
      s.organic = Math.max(0, s.organic - consumption * 0.1);
      const growth = suitability * 0.8 * delta;
      s.biomass = Math.min(100, s.biomass + growth);
      if (s.biomass >= 25 && !s.log.includes('Population expansion underway.')) {
        logEntry('Population expansion underway.');
      }
      if (s.biomass >= 60 && !s.log.includes('Ecosystem-level organization detected.')) {
        logEntry('Ecosystem-level organization detected.');
      }
      s.status = s.biomass >= 60 ? 'ecosystem' : (s.biomass >= 25 ? 'colonizing' : 'growing');
    }

    s.simulationElapsed += delta;
    this._save(state);
    return sim;
  }

  // ---- Per-planet life experiment history ----
  recordLifeExperiment(planetId, labMode, conditions, result) {
    const state = this.getState();
    this._ensureLifeExperiments(state);
    const entry = {
      planetId,
      labMode,
      conditions: { ...conditions },
      result: { ...result },
      timestamp: Date.now()
    };
    state.lifeExperiments.history.push(entry);
    if (state.lifeExperiments.history.length > 200) state.lifeExperiments.history.shift();
    const byPlanet = state.lifeExperiments.byPlanet;
    if (!byPlanet[planetId]) {
      byPlanet[planetId] = { lastExperiment: null, totalExperiments: 0, bestResult: null };
    }
    byPlanet[planetId].totalExperiments += 1;
    byPlanet[planetId].lastExperiment = entry;
    this._save(state);
    return entry;
  }

  getLifeExperiments(planetId) {
    const state = this.getState();
    this._ensureLifeExperiments(state);
    return state.lifeExperiments.history.filter(e => e.planetId === planetId);
  }

  getLifeExperimentSummary() {
    const state = this.getState();
    this._ensureLifeExperiments(state);
    return { ...state.lifeExperiments.byPlanet };
  }

  _ensureLifeExperiments(state) {
    if (!state.lifeExperiments || typeof state.lifeExperiments !== 'object') {
      state.lifeExperiments = emptyProgress().lifeExperiments;
    }
    if (!state.lifeExperiments.history || !Array.isArray(state.lifeExperiments.history)) {
      state.lifeExperiments.history = [];
    }
    if (!state.lifeExperiments.byPlanet || typeof state.lifeExperiments.byPlanet !== 'object') {
      state.lifeExperiments.byPlanet = {};
    }
    return state.lifeExperiments;
  }

  getMissionObjectives() {
    const state = this.getState();
    const coreObjectives = [
      { id: 'lab', title: 'Complete a science lab assessment', complete: state.completedLabs.length > 0 },
      { id: 'sample', title: 'Collect a geological field sample', complete: state.fieldSamples > 0 },
      { id: 'orbit', title: 'Reach Mars orbit in Space Explorer', complete: state.hasReachedOrbit },
      { id: 'launch', title: 'Complete a surface rocket ascent', complete: state.hasLaunchedRocket }
    ];
    const planetaryObjectives = Object.values(PLANET_WORLD_CONFIGS).flatMap((world) => [
      {
        id: `land:${world.planetId}`,
        title: `Land on ${world.planetName}`,
        complete: state.planetVisits.includes(world.planetId)
      },
      ...(world.locations || []).map((location) => ({
        id: `location:${world.planetId}:${location.id}`,
        title: `${location.name}: ${location.mission}`,
        complete: state.visitedLocations.includes(`${world.planetId}:${location.id}`)
      }))
    ]);
    const probeObjectives = ['jupiter', 'saturn', 'uranus', 'neptune'].map((planetId) => ({
      id: `probe:${planetId}`,
      title: `Transmit ${planetId[0].toUpperCase()}${planetId.slice(1)} atmospheric probe data`,
      complete: state.probedPlanets.includes(planetId)
    }));
    const livingObjectives = [
      { id: 'research:mars-colony', title: 'Receive a Mars colony research assignment', complete: state.researchActions.includes('mars-colony-assignment') },
      { id: 'research:mars-rover', title: 'Calibrate the autonomous Mars rover', complete: state.researchActions.includes('mars-rover-calibration') },
      { id: 'research:mars-greenhouse', title: 'Grow and harvest a Mars greenhouse crop', complete: (state.greenhouseStages['mars-greenhouse'] || 0) >= 2 },
      { id: 'research:mars-life-support', title: 'Inspect Mars oxygen, water, and energy reserves', complete: state.researchActions.includes('mars-life-support-check') },
      { id: 'research:moon-outpost', title: 'Accept the lunar outpost traverse assignment', complete: state.researchActions.includes('moon-outpost-assignment') },
      { id: 'research:moon-rover', title: 'Survey a lunar resource site with the rover', complete: state.researchActions.includes('moon-rover-survey') },
      { id: 'research:moon-airlock', title: 'Cycle the lunar outpost airlock', complete: state.researchActions.includes('moon-airlock-cycle') },
      { id: 'research:earth-ecology', title: 'Complete an Earth ecosystem observation', complete: state.researchActions.includes('earth-ecosystem-observation') },
      { id: 'research:earth-water', title: 'Collect an Earth surface-water sample', complete: state.researchActions.includes('earth-water-sample') },
      { id: 'research:mercury-probe', title: 'Retrieve data from the Mercury thermal probe', complete: state.researchActions.includes('mercury-thermal-probe') },
      { id: 'research:venus-probe', title: 'Retrieve data from the Venus atmospheric probe', complete: state.researchActions.includes('venus-atmosphere-probe') },
      { id: 'research:hypothetical-life', title: 'Review the fictional hypothetical-life simulation', complete: state.researchActions.includes('hypothetical-life-simulation') },
      { id: 'research:life-unlock', title: 'Unlock the Origin of Life simulation', complete: state.lifeCreation?.unlocked === true },
      { id: 'research:life-protocell', title: 'Grow a protocell in the simulation', complete: (state.lifeCreation?.simulation?.generation || 0) >= 2 },
      { id: 'research:life-emergent', title: 'Reach emergent life-stage in the simulation', complete: (state.lifeCreation?.simulation?.generation || 0) >= 5 },
      { id: 'research:lifeengine-population', title: 'Establish a population in the Life Engine', complete: state.lifeEngine?.population?.count || 0 > 0 },
      { id: 'research:lifeengine-ecosystem', title: 'Build a stable ecosystem', complete: state.lifeEngine?.mode === 'ecosystem' && state.lifeEngine?.ecosystem?.collapseRisk < 0.5 },
      ...['mercury', 'venus', 'earth', 'moon', 'mars'].map((planetId) => ({
        id: `life:surface:${planetId}`,
        title: `Surface life experiment on ${planetId[0].toUpperCase()}${planetId.slice(1)}`,
        complete: state.lifeExperiments?.byPlanet?.[planetId]?.totalExperiments > 0
      })),
      ...['jupiter', 'saturn', 'uranus', 'neptune'].map((planetId) => ({
        id: `life:orbital:${planetId}`,
        title: `Orbital life experiment at ${planetId[0].toUpperCase()}${planetId.slice(1)}`,
        complete: state.lifeExperiments?.byPlanet?.[planetId]?.totalExperiments > 0
      })),
      {
        id: 'life:solar:sun',
        title: 'Solar observation life experiment at the Sun',
        complete: state.lifeExperiments?.byPlanet?.sun?.totalExperiments > 0
      }
    ];
    return coreObjectives.concat(planetaryObjectives, probeObjectives, livingObjectives);
  }
}
