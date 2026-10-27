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
        <button class="rinswa-mode-btn" id="mode-fullscreen" title="Capture Complete Webpage in High Quality (Full Page)">
          ${ICONS.fullscreen}
          <span>Full Webpage</span>
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