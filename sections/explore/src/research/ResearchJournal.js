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
    this.updatedAt = 0;
    this._load();
  }

  _storageKey() {
    const slotId = this.getSlotId?.() || 'slot_1';
    return `SU_RESEARCH_JOURNAL_V1_${slotId}`;
  }

  _computeLatestTimestamp(state) {
    if (!state || typeof state !== 'object') return 0;
    let latest = Number(state.updatedAt) || 0;
    const exp = state.currentExperiment;
    if (exp && typeof exp === 'object') {
      if (Number(exp.startedAt) > latest) latest = Number(exp.startedAt);
      for (const s of exp.samples || []) {
        if (Number(s?.analyzedAt) > latest) latest = Number(s.analyzedAt);
        if (Number(s?.timestamp) > latest) latest = Number(s.timestamp);
      }
      for (const sc of exp.scans || []) {
        if (Number(sc?.timestamp) > latest) latest = Number(sc.timestamp);
      }
      for (const ob of exp.observations || []) {
        if (Number(ob?.timestamp) > latest) latest = Number(ob.timestamp);
      }
      if (Number(exp.hypothesis?.createdAt) > latest) latest = Number(exp.hypothesis.createdAt);
      if (Number(exp.experimentResult?.timestamp) > latest) latest = Number(exp.experimentResult.timestamp);
      if (Number(exp.analysis?.timestamp) > latest) latest = Number(exp.analysis.timestamp);
    }
    for (const e of state.experiments || []) {
      if (Number(e?.startedAt) > latest) latest = Number(e.startedAt);
    }
    for (const d of state.discoveries || []) {
      if (Number(d?.recordedAt) > latest) latest = Number(d.recordedAt);
    }
    for (const h of state.hypotheses || []) {
      if (Number(h?.createdAt) > latest) latest = Number(h.createdAt);
    }
    return latest;
  }

  _mergeSamplesList(primarySamples = [], secondarySamples = []) {
    const pList = Array.isArray(primarySamples) ? primarySamples : [];
    const sList = Array.isArray(secondarySamples) ? secondarySamples : [];
    if (sList.length === 0) return [...pList];
    if (pList.length === 0) return [...sList];

    const merged = pList.map(s => (s ? { ...s } : s)).filter(Boolean);
    for (const sec of sList) {
      if (!sec) continue;
      const match = merged.find(m =>
        (sec.identity && m.identity && sec.identity === m.identity) ||
        (!sec.identity && !m.identity && sec.itemId === m.itemId && sec.timestamp === m.timestamp)
      );
      if (match) {
        if (sec.analyzed && !match.analyzed) {
          match.analyzed = true;
          match.analyzedAt = sec.analyzedAt || Date.now();
        } else if (sec.analyzed && match.analyzed && sec.analyzedAt && (!match.analyzedAt || sec.analyzedAt < match.analyzedAt)) {
          match.analyzedAt = sec.analyzedAt;
        }
        if (!match.name_mn && sec.name_mn) match.name_mn = sec.name_mn;
        if (!match.layer && sec.layer) match.layer = sec.layer;
        if (!match.desc_mn && sec.desc_mn) match.desc_mn = sec.desc_mn;
        if (match.hardness === undefined && sec.hardness !== undefined) match.hardness = sec.hardness;
      } else {
        merged.push({ ...sec });
      }
    }
    return merged;
  }

  _mergeById(primaryArr = [], secondaryArr = []) {
    const p = Array.isArray(primaryArr) ? primaryArr : [];
    const s = Array.isArray(secondaryArr) ? secondaryArr : [];
    if (s.length === 0) return [...p];
    if (p.length === 0) return [...s];
    const seen = new Set();
    const out = [];
    for (const item of [...p, ...s]) {
      if (!item) continue;
      const key = item.id || `${item.subjectId || ''}:${item.startedAt || item.recordedAt || item.createdAt || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  _load() {
    try {
      const raw = this.storage?.getItem(this._storageKey());
      if (!raw) {
        this.experiments = [];
        this.discoveries = [];
        this.hypotheses = [];
        this.currentExperiment = null;
        this.stepIndex = 0;
        this.updatedAt = 0;
        return;
      }
      const data = JSON.parse(raw);
      this.experiments = Array.isArray(data.experiments) ? data.experiments : [];
      this.discoveries = Array.isArray(data.discoveries) ? data.discoveries : [];
      this.hypotheses = Array.isArray(data.hypotheses) ? data.hypotheses : [];
      this.currentExperiment = data.currentExperiment || null;
      this.stepIndex = typeof data.stepIndex === 'number'
        ? data.stepIndex
        : (typeof this.currentExperiment?.stepIndex === 'number' ? this.currentExperiment.stepIndex : 0);
      this.updatedAt = this._computeLatestTimestamp(data);
    } catch (e) {
      console.warn('[ResearchJournal] Load failed:', e);
    }
  }

  _save() {
    try {
      this.updatedAt = Math.max(Date.now(), this._computeLatestTimestamp(this));
      this.storage?.setItem(this._storageKey(), JSON.stringify({
        experiments: this.experiments,
        discoveries: this.discoveries,
        hypotheses: this.hypotheses,
        currentExperiment: this.currentExperiment,
        stepIndex: this.stepIndex,
        updatedAt: this.updatedAt
      }));
    } catch (e) {
      console.warn('[ResearchJournal] Save failed:', e);
    }
  }

  getState() {
    return {
      experiments: this.experiments,
      discoveries: this.discoveries,
      hypotheses: this.hypotheses,
      currentExperiment: this.currentExperiment,
      stepIndex: this.stepIndex,
      updatedAt: this.updatedAt || this._computeLatestTimestamp(this)
    };
  }

  loadState(state) {
    if (!state || typeof state !== 'object') return;
    this.experiments = Array.isArray(state.experiments) ? state.experiments : [];
    this.discoveries = Array.isArray(state.discoveries) ? state.discoveries : [];
    this.hypotheses = Array.isArray(state.hypotheses) ? state.hypotheses : [];
    this.currentExperiment = state.currentExperiment || null;
    this.stepIndex = typeof state.stepIndex === 'number'
      ? state.stepIndex
      : (typeof this.currentExperiment?.stepIndex === 'number' ? this.currentExperiment.stepIndex : 0);
    this.updatedAt = this._computeLatestTimestamp(state);
    this._save();
  }

  syncWithSaveData(worldJournalState = null) {
    this._load();
    if (!worldJournalState || typeof worldJournalState !== 'object') {
      return;
    }

    const localTs = this._computeLatestTimestamp(this);
    const saveTs = this._computeLatestTimestamp(worldJournalState);
    const saveIsNewer = saveTs > localTs;

    this.experiments = this._mergeById(
      saveIsNewer ? worldJournalState.experiments : this.experiments,
      saveIsNewer ? this.experiments : worldJournalState.experiments
    );
    this.discoveries = this._mergeById(
      saveIsNewer ? worldJournalState.discoveries : this.discoveries,
      saveIsNewer ? this.discoveries : worldJournalState.discoveries
    );
    this.hypotheses = this._mergeById(
      saveIsNewer ? worldJournalState.hypotheses : this.hypotheses,
      saveIsNewer ? this.hypotheses : worldJournalState.hypotheses
    );

    const localExp = this.currentExperiment;
    const saveExp = worldJournalState.currentExperiment || null;

    if (!localExp && saveExp) {
      this.currentExperiment = {
        ...saveExp,
        samples: this._mergeSamplesList(saveExp.samples, [])
      };
      this.stepIndex = typeof worldJournalState.stepIndex === 'number'
        ? worldJournalState.stepIndex
        : (typeof saveExp.stepIndex === 'number' ? saveExp.stepIndex : 0);
    } else if (localExp && saveExp) {
      const primaryExp = saveIsNewer ? saveExp : localExp;
      const secondaryExp = saveIsNewer ? localExp : saveExp;
      const mergedSamples = (localExp.id === saveExp.id || localExp.subjectType === saveExp.subjectType)
        ? this._mergeSamplesList(primaryExp.samples, secondaryExp.samples)
        : (Array.isArray(primaryExp.samples) ? [...primaryExp.samples] : []);
      const resolvedStep = Math.max(
        typeof primaryExp.stepIndex === 'number' ? primaryExp.stepIndex : 0,
        localExp.id === saveExp.id && typeof secondaryExp.stepIndex === 'number' ? secondaryExp.stepIndex : 0
      );
      this.currentExperiment = {
        ...primaryExp,
        stepIndex: resolvedStep,
        samples: mergedSamples
      };
      this.stepIndex = resolvedStep;
    }

    this._save();
  }

  resetForSlot() {
    this.experiments = [];
    this.discoveries = [];
    this.hypotheses = [];
    this.currentExperiment = null;
    this.stepIndex = 0;
    this.updatedAt = Date.now();
    this._save();
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
    this._save();
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
    if (!this.currentExperiment || !data) return false;
    if (!Array.isArray(this.currentExperiment.samples)) {
      this.currentExperiment.samples = [];
    }
    if (data.identity && this.currentExperiment.samples.some(s => s && s.identity === data.identity)) {
      return false;
    }
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
    this.experiments.push({ ...this.currentExperiment });
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
