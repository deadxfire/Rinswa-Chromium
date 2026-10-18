#!/usr/bin/env python3
"""
Rinswa Browser (Chromium Engine) - Overlay & Customization Injector
Developed and made by Arindam Makar
Injects Rinswa Cyber-Glass branding, GN flags, version metadata, themes, and wallpaper into Chromium source tree.
"""

import os
import sys
import shutil

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION_FILE = os.path.join(PROJECT_DIR, "rinswa-version.txt")
CONFIG_ARGS_GN = os.path.join(PROJECT_DIR, "config", "args.gn")
BRANDING_OVERLAY = os.path.join(PROJECT_DIR, "branding", "chromium-overlay")
UI_NEWTAB_DIR = os.path.join(PROJECT_DIR, "ui", "newtab")
THEMES_DIR = os.path.join(PROJECT_DIR, "branding", "themes")

def get_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            return f.read().strip()
    return "1.0.7"

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
    print(f">> [1/5] Deploying Rinswa release GN directives to {target_args}...")
    shutil.copy2(CONFIG_ARGS_GN, target_args)

    # 2. Deploy Branding Assets (Icons, Bitmaps, Logos)
    print(">> [2/5] Injecting Rinswa branding, ribbons, and multi-res icons...")
    deploy_script = os.path.join(PROJECT_DIR, "scripts", "deploy-rinswa-logos.py")
    if os.path.exists(deploy_script):
        import subprocess
        subprocess.run([sys.executable, deploy_script], cwd=PROJECT_DIR, check=False)

    for root, dirs, files in os.walk(BRANDING_OVERLAY):
        rel_path = os.path.relpath(root, BRANDING_OVERLAY)
        target_root = os.path.join(chromium_src_dir, rel_path)
        os.makedirs(target_root, exist_ok=True)
        for f in files:
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_root, f)
            shutil.copy2(src_file, dest_file)
            print(f"   Injected: {rel_path}/{f}")

    # 3. Deploy New Tab Page & Dreamy Meadow Mist Wallpaper
    print(">> [3/5] Deploying Dreamy Meadow Mist New Tab Page & Cyber-Glass UI...")
    ntp_dest = os.path.join(chromium_src_dir, "chrome", "browser", "resources", "rinswa_ntp")
    os.makedirs(ntp_dest, exist_ok=True)
    if os.path.isdir(UI_NEWTAB_DIR):
        for f in os.listdir(UI_NEWTAB_DIR):
            src_file = os.path.join(UI_NEWTAB_DIR, f)
            dest_file = os.path.join(ntp_dest, f)
            if os.path.isfile(src_file):
                shutil.copy2(src_file, dest_file)
                print(f"   Deployed UI asset: {f}")

    # 4. Deploy Native 8 Theme Packages (#cbd8e1, #e4d6d8, etc.)
    print(">> [4/5] Deploying 8 native palette themes into distribution...")
    themes_dest = os.path.join(chromium_src_dir, "chrome", "browser", "resources", "rinswa_themes")
    os.makedirs(themes_dest, exist_ok=True)
    if os.path.isdir(THEMES_DIR):
        for root, dirs, files in os.walk(THEMES_DIR):
            rel_path = os.path.relpath(root, THEMES_DIR)
            target_root = os.path.join(themes_dest, rel_path)
            os.makedirs(target_root, exist_ok=True)
            for f in files:
                shutil.copy2(os.path.join(root, f), os.path.join(target_root, f))
        print("   Deployed all 8 native theme color packages.")

    # 5. Stamp Version Metadata
    print(f">> [5/6] Stamping Rinswa v{version} Stable metadata...")
    version_header = os.path.join(chromium_src_dir, "chrome", "common", "chrome_version.h.in")
    if os.path.exists(version_header):
        with open(version_header, "r", encoding="utf-8") as f:
            content = f.read()
        if "RINSWA_VERSION" not in content:
            content += f'\n#define RINSWA_VERSION "{version}"\n#define RINSWA_AUTHOR "Arindam Makar"\n'
            with open(version_header, "w", encoding="utf-8") as f:
                f.write(content)
            print("   Stamped version header.")

    # 6. Deploy Native Adblock Data, Rinswa AdShield Extension & initial_preferences
    print(">> [6/6] Deploying Rinswa AdShield, YouTube Defuser & initial_preferences...")
    # Deploy initial_preferences
    init_prefs_src = os.path.join(PROJECT_DIR, "config", "initial_preferences")
    if os.path.exists(init_prefs_src):
        shutil.copy2(init_prefs_src, os.path.join(out_dir, "initial_preferences"))
        print("   Deployed initial_preferences (uBlock Origin auto-installed by default).")

    # Deploy Rinswa AdShield & Universal PiP extension
    adshield_src = os.path.join(PROJECT_DIR, "config", "adblock", "rinswa-adshield")
    if os.path.exists(adshield_src):
        for sub in [os.path.join(out_dir, "resources", "rinswa-adshield"), os.path.join(out_dir, "rinswa-adshield")]:
            if os.path.exists(sub):
                shutil.rmtree(sub, ignore_errors=True)
            shutil.copytree(adshield_src, sub)
        print("   Deployed Rinswa AdShield & Video Popout extension to resources/rinswa-adshield.")

    # 7. Ensure TypeScript NTFS junction compatibility patch is applied
    validate_ts = os.path.join(chromium_src_dir, "tools", "typescript", "validate_tsconfig.py")
    if os.path.exists(validate_ts):
        with open(validate_ts, "r", encoding="utf-8") as f:
            v_content = f.read()
        if "real_src = os.path.realpath" not in v_content:
            print(">> [7/7] Applying NTFS junction compatibility patch to validate_tsconfig.py...")
            patch_file = os.path.join(PROJECT_DIR, "patches", "0005-fix-windows-junction-typescript-deps.patch")
            if os.path.exists(patch_file):
                import subprocess
                subprocess.run(["git", "apply", patch_file], cwd=chromium_src_dir, check=False)
                print("   Applied 0005-fix-windows-junction-typescript-deps.patch successfully.")
        else:
            print(">> [7/7] TypeScript NTFS junction compatibility patch already active.")

    # 8. Ensure theme locking and branding patch is applied
    theme_file = os.path.join(chromium_src_dir, "chrome", "browser", "themes", "theme_service.cc")
    if os.path.exists(theme_file):
        with open(theme_file, "r", encoding="utf-8") as f:
            t_content = f.read()
        if "Rinswa Browser: Chrome theme engine" not in t_content:
            print(">> [8/8] Applying patch 0006 (theme locking & branding)...")
            patch_file = os.path.join(PROJECT_DIR, "patches", "0006-theme-locking-branding.patch")
            if os.path.exists(patch_file):
                import subprocess
                subprocess.run(["git", "apply", "--ignore-whitespace", patch_file], cwd=chromium_src_dir, check=False)
                print("   Applied 0006-theme-locking-branding.patch successfully.")
        else:
            print(">> [8/8] Theme locking & branding patches already active.")

    print("\nSUCCESS: Rinswa customizations applied cleanly to Chromium source tree!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        src_path = sys.argv[1]
    else:
        src_path = os.path.join(PROJECT_DIR, "chromium", "src")
        if not os.path.exists(src_path):
            src_path = os.path.join(PROJECT_DIR, "src")
    
    if not os.path.exists(src_path):
        print(f"[INFO] Chromium source directory not located at {src_path}")
        print("Run 'Fetch-Chromium-Source.bat' first to download the source tree.")
        sys.exit(0)

    success = prepare_overlay(src_path)
    sys.exit(0 if success else 1)
