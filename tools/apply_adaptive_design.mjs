import fs from 'fs';

const filePath = 'index.html';
const backupPath = 'index.html.bak-adaptive';

let content = fs.readFileSync(filePath, 'utf8');

// 1. Create a backup
fs.writeFileSync(backupPath, content, 'utf8');
console.log('Created backup at', backupPath);

// 2. Fix Main Lab CSS spacing in Location 1 (around .title, .hub, .tilt)
const targetLoc1 = '/* ===== ХОЛБООНЫ ЛАБ: найман өнцөгт танхим ===== */\n.title{margin-top:6px}.title p{text-shadow:0 2px 10px rgba(0,0,10,.9)}\n.hub{position:relative;flex:1;margin:0 -24px;perspective:1000px;perspective-origin:50% 30%;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none}\n.hub.drag{cursor:grabbing}\n.tilt{position:absolute;left:50%;top:41%;width:0;height:0;transform-style:preserve-3d;transform:rotateX(-40deg)}';

const replacementLoc1 = `/* ===== ХОЛБООНЫ ЛАБ: найман өнцөгт танхим ===== */
#lab .title{margin:16px auto 10px auto;text-align:center;position:relative;z-index:5;flex:none}
#lab .title h1.lt{font-family:var(--display,Orbitron,sans-serif);font-weight:800;font-size:clamp(24px,3.8vw,42px);letter-spacing:.08em;margin:0 0 8px 0;line-height:1.2;background:linear-gradient(#e9f0ff,#7ea2ff);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(90,140,255,.6))}
#lab .title p{margin:0 0 16px 0;font-size:clamp(12px,1.2vw,15.5px);color:#9fb6f0;letter-spacing:.04em;line-height:1.5;text-shadow:0 2px 10px rgba(0,0,10,.9)}
#lab .hub{position:relative;flex:1 1 0;width:100%;min-height:280px;perspective:1050px;perspective-origin:50% 32%;touch-action:pan-y;cursor:grab;user-select:none;-webkit-user-select:none;margin:0 auto}
#lab .hub.drag{cursor:grabbing}
#lab .tilt{position:absolute;left:50%;top:49%;width:0;height:0;transform-style:preserve-3d;transform:rotateX(-35deg);transition:transform .4s ease-out}`;

if (content.includes(targetLoc1)) {
  content = content.replace(targetLoc1, replacementLoc1);
  console.log('Successfully replaced Location 1 Main Lab spacing and tilt positioning!');
} else {
  console.log('Target Location 1 exact string not found, trying flexible regex replace...');
  content = content.replace(
    /\/\* ===== ХОЛБООНЫ ЛАБ: найман өнцөгт танхим ===== \*\/[\s\S]*?\.tilt\{position:absolute;left:50%;top:41%;width:0;height:0;transform-style:preserve-3d;transform:rotateX\(-40deg\)\}/,
    replacementLoc1
  );
  console.log('Regex replace attempted on Location 1.');
}

// 3. Replace APP CONTAINER & BOTTOM NAVIGATION RESPONSIVENESS and OVERLAYS & MODALS RESPONSIVENESS
// Locate from /* ==========================================================================\n   APP CONTAINER & BOTTOM NAVIGATION RESPONSIVENESS
const appContainerMarker = '/* ==========================================================================\n   APP CONTAINER & BOTTOM NAVIGATION RESPONSIVENESS';
const unlockModalMarker = '/* 120-Credit Unlock Modal Interface */';

const appContainerIdx = content.indexOf(appContainerMarker);
const unlockModalIdx = content.indexOf(unlockModalMarker);

if (appContainerIdx !== -1 && unlockModalIdx !== -1) {
  const newResponsiveArchitecture = `/* ==========================================================================
   SCIENCE UNIVERSE — ADAPTIVE DESKTOP FULLSCREEN & MOBILE NATIVE ARCHITECTURE
   ========================================================================== */

/* 1. Global Viewport & Container Reset */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 2. Mobile Screens (≤ 767px: 320px, 360px, 375px, 390px, 412px, 430px) */
@media (max-width: 767px) {
  body {
    display: block !important;
  }
  .phone {
    width: 100% !important;
    max-width: 100vw !important;
    height: 100% !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    overflow-x: hidden !important;
  }

  /* Main Lab Mobile View */
  #lab {
    padding: max(12px, env(safe-area-inset-top, 12px)) 16px 0 !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    max-height: 100dvh !important;
    overflow: hidden !important;
  }
  #lab .top {
    padding-bottom: 2px !important;
  }
  #lab .title {
    margin: 8px auto 4px auto !important;
  }
  #lab .title h1.lt {
    font-size: clamp(21px, 5.8vw, 25px) !important;
    margin-bottom: 4px !important;
  }
  #lab .title p {
    font-size: 11.5px !important;
    margin-bottom: 8px !important;
  }
  #lab .hub {
    flex: 1 1 0 !important;
    min-height: 270px !important;
    max-height: calc(100dvh - 265px) !important;
    perspective: 820px !important;
    perspective-origin: 50% 30% !important;
    margin: 0 -16px !important;
  }
  #lab .tilt {
    top: 47% !important;
    transform: rotateX(-35deg) scale(0.95) !important;
  }
  #lab .focus {
    margin: 4px 0 calc(76px + env(safe-area-inset-bottom, 0px)) 0 !important;
    padding: 0 4px !important;
    gap: 8px !important;
  }
  #lab .focus .rot {
    width: 42px !important;
    height: 42px !important;
    flex-shrink: 0 !important;
  }
  #lab .focus .enter {
    height: 42px !important;
    padding: 0 18px !important;
    font-size: 13.5px !important;
    flex-shrink: 0 !important;
  }
  #lab .focus .fi b {
    font-size: 14.5px !important;
  }
  #lab .focus .fi small {
    font-size: 11px !important;
  }

  /* Mobile App Bottom Navigation */
  .nav {
    position: fixed !important;
    left: 12px !important;
    right: 12px !important;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)) !important;
    height: 60px !important;
    border-radius: 20px !important;
    background: rgba(8, 14, 44, 0.92) !important;
    border: 1px solid rgba(90, 140, 255, 0.35) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    z-index: 200 !important;
  }
  .toast {
    bottom: calc(82px + env(safe-area-inset-bottom, 0px)) !important;
  }

  /* Native Mobile Overlays (Fullscreen) */
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
  }
  #chemOverlay .ch-table {
    display: block !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .pl {
    padding: max(14px, env(safe-area-inset-top, 14px)) 16px max(85px, calc(env(safe-area-inset-bottom, 14px) + 70px)) !important;
  }
  .pl-bar {
    max-width: 100% !important;
  }
  .pl-body {
    max-width: 100% !important;
    padding: 6px 0 30px !important;
  }
  .pl-grid {
    grid-template-columns: 1fr 1fr !important;
    gap: 12px !important;
  }
  .pl-cell {
    height: 155px !important;
  }
}

/* 3. Small Mobile Devices (≤ 350px: e.g. iPhone SE 1st gen) */
@media (max-width: 350px) {
  #lab .tilt {
    transform: rotateX(-35deg) scale(0.82) !important;
  }
  #lab .title h1.lt {
    font-size: 19px !important;
  }
  #lab .title p {
    font-size: 10.5px !important;
  }
  .pl-grid {
    grid-template-columns: 1fr !important;
  }
}

/* 4. Tablets & Foldables (768px – 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  body {
    display: block !important;
  }
  .phone {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  #lab {
    padding: 20px 32px 85px !important;
  }
  #lab .title {
    margin: 20px auto 14px auto !important;
  }
  #lab .title h1.lt {
    font-size: 32px !important;
    margin-bottom: 8px !important;
  }
  #lab .title p {
    font-size: 14px !important;
    margin-bottom: 18px !important;
  }
  #lab .hub {
    perspective: 1150px !important;
    min-height: 380px !important;
  }
  #lab .tilt {
    top: 48% !important;
    transform: rotateX(-32deg) scale(1.15) !important;
  }
  .nav {
    width: min(540px, 90vw) !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    bottom: 20px !important;
    height: 64px !important;
    border-radius: 22px !important;
  }
  #engOverlay, #chemOverlay, #bioOverlay, #aiOverlay, #computerOverlay {
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: min(92vw, 760px) !important;
    height: min(90vh, 880px) !important;
    border-radius: 22px !important;
  }
}

/* 5. Desktop & Laptop Fullscreen (≥ 1024px: 1024px, 1280px, 1366px, 1440px, 1920px+) */
@media (min-width: 1024px) {
  body {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    background: #05060f !important;
  }
  .phone {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    position: relative !important;
  }

  /* Spacious, Immersive Desktop Main Lab */
  #lab {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    padding: 24px 48px 100px !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    background: radial-gradient(90% 50% at 50% 0%, #12308a 0%, transparent 70%), linear-gradient(#060b28, #0a1a4a 55%, #04061a) !important;
  }
  #lab .top {
    max-width: 1440px !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding-bottom: 12px !important;
  }
  #lab .title {
    margin: 28px auto 16px auto !important;
    text-align: center !important;
  }
  #lab .title h1.lt {
    font-size: clamp(34px, 3.8vw, 48px) !important;
    letter-spacing: .08em !important;
    margin: 0 0 12px 0 !important;
    line-height: 1.15 !important;
  }
  #lab .title p {
    font-size: clamp(14px, 1.2vw, 17px) !important;
    color: #a8bdfa !important;
    letter-spacing: .04em !important;
    margin: 0 0 24px 0 !important;
  }
  #lab .hub {
    flex: 1 1 0 !important;
    min-height: 480px !important;
    max-width: 1400px !important;
    width: 100% !important;
    margin: 20px auto 0 auto !important;
    perspective: 1350px !important;
    perspective-origin: 50% 32% !important;
  }
  #lab .tilt {
    left: 50% !important;
    top: 50% !important;
    transform: rotateX(-30deg) scale(1.36) !important;
  }
  #lab .focus {
    max-width: 540px !important;
    margin: 20px auto 24px auto !important;
  }
  #lab .focus .fi b {
    font-size: 20px !important;
  }
  #lab .focus .fi small {
    font-size: 13.5px !important;
  }
  #lab .focus .rot {
    width: 48px !important;
    height: 48px !important;
    font-size: 26px !important;
  }
  #lab .focus .enter {
    height: 48px !important;
    padding: 0 28px !important;
    font-size: 15px !important;
  }

  /* Centered Floating Command Dock Navigation */
  .nav {
    position: fixed !important;
    width: min(680px, 92vw) !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    bottom: 24px !important;
    height: 68px !important;
    border-radius: 24px !important;
    background: rgba(8, 14, 44, 0.9) !important;
    border: 1px solid rgba(90, 140, 255, 0.4) !important;
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(90, 140, 255, 0.2) !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
    z-index: 200 !important;
  }
  .nav button {
    font-size: 12px !important;
    gap: 5px !important;
  }
  .nav button svg {
    width: 24px !important;
    height: 24px !important;
  }

  /* Fullscreen & Expansive Desktop Laboratory Workspaces */
  #engOverlay, #chemOverlay, #bioOverlay, #aiOverlay {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: min(92vw, 1340px) !important;
    max-width: 1340px !important;
    height: min(90vh, 920px) !important;
    max-height: 920px !important;
    border-radius: 24px !important;
    padding: 30px 40px 44px !important;
    overflow-y: auto !important;
    box-shadow: 0 25px 90px rgba(0, 0, 0, 0.85), 0 0 40px rgba(90, 140, 255, 0.2) !important;
  }
  #computerOverlay {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    border-radius: 0 !important;
  }
  #computerOverlay .cl-stage {
    height: min(65vh, 600px) !important;
  }
  #computerOverlay .cl-panel {
    max-width: 1400px !important;
    padding: 24px 32px !important;
  }
  #computerOverlay .cl-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
    gap: 20px !important;
  }
  #spaceExploreOverlay {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    border-radius: 0 !important;
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
  }
  #chemOverlay .ch-table {
    display: grid !important;
    grid-template-columns: repeat(18, minmax(0, 1fr)) !important;
    gap: 4px !important;
  }
}

`;

  const beforeBlock = content.substring(0, appContainerIdx);
  const afterBlock = content.substring(unlockModalIdx);
  content = beforeBlock + newResponsiveArchitecture + afterBlock;
  console.log('Successfully replaced responsive architecture block!');
} else {
  console.error('Error: Could not locate appContainerMarker or unlockModalMarker!');
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully written updated index.html!');

