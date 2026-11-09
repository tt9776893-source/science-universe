# SCIENCE UNIVERSE — FRONTIER
## UNDERGROUND GEOLOGY SYSTEM REPORT (V3)

### 1. Executive Summary
The Planetary Realism Update V3 introduces a scientifically grounded, multi-layered volumetric underground geology system to *Science Universe — Frontier*. Instead of a uniform soil volume, the Martian subsurface now consists of 8 distinct geological strata dynamically sampled in 3D space using deterministic simplex noise fields, authentic mineral depths, and depth-dependent resource yields.

---

### 2. Geological Strata & Depth Stratification

| Strata Layer | Depth Range | Typical Mohs Hardness | Dominant Mineral / Composition | Yield Item ID | Discovered Name (Mongolian / English) |
|---|---|---|---|---|---|
| **Surface Regolith** | $0.0\text{m} \to -1.2\text{m}$ | 2.5 | Fine basaltic dust, loose ferric silicates, perchlorates | `regolith` | Ангарагийн хөрс (Реголит) / Martian Regolith |
| **Sedimentary Strata** | $-1.2\text{m} \to -5.0\text{m}$ | 3.5 | Ancient lacustrine and deltaic mudstone / clay | `sedimentary_rock` | Тунамал чулуулаг / Sedimentary Strata |
| **Permafrost Ice Lenses** | $-2.5\text{m} \to -8.0\text{m}$ | 2.0 | Subsurface water ice mixed with regolith ($H_2O$) | `ice_chunk` | Гүний мөс ($H_2O$) / Subsurface Water Ice |
| **Hematite Ore Veins** | $-3.0\text{m} \to -12.0\text{m}$ | 5.5 | Crystalline hematite iron oxide ($Fe_2O_3$) | `iron_ore` | Гематит (Төмрийн исэл) / Hematite Ore |
| **Copper Sulfide Veins** | $-6.0\text{m} \to -15.0\text{m}$ | 4.0 | Chalcopyrite / native copper formations ($CuFeS_2$) | `copper_ore` | Зэсийн хүдэр / Copper Ore |
| **Volcanic Sulfur Deposits**| $-4.0\text{m} \to -14.0\text{m}$ | 2.0 | Elemental volcanic sulfur clusters ($S_8$) | `sulfur` | Хүхэр ($S$) / Elemental Sulfur |
| **Hydrothermal Quartz** | $-7.0\text{m} \to -18.0\text{m}$ | 7.0 | Hexagonal silicon dioxide crystals ($SiO_2$) | `quartz_crystal` | Цэвэр кварц / Crystalline Quartz |
| **Basaltic Bedrock** | $-8.0\text{m} \to -35.0\text{m}+$| 6.0 | Dense tholeiitic basalt, pyroxene, plagioclase | `basalt` | Базальт / Volcanic Basalt Bedrock |

---

### 3. Volumetric Density & Seeded 3D Noise Architecture
Underground geology is generated deterministically in `src/world/VolumetricTerrain.js`:
- **Surface Elevation:** Derived from layered multi-octave FBM (Fractional Brownian Motion) heightfields combined with crater perturbation functions replicating Jezero crater topography.
- **Volumetric Density Field ($SDF$):** Extracted on a $16 \times 16 \times 16$ voxel grid per chunk using Marching Cubes polygonization.
- **Ore Vein Distribution:** 3D Voronoi cellular noise seeded with coordinate hashes:
  $$\text{VeinWeight}(x, y, z) = \text{Simplex3D}(x \cdot 0.18, y \cdot 0.22, z \cdot 0.18) + 0.35 \cdot \text{Simplex3D}(x \cdot 0.45, y \cdot 0.55, z \cdot 0.45)$$
- **Natural Cavities & Lava Tubes:** Generated when 3D cave noise exceeds threshold:
  $$\text{CaveNoise}(x, y, z) = |\text{Simplex3D}(x \cdot 0.04, y \cdot 0.08, z \cdot 0.04)| < 0.12 \quad \text{for } y \in [-18, -4]$$

---

### 4. Triplanar Strata Shading & Vertex Coloration
Tunnel walls and excavated caves automatically display realistic geological banding:
- **Regolith Topcoat:** Ocher Martian terracotta (`#c86432`).
- **Sedimentary Layer:** Layered sedimentary clay (`#9c6246`).
- **Ice Veins:** Cyan-white glistening permafrost crystalline bands (`#b8f0ff`).
- **Hematite Deposits:** Deep dark ferric oxide crimson-black (`#5c221a`).
- **Basalt Bedrock:** Dense dark charcoal basalt (`#2b2d30`).

---

### 5. Automated Verification Results
Executing `tests/verify_v3_realism.js`:
- Sampled 5 distinct depths from $0.5\text{m}$ down to $15\text{m}$.
- Successfully triggered excavation of $3.2\text{m}$ radius sphere at $(X=5, Z=5)$ into Sedimentary Strata.
- Verified yields: `sedimentary_rock`, `ice_chunk`, and `iron_ore`.
- Persisted terrain alterations and verified that player can navigate inside carved trenches with collision meshes synchronized.
