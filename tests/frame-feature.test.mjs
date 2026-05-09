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
