"""
Serviço específico para gerenciar a funcionalidade do Versículo do Dia.
"""
from datetime import datetime
from app.services.bible_service import BibleService
from app.repositories.bible_repository import BibleRepository
from app.logging_config import logger

class VerseOfTheDayService:
    """Gerencia o ciclo de vida do versículo diário."""
    
    def __init__(self):
        self.bible_service = BibleService()
        self.repository = BibleRepository()
        
    def get_today_verse(self):
        """Retorna o versículo de hoje. Se não houver, sorteia e salva."""
        # Garante que a base está carregada
        self.bible_service.ensure_bible_loaded()
        
        today_str = datetime.now().strftime('%Y-%m-%d')
        
        # 1. Checa se o versículo de hoje já existe
        daily_verse = self.repository.get_daily_verse(today_str)
        if daily_verse:
            logger.info(f"Retornando versículo do dia já salvo para {today_str}.")
            return daily_verse
            
        # 2. Não existe, sorteia um inteligentemente
        logger.info(f"Nenhum versículo salvo para {today_str}. Sorteando novo...")
        smart_verse = self.bible_service.get_smart_random_verse()
        
        if not smart_verse:
            logger.error("Não foi possível sortear um versículo.")
            return None
            
        # 3. Salva no banco e retorna
        self.repository.save_daily_verse(today_str, smart_verse['id'])
        logger.info(f"Versículo do dia salvo: {smart_verse['reference']}")
        return smart_verse
