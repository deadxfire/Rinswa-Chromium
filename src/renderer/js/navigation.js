/**
 * Rinswa Chromium Browser - Navigation & Omnibar Engine
 * Developed by Arindam Makar
 */

class NavigationEngine {
  constructor() {
    this.omnibarInput = document.getElementById('omnibar-input');
    this.securityIcon = document.getElementById('security-icon');
    this.loadingRibbon = document.getElementById('loading-ribbon-bar');
    this.btnBack = document.getElementById('btn-back');
    this.btnForward = document.getElementById('btn-forward');
    this.btnReload = document.getElementById('btn-reload');
    this.btnHome = document.getElementById('btn-home');
    this.dropdown = document.getElementById('omnibar-dropdown');
    this.resultsContainer = document.getElementById('omnibar-results');

    this.searchEngines = {
      duckduckgo: 'https://duckduckgo.com/?q=',
      google: 'https://www.google.com/search?q=',
      brave: 'https://search.brave.com/search?q=',
      bing: 'https://www.bing.com/search?q='
    };
    this.activeSearchEngine = 'duckduckgo';
  }

  init() {
    // Navigation Buttons
    this.btnBack.addEventListener('click', () => this.goBack());
    this.btnForward.addEventListener('click', () => this.goForward());
    this.btnReload.addEventListener('click', () => this.reload());
    this.btnHome.addEventListener('click', () => this.goHome());

    // Omnibar Events
    this.omnibarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.navigateTo(this.omnibarInput.value);
        this.hideDropdown();
      } else if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });

    this.omnibarInput.addEventListener('focus', () => {
      this.omnibarInput.select();
      this.showSuggestions(this.omnibarInput.value);
    });

    this.omnibarInput.addEventListener('input', () => {
      this.showSuggestions(this.omnibarInput.value);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.omnibar-wrapper')) {
        this.hideDropdown();
      }
    });

    // Load default search engine from settings
    if (window.rinswaAPI && window.rinswaAPI.settings) {
      window.rinswaAPI.settings.get().then(s => {
        if (s && s.searchEngine) this.activeSearchEngine = s.searchEngine;
      });
    }
  }

  navigateTo(query) {
    const activeTab = window.tabManager ? window.tabManager.getActiveTab() : null;
    if (!activeTab || !activeTab.webview) return;

    const trimmed = (query || '').trim();
    if (!trimmed) return;

    let targetUrl = trimmed;

    // Check if query is URL or search query
    const isDomainLike = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(trimmed);
    const hasProtocol = /^[a-zA-Z0-9]+:\/\//i.test(trimmed);

    if (hasProtocol) {
      targetUrl = trimmed;
    } else if (isDomainLike && !trimmed.includes(' ')) {
      targetUrl = 'https://' + trimmed;
    } else {
      const engineUrl = this.searchEngines[this.activeSearchEngine] || this.searchEngines.duckduckgo;
      targetUrl = engineUrl + encodeURIComponent(trimmed);
    }

    activeTab.webview.loadURL(targetUrl);
  }

  goBack() {
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview && tab.webview.canGoBack()) tab.webview.goBack();
  }

  goForward() {
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview && tab.webview.canGoForward()) tab.webview.goForward();
  }

  reload() {
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview) {
      if (tab.isLoading) {
        tab.webview.stop();
      } else {
        tab.webview.reload();
      }
    }
  }

  goHome() {
    const tab = window.tabManager.getActiveTab();
    if (tab && tab.webview) {
      tab.webview.loadURL(window.tabManager.newtabUrl);
    }
  }

  syncOmnibarWithActiveTab() {
    const tab = window.tabManager.getActiveTab();
    if (!tab || !tab.webview) return;

    const url = tab.webview.getURL() || tab.url || '';

    // If newtab or local internal page, keep clean
    if (url.includes('pages/newtab/index.html') || url === 'about:blank') {
      this.omnibarInput.value = '';
      this.omnibarInput.placeholder = 'Search with DuckDuckGo or enter web address...';
      this.securityIcon.textContent = '⚡';
      this.securityIcon.title = 'Rinswa System Page';
    } else if (url.includes('pages/settings/index.html')) {
      this.omnibarInput.value = 'rinswa://settings';
      this.securityIcon.textContent = '⚙️';
      this.securityIcon.title = 'Rinswa Settings';
    } else {
      this.omnibarInput.value = url;
      if (url.startsWith('https://')) {
        this.securityIcon.textContent = '🔒';
        this.securityIcon.title = 'Secure HTTPS Connection';
      } else {
        this.securityIcon.textContent = '⚠️';
        this.securityIcon.title = 'Insecure HTTP Connection';
      }
    }

    // Update Back / Forward buttons
    try {
      this.btnBack.disabled = !tab.webview.canGoBack();
      this.btnForward.disabled = !tab.webview.canGoForward();
    } catch (e) {}

    // Update Bookmark toggle state
    if (window.bookmarkManager) {
      window.bookmarkManager.updateActiveStar(url);
    }
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.loadingRibbon.className = 'loading-ribbon-bar loading';
      this.btnReload.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      this.btnReload.title = 'Stop loading';
    } else {
      this.loadingRibbon.className = 'loading-ribbon-bar finished';
      setTimeout(() => {
        this.loadingRibbon.className = 'loading-ribbon-bar';
      }, 400);
      this.btnReload.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="2.2" fill="none"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;
      this.btnReload.title = 'Reload page';
    }
  }

  showSuggestions(inputVal) {
    const val = (inputVal || '').trim();
    if (!val || val.startsWith('file://')) {
      this.hideDropdown();
      return;
    }

    this.resultsContainer.innerHTML = '';

    // Search Query Item
    const searchItem = document.createElement('div');
    searchItem.className = 'omnibar-result-item';
    searchItem.innerHTML = `
      <span class="result-icon">🔍</span>
      <span class="result-title">Search for "<b>${this.escapeHtml(val)}</b>"</span>
      <span class="result-url">${this.activeSearchEngine}</span>
    `;
    searchItem.addEventListener('click', () => {
      this.navigateTo(val);
      this.hideDropdown();
    });
    this.resultsContainer.appendChild(searchItem);

    // Direct Navigate Item
    const isDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/i.test(val);
    if (isDomain) {
      const navItem = document.createElement('div');
      navItem.className = 'omnibar-result-item';
      navItem.innerHTML = `
        <span class="result-icon">🌐</span>
        <span class="result-title">Navigate to <b>https://${this.escapeHtml(val)}</b></span>
      `;
      navItem.addEventListener('click', () => {
        this.navigateTo(val);
        this.hideDropdown();
      });
      this.resultsContainer.appendChild(navItem);
    }

    this.dropdown.classList.add('show');
  }

  hideDropdown() {
    this.dropdown.classList.remove('show');
  }

  escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.navigationEngine = new NavigationEngine();
