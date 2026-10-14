/**
 * Rinswa Chromium Browser
 * Preload Script - Secure Context Bridge
 * Developed by Arindam Makar
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rinswaAPI', {
  // Window Controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximizeRestore: () => ipcRenderer.invoke('window:maximize-restore'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized'),
    onStateChanged: (callback) => {
      ipcRenderer.on('window:state-changed', (event, state) => callback(state));
    }
  },

  // App Metadata
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    openExternal: (url) => ipcRenderer.invoke('app:open-external', url),
    showItemInFolder: (path) => ipcRenderer.invoke('app:show-item-in-folder', path)
  },

  // Settings
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    reset: () => ipcRenderer.invoke('settings:reset')
  },

  // Bookmarks
  bookmarks: {
    get: () => ipcRenderer.invoke('bookmarks:get'),
    add: (bookmark) => ipcRenderer.invoke('bookmarks:add', bookmark),
    remove: (id) => ipcRenderer.invoke('bookmarks:remove', id),
    isBookmarked: (url) => ipcRenderer.invoke('bookmarks:is-bookmarked', url)
  },

  // History
  history: {
    get: () => ipcRenderer.invoke('history:get'),
    add: (entry) => ipcRenderer.invoke('history:add', entry),
    clear: () => ipcRenderer.invoke('history:clear')
  },

  // Workspaces
  workspaces: {
    get: () => ipcRenderer.invoke('workspaces:get'),
    save: (ws) => ipcRenderer.invoke('workspaces:save', ws),
    delete: (id) => ipcRenderer.invoke('workspaces:delete', id)
  },

  // Privacy Shields
  shields: {
    getStats: () => ipcRenderer.invoke('shield:get-stats'),
    toggle: (enabled) => ipcRenderer.invoke('shield:toggle', enabled),
    onStatUpdated: (callback) => {
      ipcRenderer.on('shield:stat-updated', (event, data) => callback(data));
    }
  },

  // Downloads
  downloads: {
    onStarted: (callback) => {
      ipcRenderer.on('download:started', (event, data) => callback(data));
    },
    onProgress: (callback) => {
      ipcRenderer.on('download:progress', (event, data) => callback(data));
    },
    onCompleted: (callback) => {
      ipcRenderer.on('download:completed', (event, data) => callback(data));
    }
  }
});
