#!/usr/bin/env bash
# Universal start script for Unix-like systems (Linux / macOS).
# It runs backend and frontend in background jobs.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Starting backend and frontend from: $ROOT_DIR"

# Start backend
if [ -d "$ROOT_DIR/backend" ]; then
  if [ -f "$ROOT_DIR/backend/venv/bin/activate" ]; then
    (cd "$ROOT_DIR/backend" && . venv/bin/activate && python app/main.py) &
    echo "Backend started (background)"
  else
    (cd "$ROOT_DIR/backend" && python -m venv venv && . venv/bin/activate && pip install -r requirements.txt 2>/dev/null || true && python app/main.py) &
    echo "Backend started (created venv if needed)"
  fi
else
  echo "backend directory not found"
fi

# Start frontend
if [ -d "$ROOT_DIR/frontend" ]; then
  (cd "$ROOT_DIR/frontend" && npm run dev) &
  echo "Frontend started (background)"
else
  echo "frontend directory not found"
fi

wait
