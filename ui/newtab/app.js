/**
 * Rinswa Chromium Browser - Dynamic Theme Engine & New Tab Logic
 * Direct implementation of user specifications and provided design screenshot.
 * Developed by Arindam Makar
 * 
 * Features:
 * 1. Upper-left Rinswa Emblem Logo opens the authentic Chromium Menu.
 * 2. "Rinswa Settings" inside the Chromium Menu opens the Settings modal.
 * 3. Settings modal contains:
 *    - INTERFACE THEME COLOUR: 8 swatches with checkmark indicator (#cbd8e1 default, #e4d6d8, #ccdfd8, #c7c7c7, #e1d0d1, #d1d1db, #e5d4ce, #e6decb).
 *    - WALLPAPER: Dreamy Meadow Mist (Default), Soft Blue Mist, Minimal Theme Color Only.
 *    - IMAGE SHOWING OPTION: Toggle switch to show/hide background picture.
 *    - Default search engine preference (DuckDuckGo, Google, Brave, Bing).
 * 4. Center floating search card with direct URL navigation and web query execution.
 * 5. Zoom stepper, window caption controls, pinned tabs, and navigation bar.
 */

(function () {
  'use strict';

  // --- Element References ---
  // Topbar & Chromium Menu
  const btnRinswaLogo = document.getElementById('btn-rinswa-logo');
  const chromiumMenu = document.getElementById('chromium-app-menu');
  const cmenuSettings = document.getElementById('cmenu-settings');
  const cmenuNewTab = document.getElementById('cmenu-new-tab');
  const cmenuNewWindow = document.getElementById('cmenu-new-window');
  const cmenuIncognito = document.getElementById('cmenu-incognito');
  const cmenuHistory = document.getElementById('cmenu-history');
  const cmenuDownloads = document.getElementById('cmenu-downloads');
  const cmenuBookmarks = document.getElementById('cmenu-bookmarks');
  const cmenuExtensions = document.getElementById('cmenu-extensions');
  const cmenuPrint = document.getElementById('cmenu-print');
  const cmenuFind = document.getElementById('cmenu-find');
  const cmenuAbout = document.getElementById('cmenu-about');
  const cmenuExit = document.getElementById('cmenu-exit');

  // Zoom Controls
  const zoomDec = document.getElementById('zoom-dec');
  const zoomInc = document.getElementById('zoom-inc');
  const zoomVal = document.getElementById('zoom-val');
  const zoomFullscreen = document.getElementById('zoom-fullscreen');

  // Rinswa Settings Modal
  const settingsBackdrop = document.getElementById('settings-modal-backdrop');
  const settingsCard = document.getElementById('settings-modal-card');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnSaveCloseSettings = document.getElementById('btn-save-close-settings');
  const themeSwatches = document.querySelectorAll('.theme-swatch-btn');
  const wallpaperRows = document.querySelectorAll('.wallpaper-item-row');
  const toggleShowImage = document.getElementById('toggle-show-image');
  const searchEngineRadios = document.querySelectorAll('input[name="search-engine"]');

  // Background Wallpaper Layers
  const wallpaperImage = document.getElementById('wallpaper-image');
  const wallpaperTint = document.getElementById('wallpaper-tint');

  // Center Stage Search & Shortcuts
  const searchInput = document.getElementById('main-search-input');
  const btnSubmit = document.getElementById('btn-submit-arrow');
  const btnAddTabs = document.getElementById('btn-add-tabs');
  const flyout = document.getElementById('add-tabs-flyout');

  // Navigation Toolbar & Window Caption
  const navBack = document.getElementById('nav-btn-back');
  const navForward = document.getElementById('nav-btn-forward');
  const navReload = document.getElementById('nav-btn-reload');
  const btnCreateTab = document.getElementById('btn-create-tab');
  const capMin = document.getElementById('cap-min');
  const capMax = document.getElementById('cap-max');
  const capClose = document.getElementById('cap-close');

  // 8 Specific Theme Colors Required:
  // #cbd8e1, #e4d6d8, #ccdfd8, #c7c7c7, #e1d0d1, #d1d1db, #e5d4ce, #e6decb
  const VALID_THEMES = [
    '#cbd8e1', '#e4d6d8', '#ccdfd8', '#c7c7c7',
    '#e1d0d1', '#d1d1db', '#e5d4ce', '#e6decb'
  ];

  // ==========================================================================
  // 1. Chromium Menu Trigger (Upper Left Rinswa Logo)
  // ==========================================================================
  if (btnRinswaLogo && chromiumMenu) {
    btnRinswaLogo.addEventListener('click', (e) => {
      e.stopPropagation();
      chromiumMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!chromiumMenu.contains(e.target) && !btnRinswaLogo.contains(e.target)) {
        chromiumMenu.classList.remove('show');
      }
    });
  }

  // ==========================================================================
  // 2. Rinswa Settings Modal Controls
  // ==========================================================================
  function openSettings() {
    if (chromiumMenu) chromiumMenu.classList.remove('show');
    if (settingsBackdrop) {
      settingsBackdrop.classList.add('show');
    }
  }

  function closeSettings() {
    if (settingsBackdrop) {
      settingsBackdrop.classList.remove('show');
    }
  }

  if (cmenuSettings) {
    cmenuSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      openSettings();
    });
  }

  if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', closeSettings);
  }

  if (btnSaveCloseSettings) {
    btnSaveCloseSettings.addEventListener('click', closeSettings);
  }

  if (settingsBackdrop) {
    settingsBackdrop.addEventListener('click', (e) => {
      if (e.target === settingsBackdrop) {
        closeSettings();
      }
    });
  }

  // Escape key closes open menus & modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (settingsBackdrop && settingsBackdrop.classList.contains('show')) {
        closeSettings();
      } else if (chromiumMenu && chromiumMenu.classList.contains('show')) {
        chromiumMenu.classList.remove('show');
      } else if (flyout && flyout.classList.contains('show')) {
        flyout.classList.remove('show');
      }
    }
  });

  // ==========================================================================
  // 3. Theme Color Application Engine (8 Colors with Checkmark indicator)
  // ==========================================================================
  function applyThemeColor(color) {
    const normalizedColor = color ? color.toLowerCase() : '#cbd8e1';
    const finalColor = VALID_THEMES.includes(normalizedColor) ? normalizedColor : '#cbd8e1';

    document.documentElement.style.setProperty('--theme-color', finalColor);
    document.body.setAttribute('data-theme', finalColor);

    themeSwatches.forEach(swatch => {
      const swatchColor = swatch.getAttribute('data-color').toLowerCase();
      swatch.classList.toggle('active', swatchColor === finalColor);
    });

    try {
      localStorage.setItem('rinswa_theme_color', finalColor);
    } catch (err) {}
  }

  themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const selectedColor = swatch.getAttribute('data-color');
      applyThemeColor(selectedColor);
    });
  });

  // ==========================================================================
  // 4. Wallpaper & Image Showing Option Logic
  // ==========================================================================
  let currentWp = 'meadow';
  let showImageEnabled = true;

  function updateWallpaperDisplay() {
    wallpaperRows.forEach(row => {
      row.classList.toggle('active', row.getAttribute('data-wp') === currentWp);
    });

    if (!showImageEnabled || currentWp === 'solid') {
      // Wallpaper image disabled or minimal theme color selected
      if (wallpaperImage) wallpaperImage.style.display = 'none';
      if (wallpaperTint) wallpaperTint.style.opacity = '1';
    } else {
      // Background picture active
      if (wallpaperImage) {
        wallpaperImage.style.display = 'block';
        if (currentWp === 'meadow') {
          wallpaperImage.style.backgroundImage = "url('Dreamy Meadow Mist Portrait.png')";
          if (wallpaperTint) wallpaperTint.style.opacity = '0.32';
        } else if (currentWp === 'softblue') {
          wallpaperImage.style.backgroundImage = "url('Soft Blue-to-White Gradient.png')";
          if (wallpaperTint) wallpaperTint.style.opacity = '0.40';
        }
      }
    }

    try {
      localStorage.setItem('rinswa_wallpaper', currentWp);
      localStorage.setItem('rinswa_show_image', showImageEnabled ? 'true' : 'false');
    } catch (err) {}
  }

  wallpaperRows.forEach(row => {
    row.addEventListener('click', () => {
      currentWp = row.getAttribute('data-wp') || 'meadow';
      updateWallpaperDisplay();
    });
  });

  if (toggleShowImage) {
    toggleShowImage.addEventListener('change', () => {
      showImageEnabled = toggleShowImage.checked;
      updateWallpaperDisplay();
    });
  }

  // ==========================================================================
  // 5. Search Engine & Query Execution Engine
  // ==========================================================================
  function getSelectedSearchEngine() {
    let engine = 'duckduckgo';
    searchEngineRadios.forEach(radio => {
      if (radio.checked) engine = radio.value;
    });
    return engine;
  }

  function executeSearch() {
    if (!searchInput) return;
    const raw = searchInput.value.trim();
    if (!raw) return;

    // Check if input is a valid URL or host
    const hasProtocol = /^[a-zA-Z]+:\/\//i.test(raw);
    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(raw);

    let targetUrl;
    if (hasProtocol) {
      targetUrl = raw;
    } else if (isDomain && !raw.includes(' ')) {
      targetUrl = 'https://' + raw;
    } else {
      const engine = getSelectedSearchEngine();
      const q = encodeURIComponent(raw);
      switch (engine) {
        case 'google':
          targetUrl = `https://www.google.com/search?q=${q}`;
          break;
        case 'brave':
          targetUrl = `https://search.brave.com/search?q=${q}`;
          break;
        case 'bing':
          targetUrl = `https://www.bing.com/search?q=${q}`;
          break;
        case 'duckduckgo':
        default:
          targetUrl = `https://duckduckgo.com/?q=${q}`;
          break;
      }
    }

    window.location.href = targetUrl;
  }

  if (btnSubmit) {
    btnSubmit.addEventListener('click', executeSearch);
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  }

  searchEngineRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      try {
        localStorage.setItem('rinswa_search_engine', radio.value);
      } catch (err) {}
    });
  });

  // ==========================================================================
  // 6. Quick Shortcuts / Add Tabs Flyout
  // ==========================================================================
  if (btnAddTabs && flyout) {
    btnAddTabs.addEventListener('click', (e) => {
      e.stopPropagation();
      flyout.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!flyout.contains(e.target) && !btnAddTabs.contains(e.target)) {
        flyout.classList.remove('show');
      }
    });
  }

  // ==========================================================================
  // 7. Standard Chromium Menu Commands
  // ==========================================================================
  if (cmenuNewTab) {
    cmenuNewTab.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    });
  }


  if (cmenuNewWindow) {
    cmenuNewWindow.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      window.open(window.location.href, '_blank');
    });
  }

  if (cmenuIncognito) {
    cmenuIncognito.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      alert('Incognito Window: In real Chromium builds, this opens a zero-telemetry Incognito session.');
    });
  }

  if (cmenuHistory) {
    cmenuHistory.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      if (flyout) flyout.classList.add('show');
    });
  }

  if (cmenuDownloads) {
    cmenuDownloads.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      alert('Downloads: Ctrl+J opens the download manager in the compiled Chromium engine.');
    });
  }

  if (cmenuBookmarks) {
    cmenuBookmarks.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      if (flyout) flyout.classList.add('show');
    });
  }

  if (cmenuExtensions) {
    cmenuExtensions.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      alert('Extensions: The 8 native Rinswa palette themes are installed in chrome://extensions.');
    });
  }

  if (cmenuPrint) {
    cmenuPrint.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      window.print();
    });
  }

  if (cmenuFind) {
    cmenuFind.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  if (cmenuAbout) {
    cmenuAbout.addEventListener('click', () => {
      chromiumMenu.classList.remove('show');
      openSettings();
    });
  }

  if (cmenuExit) {
    cmenuExit.addEventListener('click', () => {
      if (window.close) window.close();
    });
  }

  // Zoom Handling
  const ZOOM_LEVELS = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];
  let currentZoomIndex = 5; // 100%

  function applyZoom(index) {
    if (index < 0) index = 0;
    if (index >= ZOOM_LEVELS.length) index = ZOOM_LEVELS.length - 1;
    currentZoomIndex = index;
    const level = ZOOM_LEVELS[currentZoomIndex];
    if (zoomVal) zoomVal.textContent = level + '%';
    document.body.style.zoom = (level / 100);
  }

  if (zoomDec) {
    zoomDec.addEventListener('click', (e) => {
      e.stopPropagation();
      applyZoom(currentZoomIndex - 1);
    });
  }

  if (zoomInc) {
    zoomInc.addEventListener('click', (e) => {
      e.stopPropagation();
      applyZoom(currentZoomIndex + 1);
    });
  }

  if (zoomFullscreen) {
    zoomFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // ==========================================================================
  // 8. Pinned Tabs & Navigation Bar Actions
  // ==========================================================================
  document.querySelectorAll('.pinned-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const url = tab.getAttribute('data-url');
      if (url) window.location.href = url;
    });
  });

  if (navBack) navBack.addEventListener('click', () => window.history.back());
  if (navForward) navForward.addEventListener('click', () => window.history.forward());
  if (navReload) navReload.addEventListener('click', () => window.location.reload());

  if (btnCreateTab) {
    btnCreateTab.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
    });
  }

  // Window Caption Controls
  if (capMin) {
    capMin.addEventListener('click', () => {
      document.body.style.opacity = '0.7';
      setTimeout(() => { document.body.style.opacity = '1'; }, 300);
    });
  }

  if (capMax) {
    capMax.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  if (capClose) {
    capClose.addEventListener('click', () => {
      if (window.close) window.close();
    });
  }

  // ==========================================================================
  // 9. Initialization from Saved Preferences or Defaults
  // ==========================================================================
  let savedColor = '#cbd8e1';
  try {
    const storedColor = localStorage.getItem('rinswa_theme_color');
    if (storedColor && VALID_THEMES.includes(storedColor.toLowerCase())) {
      savedColor = storedColor.toLowerCase();
    }
  } catch (err) {}
  applyThemeColor(savedColor);

  try {
    const storedWp = localStorage.getItem('rinswa_wallpaper');
    if (storedWp) currentWp = storedWp;

    const storedShowImage = localStorage.getItem('rinswa_show_image');
    if (storedShowImage !== null) {
      showImageEnabled = (storedShowImage === 'true');
    }
    if (toggleShowImage) toggleShowImage.checked = showImageEnabled;
  } catch (err) {}
  updateWallpaperDisplay();
  try {
    const storedEngine = localStorage.getItem('rinswa_search_engine');
    if (storedEngine) {
      searchEngineRadios.forEach(radio => {
        radio.checked = (radio.value === storedEngine);
      });
    }
  } catch (err) {}

  // Floating Rinswa Theme Button & Dome Click
  const floatingBtn = document.getElementById('floating-btn-settings');
  if (floatingBtn) {
    floatingBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSettings();
    });
  }

  const domeEmblem = document.querySelector('.center-dome-emblem');
  if (domeEmblem) {
    domeEmblem.style.cursor = 'pointer';
    domeEmblem.addEventListener('click', () => {
      openSettings();
    });
  }

  // Bottom Default Browser Banner
  const btnDismissBanner = document.getElementById('btn-dismiss-banner');
  const bottomBanner = document.getElementById('bottom-default-banner');
  if (btnDismissBanner && bottomBanner) {
    btnDismissBanner.addEventListener('click', () => {
      bottomBanner.style.display = 'none';
    });
  }

  // ==========================================================================
  // 10. Organic Fluid Flowing Canvas Animation Engine
  // ==========================================================================
  function initFluidAnimation() {
    const canvas = document.getElementById('ntpFluidCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    // 6 Fluid Viscous Stream Nodes with organic trajectories
    const streams = [
      { x: 0.2, y: 0.3, r: 0.38, vx: 0.0004, vy: 0.0003, color1: 'rgba(0, 240, 255, 0.45)', color2: 'rgba(6, 182, 212, 0)' },
      { x: 0.8, y: 0.7, r: 0.42, vx: -0.0003, vy: -0.0004, color1: 'rgba(139, 92, 246, 0.40)', color2: 'rgba(99, 102, 241, 0)' },
      { x: 0.5, y: 0.4, r: 0.35, vx: 0.0005, vy: -0.0002, color1: 'rgba(16, 185, 129, 0.35)', color2: 'rgba(20, 184, 166, 0)' },
      { x: 0.3, y: 0.8, r: 0.40, vx: -0.0002, vy: 0.0004, color1: 'rgba(59, 130, 246, 0.40)', color2: 'rgba(37, 99, 235, 0)' },
      { x: 0.7, y: 0.2, r: 0.36, vx: 0.0003, vy: -0.0005, color1: 'rgba(236, 72, 153, 0.30)', color2: 'rgba(244, 63, 94, 0)' },
      { x: 0.5, y: 0.85, r: 0.32, vx: -0.0004, vy: -0.0003, color1: 'rgba(0, 210, 255, 0.35)', color2: 'rgba(0, 180, 255, 0)' }
    ];

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = e.clientX / width;
      targetMouseY = e.clientY / height;
    });

    let time = 0;
    function render() {
      if (document.hidden) {
        requestAnimationFrame(render);
        return;
      }

      time += 0.004;
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';

      const minDim = Math.min(width, height);

      streams.forEach((s, idx) => {
        // Fluid harmonic wave offset
        const waveX = Math.sin(time * 1.2 + idx * 1.5) * 0.06;
        const waveY = Math.cos(time * 0.9 + idx * 1.3) * 0.06;
        const mouseInfluence = (1 - Math.hypot(s.x - mouseX, s.y - mouseY)) * 0.03;

        s.x += s.vx + waveX * 0.01 + (mouseX - 0.5) * mouseInfluence;
        s.y += s.vy + waveY * 0.01 + (mouseY - 0.5) * mouseInfluence;

        // Toroidal viscous wrap
        if (s.x < -0.2) s.x = 1.2;
        if (s.x > 1.2) s.x = -0.2;
        if (s.y < -0.2) s.y = 1.2;
        if (s.y > 1.2) s.y = -0.2;

        const posX = (s.x + waveX) * width;
        const posY = (s.y + waveY) * height;
        const radius = (s.r + Math.sin(time * 2 + idx) * 0.04) * minDim * 1.4;

        const grad = ctx.createRadialGradient(posX, posY, 0, posX, posY, Math.max(1, radius));
        grad.addColorStop(0, s.color1);
        grad.addColorStop(0.55, s.color1.replace(/[\d\.]+\)$/, '0.15)'));
        grad.addColorStop(1, s.color2);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFluidAnimation);
  } else {
    initFluidAnimation();
  }

})();

