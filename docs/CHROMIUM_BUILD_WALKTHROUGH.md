# Rinswa Browser (Chromium Engine): Architecture & Build Walkthrough

**The Official Guide to Compiling Rinswa Browser from the Chromium C++ Engine.**  
Developed and maintained by **[Arindam Makar](https://github.com/deadxfire)** &bull; Version `1.0.6 Stable`

---

## 1. Architectural Philosophy

Like its sibling **Rinswa Gecko Edition** (which uses an overlay on Mozilla's `mozilla-central`), **Rinswa Chromium Edition** uses an **Overlay Architecture** on top of Google's Chromium C++ engine (`chromium/src`):

```
Rinswa-Chromium/
├── config/                     # GN compiler directives (args.gn)
├── branding/                   # Chromium theme overlays, emblems, and installer bitmaps
├── patches/                    # Native C++ patches (de-googling, privacy, UI themes)
├── scripts/                    # Automation scripts for toolchain setup & packaging
├── chromium/src/               # Real Chromium C++ source tree (Blink & V8)
│   └── out/RinswaRelease/      # Compiled binaries (chrome.exe, mini_installer.exe)
└── Build-Rinswa-Chromium.bat   # Master one-click compilation pipeline
```

By keeping all Rinswa customizations in external overlay directories (`config/`, `branding/`, `patches/`), upstream Chromium engine updates can be merged seamlessly without merge conflicts.

---

## 2. Prerequisites

To compile the real Chromium C++ engine on Windows:
1. **Operating System:** Windows 10 or Windows 11 (64-bit).
2. **Storage:** At least **100 GB** of free SSD storage (Chromium source + build artifacts).
3. **Memory:** At least **16 GB RAM** (32 GB recommended for parallel compilation).
4. **Visual Studio 2022 Community / Professional:**
   - Workload: *Desktop development with C++*
   - Individual Components: *Windows 10/11 SDK (10.0.22621+)*, *C++ ATL for latest v143 build tools*, *C++ MFC for latest v143 build tools*.
5. **Google depot_tools:** Included automated setup via `Setup-Build-Environment.bat`.

---

## 3. Step-by-Step Compilation Pipeline

### Step 1: Initialize the Toolchain Environment
Run the automated environment setup script:
```cmd
.\Setup-Build-Environment.bat
```
This script:
- Verifies your local Visual Studio C++ compiler.
- Downloads Google `depot_tools` (providing `gn`, `ninja`, `fetch`, `gclient`).
- Configures `DEPOT_TOOLS_WIN_TOOLCHAIN=0` to force Chromium to use your local Visual Studio toolchain.

### Step 2: Download the Real Chromium Engine Source
Run the source downloader:
```cmd
.\Fetch-Chromium-Source.bat
```
This executes `fetch --no-history chromium` to download the modern Chromium C++ source code directly into `chromium\src`.

### Step 3: Compile with One Click
Run the master build launcher:
```cmd
.\Build-Rinswa-Chromium.bat
```
The automated pipeline will:
1. Run `scripts/prepare-rinswa-overlay.py` to inject Rinswa branding assets, icons, and version headers.
2. Deploy `config/args.gn` into `chromium\src\out\RinswaRelease\args.gn`.
3. Generate Ninja build targets:
   ```cmd
   gn gen out\RinswaRelease
   ```
4. Compile the real Chromium engine using Ninja:
   ```cmd
   autoninja -C out\RinswaRelease chrome mini_installer
   ```
5. Package the standalone Windows installer into `dist\installer\Rinswa.Setup.v1.0.6.exe`.

---

## 4. Key GN Configuration Directives (`config/args.gn`)

| Flag | Purpose in Rinswa |
| :--- | :--- |
| `is_official_build = true` | Enables full release optimizations, Link-Time Optimization (LTO), and dead-code stripping. |
| `is_debug = false` | Disables internal debug assertions for maximum runtime speed. |
| `symbol_level = 0` | Strips heavy debug symbols to dramatically reduce compilation time and disk usage. |
| `proprietary_codecs = true` | Enables native H.264, AAC, and MP4 media playback. |
| `ffmpeg_branding = "Chrome"` | Enables full FFmpeg video/audio codec suite. |
| `enable_widevine = true` | Enables protected streaming support (Netflix, Spotify, Prime Video). |
| `google_api_key = ""` | Disables Google cloud services and authentication hooks. |
| `enable_reporting = false` | Strips external telemetry and metric reporting. |
| `enable_remoting = false` | Removes remote desktop and cloud telemetry components. |

---

## 5. Output Artifacts

- **Standalone Windows Installer:** `dist\installer\Rinswa.Setup.v1.0.6.exe`
- **Standalone Binary:** `chromium\src\out\RinswaRelease\chrome.exe` (stamped with Rinswa emblem)

---

## 6. Author & License

- **Developer:** Arindam Makar ([GitHub: @deadxfire](https://github.com/deadxfire))
- **License:** Mozilla Public License 2.0 (MPL-2.0) / Chromium BSD-3-Clause
