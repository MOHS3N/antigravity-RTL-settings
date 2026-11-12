@echo off
chcp 65001 > nul
echo Applying right-to-left settings and the Vazirmatn font...
node "%~dp0apply-patch.js"
echo.
pause
