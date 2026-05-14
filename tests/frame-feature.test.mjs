import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../editor.html', import.meta.url), 'utf8');
const landingHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('landing page links to the separate editor page', () => {
  assert.match(landingHtml, /href="editor\.html"/);
  assert.match(landingHtml, />Open editor</);
  assert.doesNotMatch(landingHtml, />Sign In</);
});

test('landing page does not initialize the editor app', () => {
  assert.doesNotMatch(landingHtml, /\binit\(\);/);
  assert.doesNotMatch(landingHtml, /id="workspace"/);
  assert.doesNotMatch(landingHtml, /const S = \{/);
});

test('editor registers a native beforeunload dialog', () => {
  assert.match(html, /function setupLeaveGuard\(\)/);
  assert.match(html, /window\.addEventListener\('beforeunload',\s*event => \{/);
  assert.match(html, /event\.preventDefault\(\)/);
  assert.match(html, /event\.returnValue\s*=\s*''/);
  assert.match(html, /setupLeaveGuard\(\)/);
});

test('editor suppresses Chrome reload prompt on visibility return', () => {
  assert.match(html, /function setupVisibilityReturnPromptGuard\(\)/);
  assert.match(html, /document\.addEventListener\('visibilitychange',\s*event => \{/);
  assert.match(html, /document\.visibilityState === 'visible'/);
  assert.match(html, /event\.preventDefault\(\)/);
  assert.match(html, /setupVisibilityReturnPromptGuard\(\)/);
});

test('editor autosaves and restores projects after browser refresh', () => {
  assert.match(html, /const AUTOSAVE_STORAGE_KEY\s*=\s*'mockup-generator-autosave'/);
  assert.match(html, /function saveAutosaveState\(\)/);
  assert.match(html, /localStorage\.setItem\(AUTOSAVE_STORAGE_KEY,\s*JSON\.stringify\(buildProjectPayload\(\)\)\)/);
  assert.match(html, /function loadAutosaveState\(\)/);
  assert.match(html, /localStorage\.getItem\(AUTOSAVE_STORAGE_KEY\)/);
  assert.match(html, /function applyProjectState\(state\)/);
  assert.match(html, /const restored = loadAutosaveState\(\);/);
  assert.match(html, /if \(restored\) \{\s*applyProjectState\(restored\.state\);/s);
});

test('first-time editor startup uses a starter mockup while new canvases stay blank', () => {
  assert.match(html, /function starterCanvasTemplate\(\)/);
  assert.match(html, /Add a title for this mockup/);
  assert.match(html, /Add a suitable description for this mockup/);
  assert.match(html, /newEl\('frame',\s*154,\s*780,\s*976,\s*2122\)/);
  assert.match(html, /const cv = starterCanvasTemplate\(\);\s*S\.canvases\.push\(cv\);\s*S\.activeId = cv\.id;/s);
  assert.match(html, /function addNewCanvas\(\)\s*\{\s*const cv = newCanvas\(`Canvas \$\{S\.canvases\.length \+ 1\}`,\s*1284,\s*2778\);/s);
});

test('editor brand is not a link away from the editor', () => {
  assert.match(html, /<div class="editor-brand"[^>]*>/);
  assert.doesNotMatch(html, /<a class="editor-brand"[^>]*href=/);
});

test('top toolbar exposes iOS and Android frame insertion controls', () => {
  assert.match(html, /id="btn-frame-ios"/);
  assert.match(html, /id="btn-frame-android"/);
  assert.match(html, /addFrameDirect\('ios'\)/);
  assert.match(html, /addFrameDirect\('android'\)/);
});

test('mobile toolbar scrolls and properties panel becomes a drawer', () => {
  assert.match(html, /id="mobile-panel-toggle"[^>]*aria-controls="right-panel"[^>]*aria-expanded="false"/);
  assert.match(html, /id="mobile-panel-backdrop"/);
  assert.match(html, /id="mobile-panel-close"/);
  assert.match(html, /const MOBILE_PANEL_QUERY\s*=\s*'\(max-width: 768px\)'/);
  assert.match(html, /setupMobilePanel\(\)/);
  assert.match(html, /function setMobilePanelOpen\(open\)/);
  assert.match(html, /body\.classList\.toggle\('mobile-panel-open',\s*isOpen\)/);
  assert.match(html, /@media \(max-width: 768px\)[\s\S]*#top-bar\s*\{[\s\S]*overflow-x:\s*auto;/);
  assert.match(html, /@media \(max-width: 768px\)[\s\S]*#right-panel\s*\{[\s\S]*position:\s*fixed;[\s\S]*transform:\s*translateX\(100%\);[\s\S]*overflow-y:\s*auto;/);
  assert.match(html, /body\.mobile-panel-open #right-panel\s*\{[\s\S]*transform:\s*translateX\(0\);/);
});

test('mobile editor gestures use touch-safe controls and a single active pointer', () => {
  assert.match(html, /\.el\s*\{[\s\S]*touch-action:\s*none;/);
  assert.match(html, /\.el\.text-editing\s*\{\s*touch-action:\s*auto;\s*\}/);
  assert.match(html, /\.el \.text-inner\[contenteditable="true"\]\s*\{[\s\S]*touch-action:\s*manipulation;/);
  assert.match(html, /\.rh\s*\{[\s\S]*touch-action:\s*none;/);
  assert.match(html, /@media \(pointer: coarse\)\s*\{[\s\S]*\.rh::before\s*\{[\s\S]*--ui-touch-target,\s*44px/);
  assert.match(html, /pointerId:\s*null/);
  assert.match(html, /IX\.pointerId = e\.pointerId/);
  assert.match(html, /function isActiveInteractionPointer\(e\)/);
  assert.match(html, /if \(!isActiveInteractionPointer\(e\)\) return;/);
  assert.match(html, /document\.addEventListener\('pointercancel',\s*onPtrCancel\)/);
  assert.match(html, /function onPtrCancel\(e\)/);
  assert.match(html, /function clearInteractionState\(\)/);
});

test('editor starts at 20% zoom and zoom steps move by four percentage points', () => {
  assert.match(html, /const DEFAULT_ZOOM\s*=\s*0\.2/);
  assert.match(html, /const ZOOM_STEP\s*=\s*0\.04/);
  assert.match(html, /id="zoom-val" value="20%"/);
  assert.match(html, /zoom:\s*DEFAULT_ZOOM/);
  assert.match(html, /function snapZoomToStep\(z\)/);
  assert.match(html, /z = snapZoomToStep\(z\)/);
  assert.match(html, /function zoomIn\(doScroll\s*=\s*false\)\s*\{\s*applyZoom\(S\.zoom \+ ZOOM_STEP,\s*doScroll\);/s);
  assert.match(html, /function zoomOut\(doScroll\s*=\s*false\)\s*\{\s*applyZoom\(S\.zoom - ZOOM_STEP,\s*doScroll\);/s);
  assert.match(html, /e\.deltaY < 0 \? zoomIn\(false\) : zoomOut\(false\)/);
  assert.match(html, /'btn-zoom-in'\)\.addEventListener\('click',\s*\(\)\s*=>\s*zoomIn\(\)\)/);
  assert.match(html, /'btn-zoom-out'\)\.addEventListener\('click',\s*\(\)\s*=>\s*zoomOut\(\)\)/);
});

test('text and radius controls use editor-facing units with full font weights', () => {
  assert.match(html, /const EDITOR_UNIT_SCALE\s*=\s*DEFAULT_ZOOM/);
  assert.match(html, /function canvasToEditorUnit\(value\)/);
  assert.match(html, /function editorToCanvasUnit\(value\)/);
  assert.match(html, /numInput\(canvasToEditorUnit\(el\.fontSize\),\s*v => \{ el\.fontSize = editorToCanvasUnit\(Math\.max\(1,\s*v\)\);/s);
  assert.match(html, /const FONT_WEIGHT_OPTIONS\s*=\s*\[\s*\['100',\s*'Ultra Thin'\]/s);
  assert.match(html, /\['900',\s*'Black'\]/);
  assert.match(html, /function normalizeFontWeight\(weight\)/);
  assert.match(html, /el\.fontWeight = normalizeFontWeight\(el\.fontWeight\)/);
});

test('text editing only grows height when content overflows', () => {
  assert.match(html, /function growTextElementToFit\(el,\s*div,\s*inner\)/);
  assert.match(html, /if \(inner\.scrollHeight > div\.clientHeight\) \{/);
  assert.match(html, /e2\.text = inner\.innerText;\s*growTextElementToFit\(e2,\s*div,\s*inner\);\s*snap\(\);/s);
  assert.doesNotMatch(html, /e2\.height = inner\.scrollHeight \+ 8/);
});

test('rect text and image elements use compact expandable radius controls', () => {
  assert.match(html, /const BORDER_RADIUS_KEYS\s*=\s*\[/);
  assert.match(html, /function borderRadiusCss\(el\)/);
  assert.match(html, /function setAllBorderRadii\(el,\s*value\)/);
  assert.match(html, /function setBorderRadiusCorner\(el,\s*key,\s*value\)/);
  assert.match(html, /function radiusSliderInput\(value,\s*onChange\)/);
  assert.match(html, /function radiusCornerToggleButton\(el\)/);
  assert.match(html, /className = 'radius-icon-btn'/);
  assert.match(html, /aria-label', 'Show separate corner radius controls'/);
  assert.match(html, /<circle cx="8" cy="8" r="2\.2"/);
  assert.match(html, /className = 'radius-corners'/);
  assert.match(html, /body\.appendChild\(row\(radiusCornerToggleButton\(el\),\s*lbl\('Corner radius'\)\)\)/);
  assert.match(html, /body\.appendChild\(row\(radiusSliderInput\(canvasToEditorUnit\(getBorderRadius\(el,\s*'borderRadiusTopLeft'\)\)/);
  assert.match(html, /body\.appendChild\(row\(lbl\('Corners'\)\)\)/);
  assert.match(html, /div\.style\.borderRadius\s*=\s*borderRadiusCss\(el\)/);
  assert.match(html, /cornerWrap\.appendChild\(row\(lbl\(label\),\s*radiusSliderInput/);
  assert.doesNotMatch(html, /body\.appendChild\(row\(lbl\('TL'\),\s*tlInp,\s*lbl\('TR'\),\s*trInp\)\)/);
  assert.match(html, /function ctxRoundedRectForElement\(ctx,\s*x,\s*y,\s*w,\s*h,\s*el,\s*sc\)/);
  assert.match(html, /ctxRoundedRectForElement\(ctx,\s*0,\s*0,\s*ew,\s*eh,\s*el,\s*sc\)/);
});

test('frame elements have device, screenshot, and fit defaults', () => {
  assert.match(html, /frame:\s*\{[^}]*device:\s*'ios'/s);
  assert.match(html, /frame:\s*\{[^}]*src:\s*''/s);
  assert.match(html, /frame:\s*\{[^}]*fitMode:\s*'stretch'/s);
  assert.match(html, /overrides:\s*\{ device:\s*'ios',\s*fitMode:\s*'stretch'\s*\}/);
});

test('frames render a shell, screen drop target, and device overlays', () => {
  assert.match(html, /case 'frame':/);
  assert.match(html, /className = 'frame-shell/);
  assert.match(html, /className = 'frame-screen/);
  assert.match(html, /className = 'frame-dynamic-island/);
  assert.match(html, /className = 'frame-punch-hole/);
});

test('iOS frame uses iPhone 16 Pro screenshot ratio with thin even bezels', () => {
  assert.match(html, /const frameAspect = IPHONE_16_PRO_SCREEN\.height \/ IPHONE_16_PRO_SCREEN\.width/);
  assert.match(html, /const width = Math\.round\(Math\.min\(cv\.width \* 0\.76,\s*1040 \/ Math\.max\(S\.zoom,\s*0\.04\),\s*cv\.height \* 0\.98 \/ frameAspect\)\)/);
  assert.match(html, /width,/);
  assert.match(html, /height:\s*Math\.round\(width \* frameAspect\)/);
  assert.match(html, /\.frame-shell\s*\{[^}]*border:\s*max\(4px, 1\.2%\) solid #070707;/s);
  assert.match(html, /\.frame-ios \.frame-screen\s*\{[^}]*left:\s*2\.2%;[^}]*right:\s*2\.2%;[^}]*top:\s*1\.2%;[^}]*bottom:\s*1\.2%;/s);
  assert.match(html, /return \{ x: w \* 0\.022, y: h \* 0\.012, w: w \* 0\.956, h: h \* 0\.976/);
});

test('device frames use one flat body color without shiny corner gradients', () => {
  assert.match(html, /\.frame-shell\s*\{[^}]*background:\s*#070707;[^}]*border:\s*max\(4px, 1\.2%\) solid #070707;[^}]*box-shadow:\s*none;/s);
  assert.doesNotMatch(html, /\.frame-shell\s*\{[^}]*linear-gradient/s);
  assert.match(html, /\.frame-side-button\s*\{[^}]*background:\s*#070707;[^}]*box-shadow:\s*none;/s);
  assert.match(html, /ctx\.fillStyle = FRAME_COLOR/);
  assert.doesNotMatch(html, /ctx\.strokeStyle = 'rgba\(255,255,255,\s*\.16\)'/);
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

test('dragging elements fully into another canvas transfers ownership', () => {
  assert.match(html, /const DRAG_TRANSFER_TOLERANCE\s*=\s*1/);
  assert.match(html, /function canvasGapUnits\(\)/);
  assert.match(html, /function dragTransferItems\(sourceCv\)/);
  assert.match(html, /node\.getBoundingClientRect\(\)/);
  assert.match(html, /function findDragTransferTarget\(sourceCanvasId,\s*items\)/);
  assert.match(html, /function rectContainsPoint\(rect,\s*point/);
  assert.match(html, /items\.every\(item => rectContainsPoint\(rect,\s*item\.center\)\)/);
  assert.match(html, /function maybeTransferDraggedElements\(\)/);
  assert.match(html, /sourceCv\.elements = sourceCv\.elements\.filter\(el => !movedIdSet\.has\(el\.id\)\)/);
  assert.match(html, /S\.activeId = target\.cv\.id;\s*S\.selIds = movedIds;/);
  assert.match(html, /const didTransfer = maybeTransferDraggedElements\(\);\s*snap\(\);\s*if \(didTransfer\) renderAll\(\);/);
});

test('overflow mirrors can transfer and become selectable', () => {
  assert.match(html, /\.el\.overflow-ghost\.is-transferable\s*\{[\s\S]*pointer-events:\s*auto;/);
  assert.match(html, /classList\.toggle\('is-transferable',\s*transferableGhost\)/);
  assert.match(html, /const transferableGhost = !!\(opts\.sourceCanvasId && opts\.targetCanvasId\)/);
  assert.match(html, /bindOverflowGhostEvents\(div\)/);
  assert.match(html, /function transferOverflowGhostToCanvas\(div\)/);
  assert.match(html, /S\.activeId = targetCv\.id;\s*S\.selIds = \[el\.id\];\s*snap\(\);\s*renderAll\(\);/);
});

test('element pointer events activate their own canvas before lookup', () => {
  assert.match(html, /const getElInCanvas = \(id,\s*canvasId\) =>/);
  assert.match(html, /function activateCanvasForInteraction\(canvasId\)/);
  assert.match(html, /syncActiveCanvasDomIds\(\)/);
  assert.match(html, /activateCanvasForInteraction\(div\.dataset\.canvasId\);\s*const el = getElInCanvas\(id,\s*div\.dataset\.canvasId\);/);
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
  assert.match(html, /id="btn-project-import"[\s\S]*>Import\s*<\/button>/);
  assert.match(html, /id="import-menu"/);
  assert.match(html, /id="new-project-option"[\s\S]*<svg viewBox="0 0 16 16"[\s\S]*New project/);
  assert.match(html, /id="import-project-option"[\s\S]*<svg viewBox="0 0 16 16"[\s\S]*Import project/);
  assert.match(html, /id="project-import-input"/);
  assert.match(html, /accept="\.mockup,application\/json"/);
  assert.match(html, /btn-project-import'\)\.addEventListener\('click',\s*toggleImportMenu\)/);
  assert.match(html, /new-project-option'\)\.addEventListener\('click',\s*\(\) => runImportMenuAction\(confirmNewProject\)\)/);
  assert.match(html, /import-project-option'\)\.addEventListener\('click',\s*\(\) => runImportMenuAction\(confirmProjectImport\)\)/);
  assert.match(html, /async function confirmProjectImport\(\)[\s\S]*project-import-input'\)\.click\(\)/);
});

test('destructive project and canvas actions use the centered modal', () => {
  assert.match(html, /id="confirm-modal"/);
  assert.match(html, /function showConfirmModal\(options = \{\}\)/);
  assert.match(html, /async function confirmNewProject\(\)[\s\S]*resetToStarterProject\(\)/);
  assert.match(html, /function resetToStarterProject\(\)[\s\S]*const cv = starterCanvasTemplate\(\)/);
  assert.match(html, /function deleteCanvasWithConfirm\(id\)[\s\S]*showConfirmModal\(/);
  assert.doesNotMatch(html, /window\.confirm/);
  assert.doesNotMatch(html, /window\.alert/);
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

test('export actions show the Patreon support prompt first', () => {
  assert.match(html, /const PATREON_SUPPORT_URL\s*=\s*'https:\/\/www\.patreon\.com\/posts\/one-developer-no-157857073\?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link'/);
  assert.match(html, /id="export-support-modal"/);
  assert.match(html, /One developer keeps this free\. If it saved you time, consider supporting\./);
  assert.match(html, /Continue without supporting/);
  assert.match(html, /<span>Support on Patreon<\/span>/);
  assert.match(html, /<text[^>]*>PNG<\/text>/);
  assert.match(html, /id="export-support-patreon"[\s\S]*<span>Support on Patreon<\/span>/);
  assert.doesNotMatch(html, /\.support-cta svg\s*\{/);
  assert.match(html, /\.support-cta\s*\{[\s\S]*min-height:\s*44px;[\s\S]*min-width:\s*min\(100%, 280px\);/);
  assert.match(html, /class="support-skip-link" id="export-support-skip">Continue without supporting<\/button>/);
  assert.doesNotMatch(html, /class="modal-btn support-skip"/);
  assert.match(html, /modal\.focus\(\)/);
  assert.match(html, /async function runExportMenuAction\(action\)\s*\{\s*hideExportMenu\(\);\s*await showExportSupportModal\(\);\s*action\(\);/s);
  assert.match(html, /function showExportSupportModal\(\)/);
  assert.match(html, /window\.open\(PATREON_SUPPORT_URL,\s*'_blank',\s*'noopener'\)/);
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
  assert.match(html, /applyProjectState\(state\);\s*renderAll\(\);\s*syncZoomInput\(\);\s*requestAnimationFrame\(\(\) => restoreWorkspaceScroll\(state\.workspaceScroll\)\)/);
});
