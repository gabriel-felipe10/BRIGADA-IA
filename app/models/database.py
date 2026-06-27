"""
BRIGADA-IA — Banco de dados SQLite.
Gerencia a conexão e criação de tabelas.
"""

import sqlite3
import os
from app.config import Config
from app.logging_config import logger


def get_db_connection():
    """Cria e retorna uma conexão com o banco SQLite."""
    os.makedirs(os.path.dirname(Config.DB_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row  # Permite acessar colunas por nome
    conn.execute("PRAGMA journal_mode=WAL")  # Melhor performance de escrita
    logger.trace("Conexão SQLite aberta | db={}", Config.DB_PATH)
    return conn


def init_db():
    """Inicializa o banco de dados criando as tabelas necessárias."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS validation_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id  TEXT    NOT NULL UNIQUE,
            timestamp   TEXT    NOT NULL,
            type        TEXT    NOT NULL,
            status      TEXT    NOT NULL,
            payload     TEXT    NOT NULL,
            result      TEXT    NOT NULL,
            details     TEXT,
            duration_ms REAL
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp
        ON validation_logs(timestamp DESC)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_logs_status
        ON validation_logs(status)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_logs_type
        ON validation_logs(type)
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key         TEXT PRIMARY KEY,
            value       TEXT NOT NULL
        )
    """)

    conn.commit()
    logger.info("Banco de dados inicializado | path={}", Config.DB_PATH)
    conn.close()
