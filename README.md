<div align="center">

<img src="Glossy%20Multicolour%20Ribbon%20R%20Emblem.png" alt="Rinswa Browser Emblem" width="140" height="140" style="margin-bottom: 12px;"/>

# Rinswa Browser (Chromium Edition)

**A fast, private, and stunning modern web browser built on the Chromium engine.**

Developed and maintained by **[Arindam Makar](https://github.com/deadxfire)**

[![Version](https://img.shields.io/badge/version-1.0.6_Stable-00d2ff?style=for-the-badge&logo=googlechrome)](https://github.com/deadxfire/Rinswa-browser)
[![Engine](https://img.shields.io/badge/engine-Chromium_Blink-orange?style=for-the-badge&logo=chromium)](https://github.com/deadxfire/Rinswa-browser)
[![Platform](https://img.shields.io/badge/platform-Windows_x64-blue?style=for-the-badge&logo=windows)](https://github.com/deadxfire/Rinswa-browser)
[![License](https://img.shields.io/badge/license-MPL_2.0-blueviolet?style=for-the-badge)](LICENSE)
[![Adblocker](https://img.shields.io/badge/adblocker-Rinswa_Shields_Built--in-red?style=for-the-badge&logo=shield)](https://github.com/deadxfire/Rinswa-browser)

[Features](#key-features) • [Architecture](#repository-structure) • [Quick Launch](#quick-launch) • [Building from Source](#building-from-source) • [Native C++ Build](docs/CHROMIUM_SOURCE_BUILD.md) • [Privacy Policy](#privacy--security-first) • [License](#license)

---

</div>

## Overview

**Rinswa Browser (Chromium Edition)** is the Chromium counterpart to the original Gecko-based Rinswa Browser. Engineered for power users who value aesthetic refinement, absolute privacy, and uncompromised performance, Rinswa Chromium combines the raw speed, WebGPU capabilities, and web compatibility of the modern Chromium rendering engine (Blink & V8) with Rinswa's signature **Cyber-Glass** visual theme, native **Rinswa Shields** ad and tracker blocking, and intelligent **Smart Tab & Clean Tabs** management.

---

## Key Features

### 🎨 Cyber-Glass & Multicolour Ribbon UI
- **Signature Visual Identity:** Designed with a vibrant, translucent glass aesthetic, custom Windows 11 titlebar and controls, and the signature Rinswa glossy multicolour ribbon emblem.
- **Modern Tabstrip & Omnibar:** Streamlined tabs with ribbon accents, smart autocomplete omnibar supporting DuckDuckGo, Google, Brave, and Bing, and real-time loading progress animations.
- **Alpine Sunset Dynamic New Tab:** High-resolution dynamic backgrounds crafted for new tab experiences with ambient clock, greeting, customizable speed dial shortcuts, and live privacy widgets.

### 🛡️ Privacy & Security First
- **Zero Hidden Telemetry:** De-Googled command-line flags disable Google cloud sync, background networking, breakpad crash reports, and remote metrics at engine level.
- **No Sponsored Content:** Absolutely no sponsored tiles, sponsored shortcuts, activity stream ads, or affiliate link injection.
- **Strict Anti-Tracking:** Strict third-party cookie isolation and tracking prevention enabled out-of-the-box.
- **HTTPS-First Enforcement:** Automatically prioritizes encrypted connections across all web navigation.

### ⚡ Built-in Rinswa Shields Adblocking
- **Native Network-Level Filtering:** Intercepts web requests before they load, neutralizing advertisement networks, analytics beacons, cryptocurrency miners, and telemetry trackers.
- **Interactive Shields Dashboard:** Live stats on trackers blocked, ads neutralized, and connection encryption status right from the toolbar.

### 📑 Native Smart Tab Management & Clean Tabs
- **Automatic Tab Categorization:** Organizes tabs automatically into structured categories:
  - **Work / Dev:** GitHub, GitLab, Stack Overflow, MDN, Laravel, Vercel, Figma, Jira
  - **Shopping:** Amazon, Flipkart, eBay, Walmart, shopping carts
  - **Personal:** Gmail, Reddit, Twitter/X, Discord, Telegram, WhatsApp
  - **Media & Streaming:** YouTube, Spotify, Netflix, Twitch
  - **Docs & Research:** Wikipedia, Arxiv, Google Scholar, Medium
- **Duplicate-Tab Detection:** Automatically highlights duplicate URLs and paths across open tabs.
- **Inactive Tab Hibernation (Sleeping Tabs):** Unloads inactive background tabs to drop RAM consumption by up to 80% while preserving tab history and state.
- **Smart Workspaces:** Save any set of tabs as a persistent workspace and restore it with one click.
- **Signature "Clean Tabs" Engine:** 1-click automated audit and cleanup that closes duplicate clones and suspends idle tabs instantly.

### 🚀 Cutting-Edge Engine Performance
- **Chromium / Blink Rendering Engine:** Full support for modern HTML5, CSS3, WebAssembly, WebGPU, and modern web applications.
- **Google V8 JavaScript Engine:** Industry-leading execution speed and JIT optimization.
- **Process Sandboxing:** Process isolation architecture ensuring untrusted sites cannot access data across tabs.

---

## Repository Structure

```
BrowserCromium/
├── branding/                     # Rinswa brand identity, icons, logos, and emblems
│   ├── assets/                   # Raw vector logos and icon assets
│   ├── icons/                    # Multi-resolution Windows .ico and PNG icons
│   └── wallpaper-alpine.png      # Alpine Sunset wallpaper
├── src/                          # Browser source tree
│   ├── main/                     # Chromium main process & lifecycle
│   │   └── index.js              # De-googled flags, shields filter, window controls
│   ├── preload/                  # Secure IPC context bridge
│   │   └── index.js              # Safe window, tab, settings, and shield APIs
│   ├── renderer/                 # Cyber-Glass browser shell UI
│   │   ├── css/                  # cyber-glass.css, browser-shell.css, smart-tabs.css, shields.css
│   │   ├── js/                   # app.js, tab-manager.js, navigation.js, smart-tabs.js, shields.js
│   │   └── index.html            # Main browser window & tab host
│   └── pages/                    # Internal browser pages
│       ├── newtab/               # Alpine Sunset New Tab page
│       └── settings/             # Cyber-Glass browser settings center
├── native-engine/                # Native C++ Chromium GN/Ninja build overlay
│   ├── gn/args.gn                # Production release GN configuration flags
│   ├── patches/                  # De-googling and privacy source patches
│   └── docs/                     # Full native Chromium compilation guide
├── Build-Rinswa-Chromium.bat     # One-click Windows build & packaging script
├── Start-Rinswa-Chromium.bat     # One-click instant launch script
├── rinswa-version.txt            # Application version string (1.0.6)
├── LICENSE                       # Mozilla Public License Version 2.0
└── README.md                     # Project documentation
```

---

## Quick Launch

To run Rinswa Chromium immediately:

1. Double-click **`Start-Rinswa-Chromium.bat`** (or run `npm start` in PowerShell / Command Prompt).
2. The browser launches instantly with the full Cyber-Glass UI, real Chromium rendering, and Alpine Sunset New Tab experience!

---

## Building from Source

### One-Click Build & Packaging

The simplest way to package Rinswa Chromium into a standalone Windows distribution:

1. Double-click **`Build-Rinswa-Chromium.bat`**
2. The automated pipeline will:
   - Verify Node.js and Chromium runtime libraries.
   - Run syntax and architecture checks across all JavaScript subsystems.
   - Package the standalone Windows application.

### Monolithic C++ Chromium Source Build

For compiling directly from the Google Chromium C++ source tree with Google `depot_tools` and Ninja, see the comprehensive **[Chromium Source Build Guide](docs/CHROMIUM_SOURCE_BUILD.md)**.

---

## Privacy & Security

Rinswa's default network policy ensures complete user sovereignty:
- **No telemetry transmission:** Telemetry endpoints, Google crash reporting, and tracking pings are stripped.
- **Zero user profiling:** No browsing patterns or history are monitored or externalized.
- **Ad & Tracker Neutralization:** Network requests matching ad and tracking patterns are dropped before DNS resolution.

---

## License

Developed by **[Arindam Makar](https://github.com/deadxfire)**.  
Licensed under the **Mozilla Public License Version 2.0 (MPL-2.0)**.
