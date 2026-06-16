"""
Application settings loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """Application configuration via .env file."""

    # Database
    DATABASE_URL: str = "mysql+aiomysql://root:password@localhost:3306/rakeshwarpandey_v2"
    DB_ECHO: bool = False

    # JWT
    JWT_SECRET: str = "change-this-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # CORS
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:8000"]'

    @property
    def cors_origins_list(self) -> List[str]:
        origins = json.loads(self.CORS_ORIGINS)
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
            s.close()
            origins.append(f"http://{local_ip}:5173")
            origins.append(f"http://{local_ip}:5174")
            origins.append(f"http://{local_ip}:8000")
            origins.append(f"http://{local_ip}")
        except Exception:
            pass
        return list(set(origins))

    # Uploads
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    CONTACT_NOTIFY_EMAIL: str = "rakeshwarpandey@gmail.com"

    # App
    APP_NAME: str = "Rakeshwar Pandey Portfolio"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
