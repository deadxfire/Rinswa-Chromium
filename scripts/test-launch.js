/**
 * Automated smoke test for Rinswa Chromium Browser
 */
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(() => {
  console.log('Testing Rinswa Browser window creation...');
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../src/preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    }
  });

  win.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  win.webContents.once('did-finish-load', () => {
    console.log('SUCCESS: Rinswa Browser shell HTML and assets loaded perfectly!');
    setTimeout(() => {
      app.quit();
      process.exit(0);
    }, 1000);
  });

  win.webContents.once('did-fail-load', (e, errorCode, errorDescription) => {
    console.error('FAILED: Load error:', errorCode, errorDescription);
    app.quit();
    process.exit(1);
  });
});
