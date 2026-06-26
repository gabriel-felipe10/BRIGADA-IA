"""
BRIGADA-IA — Configurações centralizadas.
"""

import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
    """Configurações da aplicação."""

    # Flask
    SECRET_KEY = os.environ.get("SECRET_KEY", "brigada-ia-dev-key-2026")
    DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"

    # Database
    if os.environ.get("VERCEL"):
        DB_PATH = "/tmp/brigada.db"
        LOG_DIR = "/tmp"
    else:
        DB_PATH = os.path.join(BASE_DIR, "logs", "brigada.db")
        LOG_DIR = os.path.join(BASE_DIR, "logs")

    # App
    APP_NAME = "BRIGADA-IA"
    APP_VERSION = "1.0.0"
