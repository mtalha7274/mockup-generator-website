import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('top toolbar exposes iOS and Android frame insertion controls', () => {
  assert.match(html, /id="btn-frame-ios"/);
  assert.match(html, /id="btn-frame-android"/);
  assert.match(html, /addFrameDirect\('ios'\)/);
  assert.match(html, /addFrameDirect\('android'\)/);
});

test('frame elements have device, screenshot, and fit defaults', () => {
  assert.match(html, /frame:\s*\{[^}]*device:\s*'ios'/s);
  assert.match(html, /frame:\s*\{[^}]*src:\s*''/s);
  assert.match(html, /frame:\s*\{[^}]*fitMode:\s*'fill'/s);
});

test('frames render a shell, screen drop target, and device overlays', () => {
  assert.match(html, /case 'frame':/);
  assert.match(html, /className = 'frame-shell/);
  assert.match(html, /className = 'frame-screen/);
  assert.match(html, /className = 'frame-dynamic-island/);
  assert.match(html, /className = 'frame-punch-hole/);
});

test('iOS frame uses iPhone 16 Pro screenshot ratio with thin even bezels', () => {
  assert.match(html, /const width = Math\.round\(Math\.min\(cv\.width \* 0\.40, 506\)\)/);
  assert.match(html, /width,/);
  assert.match(html, /height:\s*Math\.round\(width \* IPHONE_16_PRO_SCREEN\.height \/ IPHONE_16_PRO_SCREEN\.width\)/);
  assert.match(html, /\.frame-shell\s*\{[^}]*border:\s*max\(4px, 1\.2%\) solid #070707;/s);
  assert.match(html, /\.frame-ios \.frame-screen\s*\{[^}]*left:\s*2\.2%;[^}]*right:\s*2\.2%;[^}]*top:\s*1\.2%;[^}]*bottom:\s*1\.2%;/s);
  assert.match(html, /return \{ x: w \* 0\.022, y: h \* 0\.012, w: w \* 0\.956, h: h \* 0\.976/);
});

test('iOS Dynamic Island aligns to the simulator screenshot safe area', () => {
  assert.match(html, /\.frame-dynamic-island\s*\{[^}]*left:\s*35\.1%;[^}]*top:\s*2\.8%;[^}]*width:\s*29\.8%;[^}]*height:\s*4\.1%;/s);
  assert.match(html, /const iw = w \* 0\.298, ih = h \* 0\.041;/);
  assert.match(html, /ctxRR\(ctx, w \* 0\.351, h \* 0\.028, iw, ih, ih \/ 2\)/);
});

test('frames accept screenshot upload through picker and drag-drop', () => {
  assert.match(html, /applyFrameFileToElement/);
  assert.match(html, /chooseFrameImageForElement/);
  assert.match(html, /addEventListener\('dragover'/);
  assert.match(html, /addEventListener\('drop'/);
});

test('export fallback can draw frame elements', () => {
  assert.match(html, /case 'frame':/);
  assert.match(html, /drawFrameCtx/);
});

test('frame resizing preserves aspect ratio without requiring shift', () => {
  assert.match(html, /applyResize\(el,\s*dx,\s*dy,\s*IX\.handle,\s*e\.shiftKey\s*\|\|\s*el\.type\s*===\s*'frame'\)/);
});

test('overflow mirrors use rotated visual bounds at canvas edges', () => {
  assert.match(html, /function elementVisualBounds\(el\)/);
  assert.match(html, /elementVisualBounds\(el\)\.right\s*>\s*prev\.width/);
  assert.match(html, /elementVisualBounds\(el\)\.left\s*<\s*0/);
});

test('export rendering uses an isolated canvas surface without workspace shadows', () => {
  assert.match(html, /container\.className\s*=\s*'export-canvas'/);
  assert.match(html, /container\.style\.boxShadow\s*=\s*'none'/);
});

test('export shows progress without flashing the capture surface onscreen', () => {
  assert.match(html, /id="export-status"/);
  assert.match(html, /function showExportStatus\(message\)/);
  assert.match(html, /function hideExportStatus\(\)/);
  assert.match(html, /setExportBusy\(true\)/);
  assert.match(html, /finally\s*\{\s*setExportBusy\(false\);\s*hideExportStatus\(\);/s);
  assert.match(html, /container\.style\.left\s*=\s*'-100000px'/);
  assert.match(html, /container\.style\.zIndex\s*=\s*'-1'/);
});

test('project files can be imported from the toolbar', () => {
  assert.match(html, /id="btn-project-import"/);
  assert.match(html, /id="project-import-input"/);
  assert.match(html, /accept="\.mockup,application\/json"/);
  assert.match(html, /addEventListener\('click', \(\) => projectImportInput\.click\(\)\)/);
});

test('top toolbar keeps canvas sizing and presets out of the main bar', () => {
  assert.doesNotMatch(html, /id="cv-w"/);
  assert.doesNotMatch(html, /id="cv-h"/);
  assert.doesNotMatch(html, /id="preset-sel"/);
  assert.doesNotMatch(html, />Presets/);
});

test('export button opens a menu for project or mockup exports', () => {
  assert.doesNotMatch(html, /id="btn-project-export"/);
  assert.match(html, /id="btn-project-import"/s);
  assert.match(html, /id="btn-project-import"[\s\S]*id="btn-export"/);
  assert.match(html, /id="export-menu"/);
  assert.match(html, /id="export-project-option"/);
  assert.match(html, /id="export-mockups-option"/);
  assert.match(html, /id="export-project-option"[\s\S]*<svg viewBox="0 0 16 16"[\s\S]*Project/);
  assert.match(html, /id="export-mockups-option"[\s\S]*<svg viewBox="0 0 16 16"[\s\S]*Mockups/);
  assert.match(html, /toggleExportMenu/);
  assert.match(html, /export-project-option'\)\.addEventListener\('click', \(\) => runExportMenuAction\(exportProject\)\)/);
  assert.match(html, /export-mockups-option'\)\.addEventListener\('click', \(\) => runExportMenuAction\(exportPNG\)\)/);
});

test('project export writes a versioned mockup state file', () => {
  assert.match(html, /const PROJECT_FILE_VERSION\s*=\s*1/);
  assert.match(html, /function buildProjectPayload\(\)/);
  assert.match(html, /app:\s*'mockup-generator'/);
  assert.match(html, /version:\s*PROJECT_FILE_VERSION/);
  assert.match(html, /state:\s*\{\s*canvases:\s*S\.canvases,\s*activeId:\s*S\.activeId,\s*mockupGap:\s*S\.mockupGap,\s*zoom:\s*S\.zoom,\s*selIds:\s*S\.selIds,\s*workspaceScroll:\s*workspaceScrollState\(\)\s*\}/s);
  assert.match(html, /downloadBlob\(blob,\s*projectFileName\(\)\)/);
  assert.match(html, /\.mockup'/);
});

test('project import restores state and refreshes history, IDs, and canvas rendering', () => {
  assert.match(html, /async function importProjectFile\(file\)/);
  assert.match(html, /function readProjectFile\(file\)/);
  assert.match(html, /function normalizeProjectState\(payload\)/);
  assert.match(html, /function rebuildIdSequences\(\)/);
  assert.match(html, /S\.canvases\s*=\s*state\.canvases/);
  assert.match(html, /S\.activeId\s*=\s*state\.activeId/);
  assert.match(html, /S\.selIds\s*=\s*state\.selIds/);
  assert.match(html, /S\.history\s*=\s*\[\]/);
  assert.match(html, /S\.zoom\s*=\s*state\.zoom/);
  assert.match(html, /snap\(\);\s*renderAll\(\);\s*syncZoomInput\(\);\s*requestAnimationFrame\(\(\) => restoreWorkspaceScroll\(state\.workspaceScroll\)\)/);
});
