"""
Repositório para acesso aos dados da Bíblia no banco de dados SQLite.
"""
import random
from app.models.database import get_db_connection
from app.logging_config import logger

def _format_verse(row):
    """Converte uma linha do banco para dicionário e formata a referência."""
    if not row:
        return None
    verse_dict = dict(row)
    verse_dict['reference'] = f"{verse_dict['book']} {verse_dict['chapter']}:{verse_dict['verse']}"
    return verse_dict

class BibleRepository:
    """Classe responsável por interagir com as tabelas bible_verses e daily_verses."""
    
    def count_verses(self, translation='ACF') -> int:
        """Retorna o total de versículos para uma dada tradução."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) as count FROM bible_verses WHERE translation = ?", (translation,))
            result = cursor.fetchone()
            return result['count'] if result else 0
        except Exception as e:
            logger.error(f"Erro ao contar versículos ({translation}): {e}")
            return 0
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def insert_verses_batch(self, verses_list: list):
        """Insere um lote de versículos usando executemany para otimização."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.executemany("""
                INSERT OR IGNORE INTO bible_verses (book, chapter, verse, text, translation)
                VALUES (:book, :chapter, :verse, :text, :translation)
            """, verses_list)
            conn.commit()
        except Exception as e:
            logger.error(f"Erro ao inserir lote de versículos: {e}")
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_verse_by_id(self, verse_id: int):
        """Busca um versículo específico pelo seu ID."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM bible_verses WHERE id = ?", (verse_id,))
            return _format_verse(cursor.fetchone())
        except Exception as e:
            logger.error(f"Erro ao buscar versículo por ID {verse_id}: {e}")
            return None
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_verses_by_book(self, book: str, translation='ACF') -> list:
        """Busca todos os versículos de um livro específico."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM bible_verses WHERE book = ? AND translation = ? ORDER BY chapter, verse", 
                (book, translation)
            )
            return [_format_verse(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Erro ao buscar versículos do livro {book}: {e}")
            return []
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_verses_by_chapter(self, book: str, chapter: int, translation='ACF') -> list:
        """Busca todos os versículos de um capítulo específico."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM bible_verses WHERE book = ? AND chapter = ? AND translation = ? ORDER BY verse",
                (book, chapter, translation)
            )
            return [_format_verse(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Erro ao buscar versículos de {book} {chapter}: {e}")
            return []
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_verse_by_reference(self, book: str, chapter: int, verse: int, translation='ACF'):
        """Busca um único versículo com base na referência exata."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM bible_verses WHERE book = ? AND chapter = ? AND verse = ? AND translation = ?",
                (book, chapter, verse, translation)
            )
            return _format_verse(cursor.fetchone())
        except Exception as e:
            logger.error(f"Erro ao buscar referência {book} {chapter}:{verse}: {e}")
            return None
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def search_by_keyword(self, keyword: str, translation='ACF', limit=50) -> list:
        """Busca versículos que contêm a palavra-chave (case-insensitive)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            search_pattern = f"%{keyword}%"
            cursor.execute("""
                SELECT * FROM bible_verses 
                WHERE translation = ? AND text LIKE ? 
                ORDER BY book, chapter, verse LIMIT ?
            """, (translation, search_pattern, limit))
            return [_format_verse(row) for row in cursor.fetchall()]
        except Exception as e:
            logger.error(f"Erro ao buscar palavra-chave '{keyword}': {e}")
            return []
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_smart_random_verse(self, excluded_refs: list, min_length=60, priority_books=None, translation='ACF'):
        """Obtém um versículo aleatório com regras inteligentes de filtro e prioridade."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Montar cláusula de exclusão de capítulos (genealogias, censos)
            exclude_sql_parts = []
            params = [translation, min_length]
            
            for book, chapter in excluded_refs:
                exclude_sql_parts.append("NOT (book = ? AND chapter = ?)")
                params.extend([book, chapter])
                
            exclude_sql = ""
            if exclude_sql_parts:
                exclude_sql = "AND " + " AND ".join(exclude_sql_parts)
            
            # 70% de chance de pegar dos livros prioritários
            use_priority = priority_books and random.random() < 0.70
            priority_sql = ""
            
            if use_priority:
                placeholders = ", ".join(["?"] * len(priority_books))
                priority_sql = f"AND book IN ({placeholders})"
                params.extend(priority_books)
                
            query = f"""
                SELECT * FROM bible_verses 
                WHERE translation = ? AND LENGTH(text) >= ? {exclude_sql} {priority_sql}
                ORDER BY RANDOM() LIMIT 1
            """
            cursor.execute(query, params)
            row = cursor.fetchone()
            
            # Fallback: se nenhum resultado com prioridade, tenta sem
            if not row and use_priority:
                params_fallback = [translation, min_length]
                for book, chapter in excluded_refs:
                    params_fallback.extend([book, chapter])
                query_fallback = f"""
                    SELECT * FROM bible_verses 
                    WHERE translation = ? AND LENGTH(text) >= ? {exclude_sql}
                    ORDER BY RANDOM() LIMIT 1
                """
                cursor.execute(query_fallback, params_fallback)
                row = cursor.fetchone()
            
            return _format_verse(row)
        except Exception as e:
            logger.error(f"Erro ao buscar versículo aleatório inteligente: {e}")
            return None
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_daily_verse(self, date_str: str):
        """Busca o versículo registrado para o dia especificado (YYYY-MM-DD)."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT b.* FROM daily_verses d
                JOIN bible_verses b ON d.verse_id = b.id
                WHERE d.date = ?
            """, (date_str,))
            return _format_verse(cursor.fetchone())
        except Exception as e:
            logger.error(f"Erro ao buscar versículo diário para {date_str}: {e}")
            return None
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def save_daily_verse(self, date_str: str, verse_id: int) -> None:
        """Salva ou atualiza o versículo do dia especificado."""
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO daily_verses (date, verse_id)
                VALUES (?, ?)
            """, (date_str, verse_id))
            conn.commit()
        except Exception as e:
            logger.error(f"Erro ao salvar versículo diário para {date_str}: {e}")
        finally:
            if 'conn' in locals() and conn:
                conn.close()

    def get_stats(self, translation='ACF') -> dict:
        """Obtém estatísticas sobre os versículos (totais e contagens por livro)."""
        stats = {
            'total_verses': 0,
            'total_books': 0,
            'books': []
        }
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) as total FROM bible_verses WHERE translation = ?", (translation,))
            result = cursor.fetchone()
            if result:
                stats['total_verses'] = result['total']
                
            cursor.execute("""
                SELECT book, COUNT(*) as count 
                FROM bible_verses 
                WHERE translation = ? 
                GROUP BY book 
                ORDER BY MIN(id)
            """, (translation,))
            
            books_results = cursor.fetchall()
            stats['total_books'] = len(books_results)
            stats['books'] = [{'book': r['book'], 'count': r['count']} for r in books_results]
            
            return stats
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {e}")
            return stats
        finally:
            if 'conn' in locals() and conn:
                conn.close()
