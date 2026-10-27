## Rinswa Browser v1.0.8 (Chromium Edition)

**Rinswa Browser** is a fast, privacy-focused, and stunning modern web browser built on the real Chromium C++ engine with Cyber-Glass UI, website frame padding, built-in ad blocking, and native Web Capture.

### ✨ What's New in v1.0.8

- 📸 **Built-in Web Capture & Screenshot Engine (`Ctrl+Shift+S`)**:
  - **Instant Hotkey Activation**: Press `Ctrl+Shift+S` anywhere or select **Web Capture** from the Chromium menu or Rinswa Shield popup to trigger the screen capture overlay.
  - **Select-wise Area Capture**: Drag to select any arbitrary area of the webpage with live coordinate & dimension pill (`W × H px`), frosted crosshair guides, and 8 responsive resizing handles.
  - **Full Screen Capture**: One-click instant viewport snapshot with smooth visual feedback.
  - **Automatic Clipboard Copy (Autocopy)**: Captured image data is instantly and automatically copied into the Windows clipboard upon selection mouse release or full screen trigger, ready for immediate `Ctrl+V` pasting into messaging apps, emails, and graphics editors.
  - **Save to PNG**: High-fidelity PNG download option with timestamped filename.

- 💎 **Minimalist Cyber-Glass Dynamic Island Design**:
  - **Dynamic Island Top Pill**: Ultra-clean floating header with segmented mode selectors (`Select Area` & `Full Page`), keyboard hints, and dismiss action.
  - **CleanShot-Style Floating Preview Card**: Non-intrusive bottom-right card with instant thumbnail preview, dimensions badge, autocopy confirmation indicator, and quick-action buttons.
  - **Seamless Micro-Interactions**: Translucent backdrop blur (`backdrop-filter: blur(28px)`), smooth CSS bezier spring transitions, and zero layout shift.

- 🛡️ **Rinswa Shield & Ecosystem v1.0.8 Alignment**:
  - Updated Rinswa Shield extension manifest and popup to v1.0.8 with integrated screenshot quick-action launcher.
  - Unified version stamping across native Chromium C++ version headers (`chrome_version.h.in`, `version_info_values.h.in`, `version_updater_basic.cc`).
  - Automated sync to portable distribution and installer packaging pipelines.

### 📦 Installation Options

- **`Rinswa-Browser-Setup-x64-v1.0.8.exe`** (Recommended): Full standalone offline installer with Windows 10/11 system integration, start menu and desktop shortcuts, default browser capabilities, and clean uninstaller.
- **`Rinswa.Setup.v1.0.8.exe`**: Chromium native standalone mini-installer setup.

---
*Developed and created by Arindam Makar*
