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

})();
