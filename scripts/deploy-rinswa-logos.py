#!/usr/bin/env python3
"""
Rinswa Browser - Logo & Icon Deployment Tool
Replaces all application icons and product logos with the official user-provided Rinswa assets:
  Source ICO: C:\\Users\\arind\\Downloads\\Rinswa logo\\Rinswa.ico
  Source PNG: C:\\Users\\arind\\Downloads\\Rinswa logo\\Rinswa.png
"""

import os
import shutil
from PIL import Image

PROJECT_ROOT = r"C:\cr" if os.path.exists(r"C:\cr") else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_LOGO_DIR = r"C:\Users\arind\Downloads\Rinswa logo"
SRC_ICO = os.path.join(SRC_LOGO_DIR, "Rinswa.ico")
SRC_PNG = os.path.join(SRC_LOGO_DIR, "Rinswa.png")

def deploy():
    print(f"Deploying Rinswa Logo & Icons from: {SRC_LOGO_DIR}")
    assert os.path.exists(SRC_ICO), f"Missing {SRC_ICO}"
    assert os.path.exists(SRC_PNG), f"Missing {SRC_PNG}"

    # 1. Target ICO locations
    ico_destinations = [
        os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "chromium", "win", "chrome.ico"),
        os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "chromium", "win", "rinswa.ico"),
        os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "chromium", "win", "chromium.ico"),
        os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "chromium", "win", "chrome.ico"),
        os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "chromium", "win", "rinswa.ico"),
        os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "chromium", "win", "chromium.ico"),
        os.path.join(PROJECT_ROOT, "Glossy Multicolour Ribbon R Emblem.ico"),
        os.path.join(PROJECT_ROOT, "branding", "icons", "default.ico"),
    ]

    for dest in ico_destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(SRC_ICO, dest)
        print(f"  [ICO] Deployed: {os.path.relpath(dest, PROJECT_ROOT)}")

    # 2. Deploy Full-Res PNG to NTP & Root Emblem
    full_png_destinations = [
        os.path.join(PROJECT_ROOT, "Glossy Multicolour Ribbon R Emblem.png"),
        os.path.join(PROJECT_ROOT, "ui", "newtab", "Glossy Multicolour Ribbon R Emblem.png"),
        os.path.join(PROJECT_ROOT, "ui", "newtab", "rinswa-logo.png"),
        os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "chromium", "product_logo_256.png"),
        os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "chromium", "product_logo_256.png"),
        os.path.join(PROJECT_ROOT, "branding", "generated", "default256.png"),
        os.path.join(PROJECT_ROOT, "branding", "generated", "about-logo.png"),
        os.path.join(PROJECT_ROOT, "branding", "generated", "about-logo@2x.png"),
    ]

    for dest in full_png_destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        shutil.copy2(SRC_PNG, dest)
        print(f"  [PNG] Deployed Full-Res: {os.path.relpath(dest, PROJECT_ROOT)}")

    # 3. Generate Resampled PNGs for Chromium Theme Assets
    img = Image.open(SRC_PNG).convert("RGBA")
    sizes = [16, 24, 32, 48, 64, 128, 256]

    overlay_dir = os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "chromium")
    src_dir = os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "chromium")
    generated_dir = os.path.join(PROJECT_ROOT, "branding", "generated")

    for s in sizes:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)
        
        # Save to overlay
        dest_overlay = os.path.join(overlay_dir, f"product_logo_{s}.png")
        os.makedirs(os.path.dirname(dest_overlay), exist_ok=True)
        resized.save(dest_overlay, "PNG")

        # Save directly to chromium src
        dest_src = os.path.join(src_dir, f"product_logo_{s}.png")
        if os.path.exists(os.path.dirname(dest_src)):
            resized.save(dest_src, "PNG")

        # Save to default_100_percent (1x scale) and default_200_percent (2x scale)
        # default_100_percent gets s x s
        pct100_overlay = os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "default_100_percent", "chromium")
        pct100_src = os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "default_100_percent", "chromium")
        os.makedirs(pct100_overlay, exist_ok=True)
        resized.save(os.path.join(pct100_overlay, f"product_logo_{s}.png"), "PNG")
        if os.path.exists(pct100_src):
            resized.save(os.path.join(pct100_src, f"product_logo_{s}.png"), "PNG")

        # default_200_percent gets (s*2) x (s*2)
        resized_2x = img.resize((s * 2, s * 2), Image.Resampling.LANCZOS)
        pct200_overlay = os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", "default_200_percent", "chromium")
        pct200_src = os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", "default_200_percent", "chromium")
        os.makedirs(pct200_overlay, exist_ok=True)
        resized_2x.save(os.path.join(pct200_overlay, f"product_logo_{s}.png"), "PNG")
        if os.path.exists(pct200_src):
            resized_2x.save(os.path.join(pct200_src, f"product_logo_{s}.png"), "PNG")

        # Save to branding/generated
        dest_gen = os.path.join(generated_dir, f"default{s}.png")
        if os.path.exists(os.path.dirname(dest_gen)):
            resized.save(dest_gen, "PNG")

        print(f"  [PNG] Resampled {s}x{s} logo -> product_logo_{s}.png")

    # 4. Deploy Default Favicon & NTP Favicon (Replaces Chromium Swirl on New Tab and default tabs)
    print("\n>> Deploying Default Favicons & NTP Favicon across scales...")
    favicon_map = {
        # (scale_dir, filename): size
        ("default_100_percent", "favicon_ntp.png"): 16,
        ("default_200_percent", "favicon_ntp.png"): 32,
    }

    # NTP Favicon in chrome/app/theme
    for (scale, fname), size in favicon_map.items():
        resized_ico = img.resize((size, size), Image.Resampling.LANCZOS)
        ntp_overlay = os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "chrome", "app", "theme", scale, "common", fname)
        ntp_src = os.path.join(PROJECT_ROOT, "chromium", "src", "chrome", "app", "theme", scale, "common", fname)
        os.makedirs(os.path.dirname(ntp_overlay), exist_ok=True)
        resized_ico.save(ntp_overlay, "PNG")
        if os.path.exists(os.path.dirname(ntp_src)):
            resized_ico.save(ntp_src, "PNG")
            print(f"  [FAVICON] Deployed {fname} ({size}x{size}) -> {scale}/common")

    # UI Resources Default Favicons (Light and Dark)
    ui_favicons = [
        # 100% scale
        ("default_100_percent", "default_favicon.png", 16),
        ("default_100_percent", "default_favicon_32.png", 32),
        ("default_100_percent", "default_favicon_64.png", 64),
        ("default_100_percent", "default_favicon_dark.png", 16),
        ("default_100_percent", "default_favicon_dark_32.png", 32),
        ("default_100_percent", "default_favicon_dark_64.png", 64),
        # 200% scale
        ("default_200_percent", "default_favicon.png", 32),
        ("default_200_percent", "default_favicon_32.png", 64),
        ("default_200_percent", "default_favicon_64.png", 128),
        ("default_200_percent", "default_favicon_dark.png", 32),
        ("default_200_percent", "default_favicon_dark_32.png", 64),
        ("default_200_percent", "default_favicon_dark_64.png", 128),
        # 300% scale
        ("default_300_percent", "default_favicon.png", 48),
        ("default_300_percent", "default_favicon_32.png", 96),
        ("default_300_percent", "default_favicon_64.png", 192),
        ("default_300_percent", "default_favicon_dark.png", 48),
        ("default_300_percent", "default_favicon_dark_32.png", 96),
        ("default_300_percent", "default_favicon_dark_64.png", 192),
    ]

    for scale, fname, size in ui_favicons:
        resized_fav = img.resize((size, size), Image.Resampling.LANCZOS)
        ui_overlay = os.path.join(PROJECT_ROOT, "branding", "chromium-overlay", "ui", "resources", scale, "common", fname)
        ui_src = os.path.join(PROJECT_ROOT, "chromium", "src", "ui", "resources", scale, "common", fname)
        os.makedirs(os.path.dirname(ui_overlay), exist_ok=True)
        resized_fav.save(ui_overlay, "PNG")
        if os.path.exists(os.path.dirname(ui_src)):
            resized_fav.save(ui_src, "PNG")
            print(f"  [UI FAVICON] Deployed {fname} ({size}x{size}) -> {scale}/common")

    # Also deploy to ui/newtab
    ui_newtab_fav = os.path.join(PROJECT_ROOT, "ui", "newtab", "favicon.png")
    if os.path.exists(os.path.dirname(ui_newtab_fav)):
        img.resize((32, 32), Image.Resampling.LANCZOS).save(ui_newtab_fav, "PNG")

    print("\nSUCCESS: All Rinswa logos, app icons, and default/NTP favicons successfully deployed across project and Chromium source tree!")

if __name__ == "__main__":
    deploy()

