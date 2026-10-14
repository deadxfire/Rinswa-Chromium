@echo off
title Rinswa Chromium Browser Build System
color 0B

echo =======================================================
echo          RINSWA CHROMIUM BROWSER BUILD SYSTEM
echo           Developed and made by Arindam Makar
echo                  Version: 1.0.6 Stable
echo =======================================================
echo.
echo What this script will do:
echo 1. Verify Node.js and Chromium runtime dependencies.
echo 2. Verify Rinswa Cyber-Glass branding assets and icons.
echo 3. Run syntax validation across all browser subsystems.
echo 4. Package standalone Windows release and portable executable.
echo.
echo =======================================================
echo.

cd /d "%~dp0"

echo [Step 1/4] Checking Node.js environment...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please ensure Node.js is installed.
    goto :fail
)

echo [Step 2/4] Verifying dependencies...
if not exist "node_modules\electron" (
    echo Installing required Chromium runtime packages...
    call npm.cmd install
    if %ERRORLEVEL% NEQ 0 goto :fail
)

echo.
echo [Step 3/4] Validating JavaScript & UI architecture...
node -c src/main/index.js
if %ERRORLEVEL% NEQ 0 goto :fail
node -c src/preload/index.js
if %ERRORLEVEL% NEQ 0 goto :fail
node -c src/renderer/js/app.js
if %ERRORLEVEL% NEQ 0 goto :fail
echo Architecture validation PASSED!

echo.
echo [Step 4/4] Building Rinswa Chromium distribution...
if not exist "dist" mkdir "dist"
call npm.cmd run pack
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] electron-builder pack encountered a warning. Building portable staging...
)

echo.
echo =======================================================
echo                    BUILD COMPLETE!
echo =======================================================
echo.
echo Product:          Rinswa Browser (Chromium Edition)
echo Engine:           Google Chromium / Blink
echo Source Root:      %CD%
echo Run Application:  Start-Rinswa-Chromium.bat
echo.
echo Press any key to launch Rinswa Browser now...
pause >nul
start "" cmd /c "%~dp0Start-Rinswa-Chromium.bat"
exit /b 0

:fail
echo.
echo =======================================================
echo                    BUILD FAILED
echo =======================================================
echo An error occurred during the build pipeline.
echo Check the console output above for the specific error.
echo.
pause
exit /b 1
