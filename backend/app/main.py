from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import paramiko
import json
import jwt
import datetime
from fastapi import Depends, Request
from config_loader import load_config

# Загрузка конфигурации из config.ini
try:
    config = load_config()
    SECRET_KEY = config['security']['secret_key']
    ADMIN_USER = config['auth']['admin_username']
    ADMIN_PASS = config['auth']['admin_password']
    TOKEN_EXPIRATION_DAYS = config['auth']['token_expiration_days']
    BACKEND_URL = config['api']['backend_url']
    FRONTEND_URL = config['api']['frontend_url']
    
    # Конфигурация SSH
    ssh_config = {
        "hostname": config['ssh']['host'],
        "username": config['ssh']['username'],
        "password": config['ssh']['password'],
        "port": config['ssh']['port'],
        "timeout": config['ssh']['timeout'],
        "keepalive": True
    }
except Exception as e:
    print(f"Warning: Could not load config.ini: {e}")
    # Fallback значения
    SECRET_KEY = 'eK8#mP9$qL2@nR5&vX7'
    ADMIN_USER = 'admin'
    ADMIN_PASS = '15937500'
    TOKEN_EXPIRATION_DAYS = 30
    BACKEND_URL = 'http://localhost:8000'
    FRONTEND_URL = 'http://localhost:3000'
    
    ssh_config = {
        "hostname": "",
        "username": "pi",
        "password": "",
        "port": 22,
        "timeout": 10,
        "keepalive": True
    }

# Настройки сервера
app = FastAPI(
    title="Raspberry Pi Service Manager",
    debug=True,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Настройка CORS
allowed_origins = [FRONTEND_URL, BACKEND_URL]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ServiceOperation(BaseModel):
    name: str
    action: str  # start, stop, restart, status, enable, disable

class ServiceConfig(BaseModel):
    name: str
    command: str  # Полный конфиг сервиса
    description: str = ""

class ServiceDelete(BaseModel):
    name: str

def get_ssh_client():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        # Проверяем наличие обязательных параметров (password может быть пустым для ключей)
        required_params = ['hostname', 'username']
        missing_params = [param for param in required_params if not ssh_config.get(param)]
        if missing_params:
            raise ValueError(f"Missing required SSH parameters: {', '.join(missing_params)}")

        print(f"Connecting to {ssh_config['hostname']} as {ssh_config['username']}...")
        client.connect(
            hostname=ssh_config['hostname'],
            username=ssh_config['username'],
            password=ssh_config['password'],
            port=ssh_config.get('port', 22),
            timeout=ssh_config.get('timeout', 10),
            look_for_keys=False,  # Отключаем поиск ключей, используем только пароль
            allow_agent=False     # Отключаем SSH-agent
        )
        return client
    except paramiko.AuthenticationException:
        raise HTTPException(status_code=503, detail="Authentication failed. Check username and password.")
    except paramiko.SSHException as e:
        raise HTTPException(status_code=503, detail=f"SSH error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not connect to Raspberry Pi: {str(e)}")


# --- Authentication helpers (moved up so Depends(get_current_user) is available) ---
def create_token(username: str, expiration_days: int = None):
    if expiration_days is None:
        expiration_days = TOKEN_EXPIRATION_DAYS
    payload = {
        'sub': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=expiration_days)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload.get('sub')
    except Exception:
        return None


async def get_current_user(request: Request):
    auth = request.headers.get('authorization')
    if not auth:
        raise HTTPException(status_code=401, detail='Not authenticated')
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='Invalid auth header')
    token = parts[1]
    user = decode_token(token)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid or expired token')
    return user


@app.post('/login')
async def login(payload: dict):
    username = payload.get('username')
    password = payload.get('password')
    if username == ADMIN_USER and password == ADMIN_PASS:
        token = create_token(username, expiration_days=TOKEN_EXPIRATION_DAYS)
        return {
            'access_token': token, 
            'token_type': 'bearer', 
            'expires_in': TOKEN_EXPIRATION_DAYS * 24 * 3600
        }
    raise HTTPException(status_code=401, detail='Invalid credentials')

@app.get('/api/config')
async def get_frontend_config():
    """Endpoint для получения конфигурации фронтенда"""
    return {
        'api_url': BACKEND_URL,
        'frontend_url': FRONTEND_URL,
    }

@app.get('/auth/verify')
async def verify_token(user: str = Depends(get_current_user)):
    """Легковесный endpoint для проверки валидности токена без SSH соединения"""
    return {'valid': True, 'user': user}

@app.get("/services")
async def list_services(user: str = Depends(get_current_user)):
    # auth enforced by dependency
    client = get_ssh_client()
    try:
        # Проверяем соединение простой командой
        stdin, stdout, stderr = client.exec_command('whoami')
        if stderr.read():
            raise HTTPException(status_code=503, detail="Failed to execute commands on Raspberry Pi")
        
        services = []
        # Попытаемся получить JSON-вывод от systemctl — это самый надёжный способ
        print("Fetching services list...")
        try:
            # Создаем команду sudo с передачей пароля через stdin
            sudo_command = f'echo "{ssh_config["password"]}" | sudo -S systemctl list-units --type=service --all --no-pager --no-legend --output=json'
            stdin, stdout, stderr = client.exec_command(sudo_command)
            
            # Читаем потенциальные ошибки
            error = stderr.read().decode()
            if error and "sorry, try again" in error.lower():
                raise HTTPException(status_code=503, detail="Invalid sudo password")
            elif error and "command not found" in error.lower():
                raise HTTPException(status_code=503, detail="systemctl command not found")
            elif error and not "password for" in error.lower():  # Игнорируем стандартный промпт sudo
                print(f"systemctl error: {error}")
                raise Exception(f"systemctl error: {error}")
            raw = stdout.read().decode()
            data = json.loads(raw)
            # data может быть списком или словарём с ключом units
            if isinstance(data, dict):
                units = data.get('units') or data.get('data') or [data]
            else:
                units = data

            for u in units:
                service_name = u.get('unit') or u.get('name') or u.get('UNIT') or u.get('id') or u.get('Id')
                status = (
                    u.get('activeState')
                    or u.get('ActiveState')
                    or u.get('active')
                    or u.get('state')
                    or 'unknown'
                )
                description = u.get('description') or u.get('Description') or ''

                if service_name and isinstance(service_name, str):
                    stdin, stdout_enabled, stderr = client.exec_command(
                        f"sudo systemctl is-enabled '{service_name}' 2>/dev/null || echo unknown"
                    )
                    enabled = stdout_enabled.read().decode().strip()

                    services.append({
                        'name': service_name,
                        'status': status,
                        'enabled': enabled,
                        'description': description,
                        'details': json.dumps(u),
                    })

            return {'services': services}
        except Exception:
            # fallback: текстовый парсинг
            stdin, stdout, stderr = client.exec_command(
                "sudo systemctl list-units --type=service --all --no-pager --no-legend"
            )
            service_list = stdout.readlines()
            for line in service_list:
                line = line.strip()
                if not line:
                    continue
                parts = line.split()
                if len(parts) >= 1:
                    service_name = parts[0]
                    # Команды с передачей пароля через stdin
                    sudo_active = f'echo "{ssh_config["password"]}" | sudo -S systemctl is-active "{service_name}" 2>/dev/null || echo unknown'
                    stdin, stdout_status, stderr = client.exec_command(sudo_active)
                    status = stdout_status.read().decode().strip()

                    sudo_enabled = f'echo "{ssh_config["password"]}" | sudo -S systemctl is-enabled "{service_name}" 2>/dev/null || echo unknown'
                    stdin, stdout_enabled, stderr = client.exec_command(sudo_enabled)
                    enabled = stdout_enabled.read().decode().strip()
                    description = ' '.join(parts[4:]) if len(parts) > 4 else ''
                    services.append({
                        'name': service_name,
                        'status': status,
                        'enabled': enabled,
                        'description': description,
                        'details': '',
                    })
            return {'services': services}
    finally:
        client.close()

@app.post("/services/control")
async def control_service(operation: ServiceOperation, user: str = Depends(get_current_user)):
    # auth enforced by dependency
    client = get_ssh_client()
    try:
        if operation.action not in ["start", "stop", "restart", "status", "enable", "disable"]:
            raise HTTPException(status_code=400, detail="Invalid action")
        
        # Очищаем и экранируем имя сервиса
        service_name = operation.name.replace("\\", "-").replace("/", "-")
        if not service_name.endswith('.service'):
            service_name += '.service'
        
        # Выполняем команду управления сервисом с передачей пароля через stdin
        command = f'echo "{ssh_config["password"]}" | sudo -S systemctl {operation.action} "{service_name}"'
        stdin, stdout, stderr = client.exec_command(command)
        error = stderr.read().decode()
        if error and not "password for" in error.lower():  # Игнорируем стандартный промпт sudo
            raise HTTPException(status_code=400, detail=error)
        
        # Для enable/disable получаем актуальный enabled статус
        if operation.action in ["enable", "disable"]:
            enabled_command = f'echo "{ssh_config["password"]}" | sudo -S systemctl is-enabled "{service_name}"'
            stdin, stdout, stderr = client.exec_command(enabled_command)
            enabled_status = stdout.read().decode().strip()
            
            return {
                "status": "success",
                "service_enabled": enabled_status,
                "message": f"Service {operation.name} {operation.action} completed successfully"
            }
        
        # Для start/stop/restart получаем актуальный статус сервиса
        status_command = f'echo "{ssh_config["password"]}" | sudo -S systemctl is-active "{service_name}"'
        stdin, stdout, stderr = client.exec_command(status_command)
        status = stdout.read().decode().strip()
        
        return {
            "status": "success",
            "service_status": status,
            "message": f"Service {operation.name} {operation.action} completed successfully"
        }
    finally:
        client.close()

@app.post("/services/create")
async def create_service(service_config: ServiceConfig, user: str = Depends(get_current_user)):
    client = get_ssh_client()
    try:
        # Создаем service файл напрямую из предоставленного конфига
        command = f"echo '{service_config.command}' | sudo tee /etc/systemd/system/{service_config.name}"
        stdin, stdout, stderr = client.exec_command(command)
        error = stderr.read().decode()
        if error:
            raise HTTPException(status_code=400, detail=f"Error creating service: {error}")

        # Устанавливаем правильные разрешения
        client.exec_command(f"sudo chmod 644 /etc/systemd/system/{service_config.name}")

        # Перезагружаем systemd
        client.exec_command("sudo systemctl daemon-reload")

        return {"status": "success", "message": "Service created successfully"}
    finally:
        client.close()


@app.post("/services/delete")
async def delete_service(payload: ServiceDelete, user: str = Depends(get_current_user)):
    client = get_ssh_client()
    try:
        # sanitize name similar to control_service
        service_name = payload.name.replace("\\", "-").replace("/", "-")
        if not service_name.endswith('.service'):
            # allow user to pass name with or without .service; assume given name is file name if contains dot
            service_name = service_name

        # Try stopping and disabling the service (ignore errors)
        client.exec_command(f"sudo systemctl stop '{service_name}' || true")
        client.exec_command(f"sudo systemctl disable '{service_name}' || true")

        # Remove service file
        rm_cmd = f"sudo rm -f /etc/systemd/system/{service_name}"
        stdin, stdout, stderr = client.exec_command(rm_cmd)
        err = stderr.read().decode().strip()
        if err and 'No such file or directory' not in err:
            raise HTTPException(status_code=400, detail=err)

        # Reload systemd and reset failed state
        client.exec_command("sudo systemctl daemon-reload")
        client.exec_command("sudo systemctl reset-failed || true")

        return {"status": "success", "message": f"Service {payload.name} removed"}
    finally:
        client.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)