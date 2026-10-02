# Verification — October 2, 2026

## Completed locally

- Production build and TypeScript checking passed.
- Lint passed; dependency audit reported zero vulnerabilities.
- 12 Vitest tests passed: scoring, erased polish, rewards, availability, gallery capacity, history, validation, IndexedDB round-trip/recovery, and missing-audio fallback.
- 45 Playwright checks passed across Chromium, Firefox, and WebKit. These cover play sessions, rewards, PNG downloads, galleries, reloads, cancelled strokes, secondary-pointer rejection, decoration selection/resizing, remembered supplies, storage failures, recovery, 320/390/768/1024-pixel layouts, iframe loading, and production asset loading under `/NailSalonGame/`. Artwork checks verify every nail shape fits its finger, artwork does not stretch with touch targets, stickers retain their proportions during rotation, the enlarged finger tapers toward its tip, and every fingertip is reachable on short desktop, tablet, and phone screens.
- Production tests observed no page errors or third-party requests.
- Screenshots were inspected for desktop, tablet portrait, and phone layouts. Outputs are under ignored `test-results/visual/` and can be recreated with `node e2e/visual.mjs` while the development server runs at port 4173.
- A desktop Chromium painting sample at 1024×768 and device scale factor 2 averaged 60 fps over 120 frames, with zero frames slower than 33.3 ms. Recreate with `node e2e/performance.mjs`. This is desktop emulation, not an iPad hardware benchmark.

Firefox's standard Windows AppData cache path failed to launch with a side-by-side assembly error. Tests used an unmodified official Playwright Firefox archive extracted to `.npm-cache/firefox-portable`, selected through `NAIL_FIREFOX_EXECUTABLE`. CI uses the standard Linux installation. Firefox also requires an unsandboxed local browser-test run to create pages in this Windows environment. No engine tests were skipped.

## Pending release checkpoints

- Native Safari on the daughter's actual iPad Mini: painting, interrupted input, orientation changes, saves, PNG export, audio, and sustained frame rate.
- Daughter independently finishes one customer manicure and saves a free-play design.
- Create/connect the GitHub remote repository, enable Pages with GitHub Actions, run CI, and verify the published URL. The repository contains a complete deployment workflow but has not been pushed or published.
