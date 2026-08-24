@echo off
title Shakib Animation Studio - Browser Mode
cd /d "%~dp0"

echo ========================================================
echo       Shakib Animation Library - Browser Mode
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    :: Kill old port 4600 if any
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":4600" ^| findstr "LISTENING"') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    echo [1/2] Starting background local server on Port 4600...
    start "Animation Studio Server" /min cmd /c "node server.js"
    timeout /t 1 /nobreak >nul
    echo [2/2] Opening Animation Library in default browser...
    start http://localhost:4600/index.html
) else (
    echo [INFO] Node.js not detected. Opening index.html directly...
    start "" "%~dp0index.html"
)

echo.
echo Animation Studio is now running in Browser Mode!
timeout /t 3 >nul
exit /b 0
