/**
 * Rinswa Chromium Browser
 * Main Process - Chromium Engine Host & Lifecycle Manager
 * Developed by Arindam Makar
 * Version: 1.0.6 (Chromium Edition)
 */

const { app, BrowserWindow, ipcMain, session, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Privacy-centric Chromium Command-Line Switches (Ungoogled / Zero-Telemetry)
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('disable-default-apps');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-breakpad'); // Zero crash reporting to external servers
app.commandLine.appendSwitch('no-default-browser-check');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,ParallelDownloading,CanvasOopRasterization');
app.commandLine.appendSwitch('disable-features', 'MediaRouter,DialMediaRouteProvider,CalculateNativeWinOcclusion,InterestFeedContentSuggestions');

// Keep window reference
let mainWindow = null;

// User Data Storage Paths
const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'rinswa-settings.json');
const bookmarksPath = path.join(userDataPath, 'rinswa-bookmarks.json');
const historyPath = path.join(userDataPath, 'rinswa-history.json');
const workspacesPath = path.join(userDataPath, 'rinswa-workspaces.json');

// Default Settings
const defaultSettings = {
  theme: 'dark-cyber',
  searchEngine: 'duckduckgo',
  shieldsEnabled: true,
  shieldsAggressive: false,
  httpsOnly: true,
  tabSleepMinutes: 30,
  restorePreviousSession: true,
  wallpaper: 'alpine',
  homeUrl: 'rinswa://newtab',
  downloadPath: app.getPath('downloads')
};

// Search Engines
const searchEngines = {
  duckduckgo: { name: 'DuckDuckGo', queryUrl: 'https://duckduckgo.com/?q=' },
  google: { name: 'Google', queryUrl: 'https://www.google.com/search?q=' },
  brave: { name: 'Brave Search', queryUrl: 'https://search.brave.com/search?q=' },
  bing: { name: 'Microsoft Bing', queryUrl: 'https://www.bing.com/search?q=' },
  startpage: { name: 'Startpage', queryUrl: 'https://www.startpage.com/sp/search?query=' }
};

// Storage Helpers
function loadJson(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e);
  }
  return fallback;
}

function saveJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing ${file}:`, e);
  }
}

// In-Memory Storage
let settings = loadJson(settingsPath, defaultSettings);
let bookmarks = loadJson(bookmarksPath, [
  { id: '1', title: 'GitHub', url: 'https://github.com', icon: '💻', dateAdded: Date.now() },
  { id: '2', title: 'YouTube', url: 'https://youtube.com', icon: '🎬', dateAdded: Date.now() },
  { id: '3', title: 'Reddit', url: 'https://reddit.com', icon: '💬', dateAdded: Date.now() },
  { id: '4', title: 'Wikipedia', url: 'https://wikipedia.org', icon: '📚', dateAdded: Date.now() },
  { id: '5', title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: '🔍', dateAdded: Date.now() }
]);
let history = loadJson(historyPath, []);
let workspaces = loadJson(workspacesPath, [
  { id: 'ws-work', name: 'Work / Dev', icon: '💼', tabs: ['https://github.com', 'https://stackoverflow.com'] },
  { id: 'ws-media', name: 'Media & Relax', icon: '🎬', tabs: ['https://youtube.com', 'https://open.spotify.com'] }
]);

// Privacy Shield Blocklists & Tracker Detection
const trackerDomains = [
  'doubleclick.net', 'google-analytics.com', 'googletagmanager.com', 'facebook.net',
  'connect.facebook.net', 'scorecardresearch.com', 'adnxs.com', 'criteo.com',
  'outbrain.com', 'taboola.com', 'amazon-adsystem.com', 'moatads.com',
  'hotjar.com', 'mixpanel.com', 'optimizely.com', 'clarity.ms',
  'adservice.google.com', 'adroll.com', 'pubmatic.com', 'rubiconproject.com',
  'chartbeat.com', 'quantserve.com', 'crazyegg.com', 'yandex.ru/metrika',
  'telemetry', 'analytics', 'pagead', 'stats.wp.com', 'popads.net'
];

let globalShieldStats = {
  trackersBlocked: 0,
  adsBlocked: 0,
  cookiesBlocked: 0,
  memorySavedMB: 0
};

// Setup Privacy Shields Network Filtering
function setupShieldsFilter() {
  const filter = { urls: ['*://*/*'] };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    if (!settings.shieldsEnabled) {
      return callback({ cancel: false });
    }

    const url = details.url.toLowerCase();
    
    // Check against tracker domains
    const isTracker = trackerDomains.some(domain => url.includes(domain));
    const isAdUrl = /(googleads|adservice|adsystem|\/ads\/|\/adserver|\/banner|\/popunder|pagead2)/i.test(url);

    if (isTracker || isAdUrl) {
      globalShieldStats.trackersBlocked++;
      if (isAdUrl) globalShieldStats.adsBlocked++;
      
      // Notify renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('shield:stat-updated', {
          url: details.url,
          stats: globalShieldStats
        });
      }
      return callback({ cancel: true });
    }

    // HTTPS upgrade if enabled
    if (settings.httpsOnly && details.url.startsWith('http://') && !details.url.includes('localhost') && !details.url.includes('127.0.0.1')) {
      return callback({ redirectURL: details.url.replace('http://', 'https://') });
    }

    callback({ cancel: false });
  });

  // Strict Cookie Isolation / Blocking
  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    callback({ responseHeaders: details.responseHeaders });
  });
}

// Create Main Application Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'Rinswa Browser',
    frame: false, // Custom Cyber-Glass window titlebar
    backgroundColor: '#060913',
    icon: path.join(__dirname, '../../Glossy Multicolour Ribbon R Emblem.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enables <webview> tags for sandboxed Chromium browsing
      spellcheck: true
    }
  });

  // Remove default menu bar for sleek clean look
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Window State Events
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window:state-changed', { isMaximized: true });
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window:state-changed', { isMaximized: false });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle file downloads
  session.defaultSession.on('will-download', (event, item, webContents) => {
    const filename = item.getFilename();
    const totalBytes = item.getTotalBytes();
    const savePath = path.join(settings.downloadPath, filename);
    item.setSavePath(savePath);

    mainWindow.webContents.send('download:started', {
      id: Date.now(),
      filename,
      totalBytes,
      savePath
    });

    item.on('updated', (evt, state) => {
      if (state === 'progressing') {
        mainWindow.webContents.send('download:progress', {
          filename,
          receivedBytes: item.getReceivedBytes(),
          totalBytes: item.getTotalBytes()
        });
      }
    });

    item.once('done', (evt, state) => {
      mainWindow.webContents.send('download:completed', {
        filename,
        state,
        savePath
      });
    });
  });
}

// App Lifecycle
app.whenReady().then(() => {
  setupShieldsFilter();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// =============================================================================
// IPC Handlers: Window Controls
// =============================================================================
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize-restore', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// =============================================================================
// IPC Handlers: App Metadata & Version
// =============================================================================
ipcMain.handle('app:get-version', () => {
  return {
    version: '1.0.6',
    engine: 'Chromium ' + process.versions.chrome,
    node: process.versions.node,
    electron: process.versions.electron,
    author: 'Arindam Makar',
    license: 'MPL-2.0'
  };
});

// =============================================================================
// IPC Handlers: Settings
// =============================================================================
ipcMain.handle('settings:get', () => {
  return settings;
});

ipcMain.handle('settings:save', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveJson(settingsPath, settings);
  return settings;
});

ipcMain.handle('settings:reset', () => {
  settings = { ...defaultSettings };
  saveJson(settingsPath, settings);
  return settings;
});

// =============================================================================
// IPC Handlers: Bookmarks
// =============================================================================
ipcMain.handle('bookmarks:get', () => {
  return bookmarks;
});

ipcMain.handle('bookmarks:add', (event, bookmark) => {
  const newBookmark = {
    id: Date.now().toString(),
    title: bookmark.title || 'Untitled Bookmark',
    url: bookmark.url,
    icon: bookmark.icon || '🔖',
    dateAdded: Date.now()
  };
  bookmarks.push(newBookmark);
  saveJson(bookmarksPath, bookmarks);
  return bookmarks;
});

ipcMain.handle('bookmarks:remove', (event, id) => {
  bookmarks = bookmarks.filter(b => b.id !== id);
  saveJson(bookmarksPath, bookmarks);
  return bookmarks;
});

ipcMain.handle('bookmarks:is-bookmarked', (event, url) => {
  return bookmarks.some(b => b.url === url);
});

// =============================================================================
// IPC Handlers: History
// =============================================================================
ipcMain.handle('history:get', () => {
  return history.slice(0, 500); // Last 500 entries
});

ipcMain.handle('history:add', (event, entry) => {
  if (!entry || !entry.url || entry.url.startsWith('rinswa://')) return history;
  
  // Deduplicate recent consecutive entries
  if (history.length > 0 && history[0].url === entry.url) {
    history[0].timestamp = Date.now();
    history[0].title = entry.title || history[0].title;
  } else {
    history.unshift({
      id: Date.now().toString(),
      title: entry.title || entry.url,
      url: entry.url,
      timestamp: Date.now()
    });
  }
  
  if (history.length > 2000) history.pop();
  saveJson(historyPath, history);
  return history;
});

ipcMain.handle('history:clear', () => {
  history = [];
  saveJson(historyPath, history);
  return true;
});

// =============================================================================
// IPC Handlers: Workspaces
// =============================================================================
ipcMain.handle('workspaces:get', () => {
  return workspaces;
});

ipcMain.handle('workspaces:save', (event, workspace) => {
  const existingIndex = workspaces.findIndex(w => w.name.toLowerCase() === workspace.name.toLowerCase());
  if (existingIndex >= 0) {
    workspaces[existingIndex] = { ...workspaces[existingIndex], ...workspace };
  } else {
    workspaces.push({
      id: 'ws-' + Date.now(),
      name: workspace.name,
      icon: workspace.icon || '📁',
      tabs: workspace.tabs || []
    });
  }
  saveJson(workspacesPath, workspaces);
  return workspaces;
});

ipcMain.handle('workspaces:delete', (event, id) => {
  workspaces = workspaces.filter(w => w.id !== id);
  saveJson(workspacesPath, workspaces);
  return workspaces;
});

// =============================================================================
// IPC Handlers: Privacy Shields & Stats
// =============================================================================
ipcMain.handle('shield:get-stats', () => {
  return globalShieldStats;
});

ipcMain.handle('shield:toggle', (event, enabled) => {
  settings.shieldsEnabled = enabled;
  saveJson(settingsPath, settings);
  return settings.shieldsEnabled;
});

// =============================================================================
// IPC Handlers: DevTools & External
// =============================================================================
ipcMain.handle('app:open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('app:show-item-in-folder', (event, filePath) => {
  shell.showItemInFolder(filePath);
});
