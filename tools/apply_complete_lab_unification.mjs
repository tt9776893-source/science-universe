import fs from 'fs';
import { generateCompHtml } from './build_comp_html.mjs';

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// Backup original
fs.writeFileSync('index.html.bak-unified-labs', html);
console.log('Backup created as index.html.bak-unified-labs');

// 1. Replace Computer Lab HTML
const compHtmlTarget = '<section aria-hidden="true" aria-label="Компьютерын шинжлэх ухаан" id="computerOverlay">';
const compHtmlStart = html.indexOf(compHtmlTarget);
if (compHtmlStart === -1) {
  throw new Error('Could not find Computer Lab HTML start');
}
const compHtmlEnd = html.indexOf('</section>', compHtmlStart) + '</section>'.length;
console.log('Replacing Computer Lab HTML at [', compHtmlStart, ',', compHtmlEnd, ']...');
const newCompHtml = generateCompHtml();

html = html.slice(0, compHtmlStart) + newCompHtml + html.slice(compHtmlEnd);

// 2. Replace Computer Lab Style
const compStyleTarget = '<style id="computerRebuiltStyle">';
const compStyleStart = html.indexOf(compStyleTarget);
if (compStyleStart === -1) {
  throw new Error('Could not find computerRebuiltStyle start');
}
const compStyleEnd = html.indexOf('</style>', compStyleStart) + '</style>'.length;
console.log('Replacing computerRebuiltStyle at [', compStyleStart, ',', compStyleEnd, ']...');

const newCompStyle = `<style id="computerRebuiltStyle">
/* ========================================================
   UNIFIED LABORATORY SYSTEM: COMPUTER LAB (#computerOverlay)
   Benchmark: Math Lab Desktop Paradigm (Header + 2-Column Sticky Grid + Responsive)
   ======================================================== */
#computerOverlay {
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
  display: none;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  background: radial-gradient(circle at 15% 10%, rgba(0, 240, 255, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 85% 85%, rgba(112, 165, 255, 0.08) 0%, transparent 50%),
              linear-gradient(160deg, #050816 0%, #0c1228 45%, #081a2e 100%) !important;
  color: #e6f6ff;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  transform: none !important;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
#computerOverlay.on {
  display: block !important;
}
#computerOverlay * {
  box-sizing: border-box;
}

/* Master Centered Wrapper */
#computerOverlay .c-shell {
  width: 100% !important;
  max-width: 1380px !important;
  margin: 0 auto !important;
  box-sizing: border-box !important;
  padding: max(14px, env(safe-area-inset-top, 14px)) max(14px, env(safe-area-inset-right, 14px)) max(90px, calc(env(safe-area-inset-bottom, 20px) + 70px)) max(14px, env(safe-area-inset-left, 14px)) !important;
  height: auto !important;
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  display: block !important;
}
@media (min-width: 768px) {
  #computerOverlay .c-shell {
    padding: 20px 24px 85px 24px !important;
  }
}
@media (min-width: 1024px) {
  #computerOverlay .c-shell {
    padding: 24px 32px 85px 32px !important;
  }
}

/* Top Header Bar */
#computerOverlay .c-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 14px !important;
  padding: 0 0 14px 0 !important;
  margin-bottom: 18px !important;
  border-bottom: 1px solid rgba(0, 240, 255, 0.2) !important;
  background: transparent !important;
}
#computerOverlay .c-header-text {
  min-width: 0;
  flex: 1;
}
#computerOverlay .c-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: clamp(10px, 1.8vw, 11.5px);
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #00f0ff;
  margin-bottom: 3px;
}
#computerOverlay .c-tag-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
  display: inline-block;
  flex-shrink: 0;
}
#computerOverlay h1.c-headtitle {
  font: 800 clamp(20px, 4vw, 30px)/1.2 Orbitron, Inter, sans-serif !important;
  color: #ffffff !important;
  text-shadow: 0 0 18px rgba(0, 240, 255, 0.55), 0 0 35px rgba(0, 180, 255, 0.25) !important;
  margin: 2px 0 !important;
  letter-spacing: 1px !important;
}
#computerOverlay .c-subtitle {
  font-size: clamp(11.5px, 2vw, 13px);
  color: #a3c9e8;
  margin: 4px 0 0 0;
  line-height: 1.4;
}
#computerOverlay .c-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(16, 36, 75, 0.85), rgba(8, 20, 48, 0.95));
  border: 1px solid rgba(0, 240, 255, 0.45);
  color: #e6f6ff;
  padding: 10px 18px;
  min-height: 44px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 13.5px;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
}
#computerOverlay .c-back-btn:hover {
  background: linear-gradient(135deg, rgba(20, 60, 115, 0.9), rgba(12, 35, 80, 0.95));
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.45);
  transform: translateY(-1px);
}
#computerOverlay .c-back-btn:active {
  transform: scale(0.96);
}

/* Responsive Workspace Grid */
#computerOverlay .c-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 1024px) {
  #computerOverlay .c-layout {
    grid-template-columns: 320px minmax(0, 1fr) !important;
    gap: 28px !important;
    align-items: start !important;
  }
}

/* Sidebar */
#computerOverlay .c-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (min-width: 1024px) {
  #computerOverlay .c-sidebar {
    position: sticky;
    top: 20px;
    gap: 14px;
  }
}

/* Hero Badge */
#computerOverlay .c-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-radius: 16px;
  background: radial-gradient(circle at center, #0e2247, #070e24 75%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 0 20px rgba(0, 240, 255, 0.1);
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

/* Navigation Stack */
#computerOverlay .c-nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 4px 0 10px 0;
  position: static !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
  width: 100% !important;
}
@media (min-width: 580px) and (max-width: 1023px) {
  #computerOverlay .c-nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
}
@media (min-width: 1024px) {
  #computerOverlay .c-nav {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    margin: 0 !important;
  }
}
#computerOverlay .c-nav-btn {
  background: linear-gradient(145deg, rgba(12, 24, 52, 0.85), rgba(8, 16, 38, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.25);
  color: #e6f6ff;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  min-height: 48px;
  text-align: left;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
  user-select: none;
}
#computerOverlay .c-nav-btn * {
  pointer-events: none;
}
#computerOverlay .c-nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  line-height: 1;
}
#computerOverlay .c-nav-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#computerOverlay .c-nav-title {
  font-size: clamp(12px, 2.8vw, 13.5px);
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
#computerOverlay .c-nav-sub {
  display: none;
  font-size: 11px;
  color: #8bb5d8;
  margin-top: 2px;
  line-height: 1.3;
}
#computerOverlay .c-nav-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(0, 240, 255, 0.15);
  color: #00f0ff;
  border: 1px solid rgba(0, 240, 255, 0.3);
  flex-shrink: 0;
}
@media (min-width: 1024px) {
  #computerOverlay .c-nav-btn {
    padding: 12px 14px;
    min-height: 54px;
  }
  #computerOverlay .c-nav-icon {
    font-size: 22px;
  }
  #computerOverlay .c-nav-sub {
    display: block;
  }
}
#computerOverlay .c-nav-btn:hover {
  background: linear-gradient(145deg, rgba(20, 45, 90, 0.9), rgba(12, 30, 65, 0.95));
  border-color: rgba(0, 240, 255, 0.6);
  transform: translateY(-1px);
}
#computerOverlay .c-nav-btn:active {
  transform: scale(0.97);
}
#computerOverlay .c-nav-btn.active {
  background: linear-gradient(135deg, #0e5b7a 0%, #0d385c 100%) !important;
  border-color: #00f0ff !important;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.4), inset 0 0 12px rgba(0, 240, 255, 0.2) !important;
  color: #ffffff !important;
}

/* Sidebar Stats Card */
#computerOverlay .c-side-card {
  display: none;
  border: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 14px;
  background: rgba(8, 18, 42, 0.7);
  padding: 14px 16px;
  backdrop-filter: blur(10px);
}
@media (min-width: 1024px) {
  #computerOverlay .c-side-card {
    display: block;
  }
}
#computerOverlay .c-side-head {
  font: 700 10.5px Orbitron, monospace;
  letter-spacing: 1.5px;
  color: #00f0ff;
  margin-bottom: 12px;
  text-transform: uppercase;
}
#computerOverlay .c-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  text-align: center;
}
#computerOverlay .c-stat-val {
  display: block;
  font: 800 18px Orbitron, sans-serif;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
}
#computerOverlay .c-stat-lbl {
  display: block;
  font-size: 10.5px;
  color: #8bb5d8;
  margin-top: 2px;
}

/* Right Main Content Area */
#computerOverlay .c-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: static !important;
  overflow: visible !important;
  padding: 0 !important;
}
#computerOverlay .c-view {
  display: none;
  flex-direction: column;
  gap: 16px;
  animation: cFadeIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0 !important;
}
#computerOverlay .c-view.active {
  display: flex !important;
}
@keyframes cFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Home View Banner & Cards Grid */
#computerOverlay .c-banner {
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(10, 35, 75, 0.8), rgba(6, 20, 50, 0.9));
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
#computerOverlay .c-banner h2 {
  font: 800 20px Orbitron, Inter, sans-serif;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}
#computerOverlay .c-banner p {
  font-size: 13.5px;
  color: #b0d4f0;
  line-height: 1.55;
  margin: 0;
}

#computerOverlay .c-sectionhead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
#computerOverlay .c-sectionhead h2 {
  font: 700 16px Orbitron, Inter, sans-serif;
  color: #00f0ff;
  margin: 0;
}
#computerOverlay .c-sectionhead span {
  font-size: 12px;
  color: #8bb5d8;
}

#computerOverlay .c-grid {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 14px !important;
}
@media (min-width: 640px) {
  #computerOverlay .c-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 16px !important;
  }
}
@media (min-width: 1280px) {
  #computerOverlay .c-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 20px !important;
  }
}
#computerOverlay .c-tile {
  background: linear-gradient(145deg, rgba(14, 28, 62, 0.85), rgba(8, 18, 42, 0.95)) !important;
  border: 1px solid rgba(0, 240, 255, 0.28) !important;
  border-radius: 16px !important;
  padding: 20px !important;
  cursor: pointer !important;
  text-align: left !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25) !important;
  min-height: 160px !important;
}
#computerOverlay .c-tile:hover {
  background: linear-gradient(145deg, rgba(22, 45, 95, 0.92), rgba(12, 28, 65, 0.95)) !important;
  border-color: #00f0ff !important;
  box-shadow: 0 10px 28px rgba(0, 240, 255, 0.25) !important;
  transform: translateY(-2px) !important;
}
#computerOverlay .c-tile-icon {
  font-size: 28px;
  margin-bottom: 4px;
}
#computerOverlay .c-tile-title {
  font: 700 16px Inter, sans-serif !important;
  color: #ffffff !important;
}
#computerOverlay .c-tile-desc {
  font-size: 12.5px;
  color: #9ac2e2;
  line-height: 1.45;
  margin: 0;
  flex: 1;
}
#computerOverlay .c-tile-action {
  font-size: 12px;
  font-weight: 700;
  color: #00f0ff;
  margin-top: 6px;
}

#computerOverlay .c-info-card {
  padding: 18px 22px;
  background: rgba(10, 22, 48, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 14px;
  margin-top: 6px;
}
#computerOverlay .c-info-card h3 {
  font: 700 14px Orbitron, sans-serif;
  color: #00f0ff;
  margin: 0 0 8px 0;
}
#computerOverlay .c-info-card p {
  font-size: 13px;
  color: #b0d4f0;
  line-height: 1.6;
  margin: 0;
}

/* Learn View: Search & Article Cards Grid */
#computerOverlay .c-view-header {
  margin-bottom: 8px;
}
#computerOverlay .c-kicker {
  font: 700 11px Orbitron, monospace;
  letter-spacing: 1.5px;
  color: #00f0ff;
  margin-bottom: 4px;
}
#computerOverlay .c-view-header h1 {
  font: 800 clamp(20px, 3.2vw, 26px) Orbitron, Inter, sans-serif;
  color: #ffffff;
  margin: 0 0 6px 0;
}
#computerOverlay .c-view-header p {
  font-size: 13px;
  color: #9ac2e2;
  margin: 0;
  line-height: 1.5;
}
#computerOverlay .c-search-wrap {
  margin: 12px 0 16px 0;
}
#computerOverlay .c-search {
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(0, 240, 255, 0.35);
  background: rgba(10, 20, 45, 0.85);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
#computerOverlay .c-search:focus {
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}
#computerOverlay .c-articles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 640px) {
  #computerOverlay .c-articles-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}
#computerOverlay .c-article {
  background: linear-gradient(145deg, rgba(14, 28, 62, 0.85), rgba(8, 18, 42, 0.95));
  border: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 14px;
  padding: 14px 18px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s;
}
#computerOverlay .c-article:hover {
  border-color: #00f0ff;
  background: linear-gradient(145deg, rgba(20, 45, 95, 0.92), rgba(12, 28, 65, 0.95));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 240, 255, 0.2);
}
#computerOverlay .c-article span {
  font: 700 10.5px Orbitron, monospace;
  color: #00f0ff;
  letter-spacing: 1px;
}
#computerOverlay .c-article strong {
  font: 600 14px Inter, sans-serif;
  color: #ffffff;
  line-height: 1.35;
}

/* Article Reader */
#computerOverlay .c-reader {
  display: none;
  background: rgba(10, 22, 50, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.4);
}
#computerOverlay .c-reader.active {
  display: block;
}
#computerOverlay .c-readerback {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 240, 255, 0.12);
  border: 1px solid rgba(0, 240, 255, 0.35);
  color: #00f0ff;
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12.5px;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all 0.2s;
}
#computerOverlay .c-readerback:hover {
  background: rgba(0, 240, 255, 0.25);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
}
#computerOverlay h2#cReadTitle {
  font: 800 clamp(18px, 3vw, 24px) Orbitron, Inter, sans-serif;
  color: #ffffff;
  margin: 6px 0 16px 0;
  line-height: 1.3;
}
#computerOverlay .c-reading {
  font-size: 14.5px;
  line-height: 1.7;
  color: #d8eeff;
  margin-bottom: 14px;
}
#computerOverlay .c-tablewrap {
  overflow-x: auto;
  margin: 16px 0;
  border-radius: 10px;
  border: 1px solid rgba(0, 240, 255, 0.25);
}
#computerOverlay table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
#computerOverlay th, #computerOverlay td {
  padding: 10px 14px;
  border: 1px solid rgba(0, 240, 255, 0.18);
  text-align: left;
}
#computerOverlay tr:first-child {
  background: rgba(0, 240, 255, 0.15);
  font-weight: 700;
  color: #00f0ff;
}

/* Explore View: Demos Grid */
#computerOverlay .c-demos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 860px) {
  #computerOverlay .c-demos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}
#computerOverlay .c-demo {
  background: linear-gradient(145deg, rgba(14, 28, 62, 0.85), rgba(8, 18, 42, 0.95));
  border: 1px solid rgba(0, 240, 255, 0.28);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
#computerOverlay .c-demo-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#computerOverlay .c-demo h3 {
  font: 700 15px Orbitron, Inter, sans-serif;
  color: #ffffff;
  margin: 0;
}
#computerOverlay .c-demo-badge {
  font: 700 10px Orbitron, monospace;
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.12);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 999px;
  padding: 2px 8px;
}
#computerOverlay .c-demo p {
  font-size: 12.5px;
  color: #9ac2e2;
  margin: 0;
  line-height: 1.45;
}
#computerOverlay .c-parts-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
#computerOverlay .c-parts-buttons button {
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  color: #e6f6ff;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
#computerOverlay .c-parts-buttons button:hover,
#computerOverlay .c-parts-buttons button.selected {
  background: #00f0ff;
  color: #050b1a;
  border-color: #00f0ff;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.45);
}
#computerOverlay .c-display {
  background: rgba(4, 9, 22, 0.9);
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: monospace;
  font-size: 12.5px;
  color: #8bf5ff;
  line-height: 1.5;
  white-space: pre-line;
  min-height: 52px;
}
#computerOverlay .c-action-btn {
  background: linear-gradient(135deg, rgba(0, 180, 255, 0.8), rgba(0, 120, 220, 0.9));
  border: 1px solid #00f0ff;
  color: #ffffff;
  padding: 10px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(0, 180, 255, 0.3);
  align-self: flex-start;
}
#computerOverlay .c-action-btn:hover {
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.5);
  transform: translateY(-1px);
}
#computerOverlay .c-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}
#computerOverlay .c-progress i {
  display: block;
  height: 100%;
  width: 0%;
  background: #00f0ff;
  box-shadow: 0 0 8px #00f0ff;
  transition: width 0.3s ease;
}
#computerOverlay .c-num-input {
  width: 100%;
  padding: 10px 14px;
  background: rgba(6, 14, 34, 0.85);
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

/* Terms View: Glossary Grid */
#computerOverlay .c-terms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 640px) {
  #computerOverlay .c-terms-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}
@media (min-width: 1200px) {
  #computerOverlay .c-terms-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
}
#computerOverlay .c-reading {
  background: linear-gradient(145deg, rgba(14, 28, 62, 0.85), rgba(8, 18, 42, 0.95));
  border: 1px solid rgba(0, 240, 255, 0.22);
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}
#computerOverlay .c-reading h3 {
  font: 700 14px Orbitron, Inter, sans-serif;
  color: #00f0ff;
  margin: 0 0 6px 0;
}
#computerOverlay .c-reading p {
  font-size: 12.5px;
  color: #d0e7f7;
  line-height: 1.5;
  margin: 0;
}
</style>`;

html = html.slice(0, compStyleStart) + newCompStyle + html.slice(compStyleEnd);

// 3. Update Tablet overlays rule
const tabletTarget = '#engOverlay, #chemOverlay, #bioOverlay, #aiOverlay, #computerOverlay {\n    top: 50% !important;\n    left: 50% !important;\n    transform: translate(-50%, -50%) !important;\n    width: min(92vw, 760px) !important;\n    height: min(90vh, 880px) !important;\n    border-radius: 22px !important;\n  }';
const tabletStart = html.indexOf(tabletTarget);
if (tabletStart !== -1) {
  console.log('Updating tablet overlays rule at [', tabletStart, ']...');
  const newTabletRule = `#engOverlay, #chemOverlay, #bioOverlay, #aiOverlay, #computerOverlay {
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
  html = html.slice(0, tabletStart) + newTabletRule + html.slice(tabletStart + tabletTarget.length);
}

// 4. Update Desktop overlays rule with unifiedLabsMasterCss
const desktopTargetStart = '/* Fullscreen & Expansive Desktop Laboratory Workspaces */';
const dPos = html.indexOf(desktopTargetStart);
if (dPos === -1) {
  throw new Error('Could not find desktopTargetStart');
}
const desktopTargetEndStr = '#chemOverlay .ch-table {\n    display: grid !important;\n    grid-template-columns: repeat(18, minmax(0, 1fr)) !important;\n    gap: 4px !important;\n  }';
const dEndPos = html.indexOf(desktopTargetEndStr, dPos) + desktopTargetEndStr.length;
console.log('Replacing desktop laboratory rules at [', dPos, ',', dEndPos, ']...');

const newDesktopLabs = `/* Fullscreen & Expansive Desktop Laboratory Workspaces (Math Lab Standard for All Labs) */
  #mathOverlay, #computerOverlay, #chemOverlay, #engOverlay, #aiOverlay, #bioOverlay, #spaceExploreOverlay {
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
  #chemOverlay, #aiOverlay {
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

  /* Chemistry Lab: Desktop 2-Column Grid */
  #chemOverlay {
    display: grid !important;
    grid-template-columns: 340px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
    max-width: 1380px !important;
    margin: 0 auto !important;
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

  /* AI Lab: Desktop 2-Column Grid */
  #aiOverlay {
    display: grid !important;
    grid-template-columns: 320px minmax(0, 1fr) !important;
    grid-template-areas:
      "header header"
      "sidebar main" !important;
    gap: 20px 28px !important;
    align-items: start !important;
    max-width: 1380px !important;
    margin: 0 auto !important;
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

html = html.slice(0, dPos) + newDesktopLabs + html.slice(dEndPos);

// Write to index.html
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html! New length:', html.length);

