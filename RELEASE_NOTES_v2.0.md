## Rinswa Browser v2.0 (Release)

**Rinswa Browser** is a fast, privacy-focused, and stunning modern web browser built on Chromium C++ engine with Cyber-Glass UI, website frame padding, built-in ad blocking, native Web Capture, and custom profile personalization.

### ✨ What's New in v2.0

- 🤖 **Removed AI Innovations from Settings**:
  - Completely removed the "AI innovations" menu entry and its subpage from Settings (`rinswa://settings/`), streamlining the browser preferences to focus on speed, privacy, and user control.
  - Disabled underlying AI features and Glic subpage integration to eliminate unnecessary background requests.

- 🏷️ **Version 2.0 Engine & About Page**:
  - Updated About page (`chrome://settings/help` / `rinswa://settings/help`) and Version page (`chrome://version`) to display `Version 2.0 (Official Build) (64-bit)`.
  - Stamped version 2.0 across New Tab Page, extension manifests, and build metadata.

- 🔄 **Enhanced Auto-Updater & Process Termination**:
  - Enhanced the background update relaunch workflow to forcibly release locked DLLs (`chrome.dll`) by terminating leftover Chromium child processes (`chrome_proxy`, helper processes) before running the silent installer.
  - Added mutex protection (`IsUpdateRelaunchInProgress`) to ensure single-instance atomic updater execution.
  - Added process cleanup hooks (`InitializeSetup`) into the Inno Setup installer.

- 📦 **Packaging & Offline Installer**:
  - Built standalone offline installer for version 2.0 (`Rinswa-Browser-Setup-x64-v2.0.exe`).
  - Bundled latest precompiled 64-bit Chromium binaries, Rinswa extensions, and media tools.

### 📦 Installation Options

- **`Rinswa-Browser-Setup-x64-v2.0.exe`** (Recommended): Full standalone offline installer with Windows 10/11 system integration, start menu and desktop shortcuts, default browser capabilities, and clean uninstaller.
- **`Rinswa.Setup.v2.0.exe`**: Standalone mini-installer setup.

---
*Developed and created by Arindam Makar*
