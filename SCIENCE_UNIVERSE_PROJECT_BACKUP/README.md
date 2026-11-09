# SCIENCE UNIVERSE — FRONTIER
### Standalone First-Person 3D Open-World Planetary Survival Game (Phase 1)

**SCIENCE UNIVERSE — FRONTIER** is a standalone, browser-based, first-person open-world planetary survival and exploration game inspired by *Subnautica*, *Raft*, *Rust*, and *Minecraft*, set within a scientifically grounded planetary environment (Mars).

---

## 🚀 Quick Start

### 1. Requirements
- Node.js (v18+ recommended, tested on v24)
- Modern WebGL2 browser (Chrome, Edge, Firefox, Safari)

### 2. Start Development Server
```bash
cd "C:\Users\Administrator\Desktop\SCIENCE_UNIVERSE_GAME"
npm install
npm run dev
```
Open your browser at:
`http://localhost:5173/`

### 3. Production Build
```bash
npm run build
npm run preview
```

### 4. Run Automated Browser Test Suite
```bash
node tests/verify_phase1.js
```

---

## 🎮 Controls

### Desktop Controls
| Input | Action |
|---|---|
| **W, A, S, D** | Walk Forward / Left / Backward / Right |
| **Shift** | Sprint |
| **Space** | Jump |
| **C / Ctrl** | Crouch |
| **Mouse Look** | Rotate Camera View |
| **Left Mouse Button (Hold)** | Mine / Fire Tool (Laser, Hammer strike) |
| **1 – 8 / Mouse Wheel** | Select Hotbar Active Tool |
| **F** | Toggle Helmet Flashlight |
| **I / Tab** | Toggle Astronaut Equipment & Inventory |
| **F5** | Quick-Save Game State |
| **F9** | Quick-Load Game State |
| **Esc** | Pause Menu / System Settings |

### Mobile Touch Controls
- **Virtual Thumbstick (Bottom-Left):** Analog movement.
- **Touch Look Zone (Right Screen):** Drag to look around.
- **MINE Button:** Primary action / laser firing.
- **JUMP / RUN / LIGHT / INV Buttons:** Quick touch actions.

---

## 🛠️ Implemented Systems (Phase 1)

1. **Procedural Mars World:** Multi-octave deterministic Simplex terrain, chunk streaming (7x7 chunks, 448m wide explorable zone), craters, mountain ridges, and rolling regolith sand dunes.
2. **Atmosphere & Sky:** Day/night Sol cycle, blue-tinted Martian sunset, stars, Phobos & Deimos moons, dynamic dust particles.
3. **First-Person Controller:** Smooth locomotion, view bobbing, terrain collision, helmet flashlight.
4. **First-Person Hands & Tools:** Realistic astronaut hands rig (`SU_Suit_FirstPerson_Hands.glb`) holding interactive 3D tools (`SU_Mining_Laser_MK1.glb`, `SU_Rock_Hammer.glb`, `SU_Geological_Scanner.glb`, `SU_Sample_Collector.glb`, `SU_Thermal_Drill.glb`, `SU_Construction_Tool.glb`).
5. **Geological Harvesting:** 80+ mineral nodes (Hematite, Quartz, Copper Ore, Ice Water, Sulfur, Basalt, Granite, Meteorite) with raycasting, hardness mechanics, laser beam and hammer strike animations, spark particles, and inventory drops.
6. **Survival Telemetry:** Oxygen (O₂), Suit Battery / Power, Health Integrity, Ambient & Internal Temperature, Hydration, Food.
7. **Inventory & Hotbar:** 8-slot quick-access hotbar, 24-slot backpack cargo, item stacking, scientific metadata cards.
8. **Save & Load:** State persistence via LocalStorage (XYZ coordinates, orientation, inventory, survival stats, Sol time, depleted nodes).
9. **Procedural Audio Engine:** Real-time synthesized sound effects via Web Audio API (zero audio file dependencies).

---

## 📜 Documentation

- [`PHASE1_IMPLEMENTATION_REPORT.md`](./PHASE1_IMPLEMENTATION_REPORT.md) — Comprehensive technical architecture, verified gameplay metrics, and test sign-off.
- [`ASSET_INTEGRATION_REPORT.md`](./ASSET_INTEGRATION_REPORT.md) — 152 GLB model audit, source pack breakdown, and metadata integration.
- [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) — Technical observations, hardware notes, and Phase 2 roadmap.
