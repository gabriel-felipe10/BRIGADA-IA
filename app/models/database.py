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

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id                INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_json TEXT NOT NULL UNIQUE,
            created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS produtos_sem_nota (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            plu          TEXT NOT NULL,
            name         TEXT NOT NULL,
            quantity     REAL NOT NULL,
            arrival_date TEXT NOT NULL,
            created_by   TEXT NOT NULL,
            signature    TEXT,
            responsible_name TEXT,
            created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quebras (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            plu              TEXT,
            product_name     TEXT NOT NULL,
            quantity         REAL NOT NULL,
            unit             TEXT DEFAULT 'kg',
            supplier         TEXT,
            origin           TEXT,
            occurrence       TEXT,
            reason           TEXT NOT NULL,
            sector           TEXT NOT NULL DEFAULT 'Açougue',
            occurrence_date  TEXT NOT NULL,
            responsible_name TEXT,
            created_by       TEXT NOT NULL,
            notes            TEXT,
            signature        TEXT,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS crachas (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name     TEXT NOT NULL,
            quantity         REAL NOT NULL,
            consinco_code    TEXT,
            expiry_date      TEXT NOT NULL,
            barcode          TEXT,
            created_by       TEXT NOT NULL,
            notes            TEXT,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Migração para bases SQLite já existentes
    try:
        cursor.execute("ALTER TABLE produtos_sem_nota ADD COLUMN signature TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE produtos_sem_nota ADD COLUMN responsible_name TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE quebras ADD COLUMN supplier TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE quebras ADD COLUMN origin TEXT")
    except sqlite3.OperationalError:
        pass

    try:
        cursor.execute("ALTER TABLE quebras ADD COLUMN occurrence TEXT")
    except sqlite3.OperationalError:
        pass

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_sem_nota_plu
        ON produtos_sem_nota(plu)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_quebras_date
        ON quebras(occurrence_date DESC)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_crachas_date
        ON crachas(expiry_date DESC)
    """)

    conn.commit()
    logger.info("Banco de dados inicializado | path={}", Config.DB_PATH)
    conn.close()

