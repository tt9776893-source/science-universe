# KNOWN ISSUES & TECHNICAL OBSERVATIONS — PHASE 1
**Project:** SCIENCE UNIVERSE — FRONTIER  
**Version:** 1.0.0-phase1  
**Date:** October 27, 2026

---

## 1. Browser & Platform Specific Observations

### 1.1 Development Server vs Live Server Compatibility (FIXED)
- **Root Cause of Infinite Loading:** When opened directly via VS Code Live Server (`http://127.0.0.1:5501/index.html`), native browser ES modules rejected bare specifiers (`import * as THREE from 'three'`), throwing `Failed to resolve module specifier "three"`, which prevented `main.js` from executing and left the loading screen hanging indefinitely. Additionally, static assets in Live Server were hosted under `/public/assets` rather than `/assets`.
- **Resolution Implemented:** 
  1. Added a browser `<script type="importmap">` in `index.html` mapping `"three"` and `"three/examples/jsm/loaders/GLTFLoader.js"` directly to `./node_modules/three/...`.
  2. Added dynamic asset base path detection in `AssetRegistry.js` (`/public/assets` under Live Server, `/assets` under Vite).
  3. Added a dedicated Error Boundary UI (`#loading-error-box`) and global uncaught error listeners in `src/main.js` to catch any issues and show clear diagnostics instead of an infinite hang.
  4. Both servers (`http://127.0.0.1:5501/index.html` and `http://localhost:7777/`) now load and play at 100% test pass with 0 errors.

### 1.2 Web Audio API User Interaction Requirement
- **Observation:** In modern Chromium, Edge, and Safari browsers, the `AudioContext` is created in a `suspended` state until the user performs their first user interaction (click or touch).
- **Resolution Implemented:** The game starts with a full-screen "EXPEDITION READY — DEPLOY TO MARS" prompt overlay. Clicking anywhere on this overlay initializes the Web Audio API context and requests pointer lock simultaneously, ensuring sound effects play seamlessly without warnings.

### 1.2 Pointer Lock on Multi-Monitor Setups
- **Observation:** Pressing `ESC` releases browser pointer lock by design.
- **Handling Implemented:** An event listener automatically detects `pointerlockchange` and displays the in-game Pause / Settings menu when pointer lock is released, allowing the player to resume by clicking "Resume Exploration".

### 1.3 Shadow Map Resolution on Low-End Integrated GPUs
- **Observation:** Cascaded shadow maps at 2048x2048 with soft shadows (PCFSoftShadowMap) run smoothly at 60 FPS on dedicated GPUs, but may incur a frame time penalty on entry-level mobile GPUs.
- **Planned for Phase 2/7:** Add an in-game graphic preset selector (Low: 1024x1024 hard shadows; Medium: 1024x1024 soft shadows; Ultra: 2048x2048 PCF soft shadows).

---

## 2. Gameplay & Simulation Observations

### 2.1 Slope Climbing Mechanics
- **Observation:** Currently, the player controller clamps height to the terrain surface. On extreme vertical slopes (>65° cliff walls), vertical translation occurs quickly if moving forward.
- **Planned for Phase 2:** Introduce a slope-angle dot-product check that initiates sliding downwards if the player attempts to climb a cliff steeper than 50 degrees without climbing equipment.

### 2.2 Tool Collision with Terrain
- **Observation:** First-person viewmodel tools are rendered in camera space without depth clipping against surrounding world geometry. This prevents weapons from clipping through terrain when looking straight down, but causes them to visually render over foreground rocks.
- **Planned for Phase 2:** Introduce a separate viewmodel render pass or depth-cleared layer for the first-person rig.

### 2.3 Resource Respawn Scheduling
- **Observation:** Currently, depleted resource nodes are recorded in `depletedNodeIds` and persist indefinitely in the current save.
- **Planned for Phase 2:** Implement planetary dust storm events that procedurally uncover new mineral deposits over multiple Sol day cycles.

---

## 3. Staged Assets for Subsequent Phases

The following asset packs are fully validated, copied to `public/assets/models/`, and ready for integration in upcoming phases:
- `buildings/` (20 GLBs) — Modular foundation, habs, airlocks, corridors (Phase 3).
- `industrial/` (16 GLBs) — Crusher, smelter, fabricator, conveyor (Phase 4).
- `laboratory/` (12 GLBs) — Centrifuge, mass spectrometer, incubator (Phase 4).
- `vehicles/` (12 GLBs) — Explorer rover, cargo rover, scout drone (Phase 5).
- `spacecraft/` (12 GLBs) — Cockpit, fuel tanks, thrusters, solar wings (Phase 6).
- `energy/` (12 GLBs) — Solar arrays, nuclear reactor, O₂ generators (Phase 6).
