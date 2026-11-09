# Deep Space / Explore developer test access

## Status
Implemented and browser-verified. No game development beyond test access was performed.

## A. Source of truth, routes and unlock guards

- Live entry: root `index.html` (54,118,138 bytes). Its router is inline. `www/index.html` and `android/app/src/main/assets/public/index.html` have the same SHA-256 as the root entry after this work: `aed07f82acdf3fa581c7f074ef31db6c713d96201f57a690bce7700e61aead38`.
- `sections/su-router.js` and `sections/su-sandbox.js` are integration inputs, NOT scripts directly loaded by the current entry. The source router is older than the live inline router. `tools/build_integration.mjs` embeds them and rewrites index.html plus other generated assets. It was deliberately NOT run.
- Existing `npm run build` still invokes that historical generator. Do not use it to launch developer access or regenerate recent fixes casually. This implementation does not need an integration build or Capacitor sync.
- `capacitor.config.json` uses `www`; `tools/sync_web.mjs` copies root production assets there; Capacitor copies them into Android assets.
- Normal routes: existing `SU.open('explore')` / `window.suOpen('explore')`, section-bar buttons and `#explore` history routing. Home is `SU.open('home')`; Build is `SU.open('build')`. A hash alone never unlocks a section.
- Actual game launch: `index.html:21993` `suMountExplore` -> sandbox -> `sections/explore/explore-ui.mjs` -> `ctx.bind(sb.ctx)` -> `sections/explore/src/main.js:startExplore()`.

Exact live guards (index.html is unchanged, so line numbers remain stable):

| Location | Behavior |
| --- | --- |
| `index.html:1777–1858` | `SPACE_COST=120`, `getSpendableCredits`, `getLifetimeCredits`, `ensureAutoUnlockAtThreshold`, `updateSpace`. Lifetime threshold can permanently unlock all three sections without deduction. |
| `index.html:1939–1963` | Existing earned-credit accounting: positive awards increase spendable and lifetime totals; negative changes do not reduce lifetime. |
| `index.html:21744–21778` | `SECTION_INFO`: Space Lab, Explore and Classic each have cost 120. |
| `index.html:21802` | `isSectionUnlocked`: persistent key, then `rf_users` account field or `unlockedSections[section]`; Space Lab also accepts the legacy unlocked card state. |
| `index.html:21827` | `setSectionUnlocked`: writes persistent flag and account unlock fields. Developer access never calls it. |
| `index.html:21869–21950` | `showUnlockModal`: current DOM balance; pay button only at >=120; balance rechecked; `addCredits(-120)` then persistent unlock. |
| `index.html:22020–22025` | `suOpen` authorization gate for all three locked sections. Only this gate receives a narrow, in-memory development compilation change for a private Explore-only capability. |
| `index.html:22101–22109` | Section-bar precheck; unchanged. |
| `index.html:22150–22159` | Classic `openSpaceExplore` wrapper checks unlock unless internally authorized; unchanged. |
| `index.html:22181–22192` | Space Lab card capture handler checks unlock; unchanged. |
| `index.html:22221–22229` | Initial hash entry refuses locked sections; unchanged. Popstate also calls `suOpen`. |
| `index.html:22920–22921` | MAIN LAB Space Lab action checks `SU.isSectionUnlocked`; unchanged. |

Persistence: `rf_users`, `rf_session` (auth stores its value as JSON), `rf_guest_credits`, `rf_guest_lifetime_credits`, and section keys `rf_spacelab_unlocked`, `rf_explore_unlocked`, `rf_classic_space_unlocked`. Account fields: `credits`, `lifetimeCredits`, `spaceUnlocked`, `exploreUnlocked`, `classicSpaceUnlocked`, `unlockedSections`.

No pre-existing isolated test-account mechanism was found. The older terrain test directly sets an unlock flag in its disposable browser profile; that is not reused as developer access.

## B. Files changed

Modified:
- `package.json`: three launch/test scripts only.
- `tools/sync_web.mjs`: reject marked development assets before any copying, including stale www output.
- `android/app/build.gradle`: reject development-marked assets; attached to preBuild and asset-merge tasks for ALL variants, including release and debug.

Added:
- `tools/developer-access.mjs`: Node-only compile/serve tool and namespaced storage module generation.
- `tests/developer-access.mjs`: disposable-profile Chromium integration tests.
- `DEVELOPER_TEST_ACCESS.md`: this report.

Evidence: `developer-access-tests.log`, `developer-access-gameplay.png`, `developer-access-android-guard.log`, `developer-access-android-rejection.log`, `developer-access-release-task-graph.log`, `developer-access-sync-rejection.log`.

Checkpoint: `checkpoints/developer-access-before/` contains original package.json, sync_web.mjs, build.gradle, index.html and unchanged-source hash manifest. No Git repository exists at the supplied root.

No edits to index.html, router sources, Explore game sources, authentication, MAIN LAB HTML/CSS, mobile bridge, Android orientation or WebGL fixes. No duplicate HTML entry and no generated replacement game.

## C. Launch

From PowerShell:

```powershell
Set-Location 'C:\Users\Administrator\Desktop\shine negtgel'
npm run dev:test-access
```

Open **http://127.0.0.1:8137/**. Sign in normally and enter MAIN LAB. Open the existing **Profile** panel, scroll to its bottom, expand **Developer tools (DEV only)**, and click **Test Deep Space / Explore — isolated saves**. Profile closes and the existing router opens Explore. Use existing Home navigation to return, then reopen Profile to resume through the same compact entry. There is no floating developer button. Developer controls are hidden outside Home, including throughout gameplay.

Stop with Ctrl+C. No server remains running from validation.

Production preview (no bypass):

```powershell
npm run preview:production
# http://127.0.0.1:8138/
```

A different local origin has separate browser accounts/storage; an account on a different port is not automatically signed in here. No owner browser profile or account was accessed by automated tests.

The explicit Node **--development** flag compiles the index response and all Explore modules once, before the server starts listening. It does not emit an HTML file or alter the entry on disk. Requests, URL parameters, hashes, localStorage and browser global options cannot enable that compilation in production. Both launchers bind only to loopback.

## D. Isolation and production exclusion

- The development button passes a closure-private Symbol to existing `suOpen`. Only Explore accepts it; ordinary unlock checks and normal entry paths remain unchanged, even in development. The compact control is appended in normal flow after existing Profile home-screen content; no MAIN LAB control is moved or restyled. Route-state changes hide it immediately outside Home, and launching closes Profile.
- It does not call `addCredits` or `setSectionUnlocked`, change balances, mark account achievements, or persist an unlock.
- All Explore localStorage references, including `globalThis.localStorage` defaults, are compiled to per-module namespaced bindings. Global Storage/window/auth are not monkey-patched.
- Every Explore key is prefixed with **`__su_developer_explore_v1__:`**: save slots, active slot, backups, legacy migrations, terrain edits, depleted resources, tutorial, journal and academy/engine progression. Old normal saves cannot be read or migrated into the test session. These bindings apply for the entire development game lifetime, including autosave/re-entry/reload.
- Authentication and other labs retain their original storage. Explicit normal interactions elsewhere can still perform normal progression; the developer button does not turn those interactions into a sandbox.
- The Node compiler lives under tools, outside the synced app folders. Production responses are unmodified; `/__su_dev_storage__.js` and compiler requests return 404 in production preview. No runtime switch is included in production index or modules.
- Android refuses marked dev content rather than packaging it, even if manually copied into public assets. The normal APK assets were scanned and contain no marker. Both existing debug and release workflows remain production-only; this feature intentionally provides browser development access, not an Android test bypass.

Optional reset: in the development origin's browser console, remove ONLY prefixed test data (never clear all localStorage):

```js
for (const k of Object.keys(localStorage)) {
  if (k.startsWith('__su_developer_explore_v1__:')) localStorage.removeItem(k);
}
```

## E. Actual verification

`npm run test:developer-access` passed in disposable headless Chromium with software WebGL:
- No test button available before normal authentication/lab entry.
- Zero-credit account enters the actual Explore game via the developer button; real measured terrain and renderer initialize. Screenshot saved.
- Account remains logically locked. All normal localStorage entries are byte-for-byte unchanged after test entry, actual save/load, journal/academy writes and terrain persistence (comparison ignores only namespaced keys and sorts key order).
- Normal slot and legacy saves ignored. Actual position save/load round trip succeeds; active test slot and saved game survive full page reload.
- Journal, academy and terrain writes explicitly verified under test prefix.
- Home return, Build mount, Explore suspend/resume, and reload work; Space Lab remains locked in development.
- Production at 119 credits refuses Explore; no payment button, no charge or unlock. Spoofed localStorage/API options and URL query/hash do not enable access.
- Production 120 lifetime-credit auto-unlock works on existing account refresh, deducting nothing.
- Existing paid fallback was also exercised: synthetic account at 150 credits explicitly confirms payment, real account balance becomes 30, lifetime remains 150, and production gameplay loads.
- No uncaught browser exceptions or console.error calls in tested navigation.
- Root, www and Android index hashes match; root index/router/ctx hash checkpoint passes.

Additional actual checks:
- Gradle `:app:rejectDeveloperTestAssets` succeeds with clean assets.
- Deliberate marked Android fixture causes that task to fail with the expected rejection; fixture removed and clean task rerun successfully.
- Release task dry-run includes rejection before preBuild/mergeReleaseAssets. This is task-graph validation, NOT a built APK.
- Deliberate marked www fixture causes sync to reject before copying; fixture removed.

**Existing issue observed, not changed:** a newly seeded 120-credit account's initial page load has not yet unlocked sections when the router starts. Calling the existing account refresh (`suAuth.updateCurrentUser({})`) performs the correct auto-unlock. This is an existing initialization-order issue, not fixed by test access.

**Not verified:** full release/debug APK assembly or device gameplay for this change, native orientation lifecycle, exhaustive interactions in all labs, human input/performance testing, every autosave/backup/tutorial/resource-depletion scenario. Android configuration/mobile fixes and lab implementations were not edited. Automated storage isolation covers current storage access forms; future new persistence APIs in Explore should extend this compiler and tests. The existing offline/demo authentication remains unchanged and is not hardened by this work.

## UI cleanup verification

See `DEVELOPER_UI_CLEANUP.md` and `developer-ui-tests.log` for the subsequent UI-only cleanup, responsive screenshots, exact changed files and its separate reversible checkpoint. The original access/production safeguards remain unchanged.

## F. Rollback

Stop the development server first. Restore ONLY the three modified files from the checkpoint:

```powershell
Copy-Item checkpoints/developer-access-before/package.json package.json -Force
Copy-Item checkpoints/developer-access-before/sync_web.mjs tools/sync_web.mjs -Force
Copy-Item checkpoints/developer-access-before/build.gradle android/app/build.gradle -Force
Remove-Item tools/developer-access.mjs, tests/developer-access.mjs
```

The original index was never changed; do not restore it unnecessarily. No integration rebuild, Capacitor sync, account migration or credit correction is needed. Test saves can be removed separately with the prefix-only reset above, or left dormant. Keep checkpoint and evidence until satisfied; documentation/logs/screenshot can then be deleted independently.
