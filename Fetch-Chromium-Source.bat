@echo off
title Rinswa Chromium - Fetch Engine Source
color 0B

echo =======================================================
echo      RINSWA CHROMIUM - SOURCE ENGINE DOWNLOADER
echo         Developed and made by Arindam Makar
echo =======================================================
echo.

cd /d "%~dp0"

:: Set depot_tools path
set "DEPOT_TOOLS_DIR=C:\depot_tools"
if not exist "%DEPOT_TOOLS_DIR%\fetch.bat" (
    if exist "%~dp0depot_tools\fetch.bat" (
        set "DEPOT_TOOLS_DIR=%~dp0depot_tools"
    ) else (
        echo [ERROR] depot_tools was not found!
        echo Run 'Setup-Build-Environment.bat' first.
        goto :fail
    )
)

set "PATH=%DEPOT_TOOLS_DIR%;%PATH%"
set "DEPOT_TOOLS_WIN_TOOLCHAIN=0"

echo depot_tools located at: %DEPOT_TOOLS_DIR%
echo.
echo Destination: %CD%\chromium\src
echo.
echo WARNING: The Chromium C++ source code tree is extensive.
echo Ensure you have at least 50GB of free SSD storage and a stable internet connection.
echo.
echo Press any key to begin checkout...
pause >nul

if not exist "chromium" mkdir "chromium"
cd chromium

if exist "src" (
    echo [INFO] Existing 'src' directory found! Running gclient sync...
    call gclient sync -D -R
) else (
    echo [INFO] Fetching modern Chromium source (--no-history shallow mode)...
    call fetch --no-history chromium
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Fetch/sync encountered an error.
    goto :fail
)

cd /d "%~dp0"

echo.
echo =======================================================
echo            SOURCE CHECKOUT COMPLETE!
echo =======================================================
echo Chromium engine source is ready at: %CD%\chromium\src
echo.
echo Next step: Double click 'Build-Rinswa-Chromium.bat' to compile!
echo.
pause
exit /b 0

:fail
echo.
echo =======================================================
echo               SOURCE CHECKOUT FAILED
echo =======================================================
echo.
pause
exit /b 1
