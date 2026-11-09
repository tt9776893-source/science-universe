import { document, window } from '../../ctx.js';
// SCIENCE UNIVERSE — FRONTIER
// TutorialUI — Mongolian-language interactive tutorial overlay
// Renders objective, controls, progress, hints, and navigation buttons.

const CONTROL_LABELS = {
  move: { en: 'WASD + Mouse', mn: 'WASD + Муус' },
  inventory: { en: 'Key I', mn: 'I товч' },
  equip_scanner: { en: 'Hotbar Slot 6', mn: 'Hotbar 6-слот' },
  scan: { en: 'Left Click', mn: 'Зүүн товч' },
  collect_sample: { en: 'Key 5 + Left Click', mn: '5 товч + Зүүн товч' },
  open_journal: { en: 'Key J', mn: 'J товч' },
  review_results: { en: 'Research Journal', mn: 'Шинжлэх журнал' },
  open_academy: { en: 'Main Menu', mn: 'Анхны цэс' },
  complete_experiment: { en: 'Answer Question', mn: 'Асуултд хариулна' },
  open_engineering: { en: 'Engineering Lab', mn: 'Инженер лаб' },
  assemble_sensor: { en: 'Select Components', mn: 'Хэсгүүдээ сонгоно' },
  validate_device: { en: 'Validate', mn: 'Шалгаарай' },
  test_sensor: { en: 'Test', mn: 'Туршилт' },
  save_invention: { en: 'Save to Journal', mn: 'Журнальд хадгална' },
  open_biology: { en: 'Biology Lab', mn: 'Биология лаб' },
  life_creation: { en: 'Seed Organism', mn: 'Түлхүүр өгсөн' },
  visit_rocket: { en: 'Walk to Rocket', mn: 'Рөвчтэй ярьна' },
  board_rocket: { en: 'Key E', mn: 'E товч' },
  save_progress: { en: 'Key K', mn: 'K товч' },
  next_mission: { en: 'Mission Control', mn: 'Миссийн баар' }
};

export class TutorialUI {
  constructor(game, tutorialSystem) {
    this.game = game;
    this.tutorial = tutorialSystem;
    this.modal = null;
    this.isOpen = false;
    this._boundKeyDown = (e) => {
      if (e.code === 'KeyH' && e.ctrlKey) {
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
    if (this.isOpen) this.close(); else this.open();
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.game.ui.isTutorialOpen = true;
    this._ensureModal();
    this.modal.style.display = 'block';
    this._render();
    this.game.input?.exitPointerLock?.();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.game.ui.isTutorialOpen = false;
    if (this.modal) this.modal.style.display = 'none';
    if (!this.game.isAcademyOpen && !this.game.isInventoryOpen && !this.game.isPauseOpen && !this.game.isResearchOpen && !this.game.isInventionOpen) {
      this.game.input?.requestPointerLock?.();
    }
  }

  _ensureModal() {
    if (this.modal) return;
    const el = document.createElement('div');
    el.id = 'tutorial-modal';
    el.className = 'tutorial-modal';
    el.style.cssText = `
      display:none;position:fixed;inset:0;z-index:2100;
      background:rgba(6,10,18,0.93);font-family:system-ui,sans-serif;
      color:#e2f1ff;overflow:hidden;pointer-events:auto;
    `;
    el.innerHTML = `
      <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="font-size:20px;">📚</div>
          <h2 style="margin:0;font-size:17px;">Туршилт (Tutorial)</h2>
        </div>
        <div style="display:flex;gap:6px;">
          <button id="tut-btn-skip" class="su-btn secondary" style="padding:5px 12px;font-size:12px;">Гэлжих (Skip)</button>
          <button id="tut-btn-close" class="su-btn secondary" style="padding:5px 12px;font-size:12px;">Гарах</button>
        </div>
      </div>
      <div style="position:absolute;top:60px;bottom:10px;left:10px;right:10px;overflow-y:auto;padding:16px;gap:12px;display:flex;flex-direction:column;">
        <!-- Mode toggle -->
        <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:12px;font-weight:600;color:#34d399;">Хэлбэр (Mode)</div>
          <button id="tut-btn-mode" class="su-btn primary" style="padding:6px 14px;font-size:12px;">Гүйцэтгэл (Guided)</button>
        </div>
        <!-- Progress -->
        <div id="tut-progress" style="background:rgba(255,255,255,0.06);border-radius:8px;padding:12px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;">
            <span id="tut-progress-label">Тоглоомын туршлага</span>
            <span id="tut-progress-text">0%</span>
          </div>
          <div class="academy-progress-track"><div id="tut-progress-fill" class="academy-progress-fill" style="width:0%"></div></div>
          <div id="tut-step-counter" style="font-size:11px;color:#cbd5e1;margin-top:3px;"></div>
        </div>
        <!-- Objective card -->
        <div id="tut-objective-card" style="background:linear-gradient(135deg,rgba(52,211,153,0.15),rgba(16,185,129,0.08));border-left:4px solid #34d399;border-radius:8px;padding:14px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span id="tut-step-icon" style="font-size:24px;">📍</span>
            <div>
              <div id="tut-step-label" style="font-size:15px;font-weight:700;">—</div>
              <div id="tut-step-label-mn" style="font-size:12px;color:#94a3b8;">—</div>
            </div>
          </div>
          <div id="tut-step-hint" style="font-size:13px;line-height:1.5;color:#e2f1ff;">—</div>
          <div id="tut-step-control" style="margin-top:8px;padding:6px 10px;background:rgba(0,0,0,0.3);border-radius:6px;display:inline-block;font-size:12px;font-weight:600;color:#00f0ff;">Цэс: —</div>
        </div>
        <!-- Controls hint -->
        <div id="tut-controls" style="background:rgba(255,255,255,0.03);border-radius:8px;padding:12px;display:none;">
          <div style="font-size:12px;font-weight:600;color:#34d399;margin-bottom:6px;">Управление (Controls)</div>
          <div id="tut-controls-list" style="font-size:12px;color:#cbd5e1;line-height:1.6;">—</div>
        </div>
        <!-- Navigation -->
        <div style="display:flex;justify-content:space-between;gap:8px;margin-top:auto;">
          <button id="tut-btn-prev" class="su-btn secondary" style="padding:8px 16px;font-size:13px;">Өмнөх</button>
          <button id="tut-btn-next" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Дараах</button>
          <button id="tut-btn-restart" class="su-btn secondary" style="padding:8px 16px;font-size:13px;">Шинээр эхлэх</button>
          <button id="tut-btn-help" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Тусламж (Help)</button>
        </div>
        <!-- Completed -->
        <div id="tut-completed" style="background:rgba(52,211,153,0.1);border-radius:8px;padding:16px;text-align:center;display:none;">
          <div style="font-size:32px;margin-bottom:8px;">🎉</div>
          <div style="font-size:14px;font-weight:700;color:#34d399;">Туршилт дууссан!</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Бүх үйлдлийг гүйцэтгэлээ.</div>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    this.modal = el;

    document.getElementById('tut-btn-close')?.addEventListener('click', () => this.close());
    document.getElementById('tut-btn-skip')?.addEventListener('click', () => { this.tutorial.skip(); this.close(); });
    document.getElementById('tut-btn-restart')?.addEventListener('click', () => { this.tutorial.restart(); this._render(); });
    document.getElementById('tut-btn-help')?.addEventListener('click', () => this._showHelp());
    document.getElementById('tut-btn-prev')?.addEventListener('click', () => this._prevStep());
    document.getElementById('tut-btn-next')?.addEventListener('click', () => this._nextStep());
    document.getElementById('tut-btn-mode')?.addEventListener('click', () => { this.tutorial.toggleMode(); this._render(); });

    el.addEventListener('keydown', (e) => { if (e.code === 'Escape') { e.preventDefault(); this.close(); } });
    el.setAttribute('tabindex', '-1');
    el.focus();

    // Safe area / mobile padding
    this._applySafeArea();
  }

  _applySafeArea() {
    const style = document.createElement('style');
    style.textContent = `
      #tutorial-modal { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
      @media (max-width: 768px) {
        #tutorial-modal button.su-btn { min-height: 44px; }
      }
      @media (orientation: landscape) and (max-height: 500px) {
        #tutorial-modal { padding-top: 6px; padding-bottom: 6px; }
        #tutorial-modal > div > div { top: 46px; bottom: 6px; }
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    if (!this.tutorial || !this.modal) return;
    const progress = this.tutorial.getProgress();
    const step = this.tutorial.getCurrentStep();

    // Progress
    const fillEl = document.getElementById('tut-progress-fill');
    const textEl = document.getElementById('tut-progress-text');
    const counterEl = document.getElementById('tut-step-counter');
    const labelEl = document.getElementById('tut-progress-label');

    if (fillEl) fillEl.style.width = `${progress.percent}%`;
    if (textEl) textEl.textContent = `${progress.percent}%`;
    if (counterEl) counterEl.textContent = `Тооцогдоно: ${progress.currentStepIndex + 1} / ${progress.totalSteps}`;
    if (labelEl) labelEl.textContent = progress.completed ? 'Туршилт дууссан' : 'Тоглоомын туршлага';

    // Mode button
    const modeBtn = document.getElementById('tut-btn-mode');
    if (modeBtn) modeBtn.textContent = progress.mode === 'guided' ? 'Гүйцэтгэл (Guided)' : 'Үнэн бүтээлч (Sandbox)';

    // Completed state
    const completedEl = document.getElementById('tut-completed');
    const objCard = document.getElementById('tut-objective-card');
    const controlsEl = document.getElementById('tut-controls');
    const prevBtn = document.getElementById('tut-btn-prev');
    const nextBtn = document.getElementById('tut-btn-next');
    const restartBtn = document.getElementById('tut-btn-restart');
    if (progress.completed) {
      completedEl.style.display = 'block';
      if (objCard) objCard.style.display = 'none';
      if (controlsEl) controlsEl.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (restartBtn) restartBtn.style.display = 'inline-block';
    } else {
      completedEl.style.display = 'none';
      if (objCard) objCard.style.display = 'block';
      if (controlsEl) controlsEl.style.display = 'block';
      if (prevBtn) prevBtn.style.display = step && step.index > 0 ? 'inline-block' : 'none';
      if (nextBtn) nextBtn.style.display = 'inline-block';
      if (restartBtn) restartBtn.style.display = 'inline-block';
    }

    if (step) {
      // Objective
      const iconEl = document.getElementById('tut-step-icon');
      const labelEl2 = document.getElementById('tut-step-label');
      const labelMnEl = document.getElementById('tut-step-label-mn');
      const hintEl = document.getElementById('tut-step-hint');
      const controlEl = document.getElementById('tut-step-control');

      const icons = { move:'🚶', inventory:'🎒', equip_scanner:'📡', scan:'🔍', collect_sample:'📦', open_journal:'📖', review_results:'📊', open_academy:'🏛️', complete_experiment:'🧪', open_engineering:'🔧', assemble_sensor:'🧩', validate_device:'✅', test_sensor:'🧪', save_invention:'💾', open_biology:'🧫', life_creation:'🧬', visit_rocket:'🚀', board_rocket:'👨‍🚀', save_progress:'💾', next_mission:'🎯' };
      if (iconEl) iconEl.textContent = icons[step.id] || '📍';
      if (labelEl2) labelEl2.textContent = step.label.en;
      if (labelMnEl) labelMnEl.textContent = step.label.mn;
      if (hintEl) hintEl.textContent = step.hint.mn + ' (' + step.hint.en + ')';
      if (controlEl) {
        const ctrl = CONTROL_LABELS[step.id];
        controlEl.textContent = ctrl ? `Цэс: ${ctrl.mn} (${ctrl.en})` : 'Цэс: —';
      }

      // Prev/next state
      const prevBtn = document.getElementById('tut-btn-prev');
      const nextBtn = document.getElementById('tut-btn-next');
      if (prevBtn) prevBtn.disabled = step.index === 0;
      if (nextBtn) nextBtn.disabled = progress.completed;
    }
  }

  _prevStep() {
    // Cannot go backwards in real progress, but allow reviewing earlier steps
    const tutorial = this.tutorial;
    const current = tutorial.currentStepIndex;
    if (current > 0) {
      tutorial.currentStepIndex = current - 1;
      tutorial._notifyUI();
      this._render();
    }
  }

  _nextStep() {
    // Manual advance - only if current step is completed
    const tutorial = this.tutorial;
    const step = tutorial.getCurrentStep();
    if (!step) return;
    if (tutorial.completedSteps.has(step.index)) {
      tutorial._advance();
      this._render();
    } else {
      this.game.ui?.showToast?.('Өмнөх үйлдлийг гүйцэтгэнэ үү');
    }
  }

  _showHelp() {
    const helpText = `
      <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:14px;">
        <div style="font-size:13px;font-weight:700;color:#34d399;margin-bottom:8px;">Туршилтын тухай (Tutorial Help)</div>
        <div style="font-size:12px;color:#cbd5e1;line-height:1.6; margin-bottom:8px;">
          • Turkshilt нь шинэ тоглогчдийн зориулго юм.<br/>
          • Бүх үйлдлийг үл урlags өмнөх үйлдлийг хийхээр шаардлагатай.<br/>
          • Gүйцэтгэл хэлбэрт шаг simultaneous боломжтой.<br/>
          • Үнэн бүтээлч хэлбэрт туршилт шигдэггүй.<br/>
          • H + Ctrl товч дээрээ цэсээ нээнэ боломжтой.
        </div>
        <button id="tut-btn-help-ok" class="su-btn primary" style="padding:6px 14px;font-size:12px;">Харих</button>
      </div>
    `;
    // Show help as a temporary overlay within modal
    const contentEl = document.getElementById('tutorial-modal')?.querySelector('div[style*="flex-direction:column"]');
    if (contentEl) {
      const helpEl = document.createElement('div');
      helpEl.style.cssText = 'position:absolute;inset:0;z-index:3;background:rgba(6,10,18,0.97);display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:auto;';
      helpEl.innerHTML = helpText;
      contentEl.appendChild(helpEl);
      document.getElementById('tut-btn-help-ok')?.addEventListener('click', () => helpEl.remove(), { once: true });
    }
  }

  // Called by TutorialSystem when state changes
  update() {
    if (this.isOpen) this._render();
  }
}
