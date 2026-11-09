import fs from 'fs';

console.log('Reading index.html for professional human-crafted UI/UX refinement...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Injected SVG Icons utility styles
const svgIconStyle = `
/* ==========================================================================
   SCIENCE UNIVERSE — PROFESSIONAL VECTOR ICON & TYPOGRAPHY SYSTEM
   Human-crafted icon system replacing decorative emojis across all viewports.
   ========================================================================== */
.su-ico {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 1.8;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vertical-align: -0.15em;
  flex-shrink: 0;
  display: inline-block;
  color: inherit;
}
.su-ico.lg { width: 20px; height: 20px; }
.su-ico.md { width: 18px; height: 18px; }
.su-ico.sm { width: 14px; height: 14px; }
.su-ico.cyan { color: #38bdf8; }
.su-ico.purple { color: #a78bfa; }
.su-ico.emerald { color: #34d399; }
.su-ico.amber { color: #fbbf24; }
`;

if (!html.includes('.su-ico {')) {
  html = html.replace('/* Top Bar Avatar Photo */', svgIconStyle + '\n/* Top Bar Avatar Photo */');
  console.log('Injected .su-ico utility styles.');
}

// 2. Refined Desktop Dashboard CSS
const oldCssStart = html.indexOf('/* Desktop Dashboard Grid Composition */');
const oldCssEnd = html.indexOf('/* Desktop Splash & Login Sheet */', oldCssStart);

if (oldCssStart !== -1 && oldCssEnd !== -1) {
  const refinedCss = `/* Desktop Dashboard Grid Composition */
  .su-desk-only {
    display: block !important;
  }
  .su-desk-dashboard-grid {
    display: grid !important;
    grid-template-columns: 290px minmax(460px, 1fr) 290px !important;
    gap: 20px !important;
    width: 100% !important;
    max-width: 1440px !important;
    margin: 8px auto 26px auto !important;
    align-items: start !important;
  }
  @media (min-width: 1440px) {
    .su-desk-dashboard-grid {
      grid-template-columns: 320px 1fr 320px !important;
      gap: 26px !important;
    }
  }
  @media (max-width: 1200px) and (min-width: 1024px) {
    .su-desk-dashboard-grid {
      grid-template-columns: 260px 1fr 260px !important;
      gap: 16px !important;
    }
  }

  .su-desk-sidebar {
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
    z-index: 5 !important;
  }
  .su-desk-card {
    background: rgba(11, 17, 34, 0.76) !important;
    border: 1px solid rgba(148, 163, 184, 0.12) !important;
    border-radius: 14px !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35) !important;
    padding: 16px 18px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
    color: #e2e8f0 !important;
    transition: border-color 0.2s ease, transform 0.2s ease !important;
  }
  .su-desk-card:hover {
    border-color: rgba(56, 189, 248, 0.25) !important;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45) !important;
    transform: translateY(-1px) !important;
  }
  .su-dc-head {
    display: flex !important;
    align-items: center !important;
    gap: 9px !important;
    padding-bottom: 9px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  }
  .su-dc-icon {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #38bdf8 !important;
    width: 18px !important;
    height: 18px !important;
    flex-shrink: 0 !important;
  }
  .su-dc-title {
    font-size: 11.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
    flex: 1 !important;
    margin: 0 !important;
  }
  .su-dc-badge, .su-dc-status-pill {
    font-size: 10px !important;
    font-weight: 600 !important;
    padding: 2px 7px !important;
    border-radius: 6px !important;
    background: rgba(16, 185, 129, 0.12) !important;
    border: 1px solid rgba(16, 185, 129, 0.25) !important;
    color: #34d399 !important;
  }
  .su-dc-badge.cyan, .su-dc-counter-badge {
    background: rgba(56, 189, 248, 0.1) !important;
    border: 1px solid rgba(56, 189, 248, 0.25) !important;
    color: #38bdf8 !important;
    font-size: 10.5px !important;
    font-weight: 500 !important;
    padding: 2px 8px !important;
    border-radius: 6px !important;
  }

  .su-desk-center {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    min-height: 470px !important;
    position: relative !important;
  }
  #lab .hub {
    flex: none !important;
    min-height: 420px !important;
    height: 420px !important;
    max-width: 680px !important;
    width: 100% !important;
    margin: 0 auto !important;
    perspective: 1250px !important;
    perspective-origin: 50% 32% !important;
  }
  #lab .tilt {
    left: 50% !important;
    top: 48% !important;
    transform: rotateX(-30deg) scale(1.24) !important;
  }
  #lab .focus {
    max-width: 480px !important;
    width: 100% !important;
    margin: 8px auto 0 auto !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    z-index: 10 !important;
  }
  #lab .focus .fi b {
    font-size: 19px !important;
    font-weight: 700 !important;
    letter-spacing: 0.02em !important;
  }
  #lab .focus .fi small {
    font-size: 12px !important;
    color: #94a3b8 !important;
  }
  #lab .focus .rot {
    width: 44px !important;
    height: 44px !important;
    font-size: 22px !important;
    border-radius: 10px !important;
    border: 1px solid rgba(148, 163, 184, 0.2) !important;
    background: rgba(15, 23, 42, 0.75) !important;
    color: #cbd5e1 !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .rot:hover {
    background: rgba(56, 189, 248, 0.12) !important;
    border-color: rgba(56, 189, 248, 0.4) !important;
    color: #f8fafc !important;
  }
  #lab .focus .enter {
    height: 44px !important;
    padding: 0 24px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
    background: #3b82f6 !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35) !important;
    transition: all 0.15s ease !important;
  }
  #lab .focus .enter:hover {
    background: #2563eb !important;
    transform: translateY(-1px) !important;
  }

  /* User avatar mini */
  .su-dc-user-row {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
  }
  .su-dc-avatar-mini {
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg, #1e293b, #0f172a) !important;
    border: 1px solid rgba(148, 163, 184, 0.25) !important;
    box-shadow: none !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #94a3b8 !important;
    position: relative !important;
    overflow: hidden !important;
  }
  .su-dc-avatar-mini::before {
    content: "";
    position: absolute;
    left: 9px;
    top: 7px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #94a3b8;
  }
  .su-dc-user-meta {
    display: flex !important;
    flex-direction: column !important;
  }
  .su-dc-user-meta b {
    font-size: 13.5px !important;
    font-weight: 600 !important;
    color: #f8fafc !important;
  }
  .su-user-role {
    font-size: 11.5px !important;
    color: #94a3b8 !important;
    font-weight: 400 !important;
  }
  .su-dc-progress-block {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
  }
  .su-dc-p-label {
    display: flex !important;
    justify-content: space-between !important;
    font-size: 11.5px !important;
    color: #94a3b8 !important;
  }
  .su-p-count {
    color: #38bdf8 !important;
    font-weight: 600 !important;
    font-size: 11.5px !important;
  }
  .su-dc-p-bar {
    height: 5px !important;
    border-radius: 3px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    overflow: hidden !important;
  }
  .su-dc-p-fill {
    height: 100% !important;
    background: linear-gradient(90deg, #6366f1, #38bdf8) !important;
    border-radius: 3px !important;
    box-shadow: none !important;
  }
  .su-dc-stat-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
  }
  .su-stat-box {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.1) !important;
    border-radius: 8px !important;
    padding: 9px 8px !important;
    text-align: center !important;
  }
  .su-sb-val {
    font-size: 14.5px !important;
    font-weight: 700 !important;
    color: #f1f5f9 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
  }
  .su-sb-lbl {
    font-size: 10.5px !important;
    color: #64748b !important;
    margin-top: 2px !important;
    font-weight: 500 !important;
  }

  /* Activity Timeline */
  .su-activity-timeline {
    display: flex !important;
    flex-direction: column !important;
    gap: 11px !important;
    position: relative !important;
  }
  .su-act-item {
    display: flex !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }
  .su-act-track {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    width: 8px !important;
    flex-shrink: 0 !important;
    padding-top: 5px !important;
  }
  .su-act-node {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: #38bdf8 !important;
  }
  .su-act-node.purple { background: #818cf8 !important; }
  .su-act-node.amber { background: #f59e0b !important; }
  .su-act-info b {
    display: block !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
    color: #f1f5f9 !important;
  }
  .su-act-info p {
    margin: 1px 0 2px 0 !important;
    font-size: 11.5px !important;
    color: #94a3b8 !important;
    line-height: 1.4 !important;
  }
  .su-act-info small {
    font-size: 10.5px !important;
    color: #64748b !important;
  }

  /* Editorial Science Fact */
  .su-fact-quote {
    margin: 0 !important;
    padding: 0 0 0 10px !important;
    border-left: 2px solid #38bdf8 !important;
    font-size: 12px !important;
    line-height: 1.55 !important;
    color: #cbd5e1 !important;
    font-style: normal !important;
  }
  .su-fact-footer {
    display: flex !important;
    gap: 6px !important;
  }
  .su-fact-tag {
    font-size: 10.5px !important;
    color: #38bdf8 !important;
    background: rgba(56, 189, 248, 0.08) !important;
    border: 1px solid rgba(56, 189, 248, 0.18) !important;
    padding: 2px 8px !important;
    border-radius: 4px !important;
  }

  /* Tasks Checklist */
  .su-mission-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
  }
  .su-mission-row {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 8px 10px !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.08) !important;
  }
  .su-mission-row.done {
    border-color: rgba(16, 185, 129, 0.18) !important;
    background: rgba(16, 185, 129, 0.04) !important;
  }
  .su-m-checkbox {
    width: 18px !important;
    height: 18px !important;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    background: #10b981 !important;
    color: #fff !important;
  }
  .su-m-checkbox.pending {
    background: transparent !important;
    border: 1.5px solid #475569 !important;
  }
  .su-m-body {
    flex: 1 !important;
    min-width: 0 !important;
  }
  .su-m-body b {
    display: block !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #f1f5f9 !important;
  }
  .su-mission-row.done .su-m-body b {
    color: #94a3b8 !important;
  }
  .su-m-body small {
    display: block !important;
    font-size: 10.5px !important;
    color: #64748b !important;
  }
  .su-mini-bar {
    height: 3px !important;
    border-radius: 2px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    overflow: hidden !important;
    margin-top: 4px !important;
  }
  .su-mini-bar div {
    height: 100% !important;
    background: #38bdf8 !important;
  }
  .su-mission-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    font-size: 11px !important;
    padding: 6px 10px !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(148, 163, 184, 0.1) !important;
  }
  .su-mf-label { color: #94a3b8 !important; }
  .su-mf-reward { color: #f8fafc !important; font-weight: 600 !important; }

  /* Quick Actions */
  .su-quick-actions {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
  }
  .su-qa-btn {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    padding: 8px 10px !important;
    border-radius: 8px !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.08) !important;
    color: #fff !important;
    cursor: pointer !important;
    text-align: left !important;
    transition: border-color 0.15s ease, background 0.15s ease !important;
  }
  .su-qa-btn:hover {
    background: rgba(56, 189, 248, 0.06) !important;
    border-color: rgba(56, 189, 248, 0.25) !important;
  }
  .su-qa-badge {
    width: 28px !important;
    height: 28px !important;
    border-radius: 6px !important;
    background: rgba(56, 189, 248, 0.08) !important;
    border: 1px solid rgba(56, 189, 248, 0.16) !important;
    color: #38bdf8 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
  }
  .su-qa-txt b {
    display: block !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #f1f5f9 !important;
  }
  .su-qa-txt small {
    display: block !important;
    font-size: 10.5px !important;
    color: #64748b !important;
  }
  .su-qa-arrow {
    color: #64748b !important;
    font-size: 12px !important;
    transition: transform 0.15s ease !important;
  }
  .su-qa-btn:hover .su-qa-arrow {
    transform: translateX(2px) !important;
    color: #38bdf8 !important;
  }

  /* Status Grid */
  .su-status-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 6px !important;
  }
  .su-status-pill {
    display: flex !important;
    align-items: center !important;
    gap: 7px !important;
    padding: 6px 9px !important;
    border-radius: 6px !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.08) !important;
    font-size: 11px !important;
    color: #cbd5e1 !important;
  }
  .su-s-dot {
    width: 6px !important;
    height: 6px !important;
    border-radius: 50% !important;
    background: #10b981 !important;
    flex-shrink: 0 !important;
  }
  .su-s-dot.soon { background: #f59e0b !important; }
  .su-s-dot.credit { background: #38bdf8 !important; }

  /* Lower Dashboard Deck */
  .su-desk-bottom {
    width: 100% !important;
    max-width: 1440px !important;
    margin: 0 auto 30px auto !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 18px !important;
  }
  .su-launcher-deck, .su-paths-deck {
    background: rgba(11, 17, 34, 0.72) !important;
    border: 1px solid rgba(148, 163, 184, 0.12) !important;
    border-radius: 14px !important;
    padding: 16px 20px !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35) !important;
  }
  .su-ld-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 12px !important;
  }
  .su-ld-title-group {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
  }
  .su-ld-icon {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #38bdf8 !important;
  }
  .su-ld-header h3 {
    margin: 0 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em !important;
    color: #94a3b8 !important;
    text-transform: uppercase !important;
  }
  .su-ld-hint {
    font-size: 11.5px !important;
    color: #64748b !important;
  }
  .su-launcher-strip {
    display: grid !important;
    grid-template-columns: repeat(8, 1fr) !important;
    gap: 8px !important;
  }
  @media (max-width: 1200px) and (min-width: 1024px) {
    .su-launcher-strip {
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 8px !important;
    }
  }
  .su-launcher-tile {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    padding: 12px 8px !important;
    border-radius: 10px !important;
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.1) !important;
    color: #e2e8f0 !important;
    cursor: pointer !important;
    text-align: center !important;
    transition: all 0.15s ease !important;
  }
  .su-launcher-tile:hover {
    background: rgba(56, 189, 248, 0.06) !important;
    border-color: rgba(56, 189, 248, 0.3) !important;
    transform: translateY(-1px) !important;
  }
  .su-lt-ico {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #38bdf8 !important;
  }
  .su-lt-meta b {
    display: block !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #f8fafc !important;
  }
  .su-lt-meta small {
    display: block !important;
    font-size: 10px !important;
    color: #64748b !important;
  }

  .su-paths-grid {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 14px !important;
  }
  .su-path-card {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid rgba(148, 163, 184, 0.1) !important;
    border-radius: 10px !important;
    padding: 14px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
  }
  .su-path-card:hover {
    border-color: rgba(56, 189, 248, 0.28) !important;
    transform: translateY(-1px) !important;
  }
  .su-pc-top {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .su-pc-cat {
    font-size: 10.5px !important;
    font-weight: 600 !important;
    padding: 2px 7px !important;
    border-radius: 4px !important;
    text-transform: uppercase !important;
  }
  .su-pc-cat.physics { background: rgba(56, 189, 248, 0.1) !important; color: #38bdf8 !important; border: 1px solid rgba(56, 189, 248, 0.25) !important; }
  .su-pc-cat.chemistry { background: rgba(167, 139, 250, 0.1) !important; color: #a78bfa !important; border: 1px solid rgba(167, 139, 250, 0.25) !important; }
  .su-pc-cat.math { background: rgba(96, 165, 250, 0.1) !important; color: #60a5fa !important; border: 1px solid rgba(96, 165, 250, 0.25) !important; }
  .su-pc-progress-pill {
    font-size: 10.5px !important;
    color: #64748b !important;
  }
  .su-pc-progress-pill.new {
    color: #34d399 !important;
    font-weight: 600 !important;
  }
  .su-path-card h4 {
    margin: 0 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #f8fafc !important;
    line-height: 1.35 !important;
  }
  .su-path-card p {
    margin: 0 !important;
    font-size: 11.5px !important;
    color: #94a3b8 !important;
    line-height: 1.45 !important;
    flex: 1 !important;
  }
  .su-pc-bar {
    height: 4px !important;
    border-radius: 2px !important;
    background: rgba(255, 255, 255, 0.08) !important;
    overflow: hidden !important;
  }
  .su-pc-bar div {
    height: 100% !important;
    background: linear-gradient(90deg, #6366f1, #38bdf8) !important;
    border-radius: 2px !important;
  }
  .su-pc-footer {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    font-size: 11px !important;
    color: #64748b !important;
    margin-top: 2px !important;
  }
  .su-pc-btn {
    background: rgba(56, 189, 248, 0.08) !important;
    border: 1px solid rgba(56, 189, 248, 0.22) !important;
    color: #38bdf8 !important;
    font-size: 11.5px !important;
    font-weight: 500 !important;
    padding: 4px 10px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    transition: all 0.15s ease !important;
  }
  .su-pc-btn:hover {
    background: #38bdf8 !important;
    color: #04101e !important;
  }

  `;

  html = html.substring(0, oldCssStart) + refinedCss + html.substring(oldCssEnd);
  console.log('Replaced dashboard CSS with refined professional human-crafted styling.');
}

// 3. Refined Desktop Dashboard HTML markup (Left, Center, Right, Bottom)
const htmlStart = html.indexOf('<div class="su-desk-dashboard-grid">');
const htmlEnd = html.indexOf('</section>', html.indexOf('<!-- LOWER DASHBOARD AREA (DESKTOP ONLY) -->', htmlStart)) + 10;

if (htmlStart !== -1 && htmlEnd !== -1) {
  const refinedHtml = `<div class="su-desk-dashboard-grid">
  <!-- LEFT SIDEBAR (DESKTOP ONLY) -->
  <aside class="su-desk-sidebar su-desk-left su-desk-only" aria-label="Судлаачийн мэдээлэл">
    <!-- Card 1: User Level & XP -->
    <div class="su-desk-card su-card-profile">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </span>
        <span class="su-dc-title" data-label="СУДЛААЧИЙН ТӨЛӨВ">Миний ахиц</span>
        <span class="su-dc-status-pill">Идэвхтэй</span>
      </div>
      <div class="su-dc-user-row">
        <div class="su-dc-avatar-mini" aria-hidden="true"></div>
        <div class="su-dc-user-meta">
          <b class="su-sync-uname">Судлаач</b>
          <span class="su-user-role">Анхан шатны шинжээч</span>
        </div>
      </div>
      <div class="su-dc-progress-block">
        <div class="su-dc-p-label">
          <span>Түвшин 1</span>
          <span class="su-p-count">780 / 1,000 XP</span>
        </div>
        <div class="su-dc-p-bar">
          <div class="su-dc-p-fill" style="width: 78%"></div>
        </div>
      </div>
      <div class="su-dc-stat-grid">
        <div class="su-stat-box">
          <div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> 5</div>
          <div class="su-sb-lbl">Өдөр дараалсан</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="M10 2v7.31L4.2 18A2 2 0 0 0 5.8 21h12.4a2 2 0 0 0 1.6-3L14 9.31V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="6.8" y1="14" x2="17.2" y2="14"/></svg> 14</div>
          <div class="su-sb-lbl">Туршилт хийсэн</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/></svg> 42</div>
          <div class="su-sb-lbl">Бодлого бодсон</div>
        </div>
        <div class="su-stat-box">
          <div class="su-sb-val"><svg class="su-ico sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg> 6 / 8</div>
          <div class="su-sb-lbl">Лаб нээлттэй</div>
        </div>
      </div>
    </div>

    <!-- Card 2: Recent Activity Timeline -->
    <div class="su-desk-card su-card-activity">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </span>
        <span class="su-dc-title" data-label="СҮҮЛИЙН ҮЙЛ АЖИЛЛАГАА">Сүүлд хийсэн</span>
      </div>
      <div class="su-activity-timeline">
        <div class="su-act-item">
          <div class="su-act-track"><span class="su-act-node"></span></div>
          <div class="su-act-info">
            <b>Физикийн лаборатори</b>
            <p>Ньютоны II хууль, хурдатгал туршив</p>
            <small>15 минутын өмнө</small>
          </div>
        </div>
        <div class="su-act-item">
          <div class="su-act-track"><span class="su-act-node purple"></span></div>
          <div class="su-act-info">
            <b>Химийн 3D лаборатори</b>
            <p>Хүчил-суурийн симуляци дуусгав</p>
            <small>Өчигдөр · +50 XP</small>
          </div>
        </div>
        <div class="su-act-item">
          <div class="su-act-track"><span class="su-act-node amber"></span></div>
          <div class="su-act-info">
            <b>Математикийн лаборатори</b>
            <p>Квадрат тэгшитгэлийн бодлого бодов</p>
            <small>2 өдрийн өмнө · +15 XP</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Card 3: Science Insight -->
    <div class="su-desk-card su-card-fact">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
        </span>
        <span class="su-dc-title" data-label="ӨДРИЙН СОНИРХОЛТОЙ БАРИМТ">Өдрийн мэдлэг</span>
      </div>
      <blockquote class="su-fact-quote">
        Сансар огторгуй нь вакуум орчин тул механик долгион дамжих материйн нягт байдаггүй. Иймээс сансарт агаарын дуу чимээ сонсогдохгүй.
      </blockquote>
      <div class="su-fact-footer">
        <span class="su-fact-tag">Астрофизик</span>
        <span class="su-fact-tag">Вакуум</span>
      </div>
    </div>
  </aside>

  <!-- CENTER 3D HERO AREA (Main Lab Rotating Cylinder & Focus) -->
  <div class="su-desk-center">
    <div class="hub" id="hub">
      <div class="tilt"><div class="ringw" id="ring">
        <div class="basew"><i></i></div><div class="floor"></div>
        <div class="wall" style="--a:0deg"><div class="sign">Physics Lab</div><div class="cell physics"><button class="card" data-msg="Физикийн лаборатори нээгдэж байна…" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><ellipse cx="24" cy="24" rx="19" ry="7.5"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(60 24 24)"></ellipse><ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(120 24 24)"></ellipse><circle cx="24" cy="24" fill="currentColor" r="3"></circle></svg><b>Физик</b></span></button></div></div>
        <div class="wall" style="--a:45deg"><div class="sign">Chemistry Lab</div><div class="cell chem"><button class="card" id="chemCard" type="button" data-msg="Химийн интерактив 3D лабораторид тавтай морил!"><span class="ci"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6h12M21 6v10l-9 16a4 4 0 0 0 3.5 6h17a4 4 0 0 0 3.5-6l-9-16V6"/><path d="M15 26h18" stroke-dasharray="2 3"/></svg><b>Хими</b></span></button></div></div>
        <div class="wall" style="--a:90deg"><div class="sign">AI Lab</div><div class="cell ai"><button class="card" id="aiCard" type="button" data-msg="AI лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><rect height="24" rx="4" width="28" x="10" y="14"></rect><circle cx="19" cy="23" fill="currentColor" r="2.5"></circle><circle cx="29" cy="23" fill="currentColor" r="2.5"></circle><path d="M18 31h12M24 8v6M7 26h3M38 26h3"></path></svg><b>AI Lab</b></span></button></div></div>
        <div class="wall" style="--a:135deg"><div class="sign">Biology Lab</div><div class="cell bio"><button class="card" id="bioCard" type="button" data-msg="Биологийн 3D лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><path d="M12 36c12-6 12-18 24-24M12 12c12 6 12 18 24 24M16 18l4 2M28 28l4 2M16 30l4-2M28 20l4-2M20 24h8"></path></svg><b>Биологи</b></span></button></div></div>
        <div class="wall" style="--a:180deg"><div class="sign">Computer Lab</div><div class="cell cs"><button class="card" id="csCard" type="button" data-msg="Компьютер ухааны лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><rect height="22" rx="3" width="34" x="7" y="10"></rect><path d="M16 38h16M24 32v6M14 18l5 4-5 4M23 26h8"></path></svg><b>Компьютер</b></span></button></div></div>
        <div class="wall" style="--a:225deg"><div class="sign">Math Lab</div><div class="cell math"><button class="card" id="mathCard" type="button" data-msg="Математикийн интерактив лабораторид тавтай морил!"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><path d="M10 38L22 10l8 20 8-12"></path><circle cx="38" cy="18" fill="currentColor" r="2"></circle><path d="M8 24h6M34 32h6M37 29v6"></path></svg><b>Математик</b></span></button></div></div>
        <div class="wall" style="--a:270deg"><div class="sign">Space Lab</div><div class="cell space" id="spaceCell"><button class="card" data-locked="true" data-msg="120 кредит цуглуулж нээнэ үү!" id="spaceBtn" type="button"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><circle cx="24" cy="24" r="11"></circle><ellipse cx="24" cy="24" rx="20" ry="6" transform="rotate(-25 24 24)"></ellipse><circle cx="16" cy="14" fill="currentColor" r="1.5"></circle></svg><b>Сансар</b><small id="spaceLockMsg">120 ★ түгжээтэй</small></span></button></div></div>
        <div class="wall" style="--a:315deg"><div class="sign">Engineering Lab</div><div class="cell engineering"><button class="card" id="engCard" type="button" data-msg="Инженерчлэлийн лаборатори нээгдэж байна…"><span class="ci"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" viewbox="0 0 48 48"><circle cx="24" cy="24" r="6"></circle><path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8"></path></svg><b>Инженер</b></span></button></div></div>
      </div></div>
    </div>
    <div class="focus" id="focus">
      <button aria-label="Өмнөх лаборатори" class="rot" id="prevW" type="button">‹</button>
      <div class="fi"><b id="fName">Физик</b><small id="fSub">Классик механик ба харьцангуй</small></div>
      <button class="enter" id="enterLab" type="button">Нэвтрэх</button>
      <button aria-label="Дараах лаборатори" class="rot" id="nextW" type="button">›</button>
    </div>
  </div>

  <!-- RIGHT SIDEBAR (DESKTOP ONLY) -->
  <aside class="su-desk-sidebar su-desk-right su-desk-only" aria-label="Даалгавар ба хяналт">
    <!-- Card 4: Daily Mission -->
    <div class="su-desk-card su-card-tasks">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </span>
        <span class="su-dc-title" data-label="ӨДРИЙН ДААЛГАВАР">Өдрийн зорилго</span>
        <span class="su-dc-counter-badge">2 / 3 гүйцэтгэсэн</span>
      </div>
      <div class="su-mission-list">
        <div class="su-mission-row done">
          <span class="su-m-checkbox">
            <svg class="su-ico sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <div class="su-m-body">
            <b>Химийн урвал турших</b>
            <small>1 / 1 гүйцэтгэсэн · +15 XP</small>
          </div>
        </div>
        <div class="su-mission-row in-progress">
          <span class="su-m-checkbox pending"></span>
          <div class="su-m-body">
            <b>Математикийн 3 бодлого</b>
            <div class="su-mini-bar"><div style="width: 66%"></div></div>
          </div>
        </div>
        <div class="su-mission-row pending">
          <span class="su-m-checkbox pending"></span>
          <div class="su-m-body">
            <b>Сансрын тойрог зам судлах</b>
            <small>Тойрог замын симуляци</small>
          </div>
        </div>
      </div>
      <div class="su-mission-footer">
        <span class="su-mf-label">Өдрийн урамшуулал:</span>
        <span class="su-mf-reward">+30 ★ · +100 XP</span>
      </div>
    </div>

    <!-- Card 5: Quick Command Actions -->
    <div class="su-desk-card su-card-actions">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </span>
        <span class="su-dc-title" data-label="ТҮРГЭН ҮЙЛДЛҮҮД">Шууд хандах</span>
      </div>
      <div class="su-quick-actions">
        <button class="su-qa-btn" type="button" data-qa-action="space">
          <span class="su-qa-badge">
            <svg class="su-ico" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </span>
          <div class="su-qa-txt">
            <b>Сансар судлал</b>
            <small>120 кредитийн өрөө</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="math">
          <span class="su-qa-badge">
            <svg class="su-ico" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
          </span>
          <div class="su-qa-txt">
            <b>Математик бодлого</b>
            <small>Интерактив тооцоолуур</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="ai">
          <span class="su-qa-badge">
            <svg class="su-ico" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
          </span>
          <div class="su-qa-txt">
            <b>AI Лаборатори</b>
            <small>Мэдрэлийн сүлжээ</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
        <button class="su-qa-btn" type="button" data-qa-action="profile">
          <span class="su-qa-badge">
            <svg class="su-ico" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"/><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/></svg>
          </span>
          <div class="su-qa-txt">
            <b>Миний профайл</b>
            <small>Амжилт ба тохиргоо</small>
          </div>
          <span class="su-qa-arrow">→</span>
        </button>
      </div>
    </div>

    <!-- Card 6: Lab Status Overview -->
    <div class="su-desk-card su-card-status">
      <div class="su-dc-head">
        <span class="su-dc-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 7-1.5 1.5"/></svg>
        </span>
        <span class="su-dc-title" data-label="ЛАБОРАТОРИУДЫН ТӨЛӨВ">Лабораториуд</span>
      </div>
      <div class="su-status-grid">
        <div class="su-status-pill online"><span class="su-s-dot"></span>Физик</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Хими</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>AI Лаб</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Компьютер</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Математик</div>
        <div class="su-status-pill online"><span class="su-s-dot"></span>Инженер</div>
        <div class="su-status-pill soon"><span class="su-s-dot soon"></span>Биологи</div>
        <div class="su-status-pill credit"><span class="su-s-dot credit"></span>Сансар: 120 ★</div>
      </div>
    </div>
  </aside>
</div>

<!-- LOWER DASHBOARD AREA (DESKTOP ONLY) -->
<section class="su-desk-bottom su-desk-only" aria-label="Нэмэлт удирдлагын самбар">
  <!-- Launcher Strip -->
  <div class="su-launcher-deck">
    <div class="su-ld-header">
      <div class="su-ld-title-group">
        <span class="su-ld-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
        </span>
        <h3>Лаборатори сонгох</h3>
      </div>
      <span class="su-ld-hint">Чиглэлээ сонгож шууд шилжих</span>
    </div>
    <div class="su-launcher-strip">
      <button class="su-launcher-tile" type="button" data-su-wall-idx="0">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(150 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/></svg></span>
        <div class="su-lt-meta"><b>Физик</b><small>Классик механик</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="1">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><path d="M10 2v7.31L4.2 18A2 2 0 0 0 5.8 21h12.4a2 2 0 0 0 1.6-3L14 9.31V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="6.8" y1="14" x2="17.2" y2="14"/></svg></span>
        <div class="su-lt-meta"><b>Хими</b><small>3D Интерактив өрөө</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="2">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg></span>
        <div class="su-lt-meta"><b>Хиймэл оюун</b><small>AI ба Алгоритм</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="3">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m3.5 14.5.5.5"/><path d="m20 9 .5.5"/><path d="m6.5 12.5 1 1"/><path d="m16.5 10.5 1 1"/><path d="m10 16 1 1"/></svg></span>
        <div class="su-lt-meta"><b>Биологи</b><small>ДНХ ба эс</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="4">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></span>
        <div class="su-lt-meta"><b>Компьютер</b><small>Програмчлал</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="5">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/></svg></span>
        <div class="su-lt-meta"><b>Математик</b><small>Тэгшитгэл ба график</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="6">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></span>
        <div class="su-lt-meta"><b>Сансар судлал</b><small>120 ★ кредит</small></div>
      </button>
      <button class="su-launcher-tile" type="button" data-su-wall-idx="7">
        <span class="su-lt-ico"><svg class="su-ico" viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span>
        <div class="su-lt-meta"><b>Инженерчлэл</b><small>Цахилгаан ба систем</small></div>
      </button>
    </div>
  </div>

  <!-- Recommended Learning Paths -->
  <div class="su-paths-deck">
    <div class="su-ld-header">
      <div class="su-ld-title-group">
        <span class="su-ld-icon">
          <svg class="su-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
        </span>
        <h3 data-label="СУРАЛЦАХЫГ ЗӨВЛӨЖ БУЙ ЧИГЛЭЛҮҮД">Суралцах хөтөлбөр</h3>
      </div>
      <span class="su-ld-hint">Санал болгож буй үндсэн чиглэлүүд</span>
    </div>
    <div class="su-paths-grid">
      <div class="su-path-card" data-path-open="0">
        <div class="su-pc-top">
          <span class="su-pc-cat physics">Физик</span>
          <span class="su-pc-progress-pill">80% дууссан</span>
        </div>
        <h4>Сонгодог механик ба Хөдөлгөөний хуулиуд</h4>
        <p>Ньютоны хуулиуд, хүчний тэнцвэр, гравитацын харилцан үйлчлэл.</p>
        <div class="su-pc-bar"><div style="width: 80%"></div></div>
        <div class="su-pc-footer">
          <span>8 сэдэв · 3 туршилт</span>
          <button class="su-pc-btn" type="button">Үргэлжлүүлэх →</button>
        </div>
      </div>

      <div class="su-path-card" data-path-open="1">
        <div class="su-pc-top">
          <span class="su-pc-cat chemistry">Хими</span>
          <span class="su-pc-progress-pill new">Шинэ</span>
        </div>
        <h4>Молекулын бүтэц ба Урвалын кинетик</h4>
        <p>Ковалент ба ионы холбоос, уусмалын орчин (pH), экзотерм урвал.</p>
        <div class="su-pc-bar"><div style="width: 15%"></div></div>
        <div class="su-pc-footer">
          <span>12 сэдэв · 3D симуляци</span>
          <button class="su-pc-btn" type="button">Эхлэх →</button>
        </div>
      </div>

      <div class="su-path-card" data-path-open="5">
        <div class="su-pc-top">
          <span class="su-pc-cat math">Математик</span>
          <span class="su-pc-progress-pill">45% дууссан</span>
        </div>
        <h4>Шугаман тэгшитгэлийн систем ба Геометр</h4>
        <p>Матриц, вектор, функцийн уламжлал ба аналитик геометр.</p>
        <div class="su-pc-bar"><div style="width: 45%"></div></div>
        <div class="su-pc-footer">
          <span>10 сэдэв · 40 бодлого</span>
          <button class="su-pc-btn" type="button">Үргэлжлүүлэх →</button>
        </div>
      </div>
    </div>
  </div>
</section>`;

  html = html.substring(0, htmlStart) + refinedHtml + html.substring(htmlEnd);
  console.log('Replaced dashboard HTML markup.');
}

// 4. Clean up Chemistry Lab tabs: replace emojis with SVG icons
const oldChemTabs = `<div class="cl-tabs">
    <button class="cl-tab on" data-tab="3d">🎮 3D Лаб</button>
    <button class="cl-tab" data-tab="exp">🧪 Туршилт</button>
    <button class="cl-tab" data-tab="theory">⚛️ Онол</button>
    <button class="cl-tab" data-tab="quiz">❓ Сорил</button>
  </div>`;

const newChemTabs = `<div class="cl-tabs">
    <button class="cl-tab on" data-tab="3d"><svg class="su-ico" viewBox="0 0 24 24"><path d="m21.12 6.4-6-3.5a2 2 0 0 0-2 0l-6 3.5A2 2 0 0 0 6 8.13v7.74a2 2 0 0 0 1 1.73l6 3.5a2 2 0 0 0 2 0l6-3.5a2 2 0 0 0 1-1.73V8.13a2 2 0 0 0-1-1.73Z"/><path d="M12 22V12"/><path d="m3.27 6.96 8.73 5.04 8.73-5.04"/></svg> 3D Лаб</button>
    <button class="cl-tab" data-tab="exp"><svg class="su-ico" viewBox="0 0 24 24"><path d="M10 2v7.31L4.2 18A2 2 0 0 0 5.8 21h12.4a2 2 0 0 0 1.6-3L14 9.31V2"/><line x1="8" y1="2" x2="16" y2="2"/><line x1="6.8" y1="14" x2="17.2" y2="14"/></svg> Туршилт</button>
    <button class="cl-tab" data-tab="theory"><svg class="su-ico" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg> Онол</button>
    <button class="cl-tab" data-tab="quiz"><svg class="su-ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Сорил</button>
  </div>`;

if (html.includes(oldChemTabs)) {
  html = html.replace(oldChemTabs, newChemTabs);
  console.log('Cleaned up Chemistry Lab tabs with SVG icons.');
}

// 5. Clean up Physics Lab tabs: replace emojis with SVG icons
const oldPlTabs = `<div class="pl-tabs">
      <button class="pl-tab on" id="plTabSmasher" type="button">Таталцал</button>
      <button class="pl-tab" id="plTabCannon" type="button">Их буу</button>
      <button class="pl-tab" id="plTabEField" type="button">⚡ Цахилгаан</button>
      <button class="pl-tab" id="plTabCircuit" type="button">🔌 Хэлхээ</button>
      <button class="pl-tab" id="plTabOptics" type="button">🌈 Оптик</button>
      <button class="pl-tab" id="plTabGas" type="button">🔥 Хийн хууль</button>
      <button class="pl-tab" id="plTab3d" type="button">🎮 3D Лаб (Өрөө)</button>
    </div>`;

const newPlTabs = `<div class="pl-tabs">
      <button class="pl-tab on" id="plTabSmasher" type="button">Таталцал</button>
      <button class="pl-tab" id="plTabCannon" type="button">Их буу</button>
      <button class="pl-tab" id="plTabEField" type="button"><svg class="su-ico sm" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Цахилгаан</button>
      <button class="pl-tab" id="plTabCircuit" type="button"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/><circle cx="12" cy="12" r="4"/></svg> Хэлхээ</button>
      <button class="pl-tab" id="plTabOptics" type="button"><svg class="su-ico sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg> Оптик</button>
      <button class="pl-tab" id="plTabGas" type="button"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> Хийн хууль</button>
      <button class="pl-tab" id="plTab3d" type="button"><svg class="su-ico sm" viewBox="0 0 24 24"><path d="m21.12 6.4-6-3.5a2 2 0 0 0-2 0l-6 3.5A2 2 0 0 0 6 8.13v7.74a2 2 0 0 0 1 1.73l6 3.5a2 2 0 0 0 2 0l6-3.5a2 2 0 0 0 1-1.73V8.13a2 2 0 0 0-1-1.73Z"/><path d="M12 22V12"/><path d="m3.27 6.96 8.73 5.04 8.73-5.04"/></svg> 3D Лаб (Өрөө)</button>
    </div>`;

if (html.includes(oldPlTabs)) {
  html = html.replace(oldPlTabs, newPlTabs);
  console.log('Cleaned up Physics Lab tabs with SVG icons.');
}

console.log('Writing updated index.html...');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully wrote refined index.html!');

