/**
 * Rinswa Browser - Background Service Worker
 * Handles screen capture, global keyboard shortcuts (Ctrl+Shift+S), and messaging.
 * Developed by Arindam Makar for Rinswa Chromium
 */

// Listen for global command shortcut (Ctrl+Shift+S)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'capture-screenshot') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) return;

      // Capture visible tab before showing overlay
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError || !dataUrl) {
          console.warn('[Rinswa ScreenCapture] captureVisibleTab notice:', chrome.runtime.lastError);
          // If capture failed or restricted, ask content script to open capture mode
          chrome.tabs.sendMessage(tab.id, { action: 'startScreenshot' }).catch(() => {});
          return;
        }

        // Send pristine capture to content script
        chrome.tabs.sendMessage(tab.id, {
          action: 'startScreenshot',
          dataUrl: dataUrl
        }).catch(() => {
          // If content script was not ready, inject dynamically
          injectAndStart(tab.id, dataUrl);
        });
      });
    } catch (err) {
      console.error('[Rinswa ScreenCapture] Command error:', err);
    }
  }
});

// Helper to inject scripts into tab if not already loaded
function injectAndStart(tabId, dataUrl) {
  if (!chrome.scripting) return;
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['screenshot.js']
  }).then(() => {
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, {
        action: 'startScreenshot',
        dataUrl: dataUrl
      }).catch(() => {});
    }, 50);
  }).catch((err) => {
    console.debug('[Rinswa ScreenCapture] Script injection not permitted on this page:', err);
  });
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureVisibleTab') {
    const windowId = sender.tab ? sender.tab.windowId : null;
    chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Capture failed'
        });
      } else {
        sendResponse({ success: true, dataUrl: dataUrl });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.action === 'downloadVideo') {
    sendResponse({ success: true });
    return true;
  }

  if (message.action === 'triggerScreenshotFromPopup') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError || !dataUrl) {
            chrome.tabs.sendMessage(tab.id, { action: 'startScreenshot' }).catch(() => {});
          } else {
            chrome.tabs.sendMessage(tab.id, {
              action: 'startScreenshot',
              dataUrl: dataUrl
            }).catch(() => {
              injectAndStart(tab.id, dataUrl);
            });
          }
        });
      }
    });
    sendResponse({ success: true });
    return true;
  }
});
