<div align="center">

# ⚙️ Raspberry Pi Service Manager  
*A modern web panel for managing systemd services on Raspberry Pi via SSH*  

**Remote control • FastAPI • Next.js • JWT Auth • Systemd Integration**

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?logo=nextdotjs)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 🌍 Overview / Обзор

**Raspberry Pi Service Manager** — это современная веб-панель для управления сервисами `systemd` через SSH.  
Бэкенд написан на **FastAPI**, взаимодействует с Raspberry Pi через **Paramiko**, а фронтенд создан на **Next.js + TailwindCSS**.  

Вы можете:  
✅ Авторизоваться в панели (JWT)  
✅ Просматривать, запускать, останавливать и перезапускать сервисы  
✅ Создавать и удалять systemd-юниты  
✅ Работать в чистом и удобном интерфейсе  

---

## ⚙️ Features / Возможности

| 🧩 Функция | Описание |
|------------|-----------|
| 🔐 JWT Auth | Безопасная авторизация |
| 🧾 Systemd Integration | Просмотр и контроль всех сервисов |
| ⚡ SSH Management | Удалённое управление Raspberry Pi |
| 🧩 Create/Delete Units | Работа с `.service` файлами |
| 🌐 Modern UI | Веб-интерфейс на Next.js + Tailwind |

---

## 🔧 Configuration / Конфигурация

Файл `/config.ini` (пример — `config.ini.example`):

```ini
[raspberry]
host = 192.168.0.101
username = pi
password = raspberry

[auth]
admin_user = admin
admin_password = admin
secret_key = your_secret_key
```

💡 *Не добавляйте `config.ini` в git — он уже игнорируется.*

---

## 🚀 Installation / Установка

### 🔹 Backend Setup

```bash
python -m venv venv
source venv/bin/activate       # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
cd backend
uvicorn app.main:app --reload --port 8000
```

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Откройте http://localhost:3000
```

### 🔹 One-command start

```bash
./start-all.sh        # Linux / Mac
# или
start-all.ps1         # Windows
```

---

## 🔑 API Reference / Документация API

### `POST /login`
Авторизация и получение токена.

```json
{ "username": "admin", "password": "admin" }
```
**Response:**
```json
{ "access_token": "<JWT_TOKEN>" }
```

### `GET /services`
Получение списка сервисов Raspberry Pi.

```json
{
  "services": [
    {
      "name": "ssh.service",
      "status": "active",
      "enabled": true,
      "description": "OpenSSH Server"
    }
  ]
}
```

### `POST /services/control`
Управление сервисом:
```json
{ "name": "nginx.service", "action": "restart" }
```
**Доступные действия:** `start`, `stop`, `restart`, `status`

### `POST /services/create`
Создание нового юнита:
```json
{
  "name": "my.service",
  "command": "[Unit]\nDescription=My Service\n[Service]\nExecStart=/usr/bin/my-app\n[Install]\nWantedBy=multi-user.target"
}
```

### `POST /services/delete`
Удаление сервиса:
```json
{ "name": "my.service" }
```

---

## 🔒 Security / Безопасность

- Используйте SSH-ключи вместо паролей  
- Разрешите нужные sudo-команды без пароля:
  ```bash
  pi ALL=(ALL) NOPASSWD: /bin/systemctl, /usr/bin/tee, /bin/rm
  ```
- Храните `secret_key` безопасно  
- Не публикуйте backend без HTTPS и firewall

---

## 🧩 Deployment / Деплой

Пример systemd unit для backend:

```ini
[Unit]
Description=Pi Service Manager Backend
After=network.target

[Service]
WorkingDirectory=/path/to/backend
ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
User=service
EnvironmentFile=/path/to/config.ini

[Install]
WantedBy=multi-user.target
```

---

## 🧠 Troubleshooting / Решение проблем

| Проблема | Возможное решение |
|-----------|------------------|
| ❌ SSH error | Проверьте IP, логин, пароль/ключ |
| 🔒 Permission denied | Добавьте NOPASSWD в `/etc/sudoers` |
| ⚠️ Auth error | Проверьте `admin_user` и `admin_password` |
| 🧩 Empty service list | Проверьте SSH-доступ Raspberry Pi |

---

## 🧾 License / Лицензия

MIT License © 2025 — [Lumus-0x](https://github.com/Lumus-0x)

---

<div align="center">
💡 *Made for Raspberry Pi lovers and systemd tinkerers.*  
</div>
