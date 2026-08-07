"""
Rotas para acessar os recursos da Bíblia via API.
"""
from flask import Blueprint, jsonify, request
from app.services.bible_service import BibleService
from app.services.verse_of_the_day_service import VerseOfTheDayService
from app.repositories.bible_repository import BibleRepository
from app.logging_config import logger

bible_bp = Blueprint('bible_bp', __name__, url_prefix='/api/bible')

bible_service = BibleService()
votd_service = VerseOfTheDayService()
bible_repository = BibleRepository()

@bible_bp.before_request
def ensure_data():
    """Garante que os dados da Bíblia estão carregados antes de qualquer requisição."""
    bible_service.ensure_bible_loaded()

@bible_bp.route('/verse-of-the-day', methods=['GET'])
def verse_of_the_day():
    """Endpoint que retorna o versículo do dia."""
    try:
        verse = votd_service.get_today_verse()
        if not verse:
            return jsonify({'error': 'Não foi possível encontrar o versículo do dia.'}), 404
        return jsonify(verse), 200
    except Exception as e:
        logger.error(f"Erro no endpoint verse_of_the_day: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/search', methods=['GET'])
def search_verses():
    """Busca versículos por palavra-chave. (ex: ?q=amor)"""
    keyword = request.args.get('q', '').strip()
    if not keyword:
        return jsonify({'error': 'Forneça a palavra-chave no parâmetro q.'}), 400
        
    try:
        verses = bible_service.search_by_keyword(keyword)
        return jsonify({'results': verses, 'count': len(verses)}), 200
    except Exception as e:
        logger.error(f"Erro no endpoint search: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/book/<string:book>', methods=['GET'])
def get_book(book):
    """Retorna todos os versículos de um livro."""
    try:
        verses = bible_repository.get_verses_by_book(book)
        if not verses:
            return jsonify({'error': f'Livro {book} não encontrado ou vazio.'}), 404
        return jsonify({'book': book, 'verses': verses}), 200
    except Exception as e:
        logger.error(f"Erro no endpoint get_book para {book}: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/book/<string:book>/<int:chapter>', methods=['GET'])
def get_chapter(book, chapter):
    """Retorna todos os versículos de um capítulo."""
    try:
        verses = bible_repository.get_verses_by_chapter(book, chapter)
        if not verses:
            return jsonify({'error': f'Referência {book} {chapter} não encontrada.'}), 404
        return jsonify({'book': book, 'chapter': chapter, 'verses': verses}), 200
    except Exception as e:
        logger.error(f"Erro no endpoint get_chapter: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/reference/<string:book>/<int:chapter>/<int:verse>', methods=['GET'])
def get_reference(book, chapter, verse):
    """Retorna um versículo específico."""
    try:
        verse_data = bible_service.get_by_reference(book, chapter, verse)
        if not verse_data:
            return jsonify({'error': 'Versículo não encontrado.'}), 404
        return jsonify(verse_data), 200
    except Exception as e:
        logger.error(f"Erro no endpoint get_reference: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/stats', methods=['GET'])
def get_stats():
    """Retorna estatísticas da Bíblia."""
    try:
        stats = bible_service.get_statistics()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Erro no endpoint get_stats: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500

@bible_bp.route('/random', methods=['GET'])
def get_random():
    """Retorna um versículo aleatório inteligente sem salvar no versículo do dia."""
    try:
        verse = bible_service.get_smart_random_verse()
        if not verse:
            return jsonify({'error': 'Nenhum versículo encontrado.'}), 404
        return jsonify(verse), 200
    except Exception as e:
        logger.error(f"Erro no endpoint get_random: {e}")
        return jsonify({'error': 'Erro interno do servidor.'}), 500
