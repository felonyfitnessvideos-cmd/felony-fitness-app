@echo off
echo 🚀 Starting Felony Fitness Development Environment...
echo.

REM Run PowerShell script with bypass execution policy
powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"

echo.
echo Development environment startup complete!
pause