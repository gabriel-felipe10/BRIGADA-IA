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

    # Inicializa o banco de dados
    init_db()

    # Registra blueprints
    from app.routes.api import api_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.logs import logs_bp
    from app.routes.products import products_bp
    from app.routes.users import users_bp

    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(logs_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(users_bp)

    logger.info("Blueprints registrados: api, dashboard, logs, products, users")
    logger.info("🛡️  BRIGADA-IA pronta para receber requisições")

    return app
