# Mockup Generator Code Guide

This project is a static vanilla HTML/CSS/JS mockup generator website. There is no build step: open `index.html` for the public landing page, then use `editor.html` for the mockup editor.

## Main Files

- `index.html` contains the marketing landing page for the free App Store and Play Store mockup generator. It should stay static and must not initialize the editor app.
- `editor.html` contains the editor UI markup, styles, state, rendering logic, interactions, property panel, project import/export, keyboard shortcuts, and mockup export code.
- `tests/frame-feature.test.mjs` is a lightweight Node test that checks the landing/editor split plus the editor's device-frame, project-file, toolbar, and export wiring.
- Keep changes small and local. Most behavior is organized with large comment banners in the script.

## Where To Change Things

- **Landing page:** keep homepage edits in `index.html`; primary calls to action should link to `editor.html`.
- **App state and data models:** in `editor.html`, `S`, `newCanvas()`, `newEl()`, `directElementDefaults()`, and `nextZ()` define canvases, elements, selection, zoom, history, and defaults.
- **Canvas rendering:** `renderAllCanvases()` orchestrates the visible mockups. The smaller helpers `createCanvasShell()`, `createCanvasChrome()`, `createCanvasDeleteButton()`, `createCanvasDuplicateButton()`, and `appendCanvasInteractionLayers()` act like UI components.
- **Element rendering:** `renderElements()`, `renderElementsForCanvas()`, `renderElInContainer()`, and `drawElVisual()` draw shapes, text, images, selection outlines, and handles.
- **Device frames:** Frame visuals are code-drawn in the `.frame-*` CSS rules and the `frame` branch of `drawElVisual()`. `directElementDefaults()`, `addFrameDirect()`, `buildFrameSection()`, `applyFrameFileToElement()`, and `bindFrameDropTarget()` handle sizing, insertion, properties, uploads, and screenshot drag/drop.
- **Canvas actions:** `addNewCanvas()`, `dupCanvas()`, `delCanvas()`, and `deleteCanvasWithConfirm()` manage adding, duplicating, and deleting mockups.
- **Workspace interactions:** `setupWorkspace()`, `beginInsert()`, `beginRubber()`, `bindElEvents()`, `onPtrMove()`, and `onPtrUp()` handle clicking, drawing, dragging, resizing, rotating, and selection boxes.
- **Snapping guides:** the `SNAP STATE & PERSISTENT GUIDE SYSTEM` section manages alignment guides while dragging.
- **Right properties panel:** `renderPanel()` and the `build*Section()` functions create the controls for canvas and selected element properties.
- **Top toolbar and left tools:** `setupToolbar()` wires undo/redo, zoom, fit-to-view, mockup gap, device-frame buttons, project import, the export menu, the left tool buttons, and the left-panel plus button. Canvas dimensions live in the right properties panel, not the top toolbar.
- **Project files:** `exportProject()`, `importProjectFile()`, `buildProjectPayload()`, and `normalizeProjectState()` save and restore `.mockup` files with canvases, selection, zoom, mockup gap, and workspace scroll.
- **Export:** `exportPNG()` exports all canvases as exact-size PNGs, using `html2canvas` when available and falling back to canvas drawing helpers such as `drawElCtx()` and `drawFrameCtx()`. Multi-canvas exports are zipped. Export uses an offscreen capture surface and shows the small export status card while it works.

## Toolbar Flow

- `Open` imports a `.mockup` project file and restores the editor close to where the user left it.
- `Export` opens a menu with `Project` and `Mockups`.
- `Project` downloads a `.mockup` file for later import.
- `Mockups` exports the canvas images as PNG files, or `mockups.zip` when there is more than one canvas.
- The top bar intentionally does not include canvas dimension fields or preset controls; use the canvas section in the right panel for dimensions.

## Device Frame Notes

- Frames are normal canvas elements with `type: 'frame'`, `device`, `src`, and `fitMode` fields.
- iOS frame defaults are tuned for an iPhone 16 Pro simulator screenshot ratio of `1206 x 2622`; keep `IPHONE_16_PRO_SCREEN`, `.frame-ios .frame-screen`, `.frame-dynamic-island`, and `frameScreenMetrics()` in sync when adjusting alignment.
- Android frames use the same element model with a Pixel-style punch-hole overlay.
- New iOS and Android frames default to `stretch` fit mode so screenshots fill the screen area exactly.
- New frame insertion size is calculated from the active canvas and current zoom in `directElementDefaults()`: `Math.min(cv.width * 0.76, 1040 / Math.max(S.zoom, 0.04), cv.height * 0.98 / frameAspect)`.
- Frame resize always preserves the original aspect ratio, even without holding Shift.
- Frame shells and side buttons use one flat body color to avoid shiny or mismatched corners in canvas and exported images.
- A screenshot can be added to a frame by double-clicking the frame, using the Frame panel upload button, or dropping an image onto the frame screen.

## Tests

- Run the landing/editor and frame feature checks with:

```bash
node --test tests/frame-feature.test.mjs
```

- For doc-only changes, also run:

```bash
git diff --check
```

## Notes For Future AI Edits

- Preserve `S.activeId` and `S.selIds` when changing canvas or selection behavior in `editor.html`.
- Keep editor behavior tests pointed at `editor.html`; `index.html` is the landing page and should not contain editor initialization such as `init();`.
- If changing zoom or multi-canvas layout, check both `createCanvasShell()` and `fitCanvas()`.
- If changing top canvas buttons, update `createCanvasChrome()` and the related CSS near `CANVAS TOP CHROME`.
- If changing device-frame geometry, update the frame tests and visually verify the notch/punch-hole alignment with a real screenshot.
- If changing project import/export, verify both `.mockup` round-tripping and PNG/mockups export.
- After visual edits, verify delete/duplicate canvas, element drag/resize, zoom, frame upload/drop, project import/export, and mockup export still work.
