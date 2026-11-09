// SCIENCE UNIVERSE — FRONTIER
// ContextualTutorials — optional in-context guides for labs and systems.
// Mongolian-language content. Triggered when player visits relevant areas.

export const CONTEXTUAL_GUIDES = {
  physics_lab: {
    id: 'physics_lab',
    title: { en: 'Physics Lab', mn: 'Физикийн лаборатори' },
    steps: [
      { text: { en: 'Use the gravity manipulator to reshape terrain.', mn: 'Гравिटэйн хэлбэржүүлэгч ашиглан хэвлэлтийг хэлбэржүүлээрэй.' }, control: { en: 'Hotbar slot 4', mn: 'Hotbar 4-слот' } },
      { text: { en: 'Left-click carves terrain; right-click builds mounds.', mn: 'Зүүн товч хэвлэлтийг хаяж байна; баруун товч тостон үүсгэнэ.' }, control: '' }
    ]
  },
  chemistry_lab: {
    id: 'chemistry_lab',
    title: { en: 'Chemistry Lab', mn: 'Химийн лаборатори' },
    steps: [
      { text: { en: 'Mix elements to create compounds.', mn: 'Элемэнтүүдээс зоогийг үүсгэнэ.' }, control: '' },
      { text: { en: 'Follow the chemical reactor safety procedures.', mn: 'Химийн реакторийн анхны хүлээгээлүүдэ pursued.' }, control: '' }
    ]
  },
  biology_lab: {
    id: 'biology_lab',
    title: { en: 'Biology Lab', mn: 'Биологийн лаборатори' },
    steps: [
      { text: { en: 'Study cell structure and DNA.', mn: 'Цэлийн сэрчлэх болон ДНК-ийн судалгаа.' }, control: '' },
      { text: { en: 'Run greenhouse experiments to grow plants.', mn: 'Ногооны туршилтыг greenhouse-д гүйцэтгэ.' }, control: '' }
    ]
  },
  engineering_lab: {
    id: 'engineering_lab',
    title: { en: 'Engineering Lab', mn: 'Инженерийн лаборатори' },
    steps: [
      { text: { en: 'Build devices from components in the Invention System.', mn: 'Инвенторийн хэсгүүдээр үлэг үүсгэнэ.' }, control: 'Key I' },
      { text: { en: 'Validate power budget before testing.', mn: 'Туршилт өмнөчлэн энергийн хэмжээнэ шалгана.' }, control: '' }
    ]
  },
  mathematics_lab: {
    id: 'mathematics_lab',
    title: { en: 'Mathematics Lab', mn: 'Математик лаборатори' },
    steps: [
      { text: { en: 'Calculate mission trajectories and fuel ratios.', mn: 'Миссийн зурguulalt болон н燃料 ratio-ыг тооцоолно.' }, control: '' },
      { text: { en: 'Solve orbital mechanics problems.', mn: 'Орбитын механикийн асуултодуудыг шийдвэрлэ.' }, control: '' }
    ]
  },
  ai_lab: {
    id: 'ai_lab',
    title: { en: 'AI Lab', mn: 'AI лаборатори' },
    steps: [
      { text: { en: 'Train autonomous agents for planetary exploration.', mn: 'Өөдөрт ажиллагаа агентүүдээ сур塔а.' }, control: '' },
      { text: { en: 'Monitor AI decision logs for safety.', mn: 'AI шийдвэрын лог мөнөөгийнг шийдвэрлэ.' }, control: '' }
    ]
  },
  computer_science_lab: {
    id: 'computer_science_lab',
    title: { en: 'Computer Science Lab', mn: 'Компьютерын шинжлэх лаборатори' },
    steps: [
      { text: { en: 'Write programs to automate rover operations.', mn: 'Роверын үйл ажиллагааг автоматчлах програм бичнэ.' }, control: '' },
      { text: { en: 'Debug telemetry data streams.', mn: 'Telemetry өгөгдлийн цωγц буग дотоодж байна.' }, control: '' }
    ]
  },
  planetary_exploration: {
    id: 'planetary_exploration',
    title: { en: 'Planetary Exploration', mn: 'Дэд боловсрол хэсэгчлэл' },
    steps: [
      { text: { en: 'Use the scanner to identify minerals.', mn: 'Сканер ашиглан минерал ш恩лэнэ.' }, control: 'Hotbar slot 6' },
      { text: { en: 'Collect samples with the Cryo Sample Vacuum.', mn: 'Крюо дээж цуглуулагч ашиглан дээж цуглуулна.' }, control: 'Hotbar slot 5' }
    ]
  },
  rocket_operation: {
    id: 'rocket_operation',
    title: { en: 'Rocket Operation', mn: 'Рөвчийн өргөлсөө' },
    steps: [
      { text: { en: 'Press E near the rocket to enter the cockpit.', mn: 'Рөвч өмнө E товч дээрээ ирээ.' }, control: 'Key E' },
      { text: { en: 'Launch from the pad to reach orbit.', mn: 'Pad-аас ирээд орбитод дуусан.' }, control: '' },
      { text: { en: 'Land on other planets to expand research.', mn: 'Өөр дэд боловсролд ард气саар landings.' }, control: '' }
    ]
  },
  mining_excavation: {
    id: 'mining_excavation',
    title: { en: 'Mining & Terrain', mn: 'Өрөөмж болон хэвлэл' },
    steps: [
      { text: { en: 'Use the Mining Laser to extract resources.', mn: 'Өрөөмжийн лазер ашиглан нөөц өгсөн.' }, control: 'Hotbar slot 1' },
      { text: { en: 'Use the Terrain Manipulator to carve paths.', mn: 'Хэвлэл manipulating тоон үйлчлэнэ.' }, control: 'Hotbar slot 4' }
    ]
  },
  research_journal: {
    id: 'research_journal',
    title: { en: 'Research Journal', mn: 'Шинжлэх журнал' },
    steps: [
      { text: { en: 'Follow the scientific method: observe, scan, collect, hypothesize, experiment, analyze, record.', mn: 'Шинжлэх замаас дасан дараах: үүлэглэх, сканлэх, цуглуулга, гипотез, туршилт, шийдвэрлэх, წელის계する.' }, control: 'Key J' },
      { text: { en: 'Record discoveries to build your scientific legacy.', mn: 'Шинэ шатанд руу явж шинжлэх үнийг үүсгэ.' }, control: '' }
    ]
  },
  invention_construction: {
    id: 'invention_construction',
    title: { en: 'Invention & Construction', mn: 'Хүлэгт суулга' },
    steps: [
      { text: { en: 'Gather components from inventory for device assembly.', mn: 'Инвенторийн хэсгүүдээ үлэгт аൾ болгон.' }, control: 'Key I' },
      { text: { en: 'Validate power and durability before testing.', mn: 'Туршилт өмнө energy болон хэттэйд шалгана.' }, control: '' }
    ]
  },
  life_creation: {
    id: 'life_creation',
    title: { en: 'Life Creation & Evolution', mn: 'Амьдрал үүсгэл болон өөрчлөлт' },
    steps: [
      { text: { en: 'Seed organisms in the Life Creation lab.', mn: 'Life Creation лабт амьцгаgal цэвэршүүлэгчдөө өгсөн.' }, control: '' },
      { text: { en: 'Run the simulation and observe evolution.', mn: 'Туршилтыг гүйцэтгэж өөрчлөлтийг үүлэглэ.' }, control: '' }
    ]
  },
  civilization_observation: {
    id: 'civilization_observation',
    title: { en: 'Civilization Observation', mn: 'Б боловсролын нөхцөл шILжлэх' },
    steps: [
      { text: { en: 'Watch intelligent groups form societies.', mn: 'Intelligent зогсоолууд боловсролд үүсгэдэг.' }, control: '' },
      { text: { en: 'Guide research priorities through the Civilization Engine.', mn: 'Б боловсролын 엔진ээр судалгааны өмнөчтэй тохиргоо.' }, control: '' }
    ]
  }
};

export class ContextualTutorials {
  constructor(game, tutorialSystem, tutorialUI) {
    this.game = game;
    this.tutorialSystem = tutorialSystem;
    this.tutorialUI = tutorialUI;
  }

  getGuide(guideId) {
    return CONTEXTUAL_GUIDES[guideId] || null;
  }

  isUnlocked(guideId) {
    return this.tutorialSystem.isContextualGuideUnlocked(guideId);
  }

  unlock(guideId) {
    this.tutorialSystem.unlockContextualGuide(guideId);
  }

  showGuide(guideId) {
    const guide = this.getGuide(guideId);
    if (!guide) return false;

    // Show via a simple modal overlay
    this._renderGuideModal(guide);
    return true;
  }

  _renderGuideModal(guide) {
    // Remove any existing guide modal
    const existing = document.getElementById('contextual-guide-modal');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'contextual-guide-modal';
    el.style.cssText = `
      display:block;position:fixed;inset:0;z-index:2150;
      background:rgba(6,10,18,0.93);font-family:system-ui,sans-serif;
      color:#e2f1ff;overflow:hidden;pointer-events:auto;
    `;
    const stepsHtml = guide.steps.map((s, i) => `
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:12px;margin-bottom:8px;border-left:3px solid #34d399;">
        <div style="font-size:13px;font-weight:600;color:#34d399;">Шаг ${i + 1}</div>
        <div style="font-size:13px;line-height:1.5;margin-top:4px;">${s.text.mn} (${s.text.en})</div>
        ${s.control ? `<div style="font-size:11px;color:#00f0ff;margin-top:4px;">Цэс: ${s.control.mn || s.control}</div>` : ''}
      </div>
    `).join('');

    el.innerHTML = `
      <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;z-index:2;">
        <h2 style="margin:0;font-size:17px;">📖 ${guide.title.mn} (${guide.title.en})</h2>
        <button id="ctx-btn-close" style="padding:6px 14px;background:#34d399;color:#080509;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">Харих</button>
      </div>
      <div style="position:absolute;top:60px;bottom:10px;left:10px;right:10px;overflow-y:auto;padding:16px;">
        ${stepsHtml}
        <div style="margin-top:20px;text-align:center;">
          <button id="ctx-btn-ok" class="su-btn primary" style="padding:8px 20px;font-size:13px;">Зурвасл erfüllt</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);

    document.getElementById('ctx-btn-close')?.addEventListener('click', () => el.remove());
    document.getElementById('ctx-btn-ok')?.addEventListener('click', () => el.remove());
    el.addEventListener('keydown', (e) => { if (e.code === 'Escape') { e.preventDefault(); el.remove(); } });
    el.setAttribute('tabindex', '-1');
    el.focus();

    // Restore pointer lock after close
    const onRemove = () => {
      if (!this.game.isAcademyOpen && !this.game.isInventoryOpen && !this.game.isPauseOpen && !this.game.isResearchOpen && !this.game.isInventionOpen && !this.game.isTutorialOpen) {
        this.game.input?.requestPointerLock?.();
      }
    };
    // We can't easily detect removal, so we add a timeout-based check
    setTimeout(() => {
      if (!document.getElementById('contextual-guide-modal')) onRemove();
    }, 100);
  }
}
