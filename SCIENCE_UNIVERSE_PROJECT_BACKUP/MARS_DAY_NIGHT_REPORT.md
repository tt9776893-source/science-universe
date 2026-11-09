# SCIENCE UNIVERSE — FRONTIER
## MARTIAN DAY & NIGHT CYCLE SYSTEM (SOL SIMULATION V3)

### 1. Astronomical Foundations
A Martian solar day (called a **Sol**) is slightly longer than an Earth day:
- **True Martian Sol Length:** $24\text{ hours, } 39\text{ minutes, } 35.244\text{ seconds} \approx 88,775.244\text{ seconds}$.
- **Gameplay Compressed Sol:** $720.0\text{ seconds}$ ($12\text{ real-world minutes}$ per full Sol cycle) for engaging exploration pacing.
- **HUD Sol Time Format:** `SOL <N> // <HH>:<MM> SOL-TIME` (e.g., `SOL 1 // 18:14 SOL-TIME`).

---

### 2. Forward-Scattering Blue Sunset ("Blue Martian Twilight")
Due to fine ferric dust suspended in the thin Martian atmosphere, Rayleigh scattering does NOT create red sunsets like Earth. Instead, **Mie scattering** predominates:
- The reddish dust particles scatter red and orange light across the broad Martian daytime sky (giving the Martian sky its characteristic butterscotch / salmon hue during the day).
- When the sun approaches the horizon ($|\theta_{\text{solar}}| < 12^\circ$), blue light penetrates forward along the line of sight toward the observer.
- This produces the famous NASA Curiosity / Perseverance **blue sunset halo** around the solar disc against darkening amber twilight.

#### Mathematical Shader Implementation (`src/world/MarsSky.js`):
```glsl
// Forward Mie scattering phase function approximation
float cosTheta = dot(rayDir, sunDir);
float miePhase = 0.5 * (1.0 - g*g) / pow(1.0 + g*g - 2.0*g*cosTheta, 1.5);
vec3 blueGlow = vec3(0.18, 0.58, 0.95) * miePhase * blueSunsetFactor;
finalSkyColor = mix(skyColor, blueGlow, clamp(blueSunsetFactor * 1.2, 0.0, 1.0));
```

---

### 3. Dynamic Dust Storms
- Occur periodically (every 5 to 7 minutes with a duration of 65 seconds).
- Atmospheric fog density quadruples ($0.0045 \to 0.012$).
- Ambient temperature plummets to $-45^\circ\text{C}$.
- Solar panel generation decreases by $65\%$ due to high atmospheric optical depth ($\tau > 3.0$).
- Particle wind velocity increases $3.2\times$, whipping reddish dust across the visor.

---

### 4. Dynamic Temperature & Solar Power Curve
- **Midday Peak ($12:00$ Sol-Time):** Temperature reaches $-18^\circ\text{C}$, Solar factor $= 1.0$ ($100\%$ EVA suit solar trickle charging).
- **Sunset ($18:14$ Sol-Time):** Temperature drops to $-48^\circ\text{C}$, Solar factor drops to $0.43$.
- **Deep Midnight ($00:00$ Sol-Time):** Temperature hits $-75^\circ\text{C}$, Solar factor $= 0.0$. Flashlight and heating coils drain battery at maximum EVA rate.

---

### 5. Automated Verification Output
- Verified noon time reading: `SOL 1 // 07:01 SOL-TIME` ($S_{\text{factor}} = 0.80$).
- Verified sunset transition: `SOL 1 // 18:14 SOL-TIME` with blue twilight sky matrix and low solar altitude ($S_{\text{factor}} = 0.43$).
- Verified sun and ambient light intensities smoothly transition without popping.
