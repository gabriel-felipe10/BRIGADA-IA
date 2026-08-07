"""
Serviço para gerenciar os dados e a lógica de negócios da Bíblia.
"""
import os
import json
import requests
from app.logging_config import logger
from app.repositories.bible_repository import BibleRepository

class BibleService:
    """Serviço que gerencia carga, consulta e inteligência da Bíblia."""
    
    def __init__(self):
        self.repository = BibleRepository()
        self.storage_dir = os.path.join('app', 'storage', 'bible_data')
        
    def ensure_bible_loaded(self, translation='ACF') -> bool:
        """
        Verifica se há versículos no DB. Caso contrário, faz download,
        parseia o JSON e importa pro banco.
        """
        if self.repository.count_verses(translation) > 0:
            logger.info(f"Bíblia {translation} já está carregada no banco de dados.")
            return True
            
        os.makedirs(self.storage_dir, exist_ok=True)
        file_path = os.path.join(self.storage_dir, f"{translation}.json")
        
        # Download
        if not os.path.exists(file_path):
            url = f"https://github.com/damarals/biblias/releases/latest/download/{translation}.json"
            logger.info(f"Baixando bíblia de {url}")
            try:
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(response.text)
            except Exception as e:
                logger.error(f"Falha ao baixar Bíblia da URL {url}: {e}")
                return False
                
        # Parse e inserção
        try:
            logger.info(f"Processando JSON da Bíblia: {file_path}")
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            verses_list = []
            for b_data in data:
                # O JSON pode conter 'book' ou 'name' (ou 'abbrev' + etc)
                book_name = b_data.get('book') or b_data.get('name')
                if not book_name:
                    continue
                    
                chapters = b_data.get('chapters', [])
                for ch_idx, chapter in enumerate(chapters):
                    ch_num = ch_idx + 1
                    for v_idx, verse_text in enumerate(chapter):
                        v_num = v_idx + 1
                        verses_list.append({
                            'book': book_name,
                            'chapter': ch_num,
                            'verse': v_num,
                            'text': verse_text,
                            'translation': translation
                        })
            
            if verses_list:
                logger.info(f"Inserindo {len(verses_list)} versículos no banco (lotes)...")
                chunk_size = 1000
                for i in range(0, len(verses_list), chunk_size):
                    self.repository.insert_verses_batch(verses_list[i:i+chunk_size])
                logger.info(f"Bíblia {translation} carregada com sucesso.")
            return True
        except Exception as e:
            logger.error(f"Erro ao processar e carregar JSON da Bíblia: {e}")
            return False

    def get_smart_random_verse(self, translation='ACF'):
        """Obtém um versículo com inteligência, filtrando genealogias e focando em livros encorajadores."""
        excluded_refs = [
            ('1 Crônicas', 1), ('1 Crônicas', 2), ('1 Crônicas', 3), 
            ('1 Crônicas', 4), ('1 Crônicas', 5), ('1 Crônicas', 6), 
            ('1 Crônicas', 7), ('1 Crônicas', 8), ('1 Crônicas', 9),
            ('Números', 1), ('Números', 2), ('Números', 3), 
            ('Números', 4), ('Números', 26),
            ('Esdras', 2), ('Esdras', 8),
            ('Neemias', 7), ('Neemias', 11), ('Neemias', 12)
        ]
        
        priority_books = [
            'Salmos', 'Provérbios', 'Isaías', 'Jeremias', 'João', 'Romanos', 
            'Filipenses', 'Efésios', 'Colossenses', '1 Coríntios', '2 Coríntios', 
            'Gálatas', '1 Tessalonicenses', 'Tiago', '1 Pedro', '1 João', 'Hebreus'
        ]
        
        return self.repository.get_smart_random_verse(
            excluded_refs=excluded_refs,
            min_length=60,
            priority_books=priority_books,
            translation=translation
        )

    def search_by_keyword(self, keyword: str, translation='ACF'):
        """Realiza busca por palavra-chave."""
        return self.repository.search_by_keyword(keyword, translation)

    def get_by_reference(self, book: str, chapter: int, verse: int, translation='ACF'):
        """Retorna o versículo de acordo com livro, capitulo e versículo."""
        return self.repository.get_verse_by_reference(book, chapter, verse, translation)

    def get_statistics(self, translation='ACF'):
        """Retorna as estatísticas da base da Bíblia."""
        return self.repository.get_stats(translation)
