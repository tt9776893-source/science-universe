# Developer test UI cleanup

## A. Exact files changed

Modified:
- `tools/developer-access.mjs` — development-only UI creation, placement and route-aware visibility. The private access capability/authorization exception and all storage isolation code remain intact.
- `tests/developer-access.mjs` — responsive layout, real pointer interaction, active gameplay visibility and regression checks.
- `DEVELOPER_TEST_ACCESS.md` — corrected launch instructions and UI behavior.

Added:
- `DEVELOPER_UI_CLEANUP.md` — this report.
- Validation evidence: `developer-ui-tests.log`, `developer-ui-home-1440.png`, `developer-ui-home-390.png`, `developer-ui-profile-1440.png`, `developer-ui-profile-390.png`, `developer-ui-gameplay.png`.
- Reversible checkpoint: `checkpoints/developer-ui-before/` (original compiler and tests in tools/ and tests/, previous documentation/log/screenshot, and entry-point hashes).

No edits to root index.html, www/index.html, Android public index.html, game sources, terrain, graphics, storage implementation, authentication, original MAIN LAB design, Android build configuration, mobile bridge or production progression. The three entry-point hash checks pass unchanged. This is not an integration rebuild or a second application.

## B. Why the overlay appeared during gameplay

The previous development injection appended a button directly to document.body with position:fixed, bottom/right offsets and z-index:2147483647. Visibility depended only on the existing phone.in authenticated/lab-entry class. That class remains active when the section router enters Explore, so the large purple button stayed visible above gameplay.

## C. Before / after and launch

Before: large purple floating button on MAIN LAB and all signed-in sections, including gameplay.

After: a compact collapsed **Developer tools (DEV only)** section at the bottom of the existing Profile home screen, after its original content/close button. It uses normal flow, inherited button font/color and no fixed/absolute positioning or high z-index. Existing dashboard/showcase/buttons/styles/navigation are not moved or restyled. No existing MAIN LAB developer/debug panel was found; the game's own performance overlay is unrelated and was not changed.

Launch remains:

```powershell
Set-Location 'C:\Users\Administrator\Desktop\shine negtgel'
npm run dev:test-access
```

1. Open **http://127.0.0.1:8137/**.
2. Sign in normally and enter MAIN LAB.
3. Open the existing **Profile** panel.
4. Scroll to the bottom and expand **Developer tools (DEV only)**.
5. Click **Test Deep Space / Explore — isolated saves**.

Profile closes before routing to Explore. Visibility updates immediately when suState.current changes, and on section-bar updates and authentication-class changes. Both the panel and its button are hidden when not authenticated/in the lab, or when the active section is not Home. The disclosure also collapses when leaving Home. Returning Home restores availability in Profile, without adding anything to the dashboard itself.

Only Node-side --development compilation emits this UI. Production compilation returns the unchanged index, and production Android assets contain neither the UI nor the bypass marker. Existing production packaging rejection guards are unchanged.

## D. Actual tests

Executed successfully: `npm run test:developer-access` (full log: `developer-ui-tests.log`). Tests used a disposable headless Chromium profile, not the owner's profile.

- Production index byte-for-byte unchanged; no developer panel/button identifiers in production index.
- No development bypass marker in www or Android packaged source assets.
- No production storage/compiler route; runtime URL/query/storage/API options cannot enable test access.
- At 1440x900 and 390x844: MAIN LAB has no rendered developer control/overlay. Sampled dashboard geometry, font, text color, background color and positioning match production for #phone, .su-desk-dashboard-grid, .su-desk-center, main nav and .su-desk-bottom. This is a sampled layout comparison, not an exhaustive pixel-diff of an animated showcase.
- At both viewports: compact Profile section is statically positioned after existing Profile controls; button fits the section and remains <=60px tall. Disclosure is a real unobstructed pointer target. Screenshots inspected.
- Real pointer clicks open the disclosure and launch Explore through the preserved capability and section router.
- Profile closes and controls hide immediately at section entry. Actual Explore terrain/renderer load; real surface menu button is pointer-clicked and active, unpaused surface gameplay begins with no developer overlay. Full-page gameplay screenshot inspected.
- Normal account remains logically locked at zero credits while development access works.
- Actual save/load position round trip, separate slot selection, journal/academy/terrain persistence, re-entry and reload retain isolated test saves.
- All non-prefixed normal localStorage entries remain unchanged after development entry, active gameplay and tested persistence operations: profile/account, credits, achievements, unlocks, legacy saves and original slot selection.
- Returning Home restores collapsed Profile developer access; pointer-click re-entry works. Build still mounts with developer controls hidden; Space Lab remains locked.
- Production at 119 credits denies entry without charging/unlocking. Existing 120 lifetime-credit auto-unlock on account refresh deducts nothing. Existing paid confirmation on a synthetic 150-credit account deducts exactly 120 and preserves lifetime total. These are disposable test accounts; no owner credits were changed.
- Browser uncaught exceptions: none. console.error calls: none.
- `node --check` passes for the compiler and test script. Entry-point SHA-256 checkpoint passes for root, www and Android public index.html.

## E. Remaining limitations

- Browser testing used software WebGL; no new APK was assembled or tested on a physical Android device for this UI-only change. Android source assets were scanned; the existing packaging guards were not modified.
- Not an exhaustive test of every lab, viewport, save/backup/tutorial scenario or gameplay interaction. No planetary terrain or graphics changes were made.
- The previously observed production initialization-order behavior remains unchanged: a newly seeded 120-credit account auto-unlocks upon existing account refresh rather than at the first router startup.
- A running development server compiles once at process start. Restart it after this update; then reload the page. No rebuild or Capacitor sync is needed.

## Revert only this cleanup

Stop the development server. From the project root:

```powershell
Copy-Item checkpoints/developer-ui-before/tools/developer-access.mjs tools/developer-access.mjs -Force
Copy-Item checkpoints/developer-ui-before/tests/developer-access.mjs tests/developer-access.mjs -Force
Copy-Item checkpoints/developer-ui-before/DEVELOPER_TEST_ACCESS.md DEVELOPER_TEST_ACCESS.md -Force
```

This restores the previous floating UI while retaining developer access. Do not restore index.html or touch any browser/account/save data. Documentation and screenshot/log evidence may be removed independently.

Stopped after developer UI cleanup and verification.
