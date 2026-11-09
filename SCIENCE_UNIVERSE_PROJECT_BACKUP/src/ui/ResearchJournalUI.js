// SCIENCE UNIVERSE — FRONTIER
// ResearchJournalUI — self-contained modal UI for the Research Journal
// Opens/closes with 'J' key, renders experiment progress and discoveries,
// Mongolian labels, touch-friendly mobile layout.

const STEPS = ['observe', 'scan', 'collect', 'hypothesis', 'experiment', 'analyze', 'record'];

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

export class ResearchJournalUI {
  constructor(game, journal) {
    this.game = game;
    this.journal = journal;
    this.modal = null;
    this.isOpen = false;
    this._boundToggle = () => this.toggle();
    this._boundKeyDown = (e) => {
      if (e.code === 'KeyJ') {
        e.preventDefault();
        this.toggle();
      }
    };
  }

  init() {
    window.addEventListener('keydown', this._boundKeyDown);
    return this;
  }

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    this.close();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.game.isResearchOpen = true;
    this._ensureModal();
    this.modal.style.display = 'block';
    this._render();
    this.game.input?.exitPointerLock?.();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.game.isResearchOpen = false;
    if (this.modal) this.modal.style.display = 'none';
    if (!this.game.isAcademyOpen && !this.game.isInventoryOpen && !this.game.isPauseOpen && !this.game.isTutorialOpen && !this.game.isInventionOpen) {
      this.game.input?.requestPointerLock?.();
    }
  }

  _ensureModal() {
    if (this.modal) return;
    const el = document.createElement('div');
    el.id = 'research-journal-modal';
    el.className = 'research-modal';
    el.style.cssText = `
      display:none;position:fixed;inset:0;z-index:2000;
      background:rgba(10,15,25,0.92);font-family:system-ui,sans-serif;
      color:#e2f1ff;overflow:hidden;
    `;
    el.innerHTML = `
      <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;z-index:1;">
        <h2 style="margin:0;font-size:16px;">📖 Research Journal</h2>
        <button id="btn-close-research" style="padding:6px 14px;background:#34d399;color:#080509;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">Close (J)</button>
      </div>
      <div style="position:absolute;top:50px;bottom:10px;left:10px;right:10px;overflow-y:auto;padding:12px;gap:10px;display:flex;flex-direction:column;">
        <div id="research-progress" style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:3px;">
            <span id="research-current-label">—</span><span id="research-progress-text">—</span>
          </div>
          <div class="academy-progress-track"><div id="research-progress-fill" class="academy-progress-fill" style="width:0%"></div></div>
          <div id="research-step-hint" style="font-size:11px;color:#cbd5e1;margin-top:3px;"></div>
        </div>
        <div id="research-content" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    `;
    document.body.appendChild(el);
    this.modal = el;
    document.getElementById('btn-close-research')?.addEventListener('click', () => this.close());
    // Close on Escape
    el.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') { e.preventDefault(); this.close(); }
    });
    el.setAttribute('tabindex', '-1');
    el.focus();

    // Safe area / mobile padding
    this._applySafeArea();
  }

  _applySafeArea() {
    const style = document.createElement('style');
    style.textContent = `
      #research-journal-modal { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
      @media (max-width: 768px) {
        #research-journal-modal button.su-btn { min-height: 44px; }
        #research-journal-modal input, #research-journal-modal textarea { min-height: 44px; font-size: 16px; }
      }
      @media (orientation: landscape) and (max-height: 500px) {
        #research-journal-modal { padding-top: 6px; padding-bottom: 6px; }
        #research-journal-modal > div > div { top: 46px; bottom: 6px; }
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    if (!this.journal || !this.modal) return;
    const progressEl = document.getElementById('research-progress-fill');
    const labelEl = document.getElementById('research-current-label');
    const progressTextEl = document.getElementById('research-progress-text');
    const hintEl = document.getElementById('research-step-hint');
    const contentEl = document.getElementById('research-content');

    if (!progressEl || !labelEl || !progressTextEl || !hintEl || !contentEl) return;

    const step = this.journal.getCurrentStep();
    const icon = STEP_ICONS[step] || '—';
    const lbl = STEP_LABELS[step];
    const progress = this.journal.getProgress();

    labelEl.textContent = lbl ? `${icon} ${lbl.mn} (${lbl.en})` : 'No active experiment';
    progressEl.style.width = `${progress}%`;
    progressTextEl.textContent = `${Math.round(progress)}%`;

    if (this.journal.isExperimentActive()) {
      hintEl.textContent = `Step ${this.journal.stepIndex + 1} of 7 — ${lbl?.en || ''}`;
      contentEl.innerHTML = this._renderActiveExperiment();
    } else {
      hintEl.textContent = 'No active experiment. Scan an organism or collect a sample to begin.';
      contentEl.innerHTML = this._renderDiscoveries();
    }
  }

  _renderActiveExperiment() {
    const step = this.journal.getCurrentStep();
    const lbl = STEP_LABELS[step];
    const icon = STEP_ICONS[step];

    let actionHtml = '';
    if (step === 'observe') {
      actionHtml = `
        <div style="background:rgba(52,211,153,0.1);border-left:4px solid #34d399;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 1: Observe — ${lbl.mn}</div>
          <div style="font-size:13px;">Look around the planet surface for organisms or geological features.</div>
          <button id="rj-btn-observe" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Mark Observation</button>
        </div>
      `;
    } else if (step === 'scan') {
      actionHtml = `
        <div style="background:rgba(99,102,241,0.1);border-left:4px solid #6366f1;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 2: Scan — ${lbl.mn}</div>
          <div style="font-size:13px;">Equip the PIXL Scanner (hotbar slot 6) and left-click on an organism to scan it.</div>
          <button id="rj-btn-scan" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Mark Scan Complete</button>
        </div>
      `;
    } else if (step === 'collect') {
      actionHtml = `
        <div style="background:rgba(251,191,36,0.1);border-left:4px solid #fbbf24;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 3: Collect Sample — ${lbl.mn}</div>
          <div style="font-size:13px;">Equip the Cryo Sample Vacuum (hotbar slot 5) and collect a regolith or ice sample.</div>
          <button id="rj-btn-collect" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Mark Sample Collected</button>
        </div>
      `;
    } else if (step === 'hypothesis') {
      actionHtml = `
        <div style="background:rgba(236,72,153,0.1);border-left:4px solid #ec4899;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 4: Form Hypothesis — ${lbl.mn}</div>
          <div style="font-size:13px;">Enter your hypothesis about what you observed.</div>
          <input id="rj-hyp-input" type="text" placeholder="My hypothesis..." style="width:100%;padding:6px;margin:4px 0;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#e2f1ff;font-size:13px;">
          <div style="font-size:11px;color:#94a3b8;">Confidence:</div>
          <input type="range" min="0" max="100" value="50" id="rj-hyp-slider" style="width:100%;">
          <button id="rj-btn-hypothesis" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Record Hypothesis</button>
        </div>
      `;
    } else if (step === 'experiment') {
      actionHtml = `
        <div style="background:rgba(16,185,129,0.1);border-left:4px solid #10b981;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 5: Run Experiment — ${lbl.mn}</div>
          <div style="font-size:13px;">Visit the Science Academy and run an experiment in the Biology Lab.</div>
          <button id="rj-btn-open-lab" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Open Biology Lab</button>
          <button id="rj-btn-exp-complete" class="su-btn secondary" style="margin-top:4px;padding:6px 14px;font-size:13px;">Mark Experiment Complete</button>
        </div>
      `;
    } else if (step === 'analyze') {
      actionHtml = `
        <div style="background:rgba(59,130,246,0.1);border-left:4px solid #3b82f6;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 6: Analyze Results — ${lbl.mn}</div>
          <div style="font-size:13px;">Was your hypothesis supported by the experiment?</div>
          <button id="rj-btn-analyze-yes" class="su-btn primary" style="margin-top:4px;padding:6px 14px;font-size:13px;margin-right:6px;">Yes, Supported</button>
          <button id="rj-btn-analyze-no" class="su-btn secondary" style="margin-top:4px;padding:6px 14px;font-size:13px;">No, Not Supported</button>
        </div>
      `;
    } else if (step === 'record') {
      actionHtml = `
        <div style="background:rgba(139,92,246,0.1);border-left:4px solid #8b5cf6;padding:10px;border-radius:8px;">
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;">Step 7: Record Discovery — ${lbl.mn}</div>
          <div style="font-size:13px;">Record your discovery in the permanent journal.</div>
          <input id="rj-disc-title" type="text" placeholder="Discovery title..." style="width:100%;padding:6px;margin:4px 0;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#e2f1ff;font-size:13px;">
          <textarea id="rj-disc-desc" placeholder="Describe your discovery..." style="width:100%;padding:6px;margin:4px 0;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:#e2f1ff;font-size:13px;min-height:70px;"></textarea>
          <button id="rj-btn-record" class="su-btn primary" style="margin-top:6px;padding:6px 14px;font-size:13px;">Record Discovery</button>
        </div>
      `;
    }

    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="font-size:20px;">${icon}</span>
          <div>
            <div style="font-size:14px;font-weight:700;">${lbl?.en || ''}</div>
            <div style="font-size:11px;color:#94a3b8;">${lbl?.mn || ''}</div>
          </div>
        </div>
        ${actionHtml}
      </div>
    `;
  }

  _renderDiscoveries() {
    const discoveries = this.journal.getDiscoveries();
    if (discoveries.length === 0) {
      return `
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:20px;text-align:center;color:#94a3b8;">
          <div style="font-size:28px;margin-bottom:6px;">📭</div>
          <div style="font-size:13px;">No discoveries recorded yet.</div>
          <div style="font-size:11px;margin-top:4px;">Complete an experiment to record your first discovery.</div>
        </div>
      `;
    }

    const items = discoveries.map(d => {
      const date = new Date(d.recordedAt).toLocaleDateString();
      const sigColor = d.significance === 'breakthrough' ? '#f472b6' : d.significance === 'major' ? '#fbbf24' : '#34d399';
      return `
        <div style="background:rgba(255,255,255,0.03);border-radius:6px;padding:8px;margin-bottom:6px;border-left:3px solid ${sigColor};">
          <div style="font-size:13px;font-weight:600;">${d.title}</div>
          <div style="font-size:11px;color:#94a3b8;margin:2px 0;">${d.description}</div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;margin-top:3px;">
            <span>${date} • ${d.planetId}</span>
            <span style="color:${sigColor}">${d.significance}</span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#34d399;">Recorded Discoveries</div>
        ${items}
      </div>
    `;
  }

  _bindButtons() {
    const modal = this.modal;
    if (!modal) return;

    // Observe
    const btnObs = document.getElementById('rj-btn-observe');
    if (btnObs && !btnObs.dataset.rjBound) {
      btnObs.dataset.rjBound = '1';
      btnObs.addEventListener('click', () => this._advanceStep('observe'));
    }
    // Scan
    const btnScan = document.getElementById('rj-btn-scan');
    if (btnScan && !btnScan.dataset.rjBound) {
      btnScan.dataset.rjBound = '1';
      btnScan.addEventListener('click', () => this._advanceStep('scan'));
    }
    // Collect
    const btnColl = document.getElementById('rj-btn-collect');
    if (btnColl && !btnColl.dataset.rjBound) {
      btnColl.dataset.rjBound = '1';
      btnColl.addEventListener('click', () => this._advanceStep('collect'));
    }
    // Hypothesis
    const btnHyp = document.getElementById('rj-btn-hypothesis');
    if (btnHyp && !btnHyp.dataset.rjBound) {
      btnHyp.dataset.rjBound = '1';
      btnHyp.addEventListener('click', () => this._submitHypothesis());
    }
    const hypSlider = document.getElementById('rj-hyp-slider');
    const hypVal = document.getElementById('rj-hyp-confidence-display');
    if (hypSlider && !hypSlider.dataset.rjBound) {
      hypSlider.dataset.rjBound = '1';
      hypSlider.addEventListener('input', () => {
        if (hypVal) hypVal.textContent = (parseFloat(hypSlider.value) / 100).toFixed(2);
      });
    }
    // Experiment
    const btnLab = document.getElementById('rj-btn-open-lab');
    if (btnLab && !btnLab.dataset.rjBound) {
      btnLab.dataset.rjBound = '1';
      btnLab.addEventListener('click', () => {
        this.game.ui?.openAcademy?.('labs', 'biology');
      });
    }
    const btnExp = document.getElementById('rj-btn-exp-complete');
    if (btnExp && !btnExp.dataset.rjBound) {
      btnExp.dataset.rjBound = '1';
      btnExp.addEventListener('click', () => this._advanceStep('experiment'));
    }
    // Analyze
    const btnYes = document.getElementById('rj-btn-analyze-yes');
    if (btnYes && !btnYes.dataset.rjBound) {
      btnYes.dataset.rjBound = '1';
      btnYes.addEventListener('click', () => this._analyze(true));
    }
    const btnNo = document.getElementById('rj-btn-analyze-no');
    if (btnNo && !btnNo.dataset.rjBound) {
      btnNo.dataset.rjBound = '1';
      btnNo.addEventListener('click', () => this._analyze(false));
    }
    // Record
    const btnRec = document.getElementById('rj-btn-record');
    if (btnRec && !btnRec.dataset.rjBound) {
      btnRec.dataset.rjBound = '1';
      btnRec.addEventListener('click', () => this._recordDiscovery());
    }
  }

  _advanceStep(stepKey) {
    if (!this.journal) return;
    const steps = STEPS;
    const current = this.journal.getCurrentStep();
    const idx = steps.indexOf(stepKey);
    const curIdx = steps.indexOf(current);
    if (idx === curIdx) {
      this.journal._advanceStep();
      this._render();
      this._bindButtons();
      this.game.ui?.showToast?.(`Research step advanced: ${stepKey}`);
    }
  }

  _submitHypothesis() {
    if (!this.journal) return;
    const input = document.getElementById('rj-hyp-input');
    const slider = document.getElementById('rj-hyp-slider');
    if (!input || !slider) return;
    const text = input.value.trim();
    if (!text) return;
    const confidence = parseFloat(slider.value) / 100;
    const hyp = this.journal.formHypothesis(text, confidence);
    if (hyp) {
      this.game.ui?.showToast?.('💡 Hypothesis recorded');
      input.value = '';
      this._render();
      this._bindButtons();
    }
  }

  _analyze(supported) {
    if (!this.journal) return;
    const conclusion = supported ? 'Results supported hypothesis' : 'Results did not support hypothesis';
    if (this.journal.analyzeResults(conclusion, supported)) {
      this.game.ui?.showToast?.(supported ? '✅ Hypothesis supported' : '❌ Hypothesis not supported');
      this._render();
      this._bindButtons();
    }
  }

  _recordDiscovery() {
    if (!this.journal) return;
    const titleInput = document.getElementById('rj-disc-title');
    const descInput = document.getElementById('rj-disc-desc');
    if (!titleInput || !descInput) return;
    const title = titleInput.value.trim();
    if (!title) return;
    const discovery = this.journal.recordDiscovery(title, descInput.value.trim(), 'minor');
    if (discovery) {
      this.game.ui?.showToast?.(`📖 Discovery recorded: ${title}`);
      titleInput.value = '';
      descInput.value = '';
      this._render();
      this._bindButtons();
    }
  }

  _render() {
    if (!this.journal || !this.modal) return;
    const progressEl = document.getElementById('research-progress-fill');
    const labelEl = document.getElementById('research-current-label');
    const progressTextEl = document.getElementById('research-progress-text');
    const hintEl = document.getElementById('research-step-hint');
    const contentEl = document.getElementById('research-content');

    if (!progressEl || !labelEl || !progressTextEl || !hintEl || !contentEl) return;

    const step = this.journal.getCurrentStep();
    const icon = STEP_ICONS[step] || '—';
    const lbl = STEP_LABELS[step];
    const progress = this.journal.getProgress();

    labelEl.textContent = lbl ? `${icon} ${lbl.mn} (${lbl.en})` : 'No active experiment';
    progressEl.style.width = `${progress}%`;
    progressTextEl.textContent = `${Math.round(progress)}%`;

    if (this.journal.isExperimentActive()) {
      hintEl.textContent = `Step ${this.journal.stepIndex + 1} of 7 — ${lbl?.en || ''}`;
      contentEl.innerHTML = this._renderActiveExperiment();
    } else {
      hintEl.textContent = 'No active experiment. Scan an organism or collect a sample to begin.';
      contentEl.innerHTML = this._renderDiscoveries();
    }
    this._bindButtons();
  }
}
