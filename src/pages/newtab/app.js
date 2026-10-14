/**
 * Rinswa Chromium Browser - New Tab Page Logic
 * Developed by Arindam Makar
 */

(function () {
  // Elements
  const clockEl = document.getElementById('digital-clock');
  const greetingEl = document.getElementById('greeting-text');
  const searchInput = document.getElementById('search-input');
  const searchSubmitBtn = document.getElementById('search-submit-btn');
  const searchEngineBtn = document.getElementById('search-engine-btn');
  const engineDropdown = document.getElementById('engine-dropdown');
  const currentEngineIcon = document.getElementById('current-engine-icon');
  const currentEngineName = document.getElementById('current-engine-name');
  const shortcutsGrid = document.getElementById('shortcuts-grid');
  const blockedCountEl = document.getElementById('blocked-count');
  const themeSwitcherBtn = document.getElementById('btn-theme-switcher');
  const themeMenu = document.getElementById('theme-menu');
  const settingsBtn = document.getElementById('btn-open-settings');

  // Search Engine Queries
  const engines = {
    duckduckgo: { name: 'DuckDuckGo', icon: '🦆', query: 'https://duckduckgo.com/?q=' },
    google: { name: 'Google', icon: '🔍', query: 'https://www.google.com/search?q=' },
    brave: { name: 'Brave Search', icon: '🦁', query: 'https://search.brave.com/search?q=' },
    bing: { name: 'Bing', icon: '🌐', query: 'https://www.bing.com/search?q=' }
  };

  let activeEngine = 'duckduckgo';

  // Default Shortcuts
  const defaultShortcuts = [
    { title: 'GitHub', url: 'https://github.com', icon: '💻' },
    { title: 'YouTube', url: 'https://youtube.com', icon: '🎬' },
    { title: 'Reddit', url: 'https://reddit.com', icon: '💬' },
    { title: 'Wikipedia', url: 'https://wikipedia.org', icon: '📚' },
    { title: 'Amazon', url: 'https://amazon.com', icon: '🛍️' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '⚡' },
    { title: 'Twitter / X', url: 'https://x.com', icon: '🌐' },
    { title: 'Laravel', url: 'https://laravel.com', icon: '🚀' }
  ];

  // Update Clock & Greeting
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockEl.textContent = `${hours}:${minutes}`;

    const currentHour = now.getHours();
    let greeting = 'Good evening';
    if (currentHour < 12) greeting = 'Good morning';
    else if (currentHour < 17) greeting = 'Good afternoon';

    greetingEl.textContent = `${greeting}, Arindam`;
  }

  setInterval(updateClock, 1000);
  updateClock();

  // Render Shortcuts
  function renderShortcuts() {
    shortcutsGrid.innerHTML = '';
    defaultShortcuts.forEach((item) => {
      const tile = document.createElement('a');
      tile.className = 'shortcut-tile';
      tile.href = item.url;
      tile.innerHTML = `
        <div class="shortcut-icon-box">${item.icon}</div>
        <div class="shortcut-label" title="${item.title}">${item.title}</div>
      `;
      tile.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = item.url;
      });
      shortcutsGrid.appendChild(tile);
    });

    // Add Shortcut Button
    const addTile = document.createElement('div');
    addTile.className = 'shortcut-tile';
    addTile.innerHTML = `
      <div class="shortcut-icon-box" style="border-style:dashed;">➕</div>
      <div class="shortcut-label">Add Shortcut</div>
    `;
    addTile.addEventListener('click', () => {
      const url = prompt('Enter website URL (e.g. https://example.com):');
      if (url) {
        const title = prompt('Enter shortcut title:') || url;
        defaultShortcuts.push({ title, url, icon: '🔖' });
        renderShortcuts();
      }
    });
    shortcutsGrid.appendChild(addTile);
  }

  renderShortcuts();

  // Search Dispatcher
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    // Check if query is a direct URL
    const isUrl = /^(https?:\/\/|[a-z0-9]+\.[a-z]{2,})/i.test(query) && !query.includes(' ');
    if (isUrl) {
      const targetUrl = query.startsWith('http') ? query : `https://${query}`;
      window.location.href = targetUrl;
    } else {
      const engineUrl = engines[activeEngine].query + encodeURIComponent(query);
      window.location.href = engineUrl;
    }
  }

  searchSubmitBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  // Engine Dropdown
  searchEngineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    engineDropdown.classList.toggle('show');
  });

  document.querySelectorAll('.engine-option').forEach((option) => {
    option.addEventListener('click', () => {
      const selected = option.getAttribute('data-engine');
      if (engines[selected]) {
        activeEngine = selected;
        currentEngineIcon.textContent = engines[selected].icon;
        currentEngineName.textContent = engines[selected].name;
        document.querySelectorAll('.engine-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
      }
      engineDropdown.classList.remove('show');
    });
  });

  // Theme / Wallpaper Switcher
  themeSwitcherBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('show');
  });

  document.querySelectorAll('#theme-menu .menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      const bg = item.getAttribute('data-bg');
      document.body.className = `theme-${bg}`;
      document.querySelectorAll('#theme-menu .menu-item').forEach(m => m.classList.remove('active'));
      item.classList.add('active');
      themeMenu.classList.remove('show');
    });
  });

  // Settings Button
  settingsBtn.addEventListener('click', () => {
    window.location.href = '../settings/index.html';
  });

  // Close menus on outside click
  document.addEventListener('click', () => {
    engineDropdown.classList.remove('show');
    themeMenu.classList.remove('show');
  });

  // Shields Stat Hook
  if (window.rinswaAPI && window.rinswaAPI.shields) {
    window.rinswaAPI.shields.getStats().then(stats => {
      if (stats && blockedCountEl) {
        blockedCountEl.textContent = stats.trackersBlocked + stats.adsBlocked;
      }
    });

    window.rinswaAPI.shields.onStatUpdated((data) => {
      if (data && data.stats && blockedCountEl) {
        blockedCountEl.textContent = data.stats.trackersBlocked + data.stats.adsBlocked;
      }
    });
  }
})();
