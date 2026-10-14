@echo off
title Rinswa Chromium - Fetch Engine Source
color 0B
cd /d "%~dp0"

:: Set depot_tools environment
set "DEPOT_TOOLS_DIR=C:\depot_tools"
if exist "%~dp0depot_tools\gclient.py" set "DEPOT_TOOLS_DIR=%~dp0depot_tools"

set "PATH=%DEPOT_TOOLS_DIR%;%PATH%"
set "DEPOT_TOOLS_WIN_TOOLCHAIN=0"
set "GYP_MSVS_VERSION=2022"

:: Locate isolated depot_tools Python
set "PYTHON_EXE=python"
if exist "%DEPOT_TOOLS_DIR%\python-bin\python3.bat" (
    set "PYTHON_EXE=%DEPOT_TOOLS_DIR%\python-bin\python3.bat"
)

call %PYTHON_EXE% "%~dp0scripts\fetch-chromium.py"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Fetch process exited with error code: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

pause
exit /b 0
