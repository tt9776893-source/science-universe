// SCIENCE UNIVERSE — FRONTIER
// Research Journal — player-driven scientific discovery system
// Tracks: Observe → Scan → Collect → Hypothesis → Experiment → Analyze → Record

const RESEARCH_STEPS = [
  'observe',
  'scan',
  'collect',
  'hypothesis',
  'experiment',
  'analyze',
  'record'
];

const STEP_LABELS = {
  observe: { en: 'Observe', mn: 'Үүлэглэх' },
  scan: { en: 'Scan', mn: 'Сканлэх' },
  collect: { en: 'Collect Sample', mn: 'Дээж цуглуулах' },
  hypothesis: { en: 'Form Hypothesis', mn: 'Гипотез үүсгэх' },
  experiment: { en: 'Run Experiment', mn: 'Туршилт ажиллуулах' },
  analyze: { en: 'Analyze Results', mn: 'Үр дүнг шийдвэрлэх' },
  record: { en: 'Record Discovery', mn: 'Шинэ шатанд руу явх' }
};

const STEP_ICONS = {
  observe: '👁️',
  scan: '🔍',
  collect: '📦',
  hypothesis: '💡',
  experiment: '🧪',
  analyze: '📊',
  record: '📖'
};

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export class ResearchJournal {
  constructor(getSlotId, storage = globalThis.localStorage) {
    this.getSlotId = getSlotId;
    this.storage = storage;
    this.experiments = [];
    this.discoveries = [];
    this.hypotheses = [];
    this.currentExperiment = null;
    this.stepIndex = 0;
    this._load();
  }

  _storageKey() {
    const slotId = this.getSlotId?.() || 'slot_1';
    return `SU_RESEARCH_JOURNAL_V1_${slotId}`;
  }

  _load() {
    try {
      const raw = this.storage?.getItem(this._storageKey());
      if (!raw) return;
      const data = JSON.parse(raw);
      this.experiments = Array.isArray(data.experiments) ? data.experiments : [];
      this.discoveries = Array.isArray(data.discoveries) ? data.discoveries : [];
      this.hypotheses = Array.isArray(data.hypotheses) ? data.hypotheses : [];
    } catch (e) {
      console.warn('[ResearchJournal] Load failed:', e);
    }
  }

  _save() {
    try {
      this.storage?.setItem(this._storageKey(), JSON.stringify({
        experiments: this.experiments,
        discoveries: this.discoveries,
        hypotheses: this.hypotheses
      }));
    } catch (e) {
      console.warn('[ResearchJournal] Save failed:', e);
    }
  }

  // ---- Experiment lifecycle ----

  startExperiment(subjectId, subjectType, planetId) {
    // Complete any in-progress experiment without recording
    if (this.currentExperiment && this.currentExperiment.stepIndex < RESEARCH_STEPS.length - 1) {
      this.experiments.push({ ...this.currentExperiment, status: 'abandoned' });
    }

    this.currentExperiment = {
      id: `exp_${Date.now()}`,
      subjectId,
      subjectType, // 'organism', 'geology', 'atmosphere', 'device'
      planetId,
      startedAt: Date.now(),
      stepIndex: 0,
      status: 'active',
      observations: [],
      scans: [],
      samples: [],
      hypothesis: null,
      experimentResult: null,
      analysis: null,
      discoveryRecorded: false
    };
    this.stepIndex = 0;
    return this.currentExperiment;
  }

  getCurrentStep() {
    if (!this.currentExperiment) return null;
    return RESEARCH_STEPS[this.currentExperiment.stepIndex];
  }

  getStepLabel(stepKey = null) {
    const key = stepKey || this.getCurrentStep();
    if (!key) return null;
    return STEP_LABELS[key];
  }

  getStepIcon(stepKey = null) {
    const key = stepKey || this.getCurrentStep();
    if (!key) return null;
    return STEP_ICONS[key];
  }

  // Record an observation (from organism scan or field observation)
  addObservation(data) {
    if (!this.currentExperiment) return false;
    const entry = {
      ...data,
      timestamp: Date.now(),
      type: 'observation'
    };
    this.currentExperiment.observations.push(entry);
    this._advanceIfReady('observe');
    this._save();
    return true;
  }

  // Record a scan result (from PIXL scanner on organisms)
  addScan(data) {
    if (!this.currentExperiment) return false;
    const entry = {
      ...data,
      timestamp: Date.now(),
      type: 'scan'
    };
    this.currentExperiment.scans.push(entry);
    this._advanceIfReady('scan');
    this._save();
    return true;
  }

  // Record a collected sample (from sample collector tool)
  addSample(data) {
    if (!this.currentExperiment) return false;
    const entry = {
      ...data,
      timestamp: Date.now(),
      type: 'sample'
    };
    this.currentExperiment.samples.push(entry);
    this._advanceIfReady('collect');
    this._save();
    return true;
  }

  // Form a hypothesis
  formHypothesis(text, confidence = 0.5) {
    if (!this.currentExperiment) return false;
    if (this.getCurrentStep() !== 'hypothesis') return false;

    const hypothesis = {
      id: `hyp_${Date.now()}`,
      text,
      confidence: clamp(confidence),
      experimentId: this.currentExperiment.id,
      createdAt: Date.now(),
      tested: false,
      supported: null
    };
    this.currentExperiment.hypothesis = hypothesis;
    this.hypotheses.push(hypothesis);
    this._advanceStep();
    this._save();
    return hypothesis;
  }

  // Run an experiment (linked to academy lab or field instrument)
  runExperiment(labId, resultData) {
    if (!this.currentExperiment) return false;
    if (this.getCurrentStep() !== 'experiment') return false;

    this.currentExperiment.experimentResult = {
      labId,
      ...resultData,
      timestamp: Date.now()
    };
    this._advanceStep();
    this._save();
    return true;
  }

  // Analyze results
  analyzeResults(conclusion, supported) {
    if (!this.currentExperiment) return false;
    if (this.getCurrentStep() !== 'analyze') return false;

    this.currentExperiment.analysis = {
      conclusion,
      supported: Boolean(supported),
      timestamp: Date.now()
    };
    if (this.currentExperiment.hypothesis) {
      this.currentExperiment.hypothesis.tested = true;
      this.currentExperiment.hypothesis.supported = Boolean(supported);
    }
    this._advanceStep();
    this._save();
    return true;
  }

  // Record discovery - final step
  recordDiscovery(title, description, significance = 'minor') {
    if (!this.currentExperiment) return false;
    if (this.getCurrentStep() !== 'record') return false;

    const discovery = {
      id: `disc_${Date.now()}`,
      title,
      description,
      significance, // minor | major | breakthrough
      experimentId: this.currentExperiment.id,
      subjectId: this.currentExperiment.subjectId,
      subjectType: this.currentExperiment.subjectType,
      planetId: this.currentExperiment.planetId,
      hypothesis: this.currentExperiment.hypothesis,
      analysis: this.currentExperiment.analysis,
      recordedAt: Date.now()
    };
    this.discoveries.push(discovery);
    this.currentExperiment.discoveryRecorded = true;
    this.currentExperiment.status = 'completed';
    this.currentExperiment.stepIndex = RESEARCH_STEPS.length - 1;
    this._save();
    return discovery;
  }

  // ---- Internal ----

  _advanceIfReady(stepKey) {
    const expected = this.getCurrentStep();
    if (expected === stepKey) {
      this._advanceStep();
    }
  }

  _advanceStep() {
    if (!this.currentExperiment) return;
    this.currentExperiment.stepIndex = Math.min(
      this.currentExperiment.stepIndex + 1,
      RESEARCH_STEPS.length - 1
    );
    this.stepIndex = this.currentExperiment.stepIndex;
  }

  // ---- Queries ----

  getProgress() {
    if (!this.currentExperiment) return 0;
    return ((this.currentExperiment.stepIndex + 1) / RESEARCH_STEPS.length) * 100;
  }

  getDiscoveries() {
    return [...this.discoveries].sort((a, b) => b.recordedAt - a.recordedAt);
  }

  getHypotheses() {
    return [...this.hypotheses].sort((a, b) => b.createdAt - a.createdAt);
  }

  getExperiments() {
    return [...this.experiments].sort((a, b) => b.startedAt - a.startedAt);
  }

  getDiscoveryCount() {
    return this.discoveries.length;
  }

  isExperimentActive() {
    return Boolean(this.currentExperiment && this.currentExperiment.status === 'active');
  }

  completeExperiment() {
    if (!this.currentExperiment) return false;
    this.currentExperiment.status = 'completed';
    this.currentExperiment = null;
    this.stepIndex = 0;
    this._save();
    return true;
  }

  abandonExperiment() {
    if (!this.currentExperiment) return false;
    this.currentExperiment.status = 'abandoned';
    this.experiments.push({ ...this.currentExperiment });
    this.currentExperiment = null;
    this.stepIndex = 0;
    this._save();
    return true;
  }
}
