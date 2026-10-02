@echo off
title ENGG982 Hub (shared on your network)
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Run:  winget install OpenJS.NodeJS.LTS
  pause
  exit /b 1
)
echo Teammates on the same Wi-Fi or network can open the Same network address shown below.
set /p HUB_PIN=Optional password for teammates (press Enter for none): 
set HOST=0.0.0.0
set OPEN_BROWSER=1
node server.js
echo.
echo The hub has stopped.
pause
