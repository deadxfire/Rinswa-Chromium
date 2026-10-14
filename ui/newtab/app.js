/**
 * Rinswa Chromium Browser - Dynamic Theme Engine & New Tab Logic
 * Direct implementation of user specifications and provided design screenshot.
 * Developed by Arindam Makar
 */

(function () {
  // Elements
  const btnRinswaLogo = document.getElementById('btn-rinswa-logo');
  const dropdownMenu = document.getElementById('rinswa-dropdown-menu');
  const themeChips = document.querySelectorAll('.theme-chip');
  const wallpaperItems = document.querySelectorAll('.wallpaper-item');
  const wallpaperImage = document.getElementById('wallpaper-image');
  const wallpaperTint = document.getElementById('wallpaper-tint');
  
  const searchInput = document.getElementById('main-search-input');
  const btnSubmit = document.getElementById('btn-submit-arrow');
  const btnAddTabs = document.getElementById('btn-add-tabs');
  const flyout = document.getElementById('add-tabs-flyout');

  const navBack = document.getElementById('nav-btn-back');
  const navForward = document.getElementById('nav-btn-forward');
  const navReload = document.getElementById('nav-btn-reload');
  const btnCreateTab = document.getElementById('btn-create-tab');

  // 8 Theme Color Palette Specified by User:
  // #cbd8e1, #e4d6d8, #ccdfd8, #c7c7c7, #e1d0d1, #d1d1db, #e5d4ce, #e6decb
  const VALID_THEMES = [
    '#cbd8e1', '#e4d6d8', '#ccdfd8', '#c7c7c7',
    '#e1d0d1', '#d1d1db', '#e5d4ce', '#e6decb'
  ];

  // 1. Theme Color Switcher Logic
  function applyThemeColor(color) {
    if (!VALID_THEMES.includes(color.toLowerCase())) {
      color = '#cbd8e1'; // Default
    }

    document.documentElement.style.setProperty('--theme-color', color);
    document.body.setAttribute('data-theme', color);

    themeChips.forEach(chip => {
      const chipColor = chip.getAttribute('data-color');
      chip.classList.toggle('active', chipColor.toLowerCase() === color.toLowerCase());
    });

    try {
      localStorage.setItem('rinswa_theme_color', color);
    } catch (e) {}
  }

  // Bind clicks on color swatches
  themeChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedColor = chip.getAttribute('data-color');
      applyThemeColor(selectedColor);
    });
  });

  // 2. Wallpaper Switcher Logic (Default: Dreamy Meadow Mist Portrait.png)
  function applyWallpaper(wpKey) {
    wallpaperItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-wp') === wpKey);
    });

    if (wpKey === 'meadow') {
      wallpaperImage.style.display = 'block';
      wallpaperImage.style.backgroundImage = "url('Dreamy Meadow Mist Portrait.png')";
      wallpaperTint.style.opacity = '0.32';
    } else if (wpKey === 'softblue') {
      wallpaperImage.style.display = 'block';
      wallpaperImage.style.backgroundImage = "url('Soft Blue-to-White Gradient.png')";
      wallpaperTint.style.opacity = '0.4';
    } else if (wpKey === 'solid') {
      wallpaperImage.style.display = 'none';
      wallpaperTint.style.opacity = '1';
    }

    try {
      localStorage.setItem('rinswa_wallpaper', wpKey);
    } catch (e) {}
  }

  wallpaperItems.forEach(item => {
    item.addEventListener('click', () => {
      const key = item.getAttribute('data-wp');
      applyWallpaper(key);
    });
  });

  // 3. Upper Left Rinswa Logo Dropdown Menu Trigger
  btnRinswaLogo.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target) && !btnRinswaLogo.contains(e.target)) {
      dropdownMenu.classList.remove('show');
    }
  });

  // 4. Search Bar Logic (User: "instead of ask anything, it will work as the search bar")
  function executeSearch() {
    const raw = searchInput.value.trim();
    if (!raw) return;

    // Check if input is a valid URL or IP
    const hasProtocol = /^[a-zA-Z]+:\/\//i.test(raw);
    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(raw);

    let targetUrl;
    if (hasProtocol) {
      targetUrl = raw;
    } else if (isDomain && !raw.includes(' ')) {
      targetUrl = 'https://' + raw;
    } else {
      // Search with DuckDuckGo
      targetUrl = 'https://duckduckgo.com/?q=' + encodeURIComponent(raw);
    }

    window.location.href = targetUrl;
  }

  btnSubmit.addEventListener('click', executeSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeSearch();
  });

  // 5. "+ Add tabs or files" Flyout Toggle
  btnAddTabs.addEventListener('click', (e) => {
    e.stopPropagation();
    flyout.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!flyout.contains(e.target) && !btnAddTabs.contains(e.target)) {
      flyout.classList.remove('show');
    }
  });

  // 6. Pinned Tabs (Gmail, YouTube)
  document.querySelectorAll('.pinned-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const url = tab.getAttribute('data-url');
      if (url) window.location.href = url;
    });
  });

  // 7. Navigation Toolbar Actions
  navBack.addEventListener('click', () => window.history.back());
  navForward.addEventListener('click', () => window.history.forward());
  navReload.addEventListener('click', () => window.location.reload());

  btnCreateTab.addEventListener('click', () => {
    searchInput.focus();
    searchInput.select();
  });

  // 8. Caption Buttons (Simulate or Window actions)
  document.getElementById('cap-close').addEventListener('click', () => {
    if (window.close) window.close();
  });

  // Initialize from LocalStorage or Defaults
  let initialColor = '#cbd8e1';
  try {
    const saved = localStorage.getItem('rinswa_theme_color');
    if (saved && VALID_THEMES.includes(saved.toLowerCase())) {
      initialColor = saved;
    }
  } catch (e) {}
  applyThemeColor(initialColor);

  let initialWp = 'meadow';
  try {
    const savedWp = localStorage.getItem('rinswa_wallpaper');
    if (savedWp) initialWp = savedWp;
  } catch (e) {}
  applyWallpaper(initialWp);

})();
