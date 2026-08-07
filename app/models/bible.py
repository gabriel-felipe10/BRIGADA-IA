"""
Modelo e inicialização do banco de dados para a Bíblia.
"""
import sqlite3
from app.models.database import get_db_connection
from app.logging_config import logger

def init_bible_db():
    """Cria as tabelas e índices necessários para a Bíblia no banco de dados SQLite."""
    logger.info("Inicializando tabelas da Bíblia...")
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Tabela principal de versículos
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bible_verses (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                book        TEXT NOT NULL,
                chapter     INTEGER NOT NULL,
                verse       INTEGER NOT NULL,
                text        TEXT NOT NULL,
                category    TEXT,
                translation TEXT NOT NULL DEFAULT 'ACF',
                UNIQUE(book, chapter, verse, translation)
            );
        """)
        
        # Índices para otimização de busca
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_book ON bible_verses(book);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_chapter ON bible_verses(book, chapter);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_reference ON bible_verses(book, chapter, verse);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_category ON bible_verses(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_translation ON bible_verses(translation);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_bible_text ON bible_verses(text);")
        
        # Tabela de versículos do dia (por usuário)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_verses (
                date        TEXT NOT NULL,
                user_id     TEXT NOT NULL DEFAULT 'global',
                verse_id    INTEGER NOT NULL,
                PRIMARY KEY (date, user_id),
                FOREIGN KEY (verse_id) REFERENCES bible_verses(id)
            );
        """)
        
        # Migração se a tabela já existir sem a coluna user_id
        try:
            cursor.execute("ALTER TABLE daily_verses ADD COLUMN user_id TEXT NOT NULL DEFAULT 'global'")
        except sqlite3.OperationalError:
            pass
        
        conn.commit()
        logger.info("Tabelas da Bíblia inicializadas com sucesso.")
    except Exception as e:
        logger.error(f"Erro ao inicializar tabelas da Bíblia: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()
