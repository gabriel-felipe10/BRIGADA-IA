"""
BRIGADA-IA — Rota principal (SPA).
Serve o painel de validade com Super Admin, Gestão de Usuários e Dashboard.
"""

from flask import Blueprint, render_template, current_app
from app.logging_config import logger

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/sw.js")
def serve_sw():
    """Serve o service worker a partir da raiz para definir o escopo correto."""
    return current_app.send_static_file("js/sw.js")


@dashboard_bp.route("/manifest.json")
def serve_manifest():
    """Serve o manifest a partir da raiz."""
    return current_app.send_static_file("manifest.json")


@dashboard_bp.route("/favicon.ico")
def serve_favicon():
    """Serve o favicon oficial a partir da raiz."""
    return current_app.send_static_file("icon.svg")


@dashboard_bp.route("/")
def index():
    """Renderiza a SPA — Brigada de Validade."""
    logger.debug("BRIGADA-IA SPA acessada")
    return render_template("index.html")


@dashboard_bp.route("/admin")
@dashboard_bp.route("/users")
@dashboard_bp.route("/products")
@dashboard_bp.route("/pereciveis")
@dashboard_bp.route("/padaria")
@dashboard_bp.route("/hortifruti")
@dashboard_bp.route("/mercearia")
@dashboard_bp.route("/produtos-sem-nota")
@dashboard_bp.route("/dashboard")
def spa_routes():
    """Redireciona rotas SPA para o index (cliente gerencia o roteamento)."""
    logger.debug("Rota SPA acessada — redirecionando para index")
    return render_template("index.html")
