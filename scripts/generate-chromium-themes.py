#!/usr/bin/env python3
"""
Rinswa Chromium Browser - Native Theme Generator
Generates native Chromium theme packages for all 8 specified color themes:
#cbd8e1, #e4d6d8, #ccdfd8, #c7c7c7, #e1d0d1, #d1d1db, #e5d4ce, #e6decb
Developed by Arindam Makar
"""

import os
import json

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEMES_DIR = os.path.join(PROJECT_DIR, "branding", "themes")

THEMES = [
    {"name": "Soft Slate Blue", "hex": "#cbd8e1", "rgb": [203, 216, 225], "is_default": True},
    {"name": "Rose Mist", "hex": "#e4d6d8", "rgb": [228, 214, 216], "is_default": False},
    {"name": "Sage Mint", "hex": "#ccdfd8", "rgb": [204, 223, 216], "is_default": False},
    {"name": "Clean Ash Gray", "hex": "#c7c7c7", "rgb": [199, 199, 199], "is_default": False},
    {"name": "Dusty Lilac", "hex": "#e1d0d1", "rgb": [225, 208, 209], "is_default": False},
    {"name": "Periwinkle Ice", "hex": "#d1d1db", "rgb": [209, 209, 219], "is_default": False},
    {"name": "Peach Sand", "hex": "#e5d4ce", "rgb": [229, 212, 206], "is_default": False},
    {"name": "Warm Linen Cream", "hex": "#e6decb", "rgb": [230, 222, 203], "is_default": False},
]

def hex_to_rgb(hex_code):
    h = hex_code.lstrip('#')
    return [int(h[i:i+2], 16) for i in (0, 2, 4)]

def generate():
    os.makedirs(THEMES_DIR, exist_ok=True)
    print("=" * 60)
    print("RINSWA NATIVE CHROMIUM THEME GENERATOR")
    print("=" * 60)

    for item in THEMES:
        color_code = item["hex"]
        slug = color_code.replace("#", "")
        folder_name = f"theme-{slug}"
        target_dir = os.path.join(THEMES_DIR, folder_name)
        os.makedirs(target_dir, exist_ok=True)

        rgb = item["rgb"]
        # Inactive frame is slightly darker/softer
        inactive_rgb = [max(0, c - 15) for c in rgb]

        manifest = {
            "manifest_version": 3,
            "version": "1.0.6",
            "name": f"Rinswa Theme ({item['name']} {color_code})",
            "description": f"Official Rinswa Browser native color theme {color_code} by Arindam Makar",
            "theme": {
                "colors": {
                    "frame": rgb,
                    "frame_inactive": inactive_rgb,
                    "toolbar": [255, 255, 255],
                    "tab_text": [30, 41, 59],
                    "tab_background_text": [100, 116, 139],
                    "bookmark_text": [30, 41, 59],
                    "toolbar_button_icon": [71, 85, 105],
                    "omnibox_background": [255, 255, 255],
                    "omnibox_text": [30, 41, 59],
                    "ntp_background": rgb,
                    "ntp_text": [30, 41, 59]
                },
                "tints": {
                    "buttons": [rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0]
                }
            }
        }

        manifest_path = os.path.join(target_dir, "manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        print(f"Generated: {folder_name}/manifest.json -> {color_code}")

    # Write master default theme manifest in branding/themes/manifest.json
    default_manifest = os.path.join(THEMES_DIR, "manifest.json")
    with open(os.path.join(THEMES_DIR, "theme-cbd8e1", "manifest.json"), "r", encoding="utf-8") as f:
        content = f.read()
    with open(default_manifest, "w", encoding="utf-8") as f:
        f.write(content)

    print("\nSUCCESS: All 8 native Chromium themes generated cleanly!")

if __name__ == "__main__":
    generate()
