@echo off
title Shakib Animation Studio - Desktop Mode
cd /d "%~dp0"

echo ========================================================
echo       Shakib Animation Library - Desktop Mode
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required for desktop server.
    echo Opening in browser fallback...
    start "" "%~dp0index.html"
    exit /b
)

:: Locate Electron Binary Candidates
set "ELECTRON_EXE="
if exist "%~dp0node_modules\electron\dist\electron.exe" (
    set "ELECTRON_EXE=%~dp0node_modules\electron\dist\electron.exe"
) else if exist "D:\Main Branch\app helper\Studio-Launcher\App Launcher\node_modules\electron\dist\electron.exe" (
    set "ELECTRON_EXE=D:\Main Branch\app helper\Studio-Launcher\App Launcher\node_modules\electron\dist\electron.exe"
) else if exist "D:\Main Branch\app helper\Video-Editor\node_modules\electron\dist\electron.exe" (
    set "ELECTRON_EXE=D:\Main Branch\app helper\Video-Editor\node_modules\electron\dist\electron.exe"
) else if exist "D:\Main Branch\Antigravity-PDF-Pro-1\node_modules\electron\dist\electron.exe" (
    set "ELECTRON_EXE=D:\Main Branch\Antigravity-PDF-Pro-1\node_modules\electron\dist\electron.exe"
) else if exist "D:\Main Branch\wings-fly-clean\node_modules\electron\dist\electron.exe" (
    set "ELECTRON_EXE=D:\Main Branch\wings-fly-clean\node_modules\electron\dist\electron.exe"
)

if not "%ELECTRON_EXE%"=="" (
    echo [1/2] Launching with Electron Desktop Engine: "%ELECTRON_EXE%"
    start "" "%ELECTRON_EXE%" "%~dp0main-electron.js"
    exit /b 0
)

where electron >nul 2>nul
if %errorlevel% equ 0 (
    echo [1/2] Launching with Global Electron...
    start "" electron "%~dp0main-electron.js"
    exit /b 0
)

echo [WARNING] Electron binary not found! Falling back to browser mode...
call "%~dp0start-browser.bat"
exit /b 0
