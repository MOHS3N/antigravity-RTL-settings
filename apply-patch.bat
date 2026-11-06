@echo off
chcp 65001 > nul
echo در حال اعمال تنظیمات راست‌چین و فونت وزیرمتن...
node "%~dp0apply-patch.js"
echo.
pause
