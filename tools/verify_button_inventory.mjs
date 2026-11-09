import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// List of all known close/back buttons and their expected parent components
const BUTTONS = [
  // Authentication & Onboarding
  { id: 'back', text: '‹ Буцах', expectedParent: 'sheet' },

  // Profile System
  { id: 'prClose', text: '✕ Хаах', expectedParent: 'suProfile' },
  { id: 'prCloseBottom', text: '✕ Профайлаас гарах / Хаах', expectedParent: 'suProfile' },
  { selector: '[data-prback]', text: '← Буцах', expectedParent: 'suProfile sub-screens' },
  { id: 'prCancelEdit', text: 'Болих', expectedParent: 'pr-screen edit' },
  { id: 'suSwitchCancel', text: 'Болих', expectedParent: 'suSwitchConfirmModal' },
  { id: 'suLogoutCancel', text: 'Болих', expectedParent: 'suLogoutConfirmModal' },

  // Directory Modal
  { id: 'suDirectoryClose', text: '✕', expectedParent: 'suLabDirectory' },

  // Unlock Modal
  { id: 'suUnlockClose', text: '✕', expectedParent: 'suUnlockModal' },
  { id: 'suUnlockCancelBtn', text: 'Болих', expectedParent: 'suUnlockModal' },
  { id: 'suUnlockGotItBtn', text: 'Ойлголоо', expectedParent: 'suUnlockModal' },

  // AI Lab
  { id: 'aiClose', text: '✕ Хаах', expectedParent: 'aiOverlay' },

  // Chemistry Lab
  { id: 'chemClose', text: '← Буцах', expectedParent: 'chemOverlay' },
  { id: 'clBackBtn', text: '‹ Буцах', expectedParent: 'chemOverlay' },
  { id: 'clSpeedClose', text: 'Боллоо', expectedParent: 'clSpeedPanel' },

  // Engineering Lab
  { id: 'engClose', text: '← Буцах', expectedParent: 'engOverlay' },
  { id: 'engBackHome', text: '‹ Буцах', expectedParent: 'engOverlay subview' },

  // Biology Lab
  { id: 'bioBack', text: '← Буцах', expectedParent: 'bioOverlay' },

  // Computer Lab
  { id: 'cExit', text: 'Буцах', expectedParent: 'computerOverlay' },
  { id: 'cReaderBack', text: '← Бүх сэдэв рүү буцах', expectedParent: 'cReader' },

  // Math Lab
  { id: 'mathBack', text: 'Буцах', expectedParent: 'mathOverlay' },

  // Physics Lab
  { selector: '.pl-back', text: '‹ Буцах', expectedParent: 'pl (Physics Lab)' },
  { id: 'plDialogClose', text: '✕', expectedParent: 'pl-dialog' },
  { id: 'plSpeedClose', text: 'Боллоо', expectedParent: 'plSpeedPanel' },

  // Space Explore Overlay
  { id: 'seCloseBtn', text: 'Хаах', expectedParent: 'spaceExploreOverlay' },

  // Space Lab Research
  { id: 'suJournalClose', text: 'Хаах ✕', expectedParent: 'suJournal' }
];

console.log(`Checking ${BUTTONS.length} critical close/back buttons in index.html...`);

BUTTONS.forEach((b, idx) => {
  const searchStr = b.id ? `id="${b.id}"` : b.selector;
  const found = html.includes(b.id ? `id="${b.id}"` : (b.selector.startsWith('[') ? b.selector.slice(1, -1) : b.selector));
  console.log(`${idx + 1}. [${found ? 'FOUND' : 'MISSING'}] ${b.id || b.selector} (${b.text}) -> Parent: ${b.expectedParent}`);
});

