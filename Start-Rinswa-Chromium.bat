@echo off
title Rinswa Browser (Chromium Engine)
cd /d "%~dp0"

if exist "chromium\src\out\RinswaRelease\chrome.exe" (
    start "" "chromium\src\out\RinswaRelease\chrome.exe" %*
) else if exist "dist\portable\chrome.exe" (
    start "" "dist\portable\chrome.exe" %*
) else (
    echo [ERROR] Rinswa Chromium has not been compiled yet!
    echo Run 'Build-Rinswa-Chromium.bat' to build the browser.
    pause
)
