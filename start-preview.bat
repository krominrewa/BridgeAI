@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

set "QODER_NODE=C:\Users\xzp68\AppData\Local\Programs\Qoder CN\Qoder CN.exe"
set ELECTRON_RUN_AS_NODE=1

if exist "%QODER_NODE%" (
  set "RUNTIME=%QODER_NODE%"
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo [BridgeAI] No Node runtime found.
    echo [BridgeAI] Please open this project in Qoder and ask the assistant to run the preview.
    pause
    exit /b 1
  )
  set "RUNTIME=node"
)

if not exist "node_modules\vite" (
  echo [BridgeAI] Dependencies are missing. Please ask the Qoder assistant to run: npm install
  pause
  exit /b 1
)

echo [BridgeAI] Starting preview server at http://127.0.0.1:5173/
start "" /b cmd /c "timeout /t 4 >nul & start """" http://127.0.0.1:5173/"
"%RUNTIME%" node_modules\vite\bin\vite.js
