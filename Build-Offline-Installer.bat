@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title Rinswa Browser - Build Standalone Offline Installer
color 0B

echo =======================================================
echo    RINSWA BROWSER - OFFLINE STANDALONE INSTALLER BUILDER
echo            Developed and made by Arindam Makar
echo =======================================================
echo.

:: Locate Python interpreter
set "PYTHON_EXE="
if exist "C:\Users\arind\AppData\Local\Python\bin\python.exe" (
    set "PYTHON_EXE=C:\Users\arind\AppData\Local\Python\bin\python.exe"
) else (
    for /f "tokens=*" %%i in ('where python.exe 2^>nul') do (
        echo %%i | findstr /i /c:"WindowsApps" >nul
        if errorlevel 1 (
            if not defined PYTHON_EXE (
                set "PYTHON_EXE=%%i"
            )
        )
    )
)
if not defined PYTHON_EXE set "PYTHON_EXE=python"

echo Using Python: %PYTHON_EXE%
echo.

"%PYTHON_EXE%" "%~dp0scripts\build-offline-installer.py"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Offline Installer packaging failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo Standalone Installer ready in dist\installer\
if exist "%~dp0dist\installer" (
    explorer "%~dp0dist\installer"
)
pause
exit /b 0
