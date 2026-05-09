# Mockup Generator Code Guide

This project is a single-page vanilla HTML/CSS/JS mockup editor. There is no build step: open `index.html` in a browser and the app runs directly.

## Main Files

- `index.html` contains the UI markup, styles, state, rendering logic, interactions, property panel, keyboard shortcuts, and export code.
- `tests/frame-feature.test.mjs` is a lightweight Node test that checks the device-frame feature wiring and geometry.
- Keep changes small and local. Most behavior is organized with large comment banners in the script.

## Where To Change Things

- **App state and data models:** `S`, `newCanvas()`, `newEl()`, `directElementDefaults()`, and `nextZ()` define canvases, elements, selection, zoom, history, and defaults.
- **Canvas rendering:** `renderAllCanvases()` orchestrates the visible mockups. The smaller helpers `createCanvasShell()`, `createCanvasChrome()`, `createCanvasDeleteButton()`, `createCanvasDuplicateButton()`, and `appendCanvasInteractionLayers()` act like UI components.
- **Element rendering:** `renderElements()`, `renderElementsForCanvas()`, `renderElInContainer()`, and `drawElVisual()` draw shapes, text, images, selection outlines, and handles.
- **Device frames:** Frame visuals are code-drawn in the `.frame-*` CSS rules and the `frame` branch of `drawElVisual()`. `addFrameDirect()`, `buildFrameSection()`, `applyFrameFileToElement()`, and `bindFrameDropTarget()` handle insertion, properties, uploads, and screenshot drag/drop.
- **Canvas actions:** `addNewCanvas()`, `dupCanvas()`, `delCanvas()`, and `deleteCanvasWithConfirm()` manage adding, duplicating, and deleting mockups.
- **Workspace interactions:** `setupWorkspace()`, `beginInsert()`, `beginRubber()`, `bindElEvents()`, `onPtrMove()`, and `onPtrUp()` handle clicking, drawing, dragging, resizing, rotating, and selection boxes.
- **Snapping guides:** the `SNAP STATE & PERSISTENT GUIDE SYSTEM` section manages alignment guides while dragging.
- **Right properties panel:** `renderPanel()` and the `build*Section()` functions create the controls for canvas and selected element properties.
- **Top toolbar and left tools:** `setupToolbar()` wires undo/redo, zoom, canvas size, presets, device-frame buttons, export, the left tool buttons, and the left-panel plus button.
- **Export:** `exportPNG()` exports all canvases as separate exact-size PNGs, using `html2canvas` when available and falling back to canvas drawing helpers such as `drawElCtx()` and `drawFrameCtx()`.

## Device Frame Notes

- Frames are normal canvas elements with `type: 'frame'`, `device`, `src`, and `fitMode` fields.
- iOS frame defaults are tuned for an iPhone 16 Pro simulator screenshot ratio of `1206 x 2622`; keep `IPHONE_16_PRO_SCREEN`, `.frame-ios .frame-screen`, `.frame-dynamic-island`, and `frameScreenMetrics()` in sync when adjusting alignment.
- Android frames use the same element model with a Pixel-style punch-hole overlay.
- A screenshot can be added to a frame by double-clicking the frame, using the Frame panel upload button, or dropping an image onto the frame screen.

## Tests

- Run the frame feature checks with:

```bash
node --test tests/frame-feature.test.mjs
```

## Notes For Future AI Edits

- Preserve `S.activeId` and `S.selIds` when changing canvas or selection behavior.
- If changing zoom or multi-canvas layout, check both `createCanvasShell()` and `fitCanvas()`.
- If changing top canvas buttons, update `createCanvasChrome()` and the related CSS near `CANVAS TOP CHROME`.
- If changing device-frame geometry, update the frame tests and visually verify the notch/punch-hole alignment with a real screenshot.
- After visual edits, verify delete/duplicate canvas, element drag/resize, zoom, frame upload/drop, and export still work.
