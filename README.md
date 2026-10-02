# Nail Salon

A bright, gentle nail-art game for ages 6–8. Paint five nails, decorate with stickers and gems, serve friendly customers, and build a gallery of tiny masterpieces. Designed for touch and mouse, with portrait and landscape layouts.

## Play locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open the address Vite prints. For an iPad on the same network, open the **Network** address printed by Vite in Safari. The development server listens on all interfaces. A generated-ID fallback supports local HTTP previews; the published game should use HTTPS.

## Playing

- **Free play:** tap a nail to open its close-up view. Clean it, select a shape, brush or fill polish, apply a pattern, and place stickers or gems. New manicures open **Clean**, with nail shapes and free-play skin tones visible before painting. **Start painting** skips preparation. **How to play** offers short, replayable tips you can skip.
- **Customers:** follow the two picture wishes, or make something different. Polish on all five nails earns one star. Matching the requested base color on at least three nails earns another; adding the requested sticker earns another. There are no timers or unhappy customers.
- **Tools:** undo/redo whole actions, adjust brush size, erase polish, clear a nail, or color all five. Use **Move** to select and drag decorations; select them from its list to rotate or remove them. Arrow buttons move selected decorations; **Center item** recenters them. Button placement and fill work without drawing or dragging. The circular brush cursor follows the brush-size setting. Palette arrows reveal more supplies; select a pattern, then press **Apply pattern**.
- **Studio:** pictured **Prepare → Paint → Decorate → Reveal** buttons make each stage easy to find. Actual artwork thumbnails let you switch between the five nails.
- **Shapes and lengths:** choose short, medium or long nails during preparation, alongside the five shapes. Both choices apply to all five nails. The finger keeps its round silhouette; longer nails extend upward from the same nail bed. Artwork stays attached when changing shape or rotating the device.
- **Materials and collections:** choose glossy, glitter or pearlescent polish and change pattern ink colors. **Candy Pop**, **Ocean Sparkle** and **Garden Party** filter the existing supplies; **All supplies** restores the full library. Rewards still unlock supplies in the same order.
- **Matching sets:** **Copy this nail** copies its design or just its base color to the nails you choose, preserving each destination's shape and length. Undo reverses the whole copy. Duplicate decorations and bring them forward or send them behind other items with buttons.
- **Rewards:** every three stars, through 36, automatically unlock a bundle of supplies and room choices. Customers remain available after all rewards are earned.
- **Gallery:** save up to 50 designs, edit a copy, delete with confirmation, or export a PNG. An unchanged saved manicure stays marked **Saved**, including after reload, and does not prompt you to save again. A full gallery never discards existing art automatically.
- **Sound:** music and effects have separate controls. Original synthesized music begins after interaction and pauses when the page is hidden.

The library contains 12 customers, 36 colors, 10 patterns, 36 stickers, 12 gems, five nail shapes, three lengths, five polish finishes, six skin tones, and three choices each for walls, desks, and tabletop accessories. Start with 18 colors, five patterns, 21 stickers, six gems, and one of each room choice. Six themed stickers are bonus starter supplies; existing reward milestones are unchanged.

Customers arrive with illustrated party, beach, picnic or space occasions and celebrate completed designs. Occasions inspire the artwork without changing scoring. Rainbow Dreams joins the themed supply filters; matte and metallic finishes join glossy, glitter and pearlescent polish. After 36 stars, free play offers optional creative ideas with pictured supply suggestions.

## Saves and recovery

Progress, the active manicure, settings, and gallery save to IndexedDB after each completed action. Saves belong to this browser and origin; different devices, localhost, GitHub Pages, and a future arcade domain do not automatically share progress. Home Screen and Safari storage can also differ.

If browser storage is unavailable, play continues in memory and a notice explains the limitation. If a save is invalid or from an unsupported version, it is preserved and automatic saving pauses. The player can download the unreadable save, restore the previous valid save when available, or explicitly start fresh while preserving a recovery backup. Resetting never happens silently.

PNG exports preserve the picture rather than playable progress. On iPad, touch and hold the export preview to save to Photos when the download flow is inconvenient. Internet is required to launch; no offline cache or cloud sync is included.

Install from the published HTTPS site: on iPad, open Safari's Share menu and choose **Add to Home Screen** (leave **Open as Web App** enabled if shown). In Chrome, use the address-bar install icon or the menu's **Install Nail Salon** / **Install page as app** option. The installed game opens in its own window, supports both orientations, and uses the same site's local storage; some platforms keep Home Screen storage separate from browser tabs. No cloud transfer is included. Older Home Screen shortcuts may need to be removed and added again to pick up standalone mode and the new icon.

The relative `manifest.webmanifest` scopes installation to the deployed game directory, including GitHub Pages. PNG icons at 180, 192, and 512 pixels are bundled; regenerate them from the original SVG with `node scripts/generate-icons.mjs`. Installation does not add offline launching.

## Development and checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm run preview
```

Run `npm run build` before the browser suite: its production tests serve `dist/` under `/NailSalonGame/` and inside an arcade iframe.

On this Windows machine, Firefox's AppData cache location produced a side-by-side loader error. An unmodified official Playwright archive extracted inside the workspace launches correctly. To use that portable copy for local tests:

```powershell
$env:NAIL_FIREFOX_EXECUTABLE = 'W:/GitHub/NailSalonGame/.npm-cache/firefox-portable/firefox/firefox.exe'
npm run test:e2e
```

This is a test-environment override, not a game dependency. CI uses Playwright's standard Linux browser installation and still runs all three engines.

Unit tests cover customer scoring, erasing, milestones, supply availability, gallery capacity, history, validation, IndexedDB recovery, anchored length geometry and independent design copies. Browser tests exercise play sessions, export, reloads, interrupted input, materials, lengths, decoration layers, storage failures, responsive layouts, and embedding in Chromium, Firefox, and WebKit. `node e2e/visual.mjs` and `node e2e/studio-visual.mjs` capture screenshots from a running preview at port 4173. Generated results are ignored by Git.

The project uses React, TypeScript, Vite, Canvas 2D, and original SVG artwork. All art and sound are local; there are no ads, analytics, accounts, purchases, or runtime third-party requests. Browser test tooling is pinned for reproducibility.

Source is grouped by responsibility: `src/game` owns types, catalogs, scoring and history; `src/editor` owns selection, undo/redo and manicure-scoped commits; `src/art` owns shared contours, vector artwork and rendering; `src/components` owns controls and views; `src/storage` owns persistence and recovery; `src/audio` owns sound. `src/App.tsx` coordinates navigation, rewards and dialogs. See [architecture notes](docs/ARCHITECTURE.md).

Autosave finishes each in-flight transaction and keeps only the newest waiting snapshot. This bounds the queue during rapid edits while preserving the latest design and the previous successfully saved state for recovery. `node e2e/storage-performance.mjs` measures a full 50-design gallery against the actual autosave hook; run it with `npm run dev -- --port 4173` in another terminal. Results are synthetic desktop measurements, not iPad performance claims.

## GitHub Pages

The production build is a portable static site in `dist/`. Relative asset paths support a repository subdirectory such as `/NailSalonGame/` without changing the repository name in code. No path-based client routing or backend is required.

1. Create the public GitHub repository and push this project, including `package-lock.json` and `.github/workflows/pages.yml`.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Run **Check and deploy Nail Salon** from Actions, or push to the default branch.
4. Open the URL shown by the deployment job.

The workflow runs types, lint, unit tests, dependency audit, and all three browser suites before building and publishing only `dist/`. Pull requests run checks without publishing. A failed check leaves the last published version in place. Revert a faulty commit and push to roll back.

To add the game to an arcade, link to its URL or embed it:

```html
<iframe
  src="https://YOUR-USER.github.io/NailSalonGame/"
  title="Nail Salon"
  style="width:100%;height:90vh;border:0"
></iframe>
```

Moving to another domain gives the game a new browser-storage origin. The game does not reach into its parent page or require an arcade-specific API.

## Release verification still required on the real device

Before treating this as a public release, test Safari on your daughter's iPad Mini:

- Play in both orientations; rotate during an active stroke and check placement afterwards.
- Confirm comfortable tool selection, scrolling outside the drawing area, and painting with one finger while another touches the screen.
- Complete a customer, reload, and verify progress and artwork.
- Save a gallery design and a PNG, then check Photos/Files.
- Confirm music pauses on app switching and settings remain saved.
- Measure painting performance: target 60 fps without sustained periods below 30 fps.
- Let your daughter finish one customer manicure and save one free-play design without guidance.

Desktop engine tests do not certify performance or usability on her actual iPad.
