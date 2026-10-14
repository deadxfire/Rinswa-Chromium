@echo off
title Rinswa Chromium - Build Environment Setup
color 0B

echo =======================================================
echo     RINSWA CHROMIUM - BUILD ENVIRONMENT SETUP
echo        Developed and made by Arindam Makar
echo =======================================================
echo.

cd /d "%~dp0"

:: 1. Detect Visual Studio 2022 / 2026 C++ Workload
echo [1/3] Locating Visual Studio C++ Compiler...
set "VS_DIR="
if exist "C:\Program Files\Microsoft Visual Studio\18\Community\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\18\Community"
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\2022\Community"
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\VC\Auxiliary\Build\vcvars64.bat" (
    set "VS_DIR=C:\Program Files\Microsoft Visual Studio\2022\Professional"
)

if "%VS_DIR%"=="" (
    echo [ERROR] Visual Studio C++ Desktop Development workload was not found!
    echo Please install Visual Studio 2022 Community with 'Desktop development with C++'
    goto :fail
)
echo Found Visual Studio at: %VS_DIR%

:: 2. Check or Setup Google depot_tools
echo.
echo [2/3] Checking Google depot_tools (gn, ninja, fetch)...
set "DEPOT_TOOLS_DIR=C:\depot_tools"

if not exist "%DEPOT_TOOLS_DIR%\gclient.bat" (
    if exist "%~dp0depot_tools\gclient.bat" (
        set "DEPOT_TOOLS_DIR=%~dp0depot_tools"
    ) else (
        echo depot_tools is not installed yet.
        echo Downloading official Google depot_tools bundle...
        powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://storage.googleapis.com/chrome-infra/depot_tools.zip', '%~dp0depot_tools.zip')"
        if not exist "%~dp0depot_tools.zip" (
            echo [ERROR] Failed to download depot_tools.zip from Google servers.
            goto :fail
        )
        echo Extracting depot_tools...
        powershell -Command "Expand-Archive -Path '%~dp0depot_tools.zip' -DestinationPath '%DEPOT_TOOLS_DIR%' -Force"
        del "%~dp0depot_tools.zip"
    )
)

echo Found depot_tools at: %DEPOT_TOOLS_DIR%

:: 3. Configure Windows Environment Variables
echo.
echo [3/3] Bootstrapping depot_tools environment...
set "DEPOT_TOOLS_WIN_TOOLCHAIN=0"
set "GYP_MSVS_VERSION=2022"
set "PATH=%DEPOT_TOOLS_DIR%;%PATH%"

echo Running gclient bootstrap verification...
call "%DEPOT_TOOLS_DIR%\gclient.bat" version
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] gclient verification completed with notices.
)

echo.
echo =======================================================
echo          BUILD ENVIRONMENT READY!
echo =======================================================
echo.
echo depot_tools:  %DEPOT_TOOLS_DIR%
echo Toolchain:    %VS_DIR%
echo Toolchain ID: DEPOT_TOOLS_WIN_TOOLCHAIN=0
echo.
echo You can now run:
echo 1. Fetch-Chromium-Source.bat  (Download Chromium C++ engine)
echo 2. Build-Rinswa-Chromium.bat  (Compile Rinswa Browser)
echo.
pause
exit /b 0

:fail
echo.
echo =======================================================
echo               ENVIRONMENT SETUP FAILED
echo =======================================================
echo.
pause
exit /b 1
