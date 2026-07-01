"""
BRIGADA-IA — Flask Application Factory.
"""

from flask import Flask
from dotenv import load_dotenv
from app.config import Config
from app.logging_config import logger
from app.models.database import init_db

# Carrega as variáveis do arquivo .env
load_dotenv()


def create_app():
    """Cria e configura a aplicação Flask."""
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )
    app.config.from_object(Config)

    logger.info("Inicializando aplicação {} v{}", Config.APP_NAME, Config.APP_VERSION)

    # Inicializa o banco de dados local (SQLite)
    init_db()

    # Verifica e migra schema do Supabase (adiciona colunas faltantes)
    _ensure_supabase_schema()

    # Registra blueprints
    from app.routes.api import api_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.logs import logs_bp
    from app.routes.products import products_bp
    from app.routes.users import users_bp
    from app.routes.settings import settings_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(settings_bp)

    logger.info("Blueprints registrados: api, dashboard, logs, products, users, settings")
    logger.info("🛡️  BRIGADA-IA pronta para receber requisições")

    return app


def _ensure_supabase_schema():
    """Verifica se as colunas necessárias existem no Supabase."""
    try:
        from app.utils.supabase_client import supabase
        logger.info("Verificando estrutura da tabela 'produtos' no Supabase...")
        res = supabase.table("produtos").select("id, is_awaiting_reduction").limit(1).execute()
        logger.info("Tabela 'produtos' possui a coluna 'is_awaiting_reduction' ✅")
    except Exception as e:
        logger.warning(
            "\n"
            "========================================================================\n"
            "⚠️ ATENÇÃO: A coluna 'is_awaiting_reduction' não existe ou não está acessível no Supabase.\n"
            "Por favor, execute o seguinte comando SQL no SQL Editor do seu Supabase Dashboard:\n\n"
            "   ALTER TABLE produtos ADD COLUMN IF NOT EXISTS is_awaiting_reduction BOOLEAN DEFAULT false;\n\n"
            "Os produtos continuarão funcionando com fallback temporário local em memória.\n"
            "========================================================================"
        )

