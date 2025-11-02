# 🍓 Raspberry Pi Service Manager  
**SSH-based Web Interface for managing systemd services on Raspberry Pi**  
**Веб-интерфейс для управления сервисами systemd на Raspberry Pi через SSH**

---

## 🌍 Description / Описание

**EN:**  
Raspberry Pi Service Manager is a full-stack application for remotely managing systemd services on a Raspberry Pi.  
It allows you to view, start, stop, restart, create, and delete services directly through a web browser.  
The backend (FastAPI + Paramiko) connects to the Raspberry Pi via SSH, executes `systemctl` commands, and provides a secure JWT-protected REST API.  
The frontend (Next.js + Tailwind CSS) provides a modern, responsive user interface for administrators.

**RU:**  
Raspberry Pi Service Manager — это полнофункциональный веб-интерфейс для управления `systemd`-сервисами на Raspberry Pi.  
Через браузер можно просматривать список сервисов, запускать, останавливать, перезапускать, а также создавать и удалять unit-файлы.  
Бэкенд (FastAPI + Paramiko) подключается по SSH, выполняет команды `systemctl` и предоставляет REST API с JWT-аутентификацией.  
Фронтенд (Next.js + Tailwind CSS) отображает удобный интерфейс для администрирования.

---

## 🧩 Architecture / Архитектура

| Component | Stack | Description |
|------------|--------|-------------|
| **Frontend** | Next.js + Tailwind CSS | Web UI for interacting with API |
| **Backend** | FastAPI + Paramiko + PyJWT | REST API and SSH client to Raspberry Pi |
| **Scripts** | Bash / PowerShell | Auto-start scripts for both servers |

**RU:**  
- **Фронтенд:** Next.js + Tailwind — современный интерфейс.  
- **Бэкенд:** FastAPI + Paramiko — выполнение команд через SSH.  
- **Скрипты:** `start-all.sh` / `start-all.ps1` для быстрого запуска.

---

## ⚙️ Features / Возможности

**EN:**
- Secure SSH connection to Raspberry Pi.  
- List all `systemd` services with status and description.  
- Start, stop, restart, or check service status.  
- Create and delete custom service units.  
- REST API with JWT authentication.  
- Modern and responsive UI.  
- Cross-platform startup (Linux, macOS, Windows).

**RU:**
- Безопасное подключение к Raspberry Pi через SSH.  
- Просмотр всех сервисов `systemd` (статус, описание, enabled).  
- Управление сервисами: старт, стоп, рестарт, статус.  
- Создание и удаление unit-файлов.  
- REST API с JWT-токенами.  
- Современный адаптивный интерфейс.  
- Кроссплатформенный запуск (Linux, macOS, Windows).

---

## 🧱 Requirements / Требования

| Component | Minimum Version | Notes |
|------------|------------------|-------|
| Python | 3.11+ | Backend |
| Node.js | 18+ | Frontend |
| Paramiko, FastAPI, PyJWT | latest | SSH & API libs |
| SSH access | — | To Raspberry Pi |
| Systemd | — | Required on the target system |

**RU:**  
- Python 3.11 или выше  
- Node.js 18 или выше  
- Пакеты: `fastapi`, `uvicorn[standard]`, `paramiko`, `python-dotenv`, `PyJWT`  
- SSH-доступ к Raspberry Pi  
- systemd на целевой машине

---

## 🚀 Installation & Launch / Установка и запуск

### 🐍 Backend Setup / Настройка бэкенда

**EN:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
````

If `requirements.txt` is missing:

```bash
pip install fastapi uvicorn[standard] paramiko python-dotenv PyJWT
```

**RU:**

1. Перейдите в `backend/`
2. Создайте виртуальное окружение:

   ```bash
   python -m venv venv
   source venv/bin/activate  # или .\venv\Scripts\activate
   ```
3. Установите зависимости:

   ```bash
   pip install -r requirements.txt
   ```
4. Создайте файл `.env` (см. ниже)
5. Запустите сервер:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

### 💻 Frontend Setup / Настройка фронтенда

**EN:**

```bash
cd frontend
npm install
npm run dev
```

Then open:

```
http://localhost:3000
```

**RU:**

1. Перейдите в директорию `frontend/`
2. Установите зависимости командой `npm install`
3. Запустите сервер разработки:

   ```bash
   npm run dev
   ```
4. Интерфейс доступен по адресу `http://localhost:3000`

---

### 🔧 Combined Run / Совместный запуск

**EN:**
From project root:

```bash
./start-all.sh
```

or on Windows:

```powershell
.\start-all.ps1
```

**RU:**
Из корня проекта:

```bash
./start-all.sh
```

или для Windows:

```powershell
.\start-all.ps1
```

Эти скрипты запускают backend и frontend одновременно в режиме разработки.

---

## 🔑 Environment Variables / Переменные окружения

Создайте файл `backend/.env` со следующим содержимым:

```env
PI_HOST=192.168.1.10
PI_USER=pi
PI_PASSWORD=raspberry
SECRET_KEY=change-me
ADMIN_USER=admin
ADMIN_PASS=admin
```

| Variable      | Description (EN)                     | Описание (RU)                     |
| ------------- | ------------------------------------ | --------------------------------- |
| `PI_HOST`     | Raspberry Pi IP address              | IP-адрес Raspberry Pi             |
| `PI_USER`     | SSH username                         | Пользователь SSH                  |
| `PI_PASSWORD` | SSH password (or empty for key auth) | Пароль SSH (или пусто для ключей) |
| `SECRET_KEY`  | Secret key for JWT signing           | Секретный ключ JWT                |
| `ADMIN_USER`  | Login username for API               | Логин для API                     |
| `ADMIN_PASS`  | Login password for API               | Пароль для API                    |

> 🔒 **Security Tip / Совет по безопасности:**
> Use SSH key authentication instead of passwords.
> Настройте авторизацию по SSH-ключу вместо пароля.

---

## 📡 API Documentation / Документация API

### 🔐 Authentication / Аутентификация

**POST /login**

```json
{ "username": "admin", "password": "admin" }
```

Response:

```json
{ "access_token": "..." }
```

---

### 📋 Get Services / Получение списка сервисов

**GET /services**

Header:

```
Authorization: Bearer <token>
```

Response:

```json
{
  "services": [
    {
      "name": "ssh.service",
      "status": "active",
      "enabled": "enabled",
      "description": "OpenSSH Daemon"
    }
  ]
}
```

---

### ▶️ Control Service / Управление сервисом

**POST /services/control**

```json
{ "name": "nginx.service", "action": "restart" }
```

Actions / Действия: `start`, `stop`, `restart`, `status`

---

### 📝 Create Unit / Создание unit-файла

**POST /services/create**

```json
{
  "name": "myapp.service",
  "command": "[Unit]\nDescription=My App\n[Service]\nExecStart=/usr/bin/python3 /home/pi/app.py\n[Install]\nWantedBy=multi-user.target"
}
```

---

### ❌ Delete Unit / Удаление unit-файла

**POST /services/delete**

```json
{ "name": "myapp.service" }
```

---

## 🛡️ Security Recommendations / Безопасность

**EN:**

* Never expose the app directly to the Internet.
* Use SSH key-based authentication.
* Restrict sudo privileges to `systemctl`, `tee`, and `rm` only.
* Keep `.env` private and excluded from Git.
* Change `SECRET_KEY` regularly.

**RU:**

* Не публикуйте приложение в открытом интернете.
* Используйте SSH-ключи вместо паролей.
* Ограничьте sudo только нужными командами (`systemctl`, `tee`, `rm`).
* Не добавляйте `.env` в Git.
* Меняйте `SECRET_KEY` периодически.

---

## 🧠 Development / Разработка

**EN:**

* Backend runs on `http://localhost:8000`
* Frontend runs on `http://localhost:3000`
* For dev: run both simultaneously (via script).
* Code structure:

  ```
  backend/
    └── app/
        ├── main.py
        ├── routes/
        ├── utils/
        └── auth/
  frontend/
    └── pages/
    └── components/
  ```
* Contributions are welcome via Pull Requests.

**RU:**

* Бэкенд доступен по `http://localhost:8000`
* Фронтенд — по `http://localhost:3000`
* Для разработки запустите оба процесса.
* Структура кода указана выше.
* Pull Request’ы приветствуются!

---

## ⚠️ Troubleshooting / Решение возможных проблем

| Problem / Проблема                  | Cause / Причина               | Fix / Решение                                 |
| ----------------------------------- | ----------------------------- | --------------------------------------------- |
| ❌ SSH connection failed             | Wrong IP or credentials       | Проверьте `PI_HOST`, `PI_USER`, `PI_PASSWORD` |
| ⚠️ Permission denied                | User lacks sudo               | Добавьте пользователя в sudoers               |
| 🔒 JWT expired                      | Token timeout                 | Выполните повторный вход                      |
| 🧩 Service not responding           | Wrong unit syntax             | Проверьте синтаксис unit-файла                |
| 🌐 Frontend not loading             | Backend not running           | Проверьте `uvicorn` сервер                    |
| 🧱 "Paramiko Authentication failed" | SSH key or password invalid   | Проверьте доступ и права                      |
| 🕓 Services load slowly             | Large output from `systemctl` | Используйте фильтры или async вызовы          |

---
