/**
 * Rinswa Chromium Browser - Bookmarks Manager
 * Developed by Arindam Makar
 */

class BookmarkManager {
  constructor() {
    this.bookmarksBar = document.getElementById('bookmarks-bar');
    this.btnBarToggle = document.getElementById('btn-bookmarks-bar-toggle');
    this.btnStar = document.getElementById('btn-bookmark-toggle');
    this.chipsContainer = document.getElementById('bookmarks-chips');

    this.bookmarks = [];
  }

  init() {
    this.btnBarToggle.addEventListener('click', () => {
      this.toggleBar();
    });

    this.btnStar.addEventListener('click', () => {
      this.toggleCurrentBookmark();
    });

    this.loadBookmarks();
  }

  toggleBar() {
    this.bookmarksBar.classList.toggle('show');
  }

  async loadBookmarks() {
    if (!window.rinswaAPI || !window.rinswaAPI.bookmarks) return;
    this.bookmarks = await window.rinswaAPI.bookmarks.get() || [];
    this.render();
  }

  render() {
    this.chipsContainer.innerHTML = '';
    this.bookmarks.forEach(bm => {
      const chip = document.createElement('div');
      chip.className = 'bookmark-chip';
      chip.innerHTML = `<span>${bm.icon || '🔖'}</span> <span>${this.escapeHtml(bm.title)}</span>`;
      chip.title = `${bm.title}\n${bm.url}`;

      chip.addEventListener('click', () => {
        if (window.tabManager) {
          const activeTab = window.tabManager.getActiveTab();
          if (activeTab && activeTab.webview) {
            activeTab.webview.loadURL(bm.url);
          }
        }
      });

      this.chipsContainer.appendChild(chip);
    });
  }

  async toggleCurrentBookmark() {
    if (!window.tabManager) return;
    const activeTab = window.tabManager.getActiveTab();
    if (!activeTab || !activeTab.url || activeTab.url.includes('pages/')) return;

    const url = activeTab.url;
    const isBookmarked = this.bookmarks.some(b => b.url === url);

    if (isBookmarked) {
      const found = this.bookmarks.find(b => b.url === url);
      if (found && window.rinswaAPI.bookmarks) {
        this.bookmarks = await window.rinswaAPI.bookmarks.remove(found.id);
        this.btnStar.classList.remove('active');
      }
    } else {
      if (window.rinswaAPI.bookmarks) {
        this.bookmarks = await window.rinswaAPI.bookmarks.add({
          title: activeTab.title || url,
          url: url,
          icon: '🔖'
        });
        this.btnStar.classList.add('active');
      }
    }

    this.render();
  }

  updateActiveStar(url) {
    const isBookmarked = this.bookmarks.some(b => b.url === url);
    this.btnStar.classList.toggle('active', isBookmarked);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.bookmarkManager = new BookmarkManager();
