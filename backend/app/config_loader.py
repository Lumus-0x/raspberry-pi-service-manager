"""
Загрузчик конфигурации из config.ini
"""
import configparser
import os
from pathlib import Path

def load_config():
    """Загружает конфигурацию из config.ini в корне проекта"""
    config = configparser.ConfigParser()
    
    # Путь к config.ini в корне проекта (на уровень выше от backend/app/)
    root_dir = Path(__file__).parent.parent.parent
    config_file = root_dir / 'config.ini'
    
    if not config_file.exists():
        raise FileNotFoundError(f"Config file not found: {config_file}")
    
    config.read(config_file)
    
    # Возвращаем словарь с настройками
    settings = {
        'api': {
            'backend_url': config.get('API', 'backend_url', fallback='http://localhost:8000'),
            'frontend_url': config.get('API', 'frontend_url', fallback='http://localhost:3000'),
        },
        'auth': {
            'admin_username': config.get('Authentication', 'admin_username', fallback='admin'),
            'admin_password': config.get('Authentication', 'admin_password', fallback='admin'),
            'token_expiration_days': config.getint('Authentication', 'token_expiration_days', fallback=30),
        },
        'ssh': {
            'host': config.get('SSH', 'host', fallback=''),
            'username': config.get('SSH', 'username', fallback='pi'),
            'password': config.get('SSH', 'password', fallback=''),
            'port': config.getint('SSH', 'port', fallback=22),
            'timeout': config.getint('SSH', 'timeout', fallback=10),
        },
        'security': {
            'secret_key': config.get('Security', 'secret_key', fallback='change-me-secret-key'),
        }
    }
    
    return settings

