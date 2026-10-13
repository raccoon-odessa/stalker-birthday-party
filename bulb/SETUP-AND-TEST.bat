@echo off
cd /d "%~dp0"
title Stalker bulb setup
echo ============================================
echo   Stalker party - smart bulb setup and test
echo ============================================
echo.

set PY=
where py >nul 2>nul && set PY=py
if not defined PY where python >nul 2>nul && set PY=python
if not defined PY (
  echo Python is not installed. Installing it now...
  winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
  echo.
  echo Python is installed. Close this window and double-click SETUP-AND-TEST.bat again.
  pause
  exit /b
)

echo Installing the libraries...
%PY% -m pip install --quiet --upgrade tinytuya tuya-device-sharing-sdk "qrcode[pil]"
if errorlevel 1 (
  echo Could not install the libraries. Check your internet connection and try again.
  pause
  exit /b
)

if not exist devices.json (
  echo.
  %PY% get_key.py
)

if not exist devices.json (
  echo.
  echo No devices.json yet, so the test can't run. Send Claude a screenshot of this window.
  pause
  exit /b
)

echo.
echo Testing the bulb: it should turn red, flicker, then go back to normal.
%PY% bulb_test.py
echo.
pause
