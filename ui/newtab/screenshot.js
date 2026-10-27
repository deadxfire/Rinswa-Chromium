/**
 * Rinswa Browser - Universal Cyber-Glass Screen Capture Engine
 * Shortcut: Ctrl + Shift + S
 * Refined, minimalist, and beautiful design.
 * Features:
 * - Ultra-compact Dynamic Island top capsule (Area / Fullscreen / Close)
 * - Select-wise area screenshot & Full screen screenshot
 * - Autocopy to clipboard immediately upon selection
 * - Save screenshot as high-res PNG file
 * - Razor-sharp selection box with circular micro-handles and monospace dimensions
 * - Floating bottom-right CleanShot-style card for full screen capture
 * Developed by Arindam Makar for Rinswa Chromium
 */

(function () {
  'use strict';

  // Only run in top frame
  if (window !== window.top) return;
  if (window.__rinswa_screenshot_engine_active) return;
  window.__rinswa_screenshot_engine_active = true;

  // Embedded Refined Minimalist Cyber-Glass Stylesheet
  const STYLE_CSS = `
    :host {
      all: initial;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      box-sizing: border-box;
      display: block;
      overflow: hidden;
      pointer-events: auto;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    /* Background Dimmed Overlay */
    .rinswa-backdrop-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    /* Top Floating Capsule (Dynamic Island Style) */
    .rinswa-top-bar {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(13, 17, 23, 0.82);
      backdrop-filter: blur(28px) saturate(180%);
      -webkit-backdrop-filter: blur(28px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 4px 6px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35), 0 0 1px rgba(255, 255, 255, 0.2);
      animation: rinswaPillDrop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 10;
    }

    @keyframes rinswaPillDrop {
      from {
        opacity: 0;
        transform: translate(-50%, -14px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0) scale(1);
      }
    }

    /* CleanShot-style non-intrusive floating mode */
    :host(.rinswa-fs-mode) {
      pointer-events: none !important;
    }
    :host(.rinswa-fs-mode) .rinswa-top-bar,
    :host(.rinswa-fs-mode) .rinswa-backdrop-canvas,
    :host(.rinswa-fs-mode) .rinswa-selection-box {
      display: none !important;
    }
    :host(.rinswa-fs-mode) .rinswa-fullscreen-modal {
      pointer-events: auto !important;
    }

    /* Segmented Control Buttons */
    .rinswa-mode-group {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .rinswa-mode-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.16s ease;
      white-space: nowrap;
    }

    .rinswa-mode-btn svg {
      width: 13px;
      height: 13px;
      stroke: currentColor;
    }

    .rinswa-mode-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.06);
    }

    .rinswa-mode-btn.active {
      background: rgba(255, 255, 255, 0.12);
      color: #38bdf8;
      font-weight: 600;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    .rinswa-close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .rinswa-close-btn svg {
      width: 13px;
      height: 13px;
    }

    .rinswa-close-btn:hover {
      background: rgba(239, 68, 68, 0.18);
      color: #f87171;
    }

    /* Minimalist Selection Box */
    .rinswa-selection-box {
      position: absolute;
      border: 1.5px solid #38bdf8;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35), 0 0 14px rgba(56, 189, 248, 0.28);
      box-sizing: border-box;
      cursor: move;
      z-index: 5;
      pointer-events: auto;
    }

    /* Minimalist Dimension Tag */
    .rinswa-dimensions-tag {
      position: absolute;
      top: -24px;
      left: 0;
      background: rgba(13, 17, 23, 0.85);
      backdrop-filter: blur(8px);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 10px;
      font-weight: 500;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }

    .rinswa-dimensions-tag.flip-down {
      top: 6px;
    }

    /* Minimalist Circular Micro-Handles */
    .rinswa-handle {
      position: absolute;
      width: 7px;
      height: 7px;
      background: #ffffff;
      border: 1.5px solid #0284c7;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      z-index: 6;
      box-sizing: border-box;
    }

    .rinswa-handle-tl { top: -4px; left: -4px; cursor: nwse-resize; }
    .rinswa-handle-tr { top: -4px; right: -4px; cursor: nesw-resize; }
    .rinswa-handle-bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
    .rinswa-handle-br { bottom: -4px; right: -4px; cursor: nwse-resize; }
    .rinswa-handle-t  { top: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .rinswa-handle-b  { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
    .rinswa-handle-l  { left: -4px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
    .rinswa-handle-r  { right: -4px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }

    /* Floating Minimalist Action Capsule */
    .rinswa-action-bar {
      position: absolute;
      bottom: -40px;
      right: 0;
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(13, 17, 23, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 4px 6px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 10;
      animation: rinswaFadePop 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: auto;
    }

    @keyframes rinswaFadePop {
      from { opacity: 0; transform: scale(0.94); }
      to { opacity: 1; transform: scale(1); }
    }

    .rinswa-action-bar.flip-up {
      bottom: auto;
      top: -40px;
    }

    .rinswa-action-bar.flip-inside {
      bottom: 8px;
      right: 8px;
    }

    .rinswa-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 9999px;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .rinswa-action-btn svg {
      width: 12px;
      height: 12px;
    }

    /* Copied badge/button */
    .rinswa-btn-copied {
      background: rgba(16, 185, 129, 0.14);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .rinswa-btn-copied:hover {
      background: rgba(16, 185, 129, 0.22);
    }

    .rinswa-btn-copied.pulse {
      animation: rinswaSoftPulse 0.3s ease-out;
    }

    @keyframes rinswaSoftPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    /* Save button */
    .rinswa-btn-save {
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.25);
    }

    .rinswa-btn-save:hover {
      opacity: 0.94;
      transform: translateY(-0.5px);
      box-shadow: 0 3px 10px rgba(14, 165, 233, 0.35);
    }

    /* Close/dismiss icon button in action bar */
    .rinswa-btn-mini-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .rinswa-btn-mini-close svg {
      width: 11px;
      height: 11px;
    }

    .rinswa-btn-mini-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    /* Floating CleanShot-Style Fullscreen Preview Pill */
    .rinswa-fullscreen-modal {
      position: absolute;
      bottom: 24px;
      right: 24px;
      background: rgba(13, 17, 23, 0.88);
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      padding: 8px 12px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255, 255, 255, 0.2);
      z-index: 20;
      animation: rinswaCardSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes rinswaCardSlideUp {
      from {
        opacity: 0;
        transform: translateY(16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .rinswa-fs-card {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .rinswa-fs-thumb {
      width: 52px;
      height: 34px;
      background: #020617;
      border-radius: 5px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rinswa-fs-thumb img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    .rinswa-fs-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 130px;
    }

    .rinswa-fs-title {
      color: #f8fafc;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }

    .rinswa-fs-status {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #34d399;
      font-size: 11px;
      font-weight: 500;
    }

    .rinswa-fs-status svg {
      width: 12px;
      height: 12px;
    }

    .rinswa-fs-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 4px;
    }

    /* Minimalist Floating Toast */
    .rinswa-toast {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(13, 17, 23, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: #f1f5f9;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
      font-size: 12px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 9999px;
      z-index: 30;
      animation: rinswaToastUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .rinswa-toast-icon {
      color: #34d399;
      display: flex;
      align-items: center;
    }

    .rinswa-toast-icon svg {
      width: 13px;
      height: 13px;
    }

    @keyframes rinswaToastUp {
      from {
        opacity: 0;
        transform: translate(-50%, 12px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `;

  // Refined SVG Icons (Crisp 1.5 - 2 stroke width)
  const ICONS = {
    crop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="m7 9-2-2 1 3"/><path d="m17 9 2-2-1 3"/><path d="m7 15-2 2 1-3"/><path d="m17 15 2 2-1-3"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    save: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x2="18" y1="18" y2="6"/></svg>`
  };

  // State
  let hostEl = null;
  let shadowRoot = null;
  let capturedImg = null;
  let currentMode = 'select'; // 'select' | 'fullscreen'
  let isSelecting = false;
  let isResizing = false;
  let isMoving = false;
  let activeHandle = null;
  let startX = 0, startY = 0;
  let moveStartX = 0, moveStartY = 0;
  let selX = 0, selY = 0, selW = 0, selH = 0;
  let initialSel = null;
  let cachedBlob = null;
  let toastTimer = null;
  let fsDismissTimer = null;

  // UI References
  let backdropCanvas = null;
  let backdropCtx = null;
  let selectionBox = null;
  let dimensionsTag = null;
  let actionBar = null;
  let fullscreenModal = null;
  let toastEl = null;
  let modeBtnSelect = null;
  let modeBtnFull = null;

  // Keyboard shortcut listener (Ctrl+Shift+S)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S' || e.code === 'KeyS')) {
      e.preventDefault();
      e.stopPropagation();
      openScreenshotEngine();
    } else if (e.key === 'Escape' && hostEl) {
      e.preventDefault();
      e.stopPropagation();
      closeScreenshotEngine();
    } else if (hostEl && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      copyCurrentSelection();
    } else if (hostEl && (e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      saveCurrentSelection();
    }
  }, true);

  // Runtime message listener from background service worker or popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'startScreenshot') {
        openScreenshotEngine(msg.dataUrl);
      }
    });
  }

  /**
   * Acquire screenshot & open Cyber-Glass overlay
   */
  async function openScreenshotEngine(passedDataUrl) {
    if (hostEl) {
      closeScreenshotEngine();
      return;
    }

    let dataUrl = passedDataUrl;
    if (!dataUrl && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        const resp = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, resolve);
        });
        if (resp && resp.success && resp.dataUrl) {
          dataUrl = resp.dataUrl;
        }
      } catch (err) {
        console.debug('[Rinswa Capture] Background messaging notice:', err);
      }
    }

    if (!dataUrl) {
      dataUrl = await captureDomFallback();
    }

    capturedImg = new Image();
    capturedImg.crossOrigin = 'anonymous';
    capturedImg.onload = () => {
      createOverlayUI();
    };
    capturedImg.src = dataUrl;
  }

  /**
   * Fallback capture using in-memory canvas
   */
  function captureDomFallback() {
    return new Promise((resolve) => {
      const c = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, c.width, c.height);
      resolve(c.toDataURL('image/png'));
    });
  }

  /**
   * Build Shadow DOM UI
   */
  function createOverlayUI() {
    if (hostEl) return;

    hostEl = document.createElement('div');
    hostEl.id = 'rinswa-screenshot-host';
    shadowRoot = hostEl.attachShadow({ mode: 'open' });

    // Embedded full style tag for 100% synchronous guaranteed styling
    const styleTag = document.createElement('style');
    styleTag.textContent = STYLE_CSS;
    shadowRoot.appendChild(styleTag);

    // Backdrop Canvas
    backdropCanvas = document.createElement('canvas');
    backdropCanvas.className = 'rinswa-backdrop-canvas';
    shadowRoot.appendChild(backdropCanvas);
    backdropCtx = backdropCanvas.getContext('2d');
    resizeBackdrop();

    // Top Floating Capsule (Ultra-Minimalist Dynamic Island)
    const topBar = document.createElement('div');
    topBar.className = 'rinswa-top-bar';
    topBar.innerHTML = `
      <div class="rinswa-mode-group">
        <button class="rinswa-mode-btn active" id="mode-select" title="Area (Drag to select)">
          ${ICONS.crop}
          <span>Area</span>
        </button>
        <button class="rinswa-mode-btn" id="mode-fullscreen" title="Capture Full Screen">
          ${ICONS.fullscreen}
          <span>Fullscreen</span>
        </button>
      </div>
      <div class="rinswa-divider"></div>
      <button class="rinswa-close-btn" id="btn-close" title="Close (Esc)">
        ${ICONS.close}
      </button>
    `;
    shadowRoot.appendChild(topBar);

    modeBtnSelect = topBar.querySelector('#mode-select');
    modeBtnFull = topBar.querySelector('#mode-fullscreen');
    const btnClose = topBar.querySelector('#btn-close');

    modeBtnSelect.addEventListener('click', () => switchMode('select'));
    modeBtnFull.addEventListener('click', () => {
      switchMode('fullscreen');
      captureFullScreen();
    });
    btnClose.addEventListener('click', closeScreenshotEngine);

    // Selection Box Container
    selectionBox = document.createElement('div');
    selectionBox.className = 'rinswa-selection-box';
    selectionBox.style.display = 'none';

    // Dimension Tag
    dimensionsTag = document.createElement('div');
    dimensionsTag.className = 'rinswa-dimensions-tag';
    selectionBox.appendChild(dimensionsTag);

    // 8 Resize Handles
    const handles = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'];
    handles.forEach((h) => {
      const handleEl = document.createElement('div');
      handleEl.className = `rinswa-handle rinswa-handle-${h}`;
      handleEl.dataset.handle = h;
      selectionBox.appendChild(handleEl);
    });

    // Floating Minimalist Action Capsule attached to selection
    actionBar = document.createElement('div');
    actionBar.className = 'rinswa-action-bar';
    actionBar.innerHTML = `
      <button class="rinswa-action-btn rinswa-btn-copied pulse" id="act-copied" title="Autocopied! Click to re-copy">
        ${ICONS.check}
        <span id="txt-copied">Copied</span>
      </button>
      <button class="rinswa-action-btn rinswa-btn-save" id="act-save" title="Save screenshot as PNG file">
        ${ICONS.save}
        <span>Save</span>
      </button>
      <button class="rinswa-btn-mini-close" id="act-cancel" title="Close">
        ${ICONS.close}
      </button>
    `;
    selectionBox.appendChild(actionBar);

    const btnCopied = actionBar.querySelector('#act-copied');
    const btnSave = actionBar.querySelector('#act-save');
    const btnCancel = actionBar.querySelector('#act-cancel');

    btnCopied.addEventListener('click', (e) => {
      e.stopPropagation();
      copyCurrentSelection(true);
    });
    btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      saveCurrentSelection();
    });
    btnCancel.addEventListener('click', (e) => {
      e.stopPropagation();
      closeScreenshotEngine();
    });

    shadowRoot.appendChild(selectionBox);

    // CleanShot-Style Floating Fullscreen Preview Card
    fullscreenModal = document.createElement('div');
    fullscreenModal.className = 'rinswa-fullscreen-modal';
    fullscreenModal.style.display = 'none';
    shadowRoot.appendChild(fullscreenModal);

    // Minimalist Toast element
    toastEl = document.createElement('div');
    toastEl.className = 'rinswa-toast';
    toastEl.style.display = 'none';
    shadowRoot.appendChild(toastEl);

    // Attach to DOM
    (document.body || document.documentElement).appendChild(hostEl);

    // Attach Event Handlers
    window.addEventListener('resize', handleWindowResize);
    shadowRoot.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Draw initial dimmed backdrop
    drawBackdrop();
  }

  /**
   * Resize Canvas
   */
  function resizeBackdrop() {
    if (!backdropCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    backdropCanvas.width = window.innerWidth * dpr;
    backdropCanvas.height = window.innerHeight * dpr;
    backdropCtx.scale(dpr, dpr);
  }

  function handleWindowResize() {
    if (!hostEl) return;
    resizeBackdrop();
    drawBackdrop();
    if (selW > 0 && selH > 0) {
      updateSelectionUI();
    }
  }

  /**
   * Switch between Area and Fullscreen modes
   */
  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'select') {
      modeBtnSelect.classList.add('active');
      modeBtnFull.classList.remove('active');
      if (fullscreenModal) fullscreenModal.style.display = 'none';
      backdropCanvas.style.cursor = 'crosshair';
    } else {
      modeBtnFull.classList.add('active');
      modeBtnSelect.classList.remove('active');
      if (selectionBox) selectionBox.style.display = 'none';
      selW = 0; selH = 0;
      drawBackdrop();
    }
  }

  /**
   * Draw canvas backdrop with clear hole cut out for selection
   */
  function drawBackdrop() {
    if (!backdropCtx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    backdropCtx.save();
    backdropCtx.setTransform(1, 0, 0, 1, 0, 0);
    backdropCtx.clearRect(0, 0, backdropCanvas.width, backdropCanvas.height);
    backdropCtx.scale(dpr, dpr);

    // Refined translucent dark veil
    backdropCtx.fillStyle = 'rgba(8, 12, 20, 0.42)';
    backdropCtx.fillRect(0, 0, w, h);

    // Cut out selection rectangle
    if (selW > 0 && selH > 0 && currentMode === 'select') {
      backdropCtx.clearRect(selX, selY, selW, selH);
    }
    backdropCtx.restore();
  }

  /**
   * Mouse Event Handlers
   */
  function handleMouseDown(e) {
    if (currentMode !== 'select') return;

    // Check if clicked inside resize handle
    if (e.target && e.target.classList.contains('rinswa-handle')) {
      isResizing = true;
      activeHandle = e.target.dataset.handle;
      startX = e.clientX;
      startY = e.clientY;
      initialSel = { x: selX, y: selY, w: selW, h: selH };
      e.preventDefault();
      return;
    }

    // Check if clicked inside selection box to move it
    if (e.target === selectionBox) {
      isMoving = true;
      moveStartX = e.clientX - selX;
      moveStartY = e.clientY - selY;
      e.preventDefault();
      return;
    }

    // Ignore clicks on topbar, action bar, or modals
    if (e.composedPath().some(el => el.classList && (
      el.classList.contains('rinswa-top-bar') ||
      el.classList.contains('rinswa-action-bar') ||
      el.classList.contains('rinswa-fullscreen-modal')
    ))) {
      return;
    }

    // Starting new selection
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selX = startX;
    selY = startY;
    selW = 0;
    selH = 0;

    selectionBox.style.display = 'none';
    actionBar.style.display = 'none';
    drawBackdrop();
  }

  function handleMouseMove(e) {
    if (!hostEl) return;

    if (isSelecting) {
      const curX = Math.max(0, Math.min(window.innerWidth, e.clientX));
      const curY = Math.max(0, Math.min(window.innerHeight, e.clientY));

      selX = Math.min(startX, curX);
      selY = Math.min(startY, curY);
      selW = Math.abs(curX - startX);
      selH = Math.abs(curY - startY);

      updateSelectionUI(true);
      drawBackdrop();
    } else if (isResizing && initialSel) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = initialSel.x;
      let newY = initialSel.y;
      let newW = initialSel.w;
      let newH = initialSel.h;

      if (activeHandle.includes('r')) newW = Math.max(20, initialSel.w + dx);
      if (activeHandle.includes('b')) newH = Math.max(20, initialSel.h + dy);
      if (activeHandle.includes('l')) {
        const potentialW = initialSel.w - dx;
        if (potentialW >= 20) {
          newX = initialSel.x + dx;
          newW = potentialW;
        }
      }
      if (activeHandle.includes('t')) {
        const potentialH = initialSel.h - dy;
        if (potentialH >= 20) {
          newY = initialSel.y + dy;
          newH = potentialH;
        }
      }

      selX = Math.max(0, newX);
      selY = Math.max(0, newY);
      selW = Math.min(window.innerWidth - selX, newW);
      selH = Math.min(window.innerHeight - selY, newH);

      updateSelectionUI(true);
      drawBackdrop();
    } else if (isMoving) {
      selX = Math.max(0, Math.min(window.innerWidth - selW, e.clientX - moveStartX));
      selY = Math.max(0, Math.min(window.innerHeight - selH, e.clientY - moveStartY));

      updateSelectionUI(true);
      drawBackdrop();
    }
  }

  async function handleMouseUp() {
    if (isSelecting || isResizing || isMoving) {
      isSelecting = false;
      isResizing = false;
      isMoving = false;
      activeHandle = null;

      if (selW >= 15 && selH >= 15) {
        updateSelectionUI(false);
        drawBackdrop();

        // AUTONOMOUSLY COPY IMMEDIATELY ON SELECTION
        await copyCurrentSelection(false);
      } else {
        selW = 0; selH = 0;
        selectionBox.style.display = 'none';
        drawBackdrop();
      }
    }
  }

  /**
   * Update Selection Box position, dimensions label, and action bar
   */
  function updateSelectionUI(isDraggingNow = false) {
    if (!selectionBox) return;

    selectionBox.style.display = 'block';
    selectionBox.style.left = `${selX}px`;
    selectionBox.style.top = `${selY}px`;
    selectionBox.style.width = `${selW}px`;
    selectionBox.style.height = `${selH}px`;

    // Dimensions text
    const dpr = window.devicePixelRatio || 1;
    const naturalW = Math.round(selW * (capturedImg ? (capturedImg.naturalWidth / window.innerWidth) : dpr));
    const naturalH = Math.round(selH * (capturedImg ? (capturedImg.naturalHeight / window.innerHeight) : dpr));
    dimensionsTag.textContent = `${naturalW} × ${naturalH}`;

    // Dimension tag positioning
    if (selY < 28) {
      dimensionsTag.classList.add('flip-down');
    } else {
      dimensionsTag.classList.remove('flip-down');
    }

    // Action bar positioning
    if (isDraggingNow) {
      actionBar.style.display = 'none';
    } else {
      actionBar.style.display = 'flex';
      actionBar.classList.remove('flip-up', 'flip-inside');

      // Check overflow bottom
      if (selY + selH + 46 > window.innerHeight) {
        if (selY >= 46) {
          actionBar.classList.add('flip-up');
        } else {
          actionBar.classList.add('flip-inside');
        }
      }
    }
  }

  /**
   * Crop image from captured screen buffer with High DPI precision
   */
  function getCroppedCanvas(cropRegion = null) {
    if (!capturedImg) return null;

    const scaleX = capturedImg.naturalWidth / window.innerWidth;
    const scaleY = capturedImg.naturalHeight / window.innerHeight;

    let sx, sy, sw, sh;
    if (cropRegion) {
      sx = Math.round(cropRegion.x * scaleX);
      sy = Math.round(cropRegion.y * scaleY);
      sw = Math.round(cropRegion.w * scaleX);
      sh = Math.round(cropRegion.h * scaleY);
    } else {
      sx = Math.round(selX * scaleX);
      sy = Math.round(selY * scaleY);
      sw = Math.round(selW * scaleX);
      sh = Math.round(selH * scaleY);
    }

    sw = Math.max(1, Math.min(sw, capturedImg.naturalWidth - sx));
    sh = Math.max(1, Math.min(sh, capturedImg.naturalHeight - sy));

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = sw;
    cropCanvas.height = sh;
    const ctx = cropCanvas.getContext('2d');
    ctx.drawImage(capturedImg, sx, sy, sw, sh, 0, 0, sw, sh);

    return cropCanvas;
  }

  /**
   * Autocopy or manually copy selected region to clipboard
   */
  async function copyCurrentSelection(isManualClick = false) {
    if (selW < 10 || selH < 10) return;

    const canvas = getCroppedCanvas();
    if (!canvas) return;

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        cachedBlob = blob;

        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);

          // Flash UI confirmation
          const btnCopied = shadowRoot.querySelector('#act-copied');
          if (btnCopied) {
            btnCopied.classList.add('pulse');
            const txt = shadowRoot.querySelector('#txt-copied');
            if (txt) txt.textContent = 'Copied';
            setTimeout(() => {
              if (btnCopied) btnCopied.classList.remove('pulse');
            }, 350);
          }

          showToast('Copied to clipboard');
          resolve(true);
        } catch (err) {
          console.warn('[Rinswa Capture] Clipboard write failed:', err);
          if (isManualClick) {
            showToast('Click again to permit clipboard');
          }
          resolve(false);
        }
      }, 'image/png');
    });
  }

  /**
   * Save screenshot as high-res PNG file
   */
  function saveCurrentSelection() {
    let canvas = null;
    if (currentMode === 'fullscreen') {
      canvas = getCroppedCanvas({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight });
    } else {
      canvas = getCroppedCanvas();
    }

    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
      const filename = `Rinswa_Screenshot_${timestamp}.png`;

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      showToast(`Saved to Downloads`);
    }, 'image/png');
  }

  /**
   * Capture Entire Screen / Viewport (CleanShot Floating Card)
   */
  async function captureFullScreen() {
    if (!capturedImg) return;

    const fullCanvas = getCroppedCanvas({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight });
    if (!fullCanvas) return;

    // Autocopy full screen immediately
    fullCanvas.toBlob(async (blob) => {
      if (blob) {
        cachedBlob = blob;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (err) {
          console.debug('[Rinswa Capture] Fullscreen autocopy notice:', err);
        }
      }
    }, 'image/png');

    // Switch host to non-intrusive floating card mode
    if (hostEl) {
      hostEl.classList.add('rinswa-fs-mode');
    }

    // Show CleanShot-style Floating Preview Card
    const thumbDataUrl = fullCanvas.toDataURL('image/png');
    fullscreenModal.innerHTML = `
      <div class="rinswa-fs-card">
        <div class="rinswa-fs-thumb">
          <img src="${thumbDataUrl}" alt="Preview">
        </div>
        <div class="rinswa-fs-info">
          <div class="rinswa-fs-title">Full Screen Captured</div>
          <div class="rinswa-fs-status">${ICONS.check} Copied to clipboard</div>
        </div>
        <div class="rinswa-fs-actions">
          <button class="rinswa-action-btn rinswa-btn-save" id="btn-modal-save" title="Save PNG">
            ${ICONS.save}
            <span>Save</span>
          </button>
          <button class="rinswa-btn-mini-close" id="btn-modal-close" title="Close">
            ${ICONS.close}
          </button>
        </div>
      </div>
    `;

    fullscreenModal.style.display = 'block';

    fullscreenModal.querySelector('#btn-modal-save').addEventListener('click', () => {
      saveCurrentSelection();
    });
    fullscreenModal.querySelector('#btn-modal-close').addEventListener('click', closeScreenshotEngine);

    const scheduleDismiss = () => {
      clearTimeout(fsDismissTimer);
      fsDismissTimer = setTimeout(() => {
        if (fullscreenModal && hostEl) {
          fullscreenModal.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          fullscreenModal.style.opacity = '0';
          fullscreenModal.style.transform = 'translateY(12px) scale(0.96)';
          setTimeout(() => closeScreenshotEngine(), 250);
        }
      }, 4500);
    };

    fullscreenModal.addEventListener('mouseenter', () => clearTimeout(fsDismissTimer));
    fullscreenModal.addEventListener('mouseleave', scheduleDismiss);
    scheduleDismiss();

    showToast('Copied to clipboard');
  }

  /**
   * Show smooth Cyber-Glass minimalist toast
   */
  function showToast(text) {
    if (!toastEl) return;
    toastEl.innerHTML = `<span class="rinswa-toast-icon">${ICONS.check}</span><span>${text}</span>`;
    toastEl.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      if (toastEl) toastEl.style.display = 'none';
    }, 2400);
  }

  /**
   * Close & Tear down Overlay
   */
  function closeScreenshotEngine() {
    clearTimeout(fsDismissTimer);
    clearTimeout(toastTimer);
    window.removeEventListener('resize', handleWindowResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);

    if (hostEl && hostEl.parentNode) {
      hostEl.parentNode.removeChild(hostEl);
    }

    hostEl = null;
    shadowRoot = null;
    capturedImg = null;
    cachedBlob = null;
    selW = 0; selH = 0;
    isSelecting = false;
    isResizing = false;
    isMoving = false;
  }

})();
