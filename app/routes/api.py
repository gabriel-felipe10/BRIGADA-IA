"""
BRIGADA-IA — Rotas da API de validação.
"""

from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from app.models.schemas import ValidationRequest
from app.services.validation_service import validate_payload
from app.logging_config import logger

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/validate", methods=["POST"])
def validate():
    """
    POST /api/validate
    Recebe um payload JSON e retorna o resultado da validação.

    Body:
        {"type": "csv|json|business_rule", "data": ...}

    Returns:
        JSON com request_id, status, details, timestamp, duration_ms
    """
    try:
        body = request.get_json(force=True)
    except Exception:
        logger.warning("Requisição recebida com JSON inválido")
        return jsonify({"error": "JSON inválido no corpo da requisição"}), 400

    # Valida o schema de entrada
    try:
        validated = ValidationRequest(**body)
    except ValidationError as e:
        logger.warning("Schema de entrada inválido: {}", e.error_count())
        return jsonify({
            "error": "Dados de entrada inválidos",
            "details": e.errors(),
        }), 422

    # Executa a validação
    logger.info("Validação solicitada | tipo={}", validated.type)
    result = validate_payload(validated.model_dump())
    status_code = 200 if result.get("status") == "success" else 422
    logger.info(
        "Validação concluída | request_id={} status={} duration={}ms",
        result.get("request_id", "?"),
        result.get("status", "?"),
        result.get("duration_ms", "?"),
    )
    return jsonify(result), status_code


@api_bp.route("/types", methods=["GET"])
def list_types():
    """
    GET /api/types
    Lista os tipos de validação suportados.
    """
    return jsonify({
        "types": [
            {
                "id": "csv",
                "name": "CSV",
                "description": "Valida dados tabulares (lista de listas)",
                "icon": "📊",
                "template": {
                    "type": "csv",
                    "data": [[1, 2, 3], [4, 5, 6]],
                },
            },
            {
                "id": "json",
                "name": "JSON",
                "description": "Valida objetos JSON com chaves string",
                "icon": "📋",
                "template": {
                    "type": "json",
                    "data": {"nome": "exemplo", "status": "ativo"},
                },
            },
            {
                "id": "business_rule",
                "name": "Regra de Negócio",
                "description": "Valida regras customizadas (id + value)",
                "icon": "⚙️",
                "template": {
                    "type": "business_rule",
                    "data": {"id": 1, "value": 99.9},
                },
            },
        ]
    })
