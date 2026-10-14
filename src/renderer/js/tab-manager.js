/**
 * Rinswa Chromium Browser - Tab Manager
 * Handles multi-tab webviews, tabstrip rendering, lifecycle, and memory sleeping.
 * Developed by Arindam Makar
 */

class TabManager {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.closedTabsStack = [];
    this.tabsListEl = document.getElementById('tabs-list');
    this.viewportEl = document.getElementById('browser-viewport');
    this.tabsCountBadge = document.getElementById('tabs-count-badge');
    this.newtabUrl = pathToFileURL('../pages/newtab/index.html');
  }

  init() {
    // Open initial tab
    this.createTab({ url: this.newtabUrl, title: 'New Tab', active: true });

    // New Tab button
    document.getElementById('btn-new-tab').addEventListener('click', () => {
      this.createTab({ url: this.newtabUrl, title: 'New Tab', active: true });
    });
  }

  createTab({ url, title, active = true, category = null }) {
    const tabId = 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const resolvedUrl = url || this.newtabUrl;

    const tab = {
      id: tabId,
      url: resolvedUrl,
      title: title || 'New Tab',
      favicon: 'assets/Glossy Multicolour Ribbon R Emblem.png',
      isLoading: false,
      isMuted: false,
      isSleeping: false,
      category: category || this.detectCategory(resolvedUrl),
      createdAt: Date.now(),
      lastAccessedAt: Date.now()
    };

    // 1. Create Webview element
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.setAttribute('allowpopups', 'true');
    webview.src = resolvedUrl;
    this.viewportEl.appendChild(webview);
    tab.webview = webview;

    // 2. Create Tab Strip DOM Item
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    tabItem.id = `tab-item-${tabId}`;
    tabItem.innerHTML = `
      <img src="${tab.favicon}" class="tab-favicon" alt="Icon">
      <span class="tab-title">${this.escapeHtml(tab.title)}</span>
      <span class="tab-sleep-badge" style="display:none;" title="Sleeping to save RAM">💤</span>
      <button class="tab-mute-btn" style="display:none;" title="Mute tab">🔊</button>
      <button class="tab-close-btn" title="Close tab (Ctrl+W)">✕</button>
    `;
    this.tabsListEl.appendChild(tabItem);
    tab.tabItem = tabItem;

    // Attach Event Listeners to Tab Item
    tabItem.addEventListener('click', (e) => {
      if (e.target.closest('.tab-close-btn')) {
        e.stopPropagation();
        this.closeTab(tabId);
      } else if (e.target.closest('.tab-mute-btn')) {
        e.stopPropagation();
        this.toggleMute(tabId);
      } else {
        this.switchTab(tabId);
      }
    });

    // Middle-click to close
    tabItem.addEventListener('auxclick', (e) => {
      if (e.button === 1) {
        e.preventDefault();
        this.closeTab(tabId);
      }
    });

    // Bind Webview Lifecycle
    this.bindWebviewEvents(tab);

    this.tabs.push(tab);
    this.updateTabCountBadge();

    if (active || this.tabs.length === 1) {
      this.switchTab(tabId);
    }

    // Trigger smart tab update if drawer is open
    if (window.smartTabsEngine) {
      window.smartTabsEngine.render();
    }

    return tab;
  }

  switchTab(tabId) {
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    this.activeTabId = tabId;
    targetTab.lastAccessedAt = Date.now();

    // If tab is sleeping, wake it up
    if (targetTab.isSleeping) {
      this.wakeTab(tabId);
    }

    // Update Tab Items active class
    this.tabs.forEach(t => {
      if (t.tabItem) t.tabItem.classList.toggle('active', t.id === tabId);
      if (t.webview) t.webview.classList.toggle('active', t.id === tabId);
    });

    // Sync Omnibar
    if (window.navigationEngine) {
      window.navigationEngine.syncOmnibarWithActiveTab();
    }

    // Scroll active tab into view
    targetTab.tabItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    const tab = this.tabs[tabIndex];

    // Push to closed stack for Ctrl+Shift+T
    if (tab.url && !tab.url.includes('newtab')) {
      this.closedTabsStack.push({ url: tab.url, title: tab.title });
    }

    // Remove DOM
    if (tab.tabItem) tab.tabItem.remove();
    if (tab.webview) tab.webview.remove();

    this.tabs.splice(tabIndex, 1);
    this.updateTabCountBadge();

    // If active tab was closed, switch to adjacent or open new
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        const nextIndex = Math.min(tabIndex, this.tabs.length - 1);
        this.switchTab(this.tabs[nextIndex].id);
      } else {
        this.createTab({ url: this.newtabUrl, title: 'New Tab', active: true });
      }
    }

    if (window.smartTabsEngine) {
      window.smartTabsEngine.render();
    }
  }

  restoreClosedTab() {
    if (this.closedTabsStack.length > 0) {
      const last = this.closedTabsStack.pop();
      this.createTab({ url: last.url, title: last.title, active: true });
    }
  }

  getActiveTab() {
    return this.tabs.find(t => t.id === this.activeTabId);
  }

  bindWebviewEvents(tab) {
    const wv = tab.webview;

    wv.addEventListener('did-start-loading', () => {
      tab.isLoading = true;
      if (tab.id === this.activeTabId && window.navigationEngine) {
        window.navigationEngine.setLoadingState(true);
      }
    });

    wv.addEventListener('did-stop-loading', () => {
      tab.isLoading = false;
      if (tab.id === this.activeTabId && window.navigationEngine) {
        window.navigationEngine.setLoadingState(false);
        window.navigationEngine.syncOmnibarWithActiveTab();
      }
    });

    wv.addEventListener('page-title-updated', (e) => {
      tab.title = e.title;
      const titleEl = tab.tabItem.querySelector('.tab-title');
      if (titleEl) titleEl.textContent = e.title;

      // Add to history if not local
      if (window.rinswaAPI && window.rinswaAPI.history && !tab.url.includes('pages/')) {
        window.rinswaAPI.history.add({ url: tab.url, title: e.title });
      }
    });

    wv.addEventListener('page-favicon-updated', (e) => {
      if (e.favicons && e.favicons.length > 0) {
        tab.favicon = e.favicons[0];
        const favEl = tab.tabItem.querySelector('.tab-favicon');
        if (favEl) favEl.src = e.favicons[0];
      }
    });

    wv.addEventListener('did-navigate', (e) => {
      tab.url = e.url;
      tab.category = this.detectCategory(e.url);
      if (tab.id === this.activeTabId && window.navigationEngine) {
        window.navigationEngine.syncOmnibarWithActiveTab();
      }
    });

    wv.addEventListener('new-window', (e) => {
      e.preventDefault();
      this.createTab({ url: e.url, active: true });
    });

    wv.addEventListener('media-started-playing', () => {
      const muteBtn = tab.tabItem.querySelector('.tab-mute-btn');
      if (muteBtn) muteBtn.style.display = 'block';
    });

    wv.addEventListener('media-paused', () => {
      const muteBtn = tab.tabItem.querySelector('.tab-mute-btn');
      if (muteBtn && !tab.isMuted) muteBtn.style.display = 'none';
    });
  }

  toggleMute(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.webview) return;

    tab.isMuted = !tab.isMuted;
    tab.webview.setAudioMuted(tab.isMuted);

    const muteBtn = tab.tabItem.querySelector('.tab-mute-btn');
    if (muteBtn) {
      muteBtn.textContent = tab.isMuted ? '🔇' : '🔊';
      muteBtn.style.display = 'block';
    }
  }

  // Sleep / Hibernation for RAM Savings
  sleepTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || tab.id === this.activeTabId || tab.isSleeping) return;

    tab.isSleeping = true;
    tab.savedUrl = tab.webview.getURL() || tab.url;
    // Unload webview by setting to blank to drop memory
    tab.webview.src = 'about:blank';

    const sleepBadge = tab.tabItem.querySelector('.tab-sleep-badge');
    if (sleepBadge) sleepBadge.style.display = 'inline-block';
  }

  wakeTab(tabId) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !tab.isSleeping) return;

    tab.isSleeping = false;
    tab.webview.src = tab.savedUrl || tab.url;

    const sleepBadge = tab.tabItem.querySelector('.tab-sleep-badge');
    if (sleepBadge) sleepBadge.style.display = 'none';
  }

  detectCategory(url) {
    if (!url) return 'general';
    const lower = url.toLowerCase();
    if (lower.includes('github') || lower.includes('gitlab') || lower.includes('stackoverflow') || lower.includes('dev.to') || lower.includes('figma') || lower.includes('laravel') || lower.includes('vercel')) return 'work';
    if (lower.includes('amazon') || lower.includes('ebay') || lower.includes('flipkart') || lower.includes('walmart') || lower.includes('shopping')) return 'shopping';
    if (lower.includes('gmail') || lower.includes('twitter') || lower.includes('x.com') || lower.includes('reddit') || lower.includes('discord') || lower.includes('whatsapp')) return 'personal';
    if (lower.includes('youtube') || lower.includes('spotify') || lower.includes('netflix') || lower.includes('twitch')) return 'media';
    if (lower.includes('wikipedia') || lower.includes('arxiv') || lower.includes('medium') || lower.includes('scholar')) return 'docs';
    return 'general';
  }

  updateTabCountBadge() {
    if (this.tabsCountBadge) {
      this.tabsCountBadge.textContent = this.tabs.length;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// File URL helper
function pathToFileURL(relPath) {
  return new URL(relPath, window.location.href).href;
}

window.tabManager = new TabManager();
