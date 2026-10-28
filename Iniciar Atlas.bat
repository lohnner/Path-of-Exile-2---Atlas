@echo off
setlocal
cd /d "%~dp0"

rem Se o Atlas ja estiver rodando, encerra o servidor antigo para carregar o codigo mais recente.
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force" >nul 2>nul

set "NODE_EXE="
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
)
if not defined NODE_EXE (
  for /f "delims=" %%N in ('where node 2^>nul') do (
    set "NODE_EXE=%%N"
    goto :node_found
  )
)
:node_found
if not defined NODE_EXE (
  echo Node.js nao foi encontrado. Instale Node.js ou restaure o runtime do Codex.
  pause
  exit /b 1
)
start "" http://127.0.0.1:4173
"%NODE_EXE%" server.js
exit /b %errorlevel%
