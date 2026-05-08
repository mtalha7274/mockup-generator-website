# Mockup Generator Code Guide

This project is a single-page vanilla HTML/CSS/JS mockup editor. There is no build step: open `index.html` in a browser and the app runs directly.

## Main Files

- `index.html` contains the UI markup, styles, state, rendering logic, interactions, property panel, keyboard shortcuts, and export code.
- Keep changes small and local. Most behavior is organized with large comment banners in the script.

## Where To Change Things

- **App state and data models:** `STATE`, `newCanvas()`, `newEl()`, and `nextZ()` define canvases, elements, selection, zoom, history, and defaults.
- **Canvas rendering:** `renderAllCanvases()` orchestrates the visible mockups. The smaller helpers `createCanvasShell()`, `createCanvasChrome()`, `createCanvasDeleteButton()`, `createCanvasDuplicateButton()`, and `appendCanvasInteractionLayers()` act like UI components.
- **Element rendering:** `renderElements()`, `renderElementsForCanvas()`, `renderElInContainer()`, and `drawElVisual()` draw shapes, text, images, selection outlines, and handles.
- **Canvas actions:** `addNewCanvas()`, `dupCanvas()`, `delCanvas()`, and `deleteCanvasWithConfirm()` manage adding, duplicating, and deleting mockups.
- **Workspace interactions:** `setupWorkspace()`, `beginInsert()`, `beginRubber()`, `bindElEvents()`, `onPtrMove()`, and `onPtrUp()` handle clicking, drawing, dragging, resizing, rotating, and selection boxes.
- **Snapping guides:** the `SNAP STATE & PERSISTENT GUIDE SYSTEM` section manages alignment guides while dragging.
- **Right properties panel:** `renderPanel()` and the `build*Section()` functions create the controls for canvas and selected element properties.
- **Top toolbar and left tools:** `setupToolbar()` wires undo/redo, zoom, canvas size, presets, export, the left tool buttons, and the left-panel plus button.
- **Export:** `exportPNG()` exports all canvases as separate exact-size PNGs, using `html2canvas` when available and falling back to canvas drawing helpers.

## Notes For Future AI Edits

- Preserve `S.activeId` and `S.selIds` when changing canvas or selection behavior.
- If changing zoom or multi-canvas layout, check both `createCanvasShell()` and `fitCanvas()`.
- If changing top canvas buttons, update `createCanvasChrome()` and the related CSS near `CANVAS TOP CHROME`.
- After visual edits, verify delete/duplicate canvas, element drag/resize, zoom, and export still work.
