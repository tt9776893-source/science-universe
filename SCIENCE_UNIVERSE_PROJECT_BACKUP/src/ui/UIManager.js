import { ITEM_DATABASE } from '../inventory/InventorySystem.js';
import { getItemIcon } from './ToolIcons.js';
import { audio } from '../audio/ProceduralAudio.js';
import { input } from '../core/InputManager.js';
import { HOTBAR_SLOTS, BUILDING_MODULES } from '../core/Constants.js';
import { SCIENCE_LABS } from '../education/ScienceAcademy.js';
import { clamp, DEFAULT_TRAITS, MulticellularOrganism, Species, roleDisplayName } from '../life/LifeEngine.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.toasts = [];
    this.isInventoryOpen = false;
    this.isPauseOpen = false;
    this.isAcademyOpen = false;
    this.isResearchOpen = false;
    this.isInventionOpen = false;
    this.isTutorialOpen = false;
    this.academyTab = 'labs';
    this.activeLabId = null;
    this.activeQuestionIndex = 0;
    this.academyFeedback = null;
    this.academyReturnToStart = false;
    this.selectedItem = null;

    this._bindDOM();
  }

  _bindDOM() {
    this.elO2Val = document.getElementById('hud-o2-val');
    this.elO2Bar = document.getElementById('hud-o2-bar');
    this.elPowerVal = document.getElementById('hud-power-val');
    this.elPowerBar = document.getElementById('hud-power-bar');
    this.elHealthVal = document.getElementById('hud-health-val');
    this.elHealthBar = document.getElementById('hud-health-bar');
    this.elTempVal = document.getElementById('hud-temp-val');
    this.elWaterVal = document.getElementById('hud-water-val');
    this.elFoodVal = document.getElementById('hud-food-val');

    this.elCoords = document.getElementById('hud-coords');
    this.elTime = document.getElementById('hud-time');
    this.elCompass = document.getElementById('hud-compass-text');
    this.elCompassNeedle = document.getElementById('hud-compass-needle');
    this.elFlashlight = document.getElementById('hud-flashlight-status');

    this.elTargetCard = document.getElementById('target-card');
    this.elTargetName = document.getElementById('target-name');
    this.elTargetSub = document.getElementById('target-sub');
    this.elTargetHp = document.getElementById('target-hp-bar');
    this.elTargetHpText = document.getElementById('target-hp-text');

    this.elHotbar = document.getElementById('hud-hotbar');

    this.elInventoryModal = document.getElementById('inventory-modal');
    this.elBackpackGrid = document.getElementById('inventory-backpack-grid');
    this.elModalHotbarGrid = document.getElementById('inventory-hotbar-grid');
    this.elItemDetails = document.getElementById('inventory-item-details');

    this.elPauseModal = document.getElementById('pause-modal');
    this.elAcademyModal = document.getElementById('science-academy-overlay');
    this.elAcademyContent = document.getElementById('academy-content');
    this.elNewGameModal = document.getElementById('new-game-confirm-modal');
    this.elToastContainer = document.getElementById('toast-container');
    this.elTouchControls = document.getElementById('touch-controls');
    this.isNewGameConfirmOpen = false;
    this._hotbarCache = new Array(HOTBAR_SLOTS).fill('');

    this._initPerformanceOverlay();
    this._setupHotbarDOM();
    this._setupModalButtons();
    this._setupAcademyUI();
    this._setupTouchControls();
  }

  _initPerformanceOverlay() {
    this.perfOverlay = document.createElement('div');
    this.perfOverlay.id = 'perf-overlay';
    this.perfOverlay.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      background: rgba(10, 16, 24, 0.88);
      border: 1px solid rgba(0, 240, 255, 0.4);
      border-radius: 6px;
      padding: 10px 14px;
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 11px;
      color: #e2f1ff;
      line-height: 1.5;
      z-index: 9999;
      pointer-events: none;
      display: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    `;
    document.body.appendChild(this.perfOverlay);
    this.isPerfOverlayVisible = false;

    // Rolling metrics
    this.perfFrameCount = 0;
    this.perfTimeAcc = 0;
    this.perfFpsCurrent = 60;
    this.perfFpsAvg = 60;
    this.perfFrameTime = 16.6;
    this.perfRemeshTime = 0;
    this.perfPhysicsTime = 0;
  }

  togglePerformanceOverlay(force) {
    this.isPerfOverlayVisible = (force !== undefined) ? force : !this.isPerfOverlayVisible;
    if (this.perfOverlay) {
      this.perfOverlay.style.display = this.isPerfOverlayVisible ? 'block' : 'none';
    }
    return this.isPerfOverlayVisible;
  }

  _setupHotbarDOM() {
    this.elHotbar.innerHTML = '';
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = `hotbar-slot ${i === 0 ? 'active' : ''}`;
      slot.id = `hotbar-slot-${i}`;
      const numLabel = (i + 1) === 10 ? '0' : (i + 1);
      slot.innerHTML = `
        <span class="slot-num">${numLabel}</span>
        <div class="slot-icon" id="hb-icon-${i}"></div>
        <span class="slot-count" id="hb-count-${i}"></span>
      `;
      slot.addEventListener('click', () => {
        this.game.inventory.setActiveHotbarIndex(i);
        this.updateHotbar();
      });
      this.elHotbar.appendChild(slot);
    }
  }

  _setupModalButtons() {
    document.getElementById('btn-close-inventory')?.addEventListener('click', () => this.toggleInventory(false));
    document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause(false));
    document.getElementById('btn-open-academy')?.addEventListener('click', () => this.openAcademy('labs'));

    document.getElementById('btn-save')?.addEventListener('click', () => {
      const res = this.game.saveSystem.save();
      this.refreshSaveSlotsUI();
      if (res.success) this.showToast(`💾 Progress saved to ${res.slotId.toUpperCase()}`);
    });

    document.getElementById('btn-load')?.addEventListener('click', () => {
      const res = this.game.saveSystem.load();
      this.refreshSaveSlotsUI();
      if (res.success) {
        this.showToast(`⚡ Loaded ${res.slotId.toUpperCase()} state`);
        this.togglePause(false);
      } else {
        this.showToast('⚠️ No save file found in this slot');
      }
    });

    // Restart Current Game (Safe lifecycle, preserves saved progress)
    document.getElementById('btn-restart-game')?.addEventListener('click', () => {
      if (this.game.restartCurrentGame) {
        this.game.restartCurrentGame();
      }
    });

    // Respawn to Safe Surface (Unstuck underground/geometry recovery)
    document.getElementById('btn-respawn')?.addEventListener('click', () => {
      if (this.game.respawnPlayer) {
        this.game.respawnPlayer();
      }
    });

    // New Game with Confirmation Dialog (Protects Original Save in Slot 1 + Backup)
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.openNewGameConfirmation();
    });

    document.getElementById('btn-cancel-new-game')?.addEventListener('click', () => {
      this.closeNewGameConfirmation();
    });

    document.getElementById('btn-confirm-new-game')?.addEventListener('click', () => {
      this.closeNewGameConfirmation();
      if (this.game.startNewGame) {
        this.game.startNewGame();
      }
    });

    // Save Slot Switcher (Return to Original Save Slot 1 or switch between expedition slots)
    document.querySelectorAll('.btn-save-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = btn.getAttribute('data-slot');
        if (slotId && this.game.switchSaveSlot) {
          this.game.switchSaveSlot(slotId);
          this.refreshSaveSlotsUI();
        }
      });
    });

    // Graphics Quality buttons
    document.querySelectorAll('.btn-gfx-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (preset && this.game.setGraphicsQuality) {
          this.game.setGraphicsQuality(preset);
          this.syncGraphicsPresetUI(preset);
          this.showToast(`Visual Quality set to: ${preset}`);
        }
      });
    });

    // Diagnostics & Terrain Repair
    document.getElementById('btn-toggle-wireframe')?.addEventListener('click', () => {
      const state = this.game.terrain.toggleWireframe();
      this.showToast(`Terrain Wireframe: ${state ? 'ENABLED' : 'DISABLED'}`);
    });

    document.getElementById('btn-toggle-chunks')?.addEventListener('click', () => {
      const state = this.game.terrain.toggleChunkBounds();
      this.showToast(`Chunk Bounding Boxes: ${state ? 'VISIBLE' : 'HIDDEN'}`);
    });

    document.getElementById('btn-reset-terrain')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset excavated terrain edits in the CURRENT slot back to the pristine planetary surface?')) {
        this.game.terrain.resetAllEdits(true);
        this.showToast('✅ Current slot terrain reset to pristine surface');
        this.togglePause(false);
      }
    });

    // Diagnostics Shortcuts (F4: Chunks, F7: Wireframe; F3 handled by InputManager.onPerformanceToggle)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'F4') {
        e.preventDefault();
        const state = this.game.terrain.toggleChunkBounds();
        this.showToast(`[F4] Chunk Bounds: ${state ? 'VISIBLE' : 'HIDDEN'}`);
      } else if (e.code === 'F7') {
        e.preventDefault();
        const state = this.game.terrain.toggleWireframe();
        this.showToast(`[F7] Wireframe: ${state ? 'ENABLED' : 'DISABLED'}`);
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        this.toggleResearchJournal();
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        this.toggleInventionUI();
      } else if (e.code === 'KeyH' && e.ctrlKey) {
        e.preventDefault();
        this.toggleTutorial();
      }
    });

    // Touch inventory button
    this._bindTouchButton('touch-btn-inv', () => this.toggleInventory());
  }

  _setupAcademyUI() {
    document.getElementById('btn-menu-academy')?.addEventListener('click', () => this.openAcademy('labs'));
    document.getElementById('btn-menu-mission-control')?.addEventListener('click', () => this.openAcademy('missions'));
    document.getElementById('btn-menu-space-explorer')?.addEventListener('click', () => {
      this.game.beginSession?.(false);
      this.game.enterSpaceflight('Mars');
    });
    document.getElementById('btn-menu-rocket-launch')?.addEventListener('click', () => this.game.launchRocketFromSurface?.());
    document.getElementById('btn-close-academy')?.addEventListener('click', () => this.closeAcademy());
    this.elAcademyModal?.addEventListener('click', (event) => {
      if (event.target === this.elAcademyModal) this.closeAcademy();
    });

    document.querySelectorAll('[data-academy-tab]').forEach((button) => {
      button.addEventListener('click', () => this.openAcademy(button.dataset.academyTab));
    });

    window.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && this.isAcademyOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.closeAcademy();
      }
    });
  }

  openAcademy(tab = 'labs', labId = null) {
    this.academyReturnToStart = document.getElementById('start-prompt')?.style.display !== 'none';
    const startPrompt = document.getElementById('start-prompt');
    if (startPrompt) startPrompt.style.display = 'none';
    if (this.elPauseModal) this.elPauseModal.classList.remove('visible');
    this.isPauseOpen = false;
    this.isAcademyOpen = true;
    this.activeLabId = this.game.academy?.getLab(labId) ? labId : null;
    this.academyTab = this.activeLabId ? 'labs' : (['labs', 'academy', 'life', 'missions'].includes(tab) ? tab : 'labs');
    if (this.activeLabId) {
      const lab = this.game.academy.getLab(this.activeLabId);
      const state = this.game.academy.getState();
      const firstIncomplete = lab.questions.findIndex((_, index) => !state.answers[`${lab.id}:${index}`]?.correct);
      this.activeQuestionIndex = firstIncomplete === -1 ? 0 : firstIncomplete;
    }
    this.academyFeedback = null;
    input.exitPointerLock();
    this.elAcademyModal?.classList.add('visible');
    this._renderAcademy();
    this._syncGamePauseFlag();
  }

  closeAcademy(restore = true) {
    this.isAcademyOpen = false;
    this._stopLifeAnimLoop();
    this.elAcademyModal?.classList.remove('visible');
    const startPrompt = document.getElementById('start-prompt');
    if (restore && this.academyReturnToStart && startPrompt) {
      startPrompt.style.display = 'flex';
    } else if (restore && !this.isPauseOpen && !this.isInventoryOpen) {
      input.requestPointerLock();
    }
    this.academyReturnToStart = false;
    this._syncGamePauseFlag();
  }

  _renderAcademy() {
    if (!this.elAcademyContent || !this.game.academy) return;
    document.querySelectorAll('[data-academy-tab]').forEach((button) => {
      button.classList.toggle('active', button.dataset.academyTab === this.academyTab);
    });
    const state = this.game.academy.getState();
    const missions = this.game.academy.getMissionObjectives();
    const completedCount = state.completedLabs.length;
    const progressPercent = Math.round((completedCount / SCIENCE_LABS.length) * 100);
    const stats = `
      <div class="academy-stats">
        <div class="academy-stat"><strong>${state.xp}</strong><span>Research XP</span></div>
        <div class="academy-stat"><strong>${completedCount}/${SCIENCE_LABS.length}</strong><span>Labs completed</span></div>
        <div class="academy-stat"><strong>${state.fieldSamples}</strong><span>Field samples</span></div>
      </div>
      <div class="academy-progress-track"><div class="academy-progress-fill" style="width:${progressPercent}%"></div></div>`;

    if (this.activeLabId) {
      this._renderLabAssessment(state, stats);
      return;
    }

    if (this.academyTab === 'missions') {
      this.elAcademyContent.innerHTML = `${stats}
        <div class="academy-section-heading"><h3>Mission Control</h3><span class="academy-muted">${missions.filter((mission) => mission.complete).length}/${missions.length} objectives</span></div>
        <div class="academy-objectives">${missions.map((mission) => `
          <div class="academy-objective ${mission.complete ? 'complete' : ''}"><span>${mission.complete ? 'COMPLETE' : 'PENDING'}</span><span>${mission.title}</span></div>`).join('')}
        </div>
        <p class="academy-muted">Launch is available from the hub when the surface rocket is ready. Space Explorer opens the existing solar-system flight simulator.</p>
        <div class="academy-actions">
          <button class="su-btn secondary" data-academy-action="surface">Deploy to Mars</button>
          <button class="su-btn secondary" data-academy-action="space">Space Explorer</button>
          <button class="su-btn primary" data-academy-action="launch">Launch Surface Rocket</button>
        </div>`;
      this._bindAcademyActions();
      return;
    }

    if (this.academyTab === 'life') {
      this._renderLifeLab(stats);
      return;
    }

    if (this.academyTab === 'academy') {
      this.elAcademyContent.innerHTML = `${stats}
        <div class="academy-section-heading"><h3>Science Academy</h3><span class="academy-muted">${state.xp} XP earned</span></div>
        <p class="academy-muted">Complete short assessments to earn research XP. Each lab requires at least two correct answers. Incorrect answers can be retried, and progress is saved independently for each expedition slot.</p>
        <div class="academy-section-heading"><h3>Curriculum</h3></div>
        <div class="academy-lab-list">${SCIENCE_LABS.map((lab) => `
          <button class="academy-lab-row" data-lab-id="${lab.id}"><span>${lab.name}<small>${lab.field}</small></span><strong>${state.completedLabs.includes(lab.id) ? 'DONE' : 'OPEN'}</strong></button>`).join('')}
        </div>`;
      this._bindAcademyActions();
      return;
    }

    this.elAcademyContent.innerHTML = `${stats}
      <div class="academy-section-heading"><h3>Research Laboratories</h3><span class="academy-muted">Choose a lab</span></div>
      <div class="academy-lab-list">${SCIENCE_LABS.map((lab) => {
        const answered = lab.questions.filter((_, index) => state.answers[`${lab.id}:${index}`]).length;
        const complete = state.completedLabs.includes(lab.id);
        return `<button class="academy-lab-row" data-lab-id="${lab.id}"><span>${lab.name}<small>${lab.field}</small></span><strong>${complete ? 'DONE' : `${answered}/3`}</strong></button>`;
      }).join('')}
      </div>
      <div class="academy-section-heading"><h3>Mission Control</h3><span class="academy-muted">${missions.filter((mission) => mission.complete).length}/${missions.length} objectives</span></div>
      <div class="academy-objectives">${missions.map((mission) => `
        <div class="academy-objective ${mission.complete ? 'complete' : ''}"><span>${mission.complete ? 'COMPLETE' : 'PENDING'}</span><span>${mission.title}</span></div>`).join('')}
      </div>
      <div class="academy-actions">
        <button class="su-btn secondary" data-academy-action="space">Space Explorer</button>
        <button class="su-btn primary" data-academy-action="launch">Launch Surface Rocket</button>
      </div>`;
    this._bindAcademyActions();
  }

  _renderLabAssessment(state, stats) {
    const lab = this.game.academy.getLab(this.activeLabId);
    if (!lab) {
      this.activeLabId = null;
      this._renderAcademy();
      return;
    }
    const answers = lab.questions.map((_, index) => state.answers[`${lab.id}:${index}`]);
    const correctCount = answers.filter((answer) => answer?.correct).length;
    const currentQuestion = lab.questions[this.activeQuestionIndex];
    const savedAnswer = state.answers[`${lab.id}:${this.activeQuestionIndex}`];
    const feedback = this.academyFeedback?.questionIndex === this.activeQuestionIndex
      ? this.academyFeedback
      : (savedAnswer ? { correct: savedAnswer.correct, explanation: currentQuestion.explanation } : null);
    const isComplete = state.completedLabs.includes(lab.id);
    this.elAcademyContent.innerHTML = `${stats}
      <div class="academy-question">
        <div class="academy-section-heading"><span class="academy-muted">${lab.name}</span><span class="academy-muted">Question ${this.activeQuestionIndex + 1} of ${lab.questions.length} | ${correctCount} correct</span></div>
        <p class="academy-muted">${lab.field}</p>
        <div class="academy-progress-track"><div class="academy-progress-fill" style="width:${Math.round(((this.activeQuestionIndex + 1) / lab.questions.length) * 100)}%"></div></div>
        <h3>${currentQuestion.prompt}</h3>
        <div class="academy-choice-list">${currentQuestion.choices.map((choice, index) => `
          <button class="academy-choice" data-answer-index="${index}" ${savedAnswer?.correct ? 'disabled' : ''}>${choice}</button>`).join('')}
        </div>
        ${feedback ? `<div class="academy-feedback ${feedback.correct ? 'correct' : ''}">${feedback.correct ? 'Correct.' : 'Not quite.'} ${feedback.explanation}</div>` : ''}
        ${isComplete ? '<div class="academy-feedback correct">Lab assessment complete. Research XP has been added to your profile.</div>' : ''}
        <div class="academy-actions">
          <button class="su-btn secondary" data-academy-action="back">Back to labs</button>
          ${feedback && !isComplete ? `<button class="su-btn primary" data-academy-action="next">${this._getNextQuestionIndex(answers, this.activeQuestionIndex) < 0 ? 'Review missed answer' : 'Continue'}</button>` : ''}
          ${feedback && !feedback.correct && !isComplete ? '<span class="academy-muted">Choose again to retry this question.</span>' : ''}
        </div>
      </div>`;
    this._bindAcademyActions();
    this.elAcademyContent.querySelectorAll('[data-answer-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const result = this.game.academy.answerQuestion(lab.id, this.activeQuestionIndex, Number(button.dataset.answerIndex));
        this.academyFeedback = { ...result, questionIndex: this.activeQuestionIndex };
        if (result.completed) this.showToast(`${lab.name} assessment complete`);
        else if (result.correct && result.xpAwarded) this.showToast(`+${result.xpAwarded} research XP`);
        this._renderAcademy();
      });
    });
  }

  _getNextQuestionIndex(answers, currentIndex) {
    const nextUnanswered = answers.findIndex((answer, index) => index > currentIndex && !answer);
    if (nextUnanswered !== -1) return nextUnanswered;
    const earlierUnanswered = answers.findIndex((answer) => !answer);
    if (earlierUnanswered !== -1) return earlierUnanswered;
    return answers.findIndex((answer) => !answer?.correct);
  }

  _renderLifeLab(stats) {
    const academy = this.game.academy;
    if (!academy) return;
    const unlocked = academy.isLifeEngineUnlocked();
    if (!unlocked) {
      this.elAcademyContent.innerHTML = `${stats}
        <div class="academy-section-heading"><h3>Амьдрал үүсгэх туршилт</h3><span class="academy-muted">LOCKED</span></div>
        <p class="academy-muted">Биологийн progression labs-г дуусгаж Life Engine-г өрөнгөөлөхөд зориугдсан.</p>
        <div class="academy-objectives">
          ${['biology', 'cell-biology', 'genetics', 'ecosystems', 'origin-of-life'].map((labId) => {
            const lab = academy.getLab(labId);
            const done = academy.getState().completedLabs.includes(labId);
            return `<div class="academy-objective ${done ? 'complete' : ''}"><span>${done ? 'COMPLETE' : 'PENDING'}</span><span>${lab ? lab.name : labId}</span></div>`;
          }).join('')}
        </div>`;
      this._bindAcademyActions();
      return;
    }

    const engine = academy.getOrCreateLifeEngine();
    const state = engine.getState();
    const env = state.environment;
    const pop = state.population;
    const running = state.running;
    const selected = this._lifeSelectedId ? engine.getOrganism(this._lifeSelectedId) : null;

    this._startLifeAnimLoop();

    // Phase 12: Civilization state.
    const civUnlocked = academy.isCivilizationUnlocked && academy.isCivilizationUnlocked();
    const civ = civUnlocked ? academy.getOrCreateCivilizationEngine() : null;
    const civState = civ ? civ.getState() : null;

    const traitDist = pop.traitDistribution || {};
    const traitRows = Object.keys(DEFAULT_TRAITS).map((key) => {
      const s = traitDist[key];
      if (!s) return '';
      return `<div class="life-trait-row"><span class="life-trait-name">${this._traitLabel(key)}</span><span class="life-trait-min">${s.min.toFixed(2)}</span><span class="life-trait-mean">${s.mean.toFixed(2)}</span><span class="life-trait-max">${s.max.toFixed(2)}</span><div class="life-trait-bar" style="width:${Math.round((s.mean / Math.max(s.max, 0.01)) * 100)}%"></div></div>`;
    }).join('');

    const history = state.history || [];
    const popPoints = history.map((h, i) => `${i * 12},${100 - Math.round((h.population / Math.max(state.maxOrganisms, 1)) * 90)}`).join(' ');
    const divPoints = history.map((h, i) => `${i * 12},${100 - Math.round((h.geneticDiversity || 0) * 90)}`).join(' ');

    // Multicellular stats.
    const multiCount = pop.multicellularCount || 0;
    const uniCount = pop.unicellularCount || 0;
    const cellCount = pop.cellCount || 0;

    this.elAcademyContent.innerHTML = `${stats}
      <style>
        .life-lab-grid{display:grid;grid-template-columns:260px 1fr;gap:10px;align-items:start;}
        .life-lab-controls{display:flex;flex-direction:column;gap:8px;}
        .life-lab-panel{display:flex;flex-direction:column;gap:10px;min-width:260px;}
        .life-canvas{max-width:100%;height:auto;display:block;margin:0 auto;background:#050a0e;border-radius:8px;border:1px solid rgba(255,255,255,0.08);cursor:grab;touch-action:none;}
        .life-canvas:active{cursor:grabbing;}
        .life-inspector{display:flex;flex-direction:column;gap:6px;font-size:13px;background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);}
        .life-stats{display:flex;flex-direction:column;gap:6px;}
        .life-trait-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .life-trait-row{display:flex;align-items:center;gap:6px;font-size:12px;background:rgba(255,255,255,0.03);padding:6px;border-radius:4px;}
        .life-trait-name{flex:0 0 95px;color:#94a3b8;}
        .life-trait-min,.life-trait-mean,.life-trait-max{flex:0 0 42px;color:#cbd5e1; font-variant-numeric: tabular-nums;}
        .life-trait-bar{flex:1;height:6px;background:#334155;border-radius:3px;overflow:hidden;}
        .life-trait-bar::before{content:'';display:block;height:100%;background:#60a5fa;width:100%;}
        .life-log{font-size:12px;color:#94a3b8;max-height:120px;overflow-y:auto;}
        .life-log-line{margin:2px 0;}
        .life-evolution-graph{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);}
        .life-sparkline{width:100%;height:100px;display:block;}
        .life-sparkline path{fill:none;stroke:#60a5fa;stroke-width:1.5;}
        .life-sparkline path.div-line{stroke:#f472b6;}
        .life-multi-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);}
        .life-multi-stats{display:flex;gap:10px;font-size:12px;color:#cbd5e1;justify-content:space-between;}
        .life-multi-stat{text-align:center;}
        .life-multi-stat-value{display:block;font-size:16px;font-weight:bold;color:#60a5fa;}
        .life-food-web{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);font-size:12px;}
        .life-food-web-row{display:flex;justify-content:space-between;gap:8px;margin:4px 0;padding:4px;background:rgba(255,255,255,0.03);border-radius:4px;}
        .life-food-web-label{flex:1;color:#94a3b8;}
        .life-food-web-value{flex:0 0 60px;color:#cbd5e1;font-variant-numeric: tabular-nums;}
        @media (max-width:640px){
          .life-lab-grid{grid-template-columns:1fr;}
          .life-lab-panel{min-width:auto;}
          .life-canvas{width:100%;height:auto;max-width:none;max-height:none;}
          .life-trait-grid{grid-template-columns:1fr;}
          .life-multi-stats{flex-direction:column;gap:4px;}
          .life-multi-stat{text-align:left;}
        }
        /* Step 10: Species panel styles. */
        .life-species-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;}
        .life-species-list{display:flex;flex-direction:column;gap:4px;}
        .life-species-row{display:flex;justify-content:space-between;gap:8px;padding:4px 6px;background:rgba(255,255,255,0.03);border-radius:4px;font-size:11px;}
        .life-species-name{color:#cbd5e1;flex:1;}
        .life-species-count{flex:0 0 30px;color:#60a5fa;font-variant-numeric:tabular-nums;}
        .life-species-gen{flex:0 0 40px;color:#94a3b8;}
        .life-species-status{flex:0 0 55px;text-align:right;font-weight:bold;}
        .life-species-extinct{opacity:0.5;}
        .life-species-extinct .life-species-name{text-decoration:line-through;}
        /* Step 10: Environment panel styles. */
        .life-env-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;}
        .life-env-row{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:11px;color:#cbd5e1;}
        .life-env-row span:first-child{color:#94a3b8;}
        @media (max-width:640px){
          .life-species-panel,.life-env-panel{margin-top:8px;}
        }
        /* Step 11: Nervous system panel styles. */
        .life-neural-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;}
        .life-neural-row{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:11px;color:#cbd5e1;}
        .life-neural-row span:first-child{color:#94a3b8;}
        /* Step 11: Memory panel styles. */
        .life-memory-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;}
        .life-mem-row{display:flex;justify-content:space-between;gap:8px;padding:3px 0;font-size:11px;color:#cbd5e1;}
        .life-mem-row span:first-child{color:#94a3b8;}
        @media (max-width:640px){
          .life-neural-panel,.life-memory-panel{margin-top:8px;}
        }
        /* Step 11: Evolutionary tree panel styles. */
        .life-tree-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;font-size:11px;}
        .life-tree-header{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#94a3b8;}
        .life-tree-node{display:flex;align-items:center;gap:6px;padding:3px 5px;background:rgba(255,255,255,0.03);border-radius:4px;margin:2px 0;font-size:10px;}
        .life-tree-node-active{border-left:2px solid #60a5fa;}
        .life-tree-node-parent{color:#cbd5e1;}
        .life-tree-node-child{color:#94a3b8;padding-left:14px;}
        .life-tree-btn{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1;padding:2px 6px;border-radius:3px;font-size:10px;cursor:pointer;}
        .life-tree-btn:hover{background:rgba(255,255,255,0.15);}
        .life-tree-empty{color:#64748b;font-style:italic;}
        .life-tree-lineage{color:#94a3b8;font-size:9px;}
        /* Step 11: Selective breeding panel styles. */
        .life-breed-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;font-size:11px;}
        .life-breed-header{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#94a3b8;}
        .life-breed-parent{display:flex;flex-direction:column;gap:4px;padding:6px;background:rgba(255,255,255,0.03);border-radius:4px;border:1px solid transparent;}
        .life-breed-parent-selected{border-color:#60a5fa;background:rgba(96,165,250,0.1);}
        .life-breed-parent-label{color:#94a3b8;font-size:9px;margin-bottom:2px;}
        .life-breed-parent-trait{display:flex;justify-content:space-between;gap:4px;font-size:9px;color:#cbd5e1;margin:1px 0;}
        .life-breed-compat{margin:6px 0;padding:4px;border-radius:4px;font-size:10px;}
        .life-breed-compat-good{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);}
        .life-breed-compat-bad{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3);}
        .life-breed-compat-neutral{background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3);}
        .life-breed-offspring{margin-top:6px;padding:4px;background:rgba(255,255,255,0.03);border-radius:4px;}
        .life-breed-offspring-trait{display:flex;justify-content:space-between;gap:4px;font-size:9px;color:#cbd5e1;margin:1px 0;}
        /* Step 11: Dynamic communication panel styles. */
        .life-comm-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;font-size:11px;}
        .life-comm-header{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#94a3b8;}
        .life-comm-row{display:flex;justify-content:space-between;gap:8px;padding:3px 0;color:#cbd5e1;}
        .life-comm-row span:first-child{color:#94a3b8;}
        .life-comm-medium{font-weight:bold;}
        .life-comm-medium-none{color:#ef4444;}
        .life-comm-medium-limited{color:#fbbf24;}
        .life-comm-medium-good{color:#34d399;}
        .life-comm-methods{margin-top:6px;font-size:9px;color:#64748b;}
        @media (max-width:640px){
          .life-tree-panel,.life-breed-panel,.life-comm-panel{margin-top:8px;}
        }
        /* Phase 12: Civilization panel styles. */
        .life-civ-panel{background:rgba(15,23,32,0.6);padding:10px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);margin-top:10px;font-size:11px;}
        .life-civ-header{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#94a3b8;}
        .life-civ-stat{display:flex;justify-content:space-between;gap:8px;padding:3px 0;color:#cbd5e1;}
        .life-civ-stat span:first-child{color:#94a3b8;}
        .life-civ-stat-value{font-variant-numeric:tabular-nums;}
        .life-civ-locked{color:#ef4444;font-weight:bold;}
        .life-civ-unlocked{color:#34d399;font-weight:bold;}
        .life-civ-group{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:4px;padding:6px;margin:4px 0;font-size:10px;}
        .life-civ-group-title{display:flex;justify-content:space-between;margin-bottom:2px;color:#cbd5e1;}
        .life-civ-group-members{color:#60a5fa;font-size:9px;}
        .life-civ-settlement{background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);border-radius:4px;padding:6px;margin:4px 0;font-size:10px;}
        .life-civ-settlement-title{display:flex;justify-content:space-between;margin-bottom:2px;color:#4ade80;}
        .life-civ-tech{color:#fbbf24;font-size:9px;}
        .life-civ-empty{color:#64748b;font-style:italic;}
        .life-civ-actions{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
        .life-civ-actions .su-btn{font-size:11px;padding:4px 8px;}
        /* Step 13: Research field bars. */
        .life-civ-fields{display:flex;flex-direction:column;gap:4px;}
        .life-civ-field-row{display:flex;align-items:center;gap:8px;font-size:11px;background:rgba(255,255,255,0.03);padding:4px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);}
        .life-civ-field-label{flex:0 0 110px;color:#cbd5e1;}
        .life-civ-field-value{flex:0 0 90px;color:#94a3b8;font-size:10px;}
        .life-civ-field-bar{flex:1;height:8px;background:#334155;border-radius:4px;overflow:hidden;}
        .life-civ-field-fill{height:100%;background:#60a5fa;width:0%;transition:none;}
        .life-civ-field-pct{flex:0 0 32px;color:#60a5fa;font-variant-numeric:tabular-nums;font-size:10px;}
        /* Step 13: Technology tree rows. */
        .life-civ-tech-list{display:flex;flex-direction:column;gap:6px;}
        .life-civ-tech{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:6px;font-size:10px;}
        .life-civ-tech-header{display:flex;justify-content:space-between;gap:6px;margin-bottom:2px;}
        .life-civ-tech-name{color:#fbbf24;font-weight:bold;}
        .life-civ-tech-status{font-weight:bold;font-size:9px;}
        .life-civ-tech-unlocked .life-civ-tech-status{color:#34d399;}
        .life-civ-tech-available .life-civ-tech-status{color:#fbbf24;}
        .life-civ-tech-locked .life-civ-tech-status{color:#94a3b8;}
        .life-civ-tech-field{color:#94a3b8;font-size:8px;margin-bottom:2px;}
        .life-civ-tech-prereq{color:#64748b;font-size:8px;margin-bottom:2px;}
        .life-civ-tech-progress{display:flex;align-items:center;gap:6px;margin-bottom:2px;}
        .life-civ-tech-bar{flex:1;height:6px;background:#334155;border-radius:3px;overflow:hidden;}
        .life-civ-tech-fill{height:100%;background:#fbbf24;width:0%;transition:none;}
        .life-civ-tech-pct{flex:0 0 28px;color:#cbd5e1;font-variant-numeric:tabular-nums;font-size:9px;}
        .life-civ-tech-cost{color:#94a3b8;font-size:8px;margin-bottom:2px;}
        .life-civ-tech-desc{color:#64748b;font-size:8px;font-style:italic;}
        /* Step 13: Settlement infrastructure rows. */
        .life-civ-infra{display:grid;grid-template-columns:1fr 1fr;gap:2px 6px;font-size:9px;margin-top:2px;}
        .life-civ-infra-row{display:flex;justify-content:space-between;color:#cbd5e1;}
        .life-civ-yes{color:#34d399;font-weight:bold;}
        .life-civ-no{color:#ef4444;font-weight:bold;}
        /* Step 13: Milestones & events. */
        .life-civ-milestones{display:flex;flex-direction:column;gap:2px;}
        .life-civ-events{display:flex;flex-direction:column;gap:1px;}
        @media (max-width:640px){
          .life-civ-field-label{flex:0 0 90px;}
          .life-civ-tech-list{gap:4px;}
          .life-civ-tech{padding:4px;}
          .life-civ-infra{grid-template-columns:1fr;}
        }
      </style>
      <div class="academy-section-heading"><h3>Эвольюцийн лаборатори</h3><span class="academy-muted">${running ? 'SIMULATING' : 'STANDBY'}</span></div>
      <div class="academy-feedback" style="border-left-color:#ff9900; background:rgba(255,153,0,0.1); padding:10px; margin:10px 0;">ЗААНУУД ШАТ: genetic mutation, natural selection, and multicellularity are educational models, not established fact.</div>
      <p class="academy-muted">Цэцэрлэг, energ-iйн нөхцөлд тохируулна уу. Organism-уудын genetic traits-г хараж, mutation rate-ээ өөрчлөн байна. Багцтай organism-уудыг үүсгэж боломжтой.</p>
      <div class="life-lab-grid">
        <div class="life-lab-controls">
          ${this._renderLifeSlider('water', '💧 Цэцэрлэг', env.water)}
          ${this._renderLifeSlider('temperature', '🌡️ Тэмперэтур', env.temperature)}
          ${this._renderLifeSlider('energy', '⚡ Energ-i', env.energy)}
          ${this._renderLifeSlider('minerals', '🪨 Minerals', env.minerals)}
          <div class="life-slider-row">
            <div class="life-slider-label"><span>🧬 Mutation rate</span><strong>${(state.mutationRate * 100).toFixed(0)}%</strong></div>
            <input type="range" min="0" max="500" value="${Math.round(state.mutationRate * 1000)}" data-life-input="mutationRate" class="life-slider" />
          </div>
          <div class="life-slider-row">
            <div class="life-slider-label"><span>🔬 Sim speed</span><strong>${Math.round(state.speed * 100)}%</strong></div>
            <input type="range" min="0" max="1000" value="${Math.round(state.speed * 100)}" data-life-input="speed" class="life-slider" />
          </div>
        </div>
        <div class="life-lab-panel">
          <canvas id="life-canvas" class="life-canvas" style="width:100%;max-width:420px;height:auto;max-height:340px;cursor:grab;" data-life-dpr="1"></canvas>
          <div class="life-inspector">
            ${selected ? this._renderLifeInspector(selected, state) : `<div class="academy-muted">Select a cell to inspect its genome.</div><div class="life-trait-grid">${traitRows}</div>`}
          </div>
          <div class="life-stats">
            <div class="academy-progress-track"><div class="academy-progress-fill" style="width:${Math.min(100, pop.count / state.maxOrganisms * 100)}%"></div></div>
            <div class="academy-muted">Population: ${pop.count} / ${state.maxOrganisms}</div>
            <div class="life-multi-panel">
              <div class="life-multi-stats">
                <div class="life-multi-stat"><span class="life-multi-stat-value">${uniCount}</span><span>Unicellular</span></div>
                <div class="life-multi-stat"><span class="life-multi-stat-value">${multiCount}</span><span>Multicellular</span></div>
                <div class="life-multi-stat"><span class="life-multi-stat-value">${cellCount}</span><span>Cells in Groups</span></div>
              </div>
            </div>
            <div class="academy-muted">Generation: ${pop.avgGeneration.toFixed(1)} | Genetic Diversity: ${(pop.geneticDiversity * 100).toFixed(1)}%</div>
            <div class="academy-muted">Avg Energy: ${pop.avgEnergy.toFixed(1)} | Avg Size: ${pop.avgSize.toFixed(2)}</div>
            <div class="academy-muted">Avg Membrane: ${pop.avgMembrane.toFixed(2)} | Avg Metabolism: ${pop.avgMetabolism.toFixed(2)}</div>
            <div class="academy-muted">Avg Motility: ${pop.avgMotility?.toFixed(2) || '0.00'} | Avg Sensory: ${pop.avgSensory?.toFixed(2) || '0.00'}</div>
            <div class="academy-feedback">Status: <strong>${running ? 'RUNNING' : 'IDLE'}</strong></div>
            <div class="life-evolution-graph">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:4px;"><span>Population</span><span>Genetic Diversity</span></div>
              <svg class="life-sparkline" viewBox="0 0 ${Math.max(60, history.length * 12)} 100" preserveAspectRatio="none">
                <polyline points="${popPoints}" class="pop-line" />
                <polyline points="${divPoints}" class="div-line" />
              </svg>
            </div>
            <div class="life-log">
              ${history.slice(-5).reverse().map((h) => `<div class="life-log-line">• t=${Math.round(h.t)} pop=${h.population} births=${h.births} deaths=${h.deaths}</div>`).join('') || '<div class="academy-muted">No events yet.</div>'}
            </div>

            <!-- Step 10: Species list -->
            <div class="life-species-panel">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:6px;">
                <span>Заннууд (Species)</span><span>${state.species?.activeCount || 0} active / ${state.species?.extinctCount || 0} extinct</span>
              </div>
              <div class="life-species-list">
                ${(state.species?.species || []).slice(0, 8).map(s => {
                  const isExtinct = s.isExtinct;
                  const roleColor = s.memberCount > 0 ? '#60a5fa' : '#94a3b8';
                  return `
                    <div class="life-species-row${isExtinct ? ' life-species-extinct' : ''}">
                      <span class="life-species-name">${s.name}</span>
                      <span class="life-species-count">${s.memberCount}</span>
                      <span class="life-species-gen">Gen ${s.generation}</span>
                      <span class="life-species-status" style="color:${isExtinct ? '#ef4444' : roleColor}">${isExtinct ? 'EXTINCT' : 'ACTIVE'}</span>
                    </div>
                  `;
                }).join('') || '<div class="academy-muted">No species yet. Seed organisms to begin.</div>'}
              </div>
              ${state.species?.speciesHistory && state.species.speciesHistory.length > 0
                ? `<div class="academy-muted" style="font-size:10px; margin-top:4px;">Last events: ${state.species.speciesHistory.slice(-3).map(e => e.type === 'speciation' ? '🌱 Speciation' : '⚰️ Extinction').join(' • ')}</div>`
                : ''}
            </div>

            <!-- Step 10: Food web -->
            <div class="life-food-web">
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Үслэлтэй вэб (Food Web)</div>
              <div class="life-food-web-row">
                <span class="life-food-web-label">🟢 Уурхай (Producers)</span>
                <span class="life-food-web-value">${pop.traitDistribution ? '•' : '0'}</span>
              </div>
              <div class="life-food-web-row">
                <span class="life-food-web-label">🟡 Ивээн уух (Herbivores)</span>
                <span class="life-food-web-value">${state.species?.roleCounts?.herbivore || 0}</span>
              </div>
              <div class="life-food-web-row">
                <span class="life-food-web-label">🔴 Мал уух (Carnivores)</span>
                <span class="life-food-web-value">${state.species?.roleCounts?.carnivore || 0}</span>
              </div>
              <div class="life-food-web-row">
                <span class="life-food-web-label">🟣 Хослолт (Omnivores)</span>
                <span class="life-food-web-value">${state.species?.roleCounts?.omnivore || 0}</span>
              </div>
              <div class="life-food-web-row">
                <span class="life-food-web-label">🟤 Цэвэрлүүлэгч (Decomposers)</span>
                <span class="life-food-web-value">${state.species?.roleCounts?.decomposer || 0}</span>
              </div>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8;">
                Predation: ${state.species ? 'active' : 'none'} | Energy transfer: ~10% per trophic level
              </div>
            </div>

            <!-- Step 10: Environmental data -->
            <div class="life-env-panel">
              <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Орчин (Environment)</div>
              <div class="life-env-row"><span>Season:</span><span>${(state.environment.season * 100).toFixed(0)}% of cycle</span></div>
              <div class="life-env-row"><span>Temperature:</span><span>${state.environment.temperature.toFixed(1)}°C</span></div>
              <div class="life-env-row"><span>Energy:</span><span>${state.environment.energy.toFixed(0)}</span></div>
              <div class="life-env-row"><span>Water:</span><span>${state.environment.water.toFixed(0)}</span></div>
              <div class="life-env-row"><span>Minerals:</span><span>${state.environment.minerals.toFixed(0)}</span></div>
              <div class="life-env-row"><span>Collapse Risk:</span><span style="color:${state.ecosystem ? (state.ecosystem.collapseRisk > 0.6 ? '#ef4444' : state.ecosystem.collapseRisk > 0.3 ? '#fbbf24' : '#34d399') : '#94a3b8'}">${state.ecosystem ? (state.ecosystem.collapseRisk * 100).toFixed(0) + '%' : 'N/A'}</span></div>
            </div>

            <!-- Step 11: Nervous system & learning panel -->
            <div class="life-neural-panel">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:6px;">
                <span>Нэрвэйн систем (Nervous System)</span><span>ЗААНУУД ШАТ</span>
              </div>
              <div class="life-neural-row"><span>Neural Processing:</span><span>${(pop.avgNeuralProcessing || 0).toFixed(2)}</span></div>
              <div class="life-neural-row"><span>Reaction Speed:</span><span>${(pop.avgReactionSpeed || 0).toFixed(2)}</span></div>
              <div class="life-neural-row"><span>Neural Coordination:</span><span>${(pop.avgNeuralCoordination || 0).toFixed(2)}</span></div>
              <div class="life-neural-row"><span>Env. Awareness:</span><span>${(pop.avgEnvironmentalAwareness || 0).toFixed(2)}</span></div>
              <div class="life-neural-row"><span>Movement Control:</span><span>${(pop.avgMovementControl || 0).toFixed(2)}</span></div>
              <div class="life-neural-row"><span>Neural Energy Cost:</span><span>${(pop.avgNeuralEnergyCost || 0).toFixed(3)}</span></div>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8;">
                Intelligence is optional — neural traits cost energy but improve response.
              </div>
            </div>

            <!-- Step 11: Memory & learning panel -->
            <div class="life-memory-panel">
              <div style="display:flex;justify-content:space-between;font-size:11px;color:#94a3b8;margin-bottom:6px;">
                <span>Овог боловсрол (Memory & Learning)</span><span>Лайвтны шат</span>
              </div>
              ${selected ? `
                <div class="life-mem-row"><span>Recent Events:</span><span>${selected.memory?.recentEvents?.length || 0}</span></div>
                <div class="life-mem-row"><span>Resource Memory:</span><span>${selected.memory?.resourceLocations?.length || 0}</span></div>
                <div class="life-mem-row"><span>Threat Memory:</span><span>${selected.memory?.threatLocations?.length || 0}</span></div>
                <div class="life-mem-row"><span>Learning Efficiency:</span><span>${(selected.memory?.learningEfficiency || 0).toFixed(2)}</span></div>
                <div class="life-mem-row"><span>Social Interactions:</span><span>${selected.experience?.socialInteractions || 0}</span></div>
                <div class="life-mem-row"><span>Successful Forages:</span><span>${selected.experience?.successfulForages || 0}</span></div>
                <div class="life-mem-row"><span>Neural Activity Cost:</span><span>${(selected.neuralActivityCost || 0).toFixed(3)}</span></div>
              ` : `<div class="academy-muted">Select an organism to view memory & learning state.</div>`}
            </div>

            <!-- Step 11: Cognitive Evolutionary Tree -->
            <div class="life-tree-panel">
              <div class="life-tree-header">
                <span>Эвольюцийн хэмжээ (Evolutionary Tree)</span><span>ЗААНУУД ШАТ</span>
              </div>
              ${this._renderEvolutionaryTree(engine, state)}
            </div>

            <!-- Step 11: Selective Breeding -->
            <div class="life-breed-panel">
              <div class="life-breed-header">
                <span>Аuldралт өөрийлölт (Selective Breeding)</span><span>ЗААНУУД ШАТ</span>
              </div>
              ${this._renderSelectiveBreeding(engine, state, selected)}
            </div>

            <!-- Step 11: Dynamic Communication -->
            <div class="life-comm-panel">
              <div class="life-comm-header">
                <span>Холбооллын орчин (Dynamic Communication)</span><span>ЗААНУУД ШАТ</span>
              </div>
              ${this._renderCommunicationPanel(engine, state)}
            </div>

            <!-- Phase 12: Civilization Simulation -->
            <div class="life-civ-panel">
              <div class="life-civ-header">
                <span>Төвгүүн соёл (Civilization)</span><span>${civUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
              </div>
              ${civUnlocked ? this._renderCivilizationPanel(civState) : `<div class="life-civ-empty">Төвгүүн соел LOCKED. Биологийн progression labs-г дуусгаж, Intelligent Life-г өрөнгөөлөж байна.</div>`}
            </div>

            <div class="academy-actions">
              ${running
                ? `<button class="su-btn secondary" data-academy-action="life-stop">⏸ Pause</button>`
                : `<button class="su-btn primary" data-academy-action="life-run">▶ Run</button>`}
              <button class="su-btn secondary" data-academy-action="life-seed">🧫 Seed Organism</button>
              <button class="su-btn secondary" data-academy-action="life-seed-multi">🔗 Seed Multicellular</button>
              <button class="su-btn secondary" data-academy-action="life-seed-producer">🌱 Seed Producer</button>
              <button class="su-btn secondary" data-academy-action="life-seed-consumer">🍖 Seed Consumer</button>
              <button class="su-btn secondary" data-academy-action="life-seed-decomposer">🍄 Seed Decomposer</button>
              <button class="su-btn secondary" data-academy-action="life-reset">↺ Reset</button>
              <button class="su-btn secondary" data-academy-action="life-reset-view">🔍 Reset View</button>
              <button class="su-btn secondary" data-academy-action="life-ecosystem">🌿 ${state.mode === 'ecosystem' ? 'Single Mode' : 'Ecosystem Mode'}</button>
              ${civUnlocked
                ? `<div class="life-civ-actions">
                  <button class="su-btn ${civState.running ? 'secondary' : 'primary'}" data-civ-action="civ-run">${civState.running ? '⏸ Pause' : '▶ Run'} Civilization</button>
                  <button class="su-btn secondary" data-civ-action="civ-reset">↺ Reset Civilization</button>
                  <button class="su-btn secondary" data-civ-action="civ-seed-intelligent">🧠 Seed Intelligent</button>
                  <div class="life-slider-row"><span>🔬 Civ speed</span><strong>${Math.round(civState.speed * 100)}%</strong></div>
                  <input type="range" min="0" max="1000" value="${Math.round(civState.speed * 100)}" data-civ-input="speed" class="life-slider" />
                </div>`
                : ''
              }
            </div>
          </div>
        </div>
      </div>`;
    this._bindLifeLabActions();
  }

  _traitLabel(key) {
    const labels = {
      metabolism: 'Metabolism',
      size: 'Size',
      membrane: 'Membrane',
      efficiency: 'Efficiency',
      tempTolerance: 'Temp Tol.',
      radiationTolerance: 'Rad Tol.',
      reproductionCost: 'Repro Cost',
      growthRate: 'Growth',
      motility: 'Motility',
      cooperation: 'Cooperation',
      chemicalSense: 'Chemical Sense',
      lightSense: 'Light Sense',
      tempSense: 'Temp Sense',
      threatSense: 'Threat Sense'
    };
    return labels[key] || key;
  }

  // Step 11: Render evolutionary tree from lineage data.
  _renderEvolutionaryTree(engine, state) {
    const pop = engine.population;
    if (!pop) return '<div class="academy-muted">No population data.</div>';
    const lineageTree = pop.lineageTree;
    if (!lineageTree || lineageTree.size === 0) {
      return '<div class="life-tree-empty">No lineage data yet. Seed organisms and let them reproduce.</div>';
    }

    const orgs = pop.organisms;
    const orgMap = new Map();
    for (const o of orgs) orgMap.set(o.id, o);

    // Build roots: nodes with no parentId
    const roots = [];
    for (const [id, info] of lineageTree) {
      if (!info.parentId) roots.push(id);
    }

    // Sort roots by offspring count descending
    roots.sort((a, b) => (lineageTree.get(b).offspringCount || 0) - (lineageTree.get(a).offspringCount || 0));

    const maxDepth = 3;
    const visited = new Set();
    let html = '';

    const renderNode = (id, depth, isRoot) => {
      if (depth > maxDepth || visited.has(id)) return '';
      visited.add(id);
      const info = lineageTree.get(id);
      const org = orgMap.get(id);
      const isAlive = org ? org.alive : false;
      const energy = org ? org.energy.toFixed(0) : '?';
      const generation = org ? org.genome.generation : 0;
      const parentCount = info ? info.offspringCount || 0 : 0;
      const cls = isRoot ? 'life-tree-node life-tree-node-active' : 'life-tree-node life-tree-node-child';
      const status = isAlive ? '' : ' (extinct)';

      html += `<div class="${cls}">
        <span class="life-tree-node-parent">#${id} Gen ${generation} E:${energy}${status}</span>
        <span class="life-tree-node-child">offspring: ${parentCount}</span>
        <button class="life-tree-btn" data-life-action="breed-select-${id}">${isAlive ? 'Select Parent' : '—'}</button>
      </div>`;

      // Find children
      for (const [cid, cinfo] of lineageTree) {
        if (cinfo.parentId === id && !visited.has(cid)) {
          renderNode(cid, depth + 1, false);
        }
      }
    };

    for (const rootId of roots.slice(0, 6)) {
      renderNode(rootId, 0, true);
    }

    if (html === '') {
      return '<div class="life-tree-empty">No lineage data yet.</div>';
    }
    return `<div class="life-tree-lineage">Lineage depth: 3 generations | Total nodes: ${lineageTree.size}</div>${html}`;
  }

  // Step 11: Render selective breeding controls.
  _renderSelectiveBreeding(engine, state, selected) {
    const pop = engine.population;
    if (!pop) return '<div class="academy-muted">No population data.</div>';
    const orgs = pop.organisms.filter(o => o.alive);
    const p1 = this._lifeBreedingParent1 ? orgs.find(o => o.id === this._lifeBreedingParent1) : null;
    const p2 = this._lifeBreedingParent2 ? orgs.find(o => o.id === this._lifeBreedingParent2) : null;

    let compatHtml = '';
    let breedBtn = '';
    let offspringHtml = '';

    if (p1 && p2) {
      const g1 = p1.genome.traits;
      const g2 = p2.genome.traits;
      const traitKeys = Object.keys(DEFAULT_TRAITS);
      let geneticDistance = 0;
      for (const k of traitKeys) {
        geneticDistance += Math.abs((g1[k] || 0) - (g2[k] || 0));
      }
      geneticDistance /= traitKeys.length;
      const compatible = geneticDistance <= 0.5 && p1.energy >= 30 && p2.energy >= 30;
      const compatClass = compatible ? 'life-breed-compat-good' : geneticDistance > 0.5 ? 'life-breed-compat-bad' : 'life-breed-compat-neutral';
      const compatText = compatible ? 'Compatible' : geneticDistance > 0.5 ? 'Too genetically distant' : 'Insufficient energy';

      compatHtml = `<div class="life-breed-compat ${compatClass}">Genetic compatibility: ${(1 - geneticDistance).toFixed(2)} — ${compatText}</div>`;

      // Show offspring preview (blended traits)
      const previewTraits = {};
      for (const k of traitKeys) {
        previewTraits[k] = ((g1[k] || 0) + (g2[k] || 0)) / 2;
      }
      const traitRows = Object.keys(previewTraits).map(k => {
        const v = previewTraits[k];
        return `<div class="life-breed-offspring-trait"><span>${this._traitLabel(k)}</span><span>${v.toFixed(2)}</span></div>`;
      }).join('');
      offspringHtml = `<div class="life-breed-offspring"><div style="font-size:9px;color:#94a3b8;margin-bottom:3px;">Predicted offspring genome:</div>${traitRows}</div>`;

      if (compatible) {
        breedBtn = `<button class="su-btn primary" data-academy-action="life-breed" style="margin-top:6px;">🐣 Breed Offspring</button>`;
      } else {
        breedBtn = `<button class="su-btn secondary" disabled style="margin-top:6px;">Incompatible</button>`;
      }
    }

    const parentOptions = orgs.map(o => {
      const isP1 = p1 && o.id === p1.id;
      const isP2 = p2 && o.id === p2.id;
      const selectedCls = (isP1 || isP2) ? 'life-breed-parent-selected' : '';
      const g = o.genome.traits;
      return `
        <div class="life-breed-parent ${selectedCls}" data-life-action="breed-select-${o.id}">
          <div class="life-breed-parent-label">#${o.id} ${isP1 ? 'Parent 1' : isP2 ? 'Parent 2' : 'Select'} ${o.alive ? '' : ' (dead)'}</div>
          <div class="life-breed-parent-trait"><span>Energy</span><span>${o.energy.toFixed(0)}</span></div>
          <div class="life-breed-parent-trait"><span>Size</span><span>${g.size.toFixed(2)}</span></div>
          <div class="life-breed-parent-trait"><span>Metabolism</span><span>${g.metabolism.toFixed(2)}</span></div>
          <div class="life-breed-parent-trait"><span>Motility</span><span>${g.motility.toFixed(2)}</span></div>
          <div class="life-breed-parent-trait"><span>Neural</span><span>${g.neuralProcessing.toFixed(2)}</span></div>
        </div>
      `;
    }).join('') || '<div class="academy-muted">No living organisms.</div>';

    const clearBtn = (p1 || p2) ? `<button class="su-btn secondary" data-academy-action="life-breed-clear" style="margin-top:4px;">Clear Selection</button>` : '';

    return `
      <div style="font-size:9px;color:#94a3b8;margin-bottom:4px;">Select two living organisms to breed.</div>
      <div style="display:flex;gap:6px;margin-bottom:6px;">
        <div style="flex:1;">${parentOptions}</div>
        <div style="flex:1;">${parentOptions}</div>
      </div>
      ${compatHtml}
      ${offspringHtml}
      ${breedBtn}
      ${clearBtn}
    `;
  }

  // Step 11: Render dynamic communication panel based on atmosphere.
  _renderCommunicationPanel(engine, state) {
    const env = state.environment;
    if (!env) return '<div class="academy-muted">No environment data.</div>';

    const pressure = typeof env.pressure === 'number' ? env.pressure : 1;
    const oxygen = typeof env.oxygen === 'number' ? env.oxygen : 0;
    const planetId = env.planetId || 'mars';

    // Determine communication medium capability
    let medium = 'none';
    let mediumClass = 'life-comm-medium-none';
    let mediumText = 'No medium — sound cannot propagate';
    let methods = [];

    if (pressure <= 0 || planetId === 'sun') {
      medium = 'none';
      mediumClass = 'life-comm-medium-none';
      mediumText = 'Vacuum / stellar corona — no sound propagation';
      methods = ['Chemical signals (diffusion)', 'Electrical fields', 'Visual / light signals', 'Vibration through solid substrate'];
    } else if (pressure < 1) {
      medium = 'thin';
      mediumClass = 'life-comm-medium-limited';
      mediumText = 'Thin atmosphere — sound travels weakly, short range';
      methods = ['Sound (short range, muffled)', 'Chemical signals', 'Electrical fields', 'Visual signals'];
    } else if (pressure < 5) {
      medium = 'moderate';
      mediumClass = 'life-comm-medium-limited';
      mediumText = 'Moderate atmosphere — sound travels with reduced range';
      methods = ['Sound (moderate range)', 'Chemical signals', 'Visual signals', 'Electrical fields'];
    } else {
      medium = 'good';
      mediumClass = 'life-comm-medium-good';
      mediumText = 'Dense atmosphere — sound propagates well';
      methods = ['Sound (good range)', 'Chemical signals', 'Visual signals', 'Electrical fields', 'Pressure waves'];
    }

    const oxygenText = oxygen > 0 ? `O₂: ${oxygen.toFixed(0)}% — aerobic communication possible` : 'No free oxygen — anaerobic only';
    const pressureText = `Pressure: ${pressure.toFixed(1)} atm`;

    return `
      <div class="life-comm-row"><span>Medium:</span><span class="life-comm-medium ${mediumClass}">${mediumText}</span></div>
      <div class="life-comm-row"><span>${pressureText}</span><span>${oxygenText}</span></div>
      <div class="life-comm-methods">Available methods: ${methods.join(', ')}.</div>
      <div style="margin-top:6px;font-size:9px;color:#94a3b8;">ЗААНУУД ШАТ: Communication medium dependence is a hypothetical model — real organisms use diverse signaling mechanisms.</div>
    `;
  }

  // Phase 12: Render civilization simulation panel (Step 13 extended).
  _renderCivilizationPanel(state) {
    if (!state) return '<div class="life-civ-empty">No civilization data.</div>';
    const running = state.running;
    const groups = state.groups || [];
    const activeGroups = groups.filter(g => !g.isExtinct);
    const settlements = state.settlements || [];
    const activeSettlements = settlements.filter(s => !s.isAbandoned);
    const technologies = state.technologies || [];
    const events = state.events || [];
    const fieldProgress = state.fieldProgress || {};
    const crisisActive = state.crisisActive;
    const crisisHistory = state.crisisHistory || [];
    const spaceMilestones = state.spaceMilestones || [];
    const groupRelations = state.groupRelations || {};

    // Field label helper.
    const fieldLabel = (fid) => {
      const labels = {
        materials: 'Материалын өргөлт',
        mechanical: 'Механ инженери',
        energy: 'Энергийн технологи',
        electricity: 'Цахилгаан',
        electronics: 'Электроник',
        computing: 'Хэрэгцээлт/compute',
        communication: 'Холбоо',
        transportation: 'Үл цахим хөтөлбөр',
        astronomy: 'Зойж зураач',
        spacecraft: 'Ангилойн технологи'
      };
      return labels[fid] || fid;
    };

    // Research fields progress bars.
    const fieldRows = Object.entries(fieldProgress).map(([fid, finfo]) => {
      const pct = Math.min(100, Math.round((finfo.avgProgress || 0)));
      return `
        <div class="life-civ-field-row">
          <span class="life-civ-field-label">${fieldLabel(fid)}</span>
          <span class="life-civ-field-value">${finfo.unlocked}/${finfo.total} unlocked</span>
          <div class="life-civ-field-bar"><div class="life-civ-field-fill" style="width:${pct}%"></div></div>
          <span class="life-civ-field-pct">${pct}%</span>
        </div>
      `;
    }).join('') || '<div class="life-civ-empty">No research fields yet.</div>';

    // Technology tree — all techs with prerequisites, progress, unlock status.
    const techRows = technologies.map(t => {
      const prereqMet = t.prerequisiteTech && t.prerequisiteTech.length > 0
        ? t.prerequisiteTech.every(pt => technologies.some(ot => ot.id === pt && ot.unlocked))
        : true;
      const canResearch = !t.unlocked && prereqMet;
      const pct = Math.min(100, Math.round(t.researchProgress || 0));
      const statusCls = t.unlocked ? 'life-civ-tech-unlocked' : (canResearch ? 'life-civ-tech-available' : 'life-civ-tech-locked');
      const statusText = t.unlocked ? 'UNLOCKED' : (canResearch ? 'AVAILABLE' : 'LOCKED');
      const prereqNames = (t.prerequisiteTech || []).map(pt => {
        const ptTech = technologies.find(ot => ot.id === pt);
        return ptTech ? ptTech.name : pt;
      }).join(', ') || '—';
      return `
        <div class="life-civ-tech ${statusCls}">
          <div class="life-civ-tech-header">
            <span class="life-civ-tech-name">${t.name}</span>
            <span class="life-civ-tech-status">${statusText}</span>
          </div>
          <div class="life-civ-tech-field">${fieldLabel(t.field)} • ${t.domain}</div>
          <div class="life-civ-tech-prereq">Prerequisites: ${prereqNames}</div>
          <div class="life-civ-tech-progress">
            <div class="life-civ-tech-bar"><div class="life-civ-tech-fill" style="width:${pct}%"></div></div>
            <span class="life-civ-tech-pct">${pct}%</span>
          </div>
          <div class="life-civ-tech-cost">
            Food ${t.resourceCost?.food || 0} • Materials ${t.resourceCost?.materials || 0} • Energy ${t.resourceCost?.energy || 0} • Cost ${t.researchCost || 0}
          </div>
          ${canResearch && !t.unlocked
            ? `<button class="su-btn secondary life-civ-btn-research" data-civ-research="${t.id}" style="font-size:9px;padding:2px 6px;margin-top:4px;">Research</button>`
            : ''}
          ${t.description ? `<div class="life-civ-tech-desc" style="font-size:8px;color:#64748b;margin-top:2px;">${t.description}</div>` : ''}
        </div>
      `;
    }).join('') || '<div class="life-civ-empty">No technologies defined.</div>';

    // Settlements with infrastructure details.
    const settlementRows = activeSettlements.map(s => {
      const popPct = Math.round((s.population / Math.max(s.maxPopulation, 1)) * 100);
      return `
        <div class="life-civ-settlement">
          <div class="life-civ-settlement-title"><span>Сэтгүүл #${s.id}</span><span>${s.population}/${s.maxPopulation}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Food:</span><span class="life-civ-stat-value">${Math.round(s.storedFood || 0)}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Materials:</span><span class="life-civ-stat-value">${Math.round(s.storedMaterials || 0)}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Energy:</span><span class="life-civ-stat-value">${Math.round(s.storedEnergy || 0)}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Tech level:</span><span class="life-civ-stat-value">${(s.techLevel || 0).toFixed(1)}</span></div>
          <div class="life-civ-infra">
            <div class="life-civ-infra-row"><span>Energy:</span><span>${(s.energyInfrastructure || 0).toFixed(1)}/10</span></div>
            <div class="life-civ-infra-row"><span>Science:</span><span>${(s.scientificFacilities || 0).toFixed(1)}/10</span></div>
            <div class="life-civ-infra-row"><span>Comms:</span><span>${(s.communicationSystems || 0).toFixed(1)}/10</span></div>
            <div class="life-civ-infra-row"><span>Transport:</span><span>${(s.transportationInfrastructure || 0).toFixed(1)}/10</span></div>
            <div class="life-civ-infra-row"><span>Life support:</span><span>${(s.lifeSupport || 0).toFixed(1)}/10</span></div>
            <div class="life-civ-infra-row"><span>Spaceport:</span><span>${s.spaceportLevel || 0}/5</span></div>
            <div class="life-civ-infra-row"><span>Satellite uplink:</span><span class="${s.satelliteUplink ? 'life-civ-yes' : 'life-civ-no'}">${s.satelliteUplink ? 'YES' : 'NO'}</span></div>
            <div class="life-civ-infra-row"><span>Orbital station:</span><span class="${s.orbitalStationAccess ? 'life-civ-yes' : 'life-civ-no'}">${s.orbitalStationAccess ? 'YES' : 'NO'}</span></div>
          </div>
          <div style="font-size:9px;color:#94a3b8;">Production: F ${(s.foodProduction || 0).toFixed(1)}/s M ${(s.materialProduction || 0).toFixed(1)}/s E ${(s.energyProduction || 0).toFixed(1)}/s</div>
          <div style="font-size:9px;color:#94a3b8;">Impact: ${(s.environmentalImpact * 100).toFixed(0)}% | Sustainability: ${(s.sustainability * 100).toFixed(0)}%</div>
          ${s.isAbandoned ? `<div class="life-civ-tech-locked" style="font-size:9px;margin-top:2px;">ABANDONED: ${s.collapseReason || 'unknown'}</div>` : ''}
        </div>
      `;
    }).join('') || '<div class="life-civ-empty">No settlements yet.</div>';

    // Groups with stability and relations.
    const groupRows = activeGroups.map(g => {
      const members = g.memberIds ? g.memberIds.length : 0;
      const rels = [];
      const relMap = groupRelations[g.id];
      if (relMap) {
        for (const [otherId, rel] of Object.entries(relMap)) {
          const other = activeGroups.find(ag => ag.id === Number(otherId));
          if (other) {
            rels.push(`#${other.id}: ${rel > 0.3 ? 'ALLIED' : rel < -0.3 ? 'HOSTILE' : 'NEUTRAL'} (${rel.toFixed(1)})`);
          }
        }
      }
      return `
        <div class="life-civ-group">
          <div class="life-civ-group-title"><span>Группа #${g.id}</span><span class="life-civ-group-members">${members} members</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Leader:</span><span class="life-civ-stat-value">${g.leaderId || '—'}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Resources:</span><span class="life-civ-stat-value">${Math.round(g.sharedResources || 0)}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Tech level:</span><span class="life-civ-stat-value">${(g.techLevel || 0).toFixed(1)}</span></div>
          <div class="life-civ-stat" style="font-size:9px;"><span>Tools:</span><span class="life-civ-stat-value">${g.toolsKnown ? g.toolsKnown.length : 0}</span></div>
          <div style="font-size:9px;color:#94a3b8;">Stability: ${(g.stability * 100).toFixed(0)}% | Conflict: ${(g.conflictLevel * 100).toFixed(0)}%</div>
          ${rels.length > 0 ? `<div style="font-size:8px;color:#64748b;margin-top:2px;">${rels.join(' • ')}</div>` : ''}
        </div>
      `;
    }).join('') || '<div class="life-civ-empty">No social groups yet.</div>';

    // Space milestones.
    const milestoneRows = spaceMilestones.map(m => `
      <div class="life-civ-stat" style="font-size:9px;color:#fbbf24;"><span>🚀 ${m.type}</span><span class="life-civ-stat-value">${m.description}</span></div>
    `).join('') || '<div class="life-civ-empty">No space milestones yet.</div>';

    // Crisis.
    const crisisHtml = crisisActive
      ? `<div class="life-civ-tech-locked" style="padding:4px;border-radius:4px;">
          <div style="font-size:9px;color:#ef4444;font-weight:bold;">CRISIS: ${crisisActive.type}</div>
          <div style="font-size:9px;color:#94a3b8;">Severity: ${(crisisActive.severity * 100).toFixed(0)}% | Affected group: #${crisisActive.affectedGroupId}</div>
        </div>`
      : '<div class="life-civ-empty">No active crisis.</div>';

    // Recent crisis history.
    const crisisHistRows = crisisHistory.slice(-5).reverse().map(c => `
      <div style="font-size:9px;color:#94a3b8;margin:1px 0;">• ${c.resolved ? 'RESOLVED' : 'ACTIVE'} ${c.type} (${(c.severity * 100).toFixed(0)}%)</div>
    `).join('');

    // Recent events timeline.
    const eventRows = events.slice(-6).reverse().map(e => `
      <div style="font-size:9px;color:#94a3b8;margin:1px 0;">• t=${Math.round(e.t)} ${e.description}</div>
    `).join('') || '<div class="life-civ-empty">No events yet.</div>';

    return `
      <div class="life-civ-stat"><span>Intelligent organisms:</span><span class="life-civ-stat-value">${state.intelligentCount}</span></div>
      <div class="life-civ-stat"><span>Grouped organisms:</span><span class="life-civ-stat-value">${state.groupedCount}</span></div>
      <div class="life-civ-stat"><span>Active groups:</span><span class="life-civ-stat-value">${activeGroups.length}</span></div>
      <div class="life-civ-stat"><span>Technologies:</span><span class="life-civ-stat-value">${technologies.length}</span></div>
      <div class="life-civ-stat"><span>Settlements:</span><span class="life-civ-stat-value">${activeSettlements.length}</span></div>
      <div class="life-civ-stat"><span>Space milestones:</span><span class="life-civ-stat-value">${spaceMilestones.length}</span></div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Өсвөл хAREК бүлгүүд (Research Fields)</div>
      <div class="life-civ-fields">${fieldRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Технологийн дүрэм (Technology Tree)</div>
      <div class="life-civ-tech-list">${techRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Хөрс болон инфраструктур (Settlements &amp; Infrastructure)</div>
      <div class="life-civ-settlements">${settlementRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Группуудын холбогдол (Group Relations)</div>
      <div class="life-civ-groups">${groupRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Ангилын урьдчлал (Space Milestones)</div>
      <div class="life-civ-milestones">${milestoneRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Өвчнүүлэл (Crisis)</div>
      ${crisisHtml}
      <div style="font-size:9px;color:#64748b;margin-top:2px;">${crisisHistRows || 'No crisis history.'}</div>

      <div style="font-size:10px;color:#94a3b8;margin:8px 0 4px;">Түүхийн давсagsan (Recent Events)</div>
      <div class="life-civ-events">${eventRows}</div>

      <div style="font-size:10px;color:#94a3b8;margin:12px 0 4px;">Үлдэвч дүрэм (World Visualization)</div>
      <button class="su-btn secondary life-civ-btn-toggle-world" data-civ-toggle-world="${state.running ? 'on' : 'off'}" style="font-size:9px;padding:4px 8px;width:100%;">
        ${this.game?.civilizationWorldSystem?.enabled ? 'СКИЛ World View: ON' : 'СКИЛ World View: OFF'}
      </button>
    `;
  }

  _startLifeAnimLoop() {
    if (this._lifeAnimFrame) return;
    if (this._lifeZoom === undefined) {
      this._lifeZoom = 1;
      this._lifePanX = 0;
      this._lifePanY = 0;
      this._lifePrevAliveIds = new Set();
      this._lifeDivisions = new Map();   // childId -> { parentId, progress, maxProgress }
      this._lifeDeaths = new Map();      // orgId  -> { x, z, radius, color, progress, maxProgress, reason }
      this._lifeLastPositions = new Map(); // orgId -> { x, z, radius }
      this._lifeBreedingParent1 = null;
      this._lifeBreedingParent2 = null;
    }
    const tick = () => {
      if (this.game?.academy && this.game.academy.getOrCreateLifeEngine && this.elAcademyContent && this.elAcademyContent.querySelector('#life-canvas')) {
        this._drawLifeCanvas();
        this._lifeAnimFrame = requestAnimationFrame(tick);
      } else {
        this._lifeAnimFrame = null;
      }
    };
    this._lifeAnimFrame = requestAnimationFrame(tick);
  }

  _stopLifeAnimLoop() {
    if (this._lifeAnimFrame) {
      cancelAnimationFrame(this._lifeAnimFrame);
      this._lifeAnimFrame = null;
    }
  }

  _getLifeCellColor(org, state) {
    const g = org.genome.traits;
    const e = clamp(org.energy / 100, 0, 1);
    const m = clamp(org.membraneIntegrity, 0, 1);
    // Healthy = greenish; low energy = red; low membrane = yellow; dividing = cyan.
    const r = Math.round(255 * (1 - e) * (1 - m * 0.5));
    const gr = Math.round(100 + 155 * e * m);
    const b = Math.round(100 + 155 * m);
    return `rgb(${r},${gr},${b})`;
  }

  _drawLifeCanvas() {
    const canvas = this.elAcademyContent?.querySelector('#life-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const academy = this.game.academy;
    if (!academy) return;
    const engine = academy.getOrCreateLifeEngine();
    const state = engine.getState();

    // A1: High-DPI responsive canvas sizing.
    // Match the drawing buffer to CSS dimensions * devicePixelRatio (capped at 2 for mobile perf).
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = canvas.clientWidth || 420;
    const cssHeight = canvas.clientHeight || 340;
    const targetWidth = Math.round(cssWidth * dpr);
    const targetHeight = Math.round(cssHeight * dpr);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    // Non-cumulative absolute transform: drawing stays in CSS-space coordinates,
    // scaled up internally by DPR. Avoids cumulative transform buildup across frames.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = cssWidth;
    const height = cssHeight;
    ctx.clearRect(0, 0, width, height);

    // Draw all organisms from all populations.
    const allOrgs = [];
    if (state.population && state.population.count > 0) {
      // Get live organisms via engine (single mode).
      const eng = engine;
      // We need direct access; use getState organisms isn't exposed. Rebuild from population stats isn't enough.
      // Instead draw from engine.population if accessible.
    }

    // Access engine internals for drawing (same module, same instance).
    const popOrgs = engine.population ? engine.population.organisms : [];
    const ecoOrgs = engine.mode === 'ecosystem' ? [
      ...engine.ecosystem.producers.organisms,
      ...engine.ecosystem.consumers.organisms,
      ...engine.ecosystem.decomposers.organisms
    ] : [];

    const orgs = engine.mode === 'ecosystem' ? ecoOrgs : popOrgs;

    // A8: Reuse alive-id sets (swap pattern) to avoid per-frame allocation.
    if (!this._aliveIdsSetA) this._aliveIdsSetA = new Set();
    if (!this._aliveIdsSetB) this._aliveIdsSetB = new Set();
    const prevSet = this._lifePrevAliveIds || this._aliveIdsSetA;
    const currSet = (prevSet === this._aliveIdsSetA) ? this._aliveIdsSetB : this._aliveIdsSetA;
    currSet.clear();
    for (const org of orgs) currSet.add(org.id);
    const currentAliveIds = currSet;
    const prevAliveIds = prevSet;

    // Store last known positions for all alive organisms (needed for death animations).
    // A8: Only update when position changes meaningfully to avoid per-frame allocations.
    for (const org of orgs) {
      const existing = this._lifeLastPositions.get(org.id);
      const r = org.biomass * 4;
      if (!existing ||
          Math.abs(existing.x - org.position.x) > 0.01 ||
          Math.abs(existing.z - org.position.z) > 0.01 ||
          Math.abs(existing.radius - r) > 0.1) {
        this._lifeLastPositions.set(org.id, { x: org.position.x, z: org.position.z, radius: r, color: this._getLifeCellColor(org, state) });
      }
    }

    // Detect births: organisms alive now that weren't alive before.
    for (const org of orgs) {
      if (!prevAliveIds.has(org.id) && org.parentId) {
        // New organism with a parent = a division event.
        const parent = orgs.find((o) => o.id === org.parentId);
        if (parent && !this._lifeDivisions.has(org.id)) {
          this._lifeDivisions.set(org.id, {
            parentId: org.parentId,
            childId: org.id,
            progress: 0,
            maxProgress: 45, // ~0.75s at 60fps
            parentX: parent.position.x,
            parentZ: parent.position.z,
            childX: org.position.x,
            childZ: org.position.z
          });
        }
      }
    }

    // Detect deaths: organisms alive before that are gone now.
    for (const id of prevAliveIds) {
      if (!currentAliveIds.has(id)) {
        const lastPos = this._lifeLastPositions.get(id);
        if (lastPos && !this._lifeDeaths.has(id)) {
          // Find death reason from history if available.
          let reason = 'death';
          const lastHistory = state.history[state.history.length - 1];
          if (lastHistory) reason = lastHistory.deaths > 0 ? 'death' : 'death';
          this._lifeDeaths.set(id, {
            x: lastPos.x,
            z: lastPos.z,
            radius: lastPos.radius,
            color: lastPos.color,
            progress: 0,
            maxProgress: 30, // ~0.5s at 60fps
            reason
          });
        }
      }
    }

    // Update previous frame's alive IDs.
    this._lifePrevAliveIds = currentAliveIds;

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) / 22; // sim coords ~ +/-10 map to canvas

    // A7: Microscope zoom & pan state.
    const zoom = Math.max(0.25, Math.min(8, this._lifeZoom || 1));
    const panX = this._lifePanX || 0;
    const panY = this._lifePanY || 0;
    const scaledScale = scale * zoom;
    const cxZ = cx + panX;
    const cyZ = cy + panY;

    // Helper: simulation->screen coordinate with zoom/pan.
    const simToScreen = (simX, simZ) => ({
      x: cxZ + simX * scaledScale,
      y: cyZ + simZ * scaledScale
    });

    // Helper: screen->simulation coordinate (inverse) for selection.
    const screenToSim = (screenX, screenY) => ({
      x: (screenX - cxZ) / scaledScale,
      z: (screenY - cyZ) / scaledScale
    });

    // Background gradient.
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.min(width, height));
    grad.addColorStop(0, 'rgba(10, 18, 26, 0.9)');
    grad.addColorStop(1, 'rgba(6, 10, 14, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw resource pool as subtle ring.
    const avail = state.environment.available;
    ctx.strokeStyle = `rgba(60, 160, 255, ${0.15 + avail / 100 * 0.25})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cxZ, cyZ, scale * 8 * zoom, 0, Math.PI * 2);
    ctx.stroke();

    for (const org of orgs) {
      if (!org.alive) continue;

      // A4: Skip division children in normal draw; they are rendered in the division animation.
      const isDivisionChild = [...this._lifeDivisions.values()].some((d) => d.childId === org.id);
      if (isDivisionChild) continue;

      const pulse = 1 + Math.sin(org.age * 0.5) * 0.04 * org.biomass;
      const screenX = cxZ + org.position.x * scaledScale;
      const screenY = cyZ + org.position.z * scaledScale;
      const radius = Math.max(3, Math.min(22, org.biomass * 4 * pulse));
      const color = this._getLifeCellColor(org, state);

      // A4: If this organism is a division parent, draw a constriction (pinch) overlay.
      const division = [...this._lifeDivisions.values()].find((d) => d.parentId === org.id);
      if (division) {
        const t = division.progress / division.maxProgress;
        // Parent shrinks slightly as division progresses.
        const parentScale = 1 - t * 0.3;
        const pinchWidth = radius * parentScale * (0.5 + 0.5 * Math.sin(t * Math.PI));
        // Draw parent body slightly reduced.
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, radius * parentScale, radius * parentScale, 0, 0, Math.PI * 2);
        ctx.fill();
        // Draw constriction band across the middle.
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX - pinchWidth, screenY);
        ctx.quadraticCurveTo(screenX, screenY - radius * 0.4, screenX + pinchWidth, screenY);
        ctx.stroke();
        // Draw child emerging from the parent's right side, growing as division progresses.
        const childRadius = Math.max(2, radius * 0.5 * t);
        const childX = screenX + radius * parentScale * 1.1 * t;
        const childY = screenY;
        ctx.fillStyle = this._getLifeCellColor(orgs.find((o) => o.id === division.childId) || org, state);
        ctx.beginPath();
        ctx.arc(childX, childY, childRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Advance division animation.
        division.progress += 1;
        if (division.progress >= division.maxProgress) {
          this._lifeDivisions.delete(division.childId);
        }
        continue; // Skip normal draw for division parents too (handled above).
      }

      // Selection ring.
      if (this._lifeSelectedId === org.id) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Cell body.
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Energy inner bar.
      const ePct = clamp(org.energy / 100, 0, 1);
      ctx.fillStyle = ePct > 0.5 ? '#22c55e' : (ePct > 0.25 ? '#eab308' : '#ef4444');
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * ePct * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Membrane ring (thin outer).
      const mPct = clamp(org.membraneIntegrity, 0, 1);
      ctx.strokeStyle = `rgba(255,255,255,${0.3 * mPct})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * (0.9 + 0.1 * mPct), 0, Math.PI * 2);
      ctx.stroke();

      // Step 9: Sensory range circle (faint, only when significant).
      const senseRange = org.sensoryRange || 0;
      if (senseRange > 1) {
        const sRadius = senseRange * scaledScale;
        if (sRadius > 3 && sRadius < 200) {
          ctx.strokeStyle = `rgba(100, 200, 255, ${0.08 + 0.07 * (g.chemicalSense + g.lightSense + g.tempSense + g.threatSense)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(screenX, screenY, sRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Step 9: Movement velocity arrow (shows direction and speed).
      const vx = org.velocity?.x || 0;
      const vz = org.velocity?.z || 0;
      const vLen = Math.hypot(vx, vz);
      if (vLen > 0.02) {
        const arrowLen = Math.min(vLen * scaledScale * 15, radius * 3);
        const endX = screenX + (vx / vLen) * arrowLen;
        const endY = screenY + (vz / vLen) * arrowLen;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        // Arrow head.
        const headLen = 4;
        const headAngle = 0.4;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - (vx / vLen) * headLen * Math.cos(headAngle) + (vz / vLen) * headLen * Math.sin(headAngle),
                   endY - (vz / vLen) * headLen * Math.cos(headAngle) - (vx / vLen) * headLen * Math.sin(headAngle));
        ctx.lineTo(endX - (vx / vLen) * headLen * Math.cos(headAngle) - (vz / vLen) * headLen * Math.sin(headAngle),
                   endY - (vz / vLen) * headLen * Math.cos(headAngle) + (vx / vLen) * headLen * Math.sin(headAngle));
        ctx.closePath();
        ctx.fillStyle = '#00f0ff';
        ctx.fill();
      }

      // Behavior indicator text (small, only for selected org).
      if (this._lifeSelectedId === org.id && org.behavior) {
        ctx.fillStyle = '#00f0ff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(org.behavior.toUpperCase(), screenX, screenY - radius - 8);
      }
    }

    // A5: Draw death animations (membrane breakdown, fade, disappearance).
    // Read-only: uses last known positions, does not modify LifeEngine state.
    for (const [orgId, death] of this._lifeDeaths.entries()) {
      const t = death.progress / death.maxProgress;
      const alpha = 1 - t; // fade out
      const shrink = 1 - t * 0.5; // shrink slightly
      const screenX = cxZ + death.x * scaledScale;
      const screenY = cyZ + death.z * scaledScale;
      const radius = Math.max(2, death.radius * shrink);

      // Fading cell body.
      ctx.fillStyle = `rgba(${death.color.match(/\d+/g).slice(0, 3).join(',')},${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Breaking down membrane: dashed ring that thins and breaks.
      ctx.strokeStyle = `rgba(255,100,100,${alpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const segments = 12;
      const intactSegments = Math.floor(segments * (1 - t));
      for (let i = 0; i < intactSegments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 0.5) / segments) * Math.PI * 2;
        ctx.moveTo(screenX + Math.cos(a1) * radius * 1.05, screenY + Math.sin(a1) * radius * 1.05);
        ctx.lineTo(screenX + Math.cos(a2) * radius * 1.05, screenY + Math.sin(a2) * radius * 1.05);
      }
      ctx.stroke();

      // Advance death animation.
      death.progress += 1;
      if (death.progress >= death.maxProgress) {
        this._lifeDeaths.delete(orgId);
      }
    }

    // Idle hint.
    if (orgs.length === 0 && this._lifeDeaths.size === 0) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No protocells seeded. Click Seed Organism.', cxZ, cyZ);
    }
  }

  _renderLifeInspector(org, state) {
    const g = org.genome.traits;
    const ePct = Math.round(clamp(org.energy / 100, 0, 1) * 100);
    const mPct = Math.round(clamp(org.membraneIntegrity, 0, 1) * 100);
    const canDivide = org.canDivide ? org.canDivide() : false;
    const status = org.energy <= 0 ? 'DEAD (starvation)' :
      org.membraneIntegrity <= 0.1 ? 'DEAD (rupture)' :
        canDivide ? 'READY TO DIVIDE' : 'ALIVE';
    const isMulti = org instanceof MulticellularOrganism || org.type === 'multicellular';
    const multiInfo = isMulti
      ? `<div class="academy-muted">Cells: ${org.size || org.cells?.length || 0} | Alive Cells: ${org.aliveCellCount ? org.aliveCellCount() : 'N/A'}</div>
      <div class="academy-muted">Adhesion: ${g.adhesion?.toFixed(2) || 0} | Cooperation: ${g.cooperation?.toFixed(2) || 0}</div>`
      : `<div class="academy-muted">MulticellularId: ${org.multicellularId || 'none'} | Role: ${org.cellRole || 'unicellular'}</div>`;
    return `
      <div class="academy-section-heading"><h3>${isMulti ? 'Multicellular' : 'Protocell'} #${org.id}</h3><span class="academy-muted">${org.type}</span></div>
      <div class="academy-progress-track"><div class="academy-progress-fill" style="width:${ePct}%; background:${ePct > 50 ? '#34d399' : ePct > 25 ? '#fbbf24' : '#f87171'}"></div></div>
      <div class="academy-muted">Energy: ${ePct}%</div>
      <div class="academy-progress-track"><div class="academy-progress-fill" style="width:${mPct}%; background:#60a5fa"></div></div>
      <div class="academy-muted">Membrane Integrity: ${mPct}%</div>
      <div class="academy-muted">Size: ${org.biomass.toFixed(2)} | Age: ${Math.round(org.age)}s | Gen: ${org.genome.generation}</div>
      <div class="academy-muted">Metabolism: ${g.metabolism.toFixed(2)} | Efficiency: ${g.efficiency.toFixed(2)}</div>
      <div class="academy-muted">Motility: ${g.motility.toFixed(2)} | TempTolerance: ${g.tempTolerance.toFixed(2)}</div>
      <div class="academy-muted">Behavior: <strong>${org.behavior || 'idle'}</strong> | Sensory Range: ${(org.sensoryRange || 0).toFixed(1)}</div>
      <div class="academy-muted">Chemical: ${g.chemicalSense?.toFixed(2) || 0} | Light: ${g.lightSense?.toFixed(2) || 0} | Temp: ${g.tempSense?.toFixed(2) || 0} | Threat: ${g.threatSense?.toFixed(2) || 0}</div>
      <div class="academy-muted">Position: (${org.position.x.toFixed(1)}, ${org.position.z.toFixed(1)}) | Velocity: (${(org.velocity?.x || 0).toFixed(2)}, ${(org.velocity?.z || 0).toFixed(2)})</div>
      <!-- Step 11: Neural traits. -->
      <div class="academy-muted">Neural: Proc ${g.neuralProcessing?.toFixed(2) || 0} | React ${g.reactionSpeed?.toFixed(2) || 0} | Coord ${g.neuralCoordination?.toFixed(2) || 0}</div>
      <div class="academy-muted">Awareness: ${g.environmentalAwareness?.toFixed(2) || 0} | MoveCtrl: ${g.movementControl?.toFixed(2) || 0} | EnergyCost: ${g.neuralEnergyCost?.toFixed(3) || 0}</div>
      <!-- Step 11: Memory & learning (lifetime, not inherited). -->
      <div class="academy-muted">Memory: Events ${org.memory?.recentEvents?.length || 0} | Resources ${org.memory?.resourceLocations?.length || 0} | Threats ${org.memory?.threatLocations?.length || 0}</div>
      <div class="academy-muted">Learning: ${(org.memory?.learningEfficiency || 0).toFixed(2)} | Social: ${org.experience?.socialInteractions || 0} | Forages: ${org.experience?.successfulForages || 0}</div>
      ${multiInfo}
      <div class="academy-muted">Children: ${org.children} | Parent: ${org.parentId || 'none'} | Mutations: ${org.mutationsSinceBirth}</div>
      <div class="academy-feedback">Status: <strong>${status}</strong></div>
      <div class="academy-actions" style="margin-top:8px;">
        <button class="su-btn secondary" data-academy-action="life-deselect">✕ Deselect</button>
        ${canDivide ? `<button class="su-btn primary" data-academy-action="life-force-divide">⬗ Force Divide</button>` : ''}
        <button class="su-btn primary" data-academy-action="life-deploy-planet">🌍 Deploy to Planet</button>
      </div>
    `;
  }

  _bindLifeLabActions() {
    this.elAcademyContent.querySelectorAll('[data-life-input]').forEach((slider) => {
      slider.addEventListener('input', () => {
        if (!this.game.academy) return;
        const engine = this.game.academy.getOrCreateLifeEngine();
        const name = slider.dataset.lifeInput;
        const value = Number(slider.value);
        if (name === 'speed') {
          engine.setSpeed(value / 100);
        } else if (name === 'mutationRate') {
          engine.setMutationRate(value / 1000);
        } else {
          engine.setCondition(name, value);
        }
        this._renderAcademy();
      });
    });
    this.elAcademyContent.querySelectorAll('[data-academy-action]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.game.academy) return;
        const engine = this.game.academy.getOrCreateLifeEngine();
        const action = button.dataset.academyAction;
        if (action === 'life-run') {
          engine.setRunning(true);
        } else if (action === 'life-stop') {
          engine.setRunning(false);
        } else if (action === 'life-reset') {
          engine.reset();
          this._lifeSelectedId = null;
          this._lifeVisuals = new Map();
          // A8: Clear visual states on Reset.
          this._lifeDivisions.clear();
          this._lifeDeaths.clear();
          this._lifeLastPositions.clear();
          this._lifeZoom = 1;
          this._lifePanX = 0;
          this._lifePanY = 0;
        } else if (action === 'life-reset-view') {
          this._lifeZoom = 1;
          this._lifePanX = 0;
          this._lifePanY = 0;
        } else if (action === 'life-seed') {
          engine.seedOrganism();
          this._lifeSelectedId = null;
        } else if (action === 'life-seed-multi') {
          engine.seedMulticellular(2, 4);
          this._lifeSelectedId = null;
        } else if (action === 'life-seed-producer') {
          engine.seedOrganism({ efficiency: 0.7, motility: 0.2, metabolism: 0.3 });
          this._lifeSelectedId = null;
        } else if (action === 'life-seed-consumer') {
          engine.seedOrganism({ motility: 0.8, metabolism: 0.7, efficiency: 0.4 });
          this._lifeSelectedId = null;
        } else if (action === 'life-seed-decomposer') {
          engine.seedOrganism({ motility: 0.2, metabolism: 0.3, membrane: 0.8, radiationTolerance: 0.6, efficiency: 0.6 });
          this._lifeSelectedId = null;
        } else if (action === 'life-ecosystem') {
          engine.setMode(engine.mode === 'ecosystem' ? 'single' : 'ecosystem');
          this._lifeSelectedId = null;
        } else if (action === 'life-deselect') {
          this._lifeSelectedId = null;
        } else if (action === 'life-force-divide') {
          const org = engine.getOrganism(this._lifeSelectedId);
          if (org && org.canDivide()) {
            org.divide(engine.rng, engine.population.idCounter);
          }
        } else if (action === 'life-deploy-planet') {
          const org = engine.getOrganism(this._lifeSelectedId);
          if (org && this.game.player && this.game.livingWorldSystem) {
            const origin = this.game.livingWorldSystem._getOrigin(this.game.currentPlanetId || 'mars');
            const lx = this.game.player.position.x - origin.x;
            const lz = this.game.player.position.z - origin.z;
            const ly = this.game.player.position.y - origin.y;
            const deployed = engine.seedOrganism({ ...org.genome.traits }, { x: lx, y: ly, z: lz });
            if (deployed) {
              this._lifeSelectedId = deployed.id;
              this.showToast(`🌍 Deployed organism #${deployed.id} to ${this.game.currentPlanetId || 'planet'} surface`);
            }
          }
        } else if (action === 'life-breed') {
          const p1 = this._lifeBreedingParent1 ? engine.getOrganism(this._lifeBreedingParent1) : null;
          const p2 = this._lifeBreedingParent2 ? engine.getOrganism(this._lifeBreedingParent2) : null;
          if (p1 && p2) {
            const child = engine.breed(p1.id, p2.id);
            if (child) {
              this._lifeBreedingParent1 = null;
              this._lifeBreedingParent2 = null;
              this._lifeSelectedId = child.id;
            }
          }
        } else if (action === 'life-breed-clear') {
          this._lifeBreedingParent1 = null;
          this._lifeBreedingParent2 = null;
        }
        this._renderAcademy();
      });
    });

    // Phase 12: Civilization action bindings (data-civ-action / data-civ-input).
        this.elAcademyContent.querySelectorAll('[data-civ-action]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.game.academy) return;
        const academy = this.game.academy;
        const action = button.dataset.civAction;
        if (action === 'civ-run') {
          academy.setCivilizationRunning(true);
        } else if (action === 'civ-reset') {
          academy.resetCivilizationEngine();
        } else if (action === 'civ-seed-intelligent') {
          const engine = academy.getOrCreateLifeEngine();
          engine.seedOrganism({
            neuralProcessing: 0.6,
            abstractReasoning: 0.6,
            toolUse: 0.5,
            symbolicComm: 0.4,
            socialLearning: 0.4,
            cooperation: 0.5,
            motility: 0.3,
            metabolism: 0.3,
            efficiency: 0.5,
            membrane: 0.5
          });
        }
        this._renderAcademy();
      });
    });

    // Step 13: Research technology buttons (data-civ-research).
    this.elAcademyContent.querySelectorAll('[data-civ-research]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.game.academy) return;
        const academy = this.game.academy;
        const fieldId = button.dataset.civResearch;
        const boosted = academy.boostCivilizationResearch(fieldId);
        if (boosted > 0) {
          this.showToast(`+${boosted} research progress in ${fieldId}`);
        }
        this._renderAcademy();
      });
    });

    // Step 14: Toggle civilization world visualization.
    this.elAcademyContent.querySelectorAll('[data-civ-toggle-world]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.game?.civilizationWorldSystem) return;
        const cws = this.game.civilizationWorldSystem;
        cws.setVisible(!cws.enabled);
        this._renderAcademy();
      });
    });

    this.elAcademyContent.querySelectorAll('[data-civ-input]').forEach((slider) => {
      slider.addEventListener('input', () => {
        if (!this.game.academy) return;
        const academy = this.game.academy;
        const name = slider.dataset.civInput;
        const value = Number(slider.value);
        if (name === 'speed') {
          academy.setCivilizationSpeed(value / 100);
        }
        this._renderAcademy();
      });
    });

    // Breeding parent selection buttons (data-life-action="breed-select-{id}").
    this.elAcademyContent.querySelectorAll('[data-life-action^="breed-select-"]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!this.game.academy) return;
        const engine = this.game.academy.getOrCreateLifeEngine();
        const id = Number(button.dataset.lifeAction.replace('breed-select-', ''));
        const org = engine.getOrganism(id);
        if (!org || !org.alive) return;
        if (!this._lifeBreedingParent1) {
          this._lifeBreedingParent1 = id;
        } else if (!this._lifeBreedingParent2 && id !== this._lifeBreedingParent1) {
          this._lifeBreedingParent2 = id;
        } else if (id === this._lifeBreedingParent1) {
          this._lifeBreedingParent1 = null;
        } else if (id === this._lifeBreedingParent2) {
          this._lifeBreedingParent2 = null;
        }
        this._renderAcademy();
      });
    });

    // Canvas click/tap for cell selection (accounts for zoom/pan).
    const canvas = this.elAcademyContent?.querySelector('#life-canvas');
    if (canvas) {
      const selectCell = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        // Map client coords to CSS canvas coords (account for CSS scaling).
        const cssX = (clientX - rect.left) * (canvas.clientWidth / rect.width);
        const cssY = (clientY - rect.top) * (canvas.clientHeight / rect.height);
        const academy = this.game.academy;
        if (!academy) return;
        const engine = academy.getOrCreateLifeEngine();
        const state = engine.getState();
        const orgs = engine.mode === 'ecosystem' ? [
          ...engine.ecosystem.producers.organisms,
          ...engine.ecosystem.consumers.organisms,
          ...engine.ecosystem.decomposers.organisms
        ] : (engine.population ? engine.population.organisms : []);
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) / 22;
        const zoom = Math.max(0.25, Math.min(8, this._lifeZoom || 1));
        const panX = this._lifePanX || 0;
        const panY = this._lifePanY || 0;
        const scaledScale = scale * zoom;
        const cxZ = cx + panX;
        const cyZ = cy + panY;
        // Inverse transform: screen -> simulation coordinates.
        const simX = (cssX - cxZ) / scaledScale;
        const simZ = (cssY - cyZ) / scaledScale;
        let nearest = null;
        let nearestDist = Infinity;
        for (const org of orgs) {
          if (!org.alive) continue;
          const d = Math.hypot(simX - org.position.x, simZ - org.position.z);
          const radius = Math.max(3, Math.min(22, org.biomass * 4));
          if (d <= radius / scaledScale && d < nearestDist) {
            nearestDist = d;
            nearest = org;
          }
        }
        this._lifeSelectedId = nearest ? nearest.id : null;
        this._renderAcademy();
      };
      canvas.addEventListener('pointerdown', (e) => selectCell(e.clientX, e.clientY), { passive: false });

      // A7: Zoom/pan interactions (guarded against duplicate binding).
      if (canvas._lifeCanvasListenersBound) {
        // Already bound; skip.
      } else {
        canvas._lifeCanvasListenersBound = true;

        // Mouse wheel zoom (desktop).
        canvas.addEventListener('wheel', (e) => {
          e.preventDefault();
          const rect = canvas.getBoundingClientRect();
          const cssX = (e.clientX - rect.left) * (canvas.clientWidth / rect.width);
          const cssY = (e.clientY - rect.top) * (canvas.clientHeight / rect.height);
          const zoomStep = e.deltaY > 0 ? 0.9 : 1.1;
          const newZoom = Math.max(0.25, Math.min(8, (this._lifeZoom || 1) * zoomStep));
          const oldZoom = this._lifeZoom || 1;
          // Zoom centered on pointer: adjust pan so pointer stays on same sim point.
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          const cx = width / 2;
          const cy = height / 2;
          const scale = Math.min(width, height) / 22;
          const simX = (cssX - cx - (this._lifePanX || 0)) / (scale * oldZoom);
          const simZ = (cssY - cy - (this._lifePanY || 0)) / (scale * oldZoom);
          this._lifeZoom = newZoom;
          this._lifePanX = cssX - cx - simX * scale * newZoom;
          this._lifePanY = cssY - cy - simZ * scale * newZoom;
        }, { passive: false });

        // Mouse drag pan (desktop) + touch drag (mobile).
        let dragStart = null;
        let dragPanStart = { x: 0, y: 0 };
        const onPointerMove = (e) => {
          if (!dragStart) return;
          e.preventDefault();
          const dx = e.clientX - dragStart.x;
          const dy = e.clientY - dragStart.y;
          this._lifePanX = dragPanStart.x + dx;
          this._lifePanY = dragPanStart.y + dy;
        };
        const onPointerUp = () => { dragStart = null; };
        canvas.addEventListener('pointerdown', (e) => {
          if (e.pointerType === 'mouse' || e.button === 0) {
            dragStart = { x: e.clientX, y: e.clientY };
            dragPanStart = { x: this._lifePanX || 0, y: this._lifePanY || 0 };
          }
        }, { passive: false });
        canvas.addEventListener('pointermove', onPointerMove, { passive: false });
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);

        // Touch pinch-to-zoom (mobile).
        let touch1 = null, touch2 = null;
        let pinchStartDist = 0;
        let pinchZoomStart = 1;
        canvas.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            touch1 = e.touches[0];
            touch2 = e.touches[1];
            pinchStartDist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            pinchZoomStart = this._lifeZoom || 1;
          } else if (e.touches.length === 1) {
            dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            dragPanStart = { x: this._lifePanX || 0, y: this._lifePanY || 0 };
          }
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
          e.preventDefault();
          if (e.touches.length === 2 && touch1 && touch2) {
            const t1 = e.touches[0], t2 = e.touches[1];
            const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
            const zoomStep = dist / pinchStartDist;
            const newZoom = Math.max(0.25, Math.min(8, pinchZoomStart * zoomStep));
            // Zoom centered on pinch midpoint.
            const midX = (t1.clientX + t2.clientX) / 2;
            const midY = (t1.clientY + t2.clientY) / 2;
            const rect = canvas.getBoundingClientRect();
            const cssX = (midX - rect.left) * (canvas.clientWidth / rect.width);
            const cssY = (midY - rect.top) * (canvas.clientHeight / rect.height);
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const cx = width / 2;
            const cy = height / 2;
            const scale = Math.min(width, height) / 22;
            const simX = (cssX - cx - (this._lifePanX || 0)) / (scale * pinchZoomStart);
            const simZ = (cssY - cy - (this._lifePanY || 0)) / (scale * pinchZoomStart);
            this._lifeZoom = newZoom;
            this._lifePanX = cssX - cx - simX * scale * newZoom;
            this._lifePanY = cssY - cy - simZ * scale * newZoom;
          }
          dragStart = null;
        }, { passive: false });
        canvas.addEventListener('touchend', () => { touch1 = null; touch2 = null; dragStart = null; });
        canvas.addEventListener('touchcancel', () => { touch1 = null; touch2 = null; dragStart = null; });
      }
    }
  }  _bindAcademyActions() {
    this.elAcademyContent.querySelectorAll('[data-lab-id]').forEach((button) => {
      button.addEventListener('click', () => {
        this.activeLabId = button.dataset.labId;
        const lab = this.game.academy.getLab(this.activeLabId);
        const state = this.game.academy.getState();
        const firstIncomplete = lab.questions.findIndex((_, index) => !state.answers[`${lab.id}:${index}`]?.correct);
        this.activeQuestionIndex = firstIncomplete === -1 ? 0 : firstIncomplete;
        this.academyFeedback = null;
        this._renderAcademy();
      });
    });
    this.elAcademyContent.querySelectorAll('[data-academy-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.academyAction;
        if (action === 'back') {
          this.activeLabId = null;
          this.academyFeedback = null;
          this._renderAcademy();
        } else if (action === 'next') {
          const lab = this.game.academy.getLab(this.activeLabId);
          const state = this.game.academy.getState();
          const answers = lab.questions.map((_, index) => state.answers[`${lab.id}:${index}`]);
          const nextIndex = this._getNextQuestionIndex(answers, this.activeQuestionIndex);
          if (nextIndex < 0 && state.completedLabs.includes(lab.id)) {
            this.activeLabId = null;
            this.academyTab = 'labs';
          } else if (nextIndex >= 0) {
            this.activeQuestionIndex = nextIndex;
          }
          this.academyFeedback = null;
          this._renderAcademy();
        } else if (action === 'space') {
          this.closeAcademy(false);
          this.game.beginSession?.(false);
          this.game.enterSpaceflight('Mars');
        } else if (action === 'surface') {
          this.closeAcademy(false);
          this.game.beginSession?.(true);
          this.game.ui?.showToast('Surface expedition resumed');
        } else if (action === 'launch') {
          this.closeAcademy(false);
          this.game.launchRocketFromSurface?.();
        }
      });
    });
  }

  syncGraphicsPresetUI(presetName) {
    document.querySelectorAll('.btn-gfx-preset').forEach(b => {
      const isMatch = b.getAttribute('data-preset') === presetName;
      b.classList.toggle('active', isMatch);
      b.style.borderColor = isMatch ? '#00f0ff' : '';
      b.style.color = isMatch ? '#00f0ff' : '';
    });
  }

  refreshSaveSlotsUI() {
    if (!this.game.saveSystem || !this.game.saveSystem.getSlotsInfo) return;
    const slots = this.game.saveSystem.getSlotsInfo();
    for (const s of slots) {
      const btn = document.getElementById(`btn-slot-${s.id}`);
      if (!btn) continue;
      const shortName = s.id === 'slot_1' ? 'Slot 1 (Orig)' : (s.id === 'slot_2' ? 'Slot 2' : 'Slot 3');
      btn.textContent = `${shortName} • ${s.hasSave ? 'Saved' : 'Empty'}`;
      btn.classList.toggle('active', s.isActive);
      btn.style.borderColor = s.isActive ? '#00f0ff' : 'rgba(255,255,255,0.2)';
      btn.style.color = s.isActive ? '#00f0ff' : '#e2f1ff';
    }
  }

  openNewGameConfirmation() {
    this.isNewGameConfirmOpen = true;
    if (this.elNewGameModal) this.elNewGameModal.classList.add('visible');
    input.exitPointerLock();
    this._syncGamePauseFlag();
  }

  closeNewGameConfirmation() {
    this.isNewGameConfirmOpen = false;
    if (this.elNewGameModal) this.elNewGameModal.classList.remove('visible');
    this._syncGamePauseFlag();
  }

  closeAllModals(requestLock = false) {
    this.isInventoryOpen = false;
    this.isPauseOpen = false;
    this.isAcademyOpen = false;
    this.isNewGameConfirmOpen = false;
    if (this.elInventoryModal) this.elInventoryModal.classList.remove('visible');
    if (this.elPauseModal) this.elPauseModal.classList.remove('visible');
    if (this.elNewGameModal) this.elNewGameModal.classList.remove('visible');
    if (this.elAcademyModal) this.elAcademyModal.classList.remove('visible');
    const startPrompt = document.getElementById('start-prompt');
    if (startPrompt) startPrompt.style.display = 'none';
    this._syncGamePauseFlag();
    if (requestLock) {
      input.requestPointerLock();
    }
  }

  _syncGamePauseFlag() {
    this.game.isPaused = Boolean(this.isPauseOpen || this.isInventoryOpen || this.isNewGameConfirmOpen || this.isAcademyOpen || this.isResearchOpen || this.isInventionOpen || this.isTutorialOpen);
    this.game.spaceflightSystem?.setControlsEnabled(!this.game.isPaused);
  }

  _setupTouchControls() {
    const isTouch = input.isTouchDevice;
    if (isTouch) {
      this.elTouchControls.style.display = 'block';
      this._initTouchJoystick();
      this._initTouchButtons();
    }
  }

  _initTouchJoystick() {
    const joyBase = document.getElementById('touch-joystick-base');
    const joyKnob = document.getElementById('touch-joystick-knob');
    if (!joyBase || !joyKnob) return;

    let touchId = null;
    let baseRect = null;

    const resetJoy = () => {
      touchId = null;
      joyKnob.style.transform = 'translate(-50%, -50%)';
      input.touchMove.x = 0;
      input.touchMove.y = 0;
    };

    joyBase.addEventListener('pointerdown', (e) => {
      if (touchId !== null || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
      e.preventDefault();
      touchId = e.pointerId;
      baseRect = joyBase.getBoundingClientRect();
      try { joyBase.setPointerCapture(touchId); } catch {}
    }, { passive: false });

    joyBase.addEventListener('pointermove', (e) => {
      if (touchId === null) return;
      if (e.pointerId !== touchId) return;
      e.preventDefault();
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;
      const maxR = Math.max(1, baseRect.width / 2 - 12);
      const dist = Math.hypot(dx, dy);

      if (dist > maxR) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }

      const rawMagnitude = Math.min(1, dist / maxR);
      const deadZone = 0.1;
      const magnitude = rawMagnitude <= deadZone ? 0 : Math.pow((rawMagnitude - deadZone) / (1 - deadZone), 1.25);
      const directionX = dist > 0 ? dx / dist : 0;
      const directionY = dist > 0 ? dy / dist : 0;
      joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      input.touchMove.x = directionX * magnitude;
      input.touchMove.y = -directionY * magnitude;
    }, { passive: false });

    joyBase.addEventListener('pointerup', resetJoy);
    joyBase.addEventListener('pointercancel', resetJoy);
    joyBase.addEventListener('lostpointercapture', resetJoy);
    window.addEventListener('blur', resetJoy);
    window.addEventListener('orientationchange', resetJoy);
  }

  _initTouchButtons() {
    const btnMine = document.getElementById('touch-btn-mine');
    const btnJump = document.getElementById('touch-btn-jump');
    const btnSprint = document.getElementById('touch-btn-sprint');
    const btnLight = document.getElementById('touch-btn-light');

    this._bindTouchButton('touch-btn-mine', () => { input.touchMining = true; }, () => { input.touchMining = false; });
    this._bindTouchButton('touch-btn-jump', () => { input.touchJump = true; }, () => { input.touchJump = false; });
    this._bindTouchButton('touch-btn-interact', () => input.onInteract?.());
    this._bindTouchButton('touch-btn-menu', () => this.togglePause());
    this._bindTouchButton('touch-btn-mission', () => this.openAcademy('missions'));
    if (btnSprint) {
      this._bindTouchButton('touch-btn-sprint', () => {
        input.touchSprint = !input.touchSprint;
        btnSprint.classList.toggle('active', input.touchSprint);
      });
    }
    if (btnLight) {
      this._bindTouchButton('touch-btn-light', () => this.game.player.toggleFlashlight());
    }

    const sensitivity = document.getElementById('touch-look-sensitivity');
    if (sensitivity) {
      sensitivity.value = String(input.touchLookSensitivity);
      const value = document.getElementById('touch-look-sensitivity-value');
      if (value) value.textContent = `${Math.round(input.touchLookSensitivity * 100)}%`;
      sensitivity.addEventListener('input', () => {
        input.setTouchLookSensitivity(sensitivity.value);
        const value = document.getElementById('touch-look-sensitivity-value');
        if (value) value.textContent = `${Math.round(input.touchLookSensitivity * 100)}%`;
      });
    }
    const moveSensitivity = document.getElementById('touch-move-sensitivity');
    if (moveSensitivity) {
      moveSensitivity.value = String(input.touchMoveSensitivity);
      const value = document.getElementById('touch-move-sensitivity-value');
      if (value) value.textContent = `${Math.round(input.touchMoveSensitivity * 100)}%`;
      moveSensitivity.addEventListener('input', () => {
        input.setTouchMoveSensitivity(moveSensitivity.value);
        const value = document.getElementById('touch-move-sensitivity-value');
        if (value) value.textContent = `${Math.round(input.touchMoveSensitivity * 100)}%`;
      });
    }

    const lookZone = document.getElementById('touch-look-zone');
    if (lookZone) {
      let lookPointerId = null;
      let lastX = 0;
      let lastY = 0;

      lookZone.addEventListener('pointerdown', (e) => {
        if (lookPointerId !== null || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
        e.preventDefault();
        lookPointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        try { lookZone.setPointerCapture(lookPointerId); } catch {}
      }, { passive: false });

      lookZone.addEventListener('pointermove', (e) => {
        if (e.pointerId !== lookPointerId) return;
        e.preventDefault();
        input.touchLook.x += e.clientX - lastX;
        input.touchLook.y += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
      }, { passive: false });

      const endLook = (e) => { if (e.pointerId === lookPointerId) lookPointerId = null; };
      lookZone.addEventListener('pointerup', endLook);
      lookZone.addEventListener('pointercancel', endLook);
      lookZone.addEventListener('lostpointercapture', endLook);
      const resetLook = () => {
        lookPointerId = null;
        input.touchLook.x = 0;
        input.touchLook.y = 0;
      };
      window.addEventListener('blur', resetLook);
      window.addEventListener('orientationchange', resetLook);
    }
  }

  _bindTouchButton(id, onPress, onRelease = null) {
    const button = document.getElementById(id);
    if (!button) return;
    let activePointerId = null;
    button.addEventListener('pointerdown', (event) => {
      if (activePointerId !== null || (event.pointerType !== 'touch' && event.pointerType !== 'pen')) return;
      event.preventDefault();
      event.stopPropagation();
      activePointerId = event.pointerId;
      try { button.setPointerCapture(activePointerId); } catch {}
      onPress();
    });
    const release = (event) => {
      if (event.pointerId !== activePointerId) return;
      activePointerId = null;
      onRelease?.();
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    const resetButton = () => {
      if (activePointerId === null) return;
      activePointerId = null;
      onRelease?.();
    };
    window.addEventListener('blur', resetButton);
    window.addEventListener('orientationchange', resetButton);
  }

  showToast(text, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = text;
    this.elToastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  toggleInventory(forceState) {
    this.isInventoryOpen = (forceState !== undefined) ? forceState : !this.isInventoryOpen;
    if (this.isInventoryOpen) {
      this.elInventoryModal.classList.add('visible');
      input.exitPointerLock();
      this.renderInventoryModal();
      audio.playClick();
    } else {
      this.elInventoryModal.classList.remove('visible');
      if (!this.isPauseOpen && !this.isNewGameConfirmOpen) {
        input.requestPointerLock();
      }
      audio.playClick();
    }
    this._syncGamePauseFlag();
  }

  togglePause(forceState) {
    if (this.isNewGameConfirmOpen && forceState === undefined) {
      this.closeNewGameConfirmation();
      return;
    }
    this.isPauseOpen = (forceState !== undefined) ? forceState : !this.isPauseOpen;
    if (this.isPauseOpen) {
      this.refreshSaveSlotsUI();
      this.elPauseModal.classList.add('visible');
      input.exitPointerLock();
      audio.playClick();
    } else {
      this.elPauseModal.classList.remove('visible');
      if (!this.isInventoryOpen && !this.isNewGameConfirmOpen) {
        input.requestPointerLock();
      }
      audio.playClick();
    }
    this._syncGamePauseFlag();
  }

  toggleResearchJournal() {
    if (this.game.researchJournalUI) {
      this.game.researchJournalUI.toggle();
    }
  }

  toggleInventionUI() {
    if (this.game.inventionUI) {
      this.game.inventionUI.toggle();
    }
  }

  toggleTutorial() {
    if (this.game.tutorialUI) {
      this.game.tutorialUI.toggle();
    }
  }

  onTutorialStateChanged(progress, currentStep) {
    // UIManager receives tutorial state updates; no-op by default.
    // Can be extended to show toast notifications on step completion.
  }

  renderInventoryModal() {
    this.elModalHotbarGrid.innerHTML = '';
    this.game.inventory.hotbar.forEach((slot, idx) => {
      const el = document.createElement('div');
      el.className = `inv-slot ${idx === this.game.inventory.activeHotbarIndex ? 'equipped' : ''}`;
      if (slot) {
        el.innerHTML = `
          <div class="slot-icon">${getItemIcon(slot.itemId)}</div>
          ${slot.count > 1 ? `<span class="slot-count">${slot.count}</span>` : ''}
        `;
        el.addEventListener('click', () => this._selectItem(slot, true, idx));
      }
      this.elModalHotbarGrid.appendChild(el);
    });

    this.elBackpackGrid.innerHTML = '';
    this.game.inventory.backpack.forEach((slot, idx) => {
      const el = document.createElement('div');
      el.className = 'inv-slot';
      if (slot) {
        el.innerHTML = `
          <div class="slot-icon">${getItemIcon(slot.itemId)}</div>
          ${slot.count > 1 ? `<span class="slot-count">${slot.count}</span>` : ''}
        `;
        el.addEventListener('click', () => this._selectItem(slot, false, idx));
      }
      this.elBackpackGrid.appendChild(el);
    });
  }

  _selectItem(slot, isHotbar, index) {
    this.selectedItem = { slot, isHotbar, index };
    const dbItem = ITEM_DATABASE[slot.itemId];
    if (!dbItem) return;

    this.elItemDetails.innerHTML = `
      <div class="details-header">
        <div class="details-icon" style="width: 44px; height: 44px;">${getItemIcon(slot.itemId)}</div>
        <div>
          <h3>${dbItem.name}</h3>
          <p class="details-mn">${dbItem.name_mn}</p>
        </div>
      </div>
      <div class="details-body">
        <p><strong>Category:</strong> ${dbItem.category.toUpperCase()}</p>
        <p><strong>Quantity:</strong> ${slot.count} / ${dbItem.maxStack}</p>
        <p class="details-desc">${dbItem.desc}</p>
      </div>
      <div class="details-actions">
        ${dbItem.category === 'consumable' ? `<button id="btn-use-item" class="su-btn primary">Use Item</button>` : ''}
        ${!isHotbar ? `<button id="btn-move-hotbar" class="su-btn secondary">Assign to Hotbar</button>` : ''}
      </div>
    `;

    document.getElementById('btn-use-item')?.addEventListener('click', () => {
      if (this.game.inventory.useItem(isHotbar, index, this.game.survival)) {
        this.renderInventoryModal();
        this.updateHotbar();
        audio.playPickupChime();
        this.showToast(`Used ${dbItem.name}`);
      }
    });

    document.getElementById('btn-move-hotbar')?.addEventListener('click', () => {
      const emptyIdx = this.game.inventory.hotbar.findIndex(s => s === null);
      if (emptyIdx !== -1) {
        this.game.inventory.hotbar[emptyIdx] = slot;
        this.game.inventory.backpack[index] = null;
        this.renderInventoryModal();
        this.updateHotbar();
        audio.playClick();
      } else {
        this.showToast('⚠️ Hotbar slots full (10/10)');
      }
    });
  }

  updateHotbar(forceRefresh = false) {
    const activeIdx = this.game.inventory.activeHotbarIndex;
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const slotEl = document.getElementById(`hotbar-slot-${i}`);
      const iconEl = document.getElementById(`hb-icon-${i}`);
      const countEl = document.getElementById(`hb-count-${i}`);
      if (!slotEl) continue;

      slotEl.classList.toggle('active', i === activeIdx);

      const slotData = this.game.inventory.hotbar[i];
      const sig = slotData ? `${slotData.itemId}:${slotData.count}` : 'empty';
      if (forceRefresh || this._hotbarCache[i] !== sig) {
        this._hotbarCache[i] = sig;
        if (slotData) {
          iconEl.innerHTML = getItemIcon(slotData.itemId);
          countEl.textContent = slotData.count > 1 ? slotData.count : '';
        } else {
          iconEl.innerHTML = '';
          countEl.textContent = '';
        }
      }
    }
  }

  update(delta) {
    const survival = this.game.survival.getState();
    const player = this.game.player;
    const sky = this.game.sky;

    if (this.elO2Val) this.elO2Val.textContent = `${survival.oxygen}%`;
    if (this.elO2Bar) {
      this.elO2Bar.style.width = `${survival.oxygen}%`;
      this.elO2Bar.classList.toggle('low-warning', survival.oxygen <= 25);
    }

    if (this.elPowerVal) this.elPowerVal.textContent = `${survival.power}%`;
    if (this.elPowerBar) this.elPowerBar.style.width = `${survival.power}%`;

    if (this.elHealthVal) this.elHealthVal.textContent = `${survival.health}%`;
    if (this.elHealthBar) this.elHealthBar.style.width = `${survival.health}%`;

    if (this.elTempVal) this.elTempVal.textContent = `${survival.temperature}°C`;
    if (this.elWaterVal) this.elWaterVal.textContent = `${survival.water}%`;
    if (this.elFoodVal) this.elFoodVal.textContent = `${survival.food}%`;

    const px = Math.round(player.position.x);
    const pz = Math.round(player.position.z);
    const py = Math.round(player.position.y);
    if (this.elCoords) this.elCoords.textContent = `X: ${px}  Z: ${pz}  ALT: ${py}m`;
    if (this.elTime) this.elTime.textContent = sky.getHourString();

    const deg = Math.round(((player.yaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI));
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dirIdx = Math.round(deg / 45) % 8;
    if (this.elCompass) this.elCompass.textContent = `${directions[dirIdx]} [${deg}°]`;
    if (this.elCompassNeedle) this.elCompassNeedle.style.transform = `rotate(${-deg}deg)`;

    if (this.elFlashlight) {
      this.elFlashlight.textContent = player.isFlashlightOn ? 'FLASH: ON' : 'FLASH: OFF';
      this.elFlashlight.classList.toggle('active', player.isFlashlightOn);
    }

    // Vehicle interaction prompt
    if (this.game.vehicleSystem) {
      const dist = this.game.vehicleSystem.getDistanceToPlayer(player.position);
      const isDriving = this.game.vehicleSystem.isDriving;
      if (isDriving) {
        this.elTargetCard.style.display = 'block';
        this.elTargetName.textContent = 'EXPLORER ROVER [ACTIVE]';
        this.elTargetSub.textContent = 'Press [E] to exit vehicle';
        this.elTargetHp.style.width = '100%';
        this.elTargetHpText.textContent = 'Operating';
        this.updateHotbar();
        return;
      } else if (dist < 3.8) {
        this.elTargetCard.style.display = 'block';
        this.elTargetName.textContent = 'EXPLORER ROVER MK-II';
        this.elTargetSub.textContent = 'Press [E] to mount & drive across terrain';
        this.elTargetHp.style.width = '100%';
        this.elTargetHpText.textContent = 'Ready';
        this.updateHotbar();
        return;
      }
    }

    // Show the closest habitat or living-world interaction.
    const habPrompt = this.game.habitatManager?.getInteractionPrompt(player.position);
    const researchPrompt = this.game.livingWorldSystem?.getInteractionPrompt(player.position);
    if (researchPrompt && (!habPrompt || researchPrompt.distance <= habPrompt.distance)) {
      this.elTargetCard.style.display = 'block';
      this.elTargetName.textContent = researchPrompt.text;
      this.elTargetSub.textContent = researchPrompt.text_mn || 'Research activity';
      this.elTargetHp.style.width = '100%';
      this.elTargetHpText.textContent = 'Available';
      this.updateHotbar();
      return;
    }
    if (habPrompt) {
      this.elTargetCard.style.display = 'block';
      this.elTargetName.textContent = habPrompt.text;
      this.elTargetSub.textContent = habPrompt.text_mn || '';
      this.elTargetHp.style.width = '100%';
      this.elTargetHpText.textContent = `${Math.round(this.game.habitatManager.airlockPressure)} kPa`;
      this.updateHotbar();
      return;
    }

    // Target Resource Inspection Card
    const targetNode = player.currentTargetNode;
    if (targetNode && !targetNode.isDepleted) {
      this.elTargetCard.style.display = 'block';
      this.elTargetName.textContent = targetNode.type.name;
      this.elTargetSub.textContent = `${targetNode.type.name_mn} • Hardness: ${targetNode.type.hardness} Mohs`;
      const hpPct = Math.max(0, Math.round((targetNode.currentHp / targetNode.maxHp) * 100));
      this.elTargetHp.style.width = `${hpPct}%`;
      this.elTargetHpText.textContent = `${Math.round(targetNode.currentHp)}/${targetNode.maxHp} HP`;
    } else if (!this.game.vehicleSystem?.isDriving) {
      this.elTargetCard.style.display = 'none';
    }

    this.updateHotbar();

    // Update F3 Performance Overlay if visible
    if (this.isPerfOverlayVisible && this.perfOverlay) {
      this.perfFrameCount++;
      this.perfTimeAcc += delta;
      if (this.perfTimeAcc >= 0.5) {
        this.perfFpsAvg = Math.round(this.perfFrameCount / this.perfTimeAcc);
        this.perfFrameCount = 0;
        this.perfTimeAcc = 0;
      }
      this.perfFpsCurrent = Math.round(1 / Math.max(0.001, delta));
      this.perfFrameTime = (delta * 1000).toFixed(1);

      const r = this.game.renderer;
      const calls = r ? r.info.render.calls : 0;
      const tris = r ? r.info.render.triangles : 0;
      const chunks = this.game.terrain ? this.game.terrain.chunks.size : 0;
      const p = this.game.player ? this.game.player.position : { x: 0, y: 0, z: 0 };
      const surfH = this.game.terrain ? this.game.terrain.getBaseHeight(p.x, p.z) : 0;
      const depth = surfH - p.y;
      const geo = this.game.terrain ? this.game.terrain.getGeologyAt(p.x, p.y, p.z) : null;

      const fpsColor = this.perfFpsCurrent >= 55 ? '#10b981' : (this.perfFpsCurrent >= 30 ? '#f59e0b' : '#ef4444');

      this.perfOverlay.innerHTML = `
        <div style="font-weight: 800; color: #00f0ff; margin-bottom: 4px; border-bottom: 1px solid rgba(0,240,255,0.25); padding-bottom: 3px;">
          ⚡ FRONTIER TELEMETRY // [F3]
        </div>
        <div>FPS: <b style="color: ${fpsColor}; font-size: 13px;">${this.perfFpsCurrent}</b> (Avg: ${this.perfFpsAvg}) | Frame: <b>${this.perfFrameTime} ms</b></div>
        <div>Draw Calls: <b>${calls}</b> | Triangles: <b>${tris.toLocaleString()}</b></div>
        <div>Active 3D Chunks: <b>${chunks}</b></div>
        <div>Terrain Remesh: <b>${(this.game.lastRemeshTimeMs || 0).toFixed(1)} ms</b> | Physics: <b>${(this.game.lastPhysicsTimeMs || 0.4).toFixed(1)} ms</b></div>
        <div style="margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 3px; color: #94a3b8;">
          Position: <b>X: ${p.x.toFixed(1)} Y: ${p.y.toFixed(1)} Z: ${p.z.toFixed(1)}</b>
        </div>
        <div>Depth: <b style="color: ${depth > 2 ? '#38bdf8' : '#e2e8f0'}">${depth > 0 ? '-' + depth.toFixed(1) + ' m' : '+' + (-depth).toFixed(1) + ' m'}</b> (${depth > 2 ? 'UNDERGROUND' : 'SURFACE'})</div>
        <div>Strata: <b style="color: #f59e0b;">${geo ? geo.layer : 'SURFACE'}</b></div>
      `;
    }
  }

  hideHUD() {
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.style.display = 'none';
  }

  showHUD() {
    const hud = document.getElementById('hud-overlay');
    if (hud) hud.style.display = 'block';
  }
}
