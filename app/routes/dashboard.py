"""
BRIGADA-IA — Rota principal (SPA).
Serve o painel de validade com Super Admin, Gestão de Usuários e Dashboard.
"""

from flask import Blueprint, render_template
from app.logging_config import logger

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/")
def index():
    """Renderiza a SPA — Brigada de Validade."""
    logger.debug("BRIGADA-IA SPA acessada")
    return render_template("index.html")


@dashboard_bp.route("/admin")
@dashboard_bp.route("/users")
@dashboard_bp.route("/products")
@dashboard_bp.route("/dashboard")
def spa_routes():
    """Redireciona rotas SPA para o index (cliente gerencia o roteamento)."""
    logger.debug("Rota SPA acessada — redirecionando para index")
    return render_template("index.html")
