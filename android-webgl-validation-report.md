# Samsung Android WebGL targeted repair

## Status
Confirmed Build-lab texture-binding defect repaired, built, installed in-place, and validated on the actual Samsung SM-S908N. **This is not a claim that the separate Chromium UnknownError is fixed or that every lab has passed.**

## Device / installed application
- ADB serial: R3CT10942RM; Android 16; Adreno (TM) 730.
- Real Capacitor WebView origin: https://localhost/.
- Chrome WebView: 156.0.8078.47; reported MAX_TEXTURE_SIZE: 8192.
- Package: com.scienceuniverse.app; updated using `adb install -r`, never uninstalled or cleared.
- Installed package SHA-256 was read directly with ADB and matches both local APKs:
  `7a5227ea86a7b6f0c55c1f09d12dfbb4c3e754a8a08b6bf2a51ed8c7f13f69c9`.

## Confirmed cause (before application source edits)
Opening Build on the phone produced the repeated rendering warning `there is no texture bound to the unit 0`.
A draw-time observer recorded the actual active `sampler2D uTex`, its value 0, the absent TEXTURE_2D binding, the linked shader sources, and these draw stacks:

- draw -> drawArticulatedRobots -> drawArmBeam -> drawElements.
- draw -> drawArticulatedRobots -> drawBox -> drawElements.

The shader keeps uTex active even when uUseTex is false. Explicit null bindings for nominally untextured robot/box draws left the active sampler incomplete. This was observed on the actual device, not inferred from desktop behavior or GLB dimensions.

The scene was not wholly blank: ADB compositor screenshots show the lab rendering. CDP WebView screenshots omitted the WebGL surface, so those screenshots alone are not valid evidence of a rendering failure. There was no observed app/driver crash in these runs.

Pre-repair evidence: `android-webgl-build.json`, `android-webgl-before-build.json`, `android-webgl-before-screen.png`.
Rollback archive, created before editing source: `android-webgl-repair-checkpoint-20261107.tar` (original entry HTMLs, native config/build file, and both original APK copies).

## Minimal application change
Source of truth: `index.html`, embedded `su-build-js` payload only.
- Line 20060: retain a neutralTexture handle.
- Lines 20163–20168: initialize one complete 1x1 white RGBA texture with LINEAR filters and CLAMP_TO_EDGE wrapping when initializing this GL context.
- Line 20469: articulated robots bind the neutral texture instead of null.
- Line 20771: drawBox uses tex || neutralTexture.
- Line 21043: each draw establishes texture unit 0 and imgTexture || neutralTexture before using the sampler.

The original shader, sampling condition, colors, GLB data, texture resolutions, camera defaults, physics, account/auth code, credits and unlock rules are unchanged. No console filtering, rejected-promise suppression, driver workarounds, dependency additions, or quality reductions were introduced.

Copied original HTML to `www/index.html`, then ran `npx cap sync android` and the existing native project build with project JDK 21:
`gradlew.bat assembleDebug --offline --no-daemon`.
Build succeeded in 17 seconds. See `android-webgl-repair-build.log`.

Verified all markup/scripts/styles outside the Build payload remain identical to the rollback source. Verified root source, www, Android-packaged HTML, and the HTML inside the new APK all have SHA-256:
`cd06bf595432a4b1eb0ee2159de8ed5a78949254ca85466b16879be3f4c98fe2`.

## Actual real-device validation
- Fresh app process after in-place APK update launched without the old startup ReferenceError.
- Authentic signed-in state was subsequently observed; no fabricated session or test account was inserted on the phone.
- Signed-in user-record SHA-256 matches the pre-install record exactly, including credits, achievements, unlocks and account progress. Spendable and lifetime credits remained 0.
- Signed-in reload restored MAIN LAB; Physics entry exercised its actual renderer.
- Multiple Build entry/exit/re-entry runs: no new WebGL warnings, missing unit-0 sampler bindings, rejected promises, or failed HTTP assets during the targeted Build runs.
- Selected the next correct component and ran actual assembly: completed count changed 9 -> 10 and robot status returned to ready. Disposed that test scene and restored only the exact pre-test Build assembly slot; re-entry confirmed the original 9-of-11 assembly. Account records were not replaced or cleared.
- Backgrounded with Android HOME, resumed the existing activity, rotated portrait -> landscape -> portrait, and confirmed continued rendering with no spontaneous context loss, new WebGL warning, or new promise rejection. Original device rotation setting `lock 0` restored.
- Context loss on Build exit is intentional: the existing sandbox explicitly calls WEBGL_lose_context during disposal. It is not evidence of a GPU failure.
- ADB screenshot `android-webgl-after-screen.png` confirms actual visible rendering after resume/rotation.
- Final check: signed in; original account record intact; 9 assembled parts; original lock state intact; diagnostic wrappers removed.

Real-device artifacts include `android-webgl-after-signed-in-build.json`, `android-webgl-after-assembly-animation.json`, `android-webgl-after-reentry.json`, `android-webgl-after-lifecycle.json`, and `android-webgl-after-meminfo.txt`.

## Desktop/browser checks (not Android hardware tests)
- Build payload syntax compilation and absence of explicit null texture binding: passed.
- `node tools/test_auth_system.mjs`: all 7 unit tests passed.
- `node tools/test_mobile_responsive.mjs`: passed against www, including authentic disposable-browser registration/login, Start, MAIN LAB, lab entry, logout, account switching, credit/progress preservation, persistent/session-only reload, invalid/unverified sessions, and responsive layouts.
- Same responsive/auth suite passed against Android-packaged web assets via SU_TEST_URL; see `android-webgl-packaged-browser-tests.log`.
- These browser suites use a disposable desktop browser profile, not the phone's account storage.

## Remaining / explicitly not validated
1. **Chromium promise UnknownError remains unresolved.** A real Runtime.exceptionThrown event after sign-in contains `UnknownError: If you see this error we have a bug. Please report this bug to chromium.` It has no JavaScript rejection stack (document line 0). It is separate from the confirmed Build sampler defect and occurred with the repaired APK installed.
   - A subsequent instrumented reload and MAIN LAB/Physics entry did not reproduce it.
   - Native createImageBitmap/image decode/media/audio promise observers and debugger pause-on-exception tracing did not identify a failing API in that run. Errors were not swallowed; wrappers were removed afterward.
   - `android-native-promise-trace.json` preserves this outcome. CDP Runtime/Log enabling replays buffered history: the old exception appears in the trace's events, but its current-run rejections/failures arrays are empty. Do not count that buffered event as a second reproduction.
   - No speculative promise, audio, image-loader or memory fix was applied.
2. Space and Explore are locked for the real account (0 credits). No credit edits, artificial unlocks or access bypass were used. Their large textures, terrain, memory budget and real-device gameplay remain unvalidated.
3. A pre-existing `THREE.MeshPhysicalMaterial: 'thickness' is not a property of this material` warning appeared on the MAIN LAB/Physics path; not modified. Touch-cancel intervention messages also appeared around input testing; these are not the sampler warning and were not hidden.
4. No controlled before/after GPU performance or peak-memory benchmark was completed. Sampled requestAnimationFrame rates varied substantially (roughly 44–60 Hz in signed-in post-repair runs, with other lab/preview activity present). They are scheduling samples, not measured GPU FPS, and do not establish a speedup or a regression caused by this patch. JS heap and app-process meminfo are not a complete GPU texture-memory measurement.
5. Full rocket completion/flight and every terrain/physics scenario were not retested. Existing partial assembly was preserved rather than reset to permit those tests.

## Deliverables / stop point
- `ScienceUniverse-debug.apk`
- `android/app/build/outputs/apk/debug/app-debug.apk`
- Same repaired APK already installed on the Samsung phone.
- New diagnostic-only scripts in the existing tools directory: `tools/android-webgl-diagnosis.mjs`, `tools/android-promise-trace.mjs`. They are not application web assets. Their GL/error observers are removed after each session; the assembly action restores only its exact snapshotted assembly slot.

Stopped after the targeted Android WebGL repair and validation. Further UnknownError or locked-lab work requires a separate confirmed reproduction; it is not silently marked complete here.
