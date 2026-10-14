/**
 * Rinswa Chromium Browser - Smart Tabs & Clean Tabs Engine
 * Ported & enhanced from Rinswa Gecko Edition
 * Developed by Arindam Makar
 */

class SmartTabsEngine {
  constructor() {
    this.drawerEl = document.getElementById('smart-tabs-drawer');
    this.btnOpen = document.getElementById('btn-smart-tabs');
    this.btnClose = document.getElementById('btn-close-smart-tabs');
    this.auditTitleEl = document.getElementById('smart-audit-title');
    this.auditDetailsEl = document.getElementById('smart-audit-details');
    this.btnAutoClean = document.getElementById('btn-auto-clean');
    this.btnSleepInactive = document.getElementById('btn-sleep-inactive');
    this.workspacesChipsEl = document.getElementById('workspaces-chips');
    this.btnAddWorkspace = document.getElementById('btn-add-workspace');
    this.drawerTabsListEl = document.getElementById('drawer-tabs-list');

    this.activeCategoryFilter = 'all';
  }

  init() {
    this.btnOpen.addEventListener('click', () => this.toggleDrawer());
    this.btnClose.addEventListener('click', () => this.closeDrawer());

    // Category filter pills
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategoryFilter = pill.getAttribute('data-cat');
        this.render();
      });
    });

    // Auto Clean button
    this.btnAutoClean.addEventListener('click', () => this.cleanAutomatically());

    // Sleep Inactive button
    this.btnSleepInactive.addEventListener('click', () => this.sleepAllInactive());

    // Add Workspace button
    this.btnAddWorkspace.addEventListener('click', () => this.saveCurrentWorkspace());

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.drawerEl.classList.contains('show') &&
          !this.drawerEl.contains(e.target) &&
          !this.btnOpen.contains(e.target)) {
        this.closeDrawer();
      }
    });

    this.loadWorkspaces();
  }

  toggleDrawer() {
    this.drawerEl.classList.toggle('show');
    if (this.drawerEl.classList.contains('show')) {
      this.render();
    }
  }

  closeDrawer() {
    this.drawerEl.classList.remove('show');
  }

  render() {
    if (!window.tabManager) return;
    const tabs = window.tabManager.tabs;

    // 1. Audit Analysis
    const duplicates = this.findDuplicates(tabs);
    const sleepingCount = tabs.filter(t => t.isSleeping).length;

    this.auditTitleEl.textContent = `${tabs.length} Open Tabs Analyzed`;
    this.auditDetailsEl.textContent = `${duplicates.length} duplicate${duplicates.length === 1 ? '' : 's'} detected • ${sleepingCount} sleeping tab${sleepingCount === 1 ? '' : 's'}`;

    // 2. Filter Tabs by Category
    let filteredTabs = tabs;
    if (this.activeCategoryFilter !== 'all') {
      filteredTabs = tabs.filter(t => t.category === this.activeCategoryFilter);
    }

    // 3. Render Drawer Tabs List
    this.drawerTabsListEl.innerHTML = '';
    if (filteredTabs.length === 0) {
      this.drawerTabsListEl.innerHTML = `<div style="text-align:center;color:var(--fg-muted);padding:24px 0;">No tabs in this category</div>`;
      return;
    }

    filteredTabs.forEach(tab => {
      const isDup = duplicates.some(d => d.id === tab.id);
      const card = document.createElement('div');
      card.className = `drawer-tab-card ${isDup ? 'is-duplicate' : ''}`;
      card.innerHTML = `
        <span class="card-cat-badge">${tab.category.toUpperCase()}</span>
        <div class="card-title-wrap">
          <div class="card-title" title="${this.escapeHtml(tab.title)}">${this.escapeHtml(tab.title)}</div>
          <div class="card-url" title="${tab.url}">${tab.url}</div>
        </div>
        <div class="card-actions">
          <button class="card-btn btn-sleep" title="${tab.isSleeping ? 'Wake Tab' : 'Hibernate Tab'}">
            ${tab.isSleeping ? '💤' : '🌙'}
          </button>
          <button class="card-btn btn-close" title="Close Tab">✕</button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-close')) {
          e.stopPropagation();
          window.tabManager.closeTab(tab.id);
          this.render();
        } else if (e.target.closest('.btn-sleep')) {
          e.stopPropagation();
          if (tab.isSleeping) {
            window.tabManager.wakeTab(tab.id);
          } else {
            window.tabManager.sleepTab(tab.id);
          }
          this.render();
        } else {
          window.tabManager.switchTab(tab.id);
          this.closeDrawer();
        }
      });

      this.drawerTabsListEl.appendChild(card);
    });
  }

  findDuplicates(tabs) {
    const seen = new Set();
    const duplicates = [];

    tabs.forEach(tab => {
      const normalized = (tab.url || '').toLowerCase().replace(/#.*$/, '').replace(/\/$/, '');
      if (normalized && !normalized.includes('newtab')) {
        if (seen.has(normalized)) {
          duplicates.push(tab);
        } else {
          seen.add(normalized);
        }
      }
    });

    return duplicates;
  }

  cleanAutomatically() {
    if (!window.tabManager) return;
    const duplicates = this.findDuplicates(window.tabManager.tabs);

    let closedCount = 0;
    duplicates.forEach(tab => {
      window.tabManager.closeTab(tab.id);
      closedCount++;
    });

    // Also sleep inactive
    const sleptCount = this.sleepAllInactive();

    alert(`Rinswa Clean Tabs Audit:\n• Closed ${closedCount} duplicate tab(s)\n• Suspended ${sleptCount} inactive tab(s) to free RAM`);
    this.render();
  }

  sleepAllInactive() {
    if (!window.tabManager) return 0;
    let slept = 0;
    window.tabManager.tabs.forEach(tab => {
      if (tab.id !== window.tabManager.activeTabId && !tab.isSleeping) {
        window.tabManager.sleepTab(tab.id);
        slept++;
      }
    });
    this.render();
    return slept;
  }

  async loadWorkspaces() {
    if (!window.rinswaAPI || !window.rinswaAPI.workspaces) return;
    const list = await window.rinswaAPI.workspaces.get();
    this.renderWorkspaces(list || []);
  }

  renderWorkspaces(list) {
    this.workspacesChipsEl.innerHTML = '';
    list.forEach(ws => {
      const chip = document.createElement('div');
      chip.className = 'ws-chip';
      chip.innerHTML = `<span>${ws.icon || '📁'}</span> <span>${this.escapeHtml(ws.name)}</span>`;
      chip.title = `Restore workspace: ${ws.tabs ? ws.tabs.length : 0} tabs`;

      chip.addEventListener('click', () => {
        if (ws.tabs && ws.tabs.length > 0) {
          ws.tabs.forEach((url, i) => {
            window.tabManager.createTab({ url, active: i === 0 });
          });
          this.closeDrawer();
        }
      });

      this.workspacesChipsEl.appendChild(chip);
    });
  }

  async saveCurrentWorkspace() {
    const name = prompt('Enter a name for this workspace (e.g. Research, Shopping, Work):');
    if (!name || !name.trim()) return;

    const urls = window.tabManager.tabs
      .map(t => t.url)
      .filter(u => u && !u.includes('pages/newtab'));

    if (urls.length === 0) {
      alert('No web tabs currently open to save in workspace.');
      return;
    }

    if (window.rinswaAPI && window.rinswaAPI.workspaces) {
      const updated = await window.rinswaAPI.workspaces.save({
        name: name.trim(),
        icon: '💼',
        tabs: urls
      });
      this.renderWorkspaces(updated);
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.smartTabsEngine = new SmartTabsEngine();
