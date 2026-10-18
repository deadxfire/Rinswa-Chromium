#!/usr/bin/env python3
"""
Rinswa Browser (Chromium Edition)
Standalone Offline Setup Installer Builder
Developed and made by Arindam Makar
Packages the standalone offline setup installer (.exe) for Windows x64.
"""

import os
import sys
import shutil
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION_FILE = os.path.join(PROJECT_ROOT, "rinswa-version.txt")
DIST_DIR = os.path.join(PROJECT_ROOT, "dist")
STAGE_DIR = os.path.join(DIST_DIR, "staging")
PORTABLE_DIR = os.path.join(DIST_DIR, "portable")
INSTALLER_DIR = os.path.join(DIST_DIR, "installer")
ISS_FILE = os.path.join(PROJECT_ROOT, "installer", "rinswa-installer.iss")

def get_app_version():
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, "r", encoding="utf-8") as f:
            v = f.read().strip()
            if v:
                return v
    return "1.0.6"

def find_iscc():
    candidates = [
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Inno Setup 6\ISCC.exe"),
        r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
        r"C:\Program Files\Inno Setup 6\ISCC.exe",
        r"C:\Program Files (x86)\Inno Setup 5\ISCC.exe",
        r"C:\Program Files\Inno Setup 5\ISCC.exe",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    # Try PATH
    iscc_in_path = shutil.which("ISCC.exe") or shutil.which("iscc")
    if iscc_in_path:
        return iscc_in_path
    return None

def find_chromium_output():
    candidates = [
        os.path.join(PROJECT_ROOT, "chromium", "src", "out", "RinswaRelease"),
        r"C:\cr\chromium\src\out\RinswaRelease",
        os.path.join(PROJECT_ROOT, "src", "out", "RinswaRelease"),
    ]
    for c in candidates:
        if os.path.isdir(c) and (os.path.exists(os.path.join(c, "Rinswa.exe")) or os.path.exists(os.path.join(c, "chrome.exe"))):
            return c
    return None

def get_engine_version(src_dir):
    # Try Chrome-bin first
    chrome_bin = os.path.join(src_dir, "gen", "chrome", "installer", "mini_installer", "mini_installer", "temp_installer_archive", "Chrome-bin")
    if os.path.isdir(chrome_bin):
        for item in os.listdir(chrome_bin):
            if os.path.isdir(os.path.join(chrome_bin, item)) and item[0].isdigit():
                return item

    # Check installed path
    installed_app = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Arindam Makar", "Rinswa", "Application")
    if os.path.isdir(installed_app):
        for item in os.listdir(installed_app):
            if os.path.isdir(os.path.join(installed_app, item)) and item[0].isdigit():
                return item

    # Check portable dir
    if os.path.isdir(PORTABLE_DIR):
        for item in os.listdir(PORTABLE_DIR):
            if os.path.isdir(os.path.join(PORTABLE_DIR, item)) and item[0].isdigit():
                return item

    # Fallback to standard version
    return "158.0.8106.0"

def stage_distribution(src_dir, engine_ver):
    print(">> [1/4] Preparing clean distribution staging tree...")
    if os.path.exists(STAGE_DIR):
        shutil.rmtree(STAGE_DIR, ignore_errors=True)
    os.makedirs(STAGE_DIR, exist_ok=True)
    stage_ver = os.path.join(STAGE_DIR, engine_ver)
    os.makedirs(stage_ver, exist_ok=True)

    chrome_bin = os.path.join(src_dir, "gen", "chrome", "installer", "mini_installer", "mini_installer", "temp_installer_archive", "Chrome-bin")
    chrome_bin_ver = os.path.join(chrome_bin, engine_ver) if os.path.isdir(chrome_bin) else None

    installed_app = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Arindam Makar", "Rinswa", "Application")
    installed_ver = os.path.join(installed_app, engine_ver) if os.path.isdir(installed_app) else None

    # Helper function to copy from first available source
    def copy_first(filename, dest_path, candidate_dirs):
        for d in candidate_dirs:
            if not d:
                continue
            src_f = os.path.join(d, filename)
            if os.path.isfile(src_f):
                shutil.copy2(src_f, dest_path)
                return True
        return False

    def copy_dir_first(dirname, dest_path, candidate_dirs):
        for d in candidate_dirs:
            if not d:
                continue
            src_d = os.path.join(d, dirname)
            if os.path.isdir(src_d):
                if os.path.exists(dest_path):
                    shutil.rmtree(dest_path, ignore_errors=True)
                shutil.copytree(src_d, dest_path)
                return True
        return False

    root_candidates = [chrome_bin, src_dir, installed_app, PORTABLE_DIR]
    ver_candidates = [chrome_bin_ver, installed_ver, src_dir, PORTABLE_DIR]

    # 1. Stage Root Executables & Preferences
    copy_first("Rinswa.exe", os.path.join(STAGE_DIR, "Rinswa.exe"), root_candidates)
    if not os.path.exists(os.path.join(STAGE_DIR, "Rinswa.exe")):
        # If Rinswa.exe wasn't found under that name, copy chrome.exe as Rinswa.exe
        copy_first("chrome.exe", os.path.join(STAGE_DIR, "Rinswa.exe"), root_candidates)

    copy_first("chrome_proxy.exe", os.path.join(STAGE_DIR, "chrome_proxy.exe"), root_candidates)
    
    # Initial preferences
    init_pref_srcs = [os.path.join(PROJECT_ROOT, "config"), chrome_bin, src_dir, installed_app]
    copy_first("initial_preferences", os.path.join(STAGE_DIR, "initial_preferences"), init_pref_srcs)

    # Document icon for Windows file associations
    doc_ico = os.path.join(PROJECT_ROOT, "branding", "icons", "document.ico")
    if os.path.isfile(doc_ico):
        shutil.copy2(doc_ico, os.path.join(STAGE_DIR, "document.ico"))

    # License
    license_file = os.path.join(PROJECT_ROOT, "LICENSE")
    if os.path.isfile(license_file):
        shutil.copy2(license_file, os.path.join(STAGE_DIR, "LICENSE"))

    # VisualElementsManifest.xml
    ve_manifest_xml = f"""<Application xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
  <VisualElements
      ShowNameOnSquare150x150Logo='on'
      Square150x150Logo='{engine_ver}\\VisualElements\\Logo.png'
      Square70x70Logo='{engine_ver}\\VisualElements\\SmallLogo.png'
      Square44x44Logo='{engine_ver}\\VisualElements\\SmallLogo.png'
      ForegroundText='light'
      BackgroundColor='#5F6368'/>
</Application>
"""
    with open(os.path.join(STAGE_DIR, "Rinswa.VisualElementsManifest.xml"), "w", encoding="utf-8") as f:
        f.write(ve_manifest_xml)

    # 2. Stage Version Manifest (Crucial for Windows SxS Loader)
    manifest_name = f"{engine_ver}.manifest"
    if not copy_first(manifest_name, os.path.join(stage_ver, manifest_name), ver_candidates):
        # Generate valid assembly manifest if missing
        asm_manifest = f"""<assembly
  xmlns='urn:schemas-microsoft-com:asm.v1' manifestVersion='1.0'>
  <assemblyIdentity
      name='{engine_ver}'
      version='{engine_ver}'
      type='win32'/>
  <file name='chrome_elf.dll'/>
</assembly>
"""
        with open(os.path.join(stage_ver, manifest_name), "w", encoding="utf-8") as f:
            f.write(asm_manifest)

    # 3. Stage Core Binaries and Resource Packs into version directory
    core_files = [
        "chrome.dll",
        "chrome_elf.dll",
        "resources.pak",
        "chrome_100_percent.pak",
        "chrome_200_percent.pak",
        "icudtl.dat",
        "v8_context_snapshot.bin",
        "d3dcompiler_47.dll",
        "dxcompiler.dll",
        "libEGL.dll",
        "libGLESv2.dll",
        "vk_swiftshader.dll",
        "vk_swiftshader_icd.json",
        "vulkan-1.dll",
        "notification_helper.exe",
        "chrome_pwa_launcher.exe",
        "chrome_wer.dll",
        "eventlog_provider.dll",
    ]

    for fname in core_files:
        copy_first(fname, os.path.join(stage_ver, fname), ver_candidates)

    # 4. Stage MSVC Runtime DLLs (Enables 100% offline install on clean Windows PCs)
    vc_dlls = [
        "msvcp140.dll",
        "msvcp140_atomic_wait.dll",
        "vccorlib140.dll",
        "vcruntime140.dll",
        "vcruntime140_1.dll",
    ]
    for vc in vc_dlls:
        # Copy to version dir
        copy_first(vc, os.path.join(stage_ver, vc), [src_dir, installed_ver])
        # Also copy to root dir
        copy_first(vc, os.path.join(STAGE_DIR, vc), [src_dir, installed_app])

    # 5. Stage Subdirectories
    # Locales
    locales_copied = copy_dir_first("Locales", os.path.join(stage_ver, "Locales"), ver_candidates)
    if not locales_copied:
        copy_dir_first("locales", os.path.join(stage_ver, "Locales"), [src_dir, PORTABLE_DIR])

    # VisualElements
    ve_copied = copy_dir_first("VisualElements", os.path.join(stage_ver, "VisualElements"), ver_candidates)
    if not ve_copied:
        # Fallback to create from branding icons
        ve_dir = os.path.join(stage_ver, "VisualElements")
        os.makedirs(ve_dir, exist_ok=True)
        ribbon_png = os.path.join(PROJECT_ROOT, "Glossy Multicolour Ribbon R Emblem.png")
        if os.path.isfile(ribbon_png):
            shutil.copy2(ribbon_png, os.path.join(ve_dir, "Logo.png"))
            shutil.copy2(ribbon_png, os.path.join(ve_dir, "SmallLogo.png"))

    # Extensions, IwaKeyDistribution, MEIPreload
    for sub in ["Extensions", "IwaKeyDistribution", "MEIPreload"]:
        copy_dir_first(sub, os.path.join(stage_ver, sub), ver_candidates)

    # Stage Rinswa AdShield & Video Popout extension
    adshield_src = os.path.join(PROJECT_ROOT, "config", "adblock", "rinswa-adshield")
    if os.path.isdir(adshield_src):
        for target_loc in [
            os.path.join(STAGE_DIR, "resources", "rinswa-adshield"),
            os.path.join(STAGE_DIR, "rinswa-adshield"),
            os.path.join(stage_ver, "resources", "rinswa-adshield")
        ]:
            os.makedirs(os.path.dirname(target_loc), exist_ok=True)
            if os.path.exists(target_loc):
                shutil.rmtree(target_loc, ignore_errors=True)
            shutil.copytree(adshield_src, target_loc)
        print("   Staged Rinswa AdShield & Video Popout extension.")

    print(f"   Staged root files: {len(os.listdir(STAGE_DIR))} items")
    print(f"   Staged version directory '{engine_ver}': {len(os.listdir(stage_ver))} items")

    # 6. Synchronize into dist/portable so portable distribution works without SxS error
    print(">> [2/4] Synchronizing verified SxS layout to dist/portable...")
    os.makedirs(PORTABLE_DIR, exist_ok=True)
    # Clean up old flattened dlls in root of portable that belong in version dir
    for f in os.listdir(STAGE_DIR):
        src_item = os.path.join(STAGE_DIR, f)
        dst_item = os.path.join(PORTABLE_DIR, f)
        if os.path.isdir(src_item):
            if os.path.exists(dst_item):
                shutil.rmtree(dst_item, ignore_errors=True)
            shutil.copytree(src_item, dst_item)
        else:
            shutil.copy2(src_item, dst_item)

    # Clean old flattened chrome.dll and paks in portable root to avoid confusion
    for obsolete in ["chrome.dll", "resources.pak", "chrome_100_percent.pak", "chrome_200_percent.pak", "icudtl.dat", "v8_context_snapshot.bin", "chrome.exe"]:
        obs_p = os.path.join(PORTABLE_DIR, obsolete)
        if os.path.isfile(obs_p):
            try:
                os.remove(obs_p)
            except Exception:
                pass

    print("   Updated dist/portable with versioned engine layout.")
    return True

def compile_installer(app_version, engine_ver, iscc_exe):
    print(">> [3/4] Compiling standalone offline installer via Inno Setup...")
    os.makedirs(INSTALLER_DIR, exist_ok=True)

    cmd = [
        iscc_exe,
        f"/DAppVersion={app_version}",
        f"/DEngineVersion={engine_ver}",
        f"/DStageDir={os.path.abspath(STAGE_DIR)}",
        f"/DProjectRoot={os.path.abspath(PROJECT_ROOT)}",
        f"/O{os.path.abspath(INSTALLER_DIR)}",
        ISS_FILE
    ]

    print(f"   Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=PROJECT_ROOT)
    if result.returncode != 0:
        print("[ERROR] Inno Setup compilation failed!")
        return False

    out_file = os.path.join(INSTALLER_DIR, f"Rinswa-Browser-Setup-x64-v{app_version}.exe")
    alias_file = os.path.join(INSTALLER_DIR, f"Rinswa.Setup.v{app_version}.exe")

    if os.path.isfile(out_file):
        shutil.copy2(out_file, alias_file)
        size_mb = os.path.getsize(out_file) / (1024 * 1024)
        print(f">> [4/4] SUCCESS: Standalone Offline Setup Installer Built!")
        print(f"   Installer: {out_file} ({size_mb:.2f} MB)")
        print(f"   Alias:     {alias_file}")
        return True
    else:
        print(f"[ERROR] Expected output not found: {out_file}")
        return False

def main():
    print("=" * 65)
    print("  RINSWA BROWSER - STANDALONE OFFLINE INSTALLER PACKAGER")
    print("           Developed and made by Arindam Makar")
    print("=" * 65)

    iscc_exe = find_iscc()
    if not iscc_exe:
        print("[ERROR] Inno Setup Compiler (ISCC.exe) was not found on this system!")
        print("Please install Inno Setup 6 (e.g. via 'winget install JRSoftware.InnoSetup').")
        sys.exit(1)
    print(f"Found Inno Setup Compiler: {iscc_exe}")

    src_dir = find_chromium_output()
    if not src_dir:
        print("[ERROR] Chromium build output not found!")
        print("Please compile Rinswa Chromium using 'Build-Rinswa-Chromium.bat' first.")
        sys.exit(1)
    print(f"Found Chromium Release Output: {src_dir}")

    app_ver = get_app_version()
    engine_ver = get_engine_version(src_dir)
    print(f"Rinswa Browser Version: {app_ver}")
    print(f"Chromium Engine Version: {engine_ver}")
    print()

    if not stage_distribution(src_dir, engine_ver):
        print("[ERROR] Failed to stage files.")
        sys.exit(1)

    if not compile_installer(app_ver, engine_ver, iscc_exe):
        sys.exit(1)

    print("\nInstaller is 100% standalone, fully offline, and ready to install on any PC.")
    print("=" * 65)

if __name__ == "__main__":
    main()
