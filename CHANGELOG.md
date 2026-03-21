# Changelog

All notable changes to the **cocos-template** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] - 2026-03-21

### Summary

No new code changes merged this week. Three performance optimization pull requests ([#1](https://github.com/EVESIS111/cocos-template/pull/1), [#2](https://github.com/EVESIS111/cocos-template/pull/2)) and the previous changelog PR ([#3](https://github.com/EVESIS111/cocos-template/pull/3)) remain open and awaiting review.

**Recommended action:** Review and merge open PRs to ship performance improvements.

---

## [Unreleased] - 2026-03-14

### Summary

Two performance optimization pull requests are open targeting the game engine's per-frame update loop and UI rendering pipeline. Together, they reduce CPU overhead, garbage collection pressure, and redundant I/O calls across 11 files. No breaking changes are introduced.

- **PR #1** - Optimize performance bottlenecks ([#1](https://github.com/EVESIS111/cocos-template/pull/1))
- **PR #2** - Optimize codebase performance ([#2](https://github.com/EVESIS111/cocos-template/pull/2))

### Changed

#### Game Loop & Physics (Performance)

- **Bullet trajectory calculations are now cached at launch time.** Trigonometric values (`sin`/`cos`) are computed once when a bullet is fired instead of every frame, reducing per-frame CPU cost for active bullets. ([Bullet.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Collision detection order optimized for early exit.** Cheap boundary checks now run before expensive bounding-box intersection tests, so off-screen bullets are recycled faster without unnecessary collision math. ([Bullet.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Bullet pool retrieval changed from `shift()` to `pop()`.** This changes the pool from O(n) array re-indexing to O(1) retrieval, improving frame times when many bullets are active. ([Main.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Ball mask redraws now skip when position hasn't changed.** The `TheRectMask.drawRadius()` call in the main update loop is now conditional, avoiding unnecessary graphics redraws on static frames. ([Main.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

#### Object Allocation & GC Pressure

- **Tracking missile movement eliminates per-frame Vec2 allocations.** `TrackFollow` now reuses a cached `cc.Vec2` object and computes deltas with raw arithmetic instead of creating temporary vector objects each frame. ([TrackFollow.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Vortex movement reuses cached position objects.** `VortexFollow` now reads target position properties once per frame and writes to a reusable `cc.Vec2`, eliminating repeated `cc.v2()` constructor calls. ([VortexFollow.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Round-rect mask caches its Graphics component and Rect object.** `TheRectMask` avoids `getComponent()` lookups and `cc.rect()` allocations on every draw call by caching these references at initialization. ([TheRectMask.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

#### UI & Leaderboard Rendering

- **Leaderboard item components are cached at initialization.** Both `Rank.ts` (TypeScript client) and `launch.js` (WeChat subdomain) now cache `cc.find()` + `getComponent()` results for all rank list item children, eliminating repeated DOM-like tree traversals in `updateItem()` loops. ([Rank.ts](https://github.com/EVESIS111/cocos-template/pull/2), [launch.js](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Leaderboard update loop uses `for` instead of `forEach`.** The subdomain's `launch.js` switches to a traditional `for` loop for better performance in the WeChat mini-game runtime. ([launch.js](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **"No data" label component is cached.** The `none_data` label reference is stored at init time rather than looked up via `getComponent()` on each render pass. ([launch.js](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

#### WeChat Platform & Data Access

- **Video ad instance is reused for the default ad unit.** `wxcontrol.ts` now keeps the default `videoAd` instance alive and only creates new instances for custom video IDs, reducing WeChat API calls and ad initialization overhead. ([wxcontrol.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **SDK version is cached on first use.** `compareVersion()` in `launch.js` now calls `wx.getSystemInfoSync()` once and caches the result, avoiding repeated synchronous system info lookups. ([launch.js](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Local storage reads are deduplicated.** `Global.fetchData()` and `utils.fetchData()` now call `localStorage.getItem()` once per invocation instead of twice (once to check, once to read). ([Global.ts](https://github.com/EVESIS111/cocos-template/pull/2), [utils/index.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

- **Scene loader caches fetch result.** `Load.ts` now stores the `fetchData()` result in a local variable instead of calling it twice during initialization. ([Load.ts](https://github.com/EVESIS111/cocos-template/pull/2) - PR #2)

### Removed

- Cleaned up commented-out debug logging and dead code across multiple files (`launch.js`, `Main.ts`).

---

## [1.0.0] - 2025-01-21

### Added

- Initial release of the Cocos Creator WeChat Mini-Game template.
- Game client with bullet shooting mechanics, tracking missiles, and vortex effects.
- WeChat integration: login, ranking system, rewarded video ads, banner ads, and data sharing.
- UI components: custom round-rect mask, animated buttons, popup system.
- Leaderboard subdomain with friend rankings and score uploading.
- Utility modules for network requests, local storage, and platform helpers.

---

*Generated automatically on 2026-03-21 by Tembo daily changelog workflow.*
