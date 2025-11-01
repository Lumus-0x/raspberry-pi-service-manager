<#
Universal start script for Windows (PowerShell).
It opens two new PowerShell windows: one for backend (Python venv + FastAPI) and one for frontend (Next.js).

Usage:
  1. Open PowerShell.
  2. Run: .\start-all.ps1

Notes:
  - Expects backend in ./backend and frontend in ./frontend
  - Python venv expected at ./backend/venv
  - Runs npm run dev in frontend
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting backend and frontend from: $root"

# Backend: open new PowerShell window
$backendCmd = "cd `"$root\backend`"; if (Test-Path .\\venv\\Scripts\\Activate.ps1) { .\\venv\\Scripts\\Activate.ps1 } ; python app/main.py"
Start-Process -FilePath powershell -ArgumentList ('-NoExit', '-Command', $backendCmd) -WindowStyle Normal

# Frontend: open new PowerShell window
$frontendCmd = "cd `"$root\frontend`"; if (Test-Path package.json) { npm run dev } else { Write-Host 'frontend package.json not found' }"
Start-Process -FilePath powershell -ArgumentList ('-NoExit', '-Command', $frontendCmd) -WindowStyle Normal

Write-Host "Launched backend and frontend (in new windows)." -ForegroundColor Green
