/* ==========================================================================
   SCIENCE UNIVERSE — PHASE 2 · DEEP SPACE APP
   File: js/space/su-space-app.js
   Injects the DEEP SPACE submenu into the existing Space Explore overlay,
   manages the single renderer, mode lifecycle, HUD, lab links and nav hooks.
   ========================================================================== */
(function () {
  'use strict';

  var SU = window.SU = window.SU || {};
  if (!SU.data || !SU.core || !SU.core.ready) return;
  var C = SU.core;
  var D = SU.data;

  var renderer = null;
  var solar = null;
  var surface = null;
  var research = null;
  var sandbox = null;
  var activeCtl = null;
  var activeMode = null;
  var lastMode = 'solar';
  var selectedKey = 'mars';
  var arrivedKey = 'mars';
  var surfacePlanetKey = null;
  var sandboxPlanetKey = null;
  var raf = null;
  var lastFrame = 0;
  var hudTimer = 0;
  var toastTimer = null;
  var warpTimer = null;

  var canvas, panel, solarPanel, surfacePanel, researchPanel, sandboxPanel, eduPanel;
  var hudMode, hudPlanet, hudMetrics, hudPrompt, fpsHud, warp, warpText, toastEl, scanBtn;
  var tabs = [];

  /* ------------------------------------------------------------------ styles */
  function injectStyles() {
    if (document.getElementById('su-space-styles')) return;
    var st = document.createElement('style');
    st.id = 'su-space-styles';
    st.textContent = `
@media (min-width: 641px){ .se-tree-branches-4 { grid-template-columns: repeat(5, 1fr); } }
#sePanelDeepSpace { color: #e2e8f0; }
.su-panel-head { display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; margin: 0 0 12px; }
.su-panel-title { display:flex; align-items:center; gap:10px; min-width:0; }
.su-panel-title h2 { font-size: 15px; margin: 0; letter-spacing: .6px; color:#f8fafc; text-transform: uppercase; }
.su-panel-title p { margin: 2px 0 0; font-size: 11px; color:#94a3b8; }
.su-orbit-icon { width:34px; height:34px; border-radius:10px; display:grid; place-items:center; background:linear-gradient(135deg,#1e3a8a,#0369a1); border:1px solid #38bdf8; color:#e0f2fe; box-shadow:0 0 14px rgba(56,189,248,.35); flex-shrink:0; }
.su-layout { display:grid; grid-template-columns: minmax(0,1.42fr) minmax(290px,1fr); gap:14px; align-items:start; transition: all 0.25s ease; }
@media (max-width: 860px){ .su-layout { grid-template-columns: 1fr; } }
.su-layout.su-expanded { grid-template-columns: 1fr; }
.su-layout.su-expanded .su-side { display: none; }
.su-viewport-card { border:1px solid #1e293b; background: linear-gradient(165deg,#0b1224,#0f172a); border-radius:16px; overflow:hidden; }
.su-viewport-wrap { position:relative; height: clamp(380px, 58vh, 600px); background:#02040c; overflow:hidden; transition: height 0.25s ease; }
.su-viewport-wrap.su-expanded { height: clamp(540px, 78vh, 880px); }
@media (max-width: 860px){ .su-viewport-wrap { height: 46vh; min-height: 280px; } }
#suViewport { width:100%; height:100%; display:block; touch-action:none; outline:none; }
.su-expand-btn { pointer-events: auto; cursor: pointer; background: rgba(14,165,233,0.22); border: 1px solid #38bdf8; color: #e0f2fe; transition: all 0.2s ease; }
.su-expand-btn:hover { background: rgba(14,165,233,0.5); box-shadow: 0 0 10px rgba(56,189,248,0.4); }
.su-hud-top { position:absolute; left:10px; right:10px; top:10px; display:flex; justify-content:space-between; gap:8px; pointer-events:none; }
.su-hud-pill { background:rgba(3,7,18,.72); border:1px solid #334155; color:#cbd5e1; border-radius:999px; padding:5px 10px; font-size:10.5px; font-weight:600; letter-spacing:.4px; backdrop-filter: blur(6px); }
.su-hud-pill.cyan { border-color:#0ea5e9; color:#7dd3fc; }
.su-hud-pill.amber { border-color:#f59e0b; color:#fcd34d; }
.su-hud-bottom { position:absolute; left:10px; right:10px; bottom:10px; display:flex; align-items:flex-end; justify-content:space-between; gap:10px; pointer-events:none; }
.su-hud-metrics { display:flex; gap:6px; flex-wrap:wrap; max-width:78%; }
.su-metric { background:rgba(3,7,18,.72); border:1px solid #334155; border-radius:9px; padding:5px 8px; min-width:64px; }
.su-metric small { display:block; font-size:8.5px; color:#94a3b8; letter-spacing:.8px; }
.su-metric b { font-size:12px; color:#f1f5f9; font-weight:700; }
.su-prompt { background:rgba(3,7,18,.78); border:1px solid #334155; border-radius:9px; padding:6px 10px; font-size:11px; color:#cbd5e1; pointer-events:none; max-width:64%; text-align:right; }
.su-prompt.ready { border-color:#22c55e; color:#86efac; }
.su-crosshair { position:absolute; left:50%; top:50%; width:22px; height:22px; margin:-11px 0 0 -11px; border:1px solid rgba(125,211,252,.75); border-radius:50%; box-shadow:0 0 10px rgba(56,189,248,.35); pointer-events:none; }
.su-crosshair::after { content:''; position:absolute; left:9px; top:9px; width:2px; height:2px; border-radius:50%; background:#7dd3fc; }
.su-fps-ui { position:absolute; inset:0; pointer-events:none; display:none; }
.su-fps-ui.on { display:block; }
.su-joystick { position:absolute; left:14px; bottom:14px; width:96px; height:96px; border-radius:50%; border:1px solid rgba(56,189,248,.4); background:rgba(3,7,18,.55); pointer-events:auto; touch-action:none; backdrop-filter: blur(4px); }
@media (hover:hover) and (pointer:fine) and (min-width: 861px){ .su-joystick { display:none; } }
.su-joy-knob { position:absolute; left:50%; top:50%; width:40px; height:40px; margin:-20px 0 0 -20px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #7dd3fc, #0369a1); box-shadow:0 0 16px rgba(56,189,248,.6); }
.su-fps-actions { position:absolute; right:14px; bottom:14px; display:flex; gap:8px; pointer-events:auto; }
.su-round-btn { width:56px; height:56px; border-radius:50%; border:1px solid #38bdf8; background:rgba(3,7,18,.72); color:#e0f2fe; font-size:10px; font-weight:800; letter-spacing:.5px; display:grid; place-items:center; cursor:pointer; backdrop-filter: blur(4px); }
.su-round-btn:active { transform:scale(.95); }
.su-round-btn.scan { border-color:#22c55e; color:#bbf7d0; }
.su-round-btn[hidden]{ display:none; }
.su-warp { position:absolute; inset:0; display:none; place-items:center; background:radial-gradient(circle at 50% 50%, #0b2a4a, #02040c 70%); z-index:6; }
.su-warp.on { display:grid; }
.su-warp-text { font-size:12px; letter-spacing:2px; color:#7dd3fc; text-transform:uppercase; animation: suWarpPulse 0.9s ease-in-out infinite alternate; text-align:center; padding:0 16px; }
@keyframes suWarpPulse { from{opacity:.45; transform:scale(.98)} to{opacity:1; transform:scale(1.02)} }
.su-mode-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:6px; padding:10px; background:rgba(2,6,23,.6); border-top:1px solid #1e293b; }
@media (max-width: 400px){ .su-mode-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.su-mode-tab { border:1px solid #25324a; background:#0d1526; color:#94a3b8; border-radius:9px; padding:10px 6px; font-size:10.5px; font-weight:700; letter-spacing:.4px; cursor:pointer; min-height:44px; min-width:44px; }
.su-mode-tab.active { background:linear-gradient(135deg,#1d4ed8,#0369a1); border-color:#38bdf8; color:#fff; box-shadow:0 0 14px rgba(56,189,248,.25); }
.su-mode-tab:disabled { opacity:.45; cursor:not-allowed; }
.su-side { display:flex; flex-direction:column; gap:12px; min-width:0; }
.su-side-section[hidden]{ display:none; }
.su-card { background: linear-gradient(160deg, rgba(15,23,42,.96), rgba(9,14,28,.98)); border:1px solid #1e293b; border-radius:14px; padding:13px; }
.su-card-head { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:11px; font-weight:800; letter-spacing:1px; color:#a5b4fc; text-transform:uppercase; margin-bottom:8px; }
.su-sub { font-size:11px; line-height:1.5; color:#94a3b8; margin-bottom:10px; }
.su-chip { border:1px solid #334155; border-radius:999px; padding:3px 9px; font-size:9.5px; font-weight:700; color:#cbd5e1; white-space:nowrap; }
.su-chip.warn { border-color:#f59e0b; color:#fcd34d; }
.su-chip.ok { border-color:#22c55e; color:#86efac; }
.su-planet-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-bottom:10px; }
.su-planet-btn { border:1px solid #25324a; background:#0d1526; color:#cbd5e1; border-radius:9px; padding:7px 4px; font-size:10px; font-weight:600; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; min-height:48px; }
.su-planet-btn i { width:14px; height:14px; border-radius:50%; box-shadow:0 0 8px currentColor; }
.su-planet-btn.active { border-color:#38bdf8; background:#0c2440; color:#e0f2fe; box-shadow:0 0 10px rgba(56,189,248,.25); }
.su-planet-facts { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:10px 0; }
.su-fact { background:rgba(2,6,23,.55); border:1px solid #1e293b; border-radius:8px; padding:7px 8px; }
.su-fact small { display:block; font-size:8.5px; color:#94a3b8; letter-spacing:.6px; }
.su-fact b { font-size:11.5px; color:#f1f5f9; }
.su-info-note { font-size:10.5px; line-height:1.55; color:#9ca3af; border-left:2px solid #334155; padding-left:9px; margin:8px 0; }
.su-info-note.warn { border-left-color:#f59e0b; color:#fcd34d; }
.su-actions { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px; }
@media (max-width: 350px){ .su-actions { grid-template-columns:1fr; } .su-planet-strip { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.su-btn { border:1px solid #334155; background:#111c30; color:#e2e8f0; border-radius:9px; padding:10px 8px; font-size:11px; font-weight:700; letter-spacing:.4px; cursor:pointer; min-height:44px; min-width:44px; }
.su-btn:hover { border-color:#38bdf8; }
.su-btn.primary { background:linear-gradient(135deg,#1d4ed8,#0369a1); border-color:#38bdf8; color:#fff; }
.su-btn.warn { border-color:#f59e0b; color:#fcd34d; }
.su-btn.active { background:#0c4a6e; border-color:#38bdf8; color:#e0f2fe; }
.su-btn:disabled { opacity:.45; cursor:not-allowed; }
.su-btn.wide { grid-column:1 / -1; }
.su-badge { display:inline-block; border-radius:999px; padding:3px 8px; font-size:8.5px; font-weight:800; letter-spacing:.5px; border:1px solid; white-space:nowrap; }
.su-badge.established { color:#86efac; border-color:#22c55e; background:rgba(34,197,94,.1); }
.su-badge.simulated { color:#fcd34d; border-color:#f59e0b; background:rgba(245,158,11,.1); }
.su-badge.model { color:#c4b5fd; border-color:#8b5cf6; background:rgba(139,92,246,.12); }
.su-badge-line { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
.su-section-title { font-size:9.5px; font-weight:800; letter-spacing:1.2px; color:#64748b; margin:13px 0 6px; text-transform:uppercase; }
.su-tool-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.su-tool { border:1px solid #25324a; background:#0d1526; color:#e2e8f0; border-radius:9px; padding:9px 8px; text-align:left; cursor:pointer; min-height:48px; }
.su-tool b { display:block; font-size:10.5px; color:#7dd3fc; }
.su-tool small { display:block; font-size:9.5px; color:#94a3b8; margin-top:2px; }
.su-tool:disabled { opacity:.45; cursor:not-allowed; }
.su-scan-hint { border:1px dashed #334155; border-radius:9px; padding:8px 9px; font-size:10.5px; color:#94a3b8; margin:9px 0; }
.su-scan-hint.ready { border-color:#22c55e; color:#86efac; }
.su-progress { margin:9px 0; }
.su-progress-label { font-size:10px; color:#7dd3fc; margin-bottom:5px; }
.su-progress-track { height:6px; border-radius:6px; background:#1e293b; overflow:hidden; }
.su-progress-track i { display:block; height:100%; width:0%; background:linear-gradient(90deg,#38bdf8,#22c55e); transition:width .12s linear; }
.su-result { border:1px solid #1e293b; background:rgba(2,6,23,.55); border-radius:10px; padding:9px 10px; margin:8px 0; font-size:11px; line-height:1.55; color:#cbd5e1; }
.su-result.ok { border-color:#22c55e55; }
.su-result.warn { border-color:#f59e0b66; }
.su-result-head { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:5px; font-size:11.5px; color:#f8fafc; }
.su-result p { margin:4px 0; color:#cbd5e1; }
.su-result small { display:block; color:#94a3b8; font-size:10px; margin-top:4px; }
.su-mission { display:flex; gap:7px; font-size:10.5px; color:#94a3b8; padding:4px 0; line-height:1.4; }
.su-mission i { font-style:normal; color:#64748b; }
.su-mission.done { color:#86efac; }
.su-mission.done i { color:#22c55e; }
.su-mission-meta { font-size:9.5px; color:#64748b; margin-top:4px; }
.su-atmo-row { display:flex; justify-content:space-between; font-size:10.5px; padding:3px 0; border-bottom:1px solid #152033; color:#cbd5e1; }
.su-atmo-row b { color:#e2e8f0; }
.su-measure-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.su-measure-grid div { background:rgba(2,6,23,.5); border:1px solid #1e293b; border-radius:8px; padding:7px; }
.su-measure-grid small { display:block; font-size:8px; color:#94a3b8; letter-spacing:.7px; }
.su-measure-grid b { font-size:11px; color:#f1f5f9; }
.su-hab-score { font-size:26px; font-weight:800; color:#86efac; margin:2px 0 8px; }
.su-hab-score small { font-size:11px; color:#94a3b8; }
.su-bar-row { display:flex; align-items:center; gap:7px; font-size:10px; color:#94a3b8; margin:4px 0; }
.su-bar-row span { width:74px; flex-shrink:0; }
.su-bar-row b { width:30px; text-align:right; color:#e2e8f0; font-size:10px; }
.su-bar { flex:1; height:5px; border-radius:5px; background:#1e293b; overflow:hidden; }
.su-bar i { display:block; height:100%; background:linear-gradient(90deg,#38bdf8,#22c55e); border-radius:5px; }
.su-log { max-height:260px; overflow-y:auto; padding-right:2px; }
.su-log-entry { border-bottom:1px solid #152033; padding:7px 0; }
.su-log-head { display:flex; gap:6px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
.su-log-head b { font-size:10.5px; color:#e2e8f0; }
.su-log-entry p { margin:4px 0 0; font-size:10px; line-height:1.55; color:#94a3b8; }
.su-muted { font-size:10.5px; color:#64748b; line-height:1.5; }
.su-sandbox .su-catalog { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
.su-mod { display:grid; grid-template-columns:12px 1fr; gap:2px 6px; align-items:center; text-align:left; border:1px solid #25324a; background:#0d1526; color:#e2e8f0; border-radius:9px; padding:7px; cursor:pointer; min-height:58px; }
.su-mod.active { border-color:#38bdf8; background:#0c2440; }
.su-mod.poor { opacity:.5; }
.su-mod-dot { width:10px; height:10px; border-radius:50%; grid-row:1 / span 2; }
.su-mod b { font-size:9.5px; line-height:1.25; }
.su-mod small { font-size:8.5px; color:#94a3b8; }
.su-mod em { font-style:normal; font-size:8.5px; color:#64748b; grid-column:2; }
.su-res-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:5px; }
.su-res-grid div { background:rgba(2,6,23,.5); border:1px solid #1e293b; border-radius:8px; padding:6px; }
.su-res-grid small { display:block; font-size:7.5px; color:#94a3b8; letter-spacing:.5px; }
.su-res-grid b { font-size:11px; color:#e2e8f0; }
.su-res-grid b.bad, .su-derived b.bad { color:#fca5a5; }
.su-sb-actions { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:9px 0; }
.su-sb-actions .su-btn:last-child { grid-column:1 / -1; }
.su-env-row, .su-der-row { display:flex; justify-content:space-between; gap:8px; font-size:10px; color:#94a3b8; padding:3px 0; }
.su-env-row b, .su-der-row b { color:#e2e8f0; font-size:10px; }
.su-slider { width:100%; accent-color:#38bdf8; margin:4px 0 8px; }
.su-sb-status { font-size:9px; font-weight:800; letter-spacing:.6px; border:1px solid; border-radius:999px; padding:3px 8px; }
.su-sb-status.ok { color:#86efac; border-color:#22c55e; }
.su-sb-status.warn { color:#fcd34d; border-color:#f59e0b; }
.su-sb-status.bad { color:#fca5a5; border-color:#ef4444; }
.su-sb-log { font-size:9.5px; color:#94a3b8; line-height:1.45; padding:4px 0; border-bottom:1px solid #152033; }
.su-sb-log span { color:#7dd3fc; font-weight:700; margin-right:5px; }
.su-sb-log-wrap { max-height:140px; overflow-y:auto; }
.su-edu .su-lab-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; }
@media (max-width: 360px){ .su-edu .su-lab-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.su-lab-btn { border:1px solid #25324a; background:#0d1526; color:#cbd5e1; border-radius:8px; padding:8px 6px; font-size:10px; font-weight:700; cursor:pointer; min-height:44px; min-width:44px; }
.su-lab-btn:hover { border-color:#38bdf8; color:#e0f2fe; }
.su-formula { background:rgba(2,6,23,.55); border:1px solid #1e293b; border-radius:8px; padding:7px 8px; font-size:9.5px; line-height:1.5; color:#c4b5fd; margin-top:6px; font-family: ui-monospace, monospace; overflow-wrap:anywhere; }
.su-toast { position:fixed; left:50%; bottom:26px; transform:translateX(-50%) translateY(20px); background:#0b1224; border:1px solid #38bdf8; color:#e0f2fe; padding:9px 14px; border-radius:999px; font-size:11px; font-weight:600; opacity:0; pointer-events:none; transition:all .25s; z-index:10050; max-width:min(88vw, 520px); text-align:center; }
.su-toast.on { opacity:1; transform:translateX(-50%) translateY(0); }
@media (prefers-reduced-motion: reduce){ .su-warp-text{animation:none} .su-toast{transition:none} }
`;
    document.head.appendChild(st);
  }

  /* ------------------------------------------------------------------- toast */
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2800);
  }

  /* --------------------------------------------------------------- injection */
  function injectBranch() {
    var hub = document.querySelector('.se-tree-branches-4');
    if (!hub || hub.querySelector('[data-se-target="deepspace"]')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'se-tree-branch-btn';
    btn.setAttribute('data-se-target', 'deepspace');
    btn.innerHTML = '<div class="se-tb-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg></div>' +
      '<strong>DEEP SPACE</strong><small>Нислэг · Судалгаа · Колони</small>';
    hub.appendChild(btn);
    btn.addEventListener('click', function (e) {
      if (e) e.preventDefault();
      document.querySelectorAll('.se-tree-branch-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('.se-panel').forEach(function (p) { p.classList.remove('active'); });
      // The original Space Explore handler may also run for this button and
      // clear all panels, so re-assert our panel on the next tick.
      setTimeout(function () {
        document.querySelectorAll('.se-tree-branch-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
        document.querySelectorAll('.se-panel').forEach(function (p) { p.classList.remove('active'); });
        panel.classList.add('active');
        setMode(lastMode || 'solar');
      }, 0);
    });
  }

  function injectPanel() {
    var container = document.querySelector('.se-container');
    if (!container || document.getElementById('sePanelDeepSpace')) return;
    panel = document.createElement('div');
    panel.className = 'se-panel';
    panel.id = 'sePanelDeepSpace';
    panel.innerHTML = `
<div class="su-panel-head">
  <div class="su-panel-title">
    <div class="su-orbit-icon"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-30 12 12)"/></svg></div>
    <div><h2>Deep Space Program</h2><p>8 гариг · Буух · Судалгаа · Колони</p></div>
  </div>
  <div class="su-badge-line"><span class="su-badge established">ESTABLISHED FACTS</span><span class="su-badge simulated">SIMULATION</span></div>
</div>
<div class="su-layout">
  <div class="su-viewport-card">
    <div class="su-viewport-wrap">
      <canvas id="suViewport" aria-label="Deep Space 3D viewport"></canvas>
      <div class="su-hud-top">
        <div style="display:flex;gap:6px;pointer-events:auto;">
          <div class="su-hud-pill cyan" id="suHudMode">SOLAR SYSTEM</div>
          <div class="su-hud-pill" id="suHudPlanet">EARTH</div>
        </div>
        <button type="button" class="su-hud-pill su-expand-btn" id="suExpandBtn" title="Дэлгэц дүүргэх / Хураах (Fullscreen View)">⛶ ӨРГӨТГӨХ (FULL VIEW)</button>
      </div>
      <div class="su-crosshair" id="suCrosshair" style="display:none"></div>
      <div class="su-hud-metrics" id="suHudMetrics" style="position:absolute;left:10px;bottom:64px"></div>
      <div class="su-hud-bottom">
        <div class="su-prompt" id="suHudPrompt">Гариг сонгоод TRAVEL дарна уу</div>
      </div>
      <div class="su-fps-ui" id="suFpsHud">
        <div class="su-crosshair"></div>
        <div class="su-joystick" id="suJoystick"><div class="su-joy-knob" id="suJoyKnob"></div></div>
        <div class="su-fps-actions">
          <button type="button" class="su-round-btn" id="suJumpBtn">JUMP</button>
          <button type="button" class="su-round-btn scan" id="suScanBtn" hidden>SCAN</button>
        </div>
      </div>
      <div class="su-warp" id="suWarp"><div class="su-warp-text" id="suWarpText">ENTERING</div></div>
    </div>
    <div class="su-mode-tabs" role="tablist">
      <button type="button" class="su-mode-tab active" data-mode="solar">SOLAR</button>
      <button type="button" class="su-mode-tab" data-mode="surface">SURFACE</button>
      <button type="button" class="su-mode-tab" data-mode="research">RESEARCH</button>
      <button type="button" class="su-mode-tab" data-mode="sandbox">SANDBOX</button>
    </div>
  </div>
  <aside class="su-side">
    <div class="su-side-section" id="suSolarPanel"></div>
    <div class="su-side-section" id="suSurfacePanel" hidden></div>
    <div class="su-side-section" id="suResearchPanel" hidden></div>
    <div class="su-side-section" id="suSandboxPanel" hidden></div>
    <div class="su-side-section su-edu" id="suEduPanel"></div>
  </aside>
</div>`;
    container.appendChild(panel);

    canvas = document.getElementById('suViewport');
    solarPanel = document.getElementById('suSolarPanel');
    surfacePanel = document.getElementById('suSurfacePanel');
    researchPanel = document.getElementById('suResearchPanel');
    sandboxPanel = document.getElementById('suSandboxPanel');
    eduPanel = document.getElementById('suEduPanel');
    hudMode = document.getElementById('suHudMode');
    hudPlanet = document.getElementById('suHudPlanet');
    hudMetrics = document.getElementById('suHudMetrics');
    hudPrompt = document.getElementById('suHudPrompt');
    fpsHud = document.getElementById('suFpsHud');
    warp = document.getElementById('suWarp');
    warpText = document.getElementById('suWarpText');
    scanBtn = document.getElementById('suScanBtn');

    var expandBtn = document.getElementById('suExpandBtn');
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        var layout = document.querySelector('.su-layout');
        var vWrap = document.querySelector('.su-viewport-wrap');
        if (!layout || !vWrap) return;
        var isExp = layout.classList.toggle('su-expanded');
        vWrap.classList.toggle('su-expanded', isExp);
        expandBtn.innerHTML = isExp ? '◱ ХУРААХ (NORMAL)' : '⛶ ӨРГӨТГӨХ (FULL VIEW)';
        setTimeout(function () {
          resizeActive();
        }, 60);
      });
    }

    toastEl = document.createElement('div');
    toastEl.className = 'su-toast';
    toastEl.setAttribute('role', 'status');
    document.body.appendChild(toastEl);

    tabs = Array.prototype.slice.call(panel.querySelectorAll('[data-mode]'));
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var mode = t.getAttribute('data-mode');
        if (mode === 'solar') setMode('solar');
        else enterPlanetMode(mode);
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('.se-tree-branch-btn'), function (b) {
      if (b.getAttribute('data-se-target') === 'deepspace') return;
      b.addEventListener('click', suspend);
    });
    var closeBtn = document.getElementById('seCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', suspend);

    bindSurfaceButtons();
    bindJoystick();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopLoop(); else if (isVisible()) startLoop();
    });
    window.addEventListener('resize', resizeActive);
  }

  function bindSurfaceButtons() {
    var jump = document.getElementById('suJumpBtn');
    if (jump) jump.addEventListener('click', function () { if (surface) surface.jump(); });
    var scan = document.getElementById('suScanBtn');
    if (scan) scan.addEventListener('click', function () { if (research) research.startScan(); });
  }

  function bindJoystick() {
    var joy = document.getElementById('suJoystick');
    var knob = document.getElementById('suJoyKnob');
    if (!joy || !knob) return;
    var activeId = null;
    function set(e) {
      var r = joy.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = e.clientX - cx;
      var dy = e.clientY - cy;
      var max = r.width * 0.32;
      var len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      if (surface) surface.setMove(dx / max, -dy / max);
    }
    joy.addEventListener('pointerdown', function (e) {
      activeId = e.pointerId;
      set(e);
      try { if (joy.setPointerCapture) joy.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault(); e.stopPropagation();
    });
    joy.addEventListener('pointermove', function (e) {
      if (e.pointerId !== activeId) return;
      set(e);
      e.preventDefault(); e.stopPropagation();
    });
    function release(e) {
      if (e.pointerId !== activeId) return;
      activeId = null;
      knob.style.transform = '';
      if (surface) surface.setMove(0, 0);
    }
    joy.addEventListener('pointerup', release);
    joy.addEventListener('pointercancel', release);
    joy.addEventListener('lostpointercapture', function () { knob.style.transform = ''; if (surface) surface.setMove(0, 0); });
  }

  /* -------------------------------------------------------------- controller */
  function ensureRenderer() {
    if (renderer) return;
    renderer = C.createRenderer(canvas);
  }

  function getSelectedPlanet() { return D.getPlanet(selectedKey); }

  function renderSolarPanel() {
    if (!solarPanel) return;
    var p = getSelectedPlanet();
    var keys = (D.LANDING_DESTINATIONS || []).concat(['jupiter', 'saturn', 'uranus', 'neptune']);
    var planets = keys.map(D.getPlanet);
    var strip = planets.map(function (pp) {
      return '<button type="button" class="su-planet-btn ' + (pp.key === selectedKey ? 'active' : '') + '" data-p="' + pp.key + '">' +
        '<i style="background:' + pp.color + ';color:' + pp.color + '"></i>' + pp.name + '</button>';
    }).join('');
    var arrived = selectedKey === arrivedKey;
    solarPanel.innerHTML =
      '<div class="su-card">' +
        '<div class="su-card-head"><span>PLANET SELECTOR</span><span class="su-chip ' + (arrived ? 'ok' : 'warn') + '">' + (arrived ? 'IN ORBIT' : 'TRAVEL REQUIRED') + '</span></div>' +
        '<div class="su-planet-strip">' + strip + '</div>' +
        '<div class="su-card-head" style="margin-top:6px"><span>' + p.name + ' · ' + p.en + '</span><span class="su-chip">' + (p.type === 'gas' ? 'GAS / ICE GIANT' : 'ROCKY WORLD') + '</span></div>' +
        '<div class="su-planet-facts">' +
          '<div class="su-fact"><small>RADIUS</small><b>' + p.radiusKm.toLocaleString() + ' км</b></div>' +
          '<div class="su-fact"><small>GRAVITY</small><b>' + D.fmt(p.gravity, 2) + ' м/с²</b></div>' +
          '<div class="su-fact"><small>DISTANCE</small><b>' + D.fmt(p.distanceAU, 3) + ' AU</b></div>' +
          '<div class="su-fact"><small>DAY / YEAR</small><b>' + D.fmt(p.rotationHours, 1) + ' ц / ' + D.fmt(p.periodDays, 0) + ' хон</b></div>' +
          '<div class="su-fact"><small>MEAN TEMP</small><b>' + p.tempMean + '°C</b></div>' +
          '<div class="su-fact"><small>PRESSURE</small><b>' + D.pressureLabel(p.pressureAtm) + '</b></div>' +
        '</div>' +
        '<div class="su-info-note">' + escapeHTML((p.habitability && p.habitability.verdict) || p.localGravityNote || '') + '</div>' +
        '<div class="su-info-note warn">' + escapeHTML(p.simNotice || '') + '</div>' +
        '<div class="su-badge-line"><span class="su-badge established">FACTS: PLANETARY DATA</span><span class="su-badge simulated">ORBIT SCALE / SHIP: SIMULATION</span></div>' +
        '<div class="su-actions">' +
          '<button type="button" class="su-btn primary" id="suTravelBtn">TRAVEL</button>' +
          '<button type="button" class="su-btn ' + (arrived ? 'primary' : '') + '" id="suLandBtn"' + (arrived ? '' : ' disabled') + '>LAND</button>' +
          '<button type="button" class="su-btn wide" id="suResetViewBtn">RESET SYSTEM VIEW</button>' +
        '</div>' +
      '</div>';

    solarPanel.querySelectorAll('[data-p]').forEach(function (b) {
      b.addEventListener('click', function () {
        selectedKey = b.getAttribute('data-p');
        if (solar) solar.select(selectedKey, true);
        refreshPlanetUi();
      });
    });
    var travelBtn = solarPanel.querySelector('#suTravelBtn');
    if (travelBtn) travelBtn.addEventListener('click', function () {
      if (!solar) return;
      if (solar.isTravelling()) { toast('Нислэг үргэлжилж байна…'); return; }
      solar.travelTo(selectedKey);
      hudPrompt.textContent = 'Нислэг: ' + getSelectedPlanet().en;
    });
    var landBtn = solarPanel.querySelector('#suLandBtn');
    if (landBtn) landBtn.addEventListener('click', function () { land(); });
    var resetBtn = solarPanel.querySelector('#suResetViewBtn');
    if (resetBtn) resetBtn.addEventListener('click', function () { if (solar) solar.resetView(); });
  }

  function renderSurfacePanel() {
    if (!surfacePanel) return;
    var p = getSelectedPlanet();
    surfacePanel.innerHTML =
      '<div class="su-card">' +
        '<div class="su-card-head"><span>SURFACE OPERATIONS</span><span class="su-chip">' + p.en + '</span></div>' +
        '<div class="su-sub">' + (p.type === 'gas'
          ? 'AEROSTAT PLATFORM (SIMULATED): энэ гаригт хатуу гадарга байхгүй. 1 бар түвшний хөвөгч станц.'
          : 'Гадаргын буух бүс. Байршил нь симуляц; геологийн тодорхойлолт нь баталгаажсан өгөгдөл.') + '</div>' +
        '<div class="su-measure-grid">' +
          '<div><small>GRAVITY</small><b>' + D.fmt(p.gravity, 2) + ' м/с²</b></div>' +
          '<div><small>TEMPERATURE</small><b>' + p.tempMean + '°C</b></div>' +
          '<div><small>PRESSURE</small><b>' + D.pressureLabel(p.pressureAtm) + '</b></div>' +
          '<div><small>JET / GRAVITY RATIO</small><b>' + D.fmt(p.gravity / 9.81, 2) + ' g</b></div>' +
        '</div>' +
        '<div class="su-section-title">CONTROLS</div>' +
        '<div class="su-muted">Чирж харах · WASD / Arrow товч · SPACE үсрэх · Гар утсан дээр joystick + JUMP.</div>' +
        '<div class="su-section-title">WHY THIS MATTERS</div>' +
        '<div class="su-info-note">' + escapeHTML(p.localGravityNote || '') + '</div>' +
        '<div class="su-actions">' +
          '<button type="button" class="su-btn primary" id="suToResearch">RESEARCH</button>' +
          '<button type="button" class="su-btn" id="suToSandbox">SANDBOX</button>' +
          '<button type="button" class="su-btn wide" id="suToOrbit">RETURN TO ORBIT</button>' +
        '</div>' +
      '</div>';

    var r = surfacePanel.querySelector('#suToResearch');
    if (r) r.addEventListener('click', function () { enterPlanetMode('research'); });
    var s = surfacePanel.querySelector('#suToSandbox');
    if (s) s.addEventListener('click', function () { enterPlanetMode('sandbox'); });
    var o = surfacePanel.querySelector('#suToOrbit');
    if (o) o.addEventListener('click', function () { setMode('solar'); });
  }

  function renderEduPanel() {
    if (!eduPanel) return;
    var p = getSelectedPlanet();
    var focusLab = (p.labFocus && p.labFocus[0]) || 'physics';
    var link = D.LAB_LINKS[focusLab] || D.LAB_LINKS.physics;
    var formulas = D.getLabFormulas(focusLab).slice(0, 2).map(cleanFormula);
    eduPanel.innerHTML =
      '<div class="su-card">' +
        '<div class="su-card-head"><span>LAB LINKS</span><span class="su-chip">LEARN BY DOING</span></div>' +
        '<div class="su-lab-grid">' +
          '<button type="button" class="su-lab-btn" data-lab="physics">Physics</button>' +
          '<button type="button" class="su-lab-btn" data-lab="engineering">Engineering</button>' +
          '<button type="button" class="su-lab-btn" data-lab="computer">Computer</button>' +
          '<button type="button" class="su-lab-btn" data-lab="space">Space</button>' +
          '<button type="button" class="su-lab-btn" data-lab="ai">AI</button>' +
          '<button type="button" class="su-lab-btn" data-lab="ask">Ask AI</button>' +
        '</div>' +
        '<div class="su-section-title">' + escapeHTML(link.name) + ' · ' + escapeHTML(link.focus) + '</div>' +
        formulas.map(function (f) { return '<div class="su-formula">' + escapeHTML(f) + '</div>'; }).join('') +
        '<div class="su-muted" style="margin-top:6px">Томьёо нь одоогийн лабораторийн мэдлэгийн сангаас. Лабораторид туршиж шалгана уу.</div>' +
      '</div>';

    eduPanel.querySelectorAll('[data-lab]').forEach(function (b) {
      b.addEventListener('click', function () {
        var lab = b.getAttribute('data-lab');
        if (lab === 'ask') askAI();
        else openLab(lab);
      });
    });
  }

  function cleanFormula(f) {
    return String(f || '')
      .replace(/\$\$/g, '')
      .replace(/\\text\{([^}]*)\}/g, '$1')
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]*)\}/g, '√($1)')
      .replace(/\\pi/g, 'π')
      .replace(/\\cdot/g, '·')
      .replace(/\\times/g, '×')
      .replace(/\\left|\\right/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function refreshPlanetUi() {
    renderSolarPanel();
    renderEduPanel();
    if (activeMode === 'surface' || activeMode === 'research') renderSurfacePanel();
    updateHud(true);
  }

  /* --------------------------------------------------------------- lifecycle */
  function ensureSolar() {
    if (solar) return;
    solar = SU.solar.create({
      renderer: renderer, canvas: canvas, onToast: toast,
      onSelect: function (key) {
        selectedKey = key;
        if (activeMode === 'solar') refreshPlanetUi();
      },
      onArrive: function (key) {
        arrivedKey = key;
        refreshPlanetUi();
        toast(getSelectedPlanet().en + ' тойрог замд хүрлээ. LAND боломжтой.');
      }
    });
  }

  function ensureSurface(key) {
    if (surface && surfacePlanetKey === key) return;
    if (surface) {
      surface.dispose();
      surface = null;
    }
    surfacePlanetKey = key;
    surface = SU.surface.create({
      renderer: renderer, canvas: canvas, onToast: toast,
      onEnter: function (p) {
        hudPlanet.textContent = (p.en || p.name).toUpperCase();
        renderSurfacePanel();
      }
    });
    surface.build(key);
    researchPanel.innerHTML = '';
    research = SU.research.create({
      surface: surface,
      planetKey: key,
      container: researchPanel,
      onToast: toast,
      onCredits: function (n) { try { if (typeof window.addCredits === 'function') window.addCredits(n); } catch (e) {} },
      onChange: function () {}
    });
  }

  function ensureSandbox(key) {
    if (sandbox && sandboxPlanetKey === key) return;
    if (sandbox) {
      sandbox.dispose();
      sandbox = null;
    }
    sandboxPlanetKey = key;
    sandboxPanel.innerHTML = '';
    sandbox = SU.sandbox.create({
      renderer: renderer, canvas: canvas, container: sandboxPanel,
      planetKey: key, onToast: toast
    });
  }

  function enterPlanetMode(mode) {
    if (selectedKey !== arrivedKey) {
      toast('Эхлээд ' + getSelectedPlanet().en + ' руу TRAVEL хийж, дараа нь бууна уу.');
      return;
    }
    if (mode === 'sandbox') {
      ensureSandbox(selectedKey);
      setMode('sandbox');
    } else {
      ensureSurface(selectedKey);
      setMode(mode);
    }
  }

  function land() {
    if (selectedKey !== arrivedKey) {
      toast('Эхлээд TRAVEL дарж ' + getSelectedPlanet().en + ' руу ниснэ үү');
      return;
    }
    var p = getSelectedPlanet();
    warp.classList.add('on');
    warpText.textContent = 'ENTERING ' + p.en.toUpperCase() + (p.type === 'gas' ? ' · AEROSTAT PLATFORM' : ' · LANDING ZONE');
    clearTimeout(warpTimer);
    setTimeout(function () {
      ensureSurface(selectedKey);
      setMode('surface');
      warpTimer = setTimeout(function () { warp.classList.remove('on'); }, 420);
    }, 700);
  }

  function deactivateActive() {
    if (!activeCtl || !activeCtl.controller || !activeCtl.controller.deactivate) return;
    try { activeCtl.controller.deactivate(); } catch (e) {}
  }

  function makeCtl(controller, sceneGetter, cameraGetter) {
    return {
      controller: controller,
      getScene: sceneGetter,
      getCamera: cameraGetter,
      update: controller.update,
      resize: controller.resize
    };
  }

  function setMode(mode) {
    if (!panel) return;
    if (mode === activeMode) {
      resizeActive();
      if (isVisible()) startLoop();
      updateHud(true);
      return;
    }
    ensureRenderer();

    var keepSandbox = mode !== 'sandbox' && sandbox;
    if (mode !== 'sandbox' && sandbox) { sandbox.deactivate(); }
    deactivateActive();

    activeMode = mode;
    lastMode = mode;

    if (mode === 'solar') {
      ensureSolar();
      activeCtl = makeCtl(solar, function () { return solar.scene; }, function () { return solar.camera; });
    } else if (mode === 'surface' || mode === 'research') {
      ensureSurface(arrivedKey);
      surface.setResearchMode(mode === 'research');
      activeCtl = makeCtl(surface, function () { return surface.getScene(); }, function () { return surface.getCamera(); });
    } else if (mode === 'sandbox') {
      ensureSandbox(arrivedKey);
      activeCtl = makeCtl(sandbox, function () { return sandbox.scene; }, function () { return sandbox.camera; });
    }

    if (activeCtl && activeCtl.controller.activate) activeCtl.controller.activate();

    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-mode') === mode); });
    if (solarPanel) solarPanel.hidden = mode !== 'solar';
    if (surfacePanel) surfacePanel.hidden = !(mode === 'surface' || mode === 'research');
    if (researchPanel) researchPanel.hidden = mode !== 'research';
    if (sandboxPanel) sandboxPanel.hidden = mode !== 'sandbox';
    if (fpsHud) fpsHud.classList.toggle('on', mode === 'surface' || mode === 'research');
    var crosshair = document.getElementById('suCrosshair');
    if (crosshair) crosshair.style.display = 'none';
    if (scanBtn) scanBtn.hidden = mode !== 'research';

    renderSurfacePanel();
    renderEduPanel();
    refreshPlanetUi();
    updateHud(true);

    // Auto-expand immersive viewport in surface exploration mode
    var layout = document.querySelector('.su-layout');
    var vWrap = document.querySelector('.su-viewport-wrap');
    var expandBtn = document.getElementById('suExpandBtn');
    if (mode === 'surface') {
      if (layout) layout.classList.add('su-expanded');
      if (vWrap) vWrap.classList.add('su-expanded');
      if (expandBtn) expandBtn.innerHTML = '◱ ХУРААХ (NORMAL)';
    }

    resizeActive();
    startLoop();
  }

  function suspend() {
    stopLoop();
    if (sandbox) sandbox.deactivate();
    deactivateActive();
    activeCtl = null;
    activeMode = null;
  }

  /* ------------------------------------------------------------------- loop */
  function isVisible() {
    return panel && panel.classList.contains('active') &&
      document.getElementById('spaceExploreOverlay').classList.contains('open') &&
      !document.hidden;
  }

  function startLoop() {
    if (raf != null) return;
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (raf != null) { cancelAnimationFrame(raf); raf = null; }
  }

  function frame(now) {
    raf = null;
    if (!isVisible() || !activeCtl) return;
    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    try {
      activeCtl.update(dt);
      var scene = activeCtl.getScene();
      var cam = activeCtl.getCamera();
      if (scene && cam) renderer.render(scene, cam);
      if (now - hudTimer > 180) { hudTimer = now; updateHud(false); }
    } catch (err) {
      console.error('[DeepSpace Frame Error]', err);
    }
    raf = requestAnimationFrame(frame);
  }

  function resizeActive() {
    if (!activeCtl || !activeCtl.resize) return;
    activeCtl.resize();
  }

  /* -------------------------------------------------------------------- HUD */
  function updateHud(force) {
    if (!activeMode) return;
    var p = getSelectedPlanet();
    hudMode.textContent = activeMode === 'solar' ? 'SOLAR SYSTEM' : activeMode === 'sandbox' ? 'COLONY SANDBOX' : activeMode === 'research' ? 'PLANETARY RESEARCH' : 'SURFACE OPERATIONS';
    hudPlanet.textContent = (p.en || p.name).toUpperCase();

    if (activeMode === 'solar') {
      hudMetrics.innerHTML =
        '<div class="su-metric"><small>GRAVITY</small><b>' + D.fmt(p.gravity, 2) + '</b></div>' +
        '<div class="su-metric"><small>TEMP</small><b>' + p.tempMean + '°C</b></div>' +
        '<div class="su-metric"><small>AU</small><b>' + D.fmt(p.distanceAU, 2) + '</b></div>';
      if (hudPrompt) {
        if (solar && solar.isTravelling()) hudPrompt.textContent = 'Нислэг үргэлжилж байна…';
        else if (selectedKey !== arrivedKey) hudPrompt.textContent = p.en + ' руу TRAVEL · дараа нь LAND';
        else hudPrompt.textContent = p.en + ' тойрог замд · LAND боломжтой';
      }
    } else if (activeMode === 'surface' || activeMode === 'research') {
      var r = surface ? surface.getReadout() : null;
      hudMetrics.innerHTML =
        '<div class="su-metric"><small>GRAVITY</small><b>' + D.fmt(p.gravity, 2) + '</b></div>' +
        '<div class="su-metric"><small>TEMP</small><b>' + p.tempMean + '°C</b></div>' +
        '<div class="su-metric"><small>PRESSURE</small><b>' + D.pressureLabel(p.pressureAtm) + '</b></div>' +
        '<div class="su-metric"><small>ALT</small><b>' + (r ? D.fmt(r.altitude, 1) : '0') + ' m</b></div>';
      if (hudPrompt) {
        var near = surface ? surface.getNearestTarget(7.5, false) : null;
        hudPrompt.textContent = activeMode === 'research'
          ? (near ? 'SCAN → ' + near.name : 'Beacon руу ойртоно уу')
          : (r && r.platform ? 'AEROSTAT PLATFORM · SIMULATED' : 'WASD / joystick · SPACE үсрэх');
        hudPrompt.classList.toggle('ready', !!near && activeMode === 'research');
      }
      if (research && activeMode === 'research') research.updatePrompt();
    } else if (activeMode === 'sandbox') {
      var s = sandbox ? sandbox.getStats() : null;
      hudMetrics.innerHTML = s
        ? '<div class="su-metric"><small>POWER</small><b>' + D.fmt(s.gen, 1) + '/' + D.fmt(s.use, 1) + '</b></div>' +
          '<div class="su-metric"><small>CREW</small><b>' + s.crew + '</b></div>' +
          '<div class="su-metric"><small>STABILITY</small><b>' + D.fmt(s.stability, 0) + '%</b></div>'
        : '';
      if (hudPrompt) hudPrompt.textContent = 'Нүд сонгоод модуль байрлуул · чирж камер эргүүлнэ';
    }
  }

  /* ------------------------------------------------------------- lab linking */
  function openLab(lab) {
    if (lab === 'space') {
      var scanBranch = document.querySelector('.se-tree-branch-btn[data-se-target="scanner"]');
      if (scanBranch) { suspend(); scanBranch.click(); }
      return;
    }
    var selector = (D.LAB_LINKS[lab] || {}).selector;
    if (!selector) return;
    if (typeof window.closeSpaceExplore === 'function') window.closeSpaceExplore();
    suspend();
    setTimeout(function () {
      var card = document.querySelector(selector);
      if (card) card.click();
      else toast('Лабораторийн хаалга олдсонгүй');
    }, 240);
  }

  function askAI() {
    var p = getSelectedPlanet();
    var lab = (p.labFocus && p.labFocus[0]) || 'physics';
    var link = D.LAB_LINKS[lab] || D.LAB_LINKS.physics;
    var question = p.en + ' (' + p.name + '): ' + link.question + ' Одоогийн симуляц: g=' + D.fmt(p.gravity, 2) + ' m/s², T=' + p.tempMean + '°C, P=' + D.pressureLabel(p.pressureAtm) + '.';
    var win = window.open('ai_assistant.html', '_blank');
    function done() { toast('Асуулт clipboard-д хуулагдлаа'); }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(question).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = question;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch (err) { toast('AI Assistant нээгдлээ. Асуултаа гараар бичнэ үү.'); }
    }
    if (!win) toast('Popup блоклогдлоо — AI Assistant-ийг гараар нээнэ үү');
  }

  /* ---------------------------------------------------------------- nav hook */
  function hookNav() {
    var nav = document.querySelector('#phone nav.nav, nav.nav');
    if (!nav) return;
    var buttons = nav.querySelectorAll('button');
    Array.prototype.forEach.call(buttons, function (btn) {
      var text = btn.textContent.trim().toLowerCase();
      if (text.indexOf('build') !== -1 && !btn.dataset.suHooked) {
        btn.dataset.suHooked = '1';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          openDeepSpace('sandbox');
        });
      }
    });
  }

  function openDeepSpace(mode) {
    if (!panel) return;
    if (typeof window.openSpaceExplore === 'function') window.openSpaceExplore('deepspace');
    else {
      var overlay = document.getElementById('spaceExploreOverlay');
      if (overlay) overlay.classList.add('open');
      var btn = document.querySelector('[data-se-target="deepspace"]');
      if (btn) btn.click();
    }
    requestAnimationFrame(function () {
      if (selectedKey !== arrivedKey) {
        selectedKey = arrivedKey;
        if (solar) solar.select(arrivedKey, true);
      }
      if (mode === 'sandbox') {
        ensureSandbox(arrivedKey);
        setMode('sandbox');
      } else {
        setMode(mode || 'solar');
      }
    });
  }

  /* -------------------------------------------------------------------- init */
  function init() {
    injectStyles();
    var overlay = document.getElementById('spaceExploreOverlay');
    if (!overlay) return;
    injectPanel();
    injectBranch();
    hookNav();
    renderSolarPanel();
    renderSurfacePanel();
    renderEduPanel();
    updateHud(true);
    window.addEventListener('resize', function () { setTimeout(resizeActive, 120); });
  }

  // Deferred scripts run at readyState "interactive" but BEFORE DOMContentLoaded.
  // Wait for DOMContentLoaded so the original Space Explore initializer binds its
  // own branch buttons first; then our injected branch is not double-bound.
  if (document.readyState === 'loading' || document.readyState === 'interactive') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  SU.app = {
    open: openDeepSpace,
    setMode: setMode,
    land: land,
    landOn: function (key) {
      ensureRenderer();
      selectedKey = key;
      arrivedKey = key;
      ensureSurface(key);
      setMode('surface');
      refreshPlanetUi();
    },
    selectPlanet: function (key) {
      selectedKey = key;
      arrivedKey = key;
      refreshPlanetUi();
    },
    projectSandboxCell: function (col, row) { return sandbox ? sandbox.projectCell(col, row) : null; },
    getSurface: function () { return surface; },
    getResearch: function () { return research; },
    getMode: function () { return activeMode; },
    getSelected: function () { return selectedKey; },
    getArrived: function () { return arrivedKey; },
    getDiagnostics: function () {
      var scene = activeCtl ? activeCtl.getScene() : null;
      var gl = renderer ? renderer.getContext() : null;
      return {
        mode: activeMode,
        selected: selectedKey,
        arrived: arrivedKey,
        surfacePlanet: surfacePlanetKey,
        sandboxPlanet: sandboxPlanetKey,
        canvas: canvas ? { w: canvas.clientWidth, h: canvas.clientHeight, pw: canvas.width, ph: canvas.height } : null,
        renderer: renderer ? {
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          contextLost: gl ? gl.isContextLost() : null
        } : null,
        sceneChildren: scene ? scene.children.length : 0,
        ship: solar ? solar.getShipPosition() : null,
        sandboxTool: sandbox ? sandbox.getSelectedTool() : null,
        sandboxAlloy: sandbox ? sandbox.getState().alloy : null,
        sandboxGrid: sandbox ? sandbox.getState().grid : null,
        surface: surface ? surface.getReadout() : null,
        targets: surface ? surface.getTargets().map(function (t) { return { id: t.id, name: t.name, type: t.type, scanned: t.scanned, x: t.x, z: t.z }; }) : []
      };
    }
  };
})();
