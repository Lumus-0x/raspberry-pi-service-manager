# How to start both services (frontend + backend)

This project contains two convenience scripts to start the backend (FastAPI) and frontend (Next.js) together.

Windows (PowerShell)
1. Open PowerShell.
2. From the project root run:

```powershell
.\start-all.ps1
```

This opens two new PowerShell windows: one runs the backend (activates the venv at `backend/venv` if present) and one runs `npm run dev` in the frontend.

Unix (Linux / macOS)
1. Make script executable (first time):

```bash
chmod +x ./start-all.sh
```

2. Run it:

```bash
./start-all.sh
```

Notes
- The scripts are simple helpers. They assume `backend` and `frontend` folders exist in project root.
- `start-all.ps1` uses PowerShell `Start-Process` to open separate windows. Be sure to run PowerShell with permissions to start processes.
- `start-all.sh` launches processes in background and waits for them. Adjust as needed for your environment (tmux/systemd/etc.).

If you want, I can also add a single cross-platform Node script (using `concurrently`) or a Docker Compose file to run both services in containers.
