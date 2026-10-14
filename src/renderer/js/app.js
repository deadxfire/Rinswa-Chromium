/**
 * Rinswa Chromium Browser - Application Coordinator & Event Hub
 * Developed by Arindam Makar
 */

(function () {
  // Elements
  const winMinBtn = document.getElementById('win-min-btn');
  const winMaxBtn = document.getElementById('win-max-btn');
  const winCloseBtn = document.getElementById('win-close-btn');

  const btnMenu = document.getElementById('btn-menu');
  const mainMenu = document.getElementById('browser-main-menu');
  const zoomLevelLabel = document.getElementById('zoom-level-label');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');

  const findBar = document.getElementById('find-in-page-bar');
  const findInput = document.getElementById('find-input');
  const findMatches = document.getElementById('find-matches');
  const btnFindPrev = document.getElementById('btn-find-prev');
  const btnFindNext = document.getElementById('btn-find-next');
  const btnFindClose = document.getElementById('btn-find-close');

  const dlShelf = document.getElementById('downloads-shelf');
  const dlFilename = document.getElementById('dl-filename');
  const dlProgressFill = document.getElementById('dl-progress-fill');
  const btnDlShowFolder = document.getElementById('btn-dl-show-folder');
  const btnDlClose = document.getElementById('btn-dl-close');

  let currentZoom = 1.0;
  let lastDownloadedPath = '';

  // 1. Initialize Window Controls
  if (window.rinswaAPI && window.rinswaAPI.window) {
    winMinBtn.addEventListener('click', () => window.rinswaAPI.window.minimize());
    winMaxBtn.addEventListener('click', () => window.rinswaAPI.window.maximizeRestore());
    winCloseBtn.addEventListener('click', () => window.rinswaAPI.window.close());

    window.rinswaAPI.window.onStateChanged((state) => {
      winMaxBtn.title = state.isMaximized ? 'Restore' : 'Maximize';
    });
  }

  // 2. Initialize Subsystems
  window.tabManager.init();
  window.navigationEngine.init();
  window.smartTabsEngine.init();
  window.shieldsController.init();
  window.bookmarkManager.init();

  // 3. Main Menu
  btnMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    mainMenu.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!mainMenu.contains(e.target) && !btnMenu.contains(e.target)) {
      mainMenu.classList.remove('show');
    }
  });

  document.getElementById('menu-new-tab').addEventListener('click', () => {
    window.tabManager.createTab({ active: true });
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-new-window').addEventListener('click', () => {
    window.tabManager.createTab({ active: true });
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-history').addEventListener('click', () => {
    alert('History feature: Visit URLs to record history or clear from Settings.');
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-bookmarks').addEventListener('click', () => {
    window.bookmarkManager.toggleBar();
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-downloads').addEventListener('click', () => {
    if (lastDownloadedPath && window.rinswaAPI) {
      window.rinswaAPI.app.showItemInFolder(lastDownloadedPath);
    } else {
      alert('Downloads folder: Standard Windows Downloads location.');
    }
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-find').addEventListener('click', () => {
    openFindBar();
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-devtools').addEventListener('click', () => {
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview) {
      tab.webview.openDevTools();
    }
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-settings').addEventListener('click', () => {
    const settingsUrl = pathToFileURL('../pages/settings/index.html');
    window.tabManager.createTab({ url: settingsUrl, title: 'Settings', active: true });
    mainMenu.classList.remove('show');
  });

  document.getElementById('menu-about').addEventListener('click', () => {
    alert('Rinswa Browser (Chromium Edition)\nVersion 1.0.6 Stable\nDeveloped and maintained by Arindam Makar\nMPL-2.0 License');
    mainMenu.classList.remove('show');
  });

  // Zoom Controls
  function applyZoom(factor) {
    currentZoom = Math.max(0.5, Math.min(2.5, factor));
    zoomLevelLabel.textContent = Math.round(currentZoom * 100) + '%';
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview) {
      tab.webview.setZoomFactor(currentZoom);
    }
  }

  btnZoomIn.addEventListener('click', (e) => {
    e.stopPropagation();
    applyZoom(currentZoom + 0.1);
  });

  btnZoomOut.addEventListener('click', (e) => {
    e.stopPropagation();
    applyZoom(currentZoom - 0.1);
  });

  // 4. Find in Page
  function openFindBar() {
    findBar.style.display = 'flex';
    findInput.focus();
    findInput.select();
  }

  function closeFindBar() {
    findBar.style.display = 'none';
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview) {
      tab.webview.stopFindInPage('clearSelection');
    }
  }

  btnFindClose.addEventListener('click', closeFindBar);

  findInput.addEventListener('input', () => {
    const text = findInput.value;
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview && text) {
      tab.webview.findInPage(text);
    }
  });

  btnFindNext.addEventListener('click', () => {
    const text = findInput.value;
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview && text) {
      tab.webview.findInPage(text, { forward: true, findNext: true });
    }
  });

  btnFindPrev.addEventListener('click', () => {
    const text = findInput.value;
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview && text) {
      tab.webview.findInPage(text, { forward: false, findNext: true });
    }
  });

  // 5. Downloads Listener
  if (window.rinswaAPI && window.rinswaAPI.downloads) {
    window.rinswaAPI.downloads.onStarted((data) => {
      dlShelf.style.display = 'flex';
      dlFilename.textContent = data.filename;
      dlProgressFill.style.width = '0%';
      lastDownloadedPath = data.savePath;
    });

    window.rinswaAPI.downloads.onProgress((data) => {
      if (data.totalBytes > 0) {
        const pct = Math.round((data.receivedBytes / data.totalBytes) * 100);
        dlProgressFill.style.width = pct + '%';
      }
    });

    window.rinswaAPI.downloads.onCompleted((data) => {
      dlProgressFill.style.width = '100%';
      dlFilename.textContent = `${data.filename} (${data.state === 'completed' ? 'Finished' : 'Cancelled'})`;
      lastDownloadedPath = data.savePath;
    });
  }

  btnDlShowFolder.addEventListener('click', () => {
    if (lastDownloadedPath && window.rinswaAPI) {
      window.rinswaAPI.app.showItemInFolder(lastDownloadedPath);
    }
  });

  btnDlClose.addEventListener('click', () => {
    dlShelf.style.display = 'none';
  });

  // 6. Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+T: New Tab
    if (e.ctrlKey && e.key.toLowerCase() === 't' && !e.shiftKey) {
      e.preventDefault();
      window.tabManager.createTab({ active: true });
    }
    // Ctrl+W: Close Tab
    else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      window.tabManager.closeTab(window.tabManager.activeTabId);
    }
    // Ctrl+Shift+T: Restore Tab
    else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      window.tabManager.restoreClosedTab();
    }
    // Ctrl+R or F5: Reload
    else if ((e.ctrlKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
      e.preventDefault();
      window.navigationEngine.reload();
    }
    // Ctrl+L or Alt+D: Focus Omnibar
    else if ((e.ctrlKey && e.key.toLowerCase() === 'l') || (e.altKey && e.key.toLowerCase() === 'd')) {
      e.preventDefault();
      const omni = document.getElementById('omnibar-input');
      if (omni) {
        omni.focus();
        omni.select();
      }
    }
    // Ctrl+D: Bookmark Current Tab
    else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      window.bookmarkManager.toggleCurrentBookmark();
    }
    // Ctrl+Shift+B: Toggle Bookmarks Bar
    else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      window.bookmarkManager.toggleBar();
    }
    // Ctrl+F: Find in Page
    else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openFindBar();
    }
    // Ctrl+Shift+I or F12: DevTools
    else if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') || e.key === 'F12') {
      e.preventDefault();
      const tab = window.tabManager.getActiveTab();
      if (tab && tab.webview) tab.webview.openDevTools();
    }
    // Ctrl+1 through Ctrl+8: Switch to tab index
    else if (e.ctrlKey && e.key >= '1' && e.key <= '8') {
      const idx = parseInt(e.key, 10) - 1;
      if (window.tabManager.tabs[idx]) {
        window.tabManager.switchTab(window.tabManager.tabs[idx].id);
      }
    }
    // Ctrl+9: Switch to last tab
    else if (e.ctrlKey && e.key === '9') {
      const last = window.tabManager.tabs[window.tabManager.tabs.length - 1];
      if (last) window.tabManager.switchTab(last.id);
    }
  });
})();
