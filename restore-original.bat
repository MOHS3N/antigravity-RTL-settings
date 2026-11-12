@echo off
chcp 65001 > nul
echo Restoring settings to their original state...
node "%~dp0restore-original.js"
echo.
pause
