# SCIENCE UNIVERSE — FRONTIER
## PLANETARY GRAPHICS OVERHAUL REPORT (V3)

### 1. Rendering Architecture & Visual Upgrades
Planetary Realism Update V3 upgrades the visual presentation across all environments:
1. **PBR Strata Shading:** Multi-layer procedural vertex coloration and triplanar material blending. Excavated surfaces display authentic color gradients from loose orange regolith through dark chocolate sedimentary mudstone to ice cyan and charcoal volcanic basalt.
2. **Analytical Density Normals:** Smooth Gouraud normal vector calculation based on the 3D density field gradient ($\nabla \rho = \left(\frac{\partial \rho}{\partial x}, \frac{\partial \rho}{\partial y}, \frac{\partial \rho}{\partial z}\right)$), eliminating all faceted geometric seams.
3. **Photometric Sunlight & Color Grading:**
   - ACESFilmic tone mapping with exposure adjusted to $1.10$.
   - Directional solar irradiance calibrated for $R \approx 1.52\text{ AU}$ ($590\text{ W/m}^2$ solar flux vs Earth's $1361\text{ W/m}^2$).
   - Directional shadow cascades (PCFSoftShadowMap) with resolutions scaling dynamically up to $2048 \times 2048$.

---

### 2. Graphics Presets Specification

| Preset Setting | Render Resolution / Pixel Ratio | Dynamic Shadows | Shadow Map Size | Volumetric Terrain Active Chunk Radius | Target Platform |
|---|---|---|---|---|---|
| **LOW** | $0.85\times$ | Disabled | N/A | $32.0\text{m}$ (2 chunks) | Integrated GPUs, low-power mobile devices |
| **MEDIUM** | $1.00\times$ | Enabled | $1024 \times 1024$ | $48.0\text{m}$ (3 chunks) | Mid-range laptops, standard desktop GPUs |
| **HIGH** (Default) | $1.25\times$ | Enabled (Soft PCF) | $2048 \times 2048$ | $64.0\text{m}$ (4 chunks) | Dedicated modern desktop gaming GPUs |
| **ULTRA** | $1.50\times$ (Native SSAA) | Enabled (High Res) | $2048 \times 2048$ | $80.0\text{m}$ (5 chunks) | High-end enthusiast workstations |

Presets are dynamically selectable in real time from the Pause Menu (`[ESC]` $\to$ Graphics Settings) without reloading the page.

---

### 3. Real-Time Visual Diagnostics
Available for in-engine validation and inspection:
- `[F3]` **Toggle Wireframe:** Toggles volumetric triangle wireframes on/off to inspect Marching Cubes tessellation density and verify manifold edge alignment.
- `[F4]` **Toggle Chunk Bounding Boxes:** Displays color-coded wireframe AABB bounding boxes around each active $16\text{m}$ terrain chunk for real-time memory and culling verification.
