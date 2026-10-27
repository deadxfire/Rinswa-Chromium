## Rinswa Browser v1.0.9 (Release)

**Rinswa Browser** is a fast, privacy-focused, and stunning modern web browser built on Chromium C++ engine with Cyber-Glass UI, website frame padding, built-in ad blocking, native Web Capture, and custom profile personalization.

### ✨ What's New in v1.0.9

- 👤 **Custom Avatar Upload from Local Image Files**:
  - Added a dedicated **"Choose from file"** button directly to the avatar selector grid in Profile Settings (`rinswa://settings/manageProfile`) and initial profile customization.
  - Supports uploading `.png`, `.jpg`, `.jpeg`, and `.webp` images directly from your computer.
  - Automatically loads, previews, and applies custom image avatars with active selection checkmark indicators.

- 🔗 **Internal Link & Status Bubble Rebranding (`rinswa://`)**:
  - Hovering over settings menu items, side panel entries, and internal links now cleanly displays `rinswa://settings/...` instead of `chrome://` in the bottom-left status bubble.
  - Native browser URL fixer and about handler automatically resolve `rinswa://` schema internally.

- 🏷️ **Complete Elimination of Residual "Chromium" Text**:
  - Replaced residual "Chromium" strings across localized message bundles (`chromium_strings_en-GB.xtb`, `components_chromium_strings_en-GB.xtb`), ensuring profile setup screens show *"Who's using Rinswa?"* and *"With Rinswa profiles..."*.
  - Cleaned up About page (`chrome://settings/help`) and Version page (`chrome://version`) version strings to display `Version 1.0.9 (Official Build) (64-bit)`.

- 📦 **Packaging & Installer Updates**:
  - Updated Inno Setup offline installer configuration for version 1.0.9.
  - Bundled latest precompiled 64-bit Chromium binaries, Rinswa extensions, and media tools.

### 📦 Installation Options

- **`Rinswa-Browser-Setup-x64-v1.0.9.exe`** (Recommended): Full standalone offline installer with Windows 10/11 system integration, start menu and desktop shortcuts, default browser capabilities, and clean uninstaller.
- **`Rinswa.Setup.v1.0.9.exe`**: Standalone mini-installer setup.

---
*Developed and created by Arindam Makar*
