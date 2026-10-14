/**
 * Rinswa Chromium Browser - Settings Page Logic
 * Developed by Arindam Makar
 */

(function () {
  // Navigation tabs
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const backBtn = document.getElementById('btn-back-to-browsing');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetSecId = item.getAttribute('data-section');
      navItems.forEach(n => n.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      item.classList.add('active');
      const targetSec = document.getElementById(targetSecId);
      if (targetSec) targetSec.classList.add('active');
    });
  });

  backBtn.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '../newtab/index.html';
    }
  });

  // Controls
  const selectSearchEngine = document.getElementById('select-search-engine');
  const toggleRestoreSession = document.getElementById('toggle-restore-session');
  const selectThemeMode = document.getElementById('select-theme-mode');
  const selectWallpaper = document.getElementById('select-wallpaper');
  const toggleShields = document.getElementById('toggle-shields');
  const toggleAggressiveShields = document.getElementById('toggle-aggressive-shields');
  const toggleHttpsOnly = document.getElementById('toggle-https-only');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const selectSleepTimeout = document.getElementById('select-sleep-timeout');
  const toggleAutoGroup = document.getElementById('toggle-auto-group');
  const toggleDupWarning = document.getElementById('toggle-dup-warning');
  const specEngine = document.getElementById('spec-engine');

  // Load Settings from API
  if (window.rinswaAPI) {
    if (window.rinswaAPI.settings) {
      window.rinswaAPI.settings.get().then((settings) => {
        if (!settings) return;
        if (selectSearchEngine) selectSearchEngine.value = settings.searchEngine || 'duckduckgo';
        if (toggleRestoreSession) toggleRestoreSession.checked = settings.restorePreviousSession ?? true;
        if (selectThemeMode) selectThemeMode.value = settings.theme || 'dark-cyber';
        if (selectWallpaper) selectWallpaper.value = settings.wallpaper || 'alpine';
        if (toggleShields) toggleShields.checked = settings.shieldsEnabled ?? true;
        if (toggleAggressiveShields) toggleAggressiveShields.checked = settings.shieldsAggressive ?? false;
        if (toggleHttpsOnly) toggleHttpsOnly.checked = settings.httpsOnly ?? true;
        if (selectSleepTimeout) selectSleepTimeout.value = String(settings.tabSleepMinutes ?? 30);
      });
    }

    if (window.rinswaAPI.app && specEngine) {
      window.rinswaAPI.app.getVersion().then((info) => {
        if (info && info.engine) {
          specEngine.textContent = info.engine;
        }
      });
    }

    // Bind change listeners to persist settings
    function persist() {
      if (!window.rinswaAPI.settings) return;
      const updated = {
        searchEngine: selectSearchEngine.value,
        restorePreviousSession: toggleRestoreSession.checked,
        theme: selectThemeMode.value,
        wallpaper: selectWallpaper.value,
        shieldsEnabled: toggleShields.checked,
        shieldsAggressive: toggleAggressiveShields.checked,
        httpsOnly: toggleHttpsOnly.checked,
        tabSleepMinutes: parseInt(selectSleepTimeout.value, 10)
      };
      window.rinswaAPI.settings.save(updated);
    }

    [selectSearchEngine, toggleRestoreSession, selectThemeMode, selectWallpaper,
     toggleShields, toggleAggressiveShields, toggleHttpsOnly, selectSleepTimeout,
     toggleAutoGroup, toggleDupWarning].forEach((el) => {
      if (el) el.addEventListener('change', persist);
    });

    if (btnClearHistory) {
      btnClearHistory.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire browsing history?')) {
          window.rinswaAPI.history.clear().then(() => {
            alert('Browsing history successfully cleared.');
          });
        }
      });
    }
  }
})();
