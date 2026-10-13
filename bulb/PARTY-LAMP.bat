@echo off
cd /d "%~dp0"
title Stalker party - emission lamp
set PY=
where py >nul 2>nul && set PY=py
if not defined PY set PY=python
if not exist devices.json (
  echo Run START-HERE.bat first so the lamp's key is saved.
  pause
  exit /b
)
%PY% emission_lamp.py
pause
