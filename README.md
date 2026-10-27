<div align="center">

<img src="Glossy%20Multicolour%20Ribbon%20R%20Emblem.png" alt="Rinswa Browser Emblem" width="140" height="140" style="margin-bottom: 12px;"/>

# Rinswa Browser (Chromium Edition)

**A fast, private, and stunning modern web browser built directly on the real Chromium C++ engine.**

Developed and maintained by **[Arindam Makar](https://github.com/deadxfire)**

[![Version](https://img.shields.io/badge/version-2.0.0.1_Stable-00d2ff?style=for-the-badge&logo=googlechrome)](https://github.com/deadxfire/Rinswa-Chromium/releases)
[![Engine](https://img.shields.io/badge/engine-Chromium_C%2B%2B_Engine-orange?style=for-the-badge&logo=chromium)](https://github.com/deadxfire/Rinswa-Chromium)
[![Platform](https://img.shields.io/badge/platform-Windows_x64-blue?style=for-the-badge&logo=windows)](https://github.com/deadxfire/Rinswa-Chromium)
[![License](https://img.shields.io/badge/license-MPL_2.0-blueviolet?style=for-the-badge)](LICENSE)
[![Compiler](https://img.shields.io/badge/compiler-GN_%26_Ninja-red?style=for-the-badge&logo=ninja)](https://gn.googlesource.com/gn)

[Features](#key-features) • [Architecture](#repository-structure) • [Building from Source](#building-from-source) • [Build Walkthrough](docs/CHROMIUM_BUILD_WALKTHROUGH.md) • [Privacy Policy](#privacy--security-first) • [License](#license)

---

</div>

## Overview

**Rinswa Browser (Chromium Edition)** is the native Chromium counterpart to the original Gecko-based Rinswa Browser. Built directly from the official Google Chromium C++ source tree using **GN** and **Ninja**, Rinswa completely removes sponsored telemetry, invasive data collection, and Google sync services, replacing them with a sleek **Cyber-Glass** visual theme, hardware-accelerated Blink rendering, proprietary media playback, and native ad blocking.

---

## Key Features

### 🎨 Cyber-Glass & Multicolour Ribbon UI
- **Signature Visual Identity:** Designed with a vibrant, translucent glass aesthetic, custom window controls, and the signature Rinswa glossy multicolour ribbon emblem.
- **Modern Tabstrip & Navigation:** Streamlined tabs, refined omnibar, and responsive UI micro-animations tailored for Windows 11.
- **Alpine Sunset Theme & Wallpapers:** High-resolution dynamic backgrounds crafted for new tab and start experiences.

### 🛡️ Privacy & Security First
- **Zero Hidden Telemetry:** All internal Google telemetry, metrics services, and crash reports to external servers are neutralized at compile time via `config/args.gn`.
- **No Sponsored Content:** Absolutely no sponsored tiles, sponsored shortcuts, activity stream ads, or affiliate link injection.
- **Strict Anti-Tracking:** Third-party cookie isolation and fingerprinting protection enforced out of the box.
- **HTTPS-First Enforcement:** Encrypted connections prioritized across all web navigation.

### ⚡ Out-of-the-Box Native Ad Blocking
- **Pre-Integrated uBlock Origin:** Bundled directly into the distribution and enterprise policy definitions, providing instant, lightweight, and effective ad and tracker blocking on first launch.

### 📸 Native Web Capture & Smart Screenshot Engine (`Ctrl+Shift+S`)
- **Instant Keyboard Activation:** Press `Ctrl+Shift+S` anywhere to open the Cyber-Glass Web Capture interface.
- **Select-Wise & Full-Screen Options:** Drag to capture any custom rectangular area with pixel-accurate 8-point resizing, or capture the entire visible screen with one click.
- **Autocopy to Clipboard:** Automatically copies captured screenshots directly to the system clipboard upon selection for instant pasting.
- **Instant Save to Disk:** One-click Save action downloads crisp, high-resolution PNG screenshots.

### 📑 Native Smart Tab Management & Clean Tabs
- **Automatic Tab Grouping:** Automatically categorizes tabs into Work/Dev, Shopping, Personal, Media & Streaming, and Docs & Research.
- **Duplicate-Tab Detection:** Identifies exact URL clones across open tabs.
- **Sleeping Tabs:** Proactively hibernates inactive background tabs to drop RAM usage.

### 🚀 Real Chromium Engine Performance
- **Full Chromium C++ Engine (Blink & V8):** Compiled directly with Visual Studio 2022 C++ and Ninja for raw native execution speed.
- **Proprietary Media Support:** Full hardware-accelerated playback for H.264, AAC, MP4, and Widevine DRM.
- **Process Sandboxing:** Complete site isolation architecture ensuring secure, isolated tab execution.

---

## Repository Structure

```
BrowserCromium/
├── config/                                 # GN build configurations
│   └── args.gn                             # Windows x64 release build configuration (proprietary codecs, zero telemetry)
├── branding/                               # Rinswa brand identity, icons, logos, and emblems
│   ├── chromium-overlay/                   # Native Chromium source tree overlay
│   │   ├── chrome/app/theme/chromium/      # Icons, ribbons, logos replacing default branding
│   │   ├── chrome/installer/windows/       # Installer bitmaps and manifests
│   │   └── components/version_info/        # Product version headers (v1.0.8)
│   ├── wizHeader.bmp                       # Windows setup header bitmap
│   └── wallpaper-alpine.png                # Alpine Sunset dynamic wallpaper
├── patches/                                # Native C++ source patches
│   ├── 0001-rinswa-branding-and-metadata.patch
│   ├── 0002-disable-telemetry-and-cloud-sync.patch
│   ├── 0003-enable-cyberglass-accent-and-dark-theme.patch
│   └── 0004-default-privacy-preferences.patch
├── ui/                                     # Cyber-Glass Native Theme & WebUI customizations
│   └── newtab/                             # Alpine Sunset dynamic New Tab page overlay
├── scripts/                                # Automated build orchestration scripts
│   └── prepare-rinswa-overlay.py           # Automated branding & customization injector
├── docs/                                   # Architectural & build guides
│   └── CHROMIUM_BUILD_WALKTHROUGH.md       # Comprehensive build walkthrough
├── Setup-Build-Environment.bat             # One-click Visual Studio & depot_tools setup
├── Fetch-Chromium-Source.bat               # One-click source tree downloader (fetch --no-history)
├── Build-Rinswa-Chromium.bat               # One-click master Windows compiler (GN + Ninja)
├── Start-Rinswa-Chromium.bat               # Quick launcher for compiled binary
├── rinswa-version.txt                      # Application version string (1.0.8)
├── LICENSE                                 # Mozilla Public License Version 2.0
└── README.md                               # Project documentation
```

---

## Building from Source

### Prerequisites
1. **Windows 10 / 11 (64-bit)**
2. **Visual Studio 2022 Community / Professional** (Desktop development with C++ workload and Windows 10/11 SDK)
3. **Google depot_tools** (Automated setup via `Setup-Build-Environment.bat`)
4. At least **100 GB** of free SSD storage

### Quick Build (One-Click)

The build pipeline mirrors the workflow of Rinswa Gecko:

1. **Step 1: Set Up Toolchain**
   Double-click **`Setup-Build-Environment.bat`** to configure Google `depot_tools` and verify your Visual Studio C++ compiler.

2. **Step 2: Fetch Chromium Source**
   Double-click **`Fetch-Chromium-Source.bat`** to check out the modern Chromium C++ source tree into `chromium\src`.

3. **Step 3: Compile & Package**
   Double-click **`Build-Rinswa-Chromium.bat`**. The automated pipeline will:
   - Inject Rinswa branding assets, ribbons, and multi-resolution `.ico` files.
   - Apply `config/args.gn` and native C++ privacy patches.
   - Compile the full Chromium engine using parallel Ninja compilation threads (`-j16`).
   - Package the standalone release installer (`Rinswa-Browser-Setup-x64-v2.0.0.1.exe` / `Rinswa.Setup.v2.0.0.1.exe`) into `dist\installer\`.

---

## Release Outputs

Once compiled, build artifacts are located in:
- **Standalone Offline Installer:** `dist\installer\Rinswa-Browser-Setup-x64-v2.0.0.1.exe`
- **Mini-Installer Setup:** `dist\installer\Rinswa.Setup.v2.0.0.1.exe`
- **Portable Distribution:** `dist\portable\Rinswa.exe`

---

## Privacy & Security

Rinswa's default network policy ensures complete user sovereignty:
- **No telemetry transmission:** External metrics servers, Google crash reports, and domain reliability pings are disabled at engine level.
- **Zero user profiling:** No browsing patterns or history are monitored or externalized.
- **SafeBrowsing protection:** Uses local threat blocklists without sending browsing URLs to cloud servers.

---

## License

Developed by **[Arindam Makar](https://github.com/deadxfire)**.  
Licensed under the **Mozilla Public License Version 2.0 (MPL-2.0)** and the **Chromium 3-Clause BSD License**.
