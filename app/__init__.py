"""
BRIGADA-IA — Flask Application Factory.
"""

from flask import Flask
from app.config import Config
from app.logging_config import logger
from app.models.database import init_db


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

    app.register_blueprint(api_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(logs_bp)

    logger.info("Blueprints registrados: api, dashboard, logs")
    logger.info("🛡️  BRIGADA-IA pronta para receber requisições")

    return app
