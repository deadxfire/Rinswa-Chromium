#!/usr/bin/env python3
"""
Rinswa Browser (Chromium Engine) - Overlay & Customization Injector
Developed and made by Arindam Makar
Injects Rinswa Cyber-Glass branding, GN flags, version metadata, and patches into Chromium source tree.
"""

import os
import sys
import shutil

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION_FILE = os.path.join(PROJECT_DIR, "rinswa-version.txt")
CONFIG_ARGS_GN = os.path.join(PROJECT_DIR, "config", "args.gn")
BRANDING_OVERLAY = os.path.join(PROJECT_DIR, "branding", "chromium-overlay")

def get_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "1.0.6"

def prepare_overlay(chromium_src_dir):
    version = get_version()
    print("=" * 60)
    print(f"RINSWA CHROMIUM OVERLAY INJECTOR (v{version})")
    print("Developed and made by Arindam Makar")
    print(f"Target Chromium Source: {chromium_src_dir}")
    print("=" * 60)

    if not os.path.isdir(chromium_src_dir):
        print(f"[ERROR] Chromium source directory not found: {chromium_src_dir}")
        return False

    # 1. Deploy GN build args to out/RinswaRelease/args.gn
    out_dir = os.path.join(chromium_src_dir, "out", "RinswaRelease")
    os.makedirs(out_dir, exist_ok=True)
    target_args = os.path.join(out_dir, "args.gn")
    print(f">> [1/4] Deploying Rinswa release GN directives to {target_args}...")
    shutil.copy2(CONFIG_ARGS_GN, target_args)

    # 2. Deploy Branding Assets (Icons, Bitmaps, Logos)
    print(">> [2/4] Injecting Rinswa branding, ribbons, and multi-res icons...")
    for root, dirs, files in os.walk(BRANDING_OVERLAY):
        rel_path = os.path.relpath(root, BRANDING_OVERLAY)
        target_root = os.path.join(chromium_src_dir, rel_path)
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_root, f)
            shutil.copy2(src_file, dest_file)
            print(f"   Injected: {rel_path}/{f}")

    # 3. Deploy Bundled Extensions & Policies
    print(">> [3/4] Bundling uBlock Origin adblocker and Smart Tabs distribution...")
    dist_ext_dir = os.path.join(chromium_src_dir, "chrome", "browser", "resources", "default_extensions")
    os.makedirs(dist_ext_dir, exist_ok=True)
    
    gecko_dist = os.path.join(PROJECT_DIR, "branding", "distribution", "extensions")
    if os.path.isdir(gecko_dist):
        for ext in os.listdir(gecko_dist):
            if ext.endswith(".xpi") or ext.endswith(".crx"):
                src_ext = os.path.join(gecko_dist, ext)
                shutil.copy2(src_ext, os.path.join(dist_ext_dir, ext))
                print(f"   Bundled extension: {ext}")

    # 4. Stamp Version Metadata
    print(f">> [4/4] Stamping Rinswa v{version} Stable metadata...")
    version_header = os.path.join(chromium_src_dir, "chrome", "common", "chrome_version.h.in")
    if os.path.exists(version_header):
        with open(version_header, "r", encoding="utf-8") as f:
            content = f.read()
        if "RINSWA_VERSION" not in content:
            content += f'\n#define RINSWA_VERSION "{version}"\n#define RINSWA_AUTHOR "Arindam Makar"\n'
            with open(version_header, "w", encoding="utf-8") as f:
                f.write(content)
            print("   Stamped version header.")

    print("\nSUCCESS: Rinswa customizations applied cleanly to Chromium source tree!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        src_path = sys.argv[1]
    else:
        # Default fallback to sibling or local chromium/src directory
        src_path = os.path.join(PROJECT_DIR, "chromium", "src")
        if not os.path.exists(src_path):
            src_path = os.path.join(PROJECT_DIR, "src")
    
    if not os.path.exists(src_path):
        print(f"[INFO] Chromium source directory not located at {src_path}")
        print("Run 'Fetch-Chromium-Source.bat' first to download the source tree.")
        sys.exit(0)

    success = prepare_overlay(src_path)
    sys.exit(0 if success else 1)
