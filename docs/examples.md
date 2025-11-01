# Примеры использования / Examples

Этот документ содержит примеры использования API и типичные сценарии работы с сервисами. / This document contains API usage examples and typical service management scenarios.

## Управление сервисами через API / Service Management via API

### Аутентификация / Authentication

```bash
# Получить токен / Get token
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Ответ / Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
}

# Использовать токен / Use the token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1..."
```

### Получение списка сервисов / List Services

```bash
curl http://localhost:8000/services \
  -H "Authorization: Bearer $TOKEN"

# Ответ / Response:
{
  "services": [
    {
      "name": "nginx.service",
      "status": "active",
      "enabled": true,
      "description": "A high performance web server",
      "details": "..."
    },
    ...
  ]
}
```

### Управление сервисом / Control Service

```bash
# Запуск сервиса / Start service
curl -X POST http://localhost:8000/services/control \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx.service","action":"start"}'

# Остановка / Stop
curl -X POST http://localhost:8000/services/control \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx.service","action":"stop"}'

# Перезапуск / Restart
curl -X POST http://localhost:8000/services/control \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"nginx.service","action":"restart"}'
```

### Создание сервиса / Create Service

```bash
# Пример создания простого сервиса / Example of creating a simple service
curl -X POST http://localhost:8000/services/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myapp.service",
    "command": "[Unit]\nDescription=My Python App\n\n[Service]\nExecStart=/usr/bin/python3 /home/pi/myapp.py\nRestart=always\n\n[Install]\nWantedBy=multi-user.target"
  }'
```

### Удаление сервиса / Delete Service

```bash
curl -X POST http://localhost:8000/services/delete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"myapp.service"}'
```

## Примеры unit-файлов / Unit File Examples

### Простой Python-скрипт / Simple Python Script

```ini
[Unit]
Description=My Python Service
After=network.target

[Service]
Type=simple
User=pi
ExecStart=/usr/bin/python3 /home/pi/myscript.py
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

### Node.js приложение / Node.js Application

```ini
[Unit]
Description=Node.js App
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/nodeapp
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Web-сервер с зависимостями / Web Server with Dependencies

```ini
[Unit]
Description=Web Application
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/local/bin/uvicorn main:app
Restart=always
Environment=PORT=8000

[Install]
WantedBy=multi-user.target
```

## Рекомендации по безопасности / Security Guidelines

### Ограничение sudo / Limiting sudo

Создайте файл в `/etc/sudoers.d/` для ограничения команд:

```bash
# /etc/sudoers.d/service-manager
myuser ALL=(root) NOPASSWD: /bin/systemctl start *
myuser ALL=(root) NOPASSWD: /bin/systemctl stop *
myuser ALL=(root) NOPASSWD: /bin/systemctl restart *
myuser ALL=(root) NOPASSWD: /bin/systemctl status *
myuser ALL=(root) NOPASSWD: /bin/systemctl is-active *
myuser ALL=(root) NOPASSWD: /bin/systemctl is-enabled *
myuser ALL=(root) NOPASSWD: /bin/systemctl enable *
myuser ALL=(root) NOPASSWD: /bin/systemctl disable *
myuser ALL=(root) NOPASSWD: /bin/systemctl daemon-reload
myuser ALL=(root) NOPASSWD: /bin/systemctl reset-failed *
myuser ALL=(root) NOPASSWD: /usr/bin/tee /etc/systemd/system/*
myuser ALL=(root) NOPASSWD: /bin/rm /etc/systemd/system/*
```

### SSH ключи / SSH Keys

```bash
# На локальной машине / On local machine
ssh-keygen -t ed25519 -C "service-manager"
ssh-copy-id -i ~/.ssh/id_ed25519.pub pi@your-raspberry-pi
```

Затем обновите `.env`:
```
PI_HOST=your-raspberry-pi
PI_USER=pi
# Оставить пустым для авторизации по ключу / Leave empty for key auth
PI_PASSWORD=
```

## Типичные ошибки / Common Issues

### 401 Unauthorized

- Проверьте, что токен не истёк / Check if token is not expired
- Проверьте, что токен передаётся в заголовке / Verify token is in header
- SECRET_KEY в .env совпадает с тем, что использовался при создании токена / SECRET_KEY matches the one used to create token

### SSH ошибки / SSH Errors

- Проверьте сетевую доступность Pi / Check Pi network connectivity
- Убедитесь, что пользователь существует / Ensure user exists
- Проверьте права на ключи (~/.ssh permissions)
- Проверьте подключение вручную: `ssh pi@hostname`

### Ошибки systemd / systemd Errors

- Проверьте права sudo / Check sudo permissions
- Проверьте синтаксис unit-файла / Verify unit file syntax
- Посмотрите логи: `journalctl -u service-name`

## Советы по разработке / Development Tips

### Отладка API / API Debugging

Используйте FastAPI Swagger UI:
```
http://localhost:8000/docs
```

### Тестирование unit-файлов / Unit File Testing

```bash
# Проверка синтаксиса / Syntax check
systemd-analyze verify myservice.service

# Просмотр действующей конфигурации / View effective config
systemctl show myservice.service

# Просмотр последних логов / View recent logs
journalctl -u myservice.service -n 50 --no-pager
```