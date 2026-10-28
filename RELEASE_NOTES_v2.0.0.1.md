## Rinswa Browser v2.0.0.1 (Release)

### 🚀 What's New in v2.0.0.1

- 🎨 **Native Windows 11 Acrylic Blur (Desktop Acrylic Backdrop)**:
  - Enabled native Windows 11 `DWMSBT_TRANSIENTWINDOW` (3, Desktop Acrylic) with native rounded corners (`DWMWCP_ROUND`).
  - Removed conflicting legacy composition attributes that caused solid white margins or flat transparency.
  - Implemented dynamic `DWMWA_USE_IMMERSIVE_DARK_MODE` synchronizing with Windows dark/light personalization.
  - Tuned base frosted tint opacity to ~75% (alpha 190) so context menus are completely non-transparent while underlying background colors softly bleed through the heavy Acrylic blur.
  - Disabled software bubble border insets (`use_bubble_border = false`) eliminating outer shadow boxes.

- 🔖 **Tab Strip Custom Shortcut Favicons**:
  - Asynchronous favicon querying via `FaviconService` and `HistoryUiFaviconRequestHandler`.
  - Comprehensive brand fallbacks for Wikipedia, WhatsApp, X, GitHub, Reddit, Facebook, ChatGPT, Netflix, and dynamic color hashing.

- 🎬 **Video PiP & Downloader Positioning**:
  - Repositioned the floating transparent Cyber-Glass video popout & downloader pill to the right middle of the video with vertical centering (`translate(-100%, -50%)`).

- 📄 **Brand String Refinements**:
  - Rebranded master default PDF viewer and browser strings to Rinswa (`Set Rinswa as your default PDF viewer`, default browser toasts, dialogs, and Gemini integration).

- 🏷️ **Version 2.0.0.1 Engine, UI & Setup**:
  - Stamped version `2.0.0.1` across the browser About page (`chrome://version`, `chrome://settings/help`), New Tab page, extension manifests, and setup files.
  - Packaged standalone offline installer `Rinswa-Browser-Setup-x64-v2.0.0.1.exe`.

---

### 📦 Standalone Offline Installer
- **`dist/installer/Rinswa-Browser-Setup-x64-v2.0.0.1.exe`** (Recommended): Full standalone offline installer with desktop/start menu shortcuts, default browser capabilities, and clean uninstaller.
- **`dist/installer/Rinswa.Setup.v2.0.0.1.exe`**: Mini-installer setup alias.
