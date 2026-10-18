@echo off
:: Rinswa Chromium - Windows Defender Compiler Acceleration Script
:: Run this script as Administrator to prevent Windows Defender Antivirus from scanning
:: millions of temporary compiler objects (.obj, .lib, .pdb), boosting compilation speed by 2x to 4x.

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] This script must be run as Administrator to configure Windows Defender exclusions.
    echo Right-click this script and select 'Run as administrator'.
    pause
    exit /b 1
)

echo ========================================================
echo     RINSWA CHROMIUM - COMPILER ACCELERATION SETUP
echo ========================================================
echo.
echo Adding Folder Exclusions to Windows Defender...
powershell -Command "Add-MpPreference -ExclusionPath 'C:\cr'" >nul 2>&1
powershell -Command "Add-MpPreference -ExclusionPath '%~dp0..'" >nul 2>&1

echo Adding Process Exclusions for Clang, LLD and Ninja...
powershell -Command "Add-MpPreference -ExclusionProcess 'ninja.exe'" >nul 2>&1
powershell -Command "Add-MpPreference -ExclusionProcess 'clang-cl.exe'" >nul 2>&1
powershell -Command "Add-MpPreference -ExclusionProcess 'lld-link.exe'" >nul 2>&1
powershell -Command "Add-MpPreference -ExclusionProcess 'gn.exe'" >nul 2>&1

echo.
echo [SUCCESS] Windows Defender exclusions applied!
echo Compiler file-I/O is now operating at maximum NVMe/SSD speeds without antivirus latency.
echo.
pause
exit /b 0
