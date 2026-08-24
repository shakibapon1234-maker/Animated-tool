@echo off
title Shakib Animation Studio Launcher
cd /d "%~dp0"

echo ========================================================
echo       Shakib Animation Library & Studio Launcher
echo ========================================================
echo.
echo [1] Desktop Mode  (Electron Standalone App)
echo [2] Browser Mode  (Local Web Server - http://localhost:4600)
echo [3] Direct Mode   (Open index.html directly)
echo.
echo Press 1 for Desktop, 2 for Browser, 3 for Direct.
echo (Auto-starting Desktop mode in 5 seconds...)
echo ========================================================

choice /c 123 /t 5 /d 1 /m "Select Launch Mode"

if %errorlevel% equ 1 goto :LAUNCH_DESKTOP
if %errorlevel% equ 2 goto :LAUNCH_BROWSER
if %errorlevel% equ 3 goto :LAUNCH_DIRECT

:LAUNCH_DESKTOP
echo Launching Desktop Mode...
call "%~dp0start-desktop.bat"
exit /b 0

:LAUNCH_BROWSER
echo Launching Browser Mode...
call "%~dp0start-browser.bat"
exit /b 0

:LAUNCH_DIRECT
echo Opening in default browser directly...
start "" "%~dp0index.html"
exit /b 0
