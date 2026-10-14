@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "RINSWA_VERSION=1.0.6"
if exist "rinswa-version.txt" (
    set /p RINSWA_VERSION=<"rinswa-version.txt"
)
set "RINSWA_VERSION=%RINSWA_VERSION: =%"

title Rinswa Browser Chromium v%RINSWA_VERSION% - Build System
color 0B

echo =======================================================
echo     RINSWA BROWSER CHROMIUM (v%RINSWA_VERSION%) BUILD SYSTEM
echo          Developed and made by Arindam Makar
echo =======================================================
echo.
echo Version:   %RINSWA_VERSION% Stable (Official Chromium Engine)
echo Output:    chromium\src\out\RinswaRelease\
echo.
echo What this script will do:
echo 1. Verify Visual Studio C++ toolchain and Google depot_tools.
echo 2. Verify modern Chromium engine source tree.
echo 3. Inject custom Rinswa Cyber-Glass branding, logos, and GN args.
echo 4. Compile the real Chromium engine using Ninja (-j16).
echo 5. Package standalone installer (.exe) into dist\
echo.
echo Press any key to start building Rinswa Chromium...
pause >nul

:: 1. Verify Compiler Toolchain
echo.
echo [Step 1/5] Checking Visual Studio 2022/2026 C++ toolchain...
set "VS_DIR="
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\18\Community"
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\2022\Community"
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\2022\Professional"
)

if "%VS_DIR%"=="" (
    echo [ERROR] Visual Studio C++ Compiler was not found!
    echo Run 'Setup-Build-Environment.bat' to configure prerequisites.
    goto :fail
)
echo Found Visual Studio at: %VS_DIR%

:: 2. Verify depot_tools (GN & Ninja)
echo.
echo [Step 2/5] Checking Google depot_tools (gn, ninja)...
set "DEPOT_TOOLS_DIR=C:\depot_tools"
if not exist "%DEPOT_TOOLS_DIR%\gn.bat" (
    if exist "%~dp0depot_tools\gn.bat" (
        set "DEPOT_TOOLS_DIR=%~dp0depot_tools"
    ) else (
        echo [ERROR] depot_tools is missing!
        echo Run 'Setup-Build-Environment.bat' before continuing.
        goto :fail
    )
)
set "PATH=%DEPOT_TOOLS_DIR%;%PATH%"
set "DEPOT_TOOLS_WIN_TOOLCHAIN=0"
set "GYP_MSVS_VERSION=2022"

:: 3. Verify Chromium Engine Source
echo.
echo [Step 3/5] Checking Chromium source engine tree...
set "SRC_DIR="
if exist "%CD%\chromium\src\chrome\app" (
    set "SRC_DIR=%CD%\chromium\src"
) else if exist "%CD%\src\chrome\app" (
    set "SRC_DIR=%CD%\src"
)

if "%SRC_DIR%"=="" (
    echo.
    echo [ERROR] The Chromium source folder is missing!
    echo Ensure the engine source exists at '%CD%\chromium\src'.
    echo You can download it by running 'Fetch-Chromium-Source.bat'.
    goto :fail
)
echo Found Chromium source tree at: %SRC_DIR%

:: 4. Inject Rinswa Customizations
echo.
echo [Step 4/5] Injecting Rinswa branding, Cyber-Glass UI, and v%RINSWA_VERSION% metadata...
python "%~dp0scripts\prepare-rinswa-overlay.py" "%SRC_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to prepare Rinswa customizations.
    goto :fail
)

:: 5. Compile Real Chromium Engine with GN & Ninja
echo.
echo [Step 5/5] Compiling Chromium Engine into Rinswa Browser v%RINSWA_VERSION%...
cd /d "%SRC_DIR%"

echo Generating Ninja build configurations...
if not exist "%SRC_DIR%\build\config\gclient_args.gni" (
    echo [INFO] First-time build: Generating toolchain hooks and gclient args...
    cd /d "%CD%\chromium"
    call "%DEPOT_TOOLS_DIR%\gclient.bat" runhooks
    cd /d "%SRC_DIR%"
)

call "%DEPOT_TOOLS_DIR%\gn.bat" gen out\RinswaRelease
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] GN generation failed.
    goto :fail
)

echo.
echo Compiling chrome.exe and mini_installer.exe with autoninja...
call "%DEPOT_TOOLS_DIR%\autoninja.bat" -C out\RinswaRelease chrome mini_installer
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ninja compilation failed.
    goto :fail
)

:: 6. Package Release Outputs
cd /d "%~dp0"
if not exist "dist\installer" mkdir "dist\installer"
if not exist "dist\portable" mkdir "dist\portable"

if exist "%SRC_DIR%\out\RinswaRelease\mini_installer.exe" (
    copy /y "%SRC_DIR%\out\RinswaRelease\mini_installer.exe" "dist\installer\Rinswa.Setup.v%RINSWA_VERSION%.exe"
    echo Standalone installer created: dist\installer\Rinswa.Setup.v%RINSWA_VERSION%.exe
)

echo.
echo =======================================================
echo               CHROMIUM BUILD COMPLETE!
echo =======================================================
echo.
echo Standalone Installer: dist\installer\
echo Portable Binary:      %SRC_DIR%\out\RinswaRelease\chrome.exe
echo.
if exist "dist\installer" (
    explorer "dist\installer"
) else (
    explorer "%SRC_DIR%\out\RinswaRelease"
)
pause
exit /b 0

:fail
cd /d "%~dp0"
echo.
echo =======================================================
echo                 CHROMIUM BUILD FAILED
echo =======================================================
echo An error occurred during the build pipeline.
echo Check the console output above for the specific error.
echo.
pause
exit /b 1
