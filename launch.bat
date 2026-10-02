@echo off
title ENGG982 Hub
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install it once, then double-click this file again:
  echo     winget install OpenJS.NodeJS.LTS
  echo or download it from https://nodejs.org
  echo.
  pause
  exit /b 1
)
set OPEN_BROWSER=1
node server.js
echo.
echo The hub has stopped.
pause
