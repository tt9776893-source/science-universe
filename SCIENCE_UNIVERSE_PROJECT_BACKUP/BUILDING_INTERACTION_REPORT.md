# SCIENCE UNIVERSE — FRONTIER
## ENTERABLE HABITAT & LABORATORY INTERACTION REPORT (V3)

### 1. Architectural Layout & Modules
The operational starter habitat is stationed at coordinates $(X=-16, Z=16)$ on Jezero crater surface:
1. **Foundation Platform (`SU_Base_Foundation.glb`):** Structural reinforced titanium pylons anchored into solid basaltic ground.
2. **Pressurized EVA Airlock Module (`SU_Base_Airlock.glb`):** Sealed decompression chamber equipped with animated outer hatch (`Pressure_Hatch_Outer`), locking wheel mechanism (`Locking_Wheel_Mechanism`), and status indicator LEDs.
3. **Internal Bulkhead Sliding Door (`SU_Base_Door_Sliding.glb`):** Automated hermetic twin-leaf sliding doors (`Sliding_Door_Leaf_Left` & `Sliding_Door_Leaf_Right`) retracting into bulkheads.
4. **Primary Research Habitat (`SU_Base_Hab_Research.glb`):** A $9.0\text{m}$ diameter cylindrical pressurized geodesic lab dome featuring soft warm interior scientific lighting ($2.2\text{ lux}$ cyan ceiling array), walkable floor, and four operational workstations.

---

### 2. Airlock State Machine & Pressurization Cycle

```
[EXTERIOR_CLOSED]
       │
       ▼ (Player presses [E])
[EXTERIOR_OPEN]  (Outer hatch swings -100°, wheel spins)
       │
       ▼ (Player enters airlock chamber and presses [E])
[PRESSURIZING]   (Hatch closes; Pressure ramps 0.6 kPa -> 101.3 kPa over 3.5s)
       │
       ▼ (101.3 kPa reached; Chime plays)
[INTERIOR_OPEN]  (Sliding doors open; Player walks into Hab)
       │
       ▼ (Player inside hab)
[HABITAT SAFE ZONE BUFFS ACTIVE]
```

#### Safe Zone Life Support Buffs:
- **Oxygen Refill:** Atmospheric scrubbers halt suit $O_2$ consumption and actively refill suit tanks ($+5.0\%/\text{sec}$) up to $100\%$.
- **Thermal Regulation:** Habitat climate control immediately warms astronaut to a comfortable $+21.0^\circ\text{C}$ (nullifying Martian frost damage).
- **Battery Recharging:** Base micro-fission reactor recharges suit batteries ($+2.5\%/\text{sec}$).

---

### 3. Interactive Laboratory Workstations (Pack 04)

| Workstation | 3D Asset Model | Mongolian Name | Scientific Functionality | Gameplay Input & Output |
|---|---|---|---|---|
| **Scientific Terminal** | `SU_Lab_Analysis_Computer.glb` | Шинжлэх ухааны анализын компьютер | Core data terminal for decoding planetary telemetry and cataloging mineral discoveries | Analyzes inventory ore samples; grants $+50\text{ SP}$ per newly discovered mineral type |
| **PIXL XRF Spectrometer** | `SU_Lab_Spectrometer.glb` | Спектрометрийн лабораторийн ширээ | Planetary Instrument for X-ray Lithochemistry; examines elemental crystal matrices | High-precision mineral analysis; unlocks advanced technological crafting blueprints |
| **Sample Cryo Locker** | `SU_Lab_Sample_Storage.glb` | Баазын дээж хадгалах шүүгээ | Temperature-regulated cryogenic containment for samples and backup expedition gear | 24-slot colony storage shared persistent cargo container |
| **MOXIE Bioreactor** | `SU_Lab_Bioreactor.glb` | Ус ба Хүчилтөрөгчийн электролиз | High-temperature electrolysis and catalytic water purification unit | Melts raw `ice_chunk` ($H_2O$), purifies potable water, and produces pressurized `o2_canister` |

---

### 4. Automated Verification Results
From test execution `tests/verify_v3_realism.js`:
- Approached exterior airlock: prompt `[E] Open Exterior Airlock Hatch` displayed.
- Opened hatch: status transitioned to `EXTERIOR_OPEN`.
- Entered chamber: initiated pressurization cycle ($0.6\text{ kPa} \to 101\text{ kPa}$).
- Bulkhead sliding doors opened: entered research lab dome (`isPlayerInside = true`).
- Verified life-support safe zone: suit oxygen replenished from $40\%$ toward $100\%$; temperature regulated to $+21^\circ\text{C}$.
- Verified spectrometer and computer: analyzed `ice_chunk` and `iron_ore`, unlocking 2 technologies and earning $+100\text{ SP}$.
- Verified electrolysis unit: melted ice chunk, refilled suit oxygen, and produced pressurized canisters.
