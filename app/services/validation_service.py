"""
BRIGADA-IA — Serviço de Validação.
Orquestra chamadas ao agente de validação e registra no log.
"""

import sys
import os
import time
import uuid
from datetime import datetime, timezone

from app.logging_config import logger

# Adiciona o diretório do agente ao path para importar o validator
_agent_dir = os.path.join(os.path.dirname(__file__), "..", "..", "agents", "python_agent")
sys.path.insert(0, os.path.abspath(_agent_dir))

from validator import run_validation  # noqa: E402
from app.services.log_service import save_log  # noqa: E402


def validate_payload(payload: dict) -> dict:
    """
    Executa a validação de um payload e registra o resultado.

    Args:
        payload: Dicionário com 'type' e 'data'.

    Returns:
        Dicionário com resultado enriquecido (request_id, timestamp, duration).
    """
    request_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now(timezone.utc).isoformat()
    payload_type = payload.get("type", "unknown")

    logger.debug("Iniciando validação | request_id={} tipo={}", request_id, payload_type)

    start = time.perf_counter()
    try:
        result = run_validation(payload)
    except Exception as exc:
        logger.exception("Erro inesperado durante validação | request_id={}", request_id)
        result = {
            "status": "error",
            "details": [f"Erro interno: {exc}"],
            "input": payload,
        }
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    # Enriquece o resultado
    enriched = {
        "request_id": request_id,
        "timestamp": timestamp,
        "duration_ms": duration_ms,
        **result,
    }

    status = result.get("status", "error")
    if status == "success":
        logger.info(
            "✅ Validação OK | request_id={} tipo={} duração={}ms",
            request_id, payload_type, duration_ms,
        )
    else:
        logger.warning(
            "❌ Validação FALHOU | request_id={} tipo={} erros={} duração={}ms",
            request_id, payload_type, len(result.get("details", [])), duration_ms,
        )

    # Persiste no banco de logs
    try:
        save_log(
            request_id=request_id,
            timestamp=timestamp,
            payload_type=payload_type,
            status=status,
            payload=payload,
            result=result,
            details=result.get("details", []),
            duration_ms=duration_ms,
        )
        logger.debug("Log persistido | request_id={}", request_id)
    except Exception:
        logger.exception("Falha ao persistir log | request_id={}", request_id)

    return enriched
