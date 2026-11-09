// SCIENCE UNIVERSE — FRONTIER
// TutorialSystem — interactive Mongolian-language beginner guide
// 20-step first-time tutorial with real gameplay action detection.
// Guided / Sandbox mode switching. Persists via SaveSystem.

import { input } from '../core/InputManager.js';

const TUTORIAL_STORAGE_KEY = 'SU_TUTORIAL_V1';

const MODE_GUIDED = 'guided';
const MODE_SANDBOX = 'sandbox';

// 20-step tutorial sequence with Mongolian labels
const STEPS = [
  { id: 'move', label: { en: 'Learn Movement', mn: 'Хүртэлх хөдөлгөөнгө суралцаарай' }, hint: { en: 'Use WASD to walk and mouse to look around.', mn: 'WASD ашиглан хэсэгчлээ, Муусыг ашиглан 하руулна уу.' } },
  { id: 'inventory', label: { en: 'Open Inventory', mn: 'Нөөcciйн цэвэрлэлийг нээх' }, hint: { en: 'Press I to open your inventory and view carried items.', mn: 'I товчийг баَسана уу, нөөц цэвэрлэлийг нээх.' } },
  { id: 'equip_scanner', label: { en: 'Equip Scanner', mn: 'Сканерөд эхлүүлнэ' }, hint: { en: 'Select the PIXL Scanner from hotbar slot 6.', mn: 'Пиксел сканерогホтбарын 6-сlot-д танhalts.' } },
  { id: 'scan', label: { en: 'Scan Object', mn: 'Объектыг сканлоо' }, hint: { en: 'Left-click with the scanner equipped to scan nearby objects.', mn: 'Эрэгүүдээр самбарт эхлүүлэн зүүн товчийг дарж сканлоо.' } },
  { id: 'collect_sample', label: { en: 'Collect Sample', mn: 'Дээж цуглуулна' }, hint: { en: 'Equip the Cryo Sample Vacuum and collect regolith.', mn: 'Крюо дээж цуглуулагчийг анхаарлаар хэсэгчлээ.' } },
  { id: 'open_journal', label: { en: 'Open Research Journal', mn: 'Шинжлэх журнал нээх' }, hint: { en: 'Press J to open the Research Journal and review progress.', mn: 'J товчийг баСана уу, шинжлэх журналд нээнэ.' } },
  { id: 'review_results', label: { en: 'Review Scan Results', mn: 'Скан үр дүнг ш얼уулна' }, hint: { en: 'Open discovered items in the Research Journal.', mn: 'Шинэ шатанд руу явх үйлдлийг гүйцэтгэ.' } },
  { id: 'open_academy', label: { en: 'Open Science Academy', mn: 'Шинжлэх акاديمыг нээх' }, hint: { en: 'Open the Science Academy from the main menu.', mn: 'Шинжлэх академианд нээнэ.' } },
  { id: 'complete_experiment', label: { en: 'Complete Experiment', mn: 'Туршилтийг гүйцэтгэх' }, hint: { en: 'Answer a question correctly in any lab.', mn: 'Лабораторийн асуултод зөв хариулна уу.' } },
  { id: 'open_engineering', label: { en: 'Open Engineering Lab', mn: 'Инженерийн лаборатори нээх' }, hint: { en: 'Open the Engineering Lab in the Science Academy.', mn: 'Инженерийн лабораторийг нээнэ.' } },
  { id: 'assemble_sensor', label: { en: 'Assemble Sensor', mn: 'Сенсор үүсгэнэ' }, hint: { en: 'Select all components in the Invention System.', mn: 'Инвенторийн бүх хэсгүүдийг сонгоно уу.' } },
  { id: 'validate_device', label: { en: 'Validate Device', mn: 'Үлэглийг шалгах' }, hint: { en: 'Validate the assembled planetary environmental sensor.', mn: 'Орчин шинжлэх үлэглийг шалгана уу.' } },
  { id: 'test_sensor', label: { en: 'Test Sensor', mn: 'Сенсор turbo' }, hint: { en: 'Run the sensor test on the current planet.', mn: 'Одоогийн дэд боловсролд сенсор turbo.' } },
  { id: 'save_invention', label: { en: 'Save Invention', mn: 'Хүлэгт шилжүүлнэ' }, hint: { en: 'Save sensor readings to the Research Journal.', mn: 'Сенсор өгөгдлийг шинжлэх журнальд хадгална.' } },
  { id: 'open_biology', label: { en: 'Open Biology Lab', mn: 'Биологийн лаборатори нээх' }, hint: { en: 'Open the Biology Lab in the Science Academy.', mn: 'Биологийн лабораторийг нээнэ.' } },
  { id: 'life_creation', label: { en: 'Life Creation', mn: 'Амьдрал үүсгэх' }, hint: { en: 'Seed an organism in the Life Creation lab.', mn: 'Амьцгаgal цэвэршүүлэгчддээ түлхүүр өгсөн.' } },
  { id: 'visit_rocket', label: { en: 'Visit Rocket', mn: 'Рөвчтэй ярьж байна' }, hint: { en: 'Walk to the rocket launch pad.', mn: 'Рөвч дээрээ ярьж байна.' } },
  { id: 'board_rocket', label: { en: 'Board Rocket', mn: 'Рөвчтэй ирэх' }, hint: { en: 'Press E near the rocket to enter the cockpit.', mn: 'Rocket-д амраачлан E товчийг дарна.' } },
  { id: 'save_progress', label: { en: 'Save Progress', mn: 'Нёмрэг хадгална' }, hint: { en: 'Press K to quick-save your progress.', mn: 'K товчийг баСана уу, нömрэгийг хадгална.' } },
  { id: 'next_mission', label: { en: 'Next Mission', mn: 'Дараах ажлыг сонгох' }, hint: { en: 'Open Mission Control and choose your next research mission.', mn: 'Миссийн баärenд нээнэ, дараах шинжлэх ажлыг сонгоно.' } }
];

// Step index mapping for quick lookup
const STEP_IDS = STEPS.map((s, i) => ({ id: s.id, index: i }));

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export class TutorialSystem {
  constructor(game) {
    this.game = game;

    // Mode: 'guided' or 'sandbox'
    this.mode = MODE_GUIDED;

    // Tutorial state
    this.enabled = true;
    this.currentStepIndex = 0;
    this.completedSteps = new Set();
    this.skippedTutorials = new Set();
    this.unlockedContextualGuides = new Set();
    this.completed = false;
    this.started = false;

    // Step completion callbacks (action detectors)
    this._actionDetectors = {};

    // Persistence: save slot id resolver
    this._getSlotId = () => game.saveSystem?.activeSlotId || 'slot_1';

    // Movement tracking
    this._lastPlayerPos = null;
    this._movementDetected = false;

    // Bind update
    this._boundUpdate = (delta) => this._update(delta);
  }

  // ---- Initialization ----

  init() {
    this._load();
    this._setupHooks();
    return this;
  }

  destroy() {
    this._removeHooks();
  }

  _setupHooks() {
    const game = this.game;
    if (!game) return;

    // Hook into player movement detection via the game loop
    // We poll player position in _update()

    // Hook inventory toggle
    const origToggleInv = game.ui?.toggleInventory?.bind(game.ui);
    if (game.ui) {
      game.ui.toggleInventory = (...args) => {
        const result = origToggleInv ? origToggleInv(...args) : undefined;
        this._onInventoryOpened();
        return result;
      };
    }

    // Hook research journal toggle
    const origToggleRJ = game.ui?.toggleResearchJournal?.bind(game.ui);
    if (game.ui) {
      game.ui.toggleResearchJournal = (...args) => {
        const result = origToggleRJ ? origToggleRJ(...args) : undefined;
        this._onJournalOpened();
        return result;
      };
    }

    // Hook invention toggle
    const origToggleInvUI = game.ui?.toggleInventionUI?.bind(game.ui);
    if (game.ui) {
      game.ui.toggleInventionUI = (...args) => {
        const result = origToggleInvUI ? origToggleInvUI(...args) : undefined;
        this._onInventionOpened();
        return result;
      };
    }

    // Hook academy open
    const origOpenAcademy = game.ui?.openAcademy?.bind(game.ui);
    if (game.ui) {
      game.ui.openAcademy = (tab, labId) => {
        const result = origOpenAcademy ? origOpenAcademy(tab, labId) : undefined;
        this._onAcademyOpened(tab, labId);
        return result;
      };
    }

    // Hook save
    const origSave = game.saveSystem?.save?.bind(game.saveSystem);
    if (game.saveSystem) {
      game.saveSystem.save = (...args) => {
        const result = origSave ? origSave(...args) : undefined;
        this._onGameSaved();
        return result;
      };
    }

    // Hook player scan result
    if (game.player) {
      const origOnScanResult = game.player.onScanResult;
      game.player.onScanResult = (result) => {
        if (origOnScanResult) origOnScanResult(result);
        this._onScanResult(result);
      };
    }

    // Hook player sample collected
    if (game.player) {
      const origOnSampleCollected = game.player.onSampleCollected;
      game.player.onSampleCollected = (result) => {
        if (origOnSampleCollected) origOnSampleCollected(result);
        this._onSampleCollected(result);
      };
    }

    // Hook hotbar selection (equip scanner)
    const origOnHotbarSelect = input?.onHotbarSelect;
    if (input) {
      input.onHotbarSelect = (index) => {
        if (origOnHotbarSelect) origOnHotbarSelect(index);
        this._onHotbarSelect(index);
      };
    }

    // Hook rocket enter / exit
    if (game.rocketManager) {
      const origEnterRocket = game.rocketManager.enterRocket.bind(game.rocketManager);
      game.rocketManager.enterRocket = () => {
        const result = origEnterRocket();
        this._onRocketEntered();
        return result;
      };
      const origStartLaunch = game.rocketManager.startLaunch.bind(game.rocketManager);
      game.rocketManager.startLaunch = () => {
        const result = origStartLaunch();
        this._onRocketLaunchStarted();
        return result;
      };
    }

    // Hook academy answer question (complete experiment)
    if (game.academy) {
      const origAnswerQuestion = game.academy.answerQuestion.bind(game.academy);
      game.academy.answerQuestion = (labId, questionIndex, choiceIndex) => {
        const result = origAnswerQuestion(labId, questionIndex, choiceIndex);
        if (result?.correct) this._onLabQuestionCorrect(labId, questionIndex);
        return result;
      };
    }
  }

  _removeHooks() {
    // Hooks are replaced at setup time; removal would need originals stored.
    // For simplicity we leave them; tutorial is single-instance.
  }

  // ---- Action detection callbacks ----

  _onMovement() {
    this._movementDetected = true;
  }

  _onInventoryOpened() {
    this._markStepComplete('inventory');
  }

  _onHotbarSelect(index) {
    // Scanner is in hotbar slot 5 (0-indexed)
    if (index === 5) {
      this._markStepComplete('equip_scanner');
    }
  }

  _onScanResult(result) {
    this._markStepComplete('scan');
  }

  _onSampleCollected(result) {
    this._markStepComplete('collect_sample');
  }

  _onJournalOpened() {
    this._markStepComplete('open_journal');
  }

  _onInventionOpened() {
    this._markStepComplete('open_engineering');
  }

  _onAcademyOpened(tab, labId) {
    if (tab === 'labs' || labId) {
      this._markStepComplete('open_academy');
    }
    if (labId === 'engineering') {
      this._markStepComplete('open_engineering');
    }
    if (labId === 'biology' || labId === 'life-experiment') {
      this._markStepComplete('open_biology');
    }
    if (tab === 'missions') {
      this._markStepComplete('next_mission');
    }
  }

  _onLabQuestionCorrect(labId, questionIndex) {
    this._markStepComplete('complete_experiment');
  }

  _onGameSaved() {
    this._markStepComplete('save_progress');
  }

  _onRocketEntered() {
    this._markStepComplete('board_rocket');
  }

  _onRocketLaunchStarted() {
    // Rocket boarding + launch counts toward visit+board
    this._markStepComplete('visit_rocket');
    this._markStepComplete('board_rocket');
  }

  // ---- Step completion ----

  _markStepComplete(stepId) {
    if (!this.enabled || !this.started || this.completed) return;
    const step = STEPS.find(s => s.id === stepId);
    if (!step) return;
    const idx = STEPS.indexOf(step);
    if (idx === -1) return;
    if (this.completedSteps.has(idx)) return;

    this.completedSteps.add(idx);

    // Auto-advance if this was the current step
    if (idx === this.currentStepIndex) {
      this._advance();
    }

    this._persist();
    this._notifyUI();
  }

  _advance() {
    // Find next incomplete step
    let next = this.currentStepIndex + 1;
    while (next < STEPS.length && this.completedSteps.has(next)) {
      next++;
    }
    if (next >= STEPS.length) {
      this.completed = true;
      this.currentStepIndex = STEPS.length - 1;
      this._persist();
      this._notifyUI();
      return;
    }
    this.currentStepIndex = next;
    this._persist();
    this._notifyUI();
  }

  // ---- Update loop (polls for movement, rocket proximity, etc.) ----

  _update(delta) {
    if (!this.enabled || !this.started || this.completed) return;

    const game = this.game;
    if (!game || !game.player) return;

    // Step 1: Movement detection
    if (this.currentStepIndex === 0) {
      const pos = game.player.position;
      if (pos) {
        if (!this._lastPlayerPos) {
          this._lastPlayerPos = pos.clone();
        } else {
          const dist = pos.distanceTo(this._lastPlayerPos);
          if (dist > 0.5) {
            this._markStepComplete('move');
            this._lastPlayerPos = pos.clone();
          }
        }
      }
    }

    // Step 17: Visit rocket - detect player near rocket pad
    if (this.currentStepIndex === 16) {
      const rocket = game.rocketManager;
      const player = game.player;
      if (rocket && player && rocket.padOrigin) {
        const dist = player.position.distanceTo(rocket.padOrigin);
        if (dist < 10) {
          this._markStepComplete('visit_rocket');
        }
      }
    }

    // Step 16: Life creation - check if life engine has organisms
    if (this.currentStepIndex === 15) {
      const academy = game.academy;
      if (academy) {
        try {
          const engine = academy.getOrCreateLifeEngine?.();
          if (engine) {
            const state = engine.getState?.();
            if (state && state.population && state.population.count > 0) {
              this._markStepComplete('life_creation');
            }
          }
        } catch (e) {}
      }
    }

    // Step 7: Review scan results - check if journal has discoveries
    if (this.currentStepIndex === 6) {
      const journal = game.researchJournal;
      if (journal && journal.getDiscoveries?.() && journal.getDiscoveries().length > 0) {
        this._markStepComplete('review_results');
      }
    }

    // Step 11-14: Invention progress via state
    if (this.currentStepIndex >= 10 && this.currentStepIndex <= 13) {
      const invention = game.inventionSystem;
      if (invention) {
        const step = invention.assemblyStep;
        if (this.currentStepIndex === 10 && step !== 'select') {
          this._markStepComplete('assemble_sensor');
        }
        if (this.currentStepIndex === 11 && invention.validationResult?.valid) {
          this._markStepComplete('validate_device');
        }
        if (this.currentStepIndex === 12 && invention.testResult) {
          this._markStepComplete('test_sensor');
        }
        if (this.currentStepIndex === 13 && step === 'complete') {
          this._markStepComplete('save_invention');
        }
      }
    }
  }

  // ---- Public API ----

  start() {
    if (this.started) return;
    this.started = true;
    this.enabled = true;
    this.mode = MODE_GUIDED;
    this._persist();
    this._notifyUI();
  }

  stop() {
    this.started = false;
    this.enabled = false;
    this._persist();
    this._notifyUI();
  }

  toggleMode() {
    this.mode = this.mode === MODE_GUIDED ? MODE_SANDBOX : MODE_GUIDED;
    if (this.mode === MODE_SANDBOX) {
      this.enabled = false;
    } else {
      this.enabled = true;
    }
    this._persist();
    this._notifyUI();
  }

  setMode(mode) {
    this.mode = mode;
    this.enabled = mode === MODE_GUIDED;
    this._persist();
    this._notifyUI();
  }

  skip() {
    if (!this.started) return;
    this.completed = true;
    this.skippedTutorials.add('main');
    this._persist();
    this._notifyUI();
  }

  resume() {
    this.started = true;
    this.enabled = this.mode === MODE_GUIDED;
    this._persist();
    this._notifyUI();
  }

  restart() {
    this.currentStepIndex = 0;
    this.completedSteps = new Set();
    this.completed = false;
    this.started = true;
    this.enabled = true;
    this.mode = MODE_GUIDED;
    this._persist();
    this._notifyUI();
  }

  getCurrentStep() {
    if (this.completed || this.currentStepIndex >= STEPS.length) return null;
    return {
      ...STEPS[this.currentStepIndex],
      index: this.currentStepIndex,
      total: STEPS.length,
      progress: Math.round((this.currentStepIndex / STEPS.length) * 100)
    };
  }

  getProgress() {
    return {
      currentStepIndex: this.currentStepIndex,
      totalSteps: STEPS.length,
      completedCount: this.completedSteps.size,
      completed: this.completed,
      started: this.started,
      mode: this.mode,
      enabled: this.enabled,
      percent: Math.round((this.completedSteps.size / STEPS.length) * 100)
    };
  }

  isStepCompleted(stepId) {
    const step = STEPS.find(s => s.id === stepId);
    if (!step) return false;
    return this.completedSteps.has(STEPS.indexOf(step));
  }

  // Contextual tutorial access
  unlockContextualGuide(guideId) {
    this.unlockedContextualGuides.add(guideId);
    this._persist();
  }

  isContextualGuideUnlocked(guideId) {
    return this.unlockedContextualGuides.has(guideId);
  }

  // ---- Persistence ----

  _persist() {
    try {
      const slotId = this._getSlotId();
      const key = `${TUTORIAL_STORAGE_KEY}_${slotId}`;
      const state = {
        version: 1,
        mode: this.mode,
        started: this.started,
        enabled: this.enabled,
        currentStepIndex: this.currentStepIndex,
        completedSteps: Array.from(this.completedSteps),
        skippedTutorials: Array.from(this.skippedTutorials),
        unlockedContextualGuides: Array.from(this.unlockedContextualGuides),
        completed: this.completed,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.warn('[TutorialSystem] Could not persist tutorial state:', e);
    }
  }

  _load() {
    try {
      const slotId = this._getSlotId();
      const key = `${TUTORIAL_STORAGE_KEY}_${slotId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.version !== 1) return;
      this.mode = data.mode || MODE_GUIDED;
      this.started = Boolean(data.started);
      this.enabled = Boolean(data.enabled);
      this.currentStepIndex = Number.isInteger(data.currentStepIndex) ? data.currentStepIndex : 0;
      this.completedSteps = new Set(data.completedSteps || []);
      this.skippedTutorials = new Set(data.skippedTutorials || []);
      this.unlockedContextualGuides = new Set(data.unlockedContextualGuides || []);
      this.completed = Boolean(data.completed);
    } catch (e) {
      console.warn('[TutorialSystem] Could not load tutorial state:', e);
    }
  }

  // ---- UI notification callback ----

  _notifyUI() {
    if (this.game?.ui?.onTutorialStateChanged) {
      this.game.ui.onTutorialStateChanged(this.getProgress(), this.getCurrentStep());
    }
  }
}
