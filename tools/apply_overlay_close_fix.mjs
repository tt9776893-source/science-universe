import fs from 'fs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// Backup
fs.writeFileSync('index.html.bak-close-fix', html);
console.log('Backup created as index.html.bak-close-fix');

// 1. Update Mobile Overlays rule
const mobileTarget = `  /* Native Mobile Overlays (Fullscreen) */
  #engOverlay, #chemOverlay, #bioOverlay, #aiOverlay, #computerOverlay {
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    transform: none !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    padding: max(14px, env(safe-area-inset-top, 14px)) 14px max(80px, calc(env(safe-area-inset-bottom, 14px) + 65px)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }`;

const mobileReplacement = `  /* Strict Overlay Closed Rules: Never intercept clicks, touch, or render when closed */
  #aiOverlay:not(.on),
  #chemOverlay:not(.on),
  #engOverlay:not(.eng-on),
  #bioOverlay:not(.open):not(.on),
  #computerOverlay:not(.on):not(.open),
  #mathOverlay:not(.open):not(.on),
  #spaceExploreOverlay:not(.open):not(.on),
  #suProfile:not(.open),
  #suLabDirectory:not(.open),
  .pl:not(.on) {
    display: none !important;
    pointer-events: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    z-index: -1 !important;
  }

  /* Native Mobile Overlays (Fullscreen when OPEN) */
  #engOverlay.eng-on, #chemOverlay.on, #bioOverlay.open, #bioOverlay.on, #aiOverlay.on, #computerOverlay.on, #computerOverlay.open {
    display: block !important;
    pointer-events: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    transform: none !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    padding: max(14px, env(safe-area-inset-top, 14px)) 14px max(80px, calc(env(safe-area-inset-bottom, 14px) + 65px)) !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 100050 !important;
  }`;

if (html.includes(mobileTarget)) {
  html = html.replace(mobileTarget, mobileReplacement);
  console.log('Mobile overlays rule replaced successfully');
} else {
  console.warn('Could not find mobileTarget exact string');
}

// 2. Update Tablet Overlays rule
const tabletTarget = `  #engOverlay, #chemOverlay, #bioOverlay, #aiOverlay, #computerOverlay {
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    transform: none !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    padding: 20px 24px 85px 24px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }`;

const tabletReplacement = `  #engOverlay.eng-on, #chemOverlay.on, #bioOverlay.open, #bioOverlay.on, #aiOverlay.on, #computerOverlay.on, #computerOverlay.open {
    display: block !important;
    pointer-events: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    transform: none !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    border: none !important;
    padding: 20px 24px 85px 24px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    z-index: 100050 !important;
  }`;

if (html.includes(tabletTarget)) {
  html = html.replace(tabletTarget, tabletReplacement);
  console.log('Tablet overlays rule replaced successfully');
} else {
  console.warn('Could not find tabletTarget exact string');
}

// 3. Update Desktop Overlays rule
const desktopStartNeedle = '/* Fullscreen & Expansive Desktop Laboratory Workspaces (Math Lab Standard for All Labs) */';
const dStartIdx = html.indexOf(desktopStartNeedle);
if (dStartIdx === -1) {
  throw new Error('Could not find desktopStartNeedle');
}
const desktopEndNeedle = '.pl-tabs {\n    grid-template-columns: repeat(4, 1fr) !important;\n    max-width: 1400px !important;\n  }';
const dEndIdx = html.indexOf(desktopEndNeedle, dStartIdx) + desktopEndNeedle.length;

console.log('Replacing desktop overlay rules between [', dStartIdx, ',', dEndIdx, ']...');

const newDesktopBlock = `/* Fullscreen & Expansive Desktop Laboratory Workspaces (Math Lab Standard for All Labs) */
  #mathOverlay.open, #mathOverlay.on,
  #computerOverlay.on, #computerOverlay.open,
  #spaceExploreOverlay.open, #spaceExploreOverlay.on,
  #bioOverlay.open, #bioOverlay.on,
  #engOverlay.eng-on {
    display: block !important;
    pointer-events: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    z-index: 100050 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    border: none !important;
    border-radius: 0 !important;
    transform: none !important;
    box-sizing: border-box !important;
    -webkit-overflow-scrolling: touch !important;
    box-shadow: none !important;
  }

  /* Distinct Color Theme Backgrounds */
  #chemOverlay {
    background: radial-gradient(circle at 15% 10%, rgba(54, 234, 208, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(89, 243, 211, 0.08) 0%, transparent 50%),
                linear-gradient(160deg, #04141c 0%, #082428 45%, #051c20 100%) !important;
    color: #e6fffb !important;
  }
  #engOverlay {
    background: radial-gradient(circle at 15% 10%, rgba(140, 149, 255, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(255, 184, 77, 0.08) 0%, transparent 50%),
                linear-gradient(160deg, #080c20 0%, #121438 45%, #181232 100%) !important;
    color: #f0f2ff !important;
  }
  #aiOverlay {
    background: radial-gradient(circle at 15% 10%, rgba(45, 184, 142, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(86, 230, 209, 0.08) 0%, transparent 50%),
                linear-gradient(160deg, #041416 0%, #092622 45%, #061e20 100%) !important;
    color: #eafff8 !important;
  }
  #bioOverlay {
    background: radial-gradient(circle at 15% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(244, 114, 182, 0.08) 0%, transparent 50%),
                linear-gradient(160deg, #061814 0%, #0a261c 45%, #161026 100%) !important;
    color: #f0fff8 !important;
  }

  /* Centered Wrapper & Padding */
  #chemOverlay.on, #aiOverlay.on {
    padding: 24px 32px 85px 32px !important;
  }
  #engOverlay .eng-wrap,
  #bioOverlay .bio-wrap {
    width: 100% !important;
    max-width: 1380px !important;
    margin: 0 auto !important;
    padding: 24px 32px 85px 32px !important;
    box-sizing: border-box !important;
  }

  /* Chemistry Lab: Desktop 2-Column Grid when OPEN */
  #chemOverlay.on {
    display: grid !important;
    pointer-events: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    z-index: 100050 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    border: none !important;
    border-radius: 0 !important;
    transform: none !important;
    box-sizing: border-box !important;
    grid-template-columns: 340px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
    max-width: 1380px !important;
    margin: 0 auto !important;
    padding: 24px 32px 85px 32px !important;
  }
  #chemOverlay .ch-head {
    grid-area: header !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid rgba(54, 234, 208, 0.22) !important;
    padding-bottom: 14px !important;
    margin-bottom: 4px !important;
  }
  #chemOverlay .ch-head h1 {
    font: 800 clamp(22px, 3.5vw, 30px)/1.2 Orbitron, Inter, sans-serif !important;
    color: #ffffff !important;
    text-shadow: 0 0 18px rgba(54, 234, 208, 0.55) !important;
  }
  #chemOverlay .ch-back {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    background: linear-gradient(135deg, rgba(10, 45, 48, 0.85), rgba(6, 26, 32, 0.95)) !important;
    border: 1px solid rgba(54, 234, 208, 0.5) !important;
    color: #e6fffb !important;
    padding: 10px 18px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
  }
  #chemOverlay .ch-back:hover {
    border-color: #36ead0 !important;
    box-shadow: 0 0 16px rgba(54, 234, 208, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  #chemOverlay .ch-cinema {
    margin: 0 0 14px 0 !important;
    border-color: rgba(54, 234, 208, 0.35) !important;
    border-radius: 16px !important;
  }
  #chemOverlay .ch-tabs {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-top: 10px !important;
  }
  #chemOverlay .ch-tabs button {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 14px !important;
    min-height: 52px !important;
    border-radius: 12px !important;
    background: linear-gradient(145deg, rgba(8, 30, 36, 0.85), rgba(5, 20, 26, 0.9)) !important;
    border: 1px solid rgba(54, 234, 208, 0.25) !important;
    color: #e6fffb !important;
    font-weight: 600 !important;
    font-size: 13.5px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    text-align: left !important;
  }
  #chemOverlay .ch-tabs button.active {
    background: linear-gradient(135deg, #12544e 0%, #083634 100%) !important;
    border-color: #36ead0 !important;
    box-shadow: 0 0 16px rgba(54, 234, 208, 0.4) !important;
  }
  #chemOverlay .ch-panel {
    min-width: 0 !important;
  }
  #chemOverlay .ch-table {
    display: grid !important;
    grid-template-columns: repeat(18, minmax(0, 1fr)) !important;
    gap: 4px !important;
  }

  /* Engineering Lab: Desktop 2-Column Grid */
  #engOverlay .eng-wrap {
    display: grid !important;
    grid-template-columns: 320px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
  }
  #engOverlay .eng-top {
    grid-area: header !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid rgba(140, 149, 255, 0.22) !important;
    padding-bottom: 14px !important;
    margin-bottom: 4px !important;
  }
  #engOverlay .eng-top h1 {
    font: 800 clamp(22px, 3.5vw, 30px)/1.2 Orbitron, Inter, sans-serif !important;
    color: #ffffff !important;
    text-shadow: 0 0 18px rgba(140, 149, 255, 0.55) !important;
  }
  #engOverlay .eng-btn {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    background: linear-gradient(135deg, rgba(30, 32, 75, 0.85), rgba(16, 18, 48, 0.95)) !important;
    border: 1px solid rgba(140, 149, 255, 0.5) !important;
    color: #f0f2ff !important;
    padding: 10px 18px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
  }
  #engOverlay .eng-btn:hover {
    border-color: #8c95ff !important;
    box-shadow: 0 0 16px rgba(140, 149, 255, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  #engOverlay .eng-tabs {
    grid-area: sidebar !important;
    position: sticky !important;
    top: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }
  #engOverlay .eng-tabs button {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 14px !important;
    min-height: 52px !important;
    border-radius: 12px !important;
    background: linear-gradient(145deg, rgba(22, 24, 58, 0.85), rgba(14, 16, 40, 0.9)) !important;
    border: 1px solid rgba(140, 149, 255, 0.25) !important;
    color: #f0f2ff !important;
    font-weight: 600 !important;
    font-size: 13.5px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    text-align: left !important;
  }
  #engOverlay .eng-tabs button.active {
    background: linear-gradient(135deg, #3d3b7e 0%, #1e204c 100%) !important;
    border-color: #8c95ff !important;
    box-shadow: 0 0 16px rgba(140, 149, 255, 0.4) !important;
  }
  #engOverlay .eng-panel {
    grid-area: main !important;
    min-width: 0 !important;
  }
  #engOverlay .eng-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
    gap: 18px !important;
  }

  /* AI Lab: Desktop 2-Column Grid when OPEN */
  #aiOverlay.on {
    display: grid !important;
    pointer-events: auto !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: fixed !important;
    inset: 0 !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    z-index: 100050 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    border: none !important;
    border-radius: 0 !important;
    transform: none !important;
    box-sizing: border-box !important;
    grid-template-columns: 320px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
    max-width: 1380px !important;
    margin: 0 auto !important;
    padding: 24px 32px 85px 32px !important;
  }
  #aiOverlay .ai-top {
    grid-area: header !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid rgba(45, 184, 142, 0.22) !important;
    padding-bottom: 14px !important;
    margin-bottom: 4px !important;
  }
  #aiOverlay h1 {
    display: none !important;
  }
  #aiOverlay > p {
    display: none !important;
  }
  #aiOverlay .ai-btn#aiClose {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    background: linear-gradient(135deg, rgba(12, 45, 36, 0.85), rgba(6, 26, 22, 0.95)) !important;
    border: 1px solid rgba(45, 184, 142, 0.5) !important;
    color: #eafff8 !important;
    padding: 10px 18px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
  }
  #aiOverlay .ai-btn#aiClose:hover {
    border-color: #2db88e !important;
    box-shadow: 0 0 16px rgba(45, 184, 142, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  #aiOverlay .ai-box {
    margin: 0 0 14px 0 !important;
    border-color: rgba(45, 184, 142, 0.35) !important;
    border-radius: 16px !important;
  }
  #aiOverlay .ai-tabs {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin-top: 10px !important;
  }
  #aiOverlay .ai-tabs button {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 14px !important;
    min-height: 52px !important;
    border-radius: 12px !important;
    background: linear-gradient(145deg, rgba(8, 30, 24, 0.85), rgba(5, 20, 16, 0.9)) !important;
    border: 1px solid rgba(45, 184, 142, 0.25) !important;
    color: #eafff8 !important;
    font-weight: 600 !important;
    font-size: 13.5px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    text-align: left !important;
  }
  #aiOverlay .ai-tabs button.active {
    background: linear-gradient(135deg, #155c45 0%, #0a3628 100%) !important;
    border-color: #2db88e !important;
    box-shadow: 0 0 16px rgba(45, 184, 142, 0.4) !important;
  }
  #aiOverlay .ai-panel {
    min-width: 0 !important;
  }

  /* Biology Lab: Desktop 2-Column Grid */
  #bioOverlay .bio-wrap {
    display: grid !important;
    grid-template-columns: 320px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
  }
  #bioOverlay .bio-head {
    grid-area: header !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid rgba(16, 185, 129, 0.22) !important;
    padding-bottom: 14px !important;
    margin-bottom: 4px !important;
  }
  #bioOverlay .bio-head h1 {
    font: 800 clamp(22px, 3.5vw, 30px)/1.2 Orbitron, Inter, sans-serif !important;
    color: #ffffff !important;
    text-shadow: 0 0 18px rgba(16, 185, 129, 0.55) !important;
  }
  #bioOverlay .bio-btn {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    background: linear-gradient(135deg, rgba(10, 48, 35, 0.85), rgba(6, 28, 20, 0.95)) !important;
    border: 1px solid rgba(16, 185, 129, 0.5) !important;
    color: #f0fff8 !important;
    padding: 10px 18px !important;
    min-height: 44px !important;
    border-radius: 12px !important;
    cursor: pointer !important;
    font-weight: 700 !important;
    font-size: 13.5px !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
  }
  #bioOverlay .bio-btn:hover {
    border-color: #10b981 !important;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  #bioOverlay .bio-tabs {
    grid-area: sidebar !important;
    position: sticky !important;
    top: 20px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }
  #bioOverlay .bio-tab {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 12px 14px !important;
    min-height: 52px !important;
    border-radius: 12px !important;
    background: linear-gradient(145deg, rgba(12, 34, 26, 0.85), rgba(7, 22, 16, 0.9)) !important;
    border: 1px solid rgba(16, 185, 129, 0.25) !important;
    color: #f0fff8 !important;
    font-weight: 600 !important;
    font-size: 13.5px !important;
    cursor: pointer !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    text-align: left !important;
  }
  #bioOverlay .bio-tab.active {
    background: linear-gradient(135deg, #136345 0%, #0a3a28 100%) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.4) !important;
  }
  #bioOverlay .bio-panel {
    grid-area: main !important;
    min-width: 0 !important;
  }
  #bioOverlay .bio-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
    gap: 18px !important;
  }

  /* Desktop Physics Lab: Spacious Workspace & 4-Column Grid */
  .pl {
    padding: 28px 48px 40px !important;
  }
  .pl-bar {
    max-width: 1400px !important;
    margin-bottom: 20px !important;
  }
  .pl-body {
    max-width: 1400px !important;
    padding: 10px 16px 40px !important;
  }
  .pl-title {
    font-size: 38px !important;
    margin-bottom: 8px !important;
  }
  .pl-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 22px !important;
  }
  .pl-cell {
    height: 200px !important;
  }
  .pl-tabs {
    grid-template-columns: repeat(4, 1fr) !important;
    max-width: 1400px !important;
  }`;

html = html.slice(0, dStartIdx) + newDesktopBlock + html.slice(dEndIdx);
console.log('Desktop overlay rules replaced successfully');

// 4. Inject Universal Fail-Safe Overlay Manager Script before </body>
const universalManagerScript = `<script id="su-universal-overlay-manager">
/**
 * SCIENCE UNIVERSE — UNIVERSAL OVERLAY & CLOSE ENGINE
 * Guarantees that every Close/Back button, Escape key, and backdrop click
 * immediately and completely closes the overlay, removes blocking layers,
 * and restores full interactivity to the underlying UI.
 */
(function() {
  'use strict';

  const OVERLAY_CONFIGS = [
    { id: 'aiOverlay', openClass: 'on', closeSelectors: ['#aiClose', '.ai-btn#aiClose'] },
    { id: 'chemOverlay', openClass: 'on', closeSelectors: ['#chemClose', '.ch-back#chemClose'] },
    { id: 'engOverlay', openClass: 'eng-on', closeSelectors: ['#engClose', '.eng-btn#engClose'] },
    { id: 'bioOverlay', openClass: 'open', closeSelectors: ['#bioBack', '.bio-btn#bioBack'] },
    { id: 'computerOverlay', openClass: 'on', closeSelectors: ['#cExit', '.c-back-btn#cExit'] },
    { id: 'mathOverlay', openClass: 'open', closeSelectors: ['#mathBack', '.math-back-btn#mathBack'] },
    { id: 'spaceExploreOverlay', openClass: 'open', closeSelectors: ['#seCloseBtn', '.se-close-btn#seCloseBtn'] },
    { id: 'suProfile', openClass: 'open', closeSelectors: ['#prClose', '#prCloseBottom'] },
    { id: 'suLabDirectory', openClass: 'open', closeSelectors: ['#suDirectoryClose', '.directory-close'] },
    { id: 'suUnlockModal', isHidden: true, closeSelectors: ['#suUnlockClose', '.su-modal-close'] }
  ];

  function closeSingleOverlay(cfg) {
    const el = document.getElementById(cfg.id);
    if (!el) return false;
    let wasOpen = false;
    if (cfg.openClass && (el.classList.contains(cfg.openClass) || el.classList.contains('on') || el.classList.contains('open') || el.classList.contains('eng-on'))) {
      wasOpen = true;
      el.classList.remove(cfg.openClass, 'on', 'open', 'eng-on', 'eng-subview');
    }
    if (cfg.isHidden && !el.hidden) {
      wasOpen = true;
      el.hidden = true;
    }
    // Force inline style overrides to guarantee immediate disappearance
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.setAttribute('aria-hidden', 'true');
    return wasOpen;
  }

  function closePhysicsLab() {
    const pl = document.querySelector('.pl');
    if (pl && pl.classList.contains('on')) {
      pl.classList.remove('on');
      pl.style.setProperty('display', 'none', 'important');
      pl.style.setProperty('pointer-events', 'none', 'important');
      pl.setAttribute('aria-hidden', 'true');
      return true;
    }
    return false;
  }

  function checkAnyOverlayOpen() {
    for (const cfg of OVERLAY_CONFIGS) {
      const el = document.getElementById(cfg.id);
      if (el) {
        if (cfg.openClass && (el.classList.contains(cfg.openClass) || el.classList.contains('on') || el.classList.contains('open') || el.classList.contains('eng-on'))) {
          return true;
        }
        if (cfg.isHidden && !el.hidden && getComputedStyle(el).display !== 'none') {
          return true;
        }
      }
    }
    const pl = document.querySelector('.pl.on');
    if (pl && getComputedStyle(pl).display !== 'none') return true;
    return false;
  }

  function restoreBaseState() {
    if (!checkAnyOverlayOpen()) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('su-modal-open');
      document.documentElement.classList.remove('su-in-section');

      // Unblock all underlying UI components
      const elementsToUnblock = [
        document.getElementById('lab'),
        document.getElementById('phone'),
        document.querySelector('.phone'),
        document.querySelector('.hub'),
        document.querySelector('.tilt'),
        document.querySelector('.wall'),
        document.querySelector('nav.nav'),
        document.getElementById('suSections')
      ];
      elementsToUnblock.forEach(el => {
        if (el) {
          el.style.pointerEvents = 'auto';
        }
      });
    }
  }

  function universalClose(cfg) {
    closeSingleOverlay(cfg);
    restoreBaseState();
    window.dispatchEvent(new CustomEvent('su:overlay:closed', { detail: { id: cfg.id } }));
  }

  function initUniversalOverlayManager() {
    OVERLAY_CONFIGS.forEach(cfg => {
      const overlay = document.getElementById(cfg.id);
      if (!overlay) return;

      // Bind all matching close button selectors with capture
      cfg.closeSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            universalClose(cfg);
          }, true);
        });
      });

      // Close on backdrop click (click outside content)
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          universalClose(cfg);
        }
      });

      // Clean up inline style when opening
      const observer = new MutationObserver(() => {
        const isOpen = cfg.openClass && (overlay.classList.contains(cfg.openClass) || overlay.classList.contains('on') || overlay.classList.contains('open') || overlay.classList.contains('eng-on'));
        if (isOpen) {
          overlay.style.removeProperty('display');
          overlay.style.removeProperty('pointer-events');
          overlay.style.removeProperty('visibility');
          overlay.setAttribute('aria-hidden', 'false');
        }
      });
      observer.observe(overlay, { attributes: true, attributeFilter: ['class', 'hidden'] });
    });

    // Physics Lab Back Button
    document.querySelectorAll('.pl-back').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closePhysicsLab();
        restoreBaseState();
      }, true);
    });

    // Global Escape Key Listener (closes topmost active overlay)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        for (let i = OVERLAY_CONFIGS.length - 1; i >= 0; i--) {
          const cfg = OVERLAY_CONFIGS[i];
          const el = document.getElementById(cfg.id);
          if (el && (el.classList.contains(cfg.openClass || 'on') || (!cfg.openClass && !el.hidden))) {
            universalClose(cfg);
            return;
          }
        }
        if (closePhysicsLab()) {
          restoreBaseState();
          return;
        }
      }
    });

    // Hook existing open functions to unblock styles
    ['openAILab', 'openChemLab', 'openEngLab', 'openBioLab', 'openComputerLab', 'openMathLab', 'openSpaceExplore', 'openProfile'].forEach(fnName => {
      if (typeof window[fnName] === 'function') {
        const orig = window[fnName];
        window[fnName] = function(...args) {
          const res = orig.apply(this, args);
          return res;
        };
      }
    });
  }

  window.suCloseAllOverlays = function() {
    OVERLAY_CONFIGS.forEach(cfg => closeSingleOverlay(cfg));
    closePhysicsLab();
    restoreBaseState();
  };

  window.SU_OVERLAY_MANAGER = {
    configs: OVERLAY_CONFIGS,
    close: universalClose,
    closeAll: window.suCloseAllOverlays,
    checkAnyOpen: checkAnyOverlayOpen
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalOverlayManager);
  } else {
    initUniversalOverlayManager();
  }
})();
</script>
`;

const bodyCloseIdx = html.lastIndexOf('</body>');
if (bodyCloseIdx === -1) {
  throw new Error('Could not find </body> in index.html');
}
html = html.slice(0, bodyCloseIdx) + universalManagerScript + html.slice(bodyCloseIdx);
console.log('Universal Overlay Manager script injected before </body>');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully saved index.html! New length:', html.length);

