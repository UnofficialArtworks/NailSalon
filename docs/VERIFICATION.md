# Verification — October 2, 2026

## Completed locally

- Production build and TypeScript checking passed.
- Lint passed; dependency audit reported zero vulnerabilities.
- 34 Vitest tests passed (including occasions, preparation, photo studio and scrapbook): scoring, erased polish, rewards, availability, gallery capacity, history, validation, IndexedDB round-trip/recovery, and missing-audio fallback.
- 129 Playwright checks passed across Chromium, Firefox, and WebKit. These cover play sessions, rewards, PNG downloads, galleries, reloads, cancelled strokes, secondary-pointer rejection, decoration selection/resizing, remembered supplies, storage failures, recovery, 320/390/768/1024-pixel layouts, iframe loading, and production asset loading under `/NailSalonGame/`. Artwork checks verify every nail shape fits its finger, artwork does not stretch with touch targets, stickers retain their proportions during rotation, the enlarged finger tapers toward its tip, and every fingertip is reachable on short desktop, tablet, and phone screens.
- Production tests observed no page errors or third-party requests.
- Screenshots were inspected for desktop, tablet portrait, and phone layouts. Outputs are under ignored `test-results/visual/` and can be recreated with `node e2e/visual.mjs` while the development server runs at port 4173.
- A desktop Chromium painting sample at 1024×768 and device scale factor 2 averaged 60 fps over 120 frames, with zero frames slower than 33.3 ms. Recreate with `node e2e/performance.mjs`. This is desktop emulation, not an iPad hardware benchmark.

Firefox's standard Windows AppData cache path failed to launch with a side-by-side assembly error. Tests used an unmodified official Playwright Firefox archive extracted to `.npm-cache/firefox-portable`, selected through `NAIL_FIREFOX_EXECUTABLE`. CI uses the standard Linux installation. Firefox also requires an unsandboxed local browser-test run to create pages in this Windows environment. No engine tests were skipped.

## Pending release checkpoints

- Native Safari on the daughter's actual iPad Mini: painting, interrupted input, orientation changes, saves, PNG export, audio, and sustained frame rate.
- Daughter independently finishes one customer manicure and saves a free-play design.
- GitHub Pages is configured and published at https://unofficialartworks.github.io/NailSalon/. Each update is validated and deployed by the existing Actions workflow.

## Photo studio and scrapbook checks

Compatible old saves, rejected malformed photo/metadata fields, independent gallery snapshots, photo-aware saved-state detection, deterministic local art, PNG backdrop and ring pixels, reload of photo settings/names/favorites, edit-a-copy and phone dialog overflow are covered. Visual previews were inspected at 390×844, 744×1133 and 1440×1000; jewelry choices use real miniature artwork. Reduced motion disables reveal effects. Existing customer, storage recovery, painting, export, subdirectory and iframe checks remain passing.

## Playful preparation checks

Unit tests cover localized cleaning, fast swipe segments, circular coverage at different aspect ratios, completion, immutable history, unsaved-edit protection and bounded saved masks. Browser checks cover partial washing through pointer cancellation, secondary-pointer moves, undo/redo, reload, portrait/landscape changes, tap cleaning, reduced motion, skipping and preservation of painted artwork. Claude's updated models pass existing silhouette and alignment checks. Phone, iPad-sized and desktop screenshots were inspected; recreate them with `node e2e/preparation-visual.mjs` while the dev server runs. These browser checks do not replace the physical iPad touch/performance checkpoint.

## Customer and creative expansion checks

Tests verify four stable occasions, unchanged forgiving scoring and original room milestones, distinct and available new stickers, compatible finish validation, customer journeys and individual star delays, reduced motion, finish/sticker gallery reload and export, optional post-unlock ideas and orientation retention, and sidebar clearance above supplies. Pixel checks cover all four non-default finishes: deterministic rendering, unchanged bare and erased areas, and matching fill/brush materials. Phone/tablet/desktop layouts and new sticker artwork were inspected via `node e2e/occasions-visual.mjs`. The reveal places rewards before photo options so the celebration is visible when opened on phones.
