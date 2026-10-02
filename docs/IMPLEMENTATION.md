# First-release contract

The accepted plan is a standalone, gentle cartoon nail salon for ages 6–8. Free play and repeatable customers use the same normalized five-nail artwork model. No timers, failure penalties, consumable supplies, backend, analytics, purchases, multiplayer, or offline launching.

## Data and behavior

- Save version 1 stores stars, served-customer count, active manicure, room choices, audio/tutorial settings, and up to 50 gallery designs.
- Every nail has a shape, cleaning state, primary/base color metadata, optional full-fill color, polish/eraser strokes, optional pattern, and ordered decorations.
- Stroke and decoration coordinates remain normalized within the nail. Resize never rewrites coordinates. Stroke input is committed on pointer-up, cancellation, lost capture, blur, and hidden-page transitions.
- Customer scoring checks visible polish, the chosen primary/base color on three nails, and the requested sticker. Finishing the same active manicure is idempotent. Undo only changes artwork, never claimed rewards.
- Twelve stable reward bundles unlock at 3, 6, …, 36 stars. All rewards are computed from stars rather than maintained as a second inventory that can drift.
- Customer requests cycle the 12 characters and deterministically select from the unlocked kit. Supply IDs and reward ordering are compatibility contracts for saved designs.
- Each save transaction preserves the previous valid save. Invalid saves block autosave until explicit recovery; recovery retains the raw original backup.

## Visual direction

The salon uses a bright arcade presentation: star wallpaper, glossy polish, round illustrated tools, and a horizontally scrolling supply tray. Gameplay labels stay short; the replayable tutorial carries the detailed instructions. All illustrations remain original SVG or Canvas artwork.

The hand uses fixed artwork bounds with separate 48-pixel touch targets, preventing mobile button sizing from displacing nails. Nail silhouettes fit the hand for every supported shape. The enlarged finger narrows toward its tip and widens toward the hand; its artwork bounds live in `src/art/finger.ts`. The bracelet is clipped to the wrist silhouette. Browser regression checks cover geometry, touch target size, taper direction, and phone selector access.

The revised hand has slender, separated fingers and a right-side thumb, with soft side shading and restrained knuckle lines. The close-up uses the same proportions, with the nail near the fingertip. The overview scales to the desk height so fingertips remain reachable on short screens, and PNG exports preserve the hand's aspect ratio. Nail numbers and saved artwork stay compatible.

Sticker artwork uses layered original vector illustrations with consistent outlines and highlights. Decorations correct for the nail canvas aspect ratio before rotation, so stickers and gems retain their proportions in painting, thumbnails, and exports. Picking a tool remembers its last supply during the session. New decorations are selected automatically and can be resized, rotated, or removed with buttons. The sticker sheet and decorated desktop/tablet/phone views can be recreated with `node e2e/audit.mjs`.

## Quality boundaries

Always retain recoverable artwork, validate persisted data, keep touch targets at least 48 CSS pixels, support reduced motion, and use local assets. Test behavior with Vitest and complete flows in Playwright. Run checks before publishing. Never silently reset saves, discard gallery entries, duplicate customer rewards, suppress errors to make tests pass, or upload personal game data.

Browser tests run in isolated profiles. The native iPad Safari and child playtest remain human release checkpoints. GitHub hosting needs a remote repository and Pages configuration; a local build alone does not mean the game is deployed.

## Photo studio and scrapbook

The reveal now offers four original local SVG backdrops, optional golden-star or pearl bracelets, heart/flower rings and a replayable arrival. The photo is a 440×550 scene: hand geometry, shading and jewelry SVG are shared by the React preview and Canvas PNG renderer. Nail artwork uses the existing renderer and length bounds. PNG export is 880×1100, preserving the preview crop. Jewelry anchors are fixed to hand coordinates; effects are presentation-only and respect reduced motion.

Optional manicure.photo and gallery name/favorite fields preserve version-1 saves. Old photos default to peach satin, the original gold bracelet and no ring. Validation rejects unknown photo options and malformed metadata through existing recovery. Photo choices participate in saved-design detection and replacement protection; names/favorites do not change artwork. Saved entries retain independent snapshots. The scrapbook provides inline naming, favorite filtering, edit-a-copy, picture export and confirmed removal; its 50-entry limit remains explicit.

## Playful preparation

The sponge washes nine stable normalized dirt spots along a swept circular footprint measured in screen pixels. Fast pointer moves clean their entire segment; only reached spots disappear. Optional `Nail.washed` stores a bounded nine-bit mask without changing save version 1. Old saves start with all spots, while existing cleaned nails stay clean. Partial washing participates in unsaved-edit protection and existing history, persistence, gallery and export rendering.

The canvas batches drawing with requestAnimationFrame; the sponge and progress meter update directly without rerendering the whole hand on every pointer move. Secondary pointers are ignored. Pointer cancellation, blur, tool changes and canvas departure flush the current draft through the editor. Tap cleaning is still available, preparation is optional, and washing never removes polish or decorations. Completion sparkles respect reduced motion. Length/shape choices keep their existing immediate previews; a separate tactile file activity remains a future option.

Claude's locally supplied hand, cuticle, skin palette and customer portrait changes were reviewed and retained. The finger silhouette stays independent of nail shape; shared hand skin artwork continues to render in previews and PNG exports.
