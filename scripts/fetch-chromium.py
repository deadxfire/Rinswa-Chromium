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

    def is_valid_git_checkout(directory):
        if not os.path.isdir(directory):
            return False
        res = subprocess.run(
            ["git", "-C", directory, "rev-parse", "--verify", "HEAD"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return res.returncode == 0

    # Decide whether to fetch or sync
    has_valid_src = is_valid_git_checkout(SRC_DIR)

    gclient_bat = os.path.join(depot_tools, "gclient.bat")
    fetch_bat = os.path.join(depot_tools, "fetch.bat")

    if has_valid_src and os.path.exists(GCLIENT_FILE):
        print("\n[INFO] Valid Chromium checkout detected. Synchronizing...")
        cmd = ["cmd.exe", "/c", gclient_bat, "sync", "-D", "-R", "--no-history"]
    else:
        if os.path.exists(SRC_DIR) and not has_valid_src:
            print("\n[WARNING] Found corrupted/incomplete 'src' folder (no commit checked out).")
            print("          Cleaning incomplete directory for a fresh checkout...")
            try:
                # Remove incomplete .git or src to avoid 'unmanaged solution' or exit code 128
                shutil.rmtree(os.path.join(SRC_DIR, ".git"), ignore_errors=True)
            except Exception as e:
                print(f"          Notice: {e}")

        print("\n[INFO] Initial shallow checkout of Google Chromium C++ source tree...")
        cmd = ["cmd.exe", "/c", fetch_bat, "--no-history", "chromium"]

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
