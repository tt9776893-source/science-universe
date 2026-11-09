REALITY FORGE — V9 CLEAN GLB

- Previous V7 cinematic layout/UI kept.
- Planet/Sun surfaces replaced with the supplied solar_system.glb models.
- Removed random meteoroid clutter from planetary orbital lanes.
- Jupiter's 95 visible moons are constrained around Jupiter (not scattered across the Solar System).
- Saturn ring uses thousands of small ice/rock particles.
- Fly / mission flow kept unchanged.

Run with VS Code Live Server (or another local web server) so assets/models/solar_system.glb can load correctly.

V10 updates:
- Neptune is loaded from assets/models/neptune.glb.
- Sun information panel completed; Sun flight is disabled.
- Information-panel sphere is now a live 3D preview of the selected object.
- Sun halo/corona visuals improved while keeping the V9 layout.
- Saturn_source.blend is preserved in source_models. Browsers cannot load .blend directly; the current runtime Saturn remains from solar_system.glb until that source is exported as GLB.

V11 changes:
- Sun uses assets/models/sun.glb.
- Neptune remains assets/models/neptune.glb.
- TON 618 uses assets/models/ton_618_black_hole.glb as a distant tilted, slowly moving background object outside all planet orbits.
- Removed the 91 extra tiny Jupiter moon markers; only Io, Europa, Ganymede and Callisto are shown for a cleaner view.
- Saturn keeps the imported realistic model/rings and shows only major moons with clean orbit guides.
- Removed the LIVE label; time-scale information remains.

V16 REALISTIC MOONS UPDATE
- Uses the uploaded moon.glb geometry as a base, but major moons now have distinct procedural surface materials.
- Earth: Moon
- Mars: Phobos, Deimos
- Jupiter: Io, Europa, Ganymede, Callisto
- Saturn: Enceladus, Mimas, Tethys, Rhea, Titan
- Uranus: Titania, Oberon
- Neptune: Triton
- Existing moon orbit lines, navigation, previews, Sun/Neptune/TON-618 behavior remain intact.

V17 MOON MODEL UPDATE
- Earth Moon: moon.glb (uploaded moon(2).glb)
- All other major moons: deterministic mix of moon_rock_a.glb, moon_rock_b.glb, moon_rock_c.glb
- Original GLB materials/textures are preserved for the rocky moon models.
- Existing orbit paths, planet UI, previews, navigation and TON-618 behavior remain unchanged.


V22 ROCKET FLOW FIX
- Removed the old hidden/placeholder rocket mission page from the active flow.
- Removed the old first/procedural rocket design from the active rocket system.
- Active rockets are the 3 supplied GLB files only: Vulcan Centaur, Electron, Gorilla Tag Rocket Ship.
- Solar System FLY now returns to rocket_hangar.html with the selected destination.
- Rocket selection is preserved in sessionStorage.
- Flow: Hangar -> launch -> slow thrust buildup -> acceleration -> gravity turn -> sonic boom -> atmosphere exit -> Earth orbit -> Solar System destination select -> Earth orbit resume -> transfer.


V23: Planet transfer now runs directly inside solar_system.html. No separate Earth-orbit page after launch. Solar-system overview -> rocket follow -> destination zoom -> destination orbit.

V25 CAMERA / TRACKER UPDATE
- EXIT FOLLOW = true free OrbitControls camera (rotate / zoom / pan), rocket keeps flying.
- FOLLOW ROCKET returns camera to the moving rocket.
- Rocket display scale reduced below Earth Moon display size.
- Off-screen/distant rocket tracker appears at screen edge; click it to follow rocket.
- Free camera remains free during transfer and after arrival; no forced camera lock.

V27 updates:
- Smooth delta-time transfer; removed stepped trajectory recalculation that caused visible stutter.
- SIDE VIEW and FOLLOW VIEW now support free-look around the rocket while continuing to follow it.
- Destination approach stops outside the planet/moon safe radius; rocket no longer flies through the body.
- Rocket slowly orbits the destination until LANDING is pressed.
- LANDING button starts a safe-radius descent.
- Off-screen rocket tracker is now a compact circular edge marker; hover reveals distance and click follows rocket.
\nV28 update: 5-35s distance-scaled transfer, close low orbits, same-scene landing, Earth landing returns Hangar, amber collision warning + WASD evasion, collision VFX, velocity-aligned rocket orientation, Side/Follow free-look retained.\n
V29 updates:
- Missions always enter Solar System at real Earth low orbit after Hangar launch.
- FLY automatically returns camera to FOLLOW ROCKET.
- Fixed false collision after landing/departing a planet: departure body is ignored until safe clearance.
- More responsive WASD steering; Shift enables precision steering.
- Cinematic Mission Failed card with Retry Mission and Return to Hangar.
- Retry restores the safe origin orbit; Return to Hangar resets back to Earth Hangar.

V30 SURFACE DIMENSION: Non-Earth LANDING opens surface_dimension.html with high-altitude descent, 360 camera, EXIT ROCKET walking, persistent landed rocket, ENTER ROCKET, and physical launch back to the same planet orbit. RETURN TO ORBIT button is not used.

V31 SURFACE SKY / WEATHER UPDATE
- Surface Dimension now renders a gameplay-scaled 3D Solar System sky (Sun + planets + stars).
- Moon/Mercury remain clear; Mars has changing dust haze; Venus/gas giants have much heavier cloud/haze that can hide space.
- Weather visibility changes smoothly rather than switching instantly.
- Removed the oversized yellow cone; rocket exhaust is now a compact particle plume under the rocket.
- Terrain and collision share the same deterministic height function; the rocket clamps to the real surface height and cannot sink below it during landing.
- Added a smaller ~1.75 m astronaut-scale player relative to the rocket and terrain.

V32 updates:
- Moon/satellite transfers protect the destination's parent planet collision corridor.
- Moon/satellite low orbit is tighter and closer to the visible surface.
- Space-flight rocket model is larger and easier to see.
- Surface rocket uses a more realistic large scale while exploration is first-person.
- EXIT ROCKET enters first-person WASD + mouse-look exploration; rocket remains at touchdown coordinates.
- Added a small driveable surface rover (ENTER ROVER / EXIT ROVER).
- Surface sky keeps visible Solar System bodies; moons show their parent planet prominently when atmosphere permits.
- Atmosphere/weather controls celestial visibility; airless moons remain clear.
- Terrain height clamps player, rover, and landed rocket above the surface.


V34 INTEGRATION:
- Hangar/initial Earth flight removed from this package.
- index.html enters solar_system.html directly in Earth orbit.
- External flight code can set sessionStorage rfRocketFile then navigate to solar_system.html.
- window.REALITY_FORGE exposes enterEarthOrbit() / enterOrbit(name) after module load.
- Surface launch: 10s vertical power phase + upper ascent; camera translation follows rocket 1:1, only micro vibration is added.
