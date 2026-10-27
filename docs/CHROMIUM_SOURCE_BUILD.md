# Rinswa Browser (Chromium Edition) - Architecture & Compilation Guide

**A fast, private, and stunning modern Chromium-based web browser.**  
Developed and maintained by **Arindam Makar** &bull; Version `1.0.8 Stable`

---

## Architecture Overview

Rinswa Chromium provides a dual-layer architecture:

1. **Production Desktop Application (Fast Build & Deployment):**
   - High-performance browser shell powered by modern Chromium (Blink & V8 engine).
   - Features custom **Cyber-Glass UI**, dynamic tab management, sandboxed guest `<webview>` processes, omnibar autocomplete, and hardware-accelerated GPU WebRender.
   - Built-in **Rinswa Shields** (ad and tracker blocker running on the Chromium network request pipeline).
   - **Smart Tabs & Clean Tabs Engine:** Category classification (Work/Dev, Shopping, Personal, Media, Docs), duplicate tab detection, and inactive tab hibernation.
   - Packaged with one click via `Build-Rinswa-Chromium.bat` into portable and standalone Windows installer `.exe` releases.

2. **Native C++ Chromium Engine Overlay (`native-engine/`):**
   - Direct integration files for building monolithic `chrome.exe` and `mini_installer.exe` from the Google Chromium C++ source tree.
   - Custom `args.gn` configuration disabling telemetry, Google metrics, client-side phishing pings, and cloud sync.
   - Source patches under `native-engine/patches/` for product identity and privacy hardening.

---

## Quick Start (Run & Test Immediately)

To launch Rinswa Chromium in development mode:

```cmd
# Double click Start-Rinswa-Chromium.bat or run:
npm start
```

---

## One-Click Build & Packaging

To compile and package the standalone Windows release:

1. Double-click **`Build-Rinswa-Chromium.bat`**
2. The pipeline will:
   - Verify Node and Chromium dependencies.
   - Validate JavaScript syntax and Cyber-Glass assets.
   - Build standalone installer (`Rinswa.Setup.exe`) and portable package into `dist/`.

---

## Compiling Monolithic C++ Chromium from Source

If you wish to compile the full 50GB Google Chromium C++ source tree using Google `depot_tools` and Ninja:

### Prerequisites
1. **Windows 10 / 11 (64-bit)** with at least 16GB RAM and 120GB free SSD space.
2. **Visual Studio 2022 Community / Professional** (Desktop development with C++, MFC/ATL, Windows 10/11 SDK 10.0.22621+).
3. **Google depot_tools** added to the beginning of your system `PATH`.

### Step 1: Clone Chromium Source
```cmd
mkdir C:\rinswa-chromium-src
cd C:\rinswa-chromium-src
fetch --no-history chromium
cd src
```

### Step 2: Apply Rinswa Customizations
Copy the GN args from this repository:
```cmd
mkdir out\RinswaRelease
copy "C:\Users\arind\OneDrive\Documents\Project\BrowserCromium\native-engine\gn\args.gn" out\RinswaRelease\args.gn
```

Generate Ninja build files:
```cmd
gn gen out\RinswaRelease
```

### Step 3: Compile with Ninja
```cmd
autoninja -C out\RinswaRelease chrome mini_installer
```

### Step 4: Standalone Installer Output
Once compilation finishes, the Windows release executable will be located at:
`out\RinswaRelease\mini_installer.exe` (Rename to `Rinswa-Chromium-Setup.exe`).

---

## Engine Comparison: Gecko vs. Chromium

| Feature | Rinswa Gecko Edition | Rinswa Chromium Edition |
| :--- | :--- | :--- |
| **Rendering Engine** | Mozilla Gecko 157 | Google Chromium / Blink 134+ |
| **JavaScript Engine** | SpiderMonkey | Google V8 |
| **Visual Design** | Cyber-Glass Theme | Cyber-Glass Translucent Theme |
| **New Tab Page** | Alpine Sunset Wallpaper | Alpine Sunset + Ambient Clock & Widgets |
| **Adblocking** | Bundled uBlock Origin | Rinswa Shields Network Filter Engine |
| **Tab Management** | Smart Tabs Extension | Native Smart Tabs & Hibernation Engine |
| **Telemetry Policy** | Stripped at compile time | De-Googled / Zero Telemetry Flags |
| **Build System** | MozillaBuild / mach | Batch Pipeline & depot_tools GN/Ninja |

---

## Author & Licensing

- **Author:** Arindam Makar
- **License:** Mozilla Public License 2.0 (MPL-2.0)
- **Repository:** `BrowserCromium`
