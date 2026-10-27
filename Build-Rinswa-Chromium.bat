@echo off
setlocal EnableDelayedExpansion

:: 0. Short-Path / MAX_PATH Protection
:: Chromium source builds on Windows generate deeply nested include headers (e.g. Blink V8 union bindings)
:: exceeding Windows MAX_PATH (260 characters). Ninja's include normalizer uses GetFullPathNameA, which fails
:: if the checkout path is deep. We automatically establish a short NTFS junction (C:\cr) to bypass this limitation.
set "SHORT_ROOT=C:\cr"
set "ORIGINAL_ROOT=%~dp0"
if "%ORIGINAL_ROOT:~-1%"=="\" set "ORIGINAL_ROOT=%ORIGINAL_ROOT:~0,-1%"

if /i not "%ORIGINAL_ROOT%"=="%SHORT_ROOT%" (
    echo [INFO] Detected workspace path: "%ORIGINAL_ROOT%"
    echo [INFO] Establishing short junction at '%SHORT_ROOT%' to bypass Windows MAX_PATH 260-character limit...
    if not exist "%SHORT_ROOT%\Build-Rinswa-Chromium.bat" (
        if exist "%SHORT_ROOT%" rmdir "%SHORT_ROOT%" >nul 2>&1
        cmd /c mklink /J "%SHORT_ROOT%" "%ORIGINAL_ROOT%" >nul 2>&1
    )
    if exist "%SHORT_ROOT%\Build-Rinswa-Chromium.bat" (
        echo [INFO] Relaunching build cleanly from short path '%SHORT_ROOT%'...
        cd /d "%SHORT_ROOT%"
        call "%SHORT_ROOT%\Build-Rinswa-Chromium.bat" %*
        exit /b %ERRORLEVEL%
    ) else (
        echo [WARNING] Could not create or access '%SHORT_ROOT%'. Proceeding with current path...
    )
)

cd /d "%~dp0"

set "RINSWA_VERSION=1.0.9"
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
set "NUM_THREADS=%NUMBER_OF_PROCESSORS%"
if "%NUM_THREADS%"=="" set "NUM_THREADS=16"

echo Version:   %RINSWA_VERSION% Stable (Official Chromium Engine)
echo Output:    chromium\src\out\RinswaRelease\
echo Hardware:  %NUM_THREADS% Logical CPU Cores (Maximum Parallelism)
echo.
echo What this script will do:
echo 1. Verify Visual Studio C++ toolchain and Google depot_tools.
echo 2. Verify modern Chromium engine source tree.
echo 3. Inject custom Rinswa Cyber-Glass branding, logos, and GN args.
echo 4. Compile the real Chromium engine using all %NUM_THREADS% cores via Ninja (-j%NUM_THREADS%).
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

:: 2. Verify depot_tools (GN & Ninja) and Python
echo.
echo [Step 2/5] Checking Google depot_tools (gn, ninja) and Python runtime...
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

:: Locate real native Python interpreter (bypassing Windows Store WindowsApps alias)
set "PYTHON_EXE="
set "PYTHON_DIR="
if exist "C:\Users\arind\AppData\Local\Python\bin\python.exe" (
    set "PYTHON_EXE=C:\Users\arind\AppData\Local\Python\bin\python.exe"
    set "PYTHON_DIR=C:\Users\arind\AppData\Local\Python\bin"
) else (
    for /f "tokens=*" %%i in ('where python.exe 2^>nul') do (
        echo %%i | findstr /i /c:"WindowsApps" >nul
        if errorlevel 1 (
            if not defined PYTHON_EXE (
                set "PYTHON_EXE=%%i"
                set "PYTHON_DIR=%%~dpi"
            )
        )
    )
)

if not defined PYTHON_EXE set "PYTHON_EXE=python"
if defined PYTHON_DIR set "PATH=%PYTHON_DIR%;%PATH%"
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
"%PYTHON_EXE%" "%~dp0scripts\prepare-rinswa-overlay.py" "%SRC_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to prepare Rinswa customizations.
    goto :fail
)

:: 5. Compile Real Chromium Engine with GN & Ninja
echo.
echo [Step 5/5] Compiling Chromium Engine into Rinswa Browser v%RINSWA_VERSION%...
cd /d "%SRC_DIR%"

:: Ensure GN and Ninja binaries are synchronized into Chromium buildtools directory
if not exist "%SRC_DIR%\buildtools\win\gn\gn.exe" (
    if not exist "%SRC_DIR%\buildtools\win\gn" mkdir "%SRC_DIR%\buildtools\win\gn"
    if exist "%DEPOT_TOOLS_DIR%\gn.exe" copy /y "%DEPOT_TOOLS_DIR%\gn.exe" "%SRC_DIR%\buildtools\win\gn\gn.exe" >nul
)
if not exist "%SRC_DIR%\buildtools\win\gn.exe" (
    if exist "%DEPOT_TOOLS_DIR%\gn.exe" copy /y "%DEPOT_TOOLS_DIR%\gn.exe" "%SRC_DIR%\buildtools\win\gn.exe" >nul
)
if not exist "%SRC_DIR%\buildtools\win\ninja.exe" (
    if exist "%DEPOT_TOOLS_DIR%\ninja.exe" copy /y "%DEPOT_TOOLS_DIR%\ninja.exe" "%SRC_DIR%\buildtools\win\ninja.exe" >nul
)

echo Generating Ninja build configurations...
if not exist "%SRC_DIR%\build\config\gclient_args.gni" (
    echo [INFO] First-time build: Generating toolchain hooks and gclient args...
    cd /d "%SRC_DIR%\.."
    call "%DEPOT_TOOLS_DIR%\gclient.bat" runhooks
    cd /d "%SRC_DIR%"
)

set "GN_CMD=%DEPOT_TOOLS_DIR%\gn.exe"
if not exist "%GN_CMD%" set "GN_CMD=%DEPOT_TOOLS_DIR%\gn.bat"

call "%GN_CMD%" gen out\RinswaRelease --script-executable="%PYTHON_EXE%"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] GN generation failed.
    goto :fail
)

echo.
echo Compiling chrome.exe and mini_installer.exe with Ninja...
echo [PERFORMANCE] Utilizing all %NUM_THREADS% processor threads at full capacity...
set "NINJA_STATUS=[%%f/%%t (%%p) @ %%es] "

set "NINJA_CMD=%DEPOT_TOOLS_DIR%\ninja.exe"
if not exist "%NINJA_CMD%" (
    call "%DEPOT_TOOLS_DIR%\autoninja.bat" -C out\RinswaRelease -j %NUM_THREADS% chrome mini_installer
) else (
    "%NINJA_CMD%" -C out\RinswaRelease -j %NUM_THREADS% chrome mini_installer
)
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

if exist "%SRC_DIR%\out\RinswaRelease\Rinswa.exe" (
    copy /y "%SRC_DIR%\out\RinswaRelease\Rinswa.exe" "dist\portable\Rinswa.exe" >nul 2>&1
    copy /y "%SRC_DIR%\out\RinswaRelease\Rinswa.exe" "dist\portable\chrome.exe" >nul 2>&1
    if exist "%SRC_DIR%\out\RinswaRelease\initial_preferences" copy /y "%SRC_DIR%\out\RinswaRelease\initial_preferences" "dist\portable\initial_preferences" >nul 2>&1
    if exist "%SRC_DIR%\out\RinswaRelease\adblock" xcopy /e /i /y "%SRC_DIR%\out\RinswaRelease\adblock" "dist\portable\adblock" >nul 2>&1
    echo Portable distribution packaged into: dist\portable\Rinswa.exe
) else if exist "%SRC_DIR%\out\RinswaRelease\chrome.exe" (
    copy /y "%SRC_DIR%\out\RinswaRelease\chrome.exe" "dist\portable\chrome.exe" >nul 2>&1
    copy /y "%SRC_DIR%\out\RinswaRelease\chrome.exe" "dist\portable\Rinswa.exe" >nul 2>&1
    if exist "%SRC_DIR%\out\RinswaRelease\initial_preferences" copy /y "%SRC_DIR%\out\RinswaRelease\initial_preferences" "dist\portable\initial_preferences" >nul 2>&1
    if exist "%SRC_DIR%\out\RinswaRelease\adblock" xcopy /e /i /y "%SRC_DIR%\out\RinswaRelease\adblock" "dist\portable\adblock" >nul 2>&1
    echo Portable distribution packaged into: dist\portable\Rinswa.exe
)

echo.
echo =======================================================
echo               RINSWA BROWSER BUILD COMPLETE!
echo =======================================================
echo.
echo Standalone Installer: dist\installer\Rinswa.Setup.v%RINSWA_VERSION%.exe
echo Portable Binary:      dist\portable\Rinswa.exe
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
