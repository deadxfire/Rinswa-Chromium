/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Rinswa Branding Preferences - Official Stable v1.0.6
pref("startup.homepage_override_url", "https://deadxfire.github.io/Rinswa-Browser-Support/");
pref("startup.homepage_welcome_url", "https://deadxfire.github.io/Rinswa-Browser-Support/");
pref("startup.homepage_welcome_url.additional", "");
pref("browser.startup.homepage", "https://deadxfire.github.io/Rinswa-Browser-Support/");
pref("app.update.channel", "release");
pref("app.update.interval", 86400);
pref("app.update.promptWaitTime", 86400);
pref("app.update.url", "https://raw.githubusercontent.com/deadxfire/Rinswa-browser/main/update.xml");
pref("app.update.url.manual", "https://github.com/deadxfire/Rinswa-browser/releases");
pref("app.update.url.details", "https://github.com/deadxfire/Rinswa-browser/releases");
pref("app.update.checkInstallTime.days", 2);
pref("app.update.badgeWaitTime", 0);
pref("app.update.service.enabled", false);
pref("app.update.staging.enabled", false);
pref("devtools.selfxss.count", 5);

// Support & Help Links (appends topic cleanly without 404)
pref("app.support.baseURL", "https://deadxfire.github.io/Rinswa-Browser-Support/support.html?topic=");
pref("app.feedback.baseURL", "https://github.com/deadxfire/Rinswa-browser/issues");

// Web Compatibility: Present real Firefox version for universal site compatibility (WhatsApp, Google Meet, Banking)
pref("general.useragent.override", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0");
pref("general.useragent.compatMode.firefox", true);
pref("browser.urlbar.trustPanel.featureGate", true);
pref("browser.urlbar.trustPanel.breachAlerts.featureGate", true);
pref("browser.urlbar.trustPanel.breachAlerts", true);

// Clean Minimal Home Screen: Only Search & Favorites (No News/Stories/Pocket/Sponsored Clutter)
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.section.highlights.includePocket", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.feeds.discoverystreamfeed", false);
pref("browser.newtabpage.activity-stream.discoverystream.enabled", false);
pref("browser.newtabpage.activity-stream.feeds.snippets", false);
pref("browser.newtabpage.activity-stream.feeds.topsites", true);
pref("browser.newtabpage.activity-stream.showSearch", true);
pref("browser.startup.homepage.abouthome_cache.enabled", false);

// Auto-enable bundled distribution extensions (uBlock Origin) on first run
pref("extensions.autoDisableScopes", 0);
pref("extensions.enabledScopes", 15);

// Disable custom browser icon picker in Appearance settings (only Rinswa icon is supported)
pref("browser.shell.customIcon.enabled", false);

// Smart Window & Tab Groups (Default enabled for official Rinswa experience)
pref("browser.smartwindow.enabled", true);
pref("browser.smartwindow.firstrun.hasCompleted", true);
pref("browser.smartwindow.isDefaultWindow", true);
pref("browser.smartwindow.autoTabGrouping.enabled", true);
pref("browser.tabs.groups.enabled", true);
pref("browser.tabs.groups.smart.enabled", true);
pref("browser.tabs.groups.alternateMenu", true);
pref("browser.tabs.groups.smart.userEnabled", true);
pref("browser.tabs.groups.smart.optin", true);
pref("places.semanticHistory.smartwindow.featureGate", true);

// Wallpaper & Theme Customization
pref("browser.newtabpage.activity-stream.newtabWallpapers.enabled", true);
pref("browser.newtabpage.activity-stream.newtabWallpapers.customWallpaper.enabled", true);
pref("browser.newtabpage.activity-stream.newtabWallpapers.customWallpaper.library.enabled", true);
pref("browser.newtabpage.activity-stream.newtabWallpapers.user.enabled", true);

// Default Theme - Rinswa Cyber-Glass Light Theme
pref("extensions.activeThemeID", "firefox-compact-light@mozilla.org");
pref("browser.theme.toolbar-theme", 0);
pref("browser.theme.content-theme", 2);
pref("ui.systemUsesDarkTheme", 0);

// Cyber-Glass Stylesheet Customization & SVG Context Properties
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
pref("svg.context-properties.content.enabled", true);

// Completely disable Vertical Tabs & Sidebar Revamp
pref("sidebar.revamp", false);
pref("sidebar.verticalTabs", false);
pref("sidebar.visibility", "hide-sidebar");
pref("sidebar.main.tools", "");


// Low RAM & High-Efficiency Performance Tuning (Chromium-level ~200MB Startup)
// 1. Process limits & eliminate prelaunch process overhead
pref("dom.ipc.processCount", 2);
pref("dom.ipc.processCount.webIsolated", 1);
pref("dom.ipc.processPrelaunch.enabled", false);
pref("dom.ipc.processPrelaunch.fission.enabled", false);
pref("browser.tabs.remote.warmup.enabled", false);
pref("browser.tabs.remote.warmup.maxTabs", 0);

// 2. On-demand lazy session restore (prevents mass-loading restored & pinned tabs at startup)
pref("browser.sessionstore.restore_on_demand", true);
pref("browser.sessionstore.restore_pinned_tabs_on_demand", true);
pref("browser.sessionstore.restore_tabs_lazily", true);
pref("browser.newtabpage.activity-stream.prerender", false);

// 3. Proactive Tab Unloading / Sleeping for inactive tabs
pref("browser.tabs.unloadOnLowMemory", true);
pref("browser.tabs.min_inactive_duration_before_unload", 60000); // 1 minute
pref("browser.tabs.unloadTabInContextMenu", true);
pref("browser.tabs.fadeOutExplicitlyUnloadedTabs", true);
pref("browser.tabs.fadeOutUnloadedTabs", true);

// 4. BFCache (Back-Forward Cache) Limits
pref("browser.sessionhistory.max_total_viewers", 1);
pref("browser.sessionhistory.max_entries", 10);

// 5. Cap Network Memory Cache (forces network cache to use fast disk instead of bloating RAM)
pref("browser.cache.memory.enable", true);
pref("browser.cache.memory.capacity", 16384); // 16 MB max
pref("browser.cache.memory.max_entry_size", 2048); // 2 MB max entry
pref("browser.cache.disk.max_chunks_memory_usage", 5120); // 5 MB
pref("browser.cache.disk.max_priority_chunks_memory_usage", 5120); // 5 MB

// 6. Image Surface Cache Optimization (aggressively expires decoded image bitmaps)
pref("image.mem.discardable", true);
pref("image.mem.animated.discardable", true);
pref("image.mem.surfacecache.max_size_kb", 40960); // 40 MB max (down from 256 MB)
pref("image.mem.surfacecache.min_expiration_ms", 10000); // 10s expiration

// 7. SpiderMonkey JS Heap Compacting & Responsive GC
pref("javascript.options.compact_on_user_inactive", true);
pref("javascript.options.compact_on_user_inactive_delay", 5000); // 5s idle delay
pref("javascript.options.gc_on_memory_pressure", true);
pref("javascript.options.gc_delay", 500);
pref("javascript.options.mem.gc_compacting", true);
pref("javascript.options.mem.gc_per_zone", true);
pref("javascript.options.mem.high_water_mark", 64);

// 8. Media Cache Memory Optimization (prevents video streams buffering deeply into RAM)
pref("media.memory_cache_max_size", 2048); // 2 MB
pref("media.memory_caches_combined_limit_kb", 32768); // 32 MB combined max

// 9. Session Store I/O and Memory Churn
pref("browser.sessionstore.interval", 30000); // 30s interval

// 10. Disable unnecessary background prefetching & speculative connections
pref("network.prefetch-next", false);
pref("network.dns.disablePrefetch", true);
pref("network.http.speculative-parallel-limit", 0);
pref("browser.places.speculativeConnect.enabled", false);

// 11. Disable accessibility tree duplication unless requested
pref("accessibility.force_disabled", 1);

// 12. GPU / Canvas cache sizing
pref("gfx.canvas.accelerated.cache-items", 512);
pref("gfx.canvas.accelerated.cache-size", 64);

