# Pi Service Manager — Documentation (EN / RU)

This repository contains a Next.js frontend and a FastAPI backend that together provide a simple web UI to manage systemd services on a remote Raspberry Pi over SSH (list, start, stop, restart, create and delete service units).

Below you'll find an expanded bilingual reference (English then Russian). Use the table of contents to jump to the part you need.

---

## Contents / Содержание

- Overview / Обзор
- Architecture / Архитектура
- Prerequisites / Требования
- Backend setup / Настройка бэкенда
- Frontend setup / Настройка фронтенда
- Environment variables / Переменные окружения
- Running (development) / Запуск (разработка)
- API Reference / Описание API
- Security recommendations / Рекомендации по безопасности
- Git / deployment / Git и деплой
- Troubleshooting / Устранение неполадок
- Contributing / Вклад и развитие

---

## Overview (English)

Pi Service Manager is a small control panel that connects to a Raspberry Pi via SSH and runs systemctl commands to list and control systemd services. The main goals are:

- View all services on the target Pi
- Start / Stop / Restart services
- Create a systemd unit file remotely
- Delete (stop + remove unit) services
- Simple login (JWT) to protect API endpoints

This project is intended for local networks or trusted environments. For production or internet-exposed deployments, see Security recommendations below.

## Архитектура (Russian)

Проект состоит из двух частей:

- Backend (FastAPI + Paramiko): отвечает за SSH-соединение к Raspberry Pi и за выполнение команд systemctl, запись/удаление unit-файлов, а также предоставляет REST API (/login, /services, /services/control, /services/create, /services/delete).
- Frontend (Next.js + Tailwind): SPA-интерфейс для отображения списка сервисов, управления ими и создания новых unit-файлов.

Коммуникация между фронтом и бэкендом идёт по HTTP (обычно backend на порту 8000). Бэкенд ожидает JWT токен в заголовке Authorization: Bearer <token>.

## Prerequisites / Требования

- Node.js >= 18 (for Next.js dev)
- Python 3.11+ (project used 3.14 in dev environment — any recent 3.x is fine)
- pip
- SSH access to Raspberry Pi with a user that can run sudo commands (passwordless sudo is recommended for specific commands)
- Optional: GitHub CLI `gh` if you want to use the included push script

## Backend setup / Настройка бэкенда

1. Create and activate Python virtual environment (recommended):

   - Windows (PowerShell):
     ```powershell
     python -m venv backend\venv
     .\backend\venv\Scripts\Activate.ps1
     pip install -r backend/requirements.txt
     ```

   If `requirements.txt` is missing, install packages manually:

   ```powershell
   pip install fastapi uvicorn[standard] paramiko python-dotenv PyJWT
   ```

2. Fill `.env` in `backend/` with connection data for your Raspberry Pi (see Environment variables).

3. Start the backend (development):

   ```powershell
   # from repository root
   .\start-all.ps1
   # or run backend directly
   cd backend\app
   ..\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
   ```

## Frontend setup / Настройка фронтенда

1. Install node deps:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

2. The front app runs on http://localhost:3000 by default.

## Environment variables / Переменные окружения

Create `backend/.env` with these values (example):

```
PI_HOST=78.107.254.30
PI_USER=pi
PI_PASSWORD=YOUR_PI_PASSWORD_OR_EMPTY_IF_KEY_AUTH
SECRET_KEY=change-me
ADMIN_USER=admin
ADMIN_PASS=admin
```

Notes:
- Use SSH keys instead of password where possible. If you use keys, modify `get_ssh_client()` in `backend/app/main.py` to load a private key file or an SSH agent.
- Change `SECRET_KEY` to a strong random secret for JWT signing.

## Running (development) / Запуск (разработка)

- Start backend, then frontend (scripts exist: `start-all.ps1` / `start-all.sh`).
- Open http://localhost:3000, go to /login, use the credentials from `.env` to get a token, then the UI will show services.

## API Reference (English)

All endpoints are protected and require JWT (except /login):

- POST /login — body: {"username":"...","password":"..."} → returns {"access_token": "..."}
- GET /services — returns { services: [ { name, status, enabled, description, details } ] }
- POST /services/control — body: { name: "foo.service", action: "start|stop|restart|status" }
- POST /services/create — body: { name: "my.service", command: "[Unit]\n..." }
- POST /services/delete — body: { name: "my.service" }

## Описание API (Russian)

- POST /login — тело: {"username":"...","password":"..."} → вернёт {"access_token":"..."}
- GET /services — вернёт список сервисов
- POST /services/control — управление сервисом (start/stop/restart/status)
- POST /services/create — создать unit-файл
- POST /services/delete — удалить unit-файл (stop, disable, rm, daemon-reload)

## Security recommendations / Рекомендации по безопасности

- Do NOT store plaintext credentials in source-controlled files. Keep `.env` in `.gitignore` (already configured).
- Use SSH key authentication and restrict the key with a dedicated user.
- Limit sudo access with `/etc/sudoers` to only the necessary commands (systemctl, tee, rm for the specific path) without a password.
- Use a strong `SECRET_KEY` and consider rotating it periodically.
- For public deployments, serve the frontend over HTTPS and use proper authentication (session cookies, CSRF protection) instead of storing tokens in localStorage.

## Git / deployment / Git и деплой

- A `.gitignore` has been added to exclude local venvs, node modules, .env and keys. Verify before you push.
- There is a helper script `scripts/push_to_github.ps1` that can create a GitHub repo with the GitHub CLI and push the current repo (see that script for details). You must be logged into `gh` locally or provide credentials.

## Troubleshooting / Устранение неполадок

- If you get 401 on /services — make sure you logged in and the token is present in `localStorage` or that you have a valid cookie (if changed to cookie auth).
- If SSH fails — confirm Pi network, username, key/password, and that the user can run `sudo systemctl`.
- If systemctl returns unexpected unit names, the backend tries JSON output first and falls back to text parsing — run manually on the Pi to debug.

## Contributing / Вклад

- Fork the repo, create a branch, make changes and open a PR. Provide a clear description and steps to test.

---

## Russian full docs / Развёрнутые инструкции на русском

1) Подготовка окружения

- Установите Python и Node.js.
- Создайте виртуальное окружение для backend и установите зависимости.

2) Настройки SSH

- Предпочтительно используйте ключи. Для этого можно на локальной машине выполнить `ssh-keygen` и добавить публичный ключ в `~/.ssh/authorized_keys` на Raspberry Pi.

3) Настройка .env

- `backend/.env` содержит параметры подключения. Не загружайте `.env` в git.

4) Запуск и тестирование

- Запустите backend и frontend. Через UI выполните вход и проверьте `/services`.

5) Рекомендации по безопасности (повтор)

- Ограничьте sudo для команды systemctl и операций над `/etc/systemd/system`.
- Скройте админский интерфейс за VPN или внутри приватной сети.

---

If you want, I can:

- create a GitHub repository and push the prepared repo for you (I'll need either:
  - you run the provided script `scripts/push_to_github.ps1` locally after logging into GitHub CLI (`gh auth login`), or
  - you provide a GitHub Personal Access Token so I can perform the push from this environment — provide only if you trust it; otherwise I'll give commands you run locally),
- or set up CI/deploy docs.

See `scripts/push_to_github.ps1` for one-click creation (requires `gh`).
