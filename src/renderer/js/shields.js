/**
 * Rinswa Chromium Browser - Privacy Shields Controller
 * Developed by Arindam Makar
 */

class ShieldsController {
  constructor() {
    this.btnShield = document.getElementById('btn-shield');
    this.popoverEl = document.getElementById('shields-popover');
    this.countBadge = document.getElementById('shield-count-badge');
    this.popoverTrackers = document.getElementById('popover-trackers-count');
    this.popoverAds = document.getElementById('popover-ads-count');
    this.siteDomainEl = document.getElementById('shields-site-domain');
    this.masterToggle = document.getElementById('shield-master-toggle');

    this.stats = {
      trackersBlocked: 0,
      adsBlocked: 0
    };
  }

  init() {
    this.btnShield.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePopover();
    });

    document.addEventListener('click', (e) => {
      if (!this.popoverEl.contains(e.target) && !this.btnShield.contains(e.target)) {
        this.closePopover();
      }
    });

    this.masterToggle.addEventListener('change', () => {
      if (window.rinswaAPI && window.rinswaAPI.shields) {
        window.rinswaAPI.shields.toggle(this.masterToggle.checked);
      }
    });

    // Hook API events
    if (window.rinswaAPI && window.rinswaAPI.shields) {
      window.rinswaAPI.shields.getStats().then(s => {
        if (s) this.updateStats(s);
      });

      window.rinswaAPI.shields.onStatUpdated(data => {
        if (data && data.stats) this.updateStats(data.stats);
      });
    }
  }

  togglePopover() {
    this.popoverEl.classList.toggle('show');
    if (this.popoverEl.classList.contains('show')) {
      this.updateCurrentSite();
    }
  }

  closePopover() {
    this.popoverEl.classList.remove('show');
  }

  updateStats(newStats) {
    this.stats = newStats;
    const totalBlocked = (newStats.trackersBlocked || 0) + (newStats.adsBlocked || 0);

    if (this.countBadge) {
      this.countBadge.textContent = totalBlocked;
    }
    if (this.popoverTrackers) {
      this.popoverTrackers.textContent = newStats.trackersBlocked || 0;
    }
    if (this.popoverAds) {
      this.popoverAds.textContent = newStats.adsBlocked || 0;
    }
  }

  updateCurrentSite() {
    if (!window.tabManager) return;
    const activeTab = window.tabManager.getActiveTab();
    if (!activeTab || !activeTab.url) return;

    try {
      if (activeTab.url.includes('pages/')) {
        this.siteDomainEl.textContent = 'Rinswa Internal Page';
      } else {
        const parsed = new URL(activeTab.url);
        this.siteDomainEl.textContent = parsed.hostname;
      }
    } catch (e) {
      this.siteDomainEl.textContent = 'Protected Connection';
    }
  }
}

window.shieldsController = new ShieldsController();
