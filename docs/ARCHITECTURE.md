# Nail Salon architecture

## Ownership and data flow

`App` coordinates navigation, customer completion, gallery operations, room choices, and dialogs. `editor/useEditor` owns the selected nail and decoration, close-up state, undo/redo, and artwork commits. Every editor callback belongs to its originating manicure ID; departing canvas callbacks cannot modify a replacement manicure or its history.

`NailCanvas` owns one captured pointer and its temporary draft. A toolbar replacement cancels that draft. Ordinary pointer cancellation, blur, and visibility interruptions commit it. Completed actions flow through the editor controller into the active saved manicure. A separate DOM cursor previews brush width in CSS pixels and never enters artwork or exported images. Domain history is capped at 40 past entries. `useTutorial` tracks optional in-session tips from real editor progress, without changing the saved-data schema. `designIsSaved` compares artwork and skin against gallery checkpoints, excluding customer reward metadata, so saved designs remain recognized after reload and undo.

`art/contour` describes normalized upper and lower nail contours. Painting and PNG exports use the complete contour. The SVG finger always uses an enlarged round contour and continues into the finger stem, independently of nail shape. Nail placements leave a small free edge above the fingertip while keeping the lower nail bed on the skin; hand and PNG placements share the same geometry. Browser tests verify both invariants for every shape. Antialiased boundary pixels may differ between SVG and native Canvas curve representations.

`storage/useSave` owns loading, recovery notices, and lifecycle flushing. `saveWriter` serializes writes and stores at most one pending snapshot, replacing superseded waiting snapshots. It never cancels an in-flight transaction. Failures show the existing notice, and subsequent edits can retry. Cleanup waits for the writer to drain before closing IndexedDB.

`database` validates saves and maintains the previous successfully written state. Invalid saves pause autosaving until explicit recovery; recovery retains the unreadable original. The saved-data schema remains version 1. Gallery artwork stays in the snapshot and is never deleted by queue coalescing.

## Creative studio

`art/length` extends nail boxes above their existing beds, compensating for finger rotation. Hand display and PNG export share these placements. The close-up uses the same extension factors with a fixed finger backdrop and extra space above its tip.

Optional `length`, `finish` and `patternColorId` fields extend version 1 without rewriting previous saves: absence means short nails, glossy polish and original pattern ink. Validation checks both active and gallery artwork; invalid settings use the existing recovery flow.

`art/material` creates deterministic glitter tiles and pearl gradients. Fill and brush styles use physical canvas pixels, aligning their textures and retaining round brush footprints without transformed stroke paths. Stored points stay normalized and are converted only while rendering. Glitter tiles are cached per catalog color and paint styles are reused per render. Materials are applied only to polish, so bare and erased regions remain natural.

`game/studio` owns collection membership, independent design copying and decoration duplication/reordering. Collection filters leave availability and customer scoring unchanged. Copy operations keep destination geometry, create fresh decoration IDs and deep-copy strokes. The editor records each matching-set action as one undo entry. `CopyNails` owns its temporary targets; `StudioStages` provides pictured navigation without a separate gameplay state machine.

## Full-gallery measurement, October 2, 2026

Local Chromium, 1024×768, actual autosave hook and browser IndexedDB. Workload: 50 designs, five nails per design, 12 strokes of 80 points per nail (240,000 gallery points total), approximately 6.6 MB JSON. Forty rapid fill actions followed by a clear action. The latest edit and all 50 designs survived saving.

| Measurement | Before coalescing | After coalescing |
| --- | ---: | ---: |
| Completed writes | 41 | 34 |
| Remaining saving time after editing | 1,386 ms | 355 ms |
| Average transaction duration | 136 ms | 138 ms |

These single-run synthetic results demonstrate reduced backlog, not faster individual transactions or verified iPad frame rates. Whole-gallery validation and cloning remain costly for detailed designs. Separating gallery records from the active snapshot is a possible future optimization, requiring a versioned migration and recovery tests. Measure on the actual iPad before choosing it.

Run `node e2e/storage-performance.mjs` with the development server on port 4173 to reproduce the workload. Timing assertions are deliberately excluded from CI because host performance varies; the benchmark asserts that the latest edit and gallery survive. Normal unit and browser suites cover queue behavior, failure recovery, interrupted input, exports, responsive layouts, and Pages/iframe loading.
