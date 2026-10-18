@echo off
title Rinswa Browser (Chromium Engine)
cd /d "%~dp0"

:: Set AdShield extension path (built-in YouTube defuser & adblocker)
set "ADSHIELD_PATH="
if exist "%~dp0config\adblock\rinswa-adshield\manifest.json" (
    set "ADSHIELD_PATH=--load-extension=%~dp0config\adblock\rinswa-adshield"
) else if exist "%~dp0chromium\src\out\RinswaRelease\adblock\rinswa-adshield\manifest.json" (
    set "ADSHIELD_PATH=--load-extension=%~dp0chromium\src\out\RinswaRelease\adblock\rinswa-adshield"
) else if exist "C:\cr\chromium\src\out\RinswaRelease\adblock\rinswa-adshield\manifest.json" (
    set "ADSHIELD_PATH=--load-extension=C:\cr\chromium\src\out\RinswaRelease\adblock\rinswa-adshield"
)

if exist "dist\portable\Rinswa.exe" (
    start "" "dist\portable\Rinswa.exe" %ADSHIELD_PATH% %*
) else if exist "C:\cr\chromium\src\out\RinswaRelease\Rinswa.exe" (
    start "" "C:\cr\chromium\src\out\RinswaRelease\Rinswa.exe" %ADSHIELD_PATH% %*
) else if exist "chromium\src\out\RinswaRelease\Rinswa.exe" (
    start "" "chromium\src\out\RinswaRelease\Rinswa.exe" %ADSHIELD_PATH% %*
) else if exist "dist\portable\chrome.exe" (
    start "" "dist\portable\chrome.exe" %ADSHIELD_PATH% %*
) else if exist "C:\cr\chromium\src\out\RinswaRelease\chrome.exe" (
    start "" "C:\cr\chromium\src\out\RinswaRelease\chrome.exe" %ADSHIELD_PATH% %*
) else if exist "chromium\src\out\RinswaRelease\chrome.exe" (
    start "" "chromium\src\out\RinswaRelease\chrome.exe" %ADSHIELD_PATH% %*
) else (
    echo [ERROR] Rinswa Chromium has not been compiled yet!
    echo Run 'Build-Rinswa-Chromium.bat' to build the browser.
    pause
)
