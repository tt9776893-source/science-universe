# SCIENCE UNIVERSE — FRONTIER
## INVENTORY ITEM & TOOL COMPREHENSIVE REFERENCE (V3)

### 1. Clarified Ambiguous Items
In previous iterations, certain hotbar and inventory icons caused ambiguity:
- **🫁 Icon Clarified:** Formally mapped to `o2_canister` (**Pressurized O₂ Life Support Tank / Хүчилтөрөгчийн баллон**). It is a life-support consumable that immediately restores $+40\%$ suit oxygen reserve.
- **🌈 Icon Clarified:** Formally mapped to `tool_multispectral_scanner` (**Multispectral Infrared Scanner / Олон зурваст хэт улаан сканнер**). Used to detect invisible geological chemical signatures and ore vein concentrations.
- **📶 Icon Clarified:** Formally mapped to `tool_gpr_radar` (**Subsurface GPR Pulse Radar / Гүний үелзүүрт радарын төхөөрөмж**). Emits ground-penetrating radar pulses into the terrain up to $25\text{m}$ deep to display subsurface ice lenses and mineral deposits.

All ambiguous OS-rendered emoji symbols across the UI have been replaced with dedicated, vector SVG icons with high-contrast sci-fi styling.

---

### 2. The 12 Interactive Planetary Field Tools

| Hotbar # | Tool ID | English Name | Mongolian Name | Primary Gameplay Function | Usage Instructions |
|---|---|---|---|---|---|
| **1** | `tool_mining_laser` | Mining Laser MK-1 | Лазер өрөмдөгч MK-1 | High-precision plasma excavation and ore fracture | Hold **[LMB]** on ground or mineral boulders to deform terrain and extract raw minerals. |
| **2** | `tool_rock_hammer` | Geological Pick Hammer | Геологийн алх | Mechanical percussion strike for chipping mineral samples | Click **[LMB]** on rock formations to chip off specimens without deforming bedrock. |
| **3** | `tool_thermal_drill` | Thermal Core Drill | Дулааны өрөм | Heavy rotary core drilling for deep vertical shafts | Aim at terrain and hold **[LMB]** to bore cylindrical holes and tunnels through dense basalt. |
| **4** | `tool_terrain_manipulator`| Gravimetric Manipulator | Хөрс хэлбэржүүлэгч | Volumetric sculpting (carving holes or creating ramps) | **[LMB]** carves volume; **[RMB]** extrudes terrain mounds and ramps. |
| **5** | `tool_sample_collector` | Cryo Sample Vacuum | Дээж цуглуулагч | Suction collection of loose fragments into cryo canisters | Aim at loose mineral drops and hold **[LMB]** to draw them into backpack storage. |
| **6** | `tool_scanner` | Geological Surface Scanner | Геологийн сканнер | Identifies surface mineral composition and Mohs hardness | Aim at boulders or surface terrain and hold **[LMB]** to inspect composition. |
| **7** | `tool_multispectral_scanner`| Multispectral IR Scanner | Олон зурваст сканнер | Infrared detection of hidden chemical signatures | Hold **[LMB]** to cast a wide multispectral infrared detection cone. |
| **8** | `tool_gpr_radar` | Subsurface GPR Pulse Radar | Гүний үелзүүрт радар | Ground-penetrating radar for underground cavities and ice | Point downwards and hold **[LMB]** to scan deep subsurface strata down to $-25\text{m}$. |
| **9** | `tool_construction` | Modular Base Fabricator | Модуль байгуулагч | Holographic placement of base foundations, airlocks, habs | Select building module, rotate with **[R]**, click **[LMB]** to snap and construct. |
| **10**| `tool_welding_tool` | Plasma Arc Welder | Плазм гагнуурын багаж | Structural repairs and airtight seal reinforcement | Aim at damaged base modules or rover chassis and hold **[LMB]** to repair integrity. |
| **Inv**| `tool_repair_tool` | Multi-Tool Spanner | Засварын багаж | Mechanical maintenance and torque calibration | Equip from inventory to calibrate machinery and base generators. |
| **Inv**| `tool_portable_analyzer` | Portable Field Mass-Spec | Зөөврийн анализатор | Field isotope ratio and chemical stoichiometry analysis | Use on collected inventory samples to reveal isotope purity. |

---

### 3. Geological Resources & Material Catalog

| Item ID | English Name | Mongolian Name | Mohs Hardness | Extraction Depth | Processing Method | Practical Colony Utility |
|---|---|---|---|---|---|---|
| `regolith` | Martian Regolith Dust | Ангарагийн хөрс (Реголит) | 2.5 | Surface ($0 \to -1.2\text{m}$) | Sintering / 3D printing | Foundation mortar, regolith radiation shielding |
| `sedimentary_rock`| Sedimentary Strata | Тунамал чулуулаг | 3.5 | Subsurface ($-1.2 \to -5\text{m}$) | Mechanical crushing | Base wall panel fabrication, structural concrete |
| `ice_chunk` | Subsurface Water Ice | Гүний мөс ($H_2O$) | 2.0 | Deep ($-2.5 \to -8\text{m}$) | Bioreactor thermal melting | Potable drinking water, oxygen generation via electrolysis |
| `iron_ore` | Hematite Iron Ore | Гематит ($Fe_2O_3$) | 5.5 | Veins ($-3 \to -12\text{m}$) | Smelting / reduction | Structural steel, rover reinforcement plates, tools |
| `copper_ore` | Chalcopyrite Copper Ore | Зэсийн хүдэр ($Cu$) | 4.0 | Veins ($-6 \to -15\text{m}$) | Chemical leaching | Electrical wiring, circuitry, solar array coils |
| `sulfur` | Elemental Volcanic Sulfur | Хүхэр ($S$) | 2.0 | Deposits ($-4 \to -14\text{m}$) | Thermal distillation | Lithium-Sulfur solid-state batteries, propellant |
| `quartz_crystal`| Hydrothermal Crystalline Quartz | Цэвэр кварц ($SiO_2$) | 7.0 | Veins ($-7 \to -18\text{m}$) | Precision cutting | Optical laser prisms, photovoltaic solar glass, sensors |
| `basalt` | Volcanic Basalt Bedrock | Базальт суурь чулуулаг | 6.0 | Deep ($-8 \to -35\text{m}$) | Rotary diamond drilling | Heavy structural foundations, radiation vaults |

---

### 4. Consumable Life Support Supplies

| Item ID | English Name | Mongolian Name | Consumption Effect | Usage Method |
|---|---|---|---|---|
| `o2_canister` | Pressurized O₂ Life Support Tank | Хүчилтөрөгчийн баллон | Instantly replenishes $+40\%$ suit oxygen reserve | Open Inventory (`[I]`), select `o2_canister`, click **[Use Item]** |
| `battery_pack` | Li-S Solid-State Battery Pack | Цэнэг хураагуур (Li-S) | Instantly restores $+50\%$ suit electrical battery power | Open Inventory (`[I]`), select `battery_pack`, click **[Use Item]** |
