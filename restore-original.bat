@echo off
chcp 65001 > nul
echo در حال بازگردانی تنظیمات به حالت اولیه...
node "%~dp0restore-original.js"
echo.
pause
