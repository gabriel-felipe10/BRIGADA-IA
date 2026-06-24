"""
BRIGADA-IA — Rotas de Logs / Auditoria.
"""

from flask import Blueprint, request, jsonify, render_template
from app.services.log_service import get_logs, get_stats
from app.logging_config import logger

logs_bp = Blueprint("logs", __name__)


@logs_bp.route("/logs")
def logs_page():
    """Renderiza a página de visualização de logs."""
    return render_template("logs.html")


@logs_bp.route("/api/logs", methods=["GET"])
def api_logs():
    """
    GET /api/logs?page=1&per_page=20&status=success&type=csv
    Retorna logs paginados com filtros opcionais.
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    status = request.args.get("status", None)
    payload_type = request.args.get("type", None)

    per_page = min(max(per_page, 1), 100)
    page = max(page, 1)

    logger.debug("API logs | page={} per_page={} status={} type={}", page, per_page, status, payload_type)
    logs, total = get_logs(page, per_page, status, payload_type)

    return jsonify({
        "logs": logs,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page if per_page > 0 else 0,
        },
    })


@logs_bp.route("/api/logs/stats", methods=["GET"])
def api_stats():
    """
    GET /api/logs/stats
    Retorna estatísticas gerais (total, sucesso, erro, por tipo).
    """
    stats = get_stats()
    return jsonify(stats)
