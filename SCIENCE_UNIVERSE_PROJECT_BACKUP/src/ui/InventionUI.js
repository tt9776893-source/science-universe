// SCIENCE UNIVERSE — FRONTIER
// InventionUI — self-contained modal UI for the Invention System
// Opens/closes with 'I' key, renders component assembly workflow,
// Mongolian labels, touch-friendly mobile layout.

const STEPS = ['select', 'assemble', 'validate', 'test', 'read', 'complete'];

const STEP_LABELS = {
  select: { en: 'Select Components', mn: 'Хэсгүүдээ сонгоно уу' },
  assemble: { en: 'Assemble Device', mn: 'Хүлэгт аಳ болгоно уу' },
  validate: { en: 'Validate', mn: 'Шалгаарай' },
  test: { en: 'Test Device', mn: 'Туршилт ажиллуулах' },
  read: { en: 'Read Sensor Data', mn: 'Өгөгдлүүдээр ажиллуулах' },
  complete: { en: 'Complete', mn: 'Үр дүн хүлээж байна' }
};

const STEP_ICONS = {
  select: '🧩',
  assemble: '🔧',
  validate: '✅',
  test: '🧪',
  read: '📊',
  complete: '🎉'
};

export class InventionUI {
  constructor(game, inventionSystem) {
    this.game = game;
    this.invention = inventionSystem;
    this.modal = null;
    this.isOpen = false;
    this._boundToggle = () => this.toggle();
    this._boundKeyDown = (e) => {
      if (e.code === 'KeyI') {
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
    this.game.isInventionOpen = true;
    this._ensureModal();
    this.modal.style.display = 'block';
    this._render();
    this.game.input?.exitPointerLock?.();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.game.isInventionOpen = false;
    if (this.modal) this.modal.style.display = 'none';
    if (!this.game.isAcademyOpen && !this.game.isInventoryOpen && !this.game.isPauseOpen && !this.game.isResearchOpen && !this.game.isInventionOpen && !this.game.isTutorialOpen) {
      this.game.input?.requestPointerLock?.();
    }
  }

  _ensureModal() {
    if (this.modal) return;
    const el = document.createElement('div');
    el.id = 'invention-modal';
    el.className = 'invention-modal';
    el.style.cssText = `
      display:none;position:fixed;inset:0;z-index:2000;
      background:rgba(10,15,25,0.92);font-family:system-ui,sans-serif;
      color:#e2f1ff;overflow:hidden;
    `;
    el.innerHTML = `
      <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;z-index:1;">
        <h2 style="margin:0;font-size:16px;">🔧 Invention Lab</h2>
        <button id="btn-close-invention" style="padding:6px 14px;background:#34d399;color:#080509;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">Close (I)</button>
      </div>
      <div style="position:absolute;top:50px;bottom:10px;left:10px;right:10px;overflow-y:auto;padding:12px;gap:10px;display:flex;flex-direction:column;">
        <div id="invention-progress" style="background:rgba(255,255,255,0.06);border-radius:8px;padding:10px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:3px;">
            <span id="invention-current-label">—</span><span id="invention-progress-text">—</span>
          </div>
          <div class="academy-progress-track"><div id="invention-progress-fill" class="academy-progress-fill" style="width:0%"></div></div>
          <div id="invention-step-hint" style="font-size:11px;color:#cbd5e1;margin-top:3px;"></div>
        </div>
        <div id="invention-content" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;"></div>
      </div>
    `;
    document.body.appendChild(el);
    this.modal = el;
    document.getElementById('btn-close-invention')?.addEventListener('click', () => this.close());
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
      #invention-modal { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }
      @media (max-width: 768px) {
        #invention-modal button.su-btn { min-height: 44px; }
      }
      @media (orientation: landscape) and (max-height: 500px) {
        #invention-modal { padding-top: 6px; padding-bottom: 6px; }
        #invention-modal > div > div { top: 46px; bottom: 6px; }
      }
    `;
    document.head.appendChild(style);
  }

  _render() {
    if (!this.invention || !this.modal) return;
    const progressEl = document.getElementById('invention-progress-fill');
    const labelEl = document.getElementById('invention-current-label');
    const progressTextEl = document.getElementById('invention-progress-text');
    const hintEl = document.getElementById('invention-step-hint');
    const contentEl = document.getElementById('invention-content');

    if (!progressEl || !labelEl || !progressTextEl || !hintEl || !contentEl) return;

    const step = this.invention.assemblyStep;
    const icon = STEP_ICONS[step] || '—';
    const lbl = STEP_LABELS[step];

    const total = STEPS.length;
    const curIdx = STEPS.indexOf(step);
    const progress = curIdx === -1 ? 0 : ((curIdx) / Math.max(total - 1, 1)) * 100;

    labelEl.textContent = lbl ? `${icon} ${lbl.mn} (${lbl.en})` : 'Invention Lab';
    progressEl.style.width = `${progress}%`;
    progressTextEl.textContent = `${Math.round(progress)}%`;

    hintEl.textContent = this._getStepHint(step);
    contentEl.innerHTML = this._renderContent(step);
    this._bindButtons();
  }

  _getStepHint(step) {
    switch (step) {
      case 'select': return 'Select components from inventory to build your planetary environmental sensor.';
      case 'assemble': return 'All components selected. Assemble the device.';
      case 'validate': return 'Validate power budget and component durability.';
      case 'test': return 'Test the assembled sensor on the current planet.';
      case 'read': return 'Review sensor readings and save results to journal.';
      case 'complete': return 'Invention complete! Results saved.';
      default: return '';
    }
  }

  _renderContent(step) {
    switch (step) {
      case 'select': return this._renderComponentSelection();
      case 'assemble': return this._renderAssemble();
      case 'validate': return this._renderValidation();
      case 'test': return this._renderTest();
      case 'read': return this._renderRead();
      case 'complete': return this._renderComplete();
      default: return this._renderComponentSelection();
    }
  }

  _renderComponentSelection() {
    const components = this.invention.getComponents();
    const required = this.invention.getRequiredComponents();

    const itemsHtml = required.map(cid => {
      const comp = components[cid];
      const selected = Boolean(this.invention.selectedComponents[cid]);
      const hasItem = this.invention.hasComponent(cid, 1);
      const bgColor = selected ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)';
      const borderColor = selected ? '#34d399' : (hasItem ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)');
      return `
        <div style="display:flex;align-items:center;gap:8px;padding:8px;background:${bgColor};border:2px solid ${borderColor};border-radius:8px;margin-bottom:6px;">
          <div style="font-size:20px;">${selected ? '✓' : '○'}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;">${comp.name_mn || comp.name}</div>
            <div style="font-size:11px;color:#94a3b8;">${comp.name} • ${comp.inventoryItemId}</div>
          </div>
          <button id="inv-btn-${cid}" class="su-btn ${selected ? 'secondary' : 'primary'}" ${!hasItem ? 'disabled' : ''} style="padding:4px 10px;font-size:12px;">
            ${selected ? 'Deselect' : 'Select'}
          </button>
        </div>
      `;
    }).join('');

    const complete = this.invention.isSelectionComplete();
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#34d399;">Components Required</div>
        ${itemsHtml}
        <div style="margin-top:10px;display:flex;gap:6px;">
          <button id="inv-btn-assemble" class="su-btn primary" ${!complete ? 'disabled' : ''} style="padding:8px 16px;font-size:13px;">Assemble Device</button>
          <button id="inv-btn-reset" class="su-btn secondary" style="padding:8px 16px;font-size:13px;">Reset</button>
        </div>
        <div style="margin-top:6px;font-size:11px;color:#94a3b8;">Select all required components from your inventory.</div>
      </div>
    `;
  }

  _renderAssemble() {
    const device = this.invention.assembledDevice;
    if (!device) return '<div>No device data.</div>';
    const totalPower = device.totalPowerDraw;
    const budget = device.powerBudget;
    const ok = totalPower <= budget;
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#34d399;">Device Assembled</div>
        <div style="margin-bottom:8px;">Total Power Draw: ${totalPower} / ${budget} ${ok ? '(OK)' : '(OVER BUDGET)'}</div>
        <div style="margin-bottom:8px;">Status: ${device.status}</div>
        <button id="inv-btn-validate" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Validate Device</button>
      </div>
    `;
  }

  _renderValidation() {
    const device = this.invention.assembledDevice;
    const vr = this.invention.validationResult;
    if (!device || !vr) return '<div>No validation data.</div>';
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:${vr.valid ? '#34d399' : '#f87171'};">
          ${vr.valid ? 'Validation Passed' : 'Validation Failed'}
        </div>
        <div style="margin-bottom:6px;">Power: ${vr.totalPowerDraw} / ${vr.powerBudget} kW ${vr.powerOk ? '✓' : '✗'}</div>
        <div style="margin-bottom:6px;">Components Durable: ${vr.allDurable ? '✓' : '✗'}</div>
        ${vr.valid ? '<button id="inv-btn-test" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Test Device</button>' : '<button id="inv-btn-reset" class="su-btn secondary" style="padding:8px 16px;font-size:13px;">Rebuild</button>'}
      </div>
    `;
  }

  _renderTest() {
    const device = this.invention.assembledDevice;
    if (!device) return '<div>No device data.</div>';
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#34d399;">Test Sensor on Planet</div>
        <div style="margin-bottom:8px;">Current Planet: ${this.game.currentPlanetId || 'mars'}</div>
        <button id="inv-btn-test-run" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Run Sensor Test</button>
      </div>
    `;
  }

  _renderRead() {
    const tr = this.invention.testResult;
    if (!tr) return '<div>No test results.</div>';
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;">
        <div style="font-size:12px;font-weight:700;margin-bottom:8px;color:#34d399;">Sensor Readings</div>
        <div style="margin-bottom:4px;">Planet: ${tr.planetName} (${tr.planetId})</div>
        <div style="margin-bottom:4px;">Temperature: ${tr.temperatureC.toFixed(1)} °C</div>
        <div style="margin-bottom:4px;">Pressure: ${tr.pressureKPa} kPa</div>
        <div style="margin-bottom:4px;">Gravity: ${tr.gravityMps2.toFixed(2)} m/s²</div>
        <div style="margin-bottom:4px;">Radiation: ${tr.radiation}</div>
        <div style="margin-bottom:4px;">Atmosphere: ${tr.atmosphereKind}</div>
        <button id="inv-btn-save" class="su-btn primary" style="padding:8px 16px;font-size:13px;">Save to Journal</button>
      </div>
    `;
  }

  _renderComplete() {
    return `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;text-align:center;">
        <div style="font-size:28px;margin-bottom:8px;">🎉</div>
        <div style="font-size:12px;font-weight:700;color:#34d399;">Invention Complete!</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Results saved to Research Journal.</div>
        <button id="inv-btn-close" class="su-btn primary" style="margin-top:8px;padding:8px 16px;font-size:13px;">Close</button>
      </div>
    `;
  }

  _bindButtons() {
    const modal = this.modal;
    if (!modal) return;

    // Component selection buttons
    const required = this.invention.getRequiredComponents();
    required.forEach(cid => {
      const btn = document.getElementById(`inv-btn-${cid}`);
      if (btn && !btn.dataset.invBound) {
        btn.dataset.invBound = '1';
        btn.addEventListener('click', () => {
          if (this.invention.selectedComponents[cid]) {
            this.invention.deselectComponent(cid);
          } else {
            this.invention.selectComponent(cid);
          }
          this._render();
        });
      }
    });

    const btnAssemble = document.getElementById('inv-btn-assemble');
    if (btnAssemble && !btnAssemble.dataset.invBound) {
      btnAssemble.dataset.invBound = '1';
      btnAssemble.addEventListener('click', () => {
        if (this.invention.assembleDevice()) this._render();
      });
    }

    const btnReset = document.getElementById('inv-btn-reset');
    if (btnReset && !btnReset.dataset.invBound) {
      btnReset.dataset.invBound = '1';
      btnReset.addEventListener('click', () => {
        this.invention.reset();
        this._render();
      });
    }

    const btnValidate = document.getElementById('inv-btn-validate');
    if (btnValidate && !btnValidate.dataset.invBound) {
      btnValidate.dataset.invBound = '1';
      btnValidate.addEventListener('click', () => {
        this.invention.validateDevice();
        this._render();
      });
    }

    const btnTest = document.getElementById('inv-btn-test');
    if (btnTest && !btnTest.dataset.invBound) {
      btnTest.dataset.invBound = '1';
      btnTest.addEventListener('click', () => {
        this.invention.testDevice();
        this._render();
      });
    }

    const btnTestRun = document.getElementById('inv-btn-test-run');
    if (btnTestRun && !btnTestRun.dataset.invBound) {
      btnTestRun.dataset.invBound = '1';
      btnTestRun.addEventListener('click', () => {
        this.invention.testDevice();
        this._render();
      });
    }

    const btnSave = document.getElementById('inv-btn-save');
    if (btnSave && !btnSave.dataset.invBound) {
      btnSave.dataset.invBound = '1';
      btnSave.addEventListener('click', () => {
        this.invention.saveResults();
        this._render();
        this.game.ui?.showToast?.('📖 Sensor data saved to journal');
      });
    }

    const btnClose = document.getElementById('inv-btn-close');
    if (btnClose && !btnClose.dataset.invBound) {
      btnClose.dataset.invBound = '1';
      btnClose.addEventListener('click', () => this.close());
    }
  }
}
