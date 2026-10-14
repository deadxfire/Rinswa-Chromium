#!/usr/bin/env python3
"""
Rinswa Chromium Browser - Native Engine Source Downloader
Developed and made by Arindam Makar
Fetches and synchronizes Google Chromium C++ source tree into chromium/src.
"""

import os
import sys
import subprocess
import shutil

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMIUM_DIR = os.path.join(PROJECT_DIR, "chromium")
SRC_DIR = os.path.join(CHROMIUM_DIR, "src")
GCLIENT_FILE = os.path.join(CHROMIUM_DIR, ".gclient")

def setup_environment():
    depot_tools = r"C:\depot_tools"
    if not os.path.isdir(depot_tools):
        local_depot = os.path.join(PROJECT_DIR, "depot_tools")
        if os.path.isdir(local_depot):
            depot_tools = local_depot
        else:
            print("[ERROR] Google depot_tools was not found at C:\\depot_tools!")
            print("Please run 'Setup-Build-Environment.bat' first.")
            return None

    os.environ["PATH"] = depot_tools + os.pathsep + os.environ.get("PATH", "")
    os.environ["DEPOT_TOOLS_WIN_TOOLCHAIN"] = "0"
    os.environ["GYP_MSVS_VERSION"] = "2022"
    os.environ["PYTHONUNBUFFERED"] = "1"

    # Git recommended settings for Chromium
    subprocess.run(["git", "config", "--global", "core.longpaths", "true"], check=False)
    subprocess.run(["git", "config", "--global", "core.autocrlf", "false"], check=False)
    subprocess.run(["git", "config", "--global", "depot-tools.allowGlobalGitConfig", "true"], check=False)

    return depot_tools

def run_streaming(cmd, cwd):
    print(f"\n>> Executing: {' '.join(cmd)}")
    print(f">> Working Directory: {cwd}\n")
    sys.stdout.flush()

    process = subprocess.Popen(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    for line in iter(process.stdout.readline, ''):
        print(line, end='', flush=True)

    process.stdout.close()
    return_code = process.wait()
    return return_code

def main():
    print("=" * 60)
    print("     RINSWA CHROMIUM - SOURCE ENGINE DOWNLOADER")
    print("        Developed and made by Arindam Makar")
    print("=" * 60)
    print(f"Project Directory:  {PROJECT_DIR}")
    print(f"Target Source Path: {SRC_DIR}")

    depot_tools = setup_environment()
    if not depot_tools:
        sys.exit(1)

    print(f"depot_tools Path:   {depot_tools}")
    os.makedirs(CHROMIUM_DIR, exist_ok=True)

    python_bin = os.path.join(depot_tools, "python-bin", "python3.bat")
    if not os.path.exists(python_bin):
        python_bin = sys.executable

    # Decide whether to fetch or sync
    if os.path.exists(GCLIENT_FILE) or os.path.exists(os.path.join(SRC_DIR, "chrome")):
        print("\n[INFO] Existing .gclient / src checkout found. Synchronizing...")
        gclient_py = os.path.join(depot_tools, "gclient.py")
        cmd = [python_bin, gclient_py, "sync", "-D", "-R", "--no-history"]
    else:
        print("\n[INFO] Initial shallow checkout of Google Chromium C++ source tree...")
        fetch_py = os.path.join(depot_tools, "fetch.py")
        cmd = [python_bin, fetch_py, "--no-history", "chromium"]

    code = run_streaming(cmd, CHROMIUM_DIR)
    if code != 0:
        print(f"\n[ERROR] Source download failed with exit code: {code}")
        sys.exit(code)

    print("\n" + "=" * 60)
    print("          CHROMIUM SOURCE CHECKOUT COMPLETE!")
    print("=" * 60)
    print(f"Engine source is ready at: {SRC_DIR}")
    print("You can now compile by running: Build-Rinswa-Chromium.bat\n")

if __name__ == "__main__":
    main()
