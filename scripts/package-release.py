import os
import shutil

PROJECT_ROOT = r"C:\cr"
SRC = os.path.join(PROJECT_ROOT, "chromium", "src", "out", "RinswaRelease")
DIST_INS = os.path.join(PROJECT_ROOT, "dist", "installer")
DIST_PORT = os.path.join(PROJECT_ROOT, "dist", "portable")

os.makedirs(DIST_INS, exist_ok=True)
os.makedirs(DIST_PORT, exist_ok=True)

def get_version():
    vfile = os.path.join(PROJECT_ROOT, "rinswa-version.txt")
    if os.path.exists(vfile):
        with open(vfile, "r", encoding="utf-8") as f:
            v = f.read().strip()
            if v:
                return v
    return "2.0.0.1"

version = get_version()

# 1. Package Installer
installer_src = os.path.join(SRC, "mini_installer.exe")
installer_dest = os.path.join(DIST_INS, f"Rinswa.Setup.v{version}.exe")
shutil.copy2(installer_src, installer_dest)
print(f"Installer packaged: {installer_dest} ({os.path.getsize(installer_dest)} bytes)")

# 2. Package Portable distribution
files_to_copy = [
    "Rinswa.exe",
    "chrome.dll",
    "chrome_elf.dll",
    "resources.pak",
    "chrome_100_percent.pak",
    "chrome_200_percent.pak",
    "icudtl.dat",
    "v8_context_snapshot.bin",
    "d3dcompiler_47.dll",
    "libEGL.dll",
    "libGLESv2.dll",
    "vk_swiftshader.dll",
    "vulkan-1.dll",
    "initial_preferences",
]

for fname in files_to_copy:
    src_f = os.path.join(SRC, fname)
    if os.path.exists(src_f):
        shutil.copy2(src_f, os.path.join(DIST_PORT, fname))
        print(f"  Copied {fname}")

# Clean up chrome.exe from portable distribution if present
chrome_port = os.path.join(DIST_PORT, "chrome.exe")
if os.path.exists(chrome_port):
    try:
        os.remove(chrome_port)
    except Exception:
        pass

# Copy directories: locales
for dirname in ["locales"]:
    src_d = os.path.join(SRC, dirname)
    dest_d = os.path.join(DIST_PORT, dirname)
    if os.path.isdir(src_d):
        if os.path.exists(dest_d):
            shutil.rmtree(dest_d)
        shutil.copytree(src_d, dest_d)
        print(f"  Copied directory {dirname}/")

# Clean up any leftover adblock directories in portable
adblock_port = os.path.join(DIST_PORT, "adblock")
if os.path.exists(adblock_port):
    shutil.rmtree(adblock_port, ignore_errors=True)
    print("  Removed leftover adblock from portable distribution")

# Sync rinswa-adshield into portable
adshield_src = os.path.join(PROJECT_ROOT, "config", "adblock", "rinswa-adshield")
adshield_dst = os.path.join(DIST_PORT, "rinswa-adshield")
if os.path.isdir(adshield_src):
    if os.path.exists(adshield_dst):
        shutil.rmtree(adshield_dst)
    shutil.copytree(adshield_src, adshield_dst)
    print("  Copied rinswa-adshield extension to portable distribution")

# Also sync and clean into LOCALAPPDATA installed directory if present
local_app = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Arindam Makar", "Rinswa", "Application")
if os.path.isdir(local_app):
    adblock_dst = os.path.join(local_app, "adblock")
    if os.path.exists(adblock_dst):
        shutil.rmtree(adblock_dst, ignore_errors=True)
        print(f"  Removed adblock extension directory from installed path: {adblock_dst}")
    
    # Remove chrome.exe from installed path if present
    chrome_installed = os.path.join(local_app, "chrome.exe")
    if os.path.exists(chrome_installed):
        try:
            os.remove(chrome_installed)
            print("  Removed chrome.exe from installed path")
        except Exception as e:
            print(f"  Note: Could not remove chrome.exe: {e}")

    try:
        shutil.copy2(os.path.join(SRC, "Rinswa.exe"), os.path.join(local_app, "Rinswa.exe"))
        print(f"  Synced Rinswa.exe to installed path: {local_app}")
    except Exception as e:
        print(f"  Note: Could not copy Rinswa.exe directly (process might be running): {e}")

    # Recreate Desktop and Start Menu shortcuts
    try:
        import subprocess
        ps_code = r'''
        $WshShell = New-Object -ComObject WScript.Shell
        $desktop = [System.Environment]::GetFolderPath('Desktop')
        $startMenu = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"
        $target = "C:\Users\arind\AppData\Local\Arindam Makar\Rinswa\Application\Rinswa.exe"
        $workDir = "C:\Users\arind\AppData\Local\Arindam Makar\Rinswa\Application"

        foreach ($dir in @($desktop, $startMenu)) {
            $shortcut = $WshShell.CreateShortcut("$dir\Rinswa Browser.lnk")
            $shortcut.TargetPath = $target
            $shortcut.WorkingDirectory = $workDir
            $shortcut.IconLocation = "$target,0"
            $shortcut.Description = "Rinswa Browser"
            $shortcut.Save()
        }
        '''
        subprocess.run(["powershell", "-NoProfile", "-Command", ps_code], capture_output=True)
        print("  Created/updated Desktop & Start Menu shortcuts for Rinswa Browser")
    except Exception as e:
        print(f"  Note: Could not update shortcuts: {e}")

    ver_dir = os.path.join(local_app, "158.0.8106.0")
    if os.path.exists(ver_dir):
        for pak in ["resources.pak", "chrome_100_percent.pak", "chrome_200_percent.pak"]:
            src_pak = os.path.join(SRC, pak)
            if os.path.exists(src_pak):
                try:
                    shutil.copy2(src_pak, os.path.join(ver_dir, pak))
                    print(f"  Synced {pak} to installed version directory")
                except Exception as e:
                    print(f"  Note: Could not copy {pak}: {e}")

        # Sync locales
        locales_src = os.path.join(SRC, "locales")
        locales_dst = os.path.join(ver_dir, "Locales")
        if os.path.isdir(locales_src):
            try:
                for loc in os.listdir(locales_src):
                    shutil.copy2(os.path.join(locales_src, loc), os.path.join(locales_dst, loc))
                print(f"  Synced locales to installed version directory")
            except Exception as e:
                print(f"  Note: Could not copy locales: {e}")

        dll_dest = os.path.join(ver_dir, "chrome.dll")
        try:
            shutil.copy2(os.path.join(SRC, "chrome.dll"), dll_dest)
            print(f"  Synced chrome.dll to installed path: {dll_dest}")
        except Exception as e:
            print(f"  Note: Could not copy chrome.dll directly (process might be running): {e}")

print("\nSUCCESS: All release assets packaged into dist/!")
